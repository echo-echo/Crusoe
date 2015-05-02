Messages = new Mongo.Collection("messages")

Meteor.subscribe("messages");

Template.feed.helpers({
	showBox: function(){
		return Session.get("show");
	},
	messages: function(){
		return Messages.find({})
	}
})

Template.feed.events({
	"submit .compose": function(event){
		var text = event.target.text.value;
    // test data
    var location = {
          "type": "Point",
          "coordinates": [-97.75, 30.25]
        }

    Meteor.call("addMessage", text, location)

		event.target.text.value=""
		return false;
	},

	"click .btn": function(){
		var showHide = !Session.get("show")
		Session.set("show", showHide);
	}
})
