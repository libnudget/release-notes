"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const strict_1 = __importDefault(require("node:assert/strict"));
const node_test_1 = require("node:test");
const releaseNotes_1 = require("../src/releaseNotes");
(0, node_test_1.describe)("parseCommitMessage", () => {
    (0, node_test_1.it)("parses conventional commits", () => {
        strict_1.default.deepEqual((0, releaseNotes_1.parseCommitMessage)("feat: add copy command"), {
            type: "feat",
            scope: undefined,
            summary: "add copy command",
        });
    });
    (0, node_test_1.it)("parses scoped commits", () => {
        strict_1.default.deepEqual((0, releaseNotes_1.parseCommitMessage)("fix(cli): handle spaces"), {
            type: "fix",
            scope: "cli",
            summary: "handle spaces",
        });
    });
    (0, node_test_1.it)("detects breaking changes", () => {
        strict_1.default.deepEqual((0, releaseNotes_1.parseCommitMessage)("feat!: remove legacy flag"), {
            type: "breaking",
            scope: undefined,
            summary: "remove legacy flag",
        });
    });
    (0, node_test_1.it)("ignores non-conventional messages", () => {
        strict_1.default.equal((0, releaseNotes_1.parseCommitMessage)("Initial commit"), null);
        strict_1.default.equal((0, releaseNotes_1.parseCommitMessage)("Merge pull request #5"), null);
        strict_1.default.equal((0, releaseNotes_1.parseCommitMessage)("Bump deps"), null);
    });
    (0, node_test_1.it)("strips trailing periods", () => {
        strict_1.default.equal((0, releaseNotes_1.parseCommitMessage)("fix: handle edge case.")?.summary, "handle edge case");
    });
});
(0, node_test_1.describe)("group", () => {
    (0, node_test_1.it)("groups by label in order of appearance", () => {
        const items = [
            { type: "feat", summary: "a" },
            { type: "fix", summary: "b" },
            { type: "feat", scope: "core", summary: "c" },
            { type: "chore", summary: "d" },
            { type: "breaking", summary: "e" },
        ];
        const groups = (0, releaseNotes_1.group)(items);
        strict_1.default.deepEqual([...groups.keys()], ["Features", "Bug fixes", "Maintenance", "Breaking changes"]);
        strict_1.default.deepEqual(groups.get("Features"), ["a", "core: c"]);
        strict_1.default.deepEqual(groups.get("Maintenance"), ["d"]);
    });
    (0, node_test_1.it)("returns an empty map for no items", () => {
        strict_1.default.equal((0, releaseNotes_1.group)([]).size, 0);
    });
});
(0, node_test_1.describe)("render", () => {
    (0, node_test_1.it)("renders markdown sections", () => {
        const groups = new Map([
            ["Features", ["add copy", "core: rename"]],
            ["Bug fixes", ["handle edge case"]],
        ]);
        const out = (0, releaseNotes_1.render)(groups, "## What's changed");
        strict_1.default.ok(out.includes("## What's changed"));
        strict_1.default.ok(out.includes("## Features"));
        strict_1.default.ok(out.includes("- add copy"));
        strict_1.default.ok(out.includes("- core: rename"));
        strict_1.default.ok(out.includes("## Bug fixes"));
        strict_1.default.ok(out.includes("- handle edge case"));
        strict_1.default.ok(out.endsWith("\n"));
    });
    (0, node_test_1.it)("renders only the header when empty", () => {
        strict_1.default.equal((0, releaseNotes_1.render)(new Map(), "## What's changed"), "## What's changed\n");
    });
});
