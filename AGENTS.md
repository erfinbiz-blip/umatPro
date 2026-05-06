# UmatPro

** IMPORTANT ** : keep this file short, clear and concise of agentic coding rules and workflows

Answering and planning read `wiki/AGENTS.md`

Implementation has no permission restriction on folders in this project, except files in ignore list .gitignore

## Implementation WORKFLOW
** IMPORTANT ** rules in development workflow need to adopt by coding agents

1. **Context first** — read relevant `wiki/` pages before implementing; if user request conflicts with docs, use AskUserQuestion tool to brainstorm and update docs. Wiki are source of truth.
2. **Plan** Have plan complete before start writing test & implementation
3. **GitHub flow** — one branch per feature/fix; small focused PRs; CI must pass before merge.
4. **TDD** — write tests before implementation for all business use cases and API endpoints.
5. **Validate** — UI changes: verify in browser. Business logic & API: verified by passing tests.
6. **All tests must pass** — Run full test suite before commit/PR. No code may be committed or merged with failing tests.
7. **Never modify existing tests** without explicit user approval.
8. **On task completion** — update plan completion checklists, update `wiki/` to reflect changes and completion status; append to `wiki/log.md`. Update implementation status @PRD.md
9. **COMMIT** commit all changes

### Implementation Rules

- Default base branch is main
- Start work on feature or fix branch following GitHub branch workflow, approve subagent driven development with worktree
- Use pnpm
- Use strict typescript
- Write/update `wiki/sources/openapi.yaml` for each new/changed backend API
- Frontend only refers to `openapi.yaml` for backend integration (don't read backend source code)
- Frontend UI uses Indonesia
- Use `ui-ux-pro-max` skill for web design
- Mark tasks checked when implemented — API and business case must be tested before checked done
- Never create Supabase clients in packages — always receive from apps
- change schema must use supabase migration
- check context7 mcp for function library documentation
- search web before adding new library, do research first

### Testing Rules

- Business use case and API must have testing code
- Create test code before implementation
- Do not change test code just to pass — changing test code after implementation requires user approval
