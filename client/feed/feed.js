var Msg = new Mongo.Collection("messages")

Template.feed.helpers({
	// showBox: function(){
	// 	return Session.get("show");
	// },
	messages: function(){
		return Msg.find({},{sort: {createdAt: -1}})
	}
})

Template.feed.events({
	"click .btn": function(){
		AntiModals.overlay('writeModal')
	}
})

Template.writeModal.events({
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
	}
})