import { TextAttributes } from "@opentui/core";
import { useAtomValue } from "@effect/atom-react";
import type { ReactNode } from "react";
import {
  tableDataAtom,
  selectedRowIndexAtom,
  selectedColIndexAtom,
  editModeAtom,
  editValueAtom,
  loadErrorAtom,
} from "../state.ts";
import { colors } from "../colors.ts";

const MIN_COLUMN_WIDTH = 8;
const MAX_COLUMN_WIDTH = 30;
const GUTTER_WIDTH = 5;

export const Table = () => {
  const data = useAtomValue(tableDataAtom);
  const selectedRowIndex = useAtomValue(selectedRowIndexAtom);
  const selectedColIndex = useAtomValue(selectedColIndexAtom);
  const editMode = useAtomValue(editModeAtom);
  const editValue = useAtomValue(editValueAtom);
  const loadError = useAtomValue(loadErrorAtom);

  if (loadError) {
    return (
      <box
        border
        borderStyle="single"
        borderColor={colors.border}
        backgroundColor={colors.background}
        padding={1}
      >
        <text fg={colors.error}>{loadError}</text>
      </box>
    );
  }

  if (!data.length) {
    return (
      <box
        border
        borderStyle="single"
        borderColor={colors.border}
        backgroundColor={colors.background}
        padding={1}
      >
        <text attributes={TextAttributes.DIM}>No data</text>
      </box>
    );
  }

  const columns = Object.keys(data[0] as Record<string, unknown>);

  if (!columns.length) {
    return (
      <box
        border
        borderStyle="single"
        borderColor={colors.border}
        backgroundColor={colors.background}
        padding={1}
      >
        <text attributes={TextAttributes.DIM}>Empty row schema</text>
      </box>
    );
  }

  const columnWidths = columns.map((col) => {
    const headerLen = col.length;
    const dataLen = Math.max(
      ...data.map((row) => String((row as Record<string, unknown>)[col] ?? "").length),
      0,
    );
    const width = Math.max(headerLen, dataLen) + 2;
    return Math.min(Math.max(width, MIN_COLUMN_WIDTH), MAX_COLUMN_WIDTH);
  });

  const totalWidth =
    GUTTER_WIDTH + columnWidths.reduce((sum, w) => sum + w + 1, 0) + 1;
  const tableHeight = 12;
  const visibleRows = tableHeight - 1;
  const needsScroll = data.length > visibleRows;
  const maxStartRow = Math.max(0, data.length - visibleRows);
  const startRow = needsScroll ? Math.min(selectedRowIndex, maxStartRow) : 0;
  const endRow = startRow + visibleRows;
  const visibleData = data.slice(startRow, endRow);

  const renderHeader = (): ReactNode => {
    const gutterCell = " ".repeat(GUTTER_WIDTH - 1);
    return (
      <box flexDirection="row" backgroundColor={colors.headerBg}>
        <box width={GUTTER_WIDTH} backgroundColor={colors.headerBg}>
          <text
            fg={colors.text}
            attributes={TextAttributes.BOLD}
          >
            {gutterCell}
          </text>
        </box>
        {columns.map((col, colIndex) => {
          const w = columnWidths[colIndex]!;
          const displayCol = col.toUpperCase().slice(0, w - 1);
          const padded = displayCol + " ".repeat(w - displayCol.length);
          return (
            <box
              key={colIndex}
              width={w}
              backgroundColor={colors.headerBg}
            >
              <text fg={colors.text} attributes={TextAttributes.BOLD}>
                {padded}
              </text>
            </box>
          );
        })}
      </box>
    );
  };

  const renderRow = (
    rowIndex: number,
    row: Record<string, unknown>,
    isSelected: boolean,
  ): ReactNode => {
    const rowNum = String(rowIndex + 1).padStart(GUTTER_WIDTH - 2, " ");
    const indicator = isSelected ? "▶" : " ";
    const bgColor = isSelected
      ? editMode
        ? colors.selectedBgEdit
        : colors.selectedBg
      : colors.background;
    const fgColor = isSelected ? colors.white : colors.text;

    const cells = columns.map((col, colIndex) => {
      const isEditing = isSelected && editMode && selectedColIndex === colIndex;
      const w = columnWidths[colIndex]!;
      let value = String(row[col] ?? "");

      if (isEditing && colIndex === selectedColIndex) {
        value = editValue;
      }

      const displayValue = value.slice(0, w - 1);
      const padded = displayValue + " ".repeat(w - displayValue.length);
      const cellBg = isSelected && colIndex === selectedColIndex
        ? (editMode ? colors.selectedBgEdit : colors.activeCellBg)
        : bgColor;

      return (
        <box
          key={colIndex}
          width={w}
          backgroundColor={cellBg}
        >
          <text
            fg={isSelected && colIndex === selectedColIndex ? colors.white : fgColor}
          >
            {padded}
          </text>
        </box>
      );
    });

    return (
      <box key={rowIndex} flexDirection="row" backgroundColor={bgColor}>
        <box
          width={GUTTER_WIDTH}
          backgroundColor={bgColor}
          flexDirection="row"
        >
          <text fg={isSelected ? colors.rowIndicator : colors.muted}>
            {indicator}
          </text>
          <text fg={colors.rowNumber}>{rowNum}</text>
        </box>
        {cells}
      </box>
    );
  };

  return (
    <box flexDirection="column" backgroundColor={colors.background}>
      <box flexDirection="column" width={totalWidth}>
        {renderHeader()}
      </box>
      <box flexDirection="column">
        {visibleData.map((row, rowIndex) =>
          renderRow(rowIndex + startRow, row as Record<string, unknown>, selectedRowIndex === rowIndex + startRow)
        )}
      </box>
    </box>
  );
};
