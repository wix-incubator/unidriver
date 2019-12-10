import * as React from 'react';
import { TodoApp, TodoAppProps } from './todo-app';
import { EventsApp, EventsAppProps } from './events';
import ReactDOM = require('react-dom');

export type TestAppProps = TodoAppProps & EventsAppProps;
export class TestApp extends React.Component<TestAppProps, {}> {
	render() {
		return (<main>
			<TodoApp {...this.props}/>
			<EventsApp/>
		</main>);
	}
}

export const renderTestApp = (element: HTMLElement, params: TestAppProps) => {
	const comp = React.createElement(TestApp, params);
	ReactDOM.render(comp, element);
	return () => ReactDOM.unmountComponentAtNode(element);
};
