/**
 * Exporting Data to CSV
 *
 * This example shows how to:
 * - Export matrices to CSV files
 * - Customize delimiters
 * - Handle different data structures
 *
 * Run: npx tsx 04-data-export/export-csv.ts
 */

import { mkdir, readFile } from 'node:fs/promises';
import { join } from 'node:path';
import { Matlab } from 'node-matlab';

async function main() {
  console.log('📑 Exporting Data to CSV\n');

  // Create output directory
  const outputDir = join(import.meta.dirname, 'output');
  await mkdir(outputDir, { recursive: true });

  try {
    // Example 1: Simple numeric matrix
    console.log('1️⃣ Simple Numeric Matrix');
    console.log('─'.repeat(40));

    const csvPath1 = join(outputDir, 'simple_matrix.csv');
    await Matlab.exportToCSV(
      `
      data = [
        1, 2, 3, 4, 5;
        6, 7, 8, 9, 10;
        11, 12, 13, 14, 15
      ];
    `,
      'data',
      csvPath1
    );

    const csv1 = await readFile(csvPath1, 'utf-8');
    console.log(`Saved to: ${csvPath1}`);
    console.log('Content:');
    console.log(csv1);

    // Example 2: Time series data
    console.log('2️⃣ Time Series Data');
    console.log('─'.repeat(40));

    const csvPath2 = join(outputDir, 'time_series.csv');
    await Matlab.exportToCSV(
      `
      t = (0:0.1:10)';
      y = sin(t);
      data = [t, y];
    `,
      'data',
      csvPath2
    );

    const csv2Lines = (await readFile(csvPath2, 'utf-8')).split('\n').slice(0, 6);
    console.log(`Saved to: ${csvPath2}`);
    console.log('First 5 rows:');
    console.log(csv2Lines.join('\n'));
    console.log('...\n');

    // Example 3: Random dataset
    console.log('3️⃣ Random Dataset');
    console.log('─'.repeat(40));

    const csvPath3 = join(outputDir, 'random_data.csv');
    await Matlab.exportToCSV(
      `
      rng(42);
      n = 100;
      x = randn(n, 1);
      y = 2*x + randn(n, 1)*0.5;
      z = x.^2 + y;
      data = [x, y, z];
    `,
      'data',
      csvPath3
    );

    console.log(`Saved to: ${csvPath3}`);
    const stats = await Matlab.getVariables(
      `
      data = readmatrix('${csvPath3.replace(/\\/g, '/')}');
      rows = size(data, 1);
      cols = size(data, 2);
    `,
      ['rows', 'cols']
    );
    console.log(`Dataset: ${stats.rows} rows x ${stats.cols} columns\n`);

    // Example 4: Tab-separated values
    console.log('4️⃣ Tab-Separated Values (TSV)');
    console.log('─'.repeat(40));

    const tsvPath = join(outputDir, 'data.tsv');
    await Matlab.exportToCSV(
      `
      data = [
        1, 100, 0.5;
        2, 200, 0.7;
        3, 300, 0.3;
        4, 400, 0.9
      ];
    `,
      'data',
      tsvPath,
      { delimiter: '\t' }
    );

    const tsv = await readFile(tsvPath, 'utf-8');
    console.log(`Saved to: ${tsvPath}`);
    console.log('Content (tab-separated):');
    console.log(tsv);

    // Example 5: Scientific data
    console.log('5️⃣ Scientific Data Export');
    console.log('─'.repeat(40));

    const csvPath5 = join(outputDir, 'experiment_results.csv');
    await Matlab.exportToCSV(
      `
      % Experiment with multiple measurements
      trial = (1:20)';
      control = 10 + randn(20, 1);
      treatment = 15 + randn(20, 1) * 1.5;
      difference = treatment - control;
      
      data = [trial, control, treatment, difference];
    `,
      'data',
      csvPath5
    );

    const csv5Lines = (await readFile(csvPath5, 'utf-8')).split('\n').slice(0, 6);
    console.log(`Saved to: ${csvPath5}`);
    console.log('First 5 rows (Trial, Control, Treatment, Difference):');
    console.log(csv5Lines.join('\n'));
    console.log('...\n');

    // Example 6: Large dataset
    console.log('6️⃣ Large Dataset');
    console.log('─'.repeat(40));

    const csvPath6 = join(outputDir, 'large_dataset.csv');
    await Matlab.exportToCSV(
      `
      rng(123);
      n = 10000;
      data = randn(n, 5);  % 10000 rows, 5 columns
    `,
      'data',
      csvPath6
    );

    const { size: fileSize } = await import('node:fs/promises').then((m) => m.stat(csvPath6));
    console.log(`Saved to: ${csvPath6}`);
    console.log(`File size: ${Math.round(fileSize / 1024)} KB`);
    console.log(`Dataset: 10,000 rows x 5 columns\n`);

    console.log(`📁 All CSV files saved to: ${outputDir}`);
    console.log('✅ CSV export example completed!');
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
}

main();
