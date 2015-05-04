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
    var message = Messages.findOne({});
    console.log(message.location.coordinates[0]);

    // for ( var i = 0; i < messages.length; i++ ) {
      var newLat = message.location.coordinates[0] += .000001;
      var newLng = message.location.coordinates[1] += .000001;
      Messages.update({_id: message._id}, {$set: {"location.coordinates": [newLat, newLng]} });
    // }
  }
});

SyncedCron.start();
