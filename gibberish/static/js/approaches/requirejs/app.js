// For any third party dependencies, like jQuery, place them in the lib folder.

// Configure loading modules from the lib directory,
// except for 'app' ones, which are in a sibling
// directory.
requirejs.config({
    baseUrl: 'static/js/lib',
    paths: {
        app: '../app',
        mithril: '//cdnjs.cloudflare.com/ajax/libs/mithril/0.2.5/mithril.min',
        moment: '//cdnjs.cloudflare.com/ajax/libs/moment.js/2.14.1/moment.min'
    }
});

// Start loading the main app file. Put all of
// your application logic in there.
requirejs(['app/main']);
