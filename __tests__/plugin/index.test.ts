/**
 * Checks the plugin's entry point, and that nothing the rules' entry point
 * imports, directly or through other files, imports Remote State.
 */

import { readFileSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import * as plugin from "../../src/plugin/index.js";

it("exports the plugin", () => {
  expect(Object.keys(plugin).sort()).toEqual([
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

it("keeps Remote State out of the rules' entry point", () => {
  const src = join(process.cwd(), "src");
  expect(packagesImported(join(src, "index.ts"))).not.toContain(
    "@malte.muth/remote-state"
  );
  expect(packagesImported(join(src, "plugin/index.ts"))).toContain(
    "@malte.muth/remote-state"
  );
});
