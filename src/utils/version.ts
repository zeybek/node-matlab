/**
 * MATLAB version detection and validation utilities
 * @packageDocumentation
 */

import { execSync } from 'node:child_process';
import { MatlabNotInstalledError } from '../errors.js';
import type { MatlabVersion, Toolbox } from '../types.js';

/** Minimum supported MATLAB version (R2019a = 9.6) */
const MIN_VERSION = 9.06;

/** Cache for MATLAB installation status */
let installationCache: { installed: boolean; path?: string; checkedAt?: number } | null = null;
const CACHE_TTL = 60000; // 1 minute

/**
 * Check if MATLAB is installed and available in PATH
 */
export function isInstalled(): boolean {
  const now = Date.now();

  // Use cached result if available and not expired
  if (installationCache?.checkedAt && now - installationCache.checkedAt < CACHE_TTL) {
    return installationCache.installed;
  }

  try {
    // Use platform-specific command to find MATLAB
    const cmd = process.platform === 'win32' ? 'where matlab' : 'which matlab';
    const result = execSync(cmd, {
      encoding: 'utf-8',
      stdio: ['pipe', 'pipe', 'pipe'],
      timeout: 5000,
    });

    installationCache = {
      installed: true,
      path: result.trim().split('\n')[0],
      checkedAt: now,
    };
    return true;
  } catch {
    installationCache = {
      installed: false,
      checkedAt: now,
    };
    return false;
  }
}

/**
 * Get the path to MATLAB executable
 */
export function getMatlabPath(): string | null {
  if (!isInstalled()) {
    return null;
  }
  return installationCache?.path ?? null;
}

/**
 * Parse version string from MATLAB output
 */
export function parseVersionString(output: string): MatlabVersion | null {
  // Try to match version pattern like "9.14.0.2254940 (R2023a)"
  const fullMatch = output.match(/(\d+\.\d+(?:\.\d+)?(?:\.\d+)?)\s*\(R(\d{4}[ab])\)/i);
  if (fullMatch?.[1] && fullMatch[2]) {
    return {
      version: fullMatch[1],
      release: `R${fullMatch[2]}`,
      full: fullMatch[0],
    };
  }

  // Try simpler version pattern
  const versionMatch = output.match(/Version:\s*(\d+\.\d+(?:\.\d+)?)/i);
  const releaseMatch = output.match(/R(\d{4}[ab])/i);

  if (versionMatch?.[1]) {
    return {
      version: versionMatch[1],
      release: releaseMatch?.[1] ? `R${releaseMatch[1]}` : 'Unknown',
      full: output.trim(),
    };
  }

  return null;
}

/**
 * Get MATLAB version information
 * @throws {MatlabNotInstalledError} If MATLAB is not installed
 */
export async function getVersion(): Promise<MatlabVersion> {
  if (!isInstalled()) {
    throw new MatlabNotInstalledError();
  }

  return new Promise((resolve, reject) => {
    try {
      const output = execSync('matlab -batch "disp(version)"', {
        encoding: 'utf-8',
        timeout: 30000,
        stdio: ['pipe', 'pipe', 'pipe'],
      });

      const parsed = parseVersionString(output);
      if (parsed) {
        resolve(parsed);
      } else {
        // Fallback: just return what we got
        resolve({
          version: output.trim().split('\n').pop()?.trim() ?? 'Unknown',
          release: 'Unknown',
          full: output.trim(),
        });
      }
    } catch (error) {
      reject(
        new Error(
          `Failed to get MATLAB version: ${error instanceof Error ? error.message : String(error)}`
        )
      );
    }
  });
}

/**
 * Get numeric version for comparison
 */
export function parseNumericVersion(version: string): number {
  const parts = version.split('.').slice(0, 2);
  if (parts.length < 2) return 0;

  const major = Number.parseInt(parts[0] ?? '0', 10);
  const minor = Number.parseInt(parts[1] ?? '0', 10);

  return major + minor / 100;
}

/**
 * Check if MATLAB version meets minimum requirements
 */
export function isVersionSupported(version: MatlabVersion): boolean {
  const numeric = parseNumericVersion(version.version);
  return numeric >= MIN_VERSION;
}

/**
 * Validate MATLAB installation and version
 * @throws {MatlabNotInstalledError} If MATLAB is not installed or version is too old
 */
export async function validateInstallation(): Promise<MatlabVersion> {
  const version = await getVersion();

  if (!isVersionSupported(version)) {
    throw new MatlabNotInstalledError(
      `MATLAB version ${version.version} (${version.release}) is not supported. Minimum required version is R2019a (9.6).`
    );
  }

  return version;
}

/**
 * Parse toolbox list from 'ver' command output
 */
export function parseToolboxList(output: string): Toolbox[] {
  const toolboxes: Toolbox[] = [];

  // Match lines like: "MATLAB                                                Version 9.14"
  // or "Signal Processing Toolbox                              Version 9.2"
  const lines = output.split('\n');

  for (const line of lines) {
    const match = line.match(/^(.+?)\s{2,}Version\s+(\d+(?:\.\d+)*)/);
    if (match?.[1] && match[2]) {
      toolboxes.push({
        name: match[1].trim(),
        version: match[2],
      });
    }
  }

  return toolboxes;
}

/**
 * Get list of installed MATLAB toolboxes
 * @throws {MatlabNotInstalledError} If MATLAB is not installed
 */
export async function getInstalledToolboxes(): Promise<Toolbox[]> {
  if (!isInstalled()) {
    throw new MatlabNotInstalledError();
  }

  return new Promise((resolve, reject) => {
    try {
      const output = execSync('matlab -batch "ver"', {
        encoding: 'utf-8',
        timeout: 60000,
        stdio: ['pipe', 'pipe', 'pipe'],
      });

      resolve(parseToolboxList(output));
    } catch (error) {
      reject(
        new Error(
          `Failed to get toolbox list: ${error instanceof Error ? error.message : String(error)}`
        )
      );
    }
  });
}

/**
 * Get MATLAB root directory
 * @throws {MatlabNotInstalledError} If MATLAB is not installed
 */
export async function getMatlabRoot(): Promise<string> {
  if (!isInstalled()) {
    throw new MatlabNotInstalledError();
  }

  return new Promise((resolve, reject) => {
    try {
      const output = execSync('matlab -batch "disp(matlabroot)"', {
        encoding: 'utf-8',
        timeout: 30000,
        stdio: ['pipe', 'pipe', 'pipe'],
      });

      const root = output.trim().split('\n').pop()?.trim();
      if (root) {
        resolve(root);
      } else {
        reject(new Error('Failed to parse MATLAB root path'));
      }
    } catch (error) {
      reject(
        new Error(
          `Failed to get MATLAB root: ${error instanceof Error ? error.message : String(error)}`
        )
      );
    }
  });
}

/**
 * Clear the installation cache
 */
export function clearCache(): void {
  installationCache = null;
}
