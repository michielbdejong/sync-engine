jshint src/ test/
mkdir -p dist/
echo "(function(window) {" > dist/sync-engine.js
cat vendor/kinto.dev.js vendor/fxsync-webcrypto.js src/sync-engine.js >> dist/sync-engine.js
echo "})(window);" >> dist/sync-engine.js
