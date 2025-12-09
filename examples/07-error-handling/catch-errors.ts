/**
 * Catching and Handling MATLAB Errors
 *
 * This example demonstrates:
 * - Basic error catching
 * - Using isMatlabError type guard
 * - Accessing error details
 * - Graceful error recovery
 *
 * Run: npx tsx 07-error-handling/catch-errors.ts
 */

import {
  Matlab,
  MatlabError,
  MatlabFileNotFoundError,
  MatlabNotInstalledError,
  MatlabRuntimeError,
  MatlabSyntaxError,
  isMatlabError,
} from 'node-matlab';

async function main() {
  console.log('🚨 Catching and Handling MATLAB Errors\n');

  // Example 1: Basic error catching
  console.log('1️⃣ Basic Error Catching');
  console.log('─'.repeat(40));

  try {
    await Matlab.run('undefined_variable');
  } catch (error) {
    if (error instanceof Error) {
      console.log(`Caught error: ${error.name}`);
      console.log(`Message: ${error.message.slice(0, 100)}...`);
    }
  }
  console.log();

  // Example 2: Using isMatlabError type guard
  console.log('2️⃣ Using isMatlabError Type Guard');
  console.log('─'.repeat(40));

  try {
    await Matlab.run('1 + + 2'); // Syntax error
  } catch (error) {
    if (isMatlabError(error)) {
      console.log('This is a MATLAB error');
      console.log(`  Type: ${error.type}`);
      console.log(`  Name: ${error.name}`);
      console.log(`  Command: ${error.command || 'N/A'}`);
    } else {
      console.log('This is not a MATLAB error');
    }
  }
  console.log();

  // Example 3: Different error types
  console.log('3️⃣ Different Error Types');
  console.log('─'.repeat(40));

  const errorCases = [
    { name: 'Syntax Error', code: 'for i = 1:10' }, // Missing 'end'
    { name: 'Runtime Error', code: 'error("Custom error message")' },
    { name: 'Undefined Variable', code: 'disp(nonexistent_var)' },
    { name: 'Index Out of Bounds', code: 'x = [1,2,3]; disp(x(10))' },
    { name: 'Dimension Mismatch', code: '[1 2 3] * [1 2 3]' }, // Can't multiply row by row
  ];

  for (const testCase of errorCases) {
    try {
      await Matlab.run(testCase.code);
      console.log(`${testCase.name}: No error (unexpected)`);
    } catch (error) {
      if (isMatlabError(error)) {
        console.log(`${testCase.name}:`);
        console.log(`  Type: ${error.type}`);
        console.log(`  Preview: ${error.message.slice(0, 60)}...`);
      } else {
        console.log(`${testCase.name}: Non-MATLAB error`);
      }
    }
  }
  console.log();

  // Example 4: Accessing error details
  console.log('4️⃣ Accessing Error Details');
  console.log('─'.repeat(40));

  try {
    await Matlab.run('error("Detailed error with code: E001")');
  } catch (error) {
    if (error instanceof MatlabError) {
      console.log('MatlabError details:');
      console.log(`  name: ${error.name}`);
      console.log(`  type: ${error.type}`);
      console.log(`  message: ${error.message}`);
      console.log(`  exitCode: ${error.exitCode ?? 'N/A'}`);
      console.log(`  command: ${error.command ?? 'N/A'}`);
      console.log(`  stack: ${error.stack?.split('\n')[0]}`);
    }
  }
  console.log();

  // Example 5: Error recovery pattern
  console.log('5️⃣ Error Recovery Pattern');
  console.log('─'.repeat(40));

  async function safeEval(expression: string, fallback: number = 0): Promise<number> {
    try {
      const result = await Matlab.eval(expression);
      return Number(result);
    } catch (_error) {
      console.log(`  Warning: "${expression}" failed, using fallback ${fallback}`);
      return fallback;
    }
  }

  const results = await Promise.all([
    safeEval('sqrt(16)', 0),
    safeEval('sqrt(-1)', Number.NaN), // Will fail or return complex
    safeEval('1/0', Number.POSITIVE_INFINITY), // Division by zero
    safeEval('undefined_var', -1), // Undefined
  ]);

  console.log(`Results with fallbacks: [${results.join(', ')}]\n`);

  // Example 6: Specific error type handling
  console.log('6️⃣ Specific Error Type Handling');
  console.log('─'.repeat(40));

  async function handleSpecificErrors(code: string): Promise<void> {
    try {
      await Matlab.run(code);
      console.log('Success');
    } catch (error) {
      if (error instanceof MatlabSyntaxError) {
        console.log('SYNTAX ERROR: Check your code syntax');
        console.log(`  Fix suggestion: Review brackets and keywords`);
      } else if (error instanceof MatlabRuntimeError) {
        console.log('RUNTIME ERROR: Error during execution');
        console.log(`  Fix suggestion: Check variable values and types`);
      } else if (error instanceof MatlabNotInstalledError) {
        console.log('INSTALLATION ERROR: MATLAB not found');
        console.log(`  Fix suggestion: Install MATLAB or add to PATH`);
      } else if (error instanceof MatlabFileNotFoundError) {
        console.log('FILE ERROR: Script file not found');
        console.log(`  Fix suggestion: Check file path`);
      } else if (isMatlabError(error)) {
        console.log(`MATLAB ERROR (${error.type})`);
      } else {
        console.log('UNKNOWN ERROR');
      }
    }
  }

  await handleSpecificErrors('for i = 1:5'); // Syntax (missing end)
  await handleSpecificErrors('error("test")'); // Runtime
  console.log();

  // Example 7: Retry pattern
  console.log('7️⃣ Retry Pattern');
  console.log('─'.repeat(40));

  async function runWithRetry(
    code: string,
    maxRetries: number = 3,
    delay: number = 1000
  ): Promise<string | null> {
    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        const result = await Matlab.run(code);
        return result.output;
      } catch (_error) {
        console.log(`  Attempt ${attempt}/${maxRetries} failed`);

        if (attempt === maxRetries) {
          console.log('  All retries exhausted');
          return null;
        }

        // Wait before retry
        await new Promise((resolve) => setTimeout(resolve, delay));
      }
    }
    return null;
  }

  const retryResult = await runWithRetry('disp("Success!")', 3, 100);
  console.log(`Retry result: ${retryResult?.trim() || 'null'}\n`);

  // Example 8: Error aggregation
  console.log('8️⃣ Error Aggregation');
  console.log('─'.repeat(40));

  const commands = [
    '1 + 1', // OK
    'undefined_var', // Error
    '2 * 2', // OK
    'error("fail")', // Error
    '3 ^ 3', // OK
  ];

  const errors: MatlabError[] = [];
  const results2: string[] = [];

  for (const cmd of commands) {
    try {
      const result = await Matlab.run(cmd);
      results2.push(result.output.trim());
    } catch (error) {
      if (isMatlabError(error)) {
        errors.push(error);
        results2.push(`[ERROR: ${error.type}]`);
      }
    }
  }

  console.log(`Commands executed: ${commands.length}`);
  console.log(`Successes: ${commands.length - errors.length}`);
  console.log(`Errors: ${errors.length}`);
  console.log(`Results: ${results2.join(', ')}`);

  console.log('\n✅ Error handling examples completed!');
}

main();
