import { Box, Text, TextAttributes, type VNode } from "@opentui/core";

interface TableProps {
	data: Array<Record<string, unknown>>;
	selectedRowIndex: number | null;
	selectedColIndex: number | null;
	editMode: boolean;
	editValue: string;
}

// Tokyo Night color palette
const COLORS = {
	bg: "#1a1b26",
	fg: "#c0caf5",
	headerBg: "#1f2335",
	selectionBg: "#283457",
	selectionBgEdit: "#3d59a1",
	activeCellBg: "#2f3b63",
	border: "#565f89",
	accent: "#7aa2f7",
	white: "#ffffff",
};

export const Table = ({
	data,
	selectedRowIndex,
	selectedColIndex,
	editMode,
	editValue,
}: TableProps) => {
	if (!data.length) {
		return Box(
			{
				id: "table-root",
				border: true,
				borderStyle: "single",
				borderColor: COLORS.border,
				backgroundColor: COLORS.bg,
				padding: 1,
			},
			Text({ content: "No data", attributes: TextAttributes.DIM }),
		);
	}

	const columns = Object.keys(data[0] as Record<string, unknown>);

	if (!columns.length) {
		return Box(
			{
				id: "table-root",
				border: true,
				borderStyle: "single",
				borderColor: COLORS.border,
				backgroundColor: COLORS.bg,
				padding: 1,
			},
			Text({ content: "Empty row schema", attributes: TextAttributes.DIM }),
		);
	}

	const widths = columns.map((col) => {
		const headerLen = col.length;
		const dataLen = Math.max(...data.map((row) => String(row[col] ?? "").length), 0);
		return Math.max(headerLen, dataLen) + 2;
	});

	const truncate = (str: string, width: number): string => {
		if (width <= 0) return "";
		if (str.length <= width) return str;
		if (width === 1) return str.substring(0, 1);
		return str.substring(0, width - 1) + "…";
	};

	const formatCell = (str: string, width: number): string => {
		const truncated = truncate(str, width);
		return truncated.padEnd(width, " ");
	};

	const center = (str: string, width: number): string => {
		const truncated = truncate(str, width);
		const padding = width - truncated.length;
		const left = Math.floor(padding / 2);
		const right = padding - left;
		return " ".repeat(left) + truncated + " ".repeat(right);
	};

	const tableRows: VNode[] = [];

	const renderRow = (
		cells: string[],
		options?: {
			rowBackgroundColor?: string;
			selectedCellIndex?: number | null;
			selectedCellBackgroundColor?: string;
			selectedCellForegroundColor?: string;
			cellForegroundColor?: string;
			selectedCellAttributes?: number;
			cellAttributes?: number;
		},
	) =>
		Box(
			{
				flexDirection: "row",
			},
			Text({ content: "│", fg: COLORS.border }),
			...cells.flatMap((cell, index) => {
				const isSelectedCell = options?.selectedCellIndex === index;
				const cellNode = Box(
					{
						backgroundColor: isSelectedCell
							? options?.selectedCellBackgroundColor ?? options?.rowBackgroundColor ?? COLORS.bg
							: options?.rowBackgroundColor ?? COLORS.bg,
						flexDirection: "row",
					},
					Text({
						content: formatCell(cell, widths[index]!),
						fg: isSelectedCell
							? options?.selectedCellForegroundColor ?? options?.cellForegroundColor ?? COLORS.fg
							: options?.cellForegroundColor ?? COLORS.fg,
						attributes: isSelectedCell
							? options?.selectedCellAttributes ?? options?.cellAttributes
							: options?.cellAttributes,
					}),
				);

				return [cellNode, Text({ content: "│", fg: COLORS.border })];
			}),
		);

	// Top border
	const topBorder = "┌" + widths.map((w, i) =>
		"─".repeat(w) + (i < widths.length - 1 ? "┬" : "")
	).join("") + "┐";
	tableRows.push(Text({ content: topBorder, fg: COLORS.border }));

	// Header row
	tableRows.push(
		renderRow(
			columns.map((col, i) => center(col, widths[i]!)),
			{
				rowBackgroundColor: COLORS.headerBg,
				selectedCellIndex: selectedColIndex,
				selectedCellBackgroundColor: COLORS.accent,
				selectedCellForegroundColor: COLORS.white,
				cellForegroundColor: COLORS.fg,
				cellAttributes: TextAttributes.BOLD,
				selectedCellAttributes: TextAttributes.BOLD,
			},
		),
	);

	// Separator
	const separator = "├" + widths.map((w, i) =>
		"─".repeat(w) + (i < widths.length - 1 ? "┼" : "")
	).join("") + "┤";
	tableRows.push(Text({ content: separator, fg: COLORS.border }));

	// Data rows
	data.forEach((row, rowIndex) => {
		const isSelected = selectedRowIndex === rowIndex;
		const bgColor = isSelected
			? (editMode ? COLORS.selectionBgEdit : COLORS.selectionBg)
			: COLORS.bg;

		const cellContents = columns.map((col, colIndex) => {
			const isEditing = isSelected && editMode && selectedColIndex === colIndex;
			const value = isEditing ? editValue : String(row[col] ?? "");
			const width = widths[colIndex]!;

			let displayValue = truncate(value, width);
			if (isEditing) {
				displayValue = truncate(value, width - 1) + "█";
			}

			return displayValue;
		});

		tableRows.push(
			renderRow(cellContents, {
				rowBackgroundColor: bgColor,
				selectedCellIndex: isSelected ? selectedColIndex : null,
				selectedCellBackgroundColor: editMode ? COLORS.selectionBgEdit : COLORS.activeCellBg,
				selectedCellForegroundColor: COLORS.white,
				cellForegroundColor: isSelected ? COLORS.white : COLORS.fg,
			}),
		);
	});

	// Bottom border
	const bottomBorder = "└" + widths.map((w, i) =>
		"─".repeat(w) + (i < widths.length - 1 ? "┴" : "")
	).join("") + "┘";
	tableRows.push(Text({ content: bottomBorder, fg: COLORS.border }));

	return Box(
		{
			id: "table-root",
			flexDirection: "column",
			alignItems: "flex-start",
			backgroundColor: COLORS.bg,
			gap: 0,
		},
		...tableRows,
	);
};
