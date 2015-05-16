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
         $('#modal-confirmation').openModal();
         Meteor.setTimeout(function(){
           $('#modal-confirmation').closeModal();
           $('#modal-signin').closeModal();
         },1000);
         Router.go('profile')
       }
     })
     return false;
  },

  "click #facebook" : function(){
    Meteor.loginWithFacebook({}, function(err){
      if (err) console.log(err.reason)
      else{
        $('#modal-confirmation').openModal();
         Meteor.setTimeout(function(){
           $('#modal-confirmation').closeModal();
           $('#modal-signin').closeModal();
          },1000)
         Router.go('profile')
      }
    })
  } ,

  "click #create-account" : function(){
    $('#modal-signin').closeModal();
  },

  "click #signup": function(){
    $('#modal-signin').closeModal();
    $("#modal-signup").openModal()
  }
})