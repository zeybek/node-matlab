const { exec } = require("child_process");
const tempFile = require("temp-write");
const shell = require("shelljs");

const createTempFile = async (content) => {
  return await tempFile(content, "temp.m");
};

const hasMATLAB = () => {
  return !shell.which("matlab");
};

/**
 * Checks MATLAB version
 * @returns {number} version
 */
const getVersion = () => {
  return new Promise((resolve, reject) => {
    exec(`matlab -help`, (error, stdout, stderr) => {
      let version = stdout
        .trim()
        .split("\r\n")
        .reverse()[0]
        .trim()
        .match(/Version:(.*),/)[1]
        .trim()
        .split(".");

      version.length -= 1;
      version = parseFloat(version.join("."));

      if (version < 9.6) {
        reject("You must have installed MATLAB 2019a or later");
      }

      resolve(version);
    });
  });
};

/**
 * Runs MATLAB script and gives output
 * @param {string} script Runnable Script
 * @returns {string} result
 */
const run = async (script) => {
  try {
    if (hasMATLAB()) {
      return "You must have MATLAB installed";
    }
    let version = await getVersion();
    if (version) {
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
    }
  } catch (error) {
    return error;
  }
};

module.exports = { run, getVersion };
