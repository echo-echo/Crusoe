Meteor.startup(function(){
  Mapbox.load();
  //set location when app starts instead of when Map renders
  Tracker.autorun(function(){
    var local = Geolocation.currentLocation()
	  Session.set('loc', local) 
	})
});

Template.Map.rendered = function () {
  var color = "#FF0000";
  var currMess = [];
  var marker;
  var map;

  Deps.autorun(function () {
    if (Mapbox.loaded()) {
      if (!map) {//if map hasn't been loaded, load a map
        L.mapbox.accessToken = "pk.eyJ1Ijoiam9zaHVhYmVuc29uIiwiYSI6Im1sT3BqRWcifQ.W7h8nMmj_oI1p4RzChElsQ";
        map = L.mapbox.map('map', 'joshuabenson.68d254d5', { 
          //map options
          attributionControl: false,
          zoomControl :false
        })
      marker = L.marker([30.272920898023475, -97.74438629799988]).addTo(map); //adds default marker location, that will be reset to user Geolocation
      map.panTo([30.272920898023475, -97.74438629799988]);
      map.setZoom(14);
      }
    }  
  });  
//this block will rerun when messages collection updates:
  Deps.autorun(function () {
    if (Mapbox.loaded()) {    
//pull messages from messages collection:
      var allMess = Messages.find({},{sort: {createdAt: -1}}).fetch();
      var geoJsons = [];
//iterate through each and create marker:
      allMess.forEach(function(object, index){
// if message _id isn't in currMess array, add it to currMess and to geoJsons
        if (currMess.indexOf(String(object['_id'])) < 0) {
          currMess.push(String(object['_id']));  

          geoJsons.push({ 
            "type": "Feature",
            "geometry": {
              "type": "Point",
              "coordinates": [object['location']['coordinates'][0], object['location']['coordinates'][1]]
            },
            "properties": {
              "title": object['text'],
              "description": object['createdAt'],
              "marker-color": "#CCFFFF",
              "marker-size": "large",
              "marker-symbol": "monument"
            }
          });
        }
      });
//add array of new geoJson objects to map layer:
      map.featureLayer.setGeoJSON(geoJsons);
//reset geoJsons to empty so that it will only contain new messages on next update:      
      geoJsons = [];
    }  
  });

  Tracker.autorun(function(){
    var local = Geolocation.currentLocation()
	    if(local && marker){
	      console.log(local)
	      marker.setLatLng([local.coords.latitude, local.coords.longitude]).update(); 
	      map.panTo([local.coords.latitude, local.coords.longitude])
	    }
	})
};
