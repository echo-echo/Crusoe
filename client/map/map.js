// Meteor.startup(function(){
//     Mapbox.load();
// });


Template.Map.rendered = function () {
  Meteor.subscribe("messages");
  var marker
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
    }
  });


    Tracker.autorun(function(){
    var local = Geolocation.currentLocation()
    if(local && marker){
      console.log(local)
      marker.setLatLng([local.coords.latitude, local.coords.longitude]).update();
      Session.set('loc', local) 
      map.panTo([local.coords.latitude, local.coords.longitude])
    }
  })
};
