Router.configure({
	layoutTemplate:'main'
})

Meteor.submitMessage = function(location){
  $('.img-upload-preview').remove() //remove preview
  var message = Session.get('messageToSend')
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
            context.drawImage(img, 0, 0, 300, 300*img.height/img.width)
            var resizedURL = canvas.toDataURL()
            Meteor.call("addMessage", message, location, resizedURL, filename);
          }
        };
      } else {
        // else, it's a photo the user took with their camera
        var filename = Date.now().toString() + ".jpg";
        var img = document.createElement('img');
        img.src = photo
        img.onload = function(){
          var canvas = document.createElement('canvas');
          var context = canvas.getContext('2d')
          canvas.width = 300;
          canvas.height = 300*img.height/img.width;
          context.drawImage(img, 0, 0, 300, 300*img.height/img.width)
          var resizedURL = canvas.toDataURL()
          Meteor.call("addMessage", message, location, resizedURL, filename);
        }
      }
    } else {
      if (message === '') {
        Materialize.toast("Whoops, that didn't work! Make sure you type a message!", 3000);
      } else {
        Meteor.call("addMessage", message, location);
      }

    }
  $('textarea').val('');
  $('input.media-upload').val('');
};

Router.map(function(){
  this.route('map', {
    path:'/'
  });
  this.route('profile',{
    onBeforeAction: function(){
      if (!Meteor.user()){
        if (!Meteor.loggingIn()){
          Router.go('signin')
        }
      } else {
        this.next()
      }
    }
  });
  this.route('feed')
  this.route('signin')
  this.route('throw')
})

Accounts.ui.config({
  passwordSignupFields: "USERNAME_ONLY"
});



Template.main.rendered = function () {
   $(".button-collapse").sideNav();
};

Template.main.events({
  "click #signout" : function(){
    var user = Meteor.user().username || Meteor.user().profile.name
    Meteor.logout(function(err){
      if(err){
        console.log("there was an error logging out.")
        throw err
      } else {
        Materialize.toast("Goodbye, "+user+"!", 1000)
      }
    });
  },

  "click #signin" : function(){
   $('#modal-signin').openModal();
  }
})

