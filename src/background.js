var getting = browser.storage.local.get();
getting.then(init);

var data;
function init(result) {
	data = result;
	browser.tabs.onCreated.addListener(pin);
	browser.tabs.onUpdated.addListener(updatedPin);
}

function updatedPin(tabId, changeInfo, tab) {
	pin(tab);
}
function pin(newTab) {
	if("uri" in data) {
		if(newTab.title.match(data.uri) && newTab.url == "about:blank"
			|| newTab.url.match(".*" + data.uri)) {
			browser.tabs.move(newTab.id, {
				index: 0
			}).then(function(t) {
				browser.tabs.update(newTab.id, {
					pinned: true
				}).then(function() {
					console.log(data.disable);
					if(!"disable" in data || data.disable) {
						browser.tabs.onCreated.removeListener(pin);
						browser.tabs.onUpdated.removeListener(updatedPin);
					}
				});
			});
		}
	}
}