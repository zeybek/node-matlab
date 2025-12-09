/**
 * MATLAB output parsing utilities
 * @packageDocumentation
 */

import { JSON_END_MARKER, JSON_START_MARKER } from '../types.js';

/**
 * Extract JSON data embedded in MATLAB output
 */
export function extractJSON<T = unknown>(output: string): T | null {
  const startIndex = output.indexOf(JSON_START_MARKER);
  const endIndex = output.indexOf(JSON_END_MARKER);

  if (startIndex === -1 || endIndex === -1 || endIndex <= startIndex) {
    return null;
  }

  const jsonStr = output.slice(startIndex + JSON_START_MARKER.length, endIndex);

  try {
    return JSON.parse(jsonStr) as T;
  } catch {
    return null;
  }
}

/**
 * Remove JSON markers from output
 */
export function removeJSONMarkers(output: string): string {
  const startIndex = output.indexOf(JSON_START_MARKER);
  const endIndex = output.indexOf(JSON_END_MARKER);

  if (startIndex === -1 || endIndex === -1) {
    return output;
  }

  return (output.slice(0, startIndex) + output.slice(endIndex + JSON_END_MARKER.length)).trim();
}

/**
 * Parse MATLAB array string to JavaScript array
 * e.g., "1 2 3 4 5" -> [1, 2, 3, 4, 5]
 */
export function parseArrayString(str: string): number[] {
  const trimmed = str.trim();
  if (!trimmed) return [];

  return trimmed
    .split(/\s+/)
    .map(Number)
    .filter((n) => !Number.isNaN(n));
}

/**
 * Parse MATLAB matrix output to 2D array
 */
export function parseMatrixOutput(output: string): number[][] {
  const lines = output.trim().split('\n');
  const matrix: number[][] = [];

  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed) continue;

    const row = parseArrayString(trimmed);
    if (row.length > 0) {
      matrix.push(row);
    }
  }

  return matrix;
}

/**
 * Parse MATLAB struct-like output
 */
export function parseStructOutput(output: string): Record<string, string> {
  const result: Record<string, string> = {};
  const lines = output.trim().split('\n');

  for (const line of lines) {
    const match = line.match(/^\s*(\w+):\s*(.+)$/);
    if (match?.[1] && match[2]) {
      result[match[1]] = match[2].trim();
    }
  }

  return result;
}

/**
 * Parse MATLAB cell array output
 */
export function parseCellArrayOutput(output: string): string[] {
  const result: string[] = [];

  // Match patterns like "'string'" or "123" within cell display
  const matches = output.matchAll(/'([^']*)'|\b(\d+(?:\.\d+)?)\b/g);

  for (const match of matches) {
    const value = match[1] ?? match[2];
    if (value !== undefined) {
      result.push(value);
    }
  }

  return result;
}

/**
 * Parse MATLAB logical output
 */
export function parseLogical(output: string): boolean | null {
  const trimmed = output.trim().toLowerCase();

  if (trimmed === '1' || trimmed === 'true' || trimmed === 'logical 1') {
    return true;
  }

  if (trimmed === '0' || trimmed === 'false' || trimmed === 'logical 0') {
    return false;
  }

  return null;
}

/**
 * Parse MATLAB scalar output
 */
export function parseScalar(output: string): number | null {
  const trimmed = output.trim();

  // Handle special values
  if (trimmed === 'Inf' || trimmed === 'inf') return Number.POSITIVE_INFINITY;
  if (trimmed === '-Inf' || trimmed === '-inf') return Number.NEGATIVE_INFINITY;
  if (trimmed === 'NaN' || trimmed === 'nan') return Number.NaN;

  // Handle complex numbers (just return the real part for now)
  const complexMatch = trimmed.match(/^([-+]?\d*\.?\d+(?:[eE][-+]?\d+)?)/);
  if (complexMatch?.[1]) {
    const num = Number.parseFloat(complexMatch[1]);
    if (!Number.isNaN(num)) return num;
  }

  const num = Number.parseFloat(trimmed);
  return Number.isNaN(num) ? null : num;
}

/**
 * Parse MATLAB string output (remove quotes)
 */
export function parseString(output: string): string {
  const trimmed = output.trim();

  // Remove surrounding quotes
  if (
    (trimmed.startsWith("'") && trimmed.endsWith("'")) ||
    (trimmed.startsWith('"') && trimmed.endsWith('"'))
  ) {
    return trimmed.slice(1, -1);
  }

  return trimmed;
}

