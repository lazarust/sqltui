import { useAtomValue } from "@effect/atom-react";
import { TextAttributes } from "@opentui/core";
import { tableListAtom, selectedTableIndexAtom, sidebarFocusedAtom } from "../state.ts";
import { colors } from "../colors.ts";

interface SideBarProps {
  width?: number;
}

export const SideBar = ({ width = 20 }: SideBarProps) => {
  const tables = useAtomValue(tableListAtom);
  const selectedIndex = useAtomValue(selectedTableIndexAtom);
  const sidebarFocused = useAtomValue(sidebarFocusedAtom);

  return (
    <box
      flexDirection="column"
      width={width}
      height="100%"
      backgroundColor={colors.background}
      border
      borderStyle="single"
      borderColor={sidebarFocused ? colors.sidebarFocusedBorder : colors.border}
    >
      <box backgroundColor={colors.headerBg} paddingX={1} paddingY={1}>
        <text
          fg={colors.text}
          attributes={TextAttributes.BOLD}
        >
          Tables
        </text>
      </box>
      <box flexDirection="column" flexGrow={1}>
        {tables.length === 0 ? (
          <box paddingX={1} paddingY={1}>
            <text fg={colors.muted}>(no tables)</text>
          </box>
        ) : (
          tables.map((table, index) => {
            const isSelected = index === selectedIndex;
            return (
              <box
                key={table}
                flexDirection="row"
                backgroundColor={isSelected ? colors.selectedBg : colors.background}
                paddingX={1}
              >
                <text
                  fg={isSelected ? colors.accent : colors.muted}
                  width={2}
                >
                  {isSelected ? ">" : " "}
                </text>
                <text
                  fg={isSelected ? colors.white : colors.text}
                >
                  {table}
                </text>
              </box>
            );
          })
        )}
      </box>
    </box>
  );
};
