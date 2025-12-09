/**
 * Parser utility tests
 */

import { describe, expect, it } from 'vitest';
import { JSON_END_MARKER, JSON_START_MARKER } from '../src/types.js';
import {
  detectOutputType,
  extractJSON,
  generateJSONExtractionCode,
  jsToMatlabValue,
  parseArrayString,
  parseLogical,
  parseMatrixOutput,
  parseScalar,
  parseString,
  removeJSONMarkers,
} from '../src/utils/parser.js';

describe('Parser Utilities', () => {
  describe('extractJSON', () => {
    it('should extract JSON from marked output', () => {
      const output = `Some text ${JSON_START_MARKER}{"x":1,"y":2}${JSON_END_MARKER} more text`;
      const result = extractJSON<{ x: number; y: number }>(output);
      expect(result).toEqual({ x: 1, y: 2 });
    });

    it('should return null for missing markers', () => {
      const output = 'No JSON here';
      expect(extractJSON(output)).toBeNull();
    });

    it('should return null for invalid JSON', () => {
      const output = `${JSON_START_MARKER}invalid json${JSON_END_MARKER}`;
      expect(extractJSON(output)).toBeNull();
    });
  });

  describe('removeJSONMarkers', () => {
    it('should remove JSON markers from output', () => {
      const output = `Text ${JSON_START_MARKER}{"x":1}${JSON_END_MARKER} more`;
      const result = removeJSONMarkers(output);
      expect(result).toBe('Text  more');
    });

    it('should return original if no markers', () => {
      const output = 'No markers';
      expect(removeJSONMarkers(output)).toBe(output);
    });
  });

  describe('parseArrayString', () => {
    it('should parse space-separated numbers', () => {
      expect(parseArrayString('1 2 3 4 5')).toEqual([1, 2, 3, 4, 5]);
    });

    it('should handle multiple spaces', () => {
      expect(parseArrayString('1  2   3')).toEqual([1, 2, 3]);
    });

    it('should handle floating point numbers', () => {
      expect(parseArrayString('1.5 2.5 3.5')).toEqual([1.5, 2.5, 3.5]);
    });

    it('should handle empty string', () => {
      expect(parseArrayString('')).toEqual([]);
    });
  });

  describe('parseMatrixOutput', () => {
    it('should parse multi-line matrix', () => {
      const output = '1 2 3\n4 5 6\n7 8 9';
      expect(parseMatrixOutput(output)).toEqual([
        [1, 2, 3],
        [4, 5, 6],
        [7, 8, 9],
      ]);
    });

    it('should handle empty lines', () => {
      const output = '1 2\n\n3 4';
      expect(parseMatrixOutput(output)).toEqual([
        [1, 2],
        [3, 4],
      ]);
    });
  });

  describe('parseScalar', () => {
    it('should parse integers', () => {
      expect(parseScalar('42')).toBe(42);
    });

    it('should parse floats', () => {
      expect(parseScalar('3.14159')).toBe(3.14159);
    });

    it('should parse scientific notation', () => {
      expect(parseScalar('1.23e-4')).toBe(1.23e-4);
    });

    it('should handle Inf', () => {
      expect(parseScalar('Inf')).toBe(Number.POSITIVE_INFINITY);
      expect(parseScalar('-Inf')).toBe(Number.NEGATIVE_INFINITY);
    });

    it('should handle NaN', () => {
      expect(parseScalar('NaN')).toBeNaN();
    });

    it('should return null for non-numeric', () => {
      expect(parseScalar('abc')).toBeNull();
    });
  });

  describe('parseString', () => {
    it('should remove single quotes', () => {
      expect(parseString("'hello'")).toBe('hello');
    });

    it('should remove double quotes', () => {
      expect(parseString('"hello"')).toBe('hello');
    });

    it('should return trimmed string without quotes', () => {
      expect(parseString('  hello  ')).toBe('hello');
    });
  });

  describe('parseLogical', () => {
    it('should parse 1 as true', () => {
      expect(parseLogical('1')).toBe(true);
    });

    it('should parse 0 as false', () => {
      expect(parseLogical('0')).toBe(false);
    });

    it('should parse true/false strings', () => {
      expect(parseLogical('true')).toBe(true);
      expect(parseLogical('false')).toBe(false);
    });

    it('should return null for invalid', () => {
      expect(parseLogical('maybe')).toBeNull();
    });
  });

  describe('detectOutputType', () => {
    it('should detect scalar', () => {
      expect(detectOutputType('42')).toBe('scalar');
      expect(detectOutputType('3.14')).toBe('scalar');
    });

    it('should detect string', () => {
      expect(detectOutputType("'hello'")).toBe('string');
    });

    it('should detect logical', () => {
      expect(detectOutputType('1')).toBe('logical');
      expect(detectOutputType('0')).toBe('logical');
    });

    it('should detect array', () => {
      expect(detectOutputType('1 2 3 4 5')).toBe('array');
    });
  });

  describe('jsToMatlabValue', () => {
    it('should convert null to empty array', () => {
      expect(jsToMatlabValue(null)).toBe('[]');
    });

    it('should convert booleans', () => {
      expect(jsToMatlabValue(true)).toBe('true');
      expect(jsToMatlabValue(false)).toBe('false');
    });

    it('should convert numbers', () => {
      expect(jsToMatlabValue(42)).toBe('42');
      expect(jsToMatlabValue(3.14)).toBe('3.14');
      expect(jsToMatlabValue(Number.POSITIVE_INFINITY)).toBe('Inf');
    });

    it('should convert strings with escaping', () => {
      expect(jsToMatlabValue('hello')).toBe("'hello'");
      expect(jsToMatlabValue("it's")).toBe("'it''s'");
    });

    it('should convert arrays', () => {
      expect(jsToMatlabValue([1, 2, 3])).toBe('[1, 2, 3]');
    });

    it('should convert 2D arrays as matrices', () => {
      expect(
        jsToMatlabValue([
          [1, 2],
          [3, 4],
        ])
      ).toBe('[1, 2; 3, 4]');
    });

    it('should convert objects as structs', () => {
      expect(jsToMatlabValue({ a: 1, b: 2 })).toBe("struct('a', 1, 'b', 2)");
    });
  });

  describe('generateJSONExtractionCode', () => {
    it('should generate extraction code for variables', () => {
      const code = generateJSONExtractionCode(['x', 'y']);
      expect(code).toContain("'x', x");
      expect(code).toContain("'y', y");
      expect(code).toContain('jsonencode');
    });

    it('should return empty string for empty array', () => {
      expect(generateJSONExtractionCode([])).toBe('');
    });
  });
});
