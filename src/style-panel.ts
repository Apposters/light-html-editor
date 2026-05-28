import type { StyleSectionConfig, EditorInterface, StylePanelAPI } from './types'
import type { Canvas } from './canvas'

const PX_PROPS = new Set([
  'paddingTop', 'paddingRight', 'paddingBottom', 'paddingLeft',
  'marginTop', 'marginRight', 'marginBottom', 'marginLeft',
  'borderWidth', 'borderRadius',
  'top', 'right', 'bottom', 'left',
  'width', 'height', 'maxWidth', 'minHeight',
  'fontSize', 'gap', 'letterSpacing',
])

function normValue(prop: string, value: string): string {
  const v = value.trim()
  if (v && PX_PROPS.has(prop) && /^-?\d+(\.\d+)?$/.test(v)) return v + 'px'
  return v
}

function el<K extends keyof HTMLElementTagNameMap>(
  tag: K,
  attrs: Record<string, string> = {},
  html = '',
): HTMLElementTagNameMap[K] {
  const e = document.createElement(tag)
  for (const [k, v] of Object.entries(attrs)) e.setAttribute(k, v)
  if (html) e.innerHTML = html
  return e
}

function row(label: string, ...inputs: HTMLElement[]): HTMLDivElement {
  const r = el('div', { class: 'lhe-row' })
  const l = el('span', { class: 'lhe-lbl' })
  l.textContent = label
  r.appendChild(l)
  inputs.forEach(i => r.appendChild(i))
  return r
}

function inp(attr: Record<string, string> = {}): HTMLInputElement {
  return el('input', { class: 'lhe-inp', ...attr })
}

function sel(options: [value: string, label: string][], attr: Record<string, string> = {}): HTMLSelectElement {
  const s = el('select', { class: 'lhe-inp', ...attr })
  for (const [v, lbl] of options) {
    const o = el('option', { value: v })
    o.textContent = lbl
    s.appendChild(o)
  }
  return s
}

function colorPair(propKey: string): [HTMLInputElement, HTMLInputElement] {
  const text = inp({ 'data-pt': propKey, type: 'text', placeholder: '#000 or rgb(…)' })
  const swatch = el('input', { type: 'color', class: 'lhe-cinp', 'data-pc': propKey, value: '#000000' })
  return [text, swatch as HTMLInputElement]
}

function grid4(props: string[], placeholders: string[]): HTMLElement {
  const wrap = document.createElement('div')
  const labels = el('div', { class: 'lhe-grid4-lbl' })
  const grid = el('div', { class: 'lhe-grid4' })
  const abbr = ['Top', 'Right', 'Bottom', 'Left']
  props.forEach((p, i) => {
    const s = el('span')
    s.textContent = abbr[i]
    labels.appendChild(s)
    const i2 = inp({ 'data-prop': p, type: 'text', placeholder: placeholders[i] ?? '0' })
    grid.appendChild(i2)
  })
  wrap.appendChild(labels)
  wrap.appendChild(grid)
  return wrap
}

function section(title: string): HTMLDivElement {
  const sec = el('div', { class: 'lhe-sec' })
  const t = el('div', { class: 'lhe-sec-title' })
  t.textContent = title
  sec.appendChild(t)
  return sec
}

export class StylePanel implements StylePanelAPI {
  private sideEl: HTMLDivElement
  private noSelEl: HTMLDivElement
  private panelBody: HTMLDivElement
  private elTagName: HTMLSpanElement
  private tabStyle: HTMLDivElement
  private tabLayout: HTMLDivElement
  private flexSec: HTMLDivElement | null = null
  private customSections: Map<string, { sec: HTMLElement; cfg: StyleSectionConfig }> = new Map()

