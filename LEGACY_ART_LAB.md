# Legacy Art Lab Archive

The Art Lab and Hidden Grammar application was removed from the active Artists Are Jerks site in September 2026. The complete pre-removal state is preserved in Git.

## Archive references

- Final commit: `e2e3003`
- Annotated tag: `art-lab-final-2026`
- Archive branch: `archive/art-lab-legacy`

To inspect the archive without disturbing current work, create a separate worktree:

```bash
git worktree add ../artistsarejerks-art-lab-archive archive/art-lab-legacy
```

The archive contains the analysis interfaces, prompts, framework data, API endpoints, D1 migrations, R2 integration, corpus tools, MCP server, and development documentation.

## Cloudflare resources

The active code no longer binds or uses the legacy resources:

- D1 database: `artlab-analyses`
- R2 bucket: `artlab-images`

Those remote resources were not deleted during the code retirement. Their former binding configuration and complete database schema remain available in the archive.

Any future community-market database should be designed as a new system rather than extending or migrating the Art Lab schema.
