/**!
 * totoro-phantomjs-driver - lib/driver.js
 *
 * Copyright(c) 2014 fengmk2 and other contributors.
 * MIT Licensed
 *
 * Authors:
 *   fengmk2 <fengmk2@gmail.com> (http://fengmk2.github.com)
 */

"use strict";

/**
 * Module dependencies.
 */

//require('debug').enable('totoro*');
var debug = require('debug')('totoro-phantomjs-driver');
var TotoroDriver = require('totoro-driver-base');
var phantomjs = require('phantomjs');
var childProcess = require('child_process');
var path = require('path');
var util = require('util');

module.exports = PhantomDriver;

function PhantomDriver(options) {
  this.includeScripts = options.includeScripts;
  TotoroDriver.call(this, options);
  this.ignoreLog = options.ignoreLog;

  this._orders = {};
}

util.inherits(PhantomDriver, TotoroDriver);

var proto = PhantomDriver.prototype;

proto.getBrowser = function () {
  return { name: 'phantom', version: phantomjs.version };
};

proto.onAdd = function (data) {
  /**
   * structure of data
   * {
   *   orderId: '{{orderId}}',
   *   laborId: '{{laborId}}',
   *   ua: {{specifed browser ua}},
   *   url: {{test runner url}}
   * }
   */
  debug('got a order: %j', data);
  var args = [
    path.join(__dirname, 'phantom-openurl.js'),
    data.url,
    this.includeScripts,
    this.script,
    this.ignoreLog
  ];
  var child = childProcess.execFile(phantomjs.path, args);
  child.stdout.on('data', function (out) {
    debug('order %s stdout: %s', data.orderId, out.toString().trim());
  });
  this._orders[data.orderId] = child;
};

proto.onRemove = function (data) {
  // the structure is the same as 'add' event's but without the ua
  var child = this._orders[data.orderId];
  delete this._orders[data.orderId];
  child.stdout.removeAllListeners('data');
  child.kill();
  debug('order %s done', data.orderId);
};

proto.cleanup = function () {
  var ids = Object.keys(this._orders);
  for (var k in this._orders) {
    var child = this._orders[k];
    child.removeAllListeners('exit');
    child.kill(0);
  }
  this._orders = {};
  debug('cleanup %d orders: %j', ids.length, ids);
};
