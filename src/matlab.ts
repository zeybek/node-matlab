/**
 * Main MATLAB class for Node.js integration
 * @packageDocumentation
 */

import { existsSync } from 'node:fs';
import { resolve } from 'node:path';
import { MatlabFileNotFoundError, MatlabNotInstalledError } from './errors.js';
import type {
  CSVExportOptions,
  FigureOptions,
  FunctionCallOptions,
  FunctionCallResult,
  LiveScriptExportOptions,
  MATFileOptions,
  MatlabOptions,
  MatlabResult,
  MatlabVersion,
  Toolbox,
} from './types.js';
import { JSON_END_MARKER, JSON_START_MARKER } from './types.js';
import { generateSetVariablesCode } from './utils/converter.js';
import {
  generateSaveAllFiguresCode,
  generateSaveFigureCode,
  validateOutputPath,
} from './utils/figure.js';
import {
  autoParse,
  extractJSON,
  generateJSONExtractionCode,
  jsToMatlabValue,
} from './utils/parser.js';
import {
  cleanupTempScript,
  createTempScript,
  executeMatlabCommand,
  executeMatlabScript,
} from './utils/process.js';
import {
  isInstalled as checkInstalled,
  getMatlabRoot as fetchMatlabRoot,
  getInstalledToolboxes as fetchToolboxes,
  getVersion as fetchVersion,
  validateInstallation,
} from './utils/version.js';

/**
 * Main class for running MATLAB commands from Node.js
 *
 * @example
 * ```typescript
 * import { Matlab } from 'node-matlab';
 *
 * // Simple expression
 * const result = await Matlab.run('3 + 4');
 * console.log(result.output); // "7"
 *
 * // Run a file
 * const fileResult = await Matlab.runFile('./script.m');
 *
 * // Get variables
 * const vars = await Matlab.getVariables('x = 1:10; y = sin(x);', ['x', 'y']);
 * console.log(vars.x, vars.y);
 * ```
 */
export class Matlab {
  // ============================================================================
  // Core Execution Methods
  // ============================================================================

  /**
   * Run a MATLAB script or command
   *
   * @param script - MATLAB code to execute (string or file path)
   * @param options - Execution options
   * @returns Promise resolving to execution result
   *
   * @example
   * ```typescript
   * // Simple command
   * const result = await Matlab.run('disp("Hello World")');
   *
   * // Multi-line script
   * const result = await Matlab.run(`
   *   x = 1:10;
   *   y = x.^2;
   *   disp(y);
   * `);
   *
   * // With options
   * const result = await Matlab.run('longComputation()', {
   *   timeout: 60000,
   *   onProgress: (line) => console.log(line)
   * });
   * ```
   */
  static async run(script: string, options?: MatlabOptions): Promise<MatlabResult> {
    // Check if MATLAB is installed
    if (!checkInstalled()) {
      throw new MatlabNotInstalledError();
    }

    // Check if script is a file path (only .m files to avoid false positives)
    // This prevents issues where a variable name like "test.m" might exist as a file
    if (script.endsWith('.m') && existsSync(script)) {
      return Matlab.runFile(script, options);
    }

    // Create temp script and execute
    const tempPath = await createTempScript(script);

    try {
      return await executeMatlabScript(tempPath, options);
    } finally {
      await cleanupTempScript(tempPath);
    }
  }

  /**
   * Run a MATLAB script file
   *
   * @param filePath - Path to .m file
   * @param options - Execution options
   * @returns Promise resolving to execution result
   *
   * @example
   * ```typescript
   * const result = await Matlab.runFile('./analysis.m');
   * ```
   */
  static async runFile(filePath: string, options?: MatlabOptions): Promise<MatlabResult> {
    if (!checkInstalled()) {
      throw new MatlabNotInstalledError();
    }

    const absolutePath = resolve(filePath);

    if (!existsSync(absolutePath)) {
      throw new MatlabFileNotFoundError(filePath);
    }

    return executeMatlabScript(absolutePath, options);
  }

  /**
   * Evaluate a simple MATLAB expression and return the result
   *
   * @param expression - MATLAB expression to evaluate
   * @param options - Execution options
   * @returns Promise resolving to the expression result as string
   *
   * @example
   * ```typescript
   * const result = await Matlab.eval('2 + 2');
   * console.log(result); // "4"
   *
   * const sin = await Matlab.eval('sin(pi/2)');
   * console.log(sin); // "1"
   * ```
   */
  static async eval(expression: string, options?: MatlabOptions): Promise<string> {
    const result = await executeMatlabCommand(`disp(${expression})`, options);
    return result.output;
  }

  // ============================================================================
  // System Information Methods
  // ============================================================================

