
(function(l, r) { if (l.getElementById('livereloadscript')) return; r = l.createElement('script'); r.async = 1; r.src = '//' + (window.location.host || 'localhost').split(':')[0] + ':35729/livereload.js?snipver=1'; r.id = 'livereloadscript'; l.head.appendChild(r) })(window.document);
(function () {
    'use strict';

    function noop() { }
    function add_location(element, file, line, column, char) {
        element.__svelte_meta = {
            loc: { file, line, column, char }
        };
    }
    function run(fn) {
        return fn();
    }
    function blank_object() {
        return Object.create(null);
    }
    function run_all(fns) {
        fns.forEach(run);
    }
    function is_function(thing) {
        return typeof thing === 'function';
    }
    function safe_not_equal(a, b) {
        return a != a ? b == b : a !== b || ((a && typeof a === 'object') || typeof a === 'function');
    }

    function append(target, node) {
        target.appendChild(node);
    }
    function insert(target, node, anchor) {
        target.insertBefore(node, anchor || null);
    }
    function detach(node) {
        node.parentNode.removeChild(node);
    }
    function destroy_each(iterations, detaching) {
        for (let i = 0; i < iterations.length; i += 1) {
            if (iterations[i])
                iterations[i].d(detaching);
        }
    }
    function element(name) {
        return document.createElement(name);
    }
    function text(data) {
        return document.createTextNode(data);
    }
    function space() {
        return text(' ');
    }
    function listen(node, event, handler, options) {
        node.addEventListener(event, handler, options);
        return () => node.removeEventListener(event, handler, options);
    }
    function prevent_default(fn) {
        return function (event) {
            event.preventDefault();
            // @ts-ignore
            return fn.call(this, event);
        };
    }
    function attr(node, attribute, value) {
        if (value == null)
            node.removeAttribute(attribute);
        else if (node.getAttribute(attribute) !== value)
            node.setAttribute(attribute, value);
    }
    function children(element) {
        return Array.from(element.childNodes);
    }
    function custom_event(type, detail) {
        const e = document.createEvent('CustomEvent');
        e.initCustomEvent(type, false, false, detail);
        return e;
    }

    let current_component;
    function set_current_component(component) {
        current_component = component;
    }

    const dirty_components = [];
    const binding_callbacks = [];
    const render_callbacks = [];
    const flush_callbacks = [];
    const resolved_promise = Promise.resolve();
    let update_scheduled = false;
    function schedule_update() {
        if (!update_scheduled) {
            update_scheduled = true;
            resolved_promise.then(flush);
        }
    }
    function add_render_callback(fn) {
        render_callbacks.push(fn);
    }
    function flush() {
        const seen_callbacks = new Set();
        do {
            // first, call beforeUpdate functions
            // and update components
            while (dirty_components.length) {
                const component = dirty_components.shift();
                set_current_component(component);
                update(component.$$);
            }
            while (binding_callbacks.length)
                binding_callbacks.pop()();
            // then, once components are updated, call
            // afterUpdate functions. This may cause
            // subsequent updates...
            for (let i = 0; i < render_callbacks.length; i += 1) {
                const callback = render_callbacks[i];
                if (!seen_callbacks.has(callback)) {
                    callback();
                    // ...so guard against infinite loops
                    seen_callbacks.add(callback);
                }
            }
            render_callbacks.length = 0;
        } while (dirty_components.length);
        while (flush_callbacks.length) {
            flush_callbacks.pop()();
        }
        update_scheduled = false;
    }
    function update($$) {
        if ($$.fragment !== null) {
            $$.update();
            run_all($$.before_update);
            $$.fragment && $$.fragment.p($$.ctx, $$.dirty);
            $$.dirty = [-1];
            $$.after_update.forEach(add_render_callback);
        }
    }
    const outroing = new Set();
    let outros;
    function group_outros() {
        outros = {
            r: 0,
            c: [],
            p: outros // parent group
        };
    }
    function check_outros() {
        if (!outros.r) {
            run_all(outros.c);
        }
        outros = outros.p;
    }
    function transition_in(block, local) {
        if (block && block.i) {
            outroing.delete(block);
            block.i(local);
        }
    }
    function transition_out(block, local, detach, callback) {
        if (block && block.o) {
            if (outroing.has(block))
                return;
            outroing.add(block);
            outros.c.push(() => {
                outroing.delete(block);
                if (callback) {
                    if (detach)
                        block.d(1);
                    callback();
                }
            });
            block.o(local);
        }
    }
    function create_component(block) {
        block && block.c();
    }
    function mount_component(component, target, anchor) {
        const { fragment, on_mount, on_destroy, after_update } = component.$$;
        fragment && fragment.m(target, anchor);
        // onMount happens before the initial afterUpdate
        add_render_callback(() => {
            const new_on_destroy = on_mount.map(run).filter(is_function);
            if (on_destroy) {
                on_destroy.push(...new_on_destroy);
            }
            else {
                // Edge case - component was destroyed immediately,
                // most likely as a result of a binding initialising
                run_all(new_on_destroy);
            }
            component.$$.on_mount = [];
        });
        after_update.forEach(add_render_callback);
    }
    function destroy_component(component, detaching) {
        const $$ = component.$$;
        if ($$.fragment !== null) {
            run_all($$.on_destroy);
            $$.fragment && $$.fragment.d(detaching);
            // TODO null out other refs, including component.$$ (but need to
            // preserve final state?)
            $$.on_destroy = $$.fragment = null;
            $$.ctx = [];
        }
    }
    function make_dirty(component, i) {
        if (component.$$.dirty[0] === -1) {
            dirty_components.push(component);
            schedule_update();
            component.$$.dirty.fill(0);
        }
        component.$$.dirty[(i / 31) | 0] |= (1 << (i % 31));
    }
    function init(component, options, instance, create_fragment, not_equal, props, dirty = [-1]) {
        const parent_component = current_component;
        set_current_component(component);
        const prop_values = options.props || {};
        const $$ = component.$$ = {
            fragment: null,
            ctx: null,
            // state
            props,
            update: noop,
            not_equal,
            bound: blank_object(),
            // lifecycle
            on_mount: [],
            on_destroy: [],
            before_update: [],
            after_update: [],
            context: new Map(parent_component ? parent_component.$$.context : []),
            // everything else
            callbacks: blank_object(),
            dirty
        };
        let ready = false;
        $$.ctx = instance
            ? instance(component, prop_values, (i, ret, value = ret) => {
                if ($$.ctx && not_equal($$.ctx[i], $$.ctx[i] = value)) {
                    if ($$.bound[i])
                        $$.bound[i](value);
                    if (ready)
                        make_dirty(component, i);
                }
                return ret;
            })
            : [];
        $$.update();
        ready = true;
        run_all($$.before_update);
        // `false` as a special case of no DOM component
        $$.fragment = create_fragment ? create_fragment($$.ctx) : false;
        if (options.target) {
            if (options.hydrate) {
                // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
                $$.fragment && $$.fragment.l(children(options.target));
            }
            else {
                // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
                $$.fragment && $$.fragment.c();
            }
            if (options.intro)
                transition_in(component.$$.fragment);
            mount_component(component, options.target, options.anchor);
            flush();
        }
        set_current_component(parent_component);
    }
    class SvelteComponent {
        $destroy() {
            destroy_component(this, 1);
            this.$destroy = noop;
        }
        $on(type, callback) {
            const callbacks = (this.$$.callbacks[type] || (this.$$.callbacks[type] = []));
            callbacks.push(callback);
            return () => {
                const index = callbacks.indexOf(callback);
                if (index !== -1)
                    callbacks.splice(index, 1);
            };
        }
        $set() {
            // overridden by instance, if it has props
        }
    }

    function dispatch_dev(type, detail) {
        document.dispatchEvent(custom_event(type, detail));
    }
    function append_dev(target, node) {
        dispatch_dev("SvelteDOMInsert", { target, node });
        append(target, node);
    }
    function insert_dev(target, node, anchor) {
        dispatch_dev("SvelteDOMInsert", { target, node, anchor });
        insert(target, node, anchor);
    }
    function detach_dev(node) {
        dispatch_dev("SvelteDOMRemove", { node });
        detach(node);
    }
    function listen_dev(node, event, handler, options, has_prevent_default, has_stop_propagation) {
        const modifiers = options === true ? ["capture"] : options ? Array.from(Object.keys(options)) : [];
        if (has_prevent_default)
            modifiers.push('preventDefault');
        if (has_stop_propagation)
            modifiers.push('stopPropagation');
        dispatch_dev("SvelteDOMAddEventListener", { node, event, handler, modifiers });
        const dispose = listen(node, event, handler, options);
        return () => {
            dispatch_dev("SvelteDOMRemoveEventListener", { node, event, handler, modifiers });
            dispose();
        };
    }
    function attr_dev(node, attribute, value) {
        attr(node, attribute, value);
        if (value == null)
            dispatch_dev("SvelteDOMRemoveAttribute", { node, attribute });
        else
            dispatch_dev("SvelteDOMSetAttribute", { node, attribute, value });
    }
    function prop_dev(node, property, value) {
        node[property] = value;
        dispatch_dev("SvelteDOMSetProperty", { node, property, value });
    }
    function set_data_dev(text, data) {
        data = '' + data;
        if (text.data === data)
            return;
        dispatch_dev("SvelteDOMSetData", { node: text, data });
        text.data = data;
    }
    class SvelteComponentDev extends SvelteComponent {
        constructor(options) {
            if (!options || (!options.target && !options.$$inline)) {
                throw new Error(`'target' is a required option`);
            }
            super();
        }
        $destroy() {
            super.$destroy();
            this.$destroy = () => {
                console.warn(`Component was already destroyed`); // eslint-disable-line no-console
            };
        }
    }

    /* src/svelte-app/Todo/TodoItem.svelte generated by Svelte v3.16.1 */

    const file = "src/svelte-app/Todo/TodoItem.svelte";

    // (20:4) {#if item.completed}
    function create_if_block(ctx) {
    	let span;

    	const block = {
    		c: function create() {
    			span = element("span");
    			span.textContent = "Completed!";
    			attr_dev(span, "class", "completed");
    			add_location(span, file, 20, 8, 405);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, span, anchor);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(span);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block.name,
    		type: "if",
    		source: "(20:4) {#if item.completed}",
    		ctx
    	});

    	return block;
    }

    function create_fragment(ctx) {
    	let div;
    	let span;
    	let t0_value = /*item*/ ctx[0].label + "";
    	let t0;
    	let t1;
    	let t2;
    	let button;
    	let div_class_value;
    	let div_data_value_value;
    	let dispose;
    	let if_block = /*item*/ ctx[0].completed && create_if_block(ctx);

    	const block = {
    		c: function create() {
    			div = element("div");
    			span = element("span");
    			t0 = text(t0_value);
    			t1 = space();
    			if (if_block) if_block.c();
    			t2 = space();
    			button = element("button");
    			button.textContent = "Toggle";
    			attr_dev(span, "class", "label");
    			add_location(span, file, 18, 4, 332);
    			attr_dev(button, "class", "toggle");
    			add_location(button, file, 22, 4, 461);
    			attr_dev(div, "class", div_class_value = `todo-item ${/*isActive*/ ctx[1] ? "active" : ""} ${/*item*/ ctx[0].completed ? "done" : ""}`);
    			attr_dev(div, "data-value", div_data_value_value = /*item*/ ctx[0].id);
    			add_location(div, file, 13, 0, 158);

    			dispose = [
    				listen_dev(button, "click", /*onToggle*/ ctx[2], false, false, false),
    				listen_dev(div, "mouseenter", /*onHover*/ ctx[3], false, false, false),
    				listen_dev(div, "mouseleave", /*onBlur*/ ctx[4], false, false, false)
    			];
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);
    			append_dev(div, span);
    			append_dev(span, t0);
    			append_dev(div, t1);
    			if (if_block) if_block.m(div, null);
    			append_dev(div, t2);
    			append_dev(div, button);
    		},
    		p: function update(ctx, [dirty]) {
    			if (dirty & /*item*/ 1 && t0_value !== (t0_value = /*item*/ ctx[0].label + "")) set_data_dev(t0, t0_value);

    			if (/*item*/ ctx[0].completed) {
    				if (!if_block) {
    					if_block = create_if_block(ctx);
    					if_block.c();
    					if_block.m(div, t2);
    				}
    			} else if (if_block) {
    				if_block.d(1);
    				if_block = null;
    			}

    			if (dirty & /*isActive, item*/ 3 && div_class_value !== (div_class_value = `todo-item ${/*isActive*/ ctx[1] ? "active" : ""} ${/*item*/ ctx[0].completed ? "done" : ""}`)) {
    				attr_dev(div, "class", div_class_value);
    			}

    			if (dirty & /*item*/ 1 && div_data_value_value !== (div_data_value_value = /*item*/ ctx[0].id)) {
    				attr_dev(div, "data-value", div_data_value_value);
    			}
    		},
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    			if (if_block) if_block.d();
    			run_all(dispose);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance($$self, $$props, $$invalidate) {
    	let { item } = $$props;
    	let { isActive } = $$props;
    	let { onToggle } = $$props;
    	let { onHover } = $$props;
    	let { onBlur } = $$props;
    	const writable_props = ["item", "isActive", "onToggle", "onHover", "onBlur"];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<TodoItem> was created with unknown prop '${key}'`);
    	});

    	$$self.$set = $$props => {
    		if ("item" in $$props) $$invalidate(0, item = $$props.item);
    		if ("isActive" in $$props) $$invalidate(1, isActive = $$props.isActive);
    		if ("onToggle" in $$props) $$invalidate(2, onToggle = $$props.onToggle);
    		if ("onHover" in $$props) $$invalidate(3, onHover = $$props.onHover);
    		if ("onBlur" in $$props) $$invalidate(4, onBlur = $$props.onBlur);
    	};

    	$$self.$capture_state = () => {
    		return {
    			item,
    			isActive,
    			onToggle,
    			onHover,
    			onBlur
    		};
    	};

    	$$self.$inject_state = $$props => {
    		if ("item" in $$props) $$invalidate(0, item = $$props.item);
    		if ("isActive" in $$props) $$invalidate(1, isActive = $$props.isActive);
    		if ("onToggle" in $$props) $$invalidate(2, onToggle = $$props.onToggle);
    		if ("onHover" in $$props) $$invalidate(3, onHover = $$props.onHover);
    		if ("onBlur" in $$props) $$invalidate(4, onBlur = $$props.onBlur);
    	};

    	return [item, isActive, onToggle, onHover, onBlur];
    }

    class TodoItem extends SvelteComponentDev {
    	constructor(options) {
    		super(options);

    		init(this, options, instance, create_fragment, safe_not_equal, {
    			item: 0,
    			isActive: 1,
    			onToggle: 2,
    			onHover: 3,
    			onBlur: 4
    		});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "TodoItem",
    			options,
    			id: create_fragment.name
    		});

    		const { ctx } = this.$$;
    		const props = options.props || ({});

    		if (/*item*/ ctx[0] === undefined && !("item" in props)) {
    			console.warn("<TodoItem> was created without expected prop 'item'");
    		}

    		if (/*isActive*/ ctx[1] === undefined && !("isActive" in props)) {
    			console.warn("<TodoItem> was created without expected prop 'isActive'");
    		}

    		if (/*onToggle*/ ctx[2] === undefined && !("onToggle" in props)) {
    			console.warn("<TodoItem> was created without expected prop 'onToggle'");
    		}

    		if (/*onHover*/ ctx[3] === undefined && !("onHover" in props)) {
    			console.warn("<TodoItem> was created without expected prop 'onHover'");
    		}

    		if (/*onBlur*/ ctx[4] === undefined && !("onBlur" in props)) {
    			console.warn("<TodoItem> was created without expected prop 'onBlur'");
    		}
    	}

    	get item() {
    		throw new Error("<TodoItem>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set item(value) {
    		throw new Error("<TodoItem>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get isActive() {
    		throw new Error("<TodoItem>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set isActive(value) {
    		throw new Error("<TodoItem>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get onToggle() {
    		throw new Error("<TodoItem>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set onToggle(value) {
    		throw new Error("<TodoItem>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get onHover() {
    		throw new Error("<TodoItem>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set onHover(value) {
    		throw new Error("<TodoItem>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get onBlur() {
    		throw new Error("<TodoItem>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set onBlur(value) {
    		throw new Error("<TodoItem>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* src/svelte-app/Todo/Todo.svelte generated by Svelte v3.16.1 */
    const file$1 = "src/svelte-app/Todo/Todo.svelte";

    function get_each_context(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[11] = list[i];
    	child_ctx[13] = i;
    	return child_ctx;
    }

    // (48:8) {#each items as item, index}
    function create_each_block(ctx) {
    	let current;

    	const todoitem = new TodoItem({
    			props: {
    				item: /*item*/ ctx[11],
    				onToggle: /*generateOnToggleHandler*/ ctx[5](/*index*/ ctx[13]),
    				isActive: /*index*/ ctx[13] === /*activeItemIndex*/ ctx[0],
    				onHover: /*generateItemHover*/ ctx[6](/*index*/ ctx[13]),
    				onBlur: /*handleItemBlur*/ ctx[7]
    			},
    			$$inline: true
    		});

    	const block = {
    		c: function create() {
    			create_component(todoitem.$$.fragment);
    		},
    		m: function mount(target, anchor) {
    			mount_component(todoitem, target, anchor);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			const todoitem_changes = {};
    			if (dirty & /*items*/ 2) todoitem_changes.item = /*item*/ ctx[11];
    			if (dirty & /*activeItemIndex*/ 1) todoitem_changes.isActive = /*index*/ ctx[13] === /*activeItemIndex*/ ctx[0];
    			todoitem.$set(todoitem_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(todoitem.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(todoitem.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(todoitem, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_each_block.name,
    		type: "each",
    		source: "(48:8) {#each items as item, index}",
    		ctx
    	});

    	return block;
    }

    function create_fragment$1(ctx) {
    	let div;
    	let header;
    	let input0;
    	let t0;
    	let button;
    	let t2;
    	let main;
    	let t3;
    	let footer;
    	let input1;
    	let t4;
    	let br;
    	let t5;
    	let span;
    	let t6_value = /*items*/ ctx[1].length + "";
    	let t6;
    	let current;
    	let dispose;
    	let each_value = /*items*/ ctx[1];
    	let each_blocks = [];

    	for (let i = 0; i < each_value.length; i += 1) {
    		each_blocks[i] = create_each_block(get_each_context(ctx, each_value, i));
    	}

    	const out = i => transition_out(each_blocks[i], 1, 1, () => {
    		each_blocks[i] = null;
    	});

    	const block = {
    		c: function create() {
    			div = element("div");
    			header = element("header");
    			input0 = element("input");
    			t0 = space();
    			button = element("button");
    			button.textContent = "Add";
    			t2 = space();
    			main = element("main");

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].c();
    			}

    			t3 = space();
    			footer = element("footer");
    			input1 = element("input");
    			t4 = text("Mark all as completed");
    			br = element("br");
    			t5 = text("\n        Items count: ");
    			span = element("span");
    			t6 = text(t6_value);
    			input0.value = /*inputValue*/ ctx[2];
    			attr_dev(input0, "placeholder", "this is a placeholder");
    			add_location(input0, file$1, 41, 8, 959);
    			attr_dev(button, "class", "add");
    			attr_dev(button, "type", "button");
    			add_location(button, file$1, 43, 8, 1091);
    			add_location(header, file$1, 40, 4, 942);
    			add_location(main, file$1, 46, 4, 1248);
    			attr_dev(input1, "type", "checkbox");
    			input1.checked = true;
    			add_location(input1, file$1, 53, 8, 1537);
    			add_location(br, file$1, 53, 61, 1590);
    			attr_dev(span, "class", "count");
    			add_location(span, file$1, 54, 21, 1617);
    			add_location(footer, file$1, 52, 4, 1520);
    			attr_dev(div, "class", "todo-app");
    			add_location(div, file$1, 39, 0, 915);

    			dispose = [
    				listen_dev(input0, "change", prevent_default(/*handleInputChange*/ ctx[3]), false, true, false),
    				listen_dev(button, "click", /*handleAddButtonClick*/ ctx[4], false, false, false),
    				listen_dev(button, "keydown", prevent_default(/*handleAddButtonKeydown*/ ctx[8]), false, true, false)
    			];
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);
    			append_dev(div, header);
    			append_dev(header, input0);
    			append_dev(header, t0);
    			append_dev(header, button);
    			append_dev(div, t2);
    			append_dev(div, main);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].m(main, null);
    			}

    			append_dev(div, t3);
    			append_dev(div, footer);
    			append_dev(footer, input1);
    			append_dev(footer, t4);
    			append_dev(footer, br);
    			append_dev(footer, t5);
    			append_dev(footer, span);
    			append_dev(span, t6);
    			current = true;
    		},
    		p: function update(ctx, [dirty]) {
    			if (!current || dirty & /*inputValue*/ 4) {
    				prop_dev(input0, "value", /*inputValue*/ ctx[2]);
    			}

    			if (dirty & /*items, generateOnToggleHandler, activeItemIndex, generateItemHover, handleItemBlur*/ 227) {
    				each_value = /*items*/ ctx[1];
    				let i;

    				for (i = 0; i < each_value.length; i += 1) {
    					const child_ctx = get_each_context(ctx, each_value, i);

    					if (each_blocks[i]) {
    						each_blocks[i].p(child_ctx, dirty);
    						transition_in(each_blocks[i], 1);
    					} else {
    						each_blocks[i] = create_each_block(child_ctx);
    						each_blocks[i].c();
    						transition_in(each_blocks[i], 1);
    						each_blocks[i].m(main, null);
    					}
    				}

    				group_outros();

    				for (i = each_value.length; i < each_blocks.length; i += 1) {
    					out(i);
    				}

    				check_outros();
    			}

    			if ((!current || dirty & /*items*/ 2) && t6_value !== (t6_value = /*items*/ ctx[1].length + "")) set_data_dev(t6, t6_value);
    		},
    		i: function intro(local) {
    			if (current) return;

    			for (let i = 0; i < each_value.length; i += 1) {
    				transition_in(each_blocks[i]);
    			}

    			current = true;
    		},
    		o: function outro(local) {
    			each_blocks = each_blocks.filter(Boolean);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				transition_out(each_blocks[i]);
    			}

    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    			destroy_each(each_blocks, detaching);
    			run_all(dispose);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$1.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$1($$self, $$props, $$invalidate) {
    	let { initialText } = $$props;
    	let { initialItems } = $$props;
    	let activeItemIndex = null;
    	let items = initialItems || [];
    	let inputValue = initialText || "";

    	const handleInputChange = e => {
    		$$invalidate(2, inputValue = e.target.value);
    	};

    	const handleAddButtonClick = () => {
    		$$invalidate(
    			1,
    			items[items.length] = {
    				id: Math.random(),
    				label: inputValue,
    				completed: false
    			},
    			items
    		);

    		$$invalidate(2, inputValue = "");
    	};

    	const generateOnToggleHandler = itemIndex => () => {
    		$$invalidate(1, items[itemIndex].completed = !items[itemIndex].completed, items);
    	};

    	const generateItemHover = itemIndex => () => {
    		$$invalidate(0, activeItemIndex = itemIndex);
    	};

    	const handleItemBlur = () => {
    		$$invalidate(0, activeItemIndex = null);
    	};

    	const handleAddButtonKeydown = e => {
    		if (e.key === "Enter") {
    			handleAddButtonClick();
    		}
    	};

    	const writable_props = ["initialText", "initialItems"];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<Todo> was created with unknown prop '${key}'`);
    	});

    	$$self.$set = $$props => {
    		if ("initialText" in $$props) $$invalidate(9, initialText = $$props.initialText);
    		if ("initialItems" in $$props) $$invalidate(10, initialItems = $$props.initialItems);
    	};

    	$$self.$capture_state = () => {
    		return {
    			initialText,
    			initialItems,
    			activeItemIndex,
    			items,
    			inputValue
    		};
    	};

    	$$self.$inject_state = $$props => {
    		if ("initialText" in $$props) $$invalidate(9, initialText = $$props.initialText);
    		if ("initialItems" in $$props) $$invalidate(10, initialItems = $$props.initialItems);
    		if ("activeItemIndex" in $$props) $$invalidate(0, activeItemIndex = $$props.activeItemIndex);
    		if ("items" in $$props) $$invalidate(1, items = $$props.items);
    		if ("inputValue" in $$props) $$invalidate(2, inputValue = $$props.inputValue);
    	};

    	return [
    		activeItemIndex,
    		items,
    		inputValue,
    		handleInputChange,
    		handleAddButtonClick,
    		generateOnToggleHandler,
    		generateItemHover,
    		handleItemBlur,
    		handleAddButtonKeydown,
    		initialText,
    		initialItems
    	];
    }

    class Todo extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$1, create_fragment$1, safe_not_equal, { initialText: 9, initialItems: 10 });

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Todo",
    			options,
    			id: create_fragment$1.name
    		});

    		const { ctx } = this.$$;
    		const props = options.props || ({});

    		if (/*initialText*/ ctx[9] === undefined && !("initialText" in props)) {
    			console.warn("<Todo> was created without expected prop 'initialText'");
    		}

    		if (/*initialItems*/ ctx[10] === undefined && !("initialItems" in props)) {
    			console.warn("<Todo> was created without expected prop 'initialItems'");
    		}
    	}

    	get initialText() {
    		throw new Error("<Todo>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set initialText(value) {
    		throw new Error("<Todo>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get initialItems() {
    		throw new Error("<Todo>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set initialItems(value) {
    		throw new Error("<Todo>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* src/svelte-app/Events/MouseEvent.svelte generated by Svelte v3.16.1 */

    const file$2 = "src/svelte-app/Events/MouseEvent.svelte";

    function create_fragment$2(ctx) {
    	let div;
    	let span;
    	let t_value = /*event*/ ctx[0].type + "";
    	let t;

    	const block = {
    		c: function create() {
    			div = element("div");
    			span = element("span");
    			t = text(t_value);
    			attr_dev(span, "class", "event-type");
    			add_location(span, file$2, 6, 4, 78);
    			attr_dev(div, "class", "mouse-event-data");
    			add_location(div, file$2, 5, 0, 43);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);
    			append_dev(div, span);
    			append_dev(span, t);
    		},
    		p: function update(ctx, [dirty]) {
    			if (dirty & /*event*/ 1 && t_value !== (t_value = /*event*/ ctx[0].type + "")) set_data_dev(t, t_value);
    		},
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$2.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$2($$self, $$props, $$invalidate) {
    	let { event } = $$props;
    	const writable_props = ["event"];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<MouseEvent> was created with unknown prop '${key}'`);
    	});

    	$$self.$set = $$props => {
    		if ("event" in $$props) $$invalidate(0, event = $$props.event);
    	};

    	$$self.$capture_state = () => {
    		return { event };
    	};

    	$$self.$inject_state = $$props => {
    		if ("event" in $$props) $$invalidate(0, event = $$props.event);
    	};

    	return [event];
    }

    class MouseEvent extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$2, create_fragment$2, safe_not_equal, { event: 0 });

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "MouseEvent",
    			options,
    			id: create_fragment$2.name
    		});

    		const { ctx } = this.$$;
    		const props = options.props || ({});

    		if (/*event*/ ctx[0] === undefined && !("event" in props)) {
    			console.warn("<MouseEvent> was created without expected prop 'event'");
    		}
    	}

    	get event() {
    		throw new Error("<MouseEvent>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set event(value) {
    		throw new Error("<MouseEvent>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* src/svelte-app/Events/KeyboardEvent.svelte generated by Svelte v3.16.1 */

    const file$3 = "src/svelte-app/Events/KeyboardEvent.svelte";

    function create_fragment$3(ctx) {
    	let div;
    	let span0;
    	let t0_value = /*event*/ ctx[0].key + "";
    	let t0;
    	let span1;
    	let t1_value = /*event*/ ctx[0].keyCode + "";
    	let t1;

    	const block = {
    		c: function create() {
    			div = element("div");
    			span0 = element("span");
    			t0 = text(t0_value);
    			span1 = element("span");
    			t1 = text(t1_value);
    			attr_dev(span0, "class", "event-key");
    			add_location(span0, file$3, 6, 4, 81);
    			attr_dev(span1, "class", "event-keycode");
    			add_location(span1, file$3, 6, 46, 123);
    			attr_dev(div, "class", "keyboard-event-data");
    			add_location(div, file$3, 5, 0, 43);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);
    			append_dev(div, span0);
    			append_dev(span0, t0);
    			append_dev(div, span1);
    			append_dev(span1, t1);
    		},
    		p: function update(ctx, [dirty]) {
    			if (dirty & /*event*/ 1 && t0_value !== (t0_value = /*event*/ ctx[0].key + "")) set_data_dev(t0, t0_value);
    			if (dirty & /*event*/ 1 && t1_value !== (t1_value = /*event*/ ctx[0].keyCode + "")) set_data_dev(t1, t1_value);
    		},
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$3.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$3($$self, $$props, $$invalidate) {
    	let { event } = $$props;
    	const writable_props = ["event"];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<KeyboardEvent> was created with unknown prop '${key}'`);
    	});

    	$$self.$set = $$props => {
    		if ("event" in $$props) $$invalidate(0, event = $$props.event);
    	};

    	$$self.$capture_state = () => {
    		return { event };
    	};

    	$$self.$inject_state = $$props => {
    		if ("event" in $$props) $$invalidate(0, event = $$props.event);
    	};

    	return [event];
    }

    class KeyboardEvent extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$3, create_fragment$3, safe_not_equal, { event: 0 });

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "KeyboardEvent",
    			options,
    			id: create_fragment$3.name
    		});

    		const { ctx } = this.$$;
    		const props = options.props || ({});

    		if (/*event*/ ctx[0] === undefined && !("event" in props)) {
    			console.warn("<KeyboardEvent> was created without expected prop 'event'");
    		}
    	}

    	get event() {
    		throw new Error("<KeyboardEvent>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set event(value) {
    		throw new Error("<KeyboardEvent>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* src/svelte-app/Events/Events.svelte generated by Svelte v3.16.1 */
    const file$4 = "src/svelte-app/Events/Events.svelte";

    function get_each_context$1(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[4] = list[i];
    	return child_ctx;
    }

    function get_each_context_1(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[4] = list[i];
    	return child_ctx;
    }

    // (30:8) {#each mouseEvents as event}
    function create_each_block_1(ctx) {
    	let current;

    	const mouseevent = new MouseEvent({
    			props: { event: /*event*/ ctx[4] },
    			$$inline: true
    		});

    	const block = {
    		c: function create() {
    			create_component(mouseevent.$$.fragment);
    		},
    		m: function mount(target, anchor) {
    			mount_component(mouseevent, target, anchor);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			const mouseevent_changes = {};
    			if (dirty & /*mouseEvents*/ 2) mouseevent_changes.event = /*event*/ ctx[4];
    			mouseevent.$set(mouseevent_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(mouseevent.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(mouseevent.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(mouseevent, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_each_block_1.name,
    		type: "each",
    		source: "(30:8) {#each mouseEvents as event}",
    		ctx
    	});

    	return block;
    }

    // (36:8) {#each keyboardEvents as event}
    function create_each_block$1(ctx) {
    	let current;

    	const keyboardevent = new KeyboardEvent({
    			props: { event: /*event*/ ctx[4] },
    			$$inline: true
    		});

    	const block = {
    		c: function create() {
    			create_component(keyboardevent.$$.fragment);
    		},
    		m: function mount(target, anchor) {
    			mount_component(keyboardevent, target, anchor);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			const keyboardevent_changes = {};
    			if (dirty & /*keyboardEvents*/ 1) keyboardevent_changes.event = /*event*/ ctx[4];
    			keyboardevent.$set(keyboardevent_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(keyboardevent.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(keyboardevent.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(keyboardevent, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_each_block$1.name,
    		type: "each",
    		source: "(36:8) {#each keyboardEvents as event}",
    		ctx
    	});

    	return block;
    }

    function create_fragment$4(ctx) {
    	let div2;
    	let div0;
    	let button;
    	let t1;
    	let t2;
    	let div1;
    	let input;
    	let t3;
    	let current;
    	let dispose;
    	let each_value_1 = /*mouseEvents*/ ctx[1];
    	let each_blocks_1 = [];

    	for (let i = 0; i < each_value_1.length; i += 1) {
    		each_blocks_1[i] = create_each_block_1(get_each_context_1(ctx, each_value_1, i));
    	}

    	const out = i => transition_out(each_blocks_1[i], 1, 1, () => {
    		each_blocks_1[i] = null;
    	});

    	let each_value = /*keyboardEvents*/ ctx[0];
    	let each_blocks = [];

    	for (let i = 0; i < each_value.length; i += 1) {
    		each_blocks[i] = create_each_block$1(get_each_context$1(ctx, each_value, i));
    	}

    	const out_1 = i => transition_out(each_blocks[i], 1, 1, () => {
    		each_blocks[i] = null;
    	});

    	const block = {
    		c: function create() {
    			div2 = element("div");
    			div0 = element("div");
    			button = element("button");
    			button.textContent = "Mouse Events";
    			t1 = space();

    			for (let i = 0; i < each_blocks_1.length; i += 1) {
    				each_blocks_1[i].c();
    			}

    			t2 = space();
    			div1 = element("div");
    			input = element("input");
    			t3 = space();

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].c();
    			}

    			attr_dev(button, "class", "button svelte-15s9mgc");
    			add_location(button, file$4, 25, 8, 640);
    			attr_dev(div0, "class", "mouse-events");
    			add_location(div0, file$4, 24, 4, 605);
    			input.value = "";
    			add_location(input, file$4, 34, 8, 964);
    			attr_dev(div1, "class", "keyboard-events");
    			add_location(div1, file$4, 33, 4, 926);
    			attr_dev(div2, "class", "events-container");
    			add_location(div2, file$4, 23, 0, 570);

    			dispose = [
    				listen_dev(button, "mousedown", /*handleMouseEvent*/ ctx[2], false, false, false),
    				listen_dev(button, "mouseup", /*handleMouseEvent*/ ctx[2], false, false, false),
    				listen_dev(button, "mousemove", /*handleMouseEvent*/ ctx[2], false, false, false),
    				listen_dev(input, "keydown", prevent_default(/*handleKeyboardEvent*/ ctx[3]), false, true, false)
    			];
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div2, anchor);
    			append_dev(div2, div0);
    			append_dev(div0, button);
    			append_dev(div0, t1);

    			for (let i = 0; i < each_blocks_1.length; i += 1) {
    				each_blocks_1[i].m(div0, null);
    			}

    			append_dev(div2, t2);
    			append_dev(div2, div1);
    			append_dev(div1, input);
    			append_dev(div1, t3);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].m(div1, null);
    			}

    			current = true;
    		},
    		p: function update(ctx, [dirty]) {
    			if (dirty & /*mouseEvents*/ 2) {
    				each_value_1 = /*mouseEvents*/ ctx[1];
    				let i;

    				for (i = 0; i < each_value_1.length; i += 1) {
    					const child_ctx = get_each_context_1(ctx, each_value_1, i);

    					if (each_blocks_1[i]) {
    						each_blocks_1[i].p(child_ctx, dirty);
    						transition_in(each_blocks_1[i], 1);
    					} else {
    						each_blocks_1[i] = create_each_block_1(child_ctx);
    						each_blocks_1[i].c();
    						transition_in(each_blocks_1[i], 1);
    						each_blocks_1[i].m(div0, null);
    					}
    				}

    				group_outros();

    				for (i = each_value_1.length; i < each_blocks_1.length; i += 1) {
    					out(i);
    				}

    				check_outros();
    			}

    			if (dirty & /*keyboardEvents*/ 1) {
    				each_value = /*keyboardEvents*/ ctx[0];
    				let i;

    				for (i = 0; i < each_value.length; i += 1) {
    					const child_ctx = get_each_context$1(ctx, each_value, i);

    					if (each_blocks[i]) {
    						each_blocks[i].p(child_ctx, dirty);
    						transition_in(each_blocks[i], 1);
    					} else {
    						each_blocks[i] = create_each_block$1(child_ctx);
    						each_blocks[i].c();
    						transition_in(each_blocks[i], 1);
    						each_blocks[i].m(div1, null);
    					}
    				}

    				group_outros();

    				for (i = each_value.length; i < each_blocks.length; i += 1) {
    					out_1(i);
    				}

    				check_outros();
    			}
    		},
    		i: function intro(local) {
    			if (current) return;

    			for (let i = 0; i < each_value_1.length; i += 1) {
    				transition_in(each_blocks_1[i]);
    			}

    			for (let i = 0; i < each_value.length; i += 1) {
    				transition_in(each_blocks[i]);
    			}

    			current = true;
    		},
    		o: function outro(local) {
    			each_blocks_1 = each_blocks_1.filter(Boolean);

    			for (let i = 0; i < each_blocks_1.length; i += 1) {
    				transition_out(each_blocks_1[i]);
    			}

    			each_blocks = each_blocks.filter(Boolean);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				transition_out(each_blocks[i]);
    			}

    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div2);
    			destroy_each(each_blocks_1, detaching);
    			destroy_each(each_blocks, detaching);
    			run_all(dispose);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$4.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$4($$self, $$props, $$invalidate) {
    	let keyboardEvents = [];
    	let mouseEvents = [];

    	const handleMouseEvent = event => {
    		$$invalidate(
    			1,
    			mouseEvents[mouseEvents.length] = {
    				type: event.type,
    				clientX: event.clientX,
    				clientY: event.clientY
    			},
    			mouseEvents
    		);
    	};

    	const handleKeyboardEvent = event => {
    		$$invalidate(0, keyboardEvents[keyboardEvents.length] = { key: event.key, keyCode: event.keyCode }, keyboardEvents);
    	};

    	$$self.$capture_state = () => {
    		return {};
    	};

    	$$self.$inject_state = $$props => {
    		if ("keyboardEvents" in $$props) $$invalidate(0, keyboardEvents = $$props.keyboardEvents);
    		if ("mouseEvents" in $$props) $$invalidate(1, mouseEvents = $$props.mouseEvents);
    	};

    	return [keyboardEvents, mouseEvents, handleMouseEvent, handleKeyboardEvent];
    }

    class Events extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$4, create_fragment$4, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Events",
    			options,
    			id: create_fragment$4.name
    		});
    	}
    }

    /* src/svelte-app/App.svelte generated by Svelte v3.16.1 */
    const file$5 = "src/svelte-app/App.svelte";

    function create_fragment$5(ctx) {
    	let main;
    	let t;
    	let current;

    	const todo = new Todo({
    			props: {
    				initialText: /*initialText*/ ctx[0],
    				initialItems: /*initialItems*/ ctx[1]
    			},
    			$$inline: true
    		});

    	const events = new Events({ $$inline: true });

    	const block = {
    		c: function create() {
    			main = element("main");
    			create_component(todo.$$.fragment);
    			t = space();
    			create_component(events.$$.fragment);
    			add_location(main, file$5, 8, 0, 181);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, main, anchor);
    			mount_component(todo, main, null);
    			append_dev(main, t);
    			mount_component(events, main, null);
    			current = true;
    		},
    		p: function update(ctx, [dirty]) {
    			const todo_changes = {};
    			if (dirty & /*initialText*/ 1) todo_changes.initialText = /*initialText*/ ctx[0];
    			if (dirty & /*initialItems*/ 2) todo_changes.initialItems = /*initialItems*/ ctx[1];
    			todo.$set(todo_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(todo.$$.fragment, local);
    			transition_in(events.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(todo.$$.fragment, local);
    			transition_out(events.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(main);
    			destroy_component(todo);
    			destroy_component(events);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$5.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$5($$self, $$props, $$invalidate) {
    	let { initialText = undefined } = $$props;
    	let { initialItems = undefined } = $$props;
    	const writable_props = ["initialText", "initialItems"];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<App> was created with unknown prop '${key}'`);
    	});

    	$$self.$set = $$props => {
    		if ("initialText" in $$props) $$invalidate(0, initialText = $$props.initialText);
    		if ("initialItems" in $$props) $$invalidate(1, initialItems = $$props.initialItems);
    	};

    	$$self.$capture_state = () => {
    		return { initialText, initialItems };
    	};

    	$$self.$inject_state = $$props => {
    		if ("initialText" in $$props) $$invalidate(0, initialText = $$props.initialText);
    		if ("initialItems" in $$props) $$invalidate(1, initialItems = $$props.initialItems);
    	};

    	return [initialText, initialItems];
    }

    class App extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$5, create_fragment$5, safe_not_equal, { initialText: 0, initialItems: 1 });

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "App",
    			options,
    			id: create_fragment$5.name
    		});
    	}

    	get initialText() {
    		throw new Error("<App>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set initialText(value) {
    		throw new Error("<App>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get initialItems() {
    		throw new Error("<App>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set initialItems(value) {
    		throw new Error("<App>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    const renderSvelteApp = (element, params) => {
      const app = new App({
        target: element,
        props: params,
      });

      return () => app.$destroy();
    };

    const appProps = {
      initialText: '123',
      initialItems: [{ id: 1, label: 'qwe', completed: true }],
    };

    renderSvelteApp(document.body, appProps);

}());
//# sourceMappingURL=svelte.js.map
