const matlab = require("../lib/index");

matlab
  .run("3 + 4")
  .then((result) => console.log(result))
  .catch((error) => console.log(error));
