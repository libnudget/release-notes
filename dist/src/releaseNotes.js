"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.parseCommitMessage = parseCommitMessage;
exports.group = group;
exports.render = render;
const CONVENTIONAL = /^([a-z]+)(?:\(([^)]+)\))?(!)?:\s+(.+)$/;
function parseCommitMessage(message) {
    const match = CONVENTIONAL.exec(message.trim());
    if (!match) {
        return null;
    }
    const type = match[3] ? "breaking" : match[1];
    const summary = match[4].replace(/\.$/, "").trim();
    if (summary.startsWith("Merge ")) {
        return null;
    }
    return { type, scope: match[2], summary };
}
function group(items) {
    const groups = new Map();
    for (const item of items) {
        const label = groupLabel(item.type);
        const list = groups.get(label) ?? [];
        list.push(item.scope ? `${item.scope}: ${item.summary}` : item.summary);
        groups.set(label, list);
    }
    return groups;
}
function groupLabel(type) {
    switch (type) {
        case "breaking":
            return "Breaking changes";
        case "feat":
            return "Features";
        case "fix":
            return "Bug fixes";
        case "perf":
            return "Performance";
        default:
            return "Maintenance";
    }
}
function render(groups, header) {
    const lines = [header, ""];
    for (const [label, items] of groups) {
        lines.push(`## ${label}`, "");
        for (const item of items) {
            lines.push(`- ${item}`);
        }
        lines.push("");
    }
    return `${lines.join("\n").trimEnd()}\n`;
}
