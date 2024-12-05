// Global event handling system for cross-module communication.
// src/utils/EventDispatcher.ts

type EventCallback=(data: any) => void;

class EventDispatcherClass {
	private events: Record<string,EventCallback[]>={};

	public on(event: string,callback: EventCallback): void {
		if(!this.events[event]) {
			this.events[event]=[];
		}
		this.events[event].push(callback);
	}

	public off(event: string,callback: EventCallback): void {
		if(!this.events[event]) return;
		this.events[event]=this.events[event].filter((cb) => cb!==callback);
	}

	public dispatch(event: string,data: any): void {
		if(!this.events[event]) return;
		this.events[event].forEach((callback) => callback(data));
	}
}

export const EventDispatcher=new EventDispatcherClass();
