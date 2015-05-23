Messages = new Mongo.Collection("messages");


Meteor.subscribe("messages");


/* ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
 *         FEED HELPERS / EVENTS
 * ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~ */

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

      $("#map-message-modal").openModal({
        complete: function(){
          $("#display-streetview").hide();
          $("#display-photo").show();
        }
      });

      Meteor.call('openMessage', message._id);
    } else {
      Session.set('currentMessage', message);
      var lng = message.location.coordinates[0];
      var lat = message.location.coordinates[1];
      window.Crusoe.map.panTo([lat,lng]);
    }
  },

  "click .write": function(){
    $("#write").openModal({
      ready : function(){
        $("#upload").click(function () {
          console.log('media clicked')
            $("#media-upload").trigger('click');
        });


      }
    });
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

/* ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
 *   WRITE MESSAGE MODAL HELPERS / EVENTS
 * ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~ */

 Template.writeMessage.events({
  "click .throw": function () {
    var rotate;
    var rotation = 0;
    var leftInt;
    var rightInt;
    var userLat = Number(localStorage.getItem("userLat"));
    var userLong = Number(localStorage.getItem("userLong"));
  //define throw controls html element and function for map rotation:
    var throwControls = ['<a class="waves-effect waves-light btn-large scan-left"><i class="mdi-navigation-arrow-back left"></i></a>',
      '<a class="waves-effect waves-light btn-large throw-it">Throw!</a>',
      '<a class="waves-effect waves-light btn-large scan-right"><i class="mdi-navigation-arrow-forward right"></i></a>'];
    var zoomCall = function(){ window.Crusoe.map.once('moveend', function(){ window.Crusoe.map.panTo([userLat, userLong]) }); }
    zoomCall();
    var transformMap = function(){
      $('#map').css({
        'transform': 'translate3d(0px, 0px, 0px)rotateX(65deg) rotateZ(' + rotation + 'deg)', 'transition': '.1s', '-webkit-transition': '.1s', '-webkit-transform': 'translate3d(0px, 0px, 0px)rotateX(65deg) rotateZ(' + rotation + 'deg)'
      });
    };
    // window.Crusoe.map.dragging.disable();
    // window.Crusoe.map.touchZoom.disable();
    // window.Crusoe.map.doubleClickZoom.disable();
    // window.Crusoe.map.scrollWheelZoom.disable();
    window.Crusoe.map.setZoom(17);
  //jquery function to append throw-control buttons to the body, to both body and mobileNav
    $('body').first().append('<div class="throw-controls"></div>');
    $('.mobileNav').append('<div class="throw-controls"></div>');
    //TODO these slide hiding animations need to be reversed upon completion:
    $('.mobile-icons').slideToggle(500, 'linear')
    $('.panel').slideToggle(500, 'linear')
    $('.nav-wrapper').slideToggle(500, 'linear')
    $('nav').slideToggle(500, 'linear')
  //conditionally set map css for large or small, only difference is 'margin-left'
  if ($(window).width() < 480) {
    $('#map').css({'overflow': 'visible', 'margin-left': '0px'});
  } else {
    $('#map').css({'overflow': 'visible', 'margin-left': '150px'});
  }
  $('#map').css({
    'transform': 'translate3d(0px, 0px, 0px)rotateX(65deg)', '-webkit-transform': 'translate3d(0px, 0px, 0px)rotateX(65deg)',
    'transition': '3s', '-webkit-transition': '3s'
  });
  //append throw controls to map:
    $('html').css({'overflow': 'hidden'});
    throwControls.forEach(function(element){ $('.throw-controls').append(element) });
  //listen to scanning buttons and set value of 'rotate':
    $('.scan-left').mousedown(function(){ rotation = (rotation + 4) % 360; transformMap(); leftInt = setInterval(function(){ rotation = (rotation + 4) % 360; transformMap(); }, 100) });
    $('.scan-left').mouseup(function(){ clearInterval(leftInt) });

    $('.scan-right').mousedown(function(){ rotation = (rotation - 4) % 360; transformMap(); rightInt = setInterval(function(){ rotation = (rotation - 4) % 360; transformMap(); }, 100) });
    $('.scan-right').mouseup(function(){ clearInterval(rightInt)});

          var getPxBounds = window.Crusoe.map.getPixelBounds;
        window.Crusoe.map.getPixelBounds = function () {
          var bounds = getPxBounds.call(this);
          // ... extend the bounds
          bounds.min.x=bounds.min.x-1000;
          bounds.min.y=bounds.min.y-1000;
          bounds.max.x=bounds.max.x+1000;
          bounds.max.y=bounds.max.y+1000;
          return bounds;
      };
    //read value of 'rotate', change rotation variable, and call transform map to set Z rotation to rotation variable:
    // setInterval(function(){
    //   if (rotate==='left') { rotation = (rotation + 4) % 360; transformMap() }
    //   if (rotate==='right') { rotation = (rotation - 4) % 360; transformMap() }
    // }, 100)

  //reset UI on throw completion:
     $('.throw-it').click(function(){
       var currPoint = window.Crusoe.map.latLngToLayerPoint([userLat, userLong]);
       var radAng = -1 * (rotation + 90) * (Math.PI/180);
       var newPoint = window.Crusoe.map.layerPointToLatLng([(150 * Math.cos(radAng)) + currPoint['x'], (150 * Math.sin(radAng)) + currPoint['y']]);
       submitMessage([newPoint['lng'], newPoint['lat']]);
     $('html').css({'overflow': 'scroll'});
      setTimeout(function(){
     $('.throw-controls').remove();
     $('.mobile-icons').slideToggle(500, 'linear')
     $('.panel').slideToggle(500, 'linear')
     $('.panel').css({'display': 'inline'});
     $('.nav-wrapper').slideToggle(500, 'linear')
     $('nav').slideToggle(500, 'linear')
     $('#map').css({
       'transform': 'translate3d(0px, 0px, 0px) rotateX(0) rotateZ(0deg)', '-webkit-transform': 'translate3d(0px, 0px, 0px) rotateX(0) rotateZ(0deg)'
     });
     rotation = 0;
     if ($(window).width() < 480) {
       $('#map').css({'overflow': 'hidden', 'margin-left': '0px'});
     } else {
       $('#map').css({'overflow': 'hidden', 'margin-left': '300px'});
     }

     var getPxBounds = window.Crusoe.map.getPixelBounds;
     window.Crusoe.map.getPixelBounds = function () {
       var bounds = getPxBounds.call(this);
          // ... reset the bounds
       bounds.min.x=bounds.min.x+1000;
       bounds.min.y=bounds.min.y+1000;
       bounds.max.x=bounds.max.x-1000;
       bounds.max.y=bounds.max.y-1000;
       return bounds;
       };
     }, 1400);
    });
  },

  "click .submit": function () {
    var longitude = Number(localStorage.getItem("userLong"));
    var latitude = Number(localStorage.getItem("userLat"));
    var location=[longitude,latitude];
    submitMessage(location);
  },

  "click .takephoto": function() {
    $('input.media-upload').val('');

    MeteorCamera.getPicture({}, function (err, data) {
      if ( err ) {
        console.log(err);
        throw new Error;
      }

      Session.set("photo", data);
    })
  }
});

/* ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
 *      MESSAGE MODAL HELPERS / EVENTS
 * ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~ */

Template.messageModal.helpers({
  message: function(){
    var message = Session.get('currentMessage');
    if((Date.now() - window.Crusoe.lastCalled) > 1000){
      window.Crusoe.lastCalled= Date.now();

      // if a message is found and if it has an AWS lookup key (it has an img)
      // adds loading gif
      if ( message && message.key ) {
        $('#display-photo').css({
          'background': 'url("loading.gif") no-repeat'
        });

        var messageId = message._id;

        // if the global namespace is already storing an image and it has the same id
        // as the message we're looking at and it wasn't called within the last second;
        // prevents Meteor from calling AWS multiple times via the getMedia method
        if ( window.Crusoe.img && window.Crusoe.img.messageId === messageId ) {
          var result = window.Crusoe.img.img;
          $('#display-photo').css({
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

  					$('#display-photo').css({
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
    if(Session.get('currentMessage')) return !!Meteor.user() && Session.get('currentMessage').visible
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
  },

  "click .streetview": function(){
    var message = Session.get("currentMessage");
    var lat = message.location.coordinates[1];
    var lng = message.location.coordinates[0];
    var coords = new google.maps.LatLng(lat, lng);
    if ( $('#display-photo').length ) {
      $('#display-photo').hide();
    }

    $('#display-streetview').show();
    /// NOT SURE WHY BUT $('#display-streetview') isn't returning anything here.
    // $('#display-streetview') //=> []

    var panorama = new google.maps.StreetViewPanorama($('#display-streetview')[0], {
      position: coords
    });
  },

  "click .photoview": function(){
    $('#display-streetview').hide();
    $('#display-photo').show();
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
