define(['mithril', 'moment'], function(m, moment) {
	"use strict";

	function Message(data) {
		var now = moment();
		this.ts = m.prop(now);
		this.text = m.prop(data.text);
		this.sent = m.prop(false);
	};

	return Message;
});
