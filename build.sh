jshint src/ test/
mkdir -p dist/
echo "(function(window) {" > dist/synchronizer.js
cat vendor/kinto.dev.js vendor/fxsync-webcrypto.js >> dist/synchronizer.js
echo "})(window);" >> dist/synchronizer.js
