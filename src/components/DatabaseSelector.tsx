import { useState, useMemo } from "react";
import { useKeyboard, useTerminalDimensions, useRenderer } from "@opentui/react";
import { TextAttributes } from "@opentui/core";
import { useAtom } from "@effect/atom-react";
import { dbPathAtom, tableListAtom } from "../state.ts";
import { openDatabase } from "../utils/db.ts";
import { loadTableList } from "../utils/dataLoad.ts";
import { scanDbFiles } from "../utils/fileScan.ts";
import { colors } from "../colors.ts";

type FocusMode = "input" | "list";

export const DatabaseSelector = () => {
  const renderer = useRenderer();
  const { height } = useTerminalDimensions();
  const [, setDbPath] = useAtom(dbPathAtom);
  const [, setTableList] = useAtom(tableListAtom);

  const [inputValue, setInputValue] = useState("");
  const [selectedFileIndex, setSelectedFileIndex] = useState(0);
  const [focusMode, setFocusMode] = useState<FocusMode>("input");
  const [error, setError] = useState<string | null>(null);

  const dbFiles = useMemo(() => scanDbFiles(), []);

  const handleOpen = (path: string) => {
    setError(null);
    try {
      openDatabase(path);
      const tables = loadTableList();
      setTableList(tables);
      setDbPath(path);
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err));
    }
  };

  const handleConfirm = () => {
    const path = inputValue.trim()
      ? inputValue.trim()
      : dbFiles.length > 0
        ? dbFiles[selectedFileIndex]
        : null;
    if (!path) {
      setError("Enter a database path or select a file");
      return;
    }
    handleOpen(path);
  };

  useKeyboard((key) => {
    if (key.name === "q") {
      renderer.destroy();
      return;
    }

    if (key.name === "tab") {
      setFocusMode((prev) => (prev === "input" ? "list" : "input"));
      return;
    }

    if (key.name === "return") {
      handleConfirm();
      return;
    }

    if (focusMode === "input") {
      if (key.name === "backspace") {
        setInputValue((prev) => prev.slice(0, -1));
        return;
      }
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
        setInputValue((prev) => prev + key.sequence);
        return;
      }
      return;
    }

    if (focusMode === "list") {
      if (key.name === "j") {
        if (dbFiles.length > 0) {
          setSelectedFileIndex((prev) =>
            prev < dbFiles.length - 1 ? prev + 1 : prev,
          );
        }
        return;
      }
      if (key.name === "k") {
        if (dbFiles.length > 0) {
          setSelectedFileIndex((prev) => (prev > 0 ? prev - 1 : prev));
        }
        return;
      }
    }
  });

  const inputDisplay = inputValue || (focusMode === "input" ? "█" : " ");
  const cursorVisible = focusMode === "input";

  return (
    <box
      flexDirection="column"
      height={height ?? 24}
      justifyContent="center"
      alignItems="center"
      backgroundColor={colors.background}
    >
      <box
        flexDirection="column"
        border
        borderStyle="single"
        borderColor={colors.border}
        paddingX={4}
        paddingY={3}
        width={60}
      >
        <box justifyContent="center" paddingY={1}>
          <ascii-font text="SQLTUI" font="tiny" color={colors.accent} />
        </box>

        <box justifyContent="center">
          <text fg={colors.muted}>Select a Database</text>
        </box>

        <box height={1} />

        <box flexDirection="column">
          <text fg={colors.muted} attributes={TextAttributes.BOLD}>
            Path:
          </text>
          <box
            flexDirection="row"
            backgroundColor={focusMode === "input" ? colors.selectedBg : colors.background}
            border
            borderStyle="single"
            borderColor={focusMode === "input" ? colors.accent : colors.border}
            paddingX={1}
            height={3}
            alignItems="center"
          >
            <text fg={cursorVisible ? colors.text : colors.muted}>
              {inputDisplay}
            </text>
            {!cursorVisible && <text fg={colors.muted}> (tab to input)</text>}
          </box>
        </box>

        <box height={1} />

        <box flexDirection="column">
          <box
            flexDirection="row"
            backgroundColor={colors.headerBg}
            paddingX={1}
            paddingY={1}
          >
            <text fg={colors.text} attributes={TextAttributes.BOLD}>
              Available .db files
            </text>
          </box>
          <box
            flexDirection="column"
            border
            borderStyle="single"
            borderColor={focusMode === "list" ? colors.sidebarFocusedBorder : colors.border}
            height={Math.min(dbFiles.length + 2, 10)}
          >
            {dbFiles.length === 0 ? (
              <box paddingX={1} paddingY={1}>
                <text fg={colors.muted}>(no .db files found)</text>
              </box>
            ) : (
              dbFiles.map((file, index) => {
                const isSelected = index === selectedFileIndex;
                return (
                  <box
                    key={file}
                    flexDirection="row"
                    backgroundColor={isSelected ? colors.selectedBg : colors.background}
                    paddingX={1}
                  >
                    <text fg={isSelected ? colors.accent : colors.muted} width={2}>
                      {isSelected ? ">" : " "}
                    </text>
                    <text fg={isSelected ? colors.white : colors.text}>
                      {file}
                    </text>
                  </box>
                );
              })
            )}
          </box>
        </box>

        {error && (
          <box paddingY={1}>
            <text fg={colors.error}>{error}</text>
          </box>
        )}

        <box height={1} />

        <box flexDirection="row" justifyContent="center">
          <text wrapMode="none" fg={colors.accent}>Tab</text>
          <text wrapMode="none" fg={colors.muted}> switch</text>
          <text wrapMode="none" fg={colors.muted}>  │  </text>
          <text wrapMode="none" fg={colors.accent}>Enter</text>
          <text wrapMode="none" fg={colors.muted}> open</text>
          <text wrapMode="none" fg={colors.muted}>  │  </text>
          <text wrapMode="none" fg={colors.accent}>q</text>
          <text wrapMode="none" fg={colors.muted}> quit</text>
        </box>
      </box>
    </box>
  );
};
