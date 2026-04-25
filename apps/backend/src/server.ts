import { env } from "./config/env.js";
import { createApp } from "./app.js";

const app = createApp();

app.listen(env.PORT, env.HOST, () => {
  const localUrl = `http://localhost:${env.PORT}`;
  console.log(`Bhutan Movie Booking API running on ${localUrl}`);
  console.log(`Swagger docs available on ${localUrl}/docs`);
});
