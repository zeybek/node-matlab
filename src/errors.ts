/**
 * node-matlab Error Classes
 * @packageDocumentation
 */

import type { MatlabErrorDetails, MatlabErrorType } from './types.js';

/**
 * Base error class for all MATLAB-related errors
 */
export class MatlabError extends Error {
  /** Error type classification */
  public readonly type: MatlabErrorType;
  /** MATLAB stack trace if available */
  public readonly matlabStack?: string;
  /** Line number where error occurred */
  public readonly lineNumber?: number;
  /** Column number if available */
  public readonly columnNumber?: number;
  /** File where error occurred */
  public readonly file?: string;
  /** Suggestion for fixing the error */
  public readonly suggestion?: string;
  /** The command that caused the error */
  public readonly command?: string;
  /** Exit code from MATLAB process */
  public readonly exitCode?: number;

  constructor(message: string, details?: Partial<MatlabErrorDetails>) {
    super(message);
    this.name = 'MatlabError';
    this.type = details?.type ?? 'unknown';
    this.matlabStack = details?.matlabStack;
    this.lineNumber = details?.lineNumber;
    this.columnNumber = details?.columnNumber;
    this.file = details?.file;
    this.suggestion = details?.suggestion;
    this.command = details?.command;
    this.exitCode = details?.exitCode;

    // Maintains proper stack trace for where our error was thrown (only available on V8)
    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, this.constructor);
    }
  }

  /**
   * Create a formatted error message with details
   */
  toDetailedString(): string {
    const parts: string[] = [this.message];

    if (this.file) {
      parts.push(`File: ${this.file}`);
    }
    if (this.lineNumber !== undefined) {
      parts.push(
        `Line: ${this.lineNumber}${this.columnNumber !== undefined ? `, Column: ${this.columnNumber}` : ''}`
      );
    }
    if (this.matlabStack) {
      parts.push(`\nMATLAB Stack Trace:\n${this.matlabStack}`);
    }
    if (this.suggestion) {
      parts.push(`\nSuggestion: ${this.suggestion}`);
    }

    return parts.join('\n');
  }
}

/**
 * Error thrown when MATLAB is not installed or not found in PATH
 */
export class MatlabNotInstalledError extends MatlabError {
  constructor(message = 'MATLAB is not installed or not found in PATH') {
    super(message, {
      type: 'not_installed',
      suggestion:
        'Install MATLAB 2019a or later and ensure the "matlab" command is available in your system PATH.',
    });
    this.name = 'MatlabNotInstalledError';
  }
}

/**
 * Error thrown when a MATLAB command times out
 */
export class MatlabTimeoutError extends MatlabError {
  /** Timeout duration in milliseconds */
  public readonly timeout: number;

  constructor(timeout: number, message?: string) {
    super(message ?? `MATLAB command timed out after ${timeout}ms`, {
      type: 'timeout',
      suggestion: 'Consider increasing the timeout value or optimizing your MATLAB code.',
    });
    this.name = 'MatlabTimeoutError';
    this.timeout = timeout;
  }
}

/**
 * Error thrown when MATLAB encounters a syntax error
 */
export class MatlabSyntaxError extends MatlabError {
  constructor(message: string, details?: Partial<MatlabErrorDetails>) {
    super(message, { ...details, type: 'syntax' });
    this.name = 'MatlabSyntaxError';
  }

  /**
   * Parse syntax error from MATLAB output
   */
  static fromOutput(output: string): MatlabSyntaxError {
    const lineMatch = output.match(/Error.*line\s+(\d+)/i);
    const columnMatch = output.match(/column\s+(\d+)/i);
    const fileMatch = output.match(/Error in\s+(\S+)/);

    return new MatlabSyntaxError(output, {
      lineNumber: lineMatch?.[1] ? Number.parseInt(lineMatch[1], 10) : undefined,
      columnNumber: columnMatch?.[1] ? Number.parseInt(columnMatch[1], 10) : undefined,
      file: fileMatch?.[1],
      matlabStack: output,
    });
  }
}

/**
 * Error thrown when a MATLAB runtime error occurs
 */
export class MatlabRuntimeError extends MatlabError {
  constructor(message: string, details?: Partial<MatlabErrorDetails>) {
    super(message, { ...details, type: 'runtime' });
    this.name = 'MatlabRuntimeError';
  }

  /**
   * Parse runtime error from MATLAB output
   */
  static fromOutput(output: string): MatlabRuntimeError {
    const lineMatch = output.match(/Error.*line\s+(\d+)/i);
    const fileMatch = output.match(/Error in\s+(\S+)/);
    const stackMatch = output.match(/Error using[\s\S]*$/);

    return new MatlabRuntimeError(output, {
      lineNumber: lineMatch?.[1] ? Number.parseInt(lineMatch[1], 10) : undefined,
      file: fileMatch?.[1],
      matlabStack: stackMatch?.[0],
    });
  }
}

/**
 * Error thrown when a required MATLAB toolbox is missing
 */
export class MatlabToolboxError extends MatlabError {
  /** Name of the missing toolbox */
  public readonly toolboxName: string;

  constructor(toolboxName: string, message?: string) {
    super(message ?? `Required MATLAB toolbox not installed: ${toolboxName}`, {
      type: 'toolbox_missing',
      suggestion: `Install the "${toolboxName}" from MATLAB Add-Ons or contact your administrator.`,
    });
    this.name = 'MatlabToolboxError';
    this.toolboxName = toolboxName;
  }
}

/**
 * Error thrown when a MATLAB file is not found
 */
export class MatlabFileNotFoundError extends MatlabError {
  /** Path to the file that was not found */
  public readonly filePath: string;

