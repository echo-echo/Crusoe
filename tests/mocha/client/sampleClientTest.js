var should = chai.should()
var expect = chai.expect


if (!(typeof MochaWeb === 'undefined')){
  MochaWeb.testOnly(function(){

    describe('Crusoe window object', function(){
      it("should exist", function(){
       should.exist(window.Crusoe)
      })
      it("should have a lastCalled property", function(){
       should.exist(window.Crusoe.lastCalled)
      })
      it("should have a map property", function(){
        should.exist(window.Crusoe.map);
      })
      it("should have mapbox", function(){
       should.exist(Mapbox)
      })
      it("should have google maps", function(){
       should.exist(GoogleMaps)
      })
    })

    describe('Messages', function(){
      it("should be able to add messages", function(){

      })
    })

    describe('Users', function(){
      it("should be able to add messages", function(){

      })
    })
  });
}
