/**
 * JavaScript <-> MATLAB data conversion utilities
 * @packageDocumentation
 */

import type { MatlabDataType, VariableInfo } from '../types.js';

/**
 * Convert JavaScript value to MATLAB code string
 */
export function toMatlabCode(value: unknown, varName?: string): string {
  const matlabValue = convertToMatlab(value);
  return varName ? `${varName} = ${matlabValue};` : matlabValue;
}

/**
 * Convert a JavaScript value to its MATLAB representation
 */
export function convertToMatlab(value: unknown): string {
  if (value === null || value === undefined) {
    return '[]';
  }

  if (typeof value === 'boolean') {
    return value ? 'true' : 'false';
  }

  if (typeof value === 'number') {
    return formatNumber(value);
  }

  if (typeof value === 'string') {
    return formatString(value);
  }

  if (Array.isArray(value)) {
    return formatArray(value);
  }

  if (value instanceof Date) {
    return formatDate(value);
  }

  if (typeof value === 'object') {
    return formatStruct(value as Record<string, unknown>);
  }

  return String(value);
}

/**
 * Format a number for MATLAB
 */
function formatNumber(num: number): string {
  if (num === Number.POSITIVE_INFINITY) return 'Inf';
  if (num === Number.NEGATIVE_INFINITY) return '-Inf';
  if (Number.isNaN(num)) return 'NaN';

  // Use scientific notation for very large/small numbers
  if (Math.abs(num) > 1e10 || (Math.abs(num) < 1e-10 && num !== 0)) {
    return num.toExponential();
  }

  return String(num);
}

/**
 * Format a string for MATLAB (escape single quotes)
 */
