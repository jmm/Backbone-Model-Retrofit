
var backbone_mod = function ( klass ) {

  var backbone_proto = { 'attrs' : {}, 'methods' : {} };

  var collection;

  var stubs = {};

  stubs.get_set = function ( f ) {

    return function () {

      Backbone.Model.prototype[ f ].apply( this, arguments );

    };

  };

  stubs.get = stubs.get_set( 'get' );

  stubs.set = stubs.get_set( 'set' );


  Object.keys( klass.prototype ).forEach( function ( value, key, array ) {

    key = value;

    value = klass.prototype[ value ];

    collection = value instanceof Function ? 'methods' : 'attrs';


    if ( value instanceof Function ) {

      collection = 'methods';

    }
    // if

    else {

      collection = 'attrs';

    }
    // else


    backbone_proto[ collection ][ key ] = value;

  } );


  backbone_proto.methods.defaults = backbone_proto.attrs;

  klass = Backbone.Model.extend( backbone_proto.methods );

};
// backbone_mod


[

  Jeopardy.Game,

  Jeopardy.Game_UI,

  Jeopardy.Player,

  Jeopardy.Player_UI

].forEach( function ( value, index, array ) {

  backbone_mod( value );

} );

