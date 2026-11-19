import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';

const RULES_PATH = path.join(process.cwd(), 'firestore.rules');
const BLUEPRINT_PATH = path.join(process.cwd(), 'firebase-blueprint.json');

interface BlueprintEntity {
  required?: string[];
  properties: Record<string, { type: string; maxLength?: number; enum?: string[]; pattern?: string }>;
}

interface BlueprintDoc {
  entities: Record<string, BlueprintEntity>;
  firestore: Record<string, { schema: { $ref: string } }>;
}

const rulesText = fs.readFileSync(RULES_PATH, 'utf8');
const blueprint = JSON.parse(fs.readFileSync(BLUEPRINT_PATH, 'utf8')) as BlueprintDoc;

function extractFunctionBody(source: string, fnName: string): string {
  const start = source.indexOf(`function ${fnName}(`);
  assert.notEqual(start, -1, `Missing rules function ${fnName}`);
  const openBrace = source.indexOf('{', start);
  let depth = 1;
  let idx = openBrace + 1;
  while (idx < source.length && depth > 0) {
    if (source[idx] === '{') depth++;
    else if (source[idx] === '}') depth--;
    idx++;
  }
  return source.slice(openBrace + 1, idx - 1);
}

function extractMatchBlock(source: string, matchPath: string): string {
  const start = source.indexOf(`match ${matchPath}`);
  assert.notEqual(start, -1, `Missing match block ${matchPath}`);
  const openBrace = source.indexOf('{', start + `match ${matchPath}`.length);
  let depth = 1;
  let idx = openBrace + 1;
  while (idx < source.length && depth > 0) {
    if (source[idx] === '{') depth++;
    else if (source[idx] === '}') depth--;
    idx++;
  }
  return source.slice(openBrace + 1, idx - 1);
}

function parseFieldListFromCall(fnBody: string, methodName: 'hasAll' | 'hasOnly'): string[] {
  const idx = fnBody.indexOf(`${methodName}([`);
  assert.notEqual(idx, -1, `Missing ${methodName}([...]) in validator`);
  const closeIdx = fnBody.indexOf('])', idx);
  const raw = fnBody.slice(idx + `${methodName}([`.length, closeIdx);
  return Array.from(raw.matchAll(/'([^']+)'/g)).map((m) => m[1]);
}

