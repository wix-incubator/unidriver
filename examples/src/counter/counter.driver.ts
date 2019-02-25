import { UniDriver } from '@unidriver/core';

export type CounterDriver = {
	val: () => Promise<number>,
	increase: () => Promise<void>,
	decrease: () => Promise<void>
};

export const counterDriver = (base: UniDriver): CounterDriver => {
	return {
		val: async () => base.$('.value').text().then(parseInt),
		increase: base.$('.inc').click,
		decrease: base.$('.dec').click
	}
};
