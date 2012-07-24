Backbone_Model_Retrofit.retrofit_classes(

  klasses, [ 'Player' ], Backbone.Model

);


$( document ).ready( function () {

  var player = new Models.Player( {

    name : "So and so"

  } );


  player.set( {

    name : player.get( 'name' ).toUpperCase()

  } );


  console.log( player.toJSON(), player.get_new_score( 100 ) );


  player = new Models.Player( {

    name : "Player B",

    score : 15

  } );


  console.log( player.toJSON(), player.get_new_score( 100 ) );

} );
