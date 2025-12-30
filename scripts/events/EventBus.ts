/**
 * Type-safe event bus for application-wide events
 */

type EventMap = {
    'formula:selected': { formula: any };
    'calculation:complete': { result: any };
    'search:query': { query: string };
    'tab:changed': { tab: string };
    'classification:complete': { classification: string; temperature: number };
};

type EventKey = keyof EventMap;
type EventHandler<K extends EventKey> = (data: EventMap[K]) => void;

export class EventBus {
    private handlers: Map<EventKey, Set<EventHandler<any>>> = new Map();

    /**
     * Subscribe to event
     */
    on<K extends EventKey>(event: K, handler: EventHandler<K>): () => void {
        if (!this.handlers.has(event)) {
            this.handlers.set(event, new Set());
        }
        
        this.handlers.get(event)!.add(handler);
        
        // Return unsubscribe function
        return () => {
            this.handlers.get(event)?.delete(handler);
        };
    }

    /**
     * Subscribe once (auto-unsubscribe after first call)
     */
    once<K extends EventKey>(event: K, handler: EventHandler<K>): () => void {
        const wrappedHandler: EventHandler<K> = (data) => {
            handler(data);
            this.off(event, wrappedHandler);
        };
        return this.on(event, wrappedHandler);
    }

    /**
     * Emit event
     */
    emit<K extends EventKey>(event: K, data: EventMap[K]): void {
        const handlers = this.handlers.get(event);
        if (handlers) {
            handlers.forEach(handler => {
                try {
                    handler(data);
                } catch (error) {
                    console.error(`Error in event handler for ${event}:`, error);
                }
            });
        }
    }

    /**
     * Unsubscribe from event
     */
    off<K extends EventKey>(event: K, handler: EventHandler<K>): void {
        this.handlers.get(event)?.delete(handler);
    }

    /**
     * Clear all handlers
     */
    clear(): void {
        this.handlers.clear();
    }
}

// Singleton instance
let eventBusInstance: EventBus | null = null;

export function getEventBus(): EventBus {
    if (!eventBusInstance) {
        eventBusInstance = new EventBus();
    }
    return eventBusInstance;
}

// Expose to window for backward compatibility
if (typeof window !== 'undefined') {
    (window as any).EventBus = EventBus;
    (window as any).getEventBus = getEventBus;
    (window as any).eventBus = getEventBus();
}

