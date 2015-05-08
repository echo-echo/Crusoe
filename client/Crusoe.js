Router.configure({
	layoutTemplate:'Map'
})

Router.map(function(){
  this.route('feed', {
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

