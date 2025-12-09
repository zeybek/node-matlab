/**
 * Saving MATLAB Plots
 *
 * This example shows how to:
 * - Create a plot in MATLAB
 * - Save it as an image file
 * - Customize resolution and size
 *
 * Run: npx tsx 03-figures/save-plot.ts
 */

import { mkdir } from 'node:fs/promises';
import { join } from 'node:path';
import { Matlab } from 'node-matlab';

async function main() {
  console.log('📊 Saving MATLAB Plots\n');

  // Create output directory
  const outputDir = join(import.meta.dirname, 'output');
  await mkdir(outputDir, { recursive: true });

  try {
    // Example 1: Simple line plot
    console.log('1️⃣ Simple Line Plot');
    console.log('─'.repeat(40));

    const plotPath1 = join(outputDir, 'line_plot.png');
    await Matlab.saveFigure(
      `
      x = 0:0.1:2*pi;
      y = sin(x);
      plot(x, y, 'b-', 'LineWidth', 2);
      xlabel('x');
      ylabel('sin(x)');
      title('Sine Wave');
      grid on;
    `,
      plotPath1,
      { format: 'png', resolution: 150 }
    );
    console.log(`✅ Saved: ${plotPath1}\n`);

    // Example 2: Multiple series
    console.log('2️⃣ Multiple Series Plot');
    console.log('─'.repeat(40));

    const plotPath2 = join(outputDir, 'multi_series.png');
    await Matlab.saveFigure(
      `
      x = 0:0.1:2*pi;
      plot(x, sin(x), 'r-', 'LineWidth', 2, 'DisplayName', 'sin(x)');
      hold on;
      plot(x, cos(x), 'b--', 'LineWidth', 2, 'DisplayName', 'cos(x)');
      plot(x, sin(x).*cos(x), 'g:', 'LineWidth', 2, 'DisplayName', 'sin(x)*cos(x)');
      hold off;
      xlabel('x');
      ylabel('y');
      title('Trigonometric Functions');
      legend('Location', 'best');
      grid on;
    `,
      plotPath2,
      { format: 'png', resolution: 200 }
    );
    console.log(`✅ Saved: ${plotPath2}\n`);

    // Example 3: Scatter plot
    console.log('3️⃣ Scatter Plot');
    console.log('─'.repeat(40));

    const plotPath3 = join(outputDir, 'scatter.png');
    await Matlab.saveFigure(
      `
      rng(42);  % For reproducibility
      x = randn(100, 1);
      y = 2*x + randn(100, 1)*0.5;
      scatter(x, y, 50, 'filled', 'MarkerFaceAlpha', 0.6);
      xlabel('X');
      ylabel('Y');
      title('Scatter Plot with Linear Relationship');
      grid on;
      
      % Add trend line
      hold on;
      p = polyfit(x, y, 1);
      xfit = linspace(min(x), max(x), 100);
      yfit = polyval(p, xfit);
      plot(xfit, yfit, 'r-', 'LineWidth', 2);
      legend('Data', 'Trend Line', 'Location', 'best');
    `,
      plotPath3,
      { format: 'png', resolution: 200 }
    );
    console.log(`✅ Saved: ${plotPath3}\n`);

    // Example 4: Bar chart
    console.log('4️⃣ Bar Chart');
    console.log('─'.repeat(40));

    const plotPath4 = join(outputDir, 'bar_chart.png');
    await Matlab.saveFigure(
      `
      categories = {'Mon', 'Tue', 'Wed', 'Thu', 'Fri'};
      values = [23, 45, 38, 52, 41];
      bar(values, 'FaceColor', [0.2 0.6 0.8]);
      set(gca, 'XTickLabel', categories);
      xlabel('Day');
      ylabel('Sales');
      title('Daily Sales');
      grid on;
    `,
      plotPath4,
      { format: 'png', resolution: 150 }
    );
    console.log(`✅ Saved: ${plotPath4}\n`);

    // Example 5: 3D surface plot
    console.log('5️⃣ 3D Surface Plot');
    console.log('─'.repeat(40));

    const plotPath5 = join(outputDir, 'surface_3d.png');
    await Matlab.saveFigure(
      `
      [X, Y] = meshgrid(-2:0.1:2, -2:0.1:2);
      Z = X .* exp(-X.^2 - Y.^2);
      surf(X, Y, Z);
      xlabel('X');
      ylabel('Y');
      zlabel('Z');
      title('3D Surface: z = x * exp(-x^2 - y^2)');
      colormap(jet);
      colorbar;
      shading interp;
    `,
      plotPath5,
      { format: 'png', resolution: 200, width: 800, height: 600 }
    );
    console.log(`✅ Saved: ${plotPath5}\n`);

    // Example 6: Subplot layout
    console.log('6️⃣ Subplot Layout');
    console.log('─'.repeat(40));

    const plotPath6 = join(outputDir, 'subplots.png');
    await Matlab.saveFigure(
      `
      x = 0:0.1:4*pi;
      
      subplot(2, 2, 1);
      plot(x, sin(x), 'b-');
      title('sin(x)');
      grid on;
      
      subplot(2, 2, 2);
      plot(x, cos(x), 'r-');
      title('cos(x)');
      grid on;
      
      subplot(2, 2, 3);
      plot(x, tan(x), 'g-');
      ylim([-5, 5]);
      title('tan(x)');
      grid on;
      
      subplot(2, 2, 4);
      plot(x, sin(x).^2 + cos(x).^2, 'm-');
      title('sin^2(x) + cos^2(x)');
      grid on;
      
      sgtitle('Trigonometric Functions');
    `,
      plotPath6,
      { format: 'png', resolution: 200, width: 1000, height: 800 }
    );
    console.log(`✅ Saved: ${plotPath6}\n`);

    console.log(`📁 All plots saved to: ${outputDir}`);
    console.log('✅ Plot saving examples completed!');
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
}

main();
