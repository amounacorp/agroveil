// Patch for broken @react-native/debugger-shell@0.85.3 npm publish.
// The private/LaunchUtils.js file is missing from the published package.
const fs = require('fs');
const path = require('path');

const target = path.join(
  __dirname,
  '../node_modules/@react-native/debugger-shell/dist/node/private/LaunchUtils.js'
);

if (fs.existsSync(target)) {
  process.exit(0);
}

const dir = path.dirname(target);
if (!fs.existsSync(dir)) {
  fs.mkdirSync(dir, { recursive: true });
}

fs.writeFileSync(
  target,
  `"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.prepareDebuggerShellFromDotSlashFile = prepareDebuggerShellFromDotSlashFile;
exports.spawnAndGetStderr = spawnAndGetStderr;
const fs = require("fs");
const { spawn } = require("child_process");
async function prepareDebuggerShellFromDotSlashFile(binaryPath) {
  try {
    if (!fs.existsSync(binaryPath)) return { code: "binary_not_found" };
    return { code: "success" };
  } catch (e) {
    return { code: "unexpected_error", verboseInfo: e.message };
  }
}
async function spawnAndGetStderr(binaryPath, args) {
  return new Promise((resolve) => {
    try {
      const child = spawn(binaryPath, args, { stdio: ["ignore", "ignore", "pipe"], windowsHide: true });
      let stderr = "";
      if (child.stderr) child.stderr.on("data", (d) => { stderr += String(d); });
      child.on("close", (code) => resolve({ code: code ?? 1, stderr }));
      child.on("error", (e) => resolve({ code: 1, stderr: e.message }));
    } catch (e) {
      resolve({ code: 1, stderr: String(e) });
    }
  });
}
`
);
console.log('Patched @react-native/debugger-shell: private/LaunchUtils.js created.');
