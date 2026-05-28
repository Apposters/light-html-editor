import { defineConfig } from 'vite'
import dts from 'vite-plugin-dts'

export default defineConfig({
  build: {
    lib: {
      entry: 'src/index.ts',
      name: 'LightHtmlEditor',
      formats: ['es', 'umd'],
      fileName: (format) => `light-html-editor.${format}.js`,
    },
    rollupOptions: {
      external: [],
    },
    sourcemap: true,
    minify: true,
  },
  plugins: [
    dts({ include: ['src'], outDir: 'dist/types', rollupTypes: true }),
  ],
})
