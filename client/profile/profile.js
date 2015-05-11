Meteor.subscribe("userData");

//use below to open materialize modal
// Template.modal.rendered = function(){
//  $('.modal-trigger').leanModal()
// }

Template.profile.onRendered(function(){
  $('ul.tabs').tabs();
  $('.modal-trigger').leanModal();
});

Template.profile.helpers({
  taggedMessages: function(){
    var result=[]
    var tagged = Meteor.users.find({}).fetch()[0].tagged

    if ( tagged ) {
      tagged.forEach(function(item){
        result.push(Messages.find({_id:item}).fetch()[0]);
      });

      return result;
    }
  },

  userCreated: function(){
    var created = Messages.find({username:Meteor.user().username});
    return created;
  }
});

Template.writeMessage.events({
  "click .submit": function () {
    var message = $('textarea').val();
    var longitude = Number(localStorage.getItem("userLong"));
    var latitude = Number(localStorage.getItem("userLat"));
    var location=[longitude,latitude];

    Meteor.call("addMessage", message, location);
  }
});
