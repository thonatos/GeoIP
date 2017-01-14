[![Build Status](http://ci.arashivision.com/api/badges/thonatos/GeoIP/status.svg)](http://ci.arashivision.com/thonatos/GeoIP)

# MT-GeoIP

Geo IP lookup using Maxmind binary databases (aka mmdb or geoip2).

## Feature

- Auto update

## Usage

- run server ```npm start```

- lookup ```http://{domain.com}?ip=61.141.145.145```  GET 			
	
	```
	{
	  "ret": "ok",
	  "ip": "61.141.145.145",
	  "data": {
	    "continent": "AS",
	    "country": "CN",
	    "location": {
	      "accuracy_radius": 50,
	      "latitude": 23.1167,
	      "longitude": 113.25,
	      "time_zone": "Asia/Shanghai"
	    }
	  }
	}
	```
		
- update ```http://{domain.com}?ip=61.141.145.145&force_update=11``` GET 	
		
## References

- [node-maxmind](https://github.com/runk/node-maxmind)

## License

MIT