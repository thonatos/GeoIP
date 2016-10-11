const path = require('path')
const morgan = require('morgan')
const express = require('express')
const request = require('request')
const maxmind = require('maxmind')
const moment = require('moment')

const app = express()
const util = require('./lib/util')
const updater = require('./lib/updater')

var nconf = util.nconf

app.use(morgan('short'))
app.use(checkVersion)

app.get('/', function (req, res) {
  const ip = req.query.ip || '0.0.0.0'
  const provider = req.query.provider || null

  Lookup(ip, provider, function (err, result) {
    if (err) {
      res.json(err)
      return
    }
    res.json(result)
  })
})

function checkVersion(req, res, next) {

  var force_update = req.query.force_update || false
  var version_tmp = util.generate(moment().format('YYYY-MM-DD'))
  var version_valid = nconf.get('version') === version_tmp || false
  var db_valid = util.exist(path.join(nconf.get('geolite:db'), nconf.get('version') + '.mmdb'))
  
  function Update() {    
    nconf.set('version_tmp', version_tmp)
    nconf.set('status', 'processing')
    nconf.save()

    updater.run(nconf.get(), function (err, result) {
      if (err) {
        console.log(err)
        nconf.set('status', 'error')
        return
      }            
      util.clear()
      nconf.set('version', version_tmp)
      nconf.set('status', 'completed')
      nconf.save()      
    })
  }

  if (!version_valid || force_update || !db_valid) {
    if (nconf.get('status') === 'processing') {
      console.log('GeoIP database is downloading...')
    } else {
      console.log('GeoIP database is out of date, downloading...')
      Update()
    }
  }

  if (db_valid) {
    next()
  } else {
    res.json({
      msg: 'GeoIP database not exist, please wait.'
    })
  }
}

function Lookup(ip, provider, callback) {

  const _callback = callback || function (err, data) {
    if (err) {
      console.log(err)
    }
    console.log(data)
  }

  switch (provider) {
    case 'ip138':
      request({
        url: 'http://api.ip138.com/query/?ip=' + ip,
        headers: {
          'token': '82f7be6449b7cf33c36be0a6fe3528f3'
        }
      }, function (err, res, body) {
        if (err) {
          _callback({
            ret: 'err',
            msg: err
          })
          return
        }
        _callback(false, JSON.parse(body))
      })
      break;

    default:
      maxmind.open(path.join(nconf.get('geolite:db'), nconf.get('version') + '.mmdb'), function (err, cityLookup) {
        if (err) {   
          // console.log(err)                           
          return _callback({
            ret: 'err',
            msg: 'error'
          })          
        }

        var city = cityLookup.get(ip)
        _callback(false, {
          ret: 'ok',
          ip: ip,
          data: {
            city: city && city.names,
            continent: city && city.continent && city.continent.code,
            country: city && city.country && city.country.iso_code,
            location: city && city.location
          }
        })  
      })
  }
}

const server = app.listen(3000, function () {
  const host = server.address().address;
  const port = server.address().port;
  console.log('Express listening at http://%s:%s', host, port);
});