define(["mithril", "app/models/message"], function(m, Message) {
	"use strict";

	// View Model

	function ViewModel() {
		var self = this;

		self.init = function() {
			self.inList = new Array();
			self.outList = new Array();
			self.mbList = new Array();
			self.text = m.prop('');
			self.send = function(text) {
				console.log('in');
				if (self.text()) {
					self.ws.send(self.text());
					var msg = new Message({text: self.text()});
					self.outList.push(msg);
					self.text("");
				}
				console.log('out');
			};
			// Note that the path doesn't matter right now; any WebSocket
			// connection gets bumped over to WebSocket consumers
			self.ws = new WebSocket("ws://" + window.location.host + "/websocket/?room=abc");
			self.ws.onmessage = function(e) {
				m.startComputation();
				var msg = new Message({text: e.data});
				self.inList.push(msg);
				self.mbList.push(msg);
				m.endComputation();
			}
			self.ws.onopen = function() {
				self.ws.send("Mic check, 1, 2!");
			}
		}
		self.component = Chat;
	}

	var vm = new ViewModel();


	// Component

	var Chat = {
		controller: function() {
			vm.init()
		},
		view: function() {
			return [
				m("input", {onchange: m.withAttr("value", vm.text), value: vm.text()}),
				m("button", {onclick: vm.send}, "Send"),
				m("table", [
					vm.outList.map(function(message, index) {
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
						vm.mbList.map(function(message, index) {
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
		}
	}

	return ViewModel;
});
