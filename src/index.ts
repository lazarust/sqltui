import {
  ASCIIFont,
  Box,
  KeyEvent,
  createCliRenderer,
  ConsolePosition,
  Text,
  TextAttributes,
} from "@opentui/core";
import { getTestRows } from "./utils/db.ts";

const rowLines = (() => {
  try {
    const rows = getTestRows();
    if (!rows.length) {
      return [Text({ content: "No rows in test table", attributes: TextAttributes.DIM })];
    }
    return rows.map((row) => {
      const cells = Object.entries(row).map(([key, value]) => `${key}: ${value}`);
      return Text({ content: cells.join(" • ") });
    });
  } catch (error) {
    return [
      Text({
        content: "Unable to load test table",
        attributes: TextAttributes.DIM,
      }),
    ];
  }
})();

const renderer = await createCliRenderer({
  consoleOptions: {
    position: ConsolePosition.BOTTOM,
    sizePercent: 30,
  },
})

renderer.root.add(
  Box(
    { alignItems: "center", justifyContent: "center", flexGrow: 1 },
    Box(
      { justifyContent: "center", alignItems: "flex-end" },
      ASCIIFont({ font: "tiny", text: "OpenTUI" }),
      Text({ content: "What will you build?", attributes: TextAttributes.DIM }),
    ),
    Box(
      { flexDirection: "column", gap: 0, marginTop: 1, width: "80%" },
      ...rowLines,
    ),
  ),
);

renderer.keyInput.on("keypress", (key) => {
  if (key.name === "`") {
    renderer.console.toggle()
  }

  if (key.name === "q") {
    renderer.destroy()
    process.exit()
  }

})
