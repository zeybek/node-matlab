/**
 * Converter utility tests
 */

import { describe, expect, it } from 'vitest';
import {
  convertToMatlab,
  createVariableInfo,
  generateSetVariablesCode,
  inferMatlabType,
  isMatlabKeyword,
  isValidMatlabName,
  parseComplexNumber,
  toMatlabCode,
} from '../src/utils/converter.js';

describe('Converter Utilities', () => {
  describe('convertToMatlab', () => {
    it('should convert null/undefined to empty array', () => {
      expect(convertToMatlab(null)).toBe('[]');
      expect(convertToMatlab(undefined)).toBe('[]');
    });

    it('should convert booleans', () => {
      expect(convertToMatlab(true)).toBe('true');
      expect(convertToMatlab(false)).toBe('false');
    });

    it('should convert numbers', () => {
      expect(convertToMatlab(42)).toBe('42');
      expect(convertToMatlab(Math.PI)).toBe(String(Math.PI));
      expect(convertToMatlab(Number.POSITIVE_INFINITY)).toBe('Inf');
      expect(convertToMatlab(Number.NEGATIVE_INFINITY)).toBe('-Inf');
      expect(convertToMatlab(Number.NaN)).toBe('NaN');
    });

    it('should convert strings', () => {
      expect(convertToMatlab('hello')).toBe("'hello'");
      expect(convertToMatlab("it's a test")).toBe("'it''s a test'");
    });

    it('should convert 1D arrays', () => {
      expect(convertToMatlab([1, 2, 3])).toBe('[1, 2, 3]');
    });

    it('should convert 2D arrays as matrices', () => {
      expect(
        convertToMatlab([
          [1, 2],
          [3, 4],
        ])
      ).toBe('[1, 2; 3, 4]');
    });

    it('should convert string arrays as cell arrays', () => {
      expect(convertToMatlab(['a', 'b', 'c'])).toBe("{'a', 'b', 'c'}");
    });

    it('should convert Date objects', () => {
      const date = new Date(2024, 0, 15, 10, 30, 0);
      expect(convertToMatlab(date)).toBe('datetime(2024, 1, 15, 10, 30, 0)');
    });

    it('should convert objects as structs', () => {
      expect(convertToMatlab({ x: 1, y: 2 })).toBe("struct('x', 1, 'y', 2)");
    });
  });

  describe('toMatlabCode', () => {
    it('should generate assignment code', () => {
      expect(toMatlabCode(42, 'x')).toBe('x = 42;');
      expect(toMatlabCode([1, 2, 3], 'arr')).toBe('arr = [1, 2, 3];');
    });

    it('should return just value without variable name', () => {
      expect(toMatlabCode(42)).toBe('42');
    });
  });

  describe('generateSetVariablesCode', () => {
    it('should generate multiple variable assignments', () => {
      const code = generateSetVariablesCode({ x: 1, y: 2, name: 'test' });
      expect(code).toContain('x = 1;');
      expect(code).toContain('y = 2;');
      expect(code).toContain("name = 'test';");
    });
  });

  describe('inferMatlabType', () => {
    it('should infer double for numbers', () => {
      expect(inferMatlabType(42)).toBe('double');
      expect(inferMatlabType(3.14)).toBe('double');
    });

    it('should infer logical for booleans', () => {
      expect(inferMatlabType(true)).toBe('logical');
    });

    it('should infer char for strings', () => {
      expect(inferMatlabType('hello')).toBe('char');
    });

    it('should infer double for numeric arrays', () => {
      expect(inferMatlabType([1, 2, 3])).toBe('double');
    });

    it('should infer cell for string arrays', () => {
      expect(inferMatlabType(['a', 'b'])).toBe('cell');
    });

    it('should infer struct for objects', () => {
      expect(inferMatlabType({ x: 1 })).toBe('struct');
    });

    it('should infer datetime for Date', () => {
      expect(inferMatlabType(new Date())).toBe('datetime');
    });
  });

  describe('createVariableInfo', () => {
    it('should create info for scalar', () => {
      const info = createVariableInfo('x', 42);
      expect(info.name).toBe('x');
      expect(info.size).toEqual([1, 1]);
      expect(info.type).toBe('double');
    });

    it('should create info for array', () => {
      const info = createVariableInfo('arr', [1, 2, 3]);
      expect(info.size).toEqual([1, 3]);
    });

    it('should create info for matrix', () => {
      const info = createVariableInfo('mat', [
        [1, 2],
        [3, 4],
      ]);
      expect(info.size).toEqual([2, 2]);
    });
  });

  describe('parseComplexNumber', () => {
    it('should parse complex numbers', () => {
      expect(parseComplexNumber('3+4i')).toEqual({ real: 3, imag: 4 });
      expect(parseComplexNumber('3-4i')).toEqual({ real: 3, imag: -4 });
    });

    it('should parse pure imaginary', () => {
      expect(parseComplexNumber('4i')).toEqual({ real: 0, imag: 4 });
    });

    it('should return null for real numbers', () => {
      expect(parseComplexNumber('42')).toBeNull();
    });
  });

  describe('isValidMatlabName', () => {
    it('should accept valid names', () => {
      expect(isValidMatlabName('x')).toBe(true);
      expect(isValidMatlabName('myVariable')).toBe(true);
      expect(isValidMatlabName('var_123')).toBe(true);
    });

    it('should reject invalid names', () => {
      expect(isValidMatlabName('123abc')).toBe(false);
      expect(isValidMatlabName('my-var')).toBe(false);
      expect(isValidMatlabName('')).toBe(false);
    });
  });

  describe('isMatlabKeyword', () => {
    it('should identify keywords', () => {
      expect(isMatlabKeyword('if')).toBe(true);
      expect(isMatlabKeyword('for')).toBe(true);
      expect(isMatlabKeyword('function')).toBe(true);
    });

    it('should not flag non-keywords', () => {
      expect(isMatlabKeyword('myVar')).toBe(false);
    });
  });
});
