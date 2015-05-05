Meteor.methods({
  addMessage: function (text, loca) {

    var username = Meteor.user() ? Meteor.user().username : "Anonymous";

    Messages.insert({
      text: text,
      createdAt: new Date(),
      username: username,
      location: {"type": "Point","coordinates": [loca.coords.longitude, loca.coords.latitude]}
    });
  }
})

   