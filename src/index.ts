import { writeFileSync } from "node:fs"
import * as core from "@actions/core"
import { context, getOctokit } from "@actions/github"
import { group, parseCommitMessage, render } from "./releaseNotes"
import type { NoteItem } from "./releaseNotes"

type Octokit = ReturnType<typeof getOctokit>

async function resolveBase(
  octokit: Octokit,
  owner: string,
  repo: string,
  fromTag: string,
): Promise<string | undefined> {
  if (fromTag) {
    const { data } = await octokit.rest.repos.getCommit({ owner, repo, ref: fromTag })
    return data.sha
  }
  const { data: tags } = await octokit.rest.repos.listTags({ owner, repo, per_page: 1 })
  if (tags.length === 0) {
    return undefined
  }
  const { data } = await octokit.rest.repos.getCommit({ owner, repo, ref: tags[0].name })
  return data.sha
}

async function run(): Promise<void> {
  const token = core.getInput("token", { required: true })
  const octokit = getOctokit(token)
  const { owner, repo } = context.repo

  const toRef = core.getInput("to-ref") || context.sha
  const fromTag = core.getInput("from-tag")
  const outputFile = core.getInput("output-file") || "RELEASE_NOTES.md"

  const base = await resolveBase(octokit, owner, repo, fromTag)
  if (!base) {
    throw new Error("no previous tag found; pass the from-tag input or create a tag first")
  }

  const { data: compare } = await octokit.rest.repos.compareCommits({
    owner,
    repo,
    base,
    head: toRef,
    per_page: 100,
  })

  const items: NoteItem[] = []
  for (const commit of compare.commits) {
    const item = parseCommitMessage(commit.commit.message)
    if (item) {
      items.push(item)
    }
  }

  const groups = group(items)
  const notes = render(groups, "## What's changed")
  core.setOutput("notes", notes)
  writeFileSync(outputFile, notes)
  core.info(`wrote release notes to ${outputFile}`)
}

run().catch((error: unknown) => {
  core.setFailed(error instanceof Error ? error.message : String(error))
})
