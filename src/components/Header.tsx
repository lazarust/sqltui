import { TextAttributes } from "@opentui/core";
import { useTerminalDimensions } from "@opentui/react";
import { useAtomValue } from "@effect/atom-react";
import { tableDataAtom, dbPathAtom } from "../state.ts";
import { colors } from "../colors.ts";

const basename = (path: string): string => {
  const idx = path.lastIndexOf("/");
  return idx >= 0 ? path.slice(idx + 1) : path;
};

export const Header = () => {
  const { width: termWidth } = useTerminalDimensions();
  const tableData = useAtomValue(tableDataAtom);
  const dbPath = useAtomValue(dbPathAtom);

  const columns = tableData.length > 0
    ? Object.keys(tableData[0] as Record<string, unknown>)
    : [];

  const separatorWidth = Math.max(termWidth ?? 80, 40);

  return (
    <box height={3} flexDirection="column">
      <box height={1} flexDirection="row">
        <text wrapMode="none" fg={colors.accent} attributes={TextAttributes.BOLD}>
          SQLTUI
        </text>
        {columns.length > 0 && (
          <>
            <text wrapMode="none" fg={colors.muted}>  │  </text>
            <text wrapMode="none" fg={colors.text}>
              {columns.length} columns
            </text>
          </>
        )}
        {dbPath && (
          <>
            <text wrapMode="none" fg={colors.muted}>  │  </text>
            <text wrapMode="none" fg={colors.muted}>
              {basename(dbPath)}
            </text>
          </>
        )}
      </box>

      <box height={1}>
        <text wrapMode="none" fg={colors.border}>
          {"─".repeat(separatorWidth)}
        </text>
      </box>
    </box>
  );
};