  /**
   * Check if MATLAB is installed on the system
   *
   * @returns true if MATLAB is installed and accessible
   *
   * @example
   * ```typescript
   * if (Matlab.isInstalled()) {
   *   console.log('MATLAB is available');
   * }
   * ```
   */
  static isInstalled(): boolean {
    return checkInstalled();
  }

  /**
   * Get MATLAB version information
   *
   * @returns Promise resolving to version information
   * @throws {MatlabNotInstalledError} If MATLAB is not installed
   *
   * @example
   * ```typescript
   * const version = await Matlab.getVersion();
   * console.log(`MATLAB ${version.release} (${version.version})`);
   * ```
   */
  static async getVersion(): Promise<MatlabVersion> {
    return fetchVersion();
  }

  /**
   * Get list of installed MATLAB toolboxes
   *
   * @returns Promise resolving to array of installed toolboxes
   * @throws {MatlabNotInstalledError} If MATLAB is not installed
   *
   * @example
   * ```typescript
   * const toolboxes = await Matlab.getInstalledToolboxes();
   * toolboxes.forEach(tb => {
   *   console.log(`${tb.name} v${tb.version}`);
   * });
   * ```
   */
  static async getInstalledToolboxes(): Promise<Toolbox[]> {
    return fetchToolboxes();
  }

  /**
   * Get MATLAB installation root directory
   *
   * @returns Promise resolving to MATLAB root path
   * @throws {MatlabNotInstalledError} If MATLAB is not installed
   *
   * @example
   * ```typescript
   * const root = await Matlab.getMatlabRoot();
   * console.log(`MATLAB installed at: ${root}`);
   * ```
   */
  static async getMatlabRoot(): Promise<string> {
    return fetchMatlabRoot();
  }

  /**
   * Validate MATLAB installation meets minimum requirements
   *
   * @returns Promise resolving to version info if valid
   * @throws {MatlabNotInstalledError} If MATLAB is not installed or version is too old
   */
  static async validateInstallation(): Promise<MatlabVersion> {
    return validateInstallation();
  }

  // ============================================================================
  // Variable Exchange Methods
  // ============================================================================

  /**
   * Run a script and extract specified variables as JSON
   *
   * @param script - MATLAB code to execute
   * @param variables - Array of variable names to extract
   * @param options - Execution options
   * @returns Promise resolving to object with variable values
   *
   * @example
   * ```typescript
   * const vars = await Matlab.getVariables(`
   *   x = 1:5;
   *   y = x.^2;
   *   name = 'test';
   * `, ['x', 'y', 'name']);
   *
   * console.log(vars.x);    // [1, 2, 3, 4, 5]
   * console.log(vars.y);    // [1, 4, 9, 16, 25]
   * console.log(vars.name); // "test"
   * ```
   */
  static async getVariables(
    script: string,
    variables: string[],
    options?: MatlabOptions
  ): Promise<Record<string, unknown>> {
    if (variables.length === 0) {
      return {};
    }

    // Append JSON extraction code
    const extractionCode = generateJSONExtractionCode(variables);
    const fullScript = `${script}\n${extractionCode}`;

    const result = await Matlab.run(fullScript, options);

    // Extract JSON from output
    const extracted = extractJSON<Record<string, unknown>>(result.output);

    if (extracted === null) {
      // Try to auto-parse the output if JSON extraction failed
      return { output: autoParse(result.output) };
    }

    return extracted;
  }

  /**
   * Generate MATLAB code to set variables from JavaScript values
   *
   * @param variables - Object mapping variable names to values
   * @returns MATLAB code string that sets the variables
   *
   * @example
   * ```typescript
   * const code = Matlab.setVariables({
   *   x: [1, 2, 3, 4, 5],
   *   name: 'test',
   *   matrix: [[1, 2], [3, 4]]
   * });
   * // Returns: "x = [1, 2, 3, 4, 5];\nname = 'test';\nmatrix = [1, 2; 3, 4];"
   * ```
   */
  static setVariables(variables: Record<string, unknown>): string {
    return generateSetVariablesCode(variables);
  }

  // ============================================================================
  // Data Export Methods
  // ============================================================================

  /**
   * Run a script and export result to JSON file
   *
   * @param script - MATLAB code to execute
   * @param outputPath - Path for output JSON file
   * @param variables - Variables to include in JSON
   * @param options - Execution options
   * @returns Promise resolving to output file path
   *
   * @example
   * ```typescript
   * const path = await Matlab.exportToJSON(
   *   'x = rand(10,1); y = x.^2;',
   *   './data.json',
   *   ['x', 'y']
   * );
   * ```
   */
  static async exportToJSON(
    script: string,
    outputPath: string,
    variables: string[],
    options?: MatlabOptions
  ): Promise<string> {
    const absolutePath = resolve(outputPath);
    const structFields = variables.map((v) => `'${v}', ${v}`).join(', ');

    const exportScript = `
${script}
__nm_data__ = struct(${structFields});
__nm_json__ = jsonencode(__nm_data__, 'PrettyPrint', true);
fid = fopen('${absolutePath.replace(/\\/g, '/')}', 'w');
fprintf(fid, '%s', __nm_json__);
fclose(fid);
clear __nm_data__ __nm_json__ fid;
    `.trim();

    await Matlab.run(exportScript, options);
    return absolutePath;
  }

