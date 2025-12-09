/**
 * Exporting Data to MAT Files
 *
 * This example shows how to:
 * - Save variables to .mat files
 * - Choose different MAT file versions
 * - Create archives of multiple variables
 *
 * Run: npx tsx 04-data-export/export-mat.ts
 */

import { mkdir, stat } from 'node:fs/promises';
import { join } from 'node:path';
import { Matlab } from 'node-matlab';

async function main() {
  console.log('💾 Exporting Data to MAT Files\n');

  // Create output directory
  const outputDir = join(import.meta.dirname, 'output');
  await mkdir(outputDir, { recursive: true });

  try {
    // Example 1: Save specific variables
    console.log('1️⃣ Save Specific Variables');
    console.log('─'.repeat(40));

    const matPath1 = join(outputDir, 'selected_vars.mat');
    await Matlab.exportToMAT(
      `
      x = 1:100;
      y = sin(x/10);
      z = cos(x/10);
      name = 'Trigonometric data';
      unused_var = 'This will not be saved';
    `,
      matPath1,
      ['x', 'y', 'z', 'name']
    );

    const stats1 = await stat(matPath1);
    console.log(`Saved to: ${matPath1}`);
    console.log(`File size: ${Math.round(stats1.size / 1024)} KB`);
    console.log('Variables saved: x, y, z, name\n');

    // Example 2: Save all workspace variables
    console.log('2️⃣ Save All Workspace Variables');
    console.log('─'.repeat(40));

    const matPath2 = join(outputDir, 'all_workspace.mat');
    await Matlab.exportToMAT(
      `
      % Create various data types
      scalar_int = 42;
      scalar_float = 3.14159;
      row_vector = [1 2 3 4 5];
      col_vector = [1; 2; 3; 4; 5];
      matrix_2d = rand(5, 5);
      string_var = 'Hello MATLAB';
      cell_array = {'a', 'b', 'c'};
      struct_var.field1 = 10;
      struct_var.field2 = 'test';
    `,
      matPath2
      // No variables specified = save all
    );

    const stats2 = await stat(matPath2);
    console.log(`Saved to: ${matPath2}`);
    console.log(`File size: ${Math.round(stats2.size / 1024)} KB`);
    console.log('All workspace variables saved\n');

    // Example 3: MAT file version comparison
    console.log('3️⃣ MAT File Version Comparison');
    console.log('─'.repeat(40));

    const versions: Array<'-v7.3' | '-v7' | '-v6'> = ['-v7.3', '-v7', '-v6'];

    for (const version of versions) {
      const matPath = join(outputDir, `version_test_${version.replace('-', '')}.mat`);
      await Matlab.exportToMAT(
        `
        large_matrix = rand(100, 100);
        string_data = repmat('test', 1, 100);
      `,
        matPath,
        ['large_matrix', 'string_data'],
        { version }
      );

      const stats = await stat(matPath);
      console.log(`${version}: ${Math.round(stats.size / 1024)} KB - ${matPath.split('/').pop()}`);
    }
    console.log();

    // Example 4: Large data compression
    console.log('4️⃣ Large Data with Compression');
    console.log('─'.repeat(40));

    const matPath4 = join(outputDir, 'large_data.mat');
    await Matlab.exportToMAT(
      `
      rng(42);
      % Generate large dataset
      large_matrix = randn(1000, 100);
      sparse_matrix = sparse(rand(1000, 1000) < 0.01);
      
      % Metadata
      info.rows = size(large_matrix, 1);
      info.cols = size(large_matrix, 2);
      info.created = datestr(now);
    `,
      matPath4,
      ['large_matrix', 'sparse_matrix', 'info'],
      { version: '-v7.3' }
    );

    const stats4 = await stat(matPath4);
    console.log(`Saved to: ${matPath4}`);
    console.log(`File size: ${Math.round(stats4.size / 1024)} KB`);
    console.log('Contains: 1000x100 dense matrix + 1000x1000 sparse matrix\n');

    // Example 5: Verify saved data
    console.log('5️⃣ Verify Saved Data');
    console.log('─'.repeat(40));

    const verifyResult = await Matlab.getVariables(
      `
      loaded = load('${matPath1.replace(/\\/g, '/')}');
      var_names = fieldnames(loaded);
      x_size = size(loaded.x);
      y_size = size(loaded.y);
    `,
      ['var_names', 'x_size', 'y_size']
    );

    console.log(`Loaded from: ${matPath1}`);
    console.log('Variable names:', verifyResult.var_names);
    console.log('x size:', verifyResult.x_size);
    console.log('y size:', verifyResult.y_size);
    console.log();

    // Summary
    console.log('📝 MAT File Version Guide:');
    console.log('─'.repeat(40));
    console.log('-v7.3: HDF5 format, supports >2GB arrays, slower');
    console.log('-v7:   Default, compressed, most compatible');
    console.log('-v6:   No compression, faster read/write');
    console.log('-v4:   Legacy, limited types (not shown)');

    console.log(`\n📁 All MAT files saved to: ${outputDir}`);
    console.log('✅ MAT export example completed!');
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
}

main();
