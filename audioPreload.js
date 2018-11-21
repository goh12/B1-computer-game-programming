// ======================
// Preloading Audio stuff
// ======================

// Extend the Audio prototype (aka augment the "class") 
// with my asyncLoad wrapper. 
//
Audio.prototype.asyncLoad = function(src, asyncCallback) {
    
    // Must assign the callback handlers before setting `this.src`,
    // for safety (and caching-tolerance).
    //
    // Uses the same handler for success *and* failure,
    // because they share a lot of the same logic.
    this.oncanplaythrough = asyncCallback;
    this.error = asyncCallback;
    
    // NB: The load operation can be triggered from any point 
    // after setting `this.src`.

    console.log("requesting audio src of ", src);
    this.src = src;
};


// audioPreload
//
// IN  : `requiredAudio` - an object of <name:uri> pairs for each audio clip
// OUT : `loadedAudio` - object to which our <name:Audio> pairs will be added
// IN  : `completionCallback` - will be executed when everything is done
//
function audioPreload(requiredAudio,
                       loadedAudio,
                       completionCallback) {

    var numAudiorequired,
        numAudioHandled = 0,
        currentName,
        currentAudio,
        preloadAudioHandler;

    // Count our `requiredAudio` by using `Object.keys` to get all 
    // "*OWN* enumerable properties" i.e. doesn't traverse the prototype chain
    numAudiorequired = Object.keys(requiredAudio).length;

    // A handler which will be called when our required audio files are finally
    // loaded (or when the fail to load).
    //
    // At the time of the call, `this` will point to an Audio object, 
    // whose `name` property will have been set appropriately.
    //
    preloadAudioHandler = function () {

        loadedAudio[this.name] = this;

        if (0 === this.width) {
            console.log("loading failed for", this.name);
        }

        // Allow this handler closure to eventually be GC'd (!)
        this.onload = null;
        this.onerror = null;

        numAudioHandled += 1;

        if (numAudioHandled === numAudiorequired) {
            console.log("all preload audio files handled");
            console.log("loadedAudio=", loadedAudio);
            console.log("");
            console.log("performing completion callback");

            completionCallback();

            console.log("completion callback done");
            console.log("");
        }
    };

    // The "for..in" construct "iterates over the enumerable properties 
    // of an object, in arbitrary order." 
    // -- unlike `Object.keys`, it traverses the prototype chain
    //
    for (currentName in requiredAudio) {

        // Skip inherited properties from the prototype chain,
        // just to be safe, although there shouldn't be any...
        
        if (requiredAudio.hasOwnProperty(currentName)) {
            console.log("preloading audio", currentName);
            currentAudio = new Audio();
            currentAudio.name = currentName;
            currentAudio.asyncLoad(requiredAudio[currentName], preloadAudioHandler);
        }
    }
}