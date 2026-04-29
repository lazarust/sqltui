import {
	Box,
	KeyEvent,
	createCliRenderer,
	ConsolePosition,
	Text,
	TextAttributes,
} from "@opentui/core";
import { closeDatabase, getTestRows, updateTestCell, type SQLiteValue } from "./utils/db.ts";
import { Table } from "./components/Table.ts";

// State management
let selectedRowIndex: number | null = 0;
let selectedColIndex: number | null = 0;
let editMode = false;
let editValue = "";
let loadError: string | null = null;
let tableData: Array<Record<string, unknown>> = [];
let renderer: Awaited<ReturnType<typeof createCliRenderer>> | null = null;
let isShuttingDown = false;
let pendingQuit = false;

// Get column names from data
const getColumns = (): string[] => {
	if (!tableData.length || !tableData[0]) return [];
	return Object.keys(tableData[0] as Record<string, unknown>);
};

const syncSelection = () => {
	const columns = getColumns();

	if (!tableData.length || !columns.length) {
		selectedRowIndex = null;
		selectedColIndex = null;
		return;
	}

	if (selectedRowIndex === null || selectedRowIndex >= tableData.length) {
		selectedRowIndex = 0;
	}

	if (selectedColIndex === null || selectedColIndex >= columns.length) {
		selectedColIndex = 0;
	}
};

const loadTableData = () => {
	try {
		tableData = getTestRows();
		loadError = null;
	} catch (error) {
		tableData = [];
		loadError = `Unable to load test table: ${error instanceof Error ? error.message : String(error)}`;
		console.error("Failed to load test table:", error);
	}

	syncSelection();
};

const coerceEditedValue = (currentValue: unknown, nextValue: string): SQLiteValue => {
	if (currentValue === null && nextValue === "") {
		return null;
	}
	if (typeof currentValue === "number") {
		const numericValue = Number(nextValue);
		if (Number.isNaN(numericValue)) {
			throw new Error("Expected a numeric value");
		}
		return numericValue;
	}
	if (typeof currentValue === "bigint") {
		try {
			return BigInt(nextValue);
		} catch {
			throw new Error("Expected an integer value");
		}
	}
	if (typeof currentValue === "boolean") {
		const lower = nextValue.toLowerCase();
		if (lower === "true" || lower === "1") return true;
		if (lower === "false" || lower === "0") return false;
		throw new Error("Expected a boolean value (true/false/1/0)");
	}
	if (currentValue instanceof Uint8Array) {
		throw new Error("Cannot edit binary data");
	}
	return nextValue;
};

const renderTableNode = () => {
	if (loadError) {
		return Box(
			{
				id: "table-root",
				border: true,
				borderStyle: "single",
				padding: 1,
			},
			Text({
				content: loadError,
				attributes: TextAttributes.DIM,
			}),
		);
	}

	return Table({
		data: tableData,
		selectedRowIndex,
		selectedColIndex,
		editMode,
		editValue,
	});
};

const shutdown = async () => {
	if (isShuttingDown) {
		return;
	}

	isShuttingDown = true;

	try {
		const currentRenderer = renderer;
		renderer = null;

		if (currentRenderer) {
			await currentRenderer.destroy();
		}
	} finally {
		closeDatabase();
	}
};

// Create renderer with current state
const createRenderer = async () => {
	loadTableData();

	const newRenderer = await createCliRenderer({
		consoleOptions: {
			position: ConsolePosition.BOTTOM,
			sizePercent: 30,
		},
	});

	newRenderer.root.add(
		Box(
			{ alignItems: "center", justifyContent: "center", flexGrow: 1 },
			Box(
				{
					id: "table-container",
					flexDirection: "column",
					gap: 0,
					marginTop: 1,
					width: "80%",
				},
				renderTableNode(),
			),
		),
	);

	newRenderer.keyInput.on("keypress", (key: KeyEvent) => {
		if (isShuttingDown) return;

		// Cancel pending quit on any other key
		if (pendingQuit && key.name !== "q") {
			pendingQuit = false;
		}

		// Toggle console
		if (key.name === "`") {
			newRenderer.console.toggle();
			return;
		}

		// Quit
		if (key.name === "q") {
			if (pendingQuit) {
				void shutdown();
				return;
			}
			pendingQuit = true;
			console.log("Press 'q' again to quit");
			return;
		}

		// Refresh data
		if (key.name === "r" && key.ctrl) {
			loadTableData();
			updateTable();
			return;
		}

		// Handle edit mode
		if (editMode) {
			handleEditModeKeys(key);
			return;
		}

		// Handle navigation mode
		handleNavigationKeys(key);
	});

	renderer = newRenderer;
	return newRenderer;
};

