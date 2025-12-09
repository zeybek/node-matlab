/**
 * Persistent MATLAB Sessions
 *
 * This example demonstrates:
 * - Creating a persistent MATLAB session
 * - Running multiple commands efficiently
 * - Session lifecycle management
 * - Event handling
 *
 * Run: npx tsx 06-session/persistent-session.ts
 */

import { MatlabSession, type MatlabSessionOptions } from 'node-matlab';

async function main() {
  console.log('🔄 Persistent MATLAB Sessions\n');

  // Session options
  const options: MatlabSessionOptions = {
    timeout: 30000, // 30 second timeout per command
  };

  // Create session
  const session = new MatlabSession(options);

  try {
    // Set up event handlers before starting
    console.log('Setting up event handlers...');

    session.on('started', () => {
      console.log('📡 Session started');
    });

    session.on('output', (data) => {
      // Only show significant output
      const trimmed = data.trim();
      if (trimmed && !trimmed.startsWith('>>')) {
        console.log(`   [output] ${trimmed.slice(0, 50)}${trimmed.length > 50 ? '...' : ''}`);
      }
    });

    session.on('error', (error) => {
      console.log(`   [error] ${error}`);
    });

    session.on('stopped', () => {
      console.log('📡 Session stopped\n');
    });

    // Start session
    console.log('\n1️⃣ Starting Session');
    console.log('─'.repeat(40));
    await session.start();
    console.log(`Session ready: ${session.isReady}`);

    // Check if running
    console.log(`Session running: ${session.isRunning}`);
    console.log();

    // Example 2: Run commands
    console.log('2️⃣ Running Commands');
    console.log('─'.repeat(40));

    // Initialize variables
    const initResult = await session.run(`
      x = 1:10;
      y = x.^2;
      disp('Variables initialized');
    `);
    console.log(`Init: ${initResult.output.trim()}`);
    console.log(`Duration: ${initResult.duration}ms`);

    // Use variables from previous command
    const calcResult = await session.run(`
      sumX = sum(x);
      sumY = sum(y);
      fprintf('Sum of x: %d, Sum of y: %d\\n', sumX, sumY);
    `);
    console.log(`Calc: ${calcResult.output.trim()}`);
    console.log(`Duration: ${calcResult.duration}ms`);
    console.log();

    // Example 3: Speed comparison
    console.log('3️⃣ Session vs One-shot Performance');
    console.log('─'.repeat(40));

    // Multiple session commands
    const sessionStart = Date.now();
    for (let i = 0; i < 5; i++) {
      await session.run(`result_${i} = ${i}^2;`);
    }
    const sessionTime = Date.now() - sessionStart;
    console.log(`5 session commands: ${sessionTime}ms total`);
    console.log(`Average per command: ${Math.round(sessionTime / 5)}ms`);
    console.log('Note: One-shot commands would each have MATLAB startup overhead\n');

    // Example 4: Working with functions
    console.log('4️⃣ Creating and Using Functions');
    console.log('─'.repeat(40));

    // Define a function
    await session.run(`
      mySquare = @(x) x.^2;
      myAdd = @(a, b) a + b;
      disp('Anonymous functions created');
    `);

    // Use the function
    const funcResult = await session.run(`
      result1 = mySquare(5);
      result2 = myAdd(10, 20);
      fprintf('mySquare(5) = %d, myAdd(10,20) = %d\\n', result1, result2);
    `);
    console.log(`Functions: ${funcResult.output.trim()}\n`);

    // Example 5: Complex workflow
    console.log('5️⃣ Complex Workflow');
    console.log('─'.repeat(40));

    // Step 1: Generate data
    await session.run(`
      rng(42);
      data = randn(1000, 1);
      disp('Data generated');
    `);

    // Step 2: Process data
    await session.run(`
      processed = (data - mean(data)) / std(data);
      disp('Data normalized');
    `);

    // Step 3: Analyze
    const analysisResult = await session.run(`
      stats.mean = mean(processed);
      stats.std = std(processed);
      stats.min = min(processed);
      stats.max = max(processed);
      fprintf('Mean: %.4f, Std: %.4f\\n', stats.mean, stats.std);
      fprintf('Range: [%.4f, %.4f]\\n', stats.min, stats.max);
    `);
    console.log(`Analysis:\n${analysisResult.output.trim()}\n`);

    // Example 6: Error recovery
    console.log('6️⃣ Error Recovery');
    console.log('─'.repeat(40));

    try {
      await session.run('undefined_variable');
    } catch (_error) {
      console.log('Caught error (expected)');
      console.log(`Session still running: ${session.isRunning}`);
    }

    // Session recovers, can continue
    const recoveryResult = await session.run(`
      recovery_var = 'Session recovered!';
      disp(recovery_var);
    `);
    console.log(`Recovery: ${recoveryResult.output.trim()}\n`);

    // Example 7: Batch operations
    console.log('7️⃣ Batch Operations');
    console.log('─'.repeat(40));

    const batchCommands = [
      'a = 1;',
      'b = 2;',
      'c = 3;',
      'd = a + b + c;',
      'fprintf("d = %d\\n", d);',
    ];

    for (const cmd of batchCommands) {
      await session.run(cmd);
    }
    console.log('Batch commands executed\n');

    // Get final state
    const finalResult = await session.run('whos');
    console.log('Workspace variables:');
    console.log(`${finalResult.output.slice(0, 500)}...\n`);
  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    // Always clean up
    console.log('8️⃣ Cleanup');
    console.log('─'.repeat(40));

    if (session.isRunning) {
      await session.stop();
      console.log('Session stopped gracefully');
    }

    console.log('\n✅ Session example completed!');
  }
}

main();
