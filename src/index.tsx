import { createCliRenderer, ConsolePosition } from "@opentui/core";
import { createRoot } from "@opentui/react";
import { App } from "./App.tsx";
import { loadTableData } from "./utils/dataLoad.ts";

// Try to load initial data before creating renderer
let initialData: Array<Record<string, unknown>> = [];
let initialError: string | null = null;

try {
  initialData = loadTableData();
} catch (error) {
  initialError = error instanceof Error ? error.message : String(error);
  console.error("Failed to load initial data:", error);
}

const renderer = await createCliRenderer({
  consoleOptions: {
    position: ConsolePosition.BOTTOM,
    sizePercent: 30,
  },
});

createRoot(renderer).render(
  <App initialData={initialData} initialError={initialError} />,
);
