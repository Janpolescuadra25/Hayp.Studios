#!/bin/bash
# Refresh download/hayp.zip with the Task-16 rebrand fixes and remove stale vortex.zip
set -e
cd /home/z/my-project

STAGE=.zip-staging
rm -rf "$STAGE" && mkdir "$STAGE"

# Rebuild from the existing archive to keep its exact structure
unzip -q download/hayp.zip -d "$STAGE"

# Overlay the files changed in Task 16
cp src/components/hayp/hayp-landing-story.tsx "$STAGE/hayp/src/components/hayp/"
cp src/components/hayp/hayp-whatsnew.tsx      "$STAGE/hayp/src/components/hayp/"
cp src/components/hayp/hayp-hub.tsx           "$STAGE/hayp/src/components/hayp/"
cp worklog.md                                 "$STAGE/hayp/"

# Swap in the new archive
rm download/hayp.zip
( cd "$STAGE" && zip -qr ../download/hayp.zip hayp )
rm -rf "$STAGE"

# Drop the outdated Vortex-branded archive
rm -f download/vortex.zip

# Verify
echo "--- integrity ---"
unzip -t download/hayp.zip | tail -1
echo "--- counts ---"
echo "files in zip: $(unzip -l download/hayp.zip | rg -c 'hayp/')"
echo "vortex refs in zip source: $(unzip -p download/hayp.zip 'hayp/src/**' 2>/dev/null | rg -ci vortex || echo 0)"
echo "--- download dir ---"
ls -la download/
