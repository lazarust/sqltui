import { describe, expect, it } from "bun:test";
import { mkdtempSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { tmpdir } from "node:os";
import { scanDbFiles } from "./fileScan.ts";

describe("scanDbFiles", () => {
  it("should find .db files in the current directory", () => {
    const files = scanDbFiles(".");
    expect(files.length).toBeGreaterThan(0);
    expect(files).toContain("test.db");
  });

  it("should return only .db files and sort them", () => {
    const dir = mkdtempSync(join(tmpdir(), "file-scan-test-"));
    writeFileSync(join(dir, "a.db"), "");
    writeFileSync(join(dir, "b.txt"), "");
    writeFileSync(join(dir, "c.db"), "");
    writeFileSync(join(dir, "d.sqlite"), "");
    writeFileSync(join(dir, "z.db"), "");

    const files = scanDbFiles(dir);
    expect(files).toEqual(["a.db", "c.db", "z.db"]);
  });

  it("should return empty array when no .db files exist", () => {
    const dir = mkdtempSync(join(tmpdir(), "file-scan-empty-"));
    writeFileSync(join(dir, "readme.txt"), "");
    writeFileSync(join(dir, "data.csv"), "");

    const files = scanDbFiles(dir);
    expect(files).toEqual([]);
  });

  it("should return empty array for non-existent directory", () => {
    const files = scanDbFiles("/non/existent/path");
    expect(files).toEqual([]);
  });
});
