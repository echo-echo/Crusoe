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
  //jquery function to append throw-control buttons to the body

    var throwControls = ['<a class="waves-effect waves-light btn-large scan-left"><i class="mdi-navigation-arrow-back left"></i></a>',
      '<a class="waves-effect waves-light btn-large throw">Throw!</a>',
      '<a class="waves-effect waves-light btn-large scan-right"><i class="mdi-navigation-arrow-forward right"></i></a>'];
    $('#map').append('<div class="throw-controls"></div>');
    throwControls.forEach(function(element){ $('.throw-controls').append(element) });

   $('.scan-left').mousedown(function(){ console.log('go left young man')})
   $('.scan-left').mouseup(function(){ console.log('stop going left')})

   $('.scan-right').mousedown(function(){ console.log('go right young man')})
   $('.scan-right').mouseup(function(){ console.log('stop going right')})
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
