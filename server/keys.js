Meteor.startup(function(){
  process.env.AWS_ACCESS_KEY_ID = ""; //add new reset key_id
  process.env.AWS_SECRET_ACCESS_KEY = ""; //add new reset access_key
});

AWS.config.update({region: 'us-east-1'});
