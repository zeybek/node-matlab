/**
 * Live Script Export
 *
 * This example demonstrates:
 * - Exporting .mlx files to different formats
 * - HTML export for web display
 * - PDF export for documentation
 * - LaTeX export for publications
 *
 * Run: npx tsx 08-advanced/live-script-export.ts
 */

import { mkdir, stat, writeFile } from 'node:fs/promises';
import { join } from 'node:path';
import { Matlab } from 'node-matlab';

async function main() {
  console.log('📝 Live Script Export\n');

  const outputDir = join(import.meta.dirname, 'output/livescript');
  await mkdir(outputDir, { recursive: true });

  // Create a sample Live Script programmatically
  console.log('1️⃣ Creating Sample Live Script');
  console.log('─'.repeat(40));

  const sampleLiveScript = join(outputDir, 'sample_analysis.mlx');

  // First, create the Live Script using MATLAB
  try {
    await Matlab.run(`
      % Create a new live script
      mlxFile = '${sampleLiveScript.replace(/\\/g, '/')}';
      
      % Create content using matlab.internal.liveeditor API (if available)
      % Otherwise, we'll work with a pre-existing .mlx file
      
      % For this demo, we'll create a simple .m file that can be converted
      mFile = '${join(outputDir, 'sample_analysis.m').replace(/\\/g, '/')}';
      
      % Write sample script content
      fid = fopen(mFile, 'w');
      fprintf(fid, '%% Sample Data Analysis\\n');
      fprintf(fid, '%% This script demonstrates basic data analysis\\n\\n');
      fprintf(fid, '%% Generate sample data\\n');
      fprintf(fid, 'rng(42);\\n');
      fprintf(fid, 'x = linspace(0, 2*pi, 100);\\n');
      fprintf(fid, 'y = sin(x) + 0.1*randn(size(x));\\n\\n');
      fprintf(fid, '%% Plot the data\\n');
      fprintf(fid, 'figure;\\n');
      fprintf(fid, 'plot(x, y, ''b.'', ''MarkerSize'', 10);\\n');
      fprintf(fid, 'hold on;\\n');
      fprintf(fid, 'plot(x, sin(x), ''r-'', ''LineWidth'', 2);\\n');
      fprintf(fid, 'xlabel(''x'');\\n');
      fprintf(fid, 'ylabel(''y'');\\n');
      fprintf(fid, 'title(''Noisy Sine Wave'');\\n');
      fprintf(fid, 'legend(''Data'', ''True Signal'');\\n');
      fprintf(fid, 'grid on;\\n\\n');
      fprintf(fid, '%% Calculate statistics\\n');
      fprintf(fid, 'meanY = mean(y);\\n');
      fprintf(fid, 'stdY = std(y);\\n');
      fprintf(fid, 'fprintf(''Mean: %%.4f\\\\n'', meanY);\\n');
      fprintf(fid, 'fprintf(''Std: %%.4f\\\\n'', stdY);\\n');
      fclose(fid);
      
      disp('Sample script created');
    `);
    console.log(`Created: ${join(outputDir, 'sample_analysis.m')}\n`);
  } catch (_error) {
    console.log('Creating sample script content manually...');

    // Create script content directly
    const scriptContent = `%% Sample Data Analysis
% This script demonstrates basic data analysis

%% Generate sample data
rng(42);
x = linspace(0, 2*pi, 100);
y = sin(x) + 0.1*randn(size(x));

%% Plot the data
figure;
plot(x, y, 'b.', 'MarkerSize', 10);
hold on;
plot(x, sin(x), 'r-', 'LineWidth', 2);
xlabel('x');
ylabel('y');
title('Noisy Sine Wave');
legend('Data', 'True Signal');
grid on;

%% Calculate statistics
meanY = mean(y);
stdY = std(y);
fprintf('Mean: %.4f\\n', meanY);
fprintf('Std: %.4f\\n', stdY);
`;

    await writeFile(join(outputDir, 'sample_analysis.m'), scriptContent);
    console.log(`Created: ${join(outputDir, 'sample_analysis.m')}\n`);
  }

  // Example 2: Export to HTML
  console.log('2️⃣ Export to HTML');
  console.log('─'.repeat(40));

  try {
    const htmlPath = join(outputDir, 'sample_analysis.html');
    const mPath = join(outputDir, 'sample_analysis.m').replace(/\\/g, '/');

    await Matlab.run(`
      % Publish to HTML
      opts = struct();
      opts.format = 'html';
      opts.outputDir = '${outputDir.replace(/\\/g, '/')}';
      opts.showCode = true;
      opts.evalCode = true;
      
      publish('${mPath}', opts);
      disp('HTML export completed');
    `);

    const htmlStats = await stat(htmlPath).catch(() => null);
    if (htmlStats) {
      console.log(`✅ Exported: ${htmlPath}`);
      console.log(`   Size: ${Math.round(htmlStats.size / 1024)} KB\n`);
    } else {
      console.log('⚠️ HTML export may have different filename\n');
    }
  } catch (_error) {
    console.log('⚠️ HTML export requires MATLAB with publish support\n');
  }

  // Example 3: Export to PDF
  console.log('3️⃣ Export to PDF');
  console.log('─'.repeat(40));

  try {
    const mPath = join(outputDir, 'sample_analysis.m').replace(/\\/g, '/');

    await Matlab.run(`
      % Publish to PDF
      opts = struct();
      opts.format = 'pdf';
      opts.outputDir = '${outputDir.replace(/\\/g, '/')}';
      opts.showCode = true;
      opts.evalCode = true;
      
      try
        publish('${mPath}', opts);
        disp('PDF export completed');
      catch ME
        fprintf('PDF export not available: %s\\n', ME.message);
      end
    `);

    console.log('✅ PDF export attempted\n');
  } catch (_error) {
    console.log('⚠️ PDF export requires LaTeX installation\n');
  }

  // Example 4: Export to LaTeX
  console.log('4️⃣ Export to LaTeX');
  console.log('─'.repeat(40));

  try {
    const mPath = join(outputDir, 'sample_analysis.m').replace(/\\/g, '/');

    await Matlab.run(`
      % Publish to LaTeX
      opts = struct();
      opts.format = 'latex';
      opts.outputDir = '${outputDir.replace(/\\/g, '/')}';
      opts.showCode = true;
      opts.evalCode = true;
      
      publish('${mPath}', opts);
      disp('LaTeX export completed');
    `);

    console.log('✅ LaTeX export completed\n');
  } catch (_error) {
    console.log('⚠️ LaTeX export may not be available\n');
  }

  // Example 5: Export to Word (docx)
  console.log('5️⃣ Export to Word');
  console.log('─'.repeat(40));

  try {
    const mPath = join(outputDir, 'sample_analysis.m').replace(/\\/g, '/');

    await Matlab.run(`
      % Publish to Word
      opts = struct();
      opts.format = 'doc';
      opts.outputDir = '${outputDir.replace(/\\/g, '/')}';
      opts.showCode = true;
      opts.evalCode = true;
      
      try
        publish('${mPath}', opts);
        disp('Word export completed');
      catch ME
        fprintf('Word export not available: %s\\n', ME.message);
      end
    `);

    console.log('✅ Word export attempted\n');
  } catch (_error) {
    console.log('⚠️ Word export may not be available\n');
  }

  // Example 6: Using exportLiveScript API
  console.log('6️⃣ Using exportLiveScript API');
  console.log('─'.repeat(40));

  // Check if we have a .mlx file to export
  const testMlxPath = join(outputDir, 'test_script.mlx');

  try {
    // Try to create a simple .mlx file first
    await Matlab.run(`
      % Try to create a live script
      mlxPath = '${testMlxPath.replace(/\\/g, '/')}';
      
      try
        % Create using export from .m
        mPath = '${join(outputDir, 'sample_analysis.m').replace(/\\/g, '/')}';
        matlab.internal.liveeditor.openAndConvert(mPath, mlxPath);
        disp('Live Script created');
      catch
        disp('Live Script creation not available');
      end
    `);

    // Now try to export it
    const exportedHtml = await Matlab.exportLiveScript(testMlxPath, 'html');
    console.log(`Exported via API: ${exportedHtml}`);
  } catch (_error) {
    console.log('⚠️ exportLiveScript requires .mlx file and MATLAB Live Editor support');
    console.log('   This is normal if running headless or without full MATLAB installation');
  }
  console.log();

  // Example 7: Publish options summary
  console.log('7️⃣ Publish Options Reference');
  console.log('─'.repeat(40));

  console.log(`
Available formats:
  - html:  Web page with embedded images
  - pdf:   PDF document (requires LaTeX)
  - latex: LaTeX source file
  - doc:   Microsoft Word document
  - ppt:   PowerPoint presentation
  - xml:   XML format

Key options:
  - showCode:     Include MATLAB code (true/false)
  - evalCode:     Execute code and show output (true/false)
  - outputDir:    Directory for output files
  - imageFormat:  'png', 'jpg', 'bmp', 'eps'
  - maxHeight:    Max image height in pixels
  - maxWidth:     Max image width in pixels
  - useNewFigure: Create new figure for each plot

Example usage:
  opts = struct();
  opts.format = 'html';
  opts.showCode = true;
  opts.evalCode = true;
  opts.imageFormat = 'png';
  publish('script.m', opts);
`);

  console.log(`📁 Output files saved to: ${outputDir}`);
  console.log('✅ Live Script export examples completed!');
}

main();
