# html-preview

A Claude Code mod that opens HTML in [terminal-browser](https://github.com/zenbu-labs/terminal-browser).
When Claude writes or edits a `.html` file, the page opens right away, so a generated report or plan reads like a page in a browser.

Claude가 `.html` 파일을 만들거나 수정하면 terminal-browser로 바로 띄워 주는 Claude Code mod입니다.

## Requirements

- Claude Code with function hooks enabled. Add this to `~/.claude/settings.json`:
  ```json
  { "env": { "CLAUDE_CODE_ENABLE_FUNCTION_HOOKS": "1" } }
  ```
- [terminal-browser](https://terminal-browser.com):
  ```bash
  curl -fsSL https://terminal-browser.sh/install | bash   # or: brew install terminal-browser
  ```
- A terminal with the kitty graphics protocol, such as Ghostty or kitty.
- Optional, for the in-Claude-Code pane: the terminal-browser plugin.
  ```bash
  claude plugin marketplace add zenbu-labs/terminal-browser
  claude plugin install terminal-browser@terminal-browser
  ```

## Install

```bash
claude plugin marketplace add JAICHANGPARK/html-preview
claude plugin install html-preview@html-preview
```

## Usage

- **Auto:** when the `Write` or `Edit` tool saves a `*.html` / `*.htm` file, the page opens. A later edit opens it again, so you see the new version.
- **Manual:** `/preview <file.html | url>`. Relative paths resolve against the session's working directory.
- **Setup:** `/preview setup` checks for terminal-browser. If it is missing and Homebrew is installed, the mod asks before it runs `brew install terminal-browser`.

### When terminal-browser is not installed

- At session start, the transcript shows one line with the install command.
- When a page should open, the mod asks if it can install terminal-browser with Homebrew. It never installs without asking. Without Homebrew, or if you say no, it shows the commands:
  ```bash
  brew install terminal-browser
  # or
  curl -fsSL https://terminal-browser.sh/install | bash
  ```

terminal-browser가 없으면 세션 시작 시 설치 안내를 띄우고, 페이지를 열 때 Homebrew로 설치할지 먼저 물어봅니다. 묻지 않고 설치하지는 않습니다.

## How it shows the page

| `mode` | Behaviour |
| --- | --- |
| `auto` (default) | Opens in the terminal-browser plugin's pane inside Claude Code (`$.browser.open`). If that plugin is not installed, opens a terminal split with `terminal-browser open <file> --split <dir>`. |
| `pane` | Uses only the terminal-browser plugin's pane. |
| `split` | Uses only the CLI split. |

## Options

Set the options in `/config`, or in `~/.claude/settings.json`:

```json
{
  "pluginConfigs": {
    "html-preview@html-preview": {
      "options": { "mode": "auto", "split": "right", "autoOpen": true }
    }
  }
}
```

| Option | Values | Default |
| --- | --- | --- |
| `mode` | `auto`, `pane`, `split` | `auto` |
| `split` | `right`, `left`, `down`, `up` | `right` |
| `autoOpen` | `true`, `false` | `true` |

## Development

```bash
claude plugin validate .
claude plugin test .
claude --plugin-dir .      # load this checkout in a session
```

The function hooks API is early access. A Claude Code release can break this mod.

## License

MIT
