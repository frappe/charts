const PRESET_COLOR_MAP = {
	'light-blue': '#7cd6fd',
	'blue': '#5e64ff',
	'violet': '#743ee2',
	'red': '#ff5858',
	'orange': '#ffa00a',
	'yellow': '#feef72',
	'green': '#28a745',
	'light-green': '#98d85b',
	'purple': '#b554ff',
	'magenta': '#ffa3ef',
	'black': '#36114C',
	'grey': '#bdd3e6',
	'light-grey': '#f0f4f7',
	'dark-grey': '#b8c2cc'
};

function limitColor(r){
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
	let num = parseInt(col,16);
	let r = limitColor((num >> 16) + amt);
	let b = limitColor(((num >> 8) & 0x00FF) + amt);
	let g = limitColor((num & 0x0000FF) + amt);
	return (usePound?"#":"") + (g | (b << 8) | (r << 16)).toString(16);
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
