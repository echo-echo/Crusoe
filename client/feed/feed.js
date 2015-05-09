Messages = new Mongo.Collection("messages");

Meteor.subscribe("messages");

//use below to open materialize modal
// Template.modal.rendered = function(){
// 	$('.modal-trigger').leanModal()
// }

Template.feed.helpers({
	messages: function(){
		var messages = Messages.find({},{sort: {createdAt: -1}}).fetch()
    var userLat = Number(localStorage.getItem("userLat"));
    var userLong = Number(localStorage.getItem("userLong"));
		var result ={visible:[],hidden:[]}

///////////////////////////////////////////////////////////////
//Haversine Formula - find distance btwn two points on sphere//
		var getProx = function(lat1,lon1,lat2,lon2) {
	      var R = 6371;
	      var dLat = deg2rad(lat2-lat1);
	      var dLon = deg2rad(lon2-lon1);
	      var a =
	        Math.sin(dLat/2) * Math.sin(dLat/2) +
	        Math.cos(deg2rad(lat1)) * Math.cos(deg2rad(lat2)) *
	        Math.sin(dLon/2) * Math.sin(dLon/2)
	        ;
	      var c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
	      var d = R * c; // Distance in km
	      return d;
	    }

	    var deg2rad = function(deg) {
	      return deg * (Math.PI/180)
	    }
///////////////////////////////////////////////////////////////
/////filter by proximity between message and user location/////
		for (var i = 0; i<messages.length; i++){
	    var msgLat = messages[i].location.coordinates[1];
			var msgLong = messages[i].location.coordinates[0];
	    var proximity = getProx(msgLat,msgLong,userLat,userLong) * 3280.84; //  to get ft

      messages[i].proximity = Math.round(proximity);
	    if (proximity<1000){
		    result.visible.push(messages[i])
	    } else{
	    	result.hidden.push(messages[i])
	    }
		}

    result.visible.sort(function(a, b) {
      return a.proximity - b.proximity;
    });

    result.hidden.sort(function(a, b) {
      return a.proximity - b.proximity;
    });

    result.hidden = result.hidden.slice(0,5)
		return result
	}
})

Template.feed.events({
	"click .write": function(){
		AntiModals.overlay('writeModal');
	},
	"click .visible": function(event){
		var message = Blaze.getData(event.currentTarget)
			Meteor.call("openMessage", message._id)
			Session.set("messageId", message._id)
			AntiModals.overlay('messageModal');
	}
});

Template.messageModal.helpers({
	message: function(){
		var messageId = Session.get("messageId")
		var message = Messages.find({_id:messageId}).fetch()[0]
		return message;
	}
});

Template.messageModal.events({
	"click .save": function(){
		var messageId = Session.get("messageId")
		Meteor.call("tagMessage", messageId)
	},

	"click .like": function(){
		var messageId = Session.get("messageId")
		Meteor.call("likeMessage", messageId)
	}
})

Template.writeModal.events({
		"submit .compose": function(event){
		var text = event.target.text.value;
		var longitude = Number(localStorage.getItem("userLong"))
		var latitude = Number(localStorage.getItem("userLat"))
    var location=[longitude,latitude]

    Meteor.call("addMessage", text, location);

		event.target.text.value=""
		return false;
	}
});
