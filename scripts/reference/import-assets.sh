#!/usr/bin/env bash
# One-off helper that was used to copy the WordPress uploads into src/assets/ (lowercase,
# underscores to hyphens, year folders dropped, exact duplicates skipped). Kept for provenance.
# Usage: scripts/reference/import-assets.sh <dir with the wp-content/uploads tree>
set -euo pipefail
SRC="${1:?uploads dir}"
OUT="$(cd "$(dirname "$0")/../.." && pwd)/src/assets"
mkdir -p "$OUT"
SKIP="2024/10/Address-Stamps.jpg 2024/10/springfield-stamps4.jpg 2024/10/springfield-logo-magnetic-tags-2.png 2024/10/Self-Inking-Stamps.webp 2024/10/springfield-stamp-Logo-Stamp_2.webp 2024/10/desk-name-plate-1.webp 2024/10/springfield-stamps-mobile.webp"
cd "$SRC"
find . -type f \( -name '*.png' -o -name '*.jpg' -o -name '*.jpeg' -o -name '*.webp' \) | sed 's#^\./##' | sort | while read -r f; do
  skip=0
  for s in $SKIP; do [ "$f" = "$s" ] && skip=1; done
  [ "$skip" = 1 ] && continue
  base="$(basename "$f" | tr 'A-Z_' 'a-z-')"
  cp "$f" "$OUT/$base"
done
cp "$SRC/2024/03/make-your-mark-2.jpg" "$OUT/make-your-mark-wide.jpg"  # name collision with make-your-mark_2.jpg
ls "$OUT"
