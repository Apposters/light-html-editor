import { CANVAS_IFRAME_STYLES } from './styles'

export type CanvasSelectHandler = (el: Element) => void
export type CanvasChangeHandler = () => void

export class Canvas {
  private iframe: HTMLIFrameElement
  private iframeDoc: Document | null = null
  private selectedEl: Element | null = null
  private savedRange: Range | null = null
  private mutationObserver: MutationObserver | null = null

  constructor(
    private container: HTMLElement,
    private onSelect: CanvasSelectHandler,
    private onChange: CanvasChangeHandler,
  ) {
    this.iframe = document.createElement('iframe')
    this.iframe.className = 'lhe-canvas'
    this.iframe.setAttribute('sandbox', 'allow-same-origin allow-scripts')
    container.appendChild(this.iframe)
    this.iframe.onload = () => this.onIframeLoad()
  }

  private onIframeLoad(): void {
    const doc = this.iframe.contentDocument
    if (!doc?.body) return
    this.iframeDoc = doc

    const style = doc.createElement('style')
    style.textContent = CANVAS_IFRAME_STYLES
    doc.head.appendChild(style)

    doc.body.contentEditable = 'true'
    doc.body.style.outline = 'none'

    try { doc.execCommand('styleWithCSS', false, 'true') } catch (_) { /* noop */ }
    try { doc.execCommand('defaultParagraphSeparator', false, 'p') } catch (_) { /* noop */ }

    doc.addEventListener('click', (e) => {
      const target = e.target as Element
      if (target.closest('a[href]')) e.preventDefault()
      if (target !== doc.body) this.selectElement(target)
    })

    doc.addEventListener('selectionchange', () => {
      this.updateFormatState()
    })

    this.mutationObserver = new MutationObserver(() => this.onChange())
    this.mutationObserver.observe(doc.body, {
      childList: true,
      subtree: true,
      characterData: true,
      attributes: true,
    })
  }

  setHtml(html: string): void {
    this.selectedEl = null
    this.iframeDoc = null
    this.mutationObserver?.disconnect()
    this.mutationObserver = null
    this.iframe.srcdoc = html
  }

  getHtml(): string {
    const doc = this.iframeDoc
    if (!doc) return ''

    const headHtml = doc.head.innerHTML
      .replace(/<style[^>]*>[\s\S]*?<\/style>/gi, (match) =>
        match.includes('__lhe_sel') ? '' : match,
      )
      .trim()

    const bodyAttrs = Array.from(doc.body.attributes)
      .filter(a => a.name !== 'contenteditable')
      .map(a => `${a.name}="${a.value}"`)
      .join(' ')

    const bodyHtml = doc.body.innerHTML
      .replace(/ class="__lhe_sel"/g, '')
      .replace(/ class="__lhe_sel ([^"]+)"/g, ' class="$1"')
      .replace(/ __lhe_sel /g, ' ')

    const bodyOpen = bodyAttrs ? `<body ${bodyAttrs}>` : '<body>'
    return `<!DOCTYPE html>\n<html>\n<head>\n${headHtml}\n</head>\n${bodyOpen}\n${bodyHtml}\n</body>\n</html>`
  }

  // ── Text formatting ────────────────────────────────────────────────────────

  execCommand(cmd: string, val?: string): void {
    const doc = this.iframeDoc
    if (!doc) return
    try { doc.execCommand('styleWithCSS', false, 'true') } catch (_) { /* noop */ }
    doc.execCommand(cmd, false, val ?? undefined)
    this.updateFormatState()
  }

  queryCommandState(cmd: string): boolean {
    if (!this.iframeDoc) return false
    try { return this.iframeDoc.queryCommandState(cmd) } catch (_) { return false }
  }

  saveRange(): void {
    const sel = this.iframeDoc?.getSelection()
    this.savedRange = sel?.rangeCount ? sel.getRangeAt(0).cloneRange() : null
  }

  restoreRange(): void {
    if (!this.iframeDoc || !this.savedRange) return
    const sel = this.iframeDoc.getSelection()
    if (!sel) return
    sel.removeAllRanges()
    sel.addRange(this.savedRange)
  }

  private updateFormatState(): void {
    // Emitted via custom event so Toolbar can react
    const event = new CustomEvent('lhe:formatstate', { bubbles: false })
    this.iframe.dispatchEvent(event)
  }

  onFormatStateChange(listener: () => void): () => void {
    this.iframe.addEventListener('lhe:formatstate' as keyof HTMLElementEventMap, listener)
    return () => this.iframe.removeEventListener('lhe:formatstate' as keyof HTMLElementEventMap, listener)
  }

  // ── Element selection ──────────────────────────────────────────────────────

  private selectElement(el: Element): void {
    if (!this.iframeDoc) return
    this.iframeDoc.querySelectorAll('.__lhe_sel').forEach(e => e.classList.remove('__lhe_sel'))
    this.selectedEl = el
    el.classList.add('__lhe_sel')
    this.onSelect(el)
  }

  getSelectedElement(): Element | null {
    return this.selectedEl
  }

  applyStyle(prop: string, value: string): void {
    if (!this.selectedEl) return
    ;(this.selectedEl as HTMLElement).style.setProperty(
      prop.replace(/([A-Z])/g, '-$1').toLowerCase(),
      value,
    )
  }

  getStyle(prop: string): string {
    if (!this.selectedEl) return ''
    return (this.selectedEl as HTMLElement).style.getPropertyValue(
      prop.replace(/([A-Z])/g, '-$1').toLowerCase(),
    )
  }

  getComputedStyleProp(prop: string): string {
    if (!this.selectedEl || !this.iframeDoc) return ''
    return this.iframeDoc.defaultView
      ?.getComputedStyle(this.selectedEl)
      .getPropertyValue(prop.replace(/([A-Z])/g, '-$1').toLowerCase()) ?? ''
  }

  destroy(): void {
    this.mutationObserver?.disconnect()
    this.iframe.remove()
    this.iframeDoc = null
    this.selectedEl = null
  }
}
