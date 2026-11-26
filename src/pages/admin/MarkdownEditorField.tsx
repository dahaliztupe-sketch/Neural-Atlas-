import React, { useState, useRef, lazy, Suspense } from 'react';
import { Code, Bold, Heading2, Link as LinkIcon, Columns, Eye, Edit3, Sigma, Divide, Grid3x3 } from 'lucide-react';
import { useApp } from '../../context/AppContext';

const LazyMarkdownRenderer = lazy(() =>
  import('../../components/MarkdownRenderer').then((m) => ({ default: m.MarkdownRenderer }))
);

interface MarkdownEditorFieldProps {
  id: string;
  label: string;
  value: string;
  onChange: (next: string) => void;
  dir?: 'ltr' | 'rtl';
  rows?: number;
  placeholder?: string;
}

type EditorViewMode = 'write' | 'split' | 'preview';

export const MarkdownEditorField: React.FC<MarkdownEditorFieldProps> = ({
  id,
  label,
  value,
  onChange,
  dir = 'ltr',
  rows = 6,
  placeholder = '',
}) => {
  const { t } = useApp();
  const [mode, setMode] = useState<EditorViewMode>('write');
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const insertSnippet = (before: string, after = '', fallbackText = '') => {
    const el = textareaRef.current;
    if (!el) {
      onChange(`${value}${before}${fallbackText}${after}`);
      return;
    }
    const start = el.selectionStart ?? value.length;
    const end = el.selectionEnd ?? value.length;
    const selected = value.slice(start, end) || fallbackText;
    const next = `${value.slice(0, start)}${before}${selected}${after}${value.slice(end)}`;
    onChange(next);
    window.requestAnimationFrame(() => {
      el.focus();
      const cursorPos = start + before.length + selected.length;
      el.setSelectionRange(cursorPos, cursorPos);
    });
  };

  return (
    <div className="space-y-2">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <label htmlFor={id} className="font-mono text-[11px] text-[var(--color-text-subtle)]">
          {label}
        </label>

        <div className="flex items-center gap-2">
          {/* Quick Markdown Snippets */}
          {mode !== 'preview' && (
            <div className="inline-flex items-center gap-0.5 rounded-xl border border-[var(--color-border-subtle)] bg-[var(--color-surface-solid)] p-0.5">
              <button
                type="button"
                onClick={() => insertSnippet('\n## ', '\n', 'Heading')}
                className="p-1.5 rounded-lg text-[var(--color-text-muted)] hover:text-[var(--color-text)] cursor-pointer focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]"
                title="Heading H2"
                aria-label="Insert heading"
              >
                <Heading2 className="w-3.5 h-3.5" aria-hidden="true" />
              </button>
              <button
                type="button"
                onClick={() => insertSnippet('**', '**', 'bold')}
                className="p-1.5 rounded-lg text-[var(--color-text-muted)] hover:text-[var(--color-text)] cursor-pointer focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]"
                title="Bold"
                aria-label="Insert bold text"
              >
                <Bold className="w-3.5 h-3.5" aria-hidden="true" />
              </button>
              <button
                type="button"
                onClick={() => insertSnippet('\n```cpp\n', '\n```\n', '// code')}
                className="p-1.5 rounded-lg text-[var(--color-text-muted)] hover:text-[var(--color-text)] cursor-pointer focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]"
                title="Code Block"
                aria-label="Insert code block"
              >
                <Code className="w-3.5 h-3.5" aria-hidden="true" />
              </button>
              <button
                type="button"
                onClick={() => insertSnippet('[', '](https://example.com)', 'link text')}
                className="p-1.5 rounded-lg text-[var(--color-text-muted)] hover:text-[var(--color-text)] cursor-pointer focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]"
                title="Link"
                aria-label="Insert link"
              >
                <LinkIcon className="w-3.5 h-3.5" aria-hidden="true" />
              </button>
              <span aria-hidden="true" className="w-px h-4 bg-[var(--color-border-subtle)] mx-0.5" />
              <button
                type="button"
                onClick={() => insertSnippet('$', '$', 'f(x) = Wx + b')}
                className="p-1.5 rounded-lg text-[var(--color-text-muted)] hover:text-[var(--color-secondary)] cursor-pointer focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]"
                title={t('adminEditorInsertInlineMath')}
                aria-label={t('adminEditorInsertInlineMath')}
              >
                <Sigma className="w-3.5 h-3.5" aria-hidden="true" />
              </button>
              <button
                type="button"
                onClick={() =>
                  insertSnippet(
                    '\n$$\n',
                    '\n$$\n',
                    '\\mathcal{L}_{MSE} = \\frac{1}{N} \\sum_{i=1}^{N} (y_i - \\hat{y}_i)^2'
                  )
                }
                className="p-1.5 rounded-lg text-[var(--color-text-muted)] hover:text-[var(--color-secondary)] cursor-pointer focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]"
                title={t('adminEditorInsertBlockMath')}
                aria-label={t('adminEditorInsertBlockMath')}
              >
                <Divide className="w-3.5 h-3.5" aria-hidden="true" />
              </button>
              <button
                type="button"
                onClick={() =>
                  insertSnippet(
                    '\n$$\n\\begin{bmatrix}\n',
                    '\n\\end{bmatrix}\n$$\n',
                    'w_{11} & w_{12} \\\\\nw_{21} & w_{22}'
                  )
                }
                className="p-1.5 rounded-lg text-[var(--color-text-muted)] hover:text-[var(--color-secondary)] cursor-pointer focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]"
                title={t('adminEditorInsertMatrix')}
                aria-label={t('adminEditorInsertMatrix')}
              >
                <Grid3x3 className="w-3.5 h-3.5" aria-hidden="true" />
              </button>
            </div>
          )}

          {/* View Mode Switcher */}
          <div className="inline-flex items-center rounded-xl border border-[var(--color-border)] bg-[var(--color-surface-solid)] p-0.5 font-mono text-[11px]">
            <button
              type="button"
              onClick={() => setMode('write')}
              className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-lg cursor-pointer transition-colors ${
                mode === 'write'
                  ? 'bg-[var(--color-primary-solid)] text-white font-semibold'
                  : 'text-[var(--color-text-muted)] hover:text-[var(--color-text)]'
              }`}
            >
              <Edit3 className="w-3 h-3" aria-hidden="true" />
              <span>{t('adminEditorWrite')}</span>
            </button>
            <button
              type="button"
              onClick={() => setMode('split')}
              className={`hidden sm:inline-flex items-center gap-1 px-2.5 py-1 rounded-lg cursor-pointer transition-colors ${
                mode === 'split'
                  ? 'bg-[var(--color-primary-solid)] text-white font-semibold'
                  : 'text-[var(--color-text-muted)] hover:text-[var(--color-text)]'
              }`}
            >
              <Columns className="w-3 h-3" aria-hidden="true" />
              <span>{t('adminEditorSplit')}</span>
            </button>
            <button
              type="button"
              onClick={() => setMode('preview')}
              className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-lg cursor-pointer transition-colors ${
                mode === 'preview'
                  ? 'bg-[var(--color-primary-solid)] text-white font-semibold'
                  : 'text-[var(--color-text-muted)] hover:text-[var(--color-text)]'
              }`}
            >
              <Eye className="w-3 h-3" aria-hidden="true" />
              <span>{t('adminEditorPreview')}</span>
            </button>
          </div>
        </div>
      </div>

      <div className={`grid gap-3 ${mode === 'split' ? 'grid-cols-1 sm:grid-cols-2' : 'grid-cols-1'}`}>
        {mode !== 'preview' && (
          <textarea
            ref={textareaRef}
            id={id}
            rows={rows}
            dir={dir}
            value={value}
            onChange={(e) => onChange(e.target.value)}
            placeholder={placeholder}
            className={`w-full px-3 py-2.5 rounded-xl border border-[var(--color-border)] bg-[var(--color-surface-solid)] text-xs text-[var(--color-text)] focus:outline-none focus:border-[var(--color-primary)] focus:ring-1 focus:ring-[var(--color-primary)] ${
              dir === 'ltr' ? 'font-mono' : 'font-sans'
            }`}
          />
        )}

        {mode !== 'write' && (
          <div
            dir={dir}
            className="min-h-[150px] max-h-80 overflow-y-auto p-3.5 rounded-xl border border-[var(--color-border)] bg-[var(--color-surface-solid)]"
          >
            {value.trim() ? (
              <Suspense
                fallback={
                  <div className="text-xs text-[var(--color-text-muted)] whitespace-pre-wrap">
                    {value}
                  </div>
                }
              >
                <LazyMarkdownRenderer
                  content={value}
                  showToc={false}
                  copyLabel={t('copyCodeBtn')}
                  copiedLabel={t('copiedCodeBtn')}
                />
              </Suspense>
            ) : (
              <p className="text-xs text-[var(--color-text-subtle)] italic">
                {t('adminEditorPreviewEmpty')}
              </p>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
