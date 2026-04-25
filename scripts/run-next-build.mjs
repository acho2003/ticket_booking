import path from "node:path";
import { createRequire } from "node:module";
import { spawn } from "node:child_process";

const require = createRequire(import.meta.url);
const nextBin = require.resolve("next/dist/bin/next", { paths: [process.cwd()] });

const child = spawn(process.execPath, [nextBin, "build"], {
  cwd: process.cwd(),
  stdio: "inherit",
  env: {
    ...process.env,
    NEXT_IGNORE_INCORRECT_LOCKFILE: "1"
  }
});

child.on("exit", (code) => {
  process.exit(code ?? 0);
});
