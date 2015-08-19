Synchronizer.registerAdapter('history', {
  update: function(kintoCollection) {
    kintoCollection.list().then(list => {
      console.log('history adapter update function called with this local copy of the remote data:', list);
    });
  }
});
