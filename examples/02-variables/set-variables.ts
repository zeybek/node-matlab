/**
 * Setting Variables in MATLAB
 *
 * This example shows how to:
 * - Send JavaScript data to MATLAB
 * - Generate MATLAB code from JS values
 * - Work with different data types
 *
 * Run: npx tsx 02-variables/set-variables.ts
 */

import { Matlab } from 'node-matlab';

async function main() {
  console.log('📤 Setting Variables in MATLAB\n');

  try {
    // Example 1: Simple values
    console.log('1️⃣ Setting Simple Values');
    console.log('─'.repeat(40));

    // Generate MATLAB code for variables
    const simpleCode = Matlab.setVariables({
      x: 42,
      y: 3.14159,
      name: 'Hello from JavaScript',
      flag: true,
    });

    console.log('Generated MATLAB code:');
    console.log(simpleCode);
    console.log();

    // Execute and verify
    const result1 = await Matlab.run(`
      ${simpleCode}
      fprintf('x = %d\\n', x);
      fprintf('y = %.5f\\n', y);
      fprintf('name = %s\\n', name);
      fprintf('flag = %d\\n', flag);
    `);
    console.log('MATLAB output:');
    console.log(result1.output);

    // Example 2: Arrays and matrices
    console.log('2️⃣ Setting Arrays and Matrices');
    console.log('─'.repeat(40));

    const arrayCode = Matlab.setVariables({
      vector: [1, 2, 3, 4, 5],
      matrix: [
        [1, 2, 3],
        [4, 5, 6],
        [7, 8, 9],
      ],
      strings: ['apple', 'banana', 'cherry'],
    });

    console.log('Generated MATLAB code:');
    console.log(arrayCode);
    console.log();

    const result2 = await Matlab.run(`
      ${arrayCode}
      disp('vector:'); disp(vector);
      disp('matrix:'); disp(matrix);
      disp('strings:'); disp(strings);
    `);
    console.log('MATLAB output:');
    console.log(result2.output);

    // Example 3: Structs
    console.log('3️⃣ Setting Struct Data');
    console.log('─'.repeat(40));

    const structCode = Matlab.setVariables({
      config: {
        width: 800,
        height: 600,
        title: 'My Plot',
      },
      data: {
        x: [0, 1, 2, 3, 4],
        y: [0, 1, 4, 9, 16],
      },
    });

    console.log('Generated MATLAB code:');
    console.log(structCode);
    console.log();

    const result3 = await Matlab.run(`
      ${structCode}
      disp('config:'); disp(config);
      disp('data:'); disp(data);
    `);
    console.log('MATLAB output:');
    console.log(result3.output);

    // Example 4: Using variables in calculations
    console.log('4️⃣ Using Variables in Calculations');
    console.log('─'.repeat(40));

    // Send data from JS to MATLAB for processing
    const inputData = [10, 20, 30, 40, 50];
    const scaleFactor = 2.5;

    const calcCode = Matlab.setVariables({
      input: inputData,
      scale: scaleFactor,
    });

    const calcResult = await Matlab.getVariables(
      `
      ${calcCode}
      output = input * scale;
      avg = mean(output);
      total = sum(output);
    `,
      ['output', 'avg', 'total']
    );

    console.log(`Input: ${inputData}`);
    console.log(`Scale factor: ${scaleFactor}`);
    console.log(`Output: ${calcResult.output}`);
    console.log(`Average: ${calcResult.avg}`);
    console.log(`Total: ${calcResult.total}\n`);

    // Example 5: Date/Time values
    console.log('5️⃣ Setting Date/Time Values');
    console.log('─'.repeat(40));

    const dateCode = Matlab.setVariables({
      timestamp: new Date(),
      startDate: new Date('2024-01-01'),
    });

    console.log('Generated MATLAB code:');
    console.log(dateCode);
    console.log();

    const result5 = await Matlab.run(`
      ${dateCode}
      disp('timestamp:'); disp(timestamp);
      disp('startDate:'); disp(startDate);
    `);
    console.log('MATLAB output:');
    console.log(result5.output);

    console.log('✅ Variable setting completed!');
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
}

main();
