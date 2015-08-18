//...
window.getSyncEngine = (function(window) {
  const REMOTE = 'http://localhost:8000/v1/';

  function getSyncEngine(collectionNames) {
    var synctoCredentials = {
      URL: REMOTE
    };
    return SyncCredentials.getAssertion().then(assertion => {
      synctoCredentials.assertion = assertion;
      return SyncCredentials.getXClientState();
    }).then(xClientState => {
      synctoCredentials.xClientState = xClientState;
      return SyncCredentials.getKeys();
    }).then(keys => {
      var syncEngine = new SyncEngine(synctoCredentials, collectionNames, keys.kB);
      return this._syncEngine.connect().then(() => {
        return syncEngine;
      });
    });
  }
  return getSyncEngine;
})(window);
