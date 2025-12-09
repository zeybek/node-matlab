/**
 * Running MATLAB Script Files
 *
 * This example shows how to:
 * - Run a .m script file
 * - Pass the script path to Matlab.run()
 * - Use Matlab.runFile() explicitly
 *
 * Run: npx tsx 01-basic/run-script.ts
 */

import { join } from 'node:path';
import { Matlab, MatlabFileNotFoundError, isMatlabError } from 'node-matlab';

async function main() {
  console.log('📜 Running MATLAB Script Files\n');

  // Path to our example script
  const scriptPath = join(import.meta.dirname, '../matlab-scripts/simple_script.m');
  console.log(`Script path: ${scriptPath}\n`);

  try {
    // Method 1: Using Matlab.run() - auto-detects .m files
    console.log('Method 1: Using Matlab.run() with .m file path');
    console.log('─'.repeat(50));

    const result1 = await Matlab.run(scriptPath);
    console.log('Output:');
    console.log(result1.output);
    console.log(`Duration: ${result1.duration}ms\n`);

    // Method 2: Using Matlab.runFile() explicitly
    console.log('Method 2: Using Matlab.runFile()');
    console.log('─'.repeat(50));

    const result2 = await Matlab.runFile(scriptPath);
    console.log('Output:');
    console.log(result2.output);
    console.log(`Duration: ${result2.duration}ms\n`);

    // Method 3: Run inline script that calls a .m file
    console.log('Method 3: Running script with addPath');
    console.log('─'.repeat(50));

    const scriptsDir = join(import.meta.dirname, '../matlab-scripts');
    const result3 = await Matlab.run('simple_script', {
      addPath: [scriptsDir],
    });
    console.log('Output:');
    console.log(result3.output);
    console.log(`Duration: ${result3.duration}ms\n`);

    console.log('✅ All script execution methods completed!');
  } catch (error) {
    if (error instanceof MatlabFileNotFoundError) {
      console.error(`❌ Script file not found: ${error.filePath}`);
    } else if (isMatlabError(error)) {
      console.error('❌ MATLAB Error:', error.message);
      console.error('   Type:', error.type);
    } else {
      console.error('❌ Error:', error);
    }
    process.exit(1);
  }
}

main();
