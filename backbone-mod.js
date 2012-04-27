var Backbone_Mod = {};


Backbone_Mod.mod_classes = function ( container, klasses ) {

  var mutators = [

    function ( container, klass ) {

      container[ klass ] = Backbone_Mod.mod_class( container[ klass ] );

    },


    function ( container, klass ) {

      Object.keys( container[ klass ].prototype.defaults ).forEach( function( key, prop ) {

        prop = container[ klass ].prototype.defaults[ key ];

        if ( prop && prop.backbone ) {

          container[ klass ].prototype.defaults[ key ] = prop.backbone.prototype;

        }
        // if

      } );

    }

  ];


  mutators.forEach( function ( mutator ) {

    klasses.forEach( function ( klass ) {

      mutator( container, klass );

    } );

  } );

};


Backbone_Mod.mod_class = function ( klass ) {

  var backbone_proto = { 'attrs' : {}, 'methods' : {} };

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

      if ( ! this.cid ) {

        Backbone.Model.apply( this, arguments );

      }
      // if


      klass.apply( this, arguments );

    };

  };


  var collection;

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


  if ( klass.prototype.parent && klass.prototype.parent.backbone ) {

    klass.prototype.parent = klass.prototype.parent.backbone.prototype;

  }
  // if



  if ( klass.prototype.hasOwnProperty( 'constructor' ) ) {

    backbone_proto.methods.initialize = klass.prototype.constructor;

    if ( klass.prototype.parent && klass.prototype.parent.defaults ) {

      backbone_proto.methods.defaults = _.extend(

        {},

        klass.prototype.parent.defaults,

        backbone_proto.methods.defaults

      );

    }
    // if

  }
  // if



if ( false && "JMMDEBUG" ) {
  backbone_proto.methods.constructor = stubs.ctor( backbone_proto.methods.constructor );


  var base = klass.prototype.parent && klass.prototype.parent.constructor || Backbone.Model;

}

if ( true && "JMMDEBUG" ) {

  var base = Backbone.Model;

}

  var old_klass = klass;

  klass = base.extend( backbone_proto.methods );

  old_klass.prototype.backbone = klass;


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
// mod_class
