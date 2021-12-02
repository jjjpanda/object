#!/usr/bin/env node
const object = require('../lib/index.js').object
const possibleConfigPath = process.argv[2]
object(possibleConfigPath)