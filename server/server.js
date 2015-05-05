//need this on both client and server side
Messages = new Mongo.Collection("messages")

Meteor.publish("messages", function() {
  return Messages.find();
})

// percolate:synced-cron methods--adds a cron job
SyncedCron.add({
  name: 'Update messages worldwide',
  // parse is a later.parse object
  //  percolate:synced-cron is built on top of Later.js
  schedule: function(parse) {
    return parse.cron('* * * * * *', true);
  },
  job: function () {
    var messages = Messages.find({});

    messages.forEach(function (msg) {
      // maybe change this to sine later to make it smoother
      // also you can still add in lat and lng weights for 1hr, 1day, 1wk, 1month, 1year
      var latChange = (Math.random() - 0.5 + msg.latWeight10s + msg.latWeight30s + msg.latWeight1m) * 0.00001;
      var lngChange = (Math.random() - 0.5 + msg.lngWeight10s + msg.lngWeight30s + msg.lngWeight1m) * 0.00001;
      var newLat = msg.location.coordinates[0] += latChange;
      var newLng = msg.location.coordinates[1] += lngChange;
      Messages.update({_id: msg._id}, {$set: {"location.coordinates": [newLat, newLng]} });
    });
  }
});

SyncedCron.start();
