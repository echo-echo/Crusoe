//need this on both client and server side
Messages = new Mongo.Collection("messages")

Meteor.publish("messages", function() {
  return Messages.find();
})
