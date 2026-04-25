import net from "node:net";
import fs from "node:fs";
import path from "node:path";
import { createRequire } from "node:module";
import { spawn } from "node:child_process";

const preferredPort = Number(process.argv[2] ?? "3000");
const maxAttempts = 10;
const require = createRequire(import.meta.url);

const isPortFree = (port) =>
  new Promise((resolve) => {
    const server = net.createServer();
    server.unref();
    server.on("error", () => resolve(false));
    server.listen(port, () => {
      server.close(() => resolve(true));
    });
  });

const findAvailablePort = async () => {
  for (let port = preferredPort; port < preferredPort + maxAttempts; port += 1) {
    if (await isPortFree(port)) {
      return port;
    }
  }

  throw new Error(`No available ports found between ${preferredPort} and ${preferredPort + maxAttempts - 1}.`);
};

const main = async () => {
  const port = await findAvailablePort();
  const nextBin = require.resolve("next/dist/bin/next", { paths: [process.cwd()] });
  const nextCacheDir = path.resolve(process.cwd(), ".next");

  fs.rmSync(nextCacheDir, { recursive: true, force: true });

  if (port !== preferredPort) {
    console.log(`[dev] Port ${preferredPort} is busy. Starting Next.js on ${port} instead.`);
  }

  const child = spawn(process.execPath, [nextBin, "dev", "-p", String(port)], {
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
};

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
