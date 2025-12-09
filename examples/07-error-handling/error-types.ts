/**
 * MATLAB Error Types
 *
 * This example demonstrates all available error types
 * and how to handle them appropriately.
 *
 * Run: npx tsx 07-error-handling/error-types.ts
 */

import {
  Matlab,
  MatlabDimensionError,
  MatlabError,
  MatlabFileNotFoundError,
  MatlabIndexError,
  MatlabMemoryError,
  MatlabNotInstalledError,
  MatlabPermissionError,
  MatlabRuntimeError,
  MatlabSyntaxError,
  MatlabTimeoutError,
  MatlabToolboxError,
  isMatlabError,
  parseError,
} from 'node-matlab';

async function main() {
  console.log('📋 MATLAB Error Types Reference\n');

  // Error type catalog
  console.log('1️⃣ Error Type Catalog');
  console.log('─'.repeat(60));

  const errorTypes = [
    {
      class: MatlabError,
      type: 'unknown',
      description: 'Base class for all MATLAB errors',
      example: 'Generic MATLAB error',
    },
    {
      class: MatlabNotInstalledError,
      type: 'not_installed',
      description: 'MATLAB is not installed or not in PATH',
      example: 'MATLAB executable not found',
    },
    {
      class: MatlabSyntaxError,
      type: 'syntax',
      description: 'MATLAB code syntax error',
      example: 'Missing semicolon, unmatched brackets',
    },
    {
      class: MatlabRuntimeError,
      type: 'runtime',
      description: 'Error during MATLAB execution',
      example: 'Division by zero, undefined variable',
    },
    {
      class: MatlabTimeoutError,
      type: 'timeout',
      description: 'Operation exceeded time limit',
      example: 'Long computation with short timeout',
    },
    {
      class: MatlabToolboxError,
      type: 'toolbox_missing',
      description: 'Required toolbox not installed',
      example: 'Signal Processing Toolbox not found',
    },
    {
      class: MatlabFileNotFoundError,
      type: 'file_not_found',
      description: 'Script or function file not found',
      example: 'my_script.m does not exist',
    },
    {
      class: MatlabMemoryError,
      type: 'memory_error',
      description: 'Out of memory error',
      example: 'Cannot allocate large array',
    },
    {
      class: MatlabIndexError,
      type: 'index_error',
      description: 'Array index out of bounds',
      example: 'x(100) when length(x) = 10',
    },
    {
      class: MatlabDimensionError,
      type: 'dimension_error',
      description: 'Matrix dimension mismatch',
      example: 'Multiplying incompatible matrices',
    },
    {
      class: MatlabPermissionError,
      type: 'permission_denied',
      description: 'File/directory permission denied',
      example: 'Cannot write to protected directory',
    },
  ];

  console.log('| Error Class              | Type             | Description                    |');
  console.log('|--------------------------|------------------|--------------------------------|');
  for (const { class: ErrorClass, type, description } of errorTypes) {
    console.log(
      `| ${ErrorClass.name.padEnd(24)} | ${type.padEnd(16)} | ${description.slice(0, 30).padEnd(30)} |`
    );
  }
  console.log();

  // Example 2: parseError function
  console.log('2️⃣ parseError Function Demonstration');
  console.log('─'.repeat(60));

  const testOutputs = [
    "Error: Undefined function or variable 'xyz'",
    'Error using *.mat: Unable to read MAT-file',
    'Error: Index exceeds the number of array elements',
    'Error: Out of memory',
    'Error: Matrix dimensions must agree',
    "Error: File 'test.m' not found",
    'License checkout failed for Statistics_Toolbox',
    'Random unrecognized error message',
  ];

  console.log('Testing parseError with various MATLAB outputs:\n');
  for (const output of testOutputs) {
    const error = parseError(output);
    console.log(`Input: "${output.slice(0, 50)}..."`);
    console.log(`  → ${error.constructor.name} (type: ${error.type})\n`);
  }

  // Example 3: Creating errors programmatically
  console.log('3️⃣ Creating Errors Programmatically');
  console.log('─'.repeat(60));

  // MatlabError with details
  const genericError = new MatlabError('Something went wrong', {
    type: 'unknown',
    exitCode: 1,
    command: 'some_command',
  });
  console.log(`MatlabError: ${genericError.message}`);
  console.log(`  type: ${genericError.type}, exitCode: ${genericError.exitCode}`);

  // Specific error types
  const syntaxError = new MatlabSyntaxError('Unexpected MATLAB expression', {
    command: 'x = [1 2 3',
  });
  console.log(`MatlabSyntaxError: ${syntaxError.message}`);

  const timeoutError = new MatlabTimeoutError(5000);
  console.log(`MatlabTimeoutError: ${timeoutError.message}`);

  const fileError = new MatlabFileNotFoundError('/path/to/missing.m');
  console.log(`MatlabFileNotFoundError: ${fileError.message}`);
  console.log(`  filePath: ${fileError.filePath}`);
  console.log();

  // Example 4: Type guard usage
  console.log('4️⃣ Type Guard (isMatlabError)');
  console.log('─'.repeat(60));

  function demonstrateTypeGuard(error: unknown): void {
    if (isMatlabError(error)) {
      console.log(`  isMatlabError: true`);
      console.log(`  Type-safe access to: error.type = "${error.type}"`);
      console.log(`  Type-safe access to: error.command = "${error.command || 'N/A'}"`);
    } else {
      console.log(`  isMatlabError: false`);
      console.log(`  This is a regular Error or unknown object`);
    }
  }

  console.log('Testing with MatlabError:');
  demonstrateTypeGuard(new MatlabRuntimeError('test'));

  console.log('\nTesting with regular Error:');
  demonstrateTypeGuard(new Error('regular error'));

  console.log('\nTesting with string:');
  demonstrateTypeGuard('just a string');
  console.log();

  // Example 5: Real error scenarios
  console.log('5️⃣ Real Error Scenarios');
  console.log('─'.repeat(60));

  // Check MATLAB installation first
  if (!Matlab.isInstalled()) {
    console.log('⚠️ MATLAB is not installed - skipping live tests\n');
    console.log('Would test:');
    console.log('  - Undefined variable → MatlabRuntimeError');
    console.log('  - Index out of bounds → MatlabIndexError');
    console.log('  - Dimension mismatch → MatlabDimensionError');
    console.log('  - Syntax error → MatlabSyntaxError');
  } else {
    const scenarios = [
      { name: 'Undefined variable', code: 'undefined_xyz_var' },
      { name: 'Index out of bounds', code: 'x=[1 2 3]; x(10)' },
      { name: 'Dimension mismatch', code: '[1 2] * [3 4]' },
      { name: 'Syntax error', code: 'for i = 1:5' },
    ];

    for (const { name, code } of scenarios) {
      try {
        await Matlab.run(code);
        console.log(`${name}: No error (unexpected)`);
      } catch (error) {
        if (isMatlabError(error)) {
          console.log(`${name}:`);
          console.log(`  Class: ${error.constructor.name}`);
          console.log(`  Type: ${error.type}`);
        }
      }
    }
  }
  console.log();

  // Example 6: Error handling recommendations
  console.log('6️⃣ Error Handling Recommendations');
  console.log('─'.repeat(60));

  console.log(`
Best Practices:

1. Always use try/catch around MATLAB operations
   try {
     await Matlab.run(code);
   } catch (error) {
     if (isMatlabError(error)) {
       // Handle MATLAB-specific error
     }
   }

2. Check for specific error types when needed
   if (error instanceof MatlabTimeoutError) {
     // Increase timeout or split operation
   }

3. Use parseError for custom error messages
   const parsed = parseError(matlabOutput);

4. Log error details for debugging
   console.error({
     type: error.type,
     command: error.command,
     exitCode: error.exitCode
   });

5. Provide user-friendly error messages
   const userMessage = {
     'syntax': 'Please check your MATLAB syntax',
     'timeout': 'Operation took too long',
     'not_installed': 'MATLAB is not available'
   }[error.type] || 'An error occurred';
`);

  console.log('✅ Error types reference completed!');
}

main();
