import { getTestRows } from "./db.ts";

/**
 * Load table data from the database.
 * Throws on error so caller can handle initialization failures.
 */
export const loadTableData = (): Array<Record<string, unknown>> => {
	return getTestRows();
};
