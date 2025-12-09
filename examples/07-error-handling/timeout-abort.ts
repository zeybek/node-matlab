/**
 * Timeout and Abort Handling
 *
 * This example demonstrates:
 * - Setting command timeouts
 * - Aborting long-running operations
 * - Using AbortController
 * - Graceful cancellation
 *
 * Run: npx tsx 07-error-handling/timeout-abort.ts
 */

import { Matlab, MatlabSession, MatlabTimeoutError, isMatlabError } from 'node-matlab';

async function main() {
  console.log('⏱️ Timeout and Abort Handling\n');

  // Example 1: Basic timeout
  console.log('1️⃣ Basic Timeout');
  console.log('─'.repeat(40));

  try {
    // This should succeed - quick command
    const quickResult = await Matlab.run('disp("Quick!")', { timeout: 5000 });
    console.log(`Quick command: ${quickResult.output.trim()} (${quickResult.duration}ms)`);
  } catch (_error) {
    console.log('Quick command failed (unexpected)');
  }

  console.log();

  // Example 2: Timeout with long operation
  console.log('2️⃣ Timeout with Long Operation');
  console.log('─'.repeat(40));

  try {
    console.log('Starting long operation with 2s timeout...');
    await Matlab.run(
      `
      % Simulate long computation
      for i = 1:100
        pause(0.1);  % 10 seconds total
      end
    `,
      { timeout: 2000 }
    );
    console.log('Completed (unexpected - should timeout)');
  } catch (error) {
    if (error instanceof MatlabTimeoutError) {
      console.log(`Timeout caught! Timeout was: ${error.timeout}ms`);
    } else if (isMatlabError(error)) {
      console.log(`Other MATLAB error: ${error.type}`);
    } else {
      console.log(`Non-MATLAB error: ${error}`);
    }
  }
  console.log();

  // Example 3: AbortController usage
  console.log('3️⃣ AbortController Usage');
  console.log('─'.repeat(40));

  const controller = new AbortController();

  // Set up abort after 1 second
  const abortTimer = setTimeout(() => {
    console.log('Aborting operation...');
    controller.abort();
  }, 1000);

  try {
    console.log('Starting operation with AbortController...');
    await Matlab.run(
      `
      for i = 1:50
        fprintf('Step %d\\n', i);
        pause(0.1);
      end
    `,
      { signal: controller.signal }
    );
    console.log('Completed (unexpected - should be aborted)');
    clearTimeout(abortTimer);
  } catch (error) {
    clearTimeout(abortTimer);
    if (error instanceof Error && error.name === 'AbortError') {
      console.log('Operation aborted successfully');
    } else {
      console.log(`Error: ${error}`);
    }
  }
  console.log();

  // Example 4: Session with timeout
  console.log('4️⃣ Session with Timeout');
  console.log('─'.repeat(40));

  const session = new MatlabSession({ timeout: 3000 });

  try {
    await session.start();
    console.log('Session started with 3s timeout');

    // Quick commands should work
    const result1 = await session.run('x = 1 + 1;');
    console.log(`Quick command 1: success (${result1.duration}ms)`);

    const result2 = await session.run('y = x * 2;');
    console.log(`Quick command 2: success (${result2.duration}ms)`);

    // Long command should timeout
    try {
      console.log('Starting long command...');
      await session.run('pause(10);'); // 10 seconds
      console.log('Long command completed (unexpected)');
    } catch (error) {
      if (error instanceof MatlabTimeoutError) {
        console.log(`Session command timed out after ${error.timeout}ms`);
      }
    }
  } finally {
    if (session.isRunning) {
      await session.stop();
    }
  }
  console.log();

  // Example 5: Timeout with cleanup
  console.log('5️⃣ Timeout with Cleanup');
  console.log('─'.repeat(40));

  async function runWithCleanup(
    code: string,
    timeout: number
  ): Promise<{ success: boolean; duration: number; message: string }> {
    const start = Date.now();

    try {
      const result = await Matlab.run(code, { timeout });
      return {
        success: true,
        duration: result.duration,
        message: result.output.trim(),
      };
    } catch (error) {
      const duration = Date.now() - start;

      if (error instanceof MatlabTimeoutError) {
        // Could add cleanup logic here
        console.log('  (cleanup would happen here)');
        return {
          success: false,
          duration,
          message: `Timeout after ${error.timeout}ms`,
        };
      }

      return {
        success: false,
        duration,
        message: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }

  const cleanupResult = await runWithCleanup('pause(0.5); disp("Done!")', 2000);
  console.log(`Result: ${cleanupResult.success ? 'Success' : 'Failed'}`);
  console.log(`Duration: ${cleanupResult.duration}ms`);
  console.log(`Message: ${cleanupResult.message}\n`);

  // Example 6: Conditional abort
  console.log('6️⃣ Conditional Abort');
  console.log('─'.repeat(40));

  let shouldCancel = false;

  // Simulated external condition
  setTimeout(() => {
    shouldCancel = true;
    console.log('  External condition triggered cancel');
  }, 500);

  async function runWithCondition(): Promise<void> {
    const controller2 = new AbortController();

    // Check condition periodically
    const checkInterval = setInterval(() => {
      if (shouldCancel) {
        controller2.abort();
        clearInterval(checkInterval);
      }
    }, 100);

    try {
      await Matlab.run('pause(2); disp("Done!");', { signal: controller2.signal });
      console.log('Operation completed');
    } catch (_error) {
      console.log('Operation cancelled due to external condition');
    } finally {
      clearInterval(checkInterval);
    }
  }

  await runWithCondition();
  console.log();

  // Example 7: Timeout best practices
  console.log('7️⃣ Timeout Best Practices');
  console.log('─'.repeat(40));

  console.log('Recommended timeout values:');
  console.log('  - Simple calculations: 5-10 seconds');
  console.log('  - Data processing: 30-60 seconds');
  console.log('  - Heavy computation: 5-10 minutes');
  console.log('  - Plotting/graphics: 30 seconds');
  console.log('');
  console.log('Tips:');
  console.log('  - Always set a timeout for production code');
  console.log('  - Use AbortController for user-initiated cancellation');
  console.log('  - Log timeout events for debugging');
  console.log('  - Consider retry logic for transient failures');

  console.log('\n✅ Timeout and abort handling completed!');
}

main();
