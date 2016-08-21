import m from 'm';
import { Message } from '../models/message';

// View Model

class ViewModel {
	constructor() {
		var self = this;

		self.inList = new Array();
		self.outList = new Array();
		self.mbList = new Array();
		self.text = m.prop('');
		self.send = function(text) {
			if (self.text()) {
				self.ws.send(JSON.stringify({command: "send", room: 1, message: self.text()}));
				var msg = new Message({text: self.text()});
				self.outList.push(msg);
				self.text("");
			}
		};
		// Note that the path doesn't matter right now; any WebSocket
		// connection gets bumped over to WebSocket consumers
		self.ws = new WebSocket("ws://" + window.location.host + "/chat/stream");
		self.ws.onmessage = function(e) {
			m.startComputation();
			var msg = new Message({text: e.data});
			self.inList.push(msg);
			self.mbList.push(msg);
			m.endComputation();
		}
		self.ws.onopen = function() {
			self.ws.send(JSON.stringify({command: "join", room: 1}));
		}
	}
}

export default {
	controller: function(args) {
		this.vm = new ViewModel();
	},
	view: function(ctrl, args) {
		return [
			m("input", {onchange: m.withAttr("value", ctrl.vm.text), value: ctrl.vm.text()}),
			m("button", {onclick: ctrl.vm.send}, "Send"),
			m("table", [
				ctrl.vm.outList.map(function(message, index) {
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
					ctrl.vm.mbList.map(function(message, index) {
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
		];
	}
}
