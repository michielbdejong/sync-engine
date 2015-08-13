// /* global SettingsHelper */
// /* global LazyLoader */

'use strict';

//const REMOTE = 'http://1625dd81.ngrok.io/v1/';
const REMOTE = 'http://localhost:8000/v1/';

//function toCamelCase(str) {
//  var rdashes = /-(.)/g;
//  return str.replace(rdashes, (str, p1) => {
//    return p1.toUpperCase();
//  });
//}

var IAC = {
  _ports: {},

  connect: function(portName) {
    if (this._ports[portName]) {
      return Promise.resolve(this._ports[portName]);
    }

    return new Promise((resolve, reject) => {
      navigator.mozApps.getSelf().onsuccess = event => {
        var app = event.target.result;
        app.connect(portName).then(ports => {
          if (!ports || !ports.length) {
            return reject();
          }
          this._ports[portName] = ports[0];
          resolve(this._ports[portName]);
        }).catch(reject);
      };
    });
  },

  request: function(portName, message) {
    return new Promise((resolve, reject) => {
      message.id = Date.now();

      var onmessage = (event) => {
        if (!event || !event.data) {
          return reject();
        }
        if (event.data.id != message.id) {
          return;
        }
        resolve(event.data.result);
      };

      this.connect(portName).then(port => {
        if (port) {
          port.postMessage(message);
          port.onmessage = onmessage;
        } else {
          console.error('No ' + portName + ' port');
          reject();
        }
      });
    });
  }
};

//var CryptoAPI = {
//  encrypt: function(clearText, symmetricKey, iv) {
//    return IAC.request('weave-crypto', {
//      method: 'encrypt',
//      args: [clearText, symmetricKey, iv]
//    });
//  },
//  decrypt: function(cypherText, symmetricKey, iv) {
//    return IAC.request('weave-crypto', {
//      method: 'decrypt',
//      args: [cypherText, symmetricKey, iv]
//    });
//  },
//  generateRandomIV: function() {
//    return IAC.request('weave-crypto', {
//      method: 'generateRandomIV'
//    });
//  }
//};

var SyncCredentials = {
  getKeys() {
    if (this._credentials) {
      console.log(this._credentials);
      return Promise.resolve(this._credentials);
    }

    return IAC.request('sync-credentials', {
      method: 'getKeys'
    }).then(credentials => {
      this._credentials = credentials;
      return this._credentials;
    });
  },
  getXClientState() {
    return IAC.request('sync-credentials', {
      method: 'getXClientState'
    });
  }
};

var HistoryAdapter = {
  addPlace: function(place) {
    console.log(place);
    return IAC.request('sync-history', {
      method: 'addPlace',
      args: [place]
    });
  }
};

