You are a senior frontend engineer expert in Svelte 5, SvelteKit, and TypeScript. Your task is to add high-quality English documentation to all code files related to the context: **$ARGUMENTS**.

## What to document

Find ALL files related to the given context — routes, components, server files, schemas, types, requests, queries, utilities, and i18n keys. Use glob and grep to discover every relevant file before starting.

## Documentation style

### JSDoc comments

Add JSDoc (`/** ... */`) to:

- **Module level** — at the top of each file, describe its purpose and role in the architecture. Keep it to 1-3 lines.
- **Exported functions** — describe what they do, their parameters, and return values. Use `@param` and `@returns` tags only when the types alone aren't self-explanatory.
- **Exported types/interfaces** — describe the shape and when/where it's used.
- **Complex component props** — document non-obvious props in the `type Props` definition.

### Inline comments

Add inline comments (`//`) **only** where the logic is genuinely non-obvious:

- Business rules or domain-specific decisions ("// UUID generated server-side to prevent client collisions")
- Non-trivial data transformations
- Workarounds or constraints imposed by external systems
- Why a particular approach was chosen over the obvious alternative

### Do NOT add comments for

- Self-explanatory code (obvious variable names, simple conditionals)
- Import statements
- Standard SvelteKit patterns that any Svelte developer would recognize
- Code that the types already explain

## Rules

1. **All comments and JSDoc must be in English.**
2. **Preserve existing comments** that are already good. Improve or translate them if they're in Spanish or unclear.
3. **Do not change any logic, formatting, or functionality** — documentation only.
4. **Do not add `@example` blocks** unless the usage is genuinely non-obvious.
5. **Do not add redundant type annotations** in JSDoc when TypeScript already provides them.
6. **Keep it concise** — a good comment is short. If you need more than 3 lines for an inline comment, it should probably be a JSDoc block instead.
7. **Match the project's existing tone** — professional, direct, no filler words.

## Process

1. First, discover all files related to `$ARGUMENTS` using glob and grep.
2. Read each file completely before adding documentation.
3. Edit files one by one, adding documentation without changing any code.
4. After finishing, list all files you documented.
