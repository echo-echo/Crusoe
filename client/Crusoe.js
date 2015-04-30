Router.configure({
	layoutTemplate:'main'
})

Router.map(function(){
  this.route('map', {
    path:'/'
  });
  this.route('feed')
})

