import '@tasteee/zest'
import '@tasteee/zest/ink.css'
import '@tasteee/zest/fonts.css'
import './styles/base.css'

import { render } from 'solid-js/web'
import { App } from './App'

const rootElement = document.getElementById('root')
const isRootMissing = rootElement === null
if (isRootMissing) throw new Error('Missing #root element in index.html')

render(() => <App />, rootElement)
