import assert from "node:assert/strict"
import { describe, it } from "node:test"
import { group, parseCommitMessage, render } from "../src/releaseNotes"

describe("parseCommitMessage", () => {
  it("parses conventional commits", () => {
    assert.deepEqual(parseCommitMessage("feat: add copy command"), {
      type: "feat",
      scope: undefined,
      summary: "add copy command",
    })
  })

  it("parses scoped commits", () => {
    assert.deepEqual(parseCommitMessage("fix(cli): handle spaces"), {
      type: "fix",
      scope: "cli",
      summary: "handle spaces",
    })
  })

  it("detects breaking changes", () => {
    assert.deepEqual(parseCommitMessage("feat!: remove legacy flag"), {
      type: "breaking",
      scope: undefined,
      summary: "remove legacy flag",
    })
  })

  it("ignores non-conventional messages", () => {
    assert.equal(parseCommitMessage("Initial commit"), null)
    assert.equal(parseCommitMessage("Merge pull request #5"), null)
    assert.equal(parseCommitMessage("Bump deps"), null)
  })

  it("strips trailing periods", () => {
    assert.equal(parseCommitMessage("fix: handle edge case.")?.summary, "handle edge case")
  })
})

describe("group", () => {
  it("groups by label in order of appearance", () => {
    const items: Parameters<typeof group>[0] = [
      { type: "feat", summary: "a" },
      { type: "fix", summary: "b" },
      { type: "feat", scope: "core", summary: "c" },
      { type: "chore", summary: "d" },
      { type: "breaking", summary: "e" },
    ]
    const groups = group(items)
    assert.deepEqual([...groups.keys()], ["Features", "Bug fixes", "Maintenance", "Breaking changes"])
    assert.deepEqual(groups.get("Features"), ["a", "core: c"])
    assert.deepEqual(groups.get("Maintenance"), ["d"])
  })

  it("returns an empty map for no items", () => {
    assert.equal(group([]).size, 0)
  })
})

describe("render", () => {
  it("renders markdown sections", () => {
    const groups = new Map([
      ["Features", ["add copy", "core: rename"]],
      ["Bug fixes", ["handle edge case"]],
    ])
    const out = render(groups, "## What's changed")
    assert.ok(out.includes("## What's changed"))
    assert.ok(out.includes("## Features"))
    assert.ok(out.includes("- add copy"))
    assert.ok(out.includes("- core: rename"))
    assert.ok(out.includes("## Bug fixes"))
    assert.ok(out.includes("- handle edge case"))
    assert.ok(out.endsWith("\n"))
  })

  it("renders only the header when empty", () => {
    assert.equal(render(new Map(), "## What's changed"), "## What's changed\n")
  })
})
