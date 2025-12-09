# node-matlab

![NPM](https://img.shields.io/npm/l/node-matlab?style=flat-square)
![npm](https://img.shields.io/npm/v/node-matlab?style=flat-square)
![GitHub issues](https://img.shields.io/github/issues/zeybek/node-matlab?style=flat-square)
![npm](https://img.shields.io/npm/dw/node-matlab?style=flat-square)
![MATLAB](https://img.shields.io/badge/MATLAB-%3E%3D%202019a-blue?style=flat-square)
![TypeScript](https://img.shields.io/badge/TypeScript-5.0+-blue?style=flat-square)
![Node.js](https://img.shields.io/badge/Node.js-%3E%3D%2018-green?style=flat-square)

Run MATLAB commands, scripts, and functions from Node.js with full TypeScript support.

## Features

- **TypeScript First** - Full type definitions and IntelliSense support
- **Modern API** - Promise-based async/await interface
- **Variable Exchange** - Get/set MATLAB workspace variables as JSON
- **Figure Export** - Save plots as PNG, SVG, PDF, EPS
- **Function Calls** - Call MATLAB functions directly with typed outputs
- **Live Script Export** - Convert .mlx files to HTML/PDF
- **Session Support** - Persistent MATLAB sessions for faster execution
- **Progress Streaming** - Real-time output with callbacks
- **Timeout & Abort** - AbortController support for cancellation

## Installation

```bash
npm install node-matlab
# or
pnpm add node-matlab
# or
yarn add node-matlab
```

## Requirements

- **MATLAB R2019a** or later installed on your system
- **Node.js 18** or later
- The `matlab` command must be available in your system PATH

## Quick Start

```typescript
import { Matlab } from 'node-matlab';

// Run a simple command
const result = await Matlab.run('3 + 4');
console.log(result.output); // "7"

// Run multi-line script
const result = await Matlab.run(`
  x = 1:10;
  y = x.^2;
  disp(y);
`);

// Run a .m file
const result = await Matlab.runFile('./script.m');
```

## API Reference

### Basic Execution

```typescript
import { Matlab } from 'node-matlab';

// Run script (auto-detects if it's a file path)
const result = await Matlab.run(scriptOrPath, options);

// Run a specific file
const result = await Matlab.runFile('./analysis.m');

// Evaluate a simple expression
const value = await Matlab.eval('sin(pi/2)'); // "1"
```

### Options

```typescript
interface MatlabOptions {
  timeout?: number;           // Timeout in ms
  cwd?: string;               // Working directory
  addPath?: string[];         // Add paths to MATLAB path
  onProgress?: (line: string) => void;  // Stream output
  signal?: AbortSignal;       // For cancellation
  env?: Record<string, string>;         // Environment variables
}

// Example with options
const result = await Matlab.run('longComputation()', {
  timeout: 60000,
  cwd: '/path/to/project',
  onProgress: (line) => console.log('MATLAB:', line),
});
```

### Variable Exchange

```typescript
// Get variables from MATLAB workspace
const vars = await Matlab.getVariables(`
  x = 1:10;
  y = sin(x);
  name = 'test';
`, ['x', 'y', 'name']);

console.log(vars.x);    // [1, 2, 3, 4, 5, 6, 7, 8, 9, 10]
console.log(vars.y);    // [0.841, 0.909, ...]
console.log(vars.name); // "test"

// Generate MATLAB code from JavaScript values
const code = Matlab.setVariables({
  matrix: [[1, 2], [3, 4]],
  name: 'test',
});
// Returns: "matrix = [1, 2; 3, 4];\nname = 'test';"
```

### Figure Export

```typescript
// Save a single figure
await Matlab.saveFigure(
  'x = 0:0.1:2*pi; plot(x, sin(x));',
  './sine_wave.png',
  { format: 'png', resolution: 300 }
);

// Save as SVG (vector)
await Matlab.saveFigure(
  'bar([1, 2, 3, 4])',
  './chart.svg',
  { format: 'svg' }
);

// Save all figures from a script
const paths = await Matlab.saveAllFigures(
  `
    figure; plot(rand(10,1));
    figure; bar(rand(5,1));
  `,
  './output',
  'chart',
  { format: 'png' }
);
// Returns: ['./output/chart_1.png', './output/chart_2.png']
```

### Function Calls

```typescript
// Call MATLAB function with arguments
const result = await Matlab.callFunction('sqrt', [16]);
console.log(result.outputs); // [4]

// Multiple outputs
const result = await Matlab.callFunction('eig', [[[1, 2], [3, 4]]], { nargout: 2 });
console.log(result.outputs); // [eigenvectors, eigenvalues]

// Built-in functions
const result = await Matlab.callFunction('linspace', [0, 10, 5]);
console.log(result.outputs); // [[0, 2.5, 5, 7.5, 10]]
```

### Data Export

```typescript
// Export to JSON
await Matlab.exportToJSON(
  'data = rand(10, 3);',
  './data.json',
  ['data']
);

// Export to CSV
await Matlab.exportToCSV(
  'data = rand(100, 5);',
  'data',
  './output.csv'
);

// Export to MAT file
await Matlab.exportToMAT(
  'x = 1:100; y = sin(x);',
  './data.mat',
  ['x', 'y']
);
```

### Live Script Export

```typescript
// Export .mlx to HTML
await Matlab.exportLiveScript(
  './analysis.mlx',
  './analysis.html',
  { format: 'html', run: true }
);

// Export to PDF
await Matlab.exportLiveScript(
  './report.mlx',
  './report.pdf',
  { format: 'pdf' }
);
```

### Session API (Persistent Connection)

For multiple commands, use a session to avoid MATLAB startup overhead:

```typescript
import { MatlabSession, createSession } from 'node-matlab';

// Create and start session
const session = await createSession({ timeout: 30000 });

// Run multiple commands efficiently
await session.run('x = 1:100;');
await session.run('y = sin(x);');

// Get variables
const y = await session.getVariable('y');

// Set variables
await session.setVariable('z', [1, 2, 3, 4, 5]);

// Change directory
await session.cd('/path/to/project');

// Close session
await session.close();
```

### System Information

```typescript
// Check if MATLAB is installed
if (Matlab.isInstalled()) {
  console.log('MATLAB is available');
}

// Get version info
const version = await Matlab.getVersion();
console.log(`MATLAB ${version.release} (${version.version})`);
// Output: "MATLAB R2023a (9.14)"

// Get installed toolboxes
const toolboxes = await Matlab.getInstalledToolboxes();
toolboxes.forEach(tb => {
  console.log(`${tb.name} v${tb.version}`);
});

// Get MATLAB root
const root = await Matlab.getMatlabRoot();
console.log(`Installed at: ${root}`);
```

### Error Handling

```typescript
import {
  Matlab,
  MatlabError,
  MatlabNotInstalledError,
  MatlabTimeoutError,
  MatlabSyntaxError,
  MatlabRuntimeError,
  MatlabMemoryError,
  MatlabIndexError,
  MatlabDimensionError,
  MatlabPermissionError,
  isMatlabError,
} from 'node-matlab';

try {
  await Matlab.run('invalid syntax here %%%');
} catch (error) {
  if (isMatlabError(error)) {
    console.log('Error type:', error.type);
    console.log('Message:', error.message);
    console.log('Line:', error.lineNumber);
    console.log('Detailed:', error.toDetailedString());
  }
}

// Handle specific errors
try {
  await Matlab.run('longTask()', { timeout: 5000 });
} catch (error) {
  if (error instanceof MatlabTimeoutError) {
    console.log(`Timed out after ${error.timeout}ms`);
  } else if (error instanceof MatlabMemoryError) {
    console.log('MATLAB ran out of memory');
  } else if (error instanceof MatlabIndexError) {
    console.log('Array index out of bounds');
  } else if (error instanceof MatlabDimensionError) {
    console.log('Matrix dimensions do not match');
  }
}
```

#### Error Types

| Error Class | Description |
|-------------|-------------|
| `MatlabError` | Base error class |
| `MatlabNotInstalledError` | MATLAB not found in PATH |
| `MatlabTimeoutError` | Command exceeded timeout |
| `MatlabSyntaxError` | MATLAB syntax error |
| `MatlabRuntimeError` | General runtime error |
| `MatlabMemoryError` | Out of memory |
| `MatlabIndexError` | Array index out of bounds |
| `MatlabDimensionError` | Matrix dimension mismatch |
| `MatlabToolboxError` | Missing toolbox |
| `MatlabFileNotFoundError` | File not found |
| `MatlabPermissionError` | Permission denied |
| `MatlabAbortError` | Execution aborted |

### Cancellation with AbortController

```typescript
const controller = new AbortController();

// Cancel after 10 seconds
setTimeout(() => controller.abort(), 10000);

try {
  await Matlab.run('veryLongComputation()', {
    signal: controller.signal,
  });
} catch (error) {
  if (error.name === 'MatlabAbortError') {
    console.log('Execution was cancelled');
  }
}
```

## Migration from v1.x

### Breaking Changes

1. **ESM/CJS dual package** - Now supports both module systems
2. **New API structure** - Methods are now static on `Matlab` class
3. **TypeScript types** - Full type definitions included
4. **Minimum Node.js 18** - Dropped support for older versions

### Migration Guide

```typescript
// v1.x
const matlab = require('node-matlab');
matlab.run('3+4').then(result => console.log(result));

// v2.x
import { Matlab } from 'node-matlab';
const result = await Matlab.run('3+4');
console.log(result.output);
```

The result now includes more information:

```typescript
// v1.x result
"7"

// v2.x result
{
  output: "7",
  exitCode: 0,
  duration: 1234,
  warnings: []
}
```

## Contributing

Contributions are welcome! Please follow these steps:

### Development Setup

```bash
# Clone the repository
git clone https://github.com/zeybek/node-matlab.git
cd node-matlab

# Install dependencies
pnpm install

# Build
pnpm build

# Run tests
pnpm test

# Lint & format check
pnpm check
```

### Making Changes

1. Create a feature branch: `git checkout -b feature/my-feature`
2. Make your changes
3. Add a changeset: `pnpm changeset`
4. Commit and push
5. Open a Pull Request

### Adding a Changeset

When you make changes that should be released, run:

```bash
pnpm changeset
```

This will prompt you to:
1. Select the package (node-matlab)
2. Choose version bump type:
   - **patch** (1.0.0 → 1.0.1): Bug fixes, docs
   - **minor** (1.0.0 → 1.1.0): New features (backward compatible)
   - **major** (1.0.0 → 2.0.0): Breaking changes
3. Write a summary of your changes

The changeset file will be committed with your PR. When merged to main, the release workflow will automatically publish to npm.

### Code Style

- Use TypeScript for all new code
- Follow existing patterns in the codebase
- Run `pnpm check` before committing
- Write tests for new features

## License

MIT License - see [LICENSE](LICENSE) for details.

## Author

**Ahmet Zeybek** - [zeybek.dev](https://zeybek.dev)

- GitHub: [@zeybek](https://github.com/zeybek)
- Email: me@zeybek.dev
