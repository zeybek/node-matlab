/**
 * Parallel MATLAB Execution
 *
 * This example demonstrates:
 * - Running multiple MATLAB instances
 * - Parallel data processing
 * - Managing concurrent sessions
 * - Resource pooling
 *
 * Run: npx tsx 08-advanced/parallel-execution.ts
 */

import { Matlab, MatlabSession } from 'node-matlab';

async function main() {
  console.log('⚡ Parallel MATLAB Execution\n');

  // Example 1: Parallel one-shot commands
  console.log('1️⃣ Parallel One-Shot Commands');
  console.log('─'.repeat(40));

  const commands = ['sum(1:1000)', 'mean(rand(100,1))', 'det([1 2; 3 4])', 'pi^2', 'sqrt(2)'];

  console.log(`Running ${commands.length} commands in parallel...`);
  const start1 = Date.now();

  const results = await Promise.all(
    commands.map(async (cmd, i) => {
      try {
        const result = await Matlab.eval(cmd);
        return { index: i, command: cmd, result, error: null };
      } catch (error) {
        return { index: i, command: cmd, result: null, error };
      }
    })
  );

  const duration1 = Date.now() - start1;

  console.log(`Completed in ${duration1}ms\n`);
  for (const { command, result, error } of results) {
    if (error) {
      console.log(`  ${command} → ERROR`);
    } else {
      console.log(`  ${command} → ${result}`);
    }
  }
  console.log();

  // Example 2: Sequential vs Parallel comparison
  console.log('2️⃣ Sequential vs Parallel Comparison');
  console.log('─'.repeat(40));

  const tasks = Array.from({ length: 5 }, (_, i) => `pause(0.5); disp(${i + 1})`);

  // Sequential
  console.log('Sequential execution...');
  const seqStart = Date.now();
  for (const task of tasks) {
    await Matlab.run(task);
  }
  const seqTime = Date.now() - seqStart;
  console.log(`Sequential: ${seqTime}ms`);

  // Parallel
  console.log('Parallel execution...');
  const parStart = Date.now();
  await Promise.all(tasks.map((task) => Matlab.run(task)));
  const parTime = Date.now() - parStart;
  console.log(`Parallel: ${parTime}ms`);

  console.log(`Speedup: ${(seqTime / parTime).toFixed(2)}x\n`);

  // Example 3: Parallel data processing
  console.log('3️⃣ Parallel Data Processing');
  console.log('─'.repeat(40));

  // Split data into chunks
  const fullData = Array.from({ length: 100 }, (_, i) => i + 1);
  const chunkSize = 25;
  const chunks: number[][] = [];

  for (let i = 0; i < fullData.length; i += chunkSize) {
    chunks.push(fullData.slice(i, i + chunkSize));
  }

  console.log(`Processing ${fullData.length} items in ${chunks.length} parallel chunks...`);

  interface ChunkResult {
    chunk: number;
    chunk_sum: number;
    chunk_mean: number;
    chunk_max: number;
  }

  const chunkResults = await Promise.all(
    chunks.map(async (chunk, i) => {
      const code = Matlab.setVariables({ data: chunk });
      const result = await Matlab.getVariables(
        `
        ${code}
        chunk_sum = sum(data);
        chunk_mean = mean(data);
        chunk_max = max(data);
      `,
        ['chunk_sum', 'chunk_mean', 'chunk_max']
      );
      return { chunk: i, ...result } as ChunkResult;
    })
  );

  console.log('Chunk results:');
  for (const r of chunkResults) {
    console.log(`  Chunk ${r.chunk}: sum=${r.chunk_sum}, mean=${r.chunk_mean}, max=${r.chunk_max}`);
  }

  // Combine results
  const totalSum = chunkResults.reduce((acc, r) => acc + r.chunk_sum, 0);
  console.log(`Total sum: ${totalSum}\n`);

  // Example 4: Session pool
  console.log('4️⃣ Session Pool Pattern');
  console.log('─'.repeat(40));

  class MatlabPool {
    private sessions: MatlabSession[] = [];
    private available: MatlabSession[] = [];
    private waiting: Array<(session: MatlabSession) => void> = [];

    constructor(private size: number) {}

    async initialize(): Promise<void> {
      console.log(`  Initializing pool of ${this.size} sessions...`);
      const startPromises = Array.from({ length: this.size }, async () => {
        const session = new MatlabSession({ timeout: 30000 });
        await session.start();
        this.sessions.push(session);
        this.available.push(session);
      });
      await Promise.all(startPromises);
      console.log(`  Pool ready`);
    }

    acquire(): Promise<MatlabSession> {
      return new Promise((resolve) => {
        const session = this.available.pop();
        if (session) {
          resolve(session);
        } else {
          this.waiting.push(resolve);
        }
      });
    }

    release(session: MatlabSession): void {
      const waiter = this.waiting.shift();
      if (waiter) {
        waiter(session);
      } else {
        this.available.push(session);
      }
    }

    async shutdown(): Promise<void> {
      for (const session of this.sessions) {
        if (session.isRunning) {
          await session.stop();
        }
      }
      this.sessions = [];
      this.available = [];
    }
  }

  const pool = new MatlabPool(2);

  try {
    await pool.initialize();

    // Execute tasks using pool
    const poolTasks = Array.from({ length: 6 }, (_, i) => async () => {
      const session = await pool.acquire();
      try {
        const result = await session.run(`result = ${i + 1}^2; disp(result)`);
        return { task: i, output: result.output.trim() };
      } finally {
        pool.release(session);
      }
    });

    console.log('  Executing 6 tasks with 2 pooled sessions...');
    const poolResults = await Promise.all(poolTasks.map((t) => t()));

    for (const r of poolResults) {
      console.log(`  Task ${r.task}: ${r.output}`);
    }
  } finally {
    await pool.shutdown();
    console.log('  Pool shutdown complete\n');
  }

  // Example 5: Error handling in parallel
  console.log('5️⃣ Error Handling in Parallel');
  console.log('─'.repeat(40));

  const mixedCommands = [
    '1 + 1', // OK
    'undefined_var', // Error
    '2 + 2', // OK
    'error("fail")', // Error
    '3 + 3', // OK
  ];

  const mixedResults = await Promise.allSettled(mixedCommands.map((cmd) => Matlab.eval(cmd)));

  console.log('Results with error handling:');
  mixedResults.forEach((result, i) => {
    if (result.status === 'fulfilled') {
      console.log(`  Command ${i}: ✅ ${result.value}`);
    } else {
      console.log(`  Command ${i}: ❌ Error`);
    }
  });
  console.log();

  // Example 6: Rate limiting
  console.log('6️⃣ Rate-Limited Parallel Execution');
  console.log('─'.repeat(40));

  async function parallelWithLimit<T>(tasks: Array<() => Promise<T>>, limit: number): Promise<T[]> {
    const results: T[] = [];
    const executing: Promise<void>[] = [];

    for (const task of tasks) {
      const p = task().then((result) => {
        results.push(result);
        executing.splice(executing.indexOf(p), 1);
      });
      executing.push(p);

      if (executing.length >= limit) {
        await Promise.race(executing);
      }
    }

    await Promise.all(executing);
    return results;
  }

  const manyTasks = Array.from({ length: 10 }, (_, i) => async () => {
    const start = Date.now();
    await Matlab.run('pause(0.2)');
    return { task: i, duration: Date.now() - start };
  });

  console.log('Running 10 tasks with concurrency limit of 3...');
  const limitedStart = Date.now();
  const limitedResults = await parallelWithLimit(manyTasks, 3);
  console.log(`Completed in ${Date.now() - limitedStart}ms`);
  console.log(`Tasks completed: ${limitedResults.length}\n`);

  console.log('✅ Parallel execution examples completed!');
}

main();
