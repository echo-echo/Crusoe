Meteor.methods({
  addMessage: function (text, location) {

    var username = Meteor.user() ? Meteor.user().username : "Anonymous";

    Messages.insert({
      text: text,
      createdAt: new Date(),
      username: username,
      location: {"type": "Point","coordinates": location},
      latWeight10s: Math.random() - 0.5,
      lngWeight10s: Math.random() - 0.5,
      latWeight30s: Math.random() * (0.6) - 0.3,
      lngWeight30s: Math.random() * (0.6) - 0.3,
      latWeight1m: Math.random() * (0.2) - 0.1,
      lngWeight1m: Math.random() * (0.2) - 0.1
    });
  }
})


