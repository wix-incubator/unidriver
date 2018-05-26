import * as React from 'react';
import * as ReactDOM from 'react-dom';
import { TodoApp } from './todo-app/todo-app';
import { Counter } from './counter/counter';
import { MultiCounter } from './multi-counter/multi-counter';

const showCase = (<div>
	<h1>Todo app</h1>
	<TodoApp/>

	<h1>Counter</h1>
	<Counter init={0}/>

	<h1>Multi Counter</h1>
	<MultiCounter/>
</div>)

ReactDOM.render(showCase, document.querySelector('#root'));
