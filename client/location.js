Template.Map.rendered = function () {
  var marker;
  Deps.autorun(function () {
    if (Mapbox.loaded()) {
      Session.set("test", "loaded")
      L.mapbox.accessToken = "pk.eyJ1Ijoiam9zaHVhYmVuc29uIiwiYSI6Im1sT3BqRWcifQ.W7h8nMmj_oI1p4RzChElsQ";
      var map = L.mapbox.map('map', 'joshuabenson.68d254d5');
      marker = L.marker([30.272920898023475, -97.74438629799988]).addTo(map)
      // var featureLayer = L.mapbox.featureLayer()

    }
  });

  Tracker.autorun(function(){
    var local = Geolocation.currentLocation()
    if(local && marker){
      console.log(local)
      marker.setLatLng([local.coords.latitude, local.coords.longitude]).update();
      Session.set('loc', local) 
    }
  })
}