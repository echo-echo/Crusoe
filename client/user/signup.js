Template.signup.events({
  "submit": function(e, t){
    console.log(e)
     e.preventDefault();
     var password1 = t.find('#account-password2').value
        , password2 = t.find('#account-password1').value;

     if(password2 === password1){
       var username = t.find('#username-signup').value

       Accounts.createUser({
         username : username,
         password : password1
       })

       $('#modal-signup').closeModal();

      Meteor.setTimeout(function(){
          $('#modal-confirmation').openModal();
       },500);

       Meteor.setTimeout(function(){
         $('#modal-confirmation').closeModal();
       },2000);

       Router.go('map')

     } else {
       $('#modal-warning').openModal();
       Meteor.setTimeout(function(){
         $('#modal-warning').closeModal()
       },1000);

     }
    return false;
   }
})
