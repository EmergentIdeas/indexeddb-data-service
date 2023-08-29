(function(){function r(e,n,t){function o(i,f){if(!n[i]){if(!e[i]){var c="function"==typeof require&&require;if(!f&&c)return c(i,!0);if(u)return u(i,!0);var a=new Error("Cannot find module '"+i+"'");throw a.code="MODULE_NOT_FOUND",a}var p=n[i]={exports:{}};e[i][0].call(p.exports,function(r){var n=e[i][1][r];return o(n||r)},p,p.exports,r,e,n,t)}return n[i].exports}for(var u="function"==typeof require&&require,i=0;i<t.length;i++)o(t[i]);return o}return r})()({1:[function(require,module,exports){
window.require = require

let tri = require('tripartite')


// load templates like
//require('../views/test1.tri')

// and use like:
/*
let d = document.createElement('div')
d.innerHTML = tri.getTemplate('views/test1')({
	key1: 'value'
	, key2: 'value'
})
document.body.append(d)
*/






},{"tripartite":4}],2:[function(require,module,exports){
// shim for using process in browser
var process = module.exports = {};

// cached from whatever global is present so that test runners that stub it
// don't break things.  But we need to wrap it in a try catch in case it is
// wrapped in strict mode code which doesn't define any globals.  It's inside a
// function because try/catches deoptimize in certain engines.

var cachedSetTimeout;
var cachedClearTimeout;

function defaultSetTimout() {
    throw new Error('setTimeout has not been defined');
}
function defaultClearTimeout () {
    throw new Error('clearTimeout has not been defined');
}
(function () {
    try {
        if (typeof setTimeout === 'function') {
            cachedSetTimeout = setTimeout;
        } else {
            cachedSetTimeout = defaultSetTimout;
        }
    } catch (e) {
        cachedSetTimeout = defaultSetTimout;
    }
    try {
        if (typeof clearTimeout === 'function') {
            cachedClearTimeout = clearTimeout;
        } else {
            cachedClearTimeout = defaultClearTimeout;
        }
    } catch (e) {
        cachedClearTimeout = defaultClearTimeout;
    }
} ())
function runTimeout(fun) {
    if (cachedSetTimeout === setTimeout) {
        //normal enviroments in sane situations
        return setTimeout(fun, 0);
    }
    // if setTimeout wasn't available but was latter defined
    if ((cachedSetTimeout === defaultSetTimout || !cachedSetTimeout) && setTimeout) {
        cachedSetTimeout = setTimeout;
        return setTimeout(fun, 0);
    }
    try {
        // when when somebody has screwed with setTimeout but no I.E. maddness
        return cachedSetTimeout(fun, 0);
    } catch(e){
        try {
            // When we are in I.E. but the script has been evaled so I.E. doesn't trust the global object when called normally
            return cachedSetTimeout.call(null, fun, 0);
        } catch(e){
            // same as above but when it's a version of I.E. that must have the global object for 'this', hopfully our context correct otherwise it will throw a global error
            return cachedSetTimeout.call(this, fun, 0);
        }
    }


}
function runClearTimeout(marker) {
    if (cachedClearTimeout === clearTimeout) {
        //normal enviroments in sane situations
        return clearTimeout(marker);
    }
    // if clearTimeout wasn't available but was latter defined
    if ((cachedClearTimeout === defaultClearTimeout || !cachedClearTimeout) && clearTimeout) {
        cachedClearTimeout = clearTimeout;
        return clearTimeout(marker);
    }
    try {
        // when when somebody has screwed with setTimeout but no I.E. maddness
        return cachedClearTimeout(marker);
    } catch (e){
        try {
            // When we are in I.E. but the script has been evaled so I.E. doesn't  trust the global object when called normally
            return cachedClearTimeout.call(null, marker);
        } catch (e){
            // same as above but when it's a version of I.E. that must have the global object for 'this', hopfully our context correct otherwise it will throw a global error.
            // Some versions of I.E. have different rules for clearTimeout vs setTimeout
            return cachedClearTimeout.call(this, marker);
        }
    }



}
var queue = [];
var draining = false;
var currentQueue;
var queueIndex = -1;

function cleanUpNextTick() {
    if (!draining || !currentQueue) {
        return;
    }
    draining = false;
    if (currentQueue.length) {
        queue = currentQueue.concat(queue);
    } else {
        queueIndex = -1;
    }
    if (queue.length) {
        drainQueue();
    }
}

function drainQueue() {
    if (draining) {
        return;
    }
    var timeout = runTimeout(cleanUpNextTick);
    draining = true;

    var len = queue.length;
    while(len) {
        currentQueue = queue;
        queue = [];
        while (++queueIndex < len) {
            if (currentQueue) {
                currentQueue[queueIndex].run();
            }
        }
        queueIndex = -1;
        len = queue.length;
    }
    currentQueue = null;
    draining = false;
    runClearTimeout(timeout);
}

process.nextTick = function (fun) {
    var args = new Array(arguments.length - 1);
    if (arguments.length > 1) {
        for (var i = 1; i < arguments.length; i++) {
            args[i - 1] = arguments[i];
        }
    }
    queue.push(new Item(fun, args));
    if (queue.length === 1 && !draining) {
        runTimeout(drainQueue);
    }
};

// v8 likes predictible objects
function Item(fun, array) {
    this.fun = fun;
    this.array = array;
}
Item.prototype.run = function () {
    this.fun.apply(null, this.array);
};
process.title = 'browser';
process.browser = true;
process.env = {};
process.argv = [];
process.version = ''; // empty string to avoid regexp issues
process.versions = {};

function noop() {}

process.on = noop;
process.addListener = noop;
process.once = noop;
process.off = noop;
process.removeListener = noop;
process.removeAllListeners = noop;
process.emit = noop;
process.prependListener = noop;
process.prependOnceListener = noop;

process.listeners = function (name) { return [] }

process.binding = function (name) {
    throw new Error('process.binding is not supported');
};

process.cwd = function () { return '/' };
process.chdir = function (dir) {
    throw new Error('process.chdir is not supported');
};
process.umask = function() { return 0; };

},{}],3:[function(require,module,exports){
var calculateRelativePath = function(parentPath, currentPath) {
	if(!parentPath) {
		return currentPath
	}
	if(!currentPath) {
		return currentPath
	}
	
	if(currentPath.indexOf('../') != 0 && currentPath.indexOf('./') != 0) {
		return currentPath
	}
	
	var pparts = parentPath.split('/')
	var cparts = currentPath.split('/')
	
	// trim any starting blank sections
	while(pparts.length && !pparts[0]) {
		pparts.shift()
	}
	while(cparts.length && !cparts[0]) {
		cparts.shift()
	}
	
	if(currentPath.indexOf('../') == 0 ) {
		while(cparts.length && cparts[0] == '..') {
			pparts.pop()
			cparts.shift()
		}
		pparts.pop()
		
		while(cparts.length) {
			pparts.push(cparts.shift())
		}
		return pparts.join('/')
	}
	if(currentPath.indexOf('./') == 0 ) {
		cparts.shift()
		pparts.pop()
		while(cparts.length) {
			pparts.push(cparts.shift())
		}
		return pparts.join('/')
	}
	
	return currentPath
}

module.exports = calculateRelativePath
},{}],4:[function(require,module,exports){
(function (process,global){(function (){

var calculateRelativePath = require('./calculate-relative-path')

if(typeof String.prototype.trim !== 'function') {
  String.prototype.trim = function() {
    return this.replace(/^\s+|\s+$/g, ''); 
  }
}

function cloneArray(ar) {
	var consumed = []
	for(var i = 0; i < ar.length; i++) {
		consumed.push(ar[i])
	}
	return consumed
}

var stackDepth = 0;
function callCallback(callback) {
	if(callback) {
		if(stackDepth < 10) {
			stackDepth++
			return callback()
		}
		else {
			stackDepth = 0;
			if(process && process.nextTick) {
				process.nextTick(callback)
			}
			else {
				setTimeout(callback)
			}
		}
	}
}

var Tripartite = function() {
	this.templates = {
		defaultTemplate: function(thedata) {
			return '' + thedata;
		}
	}
	
	this.templates.defaultTemplate.write = function(thedata, stream, callback) {
		stream.write('' + thedata)
		callCallback(callback)
	}
	
	this.constants = {
		templateBoundary: '__',
		templateNameBoundary: '##'
	}
	
	// This object (if set) will receive the template functions parsed from a script
	// I want to be able to call my templates as global functions, so I've set it
	// to be the window object
	this.secondaryTemplateFunctionObject = null
	
	this.loaders = []
	
	this.dataFunctions = {}
}

var t = Tripartite


t.prototype.addTemplate = function(name, template) {
	if(typeof template !== 'function') {
		template = this.pt(template);
	}
	if(!template.write) {
		var oldFun = template
		template = function(cc, globalData) {
			if(arguments.length > 1 && arguments[1] && arguments[1].write) {
				template.write.apply(this, arguments)
			}
			else {
				return oldFun(cc, globalData)
			}
		}
		template.write = function(cc, stream, callback) {
			stream.write(oldFun(cc))
			callCallback(callback)
		}
	}
	this.templates[name] = template;
	template.templateMeta = template.templateMeta || {}
	template.templateMeta.name = name
	return template;
};

t.prototype.createBlank = function() {
	return new Tripartite()
}

t.prototype.getTemplate = function(name) {
	return this.templates[name]
}

t.prototype.loadTemplate = function(name, callback) {
	if(name in this.templates) {
		callback(this.templates[name])
		
	}
	else {
		var tri = this
		var count = this.loaders.length
		var done = false
		var self = this
		for(var i = 0; i < this.loaders.length; i++) {
			this.loaders[i](name, function(template) {
				if(done) {
					return
				}
				count--
				if(template) {
					done = true
					tri.addTemplate(name, template)
					callback(tri.getTemplate(name))
				}
				else if(count == 0) {
					self.templates[name] = null
					callback(null)
				}
			})
		}
	}
}

t.prototype.parseTemplateScript = function(tx) {
	var tks = this.tts(tx);
	/* current template name */
	var ctn = null;
	for(var i = 0; i < tks.length; i++) {
		var token = tks[i];
		if(token.active) {
			ctn = token.content;
		}
		else {
			if(ctn) {
				var template = this.addTemplate(ctn, this.stw(token.content));
				if(this.secondaryTemplateFunctionObject) {
					this.secondaryTemplateFunctionObject[ctn] = template;
				}
				ctn = null;
			}
		}
	}
}

/* strip template whitespace */
t.prototype.stw = function(txt) {
	var i = txt.indexOf('\n');
	if(i > -1 && txt.substring(0, i).trim() == '') {
		txt = txt.substring(i + 1);
	}
	i = txt.lastIndexOf('\n');
	if(i > -1 && txt.substring(i).trim() == '') {
		txt = txt.substring(0, i);
	}
	return txt;
};

t.prototype.ActiveElement = function(/* the conditional */cd, data, hd, tripartite) {
	/* assign the conditional expression */
	this.ce = cd;
	/* assign the data selector expression */
	this.dse = data;
	
	this.tripartite = tripartite
	
	/* assign the hd expression */
	if(hd) {
		this.he = hd;
	}
	else {
		this.he = 'defaultTemplate';
	}
	
	/* evaluated data */
	this.ed = null;
};

var ae = t.prototype.ActiveElement;

/* SimpleTemplate */
t.prototype.st = function(/* conditional expression */ cd, data, /* handling expression */ hd, tripartite, templateMeta) {
	this.tripartite = tripartite
	var el = new ae(cd, data, hd, tripartite);
	el.templateMeta = templateMeta
	var f = function(cc, globalData) {
		if(arguments.length > 1 && arguments[1] && arguments[1].write) {
			el.write.apply(el, arguments)
		}
		else {
			return el.run(cc, globalData);
		}
	}
	f.templateMeta = templateMeta
	
	f.write = function(cc, stream, callback, globalData) {
		el.write(cc, stream, callback, globalData)
	}
	return f
};


ae.prototype.run = function(/* current context */cc, globalData) {
	/* run template */
	var rt = false;
	/* evaluated data */
	this.ed = this.edse(cc, globalData);
	if(this.ce) {
		rt = this.eic(cc, this.ce, globalData);
	}
	else {
		if(this.ed instanceof Array) {
			if(this.ed.length > 0) {
				rt = true;
			}
		}
		else {
			if(this.ed) {
				rt = true;
			}
			else if(!this.dse) {
				rt = true
				this.ed = cc
			}
		}
	}
	
	var at = this.he;
	if(at.charAt(0) == '$') {
		at = this.eic(cc, at.substring(1), globalData);
	}
	if(!at) {
		at = 'defaultTemplate';
	}
	
	// resolve relative template paths
	if(at.indexOf('./') == 0 || at.indexOf('../') == 0) {
		at = calculateRelativePath(this.templateMeta.name, at)
	}
	
	if(rt) {
		if(this.ed instanceof Array) {
			var r = '';
			for(var i = 0; i < this.ed.length; i++) {
				r += this.getTemplate(at)(this.ed[i], globalData || cc);
			}
			return r;
		}
		else {
			return this.getTemplate(at)(this.ed, globalData || cc);
		}
	}
	return '';
};

ae.prototype.write = function(/* current context */cc, stream, callback, globalData) {
	/* run template */
	var rt = false;
	/* evaluated data */
	this.ed = this.edse(cc, globalData);
	if(this.ce) {
		rt = this.eic(cc, this.ce, globalData);
	}
	else {
		if(this.ed instanceof Array) {
			if(this.ed.length > 0) {
				rt = true;
			}
		}
		else {
			if(this.ed) {
				rt = true;
			}
			else if(!this.dse) {
				rt = true
				this.ed = cc
			}
		}
	}
	
	var at = this.he;
	if(at.charAt(0) == '$') {
		at = this.eic(cc, at.substring(1), globalData);
	}
	if(!at) {
		at = 'defaultTemplate';
	}

	// resolve relative template paths
	if(at.indexOf('./') == 0 || at.indexOf('../') == 0) {
		at = calculateRelativePath(this.templateMeta.name, at)
	}
	
	
	var self = this
	
	
	if(rt) {
		this.tripartite.loadTemplate(at, function(template) {
			var consumed
			if(self.ed instanceof Array) {
				consumed = cloneArray(self.ed)
			}
			else {
				consumed = [self.ed]
			}
			
			var procConsumed = function() {
				if(template) {
					template.write(consumed.shift(), stream, function() {
						if(consumed.length > 0) {
							procConsumed()
						}
						else if(callback) {
							callCallback(callback)
						}
					}, globalData || cc)
				}
				else {
					if(callback) {
						var err = new Error('Cound not load template: ' + at)
						err.templateName = at
						err.type = 'missing template'
						callback(err)
					}
					else {
						console.error('Cound not load template: ' + at)
					}
				}
			}
			
			if(consumed.length > 0) {
				procConsumed()
			}
			else {
				callCallback(callback)
			}
		})
	}
	else {
		callCallback(callback)
	}
};

ae.prototype.getTemplate = function(name) {
	return this.tripartite.getTemplate(name)
}

/* evaluate data selector expression */
ae.prototype.edse = function(cc, globalData) {
	if(!this.dse) {
		return null;
	}
	if(this.dse === '$this') {
		return cc;
	}
	return this.eic(cc, this.dse, globalData);
};

/* evaluate in context */
ae.prototype.eic = function(cc, ex, globalData) {
	cc = cc || {};
	return this.eicwt.call(cc, cc, ex, this.tripartite.dataFunctions, globalData);
};

/* Evaluate in context having been called so that this === cc (current context */
ae.prototype.eicwt = function(cc, ex, dataFunctions, globalData) {
	dataFunctions = dataFunctions || {}
	globalData = globalData || cc || {}
	
	with ({
		'$globals': globalData 
	}) {
		with (dataFunctions) {
			with (cc) {
				try {
					return eval(ex);
				} catch(e) {
					return null;
				}
			}
		}
	}
};

/* parse template */
t.prototype.pt = function(tx) {
	var tks = this.tt(tx);
	var pt = [];
	var templateMeta = {}
	
	for(var i = 0; i < tks.length; i++) {
		var tk = tks[i];
		if(tk.active) {
			pt.push(this.tap(tk.content, templateMeta));
		}
		else {
			if(tk.content) {
				pt.push(tk.content);
			}
		}
	}
	
	var t = function(cc, globalData) {
		if(arguments.length > 1 && arguments[1] && arguments[1].write) {
			t.write.apply(t, arguments)
		}
		else {
			var r = '';
			for(var i = 0; i < pt.length; i++) {
				if(typeof pt[i] === 'string') {
					r += pt[i];
				}
				else {
					r += pt[i](cc, globalData);
				}
			}
			return r;
		}
	}
	
	t.templateMeta = templateMeta
	
	t.write = function(cc, stream, callback, globalData) {
		var consumed = cloneArray(pt)
		var lastError
		
		var procConsumed = function() {
			var unit = consumed.shift()
			if(typeof unit === 'string') {
				stream.write(unit)
				if(consumed.length > 0) {
					procConsumed()
				}
				else if(callback) {
					callCallback(callback)
				}
			}
			else {
				unit.write(cc, stream, function(err) {
					if(err && stream.continueOnTripartiteError) {
						lastError = err
					}
					
					if(err && callback && !stream.continueOnTripartiteError) {
						callback(err)
					}
					else if(consumed.length > 0) {
						procConsumed()
					}
					else if(callback) {
						if(lastError) {
							callback(lastError)
						}
						else {
							callCallback(callback)
						}
					}
				}, globalData)
			}
		}
		
		if(consumed.length > 0) {
			procConsumed()
		}
	}
	
	return t
};

/* tokenize active part */
t.prototype.tokenizeActivePart = function(tx, templateMeta) {
	var con = null;
	var dat = null;
	var han = null;
	
	/* condition index */
	var ci = tx.indexOf('??');
	if(ci > -1) {
		con = tx.substring(0, ci);
		ci += 2;
	}
	else {
		ci = 0;
	}
	
	/* handler index */
	var hi = tx.indexOf('::');
	if(hi > -1) {
		dat = tx.substring(ci, hi);
		han = tx.substring(hi + 2);
	}
	else {
		dat = tx.substring(ci);
	}
	return new this.st(con, dat, han, this, templateMeta);
}

t.prototype.tap = t.prototype.tokenizeActivePart

/* tokenize template */
t.prototype.tokenizeTemplate = function(tx) {
	return this.taib(tx, this.constants.templateBoundary);
}

t.prototype.tt = t.prototype.tokenizeTemplate

/** tokenize template script */
t.prototype.tts = function(tx) {
	return this.taib(tx, this.constants.templateNameBoundary);
}

/* tokenize active and inactive blocks */
t.prototype.taib = function(tx, /*Active Region Boundary */ bnd) {
	/* whole length */
	var l = tx.length;
	
	/* current position */
	var p = 0;
	
	/* are we in an active region */
	var act = false;
	
	var tks = [];
	
	while(p < l) {
		var i = tx.indexOf(bnd, p);
		if(i == -1) {
			i = l;
		}
		var tk = { active: act, content: tx.substring(p, i)};
		tks.push(tk);
		p = i + 2;
		act = !act;
	}
	
	return tks;
}

var tripartiteInstance = new Tripartite()

if(typeof window != 'undefined') {
	tripartiteInstance.secondaryTemplateFunctionObject = window
}

function addCallbackToPromise(promise, callback) {
    if(callback) {
        promise = promise.then((obj) => {
            callback(null, obj)
        }).catch((err) => {
            callback(err)
        })
    }

    return promise
}
          

if(module) {
	module.exports = tripartiteInstance
}
else {
	window.Tripartite = tripartiteInstance
}

if(global) {
	if(!global.Tripartite) {
		global.Tripartite = Tripartite
	}
	if(!global.tripartite) {
		global.tripartite = tripartiteInstance
	}
}


}).call(this)}).call(this,require('_process'),typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})

},{"./calculate-relative-path":3,"_process":2}]},{},[1])
//# sourceMappingURL=pages.js.map
