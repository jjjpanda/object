#!/usr/bin/env node
const object = require('../lib/index.js').object
object(...process.argv.slice(2))