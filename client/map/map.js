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
        messagesOnMap[layer.feature.properties.id] = layer._leaflet_id;
      });

      // // Adds the classname of the icon to the messages as we add them to the map. 
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
        if(Meteor.user()){
          var isUsers = object.username !== "Anonymous" && object.username === Meteor.user().username
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


        /* 
        * We now need to check if the state of the icon has changed
        * if the message was already on the map, and has either entered or 
        * left the users readable radius, then we need to update the icon. 
        *
        * if the icon has not changed states (hasn't left or entered users
        * readable radius), then we just update the location of the icon
        */


        //old version of message and new version of message have not changed view state ==> doesnt require icon change
        if(isOldMessage && oldMessageInRange === newMessageInRange){
          oldMessage.setLatLng([object.location.coordinates[1], object.location.coordinates[0]]).update();

        //the message has changed states, and need an icon change. 
        } else {
          //removes the old marker of the message that matches the message id
          if(isOldMessage){ 
            geoJsonLayer.removeLayer(messagesOnMap[object._id]) 
          } 

          //add the new marker with the new message properties
          var geoJsonNew = {
                        "type": "Feature",
                        "geometry": {
                          "type": "Point",
                          "coordinates": [newMsgLng, newMsgLat]
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

          //assign the appropriate message icon/title
          if(isUsers){
            geoJsonNew.properties.icon.iconUrl = "message-user"
          }else if (newMessageInRange){
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

          //add the new marker to the map.
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
