import * as express from 'express';
import * as ejs from 'ejs';
import {readFileSync} from 'fs';
import * as path from 'path';
import {Server} from 'http';

export const startServer = (port: number): Promise<Server> => {

	const app = express();

	return new Promise((resolve) => {

		app.use(express.static('dist'));
		app.use(express.static('node_modules'));

		app.get('/', (_, res) => {
			const template = readFileSync(path.resolve(__dirname, '../index.ejs'), 'utf-8');
			res.send(ejs.render(template, {bundleUrl: 'bundle.js'}));
		});

		const server = app.listen(port);
		resolve(server);

	});
};