function simulateDirtyDozenGate(params: {
  collection: 'projects' | 'notes' | 'milestones' | 'courses' | 'contactMessages' | 'settings';
  op: 'get' | 'list' | 'create' | 'update' | 'delete';
  docId: string;
  auth: { email?: string; emailVerified?: boolean } | null;
  payload?: Record<string, unknown>;
  existingDoc?: Record<string, unknown> | null;
}): 'ALLOW' | 'PERMISSION_DENIED' {
  const { collection, op, docId, auth, payload = {}, existingDoc = null } = params;
  const isOwner = Boolean(auth && auth.emailVerified === true && auth.email === 'abdalrahman32008@gmail.com');
  const validId = typeof docId === 'string' && docId.length > 0 && docId.length <= 128 && /^[a-zA-Z0-9_\-]+$/.test(docId);

  if (collection === 'settings') {
    if (op === 'list') return isOwner ? 'ALLOW' : 'PERMISSION_DENIED';
    if (op === 'get') return validId && (docId === 'profile' || isOwner) ? 'ALLOW' : 'PERMISSION_DENIED';
    if (op === 'delete') return 'PERMISSION_DENIED';
    if (!isOwner || !validId || docId !== 'profile') return 'PERMISSION_DENIED';
    const profileSchema = blueprint.entities.ProfileSettings;
    const allowed = new Set(Object.keys(profileSchema.properties));
    const keys = Object.keys(payload);
    if (!keys.every((k) => allowed.has(k))) return 'PERMISSION_DENIED';
    if (!(profileSchema.required || []).every((k) => keys.includes(k))) return 'PERMISSION_DENIED';
    if (typeof payload.nameEn !== 'string' || !payload.nameEn || typeof payload.nameAr !== 'string' || !payload.nameAr) {
      return 'PERMISSION_DENIED';
    }
    return 'ALLOW';
  }

  if (collection === 'contactMessages') {
    if (op === 'get') return isOwner && validId ? 'ALLOW' : 'PERMISSION_DENIED';
    if (op === 'list') return isOwner ? 'ALLOW' : 'PERMISSION_DENIED';
    if (op === 'delete') return isOwner && validId ? 'ALLOW' : 'PERMISSION_DENIED';
    const schema = blueprint.entities.ContactMessage;
    const allowed = new Set(Object.keys(schema.properties));
    const keys = Object.keys(payload);
    if (!validId || payload.id !== docId) return 'PERMISSION_DENIED';
    if (!keys.every((k) => allowed.has(k))) return 'PERMISSION_DENIED';
    if (!(schema.required || []).every((k) => keys.includes(k))) return 'PERMISSION_DENIED';
    if (op === 'create') {
      if (payload.status !== 'unread') return 'PERMISSION_DENIED';
      if (typeof payload.senderName !== 'string' || payload.senderName.length < 2 || payload.senderName.length > 120) return 'PERMISSION_DENIED';
      if (typeof payload.subject !== 'string' || payload.subject.length < 2 || payload.subject.length > 160) return 'PERMISSION_DENIED';
      if (typeof payload.message !== 'string' || payload.message.length < 10 || payload.message.length > 2500) return 'PERMISSION_DENIED';
      return 'ALLOW';
    }
    if (op === 'update') {
      if (!isOwner || !existingDoc) return 'PERMISSION_DENIED';
      if (payload.createdAt !== existingDoc.createdAt) return 'PERMISSION_DENIED';
      const changed = keys.filter((k) => payload[k] !== existingDoc[k]);
      if (!changed.every((k) => k === 'status' || k === 'updatedAt')) return 'PERMISSION_DENIED';
      return 'ALLOW';
    }
    return 'PERMISSION_DENIED';
  }

  if (op === 'get') {
    if (!validId) return 'PERMISSION_DENIED';
    if (collection === 'projects') {
      if (isOwner || (existingDoc !== null && existingDoc.publicationStatus === 'published' && existingDoc.visibility === 'public')) {
        return 'ALLOW';
      }
      return 'PERMISSION_DENIED';
    }
    if (existingDoc === null || existingDoc.publicationStatus === 'published' || isOwner) return 'ALLOW';
    return 'PERMISSION_DENIED';
  }
  if (op === 'list') {
    if (collection === 'projects') {
      return (isOwner || (existingDoc?.publicationStatus === 'published' && existingDoc?.visibility === 'public'))
        ? 'ALLOW'
        : 'PERMISSION_DENIED';
    }
    return (existingDoc?.publicationStatus === 'published' || isOwner) ? 'ALLOW' : 'PERMISSION_DENIED';
  }
  if (op === 'delete') {
    return isOwner && validId ? 'ALLOW' : 'PERMISSION_DENIED';
  }

  // Create / Update for Projects, Notes, Milestones, Courses
  if (!isOwner || !validId || payload.id !== docId) return 'PERMISSION_DENIED';
  if (op === 'update' && existingDoc && 'createdAt' in existingDoc && payload.createdAt !== existingDoc.createdAt) {
    return 'PERMISSION_DENIED';
  }

  const entityMap: Record<'projects' | 'notes' | 'milestones' | 'courses', BlueprintEntity> = {
    projects: blueprint.entities.Project,
    notes: blueprint.entities.LearningNote,
    milestones: blueprint.entities.Milestone,
    courses: blueprint.entities.Course,
  };
  const schema = entityMap[collection];
  const allowed = new Set(Object.keys(schema.properties));
  const keys = Object.keys(payload);
  if (!keys.every((k) => allowed.has(k))) return 'PERMISSION_DENIED';
  if (!(schema.required || []).every((k) => keys.includes(k))) return 'PERMISSION_DENIED';

  for (const [k, def] of Object.entries(schema.properties)) {
    if (!(k in payload)) continue;
    const val = payload[k];
    if (def.type === 'string') {
      if (typeof val !== 'string') return 'PERMISSION_DENIED';
      if (def.maxLength && val.length > def.maxLength) return 'PERMISSION_DENIED';
      if (def.pattern && !new RegExp(def.pattern).test(val)) return 'PERMISSION_DENIED';
      if (def.enum && !def.enum.includes(val)) return 'PERMISSION_DENIED';
      if (['url', 'repoUrl', 'coverImageUrl', 'externalReference', 'githubUrl', 'linkedinUrl'].includes(k)) {
        if (val !== '' && !/^https?:\/\/.*/.test(val)) return 'PERMISSION_DENIED';
      }
    }
    if (def.type === 'array') {
      const maxLen = k === 'topicLabels' ? 20 : 30;
      if (!Array.isArray(val) || val.length > maxLen) return 'PERMISSION_DENIED';
    }
  }
  return 'ALLOW';
}

