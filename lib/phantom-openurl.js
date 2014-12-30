/**!
 * totoro-phantomjs-driver - lib/phantom-openurl.js
 *
 * Copyright(c) fengmk2 and other contributors.
 * MIT Licensed
 *
 * Authors:
 *   fengmk2 <fengmk2@gmail.com> (http://fengmk2.github.com)
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
}

// includejs 这个方法会返回触发onLoadFinished. 确定在 open 一个页面的时候只执行一次insertScripts方法.
var supportInsertJs = false;
log('opening ' + url);
page.open(url, function (status) {
  log('opened ' + url + ', status ' + status);
  supportInsertJs = true;
});


page.onLoadFinished = function(status) {
  if (status !== 'success') {
    log('opened url error');
    exit(1);
    return;
  }

  if (supportInsertJs) {
    insertScripts(page, includeScripts, function() {
      if (script) {
        page.evaluateJavaScript(eval(script));
      }
    });
  }

  supportInsertJs = false;
};

// 向指定页面插入脚本
function insertScripts(page, scripts, cb) {
  // TODO 支持插入 url 类型得脚本
  async.eachSeries(scripts, function(script, callback) {
    page.includeJs(script, function() {
      log('loaded ' + script);
      callback();
    })
  }, function() {
    log('scripts loaded!');
    cb();
  });
}

function log(str) {
  if (ignoreLog) {
    return;
  }
  console.log(str);
}
