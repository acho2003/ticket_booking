import fs from "node:fs";
import path from "node:path";

const root = process.cwd();
const utilsMergeDir = path.join(root, "node_modules", "utils-merge");
const utilsMergeEntry = path.join(utilsMergeDir, "index.js");

if (fs.existsSync(utilsMergeDir) && !fs.existsSync(utilsMergeEntry)) {
  fs.writeFileSync(
    utilsMergeEntry,
    `"use strict";

module.exports = function merge(a, b) {
  if (a && b) {
    for (const key in b) {
      a[key] = b[key];
    }
  }

  return a;
};
`
  );

  console.log("[postinstall] Repaired missing utils-merge/index.js");
}
