Meteor.methods({
  addMessage: function (text, location) {
    var username = Meteor.user() ? Meteor.user().username : "Anonymous";

      Messages.insert({
      text: text,
      createdAt: new Date(),
      username: username,
      location: {"type": "Point","coordinates": location},
      latWeight15s: Math.random() - 0.5,
      lngWeight15s: Math.random() - 0.5,
      latWeight1m: Math.random() - 0.5,
      lngWeight1m: Math.random() - 0.5,
      latWeight15m: Math.random() - 0.5,
      lngWeight15m: Math.random() - 0.5,
      latWeight1hr: Math.random() - 0.5,
      lngWeight1hr: Math.random() - 0.5,
      latWeight6hr: Math.random() - 0.5,
      lngWeight6hr: Math.random() - 0.5,
      likes:[],
      opens:[]
    });
  },

  tagMessage: function(messageId){
  	Meteor.users.update({username: Meteor.user().username}, {$addToSet:{tagged: messageId}})
  },

  likeMessage: function(messageId){
  	Messages.update({_id:messageId}, {$addToSet:{likes:Meteor.user().username}})
  },

  openMessage: function(messageId){
  	Messages.update({_id:messageId}, {$addToSet:{opens:Meteor.user().username}})
  }

})


