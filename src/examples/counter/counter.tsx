import * as React from 'react';

export type CounterProps = {
	init: number;
};

export type State = {
	counter: number;
};

export class Counter extends React.PureComponent<CounterProps, State> {
	state: State = {
		counter: this.props.init
	};

	incBy = (d: number) => this.setState({counter: this.state.counter + d});

	inc = () => this.incBy(1);

	dec = () => this.incBy(-1);

	render () {
		return (
		<div className='counter'>
			<button className='inc' onClick={this.inc}>+</button>
			<span className='value'>{this.state.counter}</span>
			<button className='dec' onClick={this.dec}>-</button>
		</div>);
	}
}
