# html-preview

A Claude Code mod that shows HTML like a browser. When Claude writes or edits a `.html` file, the page opens right away, so a generated report or plan reads like a page in a browser.

It uses [terminal-browser](https://github.com/zenbu-labs/terminal-browser) when that is installed. Without it, a built-in renderer takes a screenshot of the page with headless Chrome and shows it in a Claude Code pane.

Claude가 `.html` 파일을 만들거나 수정하면 브라우저처럼 바로 보여 주는 Claude Code mod입니다. terminal-browser가 있으면 그것을 쓰고, 없으면 내장 렌더러(headless Chrome 스크린샷)로 Claude Code pane에 보여 줍니다.

## Requirements

- Claude Code with function hooks enabled. Add this to `~/.claude/settings.json`:
  ```json
  { "env": { "CLAUDE_CODE_ENABLE_FUNCTION_HOOKS": "1" } }
  ```
- A terminal with the kitty graphics protocol, such as Ghostty or kitty.
- One of these:
  - [terminal-browser](https://terminal-browser.com), for a real, interactive browser:
    ```bash
    brew install terminal-browser   # or: curl -fsSL https://terminal-browser.sh/install | bash
    ```
  - Google Chrome, Chromium, Edge or Brave, for the built-in renderer. Nothing else to install.
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

- In `auto` mode, the built-in renderer shows the page. Nothing is asked.
- In `split` or `pane` mode, the transcript shows one line with the install command at session start. When a page should open, the mod asks if it can install terminal-browser with Homebrew. It never installs without asking. Without Homebrew, or if you say no, it shows the commands:
  ```bash
  brew install terminal-browser
  # or
  curl -fsSL https://terminal-browser.sh/install | bash
  ```

`auto` 모드에서 terminal-browser가 없으면 내장 렌더러로 보여 줍니다. `split`/`pane` 모드에서는 설치 안내를 띄우고, Homebrew로 설치할지 먼저 물어봅니다. 묻지 않고 설치하지는 않습니다.

## How it shows the page

| `mode` | Behaviour |
| --- | --- |
| `auto` (default) | Tries, in order: the terminal-browser plugin's pane inside Claude Code (`$.browser.open`), a terminal split with `terminal-browser open <file> --split <dir>`, then the built-in renderer. |
| `pane` | Uses only the terminal-browser plugin's pane. |
| `split` | Uses only the CLI split. |
| `builtin` | Uses only the built-in renderer, even when terminal-browser is installed. |

### The built-in renderer

- Headless Chrome renders the page at 1280×800 and the pane draws the screenshot with the kitty graphics protocol.
- Buttons in the pane: `↑` (`k`) and `↓` (`j`) scroll by 600px, `top` (`t`), `reload` (`r`), `close` (`x`).
- Each save of the file renders it again.
- It is a picture: links, forms and scripts that need clicks do not work. Use terminal-browser for that.
- Without Chrome, or on a surface that cannot draw images (the desktop app), the pane shows the page as text.
- `/preview` with no argument shows the last page again.

## Options

Set the options in `/config`, or in `~/.claude/settings.json`:

```json
{
  "pluginConfigs": {
    "html-preview@html-preview": {
      "options": { "mode": "auto", "split": "right", "autoOpen": true, "chromePath": "" }
    }
  }
}
```

| Option | Values | Default |
| --- | --- | --- |
| `mode` | `auto`, `pane`, `split` | `auto` |
| `split` | `right`, `left`, `down`, `up` | `right` |
| `autoOpen` | `true`, `false` | `true` |
| `chromePath` | path to a Chrome/Chromium binary | empty: found automatically |

## Development

```bash
claude plugin validate .
claude plugin test .
claude --plugin-dir .      # load this checkout in a session
```

The function hooks API is early access. A Claude Code release can break this mod.

## License

MIT
