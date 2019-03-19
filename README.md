# Biodiversity Mobile

This is a reposotory for the mobile app associated with the biodiversity informatics platform.

[![IBP on Google Play](https://play.google.com/intl/en_us/badges/images/badge_new.png)](http://play.google.com/store/apps/details?id=com.mobisys.android.ibp)

![Build Status on Travis CI](https://api.travis-ci.org/strandls/biodiv-mobile.svg?branch=master)

## 🔧 Prerequisites

1. Install [Node.js](https://nodejs.org/)
2. Setup android development environment

## 🚀 Quick start

```sh
git clone https://github.com/strandls/biodiv-mobile   # Clone Repository
npm install -g ionic cordova                          # Install Ionic and Cordova Globally
npm install                                           # Install Dependencies
npm run decrypt-assets
# above command is required for IBP Mobile development only
# to decrypt config and signing assets locally
# otherwise modify `src/environments/environment.sample.ts`
# and create `build.json` if you want automatic signing for more see https://bit.ly/2VEABgE
ionic serve                                           # Start development environment
```

## 🚢 Building

```sh
ionic cordova build android/ios # add --prod --release flag for building production apk
```

## Bugs and Issues

Have a bug or an issue with this template? [Open a new issue](https://github.com/strandls/biodiv-mobile/issues) here on Github.

## Copyright and License

Copyright 2019 Strand Strand Life Sciences Private Limited. Code released under the [Apache 2.0](https://github.com/strandls/biodiv-mobile/blob/master/LICENSE) license.
