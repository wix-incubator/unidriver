import * as React from 'react';
import ReactDOM = require('react-dom');

import { TodoApp } from './todo-app';
import { EventsApp } from './events';
import {RenderTestApp, TestAppProps} from '../types';

export class TestApp extends React.Component<TestAppProps, {}> {
	render() {
		return (<main>
			<TodoApp {...this.props}/>
			<EventsApp/>
		</main>);
	}
}

export const renderTestApp: RenderTestApp  = (element, params) => {
	const comp = React.createElement(TestApp, params);
	ReactDOM.render(comp, element);
	return () => ReactDOM.unmountComponentAtNode(element);
};
export {TestAppProps};
