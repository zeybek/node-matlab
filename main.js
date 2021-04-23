const { exec } = require("child_process");

let mCode =
  "clc;clear;\nsyms f(w)\n\nnumerator = (2.7 + 1 * j * w);\ndenominator = 5.7 + (1 * j * 9.3 * w);\n\nf(w) = numerator / denominator;\nw = 5;\nresult = eval(f);\nangle(result)";

// console.log([mCode]);
let mCommand = (command) => {
  console.log(command);
  return new Promise((resolve, reject) => {
    exec(command, (error, stdout, stderr) => {
      if (error) {
        reject(stderr);
      }
      resolve(stdout);
    });
  });
};

async function main() {
  const result = await mCommand(`matlab -nosplash -batch "${mCode}"`)
    .then((result) => {
      console.log(result);
    })
    .catch((error) => console.log(error));
}

main();
