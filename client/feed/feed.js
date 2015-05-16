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
	    	messages[i].visible = true;
		    result.visible.push(messages[i])
	    } else{
	    	messages[i].visible = false;
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
	"click .feedMessage": function(event){
		var message = Blaze.getData(event.currentTarget)
		if(message.visible){
		  Session.set('currentMessage', message)
			$("#map-message-modal").openModal();
			Meteor.call('openMessage', message._id)
		} else {
			Session.set('currentMessage', message);
			var lng = message.location.coordinates[0]
			var lat = message.location.coordinates[1]
			window.Crusoe.map.panTo([lat,lng]);
		}
	},

	"click .write": function(){
		$("#write").openModal();
    document.getElementsByClassName("media-upload")[0].addEventListener("change", function(){
      if ( $('input.media-upload')[0].files.length > 0 ) {
        var file = $('input.media-upload')[0].files,
            img = document.createElement("img"),
            preview = $('#write');
        img.classList.add("img-upload-preview");
        img.file = file;
        preview.append(img);
        var reader = new FileReader();
        reader.onload = (function(aImg) { return function(e) { aImg.src = e.target.result; }; })(img);
        reader.readAsDataURL(file[0]);
      }
    })
	}
});

Template.messageModal.helpers({
	message: function(){
		var message = Session.get('currentMessage')

		// if a message is found and if it has an AWS lookup key (it has an img)
		if ( message && message.key ) {
			// if the global namespace is already storing an image and it has the same id
			// as the message we're looking at and it wasn't called within the last second;
			// prevents Meteor from calling AWS multiple times via the getMedia method
			if ( window.Crusoe.img && (Date.now() - Crusoe.lastCalled) > 3000 && window.Crusoe.img.messageId === messageId ) {
				var result = window.Crusoe.img.img;

				$('#display-message').css({
					'background': 'url( ' + result + ') no-repeat',
					'background-size': 'auto auto',
				});

			} else if ( !Crusoe.lastCalled || Date.now() - Crusoe.lastCalled > 3000) {
				var key = message.key;
				window.Crusoe.lastCalled = Date.now();
				// get the blob? from S3 and attach it as a property here
				Meteor.call("getMedia", key, function (err, result) {
					if ( err ) {
						console.log( err );
						throw new Error;
					}

					$('#display-message').css({
						'background': 'url( ' + result + ') no-repeat',
						'background-size': 'auto auto',
					});

					var img = {
						messageId: messageId,
						img: result
					}
					window.Crusoe.img = img;
				});
			}

		}
			return message;
	}
});

Template.messageModal.events({
  "click .save": function(){
  	console.log('clicked save')
    var messageId = Session.get("currentMessage")._id
    Meteor.call("tagMessage", messageId)
  },

  "click .like": function(){
  	console.log('clicked like')
    var messageId = Session.get("currentMessage")._id
    Meteor.call("likeMessage", messageId)
  }
});
