import { TextAttributes } from "@opentui/core";
import { useAtomValue } from "@effect/atom-react";
import { tableDataAtom, selectedRowIndexAtom, selectedColIndexAtom, editModeAtom } from "../state.ts";
import { colors } from "../colors.ts";

export const Header = () => {
	const tableData = useAtomValue(tableDataAtom);
	const selectedRow = useAtomValue(selectedRowIndexAtom);
	const selectedCol = useAtomValue(selectedColIndexAtom);
	const editMode = useAtomValue(editModeAtom);

	const rowCount = tableData.length;
	const columns = tableData.length > 0
		? Object.keys(tableData[0] as Record<string, unknown>)
		: [];

	const rowText = tableData.length > 0 ? `${selectedRow + 1}/${tableData.length}` : "";
	const colText = columns.length > 0 ? columns[selectedCol] || "" : "";
	const modeText = editMode ? "[EDIT]" : "[NAVIGATE]";

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

			{/* Status line */}
			<box height={1} flexDirection="row">
				<text wrapMode="none" fg={editMode ? colors.statusText : colors.muted}>
					{modeText}
				</text>
				<text wrapMode="none" fg={colors.muted}>  </text>
				<text wrapMode="none" fg={colors.text}>Row {rowText}</text>
				<text wrapMode="none" fg={colors.muted}>  </text>
				<text wrapMode="none" fg={colors.text}>Col: {colText}</text>
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
