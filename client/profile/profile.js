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
    console.log(messageId)
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
  //jquery function to append throw-control buttons to the body
    var rotate;
    var rotation = 0;
  //define throw controls html element and function for map rotation:
    var throwControls = ['<a class="waves-effect waves-light btn-large scan-left"><i class="mdi-navigation-arrow-back left"></i></a>',
      '<a class="waves-effect waves-light btn-large throw">Throw!</a>',
      '<a class="waves-effect waves-light btn-large scan-right"><i class="mdi-navigation-arrow-forward right"></i></a>'];
    var transformMap = function(){
      $('#map').css({ 
        transform: 'translate3d(0px, 0px, 0px) rotateX(0deg) rotateZ(' + rotation + 'deg)'
      });
    }; 

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
  //append throw controls to map:
    throwControls.forEach(function(element){ $('.throw-controls').append(element) });
  //listen to scanning buttons and set value of 'rotate':
    $('.scan-left').mousedown(function(){ rotate = 'left'; console.log(rotate); });
    $('.scan-left').mouseup(function(){ rotate = undefined; });

    $('.scan-right').mousedown(function(){ rotate = 'right'; });
    $('.scan-right').mouseup(function(){ rotate = undefined; });
    //read value of 'rotate', change rotation variable, and call transform map to set Z rotation to rotation variable:
    setInterval(function(){
      if (rotate==='left') { rotation += 4; transformMap() }
      if (rotate==='right') { rotation -= 4; transformMap() }
    }, 100)

  //reset UI on throw completion:
  $('.throw').mousedown(function(){
    $('.throw-controls').remove();
    $('.mobile-icons').slideToggle(500, 'linear')
    $('.panel').slideToggle(500, 'linear')
    $('.nav-wrapper').slideToggle(500, 'linear')
    $('nav').slideToggle(500, 'linear')
    if ($(window).width() < 480) {
      $('#map').css({'overflow': 'hidden', 'margin-left': '0px'});
    } else {
      $('#map').css({'overflow': 'hidden', 'margin-left': '300px'});
    }
  });  
  },

  "click .submit": function () {
    var message = $('textarea').val();
    var file = $('input.media-upload')[0].files[0];
    var photo = Session.get("photo");
    console.log("file", file);
    var longitude = Number(localStorage.getItem("userLong"));
    var latitude = Number(localStorage.getItem("userLat"));
    var location=[longitude,latitude];
    $('.img-upload-preview').remove() //remove preview
    // $('input.media-upload')[0].files = undefined; //remove file from element

    if ( file || photo ) {
      if ( file ) {
        // need to convert to format that can be sent to the server and then to S3
        var fr = new FileReader();
        fr.readAsDataURL(file);
        fr.onloadend = function (evt) {
          var mediaAsDataURL = evt.target.result;
          var filename = file.name;
          Meteor.call("addMessage", message, location, mediaAsDataURL, filename);
        };
      }

      var filename = "test.jpg";
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

      console.log("photo data:", data);
      Session.set("photo", data);
    })
  }
});
