import test from 'node:test';
import assert from 'node:assert/strict';
import { matchRoute, normalizePath } from './router';

test('normalizePath trims slashes and isolates pathnames', () => {
  assert.equal(normalizePath(''), '/');
  assert.equal(normalizePath('/'), '/');
  assert.equal(normalizePath('/academic/'), '/academic');
  assert.equal(normalizePath('/projects?filter=all'), '/projects');
  assert.equal(normalizePath('about'), '/about');
});

test('matchRoute resolves top-level pages correctly', () => {
  assert.equal(matchRoute('/').routeName, 'home');
  assert.equal(matchRoute('/about').routeName, 'about');
  assert.equal(matchRoute('/academic').routeName, 'academic');
  assert.equal(matchRoute('/projects').routeName, 'projects');
  assert.equal(matchRoute('/notes').routeName, 'notes');
  assert.equal(matchRoute('/milestones').routeName, 'milestones');
  assert.equal(matchRoute('/connect').routeName, 'connect');
  assert.equal(matchRoute('/admin').routeName, 'admin');
  assert.equal(matchRoute('/admin/projects').routeName, 'admin');
});

test('matchRoute extracts route parameters for project-detail and note-detail', () => {
  const projectMatch = matchRoute('/projects/cpp-problem-solving');
  assert.equal(projectMatch.routeName, 'project-detail');
  assert.equal(projectMatch.params.id, 'cpp-problem-solving');

  const noteMatch = matchRoute('/notes/memory-management');
  assert.equal(noteMatch.routeName, 'note-detail');
  assert.equal(noteMatch.params.id, 'memory-management');
});

test('matchRoute handles unknown paths with not-found', () => {
  const notFound = matchRoute('/random-nonexistent-path');
  assert.equal(notFound.routeName, 'not-found');
});
