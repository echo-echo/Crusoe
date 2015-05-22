Template.throw.onRendered(function () {

    var rotate;
    var rotation = 0;
    var leftInt;
    var rightInt;
    var userLat = Number(localStorage.getItem("userLat"));
    var userLong = Number(localStorage.getItem("userLong"));
  //define throw controls html element and function for map rotation:
    // var throwControls = ['<a class="waves-effect waves-light btn-large scan-left"><i class="mdi-navigation-arrow-back left"></i></a>',
    //   '<a class="waves-effect waves-light btn-large throw-it">Throw!</a>',
    //   '<a class="waves-effect waves-light btn-large scan-right"><i class="mdi-navigation-arrow-forward right"></i></a>'];
    var zoomCall = function(){ window.Crusoe.map.once('moveend', function(){ window.Crusoe.map.panTo([userLat, userLong]) }); }
    zoomCall();
    var transformMap = function(){
      $('#map').css({ 
        'transform': 'translate3d(0px, 0px, 0px)rotateX(65deg) rotateZ(' + rotation + 'deg) scale(1.5, 1.5)', 'transition': '.1s', '-webkit-transition': '.1s', '-webkit-transform': 'translate3d(0px, 0px, 0px)rotateX(65deg) rotateZ(' + rotation + 'deg) scale(1.5, 1.5)'
      }); 
    }; 
    // window.Crusoe.map.dragging.disable();
    // window.Crusoe.map.touchZoom.disable();
    // window.Crusoe.map.doubleClickZoom.disable();
    // window.Crusoe.map.scrollWheelZoom.disable();
    window.Crusoe.map.setZoom(17); 
  //jquery function to append throw-control buttons to the body, to both body and mobileNav
    // $('body').first().append('<div class="throw-controls"></div>');
    // $('.mobileNav').append('<div class="throw-controls"></div>');
    //TODO these slide hiding animations need to be reversed upon completion:
    $('.mobile-icons').slideToggle(500, 'linear')
    $('.panel').slideToggle(500, 'linear')
    $('.nav-wrapper').slideToggle(500, 'linear')
    $('nav').slideToggle(500, 'linear')
  //conditionally set map css for large or small, only difference is 'margin-left'
  if ($(window).width() < 480) {
    $('#map').css({'overflow': 'visible', 'margin-left': '0px'});
  } else {
    $('#map').css({'overflow': 'visible', 'margin-left': '150px'});
  }
  $('#map').css({ 
    'transform': 'translate3d(0px, 0px, 0px) rotateX(65deg) scale(1.5, 1.5)', '-webkit-transform': 'translate3d(0px, 0px, 0px)rotateX(65deg) scale(1.5, 1.5)', 
    'transition': '3s', '-webkit-transition': '3s'
  });
  //append throw controls to map:
    // $('html').css({'overflow': 'hidden'});
    // throwControls.forEach(function(element){ $('.throw-controls').append(element) });
  //listen to scanning buttons and set value of 'rotate':
    $('.scan-left').mousedown(function(){ rotation = (rotation + 4) % 360; transformMap(); leftInt = setInterval(function(){ rotation = (rotation + 4) % 360; transformMap(); }, 100) });
    $('.scan-left').mouseup(function(){ clearInterval(leftInt) });

    $('.scan-right').mousedown(function(){ rotation = (rotation - 4) % 360; transformMap(); rightInt = setInterval(function(){ rotation = (rotation - 4) % 360; transformMap(); }, 100) });
    $('.scan-right').mouseup(function(){ clearInterval(rightInt)});

          var getPxBounds = window.Crusoe.map.getPixelBounds;
        window.Crusoe.map.getPixelBounds = function () {
          var bounds = getPxBounds.call(this);
          // ... extend the bounds
          bounds.min.x=bounds.min.x-200;
          bounds.min.y=bounds.min.y-200;
          bounds.max.x=bounds.max.x+200;
          bounds.max.y=bounds.max.y+200;
          return bounds;
      };  
    //read value of 'rotate', change rotation variable, and call transform map to set Z rotation to rotation variable:
    // setInterval(function(){
    //   if (rotate==='left') { rotation = (rotation + 4) % 360; transformMap() }
    //   if (rotate==='right') { rotation = (rotation - 4) % 360; transformMap() }
    // }, 100)


})

Template.throw.events({
  // "click .mobile-write": function(event){
  //   $("#write").openModal();
  // }
})