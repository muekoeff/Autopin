document.querySelector("#addRow").addEventListener("click", addUriRow);
function addUriRow() {
	document.querySelector("#uriTable").insertAdjacentHTML("beforeend", `<tr class="uriRow">
		<td><input class="item--uri" type="text" placeholder="sample.org/.*" /></td>
		<td><input class="item--disable" type="checkbox" value="true" /></td>
	</tr>`);

	var rows = document.getElementsByClassName("uriRow");
	return rows[rows.length - 1];
}

document.addEventListener("DOMContentLoaded", restoreOptions);
function restoreOptions() {
	function setCurrentChoice(result) {
		if(result.uris != null) {
			var uris = JSON.parse(result.uris);
			uris.forEach(function(element) {
				var row = addUriRow();
				row.getElementsByClassName("item--disable")[0].checked = element.disable || false;
				row.getElementsByClassName("item--uri")[0].value = element.uri || "";
			});
		} else {
			addUriRow();
		}
	}

	function onError(error) {
		console.log(`Error: ${error}`);
	}

	var getting = browser.storage.local.get();
	getting.then(setCurrentChoice, onError);
}

document.querySelector("form").addEventListener("submit", saveOptions);
function saveOptions(e) {
	e.preventDefault();

	var rows = document.querySelectorAll(".uriRow");
	var rowData = [];
	rows.forEach(function(element) {
		rowData.push({
			disable: element.getElementsByClassName("item--disable")[0].checked,
			uri: element.getElementsByClassName("item--uri")[0].value
		});
	});

	browser.storage.local.set({
		uris: JSON.stringify(rowData)
	});
	browser.runtime.reload();
}