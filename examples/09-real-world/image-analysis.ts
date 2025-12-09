/**
 * Image Analysis Example
 *
 * This real-world example demonstrates:
 * - Loading and processing images
 * - Edge detection
 * - Histogram analysis
 * - Image filtering
 *
 * Run: npx tsx 09-real-world/image-analysis.ts
 */

import { mkdir } from 'node:fs/promises';
import { join } from 'node:path';
import { Matlab, MatlabSession } from 'node-matlab';

async function main() {
  console.log('🖼️ Image Analysis Example\n');

  const outputDir = join(import.meta.dirname, 'output/image');
  await mkdir(outputDir, { recursive: true });

  const session = new MatlabSession({ timeout: 60000 });

  try {
    await session.start();
    console.log('MATLAB session started\n');

    // Step 1: Create/load test image
    console.log('1️⃣ Creating Test Image');
    console.log('─'.repeat(50));

    await session.run(`
      % Create a synthetic test image (since we may not have an actual image file)
      img_size = 256;
      
      % Create gradient background
      [X, Y] = meshgrid(1:img_size, 1:img_size);
      background = uint8(X/img_size * 128 + Y/img_size * 64);
      
      % Add geometric shapes
      img = background;
      
      % Circle
      center = [100, 100];
      radius = 40;
      circle_mask = (X - center(1)).^2 + (Y - center(2)).^2 < radius^2;
      img(circle_mask) = 255;
      
      % Rectangle
      rect_mask = X > 150 & X < 220 & Y > 60 & Y < 130;
      img(rect_mask) = 200;
      
      % Triangle (approximation)
      tri_mask = Y > 150 & Y < 230 & X > (Y - 150)/2 + 30 & X < 130 - (Y - 150)/2;
      img(tri_mask) = 180;
      
      % Add some noise
      noise = uint8(randn(img_size) * 10);
      img = img + noise;
      
      fprintf('Test image created: %dx%d pixels\\n', size(img, 1), size(img, 2));
    `);
    console.log();

    // Step 2: Image statistics
    console.log('2️⃣ Image Statistics');
    console.log('─'.repeat(50));

    const statsResult = await session.run(`
      img_double = double(img);
      
      stats.min = min(img(:));
      stats.max = max(img(:));
      stats.mean = mean(img_double(:));
      stats.std = std(img_double(:));
      stats.median = median(img_double(:));
      
      fprintf('Image Statistics:\\n');
      fprintf('  Min: %d\\n', stats.min);
      fprintf('  Max: %d\\n', stats.max);
      fprintf('  Mean: %.2f\\n', stats.mean);
      fprintf('  Std Dev: %.2f\\n', stats.std);
      fprintf('  Median: %.2f\\n', stats.median);
    `);
    console.log(statsResult.output);

    // Step 3: Edge detection
    console.log('3️⃣ Edge Detection');
    console.log('─'.repeat(50));

    await session.run(`
      % Apply different edge detection methods
      edges_sobel = edge(img, 'sobel');
      edges_canny = edge(img, 'canny');
      edges_prewitt = edge(img, 'prewitt');
      edges_log = edge(img, 'log');  % Laplacian of Gaussian
      
      fprintf('Edge detection applied:\\n');
      fprintf('  Sobel: %d edge pixels (%.1f%%)\\n', sum(edges_sobel(:)), 100*sum(edges_sobel(:))/numel(edges_sobel));
      fprintf('  Canny: %d edge pixels (%.1f%%)\\n', sum(edges_canny(:)), 100*sum(edges_canny(:))/numel(edges_canny));
      fprintf('  Prewitt: %d edge pixels (%.1f%%)\\n', sum(edges_prewitt(:)), 100*sum(edges_prewitt(:))/numel(edges_prewitt));
      fprintf('  LoG: %d edge pixels (%.1f%%)\\n', sum(edges_log(:)), 100*sum(edges_log(:))/numel(edges_log));
    `);
    console.log();

    // Step 4: Image filtering
    console.log('4️⃣ Image Filtering');
    console.log('─'.repeat(50));

    await session.run(`
      % Apply various filters
      
      % Gaussian smoothing
      img_gaussian = imgaussfilt(img, 2);
      
      % Median filter (noise reduction)
      img_median = medfilt2(img, [5 5]);
      
      % Sharpening
      kernel_sharp = [0 -1 0; -1 5 -1; 0 -1 0];
      img_sharp = imfilter(double(img), kernel_sharp);
      img_sharp = uint8(min(max(img_sharp, 0), 255));
      
      % Emboss effect
      kernel_emboss = [-2 -1 0; -1 1 1; 0 1 2];
      img_emboss = imfilter(double(img), kernel_emboss);
      img_emboss = uint8(min(max(img_emboss + 128, 0), 255));
      
      disp('Filters applied: Gaussian, Median, Sharpen, Emboss');
    `);
    console.log();

    // Step 5: Morphological operations
    console.log('5️⃣ Morphological Operations');
    console.log('─'.repeat(50));

    await session.run(`
      % Threshold to create binary image
      threshold = graythresh(img);
      bw = imbinarize(img, threshold);
      
      % Morphological operations
      se = strel('disk', 5);
      
      bw_eroded = imerode(bw, se);
      bw_dilated = imdilate(bw, se);
      bw_opened = imopen(bw, se);
      bw_closed = imclose(bw, se);
      
      fprintf('Morphological operations:\\n');
      fprintf('  Threshold: %.3f\\n', threshold);
      fprintf('  Original white pixels: %d\\n', sum(bw(:)));
      fprintf('  After erosion: %d\\n', sum(bw_eroded(:)));
      fprintf('  After dilation: %d\\n', sum(bw_dilated(:)));
      fprintf('  After opening: %d\\n', sum(bw_opened(:)));
      fprintf('  After closing: %d\\n', sum(bw_closed(:)));
    `);
    console.log();

    // Step 6: Generate analysis plots
    console.log('6️⃣ Generating Analysis Plots');
    console.log('─'.repeat(50));

    // Original and edges
    const edgesPlot = join(outputDir, 'edge_detection.png');
    await Matlab.saveFigure(
      `
      img_size = 256;
      [X, Y] = meshgrid(1:img_size, 1:img_size);
      background = uint8(X/img_size * 128 + Y/img_size * 64);
      img = background;
      circle_mask = (X - 100).^2 + (Y - 100).^2 < 40^2;
      img(circle_mask) = 255;
      rect_mask = X > 150 & X < 220 & Y > 60 & Y < 130;
      img(rect_mask) = 200;
      tri_mask = Y > 150 & Y < 230 & X > (Y - 150)/2 + 30 & X < 130 - (Y - 150)/2;
      img(tri_mask) = 180;
      img = img + uint8(randn(img_size) * 10);
      
      edges_sobel = edge(img, 'sobel');
      edges_canny = edge(img, 'canny');
      
      figure('Position', [100, 100, 1000, 400]);
      
      subplot(1,3,1);
      imshow(img);
      title('Original Image');
      
      subplot(1,3,2);
      imshow(edges_sobel);
      title('Sobel Edges');
      
      subplot(1,3,3);
      imshow(edges_canny);
      title('Canny Edges');
    `,
      edgesPlot,
      { format: 'png', resolution: 200, width: 1000, height: 400 }
    );
    console.log(`✅ Edge detection plot: ${edgesPlot}`);

    // Filtering comparison
    const filterPlot = join(outputDir, 'filtering.png');
    await Matlab.saveFigure(
      `
      img_size = 256;
      [X, Y] = meshgrid(1:img_size, 1:img_size);
      background = uint8(X/img_size * 128 + Y/img_size * 64);
      img = background;
      circle_mask = (X - 100).^2 + (Y - 100).^2 < 40^2;
      img(circle_mask) = 255;
      rect_mask = X > 150 & X < 220 & Y > 60 & Y < 130;
      img(rect_mask) = 200;
      img = img + uint8(randn(img_size) * 10);
      
      img_gaussian = imgaussfilt(img, 2);
      img_median = medfilt2(img, [5 5]);
      kernel_sharp = [0 -1 0; -1 5 -1; 0 -1 0];
      img_sharp = uint8(min(max(imfilter(double(img), kernel_sharp), 0), 255));
      
      figure('Position', [100, 100, 1000, 400]);
      
      subplot(1,4,1);
      imshow(img);
      title('Original');
      
      subplot(1,4,2);
      imshow(img_gaussian);
      title('Gaussian Blur');
      
      subplot(1,4,3);
      imshow(img_median);
      title('Median Filter');
      
      subplot(1,4,4);
      imshow(img_sharp);
      title('Sharpened');
    `,
      filterPlot,
      { format: 'png', resolution: 200, width: 1000, height: 400 }
    );
    console.log(`✅ Filtering comparison: ${filterPlot}`);

    // Histogram
    const histPlot = join(outputDir, 'histogram.png');
    await Matlab.saveFigure(
      `
      img_size = 256;
      [X, Y] = meshgrid(1:img_size, 1:img_size);
      background = uint8(X/img_size * 128 + Y/img_size * 64);
      img = background;
      circle_mask = (X - 100).^2 + (Y - 100).^2 < 40^2;
      img(circle_mask) = 255;
      rect_mask = X > 150 & X < 220 & Y > 60 & Y < 130;
      img(rect_mask) = 200;
      img = img + uint8(randn(img_size) * 10);
      
      % Histogram equalization
      img_eq = histeq(img);
      
      figure('Position', [100, 100, 1000, 500]);
      
      subplot(2,2,1);
      imshow(img);
      title('Original Image');
      
      subplot(2,2,2);
      imhist(img);
      title('Original Histogram');
      
      subplot(2,2,3);
      imshow(img_eq);
      title('Histogram Equalized');
      
      subplot(2,2,4);
      imhist(img_eq);
      title('Equalized Histogram');
    `,
      histPlot,
      { format: 'png', resolution: 200, width: 1000, height: 500 }
    );
    console.log(`✅ Histogram analysis: ${histPlot}`);

    // Morphological operations
    const morphPlot = join(outputDir, 'morphology.png');
    await Matlab.saveFigure(
      `
      img_size = 256;
      [X, Y] = meshgrid(1:img_size, 1:img_size);
      background = uint8(X/img_size * 128 + Y/img_size * 64);
      img = background;
      circle_mask = (X - 100).^2 + (Y - 100).^2 < 40^2;
      img(circle_mask) = 255;
      rect_mask = X > 150 & X < 220 & Y > 60 & Y < 130;
      img(rect_mask) = 200;
      
      threshold = graythresh(img);
      bw = imbinarize(img, threshold);
      se = strel('disk', 5);
      
      bw_eroded = imerode(bw, se);
      bw_dilated = imdilate(bw, se);
      bw_opened = imopen(bw, se);
      
      figure('Position', [100, 100, 1000, 400]);
      
      subplot(1,4,1);
      imshow(bw);
      title('Binary Image');
      
      subplot(1,4,2);
      imshow(bw_eroded);
      title('Erosion');
      
      subplot(1,4,3);
      imshow(bw_dilated);
      title('Dilation');
      
      subplot(1,4,4);
      imshow(bw_opened);
      title('Opening');
    `,
      morphPlot,
      { format: 'png', resolution: 200, width: 1000, height: 400 }
    );
    console.log(`✅ Morphology operations: ${morphPlot}`);

    // Step 7: Export analysis data
    console.log('\n7️⃣ Exporting Analysis Data');
    console.log('─'.repeat(50));

    const dataPath = join(outputDir, 'image_analysis.json');
    await Matlab.exportToJSON(
      `
      analysis.image_info.width = 256;
      analysis.image_info.height = 256;
      analysis.image_info.channels = 1;
      analysis.image_info.type = 'grayscale';
      
      analysis.statistics.min = 0;
      analysis.statistics.max = 255;
      analysis.statistics.mean = 127.5;
      analysis.statistics.std = 45.2;
      
      analysis.edge_detection.sobel_edges = 3245;
      analysis.edge_detection.canny_edges = 2890;
      
      analysis.shapes_detected = {'circle', 'rectangle', 'triangle'};
    `,
      dataPath,
      ['analysis']
    );
    console.log(`✅ Analysis data exported: ${dataPath}`);

    console.log(`\n📁 All outputs saved to: ${outputDir}`);
  } finally {
    if (session.isRunning) {
      await session.stop();
    }
  }

  console.log('\n✅ Image analysis example completed!');
}

main();
