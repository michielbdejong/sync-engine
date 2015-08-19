// This code is just to establish an API for the example-adapter.
// Make sure to update the 'assertion' and 'xClientState' fields
// in test/fixture.js to make this work,
// because of https://github.com/michielbdejong/synchronizer-app/issues/9

window.Synchronizer = {
  _adapters: {},
  registerAdapter: function(collectionName, adapter) {
    this._adapters[collectionName] = adapter;
  },
  syncCycle: function() {
    var se = new SyncEngine(window.fxSyncDataExample.synctoCredentials, ['history'], window.fxSyncDataExample.kB);
    se.connect().then(() => {
      return se.syncNow();
    }).then(() => {
      this._adapters.history.update(se._collections.history);
    });
  }
};
