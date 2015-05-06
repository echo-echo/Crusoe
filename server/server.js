//need this on both client and server side
Messages = new Mongo.Collection("messages")
Users = new Mongo.Collection("userData")

Meteor.publish("messages", function() {
  return Messages.find();
})

//allows client side to access "tagged" property of user
Meteor.publish("userData", function(){
    return Meteor.users.find({_id: this.userId}, {fields:{tagged:1}});    
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

SyncedCron.add({
  name: 'Update weight10s of each message',
  schedule: function(parser) {
    return parser.text('every 10 seconds');
  },
  job: function(){
    var messages = Messages.find({});

    messages.forEach(function(msg) {
      Messages.update({_id: msg._id}, {$set: {
        "latWeight10s": Math.random() - 0.5,
        "lngWeight10s": Math.random() - 0.5
        }
      })
    });
  }
});

SyncedCron.add({
  name: 'Update weight30s of each message',
  schedule: function(parser) {
    return parser.text('every 30 seconds');
  },
  job: function(){
    var messages = Messages.find({});

    messages.forEach(function(msg) {
      Messages.update({_id: msg._id}, {$set: {
        "latWeight30s": Math.random() * (0.6) - 0.3,
        "lngWeight30s": Math.random() * (0.6) - 0.3
        }
      })
    });
  }
});

SyncedCron.add({
  name: 'Update weight1m of each message',
  schedule: function(parser) {
    return parser.text('every 1 minute');
  },
  job: function(){
    var messages = Messages.find({});

    messages.forEach(function(msg) {
      Messages.update({_id: msg._id}, {$set: {
        "latWeight1m": Math.random() * (0.2) - 0.1,
        "lngWeight1m": Math.random() * (0.2) - 0.1
        }
      })
    });
  }
});

SyncedCron.start();
