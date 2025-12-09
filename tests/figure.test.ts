/**
 * Figure utility tests
 */

import { describe, expect, it } from 'vitest';
import {
  DEFAULT_FIGURE_OPTIONS,
  generateSaveAllFiguresCode,
  generateSaveFigureCode,
  getExtension,
  getFigureSizePreset,
  getPrintDevice,
  isVectorFormat,
  validateOutputPath,
} from '../src/utils/figure.js';

describe('Figure Utilities', () => {
  describe('getExtension', () => {
    it('should return correct extensions', () => {
      expect(getExtension('png')).toBe('.png');
      expect(getExtension('svg')).toBe('.svg');
      expect(getExtension('pdf')).toBe('.pdf');
      expect(getExtension('eps')).toBe('.eps');
      expect(getExtension('jpg')).toBe('.jpg');
      expect(getExtension('fig')).toBe('.fig');
    });
  });

  describe('getPrintDevice', () => {
    it('should return correct print devices', () => {
      expect(getPrintDevice('png')).toBe('-dpng');
      expect(getPrintDevice('svg')).toBe('-dsvg');
      expect(getPrintDevice('pdf')).toBe('-dpdf');
      expect(getPrintDevice('eps')).toBe('-depsc');
      expect(getPrintDevice('jpg')).toBe('-djpeg');
      expect(getPrintDevice('fig')).toBe('');
    });
  });

  describe('isVectorFormat', () => {
    it('should identify vector formats', () => {
      expect(isVectorFormat('svg')).toBe(true);
      expect(isVectorFormat('pdf')).toBe(true);
      expect(isVectorFormat('eps')).toBe(true);
    });

    it('should identify raster formats', () => {
      expect(isVectorFormat('png')).toBe(false);
      expect(isVectorFormat('jpg')).toBe(false);
    });
  });

  describe('generateSaveFigureCode', () => {
    it('should generate PNG save code', () => {
      const code = generateSaveFigureCode('/path/to/output', { format: 'png' });
      expect(code).toContain('exportgraphics');
      expect(code).toContain('/path/to/output.png');
      expect(code).toContain('Resolution');
    });

    it('should generate SVG save code with vector content type', () => {
      const code = generateSaveFigureCode('/path/to/output', { format: 'svg' });
      expect(code).toContain('exportgraphics');
      expect(code).toContain('/path/to/output.svg');
      expect(code).toContain("ContentType', 'vector");
    });

    it('should use saveas for .fig files', () => {
      const code = generateSaveFigureCode('/path/to/output', { format: 'fig' });
      expect(code).toContain('saveas');
      expect(code).toContain('/path/to/output.fig');
    });

    it('should set figure size', () => {
      const code = generateSaveFigureCode('/path/to/output', {
        format: 'png',
        width: 1024,
        height: 768,
      });
      expect(code).toContain('set(gcf');
      expect(code).toContain('1024');
      expect(code).toContain('768');
    });

    it('should handle transparent background', () => {
      const code = generateSaveFigureCode('/path/to/output', {
        format: 'png',
        backgroundColor: 'transparent',
      });
      expect(code).toContain("'Color', 'none'");
    });
  });

  describe('generateSaveAllFiguresCode', () => {
    it('should generate code to save all figures', () => {
      const code = generateSaveAllFiguresCode('/output/dir', 'fig', { format: 'png' });
      expect(code).toContain('findall(0');
      expect(code).toContain("'Type', 'figure'");
      expect(code).toContain('/output/dir');
      expect(code).toContain('fig_%d.png');
    });
  });

  describe('getFigureSizePreset', () => {
    it('should return correct presets', () => {
      expect(getFigureSizePreset('small')).toEqual({ width: 400, height: 300 });
      expect(getFigureSizePreset('medium')).toEqual({ width: 800, height: 600 });
      expect(getFigureSizePreset('large')).toEqual({ width: 1200, height: 900 });
      expect(getFigureSizePreset('widescreen')).toEqual({ width: 1920, height: 1080 });
      expect(getFigureSizePreset('square')).toEqual({ width: 600, height: 600 });
    });
  });

  describe('validateOutputPath', () => {
    it('should add extension if missing', () => {
      expect(validateOutputPath('/path/to/file', 'png')).toBe('/path/to/file.png');
    });

    it('should not duplicate extension', () => {
      expect(validateOutputPath('/path/to/file.png', 'png')).toBe('/path/to/file.png');
    });

    it('should handle different formats', () => {
      expect(validateOutputPath('/path/to/file', 'svg')).toBe('/path/to/file.svg');
      expect(validateOutputPath('/path/to/file.svg', 'svg')).toBe('/path/to/file.svg');
    });
  });

  describe('DEFAULT_FIGURE_OPTIONS', () => {
    it('should have all required properties', () => {
      expect(DEFAULT_FIGURE_OPTIONS.format).toBe('png');
      expect(DEFAULT_FIGURE_OPTIONS.resolution).toBe(300);
      expect(DEFAULT_FIGURE_OPTIONS.width).toBe(800);
      expect(DEFAULT_FIGURE_OPTIONS.height).toBe(600);
      expect(DEFAULT_FIGURE_OPTIONS.backgroundColor).toBe('white');
    });
  });
});