  constructor(
    private container: HTMLElement,
    private canvas: Canvas,
    private editor: EditorInterface,
  ) {
    this.sideEl = el('div', { class: 'lhe-side' })
    container.appendChild(this.sideEl)

    const tabs = el('div', { class: 'lhe-ptabs' })
    const tabStyleBtn = el('button', { class: 'lhe-ptab lhe-active', 'data-tab': 'style' })
    tabStyleBtn.textContent = 'Style'
    const tabLayoutBtn = el('button', { class: 'lhe-ptab', 'data-tab': 'layout' })
    tabLayoutBtn.textContent = 'Layout'
    tabs.appendChild(tabStyleBtn)
    tabs.appendChild(tabLayoutBtn)
    this.sideEl.appendChild(tabs)

    const scroll = el('div', { class: 'lhe-pscroll' })
    this.sideEl.appendChild(scroll)

    this.noSelEl = el('div', { class: 'lhe-no-sel' })
    this.noSelEl.textContent = 'Click any element to edit its styles'
    scroll.appendChild(this.noSelEl)

    this.panelBody = el('div', { class: 'lhe-hidden' })
    scroll.appendChild(this.panelBody)

    const tagWrap = el('div', { class: 'lhe-el-tag' })
    tagWrap.innerHTML = 'Selected: '
    this.elTagName = el('span')
    tagWrap.appendChild(this.elTagName)
    this.panelBody.appendChild(tagWrap)

    this.tabStyle = el('div', { id: '__lhe_tab_style' })
    this.tabLayout = el('div', { id: '__lhe_tab_layout', class: 'lhe-hidden' })
    this.panelBody.appendChild(this.tabStyle)
    this.panelBody.appendChild(this.tabLayout)

    this.buildStyleTab()
    this.buildLayoutTab()
    this.bindTabSwitcher(tabStyleBtn, tabLayoutBtn)
    this.bindPropInputs()
  }

