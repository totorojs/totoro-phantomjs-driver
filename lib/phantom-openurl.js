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

var url = system.args[1];

console.log('opening ' + url);
page.open(url, function (status) {
  console.log('opened ' + url + ', status ' + status);
});
