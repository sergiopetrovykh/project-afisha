import { Emitter, EventHandler, HandlersMap } from '@/types/components/base/EventEmitter';

export class EventEmitter<Events> implements Emitter<Events> {
	protected events: HandlersMap<Events>;

	constructor() {
		this.events = new Map() as HandlersMap<Events>;
	}

	on<E extends keyof Events>(eventName: E, handler: EventHandler<Events[E]>) {
		if (!this.events.has(eventName)) {
			this.events.set(eventName, new Set());
		}
		this.events.get(eventName).add(handler);
	}

	off<E extends keyof Events>(eventName: E, handler: EventHandler<Events[E]>) {
		if (this.events.has(eventName)) {
			this.events.get(eventName).delete(handler);
		}
	}

	emit<E extends keyof Events>(eventName: E, data?: Events[E]) {
		if (this.events.has(eventName)) {
			this.events.get(eventName).forEach((handler) => handler(data));
		}
	}

	reset() {
		this.events.clear();
	}

	bindEmitter(events: HandlersMap<Events>) {
		this.events = events;
	}
}
