# Initr

## What is it?

A JavaScript dependency loader and initializer.

Initr was built to simplify working with jQuery and custom code for multi-page websites.

Built by [Chris Kihneman](http://ckihneman.github.com/) at [Mindgruve](http://mindgruve.com/).

## Why did you make it?

Traditionally, frontend developers employ one of a few techniques to run their JavaScript on a multi-page website. I have personally seen all of these:

* Include all scripts, plugins and libraries on every page of your site. This is bad for obvious reasons, you are loading and attempting to initialize all of your code on every page load. It works for small sites, with few JavaScript needs - but not large, multi-page sites with lots of code.

* Meticulously include plugins and libraries per page or template with one script attempting to initialize your code. You probably have some extra checks in place around selectors so things don't error out trying to initialize a library that wasn't included on the current page. This is slightly better than above, but takes a lot of effort to ensure every page has the scripts it needs. There is a lot of room for error here. Your code is also slightly more verbose to ensure not erroring out.

* Inline scripts after blocks of HTML throughout your site. Please, please don't do this. This is a terrible, unmaintainable mess that no self-respecting frontend developer ever wants to deal with, not to mention it is a nightmare for teams to manage something like this.

I think it is obvious that as our sites get bigger, our task on the frontend becomes increasingly more difficult. The time has come to organize ourselves in a better way, where anyone on the team can follow along, and figure out how the code is running.

On the frontend, it is always our goal to build small, versatile, reusable pieces of code. Thinking modular pays off quickly. It is not always easy to just keep one `scripts.js` file with all of our initialization code, as well as custom functionality. In no time you end up a thousand lines of code deep, madly commenting to attempt to keep yourself in line. It becomes harder and harder for your team to interact with this file, the structure gets locked in one person's head, and forget two people working on it at the same time.

Where does this leave us? Well, we have plugins (probably jQuery or another framework), libraries (jQuery, google maps, third party folk, etc.) and custom pieces of functionality built specifically for your site. Initr was built around working with these concepts, and it was built to make the frontend dead simple and thoughtless. Write solutions once, allow it to work everywhere - on demand, only when needed.

## How do I use it?

Include jQuery and Initr. Then call `initr` with the path to all of your JavaScript and an array of objects containing all of your dependencies, which represent every piece of functionality on your site.

```javascript
initr( 'path/to/your/scripts/', [
	{
		type : '$.fn',
		handle : 'datepicker',
		src : 'vendor/jquery-ui-1.9.2.datepicker-custom.min.js',
		selector : '.datepicker',
		defaults : {
			inline: true,
			showOtherMonths: true,
			selectOtherMonths: true
		}
	},
	{
		type : '$',
		handle : 'formIt',
		src : 'vendor/jquery.formit.js',
		selector : 'form',
		defaults : {
			checkboxHtml : '<span class="ss-icon">&#x2713;</span>'
		}
	},
	{
		type : 'app',
		handle : 'yourModule',
		src : 'app.yourModule.js',
		deps : [ 'helpers.js' ],
		selector : '[data-plugin=yourModule]',
		validate : function( $els, dep ) {
			return $els && ($els.length > 2);
		}
	},
	{
		selector : '.your-selector',
		init : function( $els, dep ) {
			// Do stuff...
		}
	}
	// As many dependencies as you need...
]);
```

It is recommended that you put this code in a file named `initr.config.js`, and include it after jQuery and Initr.

**Don't forget**, put your most important dependencies before others. These dependencies will be run in the array's order. If you need things to kick off right away, put them at the top.

**For a complete, working example, clone this repo and review the files in the `demos` folder.** After cloning, be sure to run `npm install` to get the needed node modules. Also, you can run `grunt server` to boot up a quick web server to view the demos, otherwise you will run into cross site scripting issues. The default port is `9001`. After booting up the server, navigate to `http://localhost:9001/demos/` in your browser.

If you are in development, it is best to put Initr into development mode to show logs in your `console` for everything Initr does. Set this before calling `initr`. It is off by default.

```javascript
initr.isDev = true;
```

If you would like to set a timeout for your fetched scripts, define it like so:

```javascript
initr.timeout = 12000;
```

All Initr dependencies can handle these properties.

* `type` One of `'$.fn'`, `'$'` or `'app'`. Type can be omitted for an anonymous dependency.

* `selector` The jQuery selector for the elements you plan to work with in this dependency. If the selector does not find elements on the page, the dependency will stop and not load any scripts.

* `validate` A function that will be run after checking for a selector. It is passed the current dependency object as well as any elements found from `selector`. Must return a Boolean, return `true` to continue loading and initializing the dependency, or `false` to stop it immediately.

* `src` Main script needed, holding the core functionality for your dependency. It will be loaded if your `selector` has elements and/or if validate returns true.

* `handle` The name of the method in the namespace of the passed in `type`. Further broken down below.

* `deps` An array of strings of file paths to scripts needed to be loaded before your `src` script.

## Types

The example above doesn't tell you much about how Initr really works yet, but you can probably start to see where this is going. Give a quick once over on the code above. You can see three different types which are built into Initr, then another with no type.

All of the typed dependencies can include a `done` function. This function will be called after the dependency has been loaded and called. It is passed elements found from your `selector`, as well as the dependency itself. View `demos/javascript/initr.config.js` for a working example.

Now, let's break down the types of dependencies we can pass into `initr`.

### $.fn

On a large, multi-page website, you probably are working with lots of different jQuery plugins. The type `$.fn` handles loading and initializing these.

So, how do we interact with jQuery plugins normally? You select some elements on the page, pass them into the plugin with a given options set, and the plugin does its thing. Sometimes you have to initialize the same plugin in different ways, for say, different types of slideshows on your site.

To handle this functionality, `$.fn` has some extra properties it can be passed.

* `defaults` An object with the options you want to use on all instances of this dependency.

* `types` An object of objects holding options

Lets look at the example above for a simple `$.fn` initialization. Here is the all-mighty jQuery UI datepicker plugin.

HTML:

```html
<div class="datepicker"></div>
```

Initr code:

```javascript
initr( 'path/to/your/scripts/', [
	{
		type : '$.fn',
		handle : 'datepicker',
		src : 'vendor/jquery-ui-1.9.2.datepicker-custom.min.js',
		selector : '.datepicker',
		defaults : {
			inline: true,
			showOtherMonths: true,
			selectOtherMonths: true
		}
	}
]);
```

This is the (semi) equivalent of:

```html
<script src="path/to/your/scripts/vendor/jquery-ui-1.9.2.datepicker-custom.min.js"></script>

<script>
	$('.datepicker').datepicker({
		inline: true,
		showOtherMonths: true,
		selectOtherMonths: true
	});
</script>
```

Initr handles `$.fn` like this.

1. Query page for your `selector`.

2. Check to see if the query returned elements.

3. If elements were returned, load your `src` script.

4. Once loaded, the jQuery plugin is called with the elements from `selector`. The plugin is identified by your `handle`. If you have specified `defaults`, they are passed into the plugin as well.

Now, this fulfills simple use cases for plugins, but what if you have a plugin that needs to be initialized in various ways. Lets take a look at using Initr with a slideshow plugin that has various initialization needs.

HTML:

```html
<div data-plugin="slideshow" data-type="featured">
	<!-- Slides -->
</div>

<div data-plugin="slideshow" data-type="featuredInline">
	<!-- Slides -->
</div>

<div data-plugin="slideshow" data-type="photo">
	<!-- Slides -->
</div>
```

Initr code:

```javascript
initr( 'path/to/your/scripts/', [
	{
		type : '$.fn',
		handle : 'anythingSlider',
		src : 'vendor/jquery.anythingslider.min.js',
		deps : [ 'app.gallery-helpers.js' ],
		selector : '[data-plugin="slideshow"]',
		defaults : {
			mode : 'fade',
			hashTags : false
		},
		types : {
			featured : {
				autoPlay : true,
				delay : 5000,
				onBeforeInitialize : function( e, slider ) {
					app.galleryHelpers.loadPlaceholders( slider.$el );
				},
				onSlideComplete : function( slider ) {
					app.galleryHelpers.trackView( app.galleryHelpers.getData(slider, 'inline') );
				}
			},
			featuredInline : {
				autoPlay : false,
				buildStartStop : false
			},
			photo : {
				buildNavigation : false,
				buildStartStop : false
			}
		}
	}
]);
```

We can see we have three different types of slideshows that need to be initialized. We use `data-plugin="slideshow"` in our HTML to identify all of the slideshows. Then we use `data-type` to identify which type of slideshow it is. Initr will do this:

1. Query page for your `selector` (`[data-plugin="slideshow"]`).

2. Check to see if the query returned elements.

3. If elements were returned, load your `src` script, and in this case, will load your `deps` script before the `src` script.

4. Once loaded, Initr will loop through all of these elements, and will check for a type.

5. If a type is found in your HTML, Initr will check your dependency for a matching type.

6. If a type is found in your dependency matching that in your HTML, it will take that object, merge it into a new object with `defaults`, then initialize the plugin with your `handle` for that particular element.

It will basically be the equivalent of doing this:

```html
<script src="path/to/your/scripts/app.gallery-helpers.js"></script>
<script src="path/to/your/scripts/vendor/jquery.anythingslider.min.js"></script>

<script>
	$('[data-plugin="slideshow"][data-type="featured"]').anythingSlider({
		mode : 'fade',
		hashTags : false,
		autoPlay : true,
		delay : 5000,
		onBeforeInitialize : function( e, slider ) {
			app.galleryHelpers.loadPlaceholders( slider.$el );
		},
		onSlideComplete : function( slider ) {
			app.galleryHelpers.trackView( app.galleryHelpers.getData(slider, 'inline') );
		}
	});

	$('[data-plugin="slideshow"][data-type="featuredInline"]').anythingSlider({
		mode : 'fade',
		hashTags : false,
		autoPlay : false,
		buildStartStop : false
	});

	$('[data-plugin="slideshow"][data-type="photo"]').anythingSlider({
		mode : 'fade',
		hashTags : false,
		buildNavigation : false,
		buildStartStop : false
	});
</script>
```

You can see how the `$.fn` type can be useful. Its all about identifying all of the needs of your site, and being able to easily configure your options. All while not worry about what page which plugin and of which type needs to be kicked off.

### $

jQuery functionality doesn't just sit on its prototype (`$.fn`), it also lives right on the jQuery global object. This is a much smaller use case, that you may not run into. But here is an example that sums it up pretty well. It works in a very similar way to `$.fn`, but it uses `selector` or `validate` as a means to run or not run your code.

HTML:

```html
<form>
	<!-- Some form elements -->
</form>
```

Initr code:

```javascript
initr( 'path/to/your/scripts/', [
	{
		type : '$',
		handle : 'formIt',
		src : 'vendor/jquery.formit.js',
		selector : 'form',
		defaults : {
			checkboxHtml : '<span class="ss-icon">&#x2713;</span>'
		}
	}
]);
```

This is the (semi) equivalent of:

```html
<script src="path/to/your/scripts/vendor/jquery.formit.js"></script>

<script>
	if ( $('form').length ) {
		$.formIt({
			checkboxHtml : '<span class="ss-icon">&#x2713;</span>'
		});
	}
</script>
```

### app

For large and complicated multi-page sites, jQuery plugins only get you part of the way. Sometimes you have to roll your sleeves up and actually write some code (thank goodness). This code wont always be some small snippet, it could be its own beast of a script, with its own dependencies. We don't want to put all of this logic in our Initr dependency object. We want it to be in its own file, neatly bundled up to do what it does. The `app` type sets out to fill this concept of *modules*. Lets look at another example.

HTML:

```html
<div data-plugin="yourModule">
	<!-- Your module HTML -->
</div>
```

Initr code:

```javascript
initr( 'path/to/your/scripts/', [
	{
		type : 'app',
		handle : 'yourModule',
		src : 'app.yourModule.js',
		deps : [ 'helpers.js' ],
		selector : '[data-plugin=yourModule]',
		validate : function( $els, dep ) {
			return $els && ($els.length > 2);
		}
	}
]);
```

This is the (semi) equivalent of:

```html
<script src="path/to/your/scripts/helpers.js"></script>
<script src="path/to/your/scripts/app.yourModule.js"></script>

<script>
	var $els = $('[data-plugin=yourModule]');
	if ( $els && $els.length > 2 ) {
		app.yourModule.init( $els );
	}
</script>
```

So we can see, Initr checks your `selector` and `validate` function (just as it does for other types), loads your scripts, and calls your modules `init` function. **This is the rather opinionated part.** You must create your `app` modules in a slightly particular way for them to be called properly. If you want to use `app` modules, you need to create the `app` var in the global namespace. I prefer to wrap all of my modules in this code to ensure `app` exists, and so I don't have to worry about what order the modules are initialized in.

```javascript
( function( $, app, window ) {

	// Your module code...

})( jQuery, window.app || (window.app = {}), window );
```

Then, inside of our IIFE ([Immediately-Invoked Function Expression](http://benalman.com/news/2010/11/immediately-invoked-function-expression/)), define your module.

```javascript
( function( $, app, window ) {

	var yourModule = {
		aProperty : 'some text',
		init : function( $els, dep ) {

			// Your module's initilization functionality...
			yourModule.anotherMethod( yourModule.aProperty );
		},
		anotherMethod : function() {

			// Some other functionality...
		}
	};

	app.yourModule = yourModule;

})( jQuery, window.app || (window.app = {}), window );
```

You can really do whatever you want with your module, as long as it is sitting on the `app` global namespace and has an `init` function defined. The `init` function will be passed the jQuery object containing your elements based on your `selector` for the first argument, and the second is the actual dependency object itself (which you may or may not need - this just allows you to stash data in your dependency and pass it to your module if you want).

### Anonymous Dependencies

Sometimes you have small pieces of functionality, that doesn't really need their own `app` dependency. This is where we can omit the `type` property from our dependency, and just use a `selector` (and/or a `validate` function if you want/need). Example time:

HTML:

```html
<div class="your-selector">
	<!-- Your HTML -->
</div>
```

Initr code:

```javascript
initr( 'path/to/your/scripts/', [
	{
		selector : '.your-selector',
		init : function( $els, dep ) {
			// Do stuff...
		}
	}
]);
```

This is the (semi) equivalent of:

```html
<script>
	var $els = $('.your-selector');
	if ( $els.length ) {
		// Do stuff...
	}
</script>
```

Again, all of these "dependencies" serve to contain logic into pieces that are easy to see and work with. Your selectors are always checked before running to make sure you actually have elements to operate on. These anonymous modules should only be used for very small pieces of code, otherwise you should use the `app` type.

## Events

There may be situations where you need to know when a particular dependency has been loaded and fired. You can attach events to Initr to handle this.

```javascript
// Call `initr` and cache a reference to it.
var initrRef = initr( 'path/to/your/scripts/', [
	{
		type : '$.fn',
		handle : 'datepicker',
		src : 'vendor/jquery-ui-1.9.2.datepicker-custom.min.js',
		selector : '.datepicker'
	}
]);

// Use `initr`'s on method to attach a done event for `datepicker`.
initrRef.on( 'datepicker', function( $els, dep ) {
	console.log( 'datepicker:done', $els, dep );
});
```

In this example, we are going to wait for the `datepicker` dependency to finish loading and running, then our callback function will be called with `$els` found from your `selector` and `dep` (your dependency object).

The name of the event (in this case, `datepicker`) is determined by your dependency `handle`. You can also choose to alias it a step further with by adding a `name` parameter.

**Don't forget**, as another option, you can just add a `done` function to your dependency to be called once it's loaded and initialized.

```javascript
initr( 'path/to/your/scripts/', [
	{
		type : '$.fn',
		handle : 'datepicker',
		src : 'vendor/jquery-ui-1.9.2.datepicker-custom.min.js',
		selector : '.datepicker',
		done : function( $els, dep ) {
			// Do stuff...
		}
	}
]);
```

## Re-Running

There may be situations where you need to run a dependency again. Here is an example of the api for doing this.

```javascript
var initrRef = initr( 'path/to/your/scripts/', [
	{
		type : '$.fn',
		handle : 'datepicker',
		src : 'vendor/jquery-ui-1.9.2.datepicker-custom.min.js',
		selector : '.datepicker'
	}
]);

// Run it by the dependency `handle`, or optionally by `name`.
initrRef.run( 'datepicker' );
```

## TL;DR

Check out the demo in the `demos` folder.

1. Clone this repo, `git clone https://github.com/mindgruve/initr.git initr`. Then `cd initr`.

2. Run `npm install`.

3. Run `grunt server`.

4. Navigate to `http://localhost:9001/demos/` in your browser.

5. Open up `demos/index.html` and `demos/javascript/initr.config.js` in your text editor and take a look.

Enjoy!
