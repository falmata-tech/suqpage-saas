import { spawnSync } from "node:child_process";

const declared = process.argv.slice(2).map((entry) => entry.replace(/^\.\//, "").replaceAll("\\", "/"));

function git(args) {
  const result = spawnSync("git", args, { encoding: "utf8" });
  if (result.status !== 0) {
    process.stderr.write(result.stderr || `git ${args.join(" ")} failed\n`);
    process.exit(result.status || 1);
  }
  return result.stdout;
}

function zeroSeparated(value) {
  return value.split("\0").filter(Boolean).map((entry) => entry.replaceAll("\\", "/"));
}

if (!declared.length) {
  console.error("Usage: node scripts/check-staged-scope.mjs <task-file-or-directory> [...]");
  process.exit(2);
}

const staged = zeroSeparated(git(["diff", "--cached", "--name-only", "-z", "--diff-filter=ACMRD"]));
if (!staged.length) {
  console.error("No staged files. Stage explicit task paths before running this check.");
  process.exit(1);
}

const isDeclared = (file) =>
  declared.some((scope) => file === scope || (scope.endsWith("/") && file.startsWith(scope)));
const outsideScope = staged.filter((file) => !isDeclared(file));
if (outsideScope.length) {
  console.error(`Staged files outside the declared task scope:\n${outsideScope.map((file) => `- ${file}`).join("\n")}`);
  process.exit(1);
}

const sensitivePath = /(^|\/)(?:data|backups|\.local|test-results|playwright-report|public\/uploads\/runtime)(?:\/|$)|(^|\/)\.env(?:$|\.)|\.(?:db|sqlite|sqlite3)$/i;
const forbidden = staged.filter((file) => file !== ".env.example" && sensitivePath.test(file));
if (forbidden.length) {
  console.error(`Sensitive or generated paths must not be committed:\n${forbidden.map((file) => `- ${file}`).join("\n")}`);
  process.exit(1);
}

const unstaged = new Set(zeroSeparated(git(["diff", "--name-only", "-z", "--diff-filter=ACMRD"])));
const partiallyStaged = staged.filter((file) => unstaged.has(file));
if (partiallyStaged.length) {
  console.error(`Task files also contain unstaged edits; resolve them before committing:\n${partiallyStaged.map((file) => `- ${file}`).join("\n")}`);
  process.exit(1);
}

const whitespace = spawnSync("git", ["diff", "--cached", "--check"], { encoding: "utf8" });
if (whitespace.status !== 0) {
  process.stderr.write(whitespace.stdout || whitespace.stderr);
  process.exit(whitespace.status || 1);
}

console.log(`Staged scope verified (${staged.length} files):`);
for (const file of staged) console.log(`- ${file}`);
