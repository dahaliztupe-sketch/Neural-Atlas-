import test from 'node:test';
import assert from 'node:assert/strict';
import { renderSafeMarkdown, computeReadingStats } from './markdown';

test('KaTeX renders inline math equations with LTR isolation', () => {
  const doc = renderSafeMarkdown('Neural layer activation: $f(x) = \\sigma(W x + b)$ in inference.');
  assert.ok(doc.html.includes('class="na-math-inline" dir="ltr"'));
  assert.ok(doc.html.includes('katex'));
});

test('KaTeX renders display block math equations and matrices cleanly', () => {
  const source = [
    '## Loss Function',
    '',
    '$$\\mathcal{L}_{MSE} = \\frac{1}{N} \\sum_{i=1}^{N} (y_i - \\hat{y}_i)^2$$',
  ].join('\n');
  const doc = renderSafeMarkdown(source);
  assert.ok(doc.html.includes('class="na-math-block" dir="ltr"'));
  assert.ok(doc.html.includes('katex-display'));
  assert.equal(doc.toc.length, 1);
});

test('KaTeX never parses math inside fenced code blocks or inline code spans', () => {
  const source = [
    'Inline example `$x + y$` should remain literal code.',
    '',
    '```cpp',
    'int price = $100;',
    '// $$not_math$$',
    '```',
  ].join('\n');
  const doc = renderSafeMarkdown(source);
  assert.ok(!doc.html.includes('na-math-inline'));
  assert.ok(!doc.html.includes('na-math-block'));
  assert.ok(doc.html.includes('$x + y$'));
  assert.equal(doc.codeBlocks.length, 1);
});

test('KaTeX enforces trust:false XSS safeguards and handles Arabic prose cleanly', () => {
  const malicious = 'Unsafe $\\href{javascript:alert(1)}{click}$ + Arabic: دالة الخسارة $E = mc^2$.';
  const doc = renderSafeMarkdown(malicious);
  assert.ok(!/href\s*=\s*["']\s*javascript:/i.test(doc.html));
  assert.ok(!doc.html.includes('<a '));
  assert.ok(doc.html.includes('دالة الخسارة'));
  assert.ok(doc.html.includes('dir="ltr"'));

  const stats = computeReadingStats('$$\\alpha + \\beta$$');
  assert.equal(stats.wordCount, 1);
});

test('KaTeX skips backslash-escaped currency tokens while rendering valid inline math', () => {
  const doc = renderSafeMarkdown('Hardware budget is \\$50 to \\$100, and complexity is $O(n \\log n)$.');
  const mathMatches = doc.html.match(/class="na-math-inline"/g) || [];
  assert.equal(mathMatches.length, 1);
  assert.ok(doc.html.includes('katex'));
  assert.ok(doc.html.includes('$50'));
  assert.ok(doc.html.includes('$100'));
});

