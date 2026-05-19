import { getRows, getTables } from "./db.ts";

/**
 * Load table data from the database for a given table name.
 * Throws on error so caller can handle initialization failures.
 */
export const loadTableData = (tableName: string): Array<Record<string, unknown>> => {
	return getRows(tableName);
};

/**
 * Load the list of tables from the database.
 * Throws on error so caller can handle initialization failures.
 */
export const loadTableList = (): Array<string> => {
	return getTables();
};
