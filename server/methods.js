Meteor.methods({
  addMessage: function (text, location, media, filename) {
    var username = Meteor.user() ? Meteor.user().username||Meteor.user().profile.name : "Anonymous";

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
	      opens:0,
        key: filename
    	});
		});

    if ( media ) {
      var s3 = new AWS.S3({
        accessKeyId: process.env.AWS_ACCESS_KEY_ID,
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY
      });

      // store photo in AWS S3 using key
      s3.upload({
        Bucket: 'crusoe-media',
        Key: filename,
        Body: media
      }, function(err, data){
        if ( err ) {
          console.log(err);
          throw new Error;
        }
        console.log('successfully uploaded woo');
      });
    }

  },

getMedia: function(keys){
    console.log("getMedia called!");
   // get photo stored in AWS S3 using key, an identifier for the media generated on upload
    Future = Npm.require('fibers/future');
 
    var futureArray = keys.map(function(key){

        var future = new Future()
        var s3 = new AWS.S3({
          accessKeyId: process.env.AWS_ACCESS_KEY_ID,
          secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY
        });
        
        s3.getObject({
          Bucket: 'crusoe-media',
          Key: key[1]
        }, function(err, data){
          if (err){
            future.throw(err)
          } else {
            var dataURL = [key[0],data.Body.toString('ascii')]
            future.return(dataURL)
          }
        })

        return future

      })

      var results = futureArray.map(function(future){
        var result = future.wait()
        return result
      })

      return results


  // getMedia: function(key){
  //   console.log("getMedia called!");
  //  // get photo stored in AWS S3 using key, an identifier for the media generated on upload
  //   Future = Npm.require('fibers/future');
  //   var futureArray = []

  //   for (var item in key){
  //     if (key[item]){
  //       var future = new Future()
  //       var s3 = new AWS.S3({
  //         accessKeyId: process.env.AWS_ACCESS_KEY_ID,
  //         secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY
  //       });

  //       s3.getObject({
  //         Bucket: 'crusoe-media',
  //         Key: key[item]
  //       }, function(err, data){
  //         if (err){
  //           future.throw(err)
  //         } else {
  //           future.return(data.Body.toString('ascii'))
  //         }
  //       })
  //         futureArray.push(future)
  //     }
  //   }

  //     var results = futureArray.map(function(future){
  //       console.log("future array", futureArray)
  //       var result = future.wait()
  //       return result
  //     })

  //     console.log("RESULTS", results)
  //     return results



    // var future = new Future();

    // var s3 = new AWS.S3({
    //   accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    //   secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY
    // });

    // s3.getObject({
    //   Bucket: 'crusoe-media',
    //   Key: key
    // }, function (err, data) {
    //   if ( err ) {
    //     future.throw(err);
    //   } else {
    //     future.return(data.Body.toString('ascii'));
    //   }
    // });

    // return future.wait();
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
  },

   test:function(n){
    Future = Npm.require('fibers/future');
        // build a range of tasks from 0 to n-1
        var range=_.range(n);
        // iterate sequentially over the range to launch tasks
        var futures=_.map(range,function(index){
            var future=new Future();
            console.log("launching task",index);
            // simulate an asynchronous HTTP request using a setTimeout
            Meteor.setTimeout(function(){
                // sometime in the future, return the square of the task index
                future.return(index*index);
            },index*1000);
            // accumulate asynchronously parallel tasks
            return future;
        });
        // iterate sequentially over the tasks to resolve them
        var results=_.map(futures,function(future,index){
            console.log("FUTRE",futures)
            // waiting until the future has return
            var result=future.wait();
            console.log("result from task",index,"is",result);
            // accumulate results
            return result;
        });
        //
        console.log(results);
        return results;
    }

})