/**
 * Detect the type of MATLAB output
 */
export function detectOutputType(
  output: string
): 'scalar' | 'array' | 'matrix' | 'string' | 'struct' | 'cell' | 'logical' | 'unknown' {
  const trimmed = output.trim();

  // Check for logical
  if (/^(logical\s+)?[01]$/.test(trimmed) || /^(true|false)$/i.test(trimmed)) {
    return 'logical';
  }

  // Check for string (quoted)
  if (
    (trimmed.startsWith("'") && trimmed.endsWith("'")) ||
    (trimmed.startsWith('"') && trimmed.endsWith('"'))
  ) {
    return 'string';
  }

  // Check for scalar
  if (
    /^[-+]?\d*\.?\d+(?:[eE][-+]?\d+)?[ij]?$/.test(trimmed) ||
    trimmed === 'Inf' ||
    trimmed === '-Inf' ||
    trimmed === 'NaN'
  ) {
    return 'scalar';
  }

  // Check for struct (has field: value pattern)
  if (/^\s*\w+:\s*.+$/m.test(trimmed)) {
    return 'struct';
  }

  // Check for cell array (has curly braces or cell display format)
  if (trimmed.includes('{') || /^\s*\[\d+[×x]\d+\s+cell\]/.test(trimmed)) {
    return 'cell';
  }

  // Check for matrix (multiple lines with numbers)
  const lines = trimmed.split('\n').filter((l) => l.trim());
  if (lines.length > 1 && lines.every((l) => /^[\s\d.eE+-]+$/.test(l))) {
    return 'matrix';
  }

  // Check for array (single line with multiple numbers)
  if (/^[\s\d.eE+-]+$/.test(trimmed) && trimmed.split(/\s+/).length > 1) {
    return 'array';
  }

  return 'unknown';
}

/**
 * Auto-parse MATLAB output based on detected type
 */
export function autoParse(output: string): unknown {
  const type = detectOutputType(output);

  switch (type) {
    case 'logical':
      return parseLogical(output);
    case 'scalar':
      return parseScalar(output);
    case 'string':
      return parseString(output);
    case 'array':
      return parseArrayString(output);
    case 'matrix':
      return parseMatrixOutput(output);
    case 'struct':
      return parseStructOutput(output);
    case 'cell':
      return parseCellArrayOutput(output);
    default:
      return output.trim();
  }
}

/**
 * Generate MATLAB code to wrap variables for JSON extraction
 */
export function generateJSONExtractionCode(variables: string[]): string {
  if (variables.length === 0) {
    return '';
  }

  const structFields = variables.map((v) => `'${v}', ${v}`).join(', ');

  return `
__nm_result__ = struct(${structFields});
fprintf('${JSON_START_MARKER}%s${JSON_END_MARKER}', jsonencode(__nm_result__));
`.trim();
}

/**
 * Generate MATLAB code to convert a JavaScript value to MATLAB
 */
export function jsToMatlabValue(value: unknown): string {
  if (value === null || value === undefined) {
    return '[]';
  }

  if (typeof value === 'boolean') {
    return value ? 'true' : 'false';
  }

  if (typeof value === 'number') {
    if (value === Number.POSITIVE_INFINITY) return 'Inf';
    if (value === Number.NEGATIVE_INFINITY) return '-Inf';
    if (Number.isNaN(value)) return 'NaN';
    return String(value);
  }

  if (typeof value === 'string') {
    return `'${value.replace(/'/g, "''")}'`;
  }

  if (Array.isArray(value)) {
    if (value.length === 0) return '[]';

    // Check if it's a 2D array (matrix)
    if (Array.isArray(value[0])) {
      const rows = value.map((row) => {
        if (Array.isArray(row)) {
          return row.map((v) => jsToMatlabValue(v)).join(', ');
        }
        return jsToMatlabValue(row);
      });
      return `[${rows.join('; ')}]`;
    }

    // 1D array
    return `[${value.map((v) => jsToMatlabValue(v)).join(', ')}]`;
  }

  if (typeof value === 'object') {
    const entries = Object.entries(value);
    if (entries.length === 0) return 'struct()';

    const fields = entries.map(([k, v]) => `'${k}', ${jsToMatlabValue(v)}`).join(', ');
    return `struct(${fields})`;
  }

  return String(value);
}
