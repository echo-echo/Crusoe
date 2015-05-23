
Template.throw.onRendered(function () {
  if (!window.Crusoe.map){ Router.go("map",{}) }
  var rotate;
  var rotation = 0;
  var leftInt;
  var rightInt;
  var userLat = Number(localStorage.getItem("userLat"));
  var userLong = Number(localStorage.getItem("userLong"));
  var zoomCall = function(){ window.Crusoe.map.once('moveend', function(){ window.Crusoe.map.panTo([userLat, userLong]) }); }
  zoomCall();
  var transformMap = function(){
    $('#map').css({ 
      'transform': 'translate3d(0px, 0px, 0px)rotateX(65deg) rotateZ(' + rotation + 'deg) scale(1.5, 1.5)', 'transition': '.1s', '-webkit-transition': '.1s', '-webkit-transform': 'translate3d(0px, 0px, 0px)rotateX(65deg) rotateZ(' + rotation + 'deg) scale(1.5, 1.5)'
    }); 
  }; 
    window.Crusoe.map.dragging.disable();
    window.Crusoe.map.touchZoom.disable();
    window.Crusoe.map.doubleClickZoom.disable();
    window.Crusoe.map.scrollWheelZoom.disable();
    window.Crusoe.map.setZoom(17); 
  $('#autopan').hide();
  $('.panel').hide(); 
  $('#map').css({'overflow': 'visible', 'margin-left': '150px'});
  $('#map').css({ 
    'transform': 'translate3d(0px, 0px, 0px) rotateX(65deg) scale(1.5, 1.5)', '-webkit-transform': 'translate3d(0px, 0px, 0px)rotateX(65deg) scale(1.5, 1.5)', 
    'transition': '3s', '-webkit-transition': '3s'
  });
  $('html').css({'overflow': 'hidden'});

  $('.scan-left').mousedown(function(){ rotation = (rotation + 4) % 360; transformMap(); leftInt = setInterval(function(){ rotation = (rotation + 4) % 360; transformMap(); }, 100) });
  $('.scan-left').mouseup(function(){ clearInterval(leftInt) });

  $('.scan-right').mousedown(function(){ rotation = (rotation - 4) % 360; transformMap(); rightInt = setInterval(function(){ rotation = (rotation - 4) % 360; transformMap(); }, 100) });
  $('.scan-right').mouseup(function(){ clearInterval(rightInt)});

        var getPxBounds = window.Crusoe.map.getPixelBounds;
      window.Crusoe.map.getPixelBounds = function () {
        var bounds = getPxBounds.call(this);
        // ... extend the bounds
        bounds.min.x=bounds.min.x-400;
        bounds.min.y=bounds.min.y-400;
        bounds.max.x=bounds.max.x+400;
        bounds.max.y=bounds.max.y+400;
        return bounds;
    };  

 $('.throw-it').click(function(){
     clearInterval(rightInt); //clear intervals in case they are left active, mobile bug
     clearInterval(leftInt);
     var currPoint = window.Crusoe.map.latLngToLayerPoint([userLat, userLong]);
     var radAng = -1 * (rotation + 90) * (Math.PI/180);
     var newPoint = window.Crusoe.map.layerPointToLatLng([(150 * Math.cos(radAng)) + currPoint['x'], (150 * Math.sin(radAng)) + currPoint['y']]);
     Meteor.submitMessage([newPoint['lng'], newPoint['lat']]);
   $('html').css({'overflow': 'scroll'});  
    setTimeout(function(){
   $('.mobile-icons').slideToggle(500, 'linear')
   $('.panel').slideToggle(500, 'linear')
   $('.panel').css({'display': 'inline'});
   $('#map').css({ 
     'transform': 'translate3d(0px, 0px, 0px) rotateX(0) rotateZ(0deg) scale(1, 1)', '-webkit-transform': 'translate3d(0px, 0px, 0px) rotateX(0) rotateZ(0deg) scale(1, 1)'
   });
   rotation = 0;
   var getPxBounds = window.Crusoe.map.getPixelBounds;
   window.Crusoe.map.getPixelBounds = function () {
     var bounds = getPxBounds.call(this);
        // ... reset the bounds
     bounds.min.x=bounds.min.x+400;
     bounds.min.y=bounds.min.y+400;
     bounds.max.x=bounds.max.x-400;
     bounds.max.y=bounds.max.y-400;
     return bounds;
     }; 
   window.Crusoe.map.dragging.enable();
   window.Crusoe.map.touchZoom.enable();
   window.Crusoe.map.doubleClickZoom.enable();
   window.Crusoe.map.scrollWheelZoom.enable();
   Router.go("map",{});
   }, 800);

  }); 
})
