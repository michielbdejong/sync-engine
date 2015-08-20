var syncEngine = new SyncEngine(window.fxSyncDataExample.synctoCredentials);

document.querySelector('#sync-now').disabled = true;

document.querySelector('#connect').onclick = function() {
  syncEngine.connect().then(() = {
    syncEngine.registerAdapter('history', new HistoryAdapter());
    document.querySelector('#sync-now').disabled = false;
  }, function(err) {
    window.alert(err);
  });
};

document.querySelector('#sync-now').onclick = function() {
  document.querySelector('#sync-now').disabled = true;
  syncEngine.syncNow().then(() => {
    document.querySelector('#sync-now').disabled = true;
  });
};
