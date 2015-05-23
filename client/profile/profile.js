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

          //resize image before uploading to S3
          var img = document.createElement('img');
          img.src = mediaAsDataURL
          img.onload = function(){
            var canvas = document.createElement('canvas');
            var context = canvas.getContext('2d')
            canvas.width = 300;
            canvas.height = 300*img.height/img.width;
<<<<<<< HEAD
            context.drawImage(img, 0, 0, 300, 300*img.height/img.width)
            var resizedURL = canvas.toDataURL()
=======
            context.drawImage(img, 0, 0, 300, 300*img.height/img.width)
            resizedURL = canvas.toDataURL()
>>>>>>> 4bcb2b13984a6ed297f29479b05bb7efbcedde7a
            console.log(mediaAsDataURL)
            console.log(resizedURL)
            Meteor.call("addMessage", message, location, resizedURL, filename);
          }
        };
      } else {
        // else, it's a photo the user just took with their camera
        var filename = Date.now().toString() + ".jpg";
        console.log("filename client side: ", filename);
        var img = document.createElement('img');
        img.src = photo
        img.onload = function(){
          var canvas = document.createElement('canvas');
          var context = canvas.getContext('2d')
          canvas.width = 300;
          canvas.height = 300*img.height/img.width;
          context.drawImage(img, 0, 0, 300, 300*img.height/img.width)
          var resizedURL = canvas.toDataURL()
          console.log(photo)
          console.log(resizedURL)
          Meteor.call("addMessage", message, location, resizedURL, filename);
        }
      }
    } else {
      if (message === '') {
        alert("Whoops! Make sure you type a message!")
      } else {
        Meteor.call("addMessage", message, location);
      }

    }
  $('textarea').val('');
  $('input.media-upload').val('');
};

//use below to open materialize modal
Template.profile.onRendered(function(){
  $('ul.tabs').tabs();
  // $('.modal-trigger').leanModal();
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
