import * as Atom from "effect/unstable/reactivity/Atom";

// Atoms (reactive state containers)
// Using 0-based indices, removing null complexity

export const selectedRowIndexAtom = Atom.make<number>(0);
export const selectedColIndexAtom = Atom.make<number>(0);
export const editModeAtom = Atom.make(false);
export const editValueAtom = Atom.make("");
export const loadErrorAtom = Atom.make<string | null>(null);
export const tableDataAtom = Atom.make<Array<Record<string, unknown>>>([]);
export const pendingQuitAtom = Atom.make(false);
export const tableListAtom = Atom.make<Array<string>>([]);
export const selectedTableIndexAtom = Atom.make<number>(-1);
export const selectedTableNameAtom = Atom.make<string | null>(null);
export const sidebarFocusedAtom = Atom.make<boolean>(false);
export const dbPathAtom = Atom.make<string | null>(null);
