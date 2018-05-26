# UniDriver

Universal component drivers that can be reused in all test levels, from component to e2e.

[![NPM Version](https://img.shields.io/npm/v/unidriver.svg?style=flat)](https://www.npmjs.com/package/unidriver)
[![Build Status](https://travis-ci.org/wix-incubator/unidriver.svg?branch=master)](https://travis-ci.org/wix-incubator/unidriver)


Drivers have singificantly improved the quaility of our ui tests, by helping focusing on the feature and not implementation.
However, all implementations I encountered rely deeply on the platform the ui is running on (node, browser), each with it's own quirks.

The core idea is to make sure all drivers are *lazy* and *async*, just like real testers, unlink most tests now which are *eager* and mostly *sync*.

This library's implementation provides an abstraction over the UI that can be implemented by all current testing solutions; DOM, Selenium, Puppeteer.


## Usage
This library provides an API to interact with UI elements - `UniDriver` and `UniDriverList`, that combines the common features between all popular automation libraries and solutions. This API is represented by a type definition only, and should be implemented by adapters.

The idea is that a component driver is a function of the driver of it's container, and is completely agnostic to how the initial driver was originally generated. 
For example, a driver for a todo App might look like this:

```
const todoAppDriver = (container: UniDriver) => {
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
```
By making it *a function* of a container base driver, we abstract away all implementations details of the platform we're currently running on (for example, `$` will be implemented as `.querySelector` in the DOM/React adapter but on Selenium it'll be `wd.findElement(By.css(selector))`. This makes the `todoAppDriver` shareable between contexts, enabling very DRY tests, and potentially even test sharing as well.

This pattern can be nested as one see fit, enabling users to create a cross-platform automation API for their apps, from component/unit test level, and up to e2e automation testing. All sharing the using the same drivers, and by that ensuring that the driver works.

## Available Adapters

- [React (DOM + React testutils)](lib/react)
- [Puppeteer](lib/puppeteer)
- [Selenium](lib/selenium)

Writing an adapter is easy - you just need to implement the UniDriver API.
An standard test suite to ensure the properties of the base drivers are kept through the adapters is in the roadmap.

## Examples
1. Simple counter, includes jsdom tests and pupeteer tests - [src/examples/counter](examples/counter)
2. Multi counter, includes jsdom tests and pupeteer tests. Reuses the driver from #2 - [src/examples/multi-counter](examples/multi-counter)
3. Todo app - includes jsdom tests, pupeteer and selenium tests.[src/examples/todo-app](examples/todo-app)

## Roadmap
- Add more users to validate idea and API
√ Choose name + rename (runner up - "UniDriver")
√ Add standard test suite for the base driver
√ add tests to current adapters
- add driver examples to complex ui components, such as Google material date picker
- popover/modal example
- drag and drop support
- add some FAQ (modals, popovers, enzyme?)
- experiment with this for mobile as solutions
- branding, documentation, more examples
- move to github.com/wix


### FAQ
TBD






