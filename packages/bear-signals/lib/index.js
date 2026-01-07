// bear-signals - minimal signals library

// Global context - tracks which effect is currently executing
let listener = null;

/**
 * Creates a reactive signal
 * Returns [getter, setter] tuple like React's useState
 *
 * @param {*} initialValue - The initial value
 * @returns {[Function, Function]} [read, write] functions
 */
export function createSignal(initialValue) {
	let value = initialValue;
	const subscribers = new Set();

	// Getter function
	function read() {
		// Subscribe current listener (if any)
		if (listener) {
			subscribers.add(listener);
			// Bidirectional: effect also tracks this signal
			listener.dependencies.add(read);
		}
		return value;
	}

	// Setter function
	function write(newValue) {
		value = newValue;
		// Create snapshot to avoid issues with Set modification during iteration
		const subscribersSnapshot = [...subscribers];
		// Notify all subscribers
		for (const sub of subscribersSnapshot) {
			sub.execute();
		}
	}

	// Expose subscribers for cleanup (effects need to unsubscribe)
	read.subscribers = subscribers;

	return [read, write];
}

/**
 * Creates a reactive effect that automatically re-runs when its dependencies change
 *
 * @param {Function} fn - The effect function to run
 */
export function createEffect(fn) {
	const effect = {
		dependencies: new Set(),
		execute() {
			// Cleanup: unsubscribe from old dependencies
			cleanup(effect);

			// Set this effect as the current listener
			listener = effect;
			// Run the user's function (will subscribe to any signals it reads)
			fn();
			// Clear the listener
			listener = null;
		},
	};

	// Run immediately on creation
	effect.execute();
}

/**
 * Unsubscribes effect from all its dependencies
 * @param {Object} effect - The effect to clean up
 */
function cleanup(effect) {
	for (const signal of effect.dependencies) {
		signal.subscribers.delete(effect);
	}
	effect.dependencies.clear();
}

/**
 * Creates a memoized computed value
 * Only re-computes when dependencies change
 *
 * @param {Function} fn - The computation function
 * @returns {Function} A getter function for the computed value
 */
export function createMemo(fn) {
	let value;
	const subscribers = new Set();

	// The memo acts as an effect (has dependencies, re-runs)
	const memo = {
		dependencies: new Set(),
		execute() {
			// Cleanup old dependencies
			cleanup(memo);

			// Compute new value (this subscribes to signals)
			listener = memo;
			const newValue = fn();
			listener = null;

			// If value changed, notify subscribers
			if (newValue !== value) {
				value = newValue;
				const subscribersSnapshot = [...subscribers];
				for (const sub of subscribersSnapshot) {
					sub.execute();
				}
			}
		},
	};

	// Compute initial value
	memo.execute();

	// The memo also acts as a signal (can be read)
	function read() {
		// Subscribe current listener (if any)
		if (listener) {
			subscribers.add(listener);
			listener.dependencies.add(read);
		}
		return value;
	}

	// Expose subscribers for cleanup
	read.subscribers = subscribers;

	return read;
}
