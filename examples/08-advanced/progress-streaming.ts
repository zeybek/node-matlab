/**
 * Progress and Output Streaming
 *
 * This example demonstrates:
 * - Real-time output streaming
 * - Progress callbacks
 * - Monitoring long-running operations
 *
 * Run: npx tsx 08-advanced/progress-streaming.ts
 */

import { MatlabSession } from 'node-matlab';

async function main() {
  console.log('📡 Progress and Output Streaming\n');

  // Example 1: Basic output streaming with session
  console.log('1️⃣ Basic Output Streaming');
  console.log('─'.repeat(40));

  const session = new MatlabSession({ timeout: 60000 });

  // Collect output in real-time
  const outputBuffer: string[] = [];

  session.on('output', (data) => {
    const lines = data
      .trim()
      .split('\n')
      .filter((l: string) => l.trim() && !l.startsWith('>>'));
    for (const line of lines) {
      outputBuffer.push(`[${new Date().toISOString().slice(11, 19)}] ${line}`);
      console.log(`  📤 ${line}`);
    }
  });

  try {
    await session.start();
    console.log('Session started, streaming output...\n');

    // Run command with multiple output lines
    await session.run(`
      for i = 1:5
        fprintf('Processing step %d of 5...\\n', i);
        pause(0.3);
      end
      disp('Done!');
    `);

    console.log(`\nCaptured ${outputBuffer.length} output lines\n`);
  } finally {
    if (session.isRunning) {
      await session.stop();
    }
  }

  // Example 2: Progress indicator pattern
  console.log('2️⃣ Progress Indicator Pattern');
  console.log('─'.repeat(40));

  const session2 = new MatlabSession({ timeout: 60000 });
  let progressPercent = 0;

  session2.on('output', (data) => {
    // Parse progress from MATLAB output
    const match = data.match(/Progress:\s*(\d+)%/);
    if (match) {
      progressPercent = Number.parseInt(match[1], 10);
      const bar =
        '█'.repeat(Math.floor(progressPercent / 5)) +
        '░'.repeat(20 - Math.floor(progressPercent / 5));
      process.stdout.write(`\r  [${bar}] ${progressPercent}%`);
    }
  });

  try {
    await session2.start();
    console.log('Running operation with progress...\n');

    await session2.run(`
      n = 10;
      for i = 1:n
        fprintf('Progress: %d%%\\n', round(i/n*100));
        pause(0.2);
      end
    `);

    console.log('\n  Operation completed!\n');
  } finally {
    if (session2.isRunning) {
      await session2.stop();
    }
  }

  // Example 3: Structured progress reporting
  console.log('3️⃣ Structured Progress Reporting');
  console.log('─'.repeat(40));

  const session3 = new MatlabSession({ timeout: 60000 });
  const stages: { name: string; status: string; time: number }[] = [];

  session3.on('output', (data) => {
    // Parse structured progress: STAGE:name:status
    const stageMatch = data.match(/STAGE:(\w+):(\w+)/);
    if (stageMatch) {
      const [, name, status] = stageMatch;
      const existing = stages.find((s) => s.name === name);
      if (existing) {
        existing.status = status;
        existing.time = Date.now();
      } else {
        stages.push({ name, status, time: Date.now() });
      }

      // Display current state
      console.log(`  Stage "${name}": ${status}`);
    }
  });

  try {
    await session3.start();
    console.log('Running multi-stage operation...\n');

    await session3.run(`
      % Stage 1: Initialize
      fprintf('STAGE:Initialize:started\\n');
      pause(0.3);
      fprintf('STAGE:Initialize:completed\\n');
      
      % Stage 2: Load Data
      fprintf('STAGE:LoadData:started\\n');
      pause(0.4);
      fprintf('STAGE:LoadData:completed\\n');
      
      % Stage 3: Process
      fprintf('STAGE:Process:started\\n');
      pause(0.5);
      fprintf('STAGE:Process:completed\\n');
      
      % Stage 4: Save
      fprintf('STAGE:Save:started\\n');
      pause(0.2);
      fprintf('STAGE:Save:completed\\n');
    `);

    console.log(`\nTotal stages: ${stages.length}\n`);
  } finally {
    if (session3.isRunning) {
      await session3.stop();
    }
  }

  // Example 4: Error streaming
  console.log('4️⃣ Error Output Streaming');
  console.log('─'.repeat(40));

  const session4 = new MatlabSession({ timeout: 30000 });
  const errors: string[] = [];
  const warnings: string[] = [];

  session4.on('output', (data) => {
    if (data.toLowerCase().includes('error')) {
      errors.push(data.trim());
    }
    if (data.toLowerCase().includes('warning')) {
      warnings.push(data.trim());
    }
  });

  session4.on('error', (data) => {
    errors.push(`[stderr] ${data.trim()}`);
  });

  try {
    await session4.start();
    console.log('Running commands with warnings...\n');

    await session4.run(`
      warning('This is a test warning');
      disp('Normal output');
      warning('Another warning message');
    `);

    console.log(`Captured ${warnings.length} warnings`);
    for (const w of warnings) {
      console.log(`  ⚠️ ${w}`);
    }
    console.log();
  } finally {
    if (session4.isRunning) {
      await session4.stop();
    }
  }

  // Example 5: Live data streaming
  console.log('5️⃣ Live Data Streaming');
  console.log('─'.repeat(40));

  const session5 = new MatlabSession({ timeout: 30000 });
  const dataPoints: number[] = [];

  session5.on('output', (data) => {
    // Parse data points: DATA:value
    const dataMatch = data.match(/DATA:([\d.]+)/g);
    if (dataMatch) {
      for (const match of dataMatch) {
        const value = Number.parseFloat(match.replace('DATA:', ''));
        dataPoints.push(value);
      }
    }
  });

  try {
    await session5.start();
    console.log('Streaming data points...\n');

    await session5.run(`
      for i = 1:10
        value = sin(i * 0.5) + randn() * 0.1;
        fprintf('DATA:%.4f\\n', value);
        pause(0.1);
      end
    `);

    console.log(`Received ${dataPoints.length} data points:`);
    console.log(`  Values: [${dataPoints.map((d) => d.toFixed(3)).join(', ')}]`);
    console.log(
      `  Mean: ${(dataPoints.reduce((a, b) => a + b, 0) / dataPoints.length).toFixed(4)}`
    );
    console.log();
  } finally {
    if (session5.isRunning) {
      await session5.stop();
    }
  }

  console.log('✅ Progress streaming examples completed!');
}

main();