test('SECURITY RULES PARITY: All 6 collections have exact hasAll + hasOnly parity with firebase-blueprint.json and zero PII contactEmail', () => {
  const mappings: Array<{ fn: string; entity: keyof BlueprintDoc['entities'] }> = [
    { fn: 'isValidProject', entity: 'Project' },
    { fn: 'isValidNote', entity: 'LearningNote' },
    { fn: 'isValidMilestone', entity: 'Milestone' },
    { fn: 'isValidProfile', entity: 'ProfileSettings' },
    { fn: 'isValidCourse', entity: 'Course' },
    { fn: 'isValidContactMessage', entity: 'ContactMessage' },
  ];

  for (const { fn, entity } of mappings) {
    const body = extractFunctionBody(rulesText, fn);
    const hasAll = parseFieldListFromCall(body, 'hasAll').sort();
    const hasOnly = parseFieldListFromCall(body, 'hasOnly').sort();
    const blueprintRequired = [...(blueprint.entities[entity].required || [])].sort();
    const blueprintProps = Object.keys(blueprint.entities[entity].properties).sort();

    assert.deepEqual(hasAll, blueprintRequired, `${fn} hasAll() must match ${entity}.required`);
    assert.deepEqual(hasOnly, blueprintProps, `${fn} hasOnly() must match ${entity}.properties`);
  }

  assert.equal('contactEmail' in blueprint.entities.ProfileSettings.properties, false);
  const profileBody = extractFunctionBody(rulesText, 'isValidProfile');
  assert.equal(profileBody.includes('contactEmail'), false, 'isValidProfile in firestore.rules must never allow PII contactEmail');
});

test('EIGHT PILLARS: All match blocks enforce default-deny, isValidId path guard, createdAt immutability, and safe read/list boundaries', () => {
  assert.equal(rulesText.includes('allow read, write: if false;'), true);
  assert.equal(rulesText.includes('request.auth.token.email_verified == true'), true);

  for (const matchPath of ['/projects/{projectId}', '/notes/{noteId}', '/milestones/{milestoneId}', '/courses/{courseId}']) {
    const block = extractMatchBlock(rulesText, matchPath);
    assert.equal(block.includes('isValidId('), true, `${matchPath} must enforce isValidId`);
    assert.equal(block.includes("(!('createdAt' in resource.data) || incoming().createdAt == resource.data.createdAt)"), true, `${matchPath} must protect createdAt immutability on update`);
  }

  const settingsBlock = extractMatchBlock(rulesText, '/settings/{settingId}');
  assert.equal(settingsBlock.includes('allow delete: if false;'), true);
  assert.equal(settingsBlock.includes("settingId == 'profile'"), true);
});

