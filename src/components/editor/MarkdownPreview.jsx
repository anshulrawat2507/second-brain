'use client';

import { useMemo, useState, useCallback, useEffect, useRef } from 'react';
import { marked } from 'marked';
import { cn } from '@/lib/utils';
import { WikiLinkPreview } from './WikiLinkPreview';

// Language aliases for consistent syntax highlighting
const LANGUAGE_ALIASES = {
  js: 'javascript',
  ts: 'typescript',
  tsx: 'jsx',
  py: 'python',
  sh: 'bash',
  shell: 'bash',
  zsh: 'bash',
};

// Simple syntax highlighting patterns
const LANGUAGE_PATTERNS = {
  javascript: {
    keywords: /\b(const|let|var|function|return|if|else|for|while|do|switch|case|break|continue|new|class|extends|import|export|from|default|try|catch|finally|throw|async|await|yield|typeof|instanceof|in|of|delete|void|null|undefined|true|false|this|super)\b/g,
    strings: /(["'`])(?:(?!\1)[^\\]|\\.)*?\1/g,
    comments: /(\/\/.*$|\/\*[\s\S]*?\*\/)/gm,
    numbers: /\b(\d+\.?\d*)\b/g,
    functions: /\b([a-zA-Z_$][a-zA-Z0-9_$]*)\s*(?=\()/g,
  },
  python: {
    keywords: /\b(def|class|import|from|return|if|elif|else|for|while|try|except|finally|with|as|yield|lambda|pass|break|continue|raise|assert|global|nonlocal|and|or|not|is|in|True|False|None|self)\b/g,
    strings: /("""[\s\S]*?"""|'''[\s\S]*?'''|"(?:[^"\\]|\\.)*"|'(?:[^'\\]|\\.)*')/g,
    comments: /(#.*$)/gm,
    numbers: /\b(\d+\.?\d*)\b/g,
    functions: /\b([a-zA-Z_][a-zA-Z0-9_]*)\s*(?=\()/g,
  },
  typescript: {
    keywords: /\b(const|let|var|function|return|if|else|for|while|do|switch|case|break|continue|new|class|extends|implements|import|export|from|default|try|catch|finally|throw|async|await|yield|typeof|instanceof|in|of|delete|void|null|undefined|true|false|this|super|interface|type|enum|namespace|abstract|private|public|protected|readonly|static)\b/g,
    strings: /(["'`])(?:(?!\1)[^\\]|\\.)*?\1/g,
    comments: /(\/\/.*$|\/\*[\s\S]*?\*\/)/gm,
    numbers: /\b(\d+\.?\d*)\b/g,
    functions: /\b([a-zA-Z_$][a-zA-Z0-9_$]*)\s*(?=\()/g,
  },
  json: {
    keys: /("(?:[^"\\]|\\.)*")\s*:/g,
    strings: /(:\s*)("(?:[^"\\]|\\.)*")/g,
    numbers: /\b(\d+\.?\d*)\b/g,
    booleans: /\b(true|false|null)\b/g,
  },
  sql: {
    keywords: /\b(SELECT|FROM|WHERE|AND|OR|INSERT|INTO|VALUES|UPDATE|SET|DELETE|CREATE|TABLE|INDEX|VIEW|DROP|ALTER|JOIN|LEFT|RIGHT|INNER|OUTER|ON|AS|ORDER|BY|GROUP|HAVING|LIMIT|OFFSET|UNION|DISTINCT|NULL|NOT|IN|LIKE|BETWEEN|EXISTS|CASE|WHEN|THEN|ELSE|END)\b/gi,
    strings: /(["'])(?:(?!\1)[^\\]|\\.)*?\1/g,
    comments: /(--.*$|\/\*[\s\S]*?\*\/)/gm,
    numbers: /\b(\d+\.?\d*)\b/g,
  },
  bash: {
    keywords: /\b(if|then|else|elif|fi|for|while|do|done|case|esac|function|in|return|exit)\b/g,
    strings: /(["'])(?:(?!\1)[^\\]|\\.)*?\1/g,
    comments: /(#.*$)/gm,
    variables: /(\$[a-zA-Z_][a-zA-Z0-9_]*|\$\{[^}]+\})/g,
  },
};

function escapeHtml(text) {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
}

function highlightCode(code, language) {
  const lang = LANGUAGE_ALIASES[language?.toLowerCase()] || language?.toLowerCase();
  const patterns = LANGUAGE_PATTERNS[lang];
  
  let result = escapeHtml(code);
  
  if (!patterns) {
    return result;
  }

  const tokens = [];
  let tokenId = 0;

  const addToken = (match, className) => {
    const token = `__TOKEN_${tokenId++}__`;
    tokens.push({ token, replacement: `<span class="${className}">${match}</span>` });
    return token;
  };

  // Process in order of precedence
  if (patterns.comments) {
    result = result.replace(patterns.comments, (match) => addToken(match, 'code-comment'));
  }
  if (patterns.strings) {
    result = result.replace(patterns.strings, (match) => addToken(match, 'code-string'));
  }
  if (patterns.keywords) {
    result = result.replace(patterns.keywords, (match) => addToken(match, 'code-keyword'));
  }
  if (patterns.functions) {
    result = result.replace(patterns.functions, (match) => addToken(match, 'code-function'));
  }
  if (patterns.numbers) {
    result = result.replace(patterns.numbers, (match) => addToken(match, 'code-number'));
  }
  if (patterns.booleans) {
    result = result.replace(patterns.booleans, (match) => addToken(match, 'code-boolean'));
  }
  if (patterns.variables) {
    result = result.replace(patterns.variables, (match) => addToken(match, 'code-variable'));
  }
  if (patterns.keys) {
    result = result.replace(patterns.keys, (_, match) => `${addToken(match, 'code-key')}:`);
  }

  // Replace tokens with spans
  for (const { token, replacement } of tokens) {
    result = result.replace(token, replacement);
  }

  return result;
}

export function MarkdownPreview({ content, className, notes = [], onNavigateNote }) {
  const [hoverLink, setHoverLink] = useState(null);
  const [hoverPosition, setHoverPosition] = useState(null);
  const contentRef = useRef(null);

  // Process math expressions - must be done before markdown parsing
  const processMath = useCallback((text) => {
    // Process block math $$...$$ first
    let processed = text.replace(/\$\$([\s\S]+?)\$\$/g, (_, math) => {
      return `<div class="math-block" data-math="${escapeHtml(math.trim())}">${escapeHtml(math.trim())}</div>`;
    });
    
    // Process inline math $...$
    // Be careful not to match $$ or currency like $100
    processed = processed.replace(/(?<!\$)\$(?!\$)([^\$\n]+?)\$(?!\$)/g, (_, math) => {
      return `<span class="math-inline" data-math="${escapeHtml(math.trim())}">${escapeHtml(math.trim())}</span>`;
    });
    
    return processed;
  }, []);

  // Process wiki links [[Note Title]] and [[Note|Display Text]]
  const processWikiLinks = useCallback((text) => {
    // Match [[Note Title]] or [[Note|Display]] or [[Note#Header]]
    return text.replace(/\[\[([^\]]+)\]\]/g, (match, content) => {
      let noteTitle = content;
      let displayText = content;
      let header = '';

      // Check for custom display text [[Note|Display]]
      if (content.includes('|')) {
        [noteTitle, displayText] = content.split('|');
      }

      // Check for header link [[Note#Header]]
      if (noteTitle.includes('#')) {
        [noteTitle, header] = noteTitle.split('#');
      }

      // Find the note
      const note = notes.find(n => 
        n.title.toLowerCase() === noteTitle.trim().toLowerCase()
      );

      if (note) {
        return `<a href="#" class="wiki-link" data-note-id="${note.id}" data-note-title="${noteTitle}">${displayText}</a>`;
      } else {
        // Broken link - note doesn't exist
        return `<a href="#" class="wiki-link wiki-link-broken" data-note-title="${noteTitle}">${displayText}</a>`;
      }
    });
  }, [notes]);

  const html = useMemo(() => {
    // Configure marked
    marked.setOptions({
      breaks: true,
      gfm: true,
    });

    // Custom renderer for checkboxes
    const renderer = new marked.Renderer();
    
    renderer.listitem = function({ text, task, checked }) {
      if (task) {
        return `<li class="task-list-item">
          <input type="checkbox" ${checked ? 'checked' : ''} disabled />
          <span>${text}</span>
        </li>`;
      }
      return `<li>${text}</li>`;
    };

    renderer.link = function({ href, title, text }) {
      const isExternal = href?.startsWith('http');
      return `<a href="${href}" title="${title || ''}" ${isExternal ? 'target="_blank" rel="noopener noreferrer"' : ''}>${text}</a>`;
    };

    renderer.code = function({ text, lang }) {
      const language = LANGUAGE_ALIASES[lang?.toLowerCase()] || lang || 'plaintext';
      const highlighted = highlightCode(text, language);
      const lines = highlighted.split('\n');
      
      // Build line-numbered code block
      const lineNumberedCode = lines.map((line, i) => 
        `<tr class="code-line"><td class="line-number">${i + 1}</td><td class="line-content">${line || '&nbsp;'}</td></tr>`
      ).join('');
      
      return `
        <div class="code-block-wrapper">
          <div class="code-header">
            <span class="code-language">${language}</span>
            <button class="copy-code-btn" onclick="navigator.clipboard.writeText(this.closest('.code-block-wrapper').querySelector('code').textContent).then(() => { this.textContent = 'Copied!'; setTimeout(() => this.textContent = 'Copy', 2000); })">Copy</button>
          </div>
          <pre><code class="language-${language}" data-raw="${escapeHtml(text).replace(/"/g, '&quot;')}"><table class="code-table">${lineNumberedCode}</table></code></pre>
        </div>
      `;
    };

    marked.use({ renderer });

    try {
      // First process math, then wiki links, then parse markdown
      let processed = processMath(content || '');
      processed = processWikiLinks(processed);
      return marked.parse(processed);
    } catch {
      return '<p class="text-error">Error rendering markdown</p>';
    }
  }, [content, processWikiLinks, processMath]);

  // Render math with KaTeX after HTML is inserted
  useEffect(() => {
    if (!contentRef.current || typeof window === 'undefined') return;
    
    // Check if KaTeX is available
    if (typeof window.katex === 'undefined') {
      // Wait for KaTeX to load
      const checkKatex = setInterval(() => {
        if (typeof window.katex !== 'undefined') {
          clearInterval(checkKatex);
          renderMath();
        }
      }, 100);
      
      // Cleanup after 5 seconds
      setTimeout(() => clearInterval(checkKatex), 5000);
      return;
    }
    
    renderMath();
    
    function renderMath() {
      const container = contentRef.current;
      if (!container) return;
      
      // Render block math
      container.querySelectorAll('.math-block').forEach((el) => {
        const math = el.getAttribute('data-math');
        if (math && !el.classList.contains('katex-rendered')) {
          try {
            el.innerHTML = window.katex.renderToString(math, {
              displayMode: true,
              throwOnError: false,
              strict: false
            });
            el.classList.add('katex-rendered');
          } catch (e) {
            console.error('KaTeX error:', e);
          }
        }
      });
      
      // Render inline math
      container.querySelectorAll('.math-inline').forEach((el) => {
        const math = el.getAttribute('data-math');
        if (math && !el.classList.contains('katex-rendered')) {
          try {
            el.innerHTML = window.katex.renderToString(math, {
              displayMode: false,
              throwOnError: false,
              strict: false
            });
            el.classList.add('katex-rendered');
          } catch (e) {
            console.error('KaTeX error:', e);
          }
        }
      });
    }
  }, [html]);

  // Handle wiki link clicks
  const handleClick = useCallback((e) => {
    const link = e.target.closest('.wiki-link');
    if (link) {
      e.preventDefault();
      const noteId = link.dataset.noteId;
      if (noteId && onNavigateNote) {
        onNavigateNote(noteId);
      }
    }
  }, [onNavigateNote]);

  // Handle wiki link hover for preview
  const handleMouseOver = useCallback((e) => {
    const link = e.target.closest('.wiki-link');
    if (link && link.dataset.noteId) {
      const rect = link.getBoundingClientRect();
      setHoverLink(link.dataset.noteId);
      setHoverPosition({
        top: rect.bottom + 8,
        left: rect.left
      });
    }
  }, []);

  const handleMouseOut = useCallback((e) => {
    const link = e.target.closest('.wiki-link');
    if (link) {
      setHoverLink(null);
      setHoverPosition(null);
    }
  }, []);

  return (
    <>
      <div
        ref={contentRef}
        className={cn('markdown-content prose max-w-none p-4', className)}
        dangerouslySetInnerHTML={{ __html: html }}
        onClick={handleClick}
        onMouseOver={handleMouseOver}
        onMouseOut={handleMouseOut}
      />

      {/* Wiki Link Preview on Hover */}
      {hoverLink && (
        <WikiLinkPreview
          noteId={hoverLink}
          notes={notes}
          position={hoverPosition}
          onNavigate={(id) => {
            onNavigateNote?.(id);
            setHoverLink(null);
          }}
        />
      )}
    </>
  );
}
