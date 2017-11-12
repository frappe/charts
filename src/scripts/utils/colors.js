function limit_color(r){
	if (r > 255) return 255;
	else if (r < 0) return 0;
	return r;
}

export function lighten_darken_color(col, amt) {
	let usePound = false;
	if (col[0] == "#") {
		col = col.slice(1);
		usePound = true;
	}
	let num = parseInt(col,16);
	let r = limit_color((num >> 16) + amt);
	let b = limit_color(((num >> 8) & 0x00FF) + amt);
	let g = limit_color((num & 0x0000FF) + amt);
	return (usePound?"#":"") + (g | (b << 8) | (r << 16)).toString(16);
}

export function is_valid_color(string) {
	// https://stackoverflow.com/a/8027444/6495043
	return /(^#[0-9A-F]{6}$)|(^#[0-9A-F]{3}$)/i.test(string);
}