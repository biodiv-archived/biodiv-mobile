#!/bin/bash -v

set -e

# Pre-build Commands
npm run decrypt-assets
npm run licenses

# Build Ionic App for Android
ionic cordova platform add android --nofetch
ionic cordova build android --prod --release
