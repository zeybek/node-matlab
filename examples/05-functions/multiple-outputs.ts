/**
 * Handling Multiple Function Outputs
 *
 * This example demonstrates:
 * - Functions with multiple return values
 * - Using nargout to control outputs
 * - Destructuring results
 *
 * Run: npx tsx 05-functions/multiple-outputs.ts
 */

import { Matlab } from 'node-matlab';

async function main() {
  console.log('📤 Handling Multiple Function Outputs\n');

  try {
    // Example 1: size() - returns multiple values
    console.log('1️⃣ size() Function');
    console.log('─'.repeat(40));

    const matrix = [
      [1, 2, 3, 4],
      [5, 6, 7, 8],
      [9, 10, 11, 12],
    ];

    // Get both dimensions
    const sizeResult = await Matlab.callFunction<[number, number]>('size', [matrix], {
      nargout: 2,
    });
    const [rows, cols] = sizeResult.outputs;
    console.log(`Matrix: 3x4`);
    console.log(`Rows: ${rows}, Columns: ${cols}\n`);

    // Example 2: min/max() - value and index
    console.log('2️⃣ min() and max() Functions');
    console.log('─'.repeat(40));

    const data = [5, 2, 8, 1, 9, 3, 7, 4, 6];

    const minResult = await Matlab.callFunction<[number, number]>('min', [data], { nargout: 2 });
    console.log(`Data: [${data}]`);
    console.log(`Minimum: ${minResult.outputs[0]} at index ${minResult.outputs[1]}`);

    const maxResult = await Matlab.callFunction<[number, number]>('max', [data], { nargout: 2 });
    console.log(`Maximum: ${maxResult.outputs[0]} at index ${maxResult.outputs[1]}\n`);

    // Example 3: sort() - sorted array and indices
    console.log('3️⃣ sort() Function');
    console.log('─'.repeat(40));

    const sortResult = await Matlab.callFunction<[number[], number[]]>('sort', [data], {
      nargout: 2,
    });
    console.log(`Original: [${data}]`);
    console.log(`Sorted: [${sortResult.outputs[0]}]`);
    console.log(`Indices: [${sortResult.outputs[1]}]\n`);

    // Example 4: unique() - unique values, indices, counts
    console.log('4️⃣ unique() Function');
    console.log('─'.repeat(40));

    const dataWithDups = [1, 2, 2, 3, 3, 3, 4, 4, 4, 4];

    const uniqueResult = await Matlab.callFunction<[number[], number[], number[]]>(
      'unique',
      [dataWithDups],
      { nargout: 3 }
    );
    console.log(`Data with duplicates: [${dataWithDups}]`);
    console.log(`Unique values: [${uniqueResult.outputs[0]}]`);
    console.log(`First indices: [${uniqueResult.outputs[1]}]`);
    console.log(`Inverse indices: [${uniqueResult.outputs[2]}]\n`);

    // Example 5: eig() - eigenvalues and eigenvectors
    console.log('5️⃣ eig() Function');
    console.log('─'.repeat(40));

    const symMatrix = [
      [4, 1],
      [1, 3],
    ];

    const eigResult = await Matlab.callFunction<[number[][], number[][]]>('eig', [symMatrix], {
      nargout: 2,
    });
    console.log(`Matrix: [[4, 1], [1, 3]]`);
    console.log(`Eigenvectors (V):`);
    console.log(`  ${JSON.stringify(eigResult.outputs[0])}`);
    console.log(`Eigenvalues (D diagonal):`);
    console.log(`  ${JSON.stringify(eigResult.outputs[1])}\n`);

    // Example 6: svd() - full decomposition
    console.log('6️⃣ svd() Function');
    console.log('─'.repeat(40));

    const svdMatrix = [
      [1, 2],
      [3, 4],
      [5, 6],
    ];

    const svdResult = await Matlab.callFunction<[number[][], number[][], number[][]]>(
      'svd',
      [svdMatrix],
      { nargout: 3 }
    );
    console.log(`Matrix: 3x2`);
    console.log(`U (3x3): ${svdResult.outputs[0].length}x${svdResult.outputs[0][0]?.length || 0}`);
    console.log(`S (diagonal): ${JSON.stringify(svdResult.outputs[1])}`);
    console.log(
      `V (2x2): ${svdResult.outputs[2].length}x${svdResult.outputs[2][0]?.length || 0}\n`
    );

    // Example 7: find() - with row and column indices
    console.log('7️⃣ find() Function');
    console.log('─'.repeat(40));

    const searchMatrix = [
      [0, 1, 0],
      [2, 0, 3],
      [0, 4, 0],
    ];

    const findResult = await Matlab.callFunction<[number[], number[], number[]]>(
      'find',
      [searchMatrix],
      { nargout: 3 }
    );
    console.log(`Matrix:`);
    console.log(`  [0, 1, 0]`);
    console.log(`  [2, 0, 3]`);
    console.log(`  [0, 4, 0]`);
    console.log(`Non-zero row indices: [${findResult.outputs[0]}]`);
    console.log(`Non-zero col indices: [${findResult.outputs[1]}]`);
    console.log(`Non-zero values: [${findResult.outputs[2]}]\n`);

    // Example 8: Controlling nargout
    console.log('8️⃣ Controlling Number of Outputs');
    console.log('─'.repeat(40));

    // Same function, different nargout
    const lu1 = await Matlab.callFunction<[number[][]]>('lu', [symMatrix], { nargout: 1 });
    console.log('lu(A) with nargout=1: Returns combined L\\U matrix');
    console.log(`  Result: ${JSON.stringify(lu1.outputs[0])}`);

    const lu2 = await Matlab.callFunction<[number[][], number[][]]>('lu', [symMatrix], {
      nargout: 2,
    });
    console.log('lu(A) with nargout=2: Returns L and U separately');
    console.log(`  L: ${JSON.stringify(lu2.outputs[0])}`);
    console.log(`  U: ${JSON.stringify(lu2.outputs[1])}`);

    const lu3 = await Matlab.callFunction<[number[][], number[][], number[][]]>('lu', [symMatrix], {
      nargout: 3,
    });
    console.log('lu(A) with nargout=3: Returns L, U, and P (permutation)');
    console.log(`  L: ${JSON.stringify(lu3.outputs[0])}`);
    console.log(`  U: ${JSON.stringify(lu3.outputs[1])}`);
    console.log(`  P: ${JSON.stringify(lu3.outputs[2])}`);

    console.log('\n✅ Multiple output handling completed!');
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
}

main();
