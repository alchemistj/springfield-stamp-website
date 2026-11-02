#!/usr/bin/env bash
# Rebuilds the self-hosted WOFF2 subsets in src/assets/fonts/ from the original font files.
# Needs: pip install fonttools brotli. Not part of the build (the WOFF2 files are committed).
# Usage: scripts/reference/subset-fonts.sh <dir with Hoarse.ttf, muli-latin.woff2, poppins-*.woff2>
set -euo pipefail
SRC="${1:?source dir}"
OUT="$(dirname "$0")/../../src/assets/fonts"
mkdir -p "$OUT"
# Basic Latin + the punctuation the copy uses (curly quotes, dashes, ellipsis, bullet, nbsp, copyright).
U="U+0020-007E,U+00A0,U+00A9,U+2013,U+2014,U+2018,U+2019,U+201C,U+201D,U+2022,U+2026"
pyftsubset "$SRC/Hoarse.ttf" --unicodes="U+0020-007E,U+2013,U+2014,U+2019,U+2026" --flavor=woff2 --no-hinting --desubroutinize --layout-features='kern' --output-file="$OUT/hoarse-rough-02.woff2"
for w in 400 500 600 700; do
  pyftsubset "$SRC/poppins-$w.woff2" --unicodes="$U" --flavor=woff2 --layout-features='kern' --output-file="$OUT/poppins-$w.woff2"
done
pyftsubset "$SRC/muli-latin.woff2" --unicodes="$U" --flavor=woff2 --layout-features='kern' --output-file="$OUT/muli-var.woff2"
ls -l "$OUT"
