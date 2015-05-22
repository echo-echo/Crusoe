Meteor.subscribe("userData");

var submitMessage = function(location){

  $('.img-upload-preview').remove() //remove preview
  var message = $('textarea').val();
  var file = $('input.media-upload')[0].files[0];
  var photo = Session.get("photo");

    if ( file || photo ) {
      if ( file ) {
        // need to convert to format that can be sent to the server and then to S3
        var fr = new FileReader();
        fr.readAsDataURL(file);
        fr.onloadend = function (evt) {
          var mediaAsDataURL = evt.target.result;
          var filename = file.name;
          var resizedURL;

          //resize image before uploading to S3         
          var img = document.createElement('img');
          img.src = mediaAsDataURL
          img.onload = function(){
            var canvas = document.createElement('canvas');
            var context = canvas.getContext('2d')
            canvas.width = 300;
            canvas.height = 300*img.height/img.width;
            context.drawImage(img, 0, 0, 300, 300*img.height/img.width)  
            resizedURL = canvas.toDataURL()
            console.log(mediaAsDataURL)
            console.log(resizedURL)
            Meteor.call("addMessage", message, location, resizedURL, filename);
          }
        };
      } else {
        // else, it's a photo the user just took with their camera
        var filename = Date.now().toString() + ".jpg";
        console.log("filename client side: ", filename);
        Meteor.call("addMessage", message, location, photo, filename);
      }
    } else {
      Meteor.call("addMessage", message, location);
    }
  $('textarea').val('');
  $('input.media-upload').val('');
};

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
    var messages=[]
    var taggedIds = Meteor.user().tagged
    var keys = []

    if (taggedIds){
      taggedIds.forEach(function(tagId){
        var message = Messages.find({_id:tagId},{fields:{
        location: 0,
        latWeight1m: 0, 
        lngWeight1m: 0, 
        latWeight15m: 0, 
        lngWeight15m: 0,
        latWeight1hr: 0,
        lngWeight1hr: 0,
        latWeight6hr: 0,
        lngWeight6hr: 0,
        latWeight12hr: 0,
        lngWeight12hr: 0,
        latWeight1day: 0,
        lngWeight1day: 0,
        latWeight3day: 0,
        lngWeight3day: 0,
        latWeight1wk: 0,
        lngWeight1wk: 0,
        latWeight1month: 0,
        lngWeight1month: 0}}).fetch()[0]
        messages.push(message)

        if (message.key){
          var key = [message._id, message.key]
          keys.push(key)
        }
      })
    }

    console.log(messages)
    //add logic to prevent getMedia from being called repeatedly
    Meteor.call("getMedia", keys, function(err, result){
      if (err) {
        console.log(err)
      } else {
        messages.forEach(function(message){
          for (var i = 0; i<result.length; i++){
              if (result[i][0] === message._id){
                message.image = result[i][1]
                console.log(messages)

              }
          }
        })
        Session.set("taggedMessages", messages)
      }
    })


    return Session.get("taggedMessages")
  },

  userCreated: function(){
    var username = Meteor.user().username || Meteor.user().profile.name
    var messages = Messages.find({username:username},{fields:{
        location: 0,
        latWeight1m: 0, 
        lngWeight1m: 0, 
        latWeight15m: 0, 
        lngWeight15m: 0,
        latWeight1hr: 0,
        lngWeight1hr: 0,
        latWeight6hr: 0,
        lngWeight6hr: 0,
        latWeight12hr: 0,
        lngWeight12hr: 0,
        latWeight1day: 0,
        lngWeight1day: 0,
        latWeight3day: 0,
        lngWeight3day: 0,
        latWeight1wk: 0,
        lngWeight1wk: 0,
        latWeight1month: 0,
        lngWeight1month: 0}}).fetch()
    var keys = []

    messages.forEach(function(message){
      if (message.key){
        var key = [message._id, message.key]
        keys.push(key)
      }
    })

    Meteor.call("getMedia", keys, function(err, result){
      if (err){
        console.log(err)
      } else {
        messages.forEach(function(message){
          for (var i = 0; i<result.length; i++){
            if (result[i][0] === message._id){
              message.image = result[i][1]
            }
          }
        })
        Session.set("userMessages", messages)
      }
    })


    return Session.get("userMessages")
  }
});

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
