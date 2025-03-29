import DefaultTheme from 'vitepress/theme'
import Layout from './Layout.vue'
import Editor from './components/editor.vue'
import './custom.css'

export default {
  extends: DefaultTheme,
  Layout,
  enhanceApp({ app }) {
    app.component('Editor', Editor)
  }
} 