  private buildStyleTab(): void {
    const t = this.tabStyle

    // Typography
    const typo = section('Typography')
    typo.appendChild(row('Font family', sel([
      ['', '— inherit —'], ['system-ui,sans-serif', 'System UI'],
      ["'Inter',sans-serif", 'Inter'], ["'Roboto',sans-serif", 'Roboto'],
      ["'Open Sans',sans-serif", 'Open Sans'], ["'Poppins',sans-serif", 'Poppins'],
      ["'Montserrat',sans-serif", 'Montserrat'], ["'Lato',sans-serif", 'Lato'],
      ['Georgia,serif', 'Georgia'], ["'Playfair Display',serif", 'Playfair Display'],
      ['monospace', 'Monospace'],
    ], { 'data-prop': 'fontFamily' })))
    typo.appendChild(row('Size', inp({ 'data-prop': 'fontSize', type: 'text', placeholder: '16px' })))
    typo.appendChild(row('Weight', sel([
      ['', '— inherit —'], ['300', 'Light 300'], ['400', 'Regular 400'], ['500', 'Medium 500'],
      ['600', 'Semi-bold 600'], ['700', 'Bold 700'], ['800', 'Extra-bold 800'], ['900', 'Black 900'],
    ], { 'data-prop': 'fontWeight' })))
    typo.appendChild(row('Line height', inp({ 'data-prop': 'lineHeight', type: 'text', placeholder: '1.5' })))
    typo.appendChild(row('Letter sp.', inp({ 'data-prop': 'letterSpacing', type: 'text', placeholder: '0.5px' })))
    typo.appendChild(row('Align', sel([
      ['', '— inherit —'], ['left', 'Left'], ['center', 'Center'], ['right', 'Right'], ['justify', 'Justify'],
    ], { 'data-prop': 'textAlign' })))
    typo.appendChild(row('Decoration', sel([
      ['', '— inherit —'], ['none', 'None'], ['underline', 'Underline'],
      ['line-through', 'Line-through'], ['overline', 'Overline'],
    ], { 'data-prop': 'textDecoration' })))
    const [colorText, colorSwatch] = colorPair('color')
    typo.appendChild(row('Color', colorText, colorSwatch))
    t.appendChild(typo)

    // Background
    const bg = section('Background')
    const [bgText, bgSwatch] = colorPair('backgroundColor')
    bgText.placeholder = 'transparent'
    bg.appendChild(row('Color', bgText, bgSwatch))
    bg.appendChild(row('Image URL', inp({ 'data-prop': 'backgroundImage', type: 'text', placeholder: 'url(…)' })))
    bg.appendChild(row('Size', sel([
      ['', '—'], ['cover', 'cover'], ['contain', 'contain'], ['auto', 'auto'],
    ], { 'data-prop': 'backgroundSize' })))
    t.appendChild(bg)

    // Spacing
    const pad = section('Padding')
    pad.appendChild(grid4(
      ['paddingTop', 'paddingRight', 'paddingBottom', 'paddingLeft'],
      ['0', '0', '0', '0'],
    ))
    t.appendChild(pad)

    const mar = section('Margin')
    mar.appendChild(grid4(
      ['marginTop', 'marginRight', 'marginBottom', 'marginLeft'],
      ['0', 'auto', '0', 'auto'],
    ))
    t.appendChild(mar)

    // Border
    const brd = section('Border')
    brd.appendChild(row('Width', inp({ 'data-prop': 'borderWidth', type: 'text', placeholder: '0' })))
    brd.appendChild(row('Style', sel([
      ['none', 'None'], ['solid', 'Solid'], ['dashed', 'Dashed'],
      ['dotted', 'Dotted'], ['double', 'Double'],
    ], { 'data-prop': 'borderStyle' })))
    const [brdText, brdSwatch] = colorPair('borderColor')
    brd.appendChild(row('Color', brdText, brdSwatch))
    brd.appendChild(row('Radius', inp({ 'data-prop': 'borderRadius', type: 'text', placeholder: '0' })))
    t.appendChild(brd)

    // Size
    const size = section('Size')
    size.appendChild(row('Width', inp({ 'data-prop': 'width', type: 'text', placeholder: 'auto' })))
    size.appendChild(row('Height', inp({ 'data-prop': 'height', type: 'text', placeholder: 'auto' })))
    size.appendChild(row('Max width', inp({ 'data-prop': 'maxWidth', type: 'text', placeholder: 'none' })))
    size.appendChild(row('Min height', inp({ 'data-prop': 'minHeight', type: 'text', placeholder: '0' })))
    size.appendChild(row('Opacity', inp({ 'data-prop': 'opacity', type: 'text', placeholder: '1' })))
    t.appendChild(size)

    // Effects
    const fx = section('Effects')
    fx.appendChild(row('Box shadow', inp({ 'data-prop': 'boxShadow', type: 'text', placeholder: 'none' })))
    fx.appendChild(row('Text shadow', inp({ 'data-prop': 'textShadow', type: 'text', placeholder: 'none' })))
    fx.appendChild(row('Transform', inp({ 'data-prop': 'transform', type: 'text', placeholder: 'none' })))
    fx.appendChild(row('Transition', inp({ 'data-prop': 'transition', type: 'text', placeholder: 'none' })))
    fx.appendChild(row('Cursor', sel([
      ['', '—'], ['auto', 'auto'], ['default', 'default'],
      ['pointer', 'pointer'], ['text', 'text'], ['not-allowed', 'not-allowed'],
    ], { 'data-prop': 'cursor' })))
    t.appendChild(fx)
  }

