/* This Source Code Form is subject to the terms of the Mozilla Public
* License, v. 2.0. If a copy of the MPL was not distributed with this
* file, You can obtain one at http://mozilla.org/MPL/2.0/. */

indexedDB.deleteDatabase('syncto/history');

function cloneObject(obj) {
  return JSON.parse(JSON.stringify(obj));
}

describe('test server on localhost:8000', function() {
  it('is running', function(done) {
    var xhr = new XMLHttpRequest();
    xhr.open('GET', 'http://localhost:8000/running', true);
    xhr.onload = function() {
      chai.expect(xhr.response).to.equal('yes');
      done();
    };
    xhr.send();
  });
});

describe('SyncEngine', function() {
  describe('constructor', function() {
    it('constructs a SyncEngine object', function(done) {
      var se = new SyncEngine(window.fxSyncDataExample.testServerCredentials);
      chai.expect(se).to.be.an('object');
      chai.expect(se._fswc).to.be.an('object');
      chai.expect(se._kinto).to.be.an('object');
      chai.expect(se._collections).to.be.an('object');
      chai.expect(se._adapters).to.be.an('object');
      done();
    });
  });
  describe('connect', function() {
    it('obtains the bulk key bundle', function(done) {
      this.timeout(5000);
      var se = new SyncEngine(window.fxSyncDataExample.testServerCredentials);
      chai.expect(se.connect()).to.eventually.equal(undefined).
             and.notify(done);
    });
    it('rejects its promise if syncto server not responding', function(done) {
      this.timeout(120000);
      var credentials = cloneObject(window.fxSyncDataExample.testServerCredentials);
      credentials.URL = 'http://example.com:24012/v1/';
      var se = new SyncEngine(credentials);
      se.connect().then(() => { console.log('connect success'); }, (err) => { console.log('connect reject', err); })
        .then(done);
    });
    it('rejects its promise if BrowserID assertion is wrong');
    it('rejects its promise if X-Client-State is wrong');
    it('rejects its promise if kB is wrong');
    it('rejects its promise if global/meta response status not a 200');
    it('rejects its promise if global/meta response body not JSON');
    it('rejects its promise if storageVersion wrong');
    it('rejects its promise if crypto/keys response status not a 200');
    it('rejects its promise if crypto/keys response body not JSON');
    it('rejects its promise if cryptoKeys not verified/not decrypted with kB');
  });
  describe('syncNow', function() {
    it('syncs the encrypted collections', function(done) {
      this.timeout(10000);
      var se = new SyncEngine(window.fxSyncDataExample.testServerCredentials);
      se.connect().then(() => {
        se.registerAdapter('history', HistoryAdapter);
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
    it('rejects its promise if meta/global response status is a 401', function(done) {
      //this.timeout(10000);
      var options = {
        URL: window.fxSyncDataExample.testServerCredentials.URL,
        assertion: window.fxSyncDataExample.testServerCredentials.assertion,
        xClientState: 'respond 401',
        kB: window.fxSyncDataExample.testServerCredentials.kB
      };
      var se = new SyncEngine(options);
      se.connect().then(function() {}, function(err) {
        chai.expect(err).to.be.instanceOf(SyncEngine.AuthError);
        done();
      });
    });
    it('rejects its promise if meta/global response is not JSON', function(done) {
      //this.timeout(10000);
      var options = {
        URL: window.fxSyncDataExample.testServerCredentials.URL,
        assertion: window.fxSyncDataExample.testServerCredentials.assertion,
        xClientState: 'respond 200',
        kB: window.fxSyncDataExample.testServerCredentials.kB
      };
      var se = new SyncEngine(options);
      se.connect().then(function() {}, function(err) {
        chai.expect(err).to.be.instanceOf(SyncEngine.UnrecoverableError);
        done();
      });
    });
    it('rejects its promise if kB is wrong', function(done) {
      //this.timeout(10000);
      var options = {
        URL: window.fxSyncDataExample.testServerCredentials.URL,
        assertion: window.fxSyncDataExample.testServerCredentials.assertion,
        xClientState: window.fxSyncDataExample.testServerCredentials.xClientState,
        kB: 'deadbeef'
      };
      var se = new SyncEngine(options);
      se.connect().then(function() {}, function(err) {
        chai.expect(err).to.be.instanceOf(SyncEngine.UnrecoverableError);
        done();
      });
    });
    it('rejects its promise if any record not verifiable/decryptable with Bulk Key Bundle', function(done) {
      //this.timeout(10000);
      var se = new SyncEngine(window.fxSyncDataExample.testServerCredentials);
      se.connect().then(() => {
        se.registerAdapter('schmistory', HistoryAdapter);
        return se.syncNow();
      }).then(() => {}, err => {
        chai.expect(err).to.be.instanceOf(SyncEngine.UnrecoverableError);
        done();
      });
    });
  });
});
