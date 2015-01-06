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
var ignoreLog = system.args[3];
var subTasks = system.args[4];

if (subTasks) {
  try {
    subTasks = JSON.parse(subTasks);
  } catch(e) {
    subTasks = null;
  }
}

if (includeScripts) {
  includeScripts = includeScripts.split(',');
} else {
  includeScripts = [];
}

log('opening ' + url);
page.open(url, function (status) {
  log('opened ' + url + ', status ' + status);
});

var script;
// To avoid triggering this method repeatedly.
page.onLoadFinished = function(status) {
  if (status !== 'success') {
    log('opened url error');
    exit(1);
    return;
  }
  if (script) {
    insertScripts(page, includeScripts, function() {
      executeScript(script);
      script = null;
    });
  }
};

page.onUrlChanged = function(a, b) {
  script = findMappingScript(page.url);
};

//include scripts;
function insertScripts(page, scripts, cb) {
  async.eachSeries(scripts, function(script, callback) {
    if (script.indexOf('http') < 0) {
      page.injectJs(script);
      callback();
    } else {
      page.includeJs(script, function() {
        log('loaded ' + script);
        callback();
        // 有可能是缓存的原因, 第二次加载 js 的时候, 这个方法会触发两遍.
        callback = function(){};
      });
    }
  }, function() {
    log('scripts loaded!');
    cb();
  });
}

page.onError = function(msg, trace) {
  var msgStack = ['ERROR: ' + msg];

  if (trace && trace.length) {
    msgStack.push('TRACE:');
    trace.forEach(function(t) {
      msgStack.push(' -> ' + t.file + ': ' + t.line + (t.function ? ' (in function "' + t.function +'")' : ''));
    });
  }

  console.error(msgStack.join('\n'));
};

function executeScript(script) {
  if (script) {
    page.evaluateJavaScript(eval(script));
  }
}

page.onConsoleMessage = function(msg, lineNum, sourceId) {
  log('CONSOLE: ' + msg + ' (from line #' + lineNum + ' in "' + sourceId + '")');
};

function findMappingScript(url) {
  // 如果支持多页面, 需要提前传入 runner 和 测试脚本的对应关系, 也就是 subTasks
  var script;
  if (subTasks) {
    Object.keys(subTasks).some(function(subUrl) {
      if (isMatch(url, subUrl)) {
        script = subTasks[subUrl];
        delete subTasks[subUrl];
      }
    });
  }
  return script;
};

// 检查 url 是否匹配
function isMatch(url, subUrl) {
  if (url.indexOf(subUrl) === 0) {
    return true;
  }

  if (subUrl.indexOf('/') === 0) {
    return url.indexOf(subUrl) > -1;
  }
  return false;
}

function log(str) {
  return;
  if (ignoreLog) {
    return;
  }
  console.log(str);
}
