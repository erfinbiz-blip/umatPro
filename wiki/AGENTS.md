# AGENTS.md — Wiki Guide

## Wiki Structure

```
wiki/
├── AGENTS.md          # This file — wiki guide & conventions
├── index.md           # Catalog of all wiki pages
├── log.md             # Chronological log of ingests & queries
├── raw/               # Immutable source documents
│   ├── CONTEXT.md
│   └── PRD.md
├── entities/          # Entity pages (people, projects, organizations)
├── concepts/          # Concept pages (ideas, patterns, technologies)
└── sources/           # Source summaries (one per raw document)
```

## Conventions

### File Naming
- Lowercase, hyphen-separated: `umat-pro.md`, `supabase-auth.md`
- No spaces or special characters

### Frontmatter
Every wiki page should include YAML frontmatter:
```yaml
---
type: entity | concept | source
date: YYYY-MM-DD
source_count: 1
tags: [tag1, tag2]
---
```

### Cross-References
- Use Obsidian wikilinks: `[[page-name]]`
- Link liberally — the graph view shows connections
- When mentioning a concept/entity for the first time on a page, link it

### Page Types

**Source pages** (`sources/`):
- One per raw document
- Summary of key points
- Links to entities and concepts mentioned
- Tag with source type: `[article, prd, context, meeting-notes]`

**Entity pages** (`entities/`):
- Projects, people, organizations, products
- Persistent — updated when new sources mention them
- Include "Mentions" section listing sources

**Concept pages** (`concepts/`):
- Ideas, patterns, technologies, methodologies
- Evolving synthesis across multiple sources
- Include "Related" section for linked concepts

## Workflows

### Ingest
1. Copy raw source to `wiki/raw/`
2. Read source and identify key entities, concepts, and claims
3. Create/update entity pages (one per entity)
4. Create/update concept pages (one per concept)
5. Create source summary page in `sources/`
6. Update `index.md` with new pages
7. Append entry to `log.md`

### Query
1. Read `index.md` to find relevant pages
2. Read specific pages for details
3. Synthesize answer with citations
4. If valuable, file answer back as new wiki page

### Lint
Periodically check for:
- Contradictions between pages
- Orphan pages (no inbound links)
- Missing cross-references
- Concepts mentioned but lacking pages
- Stale claims superseded by newer sources

## Tips
- Use `notesmd-cli` to interact with wiki from terminal
- Obsidian graph view shows wiki structure visually
- Keep pages atomic — one main idea per page
- Prefer linking over duplicating content
