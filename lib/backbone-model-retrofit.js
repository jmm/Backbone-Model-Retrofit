/*

Backbone Model Retrofit.

Copyright © 2012-2015 Jesse McCarthy <http://jessemccarthy.net/>

The Backbone Model Retrofit software may be used under the MIT (aka X11) license. See LICENSE

*/

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

    'retrofit_class',

    'resync_protos'

  ];
  // retrofitters


  var self = this;

  // Run each retrofitter function for each input class.

  retrofitters.forEach( function ( retrofitter ) {

    klasses.forEach( function ( klass ) {

      self[ retrofitter ]( container, klass, base );

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

  // Copy class defaults to proto defaults.
  if (klass.defaults) {
    var defaults = ((
      typeof klass.defaults === 'function' ?
      klass.defaults() :
      klass.defaults
    ) || {});

    Object.keys(defaults).forEach(function (prop) {
      backbone_proto.defaults[prop] = defaults[prop];
    });
  }

  // backbone_proto | backbone_proto.defaults

  var collection;


  // Assign each klass member to the appropriate collection

  Object.keys( klass ).forEach( function ( prop ) {

    if (prop === 'defaults') return;

    var value = klass[ prop ];

    collection = value instanceof Function ?

      backbone_proto :

      backbone_proto.defaults;


    collection[ prop ] = value;

  } );


  // If klass has a parent property that refers to a class that has been
  // retrofitted for Backbone, update the property to refer to the retrofitted
  // class.

  if ( klass.parent && klass.parent.__backbone__ ) {

    klass.parent = klass.parent.__backbone__;

  }
  // if


  if ( klass.hasOwnProperty( 'constructor' ) ) {

    // Copy legacy class constructor to `initialize`.

    backbone_proto.initialize = klass.constructor;


    // Copy parent class defaults to current class.

    if ( klass.parent && klass.parent.defaults ) {

      backbone_proto.defaults = _.defaults(

        backbone_proto.defaults,

        klass.parent.defaults

      );

    }
    // if

  }
  // if


  var old_klass = klass;

  klass = base.constructor.extend( backbone_proto ).prototype;

  // Store a reference to the Backbone-retrofitted class in the original class.

  old_klass.__backbone__ = klass;

  // Properties that may be used in legacy classes and are special-cased by
  // Backbone (treated as regular props not attrs)

  var special_props = [ 'id', 'defaults' ];


  // Create getters and setters for legacy props that will be treated as attrs.

  Object.keys( backbone_proto.defaults ).forEach( function ( key ) {
    // Prevent special props from being treated as attrs with getters / setters.
    if (special_props.indexOf(key) !== -1) return;

    Object.defineProperty( klass, key, {

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
 * to find props from their prototypes (now in `defaults` due to retrofitting)
 * that contain classes that have themselves been retrofitted. Update the
 * property to refer to the retrofitted version of the class.
 *
 * @param obj container Container for klasses being modified.
 *
 * @param obj klass Name of class within container to modify.
 *
 * @return void
 */

Backbone_Model_Retrofit.resync_protos = function ( container, klass ) {

  klass = container[ klass ];

  Object.keys( klass.defaults ).forEach(

    function( key, prop ) {

      prop = klass.defaults[ key ];

      // The class has been retrofitted, and a reference to the retrofitted
      // version stored in `__backbone__`.

      if ( prop && prop.__backbone__ ) {

        klass.defaults[ key ] =

          prop.__backbone__;

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

    return base[ meth ].apply(

      this,

      args.concat( Array.prototype.slice.call( arguments ) )

    );

  };

};
// get_set
