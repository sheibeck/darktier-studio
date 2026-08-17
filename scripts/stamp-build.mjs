// Writes the build/publish timestamp so the admin can show "last published".
// Runs automatically before every build (npm "prebuild" lifecycle).
import { mkdirSync, writeFileSync } from "node:fs";

mkdirSync("public", { recursive: true });
const builtAt = new Date().toISOString();
writeFileSync("public/build-info.json", `${JSON.stringify({ builtAt })}\n`);
console.log("Stamped build:", builtAt);
