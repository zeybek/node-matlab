/**
 * node-matlab Type Definitions
 * @packageDocumentation
 */

// ============================================================================
// Core Types
// ============================================================================

/**
 * Options for running MATLAB commands
 */
export interface MatlabOptions {
  /** Timeout in milliseconds */
  timeout?: number;
  /** Working directory for MATLAB execution */
  cwd?: string;
  /** Additional paths to add to MATLAB path */
  addPath?: string[];
  /** Callback for streaming output lines */
  onProgress?: (line: string) => void;
  /** AbortSignal for cancellation */
  signal?: AbortSignal;
  /** Additional environment variables */
  env?: Record<string, string>;
}

/**
 * Result of a MATLAB execution
 */
export interface MatlabResult {
  /** Standard output from MATLAB */
  output: string;
  /** Exit code (0 = success) */
  exitCode: number;
  /** Execution duration in milliseconds */
  duration: number;
  /** Warnings collected during execution */
  warnings?: string[];
}

/**
 * MATLAB version information
 */
export interface MatlabVersion {
  /** Version number (e.g., "9.14") */
  version: string;
  /** Release name (e.g., "R2023a") */
  release: string;
  /** Full version string */
  full?: string;
}

/**
 * Information about an installed MATLAB toolbox
 */
export interface Toolbox {
  /** Toolbox name (e.g., "Signal Processing Toolbox") */
  name: string;
  /** Toolbox version */
  version: string;
  /** Product ID if available */
  productId?: string;
}

// ============================================================================
// Figure/Graphics Types
// ============================================================================

/**
 * Supported image formats for figure export
 */
export type ImageFormat = 'png' | 'svg' | 'pdf' | 'eps' | 'jpg' | 'fig';

/**
 * Options for saving MATLAB figures
 */
export interface FigureOptions {
  /** Output format */
  format: ImageFormat;
  /** Resolution in DPI (default: 300) */
  resolution?: number;
  /** Figure width in pixels */
  width?: number;
  /** Figure height in pixels */
  height?: number;
  /** Background color */
  backgroundColor?: 'white' | 'transparent' | 'none';
  /** Content type for vector formats */
  contentType?: 'auto' | 'vector' | 'image';
}

// ============================================================================
// Session Types
// ============================================================================

/**
 * Options for creating a MATLAB session
 */
export interface SessionOptions {
  /** Timeout for each command in milliseconds */
  timeout?: number;
  /** Working directory */
  cwd?: string;
  /** Paths to add to MATLAB path on session start */
  addPath?: string[];
  /** Keep session alive between commands */
  keepAlive?: boolean;
}

/**
 * State of a MATLAB session
 */
export type SessionState = 'starting' | 'ready' | 'busy' | 'closed' | 'error';

// ============================================================================
// Error Types
// ============================================================================

/**
 * Types of MATLAB errors
 */
export type MatlabErrorType =
  | 'syntax'
  | 'runtime'
  | 'timeout'
  | 'not_installed'
  | 'toolbox_missing'
  | 'file_not_found'
  | 'permission_denied'
  | 'out_of_memory'
  | 'index_error'
  | 'dimension_mismatch'
  | 'unknown';

/**
 * MATLAB error details
 */
export interface MatlabErrorDetails {
  /** Error type */
  type: MatlabErrorType;
  /** MATLAB stack trace if available */
  matlabStack?: string;
  /** Line number where error occurred */
  lineNumber?: number;
  /** Column number if available */
  columnNumber?: number;
  /** File where error occurred */
  file?: string;
  /** Suggestion for fixing the error */
  suggestion?: string;
  /** The command that caused the error */
  command?: string;
  /** Exit code from MATLAB process */
  exitCode?: number;
}

/**
 * Alias for SessionOptions for backward compatibility
 */
export type MatlabSessionOptions = SessionOptions;

// ============================================================================
// Data Types
// ============================================================================

/**
 * MATLAB data types that can be converted to JavaScript
 */
export type MatlabDataType =
  | 'double'
  | 'single'
  | 'int8'
  | 'int16'
  | 'int32'
  | 'int64'
  | 'uint8'
  | 'uint16'
  | 'uint32'
  | 'uint64'
  | 'logical'
  | 'char'
  | 'string'
  | 'cell'
  | 'struct'
  | 'table'
  | 'datetime'
  | 'duration'
  | 'categorical'
  | 'function_handle'
  | 'unknown';

/**
 * Metadata about a MATLAB variable
 */
export interface VariableInfo {
  /** Variable name */
  name: string;
  /** Size dimensions */
  size: number[];
  /** Data type */
  type: MatlabDataType;
  /** Size in bytes */
  bytes?: number;
  /** Whether variable is complex */
  complex?: boolean;
  /** Whether variable is sparse */
  sparse?: boolean;
}

// ============================================================================
// Export Types
// ============================================================================

/**
 * Options for CSV export
 */
export interface CSVExportOptions {
  /** Delimiter character (default: ',') */
  delimiter?: string;
  /** Write header row */
  writeHeader?: boolean;
  /** Encoding (default: 'UTF-8') */
  encoding?: string;
  /** Quote character */
  quoteChar?: string;
}

/**
 * Options for MAT file operations
 */
export interface MATFileOptions {
  /** MAT file version */
  version?: '-v7.3' | '-v7' | '-v6' | '-v4';
  /** Compress data */
  compress?: boolean;
}

// ============================================================================
// Live Script Types
// ============================================================================

/**
 * Supported formats for Live Script export
 */
export type LiveScriptFormat = 'html' | 'pdf' | 'latex' | 'docx' | 'm';

/**
 * Options for Live Script export
 */
export interface LiveScriptExportOptions {
  /** Output format */
  format: LiveScriptFormat;
  /** Run script before export */
  run?: boolean;
  /** Include code in output */
  includeCode?: boolean;
  /** Include output in export */
  includeOutput?: boolean;
  /** Figure format for HTML export */
  figureFormat?: 'png' | 'svg' | 'jpg';
}

// ============================================================================
// Function Call Types
// ============================================================================

/**
 * Options for calling MATLAB functions
 */
export interface FunctionCallOptions {
  /** Number of output arguments expected */
  nargout?: number;
  /** Timeout for this specific call */
  timeout?: number;
  /** Working directory */
  cwd?: string;
}

/**
 * Result of a MATLAB function call
 */
export interface FunctionCallResult<T = unknown[]> {
  /** Output values from the function */
  outputs: T;
  /** Execution duration in milliseconds */
  duration: number;
  /** Any warnings generated */
  warnings?: string[];
}

// ============================================================================
// Internal Types (not exported from main)
// ============================================================================

/**
 * Internal marker for JSON data extraction
 * @internal
 */
export const JSON_START_MARKER = '__NODE_MATLAB_JSON_START__';
export const JSON_END_MARKER = '__NODE_MATLAB_JSON_END__';

/**
 * Internal process state
 * @internal
 */
export interface ProcessState {
  pid?: number;
  running: boolean;
  startTime?: Date;
  lastActivity?: Date;
}
