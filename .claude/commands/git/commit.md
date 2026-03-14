Analyze all uncommitted changes (staged + unstaged + untracked) and create well-structured conventional commits like a senior frontend engineer.

## Steps

1. Run `git status` and `git diff` (staged + unstaged) to understand all changes.
2. Run `git log --oneline -10` to see the recent commit style for context.
3. Analyze the changes and group them logically — each commit should be a single coherent unit of work. For example:
   - A new component + its types + its i18n keys = one commit
   - A refactor across multiple files for the same reason = one commit
   - An unrelated fix found along the way = separate commit
4. For each logical group, stage only the relevant files and create a commit.
5. Use **Conventional Commits** format strictly:

```
<type>(<scope>): <short description>

<optional body — only if the "why" isn't obvious from the description>
```

### Types

- `feat` — new feature or capability
- `fix` — bug fix
- `refactor` — code change that neither fixes a bug nor adds a feature
- `chore` — maintenance (deps, config, build, ci)
- `docs` — documentation only
- `style` — formatting, whitespace (no logic change)
- `perf` — performance improvement
- `test` — adding or fixing tests

### Scope

Use the resource or module name: `location`, `activity`, `api`, `forms`, `i18n`, `filters`, etc.

### Rules

- Description in lowercase, imperative mood, no period: "add search filter" not "Added search filter."
- Keep the first line under 72 characters.
- Body explains **why**, not **what** (the diff shows the what).
- Never use generic messages like "update files", "fix stuff", "minor changes".
- If ALL changes are closely related, a single commit is fine. Don't split artificially.
- If changes span unrelated concerns, split into multiple atomic commits.
- Stage specific files per commit — never `git add -A` or `git add .` unless every change belongs together.
- Do NOT amend existing commits unless explicitly asked.
- Do NOT push to remote.
- Do NOT add `Co-Authored-By`, AI attribution, or any mention of AI tools in commit messages.

## Output

After committing, show a summary of all commits created with their hashes and messages.
