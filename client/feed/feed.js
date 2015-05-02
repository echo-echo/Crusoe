var Messages = new Mongo.Collection("messages")

Template.feed.helpers({
	showBox: function(){
		return Session.get("show");
	},
	messages: function(){
		return Msg.find({})
	}
})

Template.feed.events({
	"submit .compose": function(event){
		var text = event.target.text.value;

		Msg.insert({
			text:text,
			createdAt: new Date(),
			username: Meteor.user().username,
			// //test data for map view to use
			location: {
					"type": "Point",
					"coordinates": [-97.75, 30.25]
				}
		})

		event.target.text.value=""
		return false;
	},

	"click .btn": function(){
		var showHide = !Session.get("show")
		Session.set("show", showHide);
	}
})
