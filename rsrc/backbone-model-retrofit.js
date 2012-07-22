/**
 * Retrofit legacy classes to function as Backbone.Model classes.
 */

var Backbone_Model_Retrofit = {};


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

Backbone_Model_Retrofit.retrofit_classes = function ( container, klasses, base ) {

  // Retrofitter functions to run on legacy classes.

  var retrofitters = [

    this.retrofit_class,

    this.resync_protos

  ];
  // retrofitters


  // Run each retrofitter function for each input class.

  retrofitters.forEach( function ( retrofitter ) {

    klasses.forEach( function ( klass ) {

      retrofitter( container, klass, base );

    } );

  } );

};
// retrofit_classes


/**
 * Modify a legacy class to serve as a Backbone.Model subclass.
 *
 * @param object container Container for classes being modified.
 *
 * @param object klass Legacy class.
 *
 * @param object base Base class to call .extend() on.
 *
 * @return object Modified klass.
 */

Backbone_Model_Retrofit.retrofit_class = function ( container, klass, base ) {

  var klass_name = klass;

  klass = container[ klass ];


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


  // If klass has a parent property that refers to a class that has been
  // retrofitted for Backbone, update the property to refer to the retrofitted
  // class.

  if ( klass.prototype.parent && klass.prototype.parent.__backbone__ ) {

    klass.prototype.parent = klass.prototype.parent.__backbone__.prototype;

  }
  // if


  if ( klass.prototype.hasOwnProperty( 'constructor' ) ) {

    // Copy legacy class constructor to `initialize`.

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

  // Store a reference to the Backbone-retrofitted class in the original class.

  old_klass.prototype.__backbone__ = klass;


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

      get : Backbone_Model_Retrofit.get_set( base, 'get', key ),

      set : Backbone_Model_Retrofit.get_set( base, 'set', key )

    } );

  } );


  container[ klass_name ] = klass;

};
// retrofit_class


/**
 * Adapt retrofitted classes to retrofitting of other classes.
 *
 * Now that all original classes have been retrofitted, process them again
 * to find props from their prototypes (now in prototype.defaults due to
 * retrofitting) that contain classes that have themselves been retrofitted.
 * Update the property to refer to the retrofitted version of the class.
 *
 * @param obj container Container for klasses being modified.
 *
 * @param obj klass Name of class within container to modify.
 *
 * @return void
 */

Backbone_Model_Retrofit.resync_protos = function ( container, klass ) {

  klass = container[ klass ];

  Object.keys( klass.prototype.defaults ).forEach(

    function( key, prop ) {

      prop = klass.prototype.defaults[ key ];

      // The class has been retrofitted, and a reference to the retrofitted
      // version stored in `__backbone__`.

      if ( prop && prop.__backbone__ ) {

        klass.prototype.defaults[ key ] =

          prop.__backbone__.prototype;

      }
      // if

    }

  );
  // forEach

};
// resync_protos


/**
 * Manufacture a getter|setter function for an attr.
 *
 * @param string meth get|set
 *
 * @param string key Attr name
 *
 * @return function getter|setter
 */

Backbone_Model_Retrofit.get_set = function ( base, meth, key ) {

  // Capture `key`

  var args = Array.prototype.slice.call( arguments, 2 );

  return function () {

    return base.prototype[ meth ].apply(

      this,

      args.concat( Array.prototype.slice.call( arguments ) )

    );

  };

};
// get_set
