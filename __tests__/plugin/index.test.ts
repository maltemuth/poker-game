/**
 * Checks the plugin's entry point, and which packages each entry point
 * loads, following the imports through every file: Remote State only for
 * the plugin, the WebAssembly package only for the odds.
 */

import assert from "node:assert/strict";
import { it } from "node:test";
import { readFileSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import * as plugin from "../../src/plugin/index.js";

it("exports the plugin", () => {
  assert.deepEqual(Object.keys(plugin).sort(), [
    "createHoldemPlugin",
    "isSystemAction",
  ]);
});

/** Every package a source file imports, following relative imports */
const packagesImported = (entry: string): Set<string> => {
  const packages = new Set<string>();
  const seen = new Set<string>();
  const visit = (file: string) => {
    if (seen.has(file)) return;
    seen.add(file);
    const source = readFileSync(file, "utf8");
    for (const [, specifier] of source.matchAll(/from "([^"]+)"/g)) {
      if (specifier.startsWith(".")) {
        visit(resolve(dirname(file), specifier.replace(/\.js$/, ".ts")));
      } else {
        packages.add(specifier);
      }
    }
  };
  visit(entry);
  return packages;
};

it("loads Remote State only for the plugin, and the WebAssembly package only for the odds", () => {
  const src = join(process.cwd(), "src");
  const rules = packagesImported(join(src, "index.ts"));
  const pluginEntry = packagesImported(join(src, "plugin/index.ts"));
  const odds = packagesImported(join(src, "odds/index.ts"));
  assert.ok(!rules.has("@malte.muth/remote-state"));
  assert.ok(!rules.has("@malte.muth/poker-hands-wasm"));
  assert.ok(pluginEntry.has("@malte.muth/remote-state"));
  assert.ok(!pluginEntry.has("@malte.muth/poker-hands-wasm"));
  assert.ok(odds.has("@malte.muth/poker-hands-wasm"));
  assert.ok(!odds.has("@malte.muth/remote-state"));
});
