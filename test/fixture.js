/* This Source Code Form is subject to the terms of the Mozilla Public
* License, v. 2.0. If a copy of the MPL was not distributed with this
* file, You can obtain one at http://mozilla.org/MPL/2.0/. */

// NB: This data is from an FxSync account, freshly created for this purpose,
// and then synced once using FxDesktop with a fresh empty Firefox profile:

// For use in ./server.js:
if (typeof window === 'undefined') {
  window = global;
}

(function(window) {
  function hex2ba(hexStr) {
    var numBytes = hexStr.length / 2;
    var byteArray = new Uint8Array(numBytes);
    for (var i = 0; i < numBytes; i++) {
      byteArray[i] = parseInt(hexStr.substr(i * 2, 2), 16); //FIXME: Can this be done faster?
    }
    return byteArray;
  }

  window.fxSyncDataExample = {
    kB: '85c4f8c1d8e3e2186824c127af786891dd03c6e05b1b45f28f7181211bf2affb',
    hkdf: {
      kB: hex2ba('85c4f8c1d8e3e2186824c127af786891dd03c6e05b1b45f28f7181211bf2affb'),
      infoStr: hex2ba('6964656e746974792e6d6f7a696c6c612e636f6d2f7069636c2f76312f6f6c6473796e63'),//'identity.mozilla.com/picl/v1/oldsync'
      outputHex: 'd63eb2610f1e5edc21b37fed22b93b0f9ea379840fb5c3c5eb95991b9b3bfab69cbabfda0762bdf0b27431d81960c8cf5dab7d482901213a5a1b003eb0081ed0'
    },
    metaGlobalResponse: {
      last_modified: 1439218398550,
      payload: "{\"syncID\":\"NOuEmrZxVWxl\",\"storageVersion\":5,\"declined\":[],\"engines\":{\"clients\":{\"version\":1,\"syncID\":\"-qRIYq3pRFaF\"},\"prefs\":{\"version\":2,\"syncID\":\"J2d8YxLBQ68M\"},\"passwords\":{\"version\":1,\"syncID\":\"y3sQX0uYGXwz\"},\"tabs\":{\"version\":1,\"syncID\":\"MGdVuWFjTRpP\"},\"bookmarks\":{\"version\":2,\"syncID\":\"OmUGbrBTvZbn\"},\"addons\":{\"version\":1,\"syncID\":\"90lUL4MPuhpx\"},\"forms\":{\"version\":1,\"syncID\":\"Q_mWdmGZtuX9\"},\"history\":{\"version\":1,\"syncID\":\"2_MOTXJfjA9Q\"}}}",
      id: '825a1b6a-0000-4000-8000-000000000000'
    },
    cryptoKeys: {
      ciphertext: 'PP5yNUYwJJoLcsL5o85i6RZfvanYDrwtChDD/LdKTZ8JOLubZ9DyRv3HMetSkbhL3HLvVm/FJ1Z4F2Z6IKQCxAc5dNnLsBIUUxhOHLbT0x9/jfnqZ8fLtlbkogI3ZlNvbc8iUF1aX+boe0Pv43vM0VvzxrnJDYzZ2a6jm9nbzUn0ldV9sv6vuvGHE6dANnRkZ3wA/q0q8UvjdwpzXBixAw==',
      IV: 'FmosM+XBNy81/9oEAgI4Uw==',
      hmac: '01a816e4577c6cf3f97b66b4382d0a3e7e9178c75a3d38ed9ac8ad6397c2ecce'
    },
    historyEntryEnc: {
      payload: '{"ciphertext":"o/VpkqMj1tlT8t2youwsS2FgvQeonoHxqjGsRTu1+4swfyBq/QsnKfgOOMmDIXZiPC3hOCNUlf/NtQiEe55hzJZEKLBshaLfXotai6KrprwrmykfiXnwn73n+nYNs8BXL5awDHoaJToyFgF4PYokl7mwN7YC2xFiPgwO7Z2u/8r5RfnPV9MoafqvlvUkW+Tqs+QHeHS/iuSA0P2h/j5ynt9v4xDWLVfEMce0KOKHQ5Qj7BmEPAieWP1trkkDmTdVi2euWrs+fuG4C6PgY4A2j2DbNLVIloqpDVkqM2fgh0YOM9L2NC/uiKEb1Ynr2Fos","IV":"kXL3hb11ltD+Jl0YFk+PlQ==","hmac":"cb727efe7a3f0307921cecbd1a97c03f06a4d75c42026089494d84fcf92dbff9"}',
      collectionName: 'history'
    },
    historyEntryDec: {
      payload: {
        id: '_9sCUbahs0ay',
        histUri: 'https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Object/proto',
        title: 'Object.prototype.__proto__ - JavaScript | MDN',
        visits:[ { date: 1439366063808983, type:1 } ]
      },
      collectionName: 'history'
    },
    synctoCredentials: {
      URL: 'http://localhost:8000/v1/',
      assertion: 'eyJhbGciOiJSUzI1NiJ9.eyJwdWJsaWMta2V5Ijp7ImFsZ29yaXRobSI6IkRTIiwieSI6IjkxNzI4RDMwQzNFQjY5OEM2Q0QyNTJFNzJGMzJBRUFGQzNENzgxN0RCRDFFMTJEM0ZCRDk1NkM2MEE3NUY2NEU5MkI5RTAxQUYyRjY3REEyNzJBOEJDODdFMzUzQUU0NjAxMDVGMkM4QjQ2NTFBNUZFMTk0MUU0NTk3NERBOTE0QUNDQTZCMDI0NzQxMjk2MUU4RDkwQzRCNkI0NDJFOUZEREI0MjRCQ0ZBRURBMjQ0MEVGOUU3NUE2RjY4MzQyOTdFRjYwNERFNzM2Mjk2OEVBNDc3QkYxMzQ0MjhCRDhEMkY5QTkzODMxNkEyRDAzM0FBOTM3MUQ3QjVDQUZCRjYiLCJwIjoiRkY2MDA0ODNEQjZBQkZDNUI0NUVBQjc4NTk0QjM1MzNENTUwRDlGMUJGMkE5OTJBN0E4REFBNkRDMzRGODA0NUFENEU2RTBDNDI5RDMzNEVFRUFBRUZEN0UyM0Q0ODEwQkUwMEU0Q0MxNDkyQ0JBMzI1QkE4MUZGMkQ1QTVCMzA1QThEMTdFQjNCRjRBMDZBMzQ5RDM5MkUwMEQzMjk3NDRBNTE3OTM4MDM0NEU4MkExOEM0NzkzMzQzOEY4OTFFMjJBRUVGODEyRDY5QzhGNzVFMzI2Q0I3MEVBMDAwQzNGNzc2REZEQkQ2MDQ2MzhDMkVGNzE3RkMyNkQwMkUxNyIsInEiOiJFMjFFMDRGOTExRDFFRDc5OTEwMDhFQ0FBQjNCRjc3NTk4NDMwOUMzIiwiZyI6IkM1MkE0QTBGRjNCN0U2MUZERjE4NjdDRTg0MTM4MzY5QTYxNTRGNEFGQTkyOTY2RTNDODI3RTI1Q0ZBNkNGNTA4QjkwRTVERTQxOUUxMzM3RTA3QTJFOUUyQTNDRDVERUE3MDREMTc1RjhFQkY2QUYzOTdENjlFMTEwQjk2QUZCMTdDN0EwMzI1OTMyOUU0ODI5QjBEMDNCQkM3ODk2QjE1QjRBREU1M0UxMzA4NThDQzM0RDk2MjY5QUE4OTA0MUY0MDkxMzZDNzI0MkEzODg5NUM5RDVCQ0NBRDRGMzg5QUYxRDdBNEJEMTM5OEJEMDcyREZGQTg5NjIzMzM5N0EifSwicHJpbmNpcGFsIjp7ImVtYWlsIjoiYWNlYmJiNmMxZDUxNDBhZmIxYzIwMjRiYzdjNjFiMzhAYXBpLmFjY291bnRzLmZpcmVmb3guY29tIn0sImlhdCI6MTQ0MDA4MTMyODY4MCwiZXhwIjoxNDQwMTAyOTM4NjgwLCJmeGEtZ2VuZXJhdGlvbiI6MTQzOTIxODI1MTI5OSwiZnhhLWxhc3RBdXRoQXQiOjE0NDAwODEyMTAsImZ4YS12ZXJpZmllZEVtYWlsIjoibWljaGllbCtlbXB0eXN5bmNAdW5ob3N0ZWQub3JnIiwiaXNzIjoiYXBpLmFjY291bnRzLmZpcmVmb3guY29tIn0.d1h2OFAjN2iTpvX0SRJLNO5eXvTO0B_VDrKhwCrtT0BLGp5-gP3JrkaDZx__kRvOzvI5tTmzTS9Mvn0SZLyCXSrbtbIeljD83TRcfGmVXc7Y1EAaVvR3F3pykIjjHxPHLgi-h-O06ZF0I2GHP5hC39EPgscQSmO2VofQV5uaNa1yJuAO-ucoKsr60EaJnkjG6ULRJEOwvf62cZHSlei3uOZciCQElnkop4km-xAYFYNTZCn495B28-7DP9oz-sIHfpLlxwDHYrtEqHQpTyR7AlEsbUE07_qxGw6kBA1loil0IifnIoxY32qEIeY4gNAkjbz1_mw8KiSkPR9FbbEJrw~eyJhbGciOiJEUzEyOCJ9.eyJleHAiOjIyMjg0ODEzMzg1MDIsImF1ZCI6Imh0dHBzOi8vdG9rZW4uc2VydmljZXMubW96aWxsYS5jb20vIn0=.PRQh9pSHrOeHRNvvE_NdsZmMsqI-836oJoiE8avPlmDC5RvKrxTrCw==',
      xClientState: '518fef27c6bbc0220aab0f00b1a37308',
      kB: '85c4f8c1d8e3e2186824c127af786891dd03c6e05b1b45f28f7181211bf2affb'
    }
  };
})(window);
