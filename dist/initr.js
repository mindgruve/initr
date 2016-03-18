define(['module', 'jquery', 'console'], function (requireModule, $, _console) {

    /**
     * Any instance of Initr comes with defaults. Here is where you should define those defaults
     * All defaults can be overridden during initialization by passing an object with the same schema to the constructor
     * Initr reads through the dom passed to it in the scope config variable. If none is set, the root document is used.
     *
     * @typedef {object} InitrConfig
     * @property {HTMLDocument|HTMLDomNode} scope
     * @memberof module:Initr
     */
    /**
     * @type {InitrConfig}
     */
    var defaults = {
        scope: document
    };

    var consoleConfig = {
        style: 'color:#09d;',
        level: requireModule.config().logLevel || 'debug'
    };

    /**
     * It is important to note that regardless of how many Initr instances are initialized, the modules collection is static across all instances
     * @type {object}
     * @private
     */
    var _modules = {};
    var ConsoleFactory = {
        create: function (command, config, console) {

            var levels = {
                'log': 0,
                'info': 1,
                'debug': 2
            };

            var style = this._style;

            return function () {
                if (levels[command] > levels[config.level]) {//if the log level is higher than the current commands level just exit out
                    return;
                }
                //convert arguments to an array
                var fn = console[command] || console.log;
                var args = Array.prototype.slice.call(arguments, 0);
                if (fn.apply) {
                    args.unshift(style);
                    args.unshift('%cInitr');
                    fn.apply(console, args);
                } else {
                    args.unshift('Initr:');
                    fn(args);
                }
            };
        }
    };
    var console = {
        _style: requireModule.config().config,
        log: ConsoleFactory.create('log', consoleConfig, _console),
        info: ConsoleFactory.create('info', consoleConfig, _console),
        debug: ConsoleFactory.create('debug', consoleConfig, _console)
    };

    /**
     * Initr has been redefined to use require.js.
     * This is to move forward into a development process that has more support and established patterns.
     * This initial version supports loading a requirejs module conditionally based on the existence of dom elements with specific selector patterns (ie. `data-plugin*=""`, `.some-class`).
     *
     * @constructor
     * @exports Initr
     * @param {InitrConfig} config
     * @version 2.0.0
     */
    function Initr(config) {

        this.options = $.extend({}, defaults, config || {});
        console.debug('Starting...', config, this.options);
    }

    Initr.prototype = {
        /**
         * Friendly load method only supports object or array.
         *
         * Examples:
         *
         *     initr.load({selector:'body',src:['myRequirejsModule']});
         *
         * @param {Object|Array} an object that conforms to the module config schema or array of said objects
         * @api public
         */
        load: function (config) {
            if (config && typeof config == 'object') {
                //is this an array?
                if (config.length) {
                    this.loadArray(config);
                } else {
                    this.loadObject(config);
                }
            }
        },
        loadArray: function (configs) {
            for (var i = 0; i < configs.length; i++) {
                this.loadObject(configs[i]);
            }
        },
        //TODO: create a moduleConfig object instance with the module arg below passed into it's constructor
        loadObject: function (config) {

            //if there's a selector then look for it in this scope
            var $selection = config.selector ? $(config.selector, this.options.scope) : false;

            if ($selection && $selection.length) {
                console.debug('Selection found for "' + config.selector + '" in ', this.options.scope);
                var src = this.normalizeSrc(config);
                if (src) {
                    console.debug('Loading sources...', src.join());
                    this.loadSrc(src, function () {
                        console.debug('Sources loaded...', src.join());
                        //convert loaded modules in arguments to array
                        var args = Array.prototype.slice.call(arguments, 0),
                            modules = [];
                        for (var i = 0; i < arguments.length; i++) {
                            modules.push(this.initModule(arguments[i], config, $selection));
                        }
                        //TODO: use the modules array to expose some high level functionality
                        _modules[config.name] = {
                            config: config,
                            modules: modules
                        };
                    });
                }
            }
        },
        initModule: function (module, config, selection) {
            //TODO: a future version of Initr could automate initialization
            //var moduleName =
            //    typeof module == 'function' ?
            //        (module.toString().match(/function ([^\(]+)/) || [0, 'MODULE ANONYMOUS'])[1] :
            //        'MODULE OBJECT';
            console.debug(config.name, /* moduleName,*/ 'config', config, selection.toArray());
            return new module(config, selection, this);
        },
        loadSrc: function (src, callback) {
            var _this = this;
            require(src, function () {
                callback.apply(_this, arguments);
            });
        },
        normalizeSrc: function (module) {
            return module.src ?
                (typeof module.src == 'string' ? [module.src] : module.src) :
                null;
        },
        getModules: function () {
            return _modules;
        }
    };

    return Initr;
});
