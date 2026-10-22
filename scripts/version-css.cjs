"use strict";

const { createHash } = require("node:crypto");
const { readFileSync, writeFileSync } = require("node:fs");
const { resolve } = require("node:path");

// Keep cached styles paired with the HTML from the same production build.
const root = resolve(__dirname, "..");
const version = createHash("sha256")
  .update(readFileSync(resolve(root, "style/syling.css")))
  .digest("hex").slice(0, 12);
const path = resolve(root, "index.html");
const html = readFileSync(path, "utf8");
const stylesheet = /href="\.\/style\/syling\.css(?:\?[^\"]*)?"/;
if (!stylesheet.test(html)) throw new Error("Production stylesheet link is missing from index.html.");
const updated = html.replace(stylesheet, `href="./style/syling.css?v=${version}"`);
if (updated !== html) writeFileSync(path, updated);
