import { Marked, Tokens, TokenizerAndRendererExtension } from 'marked';
import katex from 'katex';
import hljs from 'highlight.js/lib/core';
import cpp from 'highlight.js/lib/languages/cpp';
import c from 'highlight.js/lib/languages/c';
import python from 'highlight.js/lib/languages/python';
import typescript from 'highlight.js/lib/languages/typescript';
import javascript from 'highlight.js/lib/languages/javascript';
import bash from 'highlight.js/lib/languages/bash';
import json from 'highlight.js/lib/languages/json';
import sql from 'highlight.js/lib/languages/sql';
import css from 'highlight.js/lib/languages/css';
import xml from 'highlight.js/lib/languages/xml';

hljs.registerLanguage('cpp', cpp);
hljs.registerLanguage('c++', cpp);
hljs.registerLanguage('c', c);
hljs.registerLanguage('python', python);
hljs.registerLanguage('py', python);
hljs.registerLanguage('typescript', typescript);
hljs.registerLanguage('ts', typescript);
hljs.registerLanguage('javascript', javascript);
hljs.registerLanguage('js', javascript);
hljs.registerLanguage('bash', bash);
hljs.registerLanguage('sh', bash);
hljs.registerLanguage('shell', bash);
hljs.registerLanguage('json', json);
hljs.registerLanguage('sql', sql);
hljs.registerLanguage('css', css);
hljs.registerLanguage('html', xml);
hljs.registerLanguage('xml', xml);

export interface MarkdownHeading {
  id: string;
  text: string;
  level: number;
}

export interface ParsedMarkdownDocument {
  html: string;
  toc: MarkdownHeading[];
  codeBlocks: string[];
  wordCount: number;
  readingMinutes: number;
}

