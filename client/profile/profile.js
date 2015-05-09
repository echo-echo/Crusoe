Meteor.subscribe("userData");

Template.profile.rendered = function(){
  $('ul.tabs').tabs()
  $('.modal-trigger').leanModal()
}

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

Template.profile.events({
  "click .submit": function () {
    var message = $('textarea').val();
    var longitude = Number(localStorage.getItem("userLong"));
    var latitude = Number(localStorage.getItem("userLat"));
    var location=[longitude,latitude];

    Meteor.call("addMessage", message, location);
  }
});
