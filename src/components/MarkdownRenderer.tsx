import React, { useMemo, useRef, useState } from 'react';
import 'katex/dist/katex.min.css';
import { ListTree, ChevronDown } from 'lucide-react';
import { renderSafeMarkdown } from '../lib/markdown';

interface MarkdownRendererProps {
  content: string;
  showToc?: boolean;
  tocTitle?: string;
  copyLabel?: string;
  copiedLabel?: string;
  className?: string;
}

export const MarkdownRenderer: React.FC<MarkdownRendererProps> = ({
  content,
  showToc = false,
  tocTitle = 'Contents',
  copyLabel = 'Copy',
  copiedLabel = 'Copied',
  className = '',
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [tocOpen, setTocOpen] = useState(false);

  const parsed = useMemo(
    () => renderSafeMarkdown(content, { copyLabel }),
    [content, copyLabel]
  );

  const handleContainerClick = async (e: React.MouseEvent<HTMLDivElement>) => {
    const target = e.target as HTMLElement | null;
    const copyBtn = target?.closest<HTMLButtonElement>('button[data-copy-index]');
    if (!copyBtn) return;

    const indexAttr = copyBtn.getAttribute('data-copy-index');
    const idx = indexAttr ? Number(indexAttr) : -1;
    const rawCode = parsed.codeBlocks[idx];
    if (typeof rawCode !== 'string') return;

    try {
      await navigator.clipboard.writeText(rawCode);
      copyBtn.textContent = copiedLabel;
      window.setTimeout(() => {
        if (copyBtn.isConnected) {
          copyBtn.textContent = copyLabel;
        }
      }, 1800);
    } catch {
      // Fallback for restricted clipboard environments
      const textarea = document.createElement('textarea');
      textarea.value = rawCode;
      textarea.style.position = 'fixed';
      textarea.style.opacity = '0';
      document.body.appendChild(textarea);
      textarea.select();
      try {
        document.execCommand('copy');
        copyBtn.textContent = copiedLabel;
        window.setTimeout(() => {
          if (copyBtn.isConnected) {
            copyBtn.textContent = copyLabel;
          }
        }, 1800);
      } finally {
        document.body.removeChild(textarea);
      }
    }
  };

  const scrollToHeading = (id: string) => {
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  return (
    <div className={`space-y-6 ${className}`}>
      {showToc && parsed.toc.length >= 2 && (
        <nav
          aria-label={tocTitle}
          className="rounded-xl border border-[var(--color-border-subtle)] bg-[var(--color-surface-solid)]/70 p-4 space-y-2"
        >
          <button
            type="button"
            onClick={() => setTocOpen((prev) => !prev)}
            className="w-full flex items-center justify-between text-xs font-mono text-[var(--color-secondary)] cursor-pointer focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)] rounded-sm"
            aria-expanded={tocOpen}
          >
            <span className="inline-flex items-center gap-1.5 font-semibold">
              <ListTree className="w-3.5 h-3.5 shrink-0" aria-hidden="true" />
              <span>{tocTitle}</span>
            </span>
            <ChevronDown
              className={`w-4 h-4 transition-transform ${tocOpen ? 'rotate-180' : ''}`}
              aria-hidden="true"
            />
          </button>

          <ul className={`${tocOpen ? 'block' : 'hidden sm:block'} space-y-1.5 pt-2 border-t border-[var(--color-border-subtle)] text-xs`}>
            {parsed.toc.map((heading) => (
              <li
                key={heading.id}
                style={{
                  paddingInlineStart: `${Math.max(0, heading.level - 1) * 0.85}rem`,
                }}
              >
                <button
                  type="button"
                  onClick={() => scrollToHeading(heading.id)}
                  className="text-start text-[var(--color-text-muted)] hover:text-[var(--color-primary)] transition-colors cursor-pointer py-0.5 focus:outline-none focus:underline"
                >
                  {heading.text}
                </button>
              </li>
            ))}
          </ul>
        </nav>
      )}

      <div
        ref={containerRef}
        onClick={handleContainerClick}
        className="na-md-body"
        dangerouslySetInnerHTML={{ __html: parsed.html }}
      />
    </div>
  );
};
