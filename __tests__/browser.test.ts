/**
 * Tests that the package loads in a browser: its source imports none of
 * Node's own modules, so clients can import the rules, the views and the
 * option checks.
 */

import assert from "node:assert/strict";
import { readdirSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { it } from "node:test";

const sourceFiles = (directory: string): string[] =>
  readdirSync(directory, { withFileTypes: true }).flatMap((entry) =>
    entry.isDirectory()
      ? sourceFiles(join(directory, entry.name))
      : entry.name.endsWith(".ts")
        ? [join(directory, entry.name)]
        : []
  );

it("imports none of Node's own modules", () => {
  const root = join(import.meta.dirname, "..", "src");
  const nodeImports = sourceFiles(root).filter((file) =>
    /from\s+["']node:/.test(readFileSync(file, "utf8"))
  );
  assert.deepEqual(nodeImports, []);
});
