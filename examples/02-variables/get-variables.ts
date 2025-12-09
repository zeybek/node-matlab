/**
 * Getting Variables from MATLAB
 *
 * This example shows how to:
 * - Extract variables from MATLAB workspace
 * - Access numeric, string, and array values
 * - Handle different data types
 *
 * Run: npx tsx 02-variables/get-variables.ts
 */

import { Matlab } from 'node-matlab';

async function main() {
  console.log('📥 Getting Variables from MATLAB\n');

  try {
    // Example 1: Get simple scalar values
    console.log('1️⃣ Getting Scalar Values');
    console.log('─'.repeat(40));

    const scalars = await Matlab.getVariables(
      `
      x = 42;
      y = 3.14159;
      name = 'Hello World';
      flag = true;
    `,
      ['x', 'y', 'name', 'flag']
    );

    console.log('Variables extracted:');
    console.log(`  x = ${scalars.x} (${typeof scalars.x})`);
    console.log(`  y = ${scalars.y} (${typeof scalars.y})`);
    console.log(`  name = "${scalars.name}" (${typeof scalars.name})`);
    console.log(`  flag = ${scalars.flag} (${typeof scalars.flag})\n`);

    // Example 2: Get arrays and matrices
    console.log('2️⃣ Getting Arrays and Matrices');
    console.log('─'.repeat(40));

    const arrays = await Matlab.getVariables(
      `
      vector = 1:5;
      matrix = [1 2 3; 4 5 6; 7 8 9];
      column = [10; 20; 30];
    `,
      ['vector', 'matrix', 'column']
    );

    console.log('vector:', arrays.vector);
    console.log('matrix:', arrays.matrix);
    console.log('column:', arrays.column);
    console.log();

    // Example 3: Get calculated results
    console.log('3️⃣ Getting Calculated Results');
    console.log('─'.repeat(40));

    const results = await Matlab.getVariables(
      `
      data = rand(1, 10);
      avg = mean(data);
      total = sum(data);
      minVal = min(data);
      maxVal = max(data);
    `,
      ['data', 'avg', 'total', 'minVal', 'maxVal']
    );

    console.log('Random data:', results.data);
    console.log(`Average: ${results.avg}`);
    console.log(`Sum: ${results.total}`);
    console.log(`Min: ${results.minVal}`);
    console.log(`Max: ${results.maxVal}\n`);

    // Example 4: Get struct fields
    console.log('4️⃣ Getting Struct Data');
    console.log('─'.repeat(40));

    const structData = await Matlab.getVariables(
      `
      person.name = 'John Doe';
      person.age = 30;
      person.scores = [85, 90, 78, 92];
    `,
      ['person']
    );

    console.log('person struct:', structData.person);
    console.log();

    // Example 5: Get multiple types together
    console.log('5️⃣ Complex Data Extraction');
    console.log('─'.repeat(40));

    const complex = await Matlab.getVariables(
      `
      % Simulation parameters
      params.dt = 0.01;
      params.tmax = 10;
      params.n_points = 1000;
      
      % Generate time series
      t = linspace(0, params.tmax, params.n_points);
      signal = sin(2*pi*t) + 0.5*randn(size(t));
      
      % Calculate statistics
      stats.mean = mean(signal);
      stats.std = std(signal);
      stats.rms = sqrt(mean(signal.^2));
    `,
      ['params', 't', 'signal', 'stats']
    );

    console.log('Parameters:', complex.params);
    console.log('Time points:', (complex.t as number[]).length, 'samples');
    console.log('Signal:', (complex.signal as number[]).slice(0, 5), '... (first 5)');
    console.log('Statistics:', complex.stats);

    console.log('\n✅ Variable extraction completed!');
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
}

main();
