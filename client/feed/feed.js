Messages = new Mongo.Collection("messages");

Meteor.subscribe("messages");

Template.feed.helpers({
	// showBox: function(){
	// 	return Session.get("show");
	// },
	messages: function(){
		return Messages.find({},{sort: {createdAt: -1}});
	}
})

Template.feed.events({
	"click .btn": function(){
		AntiModals.overlay('writeModal');
	},
	"click li": function(event){
		var message = event.currentTarget.lastElementChild.textContent;
		Session.set('clicked-message', message);
		AntiModals.overlay('messageModal');
	}
});

Template.messageModal.helpers({
	message: function() {
		var message = Session.get('clicked-message');
		console.log("Session.get worked?: ", message);
		return message;
	}
});

Template.writeModal.events({
		"submit .compose": function(event){
    var local = Geolocation.currentLocation();
		var text = event.target.text.value;
    // test data
    var location = {

      "type": "Point",

      "coordinates": [local.coords.longitude, local.coords.latitude]
    };


    Meteor.call("addMessage", text, location);

		event.target.text.value="";
		return false;
	}
});
