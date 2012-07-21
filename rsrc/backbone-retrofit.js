/**
 * Retrofit legacy code to function as Backbone.Model subclasses.
 */

var Backbone_Retrofit = {};


/**
 * Modify legacy classes to serve as Backbone.Model subclasses.
 *
 * @param object container Container for classes being modified.
 *
 * @param array klasses Class names within container to modify.
 *
 * @param object base Base class to .extend().
 *
 * @return void
 */

Backbone_Retrofit.mod_classes = function ( container, klasses, base ) {

  // Mutation functions to run on legacy classes.

  var mutators = [

    /**
     * Assign return value of mod_class() to the original class's slot in
     * container.
     *
     * @param object container Container for classes being modified.
     *
     * @param object klass Name of class within container to modify.
     *
     * @return void
     */

    function ( container, klass ) {

      container[ klass ] = Backbone_Retrofit.mod_class(

        container[ klass ], base

      );

    },


    /**
     * JMMDEBUG
     */

    function ( container, klass ) {

      Object.keys( container[ klass ].prototype.defaults ).forEach(

        function( key, prop ) {

          prop = container[ klass ].prototype.defaults[ key ];

          if ( prop && prop.backbone ) {

            container[ klass ].prototype.defaults[ key ] = prop.backbone.prototype;

          }
          // if

        }

      );
      // forEach

    }

  ];


  // Run each mutator fucntion for each input class.

  mutators.forEach( function ( mutator ) {

    klasses.forEach( function ( klass ) {

      mutator( container, klass );

    } );

  } );

};


/**
 * Modify a legacy class to serve as a Backbone.Model subclass.
 *
 * @param object klass Legacy class.
 *
 * @param object base Base class to call .extend() on.
 *
 * @return object Modified klass.
 */

Backbone_Retrofit.mod_class = function ( klass, base ) {

  // Separate attrs and methods.

  var backbone_proto = { defaults : {} };


  // backbone_proto | backbone_proto.defaults

  var collection;


  // Assign each klass.prototype member to the appropriate collection

  Object.keys( klass.prototype ).forEach( function ( prop ) {

    var value = klass.prototype[ prop ];

    collection = value instanceof Function ?

      backbone_proto :

      backbone_proto.defaults;


    collection[ prop ] = value;

  } );


  if ( klass.prototype.parent && klass.prototype.parent.backbone ) {

    klass.prototype.parent = klass.prototype.parent.backbone.prototype;

  }
  // if



  if ( klass.prototype.hasOwnProperty( 'constructor' ) ) {

    // Copy legacy class constructor to Backbone.Model.initialize.

    backbone_proto.initialize = klass.prototype.constructor;


    // Copy parent class defaults to current class.

    if ( klass.prototype.parent && klass.prototype.parent.defaults ) {

      backbone_proto.defaults = _.defaults(

        backbone_proto.defaults,

        klass.prototype.parent.defaults

      );

    }
    // if

  }
  // if


  var old_klass = klass;

  klass = base.extend( backbone_proto );

  old_klass.prototype.backbone = klass;


  // Properties that may be used in legacy classes and are special-cased by
  // Backbone (treated as regular props not attrs)

  var special_props = [ 'id' ];


  // Prevent special props from being treated as attrs with getters / setters.

  special_props.forEach( function ( prop ) {

    delete klass.prototype[ prop ];

  } );


  // Create getters and setters for legacy props that will be treated as attrs.

  Object.keys( backbone_proto.defaults ).forEach( function ( key ) {

    Object.defineProperty( klass.prototype, key, {

      get : Backbone_Retrofit.get_set( 'get', key ),

      set : Backbone_Retrofit.get_set( 'set', key )

    } );

  } );


  return klass;

};
// mod_class


/**
 * Manufacture a getter|setter function for an attr.
 *
 * @param string meth get|set
 *
 * @param string key Attr name
 *
 * @return function getter|setter
 */

Backbone_Retrofit.get_set = function ( meth, key ) {

  var args = Array.prototype.slice.call( arguments, 1 );

  return function () {

    return base.prototype[ meth ].apply(

      this,

      args.concat( Array.prototype.slice.call( arguments ) )

    );

  };

};
// get_set
