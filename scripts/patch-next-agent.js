const fs = require("fs");
const path = require("path");

const target = path.join(__dirname, "..", "node_modules", "next", "dist", "server", "lib", "generate-agent-files.js");

if (!fs.existsSync(target)) {
  console.log("[patch-next-agent] target not found, skipping:", target);
  process.exit(0);
}

let content = fs.readFileSync(target, "utf-8");
let original = content;

// idempotent patch: only patch if not already patched
if (!content.includes("patched: prevent re-inject")) {
  content = content.replace(
    "function hasCurrentAgentRules(dir) {",
    "function hasCurrentAgentRules(dir) { return true; /* patched: prevent re-inject */"
  );
  content = content.replace(
    "function writeAgentFiles(projectDir) {",
    "function writeAgentFiles(projectDir) { return { agentsMd: 'skipped', claudeMd: 'skipped' }; /* patched: prevent re-inject */"
  );
  content = content.replace(
    "function upsertAgentRulesBlock(existing, block) {",
    "function upsertAgentRulesBlock(existing, block) { return existing; /* patched: prevent re-inject */"
  );

  if (content !== original) {
    fs.writeFileSync(target, content, "utf-8");
    console.log("[patch-next-agent] patched generate-agent-files.js");
  } else {
    console.log("[patch-next-agent] no changes needed");
  }
} else {
  console.log("[patch-next-agent] already patched");
}