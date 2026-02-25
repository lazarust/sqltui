import { Database } from "bun:sqlite";

const db = new Database("test.db");

export const getTestRows = (): Array<Record<string, unknown>> => {
	const query = db.query("select * from test;");
	return query.all() as Array<Record<string, unknown>>;
};
