/**
 * Hello MATLAB - Your First Steps
 *
 * This example demonstrates the most basic usage of node-matlab:
 * - Checking if MATLAB is installed
 * - Running a simple command
 * - Handling the result
 *
 * Run: npx tsx 01-basic/hello-matlab.ts
 */

import { Matlab, MatlabNotInstalledError } from 'node-matlab';

async function main() {
  console.log('🚀 Hello MATLAB Example\n');

  // Step 1: Check if MATLAB is installed
  console.log('Step 1: Checking MATLAB installation...');
  if (!Matlab.isInstalled()) {
    console.error('❌ MATLAB is not installed or not found in PATH');
    console.error('   Please install MATLAB and add it to your system PATH');
    process.exit(1);
  }
  console.log('✅ MATLAB is installed\n');

  try {
    // Step 2: Get MATLAB version
    console.log('Step 2: Getting MATLAB version...');
    const version = await Matlab.getVersion();
    console.log(`✅ MATLAB ${version.release} (${version.version})\n`);

    // Step 3: Run a simple command
    console.log('Step 3: Running "Hello World"...');
    const result = await Matlab.run('disp("Hello from MATLAB!")');
    console.log(`✅ Output: ${result.output}`);
    console.log(`   Duration: ${result.duration}ms\n`);

    // Step 4: Simple calculation
    console.log('Step 4: Running a calculation (2 + 2)...');
    const calcResult = await Matlab.eval('2 + 2');
    console.log(`✅ Result: ${calcResult}\n`);

    // Step 5: Display array
    console.log('Step 5: Creating and displaying an array...');
    const arrayResult = await Matlab.run(`
      x = 1:5;
      disp(x);
    `);
    console.log(`✅ Array output:\n${arrayResult.output}\n`);

    console.log('🎉 All examples completed successfully!');
  } catch (error) {
    if (error instanceof MatlabNotInstalledError) {
      console.error('❌ MATLAB is not installed');
    } else {
      console.error('❌ Error:', error);
    }
    process.exit(1);
  }
}

main();
