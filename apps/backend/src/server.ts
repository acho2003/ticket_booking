import { env } from "./config/env.js";
import { createApp } from "./app.js";

const app = createApp();

const server = app.listen(env.PORT, env.HOST, () => {
  const localUrl = `http://localhost:${env.PORT}`;
  console.log(`Movi API running on ${localUrl}`);
  console.log(`Swagger docs available on ${localUrl}/docs`);
});

const shutdown = (signal: NodeJS.Signals) => {
  console.log(`[server] ${signal} received. Closing HTTP server...`);
  server.close(() => {
    process.exit(0);
  });
};

process.on("SIGTERM", shutdown);
process.on("SIGINT", shutdown);
