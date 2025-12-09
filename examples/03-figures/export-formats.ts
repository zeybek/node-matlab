/**
 * Exporting Figures in Different Formats
 *
 * This example demonstrates:
 * - PNG (raster, good for web)
 * - SVG (vector, scalable)
 * - PDF (vector, good for documents)
 * - EPS (vector, good for publications)
 * - JPG (raster, compressed)
 *
 * Run: npx tsx 03-figures/export-formats.ts
 */

import { mkdir, stat } from 'node:fs/promises';
import { join } from 'node:path';
import type { ImageFormat } from 'node-matlab';
import { Matlab, getExtension, getPrintDevice, isVectorFormat } from 'node-matlab';

async function main() {
  console.log('🖼️  Exporting Figures in Different Formats\n');

  // Create output directory
  const outputDir = join(import.meta.dirname, 'output/formats');
  await mkdir(outputDir, { recursive: true });

  // Sample plot code
  const plotCode = `
    % Create a nice sample plot
    x = linspace(0, 4*pi, 200);
    y1 = sin(x);
    y2 = sin(x) .* exp(-x/10);
    
    plot(x, y1, 'b-', 'LineWidth', 1.5, 'DisplayName', 'sin(x)');
    hold on;
    plot(x, y2, 'r-', 'LineWidth', 2, 'DisplayName', 'Damped sine');
    fill([x fliplr(x)], [y2 zeros(size(y2))], 'r', 'FaceAlpha', 0.2, 'EdgeColor', 'none', 'HandleVisibility', 'off');
    hold off;
    
    xlabel('Time (s)');
    ylabel('Amplitude');
    title('Damped Oscillation');
    legend('Location', 'northeast');
    grid on;
    set(gca, 'FontSize', 12);
  `;

  // Format information
  const formats: Array<{
    format: ImageFormat;
    desc: string;
    useCase: string;
    resolution?: number;
  }> = [
    { format: 'png', desc: 'PNG (Raster)', useCase: 'Web, presentations', resolution: 300 },
    { format: 'svg', desc: 'SVG (Vector)', useCase: 'Web, scalable graphics' },
    { format: 'pdf', desc: 'PDF (Vector)', useCase: 'Documents, publications' },
    { format: 'eps', desc: 'EPS (Vector)', useCase: 'Scientific publications' },
    { format: 'jpg', desc: 'JPEG (Raster)', useCase: 'Photos, compressed', resolution: 200 },
  ];

  console.log('Format Information:');
  console.log('─'.repeat(60));
  console.log('| Format | Extension | Vector | Print Device |');
  console.log('|--------|-----------|--------|--------------|');

  for (const { format } of formats) {
    const ext = getExtension(format);
    const isVector = isVectorFormat(format);
    const device = getPrintDevice(format);
    console.log(
      `| ${format.padEnd(6)} | ${ext.padEnd(9)} | ${(isVector ? 'Yes' : 'No').padEnd(6)} | ${(device || 'saveas').padEnd(12)} |`
    );
  }
  console.log();

  try {
    // Export in each format
    console.log('Exporting figures...');
    console.log('─'.repeat(60));

    const results: Array<{ format: string; path: string; size: number }> = [];

    for (const { format, desc, useCase, resolution } of formats) {
      const filename = `sample_plot.${format}`;
      const outputPath = join(outputDir, filename);

      console.log(`\n📄 ${desc}`);
      console.log(`   Use case: ${useCase}`);

      try {
        const savedPath = await Matlab.saveFigure(plotCode, outputPath, {
          format,
          resolution: resolution ?? 150,
          width: 800,
          height: 600,
        });

        // Get file size
        const stats = await stat(savedPath);
        const sizeKB = Math.round(stats.size / 1024);

        results.push({ format, path: savedPath, size: sizeKB });
        console.log(`   ✅ Saved: ${filename} (${sizeKB} KB)`);
      } catch (error) {
        console.log(`   ⚠️ Failed: ${error instanceof Error ? error.message : error}`);
      }
    }

    // Summary table
    console.log(`\n${'─'.repeat(60)}`);
    console.log('Summary:');
    console.log('| Format | File Size | Path |');
    console.log('|--------|-----------|------|');

    for (const { format, path, size } of results) {
      const shortPath = path.split('/').slice(-2).join('/');
      console.log(`| ${format.padEnd(6)} | ${(`${size} KB`).padEnd(9)} | ${shortPath} |`);
    }

    // Quality comparison tips
    console.log('\n📝 Tips for Choosing Format:');
    console.log('─'.repeat(60));
    console.log('• PNG: Best for web images with transparency');
    console.log('• SVG: Best for logos, icons, and scalable web graphics');
    console.log('• PDF: Best for documents, can be embedded in LaTeX');
    console.log('• EPS: Best for scientific journals (often required)');
    console.log('• JPG: Best for photos, NOT recommended for plots');
    console.log('');
    console.log('💡 For publications, use vector formats (SVG, PDF, EPS)');
    console.log('💡 For web, use PNG (raster) or SVG (vector)');

    console.log(`\n📁 All formats saved to: ${outputDir}`);
    console.log('✅ Format export example completed!');
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
}

main();
