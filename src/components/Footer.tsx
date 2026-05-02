import { useAtomValue } from "@effect/atom-react";
import { editModeAtom } from "../state.ts";
import { colors } from "../colors.ts";

export const Footer = () => {
	const editMode = useAtomValue(editModeAtom);

	if (editMode) {
		return (
			<box height={1} flexDirection="row">
				<text wrapMode="none">
					<span fg={colors.accent}>esc</span>
					<span fg={colors.muted}> cancel  </span>
					<span fg={colors.accent}>enter</span>
					<span fg={colors.muted}> save  </span>
					<span fg={colors.accent}>backspace</span>
					<span fg={colors.muted}> delete</span>
				</text>
			</box>
		);
	}

	return (
		<box height={1} flexDirection="row">
			<text wrapMode="none">
				<span fg={colors.accent}>j/k</span>
				<span fg={colors.muted}> navigate  </span>
				<span fg={colors.accent}>h/l</span>
				<span fg={colors.muted}> columns  </span>
				<span fg={colors.accent}>i</span>
				<span fg={colors.muted}> edit  </span>
				<span fg={colors.accent}>ctrl+r</span>
				<span fg={colors.muted}> refresh  </span>
				<span fg={colors.accent}>q</span>
				<span fg={colors.muted}> quit</span>
			</text>
		</box>
	);
};
