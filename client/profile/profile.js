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

Template.profile.helpers({
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
    var file = $('input.media-upload')[0].files;
    console.log("file: ", file);
    var longitude = Number(localStorage.getItem("userLong"));
    var latitude = Number(localStorage.getItem("userLat"));
    var location=[longitude,latitude];

    // necessary to call collection.insert on the client side, was recommended by
    // collectionFS meteor package. when the fsFile is passed to addMessage, only
    // // the file info is sent and not the data.

    if ( file ) {
      var s3 = new AWS.S3();

      // store photo in AWS S3 using key
      s3.upload({
        Bucket: 'crusoe-media',
        Key: file[0].name,
        Body: new Blob(file)
      }, function(err, data){
        if ( err ) {
          console.log(err);
          throw new Error;
        }
        console.log('successfully uploaded woo');
      });
    }

    Meteor.call("addMessage", message, location, file);

    $('textarea').val('');
  }
});
