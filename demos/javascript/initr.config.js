// Open up your IIFE to protect our global namespace.
( function( $, app, window ) {

	// Initialize some variables to be used later.
	var rootPath, deps;

	// Set your app to be in dev mode or not. (Optional)
	// When you are in dev mode, initr will `console.log` everything it does.
	initr.isDev = true;

	// Set a timeout for your script fetches. (Optional)
	initr.timeout = 12000;

	// Set the path to your scripts.
	rootPath = 'javascript/';

	// This `deps` variable will hold all of our modules and plugins.
	// There are various types of dependencies (as we will call them) that Initr can handle.
	// Our defined types are `$.fn`, `$` and `app`. You can also run anonymous modules to
	// run arbitrary/small bits of code.
	deps = [

		// `$.fn`
		// This is your normal, everyday jQuery plugin.
		// As you may know, jQuery plugins that run on the DOM,
		// live on the jQuery prototype, or `$.fn`.
		{

			// Set the type so initr knows how to handle it.
			type : '$.fn',

			// The handle is just the namespace of your plugin on the jQuery prototype.
			// In this case, its the all-mighty datepicker jQuery UI plugin.
			handle : 'datepicker',

			// The path to your plugin, relative to the root path set above.
			src : 'vendor/jquery-ui-1.10.3.custom.min.js',

			// Your selector to where you would initialize the plugin.
			// Initr will check your page for this selector, ensure it has found elements,
			// then initialize the plugin on these elements with the options below.
			selector : '.datepicker',

			// These are your default options for this dependency.
			// When your selector is found, it will get passed these defaults.
			defaults : {
				showOtherMonths: true,
				selectOtherMonths: true
			}

			// We now have a solution to initialize a datepicker on any page of your website.
		},

		// `$`
		{
			type : '$',
			handle : 'formIt',
			src : 'vendor/jquery.formit.min.js',
			selector : 'form'
		},

		// `app`
		{
			type : 'app',
			handle : 'yourModule',
			src : 'app.yourModule.js',
			selector : '[data-plugin=yourModule]'
		},

		// Anonymous dependency with selector.
		{
			selector : '.your-selector',
			color : 'blue',
			init : function( $els, dep ) {
				$els.css( 'color', dep.color );
			}
		},

		// Anonymous dependency with selector and validate function.
		{
			selector : '.another-selector li',

			// Optional function to validate your dependency.
			validate : function( $els, dep ) {

				// Returning `true` allows the `init` function to be called,
				// returning `false` will stop `init` from being called.
				return $els && ($els.length > 2);
			},

			// If your selector returns elements, and validate returns `true`,
			// this function will run.
			init : function( $els, dep ) {
				$els.last().insertBefore( $els.first() );
			}
		}

	];

	// Kick off initr.
	// Cache the reference to `initr` on our `app` global namespace.
	app.initr = initr( rootPath, deps );

	// Use your initr reference add callbacks to dependencies finishing.
	app.initr.on( 'datepicker', function( $els, dep ) {
		console.log( 'TRIGGER datepicker:done', $els, dep );
	});

})( jQuery, window.app || (window.app = {}), window );
