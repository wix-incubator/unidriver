module.exports = function (wallaby) {


	return {
		files: [
			'src/**/*.ts',
			'src/**/*.tsx',
			{pattern: 'src/**/*.test.tsx', ignore: true},
			{pattern: 'src/**/*.test.ts', ignore: true},
			{pattern: 'src/**/*.spec.tsx', ignore: true},
			{pattern: 'src/**/*.spec.ts', ignore: true},
			{pattern: 'node_modules/**/*', ignore: true}
		],
		tests: [
			'src/adapters/react-jsdom.spec.ts',
			'src/utils.spec.ts',
		],
		compilers: {
			'src/**/*.tsx?': wallaby.compilers.typeScript({
				module: 'commonjs',
				jsx: 'react'
			})
		},
		testFramework: 'mocha',
		env: {
			type: 'node'
		},
		setup: function (wallaby) {
		}
	}
};
