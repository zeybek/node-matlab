/**
 * Error classes tests
 */

import { describe, expect, it } from 'vitest';
import {
  MatlabAbortError,
  MatlabError,
  MatlabFileNotFoundError,
  MatlabNotInstalledError,
  MatlabRuntimeError,
  MatlabSyntaxError,
  MatlabTimeoutError,
  MatlabToolboxError,
  isMatlabError,
  parseError,
} from '../src/errors.js';

describe('Error Classes', () => {
  describe('MatlabError', () => {
    it('should create error with message', () => {
      const error = new MatlabError('Test error');
      expect(error.message).toBe('Test error');
      expect(error.name).toBe('MatlabError');
      expect(error.type).toBe('unknown');
    });

    it('should create error with details', () => {
      const error = new MatlabError('Test', {
        type: 'runtime',
        lineNumber: 10,
        file: 'test.m',
      });
      expect(error.type).toBe('runtime');
      expect(error.lineNumber).toBe(10);
      expect(error.file).toBe('test.m');
    });

    it('should generate detailed string', () => {
      const error = new MatlabError('Test error', {
        type: 'syntax',
        lineNumber: 5,
        file: 'script.m',
        suggestion: 'Check syntax',
      });
      const detailed = error.toDetailedString();
      expect(detailed).toContain('Test error');
      expect(detailed).toContain('Line: 5');
      expect(detailed).toContain('script.m');
      expect(detailed).toContain('Check syntax');
    });
  });

  describe('MatlabNotInstalledError', () => {
    it('should have correct defaults', () => {
      const error = new MatlabNotInstalledError();
      expect(error.name).toBe('MatlabNotInstalledError');
      expect(error.type).toBe('not_installed');
      expect(error.message).toContain('not installed');
    });

    it('should accept custom message', () => {
      const error = new MatlabNotInstalledError('Custom message');
      expect(error.message).toBe('Custom message');
    });
  });

  describe('MatlabTimeoutError', () => {
    it('should include timeout value', () => {
      const error = new MatlabTimeoutError(5000);
      expect(error.timeout).toBe(5000);
      expect(error.message).toContain('5000ms');
      expect(error.type).toBe('timeout');
    });
  });

  describe('MatlabSyntaxError', () => {
    it('should parse from output', () => {
      const output = 'Error: syntax error at line 10';
      const error = MatlabSyntaxError.fromOutput(output);
      expect(error.type).toBe('syntax');
      expect(error.lineNumber).toBe(10);
    });
  });

  describe('MatlabRuntimeError', () => {
    it('should parse from output', () => {
      const output = 'Error in myScript at line 25';
      const error = MatlabRuntimeError.fromOutput(output);
      expect(error.type).toBe('runtime');
    });
  });

  describe('MatlabToolboxError', () => {
    it('should include toolbox name', () => {
      const error = new MatlabToolboxError('Signal Processing Toolbox');
      expect(error.toolboxName).toBe('Signal Processing Toolbox');
      expect(error.type).toBe('toolbox_missing');
    });
  });

  describe('MatlabFileNotFoundError', () => {
    it('should include file path', () => {
      const error = new MatlabFileNotFoundError('/path/to/file.m');
      expect(error.filePath).toBe('/path/to/file.m');
      expect(error.type).toBe('file_not_found');
    });
  });

  describe('MatlabAbortError', () => {
    it('should have correct message', () => {
      const error = new MatlabAbortError();
      expect(error.message).toContain('aborted');
    });
  });

  describe('parseError', () => {
    it('should detect syntax errors', () => {
      const error = parseError('syntax error near line 5');
      expect(error).toBeInstanceOf(MatlabSyntaxError);
    });

    it('should detect undefined function errors', () => {
      const error = parseError("Undefined function or variable 'myFunc'");
      expect(error).toBeInstanceOf(MatlabRuntimeError);
    });

    it('should default to runtime error', () => {
      const error = parseError('Some other error');
      expect(error).toBeInstanceOf(MatlabRuntimeError);
    });
  });

  describe('isMatlabError', () => {
    it('should identify MatlabError instances', () => {
      expect(isMatlabError(new MatlabError('test'))).toBe(true);
      expect(isMatlabError(new MatlabNotInstalledError())).toBe(true);
      expect(isMatlabError(new MatlabTimeoutError(1000))).toBe(true);
    });

    it('should reject non-MatlabError instances', () => {
      expect(isMatlabError(new Error('test'))).toBe(false);
      expect(isMatlabError('string')).toBe(false);
      expect(isMatlabError(null)).toBe(false);
    });
  });
});
