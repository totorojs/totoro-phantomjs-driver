/**!
 * totoro-phantomjs - lib/driver.js
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

require('debug').enable('totoro-phantomjs');
var debug = require('debug')('totoro-phantomjs');
var os = require('os');
var SocketClient = require('socket.io-client');
var phantomjs = require('phantomjs');
var childProcess = require('child_process');
var path = require('path');

module.exports = PhantomDriver;

function PhantomDriver(options) {
  this._server = options.server;

  this._orders = {};
}

var DEVICES = PhantomDriver.DEVICES = {
  darwin: 'mac',
  win32: 'pc',
  linux: 'linux',
};

var OSNAMES = PhantomDriver.OSNAMES = {
  win32: 'windows',
  darwin: 'macosx',
  linux: 'linux',
};

var proto = PhantomDriver.prototype;

proto.init = function () {
  debug('connecting to %s', this._server);
  this.socket = SocketClient.connect(this._server + '/__labor');
  this.socket.on('connect', function () {
    var ua = this.getUserAgent();
    debug('init with User-Agent: %j', ua);
    this.socket.emit('init', ua);
  }.bind(this));

  this.socket.on('add', this.onAdd.bind(this));
  this.socket.on('remove', this.onRemove.bind(this));
  this.socket.on('disconnect', this.onDisconnect.bind(this));
};

proto.getUserAgent = function () {
  var ua = {
    device: { name: DEVICES[process.platform] },
    os: { name: OSNAMES[process.platform], version: os.release() },
    browser: { name: 'phantom', version: phantomjs.version }
  };
  return ua;
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
    data.url
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

proto.onDisconnect = function () {
  debug('disconnect');
  process.exit(0);
};
