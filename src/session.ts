/**
 * MATLAB Session - Persistent connection for multiple commands
 * @packageDocumentation
 */

import { type ChildProcess, spawn } from 'node:child_process';
import { EventEmitter } from 'node:events';
import { MatlabError, MatlabNotInstalledError, MatlabTimeoutError, parseError } from './errors.js';
import type { MatlabResult, SessionOptions, SessionState } from './types.js';
import { extractJSON, generateJSONExtractionCode, jsToMatlabValue } from './utils/parser.js';
import { isInstalled } from './utils/version.js';

/** Command completion marker */
const COMMAND_COMPLETE_MARKER = '__NODE_MATLAB_CMD_COMPLETE__';
const COMMAND_ERROR_MARKER = '__NODE_MATLAB_CMD_ERROR__';

/**
 * Persistent MATLAB session for efficient multiple command execution
 *
 * A session keeps MATLAB running in the background, allowing for faster
 * execution of multiple commands without the startup overhead.
 *
 * @example
 * ```typescript
 * import { MatlabSession } from 'node-matlab';
 *
 * const session = new MatlabSession();
 * await session.start();
 *
 * // Run multiple commands efficiently
 * await session.run('x = 1:100;');
 * await session.run('y = sin(x);');
 *
 * // Get variables
 * const y = await session.getVariable('y');
 *
 * await session.close();
 * ```
 */
export class MatlabSession extends EventEmitter {
  private process: ChildProcess | null = null;
  private state: SessionState = 'closed';
  private commandQueue: Array<{
    command: string;
    resolve: (result: MatlabResult) => void;
    reject: (error: Error) => void;
    timeout?: NodeJS.Timeout;
    startTime: number;
  }> = [];
  private currentOutput = '';
  private currentError = '';
  private options: SessionOptions;

  constructor(options?: SessionOptions) {
    super();
    this.options = {
      timeout: options?.timeout ?? 30000,
      cwd: options?.cwd,
      addPath: options?.addPath ?? [],
      keepAlive: options?.keepAlive ?? true,
    };
  }

  /**
   * Get current session state
   */
  get sessionState(): SessionState {
    return this.state;
  }

  /**
   * Check if session is ready for commands
   */
  get isReady(): boolean {
    return this.state === 'ready';
  }

  /**
   * Check if session is running (not closed)
   */
  get isRunning(): boolean {
    return this.state !== 'closed';
  }

  /**
   * Start the MATLAB session
   *
   * @throws {MatlabNotInstalledError} If MATLAB is not installed
   */
  async start(): Promise<void> {
    if (this.state !== 'closed') {
      throw new Error(`Cannot start session in state: ${this.state}`);
    }

    if (!isInstalled()) {
      throw new MatlabNotInstalledError();
    }

    this.state = 'starting';
    this.emit('stateChange', this.state);

    return new Promise((resolve, reject) => {
      // Start MATLAB in interactive mode
      this.process = spawn('matlab', ['-nosplash', '-nodesktop'], {
        stdio: ['pipe', 'pipe', 'pipe'],
        cwd: this.options.cwd,
        windowsHide: true,
      });

      let startupComplete = false;
      let startupOutput = '';

      const onStartupData = (data: Buffer) => {
        const chunk = data.toString();
        startupOutput += chunk;

        // Check if MATLAB is ready (look for >> prompt)
        if (chunk.includes('>>') && !startupComplete) {
          startupComplete = true;

          // Emit startup output for debugging purposes
          this.emit('startup', startupOutput);

          // Add paths if specified
          if (this.options.addPath && this.options.addPath.length > 0) {
            const pathCommands = this.options.addPath
              .map((p) => `addpath('${p.replace(/'/g, "''")}');`)
              .join(' ');
            this.process?.stdin?.write(`${pathCommands}\n`);
          }

          // Set up session
          this.setupEventHandlers();
          this.state = 'ready';
          this.emit('stateChange', this.state);
          this.emit('ready');
          resolve();
        }
      };

      this.process.stdout?.on('data', onStartupData);

      this.process.stderr?.on('data', (data: Buffer) => {
        const chunk = data.toString();
        if (!startupComplete) {
          startupOutput += chunk;
        }
      });

      this.process.on('error', (error) => {
        this.state = 'error';
        this.emit('stateChange', this.state);
        this.emit('error', error);
        reject(error);
      });

      this.process.on('close', (code) => {
        if (!startupComplete) {
          reject(new Error(`MATLAB process exited during startup with code ${code}`));
        }
        this.state = 'closed';
        this.emit('stateChange', this.state);
        this.emit('close', code);
      });

      // Startup timeout
      setTimeout(() => {
        if (!startupComplete) {
          this.process?.kill();
          reject(new Error('MATLAB startup timed out'));
        }
      }, 60000);
    });
  }

