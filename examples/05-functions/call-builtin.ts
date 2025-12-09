/**
 * Calling MATLAB Built-in Functions
 *
 * This example shows how to:
 * - Call MATLAB functions with arguments
 * - Handle return values
 * - Use type-safe function calls
 *
 * Run: npx tsx 05-functions/call-builtin.ts
 */

import { Matlab } from 'node-matlab';

async function main() {
  console.log('🔧 Calling MATLAB Built-in Functions\n');

  try {
    // Example 1: Simple math functions
    console.log('1️⃣ Math Functions');
    console.log('─'.repeat(40));

    // sqrt function
    const sqrtResult = await Matlab.callFunction<[number]>('sqrt', [16]);
    console.log(`sqrt(16) = ${sqrtResult.outputs[0]}`);

    // sin function
    const sinResult = await Matlab.callFunction<[number]>('sin', [Math.PI / 2]);
    console.log(`sin(π/2) = ${sinResult.outputs[0]}`);

    // exp function
    const expResult = await Matlab.callFunction<[number]>('exp', [1]);
    console.log(`exp(1) = ${expResult.outputs[0]}`);

    // log function
    const logResult = await Matlab.callFunction<[number]>('log', [Math.E]);
    console.log(`log(e) = ${logResult.outputs[0]}\n`);

    // Example 2: Statistical functions
    console.log('2️⃣ Statistical Functions');
    console.log('─'.repeat(40));

    const data = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];

    const meanResult = await Matlab.callFunction<[number]>('mean', [data]);
    console.log(`mean([1:10]) = ${meanResult.outputs[0]}`);

    const sumResult = await Matlab.callFunction<[number]>('sum', [data]);
    console.log(`sum([1:10]) = ${sumResult.outputs[0]}`);

    const stdResult = await Matlab.callFunction<[number]>('std', [data]);
    console.log(`std([1:10]) = ${stdResult.outputs[0]}`);

    const varResult = await Matlab.callFunction<[number]>('var', [data]);
    console.log(`var([1:10]) = ${varResult.outputs[0]}\n`);

    // Example 3: Array functions
    console.log('3️⃣ Array Functions');
    console.log('─'.repeat(40));

    const sizeResult = await Matlab.callFunction<[number[]]>('size', [
      [
        [1, 2, 3],
        [4, 5, 6],
      ],
    ]);
    console.log(`size([2x3 matrix]) = ${sizeResult.outputs[0]}`);

    const lengthResult = await Matlab.callFunction<[number]>('length', [[1, 2, 3, 4, 5]]);
    console.log(`length([1:5]) = ${lengthResult.outputs[0]}`);

    const numelResult = await Matlab.callFunction<[number]>('numel', [
      [
        [1, 2],
        [3, 4],
        [5, 6],
      ],
    ]);
    console.log(`numel([3x2 matrix]) = ${numelResult.outputs[0]}\n`);

    // Example 4: Matrix operations
    console.log('4️⃣ Matrix Operations');
    console.log('─'.repeat(40));

    const matrix = [
      [1, 2],
      [3, 4],
    ];

    const detResult = await Matlab.callFunction<[number]>('det', [matrix]);
    console.log(`det([1 2; 3 4]) = ${detResult.outputs[0]}`);

    const traceResult = await Matlab.callFunction<[number]>('trace', [matrix]);
    console.log(`trace([1 2; 3 4]) = ${traceResult.outputs[0]}`);

    const rankResult = await Matlab.callFunction<[number]>('rank', [matrix]);
    console.log(`rank([1 2; 3 4]) = ${rankResult.outputs[0]}`);

    const invResult = await Matlab.callFunction<[number[][]]>('inv', [matrix]);
    console.log(`inv([1 2; 3 4]) =`, invResult.outputs[0]);
    console.log();

    // Example 5: String functions
    console.log('5️⃣ String Functions');
    console.log('─'.repeat(40));

    const upperResult = await Matlab.callFunction<[string]>('upper', ['hello']);
    console.log(`upper('hello') = "${upperResult.outputs[0]}"`);

    const lowerResult = await Matlab.callFunction<[string]>('lower', ['WORLD']);
    console.log(`lower('WORLD') = "${lowerResult.outputs[0]}"`);

    const strlenResult = await Matlab.callFunction<[number]>('strlength', ['Hello World']);
    console.log(`strlength('Hello World') = ${strlenResult.outputs[0]}\n`);

    // Example 6: Generation functions
    console.log('6️⃣ Generation Functions');
    console.log('─'.repeat(40));

    const zerosResult = await Matlab.callFunction<[number[][]]>('zeros', [2, 3]);
    console.log(`zeros(2,3) =`, zerosResult.outputs[0]);

    const onesResult = await Matlab.callFunction<[number[][]]>('ones', [2, 2]);
    console.log(`ones(2,2) =`, onesResult.outputs[0]);

    const eyeResult = await Matlab.callFunction<[number[][]]>('eye', [3]);
    console.log(`eye(3) =`, eyeResult.outputs[0]);

    // linspace
    const linspaceResult = await Matlab.callFunction<[number[]]>('linspace', [0, 10, 5]);
    console.log(`linspace(0,10,5) =`, linspaceResult.outputs[0]);
    console.log();

    // Performance info
    console.log('📊 Function Call Stats:');
    console.log(`   Last call duration: ${linspaceResult.duration}ms`);
    if (linspaceResult.warnings && linspaceResult.warnings.length > 0) {
      console.log(`   Warnings: ${linspaceResult.warnings.join(', ')}`);
    }

    console.log('\n✅ Built-in function calls completed!');
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
}

main();