  /**
   * Run a script and export a variable to CSV file
   *
   * @param script - MATLAB code to execute
   * @param variable - Name of variable to export
   * @param outputPath - Path for output CSV file
   * @param csvOptions - CSV export options
   * @param options - Execution options
   * @returns Promise resolving to output file path
   *
   * @example
   * ```typescript
   * const path = await Matlab.exportToCSV(
   *   'data = rand(100, 5);',
   *   'data',
   *   './output.csv'
   * );
   * ```
   */
  static async exportToCSV(
    script: string,
    variable: string,
    outputPath: string,
    csvOptions?: CSVExportOptions,
    options?: MatlabOptions
  ): Promise<string> {
    const absolutePath = resolve(outputPath);
    const delimiter = csvOptions?.delimiter ?? ',';

    const exportScript = `
${script}
writematrix(${variable}, '${absolutePath.replace(/\\/g, '/')}', 'Delimiter', '${delimiter}');
    `.trim();

    await Matlab.run(exportScript, options);
    return absolutePath;
  }

  /**
   * Run a script and export workspace to MAT file
   *
   * @param script - MATLAB code to execute
   * @param outputPath - Path for output MAT file
   * @param variables - Variables to save (empty = all)
   * @param matOptions - MAT file options
   * @param options - Execution options
   * @returns Promise resolving to output file path
   *
   * @example
   * ```typescript
   * const path = await Matlab.exportToMAT(
   *   'x = 1:100; y = sin(x);',
   *   './data.mat',
   *   ['x', 'y']
   * );
   * ```
   */
  static async exportToMAT(
    script: string,
    outputPath: string,
    variables?: string[],
    matOptions?: MATFileOptions,
    options?: MatlabOptions
  ): Promise<string> {
    const absolutePath = resolve(outputPath);
    const version = matOptions?.version ?? '-v7.3';

    let saveCommand: string;
    if (variables && variables.length > 0) {
      const varList = variables.map((v) => `'${v}'`).join(', ');
      saveCommand = `save('${absolutePath.replace(/\\/g, '/')}', ${varList}, '${version}');`;
    } else {
      saveCommand = `save('${absolutePath.replace(/\\/g, '/')}', '${version}');`;
    }

    const exportScript = `${script}\n${saveCommand}`;

    await Matlab.run(exportScript, options);
    return absolutePath;
  }

  // ============================================================================
  // Figure/Graphics Methods
  // ============================================================================

  /**
   * Run a script and save the resulting figure
   *
   * @param script - MATLAB code that creates a figure
   * @param outputPath - Path for output image file
   * @param figureOptions - Figure export options
   * @param options - Execution options
   * @returns Promise resolving to output file path
   *
   * @example
   * ```typescript
   * const path = await Matlab.saveFigure(
   *   'x = 0:0.1:2*pi; plot(x, sin(x));',
   *   './sine_wave.png',
   *   { format: 'png', resolution: 300 }
   * );
   * ```
   */
  static async saveFigure(
    script: string,
    outputPath: string,
    figureOptions?: Partial<FigureOptions>,
    options?: MatlabOptions
  ): Promise<string> {
    const absolutePath = resolve(outputPath);
    const validatedPath = validateOutputPath(absolutePath, figureOptions?.format ?? 'png');
    const saveCode = generateSaveFigureCode(validatedPath, figureOptions);

    const fullScript = `${script}\n${saveCode}`;
    await Matlab.run(fullScript, options);

    return validatedPath;
  }

  /**
   * Run a script and save all resulting figures
   *
   * @param script - MATLAB code that creates figures
   * @param outputDir - Directory for output files
   * @param prefix - Filename prefix (default: 'figure')
   * @param figureOptions - Figure export options
   * @param options - Execution options
   * @returns Promise resolving to array of output file paths
   *
   * @example
   * ```typescript
   * const paths = await Matlab.saveAllFigures(
   *   `
   *     figure; plot(rand(10,1));
   *     figure; bar(rand(5,1));
   *   `,
   *   './figures',
   *   'chart',
   *   { format: 'svg' }
   * );
   * ```
   */
  static async saveAllFigures(
    script: string,
    outputDir: string,
    prefix = 'figure',
    figureOptions?: Partial<FigureOptions>,
    options?: MatlabOptions
  ): Promise<string[]> {
    const absoluteDir = resolve(outputDir);
    const saveCode = generateSaveAllFiguresCode(absoluteDir, prefix, figureOptions);

    // First get figure count, then save
    const countScript = `
${script}
__nm_count__ = length(findall(0, 'Type', 'figure'));
fprintf('${JSON_START_MARKER}%d${JSON_END_MARKER}', __nm_count__);
${saveCode}
    `.trim();

    const result = await Matlab.run(countScript, options);
    const count = extractJSON<number>(result.output) ?? 0;

    // Generate list of saved file paths
    const ext = figureOptions?.format ?? 'png';
    const paths: string[] = [];
    for (let i = 1; i <= count; i++) {
      paths.push(`${absoluteDir}/${prefix}_${i}.${ext}`);
    }

    return paths;
  }

