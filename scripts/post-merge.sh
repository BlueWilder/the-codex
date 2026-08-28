#!/bin/bash
set -e

npm install

# Only run db:push when this merge actually changed the Drizzle schema.
#
# `shared/schema.ts` re-exports `shared/models/` (which defines the sessions and
# users tables), so BOTH paths must be watched. Gating on schema.ts alone would
# silently skip auth table changes.
#
# ORIG_HEAD is set by a merge; HEAD@{1} is the reflog fallback in case the
# merge path does not set it.
CHANGED=$(git diff --name-only ORIG_HEAD HEAD -- shared/schema.ts shared/models/ 2>/dev/null \
  || git diff --name-only 'HEAD@{1}' HEAD -- shared/schema.ts shared/models/ 2>/dev/null \
  || true)

if [ -z "$CHANGED" ]; then
  echo "post-merge: no schema change in this merge, skipping db:push"
  exit 0
fi

echo "post-merge: schema changed in this merge:"
echo "$CHANGED" | sed 's/^/  /'
npm run db:push