define('fxsync', ['modules/settings_utils', 'shared/settings_listener'
], function(SettingsUtils, SettingsListener) {

  class MyAsyncRemoteTransformer extends Kinto.transformers.RemoteTransformer {
    constructor(setCollectionName, setFswc) {
      this.collectionName = setCollectionName;
      this.fswc = setFswc;
      console.log('constructed transformer for ' + setCollectionName, setFswc, this);
    }
    encode(record) {
      console.log('encoding record in ' + this.collectionName + ' transformer', record);
      return this.fswc.signAndEncryptRecord(record.payload, this.collectionName).then(payloadEnc => {
        console.log('encrypted', record.payload, 'as', payloadEnc);
        record.payload = payloadEnc;
        return record;
      });
    }
    decode(record) {
      console.log('decoding record in ' + this.collectionName + ' transformer', record);
      return this.fswc.verifyAndDecryptRecord(record.payload, this.collectionName).then(payloadDec => {
        console.log('decrypted', record.payload, 'as', payloadDec);
        record.payload = payloadDec;
        return record;
      });
    }
  }

  var FxSync = {
    init: function fmd_init() {
      this.syncButton = document.querySelector('#sync-button');
      this.syncButton.
        addEventListener('click', FxSync.syncHistory.bind(FxSync));
    },

    getCryptoKeys: function() {
      if (this._cryptoKeys) {
        return Promise.resolve(this._cryptoKeys);
      } else {
        return this.fetchCryptoKeys().then(cryptoKeys => {
          this._cryptoKeys = cryptoKeys;
          return this._cryptoKeys;
        });
      }
    },

    fetchCryptoKeys: function() {
      return this.ensureDb().then(function(db) {
        console.log('db from ensureDb', db);
        var coll = db.collection('crypto');
        return coll.list().then(list => {
          console.log('crypto coll list before sync');
          return coll.sync({strategy: 'server wins'})
        }).then(function() {
         console.log('synced crypto collection', coll);
         return coll;
        });
      }).then(function(cryptoCollection) {
        console.log('getting keys record', cryptoCollection);

        // Original code:
        //return cryptoCollection.get('keys').then(function(cryptoKeysRecord) {
        //

        // Alternative code to work around https://github.com/mozilla-services/syncto/issues/6
        return cryptoCollection.list().then(cryptoCollRecords => {
          return {
            data: {
              payload: cryptoCollRecords.data[0].payload
            }
          };
        }).then(function(cryptoKeysRecord) {
        //

          if (typeof cryptoKeysRecord != 'object' || !cryptoKeysRecord.data ||
              !cryptoKeysRecord.data.payload) {
            console.log('cryptoKeysRecord', cryptoKeysRecord);
            return Promise.reject('got a cryptoKeysRecord but no payload data');
          }
          var parsedPayload;
          try {
            parsedPayload = JSON.parse(cryptoKeysRecord.data.payload);
          } catch(e) {
            return Promise.reject('cryptoKeysRecord payload data is not JSON');
          }
          return parsedPayload;
        }, function(err) {
          console.log('could not find record keys in collection crypto', err);
          return Promise.reject('could not find keys record in crypto coll');
        });
      }, function(err) {
        console.log('could not get crypto collection', err);
        return Promise.reject('could not get crypto collection');
      });
    },

    ensureFswc: function() {
      if (this.fswc) {
        return Promise.resolve();
      }
      var credentials;
      return SyncCredentials.getKeys().then(creds => {
        credentials = creds;
        return this.getCryptoKeys();
      }).then(cryptoKeys => {
        this.fswc = new window.FxSyncWebCrypto();
        return this.fswc.setKeys(credentials.kB, cryptoKeys);
      }, function(err) {
        window.alert('Sorry, no crypto keys found on this FxSync account');
      });
    },

    installTransformer: function(kintoCollection, collectionName) {
      console.log('perparing to install transformer for ' + collectionName);
      return this.ensureFswc().then(() => {
        console.log('installing transformer for ' + collectionName);
        return kintoCollection.use(new MyAsyncRemoteTransformer(collectionName, this.fswc));
      });
    },

    ensureDb: function(assertion) {
      return this.getAssertion().then(assertion => {
        if (this._db) {
          return this._db;
        }
        return SyncCredentials.getXClientState().then(xClientState => {
          this._db = new window.Kinto({
            bucket: 'syncto',
            remote: REMOTE,
            headers: {
              'Authorization': 'BrowserID ' + assertion,
              // XXX use generated client state
              'X-Client-State': xClientState
            }
          });
          return this._db;
        });
      });
    },

    getAssertion: function() {
      if (this._assertion) {
        return Promise.resolve(this._assertion);
      }
      var self = this;
      return new Promise((resolve, reject) => {
        navigator.mozId.watch({
          wantIssuer: 'firefox-accounts',
          audience: 'https://token.services.mozilla.com/',
          onlogin: function(assertion) {
            self._assertion = assertion;
            resolve(assertion);
          },
          onerror: function(error) {
            reject(error);
          },
          onlogout: function() {},
          onready: function() {}
        });
        navigator.mozId.request();
      });
    },

    getTabsCollection() {
      if (this._tabs) {
        return Promise.resolve(this._tabs);
      }
      return this.ensureDb().then(db => {
        this._tabs = db.collection('tabs');
        return this.installTransformer(this._tabs, 'tabs');
      }).then(() => {
        return this._tabs;
      });
    },

    renderTabs: function() {
      // Ideally we should store the data unencrypted instead of doing
      // the decryption while rendering it on the screen, but whatever,
      // this is just a prototype...
      //SyncCredentials.getKeys().then(credentials => {
        this.getTabsCollection().then(tabsCollection => {
          return tabsCollection.list();
        //}).then(result => {
         // var tabs = result.tabs;
         // tabs.forEach(tab => {
         //   var payload = JSON.parse(payload);
         //   CryptoAPI.decrypt(payload.cypherText, payload.iv);
         // });
        });
     // });
    },

    syncTabs: function() {
      this.getTabsCollection().then(tabs =>{
        console.log('Tabs ', tabs);
        tabs.sync().then(result => {
          console.log('Sync results ', result);
          this.renderTabs();
        }).catch(error => {
          console.error(error);
        });
      });
    },

    // ==== History ====
    getHistoryCollection() {
      if (this._history) {
        return Promise.resolve(this._history);
      }
      return this.ensureDb().then(db => {
        window.dbFromGetHist = db;
        console.log('set window.dbFromGetHist');
        SyncCredentials.getKeys().then(credentials => {
          console.log('credentials');
          console.log(credentials);
          document.querySelector('#sync-account').textContent =
              credentials.email;
        });

        this._history = db.collection('history');
        return this.installTransformer(this._history, 'history');
      }).then(() => {
        return this._history;
      });
    },

    storeHistoryToDS: function(historyCollection) {
      this.getHistoryCollection().then(coll => {
        return coll.list();
      }).then(recordsData => {
        var historyRecords = recordsData.data;
        var partialRecoreds = historyRecords.slice(0, 10);
        partialRecoreds.forEach(function (record){

          //SyncCrypto.decryptRecord(encryptedRecord).then(function(record) {
            console.log('decrypted a record', record);

            if(!record.payload || !record.payload.histUri || !record.payload.visits || !record.payload.visits[0]){
              console.log('invalid history: ', record);
              return ;
            }

            var visits = [];
            record.payload.visits.forEach(function (elem){
              visits.push(elem.date);
            });

            var place = {
              url: record.payload.histUri,
              title: record.payload.title,
              visits: visits,
              visited: record.payload.visits[0]
            };
            HistoryAdapter.addPlace(place).then(function (d){
              console.log(d);
            }, function (e){
              console.log(e);
            });
            document.querySelector('#sync-time').textContent =
              new Date().toString();
         // });

        });
      });
     },

    syncHistory: function() {
      console.log('Retrieving history collection... ' +
                  'this may take several minutes on first run');
      this.getHistoryCollection().then(history => {
        console.log('History ', history);
        history.sync().then(result => {
          console.log('Sync results ', result);
          this.storeHistoryToDS(result);
        });
      });
    },

    testHistory: function () {
      console.log('testHistory');
      /*
      Object {
        url: 'https://www.mozilla.org/en-US/',
        title: '',
        icons: Object,
        frecency: 3,
        visits: Array[2],   #### Array [ 1438614210311, 1438450706238 ]
        screenshot: Blob,
        visited: 1438614210311
      }
      */
      var place = {
        url: 'http://www.mozilla.org/en-US/',
        title: '',
        frecency: 3,
        visits: [ 1438614210311, 1438450706238 ],
        visited: 1438614210311
      }; // TODO
      HistoryAdapter.addPlace(place).then(function (d){
        console.log(d);
      }, function (e){
        console.log(e);
      });
    }

  };

  return FxSync;
});

navigator.mozL10n.once(function() {
  require(['fxsync'], function(FxSync) {
    FxSync.init();

    //for debugging:
    console.log('setting window.FxSync and window.kB');
    window.FxSync = FxSync;
    SyncCredentials.getKeys().then(credentials => 
                                   { window.kB = credentials.kB; });
  });
});