  // ============================================================================
  // Function Call Methods
  // ============================================================================

  /**
   * Call a MATLAB function with arguments
   *
   * @param funcName - Name of the MATLAB function
   * @param args - Arguments to pass to the function
   * @param callOptions - Function call options
   * @param options - Execution options
   * @returns Promise resolving to function outputs
   *
   * @example
   * ```typescript
   * // Single output
   * const result = await Matlab.callFunction('sqrt', [16]);
   * console.log(result.outputs); // [4]
   *
   * // Multiple outputs
   * const result = await Matlab.callFunction('eig', [[[1,2],[3,4]]], { nargout: 2 });
   * console.log(result.outputs); // [eigenvectors, eigenvalues]
   *
   * // With multiple arguments
   * const result = await Matlab.callFunction('linspace', [0, 10, 5]);
   * console.log(result.outputs); // [[0, 2.5, 5, 7.5, 10]]
   * ```
   */
  static async callFunction<T = unknown[]>(
    funcName: string,
    args: unknown[] = [],
    callOptions?: FunctionCallOptions,
    options?: MatlabOptions
  ): Promise<FunctionCallResult<T>> {
    const nargout = callOptions?.nargout ?? 1;

    // Convert arguments to MATLAB
    const matlabArgs = args.map((arg) => jsToMatlabValue(arg)).join(', ');

    // Build output variable names
    const outputVars = Array.from({ length: nargout }, (_, i) => `__nm_out${i + 1}__`);
    const outputAssignment = nargout > 1 ? `[${outputVars.join(', ')}]` : outputVars[0];

    // Build the script
    const script = `
${outputAssignment} = ${funcName}(${matlabArgs});
__nm_result__ = {${outputVars.join(', ')}};
fprintf('${JSON_START_MARKER}%s${JSON_END_MARKER}', jsonencode(__nm_result__));
    `.trim();

    const startTime = Date.now();
    const result = await Matlab.run(script, {
      ...options,
      timeout: callOptions?.timeout ?? options?.timeout,
    });
    const duration = Date.now() - startTime;

    const outputs = extractJSON<T>(result.output);

    if (outputs === null) {
      // If JSON extraction failed, return empty array as default
      // This maintains type compatibility while signaling no valid output
      return {
        outputs: [] as T,
        duration,
        warnings: result.warnings,
      };
    }

    return {
      outputs,
      duration,
      warnings: result.warnings,
    };
  }

  // ============================================================================
  // Live Script Methods
  // ============================================================================

  /**
   * Export a MATLAB Live Script (.mlx) to another format
   *
   * @param mlxPath - Path to .mlx file
   * @param outputPath - Path for output file
   * @param exportOptions - Export options
   * @param options - Execution options
   * @returns Promise resolving to output file path
   *
   * @example
   * ```typescript
   * // Export to HTML
   * const htmlPath = await Matlab.exportLiveScript(
   *   './analysis.mlx',
   *   './analysis.html',
   *   { format: 'html', run: true }
   * );
   *
   * // Export to PDF
   * const pdfPath = await Matlab.exportLiveScript(
   *   './report.mlx',
   *   './report.pdf',
   *   { format: 'pdf' }
   * );
   * ```
   */
  static async exportLiveScript(
    mlxPath: string,
    outputPath: string,
    exportOptions?: Partial<LiveScriptExportOptions>,
    options?: MatlabOptions
  ): Promise<string> {
    const absoluteMlx = resolve(mlxPath);
    const absoluteOutput = resolve(outputPath);

    if (!existsSync(absoluteMlx)) {
      throw new MatlabFileNotFoundError(mlxPath);
    }

    const format = exportOptions?.format ?? 'html';
    const run = exportOptions?.run ?? false;

    const script = `
export('${absoluteMlx.replace(/\\/g, '/')}', '${absoluteOutput.replace(/\\/g, '/')}', ...
    'Format', '${format}', 'Run', ${run});
    `.trim();

    await Matlab.run(script, options);
    return absoluteOutput;
  }
}
