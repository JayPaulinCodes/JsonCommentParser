const JCP = require("../lib/index");
// ESM: import * as JCP from "@devjacob/jcp"

console.log(JCP.parsefromFile("./tsconfig.json", { eol: "CRLF" }));