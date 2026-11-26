# Firestore indexes and rules audit

Audit of every Firestore query in `src/` (all of them live in `src/services/contentRepository.ts`).

## Queries found

| Collection | Query | Filters | orderBy | Needs a composite index? |
| --- | --- | --- | --- | --- |
| projects | list public | publicationStatus == published, visibility == public | none | No |
| projects | by slug | publicationStatus == published, visibility == public, slug == X | none | No |
| projects | any public (limit 1) | publicationStatus == published, visibility == public | none | No |
| notes | list | publicationStatus == published | none | No |
| notes | by slug / any (limit 1) | publicationStatus == published, slug == X | none | No |
| milestones | list | publicationStatus == published | none | No |
| courses | list | publicationStatus == published | none | No |

No collection-group queries. No `orderBy` anywhere: results are sorted in the client
(`sortRecordsDeterministically`).

## Result

Every query uses only equality filters on different fields. Firestore answers these with
its automatic single-field indexes (index merging), so **no composite index is required**
for the current code. A composite index becomes necessary only if a query adds a range
filter, `!=`, `in` combined with other fields, or an `orderBy` on a different field than
the filters. Add the index in `firestore.indexes.json` at the same time as such a query.

`firestore.indexes.json` already lists three composite indexes (projects x2, notes x1).
They are not needed by the current queries. They are harmless but cost storage and write
time once deployed. They are left unchanged in this change so nothing is removed from the
live project by surprise. Decide separately whether to drop them.

## Rules check

Each public query constrains the same fields the rules require, so rules will accept it:

- `projects` list rule needs publicationStatus == published AND visibility == public. All
  three project queries filter on both.
- `notes`, `milestones`, `courses` list rules need publicationStatus == published. All
  their queries filter on it.

## What this change adds

`firebase.json` pointing at `firestore.rules` and `firestore.indexes.json`. The repo had no
`firebase.json`, so `firebase deploy --only firestore` could not find either file.

Nothing here has been deployed. Deploying rules or indexes to the live project needs the
owner's approval.
