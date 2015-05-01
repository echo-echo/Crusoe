Router.configure({
	layoutTemplate:'main'
})

Router.map(function(){
  this.route('map', {
    path:'/'
  });
  this.route('feed')
})

Accounts.ui.config({
  passwordSignupFields: "USERNAME_ONLY"
});

// Meteor.startup(function(){
//   // console.log('heyyyy')
//   // $(".button-collapse").sideNav();
// $(document).ready(function(){
//   $(".button-collapse").sideNav();
// });
// });

Template.main.rendered = function () {
 
   $(".button-collapse").sideNav();
};