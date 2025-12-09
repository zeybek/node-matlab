/**
 * Exporting Data to JSON
 *
 * This example shows how to:
 * - Export MATLAB variables to JSON files
 * - Handle different data types
 * - Create structured JSON output
 *
 * Run: npx tsx 04-data-export/export-json.ts
 */

import { mkdir, readFile } from 'node:fs/promises';
import { join } from 'node:path';
import { Matlab } from 'node-matlab';

async function main() {
  console.log('📄 Exporting Data to JSON\n');

  // Create output directory
  const outputDir = join(import.meta.dirname, 'output');
  await mkdir(outputDir, { recursive: true });

  try {
    // Example 1: Simple data export
    console.log('1️⃣ Simple Data Export');
    console.log('─'.repeat(40));

    const jsonPath1 = join(outputDir, 'simple_data.json');
    await Matlab.exportToJSON(
      `
      x = 1:10;
      y = x.^2;
      name = 'Simple Dataset';
    `,
      jsonPath1,
      ['x', 'y', 'name']
    );

    // Read and display the JSON
    const json1 = JSON.parse(await readFile(jsonPath1, 'utf-8'));
    console.log(`Saved to: ${jsonPath1}`);
    console.log('Content:', `${JSON.stringify(json1, null, 2).slice(0, 200)}...\n`);

    // Example 2: Statistical analysis export
    console.log('2️⃣ Statistical Analysis Export');
    console.log('─'.repeat(40));

    const jsonPath2 = join(outputDir, 'statistics.json');
    await Matlab.exportToJSON(
      `
      rng(42);
      data = randn(1000, 1);
      
      stats.mean = mean(data);
      stats.std = std(data);
      stats.median = median(data);
      stats.min = min(data);
      stats.max = max(data);
      stats.skewness = skewness(data);
      stats.kurtosis = kurtosis(data);
      stats.n = length(data);
      
      histogram_data.edges = -4:0.5:4;
      histogram_data.counts = histcounts(data, histogram_data.edges);
    `,
      jsonPath2,
      ['stats', 'histogram_data']
    );

    const json2 = JSON.parse(await readFile(jsonPath2, 'utf-8'));
    console.log(`Saved to: ${jsonPath2}`);
    console.log('Statistics:', json2.stats);
    console.log();

    // Example 3: Matrix data export
    console.log('3️⃣ Matrix Data Export');
    console.log('─'.repeat(40));

    const jsonPath3 = join(outputDir, 'matrix_data.json');
    await Matlab.exportToJSON(
      `
      % Create various matrix types
      identity = eye(3);
      diagonal = diag([1, 2, 3, 4, 5]);
      random = rand(3, 4);
      zeros_mat = zeros(2, 3);
      ones_mat = ones(2, 3);
    `,
      jsonPath3,
      ['identity', 'diagonal', 'random', 'zeros_mat', 'ones_mat']
    );

    const json3 = JSON.parse(await readFile(jsonPath3, 'utf-8'));
    console.log(`Saved to: ${jsonPath3}`);
    console.log('Identity matrix:', json3.identity);
    console.log();

    // Example 4: Time series export
    console.log('4️⃣ Time Series Export');
    console.log('─'.repeat(40));

    const jsonPath4 = join(outputDir, 'time_series.json');
    await Matlab.exportToJSON(
      `
      % Generate time series data
      fs = 100;  % Sampling frequency
      t = 0:1/fs:10;  % 10 seconds
      
      % Signal with multiple frequencies
      signal = sin(2*pi*5*t) + 0.5*sin(2*pi*12*t) + 0.2*randn(size(t));
      
      % Metadata
      metadata.sampling_rate = fs;
      metadata.duration = max(t);
      metadata.n_samples = length(t);
      metadata.description = 'Synthetic signal with 5Hz and 12Hz components';
    `,
      jsonPath4,
      ['t', 'signal', 'metadata']
    );

    const json4 = JSON.parse(await readFile(jsonPath4, 'utf-8'));
    console.log(`Saved to: ${jsonPath4}`);
    console.log('Metadata:', json4.metadata);
    console.log(`Signal samples: ${json4.signal.length}`);
    console.log();

    // Example 5: Structured experiment data
    console.log('5️⃣ Structured Experiment Data');
    console.log('─'.repeat(40));

    const jsonPath5 = join(outputDir, 'experiment.json');
    await Matlab.exportToJSON(
      `
      % Experiment configuration
      config.name = 'Temperature Measurement';
      config.date = datestr(now, 'yyyy-mm-dd');
      config.operator = 'Lab Technician';
      config.equipment = 'Thermocouple K-type';
      
      % Measurement data
      measurements.time = 0:60:3600;  % Every minute for 1 hour
      measurements.temperature = 20 + 5*sin(2*pi*measurements.time/3600) + 0.5*randn(size(measurements.time));
      measurements.unit = 'Celsius';
      
      % Analysis results
      analysis.mean_temp = mean(measurements.temperature);
      analysis.max_temp = max(measurements.temperature);
      analysis.min_temp = min(measurements.temperature);
      analysis.std_temp = std(measurements.temperature);
    `,
      jsonPath5,
      ['config', 'measurements', 'analysis']
    );

    const json5 = JSON.parse(await readFile(jsonPath5, 'utf-8'));
    console.log(`Saved to: ${jsonPath5}`);
    console.log('Config:', json5.config);
    console.log('Analysis:', json5.analysis);

    console.log(`\n📁 All JSON files saved to: ${outputDir}`);
    console.log('✅ JSON export example completed!');
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
}

main();
