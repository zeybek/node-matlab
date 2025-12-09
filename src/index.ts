/**
 * node-matlab - Run MATLAB commands from Node.js
 *
 * @packageDocumentation
 * @module node-matlab
 *
 * @example
 * ```typescript
 * import { Matlab } from 'node-matlab';
 *
 * // Simple command
 * const result = await Matlab.run('3 + 4');
 * console.log(result.output); // "7"
 *
 * // Get variables from script
 * const vars = await Matlab.getVariables('x = 1:10; y = sin(x);', ['x', 'y']);
 *
 * // Save figures
 * await Matlab.saveFigure('plot(1:10)', './plot.png');
 * ```
 */

// Main class
export { Matlab } from './matlab.js';

// Session for persistent connections
export { MatlabSession, createSession } from './session.js';

// Error classes
export {
  MatlabError,
  MatlabNotInstalledError,
  MatlabTimeoutError,
  MatlabSyntaxError,
  MatlabRuntimeError,
  MatlabToolboxError,
  MatlabFileNotFoundError,
  MatlabAbortError,
  MatlabMemoryError,
  MatlabIndexError,
  MatlabDimensionError,
  MatlabPermissionError,
  parseError,
  isMatlabError,
} from './errors.js';

// Types
export type {
  // Core types
  MatlabOptions,
  MatlabResult,
  MatlabVersion,
  Toolbox,
  MatlabErrorType,
  MatlabErrorDetails,
  // Figure types
  ImageFormat,
  FigureOptions,
  // Session types
  SessionOptions,
  MatlabSessionOptions,
  SessionState,
  // Data types
  MatlabDataType,
  VariableInfo,
  // Export types
  CSVExportOptions,
  MATFileOptions,
  LiveScriptFormat,
  LiveScriptExportOptions,
  // Function call types
  FunctionCallOptions,
  FunctionCallResult,
} from './types.js';

// Utility functions (advanced usage)
export {
  // Version utilities
  isInstalled,
  getMatlabPath,
  getVersion,
  getInstalledToolboxes,
  getMatlabRoot,
  parseVersionString,
  parseNumericVersion,
  parseToolboxList,
  isVersionSupported,
  validateInstallation,
  clearCache,
} from './utils/version.js';

export {
  // Parser utilities
  extractJSON,
  removeJSONMarkers,
  parseArrayString,
  parseMatrixOutput,
  parseScalar,
  parseString,
  parseLogical,
  autoParse,
  detectOutputType,
  generateJSONExtractionCode,
  jsToMatlabValue,
} from './utils/parser.js';

export {
  // Converter utilities
  toMatlabCode,
  convertToMatlab,
  generateSetVariablesCode,
  inferMatlabType,
  createVariableInfo,
  parseComplexNumber,
  isValidMatlabName,
  isMatlabKeyword,
  MATLAB_KEYWORDS,
} from './utils/converter.js';

export {
  // Figure utilities
  generateSaveFigureCode,
  generateSaveAllFiguresCode,
  getExtension,
  getPrintDevice,
  isVectorFormat,
  getFigureSizePreset,
  validateOutputPath,
  DEFAULT_FIGURE_OPTIONS,
} from './utils/figure.js';

// Default export for convenience
import { Matlab } from './matlab.js';
export default Matlab;
