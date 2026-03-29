import { Database } from "bun:sqlite";

const db = new Database("test.db");
export type SQLiteValue = string | number | bigint | boolean | Uint8Array | null;

export const getTestRows = (): Array<Record<string, unknown>> => {
	const query = db.query("select * from test;");
	return query.all() as Array<Record<string, unknown>>;
};

export const getTestColumns = (): string[] => {
	const query = db.query("pragma table_info(test);");
	return query.all().map((column) => String((column as { name: string }).name));
};

export const updateTestCell = (rowId: number, column: string, value: SQLiteValue): void => {
	const allowedColumns = new Set(getTestColumns());
	if (!allowedColumns.has(column)) {
		throw new Error(`Unknown column: ${column}`);
	}

	const identifier = `"${column.replaceAll('"', '""')}"`;
	db.run(`update test set ${identifier} = ? where id = ?`, [value, rowId]);
};

export const closeDatabase = (): void => {
	db.close(false);
};
