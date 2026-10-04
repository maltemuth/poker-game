#!/bin/sh
# Downloads real hand histories to check the rules against, into
# hand-histories/, which git ignores.
#
# The hands come from the PHH dataset of the University of Toronto Computer
# Poker Student Research Group (https://github.com/uoftcprg/phh-dataset,
# MIT; also on Zenodo under CC BY 4.0): anonymized online no-limit hold'em
# hands from July 2009, in the Poker Hand History format
# (https://github.com/uoftcprg/phh-std). Each file has about 1,000 hands.
#
# The download is pinned to one commit of the dataset, and every file is
# checked against its git blob hash. Files already downloaded are kept.
# Add more files to FILES as "<blob hash> <path in the dataset>".

set -eu

COMMIT=e47fbd5816372360bade4de5d712346fe1bb70f6
BASE="https://raw.githubusercontent.com/uoftcprg/phh-dataset/$COMMIT"
TARGET="$(dirname "$0")/../hand-histories"

FILES="
264feaa7858641b8a67466f29ea4d060695ff283 data/handhq/ABS-2009-07-01_2009-07-23_1000NLH_OBFU/10/abs NLH handhq_1-OBFUSCATED.phhs
"

mkdir -p "$TARGET"
echo "$FILES" | while read -r hash path; do
  [ -n "$hash" ] || continue
  file="$TARGET/$(basename "$path")"
  if [ -f "$file" ] && [ "$(git hash-object "$file")" = "$hash" ]; then
    echo "have $(basename "$path")"
    continue
  fi
  url="$BASE/$(printf '%s' "$path" | sed 's/ /%20/g')"
  curl --fail --silent --show-error --location --output "$file.part" "$url"
  actual="$(git hash-object "$file.part")"
  if [ "$actual" != "$hash" ]; then
    rm "$file.part"
    echo "$(basename "$path"): expected blob $hash, got $actual" >&2
    exit 1
  fi
  mv "$file.part" "$file"
  echo "got $(basename "$path")"
done