export function escapeHtml(input: string): string {
  return String(input || '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

export function isSafeMarkdownHref(href: string | null | undefined): boolean {
  if (!href || typeof href !== 'string') return false;
  const trimmed = href.trim();
  if (!trimmed) return false;
  if (trimmed.startsWith('#') || trimmed.startsWith('/')) {
    return !trimmed.startsWith('//');
  }
  try {
    const parsed = new URL(trimmed);
    return (
      parsed.protocol === 'http:' ||
      parsed.protocol === 'https:' ||
      parsed.protocol === 'mailto:'
    );
  } catch {
    return false;
  }
}

export function isSafeMarkdownImageSrc(src: string | null | undefined): boolean {
  if (!src || typeof src !== 'string') return false;
  const trimmed = src.trim();
  if (!trimmed) return false;
  if (trimmed.startsWith('/') && !trimmed.startsWith('//')) return true;
  try {
    const parsed = new URL(trimmed);
    return parsed.protocol === 'http:' || parsed.protocol === 'https:';
  } catch {
    return false;
  }
}

export function slugifyHeading(text: string, index: number): string {
  const cleaned = String(text || '')
    .toLowerCase()
    .trim()
    .replace(/<[^>]+>/g, '')
    .replace(/[^\p{L}\p{N}\s-]/gu, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '')
    .slice(0, 64);

  return cleaned ? `sec-${cleaned}-${index}` : `sec-${index}`;
}

export function computeReadingStats(source: string): { wordCount: number; readingMinutes: number } {
  const plain = String(source || '')
    .replace(/```[\s\S]*?```/g, ' ')
    .replace(/`[^`]*`/g, ' ')
    .replace(/\$\$[\s\S]*?\$\$/g, ' formula ')
    .replace(/(^|[^\\])\$[^\n$]+(?<!\\)\$/g, '$1 formula ')
    .replace(/[#>*_~\-|[\]()]/g, ' ')
    .trim();

  if (!plain) {
    return { wordCount: 0, readingMinutes: 0 };
  }

  const words = plain.split(/\s+/).filter(Boolean);
  const wordCount = words.length;
  const readingMinutes = Math.max(1, Math.ceil(wordCount / 180));
  return { wordCount, readingMinutes };
}

function isEscapedAt(src: string, index: number): boolean {
  let backslashes = 0;
  for (let i = index - 1; i >= 0 && src[i] === '\\'; i--) {
    backslashes++;
  }
  return backslashes % 2 === 1;
}

function findUnescapedDelimiter(src: string, delimiter: '$$' | '$'): number {
  let idx = 0;
  while (idx < src.length) {
    const found = src.indexOf(delimiter, idx);
    if (found < 0) return -1;
    if (isEscapedAt(src, found)) {
      idx = found + delimiter.length;
      continue;
    }
    if (delimiter === '$' && src[found + 1] === '$') {
      idx = found + 2;
      continue;
    }
    return found;
  }
  return -1;
}

function renderKatexSafe(tex: string, displayMode: boolean): string {
  const trimmed = String(tex || '').trim();
  if (!trimmed) return '';

  try {
    const rendered = katex
      .renderToString(trimmed, {
        displayMode,
        throwOnError: false,
        strict: 'ignore',
        trust: false,
        output: 'htmlAndMathml',
      })
      .replace(/href\s*=\s*(["'])\s*(?:javascript|vbscript|data):[^"']*\1/gi, 'data-blocked-href="true"');

    if (displayMode) {
      return `<div class="na-math-block" dir="ltr">${rendered}</div>\n`;
    }
    return `<span class="na-math-inline" dir="ltr">${rendered}</span>`;
  } catch {
    return `<code class="na-inline-code" dir="ltr">${escapeHtml(trimmed)}</code>`;
  }
}

const blockMathExtension: TokenizerAndRendererExtension = {
  name: 'blockMath',
  level: 'block',
  start(src: string) {
    return findUnescapedDelimiter(src, '$$');
  },
  tokenizer(src: string) {
    const match = src.match(/^\s*\$\$([\s\S]+?)\$\$(?:\s*(?:\n|$))/);
    if (!match) return undefined;
    const text = match[1].trim();
    if (!text) return undefined;
    return {
      type: 'blockMath',
      raw: match[0],
      text,
    };
  },
  renderer(token) {
    return renderKatexSafe(String(token.text || ''), true);
  },
};

const inlineDisplayMathExtension: TokenizerAndRendererExtension = {
  name: 'inlineDisplayMath',
  level: 'inline',
  start(src: string) {
    return findUnescapedDelimiter(src, '$$');
  },
  tokenizer(src: string) {
    const match = src.match(/^\$\$([\s\S]+?)\$\$/);
    if (!match) return undefined;
    const text = match[1].trim();
    if (!text) return undefined;
    return {
      type: 'inlineDisplayMath',
      raw: match[0],
      text,
    };
  },
  renderer(token) {
    return renderKatexSafe(String(token.text || ''), true);
  },
};

const inlineMathExtension: TokenizerAndRendererExtension = {
  name: 'inlineMath',
  level: 'inline',
  start(src: string) {
    return findUnescapedDelimiter(src, '$');
  },
  tokenizer(src: string) {
    // Reject $$ display delimiters and leading/trailing whitespace currency like "$ 50"
    if (src.startsWith('$$')) return undefined;
    const match = src.match(/^\$(?!\s)((?:\\.|[^$\n\\])+?)(?<!\s)\$/);
    if (!match) return undefined;
    const text = match[1].trim();
    if (!text) return undefined;
    return {
      type: 'inlineMath',
      raw: match[0],
      text,
    };
  },
  renderer(token) {
    return renderKatexSafe(String(token.text || ''), false);
  },
};

export function renderSafeMarkdown(
  source: string,
  options?: { copyLabel?: string }
): ParsedMarkdownDocument {
  const raw = String(source || '');
  const { wordCount, readingMinutes } = computeReadingStats(raw);
  const toc: MarkdownHeading[] = [];
  const codeBlocks: string[] = [];
  const copyLabel = escapeHtml(options?.copyLabel || 'Copy');

  if (!raw.trim()) {
    return { html: '', toc, codeBlocks, wordCount: 0, readingMinutes: 0 };
  }

  const instance = new Marked({
    gfm: true,
    breaks: true,
  });

  instance.use({
    extensions: [blockMathExtension, inlineDisplayMathExtension, inlineMathExtension],
    renderer: {
      // XSS guard: neutralize any raw inline HTML blocks or tags
      html(token: Tokens.HTML | Tokens.Tag) {
        return escapeHtml(token.text);
      },
      heading(token: Tokens.Heading) {
        const innerHtml = this.parser.parseInline(token.tokens);
        const plainText = token.text.replace(/<[^>]+>/g, '').trim();
        const id = slugifyHeading(plainText, toc.length + 1);
        if (token.depth >= 1 && token.depth <= 3 && plainText) {
          toc.push({ id, text: plainText, level: token.depth });
        }
        return `<h${token.depth} id="${escapeHtml(id)}" class="na-md-heading na-md-h${token.depth}">${innerHtml}</h${token.depth}>\n`;
      },
      code(token: Tokens.Code) {
        const rawCode = token.text || '';
        const langRaw = (token.lang || '').trim().toLowerCase().split(/\s+/)[0] || '';
        const blockIndex = codeBlocks.length;
        codeBlocks.push(rawCode);

        let highlighted = escapeHtml(rawCode);
        let displayLang = langRaw || 'text';
        if (langRaw && hljs.getLanguage(langRaw)) {
          try {
            highlighted = hljs.highlight(rawCode, { language: langRaw }).value;
          } catch {
            highlighted = escapeHtml(rawCode);
          }
        } else if (!langRaw) {
          displayLang = 'code';
        }

        return [
          `<div class="na-code-block" dir="ltr">`,
          `<div class="na-code-header">`,
          `<span class="na-code-lang">${escapeHtml(displayLang)}</span>`,
          `<button type="button" class="na-copy-btn" data-copy-index="${blockIndex}">${copyLabel}</button>`,
          `</div>`,
          `<pre class="na-code-pre"><code class="hljs language-${escapeHtml(displayLang)}">${highlighted}</code></pre>`,
          `</div>\n`,
        ].join('');
      },
      codespan(token: Tokens.Codespan) {
        return `<code class="na-inline-code" dir="ltr">${escapeHtml(token.text)}</code>`;
      },
      link(token: Tokens.Link) {
        const inner = this.parser.parseInline(token.tokens);
        if (!isSafeMarkdownHref(token.href)) {
          return `<span>${inner}</span>`;
        }
        const safeHref = escapeHtml(token.href);
        const isExternal = /^https?:\/\//i.test(token.href);
        const titleAttr = token.title ? ` title="${escapeHtml(token.title)}"` : '';
        const externalAttrs = isExternal ? ' target="_blank" rel="noopener noreferrer"' : '';
        return `<a href="${safeHref}"${titleAttr}${externalAttrs} class="na-md-link">${inner}</a>`;
      },
      image(token: Tokens.Image) {
        if (!isSafeMarkdownImageSrc(token.href)) {
          return `<span class="na-md-broken-img">${escapeHtml(token.text || 'Image omitted')}</span>`;
        }
        const safeSrc = escapeHtml(token.href);
        const safeAlt = escapeHtml(token.text || '');
        const titleAttr = token.title ? ` title="${escapeHtml(token.title)}"` : '';
        return `<img src="${safeSrc}" alt="${safeAlt}"${titleAttr} loading="lazy" referrerpolicy="no-referrer" class="na-md-img" />`;
      },
    },
  });

  const html = instance.parse(raw) as string;
  return { html, toc, codeBlocks, wordCount, readingMinutes };
}
