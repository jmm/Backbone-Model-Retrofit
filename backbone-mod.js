
var backbone_mod = function ( klass ) {

  var backbone_proto = { 'attrs' : {}, 'methods' : {} };

  var collection;

  var stubs = {};


  stubs.get_set = function ( meth, key ) {

    var args = Array.prototype.slice.call( arguments, 1 );

    return function () {

      return Backbone.Model.prototype[ meth ].apply(

        this,

        args.concat( Array.prototype.slice.call( arguments ) )

      );

    };

  };


  stubs.ctor = function ( klass ) {

    return function () {

      Backbone.Model.call( this );

      klass.apply( this, arguments );

    };

  };


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


  if ( backbone_proto.methods.hasOwnProperty( 'constructor' ) ) {

    // backbone_proto.methods.initialize = backbone_proto.methods.constructor;




backbone_proto.methods.defaults = _.extend( {}, klass.prototype.parent.defaults, backbone_proto.methods.defaults );




    // delete backbone_proto.methods.constructor;

  }
  // if

  else {

    // backbone_proto.methods.initialize = klass;



    backbone_proto.methods.constructor = klass;

  }
  // else


  backbone_proto.methods.constructor = stubs.ctor( backbone_proto.methods.constructor );


  var base = klass.prototype.parent && klass.prototype.parent.constructor || Backbone.Model;

  klass = base.extend( backbone_proto.methods );


  if ( backbone_proto.attrs.hasOwnProperty( 'id' ) ) {

    delete backbone_proto.attrs.id;

  }
  // if


  Object.keys( backbone_proto.attrs ).forEach( function ( key, index, attrs ) {

    Object.defineProperty( klass.prototype, key, {

      get: stubs.get_set( 'get', key ),

      set: stubs.get_set( 'set', key )

    } );

  } );


  return klass;

};
// backbone_mod


[

  'Game',

  'Game_UI',

  'Player',

  'Player_UI'

].forEach( function ( value, index, array ) {

  if ( value == 'Game_UI' ) {

    Jeopardy.Game_UI.prototype.parent = Jeopardy.Game.prototype;

  }
  // if


  else if ( value == 'Player_UI' ) {

    Jeopardy.Player_UI.prototype.parent = Jeopardy.Player.prototype;

  }
  // else if


  Jeopardy[ value ] = backbone_mod( Jeopardy[ value ] );


  if ( value == 'Player_UI' ) {

    Jeopardy.Game_UI.prototype.defaults.player_class = Jeopardy.Player_UI.prototype;

  }
  // else if

} );
