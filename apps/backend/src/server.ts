import { env } from "./config/env.js";
import { createApp } from "./app.js";

const app = createApp();

app.listen(env.PORT, env.HOST, () => {
  const localUrl = `http://localhost:${env.PORT}`;
  console.log(`Movi API running on ${localUrl}`);
  console.log(`Swagger docs available on ${localUrl}/docs`);
});
