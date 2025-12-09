/**
 * Working with Multiple Figures
 *
 * This example shows how to:
 * - Create multiple figures in one script
 * - Save all figures at once
 * - Name figures with prefixes
 *
 * Run: npx tsx 03-figures/multiple-figures.ts
 */

import { mkdir } from 'node:fs/promises';
import { join } from 'node:path';
import { Matlab } from 'node-matlab';

async function main() {
  console.log('📊 Working with Multiple Figures\n');

  // Create output directory
  const outputDir = join(import.meta.dirname, 'output/multi');
  await mkdir(outputDir, { recursive: true });

  try {
    // Create and save multiple figures
    console.log('Creating multiple figures...');
    console.log('─'.repeat(40));

    const paths = await Matlab.saveAllFigures(
      `
      % Figure 1: Line Plot
      figure(1);
      x = 0:0.1:2*pi;
      plot(x, sin(x), 'b-', 'LineWidth', 2);
      title('Figure 1: Sine Wave');
      xlabel('x'); ylabel('y');
      grid on;
      
      % Figure 2: Bar Chart
      figure(2);
      data = [4, 7, 1, 8, 3, 9, 2];
      bar(data, 'FaceColor', [0.4 0.7 0.3]);
      title('Figure 2: Bar Chart');
      xlabel('Index'); ylabel('Value');
      grid on;
      
      % Figure 3: Scatter Plot
      figure(3);
      rng(123);
      scatter(randn(50,1), randn(50,1), 100, 'filled');
      title('Figure 3: Random Scatter');
      xlabel('X'); ylabel('Y');
      grid on;
      axis equal;
      
      % Figure 4: Pie Chart
      figure(4);
      values = [35, 25, 20, 15, 5];
      labels = {'A', 'B', 'C', 'D', 'E'};
      pie(values, labels);
      title('Figure 4: Pie Chart');
      
      % Figure 5: Histogram
      figure(5);
      rng(456);
      histogram(randn(1000, 1), 30, 'FaceColor', [0.8 0.4 0.4]);
      title('Figure 5: Normal Distribution');
      xlabel('Value'); ylabel('Count');
      grid on;
    `,
      outputDir,
      'analysis',
      { format: 'png', resolution: 150 }
    );

    console.log(`\n✅ Created ${paths.length} figures:`);
    for (const path of paths) {
      console.log(`   📄 ${path}`);
    }

    // Save same figures in different format
    console.log('\n─'.repeat(40));
    console.log('Saving same figures as SVG (vector)...');

    const svgDir = join(import.meta.dirname, 'output/multi-svg');
    await mkdir(svgDir, { recursive: true });

    const svgPaths = await Matlab.saveAllFigures(
      `
      figure(1);
      x = 0:0.1:2*pi;
      plot(x, sin(x), 'b-', 'LineWidth', 2);
      title('Vector Figure: Sine Wave');
      xlabel('x'); ylabel('y');
      grid on;
      
      figure(2);
      x = 0:0.1:2*pi;
      plot(x, cos(x), 'r-', 'LineWidth', 2);
      title('Vector Figure: Cosine Wave');
      xlabel('x'); ylabel('y');
      grid on;
    `,
      svgDir,
      'vector',
      { format: 'svg' }
    );

    console.log(`\n✅ Created ${svgPaths.length} SVG files:`);
    for (const path of svgPaths) {
      console.log(`   📄 ${path}`);
    }

    // Demonstrating figure numbering
    console.log('\n─'.repeat(40));
    console.log('Custom figure numbers...');

    const customDir = join(import.meta.dirname, 'output/custom');
    await mkdir(customDir, { recursive: true });

    const customPaths = await Matlab.saveAllFigures(
      `
      % Non-sequential figure numbers
      figure(10);
      plot(1:10, 'r-o');
      title('Figure 10');
      
      figure(20);
      plot(1:10, 'b-s');
      title('Figure 20');
      
      figure(30);
      plot(1:10, 'g-^');
      title('Figure 30');
    `,
      customDir,
      'custom',
      { format: 'png', resolution: 100 }
    );

    console.log(`\n✅ Created ${customPaths.length} custom numbered figures:`);
    for (const path of customPaths) {
      console.log(`   📄 ${path}`);
    }

    console.log(`\n📁 All figures saved to: ${join(import.meta.dirname, 'output')}`);
    console.log('✅ Multiple figures example completed!');
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
}

main();
