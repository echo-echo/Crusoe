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
    var files = $('input.media-upload')[0].files;
    var longitude = Number(localStorage.getItem("userLong"));
    var latitude = Number(localStorage.getItem("userLat"));
    var location=[longitude,latitude];

    // necessary to call collection.insert on the client side, was recommended by
    // collectionFS meteor package. when the fsFile is passed to addMessage, only

    // // the file info is sent and not the data.
    
    // if ( files.length ) {
    //   for ( var i = 0, len = files.length; i < len; i++ ) {
    //     Media.insert(files[i], function (err, filObj) {
    //       if ( err ) {
    //         console.log(err);
    //         throw new Error;
    //       }
    //       var url = "http://s3.amazonaws.com/crusoe-media/media/" + filObj._id + "-" + filObj.name();
    //       Meteor.call("addMessage", message, location, url);
    //     });
    //   }

    Meteor.call("addMessage", message, location);

    $('textarea').val('');
  }
});
