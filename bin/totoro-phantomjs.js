#!/usr/bin/env node

/**!
 * totoro-phantomjs - bin/totoro-phantomjs.js
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

var commander = require('commander');
var PhantomDriver = require('../lib/driver');
var pkg = require('../package.json');

commander
  .description(pkg.description)
  .option('-v, --version', 'output the version number')
  .option('-s, --server [s]', 'specify server and port, default is server.totorojs.org:9999')
  .option('-b, --browsers <s>', 'browsers to open')
  .on('version', function () {
    console.log(pkg.version);
    process.exit(0);
  });

// listen before parse
commander.parse(process.argv);

var driver = new PhantomDriver({
  server: commander.server || 'server.totorojs.org:9999',
});

driver.init();
