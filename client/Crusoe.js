Router.configure({
	layoutTemplate:'main'
})

Router.map(function(){
  this.route('map', {
    path:'/'
  });
  this.route('profile')
  this.route('feed')
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
        console.log("You've been logged out")
      }
    });
  },
  "click #signin" : function(){
   $('#modal-signin').openModal();
  }
})

