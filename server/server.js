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

SyncedCron.add({
  name: 'Update messages locations every 15 seconds',
  // parse is a later.parse object
  //  percolate:synced-cron is built on top of Later.js
  schedule: function(parser) {
    return parser.text('every 15 seconds');
  },
  job: function () {
    var messages = Messages.find({});

    messages.forEach(function (msg) {
      // maybe change this to sine later to make it smoother
      // also you can still add in lat and lng weights for 1hr, 1day, 1wk, 1month, 1year
      var latChange = (
        Math.random() - 0.5 +
        msg.latWeight1m +
        msg.latWeight15m +
        msg.latWeight1hr +
        msg.latWeight6hr
        ) * 0.0001;
      var lngChange = (
        Math.random() - 0.5 +
        msg.lngWeight1m +
        msg.lngWeight15m +
        msg.lngWeight1hr +
        msg.lngWeight6hr
        ) * 0.0001;
      var newLat = msg.location.coordinates[0] += latChange;
      var newLng = msg.location.coordinates[1] += lngChange;
      Messages.update({_id: msg._id}, {$set: {"location.coordinates": [newLat, newLng]} });
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
        "latWeight1m": Math.random() - 0.5,
        "lngWeight1m": Math.random() - 0.5
        }
      })
    });
  }
});

SyncedCron.add({
  name: 'Update weight15m of each message',
  schedule: function(parser) {
    return parser.text('every 15 minutes');
  },
  job: function(){
    var messages = Messages.find({});

    messages.forEach(function(msg) {
      Messages.update({_id: msg._id}, {$set: {
        "latWeight15m": Math.random() - 0.5,
        "lngWeight15m": Math.random() - 0.5
        }
      })
    });
  }
});

SyncedCron.add({
  name: 'Update weight1hr of each message',
  schedule: function(parser) {
    return parser.text('every 1 hour');
  },
  job: function(){
    var messages = Messages.find({});

    messages.forEach(function(msg) {
      Messages.update({_id: msg._id}, {$set: {
        "latWeight1hr": Math.random() - 0.5,
        "lngWeight1hr": Math.random() - 0.5
        }
      })
    });
  }
});

SyncedCron.add({
  name: 'Update weight6hr of each message',
  schedule: function(parser) {
    return parser.text('every 6 hours');
  },
  job: function(){
    var messages = Messages.find({});

    messages.forEach(function(msg) {
      Messages.update({_id: msg._id}, {$set: {
        "latWeight6hr": Math.random() - 0.5,
        "lngWeight6hr": Math.random() - 0.5
        }
      })
    });
  }
});

SyncedCron.start();
