import * as React from 'react';
import * as ReactDOM from 'react-dom';
import { TodoApp } from './react-todoapp';
import { EventsApp } from './react-events-app';

const w: any = window;

const b64 = w.__init;

let data = {items: []};

try {
	const raw = atob(b64);
	data = JSON.parse(raw);
} catch (e) {
	console.error('error parsing data, falling back to default');
}

const appNameToAppClass: {[idx: string]: React.ComponentClass<any>} = {
	'todo-app': TodoApp,
	'events-app': EventsApp
};

const element = React.createElement(appNameToAppClass[location.pathname.replace('/', '')], data);
ReactDOM.render(element, document.getElementById('root'));




