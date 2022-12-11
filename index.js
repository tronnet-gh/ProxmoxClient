import {requestTicket, setTicket, request} from "./utils.js";

window.addEventListener("DOMContentLoaded", init);

async function init () {
	let cookie = document.cookie;
	if (cookie === '') {
		let username = prompt("username: ");
		let password = prompt("password: ")
		let ticket = await requestTicket(username, password);
		setTicket(ticket.data.ticket);
	}

	let nodes = await request("/nodes", "GET", null);
	let nodeContainer = document.getElementById("node-container")
	for (let i = 0; i < nodes.data.length; i++) {
		let newNode = document.createElement("node-card");
		newNode.data = nodes.data[i];
		nodeContainer.append(newNode);
	}
}