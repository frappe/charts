const PRESET_COLOR_MAP = {
	'pink': '#F683AE',
	'blue': '#318AD8',
	'green': '#48BB74',
	'grey': '#A6B1B9',
	'red': '#F56B6B',
	'yellow': '#FACF7A',
	'purple': '#44427B',
	'teal': '#5FD8C4',
	'cyan': '#15CCEF',
	'orange': '#F8814F',
	'light-pink': '#FED7E5',
	'light-blue': '#BFDDF7',
	'light-green': '#48BB74',
	'light-grey': '#F4F5F6',
	'light-red': '#F6DFDF',
	'light-yellow': '#FEE9BF',
	'light-purple': '#E8E8F7',
	'light-teal': '#D3FDF6',
	'light-cyan': '#DDF8FD',
	'light-orange': '#FECDB8'
};

function limitColor(r) {
	if (r > 255) return 255;
	else if (r < 0) return 0;
	return r;
}

export function lightenDarkenColor(color, amt) {
	let col = getColor(color);
	let usePound = false;
	if (col[0] == "#") {
		col = col.slice(1);
		usePound = true;
	}
	let num = parseInt(col, 16);
	let r = limitColor((num >> 16) + amt);
	let b = limitColor(((num >> 8) & 0x00FF) + amt);
	let g = limitColor((num & 0x0000FF) + amt);
	return (usePound ? "#" : "") + (g | (b << 8) | (r << 16)).toString(16);
}

export function isValidColor(string) {
	// https://stackoverflow.com/a/32685393
	let HEX_RE = /(^\s*)(#)((?:[A-Fa-f0-9]{3}){1,2})$/i;
	let RGB_RE = /(^\s*)(rgb|hsl)(a?)[(]\s*([\d.]+\s*%?)\s*,\s*([\d.]+\s*%?)\s*,\s*([\d.]+\s*%?)\s*(?:,\s*([\d.]+)\s*)?[)]$/i;
	return HEX_RE.test(string) || RGB_RE.test(string);
}

export const getColor = (color) => {
	// When RGB color, convert to hexadecimal (alpha value is omitted)
	if((/rgb[a]{0,1}\([\d, ]+\)/gim).test(color)) {
		return (/\D+(\d*)\D+(\d*)\D+(\d*)/gim).exec(color)
			.map((x, i) => (i !== 0 ? Number(x).toString(16) : '#'))
			.reduce((c, ch) => `${c}${ch}`);
	}
	return PRESET_COLOR_MAP[color] || color;
};