// Handle keys when in edit mode
const handleEditModeKeys = (key: KeyEvent) => {
	if (!tableData.length || selectedRowIndex === null || selectedColIndex === null) return;

	const columns = getColumns();
	if (!columns.length || selectedColIndex >= columns.length) return;

	const currentCol = columns[selectedColIndex];
	if (!currentCol) return;

	// Exit edit mode (discard)
	if (key.name === "escape") {
		editMode = false;
		editValue = "";
		updateTable();
		return;
	}

	// Commit edit
	if (key.name === "return") {
		const row = tableData[selectedRowIndex];
		if (row) {
			const rowId = row.id;
			if (typeof rowId !== "number") {
				console.error("Unable to save edit: row is missing a numeric id");
				return;
			}

			try {
				const nextValue = coerceEditedValue(row[currentCol], editValue);
				updateTestCell(rowId, currentCol, nextValue);
				loadTableData(); // reload from DB instead of optimistic mutation
			} catch (error) {
				console.error("Unable to save edit:", error);
				return;
			}
		}

		editMode = false;
		editValue = "";
		loadError = null;
		updateTable();
		return;
	}

	// Handle text input
	if (key.name === "backspace") {
		editValue = editValue.slice(0, -1);
		updateTable();
		return;
	}

	// Regular character input (supports Unicode and paste)
	if (
		key.sequence &&
		key.sequence.length > 0 &&
		!key.ctrl &&
		!key.meta &&
		key.sequence[0] !== "\x1b"
	) {
		// Defensive: skip control characters that weren't handled above
		if (key.sequence.length === 1 && key.sequence.charCodeAt(0) < 32) {
			return;
		}
		editValue += key.sequence;
		updateTable();
		return;
	}
};

// Handle keys when in navigation mode
const handleNavigationKeys = (key: KeyEvent) => {
	if (!tableData.length) return;

	const columns = getColumns();
	const numRows = tableData.length;
	const numCols = columns.length;

	// Navigate left (previous column) — check BEFORE right to handle shift+tab
	if (key.name === "h" || (key.name === "tab" && key.shift)) {
		if (selectedRowIndex === null) {
			selectedRowIndex = 0;
			selectedColIndex = 0;
		} else if (selectedColIndex !== null && selectedColIndex > 0) {
			selectedColIndex--;
		} else if (key.name === "tab" && key.shift && selectedRowIndex > 0) {
			// Shift+Tab at first column wraps to previous row
			selectedRowIndex--;
			selectedColIndex = numCols - 1;
		}
		updateTable();
		return;
	}

	// Navigate down (next row)
	if (key.name === "j") {
		if (selectedRowIndex === null) {
			selectedRowIndex = 0;
			selectedColIndex = 0;
		} else if (selectedRowIndex < numRows - 1) {
			selectedRowIndex++;
		}
		updateTable();
		return;
	}

	// Navigate up (previous row)
	if (key.name === "k") {
		if (selectedRowIndex === null) {
			selectedRowIndex = numRows - 1;
			selectedColIndex = 0;
		} else if (selectedRowIndex > 0) {
			selectedRowIndex--;
		}
		updateTable();
		return;
	}

	// Navigate right (next column)
	if (key.name === "l" || key.name === "tab") {
		if (selectedRowIndex === null) {
			selectedRowIndex = 0;
			selectedColIndex = 0;
		} else if (selectedColIndex === null || selectedColIndex < numCols - 1) {
			selectedColIndex = (selectedColIndex ?? -1) + 1;
		} else if (key.name === "tab") {
			// Tab at last column wraps to next row
			if (selectedRowIndex < numRows - 1) {
				selectedRowIndex++;
				selectedColIndex = 0;
			}
		}
		updateTable();
		return;
	}

	// Enter edit mode
	if (key.name === "i" && selectedRowIndex !== null && selectedColIndex !== null) {
		if (selectedColIndex >= columns.length) return;
		const currentCol = columns[selectedColIndex];
		if (!currentCol) return;
		const row = tableData[selectedRowIndex];
		editValue = String(row?.[currentCol] ?? "");
		editMode = true;
		updateTable();
		return;
	}
};

// Update table display
const updateTable = () => {
	if (!renderer) return;

	try {
		const tableContainer = renderer.root.findDescendantById("table-container");
		if (!tableContainer) return;

		if (tableContainer.findDescendantById("table-root")) {
			tableContainer.remove("table-root");
		}

		tableContainer.add(renderTableNode());
	} catch (error) {
		console.error("Failed to update table:", error);
	}
};

// Start the application
createRenderer().catch(async (error) => {
	console.error(error);
	await shutdown();
});

// Help text
console.log("Keyboard shortcuts:");
console.log("  j/k     - Navigate rows");
console.log("  h/l     - Navigate columns");
console.log("  Tab     - Next column (wraps to next row)");
console.log("  Shift+Tab - Previous column (wraps to previous row)");
console.log("  i       - Enter edit mode");
console.log("  Esc     - Exit edit mode (discard changes)");
console.log("  Enter   - Commit edit");
console.log("  Ctrl+R  - Refresh data");
console.log("  `       - Toggle console");
console.log("  q       - Quit (press twice)");
