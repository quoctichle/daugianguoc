import { readFileSync, writeFileSync, existsSync } from 'node:fs'
import { resolve } from 'node:path'

const target = resolve('node_modules/youch/build/src/templates/error_stack/main.js')

if (!existsSync(target)) {
  process.exit(0)
}

const source = readFileSync(target, 'utf8')

if (source.includes('if (!filePath) return "unknown";')) {
  process.exit(0)
}

let next = source.replace(
  'return filePath.replace(`${process.cwd()}/`, "");',
  'if (!filePath) return "unknown";\n\t\treturn String(filePath).replace(`${process.cwd()}/`, "");'
)

next = next.replace(
  'if (!editorURL || frame.type === "native") return { text: this.#getRelativeFileName(frame.fileName) };',
  'const safeFileName = frame?.fileName || "unknown";\n\t\tif (!editorURL || frame.type === "native") return { text: this.#getRelativeFileName(safeFileName) };'
)

next = next.replace(
  'href: editorURL.replace("%f", frame.fileName).replace("%l", String(frame.lineNumber)),',
  'href: editorURL.replace("%f", safeFileName).replace("%l", String(frame.lineNumber || "")),'
)

next = next.replace(
  'text: this.#getRelativeFileName(frame.fileName)',
  'text: this.#getRelativeFileName(safeFileName)'
)

writeFileSync(target, next, 'utf8')
