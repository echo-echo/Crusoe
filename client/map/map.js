Meteor.startup(function(){
    Mapbox.load();
});


// Template.Map.rendered = function () {
  Meteor.subscribe("messages");
  var marker;
  Deps.autorun(function () {
    if (Mapbox.loaded()) {
      L.mapbox.accessToken = "pk.eyJ1Ijoiam9zaHVhYmVuc29uIiwiYSI6Im1sT3BqRWcifQ.W7h8nMmj_oI1p4RzChElsQ";
      var map = L.mapbox.map('map', 'joshuabenson.68d254d5', { 
        //map options
        attributionControl: false,
        zoomControl :false,

      })
      //default marker location
      marker = L.marker([30.272920898023475, -97.74438629799988]).addTo(map)
      map.panTo([30.272920898023475, -97.74438629799988])
      map.setZoom(14)

      //pull messages from db:
      var allMess = Messages.find({},{sort: {createdAt: -1}}).fetch();
      //iterate through each and create marker:
      var geoJsons = [];
      allMess.forEach(function(object, index){

        geoJsons.push({
          "type": "Feature",
          "geometry": {
            "type": "Point",
            "coordinates": [object['location']['coordinates'][0], object['location']['coordinates'][1]]
          },
          "properties": {
            "title": object['text'],
            "description": object['createdAt'],
            "marker-color": "#fc4353",
            "marker-size": "large",
            "marker-symbol": "monument"
          }
        });
      })
      //add array of geoJson objects to map layer:
      map.featureLayer.setGeoJSON(geoJsons);
    }
  });
  Tracker.autorun(function(){
    var local = Geolocation.currentLocation()
    if(local && marker){
      console.log(local)
      marker.setLatLng([local.coords.latitude, local.coords.longitude]).update();
      Session.set('loc', local) 
      // map.panTo([local.coords.latitude, local.coords.longitude])
    }
  })
// };
