import type { ToolbarButtonConfig, EditorInterface, ToolbarAPI } from './types'
import type { Canvas } from './canvas'

interface InternalButton extends ToolbarButtonConfig {
  el?: HTMLButtonElement
  sepEl?: HTMLSpanElement
}

export class Toolbar implements ToolbarAPI {
  private el: HTMLDivElement
  private buttons: InternalButton[] = []
  private formatStateUnsubscribe: (() => void) | null = null

  constructor(
    private container: HTMLElement,
    private canvas: Canvas,
    private editor: EditorInterface,
  ) {
    this.el = document.createElement('div')
    this.el.className = 'lhe-toolbar'
    container.appendChild(this.el)
    this.buildDefault()
    this.formatStateUnsubscribe = canvas.onFormatStateChange(() => this.updateActiveStates())
  }

  private buildDefault(): void {
    const defaultButtons: (ToolbarButtonConfig | 'sep')[] = [
      { id: 'bold',          label: '<b>B</b>',   title: 'Bold (Ctrl+B)',          command: 'bold' },
      { id: 'italic',        label: '<i>I</i>',   title: 'Italic (Ctrl+I)',        command: 'italic' },
      { id: 'underline',     label: '<u>U</u>',   title: 'Underline (Ctrl+U)',     command: 'underline' },
      { id: 'strikethrough', label: '<s>S</s>',   title: 'Strikethrough',          command: 'strikeThrough' },
      'sep',
      { id: 'alignLeft',   label: '⬅≡', title: 'Align left',   command: 'justifyLeft' },
      { id: 'alignCenter', label: '≡',  title: 'Center',       command: 'justifyCenter' },
      { id: 'alignRight',  label: '≡➡', title: 'Align right',  command: 'justifyRight' },
      'sep',
      { id: 'ul', label: '• List', title: 'Bullet list',   command: 'insertUnorderedList' },
      { id: 'ol', label: '1. List', title: 'Numbered list', command: 'insertOrderedList' },
      'sep',
      { id: 'removeFormat', label: '✕ fmt', title: 'Clear formatting', command: 'removeFormat' },
      'sep',
      { id: 'undo', label: '↩ Undo', title: 'Undo (Ctrl+Z)', command: 'undo' },
      { id: 'redo', label: '↪ Redo', title: 'Redo (Ctrl+Y)', command: 'redo' },
    ]

    // Text color
    this.el.appendChild(this.buildColorButton(
      'color-text',
      '<b style="color:#e94560">A</b>',
      'Text color',
      (color) => this.canvas.execCommand('foreColor', color),
    ))
    this.el.appendChild(this.buildSep())

    // Highlight color
    this.el.appendChild(this.buildColorButton(
      'color-bg',
      '▨',
      'Highlight color',
      (color) => this.canvas.execCommand('backColor', color),
    ))
    this.el.appendChild(this.buildSep())

    // Link button
    const linkBtn = this.buildButton({
      id: 'link',
      label: 'Link',
      title: 'Insert / edit link',
      onClick: () => this.handleLink(),
    })
    this.el.appendChild(linkBtn)
    this.el.appendChild(this.buildSep())

    for (const item of defaultButtons) {
      if (item === 'sep') {
        this.el.appendChild(this.buildSep())
      } else {
        this.el.appendChild(this.buildButton(item))
      }
    }
  }

  private buildButton(cfg: ToolbarButtonConfig): HTMLButtonElement {
    const btn = document.createElement('button')
    btn.className = 'lhe-fmt-btn'
    btn.innerHTML = cfg.label
    if (cfg.title) btn.title = cfg.title
    btn.addEventListener('mousedown', (e) => {
      e.preventDefault()
      if (cfg.onClick) {
        cfg.onClick(this.editor)
      } else if (cfg.command) {
        this.canvas.execCommand(cfg.command, cfg.commandValue)
      }
      this.updateActiveStates()
    })
    const internal: InternalButton = { ...cfg, el: btn }
    if (cfg.separatorBefore) {
      const sep = this.buildSep()
      internal.sepEl = sep
      this.el.appendChild(sep)
    }
    this.buttons.push(internal)
    return btn
  }

  private buildSep(): HTMLSpanElement {
    const sep = document.createElement('span')
    sep.className = 'lhe-sep'
    return sep
  }

  private buildColorButton(
    id: string,
    iconHtml: string,
    title: string,
    apply: (color: string) => void,
  ): HTMLElement {
    const wrap = document.createElement('div')
    wrap.className = 'lhe-color-wrap'
    wrap.title = title

    const btn = document.createElement('button')
    btn.className = 'lhe-fmt-btn'
    btn.innerHTML = iconHtml
    wrap.appendChild(btn)

    const input = document.createElement('input')
    input.type = 'color'
    input.id = `__lhe_${id}`
    input.value = id === 'color-text' ? '#000000' : '#ffff00'
    wrap.appendChild(input)

    input.addEventListener('mousedown', () => this.canvas.saveRange())
    input.addEventListener('change', () => {
      this.canvas.restoreRange()
      apply(input.value)
    })

    return wrap
  }

  private handleLink(): void {
    const doc = this.canvas['iframeDoc'] as Document | null
    if (!doc) return
    const sel = doc.getSelection()
    const a = (sel?.anchorNode?.parentElement as Element)?.closest?.('a')
    const url = prompt(a ? 'Edit link URL:' : 'Enter URL:', a?.getAttribute('href') ?? '')
    if (url === null) return
    if (a && url === '') {
      this.canvas.execCommand('unlink')
    } else if (url) {
      this.canvas.execCommand('createLink', url)
    }
  }

  private updateActiveStates(): void {
    const STATEFUL = new Set(['bold', 'italic', 'underline', 'strikeThrough', 'justifyLeft', 'justifyCenter', 'justifyRight'])
    for (const btn of this.buttons) {
      if (!btn.el || !btn.command) continue
      if (STATEFUL.has(btn.command)) {
        btn.el.classList.toggle('lhe-active', this.canvas.queryCommandState(btn.command))
      }
    }
  }

  // ── Plugin API ─────────────────────────────────────────────────────────────

  addButton(config: ToolbarButtonConfig): void {
    const btn = this.buildButton(config)
    this.el.appendChild(btn)
  }

  removeButton(id: string): void {
    const idx = this.buttons.findIndex(b => b.id === id)
    if (idx === -1) return
    const b = this.buttons[idx]
    b.el?.remove()
    b.sepEl?.remove()
    this.buttons.splice(idx, 1)
  }

  destroy(): void {
    this.formatStateUnsubscribe?.()
    this.el.remove()
  }
}
