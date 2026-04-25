import path from "node:path";

/** @type {import('next').NextConfig} */
const nextConfig = {
  transpilePackages: ["@bhutan/shared"],
  outputFileTracingRoot: path.join(import.meta.dirname, "../..")
};

export default nextConfig;
