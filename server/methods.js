Meteor.methods({
  addMessage: function (text, location) {

    var username = Meteor.user() ? Meteor.user().username : "Anonymous";

    Messages.insert({
      text: text,
      createdAt: new Date(),
      username: username,
      location: location,
      proximity: 0
    });

  }

  updateProx: function(location){
    var proximity = 
    Messages.update({}, 
      {$set:{proximity: proximity}}
    )
  }
});