  private buildLayoutTab(): void {
    const t = this.tabLayout

    const disp = section('Display')
    disp.appendChild(row('Display', sel([
      ['', '— inherit —'], ['block', 'block'], ['flex', 'flex'], ['grid', 'grid'],
      ['inline', 'inline'], ['inline-block', 'inline-block'], ['inline-flex', 'inline-flex'],
      ['none', 'none (hidden)'],
    ], { 'data-prop': 'display', id: '__lhe_prop_display' })))
    disp.appendChild(row('Overflow', sel([
      ['', '—'], ['visible', 'visible'], ['hidden', 'hidden'], ['auto', 'auto'], ['scroll', 'scroll'],
    ], { 'data-prop': 'overflow' })))
    t.appendChild(disp)

    const pos = section('Position')
    pos.appendChild(row('Position', sel([
      ['', '— inherit —'], ['static', 'static'], ['relative', 'relative'],
      ['absolute', 'absolute'], ['fixed', 'fixed'], ['sticky', 'sticky'],
    ], { 'data-prop': 'position' })))
    pos.appendChild(row('Top', inp({ 'data-prop': 'top', type: 'text', placeholder: 'auto' })))
    pos.appendChild(row('Right', inp({ 'data-prop': 'right', type: 'text', placeholder: 'auto' })))
    pos.appendChild(row('Bottom', inp({ 'data-prop': 'bottom', type: 'text', placeholder: 'auto' })))
    pos.appendChild(row('Left', inp({ 'data-prop': 'left', type: 'text', placeholder: 'auto' })))
    pos.appendChild(row('Z-index', inp({ 'data-prop': 'zIndex', type: 'text', placeholder: 'auto' })))
    t.appendChild(pos)

    this.flexSec = section('Flexbox')
    this.flexSec.classList.add('lhe-hidden')
    this.flexSec.appendChild(row('Direction', sel([
      ['', '—'], ['row', 'row'], ['column', 'column'],
      ['row-reverse', 'row-reverse'], ['column-reverse', 'column-reverse'],
    ], { 'data-prop': 'flexDirection' })))
    this.flexSec.appendChild(row('Justify', sel([
      ['', '—'], ['flex-start', 'flex-start'], ['center', 'center'], ['flex-end', 'flex-end'],
      ['space-between', 'space-between'], ['space-around', 'space-around'], ['space-evenly', 'space-evenly'],
    ], { 'data-prop': 'justifyContent' })))
    this.flexSec.appendChild(row('Align items', sel([
      ['', '—'], ['stretch', 'stretch'], ['flex-start', 'flex-start'],
      ['center', 'center'], ['flex-end', 'flex-end'], ['baseline', 'baseline'],
    ], { 'data-prop': 'alignItems' })))
    this.flexSec.appendChild(row('Wrap', sel([
      ['', '—'], ['nowrap', 'nowrap'], ['wrap', 'wrap'], ['wrap-reverse', 'wrap-reverse'],
    ], { 'data-prop': 'flexWrap' })))
    this.flexSec.appendChild(row('Gap', inp({ 'data-prop': 'gap', type: 'text', placeholder: '0' })))
    t.appendChild(this.flexSec)

    const flexChild = section('Flex child')
    flexChild.appendChild(row('Flex', inp({ 'data-prop': 'flex', type: 'text', placeholder: '0 1 auto' })))
    flexChild.appendChild(row('Align self', sel([
      ['', '—'], ['auto', 'auto'], ['flex-start', 'flex-start'],
      ['center', 'center'], ['flex-end', 'flex-end'], ['stretch', 'stretch'],
    ], { 'data-prop': 'alignSelf' })))
    flexChild.appendChild(row('Order', inp({ 'data-prop': 'order', type: 'text', placeholder: '0' })))
    t.appendChild(flexChild)
  }

  private bindTabSwitcher(styleBtn: HTMLButtonElement, layoutBtn: HTMLButtonElement): void {
    styleBtn.addEventListener('click', () => {
      styleBtn.classList.add('lhe-active')
      layoutBtn.classList.remove('lhe-active')
      this.tabStyle.classList.remove('lhe-hidden')
      this.tabLayout.classList.add('lhe-hidden')
    })
    layoutBtn.addEventListener('click', () => {
      layoutBtn.classList.add('lhe-active')
      styleBtn.classList.remove('lhe-active')
      this.tabLayout.classList.remove('lhe-hidden')
      this.tabStyle.classList.add('lhe-hidden')
    })
  }

