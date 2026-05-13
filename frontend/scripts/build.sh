#!/bin/bash
set -e

if [ "$VERCEL_ENV" = "preview" ] && [ -n "$VERCEL_GIT_COMMIT_REF" ]; then
  BRANCH_SLUG=$(echo "$VERCEL_GIT_COMMIT_REF" \
    | tr '[:upper:]' '[:lower:]' \
    | sed 's/[^a-z0-9]/-/g' \
    | sed 's/--*/-/g' \
    | sed 's/^-//' \
    | sed 's/-$//')
  export VITE_API_URL="https://sigecon-back-git-${BRANCH_SLUG}-heitor-polidoros-projects.vercel.app/api/v1"
  echo "Preview build pointing to: $VITE_API_URL"
fi

npm run build
