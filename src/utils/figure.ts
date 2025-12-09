/**
 * MATLAB figure/graphics utilities
 * @packageDocumentation
 */

import type { FigureOptions, ImageFormat } from '../types.js';

/**
 * Default figure options
 */
export const DEFAULT_FIGURE_OPTIONS: Required<FigureOptions> = {
  format: 'png',
  resolution: 300,
  width: 800,
  height: 600,
  backgroundColor: 'white',
  contentType: 'auto',
};

/**
 * Get file extension for image format
 */
export function getExtension(format: ImageFormat): string {
  const extensions: Record<ImageFormat, string> = {
    png: '.png',
    svg: '.svg',
    pdf: '.pdf',
    eps: '.eps',
    jpg: '.jpg',
    fig: '.fig',
  };
  return extensions[format];
}

/**
 * Get MATLAB print device flag for format
 */
export function getPrintDevice(format: ImageFormat): string {
  const devices: Record<ImageFormat, string> = {
    png: '-dpng',
    svg: '-dsvg',
    pdf: '-dpdf',
    eps: '-depsc',
    jpg: '-djpeg',
    fig: '', // Use saveas for .fig files
  };
  return devices[format];
}

/**
 * Check if format supports vector graphics
 */
export function isVectorFormat(format: ImageFormat): boolean {
  return ['svg', 'pdf', 'eps'].includes(format);
}

/**
 * Generate MATLAB code to save current figure
 */
export function generateSaveFigureCode(
  outputPath: string,
  options?: Partial<FigureOptions>
): string {
  const opts = { ...DEFAULT_FIGURE_OPTIONS, ...options };
  const format = opts.format;

  // Ensure output path has correct extension
  let finalPath = outputPath;
  const ext = getExtension(format);
  if (!finalPath.toLowerCase().endsWith(ext)) {
    finalPath += ext;
  }

  const lines: string[] = [];

  // Set figure size if specified
  if (opts.width && opts.height) {
    lines.push(`set(gcf, 'Position', [100, 100, ${opts.width}, ${opts.height}]);`);
  }

  // Set background color
  if (opts.backgroundColor === 'transparent' || opts.backgroundColor === 'none') {
    lines.push(`set(gcf, 'Color', 'none');`);
    lines.push(`set(gca, 'Color', 'none');`);
  } else if (opts.backgroundColor === 'white') {
    lines.push(`set(gcf, 'Color', 'white');`);
  }

  // Use appropriate save method based on format
  if (format === 'fig') {
    lines.push(`saveas(gcf, '${escapePath(finalPath)}');`);
  } else if (isVectorFormat(format)) {
    // Use exportgraphics for vector formats (R2020a+)
    const contentType = opts.contentType === 'auto' ? 'vector' : opts.contentType;
    lines.push(
      `try`,
      `    exportgraphics(gcf, '${escapePath(finalPath)}', 'ContentType', '${contentType}');`,
      `catch`,
      `    print(gcf, '${escapePath(finalPath)}', '${getPrintDevice(format)}');`,
      `end`
    );
  } else {
    // Raster formats (png, jpg)
    lines.push(
      `try`,
      `    exportgraphics(gcf, '${escapePath(finalPath)}', 'Resolution', ${opts.resolution});`,
      `catch`,
      `    print(gcf, '${escapePath(finalPath)}', '${getPrintDevice(format)}', '-r${opts.resolution}');`,
      `end`
    );
  }

  return lines.join('\n');
}

/**
 * Generate MATLAB code to save all open figures
 */
export function generateSaveAllFiguresCode(
  outputDir: string,
  prefix = 'figure',
  options?: Partial<FigureOptions>
): string {
  const opts = { ...DEFAULT_FIGURE_OPTIONS, ...options };
  const ext = getExtension(opts.format);

  const lines = [
    `__nm_figs__ = findall(0, 'Type', 'figure');`,
    `for __nm_i__ = 1:length(__nm_figs__)`,
    `    __nm_fig__ = __nm_figs__(__nm_i__);`,
    `    __nm_filename__ = fullfile('${escapePath(outputDir)}', sprintf('${prefix}_%d${ext}', __nm_fig__.Number));`,
    `    figure(__nm_fig__);`,
  ];

  // Set figure properties
  if (opts.width && opts.height) {
    lines.push(`    set(__nm_fig__, 'Position', [100, 100, ${opts.width}, ${opts.height}]);`);
  }

  if (opts.backgroundColor === 'transparent' || opts.backgroundColor === 'none') {
    lines.push(`    set(__nm_fig__, 'Color', 'none');`);
  } else if (opts.backgroundColor === 'white') {
    lines.push(`    set(__nm_fig__, 'Color', 'white');`);
  }

  // Save based on format
  if (opts.format === 'fig') {
    lines.push(`    saveas(__nm_fig__, __nm_filename__);`);
  } else if (isVectorFormat(opts.format)) {
    lines.push(
      `    try`,
      `        exportgraphics(__nm_fig__, __nm_filename__, 'ContentType', 'vector');`,
      `    catch`,
      `        print(__nm_fig__, __nm_filename__, '${getPrintDevice(opts.format)}');`,
      `    end`
    );
  } else {
    lines.push(
      `    try`,
      `        exportgraphics(__nm_fig__, __nm_filename__, 'Resolution', ${opts.resolution});`,
      `    catch`,
      `        print(__nm_fig__, __nm_filename__, '${getPrintDevice(opts.format)}', '-r${opts.resolution}');`,
      `    end`
    );
  }

  lines.push(`end`);
  lines.push(`clear __nm_figs__ __nm_i__ __nm_fig__ __nm_filename__;`);

  return lines.join('\n');
}

/**
 * Generate MATLAB code to get figure count
 */
export function generateFigureCountCode(): string {
  return `length(findall(0, 'Type', 'figure'))`;
}

/**
 * Generate MATLAB code to close all figures
 */
export function generateCloseAllFiguresCode(): string {
  return `close all;`;
}

/**
 * Escape path for use in MATLAB string
 */
function escapePath(path: string): string {
  // Escape single quotes and backslashes
  return path.replace(/\\/g, '/').replace(/'/g, "''");
}

/**
 * Generate MATLAB code for figure size preset
 */
export function getFigureSizePreset(
  preset: 'small' | 'medium' | 'large' | 'widescreen' | 'square'
): { width: number; height: number } {
  const presets = {
    small: { width: 400, height: 300 },
    medium: { width: 800, height: 600 },
    large: { width: 1200, height: 900 },
    widescreen: { width: 1920, height: 1080 },
    square: { width: 600, height: 600 },
  } as const;

  return presets[preset];
}

/**
 * Validate output path for figure
 */
export function validateOutputPath(path: string, format: ImageFormat): string {
  const ext = getExtension(format);

  // Ensure path has correct extension
  if (!path.toLowerCase().endsWith(ext)) {
    return path + ext;
  }

  return path;
}
