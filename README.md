# ProfessorX

ProfessorX is a small, local-first comprehension checkpoint for coding agents. It compares the working tree with a protected Git snapshot and asks the active agent to check understanding after configurable milestones.

## Install and initialize

Use a current maintained Node.js release (Node.js 20 or newer), then install or link this package and run `professorx init` from anywhere inside a Git repository. Initialization adds local hooks for Claude Code and, when detected, Codex. Codex users should run `/hooks`, review the project hook definitions, and trust them. Hook trust is hash-based, so changed definitions need review again.

ProfessorX stores state and audit history in `.professorx/`. Thresholds live in `.professorx/state.json` (`lineThreshold` and `fileThreshold`). Checkpoints use Git plumbing and a private ref; they do not change the real index, working tree, branch, `HEAD`, or normal commit history. No source, diff, usage data, or user information is sent anywhere.

## Commands

```text
professorx init [--force]
professorx status
professorx quiz
professorx resolve --result pass|fail [--topic "..."] [--summary "..."]
professorx topics [--due]
professorx log
professorx uninstall
```

`uninstall` removes only ProfessorX hook handlers. To remove local history and configuration manually afterward, run `rm -rf .professorx` from the repository root.

The Bash modification detector is best-effort and is not a security boundary. It allows read-only commands and tests while a check-in is pending.

## Development

Run tests with `npm test`.

Hook schemas were checked against the official [Codex hooks documentation](https://learn.chatgpt.com/docs/hooks) and [Claude Code hooks documentation](https://code.claude.com/docs/en/hooks).
