/* This Source Code Form is subject to the terms of the Mozilla Public
* License, v. 2.0. If a copy of the MPL was not distributed with this
* file, You can obtain one at http://mozilla.org/MPL/2.0/. */

indexedDB.deleteDatabase('syncto/history');

describe('SyncEngine', function() {
  describe('constructor', function() {
    it('constructs a SyncEngine object', function() {
      var se = new SyncEngine(window.fxSyncDataExample.synctoCredentials, ['history'], window.fxSyncDataExample.kB);
      se.connect().then(() => {
        return se.syncNow();
      }).then(() => {
        return se._collections.history.list();
      }).then((list) => {
        console.log('history records', list);
      });
    });
  });
});
