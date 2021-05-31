const matlab = require("../lib/index");

matlab
  .run("file.m")
  .then((result) => console.log(result))
  .catch((error) => console.log(error));
