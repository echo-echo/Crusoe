Meteor.startup(function(){
  window.Crusoe = {};

  Mapbox.load();
  GoogleMaps.load();
//~~~~~~~~~~~~~~~~~~~~
// calculates map width based on page width
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
  Session.set('pan', true);

  Tracker.autorun(function () {
    if (Mapbox.loaded()) {

      //~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
      // pulls all the messages from the database.
      // re-initializes the users location variables and
      //~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
      var allMess = Messages.find({},{sort: {createdAt: -1}}).fetch();
      var userLat = Number(localStorage.getItem("userLat"));
      var userLong = Number(localStorage.getItem("userLong"));
      //~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
      // if the map isnt initialized then initialize it.
      //~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
      if (!map) {
        //changes the width of the map based on window size
        if ($(window).width() > 480) {
          $('#map').width($(window).width()-300);
        } else if ($(window).width() <= 480){
          $('#map').width($(window).width());
        }

        //grabs mapbox layers from our mapbox account.
        L.mapbox.accessToken = "pk.eyJ1Ijoic2tpbm5lcjUyMCIsImEiOiJHOXRJeUlFIn0.ZVhoykCRgo8-_KQl2-x9MQ";
        map = L.mapbox.map('map', 'skinner520.fbb71f90', {
          attributionControl: false,
          zoomControl :false
        });

        //initializes marker, users location, user radius, and pans map to the user's location
        marker = L.marker([userLat, userLong]).addTo(map);
        map.panTo([userLat, userLong]); //TODO: change this to pan to clicked message location
        map.setZoom(14);
        imageBounds = calcBounds(userLat, userLong, radiusVal);
        bounds = L.imageOverlay(imageUrl, imageBounds).addTo(map).setOpacity(0.6);
        geoJsonLayer = L.geoJson().addTo(map);
  		  window.Crusoe.map = map;
      }

      //~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
      // Updates the user location and radius marker
      // and pans to that location if the Pan variable is set to true
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

      //~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
      /*    SUMMARY OF THE FOLLOWING CODE
      *   the 'messagesOnMap' variable is an object whos keys are messageId's
      *   which we have retrieved from the database. These keys represent the message in our databse.
      *   The Value of these keys are the leaflet ids, refering to the marker on the map.
      *
      *  The following code checks to see if the messages fetched from the server already have existing
      *  leaflet id's on the map. If they DO, then we update their location/icon if neccessary. If they DONT
      *  we create the appropriate icon and add it to the map.
      */
      //~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

      //this object is used to check whether or not the messages exist on the map
      var messagesOnMap = {};
      //associates the messageID with the leafletId
      geoJsonLayer.eachLayer(function(layer) {
        messagesOnMap[layer.feature.properties._id] = layer._leaflet_id;
      });

      // Adds the classname of the icon to the messages as we add them to the map.
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

      // for each message that we have gotten from the server (object)
      allMess.forEach(function(object){

        // we grab the new coordinates for the message
        var newMsgLat = object.location.coordinates[1];
        var newMsgLng = object.location.coordinates[0];


        // we check to see if the message is popular or if it belongs to the user
        // and set the appropriate variables for assign icons later.
        var isPopular = object.opens > 5;

        // Checks to see if the message is the users
        var isUsers = false;
        if(Meteor.user()){
          if(object.username !== "Anonymous"){
            if(object.username === Meteor.user().username){
              isUsers = true
            } else if (Meteor.user().profile){
              isUsers = Meteor.user().profile.name === object.username
            }
          }
        }

        //checks if message already exists on the map
        //'isOldMessage' is true if the message already has a representative icon on the map
        var isOldMessage = !!geoJsonLayer.getLayer( messagesOnMap[object._id] ) || false

        //if it is already on the map, we grab the appropriate information and save it to a variable.
        if(isOldMessage){
          var oldMessage = geoJsonLayer.getLayer( messagesOnMap[object._id]);
          var oldMessageInRange = getProx(oldMessage.feature.geometry.coordinates[1], oldMessage.feature.geometry.coordinates[0], userLat, userLong) < radiusVal;
        }

        // we check to see if the new coordinates of the message are in range of the user
        var newMessageInRange = getProx(newMsgLat,newMsgLng,userLat,userLong) < radiusVal;

        //update the message props and location if the message is already on the map.
        if(isOldMessage){
          oldMessage.feature.properties = getProperties(object, newMessageInRange, isUsers, isPopular)
          oldMessage.setIcon(getIcon(true, newMessageInRange, isUsers, isPopular))
          oldMessage.setLatLng([object.location.coordinates[1], object.location.coordinates[0]]).update();
        } else {
          var text = newMessageInRange || isUsers ? object.text : "too far to view message"
          var obj = {
                        "type": "Feature",
                        "geometry": {
                          "type": "Point",
                          "coordinates": [newMsgLng, newMsgLat]
                        },
                        "properties": getProperties(object, newMessageInRange, isUsers, isPopular)
                      }

             geoJsonLayer.addData(obj);
            // geoJsonLayer.getLayer(marker._leaflet_id).setIcon(getIcon(true, newMessageInRange, isUsers, isPopular))
          }//end else
      });

      //~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
      //  listener for when a user clicks on a message in the map
      //~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

      geoJsonLayer.on('click', function (e) {
        //the Date.now() portion is used to de-bounce the click.
        //for some reason clicking on an message icon in the map calls
        // this function multiple times. We are making a simple check to see if
        // that call has happened in the last second or not. This eliminates
        // the server counting multiple opens to the message due to the
        // 'bouncing' of the message click.
        if(Date.now() - lastClick > 1000){
          var message = e.layer.feature.properties
          Session.set('currentMessage', message)

          if(message.visible){
            //updates the message opens on server
            Meteor.call('openMessage', message._id)
            lastClick=Date.now()
          }
          $('#map-message-modal').openModal();
        } //end date now

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
//~~~~~~~~~~~~~~~~~~~~~~~
/*
  if the 'return icon' argument is true, the function will return an actual
  Leaflet Icon. This is useful when using .setIcon on a message icon that
  already exists on the map. If it is false, it will return the STRING
  that needs to be set to the iconUrl property of the geoJson object.
  See getProperties function below
*/
//~~~~~~~~~~~~~~~~~~~~~~~
var getIcon = function(returnIcon, newMessageInRange, isUsers, isPopular){

  if(returnIcon){

    var icon = {
      iconUrl: 'message.png',
      iconSize: [35, 35]
    };

    if(isUsers){
      icon.iconUrl = "message-user.png"
    } else if(isPopular && newMessageInRange){
      icon.iconUrl = "message-pop.png"
    } else if(isPopular && !newMessageInRange){
      icon.iconUrl = "message-off-pop.png"
    } else if(newMessageInRange){
      icon.iconUrl = "message.png"
    } else {
      icon.iconUrl = "message-off.png"
    }

    return L.icon(icon)
  } else {

     if(isUsers){
      return "message-user"
    } else if(isPopular && newMessageInRange){
      return "close-pop"
    } else if(isPopular && !newMessageInRange){
      return "far-pop"
    } else if(newMessageInRange){
      return "close"
    } else {
      return "far"
    }

  }
}

//~~~~~~~~~~~~~~~~~~~~~~~
//    returns the properties used in the geoJson Object.
//~~~~~~~~~~~~~~~~~~~~~~~

var getProperties = function(newMessageData, newMessageInRange, isUsers, isPopular){

  var text = newMessageInRange || isUsers ? newMessageData.text : "too far to view message"
  var props = {
    "text": text,
    "_id": newMessageData._id,
    "likes" : newMessageData.likes,
    "key" : newMessageData.key,
    "opens" : newMessageData.opens,
    "origin" : newMessageData.origin,
    "description": newMessageData.createdAt,
    'visible' :  isUsers || newMessageInRange,
    'icon' : {
      "iconUrl" : getIcon(false, newMessageInRange, isUsers, isPopular),
      "iconSize" : [35,35]
    },
    "location": newMessageData.location

  }
  return props
}
