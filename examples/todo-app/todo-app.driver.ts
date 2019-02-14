import { UniDriver } from '../../lib/index';

export type TodoAppDriver = {
	getItems: () => Promise<string[]>,
	addItem: (text: string) => Promise<void>,
	deleteItem: (idx: number) => Promise<void>,
	getCount: () => Promise<number>,
	isDone: (idx: number) => Promise<boolean>,
	toggleItem: (idx: number) => Promise<void>
};

export const todoAppDriver = (base: UniDriver): TodoAppDriver => {
	return {
		getItems: async () => base.$$('.title').text(),
		addItem: async (text: string) => {
			await base.$('input').enterValue(text);
			await base.$('button').click();
		},
		deleteItem: async (idx: number)  => base.$$('.item').get(idx).$('.delete').click(),
		getCount: async () => parseInt(await base.$('.count').text(), 10),
		isDone: async (idx: number) => {
			return base.$$('.item').get(idx).hasClass('done');
		},
		toggleItem: async (idx: number) => base.$$('.item').get(idx).$('.title').click()
	};
};
