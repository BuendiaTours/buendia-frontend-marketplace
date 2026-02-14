const isDev = import.meta.env.DEV;

export const logger = {
	log: (...args: unknown[]) => {
		if (isDev) console.log(...args); // eslint-disable-line no-console
	},
	info: (...args: unknown[]) => {
		if (isDev) console.info(...args); // eslint-disable-line no-console
	},
	warn: (...args: unknown[]) => console.warn(...args),
	error: (...args: unknown[]) => console.error(...args)
};
