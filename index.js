const { exec } = require("child_process");
const tempFile = require("temp-write");

const createTempFile = async (content) => {
  return await tempFile(content, "temp.m");
};
/**
 * Runs MATLAB script and gives output
 *
 * @param {string} script Runnable Script
 * @returns result
 *
 */
const run = async (script) => {
  const temporaryFile = await createTempFile(script);
  return new Promise((resolve, reject) => {
    exec(
      `matlab -nosplash -batch "run('${temporaryFile}'); exit;"`,
      (error, stdout, stderr) => {
        if (error) {
          reject(stderr.trim());
        }
        resolve(stdout.trim());
      }
    );
  });
};

module.exports = { run };
