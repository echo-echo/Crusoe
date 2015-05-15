Messages = new Mongo.Collection("messages");

Meteor.subscribe("messages");

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
	"click .visible": function(event){
		var message = Blaze.getData(event.currentTarget)
			Meteor.call("openMessage", message._id)
			Session.set("messageId", message._id)
			$("#map-message-modal").openModal();
	},
	"click .hidden": function(event){
		var message = Blaze.getData(event.currentTarget)
		Session.set("messageId", message._id)
			$("#too-far").openModal();
	},

	"click .write": function(){
		$("#write").openModal();
    document.getElementsByClassName("media-upload")[0].addEventListener("change", function(){
      var file = $('input.media-upload')[0].files,
          img = document.createElement("img"),
          preview = $('#write');
      img.classList.add("obj");
      img.file = file;
      preview.append(img);
      var reader = new FileReader();
      reader.onload = (function(aImg) { return function(e) { aImg.src = e.target.result; }; })(img);
      reader.readAsDataURL(file[0]);
    })
	}
});

Template.messageModal.helpers({
	message: function(){
		var messageId = Session.get("messageId")
		var message = Messages.find({_id:messageId}).fetch()[0]
		if ( message.key ) {
			var key = message.key;
			// get the blob? from S3 and attach it as a property here
			Meteor.call("getMedia", key, function (err, result) {
				console.log("returning from getMedia, yay!");
				if ( err ) {
					console.log( err );
					throw new Error;
				}

				Session.set("media", result);
			});
		}
		return message;
	},

	attributes: function(){
		return {
			style: "background: url(" + Session.get("media") + ") no-repeat; background-size: auto auto",
			class: "message-img"
		}
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
});
