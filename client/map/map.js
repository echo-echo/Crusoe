Meteor.startup(function(){
    Mapbox.load();
});

Meteor.subscribe("messages");

Template.Map.rendered = function () {
  // this.autorun(function () {
  //   if (Mapbox.loaded()) {
  //     L.mapbox.accessToken = 'pk.eyJ1Ijoiam9zaHVhYmVuc29uIiwiYSI6Im1sT3BqRWcifQ.W7h8nMmj_oI1p4RzChElsQ';
  //     var map = L.mapbox.map('map',  'joshuabenson.68d254d5');
  //   }
  // });


};
