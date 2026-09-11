#!/usr/bin/env bash
#
# Publish a production image from your machine. Does not SSH to the VPS.
#
# Bumps package.json, commits, tags vX.Y.Z, and pushes. GitHub Actions then
# builds linux/amd64 and publishes to ghcr.io/murad-code/smartmove (the git
# tag keeps the v; the image tag does not).
#
#   ./deploy/release.sh              # asks patch / minor / major
#   ./deploy/release.sh patch        # 1.2.0 -> 1.2.1  bugfix, styling
#   ./deploy/release.sh minor        # 1.2.0 -> 1.3.0  new feature
#   ./deploy/release.sh major        # 1.2.0 -> 2.0.0  breaking
#   ./deploy/release.sh patch --no-watch
#
# Then on the VPS, after the Action is green:
#
#   ssh you@vps 'cd /opt/smartmove && ./update.sh 1.2.1'

set -euo pipefail

ROOT="$(git rev-parse --show-toplevel)"
cd "$ROOT"

WATCH=1
BUMP=""

usage() {
  sed -n '2,18p' "$0" | sed 's/^# \?//'
  exit "${1:-0}"
}

for arg in "$@"; do
  case "$arg" in
    -h | --help) usage 0 ;;
    --no-watch) WATCH=0 ;;
    --watch) WATCH=1 ;;
    patch | minor | major) BUMP="$arg" ;;
    *)
      echo "Unknown argument: $arg" >&2
      usage 1
      ;;
  esac
done

current="$(node -p "require('./package.json').version")"

next_version() {
  local kind="$1"
  local major minor patch
  IFS=. read -r major minor patch <<<"$current"
  case "$kind" in
    patch) echo "$major.$minor.$((patch + 1))" ;;
    minor) echo "$major.$((minor + 1)).0" ;;
    major) echo "$((major + 1)).0.0" ;;
  esac
}

if [[ -z "$BUMP" ]]; then
  if [[ ! -t 0 ]]; then
    echo "Pass patch, minor, or major when stdin is not a terminal." >&2
    usage 1
  fi
  echo "Current version: $current"
  echo "  patch  -> $(next_version patch)   bugfix, animation, copy, styling"
  echo "  minor  -> $(next_version minor)   new feature the owner would notice"
  echo "  major  -> $(next_version major)   breaking (env, deploy, data)"
  read -r -p "Bump type [patch]: " BUMP
  BUMP="${BUMP:-patch}"
fi

case "$BUMP" in
  patch | minor | major) ;;
  *)
    echo "Bump type must be patch, minor, or major (got '$BUMP')." >&2
    exit 1
    ;;
esac

version="$(next_version "$BUMP")"
tag="v$version"

if [[ -n "$(git status --porcelain)" ]]; then
  echo "Working tree is dirty. Commit or stash first so the tag is exactly what you meant to ship." >&2
  git status --short >&2
  exit 1
fi

if git rev-parse "$tag" >/dev/null 2>&1; then
  echo "Tag $tag already exists locally." >&2
  exit 1
fi

git fetch origin --tags --quiet
if git ls-remote --exit-code --tags origin "refs/tags/$tag" >/dev/null 2>&1; then
  echo "Tag $tag already exists on origin." >&2
  exit 1
fi

branch="$(git rev-parse --abbrev-ref HEAD)"
if [[ "$branch" == "HEAD" ]]; then
  echo "Detached HEAD. Check out a branch before releasing." >&2
  exit 1
fi

if git rev-parse --abbrev-ref '@{u}' >/dev/null 2>&1; then
  if [[ -n "$(git log 'HEAD..@{u}' --oneline)" ]]; then
    echo "Local $branch is behind the remote. Pull (or rebase) before releasing." >&2
    exit 1
  fi
fi

pnpm version "$BUMP" --no-git-tag-version >/dev/null
actual="$(node -p "require('./package.json').version")"
if [[ "$actual" != "$version" ]]; then
  echo "pnpm wrote $actual, expected $version." >&2
  exit 1
fi

git add package.json
git commit -m "Bump version to $version"
git tag "$tag"

git push origin "$branch"
git push origin "$tag"
sha="$(git rev-parse "$tag")"

echo
echo "Published $tag. Image tag (no v): ghcr.io/murad-code/smartmove:$version"
echo "Watch: https://github.com/Murad-code/smartmove/actions"
echo
echo "On the VPS, after the Action is green:"
echo "  ssh you@vps 'cd /opt/smartmove && ./update.sh $version'"

if [[ "$WATCH" -eq 1 ]] && command -v gh >/dev/null 2>&1; then
  echo
  echo "Waiting for the Release workflow..."
  # The tag push takes a moment to become a run.
  run_id=""
  for _ in $(seq 1 20); do
    run_id="$(
      gh run list --workflow=release.yml --limit 5 --json databaseId,headSha \
        --jq "[.[] | select(.headSha == \"$sha\")][0].databaseId // empty"
    )"
    if [[ -n "$run_id" ]]; then
      break
    fi
    sleep 3
  done
  if [[ -z "$run_id" ]]; then
    echo "No Release run found yet. Check the Actions tab." >&2
    exit 0
  fi
  gh run watch "$run_id" --exit-status
  echo
  echo "Image is on GHCR. Pull it on the VPS with:"
  echo "  ssh you@vps 'cd /opt/smartmove && ./update.sh $version'"
fi
