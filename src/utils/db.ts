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

export const getRows = (tableName: string): Array<Record<string, unknown>> => {
  const database = getDatabase();
  const query = database.query(`select * from "${tableName.replaceAll('"', '""')}";`);
  const result = query.all();
  if (!Array.isArray(result)) {
    throw new Error("Expected array from database query");
  }
  return result as Array<Record<string, unknown>>;
};

export const getTestRows = (tableName = "test"): Array<Record<string, unknown>> => {
  return getRows(tableName);
};

export const getColumns = (tableName: string): string[] => {
  const database = getDatabase();
  const query = database.query(`pragma table_info("${tableName.replaceAll('"', '""')}");`);
  const result = query.all();
  if (!Array.isArray(result)) {
    throw new Error("Expected array from database query");
  }
  return result.map((column) => String((column as { name: string }).name));
};

export const getTestColumns = (tableName = "test"): string[] => {
  return getColumns(tableName);
};

export const getTables = (): string[] => {
  const database = getDatabase();
  const query = database.query("SELECT name FROM sqlite_master WHERE type='table' AND name NOT LIKE 'sqlite_%';");
  const result = query.all();
  if (!Array.isArray(result)) {
    throw new Error("Expected array from database query");
  }
  return result.map((row) => String((row as { name: string }).name));
};

export const updateCell = (tableName: string, rowId: number, column: string, value: SQLiteValue): void => {
  const database = getDatabase();
  const allowedColumns = new Set(getColumns(tableName));
  if (!allowedColumns.has(column)) {
    throw new Error(`Unknown column: ${column}`);
  }

  const tableId = `"${tableName.replaceAll('"', '""')}"`;
  const columnId = `"${column.replaceAll('"', '""')}"`;
  const transaction = database.transaction(() => {
    database.run(`update ${tableId} set ${columnId} = ? where id = ?`, [value, rowId]);
  });
  transaction();
};

export const updateTestCell = (rowId: number, column: string, value: SQLiteValue): void => {
  updateCell("test", rowId, column, value);
};

export const closeDatabase = (): void => {
  if (db !== null) {
    db.close(true);
    db = null;
  }
};
