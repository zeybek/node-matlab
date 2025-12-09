/**
 * Version utility tests
 */

import { describe, expect, it } from 'vitest';
import {
  isVersionSupported,
  parseNumericVersion,
  parseToolboxList,
  parseVersionString,
} from '../src/utils/version.js';

describe('Version Utilities', () => {
  describe('parseVersionString', () => {
    it('should parse full version string with release name', () => {
      const result = parseVersionString('9.14.0.2254940 (R2023a)');
      expect(result).not.toBeNull();
      expect(result?.version).toBe('9.14.0.2254940');
      expect(result?.release).toBe('R2023a');
    });

    it('should parse version with different release formats', () => {
      const r2022b = parseVersionString('9.13.0 (R2022b)');
      expect(r2022b?.release).toBe('R2022b');

      const r2019a = parseVersionString('9.6.0 (R2019a)');
      expect(r2019a?.release).toBe('R2019a');
    });

    it('should handle Version: prefix format', () => {
      const result = parseVersionString('MATLAB Version: 9.14\nR2023a');
      expect(result).not.toBeNull();
      expect(result?.version).toBe('9.14');
    });

    it('should return null for invalid input', () => {
      expect(parseVersionString('')).toBeNull();
      expect(parseVersionString('invalid')).toBeNull();
      expect(parseVersionString('abc.def')).toBeNull();
    });

    it('should handle version without release name', () => {
      const result = parseVersionString('Version: 9.14.0');
      expect(result?.version).toBe('9.14.0');
      expect(result?.release).toBe('Unknown');
    });
  });

  describe('parseNumericVersion', () => {
    it('should parse simple version', () => {
      expect(parseNumericVersion('9.14')).toBe(9.14);
    });

    it('should parse version with patch', () => {
      expect(parseNumericVersion('9.14.0')).toBe(9.14);
    });

    it('should handle single digit version', () => {
      expect(parseNumericVersion('9')).toBe(0); // Invalid format
    });

    it('should handle empty string', () => {
      expect(parseNumericVersion('')).toBe(0);
    });
  });

  describe('isVersionSupported', () => {
    it('should accept versions >= R2019a (9.6)', () => {
      expect(isVersionSupported({ version: '9.6', release: 'R2019a' })).toBe(true);
      expect(isVersionSupported({ version: '9.14', release: 'R2023a' })).toBe(true);
      expect(isVersionSupported({ version: '10.0', release: 'R2024a' })).toBe(true);
    });

    it('should reject versions < R2019a (9.6)', () => {
      expect(isVersionSupported({ version: '9.5', release: 'R2018b' })).toBe(false);
      expect(isVersionSupported({ version: '8.0', release: 'R2016a' })).toBe(false);
    });

    it('should handle edge case at minimum version', () => {
      // Exactly at minimum
      expect(isVersionSupported({ version: '9.06', release: 'R2019a' })).toBe(true);
      // Just below minimum
      expect(isVersionSupported({ version: '9.05', release: 'R2018b' })).toBe(false);
    });
  });

  describe('parseToolboxList', () => {
    it('should parse toolbox list from ver output', () => {
      const output = `
MATLAB                                                Version 9.14
Signal Processing Toolbox                             Version 9.2
Image Processing Toolbox                              Version 11.7
      `;

      const toolboxes = parseToolboxList(output);
      expect(toolboxes).toHaveLength(3);
      expect(toolboxes[0]).toEqual({ name: 'MATLAB', version: '9.14' });
      expect(toolboxes[1]).toEqual({ name: 'Signal Processing Toolbox', version: '9.2' });
      expect(toolboxes[2]).toEqual({ name: 'Image Processing Toolbox', version: '11.7' });
    });

    it('should handle empty output', () => {
      expect(parseToolboxList('')).toEqual([]);
    });

    it('should ignore invalid lines', () => {
      const output = `
Some random text
MATLAB                                                Version 9.14
More random text without version
      `;

      const toolboxes = parseToolboxList(output);
      expect(toolboxes).toHaveLength(1);
      expect(toolboxes[0]?.name).toBe('MATLAB');
    });

    it('should handle multi-digit versions', () => {
      const output = 'Deep Learning Toolbox                                 Version 14.6.0.1';
      const toolboxes = parseToolboxList(output);
      expect(toolboxes).toHaveLength(1);
      expect(toolboxes[0]?.version).toBe('14.6.0.1');
    });
  });
});
