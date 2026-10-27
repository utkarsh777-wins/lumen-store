import { spawnSync } from "node:child_process";
import { copyFileSync, existsSync } from "node:fs";

if (!existsSync(".env") && existsSync(".env.example")) {
  copyFileSync(".env.example", ".env");
  console.log("Created .env from .env.example");
}

function run(command, args) {
  const result = spawnSync(command, args, { stdio: "inherit", shell: process.platform === "win32" });
  if (result.status !== 0) {
    process.exit(result.status ?? 1);
  }
}

run("npx", ["prisma", "generate"]);
run("npx", ["prisma", "db", "push"]);
run("npx", ["tsx", "prisma/seed.ts"]);
console.log("\nLumen is ready. Start it with npm run dev");
