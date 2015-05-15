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
    var created = Messages.find({username:Meteor.user().username});
    return created;
  }
});

Template.writeMessage.events({
  "click .submit": function () {
    var message = $('textarea').val();
    var file = $('input.media-upload')[0].files[0];
    var longitude = Number(localStorage.getItem("userLong"));
    var latitude = Number(localStorage.getItem("userLat"));
    var location=[longitude,latitude];
    $('.img-upload-preview').remove() //remove preview
    // $('input.media-upload')[0].files = undefined; //remove file from element

    if ( file ) {
      // need to convert to format that can be sent to the server and then to S3
      var fr = new FileReader();
      fr.readAsDataURL(file);
      fr.onloadend = function (evt) {
        var mediaAsDataURL = evt.target.result;
        var filename = file.name;
        Meteor.call("addMessage", message, location, mediaAsDataURL, filename);
      };

    } else {
      Meteor.call("addMessage", message, location);
    }

    $('textarea').val('');
  }
});
