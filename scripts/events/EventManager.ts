/**
 * Type-safe event management with automatic cleanup
 */

type EventCallback = (event: Event) => void;

interface RegisteredListener {
    element: HTMLElement;
    event: string;
    callback: EventCallback;
    options?: boolean | AddEventListenerOptions;
}

export class EventManager {
    private listeners: RegisteredListener[] = [];
    private delegatedListeners: Map<HTMLElement, Map<string, EventCallback>> = new Map();

    /**
     * Add event listener with automatic tracking
     */
    on(
        element: HTMLElement,
        event: string,
        callback: EventCallback,
        options?: boolean | AddEventListenerOptions
    ): () => void {
        element.addEventListener(event, callback, options);
        
        const listener: RegisteredListener = {
            element,
            event,
            callback,
            options
        };
        
        this.listeners.push(listener);
        
        // Return cleanup function
        return () => this.off(element, event, callback);
    }

    /**
     * Remove specific event listener
     */
    off(element: HTMLElement, event: string, callback: EventCallback): void {
        element.removeEventListener(event, callback);
        
        this.listeners = this.listeners.filter(
            l => !(l.element === element && l.event === event && l.callback === callback)
        );
    }

    /**
     * Event delegation for dynamic content
     */
    delegate<T extends HTMLElement = HTMLElement>(
        parent: HTMLElement,
        event: string,
        selector: string,
        callback: (event: Event, target: T) => void
    ): () => void {
        const handler = (event: Event) => {
            const target = (event.target as HTMLElement).closest(selector) as T;
            if (target && parent.contains(target)) {
                callback(event, target);
            }
        };
        
        parent.addEventListener(event, handler, true);
        
        // Track delegated listener
        if (!this.delegatedListeners.has(parent)) {
            this.delegatedListeners.set(parent, new Map());
        }
        this.delegatedListeners.get(parent)!.set(event, handler);
        
        return () => {
            parent.removeEventListener(event, handler, true);
            this.delegatedListeners.get(parent)?.delete(event);
        };
    }

    /**
     * Cleanup all event listeners
     */
    cleanup(): void {
        // Remove regular listeners
        this.listeners.forEach(({ element, event, callback, options }) => {
            try {
                element.removeEventListener(event, callback, options);
            } catch (error) {
                console.warn('Error removing listener:', error);
            }
        });
        this.listeners = [];

        // Remove delegated listeners
        this.delegatedListeners.forEach((events, parent) => {
            events.forEach((handler, event) => {
                try {
                    parent.removeEventListener(event, handler, true);
                } catch (error) {
                    console.warn('Error removing delegated listener:', error);
                }
            });
        });
        this.delegatedListeners.clear();
    }
}

// Singleton instance
let eventManagerInstance: EventManager | null = null;

export function getEventManager(): EventManager {
    if (!eventManagerInstance) {
        eventManagerInstance = new EventManager();
    }
    return eventManagerInstance;
}

// Expose to window for backward compatibility
if (typeof window !== 'undefined') {
    (window as any).EventManager = EventManager;
    (window as any).getEventManager = getEventManager;
}

