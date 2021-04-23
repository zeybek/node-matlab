const { exec } = require("child_process");
const shell = require("shelljs");
const fs = require("fs-extra");
const os = require("os");
const path = require("path");

async function createTempFile(fileName) {
  if (!shell.which("matlab")) {
    shell.echo("Please Install MATLAB");
  } else {
    const tempFile = await fs.mkdtemp(path.join(os.tmpdir(), `${fileName}.m`));

    return new Promise((resolve, reject) => {
      exec(
        `matlab -nosplash -batch "run('${path.join(
          os.tmpdir(),
          fileName,
          ".m"
        )}')"`,
        (error, stdout, stderr) => {
          if (error) {
            reject(stderr.trim());
          }
          resolve(stdout.trim());
        }
      );
    });
  }
}

async function main() {
  const create = await createTempFile("my-test-file");
  console.log(create);
}

main();
