var autopin = {
	disabledUris: {},
	firstLoad: true
};
const MESSAGE_COMMANDS = {
	reloadSettings: "reloadSettings"
};

// ---

init();

// ---

browser.runtime.onMessage.addListener(function(message, sender, sendResponse) {
	switch(message.command) {
		case MESSAGE_COMMANDS.reloadSettings:
			loadSettings();
			autopin.disabledUris = {};
			break;
	};
});

// ---

function init(result) {
	loadSettings();
}
function loadSettings() {
	browser.storage.local.get().then(loaded);

	function defaultSettings() {
		var rows = [];
		rows.push({
			disable: false,
			onlyCreation: true,
			uri: `^example.com/foo/bar$`
		});
		rows.push({
			disable: false,
			onlyCreation: false,
			uri: `^https?://example.com/foo/bar$`
		});

		autopin.uris = rows;
		browser.storage.local.set({
			uris: JSON.stringify(rows)
		}, function() {
			browser.runtime.sendMessage({
				command: MESSAGE_COMMANDS.reloadSettings
			});
		});
	}
	function firstLoad() {
		browser.tabs.onCreated.addListener(onTabCreated);
		browser.tabs.onUpdated.addListener(onTabUpdated);
	}
	function loaded(result) {
		autopin.getting = result;
		if("uris" in autopin.getting) {
			autopin.uris = JSON.parse(autopin.getting.uris);
		} else {
			defaultSettings();
		}

		if(autopin.firstLoad) {
			autopin.firstLoad = false;
			firstLoad();
		}
	}
}
function pinTab(newTab, settingEntry) {
	if(!(settingEntry.uri in autopin.disabledUris)) {
		browser.tabs.update(newTab.id, {
			pinned: true
		}).then(function() {
			if(!"disable" in settingEntry || settingEntry.disable) autopin.disabledUris[settingEntry.uri] = true;
		});
		return true;
	} else {
		return false;
	}
}
function onTabCreated(newTab, updated) {
	updated = (typeof updated != "undefined" && updated != null ? updated : false);

	if(newTab.pinned == false && "uris" in autopin) {
		autopin.uris.every(function(settingEntry) {
			if(settingEntry.onlyCreation === true && updated !== true) {
				if(newTab.url == "about:blank" && newTab.title.match(settingEntry.uri)) {
					return pinTab(newTab, settingEntry);
				}
			} else {
				if(newTab.url.match(settingEntry.uri)) {
					return pinTab(newTab, settingEntry);
				}
			}
			return false;
		});
	}
}
function onTabUpdated(tabId, changeInfo, tab) {
	onTabCreated(tab, true);
}