import test from 'node:test';
import assert from 'node:assert/strict';
import {
  renderSafeMarkdown,
  computeReadingStats,
  isSafeMarkdownHref,
  isSafeMarkdownImageSrc,
  slugifyHeading,
} from './markdown';

test('isSafeMarkdownHref and isSafeMarkdownImageSrc reject dangerous protocols', () => {
  assert.equal(isSafeMarkdownHref('https://github.com/dahaliztupe-sketch'), true);
  assert.equal(isSafeMarkdownHref('#section-1'), true);
  assert.equal(isSafeMarkdownHref('/projects'), true);
  assert.equal(isSafeMarkdownHref('//evil.example/path'), false);
  assert.equal(isSafeMarkdownHref('javascript:alert(1)'), false);
  assert.equal(isSafeMarkdownHref('data:text/html,<script>alert(1)</script>'), false);

  assert.equal(isSafeMarkdownImageSrc('https://example.com/diagram.png'), true);
  assert.equal(isSafeMarkdownImageSrc('/icon.svg'), true);
  assert.equal(isSafeMarkdownImageSrc('//evil.example/img.png'), false);
  assert.equal(isSafeMarkdownImageSrc('javascript:alert(1)'), false);
  assert.equal(isSafeMarkdownImageSrc('data:image/svg+xml,<svg onload=alert(1)>'), false);
});

test('renderSafeMarkdown neutralizes XSS payloads while preserving safe links and images', () => {
  const malicious = [
    '<script>alert("xss")</script>',
    '<img src="x" onerror="alert(1)" />',
    '[Click me](javascript:alert(1))',
    '[Safe link](https://example.com "Example")',
    '![Evil img](data:text/html,<script>alert(1)</script>)',
  ].join('\n\n');

  const doc = renderSafeMarkdown(malicious, { copyLabel: 'Copy' });

  assert.equal(doc.html.includes('<script>'), false, 'Raw <script> tags must be escaped');
  assert.equal(doc.html.includes('onerror="'), false, 'Raw <img> with onerror must be escaped');
  assert.equal(doc.html.includes('javascript:alert'), false, 'javascript: links must be stripped');
  assert.equal(doc.html.includes('&lt;script&gt;'), true, 'Escaped text remains readable without execution');
  assert.equal(
    doc.html.includes('href="https://example.com"'),
    true,
    'Safe external links should be rendered'
  );
  assert.equal(
    doc.html.includes('rel="noopener noreferrer"'),
    true,
    'External links must include noopener noreferrer'
  );
  assert.equal(doc.html.includes('na-md-broken-img'), true, 'Unsafe image protocols must be omitted');
});

test('renderSafeMarkdown extracts bilingual Table of Contents and applies selective syntax highlighting', () => {
  const sample = [
    '# Memory Basics',
    'Pointers reference memory addresses.',
    '## أساسيات المؤشرات في سي++',
    ['```cpp', 'int x = 42;', 'int* ptr = &x;', '```'].join('\n'),
  ].join('\n\n');

  const doc = renderSafeMarkdown(sample, { copyLabel: 'Copy' });

  assert.equal(doc.toc.length, 2);
  assert.equal(doc.toc[0].level, 1);
  assert.equal(doc.toc[0].text, 'Memory Basics');
  assert.equal(doc.toc[1].level, 2);
  assert.equal(doc.toc[1].text, 'أساسيات المؤشرات في سي++');
  assert.ok(doc.toc[0].id.startsWith('sec-'));
  assert.ok(doc.toc[1].id.startsWith('sec-'));

  assert.equal(doc.codeBlocks.length, 1);
  assert.equal(doc.codeBlocks[0], 'int x = 42;\nint* ptr = &x;');
  assert.equal(doc.html.includes('data-copy-index="0"'), true);
  assert.equal(doc.html.includes('class="hljs language-cpp"'), true);
  assert.equal(doc.html.includes('hljs-keyword') || doc.html.includes('hljs-type'), true);
});

test('computeReadingStats and slugifyHeading handle Arabic and English text deterministically', () => {
  assert.deepEqual(computeReadingStats(''), { wordCount: 0, readingMinutes: 0 });
  const stats = computeReadingStats('word '.repeat(250) + '```cpp\nint a = 1;\n```');
  assert.equal(stats.wordCount, 250);
  assert.equal(stats.readingMinutes, 2);

  assert.equal(slugifyHeading('Hello World!', 1), 'sec-hello-world-1');
  assert.equal(slugifyHeading('هياكل البيانات', 2), 'sec-هياكل-البيانات-2');
});
