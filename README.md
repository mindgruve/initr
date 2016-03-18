# Initr

## What is it?

Initr is a query based javascript loader. Initr modules are loaded onto the page website based on the existence of the selectors.

## How do I use it?

You need require.js to use Initr.

## Installation

You can get it from http://github.com/mindgruve/initr. Put initr.js anywhere in your JavaScript source (for example, `/vendor/initr.js`), and include it with `require('vendor/initr')` or something similar

## Configure

Create a requirejs module that returns an initr config object. Initr configs look like this:

```js
//initr/config.js
define({
    //Initr loops through this array. If the selector has matches on the current page, then src is loaded by Initr
    modules: [
        // MODULE: Form UI
        {
            name: 'form-ui',
            selector: 'form',
            src: ['initr/form-ui']
        }
	]
});

```

An initr module has to be built a certain way. See below for an example.

```js
//initr/form-ui.js
define(['src/vendor/initr/module', 'jquery'], function (Module, $) {
	function FormUi(config, $els, initr) {
        Module.apply(this, [config, $els, initr]);
        this.init();
    }
	FormUi.prototype = new Module();
    FormUi.prototype.constructor = FormUi;
	FormUi.prototype.init = function () {
		//Initialize your custom logic
	};
	return FormUi;
});
```

Once you have an initr module and a config you can create an initr instance and use them.

```js
//main.js
require(['vendor/initr', 'initr/config'], function (Initr, config) {
	var initr = new Initr();
	initr.load(config.modules);
});
```

Done!

-----

Some day we will have better documentation. For now. Nope.
