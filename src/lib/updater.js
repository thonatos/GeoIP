var fs = require('fs')
var path = require('path')
var zlib = require('zlib')
var request = require('request')
var progress = require('request-progress')
var util = require('./util')

var cb = function(err, res){
  if(err){
    console.log(err)
    return
  }
  console.log(res)
} 

function download(url, dest, callback){
  var _callback = callback || cb

  function error(err){
    _callback(err)
  }

  progress(request(url), {
      throttle: 2000, 
      delay: 1000       
    })
    .on('progress', function (state) {
      console.log('downloaded: ', state.percentage);
    })
    .on('error', error)    
    .pipe(fs.createWriteStream(dest))
      .on('error', error)   
      .on('close', function () {        
        _callback(false, 'downloaded.')
      })
}

function update(source, destination, callback) {

  var _callback = callback || cb

  function error(err){
    _callback(err)
  }

  fs.createReadStream(source)
    .on('error', error)    
    .pipe(zlib.createGunzip())
      .on('error', error)    
    .pipe(fs.createWriteStream(destination))
      .on('error', error)         
      .on('close', function () {        
        _callback(false, 'updated.')
      })
}

module.exports = {

  run: function (config, callback) {

    var _callback = callback || cb
    var db_url = config.geolite.url.city
    var db_gz = path.join(config.geolite.tmp, config.version_tmp + '.gz')
    var db = path.join(config.geolite.db, config.version_tmp + '.mmdb')

    download(db_url, db_gz, function (err, d_result) {
      if (err) {
        _callback(err)
        return
      }

      update(db_gz, db, function (err, result) {
        if (err) {
          _callback(err)
          return
        }        
        _callback(false, {          
          msg: result
        })
      })

    })

  }

}