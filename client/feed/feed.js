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
		var message = event.target;
		console.log("this is event.target: ", message);
		AntiModals.overlay('messageModal', message);
	}
});

Template.messageModal.helpers({
	showMessage: function(message) {
		console.log("The message made it past the event listener?: ", message);
		return message;
	}
});

Template.writeModal.events({
		"submit .compose": function(event){
		var text = event.target.text.value;
    // test data
    var location = {
      "type": "Point",
      "coordinates": [-97.75, 30.25]
    };

    Meteor.call("addMessage", text, location);

		event.target.text.value="";
		return false;
	}
});