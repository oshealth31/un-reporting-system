#!/bin/sh
# Downloads IBM Plex Sans, IBM Plex Mono and Schibsted Grotesk (SIL Open Font License)
# into src/fonts so the build can serve them from this site. Needs internet and npm.
set -e
REPO=$(cd "$(dirname "$0")/.." && pwd)
TMP=$(mktemp -d)
cd "$TMP"
npm init -y >/dev/null
npm install --no-audit --no-fund @fontsource/ibm-plex-sans @fontsource/ibm-plex-mono @fontsource/schibsted-grotesk
mkdir -p "$REPO/src/fonts"
for spec in "ibm-plex-sans 400 500 600" "ibm-plex-mono 400 500" "schibsted-grotesk 500 700"; do
  set -- $spec; pkg=$1; shift
  for w in "$@"; do
    cp "node_modules/@fontsource/$pkg/files/$pkg-latin-$w-normal.woff2" "$REPO/src/fonts/"
  done
done
rm -rf "$TMP"
echo "Fonts copied to src/fonts. Now run: npm run build"
