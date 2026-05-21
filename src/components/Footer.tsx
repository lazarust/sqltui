import { useAtomValue } from "@effect/atom-react";
import { tableDataAtom, selectedRowIndexAtom, selectedColIndexAtom, editModeAtom } from "../state.ts";
import { colors } from "../colors.ts";

export const Footer = () => {
  const editMode = useAtomValue(editModeAtom);

  const modeText = editMode ? "[EDIT]" : "[NAVIGATE]";
  const tableData = useAtomValue(tableDataAtom);

  const columns = tableData.length > 0
    ? Object.keys(tableData[0] as Record<string, unknown>)
    : [];

  const selectedRow = useAtomValue(selectedRowIndexAtom);
  const selectedCol = useAtomValue(selectedColIndexAtom);
  const rowText = tableData.length > 0 ? `${selectedRow + 1}/${tableData.length}` : "";
  const colText = columns.length > 0 ? columns[selectedCol] || "" : "";
  if (editMode) {
    return (
      <box height={1} flexDirection="row">
        <text wrapMode="none" fg={colors.accent}>esc</text>
        <text wrapMode="none" fg={colors.muted}> cancel</text>
        <text wrapMode="none" fg={colors.muted}>  │  </text>
        <text wrapMode="none" fg={colors.accent}>enter</text>
        <text wrapMode="none" fg={colors.muted}> save</text>
        <text wrapMode="none" fg={colors.muted}>  │  </text>
        <text wrapMode="none" fg={colors.accent}>⌫</text>
        <text wrapMode="none" fg={colors.muted}> delete</text>
        <box flexGrow={1} />
        <text wrapMode="none" fg={editMode ? colors.statusText : colors.muted}>
          {modeText}
        </text>
        <text wrapMode="none" fg={colors.muted}>  </text>
        <text wrapMode="none" fg={colors.text}>Row {rowText}</text>
        <text wrapMode="none" fg={colors.muted}>  </text>
        <text wrapMode="none" fg={colors.text}>Col: {colText}</text>
      </box>
    );
  }

  return (
    <box height={1} flexDirection="row">
      <text wrapMode="none" fg={colors.accent}>j/k</text>
      <text wrapMode="none" fg={colors.muted}> navigate</text>
      <text wrapMode="none" fg={colors.muted}>  │  </text>
      <text wrapMode="none" fg={colors.accent}>h/l</text>
      <text wrapMode="none" fg={colors.muted}> columns</text>
      <text wrapMode="none" fg={colors.muted}>  │  </text>
      <text wrapMode="none" fg={colors.accent}>i</text>
      <text wrapMode="none" fg={colors.muted}> edit</text>
      <text wrapMode="none" fg={colors.muted}>  │  </text>
      <text wrapMode="none" fg={colors.accent}>t</text>
      <text wrapMode="none" fg={colors.muted}> table selector</text>
      <text wrapMode="none" fg={colors.muted}>  │  </text>
      <text wrapMode="none" fg={colors.accent}>ctrl+r</text>
      <text wrapMode="none" fg={colors.muted}> refresh</text>
      <text wrapMode="none" fg={colors.muted}>  │  </text>
      <text wrapMode="none" fg={colors.accent}>qq</text>
      <text wrapMode="none" fg={colors.muted}> quit</text>
      <box flexGrow={1} />
      <text wrapMode="none" fg={editMode ? colors.statusText : colors.muted}>
        {modeText}
      </text>
      <text wrapMode="none" fg={colors.muted}>  </text>
      <text wrapMode="none" fg={colors.text}>Row {rowText}</text>
      <text wrapMode="none" fg={colors.muted}>  </text>
      <text wrapMode="none" fg={colors.text}>Col: {colText}</text>
    </box>
  );
};
