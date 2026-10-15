#!/usr/bin/env node
/* Assembles src/ into dist/index.html. No dependencies. */
"use strict";
const fs = require("fs");
const path = require("path");
const root = path.join(__dirname, "..");
const rd = (p) => fs.readFileSync(path.join(root, "src", p), "utf8");

const FONTS = [
  ["IBM Plex Sans", 400, "ibm-plex-sans-latin-400-normal.woff2"],
  ["IBM Plex Sans", 500, "ibm-plex-sans-latin-500-normal.woff2"],
  ["IBM Plex Sans", 600, "ibm-plex-sans-latin-600-normal.woff2"],
  ["IBM Plex Mono", 400, "ibm-plex-mono-latin-400-normal.woff2"],
  ["IBM Plex Mono", 500, "ibm-plex-mono-latin-500-normal.woff2"],
  ["Schibsted Grotesk", 500, "schibsted-grotesk-latin-500-normal.woff2"],
  ["Schibsted Grotesk", 700, "schibsted-grotesk-latin-700-normal.woff2"],
];
const dist = path.join(root, "dist");
fs.mkdirSync(path.join(dist, "fonts"), { recursive: true });
let fontCss = "";
for (const [fam, w, file] of FONTS) {
  const src = path.join(root, "src", "fonts", file);
  if (!fs.existsSync(src)) continue;
  fs.copyFileSync(src, path.join(dist, "fonts", file));
  fontCss += `@font-face{font-family:"${fam}";font-weight:${w};font-style:normal;font-display:swap;src:url(fonts/${file}) format("woff2")}\n`;
}

const shell = rd("html/shell.html").replace("@@SECTIONS@@", rd("html/sections.html"));
const demo = JSON.stringify(JSON.parse(rd("demo-users.json")));
const html = `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1,viewport-fit=cover">
<meta name="robots" content="noindex,nofollow">
<meta name="referrer" content="no-referrer">
<title>Results Layer</title>
<style>
${fontCss}${rd("styles/base.css")}
${rd("styles/shell.css")}
</style>
</head>
<body data-auth="out">
<!--@login-->
${rd("html/login.html")}
<!--@/login-->
<!--@app-->
${shell}
<!--@/app-->
<!--@demo--><script id="demo-users" type="application/json">${demo}</script><!--@/demo-->
<!--@loginjs--><script>
${rd("js/login.js")}
</script><!--@/loginjs-->
<!--@appjs--><script>
${rd("js/app.js")}
</script><!--@/appjs-->
</body>
</html>
`;
fs.writeFileSync(path.join(dist, "index.html"), html);
console.log("dist/index.html", html.length, "bytes;", fontCss ? "self-hosted fonts included" : "system fonts (run npm run fonts to self-host)");
