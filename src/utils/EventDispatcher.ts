// Global event handling system for cross-module communication.
// src/utils/EventDispatcher.ts

type EventCallback=(data: any) => void;

/**
 * Singleton Class: EventDispatcherClass
 * Manages event subscriptions and dispatches.
 */
class EventDispatcherClass {
	private events: Record<string,EventCallback[]>={};

	/**
	 * Subscribes to an event.
	 * @param event The event type to subscribe to.
	 * @param callback The callback to invoke when the event is dispatched.
	 */
	public on(event: string,callback: EventCallback): void {
		if(!this.events[event]) {
			this.events[event]=[];
		}
		this.events[event].push(callback);
	}

	/**
	 * Unsubscribes from an event.
	 * @param event The event type to unsubscribe from.
	 * @param callback The callback to remove.
	 */
	public off(event: string,callback: EventCallback): void {
		if(!this.events[event]) return;
		this.events[event]=this.events[event].filter((cb) => cb!==callback);
	}

	/**
	 * Dispatches an event to all subscribed callbacks.
	 * @param event The event type to dispatch.
	 * @param data The data to pass to the callbacks.
	 */
	public dispatch(event: string,data: any): void {
		if(!this.events[event]) return;
		this.events[event].forEach((callback) => callback(data));
	}
}

// Export the singleton instance
export const EventDispatcher=new EventDispatcherClass();
