Router.configure({
	layoutTemplate:'main'
})

Router.map(function(){
  this.route('map', {
    path:'/'
  });
  this.route('profile')
})

Accounts.ui.config({
  passwordSignupFields: "USERNAME_ONLY"
});



Template.main.rendered = function () { 
   $(".button-collapse").sideNav();
};

