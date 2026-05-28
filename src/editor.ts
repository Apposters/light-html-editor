import { Canvas } from './canvas'
import { Toolbar } from './toolbar'
import { StylePanel } from './style-panel'
import { EventEmitter, debounce } from './events'
import { EDITOR_STYLES } from './styles'
import type {
  EditorOptions,
  EditorInterface,
  ToolbarAPI,
  StylePanelAPI,
  Plugin,
} from './types'

const STYLE_TAG_ID = '__lhe_global_styles__'

function injectStyles(): void {
  if (document.getElementById(STYLE_TAG_ID)) return
  const style = document.createElement('style')
  style.id = STYLE_TAG_ID
  style.textContent = EDITOR_STYLES
  document.head.appendChild(style)
}

function resolveContainer(target: string | HTMLElement): HTMLElement {
  if (typeof target === 'string') {
    const el = document.querySelector<HTMLElement>(target)
    if (!el) throw new Error(`[light-html-editor] Container not found: "${target}"`)
    return el
  }
  return target
}

export class Editor implements EditorInterface {
  private emitter = new EventEmitter()
  private canvas: Canvas
  private _toolbar: Toolbar | null = null
  private _stylePanel: StylePanel | null = null
  private wrapEl: HTMLDivElement
  private mainEl: HTMLDivElement
  private debouncedChange: () => void

  private constructor(container: HTMLElement, options: EditorOptions) {
    injectStyles()

    const {
      html = '',
      toolbar: showToolbar = true,
      stylePanel: showPanel = true,
      plugins = [],
      onChange,
      changeDebounce = 400,
    } = options

    // Root wrapper
    this.wrapEl = document.createElement('div')
    this.wrapEl.className = 'lhe-editor'
    container.appendChild(this.wrapEl)

    // Main area (canvas + optional side panel)
    this.mainEl = document.createElement('div')
    this.mainEl.className = 'lhe-main'

    // Canvas
    this.canvas = new Canvas(
      this.mainEl,
      (el) => this.onElementSelect(el),
      () => this.debouncedChange(),
    )

    if (showToolbar) {
      this._toolbar = new Toolbar(this.wrapEl, this.canvas, this)
    }

    this.wrapEl.appendChild(this.mainEl)

    if (showPanel) {
      this._stylePanel = new StylePanel(this.mainEl, this.canvas, this)
    }

    // Debounced change emitter
    this.debouncedChange = debounce(() => {
      const html = this.getHtml()
      this.emitter.emit('change', html)
      onChange?.(html)
    }, changeDebounce)

    // Install plugins
    for (const plugin of plugins) this.installPlugin(plugin)

    // Load initial HTML
    if (html) this.canvas.setHtml(html)

    // Emit ready on next tick (after iframe load settles)
    setTimeout(() => this.emitter.emit('ready'), 0)
  }

  static create(target: string | HTMLElement, options: EditorOptions = {}): Editor {
    return new Editor(resolveContainer(target), options)
  }

  // ── Public API ─────────────────────────────────────────────────────────────

  getHtml(): string {
    return this.canvas.getHtml()
  }

  setHtml(html: string): void {
    this.canvas.setHtml(html)
    this._stylePanel?.clear()
  }

  on(event: string, listener: (...args: unknown[]) => void): () => void {
    return this.emitter.on(event, listener)
  }

  off(event: string, listener: (...args: unknown[]) => void): void {
    this.emitter.off(event, listener)
  }

  get selectedElement(): Element | null {
    return this.canvas.getSelectedElement()
  }

  get toolbar(): ToolbarAPI | null {
    return this._toolbar
  }

  get stylePanel(): StylePanelAPI | null {
    return this._stylePanel
  }

  destroy(): void {
    this._toolbar?.destroy()
    this._stylePanel?.destroy()
    this.canvas.destroy()
    this.emitter.destroy()
    this.wrapEl.remove()
  }

  // ── Internal ───────────────────────────────────────────────────────────────

  private onElementSelect(el: Element): void {
    this._stylePanel?.loadElement(el)
    this.emitter.emit('select', el)
  }

  private installPlugin(plugin: Plugin): void {
    try {
      plugin.install(this)
    } catch (err) {
      console.error(`[light-html-editor] Plugin "${plugin.name}" failed to install:`, err)
    }
  }
}
