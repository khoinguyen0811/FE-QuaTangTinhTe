const fs = require("fs");
const path = require("path");

const root = path.resolve(__dirname, "..");
const outDir = path.join(root, "dist");

const files = [
  "index.html",
  "collection.html",
  "product.html",
  "cart.html",
  "login.html",
  "register.html",
  "about.html",
  "contact.html",
  "index.css",
  "static-client.js",
];

const directories = ["data", "public"];

function copyFile(relativePath) {
  const source = path.join(root, relativePath);
  const target = path.join(outDir, relativePath);
  fs.mkdirSync(path.dirname(target), { recursive: true });
  fs.copyFileSync(source, target);
}

function copyDirectory(relativePath) {
  const source = path.join(root, relativePath);
  const target = path.join(outDir, relativePath);
  fs.cpSync(source, target, {
    recursive: true,
    filter: (entry) => !entry.endsWith(path.join("public", "color_extractor.html")),
  });
}

fs.rmSync(outDir, { force: true, recursive: true });
fs.mkdirSync(outDir, { recursive: true });

files.forEach(copyFile);
directories.forEach(copyDirectory);

console.log(`Static site copied to ${path.relative(root, outDir)}`);
