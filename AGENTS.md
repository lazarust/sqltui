# AGENTS.md

## Purpose
Guide for coding agents working in `/Users/lazarust/Github/sqltui`.
Use this file to understand the repo's actual commands, current tooling, and existing coding patterns.

## Project Snapshot
- Runtime: Bun
- Language: TypeScript
- UI: OpenTUI Core (`@opentui/core`), imperative API
- Entry point: `src/index.ts`
- Main UI component: `src/components/Table.ts`
- Database utilities: `src/utils/db.ts`
- Local SQLite file: `test.db`

## Existing Repo Rules
- Existing `AGENTS.md`: none before this file
- `.cursor/rules/`: none found
- `.cursorrules`: none found
- `.github/copilot-instructions.md`: none found
- If any of those appear later, treat them as higher-priority repo instructions and merge them with this file.

## Repo Layout
- `src/index.ts`: renderer setup, module-level state, keyboard handling, shutdown
- `src/components/Table.ts`: visual rendering of the grid
- `src/utils/db.ts`: SQLite reads, writes, and column validation
- `README.md`: minimal setup/run notes
- `tsconfig.json`: strict TypeScript settings

## Environment Notes
- Use Bun, not Node.js or npm, for normal repo work.
- This is an interactive terminal UI; running the app takes over the terminal.
- `test.db` is part of the working tree and powers the current demo app.
- OpenTUI captures console output into its overlay while the app is running.

## Commands

### Install
- `bun install`

### Run the app
- Package script: `bun dev`
- Current script definition: `bun run --watch src/index.ts`
- Direct run without watch mode: `bun run src/index.ts`

### Build / typecheck
There is no dedicated `build` script.
Use `bunx tsc --noEmit` as the main non-interactive validation command.

### Lint
- No lint script exists.
- No ESLint, Biome, or Prettier config is checked in.
- Do not invent a linting stack during unrelated tasks.

### Test
There is no test script in `package.json`, and there are currently no test files.
`bun test` currently fails because no `*.test.*` or `*.spec.*` files exist.

- Run all tests once tests are added: `bun test`
- Run a single test file: `bun test path/to/file.test.ts`
- Run a single test by name: `bun test --test-name-pattern "pattern"`
- Run one test file and filter by name: `bun test path/to/file.test.ts --test-name-pattern "pattern"`
- Use this when you want success even though no tests exist yet: `bun test --pass-with-no-tests`

## Suggested Validation Order
1. `bunx tsc --noEmit`
2. `bun test --pass-with-no-tests` when you did not add tests
3. `bun test path/to/file.test.ts` when you add targeted coverage
4. Manual TUI run only when the task actually needs interaction-based verification

## TypeScript Expectations
- `strict: true` is enabled.
- `noUncheckedIndexedAccess` is enabled.
- `noImplicitOverride` is enabled.
- `noFallthroughCasesInSwitch` is enabled.
- `allowImportingTsExtensions` is enabled.
- `verbatimModuleSyntax` is enabled.
- Satisfy strict nullability with control flow and guards instead of suppressing errors.

## Imports
- Put external imports before local imports.
- Use explicit `.ts` extensions in relative imports.
- Prefer named exports; the repo currently has no default exports.
- Use inline `type` imports when mixing values and types.

## Formatting
- Prefer double quotes.
- Keep semicolons.
- Match the surrounding file instead of reformatting unrelated code.
- `src/index.ts` uses spaces; `src/utils/db.ts` currently uses tabs.
- Because no formatter is configured, minimize formatting churn.
- Keep comments short and only where they add real context.

## Naming
- PascalCase for components and prop interfaces: `Table`, `TableProps`
- camelCase for functions and variables: `loadTableData`, `selectedRowIndex`
- UPPER_SNAKE_CASE for constant palettes or fixed maps when appropriate: `COLORS`
- Prefer descriptive names over abbreviations.

## Types
- Add explicit return types for exported functions.
- Prefer narrow unions such as `number | null` over magic sentinel values.
- Prefer `unknown` over `any`, then narrow.
- Avoid introducing new `any` usage unless it is isolated and justified.
- Reuse local types such as `SQLiteValue` instead of rebuilding equivalent unions.

## Error Handling
- Catch errors at renderer, database, and other I/O boundaries.
- Log failures with useful context.
- Do not silently swallow errors.
- Throw when invalid input would otherwise cause unsafe behavior.
- Preserve the existing SQL-safety pattern: validate column names before interpolating identifiers.

## OpenTUI Guidance
- This repo uses OpenTUI Core's imperative style, not React or Solid.
- Create the renderer with `createCliRenderer()`.
- Shut down through `renderer.destroy()` and related cleanup helpers.
- Do not call `process.exit()` without ensuring terminal cleanup first.
- Preserve stable renderable IDs like `table-root` and `table-container`.
- Keep `updateTable()` and selection synchronization logic coherent when changing UI state.
- Expect `console.log` output to go to the OpenTUI console overlay while the app runs.

## State And Data Flow
- App state currently lives in module-level variables in `src/index.ts`.
- The renderer is created once, then the table subtree is replaced during updates.
- Reads go through `getTestRows()`.
- Writes go through `updateTestCell()`.
- Numeric edits are coerced before being written back to SQLite.
- Prefer small changes that fit this structure instead of introducing a new state abstraction.

## Testing Guidance For New Work
- Use Bun's built-in test runner.
- Prefer focused tests close to the behavior you changed.
- For renderer regressions, use OpenTUI testing helpers if you add snapshot tests.
- For DB logic, test validation and coercion separately from rendering when practical.

## Change Management
- Keep patches minimal and local.
- Do not add dependencies, scripts, or config files unless the task needs them.
- Do not rename files or restructure modules without clear benefit.
- Do not modify `test.db` unless the task is explicitly about fixture data or schema.
- If you add tests, scripts, or repo rules, update this file to match.

## Practical Defaults
1. Read the relevant file first.
2. Make the smallest correct change.
3. Run `bunx tsc --noEmit`.
4. Run focused Bun tests if they exist.
5. Report missing tooling honestly instead of inventing commands.
