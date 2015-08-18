/* This Source Code Form is subject to the terms of the Mozilla Public
* License, v. 2.0. If a copy of the MPL was not distributed with this
* file, You can obtain one at http://mozilla.org/MPL/2.0/. */

indexedDB.deleteDatabase('syncto/history');

describe('SyncEngine', function() {
  describe('constructor', function() {
    it('constructs a SyncEngine object', function(done) {
      var se = new SyncEngine(window.fxSyncDataExample.synctoCredentials, ['history'], window.fxSyncDataExample.kB);
      chai.expect(se).to.be.an('object');
      chai.expect(se._fswc).to.be.an('object');
      chai.expect(se._kinto).to.be.an('object');
      chai.expect(se._collections).to.be.an('object');
      chai.expect(se._encryptedCollectionNames).to.be.instanceOf(Array);
      done();
    });
  });
  describe('connect', function() {
    it('obtains the bulk key bundle', function(done) {
      this.timeout(5000);
      var se = new SyncEngine(window.fxSyncDataExample.synctoCredentials, ['history'], window.fxSyncDataExample.kB);
      chai.expect(se.connect()).to.eventually.equal(undefined).
             and.notify(done);
    });
  });
  describe('syncNow', function() {
    it('syncs the encrypted collections', function(done) {
      this.timeout(10000);
      var se = new SyncEngine(window.fxSyncDataExample.synctoCredentials, ['history'], window.fxSyncDataExample.kB);
      se.connect().then(() => {
        return se.syncNow();
      }).then(() => {
        chai.expect(se._collections.history).to.be.an('object');
        return se._collections.history.list();
      }).then(list => {
        chai.expect(list).to.be.an('object');
        chai.expect(list.data).to.be.instanceOf(Array);
        chai.expect(list.data.length).to.be.greaterThan(0);
        chai.expect(list.data[0]).to.be.an('object');
        chai.expect(list.data[0].payload).to.be.an('object');
        chai.expect(list.data[0].payload.histUri).to.be.a('string');
        done(); 
      });
    });
  });
});
