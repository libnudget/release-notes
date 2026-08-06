# release-notes

[![Release](https://img.shields.io/github/v/release/libnudget/release-notes?logo=github&label=latest)](https://github.com/libnudget/release-notes/releases)

A GitHub Action that turns merged pull requests into clean, grouped
release notes.

release-notes reads the commits merged between two tags, groups them by
conventional-commit type, and writes a markdown file you can attach to a
GitHub release.

## Usage

```yaml
- uses: libnudget/release-notes@main
  with:
    token: ${{ secrets.GITHUB_TOKEN }}
```

This compares against the latest tag and writes `RELEASE_NOTES.md`.

To control the range explicitly:

```yaml
- uses: libnudget/release-notes@main
  with:
    token: ${{ secrets.GITHUB_TOKEN }}
    from-tag: v0.1.0
    to-ref: v0.2.0
    output-file: release-notes.md
```

## Inputs

| Name | Required | Default | Description |
| --- | --- | --- | --- |
| `token` | yes | `github.token` | Token with access to the repository. |
| `from-tag` | no | latest tag | Tag to generate notes from (exclusive). |
| `to-ref` | no | current SHA | Commit or ref to generate notes up to (inclusive). |
| `output-file` | no | `RELEASE_NOTES.md` | Path to write the release notes to. |

## Outputs

| Name | Description |
| --- | --- |
| `notes` | The generated release notes. |

## How it works

- Commit messages must follow [Conventional Commits](https://www.conventionalcommits.org/).
- `feat` groups under **Features**, `fix` under **Bug fixes**, `perf`
  under **Performance**, breaking changes (the `!` marker) under
  **Breaking changes**, and everything else under **Maintenance**.
- Scope (for example `feat(cli):`) is kept inline: `cli: message`.
- Non-conventional messages, including merge commits, are skipped.

## Development

```sh
npm install
npm run lint
npm test
```

## License

MIT
