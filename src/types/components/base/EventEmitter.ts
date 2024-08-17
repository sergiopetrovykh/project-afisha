export type EventMap = {
	[key: string]: unknown;
}
export type EventHandler<T> = (args: T) => void;
export type HandlersMap<Events, K extends keyof Events = keyof Events> = Events extends EventMap
	? Map<K, Set<EventHandler<Events[K]>>>
	: never;



export interface Emitter<Events> {
	on<E extends keyof Events>(eventName: E, handler: EventHandler<Events[E]>): void;
	off<E extends keyof Events>(eventName: E, handler: EventHandler<Events[E]>): void;
	emit<E extends keyof Events>(eventName: E, data?: Events[E]): void;
	reset(): void;
	bindEmitter(events: HandlersMap<Events>): void;
}