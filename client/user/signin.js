Template.signin.events({
  "submit": function(e, t){
    console.log(e)
    e.preventDefault();
    var username = t.find('#username').value
      , password = t.find('#account-password').value;
    console.log(username,password)
    Meteor.loginWithPassword(username, password, function(err){
      if(err){
        $('#modal-warning').openModal();
        Meteor.setTimeout(function(){
          $('#modal-warning').closeModal();
        },1000);
      } else {
        $('#modal-signin').closeModal();
        Meteor.setTimeout(function(){
          $('#modal-confirmation').openModal();
        },500);
        Meteor.setTimeout(function(){
          $('#modal-confirmation').closeModal();
        },2000);
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
        Meteor.setTimeout(function(){
          $('#modal-confirmation').openModal();
          },500);
        Meteor.setTimeout(function(){
          $('#modal-confirmation').closeModal();
        },2000);
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
