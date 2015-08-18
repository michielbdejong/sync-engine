var HistoryAdapter = {
  addPlace: function(place) {
    console.log(place);
    return IAC.request('sync-history', {
      method: 'addPlace',
      args: [place]
    });
  }
};
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
