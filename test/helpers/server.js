// Run this from the command line with: `node ./test/server.js`
// Then open `testrunner.html` in the browser, to see the unit test
// run against this mock of a Syncto server.

var http = require('http');
var url = require('url');
var fixture = require('./fixture');

http.createServer(function(req, res) {
  var status = 200;
  var contentType = 'application/json; charset=UTF-8';
  var response = 'unhandled path: ' + req.url;
  var pathName = url.parse(req.url).pathname;

  if (req.method === 'GET') {
    if (pathName === '/running') {
      contentType = 'text/plain';
      response = 'yes';
    } else if (pathName === '/v1/') {
      response = JSON.stringify({
        settings: {
          'cliquet.batch_max_requests': 25
        },
        url: 'http:\/\/localhost:8000\/v1\/',
        documentation: 'https:\/\/syncto.readthedocs.org\/',
        version: '1.0.0.dev0',
        commit: '1be8cf6',
        hello: 'syncto'
      });
    } else if (req.headers.authorization !== 'BrowserID test-assertion-mock') {
      response = 'Please add a request header: Authorization: "BrowserID test-assertion-mock"';
    } else if (req.headers.authorization !== 'BrowserID test-assertion-mock') {
      response = 'Please add a request header: X-Client-State: "test-xClientState-mock"';
    } else if (pathName === '/v1/buckets/syncto/collections/meta/records') {
      response = JSON.stringify({
        data: [
          global.fxSyncDataExample.metaGlobalResponse
        ]
      });
    } else if (pathName === '/v1/buckets/syncto/collections/crypto/records') {
      response = JSON.stringify({
        data: [
          global.fxSyncDataExample.cryptoKeysResponse
        ]
      });
    } else if (pathName === '/v1/buckets/syncto/collections/history/records') {
      response = JSON.stringify({
        data: [
          global.fxSyncDataExample.historyEntryResponse
        ]
      });
    }
  } else if (req.method === 'OPTIONS') {
    response = '';
  }
  console.log('request to ' + req.url, req.headers, contentType, response);
  res.writeHead(status, {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Length,Alert,Retry-After,Last-Modified,Total-Records,ETag,authorization,content-type,if-none-match,x-client-state,Backoff,Next-Page',
    'Access-Control-Expose-Headers': 'Backoff, Retry-After, Alert, Content-Length, Next-Page, Total-Records, Last-Modified, ETag',
    'Access-Control-Allow-Methods': 'OPTIONS,GET,POST,DELETE',
    'Access-Control-Max-Age': 'false',
    'Content-Type': contentType,
    'Content-Length': response.length //assumes one byte per character, but that's the case for all fixtures here
  });
  res.write(response);
  res.end();
}).listen(8000);
console.log('test server running on localhost:8000 - now open testrunner.html in your browser');
