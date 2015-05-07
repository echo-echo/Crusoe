Meteor.startup(function(){
  Mapbox.load();

  Tracker.autorun(function(){
    var local = Geolocation.currentLocation()
	    if(local){
	      localStorage.setItem("userLat", local.coords.latitude);
	      localStorage.setItem("userLong", local.coords.longitude);
	    }
	})

  this.map = 0;
  this.marker = 0;
  this.setpan = function(){
    var map = Template.instance().map;
    var location = Geolocation.latLng();
    map.panTo([location.lat, location.l])
    Session.set("pan", !Session.get("pan"))
  }
});


Template.Map.helpers({
  getpan: function(){
    return Session.get("pan")
  },
  setpan: function(){
    Template.instance().setpan();
  }
})

Template.Map.events({
  "click #panButton": function(){
    Template.instance().setpan();
  }
})

Template.Map.rendered = function () {
  var color = "#FF0000";
  var currMess = [];


  Deps.autorun(function () {
    if (Mapbox.loaded()) {
      if (!map) {//if map hasn't been loaded, load a map
        L.mapbox.accessToken = "pk.eyJ1Ijoiam9zaHVhYmVuc29uIiwiYSI6Im1sT3BqRWcifQ.W7h8nMmj_oI1p4RzChElsQ";
        map = L.mapbox.map('map', 'joshuabenson.68d254d5', {
          //map options
          attributionControl: false,
          zoomControl :false
        });
      marker = L.marker([30.272920898023475, -97.74438629799988]).addTo(map); //adds default marker location, that will be reset to user Geolocation
      map.panTo([30.272920898023475, -97.74438629799988]);
      map.setZoom(14);

      //set these variables to properties of the instance
      Template.instance().map = map;
      Template.instance().marker = marker;
      }
    }

  });
  Deps.autorun(function () {
    if (Mapbox.loaded()) {
      //pull messages from db:
      var allMess = Messages.find({},{sort: {createdAt: -1}}).fetch();
      var userLat = Number(localStorage.getItem("userLat"));
			var userLong = Number(localStorage.getItem("userLong"));
      var geoJsons = [];

    ///////////////////////////////////////////////////////////////
    //Haversine Formula - find distance btwn two points on sphere//
        var getProx = function(lat1,lon1,lat2,lon2) {
            var R = 6371;
            var dLat = deg2rad(lat2-lat1);
            var dLon = deg2rad(lon2-lon1);
            var a =
              Math.sin(dLat/2) * Math.sin(dLat/2) +
              Math.cos(deg2rad(lat1)) * Math.cos(deg2rad(lat2)) *
              Math.sin(dLon/2) * Math.sin(dLon/2)
              ;
            var c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
            var d = R * c; // Distance in km
            return d * 3280.84; // to get ft
          }

          var deg2rad = function(deg) {
            return deg * (Math.PI/180)
          }
    ///////////////////////////////////////////////////////////////
    /////filter by proximity between message and user location/////

      allMess.forEach(function(object){
        var msgLat = object.location.coordinates[1]
        var msgLong = object.location.coordinates[0]
        var proximity = getProx(msgLat,msgLong,userLat,userLong)
        if (proximity<500){
          geoJsons.push({
            "type": "Feature",
            "geometry": {
              "type": "Point",
              "coordinates": [msgLong, msgLat]
            },
            "properties": {
              "title": object.text,
              "description": object.createdAt,
              "icon": {
                "iconUrl": "/message.png",
                "iconSize": [50, 50]
              }
            }
          });
        }else{
           geoJsons.push({
            "type": "Feature",
            "geometry": {
              "type": "Point",
              "coordinates": [msgLong, msgLat]
            },
            "properties": {
              "title": "too far to view message",
              "description": object.createdAt,
              "icon": {
                "iconUrl": "/message-off.png",
                "iconSize": [50, 50]
              }
            }
          });
        }
      });

      map.featureLayer.on('layeradd', function (e) {
        var marker = e.layer;
        feature = marker.feature;

        marker.setIcon(L.icon(feature.properties.icon));
      });

      //add array of geoJson objects to map layer:
      map.featureLayer.setGeoJSON(geoJsons);
      //default marker location
    }
  });
  Tracker.autorun(function(){

    var local = Geolocation.currentLocation()
	    if(local && marker){
	      marker.setLatLng([local.coords.latitude, local.coords.longitude]).update();
        if(Session.get("pan")){
	        map.panTo([local.coords.latitude, local.coords.longitude])
        }
	    }
	})
};
