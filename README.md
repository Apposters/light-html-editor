# Light HTML Editor

A lightweight, embeddable WYSIWYG editor for existing HTML pages. Drop it into any container and let users edit text and styles — no build tools, no framework required.

**8 KB gzipped · zero dependencies · TypeScript · plugin API**

![Light HTML Editor](https://raw.githubusercontent.com/your-org/light-html-editor/main/docs/screenshot.png)

---

## When to use this

Light HTML Editor is designed for one specific job: **editing an existing HTML document**. Give it a full HTML string, the user edits text and CSS styles, you get the modified HTML back.

Good fit:
- No-code / low-code platforms that need an inline page editor
- Landing page builders
- Email editors
- CMS preview panels

Not a fit:
- Building pages from scratch with drag-and-drop blocks → use [GrapesJS](https://grapesjs.com)
- Rich document editing (like Google Docs) → use [TipTap](https://tiptap.dev) or [ProseMirror](https://prosemirror.net)

---

## Install

```bash
npm install light-html-editor
```

Or via CDN (no build step):

```html
<script src="https://cdn.jsdelivr.net/npm/light-html-editor/dist/light-html-editor.umd.js"></script>
```

---

## Quick start

```html
<div id="editor" style="height: 600px;"></div>

<script type="module">
import { Editor } from 'light-html-editor'

const editor = Editor.create('#editor', {
  html: `<!DOCTYPE html>
    <html><body>
      <h1>Hello world</h1>
      <p>Edit me!</p>
    </body></html>`,

  onChange(html) {
    console.log('Updated HTML:', html)
  },
})
</script>
```

The editor fills the container. Set the container's `width` and `height` to control the layout.

---

## API

### `Editor.create(target, options)`

Creates and mounts the editor.

| Parameter | Type | Description |
|-----------|------|-------------|
| `target` | `string \| HTMLElement` | CSS selector or DOM element to mount into |
| `options` | `EditorOptions` | See below |

Returns an `Editor` instance.

### Options

```ts
interface EditorOptions {
  // HTML document to load into the canvas
  html?: string

  // Show the formatting toolbar. Default: true
  toolbar?: boolean

  // Show the CSS style panel. Default: true
  stylePanel?: boolean

  // Plugins to install
  plugins?: Plugin[]

  // Called when the document changes (debounced)
  onChange?: (html: string) => void

  // Debounce delay in ms for onChange. Default: 400
  changeDebounce?: number
}
```

### Instance methods

```ts
// Get the current HTML of the document
editor.getHtml(): string

// Replace the document with new HTML
editor.setHtml(html: string): void

// Subscribe to events
editor.on('change', (html: string) => void): () => void
editor.on('select', (el: Element) => void): () => void
editor.on('ready', () => void): () => void

// Unsubscribe
editor.off(event, listener): void

// Currently selected element (or null)
editor.selectedElement: Element | null

// Destroy and remove from DOM
editor.destroy(): void
```

### Toolbar API

```ts
editor.toolbar.addButton({
  id: 'my-btn',
  label: 'H1',
  title: 'Heading 1',
  onClick(editor) {
    // do something
  },
})

editor.toolbar.removeButton('my-btn')
```

### Style panel API

```ts
editor.stylePanel.addSection({
  id: 'my-section',
  title: 'Custom',
  render(editor) {
    const div = document.createElement('div')
    div.textContent = 'Custom controls here'
    return div
  },
  onSelect(el, sectionEl) {
    // update your inputs when user clicks an element
  },
})

editor.stylePanel.removeSection('my-section')
```

---

## Events

| Event | Payload | Description |
|-------|---------|-------------|
| `ready` | — | Editor mounted and canvas loaded |
| `change` | `html: string` | Document changed (debounced) |
| `select` | `el: Element` | User clicked an element in the canvas |
| `deselect` | — | Selection cleared |

```ts
const off = editor.on('select', (el) => {
  console.log('Selected:', el.tagName)
})

// Unsubscribe later
off()
```

---

## Plugins

A plugin is an object with a `name` and an `install` function. Install runs once when the editor is created.

```ts
import { Editor, Plugin } from 'light-html-editor'

const headingPlugin: Plugin = {
  name: 'headings',
  install(editor) {
    for (const [tag, label] of [['H1','H1'],['H2','H2'],['H3','H3']]) {
      editor.toolbar.addButton({
        id: `heading-${tag}`,
        label,
        title: `Wrap in <${tag}>`,
        onClick() {
          document.execCommand('formatBlock', false, tag)
        },
      })
    }
  },
}

Editor.create('#editor', {
  html: myHtml,
  plugins: [headingPlugin],
})
```

---

## React example

```tsx
import { useEffect, useRef } from 'react'
import { Editor } from 'light-html-editor'

function HtmlEditor({ html, onChange }) {
  const ref = useRef(null)

  useEffect(() => {
    const editor = Editor.create(ref.current, { html, onChange })
    return () => editor.destroy()
  }, [])

  return <div ref={ref} style={{ height: '100%' }} />
}
```

---

## Built-in toolbar controls

| Control | Description |
|---------|-------------|
| Text color | Foreground color picker |
| Highlight | Background color picker |
| Link | Insert / edit / remove link |
| Bold, Italic, Underline, Strikethrough | Inline formatting |
| Align left / center / right | Text alignment |
| Bullet list, Numbered list | Lists |
| Clear formatting | Remove inline styles |
| Undo / Redo | History |

## Built-in style panel

**Style tab:** Typography (font family, size, weight, line-height, letter-spacing, alignment, decoration, color) · Background (color, image, size) · Padding · Margin · Border (width, style, color, radius) · Size (width, height, max-width, min-height, opacity) · Effects (box-shadow, text-shadow, transform, transition, cursor)

**Layout tab:** Display · Overflow · Position (top/right/bottom/left, z-index) · Flexbox (direction, justify, align, wrap, gap) · Flex child (flex, align-self, order)

---

## Browser support

Modern browsers: Chrome 90+, Firefox 90+, Safari 15+, Edge 90+.

Uses `contentEditable`, `document.execCommand` (deprecated but universally supported), `MutationObserver`, and `<iframe srcdoc>`.

---

## License

MIT
