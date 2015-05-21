Meteor.subscribe("userData");

//use below to open materialize modal
Template.profile.onRendered(function(){
  $('ul.tabs').tabs();
  $('.modal-trigger').leanModal();
});

Template.userMessages.events({
  'click #delete' : function(){
    Session.set('toDelete',this._id);
    $('#promptDelete').openModal();
  }
})
Template.promptDelete.events({
  'click #confirmDeletion' : function(){
    var messageId = Session.get('toDelete')
    $('#promptDelete').closeModal()
    Meteor.call('removeMessage',messageId, function(err, result){
      if(err){
        $('#error').openModal();
      } else {
        $('#confirmDelete').openModal();
      }
    })
  }
})

Template.profileView.helpers({
  taggedMessages: function(){
    var result=[]
    var tagged = Meteor.users.find({}).fetch()[0].tagged

    if ( tagged ) {
      tagged.forEach(function(item){
        result.push(Messages.find({_id:item}).fetch()[0]);
      });

      return result;
    }
  },

  userCreated: function(){
    var username = Meteor.user().username || Meteor.user().profile.name
    var created = Messages.find({username:username});
    return created;
  }
});

Template.writeMessage.events({
  "click .throw": function () {
    var message = $('textarea').val();
    var rotate;
    var rotation = 0 % 360;
    var userLat = Number(localStorage.getItem("userLat"));
    var userLong = Number(localStorage.getItem("userLong"));
  //define throw controls html element and function for map rotation:
    var throwControls = ['<a class="waves-effect waves-light btn-large scan-left"><i class="mdi-navigation-arrow-back left"></i></a>',
      '<a class="waves-effect waves-light btn-large throw-it">Throw!</a>',
      '<a class="waves-effect waves-light btn-large scan-right"><i class="mdi-navigation-arrow-forward right"></i></a>'];
    var transformMap = function(){
      $('#map').css({ 
        'transform': 'translate3d(0px, 0px, 0px)rotateX(65deg) rotateZ(' + rotation + 'deg)', 'transition': '.2s', '-webkit-transition': '.2s', '-webkit-transform': 'translate3d(0px, 0px, 0px)rotateX(65deg) rotateZ(' + rotation + 'deg)'
      }); 
    }; 

    window.Crusoe.map.panTo([userLat, userLong]);
    setTimeout(function(){window.Crusoe.map.setZoom(15)}, 800);//TODO set listener on finished panning to fire zoom.  This is a stopgap because zoom was being called before panning completed

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
    throwControls.forEach(function(element){ $('.throw-controls').append(element) });
  //listen to scanning buttons and set value of 'rotate':
    $('.scan-left').mousedown(function(){ rotate = 'left'; console.log(rotate); });
    $('.scan-left').mouseup(function(){ rotate = undefined; });

    $('.scan-right').mousedown(function(){ rotate = 'right'; });
    $('.scan-right').mouseup(function(){ rotate = undefined; });

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
    setInterval(function(){
      if (rotate==='left') { rotation += 4; transformMap() }
      if (rotate==='right') { rotation -= 4; transformMap() }
    }, 100)

  //reset UI on throw completion:
     $('.throw-it').click(function(){
       var currPoint = window.Crusoe.map.latLngToLayerPoint([userLat, userLong]);
       var radAng = -1 * (rotation + 90) * (Math.PI/180);
       var newPoint = window.Crusoe.map.layerPointToLatLng([(150 * Math.cos(radAng)) + currPoint['x'], (150 * Math.sin(radAng)) + currPoint['y']]);
  // console.log(newPoint);
       Meteor.call("addMessage", message, [newPoint['lng'], newPoint['lat']]);

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
    var message = $('textarea').val();
    var file = $('input.media-upload')[0].files[0];
    var photo = Session.get("photo");
    var longitude = Number(localStorage.getItem("userLong"));
    var latitude = Number(localStorage.getItem("userLat"));
    var location=[longitude,latitude];
    $('.img-upload-preview').remove() //remove preview

    if ( file || photo ) {
      if ( file ) {
        // need to convert to format that can be sent to the server and then to S3
        var fr = new FileReader();
        fr.readAsDataURL(file);
        fr.onloadend = function (evt) {
          var mediaAsDataURL = evt.target.result;
          var filename = Date.now().toString() + file.name;
          Meteor.call("addMessage", message, location, mediaAsDataURL, filename);
        };
      }

      // else, it's a photo the user just took with their camera
      var filename = Date.now().toString() + ".jpg";
      Meteor.call("addMessage", message, location, photo, filename);

    } else {
      Meteor.call("addMessage", message, location);
    }

    $('textarea').val('');
    $('input.media-upload').val('');
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
