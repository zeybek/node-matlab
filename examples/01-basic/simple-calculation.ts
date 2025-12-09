/**
 * Mathematical Calculations with MATLAB
 *
 * This example demonstrates:
 * - Basic arithmetic operations
 * - Matrix operations
 * - Built-in mathematical functions
 * - Using Matlab.eval() for simple expressions
 *
 * Run: npx tsx 01-basic/simple-calculation.ts
 */

import { Matlab } from 'node-matlab';

async function main() {
  console.log('🔢 Mathematical Calculations\n');

  try {
    // Basic Arithmetic
    console.log('1️⃣ Basic Arithmetic');
    console.log('─'.repeat(40));

    const add = await Matlab.eval('10 + 5');
    console.log(`   10 + 5 = ${add}`);

    const subtract = await Matlab.eval('10 - 5');
    console.log(`   10 - 5 = ${subtract}`);

    const multiply = await Matlab.eval('10 * 5');
    console.log(`   10 * 5 = ${multiply}`);

    const divide = await Matlab.eval('10 / 5');
    console.log(`   10 / 5 = ${divide}`);

    const power = await Matlab.eval('2^10');
    console.log(`   2^10 = ${power}\n`);

    // Matrix Operations
    console.log('2️⃣ Matrix Operations');
    console.log('─'.repeat(40));

    const matrixResult = await Matlab.run(`
      A = [1 2 3; 4 5 6; 7 8 9];
      B = [9 8 7; 6 5 4; 3 2 1];
      
      disp('Matrix A:');
      disp(A);
      
      disp('Matrix B:');
      disp(B);
      
      disp('A + B:');
      disp(A + B);
      
      disp('A * B (matrix multiplication):');
      disp(A * B);
      
      disp('A .* B (element-wise):');
      disp(A .* B);
    `);
    console.log(matrixResult.output);

    // Mathematical Functions
    console.log('3️⃣ Mathematical Functions');
    console.log('─'.repeat(40));

    const mathResult = await Matlab.run(`
      x = pi/4;
      
      fprintf('sin(π/4) = %.6f\\n', sin(x));
      fprintf('cos(π/4) = %.6f\\n', cos(x));
      fprintf('tan(π/4) = %.6f\\n', tan(x));
      fprintf('exp(1) = %.6f\\n', exp(1));
      fprintf('log(e) = %.6f\\n', log(exp(1)));
      fprintf('sqrt(2) = %.6f\\n', sqrt(2));
    `);
    console.log(mathResult.output);

    // Statistical Functions
    console.log('4️⃣ Statistical Functions');
    console.log('─'.repeat(40));

    const statsResult = await Matlab.run(`
      data = [23, 45, 67, 12, 89, 34, 56, 78, 90, 11];
      
      fprintf('Data: [%s]\\n', num2str(data));
      fprintf('Mean: %.2f\\n', mean(data));
      fprintf('Median: %.2f\\n', median(data));
      fprintf('Std Dev: %.2f\\n', std(data));
      fprintf('Min: %d\\n', min(data));
      fprintf('Max: %d\\n', max(data));
      fprintf('Sum: %d\\n', sum(data));
    `);
    console.log(statsResult.output);

    // Linear Algebra
    console.log('5️⃣ Linear Algebra');
    console.log('─'.repeat(40));

    const linalgResult = await Matlab.run(`
      A = [4 2; 1 3];
      
      disp('Matrix A:');
      disp(A);
      
      fprintf('Determinant: %.2f\\n', det(A));
      fprintf('Trace: %.2f\\n', trace(A));
      fprintf('Rank: %d\\n', rank(A));
      
      disp('Inverse of A:');
      disp(inv(A));
      
      disp('Eigenvalues:');
      disp(eig(A));
    `);
    console.log(linalgResult.output);

    console.log('✅ All calculations completed!');
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
}

main();
