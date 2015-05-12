Meteor.startup(function(){
  Mapbox.load();

//added this tracker back in to update user lat/long reactively when meteor starts
  Tracker.autorun(function () {
    var local = Geolocation.currentLocation();
    if(local){
      localStorage.setItem("userLat", local.coords.latitude);
      localStorage.setItem("userLong", local.coords.longitude);
      marker.setLatLng([local.coords.latitude, local.coords.longitude]).update();
      map.removeLayer(bounds);
      imageBounds = calcBounds(local.coords.latitude, local.coords.longitude);
      bounds = L.imageOverlay(imageUrl, imageBounds).addTo(map).setOpacity(0.6);
      map.panTo([local.coords.latitude, local.coords.longitude]);
    }
  })
});

Template.Map.onRendered(function () {
  var marker;
  var radiusVal = 1000; //ft
  var bounds;
  var userLat;
  var userLong;
  var map;
  var geoJsonLayer;
  var imageUrl = '/radius.gif';

  var calcBounds = function(userLat, userLong, radius) { //calc bounds for view, radius in feet
    var lat0 = (userLat - ((radius/1000) * 0.0027565));
    var lat1 = (userLat + ((radius/1000) * 0.0027565));
    var lonKmPerDeg = (0.11132 * Math.cos(userLat)); //get km per .001 deg lon...
    ///(0.3048 km per 1000ft) so... 
    var lonDiff = (0.3048 / lonKmPerDeg);
    var lon0 = (userLong - (((radius/1000) * .0005) * lonDiff));
    var lon1 = (userLong + (((radius/1000) * .0005) * lonDiff));
    return [[lat0, lon0], [lat1, lon1]];
  }

  Tracker.autorun(function () {
    if (Mapbox.loaded()) {
      var userLat = Number(localStorage.getItem("userLat"));
      var userLong = Number(localStorage.getItem("userLong"));
      if (!map) {//if map hasn't been loaded, load a map
        L.mapbox.accessToken = "pk.eyJ1Ijoiam9zaHVhYmVuc29uIiwiYSI6Im1sT3BqRWcifQ.W7h8nMmj_oI1p4RzChElsQ";
        map = L.mapbox.map('map', 'joshuabenson.68d254d5', {
          attributionControl: false,
          zoomControl :false
        });
        marker = L.marker([userLat, userLong]).addTo(map);
        map.panTo([userLat, userLong]); //TODO: change this to pan to clicked message location
        map.setZoom(14);
        imageBounds = calcBounds(userLat, userLong, radiusVal);
        bounds = L.imageOverlay(imageUrl, imageBounds).addTo(map).setOpacity(0.6);
        geoJsonLayer = L.geoJson().addTo(map);
      }

      //pull all messages from db
      var allMess = Messages.find({},{sort: {createdAt: -1}}).fetch();
      var userLat = Number(localStorage.getItem("userLat"));
      var userLong = Number(localStorage.getItem("userLong"));
      var geoJsons = [];
      var messIds = messIds ? messIds : {};

      //find distance btwn two points on sphere
      var getProx = function(lat1,lon1,lat2,lon2) {
        var R = 6371;
        var dLat = deg2rad(lat2-lat1);
        var dLon = deg2rad(lon2-lon1);
        var a = Math.sin(dLat/2) * Math.sin(dLat/2) + Math.cos(deg2rad(lat1)) * 
          Math.cos(deg2rad(lat2)) * Math.sin(dLon/2) * Math.sin(dLon/2);
        var c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
        var d = R * c; // Distance in km
        return d * 3280.84; // to get ft
      };

      var deg2rad = function(deg) {
        return deg * (Math.PI/180);
      };
      //check to see whether a message is already on the map based on its _id:
      var checkLayers = {};
      geoJsonLayer.eachLayer(function(layer) {
        checkLayers[layer.feature.properties.id] = layer._leaflet_id; 
      });
      geoJsonLayer.on('layeradd', function (e) {
        var marker = e.layer,
        feature = marker.feature;
        //sets each marker to a divIcon, html can be specified
        marker.setIcon(L.divIcon({
          className: marker.feature.properties.icon.iconUrl,
          html: '',
          iconSize: [50,50]
        }));
      });
      allMess.forEach(function(object){
        var geoJsonNew;
        var msgLat = object.location.coordinates[1];
        var msgLong = object.location.coordinates[0];
        var proximity = getProx(msgLat,msgLong,userLat,userLong) < radiusVal;
        var currStat = geoJsonLayer.getLayer( checkLayers[object._id] ) || false
        currStat = currStat ? currStat.feature.properties.title !== "too far to view message" : currStat;

        if (checkLayers.hasOwnProperty(object._id) && proximity===currStat) { 
          geoJsonLayer.getLayer(checkLayers[object._id]).setLatLng([object.location.coordinates[1], object.location.coordinates[0]])
        } else { 
          if (currStat) { geoJsonLayer.removeLayer( checkLayers[object._id] )}
            // var msgLat = object.location.coordinates[1];
            // var msgLong = object.location.coordinates[0];
            var proximity = getProx(msgLat,msgLong,userLat,userLong);
            if (proximity<radiusVal){
              geoJsonNew = {
                "type": "Feature",
                "geometry": {
                  "type": "Point",
                  "coordinates": [msgLong, msgLat]
                },
                "properties": {
                  "title": object.text,
                  "id": object._id,
                  "description": object.createdAt,
                  "icon": {
                    "iconUrl": "close",
                    "iconSize": [50, 50]
                  }
                }
              };
            }else{
               geoJsonNew = {
                "type": "Feature",
                "geometry": {
                  "type": "Point",
                  "coordinates": [msgLong, msgLat]
                },
                "properties": {
                  "title": "too far to view message",
                  "id": object._id,
                  "description": object.createdAt,
                  "icon": {
                    "iconUrl": "far",
                    "iconSize": [50, 50]
                  }
                }
              };
            }
        geoJsonLayer.addData(geoJsonNew);
        }
      });

    // map.on('zoomstart', function() {
    //   geoJsonLayer.setStyle({transition :'2s'}) 
    //   console.log('start')
    // });
    // map.on('zoomend', function() {
    //   geoJsonLayer.setStyle({transition :'15s'}) 
    //   console.log('end')
    // });

    }
	});
});
