import * as React from 'react';
import { Counter } from '../counter/counter';

export type State = {
	counters: string[];
};

export class MultiCounter extends React.PureComponent<{}, State> {
	state: State = {
		counters: ['init']
	};

	add = () => {
		const newKey = Math.floor(Math.random() * 99999).toString(32);
		this.setState({counters: [...this.state.counters, newKey]});
	};

	remove = (idx: number) => () => {
		const {counters} = this.state;
		const filtered = counters.filter((_, i) => i !== idx);
		this.setState({counters: filtered});
	};

	renderSingle = (key: string, idx: number) => {
		return (
		<div className='counter-wrapper' key={key}>
			<Counter init={0}/>
			<button className='remove' onClick={this.remove(idx)}>X</button>
		</div>);
	};

	render () {
		return (
		<div className='multi-counter'>
			{this.state.counters.map(this.renderSingle)}
			<button className='add' onClick={this.add}>Add</button>
		</div>);
	}
}
