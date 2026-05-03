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
import { centerCell } from "../utils/primitives.ts";

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

	// Calculate dynamic gutter width based on row count
	const rowCount = data.length;
	const gutterWidth = Math.max(3, String(rowCount).length + 2); // " 1 " to " 100 "

	// Build top border (with gutter space)
	const topBorder =
		"┌" +
		"─".repeat(gutterWidth + 1) +
		widths.map((w, i) => "┬" + "─".repeat(w)).join("") +
		"┐";

	// Build separator (with gutter space)
	const separator =
		"├" +
		"─".repeat(gutterWidth + 1) +
		widths.map((w, i) => "┼" + "─".repeat(w)).join("") +
		"┤";

	// Build bottom border (with gutter space)
	const bottomBorder =
		"└" +
		"─".repeat(gutterWidth + 1) +
		widths.map((w, i) => "┴" + "─".repeat(w)).join("") +
		"┘";

	// Render a single row with gutter
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
			rowIndex?: number;
			isSelectedRow?: boolean;
		} = {},
	) => {
		const rowNum = options.rowIndex ?? 0;
		const isSelected = options.isSelectedRow ?? false;
		const indicator = isSelected ? "▶" : " ";
		const rowGutter = ` ${String(rowNum + 1).padStart(gutterWidth - 2, " ")} `;

		return (
			<box flexDirection="row">
				<text fg={colors.border}>│</text>
				{/* Indicator + Number gutter */}
				<box width={gutterWidth} flexDirection="row" backgroundColor={options.rowBackgroundColor ?? colors.background}>
					<text wrapMode="none" fg={isSelected ? colors.rowIndicator : colors.muted}>
						{indicator}
					</text>
					<text wrapMode="none" fg={colors.rowNumber}>
						{rowGutter}
					</text>
				</box>
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

	// Header row cells (uppercase for emphasis)
	const headerCells = columns.map((col, i) => centerCell(col.toUpperCase(), widths[i]!));

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
				rowIndex: rowIndex,
				isSelectedRow: isSelected,
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
			backgroundColor={colors.background}
			gap={0}
		>
			<text fg={colors.border}>{topBorder}</text>
			{renderRow(headerCells, {
				rowBackgroundColor: colors.headerBg,
				rowIndex: -1,
				isSelectedRow: false,
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
