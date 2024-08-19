import { createRoot } from 'react-dom/client'
import { App } from './base.tsx'

const rootElement =
	document.getElementById('root') || document.createElement('div');

const root = createRoot(rootElement)
root.render(App())