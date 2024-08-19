import { resolve } from 'node:path'
import viteReact from '@vitejs/plugin-react'

export default {
  base: '/app/',
  root: resolve(import.meta.dirname, 'src/client'),
  plugins: viteReact()
}
