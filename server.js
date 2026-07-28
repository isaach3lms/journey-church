/**
 * The Journey Church — web server
 *
 * Serves the site as a Render Web Service. Everything the static-site
 * config used to do (redirects, cache headers, 404 page) happens here.
 *
 * Local:  npm install && npm start   ->  http://localhost:10000
 * Render: Build `npm install`, Start `npm start`
 */

const express = require("express");
const compression = require("compression");
const path = require("path");
const fs = require("fs");

const app = express();
const PORT = process.env.PORT || 10000;
const ROOT = __dirname;

app.disable("x-powered-by");
app.set("strict routing", false);

/* --- Compression ----------------------------------------------------------
   Render's static CDN gzipped automatically. A web service does not, so we
   do it here. Cuts HTML/CSS/JS by roughly 70%. Images are already compressed
   and are skipped automatically.                                            */
app.use(compression());

/* --- Security headers ---------------------------------------------------- */
app.use((req, res, next) => {
  res.setHeader("X-Content-Type-Options", "nosniff");
  res.setHeader("Referrer-Policy", "strict-origin-when-cross-origin");
  res.setHeader("X-Frame-Options", "SAMEORIGIN");
  next();
});

/* --- Never serve source files -------------------------------------------- */
const PRIVATE = new Set([
  "/server.js",
  "/package.json",
  "/package-lock.json",
  "/render.yaml",
  "/README.md",
  "/.gitignore",
]);
app.use((req, res, next) => {
  if (PRIVATE.has(req.path) || req.path.startsWith("/node_modules")) {
    return notFound(res);
  }
  next();
});

/* --- 301s preserving URLs indexed from the old Church Co site ------------- */
const REDIRECTS = {
  "/our-mission--beliefs": "/what-we-believe/",
  "/members-portal": "/connect/",
  "/form/contact": "/connect/",
  "/form/launch-team-form": "/serve-with-us/",
};
app.use((req, res, next) => {
  const key = req.path.length > 1 ? req.path.replace(/\/+$/, "") : req.path;
  const dest = REDIRECTS[key];
  if (dest) return res.redirect(301, dest);
  next();
});

/* --- Static files ---------------------------------------------------------
   Fonts are content-stable, so they get a long cache. Images and CSS get a
   shorter one so a replaced photo or a colour tweak shows up the same week
   instead of a year later.                                                  */
const YEAR = 31536000;
const WEEK = 604800;

app.use(
  "/assets/fonts",
  express.static(path.join(ROOT, "assets/fonts"), {
    maxAge: YEAR * 1000,
    immutable: true,
    fallthrough: true,
  })
);

app.use(
  "/assets",
  express.static(path.join(ROOT, "assets"), {
    maxAge: WEEK * 1000,
    fallthrough: true,
  })
);

app.use(
  express.static(ROOT, {
    extensions: ["html"], // /connect -> /connect.html if it existed
    index: "index.html", // /connect/ -> /connect/index.html
    maxAge: 3600 * 1000, // HTML: 1 hour
    setHeaders(res, filePath) {
      if (filePath.endsWith(".html")) {
        res.setHeader("Cache-Control", "public, max-age=0, must-revalidate");
      }
    },
  })
);

/* --- Trailing-slash recovery ---------------------------------------------
   /connect and /connect/ should both work. Only redirect when the page
   really exists, otherwise an unknown URL would 301 into a 404.             */
app.use((req, res, next) => {
  if (req.path.endsWith("/") || path.extname(req.path)) return next();
  const target = path.join(ROOT, req.path, "index.html");
  if (target.startsWith(ROOT) && fs.existsSync(target)) {
    const qs = req.url.indexOf("?") > -1 ? req.url.slice(req.url.indexOf("?")) : "";
    return res.redirect(301, req.path + "/" + qs);
  }
  next();
});

/* --- 404 ------------------------------------------------------------------ */
function notFound(res) {
  res.status(404).sendFile(path.join(ROOT, "404.html"));
}
app.use((req, res) => notFound(res));

app.listen(PORT, "0.0.0.0", () => {
  console.log(`The Journey Church listening on port ${PORT}`);
});
