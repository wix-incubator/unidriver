# UniDriver
Universal API to control your UI components that work in all test levels. From component jsdom tests, to browser testing using Puppeteer / Selenium.
Making BDD fun in the modular UI area.

[![NPM Version](https://img.shields.io/npm/v/unidriver.svg?style=flat)](https://www.npmjs.com/package/unidriver)
[![Build Status](https://travis-ci.org/wix-incubator/unidriver.svg?branch=master)](https://travis-ci.org/wix-incubator/unidriver)

UniDriver makes it saner to write UI testing. It enables creating component drivers that will work on all platforms, from jsdom to puppeteer and selenium.

[Migrating from ~v2.0.1 to latest version](/migrating.md)

## Component Drivers
Testing UI is hard. There are many reasons for that, but we believe a big one relies in the fact that unlike functions or services, where the API is clearly defined, when dealing with graphical user interfaces, it's up for the developer to transform it into an "API" for testing purposes.
Back in the days, [PageObjects](https://martinfowler.com/bliki/PageObject.html) helped mitigate this fact, but once the world moved to  modular components, our test code quality degraded and became bloated with repetition and lack of abstraction.  
Component drivers are just like page objects, but for your components.  Just like page objects, this is merely a pattern, and is not coupled to a specific implementation.
However, using UniDriver as the basis for your component drivers will help you leverage years of trial and error and be able to fully re-use your drivers across platforms.
This allows you to confidently write tests that use your actual implementation and keep focusing on the *"what"* and not the *"how"*


## Philosophy
UniDriver aims to provide an API for what a manual tester can do. This means that the API will not focus on implementation, but on the actual action a user would take.
For example, a user doesn't `focus` an input, it clicks on it (and the browser gives it focus as a result). A user doesn't mouseUp, it  clicks. It hovers.

Moreover, just like users, UniDriver is lazy and async:
- Lazy - all actions are evaluated only when needed. Calling `const comp = $('.bob)` will not do anything until something is requested (like `comp.text()` or `comp.click()`). This allows to create locators for parts of the UI without relying on the element to be visible. This is particularly helpful on JSDOM level tests.
- Async - all actions returns are async (just like real users), and thus all interactions will return a promise.

## Examples
In the [examples](/examples) folder you can find 3 small apps; a todo-app, a counter and a multi counter.
Each app contains a driver that uses UniDriver, component tests and e2e tests (puppeteer, todo app has selenium too).
As you can see, all test levels use the *same* driver, meaning that if the feature's implementation changes, you'll need to change the driver alone, not the tests.


## Usage
This library provides an API to interact with UI elements - `UniDriver` and `UniDriverList`, that combines the common features between all popular automation libraries and solutions. This API is represented by a type definition only, and should be implemented by adapters.

The idea is that a component driver is a function of the driver of it's container, and is completely agnostic to how the initial driver was originally generated. 
For example, a driver for a todo App might look like this:

```typescript
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

- [JSDOM - React (DOM + React test utils)](adapters/jsdom-react)
- [JSDOM - Svelte (DOM + @testing-library/svelte)](adapters/jsdom-svelte)
- [Puppeteer](adapters/puppeteer)
- [Selenium](adapters/selenium)
- [Protractor](adapters/protractor)

Writing an adapter is easy - you just need to implement the UniDriver API.
An standard test suite to ensure the properties of the base drivers are kept through the adapters is in the road map.

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

```typescript
export const createTodoAppDriver = (wrapper: UniDriver) => {

	return {
		addItem: (name: string) => { /*type input, click button.. */}
		removeItem: (idx: number) => { 
			const item = wrapper.$$('.item').get(idx);
			item.click('.open-actions');
			item.$('.popover').$('.delete').click(); // This won't work!! the ".popover" element is not a direct child of the component
		}
	}
}
```

With passing a second argument representing the "outer world":
```typescript
export const createTodoAppDriver = (wrapper: UniDriver, theOuterWorld: UniDriver) => {

	return {
		addItem: (name: string) => { /*type input, click button.. */}
		removeItem: (idx: number) => { 
			const item = wrapper.$$('.item').get(idx);
			item.click('.open-actions');

			const popover = theOuterWorld.$('.popover');
			popover.$('.delete').click(); // this will work
		}
	}
}
```

Because UniDrivers are *lazy*, you can even do this: 

```typescript
export const createPopoverDriver = (wrapper: UniDriver) => wrapper.$('.popover');

export const createTodoAppDriver = (wrapper: UniDriver, theOuterWorld: UniDriver) => {

	const popover = createPopoverDriver(theOuterWorld);
	return {
		addItem: (name: string) => { /*type input, click button.. */}
		removeItem: (idx: number) => { 
			const item = wrapper.$$('.item').get(idx);
			item.click('.open-actions');

			popover.$('.delete').click(); //  this will still work, as the popover will be resolved only here
		}
	}
}
```

### How do I click outside MyComponent?

Clicking outside means clicking on any other element that is not MyComponent.
This will work nicely in real browsers, but JSDOM might not create the right events, so you can add your own simulation to them if you'd like.

Example:

```typescript
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
A standard test-suite on each adapter to ensure proper behavior of the API on each adapter. It is given a working todo-app, and by testing it's features and assuming that it is working well, we can test the adapters functionality. 
Check out [the code](test-suite/src/run-test-suite.ts) for more details

## Road map
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
