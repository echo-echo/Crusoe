Meteor.startup(function(){
  Mapbox.load();

  Tracker.autorun(function(){
    var local = Geolocation.currentLocation()
	    if(local){
	      localStorage.setItem("userLat", local.coords.latitude);
	      localStorage.setItem("userLong", local.coords.longitude);
	    }
	})
});

Template.Map.rendered = function () {
  var color = "#FF0000";
  var currMess = [];
  var marker;
  var bounds;
  var userLat;
  var userLong;
  var map;
  var geoJsonLayer;
  var imageUrl = '/radius.gif';
  var calcBounds = function(userLat, userLong) { //calc bounds for view radius of 1000ft
    var lat0 = (userLat - (1.5 * 0.0027565)); //orig mul==0
    var lat1 = (userLat + (1.5 * 0.0027565));
    var lonKmPerDeg = (0.11132 * Math.cos(userLat)); //get km per .001 deg lon...
    ///(0.3048 km per 1000ft) so... 
    var lonDiff = (0.3048 / lonKmPerDeg);
    var lon0 = (userLong - (.00075 * lonDiff));//why is it .0005?
    var lon1 = (userLong + (.00075 * lonDiff));
    return [[lat0, lon0], [lat1, lon1]]; 
  }
  var rotateVal = 0;
  $('html, body').css({ //disable map overflowing page/scrolling
    'overflow': 'hidden',
    'height': '100%'
  });
  setInterval(function(){
    rotateVal += 45;
    $('#map').css({ 
      transform: 'rotateX(75deg) rotateZ(' + rotateVal + 'deg)'
    })
  }, 5000);  


  Deps.autorun(function () {
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
      var getPxBounds = map.getPixelBounds;
      map.getPixelBounds = function () {
        var bounds = getPxBounds.call(this);
        // ... extend the bounds
        bounds.min.x=bounds.min.x-1000;
        bounds.min.y=bounds.min.y-1000;
        bounds.max.x=bounds.max.x+1000;
        bounds.max.y=bounds.max.y+1000;
        return bounds;
      };  
        var imageUrl = '/radius.gif',
      imageBounds = calcBounds(userLat, userLong);  
      marker = L.marker([userLat, userLong]).addTo(map);
      // L.circle([userLat,userLong], 304.8).addTo(map);
      map.panTo([30.272920898023475, -97.74438629799988]);
      map.setZoom(14);
      imageBounds = calcBounds(userLat, userLong);  
      bounds = L.imageOverlay(imageUrl, imageBounds).addTo(map).setOpacity(0.6);
      geoJsonLayer = L.geoJson().addTo(map);
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
      var messIds = messIds ? messIds : {};
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

      //check to see whether a message is already on the map based on its _id:
      var checkLayers = {};
      geoJsonLayer.eachLayer(function(layer) {

        checkLayers[layer.feature.properties.id] = layer._leaflet_id; 
        // layer.options.icon.options.className = "my-bottle";
        // layer.setIcon(L.divIcon({
        // className: 'my-bottle', // Make sure you set an icon class here, otherwise default styles will be set by Mapbox's CSS
        // html: '', // The content of your HTML marker, you can build a string based on the marker properties by using 'feature.properties.your_property'
        // iconSize: [50,50] // The bounds for your icon
        // }));
      });
      geoJsonLayer.on('layeradd', function (e) {
        var marker = e.layer,
        feature = marker.feature;
        console.log('whoop')
  
      marker.setIcon(L.divIcon({
        className: 'my-bottle', // Make sure you set an icon class here, otherwise default styles will be set by Mapbox's CSS
        html: '', // The content of your HTML marker, you can build a string based on the marker properties by using 'feature.properties.your_property'
        iconSize: [50,50] // The bounds for your icon
    }));
      });
      allMess.forEach(function(object){
        var geoJsonNew;
        var radiusVal = 1500;
        var msgLat = object.location.coordinates[1];
        var msgLong = object.location.coordinates[0];
        var proximity = getProx(msgLat,msgLong,userLat,userLong) < radiusVal;

        var currStat = geoJsonLayer.getLayer( checkLayers[object._id] ) || false
        currStat = currStat ? currStat.feature.properties.title !== "too far to view message" : currStat;

        if (checkLayers.hasOwnProperty(object._id) && proximity===currStat) { 
          geoJsonLayer.getLayer( checkLayers[object._id] )
            .setLatLng([object.location.coordinates[1], object.location.coordinates[0]])
        } else { 
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
                    "iconUrl": "/message.png",
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
                    "iconUrl": "/message-off.png",
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

       

      geoJsonLayer.on('click', function (e) {
        Session.set("marker", e.layer.feature.properties.title);
        AntiModals.overlay('mapMessageModal', {
          modal: true,
          overlayClass: 'nautical'
        });
      });
    }
  });

  Tracker.autorun(function(){
    var local = Geolocation.currentLocation()
	    if(local && marker && bounds){
	      marker.setLatLng([local.coords.latitude, local.coords.longitude]).update();
         map.removeLayer(bounds);
         imageBounds = calcBounds(local.coords.latitude, local.coords.longitude);  
         bounds = L.imageOverlay(imageUrl, imageBounds).addTo(map).setOpacity(0.6);
	       map.panTo([local.coords.latitude, local.coords.longitude])
	    }
	});
};

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
