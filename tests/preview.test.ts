import { describe, expect, test } from 'claude-code/testing'

const PAGE = '/work/plan.html'

describe('html-preview', () => {
  test('a written .html file opens in a terminal-browser split', { options: { mode: 'split' } }, async ($, on) => {
    const runs: (readonly string[])[] = []
    const toasts: string[] = []
    on('tool.call', () => ({ result: { type: 'create', filePath: PAGE, content: '', structuredPatch: [], originalFile: null } } as never))
    on('fs.stat', () => ({ value: { kind: 'file', size: 10, mtimeMs: 0 } } as never))
    on('process.run', (_$, e) => {
      if (e.argv[0] !== '/bin/sh') runs.push(e.argv)
      return { value: { exitCode: 0, stdout: '', stderr: '', isStdoutTruncated: false, isStderrTruncated: false } }
    })
    on('ui.toast', (_$, e) => {
      toasts.push(e.text)
      return { value: undefined }
    })

    await $.tool.call({ tool: 'Write', file_path: PAGE, content: '<h1>hi</h1>' })

    expect(runs).toEqual([['terminal-browser', 'open', PAGE, '--split', 'right']])
    expect(toasts[0]).toContain('Opened /work/plan.html')
  })

  test('other files are left alone', { options: { mode: 'split' } }, async ($, on) => {
    const runs: (readonly string[])[] = []
    on('tool.call', () => ({ result: { type: 'create', filePath: '/work/a.ts', content: '', structuredPatch: [], originalFile: null } } as never))
    on('process.run', (_$, e) => {
      if (e.argv[0] !== '/bin/sh') runs.push(e.argv)
      return { value: { exitCode: 0, stdout: '', stderr: '', isStdoutTruncated: false, isStderrTruncated: false } }
    })

    await $.tool.call({ tool: 'Write', file_path: '/work/a.ts', content: 'x' })

    expect(runs).toEqual([])
  })

  test('a missing terminal-browser is explained, not installed unasked', { options: { mode: 'split' } }, async ($, on) => {
    const runs: (readonly string[])[] = []
    on('tool.call', () => ({ deny: 'dismissed' }))
    on('process.run', (_$, e) => {
      runs.push(e.argv)
      const isMissing = e.argv[2] === 'command -v terminal-browser'
      return { value: { exitCode: isMissing ? 1 : 0, stdout: '', stderr: '', isStdoutTruncated: false, isStderrTruncated: false } }
    })

    const ran = await $.command.run({ command: 'preview', args: PAGE } as never)

    expect(ran.text).toContain('brew install terminal-browser')
    expect(runs.some(argv => argv[0] === 'brew' || argv[0] === 'terminal-browser')).toBe(false)
  })

  test('/preview without a file explains its usage', async $ => {
    const ran = await $.command.run({ command: 'preview', args: '' } as never)

    expect(ran.text).toContain('Usage: /preview')
  })
})
