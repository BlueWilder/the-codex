#!/usr/bin/env bash
# Advisory Git sync check.
# Compares the local `main` branch with the connected GitHub remote and reports
# whether Replit and GitHub are in sync, ahead, behind, or diverged.
#
# This check is INFORMATIONAL: it always exits 0 so it never blocks task
# completion. Its job is to surface a clear push/pull reminder after every task
# so the Replit workspace and the GitHub repo never silently drift apart
# (important when collaborating through an external tool like Claude Co-Work).

set -uo pipefail

GIT="git --no-optional-locks"

# Find the GitHub remote (its URL contains github.com).
# Prefer "origin" when it points at GitHub; otherwise use the first GitHub remote.
if $GIT remote get-url origin 2>/dev/null | grep -q 'github\.com'; then
  REMOTE="origin"
else
  REMOTE=$($GIT remote -v | awk '/github\.com/ {print $1; exit}')
fi

if [ -z "${REMOTE:-}" ]; then
  echo "GIT SYNC: no GitHub remote configured — nothing to check."
  exit 0
fi

# Bail out clearly if there is no local main branch to compare against.
LOCAL_SHA=$($GIT rev-parse main 2>/dev/null)
if [ -z "${LOCAL_SHA:-}" ]; then
  echo "GIT SYNC: no local 'main' branch found — skipping sync check."
  exit 0
fi

REMOTE_URL=$($GIT remote get-url "$REMOTE" 2>/dev/null)
REMOTE_SHA=$($GIT ls-remote "$REMOTE" refs/heads/main 2>/dev/null | awk '{print $1}')

echo "GitHub remote : $REMOTE_URL"
echo "Local  main   : ${LOCAL_SHA:-unknown}"
echo "GitHub main   : ${REMOTE_SHA:-unknown}"
echo ""

if [ -z "${REMOTE_SHA:-}" ]; then
  echo "GIT SYNC: could not read GitHub main (no network, or no main branch yet)."
  exit 0
fi

if [ "$LOCAL_SHA" = "$REMOTE_SHA" ]; then
  echo "GIT SYNC: [IN SYNC] Replit and GitHub match. Nothing to do."
  exit 0
fi

# If GitHub's commit exists locally we can measure the exact ahead/behind gap.
if $GIT cat-file -e "$REMOTE_SHA" 2>/dev/null; then
  AHEAD=$($GIT rev-list --count "$REMOTE_SHA"..main 2>/dev/null)
  BEHIND=$($GIT rev-list --count main.."$REMOTE_SHA" 2>/dev/null)
  if [ "${BEHIND:-0}" = "0" ] && [ "${AHEAD:-0}" != "0" ]; then
    echo "GIT SYNC: [PUSH NEEDED] Replit is AHEAD by $AHEAD commit(s)."
    echo "          Open the Git pane and click Push to update GitHub."
  elif [ "${AHEAD:-0}" = "0" ] && [ "${BEHIND:-0}" != "0" ]; then
    echo "GIT SYNC: [PULL NEEDED] GitHub is AHEAD by $BEHIND commit(s)."
    echo "          Open the Git pane and click Pull to update Replit."
  else
    echo "GIT SYNC: [DIVERGED] Replit ahead $AHEAD, GitHub ahead $BEHIND."
    echo "          Reconcile (pull, resolve, then push) before continuing."
  fi
else
  echo "GIT SYNC: [OUT OF SYNC] GitHub main is not in local history."
  echo "          GitHub likely has commits Replit doesn't yet have."
  echo "          Open the Git pane and click Pull to update Replit."
fi

exit 0
