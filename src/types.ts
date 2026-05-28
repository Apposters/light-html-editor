export interface EditorOptions {
  /** Initial HTML content to load into the canvas */
  html?: string
  /** Show formatting toolbar. Default: true */
  toolbar?: boolean
  /** Show CSS style panel. Default: true */
  stylePanel?: boolean
  /** Plugins to install */
  plugins?: Plugin[]
  /** Fired when content changes (debounced). Default debounce: 400ms */
  onChange?: (html: string) => void
  /** Debounce delay in ms for onChange. Default: 400 */
  changeDebounce?: number
}

export interface Plugin {
  name: string
  install(editor: EditorInterface): void
}

export interface ToolbarButtonConfig {
  /** Unique id — required for addButton, used by removeButton */
  id: string
  /** HTML/text content of the button */
  label: string
  title?: string
  /** execCommand name, e.g. 'bold' */
  command?: string
  /** Optional value for execCommand */
  commandValue?: string
  /** Custom click handler (overrides command) */
  onClick?: (editor: EditorInterface) => void
  /** Insert a separator before this button */
  separatorBefore?: boolean
}

export interface StyleSectionConfig {
  id: string
  title: string
  /** Rendered inside the section */
  render: (editor: EditorInterface) => HTMLElement
  /** Called when a new element is selected — update your inputs */
  onSelect?: (el: Element, section: HTMLElement) => void
}

export interface EditorInterface {
  getHtml(): string
  setHtml(html: string): void
  on(event: string, listener: (...args: unknown[]) => void): () => void
  off(event: string, listener: (...args: unknown[]) => void): void
  destroy(): void
  /** The currently selected element in the canvas, or null */
  readonly selectedElement: Element | null
  /** Toolbar API */
  readonly toolbar: ToolbarAPI | null
  /** StylePanel API */
  readonly stylePanel: StylePanelAPI | null
}

export interface ToolbarAPI {
  addButton(config: ToolbarButtonConfig): void
  removeButton(id: string): void
}

export interface StylePanelAPI {
  addSection(config: StyleSectionConfig): void
  removeSection(id: string): void
}
