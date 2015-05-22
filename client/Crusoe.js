Router.configure({
	layoutTemplate:'main'
})

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
})

Accounts.ui.config({
  passwordSignupFields: "USERNAME_ONLY"
});



Template.main.rendered = function () {
   $(".button-collapse").sideNav();
};

Template.main.events({
  "click #signout" : function(){
    Meteor.logout(function(err){
      if(err){
        console.log("there was an error logging out.")
        throw err
      } else {

        Meteor.setTimeout(function(){
          $('#modal-signout-confirmation').openModal()
        },500);

        Meteor.setTimeout(function(){
          $('#modal-signout-confirmation').closeModal()
        }, 2000);

        console.log("You've been logged out")
      }
    });
  },

  "click #signin" : function(){
   $('#modal-signin').openModal();
  },

  "click .dropdown-button":function(){
    $(".dropdown-button").dropdown();
  }
})

