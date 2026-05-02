import { TextAttributes } from "@opentui/core";
import { useAtomValue } from "@effect/atom-react";
import { tableDataAtom } from "../state.ts";
import { colors } from "../colors.ts";

export const Header = () => {
	const tableData = useAtomValue(tableDataAtom);
	const rowCount = tableData.length;

	return (
		<box height={1} flexDirection="row">
			<text wrapMode="none" fg={colors.accent} attributes={TextAttributes.BOLD}>
				SQLTUI
			</text>
			<text wrapMode="none" fg={colors.muted}>  </text>
			<text wrapMode="none" fg={colors.text}>
				{rowCount} rows
			</text>
		</box>
	);
};
