/**
 * Calling Custom MATLAB Functions
 *
 * This example shows how to:
 * - Call custom .m function files
 * - Pass complex arguments
 * - Handle structured return values
 *
 * Run: npx tsx 05-functions/call-custom.ts
 */

import { join } from 'node:path';
import { Matlab } from 'node-matlab';

async function main() {
  console.log('🔧 Calling Custom MATLAB Functions\n');

  // Path to our custom functions
  const scriptsDir = join(import.meta.dirname, '../matlab-scripts');

  try {
    // Example 1: Call custom_function with different operations
    console.log('1️⃣ Using custom_function.m');
    console.log('─'.repeat(40));

    const data = [1, 2, 3, 4, 5];

    // Square operation
    const squareResult = await Matlab.callFunction<
      [number[], { min: number; max: number; mean: number; std: number; operation: string }]
    >('custom_function', [data, 'square'], { nargout: 2 }, { addPath: [scriptsDir] });
    console.log(`Operation: square`);
    console.log(`Input: [${data}]`);
    console.log(`Result: [${squareResult.outputs[0]}]`);
    console.log(`Stats:`, squareResult.outputs[1]);
    console.log();

    // Square root operation
    const sqrtResult = await Matlab.callFunction<[number[], Record<string, unknown>]>(
      'custom_function',
      [data, 'sqrt'],
      { nargout: 2 },
      { addPath: [scriptsDir] }
    );
    console.log(`Operation: sqrt`);
    console.log(`Input: [${data}]`);
    console.log(`Result: [${sqrtResult.outputs[0]}]`);
    console.log();

    // Normalize operation
    const normalizeResult = await Matlab.callFunction<[number[], Record<string, unknown>]>(
      'custom_function',
      [[10, 20, 30, 40, 50], 'normalize'],
      { nargout: 2 },
      { addPath: [scriptsDir] }
    );
    console.log(`Operation: normalize`);
    console.log(`Input: [10, 20, 30, 40, 50]`);
    console.log(`Result: [${normalizeResult.outputs[0]}]`);
    console.log();

    // Example 2: Call signal_analysis function
    console.log('2️⃣ Using signal_analysis.m');
    console.log('─'.repeat(40));

    // Create a simple signal in JS
    const fs = 100; // Sampling frequency
    const t = Array.from({ length: 100 }, (_, i) => i / fs);
    const signal = t.map(
      (ti) => Math.sin(2 * Math.PI * 5 * ti) + 0.5 * Math.sin(2 * Math.PI * 12 * ti)
    );

    const analysisResult = await Matlab.callFunction<[number[], number[], number[]]>(
      'signal_analysis',
      [signal, fs],
      { nargout: 3 },
      { addPath: [scriptsDir] }
    );

    console.log('Signal: 5Hz + 12Hz components');
    console.log('Sampling frequency: 100 Hz');
    console.log(`Frequency bins: ${analysisResult.outputs[0].length}`);
    console.log(
      `Magnitude range: [${Math.min(...analysisResult.outputs[1]).toFixed(4)}, ${Math.max(...analysisResult.outputs[1]).toFixed(4)}]`
    );
    console.log();

    // Example 3: Inline custom function
    console.log('3️⃣ Inline Custom Function');
    console.log('─'.repeat(40));

    // Define and call an inline function
    const inlineResult = await Matlab.getVariables(
      `
      % Define a function inline
      quadratic = @(a, b, c, x) a*x.^2 + b*x + c;
      
      % Use it
      x = -5:0.5:5;
      y = quadratic(1, -2, 1, x);  % y = x^2 - 2x + 1
      
      % Find roots
      roots_val = roots([1, -2, 1]);
      
      % Find minimum
      [min_y, min_idx] = min(y);
      min_x = x(min_idx);
    `,
      ['x', 'y', 'roots_val', 'min_x', 'min_y']
    );

    console.log('Function: f(x) = x² - 2x + 1');
    console.log(`Roots: ${inlineResult.roots_val}`);
    console.log(`Minimum at x = ${inlineResult.min_x}, y = ${inlineResult.min_y}`);
    console.log();

    // Example 4: Function with struct input
    console.log('4️⃣ Function with Struct Input');
    console.log('─'.repeat(40));

    const configResult = await Matlab.getVariables(
      `
      % Define config as struct
      config.method = 'fft';
      config.window_size = 256;
      config.overlap = 0.5;
      config.fs = 1000;
      
      % "Process" based on config
      result.method_used = config.method;
      result.samples = config.window_size * (1 - config.overlap);
      result.freq_resolution = config.fs / config.window_size;
    `,
      ['config', 'result']
    );

    console.log('Config:', configResult.config);
    console.log('Result:', configResult.result);
    console.log();

    // Example 5: Error handling with custom function
    console.log('5️⃣ Error Handling');
    console.log('─'.repeat(40));

    try {
      // Try calling with invalid operation
      await Matlab.callFunction(
        'custom_function',
        [[1, 2, 3], 'invalid_operation'],
        { nargout: 2 },
        { addPath: [scriptsDir] }
      );
    } catch (error) {
      console.log('Caught expected error for invalid operation:');
      console.log(`  ${error instanceof Error ? error.message.slice(0, 100) : error}...`);
    }

    console.log('\n✅ Custom function calls completed!');
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
}

main();
