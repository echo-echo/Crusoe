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
    // var messages = Messages.find({});
    console.log("once a second?");
    // for ( var i = 0; i < messages.length; i++ ) {
    //   console.log(messages[i]);
    // }
  }
});

SyncedCron.start();
