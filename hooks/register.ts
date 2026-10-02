import type { EngineInterface, PluginOptions, Register } from 'claude-code'

// The noun the terminal-browser Claude Code plugin adds to `$`
// (zenbu-labs/terminal-browser, claude-code-plugin/hooks/browser.d.ts).
// Declared here rather than as a dependency so this mod still loads, and
// falls back to the CLI, when that plugin is not installed.
type BrowserOpenResult = { ok: true; url: string } | { ok: false; error: string }
type Browser = { open: (input: { url?: string }) => Promise<BrowserOpenResult> }

const HTML = /\.html?$/i
const SCHEME = /^[a-z][a-z0-9+.-]*:/i

type WithBrowser = EngineInterface & { browser: Browser }

// Undefined when the terminal-browser plugin is not loaded (no `browser` noun)
// or its noun throws, so the caller falls back to the CLI.
async function openInPane($: EngineInterface, url: string): Promise<BrowserOpenResult | undefined> {
  try {
    return await ($ as WithBrowser).browser.open({ url })
  } catch {
    return undefined
  }
}

function fileUrl(path: string): string {
  return 'file://' + path.split('/').map(encodeURIComponent).join('/')
}

async function resolvePath($: EngineInterface, target: string): Promise<string> {
  if (SCHEME.test(target) || target.startsWith('/')) return target
  const home = target.startsWith('~/') ? await $.env.get('HOME') : undefined
  if (home) return `${home}/${target.slice(2)}`
  return `${await $.session.cwd()}/${target.replace(/^\.\//, '')}`
}

async function openInSplit($: EngineInterface, target: string, split: string): Promise<string> {
  try {
    const run = await $.process.run(['terminal-browser', 'open', target, '--split', split], { timeoutMs: 10000 })
    if (run.exitCode === 0) return `Opened ${target} in terminal-browser (split ${split})`
    return `terminal-browser failed: ${(run.stderr || run.stdout).trim() || `exit ${run.exitCode}`}`
  } catch (err) {
    return `terminal-browser is not installed or could not start (${err}). Install: curl -fsSL https://terminal-browser.sh/install | bash`
  }
}

async function preview($: EngineInterface, raw: string, options: PluginOptions): Promise<string> {
  const target = await resolvePath($, raw)
  if (!SCHEME.test(target)) {
    const stat = await $.fs.stat(target).catch(() => undefined)
    if (!stat) return `No such file: ${target}`
  }
  const url = SCHEME.test(target) ? target : fileUrl(target)
  const opened = options.mode === 'split' ? undefined : await openInPane($, url)

  if (opened) {
    if (opened.ok) return `Opened ${target} in terminal-browser`
    if (options.mode === 'pane') return opened.error
  } else if (options.mode === 'pane') {
    return 'The terminal-browser plugin is not installed: claude plugin marketplace add zenbu-labs/terminal-browser && claude plugin install terminal-browser@terminal-browser'
  }

  return openInSplit($, target, String(options.split))
}

export const register: Register = (on, options) => {
  on('session.start', async ($, e, next) => {
    const started = await next(e)
    await $.command.register({
      name: 'preview',
      description: 'Open an HTML file (or URL) in terminal-browser',
      argumentHint: '<file.html | url>',
    })

    return started
  })

  on('command.run', { command: 'preview' }, async ($, e) => {
    const arg = e.args.trim()
    if (!arg) return { text: 'Usage: /preview <file.html | url>' }

    return { text: await preview($, arg, options) }
  })

  on('tool.call', async ($, e, next) => {
    const ran = await next(e)
    if (!options.autoOpen || ran.deny !== undefined || ran.isError) return ran
    if (e.tool !== 'Write' && e.tool !== 'Edit') return ran
    if (!HTML.test(e.file_path) || e.agentId) return ran

    $.ui.toast(await preview($, e.file_path, options))

    return ran
  })
}
