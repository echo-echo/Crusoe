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
      var newLat = msg.location.coordinates[0] += .00001;
      var newLng = msg.location.coordinates[1] += .00001;
      Messages.update({_id: msg._id}, {$set: {"location.coordinates": [newLat, newLng]} });
    });
  }
});

SyncedCron.start();