  private bindPropInputs(): void {
    const applyProp = (prop: string, value: string) => {
      if (!this.canvas.getSelectedElement()) return
      const v = normValue(prop, value)
      this.canvas.applyStyle(prop, v)

      if (prop === 'borderWidth' && v && v !== '0' && v !== '0px') {
        const cur = this.canvas.getStyle('borderStyle')
        if (!cur || cur === 'none') {
          this.canvas.applyStyle('borderStyle', 'solid')
          const bsInp = this.panelBody.querySelector('[data-prop="borderStyle"]') as HTMLSelectElement | null
          if (bsInp) bsInp.value = 'solid'
        }
      }
      if (prop === 'display' && this.flexSec) {
        this.flexSec.classList.toggle('lhe-hidden', !v.includes('flex'))
      }
    }

    // data-prop inputs
    this.panelBody.addEventListener('change', (e) => {
      const target = e.target as HTMLInputElement | HTMLSelectElement
      if (target.dataset.prop) applyProp(target.dataset.prop, target.value)
      if (target.dataset.pt) {
        applyProp(target.dataset.pt, target.value)
        const sw = this.panelBody.querySelector(`[data-pc="${target.dataset.pt}"]`) as HTMLInputElement | null
        if (sw) try { sw.value = target.value } catch (_) { /* noop */ }
      }
      if (target.dataset.pc) {
        applyProp(target.dataset.pc, target.value)
        const ti = this.panelBody.querySelector(`[data-pt="${target.dataset.pc}"]`) as HTMLInputElement | null
        if (ti) ti.value = target.value
      }
    })

    this.panelBody.addEventListener('input', (e) => {
      const target = e.target as HTMLInputElement
      if (target.dataset.prop) applyProp(target.dataset.prop, target.value)
      if (target.dataset.pt) applyProp(target.dataset.pt, target.value)
    })
  }

  loadElement(el: Element): void {
    const htmlEl = el as HTMLElement
    const tagStr = el.tagName.toLowerCase()
      + (el.id ? '#' + el.id : '')
      + (el.className ? '.' + Array.from(el.classList).filter(c => c !== '__lhe_sel').join('.') : '')
    this.elTagName.textContent = tagStr.slice(0, 50)

    this.noSelEl.classList.add('lhe-hidden')
    this.panelBody.classList.remove('lhe-hidden')

    // data-prop
    this.panelBody.querySelectorAll<HTMLInputElement | HTMLSelectElement>('[data-prop]').forEach(i => {
      i.value = htmlEl.style.getPropertyValue(
        i.dataset.prop!.replace(/([A-Z])/g, '-$1').toLowerCase()
      ) || ''
    })
    // color text+swatch pairs
    this.panelBody.querySelectorAll<HTMLInputElement>('[data-pt]').forEach(i => {
      const v = htmlEl.style.getPropertyValue(
        i.dataset.pt!.replace(/([A-Z])/g, '-$1').toLowerCase()
      ) || ''
      i.value = v
      const sw = this.panelBody.querySelector<HTMLInputElement>(`[data-pc="${i.dataset.pt}"]`)
      if (sw && v) try { sw.value = v } catch (_) { /* noop */ }
    })

    const disp = htmlEl.style.display || ''
    this.flexSec?.classList.toggle('lhe-hidden', !disp.includes('flex'))

    // Custom section callbacks
    for (const { cfg, sec } of this.customSections.values()) {
      cfg.onSelect?.(el, sec)
    }
  }

  clear(): void {
    this.noSelEl.classList.remove('lhe-hidden')
    this.panelBody.classList.add('lhe-hidden')
  }

  // ── Plugin API ─────────────────────────────────────────────────────────────

  addSection(config: StyleSectionConfig): void {
    const sec = section(config.title)
    sec.id = `__lhe_custom_${config.id}`
    const content = config.render(this.editor)
    sec.appendChild(content)
    this.tabStyle.appendChild(sec)
    this.customSections.set(config.id, { sec, cfg: config })
  }

  removeSection(id: string): void {
    const entry = this.customSections.get(id)
    if (!entry) return
    entry.sec.remove()
    this.customSections.delete(id)
  }

  destroy(): void {
    this.sideEl.remove()
  }
}
