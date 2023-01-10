import {request, goToPage, getURIData} from "./utils.js";

window.addEventListener("DOMContentLoaded", init);

async function init () {
	let cookie = document.cookie;
	if (cookie === "") {
		goToPage("login.html");
	}
	
	let uriData = getURIData();
	let node = uriData.node;
	let type = uriData.type;
	let vmid = uriData.vmid;
	await populateForm(node, type, vmid);

	let cancelButton = document.querySelector("#cancel");
	cancelButton.addEventListener("click", () => {
		goToPage("index.html");
	});
}

async function populateForm (node, type, vmid) {
	let config = await request(`/nodes/${node}/${type}/${vmid}/config`);
	console.log(config);

	let name = type === "qemu" ? "name" : "hostname";
	addMetaLine("name", "Name", {type: "text", value: config.data[name]});
	addResourceLine("resources", "images/resources/cpu.svg", "Cores", {type: "number", value: config.data.cores, min: 1, max: 8192}, "Threads"); // TODO add max from quota API
	addResourceLine("resources", "images/resources/ram.svg", "Memory", {type: "number", value: config.data.memory, min: 16, step: 1}, "MiB"); // TODO add max from quota API
	let diskPrefixes;
	let diskTypes;
	if (type === "lxc") {
		addResourceLine("resources", "images/resources/swap.svg", "Swap", {type: "number", value: config.data.swap, min: 0, step: 1}, "GiB"); // TODO add max from quota API
		addDiskLine("disks", "rootfs", "images/resources/drive.svg", "Root FS", config.data.rootfs);
		diskPrefixes = ["mp"];
		diskTypes = ["MP"];
	}
	else { // qemu
		diskPrefixes = ["ide", "sata"];
		diskTypes = ["IDE", "SATA"];
	}

	for(let j = 0; j < diskPrefixes.length; j++){
		let prefix = diskPrefixes[j];
		let type = diskTypes[j];

		Object.keys(config.data).forEach(element => {
			if (element.startsWith(prefix)) {
				addDiskLine("disks", element, config.data[element].includes("media=cdrom") ? "images/resources/disk.svg" : "images/resources/drive.svg", `${type} ${element.replace(prefix, "")}`, config.data[element]);
			}
		})

		let i = 0;
		while(Object.hasOwn(config.data, `${prefix}${i}`)){
			
			i++;
		}
	}
}

function addMetaLine (fieldset, labelText, inputAttr) {
	let field = document.querySelector(`#${fieldset}`);

	let label = document.createElement("label");
	label.innerHTML = labelText;
	label.htmlFor = labelText;
	field.append(label);

	let input = document.createElement("input");
	for (let k in inputAttr) {
		input.setAttribute(k, inputAttr[k])
	}
	input.id = labelText;
	field.append(input);
}

function addResourceLine (fieldset, iconHref, labelText, inputAttr, unitText=null) {
	let field = document.querySelector(`#${fieldset}`);

	let icon = document.createElement("img");
	icon.src = iconHref;
	icon.alt = labelText;
	field.append(icon);

	let label = document.createElement("label");
	label.innerHTML = labelText;
	label.htmlFor = labelText;
	field.append(label);

	let input = document.createElement("input");
	for (let k in inputAttr) {
		input.setAttribute(k, inputAttr[k])
	}
	input.id = labelText;
	field.append(input);

	if (unitText) {
		let unit = document.createElement("p");
		unit.innerText = unitText;
		field.append(unit);
	}
}

function addDiskLine (fieldset, id, iconHref, labelText, valueText) {
	let field = document.querySelector(`#${fieldset}`);

	let icon = document.createElement("img");
	icon.src = iconHref;
	icon.alt = labelText;
	field.append(icon);

	let label = document.createElement("label");
	label.innerHTML = labelText;
	field.append(label);

	let value = document.createElement("p");
	value.innerText = valueText;
	field.append(value);

	let config = document.createElement("img");
	config.src = "images/actions/config-active.svg";
	config.alt = `Config disk ${labelText}`;
	field.append(config);
}