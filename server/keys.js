Meteor.startup(function(){
 process.env.AWS_ACCESS_KEY_ID = "AKIAJEDHGDLW3LVT2Q3Q";
 process.env.AWS_SECRET_ACCESS_KEY = "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";
 process.env.FB_APP_ID = "1617736865105666";
 process.env.FB_SECRET = "7c63e6d71f5370e7782015f573f90bf9";


});

AWS.config.update({region: 'us-east-1'});

