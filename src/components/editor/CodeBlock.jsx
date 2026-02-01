'use client';

import { useState, useCallback, useEffect, useRef } from 'react';
import { cn } from '@/lib/utils';

// Simple syntax highlighting using regex patterns
// This provides basic highlighting without external dependencies
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
    types: /\b([A-Z][a-zA-Z0-9_]*)\b/g,
  },
  jsx: {
    keywords: /\b(const|let|var|function|return|if|else|for|while|do|switch|case|break|continue|new|class|extends|import|export|from|default|try|catch|finally|throw|async|await|yield|typeof|instanceof|in|of|delete|void|null|undefined|true|false|this|super)\b/g,
    strings: /(["'`])(?:(?!\1)[^\\]|\\.)*?\1/g,
    comments: /(\/\/.*$|\/\*[\s\S]*?\*\/|{\/\*[\s\S]*?\*\/})/gm,
    numbers: /\b(\d+\.?\d*)\b/g,
    functions: /\b([a-zA-Z_$][a-zA-Z0-9_$]*)\s*(?=\()/g,
    tags: /(<\/?[A-Z][a-zA-Z0-9]*)/g,
  },
  html: {
    tags: /(<\/?[a-zA-Z][a-zA-Z0-9]*)/g,
    attributes: /\s([a-zA-Z-]+)=/g,
    strings: /(["'])(?:(?!\1)[^\\]|\\.)*?\1/g,
    comments: /(<!--[\s\S]*?-->)/g,
  },
  css: {
    selectors: /([.#]?[a-zA-Z_-][a-zA-Z0-9_-]*)\s*(?={)/g,
    properties: /\b([a-zA-Z-]+)\s*:/g,
    values: /:\s*([^;{}]+)/g,
    comments: /(\/\*[\s\S]*?\*\/)/g,
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

// Alias mappings
const LANGUAGE_ALIASES = {
  js: 'javascript',
  ts: 'typescript',
  tsx: 'jsx',
  py: 'python',
  sh: 'bash',
  shell: 'bash',
  zsh: 'bash',
};

function escapeHtml(text) {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
}

function highlightCode(code, language) {
  const lang = LANGUAGE_ALIASES[language] || language;
  const patterns = LANGUAGE_PATTERNS[lang];
  
  if (!patterns) {
    return escapeHtml(code);
  }

  let result = escapeHtml(code);
  const tokens = [];
  let tokenId = 0;

  // Replace matches with tokens to prevent double-processing
  const addToken = (match, className) => {
    const token = `__TOKEN_${tokenId++}__`;
    tokens.push({ token, replacement: `<span class="${className}">${match}</span>` });
    return token;
  };

  // Process comments first (they take precedence)
  if (patterns.comments) {
    result = result.replace(patterns.comments, (match) => addToken(match, 'code-comment'));
  }

  // Process strings
  if (patterns.strings) {
    result = result.replace(patterns.strings, (match) => addToken(match, 'code-string'));
  }

  // Process keywords
  if (patterns.keywords) {
    result = result.replace(patterns.keywords, (match) => addToken(match, 'code-keyword'));
  }

  // Process functions
  if (patterns.functions) {
    result = result.replace(patterns.functions, (match) => addToken(match, 'code-function'));
  }

  // Process numbers
  if (patterns.numbers) {
    result = result.replace(patterns.numbers, (match) => addToken(match, 'code-number'));
  }

  // Language-specific patterns
  if (patterns.types) {
    result = result.replace(patterns.types, (match) => addToken(match, 'code-type'));
  }
  if (patterns.tags) {
    result = result.replace(patterns.tags, (match) => addToken(match, 'code-tag'));
  }
  if (patterns.attributes) {
    result = result.replace(patterns.attributes, (_, match) => ` ${addToken(match, 'code-attribute')}=`);
  }
  if (patterns.properties) {
    result = result.replace(patterns.properties, (_, match) => `${addToken(match, 'code-property')}:`);
  }
  if (patterns.keys) {
    result = result.replace(patterns.keys, (_, match) => `${addToken(match, 'code-key')}:`);
  }
  if (patterns.booleans) {
    result = result.replace(patterns.booleans, (match) => addToken(match, 'code-boolean'));
  }
  if (patterns.variables) {
    result = result.replace(patterns.variables, (match) => addToken(match, 'code-variable'));
  }

  // Replace tokens with actual spans
  for (const { token, replacement } of tokens) {
    result = result.replace(token, replacement);
  }

  return result;
}

export function CodeBlock({ code, language = 'plaintext', showLineNumbers = true }) {
  const [copied, setCopied] = useState(false);
  const codeRef = useRef(null);

  const lines = code.split('\n');
  const normalizedLanguage = LANGUAGE_ALIASES[language?.toLowerCase()] || language?.toLowerCase() || 'plaintext';

  const handleCopy = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(code);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  }, [code]);

  const highlightedCode = highlightCode(code, normalizedLanguage);

  return (
    <div className="code-block-wrapper group relative rounded-lg overflow-hidden my-4 bg-zinc-900 border border-zinc-700/50">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-2 bg-zinc-800 border-b border-zinc-700/50">
        <span className="text-xs text-zinc-400 font-mono uppercase">
          {normalizedLanguage}
        </span>
        <button
          onClick={handleCopy}
          className={cn(
            "flex items-center gap-1.5 px-2 py-1 rounded text-xs transition-all",
            copied 
              ? "bg-green-500/20 text-green-400" 
              : "hover:bg-zinc-700 text-zinc-400 hover:text-zinc-200"
          )}
        >
          {copied ? (
            <>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <polyline points="20 6 9 17 4 12" />
              </svg>
              Copied!
            </>
          ) : (
            <>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <rect x="9" y="9" width="13" height="13" rx="2" ry="2" />
                <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
              </svg>
              Copy
            </>
          )}
        </button>
      </div>

      {/* Code Content */}
      <div className="overflow-x-auto">
        <pre className="p-4 m-0 text-sm leading-relaxed" ref={codeRef}>
          <code className={`language-${normalizedLanguage}`}>
            {showLineNumbers ? (
              <table className="w-full border-collapse">
                <tbody>
                  {lines.map((line, index) => (
                    <tr key={index} className="hover:bg-zinc-800/30">
                      <td className="select-none pr-4 text-right text-zinc-500/50 text-xs w-10 align-top">
                        {index + 1}
                      </td>
                      <td 
                        className="whitespace-pre"
                        dangerouslySetInnerHTML={{ 
                          __html: highlightCode(line, normalizedLanguage) || '&nbsp;' 
                        }}
                      />
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : (
              <span dangerouslySetInnerHTML={{ __html: highlightedCode }} />
            )}
          </code>
        </pre>
      </div>
    </div>
  );
}

export default CodeBlock;
