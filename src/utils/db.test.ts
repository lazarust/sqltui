import { describe, expect, it } from "bun:test";
import {
	closeDatabase,
	getTestColumns,
	getTestRows,
	updateTestCell,
	type SQLiteValue,
} from "./db.ts";

describe("db utilities", () => {
	it("should load rows from the test table", () => {
		const rows = getTestRows();
		expect(Array.isArray(rows)).toBe(true);
	});

	it("should list columns for the test table", () => {
		const columns = getTestColumns();
		expect(Array.isArray(columns)).toBe(true);
		expect(columns.length).toBeGreaterThan(0);
		expect(columns).toContain("id");
	});

	it("should reject updates to unknown columns", () => {
		expect(() => updateTestCell(1, "nonexistent_column", "value")).toThrow(
			"Unknown column: nonexistent_column",
		);
	});
});

describe("coerceEditedValue logic (mirrored from index.ts)", () => {
	const coerce = (current: unknown, next: string): SQLiteValue => {
		if (current === null && next === "") {
			return null;
		}
		if (typeof current === "number") {
			const numericValue = Number(next);
			if (Number.isNaN(numericValue)) {
				throw new Error("Expected a numeric value");
			}
			return numericValue;
		}
		if (typeof current === "bigint") {
			try {
				return BigInt(next);
			} catch {
				throw new Error("Expected an integer value");
			}
		}
		if (typeof current === "boolean") {
			const lower = next.toLowerCase();
			if (lower === "true" || lower === "1") return true;
			if (lower === "false" || lower === "0") return false;
			throw new Error("Expected a boolean value (true/false/1/0)");
		}
		if (current instanceof Uint8Array) {
			throw new Error("Cannot edit binary data");
		}
		return next;
	};

	it("should preserve null when empty", () => {
		expect(coerce(null, "")).toBe(null);
	});

	it("should coerce to string when current is null with non-empty value", () => {
		expect(coerce(null, "hello")).toBe("hello");
	});

	it("should coerce numbers", () => {
		expect(coerce(0, "42")).toBe(42);
		expect(coerce(0, "3.14")).toBe(3.14);
	});

	it("should throw on invalid number", () => {
		expect(() => coerce(0, "abc")).toThrow("Expected a numeric value");
	});

	it("should coerce booleans", () => {
		expect(coerce(true, "false")).toBe(false);
		expect(coerce(false, "1")).toBe(true);
	});

	it("should throw on invalid boolean", () => {
		expect(() => coerce(true, "maybe")).toThrow(
			"Expected a boolean value (true/false/1/0)",
		);
	});

	it("should throw on binary data", () => {
		expect(() => coerce(new Uint8Array([1, 2, 3]), "x")).toThrow(
			"Cannot edit binary data",
		);
	});
});
