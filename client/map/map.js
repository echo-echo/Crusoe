Meteor.startup(function(){
  Mapbox.load();

//added this tracker back in to update user lat/long reactively when meteor starts
  Tracker.autorun(function () {
    var local = Geolocation.currentLocation();
    if(local){
      localStorage.setItem("userLat", local.coords.latitude);
      localStorage.setItem("userLong", local.coords.longitude);
    }
  })
});

Template.Map.onRendered(function () {
  
  var color = "#FF0000";
  var currMess = [];
  var marker;
  var bounds;
  var userLat;
  var userLong;
  var map;
  var imageUrl = '/radius.gif';

  var calcBounds = function(userLat, userLong) { //calc bounds for view radius of 1000ft
    var lat0 = (userLat - (0.0027565)); //orig mul==0
    var lat1 = (userLat + (0.0027565));
    var lonKmPerDeg = (0.11132 * Math.cos(userLat)); //get km per .001 deg lon...
    ///(0.3048 km per 1000ft) so...
    var lonDiff = (0.3048 / lonKmPerDeg);
    var lon0 = (userLong - (.0005 * lonDiff));//why is it .0005?
    var lon1 = (userLong + (.0005 * lonDiff));
    return [[lat0, lon0], [lat1, lon1]];
  }

  Tracker.autorun(function () {
    if (Mapbox.loaded()) {
      var userLat = Number(localStorage.getItem("userLat"));
      var userLong = Number(localStorage.getItem("userLong"));
      if (!map) {//if map hasn't been loaded, load a map
        L.mapbox.accessToken = "pk.eyJ1Ijoiam9zaHVhYmVuc29uIiwiYSI6Im1sT3BqRWcifQ.W7h8nMmj_oI1p4RzChElsQ";
        map = L.mapbox.map('map', 'joshuabenson.68d254d5', {
          //map options
          attributionControl: false,
          zoomControl :false
        });

      marker = L.marker([userLat, userLong]).addTo(map);
      // L.circle([userLat,userLong], 304.8).addTo(map);
      map.panTo([30.272920898023475, -97.74438629799988]);
      map.setZoom(14);
      imageBounds = calcBounds(userLat, userLong);
      bounds = L.imageOverlay(imageUrl, imageBounds).addTo(map).setOpacity(0.6);
      }

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
      };

      var deg2rad = function(deg) {
        return deg * (Math.PI/180)
      };

      ///////////////////////////////////////////////////////////////
      /////filter by proximity between message and user location/////

      allMess.forEach(function(object){
        var msgLat = object.location.coordinates[1]
        var msgLong = object.location.coordinates[0]
        var proximity = getProx(msgLat,msgLong,userLat,userLong)
        if (proximity<1000){
          geoJsons.push({
            "type": "Feature",
            "geometry": {
              "type": "Point",
              "coordinates": [msgLong, msgLat]
            },
            "properties": {
              "message": object.text,
              "createdAt": object.createdAt,
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
              "message": "too far to view message",
              "createdAt": object.createdAt,
              "icon": {
                "iconUrl": "/message-off.png",
                "iconSize": [50, 50]
              }
            }
          });
        }
      });

      // event listeners for map
      map.featureLayer.on('layeradd', function (e) {
        var marker = e.layer;
        feature = marker.feature;

        marker.setIcon(L.icon(feature.properties.icon));
      });

      map.featureLayer.on('click', function (e) {
        Session.set("marker", e.layer.feature.properties.message);
        AntiModals.overlay('mapMessageModal', {
          modal: true,
          overlayClass: 'nautical'
        });
      });

      //add array of geoJson objects to map layer:
      map.featureLayer.setGeoJSON(geoJsons);
    }

    var local = Geolocation.currentLocation()
	    if(local && marker && bounds){
	      marker.setLatLng([local.coords.latitude, local.coords.longitude]).update();
         map.removeLayer(bounds);
         imageBounds = calcBounds(local.coords.latitude, local.coords.longitude);
         bounds = L.imageOverlay(imageUrl, imageBounds).addTo(map).setOpacity(0.6);
	       map.panTo([local.coords.latitude, local.coords.longitude])
	    }
	});
});

Template.mapMessageModal.events({
  "click .back": function () {
    AntiModals.dismissOverlay($('.anti-modal-box'));
  }
});

Template.mapMessageModal.helpers({
  message: function () {
    var markerText = Session.get('marker');
    return markerText;
  }
});
