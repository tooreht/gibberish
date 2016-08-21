import m from 'm';
import moment from 'moment';

export class Message {
	constructor(data) {
		var now = moment();
		this.ts = m.prop(now);
		this.text = m.prop(data.text);
		this.sent = m.prop(false);
	}
}
