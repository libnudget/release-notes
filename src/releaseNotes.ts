export type NoteItem = {
  type: string
  scope?: string
  summary: string
}

const CONVENTIONAL = /^([a-z]+)(?:\(([^)]+)\))?(!)?:\s+(.+)$/

export function parseCommitMessage(message: string): NoteItem | null {
  const match = CONVENTIONAL.exec(message.trim())
  if (!match) {
    return null
  }
  const type = match[3] ? "breaking" : match[1]
  const summary = match[4].replace(/\.$/, "").trim()
  if (summary.startsWith("Merge ")) {
    return null
  }
  return { type, scope: match[2], summary }
}

export function group(items: NoteItem[]): Map<string, string[]> {
  const groups = new Map<string, string[]>()
  for (const item of items) {
    const label = groupLabel(item.type)
    const list = groups.get(label) ?? []
    list.push(item.scope ? `${item.scope}: ${item.summary}` : item.summary)
    groups.set(label, list)
  }
  return groups
}

function groupLabel(type: string): string {
  switch (type) {
    case "breaking":
      return "Breaking changes"
    case "feat":
      return "Features"
    case "fix":
      return "Bug fixes"
    case "perf":
      return "Performance"
    default:
      return "Maintenance"
  }
}

export function render(groups: Map<string, string[]>, header: string): string {
  const lines: string[] = [header, ""]
  for (const [label, items] of groups) {
    lines.push(`## ${label}`, "")
    for (const item of items) {
      lines.push(`- ${item}`)
    }
    lines.push("")
  }
  return `${lines.join("\n").trimEnd()}\n`
}
