#!/bin/bash -v

set -e

if [[ "$TRAVIS_BRANCH" != "master" ]]
then
    echo "Skipping package Android for development branch"
    exit
fi

mkdir -p output
cp platforms/android/app/build/outputs/apk/release/app-release.apk output/ibp.apk
