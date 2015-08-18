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
