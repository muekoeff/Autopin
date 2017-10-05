function saveOptions(e) {
	e.preventDefault();
	browser.storage.local.set({
		disable: document.querySelector("#disable").checked,
		uri: document.querySelector("#uri").value
	});
	browser.runtime.reload();
}

function restoreOptions() {
	function setCurrentChoice(result) {
		document.querySelector("#uri").value = result.uri || "";
		document.querySelector("#disable").checked = (result.disable != null ? result.disable : true);
	}

	function onError(error) {
		console.log(`Error: ${error}`);
	}

	var getting = browser.storage.local.get();
	getting.then(setCurrentChoice, onError);
}

document.addEventListener("DOMContentLoaded", restoreOptions);
document.querySelector("form").addEventListener("submit", saveOptions);