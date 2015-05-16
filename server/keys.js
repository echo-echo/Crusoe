Meteor.startup(function(){
  process.env.AWS_ACCESS_KEY_ID = "AKIAJJGNE2PYSJ2DC7LQ"; //add new reset key_id
  process.env.AWS_SECRET_ACCESS_KEY = "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"; //add new reset access_key
});

AWS.config.update({region: 'us-east-1'});
