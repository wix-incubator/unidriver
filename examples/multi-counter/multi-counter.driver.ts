import { UniDriver } from '../../lib/index';
import { counterDriver } from '../counter/counter.driver';

export type CounterDriver = {
	val: (idx: number) => Promise<number>,
	increase: (idx: number) => Promise<void>,
	decrease: (idx: number) => Promise<void>,
	add: () => Promise<void>,
	remove: (idx: number) => Promise<void>,
	count: () => Promise<number>
};

export const multiCounterDriver = (base: UniDriver): CounterDriver => {
	const counterDriverByIdx = (idx: number) => {
		return counterDriver(base.$$('.counter-wrapper').get(idx));
	};
	return {
		val: (idx: number) => counterDriverByIdx(idx).val(),
		increase: (idx: number) => counterDriverByIdx(idx).increase(),
		decrease: (idx: number) => counterDriverByIdx(idx).decrease(),
		add: () => base.$('.add').click(),
		remove: (idx: number) => base.$$('.counter-wrapper').get(idx).$('.remove').click(),
		count: () => base.$$('.counter-wrapper').count()
	};
};
