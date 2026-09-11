#!/usr/bin/env bash
#
# Build the production image for the VPS and push it to Docker Hub.
#
# The version you pass (patch / minor / major) is the Docker tag, e.g.
# muradkamali/smartmove:1.3.1. package.json is kept in step so the next
# bump starts from whatever is on Hub. This does not create a git tag, so
# it will not publish to GHCR.
#
#   ./deploy/release.sh              # asks patch / minor / major
#   ./deploy/release.sh patch        # 1.3.0 -> 1.3.1
#   ./deploy/release.sh minor        # 1.3.0 -> 1.4.0
#   ./deploy/release.sh major        # 1.3.0 -> 2.0.0
#
# Then on the VPS:
#
#   cd ~/smartmove && ./update.sh 1.3.1
#
# Override the Hub repo or the public URL with IMAGE_REPO / NEXT_PUBLIC_SITE_URL.

set -euo pipefail

ROOT="$(git rev-parse --show-toplevel)"
cd "$ROOT"

IMAGE_REPO="${IMAGE_REPO:-muradkamali/smartmove}"
PLATFORM="${DOCKER_PLATFORM:-linux/amd64}"
SITE_URL="${NEXT_PUBLIC_SITE_URL:-https://smartmove4u.muradsprojects.co.uk}"
BUMP=""

usage() {
  sed -n '2,20p' "$0" | sed 's/^# \?//'
  exit "${1:-0}"
}

for arg in "$@"; do
  case "$arg" in
    -h | --help) usage 0 ;;
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
  echo "  Image: $IMAGE_REPO:$current"
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

if [[ -n "$(git status --porcelain)" ]]; then
  echo "Working tree is dirty. Commit or stash first so the image is exactly what you meant to ship." >&2
  git status --short >&2
  exit 1
fi

if ! command -v docker >/dev/null 2>&1; then
  echo "Docker is not on PATH." >&2
  exit 1
fi

pnpm version "$BUMP" --no-git-tag-version >/dev/null
actual="$(node -p "require('./package.json').version")"
if [[ "$actual" != "$version" ]]; then
  echo "pnpm wrote $actual, expected $version." >&2
  git checkout -- package.json
  exit 1
fi

revert_version() {
  git checkout -- package.json
}

trap revert_version ERR

echo
echo "Building $IMAGE_REPO:$version ($PLATFORM) and pushing to Docker Hub..."
echo "Site URL baked into the bundle: $SITE_URL"

docker buildx build \
  --platform "$PLATFORM" \
  --target runner \
  --build-arg "NEXT_PUBLIC_SITE_URL=$SITE_URL" \
  --build-arg "NEXT_PUBLIC_ANALYTICS_PROVIDER=${NEXT_PUBLIC_ANALYTICS_PROVIDER:-}" \
  --build-arg "NEXT_PUBLIC_ANALYTICS_ID=${NEXT_PUBLIC_ANALYTICS_ID:-}" \
  --build-arg "NEXT_PUBLIC_PLAUSIBLE_HOST=${NEXT_PUBLIC_PLAUSIBLE_HOST:-}" \
  --build-arg "NEXT_PUBLIC_TURNSTILE_SITE_KEY=${NEXT_PUBLIC_TURNSTILE_SITE_KEY:-}" \
  --tag "$IMAGE_REPO:$version" \
  --tag "$IMAGE_REPO:latest" \
  --push \
  .

trap - ERR

git add package.json
git commit -m "Bump version to $version"

branch="$(git rev-parse --abbrev-ref HEAD)"
git push origin "$branch"

echo
echo "Pushed $IMAGE_REPO:$version and $IMAGE_REPO:latest"
echo
echo "On the VPS:"
echo "  cd ~/smartmove && ./update.sh $version"
echo
echo "If update.sh is not on the server, set APP_IMAGE=$IMAGE_REPO:$version"
echo "in .env.production, then:"
echo "  docker compose --env-file .env.production pull"
echo "  docker compose --env-file .env.production up -d"
