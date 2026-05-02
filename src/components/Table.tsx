import { TextAttributes } from "@opentui/core";
import { useAtomValue } from "@effect/atom-react";
import {
	tableDataAtom,
	selectedRowIndexAtom,
	selectedColIndexAtom,
	editModeAtom,
	editValueAtom,
	loadErrorAtom,
} from "../state.ts";
import { colors } from "../colors.ts";

// Utility functions (same as original Table.ts)
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

export const Table = () => {
	// Read reactive state from atoms
	const data = useAtomValue(tableDataAtom);
	const selectedRowIndex = useAtomValue(selectedRowIndexAtom);
	const selectedColIndex = useAtomValue(selectedColIndexAtom);
	const editMode = useAtomValue(editModeAtom);
	const editValue = useAtomValue(editValueAtom);
	const loadError = useAtomValue(loadErrorAtom);

	// Error state
	if (loadError) {
		return (
			<box
				border={true}
				borderStyle="single"
				borderColor={colors.border}
				backgroundColor={colors.background}
				padding={1}
			>
				<text fg={colors.error}>{loadError}</text>
			</box>
		);
	}

	// Empty data state
	if (!data.length) {
		return (
			<box
				border={true}
				borderStyle="single"
				borderColor={colors.border}
				backgroundColor={colors.background}
				padding={1}
			>
				<text attributes={TextAttributes.DIM}>No data</text>
			</box>
		);
	}

	const columns = Object.keys(data[0] as Record<string, unknown>);

	// Empty schema state
	if (!columns.length) {
		return (
			<box
				border={true}
				borderStyle="single"
				borderColor={colors.border}
				backgroundColor={colors.background}
				padding={1}
			>
				<text attributes={TextAttributes.DIM}>Empty row schema</text>
			</box>
		);
	}

	// Calculate column widths
	const widths = columns.map((col) => {
		const headerLen = col.length;
		const dataLen = Math.max(
			...data.map((row) => String((row as Record<string, unknown>)[col] ?? "").length),
			0,
		);
		return Math.max(headerLen, dataLen) + 2;
	});

	// Build top border
	const topBorder =
		"┌" +
		widths.map((w, i) => "─".repeat(w) + (i < widths.length - 1 ? "┬" : "")).join("") +
		"┐";

	// Build separator
	const separator =
		"├" +
		widths.map((w, i) => "─".repeat(w) + (i < widths.length - 1 ? "┼" : "")).join("") +
		"┤";

	// Build bottom border
	const bottomBorder =
		"└" +
		widths.map((w, i) => "─".repeat(w) + (i < widths.length - 1 ? "┴" : "")).join("") +
		"┘";

	// Render a single row
	const renderRow = (
		rowCells: string[],
		options: {
			rowBackgroundColor?: string;
			selectedCellIndex?: number;
			selectedCellBackgroundColor?: string;
			selectedCellForegroundColor?: string;
			cellForegroundColor?: string;
			selectedCellAttributes?: number;
			cellAttributes?: number;
		} = {},
	) => {
		return (
			<box flexDirection="row">
				<text fg={colors.border}>│</text>
				{rowCells.map((cell, index) => {
					const isSelectedCell = options.selectedCellIndex === index;
					const cellBg = isSelectedCell
						? options.selectedCellBackgroundColor ?? options.rowBackgroundColor ?? colors.background
						: options.rowBackgroundColor ?? colors.background;
					const cellFg = isSelectedCell
						? options.selectedCellForegroundColor ?? options.cellForegroundColor ?? colors.text
						: options.cellForegroundColor ?? colors.text;
					const cellAttrs = isSelectedCell
						? options.selectedCellAttributes ?? options.cellAttributes
						: options.cellAttributes;

					return (
						<box key={index} flexDirection="row" backgroundColor={cellBg}>
							<text
								wrapMode="none"
								fg={cellFg}
								{...(cellAttrs !== undefined ? { attributes: cellAttrs } : {})}
							>
								{formatCell(cell, widths[index]!)}
							</text>
						</box>
					);
				})}
				{rowCells.length > 0 ? <text fg={colors.border}>│</text> : null}
			</box>
		);
	};

	// Header row cells
	const headerCells = columns.map((col, i) => center(col, widths[i]!));

	// Data rows
	const dataRows = data.map((row, rowIndex) => {
		const isSelected = selectedRowIndex === rowIndex;
		const bgColor = isSelected
			? editMode
				? colors.selectedBgEdit
				: colors.selectedBg
			: colors.background;

		const cellContents = columns.map((col, colIndex) => {
			const isEditing = isSelected && editMode && selectedColIndex === colIndex;
			const value = isEditing
				? editValue
				: String((row as Record<string, unknown>)[col] ?? "");
			const width = widths[colIndex]!;

			let displayValue = truncate(value, width);
			if (isEditing) {
				displayValue = truncate(value, width - 1) + "█";
			}

			return displayValue;
		});

		return {
			cells: cellContents,
			options: {
				rowBackgroundColor: bgColor,
				...(isSelected ? { selectedCellIndex: selectedColIndex } : {}),
				selectedCellBackgroundColor: editMode ? colors.selectedBgEdit : colors.activeCellBg,
				selectedCellForegroundColor: colors.white,
				cellForegroundColor: isSelected ? colors.white : colors.text,
			},
			key: rowIndex,
		};
	});

	return (
		<box
			flexDirection="column"
			alignItems="flex-start"
			backgroundColor={colors.background}
			gap={0}
		>
			<text fg={colors.border}>{topBorder}</text>
			{renderRow(headerCells, {
				rowBackgroundColor: colors.headerBg,
				selectedCellIndex: selectedColIndex,
				selectedCellBackgroundColor: colors.accent,
				selectedCellForegroundColor: colors.white,
				cellForegroundColor: colors.text,
				cellAttributes: TextAttributes.BOLD,
				selectedCellAttributes: TextAttributes.BOLD,
			})}
			<text fg={colors.border}>{separator}</text>
			{dataRows.map(({ cells, options, key }) => renderRow(cells, options))}
			<text fg={colors.border}>{bottomBorder}</text>
		</box>
	);
};
