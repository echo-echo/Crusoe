
Template.throw.onRendered(function () {
  if (!window.Crusoe.map){ Router.go("map",{}) }//redirect to map if throw route is navigated to through address bar, which means map wont be intialized

  var rotate;
  var rotation = 0;
  var leftInt;
  var rightInt;
  var distance = 0;
  var throwInt;
  var xTilt = 0;
  var scale = 1;
  var userLat = Number(localStorage.getItem("userLat"));
  var userLong = Number(localStorage.getItem("userLong"));
  (function(){ window.Crusoe.map.once('moveend', function(){ window.Crusoe.map.panTo([userLat, userLong]) }); })();
  var transformMap = function(){
    $('#map').css({ 
      'transform': 'translate3d(0px, 0px, 0px)rotateX(' + xTilt + 'deg) rotateZ(' + rotation + 'deg) scale(' + scale + ',' + scale + ')', 'transition': '.1s', '-webkit-transition': '.1s', '-webkit-transform': 'translate3d(0px, 0px, 0px)rotateX(' + xTilt + 'deg) rotateZ(' + rotation + 'deg) scale(' + scale + ',' + scale + ')'
    }); 
  }; 
  window.Crusoe.map.dragging.disable();
  window.Crusoe.map.touchZoom.disable();
  window.Crusoe.map.doubleClickZoom.disable();
  window.Crusoe.map.scrollWheelZoom.disable();
  window.Crusoe.map.setZoom(16); 

  $('#autopan').hide();
  $('.mobile-icons').slideToggle(500, 'linear')
  if ($(window).width() < 480) {
    $('#map').css({'overflow': 'visible','position': 'fixed', 'margin-left': '150px'});
  } else {
  scale = 1.5;    
  xTilt = 65;  
  $('.panel').hide(); 
  $('#map').css({ 
    'transform': 'translate3d(0px, 0px, 0px) rotateX(' + xTilt + 'deg) scale(' + scale + ',' + scale + ')', '-webkit-transform': 'translate3d(0px, 0px, 0px)rotateX(65deg) scale(' + scale + ',' + scale + ')', 
    'transition': '3s', '-webkit-transition': '3s', 'overflow': 'visible', 'margin-left': '150px'
  });
  }
  $('.page-wrapper').css({'overflow': 'hidden'});

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
 $('.throw-it').mousedown(function(){ 
  throwInt = setInterval(function(){ distance = Math.min(distance += 10, 500) ; $('.throw-it').css({'background-color': 'rgba(' + (distance/2) + ',100,' + (distance/4) + ',0.5)'}) }, 100);
 });   
 $('.throw-it').mouseup(function(){
     clearInterval(throwInt);
     clearInterval(rightInt); //clear intervals in case they are left active, mobile bug
     clearInterval(leftInt);
     $('.throw-button-col').fadeToggle()
     var currPoint = window.Crusoe.map.latLngToLayerPoint([userLat, userLong]);
     var radAng = -1 * (rotation + 90) * (Math.PI/180);
     console.log(distance);
     var newPoint = window.Crusoe.map.layerPointToLatLng([(distance * Math.cos(radAng)) + currPoint['x'], (distance * Math.sin(radAng)) + currPoint['y']]);
      
      var animIcon = L.divIcon({
          className:'anim-from',
          html:'<div class="marker><img src=""/></div>',
          iconSize: [35, 46]
        }),
          animIconTo = L.divIcon({
          className:'anim-to',
          html:'<div class="marker"><img src=""/></div>',
          iconSize: [35, 46]
        });

  L.marker([userLat, userLong],{icon:animIcon}).addTo(window.Crusoe.map);
  L.marker([newPoint['lat'], newPoint['lng']] ,{icon:animIconTo}).addTo(window.Crusoe.map);
  var animTo = $('.anim-to').offset();
  var animFrom = $('.anim-from').offset();
  $('yield').css({'transform-style': 'preserve-3d'});
  $('body').append('<img src="message-user.png" class="throw-anim" style="top:' + animFrom['top'] + 'px; left:' + animFrom['left'] + 'px;position:absolute; width:40px;">');
  setTimeout(function(){ $('.throw-anim').css({ 'transform': 'rotateX(360deg)', 'left': animTo['left'], 'top': animTo['top']  });}, 50);
    $('html').css({'overflow': 'scroll'});
  setTimeout(function(){
    $('.mobile-icons').slideToggle(500, 'linear')
    $('.panel').slideToggle(500, 'linear');
    $('.panel').css({'display': 'inline'});
   // $('#map').css({ 
   //   'transform': 'translate3d(0px, 0px, 0px) rotateX(0) rotateZ(0deg) scale(1, 1)', '-webkit-transform': 'translate3d(0px, 0px, 0px) rotateX(0) rotateZ(0deg) scale(1, 1)'
   // });
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
   Meteor.submitMessage([newPoint['lng'], newPoint['lat']]);  
   $('.throw-anim').remove();
   distance = 0;
   Router.go("map",{});
   }, 2000);
  }); 
});
