Messages = new Mongo.Collection("messages");

Meteor.subscribe("messages");

Template.feed.helpers({
	messages: function(){
		var messages = Messages.find({},{sort: {createdAt: -1}}).fetch()
    // var loca;
    // loca.coords = {};
    var userLat = Number(localStorage.getItem("loclat"));
    var userLong = Number(localStorage.getItem("loclon"));
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
	    var msgLat = messages[i].location.coordinates[1]
			var msgLong = messages[i].location.coordinates[0]
	    var proximity = getProx(msgLat,msgLong,userLat,userLong)
      messages[i].proximity = proximity.toFixed(6)
	    console.log(proximity)
	    if (proximity<2){
		    result.visible.push(messages[i])
	    }else{
	    	result.hidden.push(messages[i])
	    }
		}

		return result
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
		var text = event.target.text.value;
    var loca = {coords:{}};

    loca.coords['latitude'] = Number(localStorage.getItem("loclat"));
    loca.coords['longitude'] = Number(localStorage.getItem("loclon"));

    Meteor.call("addMessage", text, loca);

		event.target.text.value=""
		return false;
	}
});
