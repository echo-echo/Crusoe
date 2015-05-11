Meteor.methods({
  addMessage: function (text, location, key) {
    var username = Meteor.user() ? Meteor.user().username : "Anonymous";

    Meteor.http.get('http://api.tiles.mapbox.com/v4/geocode/mapbox.places/'+location[0]+','+location[1]+'.json?access_token=pk.eyJ1Ijoiam9zaHVhYmVuc29uIiwiYSI6Im1sT3BqRWcifQ.W7h8nMmj_oI1p4RzChElsQ', function (err, res) {
	 	  var geocode = JSON.parse(res.content)
	 	 	var city = geocode.features[1].text
	 	 	var region = geocode.features[3].text
	 	 	var country = geocode.features[4].text
      Messages.insert({
	      text: text,
	      createdAt: new Date(),
	      username: username,
	      origin: city+", "+country,
	      location: {"type": "Point","coordinates": location},
	      latWeight1m:     Math.random() - 0.5,
	      lngWeight1m:     Math.random() - 0.5,
	      latWeight15m:    Math.random() - 0.5,
	      lngWeight15m:    Math.random() - 0.5,
	      latWeight1hr:    Math.random() - 0.5,
	      lngWeight1hr:    Math.random() - 0.5,
	      latWeight6hr:    Math.random() - 0.5,
	      lngWeight6hr:    Math.random() - 0.5,
        latWeight12hr:   Math.random() - 0.5,
        lngWeight12hr:   Math.random() - 0.5,
        latWeight1day:   Math.random() - 0.5,
        lngWeight1day:   Math.random() - 0.5,
        latWeight3day:   Math.random() - 0.5,
        lngWeight3day:   Math.random() - 0.5,
        latWeight1wk:    Math.random() - 0.5,
        lngWeight1wk:    Math.random() - 0.5,
        latWeight1month: Math.random() - 0.5,
        lngWeight1month: Math.random() - 0.5,
	      likes:[],
	      opens:0
    	});
		});

  },

  tagMessage: function(messageId){
  	Meteor.users.update({username: Meteor.user().username}, {$addToSet:{tagged: messageId}})
  },

  likeMessage: function(messageId){
  	Messages.update({_id:messageId}, {$addToSet:{likes:Meteor.user().username}})
  },

  openMessage: function(messageId){
  	Messages.update({_id:messageId}, {$inc:{opens:1}})
  },
  removeMessage: function(messageId){
    Messages.remove({_id:messageId}, function(err){
      if(err){
        console.log(err);
      }
    });
  }

})


