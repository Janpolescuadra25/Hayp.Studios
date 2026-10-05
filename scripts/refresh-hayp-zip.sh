#!/bin/bash
# Refresh download/hayp.zip with the Task-18 Qyra product-link changes
set -e
cd /home/z/my-project

STAGE=.zip-staging
rm -rf "$STAGE" && mkdir "$STAGE"
unzip -q download/hayp.zip -d "$STAGE"

# Overlay files changed in Task 18
cp src/components/hayp/hayp-hub.tsx "$STAGE/hayp/src/components/hayp/"
cp src/lib/hayp-data.ts             "$STAGE/hayp/src/lib/"
cp worklog.md                       "$STAGE/hayp/"

rm download/hayp.zip
( cd "$STAGE" && zip -qr ../download/hayp.zip hayp )
rm -rf "$STAGE"

echo "--- integrity ---"
unzip -t download/hayp.zip | tail -1
echo "files: $(unzip -l download/hayp.zip | rg -c 'hayp/')"
echo "vortex refs in src: $(unzip -p download/hayp.zip 'hayp/src/*' 2>/dev/null | rg -ci vortex || echo 0)"
ls -la download/
