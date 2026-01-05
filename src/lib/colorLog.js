const wrapper = (str, color) => `${color}${str}\x1b[0m`;

export const ColorLog = {
	cyan: (str) => wrapper(str, "\x1b[36m"),
	dim: (str) => wrapper(str, "\x1b[2m"),
	green: (str) => wrapper(str, "\x1b[32m"),
	yellow: (str) => wrapper(str, "\x1b[33m"),
};
