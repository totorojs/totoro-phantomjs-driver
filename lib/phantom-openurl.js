/**!
 * totoro-phantomjs-driver - lib/phantom-openurl.js
 *
 * Copyright(c) fengmk2 and other contributors.
 * MIT Licensed
 *
 * Authors:
 *   fengmk2 <fengmk2@gmail.com> (http://fengmk2.github.com)
 *   leoner <kangpangpang@gmail.com>
 */

'use strict';

/**
 * Module dependencies.
 */

var page = require('webpage').create();
var system = require('system');
var async = require('async');

var url = system.args[1];
var includeScripts = system.args[2];
var script = system.args[3];
var ignoreLog = system.args[4];

if (includeScripts) {
  includeScripts = includeScripts.split(',');
} else {
  includeScripts = [];
}

var isInserted = false;
log('opening ' + url);
page.open(url, function (status) {
  log('opened ' + url + ', status ' + status);
  isInserted = false;
});

// To avoid triggering this method repeatedly.
page.onLoadFinished = function(status) {
  if (status !== 'success') {
    log('opened url error');
    exit(1);
    return;
  }

  if (!isInserted) {
    insertScripts(page, includeScripts, function() {
      executeScript(script);
    });
  }

  isInserted = true;
};

//include scripts;
function insertScripts(page, scripts, cb) {
  async.eachSeries(scripts, function(script, callback) {
    page.includeJs(script, function() {
      log('loaded ' + script);
      callback();
    });
  }, function() {
    log('scripts loaded!');
    cb();
  });
}

function executeScript(script) {
  if (script) {
    page.evaluateJavaScript(eval(script));
  }
}

function log(str) {
  if (ignoreLog) {
    return;
  }
  console.log(str);
}
