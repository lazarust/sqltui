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
import { Table } from "./components/Table.ts";

const rowLines = (() => {
  try {
    const rows = getTestRows();
    return Table({ data: rows });
  } catch (error) {
    return Box(
      { border: true, padding: 1 },
      Text({
        content: "Unable to load test table",
        attributes: TextAttributes.DIM,
      }),
    );
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
      rowLines,
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
