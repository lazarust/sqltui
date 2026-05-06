import { TextAttributes } from "@opentui/core";
import { useAtomValue } from "@effect/atom-react";
import { tableDataAtom } from "../state.ts";
import { colors } from "../colors.ts";

export const Header = () => {
  const tableData = useAtomValue(tableDataAtom);

  const rowCount = tableData.length;
  const columns = tableData.length > 0
    ? Object.keys(tableData[0] as Record<string, unknown>)
    : [];


  return (
    <box height={3} flexDirection="column">
      {/* Main header line */}
      <box height={1} flexDirection="row">
        <text wrapMode="none" fg={colors.accent} attributes={TextAttributes.BOLD}>
          SQLTUI
        </text>
        <text wrapMode="none" fg={colors.muted}>  │  </text>
        <text wrapMode="none" fg={colors.text}>
          {rowCount} rows
        </text>
        {columns.length > 0 && (
          <>
            <text wrapMode="none" fg={colors.muted}>  │  </text>
            <text wrapMode="none" fg={colors.text}>
              {columns.length} columns
            </text>
          </>
        )}
      </box>

      {/* Separator line */}
      <box height={1}>
        <text wrapMode="none" fg={colors.border}>
          {"─".repeat(80)}
        </text>
      </box>
    </box>
  );
};
