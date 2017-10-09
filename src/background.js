var autopin = {
	disabledUris: {}
};

// Start
browser.storage.local.get().then(init);

// Callbacks
function init(result) {
	autopin.getting = result;
	if("uris" in autopin.getting) autopin.getting.uris = JSON.parse(autopin.getting.uris);

	browser.tabs.onCreated.addListener(pin);
	browser.tabs.onUpdated.addListener(updatedPin);
}

function pin(newTab) {
	if("uris" in autopin.getting) {
		autopin.getting.uris.every(function(element) {
			console.log(element, newTab);
			if(newTab.title.match(element.uri) && newTab.url == "about:blank" || newTab.url.match(".*" + element.uri)) {
				// It's a match!
				
				if(!(element.uri in autopin.disabledUris)) {
					browser.tabs.update(newTab.id, {
						pinned: true
					}).then(function() {
						console.log(element.disable);
						if(!"disable" in element || element.disable) autopin.disabledUris[element.uri] = true;
						return false;
					});
				} else {
					// Disabled
					return false;
				}
			}
			// Continue loop
			return true;
		});
	}
}

function updatedPin(tabId, changeInfo, tab) {
	pin(tab);
}