/**
 * Cache-busting stamper.
 *
 * CSS and JS filenames carry no content hash, so a browser that cached them
 * will not re-request them and an edit silently fails to reach anyone who
 * visited before. This rewrites every page's CSS/JS links to
 * /assets/.../file.ext?v=<first 8 of sha1>, so the URL changes exactly when
 * the file does, and never otherwise.
 *
 * Runs automatically before `npm start`, so a deploy always ships correct
 * stamps whether or not anyone remembered to run it.
 *
 * It must never take the site down: any failure is logged and ignored.
 */
const fs = require("fs");
const path = require("path");
const crypto = require("crypto");

const ROOT = path.join(__dirname, "..");
const ASSETS = ["assets/css/site.css", "assets/css/fonts.css", "assets/js/site.js"];

function hash(file) {
  return crypto.createHash("sha1").update(fs.readFileSync(file)).digest("hex").slice(0, 8);
}

function pages(dir, found) {
  found = found || [];
  for (const name of fs.readdirSync(dir)) {
    if (name === "node_modules" || name === ".git" || name === "tools") continue;
    const p = path.join(dir, name);
    const st = fs.statSync(p);
    if (st.isDirectory()) pages(p, found);
    else if (name.endsWith(".html")) found.push(p);
  }
  return found;
}

try {
  const stamps = {};
  for (const rel of ASSETS) {
    const abs = path.join(ROOT, rel);
    if (fs.existsSync(abs)) stamps["/" + rel] = hash(abs);
  }

  let changed = 0;
  for (const page of pages(ROOT)) {
    const before = fs.readFileSync(page, "utf8");
    let after = before;
    for (const [url, h] of Object.entries(stamps)) {
      const re = new RegExp(url.replace(/[.]/g, "\\.") + "(\\?v=[0-9a-f]+)?", "g");
      after = after.replace(re, url + "?v=" + h);
    }
    if (after !== before) {
      fs.writeFileSync(page, after);
      changed++;
    }
  }
  console.log("stamp: " + changed + " page(s) updated");
} catch (err) {
  console.warn("stamp: skipped (" + err.message + ")");
}
