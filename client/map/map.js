Meteor.startup(function(){
  Mapbox.load();
//~~~~~~~~~~~~~~~~~~~~
// calculates map width
//~~~~~~~~~~~~~~~~~~~~

  $(window).resize(function(evt) {
    if ($(window).width() > 480) {
      $('#map').width($(window).width()-300);
    }
  });



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
  var lastPan = Date.now();
  var lastClick = Date.now();

  Tracker.autorun(function () {
    if (Mapbox.loaded()) {
      //~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
      // pulls all the messages from the database.
      // re-initializes the users location variables and
      // initializes some other variables
      //~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
      var allMess = Messages.find({},{sort: {createdAt: -1}}).fetch();
      var userLat = Number(localStorage.getItem("userLat"));
      var userLong = Number(localStorage.getItem("userLong"));
      var geoJsons = [];
      var messIds = messIds ? messIds : {};



      //~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
      // if the map isnt initialized then initialize it.
      //~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
      if (!map) {
        //changes the width of the map
        if ($(window).width() > 480) {
          $('#map').width($(window).width()-300);
        }

        L.mapbox.accessToken = "pk.eyJ1Ijoic2tpbm5lcjUyMCIsImEiOiJHOXRJeUlFIn0.ZVhoykCRgo8-_KQl2-x9MQ";
        map = L.mapbox.map('map', 'skinner520.fbb71f90', {
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

      //~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
      // Updates the user location and pans to that location if
      // the Pan variable is set to true
      //~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
       var local = Geolocation.currentLocation();
        if(local){
          localStorage.setItem("userLat", local.coords.latitude);
          localStorage.setItem("userLong", local.coords.longitude);
          marker.setLatLng([local.coords.latitude, local.coords.longitude]).update();
          map.removeLayer(bounds);
          imageBounds = calcBounds(local.coords.latitude, local.coords.longitude, 1000);
          bounds = L.imageOverlay(imageUrl, imageBounds).addTo(map).setOpacity(0.6);
          if(Session.get('pan') && Date.now() - lastPan > 3000){
            lastPan = Date.now()
            map.panTo([local.coords.latitude, local.coords.longitude]);
          }
        }


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
          iconSize: [35,35]
        }));
      });
      allMess.forEach(function(object){
        var geoJsonNew;
        var msgLat = object.location.coordinates[1];
        var msgLong = object.location.coordinates[0];

        var isPopular = object.opens > 5;
        if(Meteor.user()){
          var isUsers = object.username !== "Anonymous" && object.username === Meteor.user().username
        }
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
                      "iconUrl": "message-user",
                      "iconSize": [35, 35]
                    }
                  }
                };

            if(isUsers){
              geoJsonNew.properties.icon.iconUrl = "message-user"
            }else if (proximity<radiusVal){
              if(isPopular){
                geoJsonNew.properties.icon.iconUrl = "close-pop"
              } else {
                geoJsonNew.properties.icon.iconUrl = "close"
              }
            }else{
              if(isPopular){
                geoJsonNew.properties.icon.iconUrl = "far-pop"
                geoJsonNew.properties.title = "too far to view message"
              } else {
                geoJsonNew.properties.icon.iconUrl = "far"
                geoJsonNew.properties.title = "too far to view message"
              }
            }
        geoJsonLayer.addData(geoJsonNew);
        }
      });

      //~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
      //  listener for when a user clicks on a message in the map
       //~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

      geoJsonLayer.on('click', function (e) {
        if (Date.now() - lastClick > 1000){
          lastClick=Date.now()
          Session.set('messageId', e.layer.feature.properties.id)
          if (e.layer.feature.properties.title === "too far to view message"){
            $("#too-far").openModal();
          } else {
              $('#map-message-modal').openModal();
              Meteor.call("openMessage", e.layer.feature.properties.id)
            }
        }
      });
    }
	});
});



//~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
// ~~~~ HELPERS AND EVENTS
 //~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

Template.Map.events({
  'click #autopan' : function(){
    Session.set('pan', !Session.get('pan'));
  }
})
Template.Map.helpers({
  pan : function(){
    return Session.get('pan');
  }
})





//needed the same method for a different template.
Template.toofar.helpers({
  message: function(){
    var messageId = Session.get("messageId")
    var message = Messages.find({_id:messageId}).fetch()[0]
    return message;
  }
});




//~~~~~~~~ HELPER FUNCTIONS ~~~~~~~~~~~*/
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
