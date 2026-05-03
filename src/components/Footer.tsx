import { useAtomValue } from "@effect/atom-react";
import { editModeAtom } from "../state.ts";
import { colors } from "../colors.ts";

export const Footer = () => {
	const editMode = useAtomValue(editModeAtom);

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
			<text wrapMode="none" fg={colors.accent}>ctrl+r</text>
			<text wrapMode="none" fg={colors.muted}> refresh</text>
			<text wrapMode="none" fg={colors.muted}>  │  </text>
			<text wrapMode="none" fg={colors.accent}>q</text>
			<text wrapMode="none" fg={colors.muted}> quit</text>
		</box>
	);
};