  /**
   * Set up event handlers for ongoing communication
   */
  private setupEventHandlers(): void {
    if (!this.process) return;

    // Replace startup handler with command handler
    this.process.stdout?.removeAllListeners('data');
    this.process.stdout?.on('data', (data: Buffer) => {
      this.handleOutput(data.toString());
    });

    this.process.stderr?.removeAllListeners('data');
    this.process.stderr?.on('data', (data: Buffer) => {
      this.currentError += data.toString();
    });
  }

  /**
   * Handle output from MATLAB
   */
  private handleOutput(chunk: string): void {
    this.currentOutput += chunk;

    // Check for command completion
    if (this.currentOutput.includes(COMMAND_COMPLETE_MARKER)) {
      this.processCommandComplete(false);
    } else if (this.currentOutput.includes(COMMAND_ERROR_MARKER)) {
      this.processCommandComplete(true);
    }
  }

  /**
   * Process command completion
   */
  private processCommandComplete(hasError: boolean): void {
    const pending = this.commandQueue.shift();
    if (!pending) return;

    // Calculate duration
    const duration = Date.now() - pending.startTime;

    if (pending.timeout) {
      clearTimeout(pending.timeout);
    }

    // Extract output (remove markers and prompt)
    const output = this.currentOutput
      .replace(COMMAND_COMPLETE_MARKER, '')
      .replace(COMMAND_ERROR_MARKER, '')
      .replace(/^>>\s*/gm, '')
      .trim();

    // Reset for next command
    const error = this.currentError;
    this.currentOutput = '';
    this.currentError = '';
    this.state = 'ready';
    this.emit('stateChange', this.state);

    if (hasError || error.toLowerCase().includes('error')) {
      pending.reject(parseError(error || output));
    } else {
      pending.resolve({
        output,
        exitCode: 0,
        duration,
      });
    }

    // Process next command in queue
    this.processQueue();
  }

  /**
   * Process queued commands
   */
  private processQueue(): void {
    if (this.state !== 'ready' || this.commandQueue.length === 0) return;

    const next = this.commandQueue[0];
    if (!next) return;

    this.state = 'busy';
    this.emit('stateChange', this.state);

    // Add completion marker to command
    const wrappedCommand = `${next.command}\ndisp('${COMMAND_COMPLETE_MARKER}');\n`;

    this.process?.stdin?.write(wrappedCommand);
  }

  /**
   * Run a MATLAB command in the session
   *
   * @param command - MATLAB command to execute
   * @returns Promise resolving to execution result
   *
   * @example
   * ```typescript
   * const result = await session.run('x = 1:10;');
   * ```
   */
  async run(command: string): Promise<MatlabResult> {
    if (this.state === 'closed' || this.state === 'error') {
      throw new Error(`Session is ${this.state}`);
    }

    return new Promise((resolve, reject) => {
      const startTime = Date.now();
      let timeout: NodeJS.Timeout | undefined;

      if (this.options.timeout && this.options.timeout > 0) {
        timeout = setTimeout(() => {
          const index = this.commandQueue.findIndex((c) => c.command === command);
          if (index !== -1) {
            this.commandQueue.splice(index, 1);
          }
          reject(new MatlabTimeoutError(this.options.timeout!));
        }, this.options.timeout);
      }

      this.commandQueue.push({
        command,
        resolve,
        reject,
        timeout,
        startTime,
      });

      // Start processing if ready
      if (this.state === 'ready') {
        this.processQueue();
      }
    });
  }

