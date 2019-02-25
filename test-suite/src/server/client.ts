import { renderTestApp } from "../test-app";

const w: any = window;

const b64 = w.__init;

let data = {items: []};

try {
	const raw = atob(b64);
	data = JSON.parse(raw);
} catch (e) {
	console.error('error parsing data, falling back to default');
}

const root = document.getElementById('root') as HTMLElement;
renderTestApp(root, data);




