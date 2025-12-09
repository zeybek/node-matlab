/**
 * MATLAB Workspace Management
 *
 * This example demonstrates:
 * - Managing workspace variables
 * - Clearing and resetting workspace
 * - Saving and loading workspace state
 * - Memory management
 *
 * Run: npx tsx 06-session/workspace-management.ts
 */

import { mkdir } from 'node:fs/promises';
import { join } from 'node:path';
import { MatlabSession } from 'node-matlab';

async function main() {
  console.log('📦 MATLAB Workspace Management\n');

  const outputDir = join(import.meta.dirname, 'output');
  await mkdir(outputDir, { recursive: true });

  const session = new MatlabSession({ timeout: 30000 });

  try {
    await session.start();
    console.log('Session started\n');

    // Example 1: Creating variables
    console.log('1️⃣ Creating Variables');
    console.log('─'.repeat(40));

    await session.run(`
      % Create various types of variables
      scalar_int = int32(42);
      scalar_double = 3.14159;
      row_vector = [1, 2, 3, 4, 5];
      col_vector = [1; 2; 3; 4; 5];
      matrix_2d = rand(3, 4);
      string_var = 'Hello World';
      cell_array = {'a', 'b', 'c'};
      struct_var.field1 = 10;
      struct_var.field2 = 'test';
      
      disp('Variables created');
    `);

    // List workspace
    const whosResult = await session.run('whos');
    console.log('Current workspace:');
    console.log(whosResult.output);

    // Example 2: Checking variable existence
    console.log('2️⃣ Checking Variables');
    console.log('─'.repeat(40));

    const existResult = await session.run(`
      vars = {'scalar_int', 'matrix_2d', 'nonexistent'};
      for i = 1:length(vars)
        if exist(vars{i}, 'var')
          fprintf('%s: EXISTS\\n', vars{i});
        else
          fprintf('%s: NOT FOUND\\n', vars{i});
        end
      end
    `);
    console.log(existResult.output);

    // Example 3: Getting variable info
    console.log('3️⃣ Variable Information');
    console.log('─'.repeat(40));

    const infoResult = await session.run(`
      fprintf('matrix_2d:\\n');
      fprintf('  Size: %s\\n', mat2str(size(matrix_2d)));
      fprintf('  Class: %s\\n', class(matrix_2d));
      fprintf('  Bytes: %d\\n', numel(matrix_2d) * 8);
      
      fprintf('\\nstruct_var:\\n');
      fprintf('  Fields: %s\\n', strjoin(fieldnames(struct_var), ', '));
    `);
    console.log(infoResult.output);

    // Example 4: Clearing specific variables
    console.log('4️⃣ Clearing Variables');
    console.log('─'.repeat(40));

    await session.run(`
      disp('Before clear:');
      whos scalar_int scalar_double
    `);

    await session.run(`
      clear scalar_int scalar_double;
      disp('After clear:');
      whos scalar_int scalar_double
    `);

    const afterClear = await session.run('whos');
    console.log('Remaining variables:');
    console.log(`${afterClear.output.split('\n').slice(0, 10).join('\n')}\n...\n`);

    // Example 5: Saving workspace
    console.log('5️⃣ Saving Workspace');
    console.log('─'.repeat(40));

    const workspacePath = join(outputDir, 'workspace.mat').replace(/\\/g, '/');

    await session.run(`
      save('${workspacePath}');
      fprintf('Workspace saved to: %s\\n', '${workspacePath}');
    `);

    // Save only specific variables
    const partialPath = join(outputDir, 'partial.mat').replace(/\\/g, '/');
    await session.run(`
      save('${partialPath}', 'row_vector', 'matrix_2d', 'struct_var');
      fprintf('Partial save to: %s\\n', '${partialPath}');
    `);
    console.log();

    // Example 6: Clear all and reload
    console.log('6️⃣ Clear and Reload');
    console.log('─'.repeat(40));

    await session.run(`
      clear all;
      disp('Workspace cleared');
      whos
    `);

    await session.run(`
      load('${partialPath}');
      disp('Workspace reloaded');
      whos
    `);
    console.log();

    // Example 7: Memory management
    console.log('7️⃣ Memory Management');
    console.log('─'.repeat(40));

    const memResult = await session.run(`
      % Check memory (works on Windows, may differ on other OS)
      try
        [userview, systemview] = memory;
        fprintf('Memory used: %.2f MB\\n', userview.MemUsedMATLAB / 1e6);
        fprintf('Memory available: %.2f MB\\n', userview.MemAvailableAllArrays / 1e6);
      catch
        disp('Memory info not available on this platform');
      end
    `);
    console.log(memResult.output);

    // Create large variable and clear
    await session.run(`
      large_data = rand(1000, 1000);  % ~8 MB
      fprintf('Created large_data: %d elements\\n', numel(large_data));
    `);

    await session.run(`
      clear large_data;
      disp('Large data cleared');
    `);
    console.log();

    // Example 8: Workspace patterns
    console.log('8️⃣ Workspace Patterns');
    console.log('─'.repeat(40));

    // Clear by pattern (prefix)
    await session.run(`
      temp_1 = 1;
      temp_2 = 2;
      temp_3 = 3;
      result_a = 'a';
      result_b = 'b';
      
      disp('Created temp_* and result_* variables');
      whos
    `);

    await session.run(`
      clear temp*;
      disp('Cleared temp* variables');
      whos
    `);
    console.log();

    // Example 9: Who vs Whos
    console.log('9️⃣ who vs whos');
    console.log('─'.repeat(40));

    const whoResult = await session.run('who');
    console.log('who (names only):');
    console.log(whoResult.output);

    const whosResult2 = await session.run('whos');
    console.log('whos (detailed):');
    console.log(whosResult2.output);
  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    if (session.isRunning) {
      await session.stop();
    }
    console.log('✅ Workspace management example completed!');
  }
}

main();
