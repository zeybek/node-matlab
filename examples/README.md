# node-matlab Examples

This directory contains comprehensive examples demonstrating how to use the `node-matlab` package.

## Prerequisites

- **MATLAB R2019a or later** installed and available in PATH
- **Node.js 18+**

## Running Examples

```bash
# Install dependencies (from examples directory)
cd examples
pnpm install

# Run any example
npx tsx 01-basic/hello-matlab.ts
```

## Examples Overview

### 01-basic/ - Getting Started
| File | Description |
|------|-------------|
| `hello-matlab.ts` | Your first MATLAB command from Node.js |
| `run-script.ts` | Execute a .m script file |
| `simple-calculation.ts` | Basic mathematical operations |

### 02-variables/ - Data Exchange
| File | Description |
|------|-------------|
| `get-variables.ts` | Extract variables from MATLAB workspace |
| `set-variables.ts` | Send JavaScript data to MATLAB |
| `data-conversion.ts` | JS ↔ MATLAB type conversion |

### 03-figures/ - Graphics & Plots
| File | Description |
|------|-------------|
| `save-plot.ts` | Save a single figure to file |
| `multiple-figures.ts` | Create and save multiple plots |
| `export-formats.ts` | Export as PNG, SVG, PDF, EPS |

### 04-data-export/ - File Export
| File | Description |
|------|-------------|
| `export-json.ts` | Export data as JSON |
| `export-csv.ts` | Export data as CSV |
| `export-mat.ts` | Save as .mat file |

### 05-functions/ - Function Calls
| File | Description |
|------|-------------|
| `call-builtin.ts` | Call MATLAB built-in functions |
| `call-custom.ts` | Call custom .m functions |
| `multiple-outputs.ts` | Handle multiple return values |

### 06-session/ - Persistent Sessions
| File | Description |
|------|-------------|
| `persistent-session.ts` | Keep MATLAB running for multiple commands |
| `workspace-management.ts` | Manage workspace variables |

### 07-error-handling/ - Error Management
| File | Description |
|------|-------------|
| `catch-errors.ts` | Catch and handle MATLAB errors |
| `timeout-abort.ts` | Timeout and cancellation |
| `error-types.ts` | Different error types |

### 08-advanced/ - Advanced Features
| File | Description |
|------|-------------|
| `progress-streaming.ts` | Real-time output streaming |
| `parallel-execution.ts` | Run multiple commands in parallel |
| `live-script-export.ts` | Export .mlx Live Scripts |

### 09-real-world/ - Real World Examples
| File | Description |
|------|-------------|
| `signal-processing.ts` | Signal processing example |
| `image-analysis.ts` | Image processing example |
| `data-visualization.ts` | Data visualization dashboard |

## MATLAB Scripts

The `matlab-scripts/` directory contains .m files used by the examples:
- `simple_script.m` - Basic example script
- `custom_function.m` - Custom function example
- `signal_analysis.m` - Signal processing utilities

## Tips

1. **Check MATLAB Installation**: Run `Matlab.isInstalled()` first
2. **Use Sessions for Multiple Commands**: Avoid startup overhead
3. **Handle Errors**: Always wrap in try/catch
4. **Stream Long Operations**: Use `onProgress` callback

## Troubleshooting

### MATLAB not found
```typescript
if (!Matlab.isInstalled()) {
  console.error('MATLAB is not installed or not in PATH');
  console.error('Add MATLAB to PATH: export PATH=$PATH:/path/to/matlab/bin');
}
```

### Timeout Issues
```typescript
// Increase timeout for long operations
await Matlab.run(script, { timeout: 120000 }); // 2 minutes
```

### Memory Issues
```typescript
// Clear workspace between operations
await session.run('clear all;');
```