  constructor(filePath: string, message?: string) {
    super(message ?? `MATLAB file not found: ${filePath}`, {
      type: 'file_not_found',
      file: filePath,
      suggestion: 'Check that the file exists and the path is correct.',
    });
    this.name = 'MatlabFileNotFoundError';
    this.filePath = filePath;
  }
}

/**
 * Error thrown when execution is aborted
 */
export class MatlabAbortError extends MatlabError {
  constructor(message = 'MATLAB execution was aborted') {
    super(message, { type: 'unknown' });
    this.name = 'MatlabAbortError';
  }
}

/**
 * Error thrown when MATLAB runs out of memory
 */
export class MatlabMemoryError extends MatlabError {
  constructor(message?: string, details?: Partial<MatlabErrorDetails>) {
    super(message ?? 'MATLAB ran out of memory', {
      ...details,
      type: 'out_of_memory',
      suggestion:
        'Try reducing the size of your data, clearing unused variables with "clear", or increasing available memory.',
    });
    this.name = 'MatlabMemoryError';
  }
}

/**
 * Error thrown when array index is out of bounds
 */
export class MatlabIndexError extends MatlabError {
  constructor(message?: string, details?: Partial<MatlabErrorDetails>) {
    super(message ?? 'Array index out of bounds', {
      ...details,
      type: 'index_error',
      suggestion:
        'Check that your array indices are within valid bounds. MATLAB uses 1-based indexing.',
    });
    this.name = 'MatlabIndexError';
  }
}

/**
 * Error thrown when matrix dimensions do not agree
 */
export class MatlabDimensionError extends MatlabError {
  constructor(message?: string, details?: Partial<MatlabErrorDetails>) {
    super(message ?? 'Matrix dimensions must agree', {
      ...details,
      type: 'dimension_mismatch',
      suggestion:
        'Check that your matrices have compatible dimensions for the operation. Use size() to inspect dimensions.',
    });
    this.name = 'MatlabDimensionError';
  }
}

/**
 * Error thrown when permission is denied
 */
export class MatlabPermissionError extends MatlabError {
  constructor(path?: string, message?: string) {
    super(message ?? `Permission denied${path ? `: ${path}` : ''}`, {
      type: 'permission_denied',
      file: path,
      suggestion: 'Check file/folder permissions and ensure you have the necessary access rights.',
    });
    this.name = 'MatlabPermissionError';
  }
}

/**
 * Parse MATLAB error output and return appropriate error instance
 *
 * @param output - Raw MATLAB error output
 * @returns Appropriate MatlabError subclass instance
 */
export function parseError(output: string): MatlabError {
  const lowerOutput = output.toLowerCase();

  // Check for syntax errors
  if (lowerOutput.includes('syntax error') || lowerOutput.includes('parse error')) {
    return MatlabSyntaxError.fromOutput(output);
  }

  // Check for out of memory errors
  if (
    lowerOutput.includes('out of memory') ||
    lowerOutput.includes('java.lang.outofmemoryerror') ||
    lowerOutput.includes('not enough memory')
  ) {
    return new MatlabMemoryError(output, { matlabStack: output });
  }

  // Check for index errors
  if (
    lowerOutput.includes('index exceeds') ||
    lowerOutput.includes('index out of bounds') ||
    lowerOutput.includes('array indices must be positive integers') ||
    lowerOutput.includes('index must be a positive integer') ||
    lowerOutput.includes('subscript indices must')
  ) {
    return new MatlabIndexError(output, { matlabStack: output });
  }

  // Check for dimension mismatch errors
  if (
    lowerOutput.includes('matrix dimensions must agree') ||
    lowerOutput.includes('dimensions do not match') ||
    lowerOutput.includes('inner matrix dimensions must agree') ||
    lowerOutput.includes('dimensions must be consistent')
  ) {
    return new MatlabDimensionError(output, { matlabStack: output });
  }

  // Check for permission errors
  if (
    lowerOutput.includes('permission denied') ||
    lowerOutput.includes('access is denied') ||
    lowerOutput.includes('cannot write to') ||
    lowerOutput.includes('cannot read from')
  ) {
    const pathMatch = output.match(/'([^']+)'/);
    return new MatlabPermissionError(pathMatch?.[1], output);
  }

  // Check for undefined function/variable (often indicates missing toolbox)
  if (lowerOutput.includes('undefined function or variable')) {
    const funcMatch = output.match(/Undefined function or variable '(\w+)'/i);
    if (funcMatch) {
      return new MatlabRuntimeError(`Undefined function or variable: ${funcMatch[1]}`, {
        matlabStack: output,
        suggestion:
          'Check that the function name is correct and any required toolboxes are installed.',
      });
    }
  }

  // Check for license errors
  if (lowerOutput.includes('license') && lowerOutput.includes('error')) {
    return new MatlabToolboxError('Unknown', output);
  }

  // Check for file not found
  if (
    lowerOutput.includes('file not found') ||
    lowerOutput.includes('does not exist') ||
    lowerOutput.includes('unable to read file') ||
    lowerOutput.includes('no such file or directory')
  ) {
    const fileMatch = output.match(/'([^']+)'/);
    if (fileMatch?.[1]) {
      return new MatlabFileNotFoundError(fileMatch[1], output);
    }
  }

  // Check for path not found
  if (lowerOutput.includes('path not found') || lowerOutput.includes('directory not found')) {
    const pathMatch = output.match(/'([^']+)'/);
    if (pathMatch?.[1]) {
      return new MatlabFileNotFoundError(pathMatch[1], output);
    }
  }

  // Default to runtime error
  return MatlabRuntimeError.fromOutput(output);
}

/**
 * Check if an error is a MATLAB error
 */
export function isMatlabError(error: unknown): error is MatlabError {
  return error instanceof MatlabError;
}
