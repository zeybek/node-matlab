/**
 * MATLAB process management utilities
 * @packageDocumentation
 */

import { type ChildProcess, type SpawnOptions, spawn } from 'node:child_process';
import { mkdtemp, unlink, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { MatlabAbortError, MatlabTimeoutError, parseError } from '../errors.js';
import type { MatlabOptions, MatlabResult, ProcessState } from '../types.js';

/**
 * Build MATLAB command arguments
 */
export function buildMatlabArgs(scriptPath: string, options?: MatlabOptions): string[] {
  const args: string[] = ['-nosplash', '-nodesktop', '-batch'];

  // Build the command string
  let command = '';

  // Add paths if specified
  if (options?.addPath && options.addPath.length > 0) {
    const pathCommands = options.addPath
      .map((p) => `addpath('${p.replace(/'/g, "''")}');`)
      .join(' ');
    command += `${pathCommands} `;
  }

  // Add the main script execution
  command += `run('${scriptPath.replace(/'/g, "''")}');`;

  args.push(command);

  return args;
}

/**
 * Build spawn options for MATLAB process
 */
export function buildSpawnOptions(options?: MatlabOptions): SpawnOptions {
  const spawnOpts: SpawnOptions = {
    stdio: ['pipe', 'pipe', 'pipe'],
    windowsHide: true,
  };

  if (options?.cwd) {
    spawnOpts.cwd = options.cwd;
  }

  if (options?.env) {
    spawnOpts.env = { ...process.env, ...options.env };
  }

  return spawnOpts;
}

/**
 * Create a temporary MATLAB script file
 */
export async function createTempScript(content: string): Promise<string> {
  const tempDir = await mkdtemp(join(tmpdir(), 'node-matlab-'));
  const scriptPath = join(tempDir, 'script.m');
  await writeFile(scriptPath, content, 'utf-8');
  return scriptPath;
}

/**
 * Clean up temporary script file and its directory
 */
export async function cleanupTempScript(scriptPath: string): Promise<void> {
  try {
    await unlink(scriptPath);
    // Try to remove the directory too
    const { rm } = await import('node:fs/promises');
    const { dirname } = await import('node:path');
    await rm(dirname(scriptPath), { recursive: true, force: true });
  } catch {
    // Ignore cleanup errors - temp files will be cleaned up by OS eventually
  }
}

/**
 * Execute MATLAB with the given script
 */
export async function executeMatlabScript(
  scriptPath: string,
  options?: MatlabOptions
): Promise<MatlabResult> {
  const startTime = Date.now();
  const args = buildMatlabArgs(scriptPath, options);
  const spawnOpts = buildSpawnOptions(options);

  return new Promise((resolve, reject) => {
    const state: ProcessState = {
      running: true,
      startTime: new Date(),
    };

    const matlabProcess: ChildProcess = spawn('matlab', args, spawnOpts);
    state.pid = matlabProcess.pid;

    let stdout = '';
    let stderr = '';
    let timeoutId: NodeJS.Timeout | undefined;
    let aborted = false;

    // Handle abort signal
    if (options?.signal) {
      if (options.signal.aborted) {
        matlabProcess.kill();
        reject(new MatlabAbortError());
        return;
      }

      options.signal.addEventListener('abort', () => {
        aborted = true;
        matlabProcess.kill();
      });
    }

    // Handle timeout
    if (options?.timeout && options.timeout > 0) {
      timeoutId = setTimeout(() => {
        matlabProcess.kill();
        reject(new MatlabTimeoutError(options.timeout!));
      }, options.timeout);
    }

    // Collect stdout
    matlabProcess.stdout?.on('data', (data: Buffer) => {
      const chunk = data.toString();
      stdout += chunk;
      state.lastActivity = new Date();

      // Call progress callback if provided
      if (options?.onProgress) {
        const lines = chunk.split('\n');
        for (const line of lines) {
          if (line.trim()) {
            options.onProgress(line);
          }
        }
      }
    });

    // Collect stderr
    matlabProcess.stderr?.on('data', (data: Buffer) => {
      stderr += data.toString();
      state.lastActivity = new Date();
    });

    // Handle process completion
    matlabProcess.on('close', (code) => {
      state.running = false;

      if (timeoutId) {
        clearTimeout(timeoutId);
      }

      const duration = Date.now() - startTime;

      if (aborted) {
        reject(new MatlabAbortError());
        return;
      }

      const exitCode = code ?? 0;
      const output = stdout.trim();
      const warnings = extractWarnings(stderr + stdout);

      // Check for errors
      if (exitCode !== 0 || stderr.toLowerCase().includes('error')) {
        const errorOutput = stderr || stdout;
        reject(parseError(errorOutput));
        return;
      }

      resolve({
        output: cleanOutput(output),
        exitCode,
        duration,
        warnings: warnings.length > 0 ? warnings : undefined,
      });
    });

    // Handle process errors
    matlabProcess.on('error', (error) => {
      state.running = false;

      if (timeoutId) {
        clearTimeout(timeoutId);
      }

      reject(new Error(`Failed to start MATLAB process: ${error.message}`));
    });
  });
}

/**
 * Execute MATLAB command directly (for simple expressions)
 */
export async function executeMatlabCommand(
  command: string,
  options?: MatlabOptions
): Promise<MatlabResult> {
  const startTime = Date.now();
  const spawnOpts = buildSpawnOptions(options);

  // Build command with paths
  let fullCommand = '';
  if (options?.addPath && options.addPath.length > 0) {
    const pathCommands = options.addPath
      .map((p) => `addpath('${p.replace(/'/g, "''")}');`)
      .join(' ');
    fullCommand += `${pathCommands} `;
  }
  fullCommand += command;

  const args: string[] = ['-nosplash', '-nodesktop', '-batch', fullCommand];

  return new Promise((resolve, reject) => {
    const matlabProcess: ChildProcess = spawn('matlab', args, spawnOpts);

    let stdout = '';
    let stderr = '';
    let timeoutId: NodeJS.Timeout | undefined;
    let aborted = false;

    // Handle abort signal
    if (options?.signal) {
      if (options.signal.aborted) {
        matlabProcess.kill();
        reject(new MatlabAbortError());
        return;
      }

      options.signal.addEventListener('abort', () => {
        aborted = true;
        matlabProcess.kill();
      });
    }

    // Handle timeout
    if (options?.timeout && options.timeout > 0) {
      timeoutId = setTimeout(() => {
        matlabProcess.kill();
        reject(new MatlabTimeoutError(options.timeout!));
      }, options.timeout);
    }

    matlabProcess.stdout?.on('data', (data: Buffer) => {
      const chunk = data.toString();
      stdout += chunk;

      if (options?.onProgress) {
        const lines = chunk.split('\n');
        for (const line of lines) {
          if (line.trim()) {
            options.onProgress(line);
          }
        }
      }
    });

    matlabProcess.stderr?.on('data', (data: Buffer) => {
      stderr += data.toString();
    });

    matlabProcess.on('close', (code) => {
      if (timeoutId) {
        clearTimeout(timeoutId);
      }

      const duration = Date.now() - startTime;

      if (aborted) {
        reject(new MatlabAbortError());
        return;
      }

      const exitCode = code ?? 0;
      const output = stdout.trim();
      const warnings = extractWarnings(stderr + stdout);

      if (exitCode !== 0 || stderr.toLowerCase().includes('error')) {
        const errorOutput = stderr || stdout;
        reject(parseError(errorOutput));
        return;
      }

      resolve({
        output: cleanOutput(output),
        exitCode,
        duration,
        warnings: warnings.length > 0 ? warnings : undefined,
      });
    });

    matlabProcess.on('error', (error) => {
      if (timeoutId) {
        clearTimeout(timeoutId);
      }

      reject(new Error(`Failed to start MATLAB process: ${error.message}`));
    });
  });
}

/**
 * Warning patterns that MATLAB commonly produces
 */
const WARNING_PATTERNS = [
  /warning:/i,
  /deprecated/i,
  /will be removed/i,
  /obsolete/i,
  /not recommended/i,
  /^>\s*in\s+/i, // Warning context line "In function at line..."
];

/**
 * Extract warnings from MATLAB output
 * Captures multiple warning formats and their context
 */
function extractWarnings(output: string): string[] {
  const warnings: string[] = [];
  const lines = output.split('\n');
  let inWarningBlock = false;
  let currentWarning = '';

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i] ?? '';
    const trimmedLine = line.trim();

    // Check if this line starts a warning
    const isWarningLine = WARNING_PATTERNS.some((pattern) => pattern.test(trimmedLine));

    if (isWarningLine) {
      // Save previous warning if exists
      if (currentWarning) {
        warnings.push(currentWarning.trim());
      }
      currentWarning = trimmedLine;
      inWarningBlock = true;
    } else if (inWarningBlock) {
      // Check if this is a continuation (context line like "In function at line X")
      if (trimmedLine.startsWith('>') || trimmedLine.startsWith('In ')) {
        currentWarning += `\n${trimmedLine}`;
      } else if (trimmedLine === '') {
        // Empty line ends the warning block
        if (currentWarning) {
          warnings.push(currentWarning.trim());
          currentWarning = '';
        }
        inWarningBlock = false;
      } else {
        // Non-empty, non-context line also ends the block
        if (currentWarning) {
          warnings.push(currentWarning.trim());
          currentWarning = '';
        }
        inWarningBlock = false;
      }
    }
  }

  // Don't forget the last warning
  if (currentWarning) {
    warnings.push(currentWarning.trim());
  }

  return warnings;
}

/**
 * Clean MATLAB output (remove "ans =" prefix, etc.)
 */
function cleanOutput(output: string): string {
  return output
    .replace(/^ans\s*=\s*\n?\n?/m, '')
    .replace(/^\s*\n/, '')
    .trim();
}
