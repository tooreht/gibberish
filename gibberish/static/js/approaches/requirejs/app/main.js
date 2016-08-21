requirejs(["mithril", "app/components/chat"], function(m, Chat) {
    //This function is called when scripts/helper/util.js is loaded.
    //If util.js calls define(), then this function is not fired until
    //util's dependencies have loaded, and the util argument will hold
    //the module value for "helper/util".
    console.log(Chat.component);

    // initialize the application
	m.mount(document.querySelector('.container').appendChild(document.createElement('div')), new Chat().component);
});