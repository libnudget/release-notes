"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
const node_fs_1 = require("node:fs");
const core = __importStar(require("@actions/core"));
const github_1 = require("@actions/github");
const releaseNotes_1 = require("./releaseNotes");
async function resolveBase(octokit, owner, repo, fromTag) {
    if (fromTag) {
        const { data } = await octokit.rest.repos.getCommit({ owner, repo, ref: fromTag });
        return data.sha;
    }
    const { data: tags } = await octokit.rest.repos.listTags({ owner, repo, per_page: 1 });
    if (tags.length === 0) {
        return undefined;
    }
    const { data } = await octokit.rest.repos.getCommit({ owner, repo, ref: tags[0].name });
    return data.sha;
}
async function run() {
    const token = core.getInput("token", { required: true });
    const octokit = (0, github_1.getOctokit)(token);
    const { owner, repo } = github_1.context.repo;
    const toRef = core.getInput("to-ref") || github_1.context.sha;
    const fromTag = core.getInput("from-tag");
    const outputFile = core.getInput("output-file") || "RELEASE_NOTES.md";
    const base = await resolveBase(octokit, owner, repo, fromTag);
    if (!base) {
        throw new Error("no previous tag found; pass the from-tag input or create a tag first");
    }
    const { data: compare } = await octokit.rest.repos.compareCommits({
        owner,
        repo,
        base,
        head: toRef,
        per_page: 100,
    });
    const items = [];
    for (const commit of compare.commits) {
        const item = (0, releaseNotes_1.parseCommitMessage)(commit.commit.message);
        if (item) {
            items.push(item);
        }
    }
    const groups = (0, releaseNotes_1.group)(items);
    const notes = (0, releaseNotes_1.render)(groups, "## What's changed");
    core.setOutput("notes", notes);
    (0, node_fs_1.writeFileSync)(outputFile, notes);
    core.info(`wrote release notes to ${outputFile}`);
}
run().catch((error) => {
    core.setFailed(error instanceof Error ? error.message : String(error));
});
