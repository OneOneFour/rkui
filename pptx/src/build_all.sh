#!/bin/sh
# Builds everything from the repo's tokens. Usage: sh src/build_all.sh <repo>
set -e
REPO="$1"
ROOT="$(cd "$(dirname "$0")/.." && pwd)"
PY="$ROOT/.venv/bin/python"
cd "$ROOT"
node src/resolve-tokens.mjs "$REPO" build/tokens.json
"$PY" -I src/build_fonts.py downloads/fonts downloads/jbm out/fonts
"$PY" -I src/bake_icons.py "$REPO" build/tokens.json out/icons
"$PY" src/build_template.py build
"$PY" src/build_sample.py "$REPO" build/rk-toon-base.pptx build/rk-toon-sample.pptx
"$PY" src/validate.py downloads/xsd build/rk-toon-sample.pptx build/rk-toon.potx build/rk-toon.thmx build/rk-toon-dark.thmx build/rk-toon-dark-colour.thmx
cp build/rk-toon.potx build/rk-toon-sample.pptx build/rk-toon.thmx build/rk-toon-dark.thmx build/rk-toon-dark-colour.thmx out/
"$PY" src/preview.py out/rk-toon-sample.pptx build/preview
cp build/preview/contact-sheet.png out/preview-contact-sheet.png
"$PY" src/reference_sheet.py out/fonts out/reference
cp build/tokens.json out/tokens.json
"$PY" src/build_handoff.py "$ROOT"
