var app = (function () {
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
    let src_url_equal_anchor;
    function src_url_equal(element_src, url) {
        if (!src_url_equal_anchor) {
            src_url_equal_anchor = document.createElement('a');
        }
        src_url_equal_anchor.href = url;
        return element_src === src_url_equal_anchor.href;
    }
    function is_empty(obj) {
        return Object.keys(obj).length === 0;
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
    function svg_element(name) {
        return document.createElementNS('http://www.w3.org/2000/svg', name);
    }
    function text(data) {
        return document.createTextNode(data);
    }
    function space() {
        return text(' ');
    }
    function empty() {
        return text('');
    }
    function listen(node, event, handler, options) {
        node.addEventListener(event, handler, options);
        return () => node.removeEventListener(event, handler, options);
    }
    function attr(node, attribute, value) {
        if (value == null)
            node.removeAttribute(attribute);
        else if (node.getAttribute(attribute) !== value)
            node.setAttribute(attribute, value);
    }
    function xlink_attr(node, attribute, value) {
        node.setAttributeNS('http://www.w3.org/1999/xlink', attribute, value);
    }
    function children(element) {
        return Array.from(element.childNodes);
    }
    function custom_event(type, detail, bubbles = false) {
        const e = document.createEvent('CustomEvent');
        e.initCustomEvent(type, bubbles, false, detail);
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
    // flush() calls callbacks in this order:
    // 1. All beforeUpdate callbacks, in order: parents before children
    // 2. All bind:this callbacks, in reverse order: children before parents.
    // 3. All afterUpdate callbacks, in order: parents before children. EXCEPT
    //    for afterUpdates called during the initial onMount, which are called in
    //    reverse order: children before parents.
    // Since callbacks might update component values, which could trigger another
    // call to flush(), the following steps guard against this:
    // 1. During beforeUpdate, any updated components will be added to the
    //    dirty_components array and will cause a reentrant call to flush(). Because
    //    the flush index is kept outside the function, the reentrant call will pick
    //    up where the earlier call left off and go through all dirty components. The
    //    current_component value is saved and restored so that the reentrant call will
    //    not interfere with the "parent" flush() call.
    // 2. bind:this callbacks cannot trigger new flush() calls.
    // 3. During afterUpdate, any updated components will NOT have their afterUpdate
    //    callback called a second time; the seen_callbacks set, outside the flush()
    //    function, guarantees this behavior.
    const seen_callbacks = new Set();
    let flushidx = 0; // Do *not* move this inside the flush() function
    function flush() {
        const saved_component = current_component;
        do {
            // first, call beforeUpdate functions
            // and update components
            while (flushidx < dirty_components.length) {
                const component = dirty_components[flushidx];
                flushidx++;
                set_current_component(component);
                update(component.$$);
            }
            set_current_component(null);
            dirty_components.length = 0;
            flushidx = 0;
            while (binding_callbacks.length)
                binding_callbacks.pop()();
            // then, once components are updated, call
            // afterUpdate functions. This may cause
            // subsequent updates...
            for (let i = 0; i < render_callbacks.length; i += 1) {
                const callback = render_callbacks[i];
                if (!seen_callbacks.has(callback)) {
                    // ...so guard against infinite loops
                    seen_callbacks.add(callback);
                    callback();
                }
            }
            render_callbacks.length = 0;
        } while (dirty_components.length);
        while (flush_callbacks.length) {
            flush_callbacks.pop()();
        }
        update_scheduled = false;
        seen_callbacks.clear();
        set_current_component(saved_component);
    }
    function update($$) {
        if ($$.fragment !== null) {
            $$.update();
            run_all($$.before_update);
            const dirty = $$.dirty;
            $$.dirty = [-1];
            $$.fragment && $$.fragment.p($$.ctx, dirty);
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

    const globals = (typeof window !== 'undefined'
        ? window
        : typeof globalThis !== 'undefined'
            ? globalThis
            : global);
    function create_component(block) {
        block && block.c();
    }
    function mount_component(component, target, anchor, customElement) {
        const { fragment, on_mount, on_destroy, after_update } = component.$$;
        fragment && fragment.m(target, anchor);
        if (!customElement) {
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
        }
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
    function init(component, options, instance, create_fragment, not_equal, props, append_styles, dirty = [-1]) {
        const parent_component = current_component;
        set_current_component(component);
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
            on_disconnect: [],
            before_update: [],
            after_update: [],
            context: new Map(options.context || (parent_component ? parent_component.$$.context : [])),
            // everything else
            callbacks: blank_object(),
            dirty,
            skip_bound: false,
            root: options.target || parent_component.$$.root
        };
        append_styles && append_styles($$.root);
        let ready = false;
        $$.ctx = instance
            ? instance(component, options.props || {}, (i, ret, ...rest) => {
                const value = rest.length ? rest[0] : ret;
                if ($$.ctx && not_equal($$.ctx[i], $$.ctx[i] = value)) {
                    if (!$$.skip_bound && $$.bound[i])
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
                const nodes = children(options.target);
                // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
                $$.fragment && $$.fragment.l(nodes);
                nodes.forEach(detach);
            }
            else {
                // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
                $$.fragment && $$.fragment.c();
            }
            if (options.intro)
                transition_in(component.$$.fragment);
            mount_component(component, options.target, options.anchor, options.customElement);
            flush();
        }
        set_current_component(parent_component);
    }
    /**
     * Base class for Svelte components. Used when dev=false.
     */
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
        $set($$props) {
            if (this.$$set && !is_empty($$props)) {
                this.$$.skip_bound = true;
                this.$$set($$props);
                this.$$.skip_bound = false;
            }
        }
    }

    function dispatch_dev(type, detail) {
        document.dispatchEvent(custom_event(type, Object.assign({ version: '3.46.2' }, detail), true));
    }
    function append_dev(target, node) {
        dispatch_dev('SvelteDOMInsert', { target, node });
        append(target, node);
    }
    function insert_dev(target, node, anchor) {
        dispatch_dev('SvelteDOMInsert', { target, node, anchor });
        insert(target, node, anchor);
    }
    function detach_dev(node) {
        dispatch_dev('SvelteDOMRemove', { node });
        detach(node);
    }
    function listen_dev(node, event, handler, options, has_prevent_default, has_stop_propagation) {
        const modifiers = options === true ? ['capture'] : options ? Array.from(Object.keys(options)) : [];
        if (has_prevent_default)
            modifiers.push('preventDefault');
        if (has_stop_propagation)
            modifiers.push('stopPropagation');
        dispatch_dev('SvelteDOMAddEventListener', { node, event, handler, modifiers });
        const dispose = listen(node, event, handler, options);
        return () => {
            dispatch_dev('SvelteDOMRemoveEventListener', { node, event, handler, modifiers });
            dispose();
        };
    }
    function attr_dev(node, attribute, value) {
        attr(node, attribute, value);
        if (value == null)
            dispatch_dev('SvelteDOMRemoveAttribute', { node, attribute });
        else
            dispatch_dev('SvelteDOMSetAttribute', { node, attribute, value });
    }
    function set_data_dev(text, data) {
        data = '' + data;
        if (text.wholeText === data)
            return;
        dispatch_dev('SvelteDOMSetData', { node: text, data });
        text.data = data;
    }
    function validate_each_argument(arg) {
        if (typeof arg !== 'string' && !(arg && typeof arg === 'object' && 'length' in arg)) {
            let msg = '{#each} only iterates over array-like objects.';
            if (typeof Symbol === 'function' && arg && Symbol.iterator in arg) {
                msg += ' You can use a spread to convert this iterable into an array.';
            }
            throw new Error(msg);
        }
    }
    function validate_slots(name, slot, keys) {
        for (const slot_key of Object.keys(slot)) {
            if (!~keys.indexOf(slot_key)) {
                console.warn(`<${name}> received an unexpected slot "${slot_key}".`);
            }
        }
    }
    /**
     * Base class for Svelte components with some minor dev-enhancements. Used when dev=true.
     */
    class SvelteComponentDev extends SvelteComponent {
        constructor(options) {
            if (!options || (!options.target && !options.$$inline)) {
                throw new Error("'target' is a required option");
            }
            super();
        }
        $destroy() {
            super.$destroy();
            this.$destroy = () => {
                console.warn('Component was already destroyed'); // eslint-disable-line no-console
            };
        }
        $capture_state() { }
        $inject_state() { }
    }

    /* src/sections/windows/manage-modal.svelte generated by Svelte v3.46.2 */

    const file$9 = "src/sections/windows/manage-modal.svelte";

    function create_fragment$9(ctx) {
    	let p;
    	let t1;
    	let a;

    	const block = {
    		c: function create() {
    			p = element("p");
    			p.textContent = "Resize or move the window. See the size and position in the main window.";
    			t1 = space();
    			a = element("a");
    			a.textContent = "Close this Window";
    			add_location(p, file$9, 21, 0, 431);
    			attr_dev(a, "id", "close");
    			attr_dev(a, "href", "javascript:window.close()");
    			attr_dev(a, "class", "svelte-1f0tkes");
    			add_location(a, file$9, 22, 0, 511);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, p, anchor);
    			insert_dev(target, t1, anchor);
    			insert_dev(target, a, anchor);
    		},
    		p: noop,
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(p);
    			if (detaching) detach_dev(t1);
    			if (detaching) detach_dev(a);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$9.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$9($$self, $$props) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('Manage_modal', slots, []);
    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console.warn(`<Manage_modal> was created with unknown prop '${key}'`);
    	});

    	return [];
    }

    class Manage_modal extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$9, create_fragment$9, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Manage_modal",
    			options,
    			id: create_fragment$9.name
    		});
    	}
    }

    /* src/sections/windows/crash-hang.svelte generated by Svelte v3.46.2 */

    const file$8 = "src/sections/windows/crash-hang.svelte";

    function create_fragment$8(ctx) {
    	let section;
    	let header;
    	let div0;
    	let h1;
    	let svg;
    	let use;
    	let t0;
    	let t1;
    	let h3;
    	let t2;
    	let code0;
    	let t4;
    	let t5;
    	let p0;
    	let t6;
    	let a;
    	let t7;
    	let span0;
    	let t9;
    	let t10;
    	let div5;
    	let div4;
    	let button0;
    	let t11;
    	let div1;
    	let t12;
    	let span1;
    	let t14;
    	let t15;
    	let div3;
    	let div2;
    	let button1;
    	let t17;
    	let p1;
    	let t18;
    	let code1;
    	let t20;
    	let code2;
    	let t22;
    	let t23;
    	let p2;
    	let t25;
    	let h50;
    	let t27;
    	let pre0;
    	let code3;
    	let t28;
    	let div11;
    	let div10;
    	let button2;
    	let t29;
    	let div6;
    	let t30;
    	let span2;
    	let t32;
    	let t33;
    	let div9;
    	let div7;
    	let button3;
    	let t35;
    	let p3;
    	let t36;
    	let code4;
    	let t38;
    	let code5;
    	let t40;
    	let t41;
    	let p4;
    	let t43;
    	let h51;
    	let t45;
    	let pre1;
    	let code6;
    	let t46;
    	let div8;
    	let h2;
    	let t48;
    	let strong;
    	let t50;
    	let p5;
    	let t51;
    	let code7;
    	let t53;
    	let t54;
    	let pre2;
    	let code8;

    	const block = {
    		c: function create() {
    			section = element("section");
    			header = element("header");
    			div0 = element("div");
    			h1 = element("h1");
    			svg = svg_element("svg");
    			use = svg_element("use");
    			t0 = text("\n          Handling Window Crashes and Hangs");
    			t1 = space();
    			h3 = element("h3");
    			t2 = text("The ");
    			code0 = element("code");
    			code0.textContent = "BrowserWindow";
    			t4 = text(" module will emit events when the renderer\n          process crashes or hangs. You can listen for these events and give users\n          the chance to reload, wait or close that window.");
    			t5 = space();
    			p0 = element("p");
    			t6 = text("Open the ");
    			a = element("a");
    			t7 = text("full API documentation");
    			span0 = element("span");
    			span0.textContent = "(opens in new window)";
    			t9 = text(" in your browser.");
    			t10 = space();
    			div5 = element("div");
    			div4 = element("div");
    			button0 = element("button");
    			t11 = text("Relaunch window after the process crashes\n          ");
    			div1 = element("div");
    			t12 = text("Supports: Win, macOS, Linux ");
    			span1 = element("span");
    			span1.textContent = "|";
    			t14 = text("\n            Process: Main");
    			t15 = space();
    			div3 = element("div");
    			div2 = element("div");
    			button1 = element("button");
    			button1.textContent = "View Demo";
    			t17 = space();
    			p1 = element("p");
    			t18 = text("In this demo we create a new window (via the ");
    			code1 = element("code");
    			code1.textContent = "remote";
    			t20 = text("\n            module) and provide a link that will force a crash using\n            ");
    			code2 = element("code");
    			code2.textContent = "process.crash()";
    			t22 = text(".");
    			t23 = space();
    			p2 = element("p");
    			p2.textContent = "The window is listening for the crash event and when the event\n            occurs it prompts the user with two options: reload or close.";
    			t25 = space();
    			h50 = element("h5");
    			h50.textContent = "Renderer Process";
    			t27 = space();
    			pre0 = element("pre");
    			code3 = element("code");
    			t28 = space();
    			div11 = element("div");
    			div10 = element("div");
    			button2 = element("button");
    			t29 = text("Relaunch window after the process hangs\n          ");
    			div6 = element("div");
    			t30 = text("Supports: Win, macOS, Linux ");
    			span2 = element("span");
    			span2.textContent = "|";
    			t32 = text("\n            Process: Main");
    			t33 = space();
    			div9 = element("div");
    			div7 = element("div");
    			button3 = element("button");
    			button3.textContent = "View Demo";
    			t35 = space();
    			p3 = element("p");
    			t36 = text("In this demo we create a new window (via the ");
    			code4 = element("code");
    			code4.textContent = "remote";
    			t38 = text("\n            module) and provide a link that will force the process to hang using\n            ");
    			code5 = element("code");
    			code5.textContent = "process.hang()";
    			t40 = text(".");
    			t41 = space();
    			p4 = element("p");
    			p4.textContent = "The window is listening for the process to become officially\n            unresponsive (this can take up to 30 seconds). When this event\n            occurs it prompts the user with two options: reload or close.";
    			t43 = space();
    			h51 = element("h5");
    			h51.textContent = "Renderer Process";
    			t45 = space();
    			pre1 = element("pre");
    			code6 = element("code");
    			t46 = space();
    			div8 = element("div");
    			h2 = element("h2");
    			h2.textContent = "ProTip";
    			t48 = space();
    			strong = element("strong");
    			strong.textContent = "Wait for the process to become responsive again.";
    			t50 = space();
    			p5 = element("p");
    			t51 = text("A third option in the case of a process that is hanging is to wait\n              and see if the problem resolves, allowing the process to become\n              responsive again. To do this, use the ");
    			code7 = element("code");
    			code7.textContent = "BrowserWindow";
    			t53 = text(" event\n              'responsive' as shown below.");
    			t54 = space();
    			pre2 = element("pre");
    			code8 = element("code");
    			code8.textContent = "win.on('responsive', function ())";
    			xlink_attr(use, "xlink:href", "../assets/img/icons.svg#icon-windows");
    			add_location(use, file$8, 14, 13, 384);
    			attr_dev(svg, "class", "section-icon");
    			add_location(svg, file$8, 13, 10, 345);
    			add_location(h1, file$8, 12, 8, 330);
    			add_location(code0, file$8, 19, 14, 544);
    			add_location(h3, file$8, 18, 8, 525);
    			attr_dev(span0, "class", "u-visible-to-screen-reader");
    			add_location(span0, file$8, 26, 35, 894);
    			attr_dev(a, "href", "http://electron.atom.io/docs/api/browser-window");
    			add_location(a, file$8, 25, 19, 801);
    			add_location(p0, file$8, 24, 8, 778);
    			attr_dev(div0, "class", "section-wrapper");
    			add_location(div0, file$8, 11, 6, 292);
    			attr_dev(header, "class", "section-header");
    			add_location(header, file$8, 10, 4, 254);
    			attr_dev(span1, "class", "demo-meta-divider");
    			add_location(span1, file$8, 41, 40, 1382);
    			attr_dev(div1, "class", "demo-meta u-avoid-clicks");
    			add_location(div1, file$8, 40, 10, 1303);
    			attr_dev(button0, "id", "new-window-crashes-demo-toggle");
    			attr_dev(button0, "class", "js-container-target demo-toggle-button");
    			add_location(button0, file$8, 36, 8, 1129);
    			attr_dev(button1, "class", "demo-button");
    			attr_dev(button1, "id", "process-crash");
    			add_location(button1, file$8, 47, 12, 1565);
    			attr_dev(div2, "class", "demo-controls");
    			add_location(div2, file$8, 46, 10, 1525);
    			add_location(code1, file$8, 50, 57, 1719);
    			add_location(code2, file$8, 52, 12, 1820);
    			add_location(p1, file$8, 49, 10, 1658);
    			add_location(p2, file$8, 54, 10, 1875);
    			add_location(h50, file$8, 59, 10, 2054);
    			attr_dev(code3, "data-path", "renderer-process/windows/process-crash.js");
    			add_location(code3, file$8, 60, 15, 2095);
    			add_location(pre0, file$8, 60, 10, 2090);
    			attr_dev(div3, "class", "demo-box");
    			add_location(div3, file$8, 45, 8, 1492);
    			attr_dev(div4, "class", "demo-wrapper");
    			add_location(div4, file$8, 35, 6, 1094);
    			attr_dev(div5, "class", "demo");
    			add_location(div5, file$8, 34, 4, 1069);
    			attr_dev(span2, "class", "demo-meta-divider");
    			add_location(span2, file$8, 74, 40, 2543);
    			attr_dev(div6, "class", "demo-meta u-avoid-clicks");
    			add_location(div6, file$8, 73, 10, 2464);
    			attr_dev(button2, "id", "new-window-hangs-demo-toggle");
    			attr_dev(button2, "class", "js-container-target demo-toggle-button");
    			add_location(button2, file$8, 69, 8, 2294);
    			attr_dev(button3, "class", "demo-button");
    			attr_dev(button3, "id", "process-hang");
    			add_location(button3, file$8, 80, 12, 2726);
    			attr_dev(div7, "class", "demo-controls");
    			add_location(div7, file$8, 79, 10, 2686);
    			add_location(code4, file$8, 83, 57, 2879);
    			add_location(code5, file$8, 85, 12, 2992);
    			add_location(p3, file$8, 82, 10, 2818);
    			add_location(p4, file$8, 87, 10, 3046);
    			add_location(h51, file$8, 93, 10, 3298);
    			attr_dev(code6, "data-path", "renderer-process/windows/process-hang.js");
    			add_location(code6, file$8, 94, 15, 3339);
    			add_location(pre1, file$8, 94, 10, 3334);
    			add_location(h2, file$8, 99, 12, 3482);
    			add_location(strong, file$8, 100, 12, 3510);
    			add_location(code7, file$8, 104, 52, 3803);
    			add_location(p5, file$8, 101, 12, 3588);
    			attr_dev(code8, "class", "language-js");
    			add_location(code8, file$8, 107, 17, 3913);
    			add_location(pre2, file$8, 107, 12, 3908);
    			attr_dev(div8, "class", "demo-protip");
    			add_location(div8, file$8, 98, 10, 3444);
    			attr_dev(div9, "class", "demo-box");
    			add_location(div9, file$8, 78, 8, 2653);
    			attr_dev(div10, "class", "demo-wrapper");
    			add_location(div10, file$8, 68, 6, 2259);
    			attr_dev(div11, "class", "demo");
    			add_location(div11, file$8, 67, 4, 2234);
    			attr_dev(section, "id", "crash-hang-section");
    			attr_dev(section, "class", "section js-section u-category-windows");
    			add_location(section, file$8, 6, 2, 159);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, section, anchor);
    			append_dev(section, header);
    			append_dev(header, div0);
    			append_dev(div0, h1);
    			append_dev(h1, svg);
    			append_dev(svg, use);
    			append_dev(h1, t0);
    			append_dev(div0, t1);
    			append_dev(div0, h3);
    			append_dev(h3, t2);
    			append_dev(h3, code0);
    			append_dev(h3, t4);
    			append_dev(div0, t5);
    			append_dev(div0, p0);
    			append_dev(p0, t6);
    			append_dev(p0, a);
    			append_dev(a, t7);
    			append_dev(a, span0);
    			append_dev(p0, t9);
    			append_dev(section, t10);
    			append_dev(section, div5);
    			append_dev(div5, div4);
    			append_dev(div4, button0);
    			append_dev(button0, t11);
    			append_dev(button0, div1);
    			append_dev(div1, t12);
    			append_dev(div1, span1);
    			append_dev(div1, t14);
    			append_dev(div4, t15);
    			append_dev(div4, div3);
    			append_dev(div3, div2);
    			append_dev(div2, button1);
    			append_dev(div3, t17);
    			append_dev(div3, p1);
    			append_dev(p1, t18);
    			append_dev(p1, code1);
    			append_dev(p1, t20);
    			append_dev(p1, code2);
    			append_dev(p1, t22);
    			append_dev(div3, t23);
    			append_dev(div3, p2);
    			append_dev(div3, t25);
    			append_dev(div3, h50);
    			append_dev(div3, t27);
    			append_dev(div3, pre0);
    			append_dev(pre0, code3);
    			append_dev(section, t28);
    			append_dev(section, div11);
    			append_dev(div11, div10);
    			append_dev(div10, button2);
    			append_dev(button2, t29);
    			append_dev(button2, div6);
    			append_dev(div6, t30);
    			append_dev(div6, span2);
    			append_dev(div6, t32);
    			append_dev(div10, t33);
    			append_dev(div10, div9);
    			append_dev(div9, div7);
    			append_dev(div7, button3);
    			append_dev(div9, t35);
    			append_dev(div9, p3);
    			append_dev(p3, t36);
    			append_dev(p3, code4);
    			append_dev(p3, t38);
    			append_dev(p3, code5);
    			append_dev(p3, t40);
    			append_dev(div9, t41);
    			append_dev(div9, p4);
    			append_dev(div9, t43);
    			append_dev(div9, h51);
    			append_dev(div9, t45);
    			append_dev(div9, pre1);
    			append_dev(pre1, code6);
    			append_dev(div9, t46);
    			append_dev(div9, div8);
    			append_dev(div8, h2);
    			append_dev(div8, t48);
    			append_dev(div8, strong);
    			append_dev(div8, t50);
    			append_dev(div8, p5);
    			append_dev(p5, t51);
    			append_dev(p5, code7);
    			append_dev(p5, t53);
    			append_dev(div8, t54);
    			append_dev(div8, pre2);
    			append_dev(pre2, code8);
    		},
    		p: noop,
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(section);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$8.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$8($$self, $$props) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('Crash_hang', slots, []);
    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console.warn(`<Crash_hang> was created with unknown prop '${key}'`);
    	});

    	return [];
    }

    class Crash_hang extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$8, create_fragment$8, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Crash_hang",
    			options,
    			id: create_fragment$8.name
    		});
    	}
    }

    /* src/sections/windows/modal-toggle-visibility.svelte generated by Svelte v3.46.2 */

    const file$7 = "src/sections/windows/modal-toggle-visibility.svelte";

    function create_fragment$7(ctx) {
    	let p;
    	let t1;
    	let a;

    	const block = {
    		c: function create() {
    			p = element("p");
    			p.textContent = "Click on the parent window to see how the \"focus on demo\" button appears.";
    			t1 = space();
    			a = element("a");
    			a.textContent = "Close this Window";
    			add_location(p, file$7, 21, 0, 431);
    			attr_dev(a, "id", "close");
    			attr_dev(a, "href", "javascript:window.close()");
    			attr_dev(a, "class", "svelte-1f0tkes");
    			add_location(a, file$7, 22, 0, 512);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, p, anchor);
    			insert_dev(target, t1, anchor);
    			insert_dev(target, a, anchor);
    		},
    		p: noop,
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(p);
    			if (detaching) detach_dev(t1);
    			if (detaching) detach_dev(a);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$7.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$7($$self, $$props) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('Modal_toggle_visibility', slots, []);
    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console.warn(`<Modal_toggle_visibility> was created with unknown prop '${key}'`);
    	});

    	return [];
    }

    class Modal_toggle_visibility extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$7, create_fragment$7, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Modal_toggle_visibility",
    			options,
    			id: create_fragment$7.name
    		});
    	}
    }

    /* src/sections/windows/modal.svelte generated by Svelte v3.46.2 */

    const file$6 = "src/sections/windows/modal.svelte";

    function create_fragment$6(ctx) {
    	let h2;
    	let t1;
    	let a;

    	const block = {
    		c: function create() {
    			h2 = element("h2");
    			h2.textContent = "Hello World!";
    			t1 = space();
    			a = element("a");
    			a.textContent = "Close this Window";
    			attr_dev(h2, "class", "svelte-6fn74c");
    			add_location(h2, file$6, 31, 0, 534);
    			attr_dev(a, "id", "close");
    			attr_dev(a, "href", "javascript:window.close()");
    			attr_dev(a, "class", "svelte-6fn74c");
    			add_location(a, file$6, 32, 0, 556);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, h2, anchor);
    			insert_dev(target, t1, anchor);
    			insert_dev(target, a, anchor);
    		},
    		p: noop,
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(h2);
    			if (detaching) detach_dev(t1);
    			if (detaching) detach_dev(a);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$6.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$6($$self, $$props) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('Modal', slots, []);
    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console.warn(`<Modal> was created with unknown prop '${key}'`);
    	});

    	return [];
    }

    class Modal extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$6, create_fragment$6, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Modal",
    			options,
    			id: create_fragment$6.name
    		});
    	}
    }

    /* src/sections/windows/process-crash.svelte generated by Svelte v3.46.2 */

    const file$5 = "src/sections/windows/process-crash.svelte";

    function create_fragment$5(ctx) {
    	let p;
    	let t1;
    	let a;

    	const block = {
    		c: function create() {
    			p = element("p");
    			p.textContent = "Click the text below to crash and then reload this process.";
    			t1 = space();
    			a = element("a");
    			a.textContent = "Crash this process";
    			add_location(p, file$5, 22, 0, 468);
    			attr_dev(a, "id", "crash");
    			attr_dev(a, "href", "javascript:process.crash()");
    			attr_dev(a, "class", "svelte-19gp7rf");
    			add_location(a, file$5, 23, 0, 535);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, p, anchor);
    			insert_dev(target, t1, anchor);
    			insert_dev(target, a, anchor);
    		},
    		p: noop,
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(p);
    			if (detaching) detach_dev(t1);
    			if (detaching) detach_dev(a);
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

    function instance$5($$self, $$props) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('Process_crash', slots, []);
    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console.warn(`<Process_crash> was created with unknown prop '${key}'`);
    	});

    	return [];
    }

    class Process_crash extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$5, create_fragment$5, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Process_crash",
    			options,
    			id: create_fragment$5.name
    		});
    	}
    }

    /* src/sections/windows/process-hang.svelte generated by Svelte v3.46.2 */

    const file$4 = "src/sections/windows/process-hang.svelte";

    function create_fragment$4(ctx) {
    	let p;
    	let t1;
    	let small;
    	let t3;
    	let a;

    	const block = {
    		c: function create() {
    			p = element("p");
    			p.textContent = "Click the text below to hang and then reload this process.";
    			t1 = space();
    			small = element("small");
    			small.textContent = "(This will take up to 30 seconds.)";
    			t3 = space();
    			a = element("a");
    			a.textContent = "Hang this process";
    			attr_dev(p, "class", "svelte-nqq468");
    			add_location(p, file$4, 25, 0, 479);
    			add_location(small, file$4, 26, 0, 545);
    			attr_dev(a, "id", "crash");
    			attr_dev(a, "href", "javascript:process.hang()");
    			attr_dev(a, "class", "svelte-nqq468");
    			add_location(a, file$4, 28, 0, 596);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, p, anchor);
    			insert_dev(target, t1, anchor);
    			insert_dev(target, small, anchor);
    			insert_dev(target, t3, anchor);
    			insert_dev(target, a, anchor);
    		},
    		p: noop,
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(p);
    			if (detaching) detach_dev(t1);
    			if (detaching) detach_dev(small);
    			if (detaching) detach_dev(t3);
    			if (detaching) detach_dev(a);
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

    function instance$4($$self, $$props) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('Process_hang', slots, []);
    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console.warn(`<Process_hang> was created with unknown prop '${key}'`);
    	});

    	return [];
    }

    class Process_hang extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$4, create_fragment$4, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Process_hang",
    			options,
    			id: create_fragment$4.name
    		});
    	}
    }

    /* src/sections/windows/windows.svelte generated by Svelte v3.46.2 */

    const file$3 = "src/sections/windows/windows.svelte";

    function create_fragment$3(ctx) {
    	let section;
    	let header;
    	let div0;
    	let h1;
    	let svg;
    	let use;
    	let t0;
    	let t1;
    	let h3;
    	let t2;
    	let code0;
    	let t4;
    	let t5;
    	let p0;
    	let t7;
    	let p1;
    	let t8;
    	let a0;
    	let t9;
    	let span0;
    	let t11;
    	let t12;
    	let div6;
    	let div5;
    	let button0;
    	let t13;
    	let div1;
    	let t14;
    	let span1;
    	let t16;
    	let t17;
    	let div4;
    	let div2;
    	let button1;
    	let t19;
    	let p2;
    	let t20;
    	let code1;
    	let t22;
    	let code2;
    	let t24;
    	let t25;
    	let p3;
    	let t26;
    	let a1;
    	let t27;
    	let span2;
    	let t29;
    	let t30;
    	let h50;
    	let t32;
    	let pre0;
    	let code3;
    	let t33;
    	let div3;
    	let h2;
    	let t35;
    	let strong;
    	let t37;
    	let p4;
    	let t38;
    	let code4;
    	let t40;
    	let code5;
    	let t42;
    	let t43;
    	let pre1;
    	let code6;
    	let t45;
    	let div11;
    	let div10;
    	let button2;
    	let t46;
    	let div7;
    	let t47;
    	let span3;
    	let t49;
    	let t50;
    	let div9;
    	let div8;
    	let button3;
    	let t52;
    	let span4;
    	let t53;
    	let p5;
    	let t54;
    	let code7;
    	let t56;
    	let code8;
    	let t58;
    	let t59;
    	let p6;
    	let t60;
    	let a2;
    	let t61;
    	let span5;
    	let t63;
    	let t64;
    	let h51;
    	let t66;
    	let pre2;
    	let code9;
    	let t67;
    	let div16;
    	let div15;
    	let button4;
    	let t68;
    	let div12;
    	let t69;
    	let span6;
    	let t71;
    	let t72;
    	let div14;
    	let div13;
    	let button5;
    	let t74;
    	let button6;
    	let t76;
    	let p7;
    	let t77;
    	let code10;
    	let t79;
    	let i;
    	let t81;
    	let t82;
    	let h52;
    	let t84;
    	let pre3;
    	let code11;
    	let t85;
    	let div21;
    	let div20;
    	let button7;
    	let t86;
    	let div17;
    	let t87;
    	let span7;
    	let t89;
    	let t90;
    	let div19;
    	let div18;
    	let button8;
    	let t92;
    	let p8;
    	let t93;
    	let a3;
    	let t95;
    	let code12;
    	let t97;
    	let code13;
    	let t99;
    	let t100;
    	let h53;
    	let t102;
    	let pre4;
    	let code14;
    	let t103;
    	let p9;
    	let t104;
    	let code15;
    	let t106;
    	let code16;
    	let t108;
    	let t109;
    	let pre5;
    	let code17;
    	let t111;
    	let p10;
    	let t112;
    	let a4;
    	let t114;
    	let t115;
    	let script;

    	const block = {
    		c: function create() {
    			section = element("section");
    			header = element("header");
    			div0 = element("div");
    			h1 = element("h1");
    			svg = svg_element("svg");
    			use = svg_element("use");
    			t0 = text("\n          Create and Manage Windows");
    			t1 = space();
    			h3 = element("h3");
    			t2 = text("The ");
    			code0 = element("code");
    			code0.textContent = "BrowserWindow";
    			t4 = text(" module in Electron allows you to create\n          a new browser window or manage an existing one.");
    			t5 = space();
    			p0 = element("p");
    			p0.textContent = "Each browser window is a separate process, known as the renderer\n          process. This process, like the main process that controls the life\n          cycle of the app, has full access to the Node.js APIs.";
    			t7 = space();
    			p1 = element("p");
    			t8 = text("Open the ");
    			a0 = element("a");
    			t9 = text("full API documentation");
    			span0 = element("span");
    			span0.textContent = "(opens in new window)";
    			t11 = text(" in your browser.");
    			t12 = space();
    			div6 = element("div");
    			div5 = element("div");
    			button0 = element("button");
    			t13 = text("Create a new window\n          ");
    			div1 = element("div");
    			t14 = text("Supports: Win, macOS, Linux ");
    			span1 = element("span");
    			span1.textContent = "|";
    			t16 = text("\n            Process: Main");
    			t17 = space();
    			div4 = element("div");
    			div2 = element("div");
    			button1 = element("button");
    			button1.textContent = "View Demo";
    			t19 = space();
    			p2 = element("p");
    			t20 = text("The ");
    			code1 = element("code");
    			code1.textContent = "BrowserWindow";
    			t22 = text(" module gives you the ability to\n            create new windows in your app. This main process module can be used\n            from the renderer process with the ");
    			code2 = element("code");
    			code2.textContent = "remote";
    			t24 = text(" module, as is\n            shown in this demo.");
    			t25 = space();
    			p3 = element("p");
    			t26 = text("There are a lot of options when creating a new window. A few are in\n            this demo, but visit the ");
    			a1 = element("a");
    			t27 = text("documentation");
    			span2 = element("span");
    			span2.textContent = "(opens in new window)";
    			t29 = text(" for the full list.");
    			t30 = space();
    			h50 = element("h5");
    			h50.textContent = "Renderer Process";
    			t32 = space();
    			pre0 = element("pre");
    			code3 = element("code");
    			t33 = space();
    			div3 = element("div");
    			h2 = element("h2");
    			h2.textContent = "ProTip";
    			t35 = space();
    			strong = element("strong");
    			strong.textContent = "Use an invisible browser window to run background tasks.";
    			t37 = space();
    			p4 = element("p");
    			t38 = text("You can set a new browser window to not be shown (be invisible) in\n              order to use that additional renderer process as a kind of new\n              thread in which to run JavaScript in the background of your app.\n              You do this by setting the ");
    			code4 = element("code");
    			code4.textContent = "show";
    			t40 = text(" property to\n              ");
    			code5 = element("code");
    			code5.textContent = "false";
    			t42 = text(" when defining the new window.");
    			t43 = space();
    			pre1 = element("pre");
    			code6 = element("code");
    			code6.textContent = "var win = new BrowserWindow(\n  width: 400, height: 225, show: false\n)";
    			t45 = space();
    			div11 = element("div");
    			div10 = element("div");
    			button2 = element("button");
    			t46 = text("Manage window state\n          ");
    			div7 = element("div");
    			t47 = text("Supports: Win, macOS, Linux ");
    			span3 = element("span");
    			span3.textContent = "|";
    			t49 = text("\n            Process: Main");
    			t50 = space();
    			div9 = element("div");
    			div8 = element("div");
    			button3 = element("button");
    			button3.textContent = "View Demo";
    			t52 = space();
    			span4 = element("span");
    			t53 = space();
    			p5 = element("p");
    			t54 = text("In this demo we create a new window and listen for ");
    			code7 = element("code");
    			code7.textContent = "move";
    			t56 = text("\n            and ");
    			code8 = element("code");
    			code8.textContent = "resize";
    			t58 = text(" events on it. Click the demo button, change the\n            new window and see the dimensions and position update here, above.");
    			t59 = space();
    			p6 = element("p");
    			t60 = text("There are a lot of methods for controlling the state of the window\n            such as the size, location, and focus status as well as events to\n            listen to for window changes. Visit the ");
    			a2 = element("a");
    			t61 = text("documentation");
    			span5 = element("span");
    			span5.textContent = "(opens in new window)";
    			t63 = text(" for the full list.");
    			t64 = space();
    			h51 = element("h5");
    			h51.textContent = "Renderer Process";
    			t66 = space();
    			pre2 = element("pre");
    			code9 = element("code");
    			t67 = space();
    			div16 = element("div");
    			div15 = element("div");
    			button4 = element("button");
    			t68 = text("Window events: blur and focus\n          ");
    			div12 = element("div");
    			t69 = text("Supports: Win, macOS, Linux ");
    			span6 = element("span");
    			span6.textContent = "|";
    			t71 = text("\n            Process: Main");
    			t72 = space();
    			div14 = element("div");
    			div13 = element("div");
    			button5 = element("button");
    			button5.textContent = "View Demo";
    			t74 = space();
    			button6 = element("button");
    			button6.textContent = "Focus on Demo";
    			t76 = space();
    			p7 = element("p");
    			t77 = text("In this demo, we create a new window and listen for ");
    			code10 = element("code");
    			code10.textContent = "blur";
    			t79 = text("\n            event on it. Click the demo button to create a new modal window, and\n            switch focus back to the parent window by clicking on it. You can click\n            the\n            ");
    			i = element("i");
    			i.textContent = "Focus on Demo";
    			t81 = text(" button to switch focus to the modal window again.");
    			t82 = space();
    			h52 = element("h5");
    			h52.textContent = "Renderer Process";
    			t84 = space();
    			pre3 = element("pre");
    			code11 = element("code");
    			t85 = space();
    			div21 = element("div");
    			div20 = element("div");
    			button7 = element("button");
    			t86 = text("Create a frameless window\n          ");
    			div17 = element("div");
    			t87 = text("Supports: Win, macOS, Linux ");
    			span7 = element("span");
    			span7.textContent = "|";
    			t89 = text("\n            Process: Main");
    			t90 = space();
    			div19 = element("div");
    			div18 = element("div");
    			button8 = element("button");
    			button8.textContent = "View Demo";
    			t92 = space();
    			p8 = element("p");
    			t93 = text("A frameless window is a window that has no ");
    			a3 = element("a");
    			a3.textContent = "\"chrome\"";
    			t95 = text(", such as toolbars, title bars, status bars, borders, etc. You can\n            make a browser window frameless by setting\n            ");
    			code12 = element("code");
    			code12.textContent = "frame";
    			t97 = text(" to ");
    			code13 = element("code");
    			code13.textContent = "false";
    			t99 = text(" when creating the window.");
    			t100 = space();
    			h53 = element("h5");
    			h53.textContent = "Renderer Process";
    			t102 = space();
    			pre4 = element("pre");
    			code14 = element("code");
    			t103 = space();
    			p9 = element("p");
    			t104 = text("Windows can have a transparent background, too. By setting the ");
    			code15 = element("code");
    			code15.textContent = "transparent";
    			t106 = text("\n            option to\n            ");
    			code16 = element("code");
    			code16.textContent = "true";
    			t108 = text(", you can also make your frameless window\n            transparent:");
    			t109 = space();
    			pre5 = element("pre");
    			code17 = element("code");
    			code17.textContent = "var win = new BrowserWindow(\n  transparent: true,\n  frame: false\n)";
    			t111 = space();
    			p10 = element("p");
    			t112 = text("For more details, see the ");
    			a4 = element("a");
    			a4.textContent = "Frameless Window";
    			t114 = text("\n            documentation.");
    			t115 = space();
    			script = element("script");
    			script.textContent = "require(\"./renderer-process/windows/create-window\");\n      require(\"./renderer-process/windows/manage-window\");\n      require(\"./renderer-process/windows/using-window-events\");\n      require(\"./renderer-process/windows/frameless-window\");";
    			xlink_attr(use, "xlink:href", "../assets/img/icons.svg#icon-windows");
    			add_location(use, file$3, 6, 12, 214);
    			attr_dev(svg, "class", "section-icon");
    			add_location(svg, file$3, 5, 10, 175);
    			add_location(h1, file$3, 4, 8, 160);
    			add_location(code0, file$3, 11, 14, 366);
    			add_location(h3, file$3, 10, 8, 347);
    			add_location(p0, file$3, 15, 8, 514);
    			attr_dev(span0, "class", "u-visible-to-screen-reader");
    			add_location(span0, file$3, 22, 35, 873);
    			attr_dev(a0, "href", "http://electron.atom.io/docs/api/browser-window");
    			add_location(a0, file$3, 21, 19, 780);
    			add_location(p1, file$3, 20, 8, 757);
    			attr_dev(div0, "class", "section-wrapper");
    			add_location(div0, file$3, 3, 6, 122);
    			attr_dev(header, "class", "section-header");
    			add_location(header, file$3, 2, 4, 84);
    			attr_dev(span1, "class", "demo-meta-divider");
    			add_location(span1, file$3, 37, 40, 1331);
    			attr_dev(div1, "class", "demo-meta u-avoid-clicks");
    			add_location(div1, file$3, 36, 10, 1252);
    			attr_dev(button0, "id", "new-window-demo-toggle");
    			attr_dev(button0, "class", "js-container-target demo-toggle-button");
    			add_location(button0, file$3, 32, 8, 1108);
    			attr_dev(button1, "class", "demo-button");
    			attr_dev(button1, "id", "new-window");
    			add_location(button1, file$3, 43, 12, 1514);
    			attr_dev(div2, "class", "demo-controls");
    			add_location(div2, file$3, 42, 10, 1474);
    			add_location(code1, file$3, 46, 16, 1624);
    			add_location(code2, file$3, 48, 47, 1811);
    			add_location(p2, file$3, 45, 10, 1604);
    			attr_dev(span2, "class", "u-visible-to-screen-reader");
    			add_location(span2, file$3, 56, 28, 2124);
    			attr_dev(a1, "href", "http://electron.atom.io/docs/api/browser-window");
    			add_location(a1, file$3, 54, 37, 2024);
    			add_location(p3, file$3, 52, 10, 1903);
    			add_location(h50, file$3, 61, 10, 2287);
    			attr_dev(code3, "data-path", "renderer-process/windows/create-window.js");
    			add_location(code3, file$3, 62, 15, 2328);
    			add_location(pre0, file$3, 62, 10, 2323);
    			add_location(h2, file$3, 67, 12, 2472);
    			add_location(strong, file$3, 68, 12, 2500);
    			add_location(code4, file$3, 75, 41, 2896);
    			add_location(code5, file$3, 76, 14, 2940);
    			add_location(p4, file$3, 71, 12, 2614);
    			attr_dev(code6, "class", "language-js");
    			add_location(code6, file$3, 79, 0, 3024);
    			add_location(pre1, file$3, 78, 12, 3018);
    			attr_dev(div3, "class", "demo-protip");
    			add_location(div3, file$3, 66, 10, 2434);
    			attr_dev(div4, "class", "demo-box");
    			add_location(div4, file$3, 41, 8, 1441);
    			attr_dev(div5, "class", "demo-wrapper");
    			add_location(div5, file$3, 31, 6, 1073);
    			attr_dev(div6, "class", "demo");
    			add_location(div6, file$3, 30, 4, 1048);
    			attr_dev(span3, "class", "demo-meta-divider");
    			add_location(span3, file$3, 96, 40, 3512);
    			attr_dev(div7, "class", "demo-meta u-avoid-clicks");
    			add_location(div7, file$3, 95, 10, 3433);
    			attr_dev(button2, "id", "manage-window-demo-toggle");
    			attr_dev(button2, "class", "js-container-target demo-toggle-button");
    			add_location(button2, file$3, 91, 8, 3286);
    			attr_dev(button3, "class", "demo-button");
    			attr_dev(button3, "id", "manage-window");
    			add_location(button3, file$3, 102, 12, 3695);
    			attr_dev(span4, "class", "demo-response");
    			attr_dev(span4, "id", "manage-window-reply");
    			add_location(span4, file$3, 103, 12, 3773);
    			attr_dev(div8, "class", "demo-controls");
    			add_location(div8, file$3, 101, 10, 3655);
    			add_location(code7, file$3, 106, 63, 3923);
    			add_location(code8, file$3, 107, 16, 3957);
    			add_location(p5, file$3, 105, 10, 3856);
    			attr_dev(span5, "class", "u-visible-to-screen-reader");
    			add_location(span5, file$3, 115, 28, 4442);
    			attr_dev(a2, "href", "http://electron.atom.io/docs/api/browser-window");
    			add_location(a2, file$3, 113, 52, 4342);
    			add_location(p6, file$3, 110, 10, 4129);
    			add_location(h51, file$3, 120, 10, 4605);
    			attr_dev(code9, "data-path", "renderer-process/windows/manage-window.js");
    			add_location(code9, file$3, 121, 15, 4646);
    			add_location(pre2, file$3, 121, 10, 4641);
    			attr_dev(div9, "class", "demo-box");
    			add_location(div9, file$3, 100, 8, 3622);
    			attr_dev(div10, "class", "demo-wrapper");
    			add_location(div10, file$3, 90, 6, 3251);
    			attr_dev(div11, "class", "demo");
    			add_location(div11, file$3, 89, 4, 3226);
    			attr_dev(span6, "class", "demo-meta-divider");
    			add_location(span6, file$3, 135, 40, 5087);
    			attr_dev(div12, "class", "demo-meta u-avoid-clicks");
    			add_location(div12, file$3, 134, 10, 5008);
    			attr_dev(button4, "id", "using-window-events-demo-toggle");
    			attr_dev(button4, "class", "js-container-target demo-toggle-button");
    			add_location(button4, file$3, 130, 8, 4845);
    			attr_dev(button5, "class", "demo-button");
    			attr_dev(button5, "id", "listen-to-window");
    			add_location(button5, file$3, 141, 12, 5270);
    			attr_dev(button6, "class", "demo-button disappear");
    			attr_dev(button6, "id", "focus-on-modal-window");
    			add_location(button6, file$3, 142, 12, 5351);
    			attr_dev(div13, "class", "demo-controls");
    			add_location(div13, file$3, 140, 10, 5230);
    			add_location(code10, file$3, 147, 64, 5562);
    			add_location(i, file$3, 152, 12, 5786);
    			add_location(p7, file$3, 146, 10, 5494);
    			add_location(h52, file$3, 154, 10, 5882);
    			attr_dev(code11, "data-path", "renderer-process/windows/using-window-events.js");
    			add_location(code11, file$3, 155, 15, 5923);
    			add_location(pre3, file$3, 155, 10, 5918);
    			attr_dev(div14, "class", "demo-box");
    			add_location(div14, file$3, 139, 8, 5197);
    			attr_dev(div15, "class", "demo-wrapper");
    			add_location(div15, file$3, 129, 6, 4810);
    			attr_dev(div16, "class", "demo");
    			add_location(div16, file$3, 128, 4, 4785);
    			attr_dev(span7, "class", "demo-meta-divider");
    			add_location(span7, file$3, 167, 40, 6309);
    			attr_dev(div17, "class", "demo-meta u-avoid-clicks");
    			add_location(div17, file$3, 166, 10, 6230);
    			attr_dev(button7, "class", "js-container-target demo-toggle-button");
    			add_location(button7, file$3, 164, 8, 6128);
    			attr_dev(button8, "class", "demo-button");
    			attr_dev(button8, "id", "frameless-window");
    			add_location(button8, file$3, 173, 12, 6492);
    			attr_dev(div18, "class", "demo-controls");
    			add_location(div18, file$3, 172, 10, 6452);
    			attr_dev(a3, "href", "https://developer.mozilla.org/en-US/docs/Glossary/Chrome");
    			add_location(a3, file$3, 176, 55, 6647);
    			add_location(code12, file$3, 181, 12, 6902);
    			add_location(code13, file$3, 181, 34, 6924);
    			add_location(p8, file$3, 175, 10, 6588);
    			add_location(h53, file$3, 184, 10, 6995);
    			attr_dev(code14, "data-path", "renderer-process/windows/frameless-window.js");
    			add_location(code14, file$3, 185, 15, 7036);
    			add_location(pre4, file$3, 185, 10, 7031);
    			add_location(code15, file$3, 190, 75, 7224);
    			add_location(code16, file$3, 194, 12, 7311);
    			add_location(p9, file$3, 189, 10, 7145);
    			attr_dev(code17, "class", "language-js");
    			add_location(code17, file$3, 198, 0, 7426);
    			add_location(pre5, file$3, 197, 10, 7420);
    			attr_dev(a4, "href", "http://electron.atom.io/docs/api/frameless-window/");
    			add_location(a4, file$3, 206, 38, 7613);
    			add_location(p10, file$3, 205, 10, 7571);
    			attr_dev(div19, "class", "demo-box");
    			add_location(div19, file$3, 171, 8, 6419);
    			attr_dev(div20, "class", "demo-wrapper");
    			add_location(div20, file$3, 163, 6, 6093);
    			attr_dev(div21, "class", "demo");
    			add_location(div21, file$3, 162, 4, 6068);
    			attr_dev(script, "type", "text/javascript");
    			add_location(script, file$3, 216, 4, 7823);
    			attr_dev(section, "id", "windows-section");
    			attr_dev(section, "class", "section js-section u-category-windows");
    			add_location(section, file$3, 1, 2, 3);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, section, anchor);
    			append_dev(section, header);
    			append_dev(header, div0);
    			append_dev(div0, h1);
    			append_dev(h1, svg);
    			append_dev(svg, use);
    			append_dev(h1, t0);
    			append_dev(div0, t1);
    			append_dev(div0, h3);
    			append_dev(h3, t2);
    			append_dev(h3, code0);
    			append_dev(h3, t4);
    			append_dev(div0, t5);
    			append_dev(div0, p0);
    			append_dev(div0, t7);
    			append_dev(div0, p1);
    			append_dev(p1, t8);
    			append_dev(p1, a0);
    			append_dev(a0, t9);
    			append_dev(a0, span0);
    			append_dev(p1, t11);
    			append_dev(section, t12);
    			append_dev(section, div6);
    			append_dev(div6, div5);
    			append_dev(div5, button0);
    			append_dev(button0, t13);
    			append_dev(button0, div1);
    			append_dev(div1, t14);
    			append_dev(div1, span1);
    			append_dev(div1, t16);
    			append_dev(div5, t17);
    			append_dev(div5, div4);
    			append_dev(div4, div2);
    			append_dev(div2, button1);
    			append_dev(div4, t19);
    			append_dev(div4, p2);
    			append_dev(p2, t20);
    			append_dev(p2, code1);
    			append_dev(p2, t22);
    			append_dev(p2, code2);
    			append_dev(p2, t24);
    			append_dev(div4, t25);
    			append_dev(div4, p3);
    			append_dev(p3, t26);
    			append_dev(p3, a1);
    			append_dev(a1, t27);
    			append_dev(a1, span2);
    			append_dev(p3, t29);
    			append_dev(div4, t30);
    			append_dev(div4, h50);
    			append_dev(div4, t32);
    			append_dev(div4, pre0);
    			append_dev(pre0, code3);
    			append_dev(div4, t33);
    			append_dev(div4, div3);
    			append_dev(div3, h2);
    			append_dev(div3, t35);
    			append_dev(div3, strong);
    			append_dev(div3, t37);
    			append_dev(div3, p4);
    			append_dev(p4, t38);
    			append_dev(p4, code4);
    			append_dev(p4, t40);
    			append_dev(p4, code5);
    			append_dev(p4, t42);
    			append_dev(div3, t43);
    			append_dev(div3, pre1);
    			append_dev(pre1, code6);
    			append_dev(section, t45);
    			append_dev(section, div11);
    			append_dev(div11, div10);
    			append_dev(div10, button2);
    			append_dev(button2, t46);
    			append_dev(button2, div7);
    			append_dev(div7, t47);
    			append_dev(div7, span3);
    			append_dev(div7, t49);
    			append_dev(div10, t50);
    			append_dev(div10, div9);
    			append_dev(div9, div8);
    			append_dev(div8, button3);
    			append_dev(div8, t52);
    			append_dev(div8, span4);
    			append_dev(div9, t53);
    			append_dev(div9, p5);
    			append_dev(p5, t54);
    			append_dev(p5, code7);
    			append_dev(p5, t56);
    			append_dev(p5, code8);
    			append_dev(p5, t58);
    			append_dev(div9, t59);
    			append_dev(div9, p6);
    			append_dev(p6, t60);
    			append_dev(p6, a2);
    			append_dev(a2, t61);
    			append_dev(a2, span5);
    			append_dev(p6, t63);
    			append_dev(div9, t64);
    			append_dev(div9, h51);
    			append_dev(div9, t66);
    			append_dev(div9, pre2);
    			append_dev(pre2, code9);
    			append_dev(section, t67);
    			append_dev(section, div16);
    			append_dev(div16, div15);
    			append_dev(div15, button4);
    			append_dev(button4, t68);
    			append_dev(button4, div12);
    			append_dev(div12, t69);
    			append_dev(div12, span6);
    			append_dev(div12, t71);
    			append_dev(div15, t72);
    			append_dev(div15, div14);
    			append_dev(div14, div13);
    			append_dev(div13, button5);
    			append_dev(div13, t74);
    			append_dev(div13, button6);
    			append_dev(div14, t76);
    			append_dev(div14, p7);
    			append_dev(p7, t77);
    			append_dev(p7, code10);
    			append_dev(p7, t79);
    			append_dev(p7, i);
    			append_dev(p7, t81);
    			append_dev(div14, t82);
    			append_dev(div14, h52);
    			append_dev(div14, t84);
    			append_dev(div14, pre3);
    			append_dev(pre3, code11);
    			append_dev(section, t85);
    			append_dev(section, div21);
    			append_dev(div21, div20);
    			append_dev(div20, button7);
    			append_dev(button7, t86);
    			append_dev(button7, div17);
    			append_dev(div17, t87);
    			append_dev(div17, span7);
    			append_dev(div17, t89);
    			append_dev(div20, t90);
    			append_dev(div20, div19);
    			append_dev(div19, div18);
    			append_dev(div18, button8);
    			append_dev(div19, t92);
    			append_dev(div19, p8);
    			append_dev(p8, t93);
    			append_dev(p8, a3);
    			append_dev(p8, t95);
    			append_dev(p8, code12);
    			append_dev(p8, t97);
    			append_dev(p8, code13);
    			append_dev(p8, t99);
    			append_dev(div19, t100);
    			append_dev(div19, h53);
    			append_dev(div19, t102);
    			append_dev(div19, pre4);
    			append_dev(pre4, code14);
    			append_dev(div19, t103);
    			append_dev(div19, p9);
    			append_dev(p9, t104);
    			append_dev(p9, code15);
    			append_dev(p9, t106);
    			append_dev(p9, code16);
    			append_dev(p9, t108);
    			append_dev(div19, t109);
    			append_dev(div19, pre5);
    			append_dev(pre5, code17);
    			append_dev(div19, t111);
    			append_dev(div19, p10);
    			append_dev(p10, t112);
    			append_dev(p10, a4);
    			append_dev(p10, t114);
    			append_dev(section, t115);
    			append_dev(section, script);
    		},
    		p: noop,
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(section);
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

    function instance$3($$self, $$props) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('Windows', slots, []);
    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console.warn(`<Windows> was created with unknown prop '${key}'`);
    	});

    	return [];
    }

    class Windows extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$3, create_fragment$3, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Windows",
    			options,
    			id: create_fragment$3.name
    		});
    	}
    }

    var windows = {
        manageModal: Manage_modal,
        crashHang: Crash_hang,
        modalToggleVisibility: Modal_toggle_visibility,
        modal: Modal,
        processCrash: Process_crash,
        processHang: Process_hang,
        windows: Windows
    };

    /* src/sections/About.svelte generated by Svelte v3.46.2 */

    const file$2 = "src/sections/About.svelte";

    function create_fragment$2(ctx) {
    	let div2;
    	let div1;
    	let header;
    	let p0;
    	let t1;
    	let main;
    	let section0;
    	let h20;
    	let t3;
    	let p1;
    	let t4;
    	let a0;
    	let t5;
    	let span0;
    	let t7;
    	let a1;
    	let t8;
    	let span1;
    	let t10;
    	let a2;
    	let t11;
    	let span2;
    	let t13;
    	let t14;
    	let pre;
    	let code0;
    	let t16;
    	let section1;
    	let h21;
    	let t18;
    	let p2;
    	let t19;
    	let a3;
    	let t20;
    	let span3;
    	let t22;
    	let t23;
    	let p3;
    	let t24;
    	let a4;
    	let t25;
    	let span4;
    	let t27;
    	let em;
    	let t29;
    	let a5;
    	let t30;
    	let span5;
    	let t32;
    	let t33;
    	let p4;
    	let t34;
    	let code1;
    	let t36;
    	let code2;
    	let t38;
    	let code3;
    	let t42;
    	let t43;
    	let footer;
    	let div0;
    	let button;

    	const block = {
    		c: function create() {
    			div2 = element("div");
    			div1 = element("div");
    			header = element("header");
    			p0 = element("p");
    			p0.textContent = "Hello";
    			t1 = space();
    			main = element("main");
    			section0 = element("section");
    			h20 = element("h2");
    			h20.textContent = "Play Along";
    			t3 = space();
    			p1 = element("p");
    			t4 = text("Use the demo snippets in an Electron app of your own.\n                        The ");
    			a0 = element("a");
    			t5 = text("Electron Quick Start");
    			span0 = element("span");
    			span0.textContent = "(opens in new window)";
    			t7 = text("\n                        app is a bare-bones setup that pairs with these demos. Follow\n                        the instructions here to get it going. You'll need\n                        ");
    			a1 = element("a");
    			t8 = text("Git");
    			span1 = element("span");
    			span1.textContent = "(opens in new window)";
    			t10 = text("\n                        and\n                        ");
    			a2 = element("a");
    			t11 = text("Node.js");
    			span2 = element("span");
    			span2.textContent = "(opens in new window)";
    			t13 = text(" on your computer to do this.");
    			t14 = space();
    			pre = element("pre");
    			code0 = element("code");
    			code0.textContent = "$ git clone https://github.com/electron/electron-quick-start\n  $ cd electron-quick-start\n  $ npm install && npm start";
    			t16 = space();
    			section1 = element("section");
    			h21 = element("h2");
    			h21.textContent = "About the Code";
    			t18 = space();
    			p2 = element("p");
    			t19 = text("The ");
    			a3 = element("a");
    			t20 = text("source code of this app");
    			span3 = element("span");
    			span3.textContent = "(opens in new window)";
    			t22 = text(" has been organized with ease of navigation in mind.");
    			t23 = space();
    			p3 = element("p");
    			t24 = text("Nearly all (over 90%) of ");
    			a4 = element("a");
    			t25 = text("ES2015");
    			span4 = element("span");
    			span4.textContent = "(opens in new window)";
    			t27 = text("\n                        is available to use in Electron\n                        ");
    			em = element("em");
    			em.textContent = "without the use of pre-processors";
    			t29 = text("\n                        because it's a part of\n                        ");
    			a5 = element("a");
    			t30 = text("V8");
    			span5 = element("span");
    			span5.textContent = "(opens in new window)";
    			t32 = text(" which is built into Electron.");
    			t33 = space();
    			p4 = element("p");
    			t34 = text("To illustrate this we've made use of ");
    			code1 = element("code");
    			code1.textContent = "const";
    			t36 = text(",\n                        for unchanging declarations; ");
    			code2 = element("code");
    			code2.textContent = "let";
    			t38 = text(" for scoped\n                        declarations; and template strings like:\n                        ");
    			code3 = element("code");
    			code3.textContent = `\`Result is \$${/*output*/ ctx[0]}\``;
    			t42 = text(" in the demo snippets.");
    			t43 = space();
    			footer = element("footer");
    			div0 = element("div");
    			button = element("button");
    			button.textContent = "Get Started";
    			add_location(p0, file$2, 8, 16, 195);
    			attr_dev(header, "class", "about-header");
    			add_location(header, file$2, 7, 12, 149);
    			add_location(h20, file$2, 12, 20, 351);
    			attr_dev(span0, "class", "u-visible-to-screen-reader");
    			add_location(span0, file$2, 17, 49, 637);
    			attr_dev(a0, "href", "https://github.com/electron/electron-quick-start");
    			add_location(a0, file$2, 15, 28, 501);
    			attr_dev(span1, "class", "u-visible-to-screen-reader");
    			add_location(span1, file$2, 25, 32, 1085);
    			attr_dev(a1, "href", "https://desktop.github.com/");
    			add_location(a1, file$2, 24, 24, 1015);
    			attr_dev(span2, "class", "u-visible-to-screen-reader");
    			add_location(span2, file$2, 31, 36, 1364);
    			attr_dev(a2, "href", "https://nodejs.org/");
    			add_location(a2, file$2, 30, 24, 1298);
    			add_location(p1, file$2, 13, 20, 391);
    			attr_dev(code0, "class", "language-bash");
    			add_location(code0, file$2, 36, 25, 1604);
    			add_location(pre, file$2, 36, 20, 1599);
    			attr_dev(section0, "class", "about-section play-along");
    			add_location(section0, file$2, 11, 16, 288);
    			add_location(h21, file$2, 43, 20, 1909);
    			attr_dev(span3, "class", "u-visible-to-screen-reader");
    			add_location(span3, file$2, 47, 52, 2122);
    			attr_dev(a3, "href", "https://github.com/electron/electron-api-demos");
    			add_location(a3, file$2, 45, 28, 1985);
    			add_location(p2, file$2, 44, 20, 1953);
    			attr_dev(span4, "class", "u-visible-to-screen-reader");
    			add_location(span4, file$2, 57, 35, 2576);
    			attr_dev(a4, "href", "http://babeljs.io/docs/learn-es2015/");
    			add_location(a4, file$2, 55, 49, 2466);
    			add_location(em, file$2, 62, 24, 2817);
    			attr_dev(span5, "class", "u-visible-to-screen-reader");
    			add_location(span5, file$2, 65, 31, 3006);
    			attr_dev(a5, "href", "https://developers.google.com/v8/");
    			add_location(a5, file$2, 64, 24, 2931);
    			add_location(p3, file$2, 54, 20, 2413);
    			add_location(code1, file$2, 72, 61, 3308);
    			add_location(code2, file$2, 73, 53, 3381);
    			add_location(code3, file$2, 75, 24, 3498);
    			add_location(p4, file$2, 71, 20, 3243);
    			attr_dev(section1, "class", "about-section about-code");
    			add_location(section1, file$2, 42, 16, 1846);
    			attr_dev(button, "id", "get-started");
    			attr_dev(button, "class", "about-button modal-hide");
    			add_location(button, file$2, 80, 24, 3742);
    			attr_dev(div0, "class", "rainbow-button-wrapper");
    			add_location(div0, file$2, 79, 20, 3681);
    			attr_dev(footer, "class", "about-section footer");
    			add_location(footer, file$2, 78, 16, 3623);
    			attr_dev(main, "class", "about-sections");
    			add_location(main, file$2, 10, 12, 242);
    			attr_dev(div1, "class", "about-wrapper");
    			add_location(div1, file$2, 6, 8, 109);
    			attr_dev(div2, "id", "about-modal");
    			attr_dev(div2, "class", "about modal is-shown");
    			add_location(div2, file$2, 5, 4, 49);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div2, anchor);
    			append_dev(div2, div1);
    			append_dev(div1, header);
    			append_dev(header, p0);
    			append_dev(div1, t1);
    			append_dev(div1, main);
    			append_dev(main, section0);
    			append_dev(section0, h20);
    			append_dev(section0, t3);
    			append_dev(section0, p1);
    			append_dev(p1, t4);
    			append_dev(p1, a0);
    			append_dev(a0, t5);
    			append_dev(a0, span0);
    			append_dev(p1, t7);
    			append_dev(p1, a1);
    			append_dev(a1, t8);
    			append_dev(a1, span1);
    			append_dev(p1, t10);
    			append_dev(p1, a2);
    			append_dev(a2, t11);
    			append_dev(a2, span2);
    			append_dev(p1, t13);
    			append_dev(section0, t14);
    			append_dev(section0, pre);
    			append_dev(pre, code0);
    			append_dev(main, t16);
    			append_dev(main, section1);
    			append_dev(section1, h21);
    			append_dev(section1, t18);
    			append_dev(section1, p2);
    			append_dev(p2, t19);
    			append_dev(p2, a3);
    			append_dev(a3, t20);
    			append_dev(a3, span3);
    			append_dev(p2, t22);
    			append_dev(section1, t23);
    			append_dev(section1, p3);
    			append_dev(p3, t24);
    			append_dev(p3, a4);
    			append_dev(a4, t25);
    			append_dev(a4, span4);
    			append_dev(p3, t27);
    			append_dev(p3, em);
    			append_dev(p3, t29);
    			append_dev(p3, a5);
    			append_dev(a5, t30);
    			append_dev(a5, span5);
    			append_dev(p3, t32);
    			append_dev(section1, t33);
    			append_dev(section1, p4);
    			append_dev(p4, t34);
    			append_dev(p4, code1);
    			append_dev(p4, t36);
    			append_dev(p4, code2);
    			append_dev(p4, t38);
    			append_dev(p4, code3);
    			append_dev(p4, t42);
    			append_dev(main, t43);
    			append_dev(main, footer);
    			append_dev(footer, div0);
    			append_dev(div0, button);
    		},
    		p: noop,
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div2);
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
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('About', slots, []);
    	let output = "lol";
    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console.warn(`<About> was created with unknown prop '${key}'`);
    	});

    	$$self.$capture_state = () => ({ output });

    	$$self.$inject_state = $$props => {
    		if ('output' in $$props) $$invalidate(0, output = $$props.output);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [output];
    }

    class About extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$2, create_fragment$2, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "About",
    			options,
    			id: create_fragment$2.name
    		});
    	}
    }

    var sections = {
        windows,
        About
    };

    /* src/navigation.svelte generated by Svelte v3.46.2 */

    const { console: console_1$1 } = globals;
    const file$1 = "src/navigation.svelte";

    function get_each_context(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[7] = list[i];
    	child_ctx[9] = i;
    	return child_ctx;
    }

    function get_each_context_1(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[10] = list[i];
    	child_ctx[12] = i;
    	return child_ctx;
    }

    // (61:4) {#if menus.length > 0}
    function create_if_block(ctx) {
    	let each_1_anchor;
    	let each_value = /*menus*/ ctx[1];
    	validate_each_argument(each_value);
    	let each_blocks = [];

    	for (let i = 0; i < each_value.length; i += 1) {
    		each_blocks[i] = create_each_block(get_each_context(ctx, each_value, i));
    	}

    	const block = {
    		c: function create() {
    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].c();
    			}

    			each_1_anchor = empty();
    		},
    		m: function mount(target, anchor) {
    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].m(target, anchor);
    			}

    			insert_dev(target, each_1_anchor, anchor);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*menus, changeNavClick*/ 6) {
    				each_value = /*menus*/ ctx[1];
    				validate_each_argument(each_value);
    				let i;

    				for (i = 0; i < each_value.length; i += 1) {
    					const child_ctx = get_each_context(ctx, each_value, i);

    					if (each_blocks[i]) {
    						each_blocks[i].p(child_ctx, dirty);
    					} else {
    						each_blocks[i] = create_each_block(child_ctx);
    						each_blocks[i].c();
    						each_blocks[i].m(each_1_anchor.parentNode, each_1_anchor);
    					}
    				}

    				for (; i < each_blocks.length; i += 1) {
    					each_blocks[i].d(1);
    				}

    				each_blocks.length = each_value.length;
    			}
    		},
    		d: function destroy(detaching) {
    			destroy_each(each_blocks, detaching);
    			if (detaching) detach_dev(each_1_anchor);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block.name,
    		type: "if",
    		source: "(61:4) {#if menus.length > 0}",
    		ctx
    	});

    	return block;
    }

    // (70:16) {#each oneMenu.links as oneLinks, indexLink}
    function create_each_block_1(ctx) {
    	let button;
    	let raw_value = /*oneLinks*/ ctx[10].title + "";
    	let mounted;
    	let dispose;

    	function click_handler() {
    		return /*click_handler*/ ctx[5](/*indexMenu*/ ctx[9], /*indexLink*/ ctx[12]);
    	}

    	const block = {
    		c: function create() {
    			button = element("button");
    			attr_dev(button, "type", "button");
    			attr_dev(button, "class", "nav-button");
    			add_location(button, file$1, 70, 20, 2194);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, button, anchor);
    			button.innerHTML = raw_value;

    			if (!mounted) {
    				dispose = listen_dev(button, "click", click_handler, false, false, false);
    				mounted = true;
    			}
    		},
    		p: function update(new_ctx, dirty) {
    			ctx = new_ctx;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(button);
    			mounted = false;
    			dispose();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_each_block_1.name,
    		type: "each",
    		source: "(70:16) {#each oneMenu.links as oneLinks, indexLink}",
    		ctx
    	});

    	return block;
    }

    // (62:8) {#each menus as oneMenu, indexMenu}
    function create_each_block(ctx) {
    	let div;
    	let h5;
    	let svg;
    	let use;
    	let t0;
    	let t1_value = /*oneMenu*/ ctx[7].title + "";
    	let t1;
    	let t2;
    	let t3;
    	let each_value_1 = /*oneMenu*/ ctx[7].links;
    	validate_each_argument(each_value_1);
    	let each_blocks = [];

    	for (let i = 0; i < each_value_1.length; i += 1) {
    		each_blocks[i] = create_each_block_1(get_each_context_1(ctx, each_value_1, i));
    	}

    	const block = {
    		c: function create() {
    			div = element("div");
    			h5 = element("h5");
    			svg = svg_element("svg");
    			use = svg_element("use");
    			t0 = space();
    			t1 = text(t1_value);
    			t2 = space();

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].c();
    			}

    			t3 = space();
    			xlink_attr(use, "xlink:href", /*oneMenu*/ ctx[7].icon);
    			add_location(use, file$1, 65, 24, 1994);
    			attr_dev(svg, "class", "nav-icon");
    			add_location(svg, file$1, 64, 20, 1947);
    			attr_dev(h5, "class", "nav-category");
    			add_location(h5, file$1, 63, 16, 1901);
    			attr_dev(div, "class", "nav-item u-category-windows");
    			add_location(div, file$1, 62, 12, 1843);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);
    			append_dev(div, h5);
    			append_dev(h5, svg);
    			append_dev(svg, use);
    			append_dev(h5, t0);
    			append_dev(h5, t1);
    			append_dev(div, t2);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].m(div, null);
    			}

    			append_dev(div, t3);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*changeNavClick, menus*/ 6) {
    				each_value_1 = /*oneMenu*/ ctx[7].links;
    				validate_each_argument(each_value_1);
    				let i;

    				for (i = 0; i < each_value_1.length; i += 1) {
    					const child_ctx = get_each_context_1(ctx, each_value_1, i);

    					if (each_blocks[i]) {
    						each_blocks[i].p(child_ctx, dirty);
    					} else {
    						each_blocks[i] = create_each_block_1(child_ctx);
    						each_blocks[i].c();
    						each_blocks[i].m(div, t3);
    					}
    				}

    				for (; i < each_blocks.length; i += 1) {
    					each_blocks[i].d(1);
    				}

    				each_blocks.length = each_value_1.length;
    			}
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    			destroy_each(each_blocks, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_each_block.name,
    		type: "each",
    		source: "(62:8) {#each menus as oneMenu, indexMenu}",
    		ctx
    	});

    	return block;
    }

    function create_fragment$1(ctx) {
    	let nav;
    	let header;
    	let h1;
    	let strong;
    	let t1;
    	let img;
    	let img_src_value;
    	let t2;
    	let t3;
    	let footer;
    	let button0;
    	let t5;
    	let button1;
    	let t6;
    	let t7;
    	let mounted;
    	let dispose;
    	let if_block = /*menus*/ ctx[1].length > 0 && create_if_block(ctx);

    	const block = {
    		c: function create() {
    			nav = element("nav");
    			header = element("header");
    			h1 = element("h1");
    			strong = element("strong");
    			strong.textContent = "Auto-Form";
    			t1 = space();
    			img = element("img");
    			t2 = space();
    			if (if_block) if_block.c();
    			t3 = space();
    			footer = element("footer");
    			button0 = element("button");
    			button0.textContent = "About";
    			t5 = space();
    			button1 = element("button");
    			t6 = text("val : ");
    			t7 = text(/*value*/ ctx[0]);
    			add_location(strong, file$1, 53, 30, 1576);
    			attr_dev(h1, "class", "nav-title svelte-1vdqbk4");
    			add_location(h1, file$1, 53, 8, 1554);
    			attr_dev(img, "class", "nav-header-icon");
    			if (!src_url_equal(img.src, img_src_value = "../assets/auto_form.svg#icon-windows")) attr_dev(img, "src", img_src_value);
    			attr_dev(img, "alt", "logo");
    			add_location(img, file$1, 54, 8, 1616);
    			attr_dev(header, "class", "nav-header");
    			add_location(header, file$1, 52, 4, 1518);
    			attr_dev(button0, "type", "button");
    			attr_dev(button0, "class", "nav-footer-button");
    			add_location(button0, file$1, 85, 8, 2627);
    			attr_dev(button1, "type", "button");
    			attr_dev(button1, "class", "nav-footer-button");
    			add_location(button1, file$1, 86, 8, 2698);
    			attr_dev(footer, "class", "nav-footer");
    			add_location(footer, file$1, 84, 4, 2591);
    			attr_dev(nav, "class", "nav js-nav is-shown");
    			add_location(nav, file$1, 51, 0, 1480);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, nav, anchor);
    			append_dev(nav, header);
    			append_dev(header, h1);
    			append_dev(h1, strong);
    			append_dev(header, t1);
    			append_dev(header, img);
    			append_dev(nav, t2);
    			if (if_block) if_block.m(nav, null);
    			append_dev(nav, t3);
    			append_dev(nav, footer);
    			append_dev(footer, button0);
    			append_dev(footer, t5);
    			append_dev(footer, button1);
    			append_dev(button1, t6);
    			append_dev(button1, t7);

    			if (!mounted) {
    				dispose = listen_dev(button1, "click", /*click_handler_1*/ ctx[6], false, false, false);
    				mounted = true;
    			}
    		},
    		p: function update(ctx, [dirty]) {
    			if (/*menus*/ ctx[1].length > 0) if_block.p(ctx, dirty);
    			if (dirty & /*value*/ 1) set_data_dev(t7, /*value*/ ctx[0]);
    		},
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(nav);
    			if (if_block) if_block.d();
    			mounted = false;
    			dispose();
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
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('Navigation', slots, []);
    	let { changeNav = null } = $$props;

    	const menus = [
    		{
    			icon: "../assets/img/icons.svg",
    			title: "Papier",
    			links: [
    				{
    					title: "Create and manage <em>windows</em>",
    					link: "windows-windows"
    				},
    				{
    					title: "Handling window <em>crashes and hangs</em>",
    					link: "windows-crashHang"
    				}
    			]
    		},
    		{
    			icon: "../assets/img/icons.svg",
    			title: "Papier 2",
    			links: [
    				{
    					title: "Create and manage <em>windows</em>",
    					link: "windows-windows"
    				},
    				{
    					title: "Handling window <em>crashes and hangs</em>",
    					link: "windows-crashHang"
    				}
    			]
    		}
    	];

    	const changeNavClick = (indexMenu, indexLink) => {
    		const string = menus[indexMenu].links[indexLink].link;
    		changeNav(string);
    	};

    	console.log(menus);
    	let value = "";

    	const test = () => {
    		fetch("http://localhost:3000/api/method/openFileFolder", {
    			method: "POST",
    			headers: { "Content-type": "application/json" },
    			body: JSON.stringify({ toto: "lol" })
    		}).then(e => {
    			$$invalidate(0, value = "END");
    		});
    	};

    	const writable_props = ['changeNav'];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console_1$1.warn(`<Navigation> was created with unknown prop '${key}'`);
    	});

    	const click_handler = (indexMenu, indexLink) => {
    		changeNavClick(indexMenu, indexLink);
    	};

    	const click_handler_1 = () => {
    		test();
    	};

    	$$self.$$set = $$props => {
    		if ('changeNav' in $$props) $$invalidate(4, changeNav = $$props.changeNav);
    	};

    	$$self.$capture_state = () => ({
    		changeNav,
    		menus,
    		changeNavClick,
    		value,
    		test
    	});

    	$$self.$inject_state = $$props => {
    		if ('changeNav' in $$props) $$invalidate(4, changeNav = $$props.changeNav);
    		if ('value' in $$props) $$invalidate(0, value = $$props.value);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [value, menus, changeNavClick, test, changeNav, click_handler, click_handler_1];
    }

    class Navigation extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$1, create_fragment$1, safe_not_equal, { changeNav: 4 });

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Navigation",
    			options,
    			id: create_fragment$1.name
    		});
    	}

    	get changeNav() {
    		throw new Error("<Navigation>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set changeNav(value) {
    		throw new Error("<Navigation>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* src/App.svelte generated by Svelte v3.46.2 */

    const { console: console_1 } = globals;
    const file = "src/App.svelte";

    function create_fragment(ctx) {
    	let navigation;
    	let t;
    	let main;
    	let switch_instance;
    	let current;

    	navigation = new Navigation({
    			props: { changeNav: /*changeNav*/ ctx[1] },
    			$$inline: true
    		});

    	var switch_value = /*actualPage*/ ctx[0];

    	function switch_props(ctx) {
    		return { $$inline: true };
    	}

    	if (switch_value) {
    		switch_instance = new switch_value(switch_props());
    	}

    	const block = {
    		c: function create() {
    			create_component(navigation.$$.fragment);
    			t = space();
    			main = element("main");
    			if (switch_instance) create_component(switch_instance.$$.fragment);
    			attr_dev(main, "class", "content js-content is-shown");
    			add_location(main, file, 23, 0, 738);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			mount_component(navigation, target, anchor);
    			insert_dev(target, t, anchor);
    			insert_dev(target, main, anchor);

    			if (switch_instance) {
    				mount_component(switch_instance, main, null);
    			}

    			current = true;
    		},
    		p: function update(ctx, [dirty]) {
    			if (switch_value !== (switch_value = /*actualPage*/ ctx[0])) {
    				if (switch_instance) {
    					group_outros();
    					const old_component = switch_instance;

    					transition_out(old_component.$$.fragment, 1, 0, () => {
    						destroy_component(old_component, 1);
    					});

    					check_outros();
    				}

    				if (switch_value) {
    					switch_instance = new switch_value(switch_props());
    					create_component(switch_instance.$$.fragment);
    					transition_in(switch_instance.$$.fragment, 1);
    					mount_component(switch_instance, main, null);
    				} else {
    					switch_instance = null;
    				}
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(navigation.$$.fragment, local);
    			if (switch_instance) transition_in(switch_instance.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(navigation.$$.fragment, local);
    			if (switch_instance) transition_out(switch_instance.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(navigation, detaching);
    			if (detaching) detach_dev(t);
    			if (detaching) detach_dev(main);
    			if (switch_instance) destroy_component(switch_instance);
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
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('App', slots, []);
    	console.log(window);
    	let actualPage = sections.About;

    	const changeNav = newComponent => {
    		const [firstFolder, secondElement] = newComponent.split("-");

    		if (sections[firstFolder][secondElement]) {
    			$$invalidate(0, actualPage = sections[firstFolder][secondElement]);

    			setTimeout(
    				() => {
    					const el = document.getElementsByClassName("section");

    					if (el.length > 0) {
    						el[0].classList.add("is-shown");
    					}
    				},
    				200
    			);
    		} else {
    			$$invalidate(0, actualPage = sections.About);
    		}
    	};

    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console_1.warn(`<App> was created with unknown prop '${key}'`);
    	});

    	$$self.$capture_state = () => ({
    		sections,
    		Navigation,
    		actualPage,
    		changeNav
    	});

    	$$self.$inject_state = $$props => {
    		if ('actualPage' in $$props) $$invalidate(0, actualPage = $$props.actualPage);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [actualPage, changeNav];
    }

    class App extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance, create_fragment, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "App",
    			options,
    			id: create_fragment.name
    		});
    	}
    }

    const app = new App({
        target: document.body,
    });

    return app;

})();
//# sourceMappingURL=bundle.js.map