function formatString(str: string): string {
  // Escape single quotes by doubling them
  const escaped = str.replace(/'/g, "''");
  return `'${escaped}'`;
}

/**
 * Format an array for MATLAB
 */
function formatArray(arr: unknown[]): string {
  if (arr.length === 0) return '[]';

  // Check if it's a 2D array (matrix)
  if (arr.every((item) => Array.isArray(item))) {
    const rows = arr.map((row) => {
      if (Array.isArray(row)) {
        return row.map((v) => convertToMatlab(v)).join(', ');
      }
      return convertToMatlab(row);
    });
    return `[${rows.join('; ')}]`;
  }

  // Check if all items are strings (create cell array)
  if (arr.every((item) => typeof item === 'string')) {
    const items = arr.map((s) => formatString(s as string));
    return `{${items.join(', ')}}`;
  }

  // Regular numeric/mixed array
  const items = arr.map((v) => convertToMatlab(v));
  return `[${items.join(', ')}]`;
}

/**
 * Format a Date for MATLAB datetime
 */
function formatDate(date: Date): string {
  const year = date.getFullYear();
  const month = date.getMonth() + 1;
  const day = date.getDate();
  const hour = date.getHours();
  const minute = date.getMinutes();
  const second = date.getSeconds();

  return `datetime(${year}, ${month}, ${day}, ${hour}, ${minute}, ${second})`;
}

/**
 * Format an object as MATLAB struct
 */
function formatStruct(obj: Record<string, unknown>): string {
  const entries = Object.entries(obj);

  if (entries.length === 0) {
    return 'struct()';
  }

  const fields = entries.map(([key, value]) => {
    // Ensure valid MATLAB field name (alphanumeric + underscore, starting with letter)
    const validKey = sanitizeFieldName(key);
    return `'${validKey}', ${convertToMatlab(value)}`;
  });

  return `struct(${fields.join(', ')})`;
}

/**
 * Sanitize a string to be a valid MATLAB field name
 */
function sanitizeFieldName(name: string): string {
  // Replace invalid characters with underscores
  let sanitized = name.replace(/[^a-zA-Z0-9_]/g, '_');

  // Ensure it starts with a letter
  if (!/^[a-zA-Z]/.test(sanitized)) {
    sanitized = `f_${sanitized}`;
  }

  // Truncate to MATLAB's max identifier length (63 characters)
  return sanitized.slice(0, 63);
}

/**
 * Generate MATLAB code to set multiple variables
 */
export function generateSetVariablesCode(variables: Record<string, unknown>): string {
  const lines: string[] = [];

  for (const [name, value] of Object.entries(variables)) {
    const validName = sanitizeFieldName(name);
    lines.push(`${validName} = ${convertToMatlab(value)};`);
  }

  return lines.join('\n');
}

/**
 * Infer MATLAB data type from JavaScript value
 */
export function inferMatlabType(value: unknown): MatlabDataType {
  if (value === null || value === undefined) {
    return 'double'; // Empty array defaults to double
  }

  if (typeof value === 'boolean') {
    return 'logical';
  }

  if (typeof value === 'number') {
    if (Number.isInteger(value)) {
      return 'double'; // MATLAB defaults to double even for integers
    }
    return 'double';
  }

  if (typeof value === 'string') {
    return 'char';
  }

  if (Array.isArray(value)) {
    if (value.length === 0) return 'double';

    // Check if it's a string array
    if (value.every((item) => typeof item === 'string')) {
      return 'cell';
    }

    // Check if it's a cell array of mixed types
    const types = new Set(value.map((item) => typeof item));
    if (types.size > 1) {
      return 'cell';
    }

    return 'double';
  }

  if (value instanceof Date) {
    return 'datetime';
  }

  if (typeof value === 'object') {
    return 'struct';
  }

  return 'unknown';
}

/**
 * Create variable info from a JavaScript value
 */
export function createVariableInfo(name: string, value: unknown): VariableInfo {
  const type = inferMatlabType(value);
  let size: number[];

  if (value === null || value === undefined) {
    size = [0, 0];
  } else if (Array.isArray(value)) {
    if (value.length === 0) {
      size = [0, 0];
    } else if (Array.isArray(value[0])) {
      // 2D array
      size = [value.length, (value[0] as unknown[]).length];
    } else {
      // 1D array (row vector)
      size = [1, value.length];
    }
  } else if (typeof value === 'string') {
    size = [1, value.length];
  } else {
    // Scalar
    size = [1, 1];
  }

  return {
    name,
    size,
    type,
  };
}

/**
 * Convert complex number string to JavaScript object
 */
export function parseComplexNumber(str: string): { real: number; imag: number } | null {
  // Match patterns like "3+4i", "3-4i", "3+4j", "-3.5+2.1i"
  const match = str.match(
    /^([-+]?\d*\.?\d+(?:[eE][-+]?\d+)?)\s*([-+])\s*(\d*\.?\d+(?:[eE][-+]?\d+)?)[ij]$/
  );

  if (match?.[1] && match[2] && match[3]) {
    const real = Number.parseFloat(match[1]);
    const sign = match[2] === '-' ? -1 : 1;
    const imag = sign * Number.parseFloat(match[3]);
    return { real, imag };
  }

  // Pure imaginary: "4i" or "4j"
  const pureImagMatch = str.match(/^([-+]?\d*\.?\d+(?:[eE][-+]?\d+)?)[ij]$/);
  if (pureImagMatch?.[1]) {
    return { real: 0, imag: Number.parseFloat(pureImagMatch[1]) };
  }

  return null;
}

/**
 * Check if a value is a valid MATLAB variable name
 */
export function isValidMatlabName(name: string): boolean {
  // Must start with letter, contain only alphanumeric and underscore
  // Must not exceed 63 characters
  return /^[a-zA-Z][a-zA-Z0-9_]{0,62}$/.test(name);
}

/**
 * Reserved MATLAB keywords that cannot be used as variable names
 */
export const MATLAB_KEYWORDS = new Set([
  'break',
  'case',
  'catch',
  'classdef',
  'continue',
  'else',
  'elseif',
  'end',
  'for',
  'function',
  'global',
  'if',
  'otherwise',
  'parfor',
  'persistent',
  'return',
  'spmd',
  'switch',
  'try',
  'while',
]);

/**
 * Check if a name is a reserved MATLAB keyword
 */
export function isMatlabKeyword(name: string): boolean {
  return MATLAB_KEYWORDS.has(name.toLowerCase());
}
