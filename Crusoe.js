if (Meteor.isClient) {
  // counter starts at 0

$(document).ready(function(){

  L.mapbox.accessToken = 'pk.eyJ1Ijoiam9zaHVhYmVuc29uIiwiYSI6Im1sT3BqRWcifQ.W7h8nMmj_oI1p4RzChElsQ';
  // Replace 'examples.map-i87786ca' with your map id.
  var mapboxTiles = L.tileLayer('https://{s}.tiles.mapbox.com/v4/joshuabenson.68d254d5/{z}/{x}/{y}.png?access_token=' + L.mapbox.accessToken, {
    attribution: '<a href="http://www.mapbox.com/about/maps/" target="_blank">Terms &amp; Feedback</a>'
  });

  var map = L.map('map')
  .addLayer(mapboxTiles)
  .setView([42.3610, -71.0587], 15);
});

  Session.setDefault('counter', 0);

  Template.hello.helpers({
    counter: function () {
      return Session.get('counter');
    }
  });

  Template.hello.events({
    'click button': function () {
      // increment the counter when button is clicked
      Session.set('counter', Session.get('counter') + 1);
    }
  });


  Accounts.ui.config({
    passwordSignupFields: "USERNAME_ONLY"
  });
}

if (Meteor.isServer) {
  Meteor.startup(function () {
    // code to run on server at startup
  });
}
