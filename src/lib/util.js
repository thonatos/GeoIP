const fs = require('fs')
const path = require('path')
const nconf = require('nconf')
const crypto = require('crypto')
const moment = require('moment')
const _ = require('lodash')

const CONFIG_FILE = path.join(process.cwd(), './conf/config.json')

nconf.use('file', { file: CONFIG_FILE })
nconf.load()


function generate(value) {
  return crypto.createHash('sha1').update(value).digest('hex')
}

module.exports = {

  nconf: nconf,

  generate: generate,

  exist: function (filepath) {
    var flag = true
    try {
      fs.accessSync(filepath, fs.F_OK)
    } catch (e) {
      flag = false
    }
    return flag
  },

  clear: function () {

    fs.readdir('./db/', function (err, items) {
      if (err) {
        console.log(err)
      } else {
        var excepts = [
          generate(moment().format('YYYY-MM-DD')) + '.mmdb',
          generate(moment().add(-1, 'd').format('YYYY-MM-DD')) + '.mmdb',
          'geo_database_dir.txt'
        ]
        var file_old = _.difference(items, excepts)
        for (var i in file_old) {
          fs.unlinkSync(path.join('./db/', file_old[i]))
        }
      }
    })

    fs.readdir('./tmp/', function (err, items) {
      if (err) {
        console.log(err)
      } else {
        var file_old = _.difference(items, ['geo_database_dir.txt'])
        for (var i in file_old) {
          fs.unlinkSync(path.join('./tmp/', file_old[i]))
        }
      }
    })

  }
}