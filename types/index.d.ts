/** The page the built-in renderer shows in the pane. */
export type Page = {
  /** Absolute file path or http(s)/file URL. */
  target: string
  /** The latest screenshot (PNG); absent until the first render lands. */
  png?: string
  /** Bumped per render, so the terminal reads the new PNG. */
  generation: number
  /** Scroll offset in CSS pixels. */
  scrollY: number
  /** The page as markdown, for surfaces without Image or without Chrome. */
  text?: string
  status: 'rendering' | 'ready' | 'error'
  error?: string
}

declare module 'claude-code' {
  interface PluginState {
    'html-preview': { page: Page | null }
  }
}
