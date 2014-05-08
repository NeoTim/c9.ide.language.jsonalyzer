define(function(require, exports, module) {
    "use strict";

    main.consumes = [
        "Plugin", "jsonalyzer", "language"
    ];
    main.provides = ["jsonalyzer.architect_resolver"];
    return main;

    function main(options, imports, register) {
        var Plugin = imports.Plugin;
        var jsonalyzer = imports.jsonalyzer;
        var language = imports.language;
        var assert = require("c9/assert");
        
        /***** Initialization *****/
        
        var plugin = new Plugin("Ajax.org", main.consumes);
        
        var loaded = false;
        function load() {
            if (loaded) return false;
            loaded = true;
            
            assert(window.plugins && window.plugins.length > 10, "Architect plugins must be in window.plugins");
            
            var knownPlugins = {};
            window.plugins.forEach(function(plugin) {
                if (!plugin || !plugin.provides)
                    return;
                plugin.provides.forEach(function(provide) {
                    knownPlugins["_" + provide] = plugin.packagePath;
                });
            });
            
            jsonalyzer.registerWorkerHandler("plugins/c9.ide.language.jsonalyzer/worker/handlers/jsonalyzer_js", null, function(err) {
                language.getWorker(function(err, worker) {
                    if (err) return console.error(err);
                    
                    worker.emit("architectPlugins", { data: knownPlugins });
                });
            });
        }
        
        plugin.on("load", function(){
            load();
        });

        /**
         * Architect module resolver for Cloud9 source code,
         * using runtime information from the running Cloud9.
         * It's not perfect but it's simple, avoids scanning all modules,
         * and doesn't need any configuration. A full resolver
         * requires significant server-side analysis and infrastructure
         * work.
         * @ignore
         */
        plugin.freezePublicAPI({});
        
        register(null, { "jsonalyzer.architect_resolver" : plugin });
    }
});