# UniDriver

Universal component drivers that can be reused in all test levels, from component test level to e2e.

[![NPM Version](https://img.shields.io/npm/v/unidriver.svg?style=flat)](https://www.npmjs.com/package/unidriver)
[![Build Status](https://travis-ci.org/wix-incubator/unidriver.svg?branch=master)](https://travis-ci.org/wix-incubator/unidriver)

## Motivation

Drivers have singificantly improved the quaility of our ui tests, by helping focusing on the feature and not implementation.
However, all implementations of drivers I encountered rely deeply on the platform the ui is running on (node, browser), each with it's own quirks, making it hard to share drivers between platforms.

The core idea is to make sure all drivers are *lazy* and *async*, just like real testers, unlink most tests now which are *eager* and mostly *sync*.

This library's implementation provides an abstraction over the UI that can be implemented by all current testing solutions; DOM, Selenium, Puppeteer.


## Usage
This library provides an API to interact with UI elements - `UniDriver` and `UniDriverList`, that combines the common features between all popular automation libraries and solutions. This API is represented by a type definition only, and should be implemented by adapters.

The idea is that a component driver is a function of the driver of it's container, and is completely agnostic to how the initial driver was originally generated. 
For example, a driver for a todo App might look like this:

```
const todoAppDriver = (base: UniDriver) => {
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

- [React (DOM + React testutils)](src/lib/react)
- [Puppeteer](src/lib/puppeteer)
- [Selenium](src/lib/selenium)

Writing an adapter is easy - you just need to implement the UniDriver API.
An standard test suite to ensure the properties of the base drivers are kept through the adapters is in the roadmap.

## Examples
1. Simple counter, includes jsdom tests and pupeteer tests - [src/examples/counter](src/examples/counter)
2. Multi counter, includes jsdom tests and pupeteer tests. Reuses the driver from #2 - [src/examples/multi-counter](src/examples/multi-counter)
3. Todo app - includes jsdom tests, pupeteer and selenium tests.[src/examples/todo-app](src/examples/todo-app)


## FAQ

### How do I use it with a portaled elements (i.e. popovers, modals)?

*Short answer:*  
Pass a second UniDriver, representing the "global" popover, and use that to find your popover / modal.

*Longer answer:*  
Some components are composed of portaled components (I'm not referring to React portals, but the concept behind it).  
Portaled elements are magical (just like real-life portals), meaning that while conceptually they are part of their parent, implementation wise they are not (at least in the DOM, who knows what native mobile will bring us).  
This means that if you want to reference them in your component's driver, you should also give the driver a unidriver wrapper for the whole "body".

Example:  
You have a to-do app, and each row has some actions (rename, delete). The actions menu is inside a popover.

A naive attempt of a driver might look like this:

```
export const createTodoAppDriver = (wrapper: UniDriver) => {

	return {
		addItem: (name: string) => { /*type input, click button.. */}
		removeItem: (idx: number) => { 
			const item = wrapper.$$('.item').get(idx);
			item.click('.open-actions');
			item.$('.popover).$('.delete).click(); // This won't work!! the ".popover" element is not a direct child of the component
		}
	}
}
```

With passing a second argument representing the "outer world":
```
export const createTodoAppDriver = (wrapper: UniDriver, theOuterWorld: UniDriver) => {

	return {
		addItem: (name: string) => { /*type input, click button.. */}
		removeItem: (idx: number) => { 
			const item = wrapper.$$('.item').get(idx);
			item.click('.open-actions');

			const popover = theOuterWorld.$('.popover);
			popover.$('.delete).click(); // this will work
		}
	}
}
```

Because UniDrivers are *lazy*, you can even do this: 

```
export const createPopoverDriver = (wrapper: UniDriver) => wrapper.$('.popover');

export const createTodoAppDriver = (wrapper: UniDriver, theOuterWorld: UniDriver) => {

	const popover = createPopoverDriver(theOuterWorld);
	return {
		addItem: (name: string) => { /*type input, click button.. */}
		removeItem: (idx: number) => { 
			const item = wrapper.$$('.item').get(idx);
			item.click('.open-actions');

			popover.$('.delete).click(); //  this will still work, as the popover will be resolved only here
		}
	}
}
```

### How do I click outside MyComponent?

Clicking outside means clicking on any other element that is not MyComponent.
This will work nicely in real browsers, but JSDOM might not create the right events, so you can add your own simulation to them if you'd like.

Example:

```
export const createMyCoolDriver = (wrapper: UniDriver, theOuterWorld: UniDriver) => {

	dismissModal: () => {

		wrapper.$('.some-element-that-is-not-a-modal').click();

		// option 1
		if (wrapper.type === 'react') {
			const domElement = wrapper.getNative();
			clickOnParentUsingDomApi(domElement);
		}

		// option 2 - might work..
		theOuterWorld.$('.some-other-element').click();
	}	
}
```



## Test Suite
A standard testsuite on each adapter to ensure proper behaviour of the API on each adapter. It is given a working todo-app, and by testing it's features and assuming that it is working well, we can test the adapters functionality. 
Checkout [the code](src/test-suite/run-test-suite.ts) for more details

## Roadmap
- Add more users to validate idea and API
- ~Choose name + rename (runner up - "UniDriver")~
- ~Add standard test suite for the base driver~
- ~add tests to current adapters~
- add driver examples to complex ui components, such as Google material date picker
- add enzyme adapter
- drag and drop support
- add some FAQ (modals, popovers, enzyme?)
- experiment mobile testing
- branding, documentation, more examples
- move to github.com/wix









