import { Database } from "bun:sqlite";

let db: Database | null = null;

const getDatabase = (): Database => {
	if (db === null) {
		try {
			db = new Database("test.db");
		} catch (error) {
			throw new Error(
				`Failed to open database: ${error instanceof Error ? error.message : String(error)}`,
			);
		}
	}
	return db;
};

export type SQLiteValue = string | number | bigint | boolean | Uint8Array | null;

export const getTestRows = (): Array<Record<string, unknown>> => {
	const database = getDatabase();
	const query = database.query("select * from test;");
	const result = query.all();
	if (!Array.isArray(result)) {
		throw new Error("Expected array from database query");
	}
	return result as Array<Record<string, unknown>>;
};

export const getTestColumns = (): string[] => {
	const database = getDatabase();
	const query = database.query("pragma table_info(test);");
	const result = query.all();
	if (!Array.isArray(result)) {
		throw new Error("Expected array from database query");
	}
	return result.map((column) => String((column as { name: string }).name));
};

export const updateTestCell = (rowId: number, column: string, value: SQLiteValue): void => {
	const database = getDatabase();
	const allowedColumns = new Set(getTestColumns());
	if (!allowedColumns.has(column)) {
		throw new Error(`Unknown column: ${column}`);
	}

	const identifier = `"${column.replaceAll('"', '""')}"`;
	const transaction = database.transaction(() => {
		database.run(`update test set ${identifier} = ? where id = ?`, [value, rowId]);
	});
	transaction();
};

export const closeDatabase = (): void => {
	if (db !== null) {
		db.close(false);
		db = null;
	}
};
