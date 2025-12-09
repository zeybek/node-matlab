/**
 * Process utility tests
 */

import { describe, expect, it } from 'vitest';
import { buildMatlabArgs, buildSpawnOptions } from '../src/utils/process.js';

describe('Process Utilities', () => {
  describe('buildMatlabArgs', () => {
    it('should build basic args for script path', () => {
      const args = buildMatlabArgs('/path/to/script.m');
      expect(args).toContain('-nosplash');
      expect(args).toContain('-nodesktop');
      expect(args).toContain('-batch');
      expect(args.some((a) => a.includes("run('/path/to/script.m')"))).toBe(true);
    });

    it('should include addPath commands', () => {
      const args = buildMatlabArgs('/script.m', {
        addPath: ['/custom/path1', '/custom/path2'],
      });

      const batchArg = args.find((a) => a.includes('addpath'));
      expect(batchArg).toBeDefined();
      expect(batchArg).toContain("addpath('/custom/path1')");
      expect(batchArg).toContain("addpath('/custom/path2')");
    });

    it('should escape single quotes in paths', () => {
      const args = buildMatlabArgs("/path/with'quote/script.m");
      const batchArg = args.find((a) => a.includes('run'));
      expect(batchArg).toContain("''"); // Escaped quote
    });

    it('should escape single quotes in addPath', () => {
      const args = buildMatlabArgs('/script.m', {
        addPath: ["/path/with'quote"],
      });
      const batchArg = args.find((a) => a.includes('addpath'));
      expect(batchArg).toContain("''");
    });
  });

  describe('buildSpawnOptions', () => {
    it('should return default options', () => {
      const opts = buildSpawnOptions();
      expect(opts.stdio).toEqual(['pipe', 'pipe', 'pipe']);
      expect(opts.windowsHide).toBe(true);
    });

    it('should include cwd when provided', () => {
      const opts = buildSpawnOptions({ cwd: '/custom/dir' });
      expect(opts.cwd).toBe('/custom/dir');
    });

    it('should merge env vars', () => {
      const opts = buildSpawnOptions({ env: { CUSTOM_VAR: 'value' } });
      expect(opts.env).toBeDefined();
      expect(opts.env?.CUSTOM_VAR).toBe('value');
      // Should also include existing process.env
      expect(opts.env?.PATH).toBeDefined();
    });

    it('should not include env when not provided', () => {
      const opts = buildSpawnOptions({});
      expect(opts.env).toBeUndefined();
    });
  });
});
