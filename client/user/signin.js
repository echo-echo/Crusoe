Template.signin.events({
  "submit": function(e, t){
    console.log(e)
    e.preventDefault();
    var username = t.find('#username').value
      , password = t.find('#account-password').value;
    console.log(username,password)
    Meteor.loginWithPassword(username, password, function(err){
      if(err){
        Materialize.toast("Some of your information is incorrect!", 1000)
      } else {
        $('#modal-signin').closeModal();
        Materialize.toast("Hello, "+username+"!", 1000);
        Router.go('map')
      }
    })
    return false;
  },

  "click #facebook" : function(){
    Meteor.loginWithFacebook({}, function(err){
      if (err) {
        console.log(err.reason)
      } else {
        $('#modal-signin').closeModal();
        var user = Meteor.user().profile.name
        Materialize.toast("Hello, "+user+"!", 1000)
        Router.go('map')
      }
    })
  },

  "click #create-account" : function(){
    $('#modal-signin').closeModal();
  },

  "click #signup": function(){
    $('#modal-signin').closeModal();
    $("#modal-signup").openModal()
  }
})