  /**
   * Evaluate a simple expression and return the result
   *
   * @param expression - MATLAB expression
   * @returns Promise resolving to result string
   */
  async eval(expression: string): Promise<string> {
    const result = await this.run(`disp(${expression})`);
    return result.output;
  }

  /**
   * Get a variable from the MATLAB workspace
   *
   * @param name - Variable name
   * @returns Promise resolving to variable value
   *
   * @example
   * ```typescript
   * await session.run('x = [1, 2, 3, 4, 5];');
   * const x = await session.getVariable('x');
   * // x = [1, 2, 3, 4, 5]
   * ```
   */
  async getVariable(name: string): Promise<unknown> {
    const extractionCode = generateJSONExtractionCode([name]);
    const result = await this.run(extractionCode);

    const extracted = extractJSON<Record<string, unknown>>(result.output);
    return extracted?.[name] ?? null;
  }

  /**
   * Set a variable in the MATLAB workspace
   *
   * @param name - Variable name
   * @param value - Value to set
   *
   * @example
   * ```typescript
   * await session.setVariable('x', [1, 2, 3, 4, 5]);
   * await session.setVariable('name', 'test');
   * ```
   */
  async setVariable(name: string, value: unknown): Promise<void> {
    const matlabValue = jsToMatlabValue(value);
    await this.run(`${name} = ${matlabValue};`);
  }

  /**
   * Add a path to MATLAB's search path
   *
   * @param dir - Directory to add
   */
  async addPath(dir: string): Promise<void> {
    await this.run(`addpath('${dir.replace(/'/g, "''")}');`);
  }

  /**
   * Change the working directory
   *
   * @param dir - New working directory
   */
  async cd(dir: string): Promise<void> {
    await this.run(`cd('${dir.replace(/'/g, "''")}');`);
  }

  /**
   * Clear all variables from workspace
   */
  async clearWorkspace(): Promise<void> {
    await this.run('clear all;');
  }

  /**
   * Close the MATLAB session
   */
  async close(): Promise<void> {
    if (this.state === 'closed') return;

    return new Promise((resolve) => {
      // Clear pending commands
      for (const pending of this.commandQueue) {
        if (pending.timeout) {
          clearTimeout(pending.timeout);
        }
        pending.reject(new MatlabError('Session closed'));
      }
      this.commandQueue = [];

      // Send quit command and close
      this.process?.stdin?.write('quit\n');

      const forceKill = setTimeout(() => {
        this.process?.kill('SIGKILL');
        this.state = 'closed';
        this.emit('stateChange', this.state);
        resolve();
      }, 5000);

      this.process?.once('close', () => {
        clearTimeout(forceKill);
        this.state = 'closed';
        this.emit('stateChange', this.state);
        this.process = null;
        resolve();
      });
    });
  }

  /**
   * Stop the MATLAB session (alias for close)
   */
  async stop(): Promise<void> {
    return this.close();
  }
}

/**
 * Create and start a new MATLAB session
 *
 * @param options - Session options
 * @returns Promise resolving to started session
 *
 * @example
 * ```typescript
 * const session = await createSession({ timeout: 60000 });
 * await session.run('x = 1:100;');
 * await session.close();
 * ```
 */
export async function createSession(options?: SessionOptions): Promise<MatlabSession> {
  const session = new MatlabSession(options);
  await session.start();
  return session;
}
