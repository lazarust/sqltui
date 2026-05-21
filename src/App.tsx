import { useEffect, useCallback } from "react";
import type { KeyEvent } from "@opentui/core";
import { useRenderer, useKeyboard, useTerminalDimensions } from "@opentui/react";
import { useAtom, useAtomValue } from "@effect/atom-react";
import {
  selectedRowIndexAtom,
  selectedColIndexAtom,
  editModeAtom,
  editValueAtom,
  loadErrorAtom,
  tableDataAtom,
  pendingQuitAtom,
  selectedTableNameAtom,
  tableListAtom,
  selectedTableIndexAtom,
  sidebarFocusedAtom,
  dbPathAtom,
} from "./state.ts";
import { Header } from "./components/Header.tsx";
import { Footer } from "./components/Footer.tsx";
import { Table } from "./components/Table.tsx";
import { SideBar } from "./components/SideBar.tsx";
import { DatabaseSelector } from "./components/DatabaseSelector.tsx";
import { closeDatabase, updateCell } from "./utils/db.ts";
import { loadTableData } from "./utils/dataLoad.ts";
import { colors } from "./colors.ts";
import type { SQLiteValue } from "./utils/db.ts";

export const App = () => {
  const renderer = useRenderer();
  const { height } = useTerminalDimensions();

  // State atoms
  const [selectedRow, setSelectedRow] = useAtom(selectedRowIndexAtom);
  const [selectedCol, setSelectedCol] = useAtom(selectedColIndexAtom);
  const [editMode, setEditMode] = useAtom(editModeAtom);
  const [editValue, setEditValue] = useAtom(editValueAtom);
  const [, setLoadError] = useAtom(loadErrorAtom);
  const [, setTableData] = useAtom(tableDataAtom);
  const [pendingQuit, setPendingQuit] = useAtom(pendingQuitAtom);
  const [selectedTableIndex, setSelectedTableIndex] = useAtom(selectedTableIndexAtom);
  const [selectedTableName, setSelectedTableName] = useAtom(selectedTableNameAtom);
  const [sidebarFocused, setSidebarFocused] = useAtom(sidebarFocusedAtom);
  const tableList = useAtomValue(tableListAtom);
  const dbPath = useAtomValue(dbPathAtom);

  const data = useAtomValue(tableDataAtom);
  const columns = data.length > 0 ? Object.keys(data[0] as Record<string, unknown>) : [];

  useEffect(() => {
    return () => {
      closeDatabase();
    };
  }, []);

  const handleTableSelect = useCallback((tableName: string) => {
    setSelectedTableName(tableName);
    setSelectedTableIndex(tableList.findIndex((t) => t === tableName));
    setSidebarFocused(false);
    setSelectedRow(0);
    setSelectedCol(0);
    try {
      setTableData(loadTableData(tableName));
      setLoadError(null);
    } catch (error) {
      setLoadError(error instanceof Error ? error.message : String(error));
    }
  }, [tableList, setSelectedTableName, setSelectedTableIndex, setSidebarFocused, setSelectedRow, setSelectedCol, setTableData]);

  // Set background color
  useEffect(() => {
    renderer.setBackgroundColor(colors.background);
  }, [renderer]);

  // Coerce edited value (mirrors original coerceEditedValue)
  const coerceEditedValue = useCallback(
    (currentValue: unknown, nextValue: string): SQLiteValue => {
      if (currentValue === null && nextValue === "") {
        return null;
      }
      if (typeof currentValue === "number") {
        const numericValue = Number(nextValue);
        if (Number.isNaN(numericValue)) {
          throw new Error("Expected a numeric value");
        }
        return numericValue;
      }
      if (typeof currentValue === "bigint") {
        try {
          return BigInt(nextValue);
        } catch {
          throw new Error("Expected an integer value");
        }
      }
      if (typeof currentValue === "boolean") {
        const lower = nextValue.toLowerCase();
        if (lower === "true" || lower === "1") return true;
        if (lower === "false" || lower === "0") return false;
        throw new Error("Expected a boolean value (true/false/1/0)");
      }
      if (currentValue instanceof Uint8Array) {
        throw new Error("Cannot edit binary data");
      }
      return nextValue;
    },
    [],
  );

  // Handle edit mode keys
  const handleEditModeKeys = useCallback(
    (key: KeyEvent) => {
      if (data.length === 0) return;

      const currentCol = columns[selectedCol];
      if (!currentCol) return;

      // Exit edit mode (discard)
      if (key.name === "escape") {
        setEditMode(false);
        setEditValue("");
        return;
      }

      // Commit edit
      if (key.name === "return") {
        const row = data[selectedRow];
        if (row) {
          const rowId = (row as Record<string, unknown>).id;
          if (typeof rowId !== "number") {
            console.error("Unable to save edit: row is missing a numeric id");
            return;
          }

          try {
            const nextValue = coerceEditedValue(
              (row as Record<string, unknown>)[currentCol],
              editValue,
            );
            if (selectedTableName) {
              updateCell(selectedTableName, rowId, currentCol, nextValue);
              setTableData(loadTableData(selectedTableName));
            } else {
              console.log("Select a table first using the sidebar");
              setEditMode(false);
              setEditValue("");
              return;
            }
          } catch (error) {
            console.error("Unable to save edit:", error);
            return;
          }
        } else {
          console.warn("Attempted to edit a row that couldn't be found!")
        }

        setEditMode(false);
        setEditValue("");
        return;
      }

      // Handle text input
      if (key.name === "backspace") {
        setEditValue((prev: string) => prev.slice(0, -1));
        return;
      }

      // Regular character input
      if (
        key.sequence &&
        key.sequence.length > 0 &&
        !key.ctrl &&
        !key.meta &&
        key.sequence[0] !== "\x1b"
      ) {
        if (key.sequence.length === 1 && key.sequence.charCodeAt(0) < 32) {
          return;
        }
        setEditValue((prev: string) => prev + key.sequence);
      }
    },
    [
      data,
      columns,
      selectedRow,
      selectedCol,
      editValue,
      coerceEditedValue,
      setEditMode,
      setEditValue,
      setTableData,
    ],
  );

  // Handle navigation keys
  const handleNavigationKeys = useCallback(
    (key: KeyEvent) => {
      if (data.length === 0) return;

      const numRows = data.length;
      const numCols = columns.length;

      // Navigate left (previous column)
      if (key.name === "h" || (key.name === "tab" && key.shift)) {
        if (selectedCol > 0) {
          setSelectedCol((prev: number) => prev - 1);
        } else if (key.name === "tab" && key.shift && selectedRow > 0) {
          // Shift+Tab at first column wraps to previous row
          setSelectedRow((prev: number) => prev - 1);
          setSelectedCol(numCols - 1);
        }
        return;
      }

      // Navigate down (next row)
      if (key.name === "j") {
        if (selectedRow < numRows - 1) {
          setSelectedRow((prev: number) => prev + 1);
        }
        return;
      }

      // Navigate up (previous row)
      if (key.name === "k") {
        if (selectedRow > 0) {
          setSelectedRow((prev: number) => prev - 1);
        }
        return;
      }

      // Navigate right (next column)
      if (key.name === "l" || key.name === "tab") {
        if (selectedCol < numCols - 1) {
          setSelectedCol((prev: number) => prev + 1);
        } else if (key.name === "tab") {
          // Tab at last column wraps to next row
          if (selectedRow < numRows - 1) {
            setSelectedRow((prev: number) => prev + 1);
            setSelectedCol(0);
          }
        }
        return;
      }

      // Enter edit mode
      if (key.name === "i") {
        const currentCol = columns[selectedCol];
        if (!currentCol) return;
        const row = data[selectedRow];
        if (row) {
          setEditValue(String((row as Record<string, unknown>)[currentCol] ?? ""));
          setEditMode(true);
        }
        return;
      }
    },
    [
      data,
      columns,
      selectedRow,
      selectedCol,
      setSelectedRow,
      setSelectedCol,
      setEditMode,
      setEditValue,
    ],
  );

  // Main keyboard handler
  useKeyboard((key: KeyEvent) => {
    if (dbPath === null) {
      return;
    }

    // Cancel pending quit on any other key
    if (pendingQuit && key.name !== "q") {
      setPendingQuit(false);
    }

    // Toggle console
    if (key.name === "`") {
      renderer.console.toggle();
      return;
    }

    // Toggle sidebar focus
    if (key.name === "t") {
      setSidebarFocused(!sidebarFocused);
      return;
    }

    // Sidebar keyboard navigation
    if (sidebarFocused) {
      if (key.name === "j") {
        if (selectedTableIndex === -1) {
          setSelectedTableIndex(0);
        } else if (selectedTableIndex < tableList.length - 1) {
          setSelectedTableIndex(selectedTableIndex + 1);
        }
        return;
      }

      if (key.name === "k") {
        if (selectedTableIndex === -1) {
          setSelectedTableIndex(0);
        } else if (selectedTableIndex > 0) {
          setSelectedTableIndex(selectedTableIndex - 1);
        }
        return;
      }

      if (key.name === "return") {
        const index = selectedTableIndex === -1 ? 0 : selectedTableIndex;
        const tableName = tableList[index];
        if (tableName) {
          handleTableSelect(tableName);
        }
        return;
      }

      return;
    }

    // Quit
    if (key.name === "q") {
      if (pendingQuit) {
        renderer.destroy();
        return;
      }
      setPendingQuit(true);
      console.log("Press 'q' again to quit");
      return;
    }

    if (key.name === "r" && key.ctrl) {
      if (selectedTableName) {
        try {
          setTableData(loadTableData(selectedTableName));
          setLoadError(null);
        } catch (error) {
          setLoadError(
            error instanceof Error ? error.message : String(error),
          );
        }
      }
      return;
    }

    // Handle edit mode
    if (editMode) {
      handleEditModeKeys(key);
      return;
    }

    // Handle navigation mode
    handleNavigationKeys(key);
  });

  if (dbPath === null) {
    return <DatabaseSelector />;
  }

  return (
    <box flexDirection="column" height={height ?? 24}>
      <Header />
      <box
        flexGrow={1}
        flexDirection="row"
      >
        <SideBar />
        <box
          flexGrow={1}
          justifyContent="center"
          alignItems="center"
        >
          <box flexDirection="column">
            <Table />
          </box>
        </box>
      </box>
      <Footer />
    </box>
  );
};
