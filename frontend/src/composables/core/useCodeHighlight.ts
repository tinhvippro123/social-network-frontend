// ==========================================
// Composable — useCodeHighlight
// Syntax highlighting for code blocks in post content
// ==========================================
import { onMounted, nextTick, watch, type Ref } from 'vue'

/**
 * Highlights all <pre><code> blocks in the page using highlight.js
 * Also adds a "Copy" button and language label to each code block
 */
export function useCodeHighlight(contentRef?: Ref<string | null>) {
  async function highlightAll() {
    await nextTick()
    
    try {
      const hljs = (await import('highlight.js/lib/core')).default
      
      // Register common languages
      const [
        javascript, typescript, java, python, html, css,
        json, bash, sql, xml, markdown
      ] = await Promise.all([
        import('highlight.js/lib/languages/javascript'),
        import('highlight.js/lib/languages/typescript'),
        import('highlight.js/lib/languages/java'),
        import('highlight.js/lib/languages/python'),
        import('highlight.js/lib/languages/xml'), // html
        import('highlight.js/lib/languages/css'),
        import('highlight.js/lib/languages/json'),
        import('highlight.js/lib/languages/bash'),
        import('highlight.js/lib/languages/sql'),
        import('highlight.js/lib/languages/xml'),
        import('highlight.js/lib/languages/markdown'),
      ])

      hljs.registerLanguage('javascript', javascript.default)
      hljs.registerLanguage('js', javascript.default)
      hljs.registerLanguage('typescript', typescript.default)
      hljs.registerLanguage('ts', typescript.default)
      hljs.registerLanguage('java', java.default)
      hljs.registerLanguage('python', python.default)
      hljs.registerLanguage('py', python.default)
      hljs.registerLanguage('html', html.default)
      hljs.registerLanguage('css', css.default)
      hljs.registerLanguage('json', json.default)
      hljs.registerLanguage('bash', bash.default)
      hljs.registerLanguage('sh', bash.default)
      hljs.registerLanguage('sql', sql.default)
      hljs.registerLanguage('xml', xml.default)
      hljs.registerLanguage('markdown', markdown.default)
      hljs.registerLanguage('md', markdown.default)

      // Find and highlight all code blocks
      const codeBlocks = document.querySelectorAll('pre code')
      codeBlocks.forEach((block) => {
        const el = block as HTMLElement
        
        // Skip if already highlighted
        if (el.dataset.highlighted === 'true') return

        // Highlight
        hljs.highlightElement(el)
        el.dataset.highlighted = 'true'

        // Add wrapper with language label & copy button
        const pre = el.parentElement
        if (pre && !pre.querySelector('.code-header')) {
          pre.style.position = 'relative'
          pre.style.paddingTop = '2.5rem'

          const language = el.className.match(/language-(\w+)/)?.[1] || 'code'

          const header = document.createElement('div')
          header.className = 'code-header'
          header.style.cssText = 'position:absolute;top:0;left:0;right:0;display:flex;align-items:center;justify-content:space-between;padding:0.5rem 1rem;background:rgba(255,255,255,0.05);border-bottom:1px solid rgba(255,255,255,0.1);border-radius:0.75rem 0.75rem 0 0;font-size:0.75rem;'

          const langLabel = document.createElement('span')
          langLabel.textContent = language.toUpperCase()
          langLabel.style.cssText = 'color:rgba(255,255,255,0.5);font-weight:600;letter-spacing:0.05em;'

          const copyBtn = document.createElement('button')
          copyBtn.textContent = 'Copy'
          copyBtn.style.cssText = 'color:rgba(255,255,255,0.5);background:rgba(255,255,255,0.1);border:none;padding:0.25rem 0.75rem;border-radius:0.375rem;cursor:pointer;font-size:0.75rem;font-weight:500;transition:all 0.15s;'
          copyBtn.addEventListener('mouseenter', () => { copyBtn.style.color = '#fff'; copyBtn.style.background = 'rgba(255,255,255,0.2)' })
          copyBtn.addEventListener('mouseleave', () => { copyBtn.style.color = 'rgba(255,255,255,0.5)'; copyBtn.style.background = 'rgba(255,255,255,0.1)' })
          copyBtn.addEventListener('click', () => {
            navigator.clipboard.writeText(el.textContent || '')
            copyBtn.textContent = '✓ Copied!'
            setTimeout(() => { copyBtn.textContent = 'Copy' }, 2000)
          })

          header.appendChild(langLabel)
          header.appendChild(copyBtn)
          pre.insertBefore(header, pre.firstChild)
        }
      })
    } catch (e) {
      console.warn('Code highlighting not available:', e)
    }
  }

  onMounted(() => {
    // Delay to let content render
    setTimeout(highlightAll, 500)
  })

  // Re-highlight when content changes
  if (contentRef) {
    watch(contentRef, () => {
      setTimeout(highlightAll, 300)
    })
  }

  return { highlightAll }
}
