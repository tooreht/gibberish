"use strict";

console.log('Allo, allo!');

/********

 MITHRIL

********/


// Component

var chat = {};


// Model

chat.messages = {};

chat.Channel = function(data) {
	this.name = m.prop(data.name);
};

chat.messages.Message = function(data) {
	var now = moment();
	this.ts = m.prop(now);
	this.text = m.prop(data.text);
	this.sent = m.prop(false);
};

chat.ChannelList = Array;

chat.messages.I = Array;
chat.messages.O = Array;
chat.messages.MessageBoard = Array;


// View Model

chat.vm = (function() {
	var vm = {};
	vm.init = function() {
		vm.inList = new chat.messages.I();
		vm.outList = new chat.messages.O();
		vm.mbList = new chat.messages.MessageBoard();
		vm.text = m.prop('');
		vm.send = function(text) {
			if (vm.text()) {
				vm.ws.send(vm.text());
				var msg = new chat.messages.Message({text: vm.text()});
				vm.outList.push(msg);
				vm.text("");
			}
		};
		// Note that the path doesn't matter right now; any WebSocket
		// connection gets bumped over to WebSocket consumers
		vm.ws = new WebSocket("ws://" + window.location.host + "/websocket/?room=abc");
		vm.ws.onmessage = function(e) {
			m.startComputation();
			var msg = new chat.messages.Message({text: e.data});
			vm.inList.push(msg);
			vm.mbList.push(msg);
			m.endComputation();
		}
		vm.ws.onopen = function() {
			vm.ws.send("Mic check, 1, 2!");
		}
	}
	return vm;
}())


// Controller

chat.controller = function() {
	chat.vm.init()
}


// View

chat.view = function() {
	return [
		m("input", {onchange: m.withAttr("value", chat.vm.text), value: chat.vm.text()}),
		m("button", {onclick: chat.vm.send}, "Send"),
		m("table", [
			chat.vm.outList.map(function(message, index) {
				return m("tr", [
					m("td", [
						m("input[type=checkbox]", {onclick: m.withAttr("checked", message.sent), checked: message.sent()})
					]),
					m("td", {style: {textDecoration: message.sent() ? "line-through" : "none"}}, message.text()),
				])
			})
		]),
		m(".board", [
			m("ul", [
				chat.vm.mbList.map(function(message, index) {
					return m("li", [
						m(".message", [
							m("span", message.ts().format('MMMM Do YYYY, h:mm:ss a')),
							" | ",
							m("span", message.text(), {onchange: m.withAttr("innerText", message.sent), innerText: message.text()})
						])
					])
				})
			])
		])
	]
};

// initialize the application
m.mount(document.querySelector('.container').appendChild(document.createElement('div')), {controller: chat.controller, view: chat.view});
