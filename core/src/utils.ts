export const delay = (ms: number) => new Promise((res) => setTimeout(res, ms));

export const waitFor = async (fn: () => Promise<boolean>, timeout = 1200, retryDelay = 30, customError?: string): Promise<void> => {
	if (timeout < 0) {
		const err = customError || `[Timeout exceeded while waiting for value to become true]`;
		throw new Error(err);
	}
	const val = await fn();
	if (!val) {
		const now = Date.now();
		await delay(retryDelay);
		const delta = Date.now() - now;
		return waitFor(fn, timeout - delta, retryDelay, customError);
	}
};

export const eventually = async (callback: () => void, timeout = 1200, retryDelay = 30, lastError: any = null): Promise<void> => {
if (timeout < 0) {
		throw new Error(`[Eventually timeout exceeded after: timeout with error]: ${lastError}`);
	}
	try {
		await callback();
	} catch (e) {
		const now = Date.now();
		await delay(retryDelay);
		const delta = Date.now() - now;
		return eventually(callback, timeout - delta, retryDelay, e);
	}
};
