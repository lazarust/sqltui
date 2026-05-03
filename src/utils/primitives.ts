// Cell formatting utilities for sqltui

export const centerCell = (text: string, width: number) => {
	const trimmed = text.length > width ? `${text.slice(0, Math.max(0, width - 1))}…` : text;
	const left = Math.floor((width - trimmed.length) / 2);
	return `${" ".repeat(Math.max(0, left))}${trimmed}`.padEnd(width, " ");
};
