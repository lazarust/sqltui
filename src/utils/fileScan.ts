import { readdirSync } from "node:fs";

export const scanDbFiles = (dir?: string): string[] => {
  const targetDir = dir ?? ".";
  try {
    const entries = readdirSync(targetDir, { withFileTypes: true });
    return entries
      .filter((entry) => entry.isFile() && entry.name.endsWith(".db"))
      .map((entry) => entry.name)
      .sort();
  } catch {
    return [];
  }
};
