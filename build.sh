jshint src/ test/
mkdir -p dist/
echo "(function(window) {" > dist/syncengine.js
cat vendor/kinto.dev.js vendor/fxsyncwebcrypto.js src/syncengine.js >> dist/syncengine.js
echo "})(window);" >> dist/syncengine.js
