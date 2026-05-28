export const EDITOR_STYLES = `
.lhe-editor {
  display: flex; flex-direction: column; height: 100%;
  font-family: system-ui, -apple-system, 'Segoe UI', sans-serif;
  background: #f8fafc; overflow: hidden;
}

/* ── Toolbar ── */
.lhe-toolbar {
  display: flex; align-items: center; gap: 5px; flex-wrap: wrap;
  padding: 0 12px; background: #ffffff; border-bottom: 1px solid #e5e7eb;
  min-height: 48px; flex-shrink: 0;
}
.lhe-fmt-btn {
  padding: 4px 9px; background: transparent; border: 1px solid transparent;
  color: #6b7280; border-radius: 6px; cursor: pointer;
  font-size: 12px; font-family: inherit; font-weight: 500;
  transition: background 0.1s, color 0.1s; line-height: 1.5;
  min-width: 30px; text-align: center; white-space: nowrap;
}
.lhe-fmt-btn:hover { background: #f3f4f6; color: #111827; }
.lhe-fmt-btn.lhe-active { background: #eff6ff; color: #2563eb; border-color: #bfdbfe; }
.lhe-sep { width: 1px; height: 18px; background: #e5e7eb; margin: 0 3px; flex-shrink: 0; }
.lhe-color-wrap { position: relative; display: inline-flex; align-items: center; }
.lhe-color-wrap input[type="color"] {
  position: absolute; inset: 0; opacity: 0; cursor: pointer;
  width: 100%; height: 100%; padding: 0; border: 0;
}

/* ── Canvas area ── */
.lhe-main { flex: 1; display: flex; overflow: hidden; }
.lhe-canvas { flex: 1; border: none; display: block; min-width: 0; background: #fff; }

/* ── Side panel ── */
.lhe-side {
  width: 260px; flex-shrink: 0; background: #ffffff;
  border-left: 1px solid #e5e7eb; display: flex; flex-direction: column; overflow: hidden;
}
.lhe-ptabs {
  display: flex; flex-shrink: 0; border-bottom: 1px solid #e5e7eb;
  padding: 0 8px; gap: 4px;
}
.lhe-ptab {
  flex: 1; padding: 10px 4px 9px; background: transparent; border: none;
  color: #9ca3af; cursor: pointer; font-size: 12px; font-weight: 500;
  font-family: inherit; border-bottom: 2px solid transparent;
  transition: color 0.12s, border-color 0.12s;
}
.lhe-ptab.lhe-active { color: #2563eb; border-bottom-color: #2563eb; }
.lhe-ptab:hover:not(.lhe-active) { color: #374151; }
.lhe-pscroll { flex: 1; overflow-y: auto; padding: 12px; }
.lhe-pscroll::-webkit-scrollbar { width: 4px; }
.lhe-pscroll::-webkit-scrollbar-track { background: transparent; }
.lhe-pscroll::-webkit-scrollbar-thumb { background: #e5e7eb; border-radius: 2px; }
.lhe-pscroll::-webkit-scrollbar-thumb:hover { background: #d1d5db; }

/* ── Panel content ── */
.lhe-no-sel {
  padding: 32px 16px; text-align: center;
  color: #9ca3af; font-size: 12px; line-height: 1.8;
}
.lhe-el-tag {
  font-size: 11px; color: #6b7280; padding: 6px 8px;
  background: #f9fafb; border-radius: 6px; margin-bottom: 12px;
}
.lhe-el-tag span { color: #2563eb; font-weight: 600; font-size: 12px; }
.lhe-sec { margin-bottom: 18px; }
.lhe-sec-title {
  font-size: 10px; font-weight: 600; text-transform: uppercase;
  color: #9ca3af; letter-spacing: 0.9px; margin-bottom: 8px;
}
.lhe-row { display: flex; align-items: center; margin-bottom: 6px; gap: 6px; }
.lhe-lbl { font-size: 11px; color: #6b7280; flex-shrink: 0; width: 74px; }
.lhe-inp {
  flex: 1; background: #f9fafb; border: 1px solid #e5e7eb;
  color: #111827; padding: 5px 8px; border-radius: 6px; font-size: 11px;
  min-width: 0; outline: none; font-family: inherit;
  transition: border-color 0.12s, box-shadow 0.12s;
}
.lhe-inp:focus { border-color: #2563eb; background: #fff; box-shadow: 0 0 0 3px rgba(37,99,235,0.1); }
select.lhe-inp { cursor: pointer; }
.lhe-cinp {
  padding: 0; width: 28px; height: 26px; cursor: pointer; flex-shrink: 0;
  border-radius: 6px; border: 1px solid #e5e7eb; background: transparent;
}
.lhe-grid4 { display: grid; grid-template-columns: repeat(4,1fr); gap: 4px; }
.lhe-grid4 input {
  background: #f9fafb; border: 1px solid #e5e7eb; color: #111827;
  padding: 5px 3px; border-radius: 6px; font-size: 11px; text-align: center;
  width: 100%; outline: none; font-family: inherit;
  transition: border-color 0.12s, box-shadow 0.12s;
}
.lhe-grid4 input:focus { border-color: #2563eb; background: #fff; box-shadow: 0 0 0 3px rgba(37,99,235,0.1); }
.lhe-grid4-lbl { display: grid; grid-template-columns: repeat(4,1fr); gap: 4px; margin-bottom: 3px; }
.lhe-grid4-lbl span {
  font-size: 9px; color: #9ca3af; text-align: center;
  font-weight: 500; text-transform: uppercase; letter-spacing: 0.4px;
}
.lhe-hidden { display: none !important; }

/* ── Canvas iframe selection highlight (injected into iframe doc) ── */
.lhe-canvas-styles {
  display: none;
}
`

export const CANVAS_IFRAME_STYLES = `
.__lhe_sel { outline: 2px solid #2563eb !important; outline-offset: 1px !important; }
body { outline: none; }
`