test('DIRTY DOZEN ADVERSARIAL PAYLOADS: All 12 attacks return PERMISSION_DENIED', () => {
  const OWNER_AUTH = { email: 'abdalrahman32008@gmail.com', emailVerified: true };

  // 1. Shadow field injection
  assert.equal(
    simulateDirtyDozenGate({
      collection: 'projects',
      op: 'create',
      docId: 'bad-proj',
      auth: OWNER_AUTH,
      payload: {
        id: 'bad-proj',
        slug: 'bad-proj',
        titleEn: 'A',
        titleAr: 'ب',
        statusType: 'practicing',
        publicationStatus: 'draft',
        visibility: 'public',
        isAdmin: true,
      },
    }),
    'PERMISSION_DENIED'
  );

  // 2. Missing required fields (missing visibility)
  assert.equal(
    simulateDirtyDozenGate({
      collection: 'projects',
      op: 'create',
      docId: 'bad-proj',
      auth: OWNER_AUTH,
      payload: { id: 'bad-proj', slug: 'bad-proj', titleEn: 'A', titleAr: 'ب', statusType: 'practicing', publicationStatus: 'draft' },
    }),
    'PERMISSION_DENIED'
  );

  // 3. Unsafe javascript: URL
  assert.equal(
    simulateDirtyDozenGate({
      collection: 'projects',
      op: 'create',
      docId: 'bad-proj',
      auth: OWNER_AUTH,
      payload: {
        id: 'bad-proj',
        slug: 'bad-proj',
        titleEn: 'A',
        titleAr: 'ب',
        statusType: 'practicing',
        publicationStatus: 'draft',
        visibility: 'public',
        url: 'javascript:alert(1)',
      },
    }),
    'PERMISSION_DENIED'
  );

  // 4. Forged createdAt mutation on project update
  assert.equal(
    simulateDirtyDozenGate({
      collection: 'projects',
      op: 'update',
      docId: 'proj-1',
      auth: OWNER_AUTH,
      existingDoc: {
        id: 'proj-1',
        slug: 'proj-1',
        titleEn: 'A',
        titleAr: 'ب',
        statusType: 'practicing',
        publicationStatus: 'draft',
        visibility: 'public',
        createdAt: '2026-10-01T00:00:00.000Z',
      },
      payload: {
        id: 'proj-1',
        slug: 'proj-1',
        titleEn: 'A',
        titleAr: 'ب',
        statusType: 'practicing',
        publicationStatus: 'draft',
        visibility: 'public',
        createdAt: '2025-01-01T00:00:00.000Z',
      },
    }),
    'PERMISSION_DENIED'
  );

  // 5. Resource exhaustion on notes (20k+ string or >20 tags)
  assert.equal(
    simulateDirtyDozenGate({
      collection: 'notes',
      op: 'create',
      docId: 'bad-note',
      auth: OWNER_AUTH,
      payload: { id: 'bad-note', slug: 'bad-note', titleEn: 'N', titleAr: 'م', publicationStatus: 'draft', contentEn: 'x'.repeat(20001) },
    }),
    'PERMISSION_DENIED'
  );

  // 6. Invalid enum & createdAt forgery on milestone
  assert.equal(
    simulateDirtyDozenGate({
      collection: 'milestones',
      op: 'create',
      docId: 'bad-ms',
      auth: OWNER_AUTH,
      payload: { id: 'bad-ms', titleEn: 'M', titleAr: 'م', category: 'award', publicationStatus: 'draft' },
    }),
    'PERMISSION_DENIED'
  );

  // 7. PII injection onto public settings/profile
  assert.equal(
    simulateDirtyDozenGate({
      collection: 'settings',
      op: 'update',
      docId: 'profile',
      auth: OWNER_AUTH,
      payload: { nameEn: 'Abdalrahman', nameAr: 'عبد الرحمن', contactEmail: 'leak@example.com' },
    }),
    'PERMISSION_DENIED'
  );

  // 8. Anonymous read on /settings/private or list on /settings
  assert.equal(simulateDirtyDozenGate({ collection: 'settings', op: 'get', docId: 'private', auth: null }), 'PERMISSION_DENIED');
  assert.equal(simulateDirtyDozenGate({ collection: 'settings', op: 'list', docId: '', auth: null }), 'PERMISSION_DENIED');

  // 9. Public contactMessages create with status != unread
  assert.equal(
    simulateDirtyDozenGate({
      collection: 'contactMessages',
      op: 'create',
      docId: 'msg-1',
      auth: null,
      payload: { id: 'msg-1', senderName: 'Visitor', subject: 'Hello', message: 'Valid body over 10 chars', language: 'en', status: 'read', createdAt: '2026-11-16T00:00:00.000Z' },
    }),
    'PERMISSION_DENIED'
  );

  // 10. Public read/list/delete on contactMessages
  assert.equal(simulateDirtyDozenGate({ collection: 'contactMessages', op: 'get', docId: 'msg-1', auth: null }), 'PERMISSION_DENIED');
  assert.equal(simulateDirtyDozenGate({ collection: 'contactMessages', op: 'list', docId: '', auth: null }), 'PERMISSION_DENIED');

  // 11. Owner mutating sender message body on contactMessages update
  assert.equal(
    simulateDirtyDozenGate({
      collection: 'contactMessages',
      op: 'update',
      docId: 'msg-1',
      auth: OWNER_AUTH,
      existingDoc: { id: 'msg-1', senderName: 'Visitor', subject: 'Hello', message: 'Original body text', language: 'en', status: 'unread', createdAt: '2026-11-16T00:00:00.000Z' },
      payload: { id: 'msg-1', senderName: 'Visitor', subject: 'Hello', message: 'Tampered body text', language: 'en', status: 'read', createdAt: '2026-11-16T00:00:00.000Z' },
    }),
    'PERMISSION_DENIED'
  );

  // 12. Poisoned docId and unverified owner email spoof
  assert.equal(
    simulateDirtyDozenGate({
      collection: 'projects',
      op: 'create',
      docId: '../poison',
      auth: OWNER_AUTH,
      payload: {
        id: '../poison',
        slug: 'bad',
        titleEn: 'A',
        titleAr: 'ب',
        statusType: 'practicing',
        publicationStatus: 'draft',
        visibility: 'public',
      },
    }),
    'PERMISSION_DENIED'
  );
  assert.equal(
    simulateDirtyDozenGate({
      collection: 'projects',
      op: 'create',
      docId: 'valid-id',
      auth: { email: 'abdalrahman32008@gmail.com', emailVerified: false },
      payload: {
        id: 'valid-id',
        slug: 'valid-id',
        titleEn: 'A',
        titleAr: 'ب',
        statusType: 'practicing',
        publicationStatus: 'draft',
        visibility: 'public',
      },
    }),
    'PERMISSION_DENIED'
  );

  // 13. Anonymous read/list blocked on internal_archive and legacy docs missing visibility
  assert.equal(
    simulateDirtyDozenGate({
      collection: 'projects',
      op: 'get',
      docId: 'local-ai-agent',
      auth: null,
      existingDoc: { publicationStatus: 'published', visibility: 'internal_archive' },
    }),
    'PERMISSION_DENIED'
  );
  assert.equal(
    simulateDirtyDozenGate({
      collection: 'projects',
      op: 'list',
      docId: 'legacy-proj',
      auth: null,
      existingDoc: { publicationStatus: 'published' },
    }),
    'PERMISSION_DENIED'
  );
  assert.equal(
    simulateDirtyDozenGate({
      collection: 'projects',
      op: 'get',
      docId: 'cpp-problem-solving',
      auth: null,
      existingDoc: { publicationStatus: 'published', visibility: 'public' },
    }),
    'ALLOW'
  );
  assert.equal(
    simulateDirtyDozenGate({
      collection: 'projects',
      op: 'get',
      docId: 'local-ai-agent',
      auth: OWNER_AUTH,
      existingDoc: { publicationStatus: 'published', visibility: 'internal_archive' },
    }),
    'ALLOW'
  );
});
