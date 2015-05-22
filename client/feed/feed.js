Messages = new Mongo.Collection("messages");


Meteor.subscribe("messages");

Template.feed.helpers({
  messages: function(){
    var messages = Messages.find({},{sort: {createdAt: -1}}).fetch()
    var userLat = Number(localStorage.getItem("userLat"));
    var userLong = Number(localStorage.getItem("userLong"));
    var result ={visible:[],hidden:[]}


///////////////////////////////////////////////////////////////
/////filter by proximity between message and user location/////
    for (var i = 0; i<messages.length; i++){
      var msgLat = messages[i].location.coordinates[1];
      var msgLong = messages[i].location.coordinates[0];
      var proximity = getProx(msgLat,msgLong,userLat,userLong) * 3280.84; //  to get ft

      messages[i].proximityString = convertProx(proximity)
      messages[i].proximity = Math.round(proximity);

	    if (proximity<1000){
	    	messages[i].visible = true;
        messages[i].proximity = proximity;
		    result.visible.push(messages[i])
	    } else{
	    	messages[i].visible = false;
        messages[i].proximity = proximity;
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
      Session.set('currentMessage', message);
      $("#map-message-modal").openModal();
      Meteor.call('openMessage', message._id);
    } else {
      Session.set('currentMessage', message);
      var lng = message.location.coordinates[0];
      var lat = message.location.coordinates[1];
      window.Crusoe.map.panTo([lat,lng]);
    }
  },

  "click .write": function(){
    $("#write").openModal();
    document.getElementsByClassName("media-upload")[0].addEventListener("change", function(){
      if ( $('input.media-upload')[0].files.length > 0 ) {
        var file = $('input.media-upload')[0].files,
            img = document.getElementsByClassName("img-upload-preview")[0] || document.createElement("img"),
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
    var message = Session.get('currentMessage');
    if((Date.now() - window.Crusoe.lastCalled) > 1000){
      window.Crusoe.lastCalled= Date.now();

      // if a message is found and if it has an AWS lookup key (it has an img)
      // adds loading gif
      if ( message && message.key ) {
        $('#display-message').css({
          'background': 'url("loading.gif") no-repeat'
        });

        var messageId = message._id;

        // if the global namespace is already storing an image and it has the same id
        // as the message we're looking at and it wasn't called within the last second;
        // prevents Meteor from calling AWS multiple times via the getMedia method
        if ( window.Crusoe.img && window.Crusoe.img.messageId === messageId ) {
          var result = window.Crusoe.img.img;
          console.log('changing image')
          $('#display-message').css({
            'background': 'url( ' + result + ') no-repeat',
            'background-size': '100% auto'
          });

  			} else {
  				var key = [[message._id, message.key]]
  				// get the blob? from S3 and attach it as a property here
  				Meteor.call("getMedia", key, function (err, result) {
  					if ( err ) {
  						console.log( err );
              console.log("key: ", key);
  						throw new Error;
  					}
            console.log('setting image')
  					$('#display-message').css({
  						'background': 'url( ' + result[0][1] + ') no-repeat',
  						'background-size': '100% auto'
  					});

  					var img = {
  						messageId: messageId,
  						img: result[0][1]
  					}
  					window.Crusoe.img = img;
  				});
  			}
      }
    }//END DEBOUCE IF

    return message;
  },
  isUser : function(){
  	return !!Meteor.user() && Session.get('currentMessage').visible
  }
});

Template.messageModal.events({
  "click .save": function(){
    var messageId = Session.get("currentMessage")._id
    Meteor.call("tagMessage", messageId)
  },

  "click .like": function(){
    var messageId = Session.get("currentMessage")._id
    Meteor.call("likeMessage", messageId)
<<<<<<< Updated upstream
  },
=======
  }
});

  "click .streetview": function(){
    var message = Session.get("currentMessage");
    var lat = message.location.coordinates[1];
    var lng = message.location.coordinates[0];
    var coords = new google.maps.LatLng(lat, lng);
    if ( $('#display-photo').length ) {
      $('#display-photo').toggle();
    }
    $('#display-streetview').toggle();

    var panorama = new google.maps.StreetViewPanorama($('#display-streetview')[0], {
      position: coords
    });
>>>>>>> Stashed changes

  "click .streetview": function(){
    var message = Session.get("currentMessage");
    var lat = message.location.coordinates[1];
    var lng = message.location.coordinates[0];
    var coords = new google.maps.LatLng(lat, lng);
    if ( !$('#display-message').length ) {
      $('.view-msg-container p').after('<div id="display-message"></div>');
    }
    var panorama = new google.maps.StreetViewPanorama($('#display-message')[0], {
      position: coords
    });

    $('')
  }
});


/*~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
              HELPER
~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~*/

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

var convertProx = function(dist){
  if(dist > 5280){
    dist/=5280
    dist = Math.round(dist)
    return dist.toString()+ " miles"
  } else {
    dist = Math.round(dist)
    return dist.toString()+ " ft"
  }
}
