/**
 * Data Type Conversion between JavaScript and MATLAB
 *
 * This example demonstrates:
 * - JavaScript to MATLAB type mapping
 * - MATLAB to JavaScript type mapping
 * - Complex number handling
 * - Special values (Inf, NaN)
 *
 * Run: npx tsx 02-variables/data-conversion.ts
 */

import {
  MATLAB_KEYWORDS,
  Matlab,
  convertToMatlab,
  inferMatlabType,
  isValidMatlabName,
  parseComplexNumber,
} from 'node-matlab';

async function main() {
  console.log('🔄 Data Type Conversion\n');

  // ─────────────────────────────────────────────────────────────
  // Part 1: JavaScript to MATLAB Conversion
  // ─────────────────────────────────────────────────────────────
  console.log('1️⃣ JavaScript → MATLAB Conversion');
  console.log('─'.repeat(50));

  const testValues = [
    // Primitives
    { js: null, desc: 'null' },
    { js: undefined, desc: 'undefined' },
    { js: true, desc: 'boolean true' },
    { js: false, desc: 'boolean false' },
    { js: 42, desc: 'integer' },
    { js: 3.14159, desc: 'float' },
    { js: Number.POSITIVE_INFINITY, desc: 'Infinity' },
    { js: Number.NEGATIVE_INFINITY, desc: '-Infinity' },
    { js: Number.NaN, desc: 'NaN' },

    // Strings
    { js: 'hello', desc: 'simple string' },
    { js: "it's a test", desc: 'string with quote' },

    // Arrays
    { js: [], desc: 'empty array' },
    { js: [1, 2, 3, 4, 5], desc: 'numeric array' },
    { js: ['a', 'b', 'c'], desc: 'string array (→ cell)' },
    {
      js: [
        [1, 2],
        [3, 4],
      ],
      desc: '2D array (→ matrix)',
    },

    // Objects
    { js: {}, desc: 'empty object' },
    { js: { x: 1, y: 2 }, desc: 'object (→ struct)' },
    { js: new Date(2024, 0, 15, 10, 30), desc: 'Date (→ datetime)' },
  ];

  console.log('| JavaScript Value       | MATLAB Code                    | Type     |');
  console.log('|------------------------|--------------------------------|----------|');

  for (const { js, desc } of testValues) {
    const matlabCode = convertToMatlab(js);
    const matlabType = inferMatlabType(js);
    const displayCode = matlabCode.length > 30 ? `${matlabCode.slice(0, 27)}...` : matlabCode;
    console.log(`| ${desc.padEnd(22)} | ${displayCode.padEnd(30)} | ${matlabType.padEnd(8)} |`);
  }
  console.log();

  // ─────────────────────────────────────────────────────────────
  // Part 2: MATLAB to JavaScript Conversion (via getVariables)
  // ─────────────────────────────────────────────────────────────
  console.log('2️⃣ MATLAB → JavaScript Conversion');
  console.log('─'.repeat(50));

  try {
    const matlabData = await Matlab.getVariables(
      `
      % Scalars
      intVal = int32(42);
      floatVal = 3.14159;
      boolVal = true;
      strVal = 'Hello';
      
      % Special values
      infVal = Inf;
      negInfVal = -Inf;
      nanVal = NaN;
      
      % Arrays
      rowVec = [1 2 3 4 5];
      colVec = [1; 2; 3];
      matrix2d = [1 2; 3 4];
      
      % Empty
      emptyArr = [];
    `,
      [
        'intVal',
        'floatVal',
        'boolVal',
        'strVal',
        'infVal',
        'negInfVal',
        'nanVal',
        'rowVec',
        'colVec',
        'matrix2d',
        'emptyArr',
      ]
    );

    console.log('Converted values:');
    for (const [key, value] of Object.entries(matlabData)) {
      const displayValue = JSON.stringify(value);
      const truncated = displayValue.length > 40 ? `${displayValue.slice(0, 37)}...` : displayValue;
      console.log(`  ${key}: ${truncated} (${typeof value})`);
    }
    console.log();
  } catch (_error) {
    console.log('  ⚠️ Skipped (requires MATLAB)\n');
  }

  // ─────────────────────────────────────────────────────────────
  // Part 3: Complex Number Parsing
  // ─────────────────────────────────────────────────────────────
  console.log('3️⃣ Complex Number Parsing');
  console.log('─'.repeat(50));

  const complexStrings = ['3+4i', '3-4i', '5i', '-2.5+3.7i', '42', 'invalid'];

  for (const str of complexStrings) {
    const result = parseComplexNumber(str);
    if (result) {
      console.log(`  "${str}" → real: ${result.real}, imag: ${result.imag}`);
    } else {
      console.log(`  "${str}" → not a complex number`);
    }
  }
  console.log();

  // ─────────────────────────────────────────────────────────────
  // Part 4: Variable Name Validation
  // ─────────────────────────────────────────────────────────────
  console.log('4️⃣ Variable Name Validation');
  console.log('─'.repeat(50));

  const names = ['valid_name', 'myVar123', '123invalid', 'with-dash', 'for', 'if', 'x', ''];

  for (const name of names) {
    const isValid = isValidMatlabName(name);
    const isKeyword = MATLAB_KEYWORDS.has(name);
    let status = isValid ? '✅ Valid' : '❌ Invalid';
    if (isKeyword) status += ' (but is keyword!)';
    console.log(`  "${name || '(empty)'}" → ${status}`);
  }
  console.log();

  // ─────────────────────────────────────────────────────────────
  // Part 5: Round-trip Conversion
  // ─────────────────────────────────────────────────────────────
  console.log('5️⃣ Round-trip Conversion Test');
  console.log('─'.repeat(50));

  try {
    const originalData = {
      numbers: [1, 2, 3, 4, 5],
      nested: {
        a: 10,
        b: 20,
      },
      text: 'test string',
    };

    console.log('Original JS data:', JSON.stringify(originalData));

    // Send to MATLAB and get back
    const code = Matlab.setVariables({ data: originalData });
    const roundTrip = await Matlab.getVariables(`${code}`, ['data']);

    console.log('After round-trip:', JSON.stringify(roundTrip.data));
    console.log();
  } catch (_error) {
    console.log('  ⚠️ Skipped (requires MATLAB)\n');
  }

  console.log('✅ Data conversion examples completed!');
}

main();
