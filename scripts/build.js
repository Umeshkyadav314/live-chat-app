/**
 * Loads .env.local into process.env, then runs: convex codegen && next build
 * Ensures codegen runs from project root with correct env (CONVEX_DEPLOY_KEY / CONVEX_DEPLOYMENT).
 */
const { execSync } = require("child_process");
const fs = require("fs");
const path = require("path");

const projectRoot = path.join(__dirname, "..");
const envLocalPath = path.join(projectRoot, ".env.local");

if (fs.existsSync(envLocalPath)) {
  const content = fs.readFileSync(envLocalPath, "utf8");
  for (const line of content.split("\n")) {
    const trimmed = line.trim();
    if (trimmed && !trimmed.startsWith("#")) {
      const eq = trimmed.indexOf("=");
      if (eq > 0) {
        const key = trimmed.slice(0, eq).trim();
        let val = trimmed.slice(eq + 1).trim();
        if ((val.startsWith('"') && val.endsWith('"')) || (val.startsWith("'") && val.endsWith("'"))) {
          val = val.slice(1, -1);
        }
        if (!process.env[key]) process.env[key] = val;
      }
    }
  }
}

const env = { ...process.env };
const run = (cmd, opts = {}) =>
  execSync(cmd, {
    stdio: "inherit",
    cwd: projectRoot,
    env,
    ...opts,
  });

try {
  run("npx convex codegen");
} catch (err) {
  const msg = "\n  Convex codegen failed. Do one of the following:\n" +
    "  1. Run once: npx convex dev  (log in and select this project), then run build again.\n" +
    "  2. Add CONVEX_DEPLOY_KEY to .env.local from Convex Dashboard → your project → Settings → Deploy Key.\n";
  console.error(msg);
  process.exit(1);
}

run("npx next build");
