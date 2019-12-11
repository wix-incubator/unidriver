module.exports = function (wallaby) {


	return {
		files: [
			'src/**/*.ts',
			'src/**/*.tsx',
			{pattern: 'src/**/spec.tsx', ignore: true},
			{pattern: 'src/**/spec.ts', ignore: true},
			{pattern: 'node_modules/**/*', ignore: true}
		],
		tests: [
			'src/spec.tsx'
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
