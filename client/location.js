// Template.Map.rendered = function () {
//   var marker;

  Tracker.autorun(function(){
    var local = Geolocation.currentLocation()
    if(local && marker){
      console.log(local)
      marker.setLatLng([local.coords.latitude, local.coords.longitude]).update();
      Session.set('loc', local) 
    }
  })
// }