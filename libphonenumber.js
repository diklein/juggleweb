var COMPILED = false;
var goog = goog || {};
goog.global = this;
goog.DEBUG = true;
goog.LOCALE = "en";
goog.provide = function(a) {
    if (!COMPILED) {
        if (goog.isProvided_(a)) {
            throw Error('Namespace "' + a + '" already declared.')
        }
        delete goog.implicitNamespaces_[a];
        var b = a;
        while ((b = b.substring(0, b.lastIndexOf(".")))) {
            if (goog.getObjectByName(b)) {
                break
            }
            goog.implicitNamespaces_[b] = true
        }
    }
    goog.exportPath_(a)
};
goog.setTestOnly = function(a) {
    if (COMPILED&&!goog.DEBUG) {
        a = a || "";
        throw Error("Importing test-only code into non-debug environment" + a ? ": " + a : ".")
    }
};
if (!COMPILED) {
    goog.isProvided_ = function(a) {
        return !goog.implicitNamespaces_[a]&&!!goog.getObjectByName(a)
    };
    goog.implicitNamespaces_ = {}
}
goog.exportPath_ = function(c, a, f) {
    var d = c.split(".");
    var e = f || goog.global;
    if (!(d[0] in e) && e.execScript) {
        e.execScript("var " + d[0])
    }
    for (var b; d.length && (b = d.shift());) {
        if (!d.length && goog.isDef(a)) {
            e[b] = a
        } else {
            if (e[b]) {
                e = e[b]
            } else {
                e = e[b] = {}
            }
        }
    }
};
goog.getObjectByName = function(b, c) {
    var d = b.split(".");
    var e = c || goog.global;
    for (var a; a = d.shift();) {
        if (goog.isDefAndNotNull(e[a])) {
            e = e[a]
        } else {
            return null
        }
    }
    return e
};
goog.globalize = function(d, b) {
    var c = b || goog.global;
    for (var a in d) {
        c[a] = d[a]
    }
};
goog.addDependency = function(e, d, k) {
    if (!COMPILED) {
        var f, a;
        var h = e.replace(/\\/g, "/");
        var g = goog.dependencies_;
        for (var c = 0; f = d[c]; c++) {
            g.nameToPath[f] = h;
            if (!(h in g.pathToNames)) {
                g.pathToNames[h] = {}
            }
            g.pathToNames[h][f] = true
        }
        for (var b = 0; a = k[b]; b++) {
            if (!(h in g.requires)) {
                g.requires[h] = {}
            }
            g.requires[h][a] = true
        }
    }
};
goog.ENABLE_DEBUG_LOADER = true;
goog.require = function(b) {
    if (!COMPILED) {
        if (goog.isProvided_(b)) {
            return
        }
        if (goog.ENABLE_DEBUG_LOADER) {
            var c = goog.getPathFromDeps_(b);
            if (c) {
                goog.included_[c] = true;
                goog.writeScripts_();
                return
            }
        }
        var a = "goog.require could not find: " + b;
        if (goog.global.console) {
            goog.global.console.error(a)
        }
        throw Error(a)
    }
};
goog.basePath = "";
goog.global.CLOSURE_BASE_PATH;
goog.global.CLOSURE_NO_DEPS = true;
goog.global.CLOSURE_IMPORT_SCRIPT;
goog.nullFunction = function() {};
goog.identityFunction = function(a) {
    return arguments[0]
};
goog.abstractMethod = function() {
    throw Error("unimplemented abstract method")
};
goog.addSingletonGetter = function(a) {
    a.getInstance = function() {
        return a.instance_ || (a.instance_ = new a())
    }
};
if (!COMPILED && goog.ENABLE_DEBUG_LOADER) {
    goog.included_ = {};
    goog.dependencies_ = {
        pathToNames: {},
        nameToPath: {},
        requires: {},
        visited: {},
        written: {}
    };
    goog.inHtmlDocument_ = function() {
        var a = goog.global.document;
        return typeof a != "undefined" && "write" in a
    };
    goog.findBasePath_ = function() {
        if (goog.global.CLOSURE_BASE_PATH) {
            goog.basePath = goog.global.CLOSURE_BASE_PATH;
            return
        } else {
            if (!goog.inHtmlDocument_()) {
                return
            }
        }
        var e = goog.global.document;
        var a = e.getElementsByTagName("script");
        for (var c = a.length - 1; c >= 0; --c) {
            var f = a[c].src;
            var d = f.lastIndexOf("?");
            var b = d==-1 ? f.length: d;
            if (f.substr(b - 7, 7) == "base.js") {
                goog.basePath = f.substr(0, b - 7);
                return
            }
        }
    };
    goog.importScript_ = function(b) {
        var a = goog.global.CLOSURE_IMPORT_SCRIPT || goog.writeScriptTag_;
        if (!goog.dependencies_.written[b] && a(b)) {
            goog.dependencies_.written[b] = true
        }
    };
    goog.writeScriptTag_ = function(b) {
        if (goog.inHtmlDocument_()) {
            var a = goog.global.document;
            a.write('<script type="text/javascript" src="' + b + '"><\/script>');
            return true
        } else {
            return false
        }
    };
    goog.writeScripts_ = function() {
        var a = [];
        var b = {};
        var f = goog.dependencies_;
        function e(g) {
            if (g in f.written) {
                return
            }
            if (g in f.visited) {
                if (!(g in b)) {
                    b[g] = true;
                    a.push(g)
                }
                return
            }
            f.visited[g] = true;
            if (g in f.requires) {
                for (var h in f.requires[g]) {
                    if (!goog.isProvided_(h)) {
                        if (h in f.nameToPath) {
                            e(f.nameToPath[h])
                        } else {
                            throw Error("Undefined nameToPath for " + h)
                        }
                    }
                }
            }
            if (!(g in b)) {
                b[g] = true;
                a.push(g)
            }
        }
        for (var d in goog.included_) {
            if (!f.written[d]) {
                e(d)
            }
        }
        for (var c = 0; c < a.length; c++) {
            if (a[c]) {
                goog.importScript_(goog.basePath + a[c])
            } else {
                throw Error("Undefined script input")
            }
        }
    };
    goog.getPathFromDeps_ = function(a) {
        if (a in goog.dependencies_.nameToPath) {
            return goog.dependencies_.nameToPath[a]
        } else {
            return null
        }
    };
    goog.findBasePath_();
    if (!goog.global.CLOSURE_NO_DEPS) {
        goog.importScript_(goog.basePath + "deps.js")
    }
}
goog.typeOf = function(c) {
    var b = typeof c;
    if (b == "object") {
        if (c) {
            if (c instanceof Array) {
                return "array"
            } else {
                if (c instanceof Object) {
                    return b
                }
            }
            var a = Object.prototype.toString.call((c));
            if (a == "[object Window]") {
                return "object"
            }
            if ((a == "[object Array]" || typeof c.length == "number" && typeof c.splice != "undefined" && typeof c.propertyIsEnumerable != "undefined"&&!c.propertyIsEnumerable("splice"))) {
                return "array"
            }
            if ((a == "[object Function]" || typeof c.call != "undefined" && typeof c.propertyIsEnumerable != "undefined"&&!c.propertyIsEnumerable("call"))) {
                return "function"
            }
        } else {
            return "null"
        }
    } else {
        if (b == "function" && typeof c.call == "undefined") {
            return "object"
        }
    }
    return b
};
goog.propertyIsEnumerableCustom_ = function(a, c) {
    if (c in a) {
        for (var b in a) {
            if (b == c && Object.prototype.hasOwnProperty.call(a, c)) {
                return true
            }
        }
    }
    return false
};
goog.propertyIsEnumerable_ = function(a, b) {
    if (a instanceof Object) {
        return Object.prototype.propertyIsEnumerable.call(a, b)
    } else {
        return goog.propertyIsEnumerableCustom_(a, b)
    }
};
goog.isDef = function(a) {
    return a !== undefined
};
goog.isNull = function(a) {
    return a === null
};
goog.isDefAndNotNull = function(a) {
    return a != null
};
goog.isArray = function(a) {
    return goog.typeOf(a) == "array"
};
goog.isArrayLike = function(b) {
    var a = goog.typeOf(b);
    return a == "array" || a == "object" && typeof b.length == "number"
};
goog.isDateLike = function(a) {
    return goog.isObject(a) && typeof a.getFullYear == "function"
};
goog.isString = function(a) {
    return typeof a == "string"
};
goog.isBoolean = function(a) {
    return typeof a == "boolean"
};
goog.isNumber = function(a) {
    return typeof a == "number"
};
goog.isFunction = function(a) {
    return goog.typeOf(a) == "function"
};
goog.isObject = function(b) {
    var a = goog.typeOf(b);
    return a == "object" || a == "array" || a == "function"
};
goog.getUid = function(a) {
    return a[goog.UID_PROPERTY_] || (a[goog.UID_PROPERTY_]=++goog.uidCounter_)
};
goog.removeUid = function(b) {
    if ("removeAttribute" in b) {
        b.removeAttribute(goog.UID_PROPERTY_)
    }
    try {
        delete b[goog.UID_PROPERTY_]
    } catch (a) {}
};
goog.UID_PROPERTY_ = "closure_uid_" + Math.floor(Math.random() * 2147483648).toString(36);
goog.uidCounter_ = 0;
goog.getHashCode = goog.getUid;
goog.removeHashCode = goog.removeUid;
goog.cloneObject = function(c) {
    var b = goog.typeOf(c);
    if (b == "object" || b == "array") {
        if (c.clone) {
            return c.clone()
        }
        var d = b == "array" ? []: {};
        for (var a in c) {
            d[a] = goog.cloneObject(c[a])
        }
        return d
    }
    return c
};
Object.prototype.clone;
goog.bindNative_ = function(a, c, b) {
    return (a.call.apply(a.bind, arguments))
};
goog.bindJs_ = function(b, e, c) {
    var a = e || goog.global;
    if (arguments.length > 2) {
        var d = Array.prototype.slice.call(arguments, 2);
        return function() {
            var f = Array.prototype.slice.call(arguments);
            Array.prototype.unshift.apply(f, d);
            return b.apply(a, f)
        }
    } else {
        return function() {
            return b.apply(a, arguments)
        }
    }
};
goog.bind = function(a, c, b) {
    if (Function.prototype.bind && Function.prototype.bind.toString().indexOf("native code")!=-1) {
        goog.bind = goog.bindNative_
    } else {
        goog.bind = goog.bindJs_
    }
    return goog.bind.apply(null, arguments)
};
goog.partial = function(b, c) {
    var a = Array.prototype.slice.call(arguments, 1);
    return function() {
        var d = Array.prototype.slice.call(arguments);
        d.unshift.apply(d, a);
        return b.apply(this, d)
    }
};
goog.mixin = function(c, b) {
    for (var a in b) {
        c[a] = b[a]
    }
};
goog.now = Date.now || (function() {
    return + new Date()
});
goog.globalEval = function(script) {
    if (goog.global.execScript) {
        goog.global.execScript(script, "JavaScript")
    } else {
        if (goog.global.eval) {
            if (goog.evalWorksForGlobals_ == null) {
                goog.global.eval("var _et_ = 1;");
                if (typeof goog.global._et_ != "undefined") {
                    delete goog.global._et_;
                    goog.evalWorksForGlobals_ = true
                } else {
                    goog.evalWorksForGlobals_ = false
                }
            }
            if (goog.evalWorksForGlobals_) {
                goog.global.eval(script)
            } else {
                var doc = goog.global.document;
                var scriptElt = doc.createElement("script");
                scriptElt.type = "text/javascript";
                scriptElt.defer = false;
                scriptElt.appendChild(doc.createTextNode(script));
                doc.body.appendChild(scriptElt);
                doc.body.removeChild(scriptElt)
            }
        } else {
            throw Error("goog.globalEval not available")
        }
    }
};
goog.evalWorksForGlobals_ = null;
goog.cssNameMapping_;
goog.cssNameMappingStyle_;
goog.getCssName = function(e, c) {
    var d = function(f) {
        return goog.cssNameMapping_[f] || f
    };
    var b = function(j) {
        var h = j.split("-");
        var f = [];
        for (var g = 0; g < h.length; g++) {
            f.push(d(h[g]))
        }
        return f.join("-")
    };
    var a;
    if (goog.cssNameMapping_) {
        a = goog.cssNameMappingStyle_ == "BY_WHOLE" ? d : b
    } else {
        a = function(f) {
            return f
        }
    }
    if (c) {
        return e + "-" + a(c)
    } else {
        return a(e)
    }
};
goog.setCssNameMapping = function(a, b) {
    goog.cssNameMapping_ = a;
    goog.cssNameMappingStyle_ = b
};
goog.getMsg = function(d, e) {
    var a = e || {};
    for (var b in a) {
        var c = ("" + a[b]).replace(/\$/g, "$$$$");
        d = d.replace(new RegExp("\\{\\$" + b + "\\}", "gi"), c)
    }
    return d
};
goog.exportSymbol = function(b, a, c) {
    goog.exportPath_(b, a, c)
};
goog.exportProperty = function(b, a, c) {
    b[a] = c
};
goog.inherits = function(b, a) {
    function c() {}
    c.prototype = a.prototype;
    b.superClass_ = a.prototype;
    b.prototype = new c();
    b.prototype.constructor = b
};
goog.base = function(e, a, g) {
    var c = arguments.callee.caller;
    if (c.superClass_) {
        return c.superClass_.constructor.apply(e, Array.prototype.slice.call(arguments, 1))
    }
    var b = Array.prototype.slice.call(arguments, 2);
    var f = false;
    for (var d = e.constructor; d; d = d.superClass_ && d.superClass_.constructor) {
        if (d.prototype[a] === c) {
            f = true
        } else {
            if (f) {
                return d.prototype[a].apply(e, b)
            }
        }
    }
    if (e[a] === c) {
        return e.constructor.prototype[a].apply(e, b)
    } else {
        throw Error("goog.base called from a method of one name to a method of a different name")
    }
};
goog.scope = function(a) {
    a.call(goog.global)
};
goog.provide("goog.object");
goog.object.forEach = function(d, c, b) {
    for (var a in d) {
        c.call(b, d[a], a, d)
    }
};
goog.object.filter = function(e, d, c) {
    var b = {};
    for (var a in e) {
        if (d.call(c, e[a], a, e)) {
            b[a] = e[a]
        }
    }
    return b
};
goog.object.map = function(e, d, c) {
    var b = {};
    for (var a in e) {
        b[a] = d.call(c, e[a], a, e)
    }
    return b
};
goog.object.some = function(d, c, b) {
    for (var a in d) {
        if (c.call(b, d[a], a, d)) {
            return true
        }
    }
    return false
};
goog.object.every = function(d, c, b) {
    for (var a in d) {
        if (!c.call(b, d[a], a, d)) {
            return false
        }
    }
    return true
};
goog.object.getCount = function(b) {
    var c = 0;
    for (var a in b) {
        c++
    }
    return c
};
goog.object.getAnyKey = function(b) {
    for (var a in b) {
        return a
    }
};
goog.object.getAnyValue = function(b) {
    for (var a in b) {
        return b[a]
    }
};
goog.object.contains = function(a, b) {
    return goog.object.containsValue(a, b)
};
goog.object.getValues = function(d) {
    var c = [];
    var b = 0;
    for (var a in d) {
        c[b++] = d[a]
    }
    return c
};
goog.object.getKeys = function(d) {
    var c = [];
    var b = 0;
    for (var a in d) {
        c[b++] = a
    }
    return c
};
goog.object.getValueByKeys = function(d, e) {
    var a = goog.isArrayLike(e);
    var c = a ? e: arguments;
    for (var b = a ? 0 : 1; b < c.length; b++) {
        d = d[c[b]];
        if (!goog.isDef(d)) {
            break
        }
    }
    return d
};
goog.object.containsKey = function(b, a) {
    return a in b
};
goog.object.containsValue = function(b, c) {
    for (var a in b) {
        if (b[a] == c) {
            return true
        }
    }
    return false
};
goog.object.findKey = function(d, c, b) {
    for (var a in d) {
        if (c.call(b, d[a], a, d)) {
            return a
        }
    }
    return undefined
};
goog.object.findValue = function(d, c, b) {
    var a = goog.object.findKey(d, c, b);
    return a && d[a]
};
goog.object.isEmpty = function(b) {
    for (var a in b) {
        return false
    }
    return true
};
goog.object.clear = function(b) {
    for (var a in b) {
        delete b[a]
    }
};
goog.object.remove = function(b, a) {
    var c;
    if ((c = a in b)) {
        delete b[a]
    }
    return c
};
goog.object.add = function(b, a, c) {
    if (a in b) {
        throw Error('The object already contains the key "' + a + '"')
    }
    goog.object.set(b, a, c)
};
goog.object.get = function(c, a, b) {
    if (a in c) {
        return c[a]
    }
    return b
};
goog.object.set = function(c, a, b) {
    c[a] = b
};
goog.object.setIfUndefined = function(c, a, b) {
    return a in c ? c[a] : (c[a] = b)
};
goog.object.clone = function(c) {
    var b = {};
    for (var a in c) {
        b[a] = c[a]
    }
    return b
};
goog.object.unsafeClone = function(c) {
    var b = goog.typeOf(c);
    if (b == "object" || b == "array") {
        if (c.clone) {
            return c.clone()
        }
        var d = b == "array" ? []: {};
        for (var a in c) {
            d[a] = goog.object.unsafeClone(c[a])
        }
        return d
    }
    return c
};
goog.object.transpose = function(c) {
    var b = {};
    for (var a in c) {
        b[c[a]] = a
    }
    return b
};
goog.object.PROTOTYPE_FIELDS_ = ["constructor", "hasOwnProperty", "isPrototypeOf", "propertyIsEnumerable", "toLocaleString", "toString", "valueOf"];
goog.object.extend = function(e, f) {
    var c, d;
    for (var b = 1; b < arguments.length; b++) {
        d = arguments[b];
        for (c in d) {
            e[c] = d[c]
        }
        for (var a = 0; a < goog.object.PROTOTYPE_FIELDS_.length; a++) {
            c = goog.object.PROTOTYPE_FIELDS_[a];
            if (Object.prototype.hasOwnProperty.call(d, c)) {
                e[c] = d[c]
            }
        }
    }
};
goog.object.create = function(b) {
    var d = arguments.length;
    if (d == 1 && goog.isArray(arguments[0])) {
        return goog.object.create.apply(null, arguments[0])
    }
    if (d%2) {
        throw Error("Uneven number of arguments")
    }
    var c = {};
    for (var a = 0; a < d; a += 2) {
        c[arguments[a]] = arguments[a + 1]
    }
    return c
};
goog.object.createSet = function(b) {
    var d = arguments.length;
    if (d == 1 && goog.isArray(arguments[0])) {
        return goog.object.createSet.apply(null, arguments[0])
    }
    var c = {};
    for (var a = 0; a < d; a++) {
        c[arguments[a]] = true
    }
    return c
};
goog.provide("goog.string");
goog.provide("goog.string.Unicode");
goog.string.Unicode = {
    NBSP: "\xa0"
};
goog.string.startsWith = function(b, a) {
    return b.lastIndexOf(a, 0) == 0
};
goog.string.endsWith = function(c, b) {
    var a = c.length - b.length;
    return a >= 0 && c.indexOf(b, a) == a
};
goog.string.caseInsensitiveStartsWith = function(b, a) {
    return goog.string.caseInsensitiveCompare(a, b.substr(0, a.length)) == 0
};
goog.string.caseInsensitiveEndsWith = function(b, a) {
    return goog.string.caseInsensitiveCompare(a, b.substr(b.length - a.length, a.length)) == 0
};
goog.string.subs = function(d, c) {
    for (var a = 1; a < arguments.length; a++) {
        var b = String(arguments[a]).replace(/\$/g, "$$$$");
        d = d.replace(/\%s/, b)
    }
    return d
};
goog.string.collapseWhitespace = function(a) {
    return a.replace(/[\s\xa0]+/g, " ").replace(/^\s+|\s+$/g, "")
};
goog.string.isEmpty = function(a) {
    return /^[\s\xa0]*$/.test(a)
};
goog.string.isEmptySafe = function(a) {
    return goog.string.isEmpty(goog.string.makeSafe(a))
};
goog.string.isBreakingWhitespace = function(a) {
    return !/[^\t\n\r ]/.test(a)
};
goog.string.isAlpha = function(a) {
    return !/[^a-zA-Z]/.test(a)
};
goog.string.isNumeric = function(a) {
    return !/[^0-9]/.test(a)
};
goog.string.isAlphaNumeric = function(a) {
    return !/[^a-zA-Z0-9]/.test(a)
};
goog.string.isSpace = function(a) {
    return a == " "
};
goog.string.isUnicodeChar = function(a) {
    return a.length == 1 && a >= " " && a <= "~" || a >= "\u0080" && a <= "\uFFFD"
};
goog.string.stripNewlines = function(a) {
    return a.replace(/(\r\n|\r|\n)+/g, " ")
};
goog.string.canonicalizeNewlines = function(a) {
    return a.replace(/(\r\n|\r|\n)/g, "\n")
};
goog.string.normalizeWhitespace = function(a) {
    return a.replace(/\xa0|\s/g, " ")
};
goog.string.normalizeSpaces = function(a) {
    return a.replace(/\xa0|[ \t]+/g, " ")
};
goog.string.collapseBreakingSpaces = function(a) {
    return a.replace(/[\t\r\n ]+/g, " ").replace(/^[\t\r\n ]+|[\t\r\n ]+$/g, "")
};
goog.string.trim = function(a) {
    return a.replace(/^[\s\xa0]+|[\s\xa0]+$/g, "")
};
goog.string.trimLeft = function(a) {
    return a.replace(/^[\s\xa0]+/, "")
};
goog.string.trimRight = function(a) {
    return a.replace(/[\s\xa0]+$/, "")
};
goog.string.caseInsensitiveCompare = function(d, c) {
    var b = String(d).toLowerCase();
    var a = String(c).toLowerCase();
    if (b < a) {
        return - 1
    } else {
        if (b == a) {
            return 0
        } else {
            return 1
        }
    }
};
goog.string.numerateCompareRegExp_ = /(\.\d+)|(\d+)|(\D+)/g;
goog.string.numerateCompare = function(f, e) {
    if (f == e) {
        return 0
    }
    if (!f) {
        return - 1
    }
    if (!e) {
        return 1
    }
    var d = f.toLowerCase().match(goog.string.numerateCompareRegExp_);
    var c = e.toLowerCase().match(goog.string.numerateCompareRegExp_);
    var h = Math.min(d.length, c.length);
    for (var g = 0; g < h; g++) {
        var m = d[g];
        var l = c[g];
        if (m != l) {
            var k = parseInt(m, 10);
            if (!isNaN(k)) {
                var j = parseInt(l, 10);
                if (!isNaN(j) && k - j) {
                    return k - j
                }
            }
            return m < l?-1 : 1
        }
    }
    if (d.length != c.length) {
        return d.length - c.length
    }
    return f < e?-1 : 1
};
goog.string.encodeUriRegExp_ = /^[a-zA-Z0-9\-_.!~*'()]*$/;
goog.string.urlEncode = function(a) {
    a = String(a);
    if (!goog.string.encodeUriRegExp_.test(a)) {
        return encodeURIComponent(a)
    }
    return a
};
goog.string.urlDecode = function(a) {
    return decodeURIComponent(a.replace(/\+/g, " "))
};
goog.string.newLineToBr = function(b, a) {
    return b.replace(/(\r\n|\r|\n)/g, a ? "<br />" : "<br>")
};
goog.string.htmlEscape = function(b, a) {
    if (a) {
        return b.replace(goog.string.amperRe_, "&amp;").replace(goog.string.ltRe_, "&lt;").replace(goog.string.gtRe_, "&gt;").replace(goog.string.quotRe_, "&quot;")
    } else {
        if (!goog.string.allRe_.test(b)) {
            return b
        }
        if (b.indexOf("&")!=-1) {
            b = b.replace(goog.string.amperRe_, "&amp;")
        }
        if (b.indexOf("<")!=-1) {
            b = b.replace(goog.string.ltRe_, "&lt;")
        }
        if (b.indexOf(">")!=-1) {
            b = b.replace(goog.string.gtRe_, "&gt;")
        }
        if (b.indexOf('"')!=-1) {
            b = b.replace(goog.string.quotRe_, "&quot;")
        }
        return b
    }
};
goog.string.amperRe_ = /&/g;
goog.string.ltRe_ = /</g;
goog.string.gtRe_ = />/g;
goog.string.quotRe_ = /\"/g;
goog.string.allRe_ = /[&<>\"]/;
goog.string.unescapeEntities = function(a) {
    if (goog.string.contains(a, "&")) {
        if ("document" in goog.global) {
            return goog.string.unescapeEntitiesUsingDom_(a)
        } else {
            return goog.string.unescapePureXmlEntities_(a)
        }
    }
    return a
};
goog.string.unescapeEntitiesUsingDom_ = function(b) {
    var a = {
        "&amp;": "&",
        "&lt;": "<",
        "&gt;": ">",
        "&quot;": '"'
    };
    var c = document.createElement("div");
    return b.replace(goog.string.HTML_ENTITY_PATTERN_, function(e, d) {
        var f = a[e];
        if (f) {
            return f
        }
        if (d.charAt(0) == "#") {
            var g = Number("0" + d.substr(1));
            if (!isNaN(g)) {
                f = String.fromCharCode(g)
            }
        }
        if (!f) {
            c.innerHTML = e + " ";
            f = c.firstChild.nodeValue.slice(0, - 1)
        }
        return a[e] = f
    })
};
goog.string.unescapePureXmlEntities_ = function(a) {
    return a.replace(/&([^;]+);/g, function(c, b) {
        switch (b) {
        case"amp":
            return "&";
        case"lt":
            return "<";
        case"gt":
            return ">";
        case"quot":
            return '"';
        default:
            if (b.charAt(0) == "#") {
                var d = Number("0" + b.substr(1));
                if (!isNaN(d)) {
                    return String.fromCharCode(d)
                }
            }
            return c
        }
    })
};
goog.string.HTML_ENTITY_PATTERN_ = /&([^;\s<&]+);?/g;
goog.string.whitespaceEscape = function(b, a) {
    return goog.string.newLineToBr(b.replace(/  /g, " &#160;"), a)
};
goog.string.stripQuotes = function(e, a) {
    var d = a.length;
    for (var c = 0; c < d; c++) {
        var b = d == 1 ? a: a.charAt(c);
        if (e.charAt(0) == b && e.charAt(e.length - 1) == b) {
            return e.substring(1, e.length - 1)
        }
    }
    return e
};
goog.string.truncate = function(c, b, a) {
    if (a) {
        c = goog.string.unescapeEntities(c)
    }
    if (c.length > b) {
        c = c.substring(0, b - 3) + "..."
    }
    if (a) {
        c = goog.string.htmlEscape(c)
    }
    return c
};
goog.string.truncateMiddle = function(h, f, e, a) {
    if (e) {
        h = goog.string.unescapeEntities(h)
    }
    if (a && h.length > f) {
        if (a > f) {
            a = f
        }
        var c = h.length - a;
        var d = f - a;
        h = h.substring(0, d) + "..." + h.substring(c)
    } else {
        if (h.length > f) {
            var g = Math.floor(f / 2);
            var b = h.length - g;
            g += f%2;
            h = h.substring(0, g) + "..." + h.substring(b)
        }
    }
    if (e) {
        h = goog.string.htmlEscape(h)
    }
    return h
};
goog.string.specialEscapeChars_ = {
    "\0": "\\0",
    "\b": "\\b",
    "\f": "\\f",
    "\n": "\\n",
    "\r": "\\r",
    "\t": "\\t",
    "\x0B": "\\x0B",
    '"': '\\"',
    "\\": "\\\\"
};
goog.string.jsEscapeCache_ = {
    "'": "\\'"
};
goog.string.quote = function(c) {
    c = String(c);
    if (c.quote) {
        return c.quote()
    } else {
        var e = ['"'];
        for (var a = 0; a < c.length; a++) {
            var b = c.charAt(a);
            var d = b.charCodeAt(0);
            e[a + 1] = goog.string.specialEscapeChars_[b] || ((d > 31 && d < 127) ? b : goog.string.escapeChar(b))
        }
        e.push('"');
        return e.join("")
    }
};
goog.string.escapeString = function(b) {
    var c = [];
    for (var a = 0; a < b.length; a++) {
        c[a] = goog.string.escapeChar(b.charAt(a))
    }
    return c.join("")
};
goog.string.escapeChar = function(d) {
    if (d in goog.string.jsEscapeCache_) {
        return goog.string.jsEscapeCache_[d]
    }
    if (d in goog.string.specialEscapeChars_) {
        return goog.string.jsEscapeCache_[d] = goog.string.specialEscapeChars_[d]
    }
    var b = d;
    var a = d.charCodeAt(0);
    if (a > 31 && a < 127) {
        b = d
    } else {
        if (a < 256) {
            b = "\\x";
            if (a < 16 || a > 256) {
                b += "0"
            }
        } else {
            b = "\\u";
            if (a < 4096) {
                b += "0"
            }
        }
        b += a.toString(16).toUpperCase()
    }
    return goog.string.jsEscapeCache_[d] = b
};
goog.string.toMap = function(b) {
    var c = {};
    for (var a = 0; a < b.length; a++) {
        c[b.charAt(a)] = true
    }
    return c
};
goog.string.contains = function(b, a) {
    return b.indexOf(a)!=-1
};
goog.string.removeAt = function(d, b, a) {
    var c = d;
    if (b >= 0 && b < d.length && a > 0) {
        c = d.substr(0, b) + d.substr(b + a, d.length - b - a)
    }
    return c
};
goog.string.remove = function(c, a) {
    var b = new RegExp(goog.string.regExpEscape(a), "");
    return c.replace(b, "")
};
goog.string.removeAll = function(c, a) {
    var b = new RegExp(goog.string.regExpEscape(a), "g");
    return c.replace(b, "")
};
goog.string.regExpEscape = function(a) {
    return String(a).replace(/([-()\[\]{}+?*.$\^|,:#<!\\])/g, "\\$1").replace(/\x08/g, "\\x08")
};
goog.string.repeat = function(a, b) {
    return new Array(b + 1).join(a)
};
goog.string.padNumber = function(c, e, a) {
    var d = goog.isDef(a) ? c.toFixed(a): String(c);
    var b = d.indexOf(".");
    if (b==-1) {
        b = d.length
    }
    return goog.string.repeat("0", Math.max(0, e - b)) + d
};
goog.string.makeSafe = function(a) {
    return a == null ? "" : String(a)
};
goog.string.buildString = function(a) {
    return Array.prototype.join.call(arguments, "")
};
goog.string.getRandomString = function() {
    var a = 2147483648;
    return Math.floor(Math.random() * a).toString(36) + Math.abs(Math.floor(Math.random() * a)^goog.now()).toString(36)
};
goog.string.compareVersions = function(b, o) {
    var c = 0;
    var j = goog.string.trim(String(b)).split(".");
    var i = goog.string.trim(String(o)).split(".");
    var f = Math.max(j.length, i.length);
    for (var g = 0; c == 0 && g < f; g++) {
        var a = j[g] || "";
        var n = i[g] || "";
        var k = new RegExp("(\\d*)(\\D*)", "g");
        var e = new RegExp("(\\d*)(\\D*)", "g");
        do {
            var m = k.exec(a) || ["", "", ""];
            var l = e.exec(n) || ["", "", ""];
            if (m[0].length == 0 && l[0].length == 0) {
                break
            }
            var h = m[1].length == 0 ? 0: parseInt(m[1], 10);
            var d = l[1].length == 0 ? 0: parseInt(l[1], 10);
            c = goog.string.compareElements_(h, d) || goog.string.compareElements_(m[2].length == 0, l[2].length == 0) || goog.string.compareElements_(m[2], l[2])
        }
        while (c == 0)
        }
    return c
};
goog.string.compareElements_ = function(b, a) {
    if (b < a) {
        return - 1
    } else {
        if (b > a) {
            return 1
        }
    }
    return 0
};
goog.string.HASHCODE_MAX_ = 4294967296;
goog.string.hashCode = function(c) {
    var a = 0;
    for (var b = 0; b < c.length; ++b) {
        a = 31 * a + c.charCodeAt(b);
        a%=goog.string.HASHCODE_MAX_
    }
    return a
};
goog.string.uniqueStringCounter_ = Math.random() * 2147483648 | 0;
goog.string.createUniqueString = function() {
    return "goog_" + goog.string.uniqueStringCounter_++
};
goog.string.toNumber = function(b) {
    var a = Number(b);
    if (a == 0 && goog.string.isEmpty(b)) {
        return NaN
    }
    return a
};
goog.string.toCamelCaseCache_ = {};
goog.string.toCamelCase = function(a) {
    return goog.string.toCamelCaseCache_[a] || (goog.string.toCamelCaseCache_[a] = String(a).replace(/\-([a-z])/g, function(c, b) {
        return b.toUpperCase()
    }))
};
goog.string.toSelectorCaseCache_ = {};
goog.string.toSelectorCase = function(a) {
    return goog.string.toSelectorCaseCache_[a] || (goog.string.toSelectorCaseCache_[a] = String(a).replace(/([A-Z])/g, "-$1").toLowerCase())
};
goog.provide("goog.userAgent");
goog.require("goog.string");
goog.userAgent.ASSUME_IE = false;
goog.userAgent.ASSUME_GECKO = false;
goog.userAgent.ASSUME_WEBKIT = false;
goog.userAgent.ASSUME_MOBILE_WEBKIT = false;
goog.userAgent.ASSUME_OPERA = false;
goog.userAgent.BROWSER_KNOWN_ = goog.userAgent.ASSUME_IE || goog.userAgent.ASSUME_GECKO || goog.userAgent.ASSUME_MOBILE_WEBKIT || goog.userAgent.ASSUME_WEBKIT || goog.userAgent.ASSUME_OPERA;
goog.userAgent.getUserAgentString = function() {
    return goog.global.navigator ? goog.global.navigator.userAgent : null
};
goog.userAgent.getNavigator = function() {
    return goog.global.navigator
};
goog.userAgent.init_ = function() {
    goog.userAgent.detectedOpera_ = false;
    goog.userAgent.detectedIe_ = false;
    goog.userAgent.detectedWebkit_ = false;
    goog.userAgent.detectedMobile_ = false;
    goog.userAgent.detectedGecko_ = false;
    var b;
    if (!goog.userAgent.BROWSER_KNOWN_ && (b = goog.userAgent.getUserAgentString())) {
        var a = goog.userAgent.getNavigator();
        goog.userAgent.detectedOpera_ = b.indexOf("Opera") == 0;
        goog.userAgent.detectedIe_=!goog.userAgent.detectedOpera_ && b.indexOf("MSIE")!=-1;
        goog.userAgent.detectedWebkit_=!goog.userAgent.detectedOpera_ && b.indexOf("WebKit")!=-1;
        goog.userAgent.detectedMobile_ = goog.userAgent.detectedWebkit_ && b.indexOf("Mobile")!=-1;
        goog.userAgent.detectedGecko_=!goog.userAgent.detectedOpera_&&!goog.userAgent.detectedWebkit_ && a.product == "Gecko"
    }
};
if (!goog.userAgent.BROWSER_KNOWN_) {
    goog.userAgent.init_()
}
goog.userAgent.OPERA = goog.userAgent.BROWSER_KNOWN_ ? goog.userAgent.ASSUME_OPERA : goog.userAgent.detectedOpera_;
goog.userAgent.IE = goog.userAgent.BROWSER_KNOWN_ ? goog.userAgent.ASSUME_IE : goog.userAgent.detectedIe_;
goog.userAgent.GECKO = goog.userAgent.BROWSER_KNOWN_ ? goog.userAgent.ASSUME_GECKO : goog.userAgent.detectedGecko_;
goog.userAgent.WEBKIT = goog.userAgent.BROWSER_KNOWN_ ? goog.userAgent.ASSUME_WEBKIT || goog.userAgent.ASSUME_MOBILE_WEBKIT : goog.userAgent.detectedWebkit_;
goog.userAgent.MOBILE = goog.userAgent.ASSUME_MOBILE_WEBKIT || goog.userAgent.detectedMobile_;
goog.userAgent.SAFARI = goog.userAgent.WEBKIT;
goog.userAgent.determinePlatform_ = function() {
    var a = goog.userAgent.getNavigator();
    return a && a.platform || ""
};
goog.userAgent.PLATFORM = goog.userAgent.determinePlatform_();
goog.userAgent.ASSUME_MAC = false;
goog.userAgent.ASSUME_WINDOWS = false;
goog.userAgent.ASSUME_LINUX = false;
goog.userAgent.ASSUME_X11 = false;
goog.userAgent.PLATFORM_KNOWN_ = goog.userAgent.ASSUME_MAC || goog.userAgent.ASSUME_WINDOWS || goog.userAgent.ASSUME_LINUX || goog.userAgent.ASSUME_X11;
goog.userAgent.initPlatform_ = function() {
    goog.userAgent.detectedMac_ = goog.string.contains(goog.userAgent.PLATFORM, "Mac");
    goog.userAgent.detectedWindows_ = goog.string.contains(goog.userAgent.PLATFORM, "Win");
    goog.userAgent.detectedLinux_ = goog.string.contains(goog.userAgent.PLATFORM, "Linux");
    goog.userAgent.detectedX11_=!!goog.userAgent.getNavigator() && goog.string.contains(goog.userAgent.getNavigator()["appVersion"] || "", "X11")
};
if (!goog.userAgent.PLATFORM_KNOWN_) {
    goog.userAgent.initPlatform_()
}
goog.userAgent.MAC = goog.userAgent.PLATFORM_KNOWN_ ? goog.userAgent.ASSUME_MAC : goog.userAgent.detectedMac_;
goog.userAgent.WINDOWS = goog.userAgent.PLATFORM_KNOWN_ ? goog.userAgent.ASSUME_WINDOWS : goog.userAgent.detectedWindows_;
goog.userAgent.LINUX = goog.userAgent.PLATFORM_KNOWN_ ? goog.userAgent.ASSUME_LINUX : goog.userAgent.detectedLinux_;
goog.userAgent.X11 = goog.userAgent.PLATFORM_KNOWN_ ? goog.userAgent.ASSUME_X11 : goog.userAgent.detectedX11_;
goog.userAgent.determineVersion_ = function() {
    var b = "", e;
    if (goog.userAgent.OPERA && goog.global.opera) {
        var d = goog.global.opera.version;
        b = typeof d == "function" ? d() : d
    } else {
        if (goog.userAgent.GECKO) {
            e = /rv\:([^\);]+)(\)|;)/
        } else {
            if (goog.userAgent.IE) {
                e = /MSIE\s+([^\);]+)(\)|;)/
            } else {
                if (goog.userAgent.WEBKIT) {
                    e = /WebKit\/(\S+)/
                }
            }
        }
        if (e) {
            var a = e.exec(goog.userAgent.getUserAgentString());
            b = a ? a[1] : ""
        }
    }
    if (goog.userAgent.IE) {
        var c = goog.userAgent.getDocumentMode_();
        if (c > parseFloat(b)) {
            return String(c)
        }
    }
    return b
};
goog.userAgent.getDocumentMode_ = function() {
    var a = goog.global.document;
    return a ? a.documentMode : undefined
};
goog.userAgent.VERSION = goog.userAgent.determineVersion_();
goog.userAgent.compare = function(b, a) {
    return goog.string.compareVersions(b, a)
};
goog.userAgent.isVersionCache_ = {};
goog.userAgent.isVersion = function(a) {
    return goog.userAgent.isVersionCache_[a] || (goog.userAgent.isVersionCache_[a] = goog.string.compareVersions(goog.userAgent.VERSION, a) >= 0)
};
goog.userAgent.isDocumentModeCache_ = {};
goog.userAgent.isDocumentMode = function(a) {
    return goog.userAgent.isDocumentModeCache_[a] || (goog.userAgent.isDocumentModeCache_[a] = goog.userAgent.IE && document.documentMode && document.documentMode >= a)
};
goog.provide("goog.userAgent.jscript");
goog.require("goog.string");
goog.userAgent.jscript.ASSUME_NO_JSCRIPT = false;
goog.userAgent.jscript.init_ = function() {
    var a = "ScriptEngine" in goog.global;
    goog.userAgent.jscript.DETECTED_HAS_JSCRIPT_ = a && goog.global.ScriptEngine() == "JScript";
    goog.userAgent.jscript.DETECTED_VERSION_ = goog.userAgent.jscript.DETECTED_HAS_JSCRIPT_ ? (goog.global.ScriptEngineMajorVersion() + "." + goog.global.ScriptEngineMinorVersion() + "." + goog.global.ScriptEngineBuildVersion()) : "0"
};
if (!goog.userAgent.jscript.ASSUME_NO_JSCRIPT) {
    goog.userAgent.jscript.init_()
}
goog.userAgent.jscript.HAS_JSCRIPT = goog.userAgent.jscript.ASSUME_NO_JSCRIPT ? false : goog.userAgent.jscript.DETECTED_HAS_JSCRIPT_;
goog.userAgent.jscript.VERSION = goog.userAgent.jscript.ASSUME_NO_JSCRIPT ? "0" : goog.userAgent.jscript.DETECTED_VERSION_;
goog.userAgent.jscript.isVersion = function(a) {
    return goog.string.compareVersions(goog.userAgent.jscript.VERSION, a) >= 0
};
goog.provide("goog.string.StringBuffer");
goog.require("goog.userAgent.jscript");
goog.string.StringBuffer = function(a, b) {
    this.buffer_ = goog.userAgent.jscript.HAS_JSCRIPT ? [] : "";
    if (a != null) {
        this.append.apply(this, arguments)
    }
};
goog.string.StringBuffer.prototype.set = function(a) {
    this.clear();
    this.append(a)
};
if (goog.userAgent.jscript.HAS_JSCRIPT) {
    goog.string.StringBuffer.prototype.bufferLength_ = 0;
    goog.string.StringBuffer.prototype.append = function(b, a, c) {
        if (a == null) {
            this.buffer_[this.bufferLength_++] = b
        } else {
            this.buffer_.push.apply((this.buffer_), arguments);
            this.bufferLength_ = this.buffer_.length
        }
        return this
    }
} else {
    goog.string.StringBuffer.prototype.append = function(b, a, d) {
        this.buffer_ += b;
        if (a != null) {
            for (var c = 1; c < arguments.length; c++) {
                this.buffer_ += arguments[c]
            }
        }
        return this
    }
}
goog.string.StringBuffer.prototype.clear = function() {
    if (goog.userAgent.jscript.HAS_JSCRIPT) {
        this.buffer_.length = 0;
        this.bufferLength_ = 0
    } else {
        this.buffer_ = ""
    }
};
goog.string.StringBuffer.prototype.getLength = function() {
    return this.toString().length
};
goog.string.StringBuffer.prototype.toString = function() {
    if (goog.userAgent.jscript.HAS_JSCRIPT) {
        var a = this.buffer_.join("");
        this.clear();
        if (a) {
            this.append(a)
        }
        return a
    } else {
        return (this.buffer_)
    }
};
goog.provide("goog.debug.Error");
goog.debug.Error = function(a) {
    this.stack = new Error().stack || "";
    if (a) {
        this.message = String(a)
    }
};
goog.inherits(goog.debug.Error, Error);
goog.debug.Error.prototype.name = "CustomError";
goog.provide("goog.asserts");
goog.provide("goog.asserts.AssertionError");
goog.require("goog.debug.Error");
goog.require("goog.string");
goog.asserts.ENABLE_ASSERTS = goog.DEBUG;
goog.asserts.AssertionError = function(b, a) {
    a.unshift(b);
    goog.debug.Error.call(this, goog.string.subs.apply(null, a));
    a.shift();
    this.messagePattern = b
};
goog.inherits(goog.asserts.AssertionError, goog.debug.Error);
goog.asserts.AssertionError.prototype.name = "AssertionError";
goog.asserts.doAssertFailure_ = function(c, f, d, b) {
    var e = "Assertion failed";
    if (d) {
        e += ": " + d;
        var a = b
    } else {
        if (c) {
            e += ": " + c;
            a = f
        }
    }
    throw new goog.asserts.AssertionError("" + e, a || [])
};
goog.asserts.assert = function(c, b, a) {
    if (goog.asserts.ENABLE_ASSERTS&&!c) {
        goog.asserts.doAssertFailure_("", null, b, Array.prototype.slice.call(arguments, 2))
    }
    return c
};
goog.asserts.fail = function(b, a) {
    if (goog.asserts.ENABLE_ASSERTS) {
        throw new goog.asserts.AssertionError("Failure" + (b ? ": " + b : ""), Array.prototype.slice.call(arguments, 1))
    }
};
goog.asserts.assertNumber = function(a, c, b) {
    if (goog.asserts.ENABLE_ASSERTS&&!goog.isNumber(a)) {
        goog.asserts.doAssertFailure_("Expected number but got %s: %s.", [goog.typeOf(a), a], c, Array.prototype.slice.call(arguments, 2))
    }
    return (a)
};
goog.asserts.assertString = function(a, c, b) {
    if (goog.asserts.ENABLE_ASSERTS&&!goog.isString(a)) {
        goog.asserts.doAssertFailure_("Expected string but got %s: %s.", [goog.typeOf(a), a], c, Array.prototype.slice.call(arguments, 2))
    }
    return (a)
};
goog.asserts.assertFunction = function(a, c, b) {
    if (goog.asserts.ENABLE_ASSERTS&&!goog.isFunction(a)) {
        goog.asserts.doAssertFailure_("Expected function but got %s: %s.", [goog.typeOf(a), a], c, Array.prototype.slice.call(arguments, 2))
    }
    return (a)
};
goog.asserts.assertObject = function(a, c, b) {
    if (goog.asserts.ENABLE_ASSERTS&&!goog.isObject(a)) {
        goog.asserts.doAssertFailure_("Expected object but got %s: %s.", [goog.typeOf(a), a], c, Array.prototype.slice.call(arguments, 2))
    }
    return (a)
};
goog.asserts.assertArray = function(a, c, b) {
    if (goog.asserts.ENABLE_ASSERTS&&!goog.isArray(a)) {
        goog.asserts.doAssertFailure_("Expected array but got %s: %s.", [goog.typeOf(a), a], c, Array.prototype.slice.call(arguments, 2))
    }
    return (a)
};
goog.asserts.assertBoolean = function(a, c, b) {
    if (goog.asserts.ENABLE_ASSERTS&&!goog.isBoolean(a)) {
        goog.asserts.doAssertFailure_("Expected boolean but got %s: %s.", [goog.typeOf(a), a], c, Array.prototype.slice.call(arguments, 2))
    }
    return (a)
};
goog.asserts.assertInstanceof = function(b, a, d, c) {
    if (goog.asserts.ENABLE_ASSERTS&&!(b instanceof a)) {
        goog.asserts.doAssertFailure_("instanceof check failed.", null, d, Array.prototype.slice.call(arguments, 3))
    }
};
goog.provide("goog.array");
goog.provide("goog.array.ArrayLike");
goog.require("goog.asserts");
goog.NATIVE_ARRAY_PROTOTYPES = true;
goog.array.ArrayLike;
goog.array.peek = function(a) {
    return a[a.length - 1]
};
goog.array.ARRAY_PROTOTYPE_ = Array.prototype;
goog.array.indexOf = goog.NATIVE_ARRAY_PROTOTYPES && goog.array.ARRAY_PROTOTYPE_.indexOf ? function(a, c, b) {
    goog.asserts.assert(a.length != null);
    return goog.array.ARRAY_PROTOTYPE_.indexOf.call(a, c, b)
} : function(a, e, b) {
    var d = b == null ? 0: (b < 0 ? Math.max(0, a.length + b) : b);
    if (goog.isString(a)) {
        if (!goog.isString(e) || e.length != 1) {
            return - 1
        }
        return a.indexOf(e, d)
    }
    for (var c = d; c < a.length; c++) {
        if (c in a && a[c] === e) {
            return c
        }
    }
    return - 1
};
goog.array.lastIndexOf = goog.NATIVE_ARRAY_PROTOTYPES && goog.array.ARRAY_PROTOTYPE_.lastIndexOf ? function(a, d, b) {
    goog.asserts.assert(a.length != null);
    var c = b == null ? a.length - 1: b;
    return goog.array.ARRAY_PROTOTYPE_.lastIndexOf.call(a, d, c)
} : function(a, e, b) {
    var d = b == null ? a.length - 1: b;
    if (d < 0) {
        d = Math.max(0, a.length + d)
    }
    if (goog.isString(a)) {
        if (!goog.isString(e) || e.length != 1) {
            return - 1
        }
        return a.lastIndexOf(e, d)
    }
    for (var c = d; c >= 0; c--) {
        if (c in a && a[c] === e) {
            return c
        }
    }
    return - 1
};
goog.array.forEach = goog.NATIVE_ARRAY_PROTOTYPES && goog.array.ARRAY_PROTOTYPE_.forEach ? function(a, c, b) {
    goog.asserts.assert(a.length != null);
    goog.array.ARRAY_PROTOTYPE_.forEach.call(a, c, b)
} : function(a, g, e) {
    var b = a.length;
    var c = goog.isString(a) ? a.split(""): a;
    for (var d = 0; d < b; d++) {
        if (d in c) {
            g.call(e, c[d], d, a)
        }
    }
};
goog.array.forEachRight = function(a, g, e) {
    var b = a.length;
    var c = goog.isString(a) ? a.split(""): a;
    for (var d = b - 1; d >= 0; --d) {
        if (d in c) {
            g.call(e, c[d], d, a)
        }
    }
};
goog.array.filter = goog.NATIVE_ARRAY_PROTOTYPES && goog.array.ARRAY_PROTOTYPE_.filter ? function(a, c, b) {
    goog.asserts.assert(a.length != null);
    return goog.array.ARRAY_PROTOTYPE_.filter.call(a, c, b)
} : function(e, g, a) {
    var c = e.length;
    var h = [];
    var k = 0;
    var j = goog.isString(e) ? e.split(""): e;
    for (var d = 0; d < c; d++) {
        if (d in j) {
            var b = j[d];
            if (g.call(a, b, d, e)) {
                h[k++] = b
            }
        }
    }
    return h
};
goog.array.map = goog.NATIVE_ARRAY_PROTOTYPES && goog.array.ARRAY_PROTOTYPE_.map ? function(a, c, b) {
    goog.asserts.assert(a.length != null);
    return goog.array.ARRAY_PROTOTYPE_.map.call(a, c, b)
} : function(a, h, g) {
    var b = a.length;
    var e = new Array(b);
    var c = goog.isString(a) ? a.split(""): a;
    for (var d = 0; d < b; d++) {
        if (d in c) {
            e[d] = h.call(g, c[d], d, a)
        }
    }
    return e
};
goog.array.reduce = function(a, c, e, b) {
    if (a.reduce) {
        if (b) {
            return a.reduce(goog.bind(c, b), e)
        } else {
            return a.reduce(c, e)
        }
    }
    var d = e;
    goog.array.forEach(a, function(g, f) {
        d = c.call(b, d, g, f, a)
    });
    return d
};
goog.array.reduceRight = function(a, c, e, b) {
    if (a.reduceRight) {
        if (b) {
            return a.reduceRight(goog.bind(c, b), e)
        } else {
            return a.reduceRight(c, e)
        }
    }
    var d = e;
    goog.array.forEachRight(a, function(g, f) {
        d = c.call(b, d, g, f, a)
    });
    return d
};
goog.array.some = goog.NATIVE_ARRAY_PROTOTYPES && goog.array.ARRAY_PROTOTYPE_.some ? function(a, c, b) {
    goog.asserts.assert(a.length != null);
    return goog.array.ARRAY_PROTOTYPE_.some.call(a, c, b)
} : function(a, g, e) {
    var b = a.length;
    var c = goog.isString(a) ? a.split(""): a;
    for (var d = 0; d < b; d++) {
        if (d in c && g.call(e, c[d], d, a)) {
            return true
        }
    }
    return false
};
goog.array.every = goog.NATIVE_ARRAY_PROTOTYPES && goog.array.ARRAY_PROTOTYPE_.every ? function(a, c, b) {
    goog.asserts.assert(a.length != null);
    return goog.array.ARRAY_PROTOTYPE_.every.call(a, c, b)
} : function(a, g, e) {
    var b = a.length;
    var c = goog.isString(a) ? a.split(""): a;
    for (var d = 0; d < b; d++) {
        if (d in c&&!g.call(e, c[d], d, a)) {
            return false
        }
    }
    return true
};
goog.array.find = function(a, d, c) {
    var b = goog.array.findIndex(a, d, c);
    return b < 0 ? null : goog.isString(a) ? a.charAt(b) : a[b]
};
goog.array.findIndex = function(a, g, e) {
    var b = a.length;
    var c = goog.isString(a) ? a.split(""): a;
    for (var d = 0; d < b; d++) {
        if (d in c && g.call(e, c[d], d, a)) {
            return d
        }
    }
    return - 1
};
goog.array.findRight = function(a, d, c) {
    var b = goog.array.findIndexRight(a, d, c);
    return b < 0 ? null : goog.isString(a) ? a.charAt(b) : a[b]
};
goog.array.findIndexRight = function(a, g, e) {
    var b = a.length;
    var c = goog.isString(a) ? a.split(""): a;
    for (var d = b - 1; d >= 0; d--) {
        if (d in c && g.call(e, c[d], d, a)) {
            return d
        }
    }
    return - 1
};
goog.array.contains = function(a, b) {
    return goog.array.indexOf(a, b) >= 0
};
goog.array.isEmpty = function(a) {
    return a.length == 0
};
goog.array.clear = function(a) {
    if (!goog.isArray(a)) {
        for (var b = a.length - 1; b >= 0; b--) {
            delete a[b]
        }
    }
    a.length = 0
};
goog.array.insert = function(a, b) {
    if (!goog.array.contains(a, b)) {
        a.push(b)
    }
};
goog.array.insertAt = function(a, c, b) {
    goog.array.splice(a, b, 0, c)
};
goog.array.insertArrayAt = function(a, b, c) {
    goog.partial(goog.array.splice, a, c, 0).apply(null, b)
};
goog.array.insertBefore = function(a, d, b) {
    var c;
    if (arguments.length == 2 || (c = goog.array.indexOf(a, b)) < 0) {
        a.push(d)
    } else {
        goog.array.insertAt(a, d, c)
    }
};
goog.array.remove = function(a, c) {
    var b = goog.array.indexOf(a, c);
    var d;
    if ((d = b >= 0)) {
        goog.array.removeAt(a, b)
    }
    return d
};
goog.array.removeAt = function(a, b) {
    goog.asserts.assert(a.length != null);
    return goog.array.ARRAY_PROTOTYPE_.splice.call(a, b, 1).length == 1
};
goog.array.removeIf = function(a, d, c) {
    var b = goog.array.findIndex(a, d, c);
    if (b >= 0) {
        goog.array.removeAt(a, b);
        return true
    }
    return false
};
goog.array.concat = function(a) {
    return goog.array.ARRAY_PROTOTYPE_.concat.apply(goog.array.ARRAY_PROTOTYPE_, arguments)
};
goog.array.clone = function(b) {
    if (goog.isArray(b)) {
        return goog.array.concat((b))
    } else {
        var d = [];
        for (var c = 0, a = b.length; c < a; c++) {
            d[c] = b[c]
        }
        return d
    }
};
goog.array.toArray = function(a) {
    if (goog.isArray(a)) {
        return goog.array.concat((a))
    }
    return goog.array.clone((a))
};
goog.array.extend = function(f, h) {
    for (var g = 1; g < arguments.length; g++) {
        var c = arguments[g];
        var b;
        if (goog.isArray(c) || (b = goog.isArrayLike(c)) && c.hasOwnProperty("callee")) {
            f.push.apply(f, c)
        } else {
            if (b) {
                var e = f.length;
                var a = c.length;
                for (var d = 0; d < a; d++) {
                    f[e + d] = c[d]
                }
            } else {
                f.push(c)
            }
        }
    }
};
goog.array.splice = function(a, b, c, d) {
    goog.asserts.assert(a.length != null);
    return goog.array.ARRAY_PROTOTYPE_.splice.apply(a, goog.array.slice(arguments, 1))
};
goog.array.slice = function(b, c, a) {
    goog.asserts.assert(b.length != null);
    if (arguments.length <= 2) {
        return goog.array.ARRAY_PROTOTYPE_.slice.call(b, c)
    } else {
        return goog.array.ARRAY_PROTOTYPE_.slice.call(b, c, a)
    }
};
goog.array.removeDuplicates = function(a, h) {
    var f = h || a;
    var b = {}, g = 0, d = 0;
    while (d < a.length) {
        var e = a[d++];
        var c = goog.isObject(e) ? "o" + goog.getUid(e): (typeof e).charAt(0) + e;
        if (!Object.prototype.hasOwnProperty.call(b, c)) {
            b[c] = true;
            f[g++] = e
        }
    }
    f.length = g
};
goog.array.binarySearch = function(a, b, c) {
    return goog.array.binarySearch_(a, c || goog.array.defaultCompare, false, b)
};
goog.array.binarySelect = function(a, c, b) {
    return goog.array.binarySearch_(a, c, true, undefined, b)
};
goog.array.binarySearch_ = function(f, b, d, e, j) {
    var c = 0;
    var g = f.length;
    var i;
    while (c < g) {
        var h = (c + g)>>1;
        var a;
        if (d) {
            a = b.call(j, f[h], h, f)
        } else {
            a = b(e, f[h])
        }
        if (a > 0) {
            c = h + 1
        } else {
            g = h;
            i=!a
        }
    }
    return i ? c : ~c
};
goog.array.sort = function(a, b) {
    goog.asserts.assert(a.length != null);
    goog.array.ARRAY_PROTOTYPE_.sort.call(a, b || goog.array.defaultCompare)
};
goog.array.stableSort = function(a, e) {
    for (var d = 0; d < a.length; d++) {
        a[d] = {
            index: d,
            value: a[d]
        }
    }
    var c = e || goog.array.defaultCompare;
    function b(g, f) {
        return c(g.value, f.value) || g.index - f.index
    }
    goog.array.sort(a, b);
    for (var d = 0; d < a.length; d++) {
        a[d] = a[d].value
    }
};
goog.array.sortObjectsByKey = function(a, b, d) {
    var c = d || goog.array.defaultCompare;
    goog.array.sort(a, function(f, e) {
        return c(f[b], e[b])
    })
};
goog.array.isSorted = function(a, f, e) {
    var d = f || goog.array.defaultCompare;
    for (var c = 1; c < a.length; c++) {
        var b = d(a[c - 1], a[c]);
        if (b > 0 || b == 0 && e) {
            return false
        }
    }
    return true
};
goog.array.equals = function(c, b, f) {
    if (!goog.isArrayLike(c) ||!goog.isArrayLike(b) || c.length != b.length) {
        return false
    }
    var a = c.length;
    var e = f || goog.array.defaultCompareEquality;
    for (var d = 0; d < a; d++) {
        if (!e(c[d], b[d])) {
            return false
        }
    }
    return true
};
goog.array.compare = function(b, a, c) {
    return goog.array.equals(b, a, c)
};
goog.array.defaultCompare = function(d, c) {
    return d > c ? 1 : d < c?-1 : 0
};
goog.array.defaultCompareEquality = function(d, c) {
    return d === c
};
goog.array.binaryInsert = function(d, b, c) {
    var a = goog.array.binarySearch(d, b, c);
    if (a < 0) {
        goog.array.insertAt(d, b, - (a + 1));
        return true
    }
    return false
};
goog.array.binaryRemove = function(d, b, c) {
    var a = goog.array.binarySearch(d, b, c);
    return (a >= 0) ? goog.array.removeAt(d, a) : false
};
goog.array.bucket = function(g, f) {
    var c = {};
    for (var b = 0; b < g.length; b++) {
        var d = g[b];
        var a = f(d, b, g);
        if (goog.isDef(a)) {
            var e = c[a] || (c[a] = []);
            e.push(d)
        }
    }
    return c
};
goog.array.repeat = function(b, d) {
    var c = [];
    for (var a = 0; a < d; a++) {
        c[a] = b
    }
    return c
};
goog.array.flatten = function(d) {
    var a = [];
    for (var c = 0; c < arguments.length; c++) {
        var b = arguments[c];
        if (goog.isArray(b)) {
            a.push.apply(a, goog.array.flatten.apply(null, b))
        } else {
            a.push(b)
        }
    }
    return a
};
goog.array.rotate = function(b, a) {
    goog.asserts.assert(b.length != null);
    if (b.length) {
        a%=b.length;
        if (a > 0) {
            goog.array.ARRAY_PROTOTYPE_.unshift.apply(b, b.splice( - a, a))
        } else {
            if (a < 0) {
                goog.array.ARRAY_PROTOTYPE_.push.apply(b, b.splice(0, - a))
            }
        }
    }
    return b
};
goog.array.zip = function(f) {
    if (!arguments.length) {
        return []
    }
    var b = [];
    for (var d = 0; true; d++) {
        var e = [];
        for (var c = 0; c < arguments.length; c++) {
            var a = arguments[c];
            if (d >= a.length) {
                return b
            }
            e.push(a[d])
        }
        b.push(e)
    }
};
goog.array.shuffle = function(b, f) {
    var a = f || Math.random;
    for (var e = b.length - 1; e > 0; e--) {
        var c = Math.floor(a() * (e + 1));
        var d = b[e];
        b[e] = b[c];
        b[c] = d
    }
};
goog.provide("goog.proto2.Util");
goog.require("goog.asserts");
goog.proto2.Util.PBCHECK=!COMPILED;
goog.proto2.Util.assert = function(b, a) {
    if (goog.proto2.Util.PBCHECK) {
        goog.asserts.assert(b, a)
    }
};
goog.proto2.Util.conductChecks = function() {
    return goog.proto2.Util.PBCHECK
};
goog.provide("goog.proto2.FieldDescriptor");
goog.require("goog.proto2.Util");
goog.require("goog.string");
goog.proto2.FieldDescriptor = function(c, a, b) {
    this.parent_ = c;
    goog.proto2.Util.assert(goog.string.isNumeric(a));
    this.tag_ = (a);
    this.name_ = b.name;
    b.fieldType;
    b.repeated;
    b.required;
    this.isRepeated_=!!b.repeated;
    this.isRequired_=!!b.required;
    this.fieldType_ = b.fieldType;
    this.nativeType_ = b.type;
    this.deserializationConversionPermitted_ = false;
    switch (this.fieldType_) {
    case goog.proto2.FieldDescriptor.FieldType.INT64:
    case goog.proto2.FieldDescriptor.FieldType.UINT64:
    case goog.proto2.FieldDescriptor.FieldType.FIXED64:
    case goog.proto2.FieldDescriptor.FieldType.SFIXED64:
    case goog.proto2.FieldDescriptor.FieldType.SINT64:
        this.deserializationConversionPermitted_ = true;
        break
    }
    this.defaultValue_ = b.defaultValue
};
goog.proto2.FieldDescriptor.FieldType = {
    DOUBLE: 1,
    FLOAT: 2,
    INT64: 3,
    UINT64: 4,
    INT32: 5,
    FIXED64: 6,
    FIXED32: 7,
    BOOL: 8,
    STRING: 9,
    GROUP: 10,
    MESSAGE: 11,
    BYTES: 12,
    UINT32: 13,
    ENUM: 14,
    SFIXED32: 15,
    SFIXED64: 16,
    SINT32: 17,
    SINT64: 18
};
goog.proto2.FieldDescriptor.prototype.getTag = function() {
    return this.tag_
};
goog.proto2.FieldDescriptor.prototype.getContainingType = function() {
    return this.parent_.descriptor_
};
goog.proto2.FieldDescriptor.prototype.getName = function() {
    return this.name_
};
goog.proto2.FieldDescriptor.prototype.getDefaultValue = function() {
    if (this.defaultValue_ === undefined) {
        var a = this.nativeType_;
        if (a === Boolean) {
            this.defaultValue_ = false
        } else {
            if (a === Number) {
                this.defaultValue_ = 0
            } else {
                if (a === String) {
                    this.defaultValue_ = ""
                } else {
                    this.defaultValue_ = new a
                }
            }
        }
    }
    return this.defaultValue_
};
goog.proto2.FieldDescriptor.prototype.getFieldType = function() {
    return this.fieldType_
};
goog.proto2.FieldDescriptor.prototype.getNativeType = function() {
    return this.nativeType_
};
goog.proto2.FieldDescriptor.prototype.deserializationConversionPermitted = function() {
    return this.deserializationConversionPermitted_
};
goog.proto2.FieldDescriptor.prototype.getFieldMessageType = function() {
    goog.proto2.Util.assert(this.isCompositeType(), "Expected message or group");
    return this.nativeType_.descriptor_
};
goog.proto2.FieldDescriptor.prototype.isCompositeType = function() {
    return this.fieldType_ == goog.proto2.FieldDescriptor.FieldType.MESSAGE || this.fieldType_ == goog.proto2.FieldDescriptor.FieldType.GROUP
};
goog.proto2.FieldDescriptor.prototype.isRepeated = function() {
    return this.isRepeated_
};
goog.proto2.FieldDescriptor.prototype.isRequired = function() {
    return this.isRequired_
};
goog.proto2.FieldDescriptor.prototype.isOptional = function() {
    return !this.isRepeated_&&!this.isRequired_
};
goog.provide("goog.proto2.Descriptor");
goog.provide("goog.proto2.Metadata");
goog.require("goog.array");
goog.require("goog.object");
goog.require("goog.proto2.Util");
goog.proto2.Metadata;
goog.proto2.Descriptor = function(d, c, a) {
    this.messageType_ = d;
    this.name_ = c.name || null;
    this.fullName_ = c.fullName || null;
    this.containingType_ = c.containingType;
    this.fields_ = {};
    for (var b = 0; b < a.length; b++) {
        var e = a[b];
        this.fields_[e.getTag()] = e
    }
};
goog.proto2.Descriptor.prototype.getName = function() {
    return this.name_
};
goog.proto2.Descriptor.prototype.getFullName = function() {
    return this.fullName_
};
goog.proto2.Descriptor.prototype.getContainingType = function() {
    if (!this.containingType_) {
        return null
    }
    return this.containingType_.getDescriptor()
};
goog.proto2.Descriptor.prototype.getFields = function() {
    function b(d, c) {
        return d.getTag() - c.getTag()
    }
    var a = goog.object.getValues(this.fields_);
    goog.array.sort(a, b);
    return a
};
goog.proto2.Descriptor.prototype.getFieldsMap = function() {
    return goog.object.clone(this.fields_)
};
goog.proto2.Descriptor.prototype.findFieldByName = function(b) {
    var a = goog.object.findValue(this.fields_, function(e, c, d) {
        return e.getName() == b
    });
    return (a) || null
};
goog.proto2.Descriptor.prototype.findFieldByTag = function(a) {
    goog.proto2.Util.assert(goog.string.isNumeric(a));
    return this.fields_[parseInt(a, 10)] || null
};
goog.proto2.Descriptor.prototype.createMessageInstance = function() {
    return new this.messageType_
};
goog.provide("goog.proto2.Message");
goog.require("goog.proto2.Descriptor");
goog.require("goog.proto2.FieldDescriptor");
goog.require("goog.proto2.Util");
goog.require("goog.string");
goog.proto2.Message = function() {
    this.values_ = {};
    this.descriptor_ = this.constructor.descriptor_;
    this.fields_ = this.descriptor_.getFieldsMap();
    this.lazyDeserializer_ = null;
    this.deserializedFields_ = null
};
goog.proto2.Message.FieldType = {
    DOUBLE: 1,
    FLOAT: 2,
    INT64: 3,
    UINT64: 4,
    INT32: 5,
    FIXED64: 6,
    FIXED32: 7,
    BOOL: 8,
    STRING: 9,
    GROUP: 10,
    MESSAGE: 11,
    BYTES: 12,
    UINT32: 13,
    ENUM: 14,
    SFIXED32: 15,
    SFIXED64: 16,
    SINT32: 17,
    SINT64: 18
};
goog.proto2.Message.prototype.initializeForLazyDeserializer = function(a, b) {
    this.lazyDeserializer_ = a;
    this.values_ = b;
    this.deserializedFields_ = {}
};
goog.proto2.Message.prototype.setUnknown = function(a, b) {
    goog.proto2.Util.assert(!this.fields_[a], "Field is not unknown in this message");
    goog.proto2.Util.assert(a >= 1, "Tag is not valid");
    goog.proto2.Util.assert(b !== null, "Value cannot be null");
    this.values_[a] = b
};
goog.proto2.Message.prototype.forEachUnknown = function(d, a) {
    var c = a || this;
    for (var b in this.values_) {
        if (!this.fields_[b]) {
            d.call(c, (b), this.values_[b])
        }
    }
};
goog.proto2.Message.prototype.getDescriptor = function() {
    return this.descriptor_
};
goog.proto2.Message.prototype.has = function(a) {
    goog.proto2.Util.assert(a.getContainingType() == this.descriptor_, "The current message does not contain the given field");
    return this.has$Value(a.getTag())
};
goog.proto2.Message.prototype.arrayOf = function(a) {
    goog.proto2.Util.assert(a.getContainingType() == this.descriptor_, "The current message does not contain the given field");
    return this.array$Values(a.getTag())
};
goog.proto2.Message.prototype.countOf = function(a) {
    goog.proto2.Util.assert(a.getContainingType() == this.descriptor_, "The current message does not contain the given field");
    return this.count$Values(a.getTag())
};
goog.proto2.Message.prototype.get = function(a, b) {
    goog.proto2.Util.assert(a.getContainingType() == this.descriptor_, "The current message does not contain the given field");
    return this.get$Value(a.getTag(), b)
};
goog.proto2.Message.prototype.getOrDefault = function(a, b) {
    goog.proto2.Util.assert(a.getContainingType() == this.descriptor_, "The current message does not contain the given field");
    return this.get$ValueOrDefault(a.getTag(), b)
};
goog.proto2.Message.prototype.set = function(b, a) {
    goog.proto2.Util.assert(b.getContainingType() == this.descriptor_, "The current message does not contain the given field");
    this.set$Value(b.getTag(), a)
};
goog.proto2.Message.prototype.add = function(b, a) {
    goog.proto2.Util.assert(b.getContainingType() == this.descriptor_, "The current message does not contain the given field");
    this.add$Value(b.getTag(), a)
};
goog.proto2.Message.prototype.clear = function(a) {
    goog.proto2.Util.assert(a.getContainingType() == this.descriptor_, "The current message does not contain the given field");
    this.clear$Field(a.getTag())
};
goog.proto2.Message.prototype.equals = function(f) {
    if (!f || this.constructor != f.constructor) {
        return false
    }
    var e = this.getDescriptor().getFields();
    for (var d = 0; d < e.length; d++) {
        var h = e[d];
        if (this.has(h) != f.has(h)) {
            return false
        }
        if (this.has(h)) {
            var g = h.isCompositeType();
            function k(j, i) {
                return g ? j.equals(i) : j == i
            }
            var l = h.getTag();
            var a = this.values_[l];
            var c = f.values_[l];
            if (h.isRepeated()) {
                if (a.length != c.length) {
                    return false
                }
                for (var b = 0; b < a.length; b++) {
                    if (!k(a[b], c[b])) {
                        return false
                    }
                }
            } else {
                if (!k(a, c)) {
                    return false
                }
            }
        }
    }
    return true
};
goog.proto2.Message.prototype.copyFrom = function(f) {
    goog.proto2.Util.assert(this.constructor == f.constructor, "The source message must have the same type.");
    var a = this.getDescriptor().getFields();
    for (var e = 0; e < a.length; e++) {
        var h = a[e];
        delete this.values_[h.getTag()];
        if (f.has(h)) {
            var b = h.isCompositeType();
            if (h.isRepeated()) {
                var c = f.arrayOf(h);
                for (var d = 0; d < c.length; d++) {
                    this.add(h, b ? c[d].clone() : c[d])
                }
            } else {
                var g = f.get(h);
                this.set(h, b ? g.clone() : g)
            }
        }
    }
};
goog.proto2.Message.prototype.clone = function() {
    var a = new this.constructor;
    a.copyFrom(this);
    return a
};
goog.proto2.Message.prototype.initDefaults = function(g) {
    var b = this.getDescriptor().getFields();
    for (var f = 0; f < b.length; f++) {
        var h = b[f];
        var a = h.getTag();
        var c = h.isCompositeType();
        if (!this.has(h)&&!h.isRepeated()) {
            if (c) {
                this.values_[a] = new (h.getNativeType())
            } else {
                if (g) {
                    this.values_[a] = h.getDefaultValue()
                }
            }
        }
        if (c) {
            if (h.isRepeated()) {
                var d = this.array$Values(a);
                for (var e = 0; e < d.length; e++) {
                    d[e].initDefaults(g)
                }
            } else {
                this.get$Value(a).initDefaults(g)
            }
        }
    }
};
goog.proto2.Message.prototype.getFieldByTag_ = function(a) {
    goog.proto2.Util.assert(this.fields_[a], "No field found for the given tag");
    return this.fields_[a]
};
goog.proto2.Message.prototype.has$Value = function(a) {
    goog.proto2.Util.assert(this.fields_[a], "No field found for the given tag");
    return a in this.values_ && goog.isDef(this.values_[a])
};
goog.proto2.Message.prototype.lazyDeserialize_ = function(b) {
    if (this.lazyDeserializer_) {
        var a = b.getTag();
        if (!(a in this.deserializedFields_)) {
            this.values_[a] = this.lazyDeserializer_.deserializeField(this, b, this.values_[a]);
            this.deserializedFields_[a] = true
        }
    }
};
goog.proto2.Message.prototype.get$Value = function(a, d) {
    var c = this.getFieldByTag_(a);
    this.lazyDeserialize_(c);
    if (c.isRepeated()) {
        var b = d || 0;
        goog.proto2.Util.assert(b < this.count$Values(a), "Field value count is less than index given");
        return this.values_[a][b]
    } else {
        goog.proto2.Util.assert(!goog.isArray(this.values_[a]));
        return this.values_[a]
    }
};
goog.proto2.Message.prototype.get$ValueOrDefault = function(a, c) {
    if (!this.has$Value(a)) {
        var b = this.getFieldByTag_(a);
        return b.getDefaultValue()
    }
    return this.get$Value(a, c)
};
goog.proto2.Message.prototype.array$Values = function(a) {
    goog.proto2.Util.assert(this.getFieldByTag_(a).isRepeated(), "Cannot call fieldArray on a non-repeated field");
    var b = this.getFieldByTag_(a);
    this.lazyDeserialize_(b);
    return this.values_[a] || []
};
goog.proto2.Message.prototype.count$Values = function(a) {
    var b = this.getFieldByTag_(a);
    if (b.isRepeated()) {
        if (this.has$Value(a)) {
            goog.proto2.Util.assert(goog.isArray(this.values_[a]))
        }
        return this.has$Value(a) ? this.values_[a].length : 0
    } else {
        return this.has$Value(a) ? 1 : 0
    }
};
goog.proto2.Message.prototype.set$Value = function(a, b) {
    if (goog.proto2.Util.conductChecks()) {
        var c = this.getFieldByTag_(a);
        goog.proto2.Util.assert(!c.isRepeated(), "Cannot call set on a repeated field");
        this.checkFieldType_(c, b)
    }
    this.values_[a] = b;
    if (this.deserializedFields_) {
        this.deserializedFields_[a] = true
    }
};
goog.proto2.Message.prototype.add$Value = function(a, b) {
    if (goog.proto2.Util.conductChecks()) {
        var c = this.getFieldByTag_(a);
        goog.proto2.Util.assert(c.isRepeated(), "Cannot call add on a non-repeated field");
        this.checkFieldType_(c, b)
    }
    if (!this.values_[a]) {
        this.values_[a] = []
    }
    this.values_[a].push(b)
};
goog.proto2.Message.prototype.checkFieldType_ = function(b, a) {
    goog.proto2.Util.assert(a !== null);
    var c = b.getNativeType();
    if (c === String) {
        goog.proto2.Util.assert(typeof a === "string", "Expected value of type string")
    } else {
        if (c === Boolean) {
            goog.proto2.Util.assert(typeof a === "boolean", "Expected value of type boolean")
        } else {
            if (c === Number) {
                goog.proto2.Util.assert(typeof a === "number", "Expected value of type number")
            } else {
                if (b.getFieldType() == goog.proto2.FieldDescriptor.FieldType.ENUM) {
                    goog.proto2.Util.assert(typeof a === "number", "Expected an enum value, which is a number")
                } else {
                    goog.proto2.Util.assert(a instanceof c, "Expected a matching message type")
                }
            }
        }
    }
};
goog.proto2.Message.prototype.clear$Field = function(a) {
    goog.proto2.Util.assert(this.getFieldByTag_(a), "Unknown field");
    delete this.values_[a]
};
goog.proto2.Message.set$Metadata = function(e, c) {
    var a = [];
    var b;
    for (var d in c) {
        if (!c.hasOwnProperty(d)) {
            continue
        }
        goog.proto2.Util.assert(goog.string.isNumeric(d), "Keys must be numeric");
        if (d == 0) {
            b = c[0];
            continue
        }
        a.push(new goog.proto2.FieldDescriptor(e, d, c[d]))
    }
    goog.proto2.Util.assert(b);
    e.descriptor_ = new goog.proto2.Descriptor(e, b, a);
    e.getDescriptor = function() {
        return e.descriptor_
    }
};
goog.provide("goog.proto2.Serializer");
goog.require("goog.proto2.Descriptor");
goog.require("goog.proto2.FieldDescriptor");
goog.require("goog.proto2.Message");
goog.require("goog.proto2.Util");
goog.proto2.Serializer = function() {};
goog.proto2.Serializer.prototype.serialize = goog.abstractMethod;
goog.proto2.Serializer.prototype.getSerializedValue = function(b, a) {
    if (b.isCompositeType()) {
        return this.serialize((a))
    } else {
        return a
    }
};
goog.proto2.Serializer.prototype.deserialize = function(c, b) {
    var a = c.createMessageInstance();
    this.deserializeTo(a, b);
    goog.proto2.Util.assert(a instanceof goog.proto2.Message);
    return a
};
goog.proto2.Serializer.prototype.deserializeTo = goog.abstractMethod;
goog.proto2.Serializer.prototype.getDeserializedValue = function(b, a) {
    if (b.isCompositeType()) {
        return this.deserialize(b.getFieldMessageType(), a)
    }
    if (!b.deserializationConversionPermitted()) {
        return a
    }
    var c = b.getNativeType();
    if (c === String) {
        if (typeof a === "number") {
            return String(a)
        }
    } else {
        if (c === Number) {
            if (typeof a === "string") {
                if (/^-?[0-9]+$/.test(a)) {
                    return Number(a)
                }
            }
        }
    }
    return a
};
goog.provide("goog.proto2.LazyDeserializer");
goog.require("goog.proto2.Serializer");
goog.require("goog.proto2.Util");
goog.proto2.LazyDeserializer = function() {};
goog.inherits(goog.proto2.LazyDeserializer, goog.proto2.Serializer);
goog.proto2.LazyDeserializer.prototype.deserialize = function(c, b) {
    var a = c.createMessageInstance();
    a.initializeForLazyDeserializer(this, b);
    goog.proto2.Util.assert(a instanceof goog.proto2.Message);
    return a
};
goog.proto2.LazyDeserializer.prototype.deserializeTo = function(a, b) {
    throw new Error("Unimplemented")
};
goog.proto2.LazyDeserializer.prototype.deserializeField = goog.abstractMethod;
goog.provide("goog.proto2.PbLiteSerializer");
goog.require("goog.proto2.LazyDeserializer");
goog.require("goog.proto2.Util");
goog.proto2.PbLiteSerializer = function() {};
goog.inherits(goog.proto2.PbLiteSerializer, goog.proto2.LazyDeserializer);
goog.proto2.PbLiteSerializer.prototype.serialize = function(e) {
    var h = e.getDescriptor();
    var b = h.getFields();
    var g = [];
    for (var d = 0; d < b.length; d++) {
        var f = b[d];
        if (!e.has(f)) {
            continue
        }
        var a = f.getTag();
        if (f.isRepeated()) {
            g[a] = [];
            for (var c = 0; c < e.countOf(f); c++) {
                g[a][c] = this.getSerializedValue(f, e.get(f, c))
            }
        } else {
            g[a] = this.getSerializedValue(f, e.get(f))
        }
    }
    e.forEachUnknown(function(i, j) {
        g[i] = j
    });
    return g
};
goog.proto2.PbLiteSerializer.prototype.deserializeField = function(b, e, d) {
    if (d == null) {
        return d
    }
    if (e.isRepeated()) {
        var c = [];
        goog.proto2.Util.assert(goog.isArray(d));
        for (var a = 0; a < d.length; a++) {
            c[a] = this.getDeserializedValue(e, d[a])
        }
        return c
    } else {
        return this.getDeserializedValue(e, d)
    }
};
goog.proto2.PbLiteSerializer.prototype.getSerializedValue = function(b, a) {
    if (b.getFieldType() == goog.proto2.FieldDescriptor.FieldType.BOOL) {
        return a ? 1 : 0
    }
    return goog.proto2.Serializer.prototype.getSerializedValue.apply(this, arguments)
};
goog.proto2.PbLiteSerializer.prototype.getDeserializedValue = function(b, a) {
    if (b.getFieldType() == goog.proto2.FieldDescriptor.FieldType.BOOL) {
        return a === 1
    }
    return goog.proto2.Serializer.prototype.getDeserializedValue.apply(this, arguments)
};
goog.provide("i18n.phonenumbers.NumberFormat");
goog.provide("i18n.phonenumbers.PhoneNumberDesc");
goog.provide("i18n.phonenumbers.PhoneMetadata");
goog.provide("i18n.phonenumbers.PhoneMetadataCollection");
goog.require("goog.proto2.Message");
i18n.phonenumbers.NumberFormat = function() {
    goog.proto2.Message.apply(this)
};
goog.inherits(i18n.phonenumbers.NumberFormat, goog.proto2.Message);
i18n.phonenumbers.NumberFormat.prototype.clone;
i18n.phonenumbers.NumberFormat.prototype.getPattern = function() {
    return (this.get$Value(1))
};
i18n.phonenumbers.NumberFormat.prototype.getPatternOrDefault = function() {
    return (this.get$ValueOrDefault(1))
};
i18n.phonenumbers.NumberFormat.prototype.setPattern = function(a) {
    this.set$Value(1, a)
};
i18n.phonenumbers.NumberFormat.prototype.hasPattern = function() {
    return this.has$Value(1)
};
i18n.phonenumbers.NumberFormat.prototype.patternCount = function() {
    return this.count$Values(1)
};
i18n.phonenumbers.NumberFormat.prototype.clearPattern = function() {
    this.clear$Field(1)
};
i18n.phonenumbers.NumberFormat.prototype.getFormat = function() {
    return (this.get$Value(2))
};
i18n.phonenumbers.NumberFormat.prototype.getFormatOrDefault = function() {
    return (this.get$ValueOrDefault(2))
};
i18n.phonenumbers.NumberFormat.prototype.setFormat = function(a) {
    this.set$Value(2, a)
};
i18n.phonenumbers.NumberFormat.prototype.hasFormat = function() {
    return this.has$Value(2)
};
i18n.phonenumbers.NumberFormat.prototype.formatCount = function() {
    return this.count$Values(2)
};
i18n.phonenumbers.NumberFormat.prototype.clearFormat = function() {
    this.clear$Field(2)
};
i18n.phonenumbers.NumberFormat.prototype.getLeadingDigitsPattern = function(a) {
    return (this.get$Value(3, a))
};
i18n.phonenumbers.NumberFormat.prototype.getLeadingDigitsPatternOrDefault = function(a) {
    return (this.get$ValueOrDefault(3, a))
};
i18n.phonenumbers.NumberFormat.prototype.addLeadingDigitsPattern = function(a) {
    this.add$Value(3, a)
};
i18n.phonenumbers.NumberFormat.prototype.leadingDigitsPatternArray = function() {
    return (this.array$Values(3))
};
i18n.phonenumbers.NumberFormat.prototype.hasLeadingDigitsPattern = function() {
    return this.has$Value(3)
};
i18n.phonenumbers.NumberFormat.prototype.leadingDigitsPatternCount = function() {
    return this.count$Values(3)
};
i18n.phonenumbers.NumberFormat.prototype.clearLeadingDigitsPattern = function() {
    this.clear$Field(3)
};
i18n.phonenumbers.NumberFormat.prototype.getNationalPrefixFormattingRule = function() {
    return (this.get$Value(4))
};
i18n.phonenumbers.NumberFormat.prototype.getNationalPrefixFormattingRuleOrDefault = function() {
    return (this.get$ValueOrDefault(4))
};
i18n.phonenumbers.NumberFormat.prototype.setNationalPrefixFormattingRule = function(a) {
    this.set$Value(4, a)
};
i18n.phonenumbers.NumberFormat.prototype.hasNationalPrefixFormattingRule = function() {
    return this.has$Value(4)
};
i18n.phonenumbers.NumberFormat.prototype.nationalPrefixFormattingRuleCount = function() {
    return this.count$Values(4)
};
i18n.phonenumbers.NumberFormat.prototype.clearNationalPrefixFormattingRule = function() {
    this.clear$Field(4)
};
i18n.phonenumbers.NumberFormat.prototype.getDomesticCarrierCodeFormattingRule = function() {
    return (this.get$Value(5))
};
i18n.phonenumbers.NumberFormat.prototype.getDomesticCarrierCodeFormattingRuleOrDefault = function() {
    return (this.get$ValueOrDefault(5))
};
i18n.phonenumbers.NumberFormat.prototype.setDomesticCarrierCodeFormattingRule = function(a) {
    this.set$Value(5, a)
};
i18n.phonenumbers.NumberFormat.prototype.hasDomesticCarrierCodeFormattingRule = function() {
    return this.has$Value(5)
};
i18n.phonenumbers.NumberFormat.prototype.domesticCarrierCodeFormattingRuleCount = function() {
    return this.count$Values(5)
};
i18n.phonenumbers.NumberFormat.prototype.clearDomesticCarrierCodeFormattingRule = function() {
    this.clear$Field(5)
};
i18n.phonenumbers.PhoneNumberDesc = function() {
    goog.proto2.Message.apply(this)
};
goog.inherits(i18n.phonenumbers.PhoneNumberDesc, goog.proto2.Message);
i18n.phonenumbers.PhoneNumberDesc.prototype.clone;
i18n.phonenumbers.PhoneNumberDesc.prototype.getNationalNumberPattern = function() {
    return (this.get$Value(2))
};
i18n.phonenumbers.PhoneNumberDesc.prototype.getNationalNumberPatternOrDefault = function() {
    return (this.get$ValueOrDefault(2))
};
i18n.phonenumbers.PhoneNumberDesc.prototype.setNationalNumberPattern = function(a) {
    this.set$Value(2, a)
};
i18n.phonenumbers.PhoneNumberDesc.prototype.hasNationalNumberPattern = function() {
    return this.has$Value(2)
};
i18n.phonenumbers.PhoneNumberDesc.prototype.nationalNumberPatternCount = function() {
    return this.count$Values(2)
};
i18n.phonenumbers.PhoneNumberDesc.prototype.clearNationalNumberPattern = function() {
    this.clear$Field(2)
};
i18n.phonenumbers.PhoneNumberDesc.prototype.getPossibleNumberPattern = function() {
    return (this.get$Value(3))
};
i18n.phonenumbers.PhoneNumberDesc.prototype.getPossibleNumberPatternOrDefault = function() {
    return (this.get$ValueOrDefault(3))
};
i18n.phonenumbers.PhoneNumberDesc.prototype.setPossibleNumberPattern = function(a) {
    this.set$Value(3, a)
};
i18n.phonenumbers.PhoneNumberDesc.prototype.hasPossibleNumberPattern = function() {
    return this.has$Value(3)
};
i18n.phonenumbers.PhoneNumberDesc.prototype.possibleNumberPatternCount = function() {
    return this.count$Values(3)
};
i18n.phonenumbers.PhoneNumberDesc.prototype.clearPossibleNumberPattern = function() {
    this.clear$Field(3)
};
i18n.phonenumbers.PhoneNumberDesc.prototype.getExampleNumber = function() {
    return (this.get$Value(6))
};
i18n.phonenumbers.PhoneNumberDesc.prototype.getExampleNumberOrDefault = function() {
    return (this.get$ValueOrDefault(6))
};
i18n.phonenumbers.PhoneNumberDesc.prototype.setExampleNumber = function(a) {
    this.set$Value(6, a)
};
i18n.phonenumbers.PhoneNumberDesc.prototype.hasExampleNumber = function() {
    return this.has$Value(6)
};
i18n.phonenumbers.PhoneNumberDesc.prototype.exampleNumberCount = function() {
    return this.count$Values(6)
};
i18n.phonenumbers.PhoneNumberDesc.prototype.clearExampleNumber = function() {
    this.clear$Field(6)
};
i18n.phonenumbers.PhoneMetadata = function() {
    goog.proto2.Message.apply(this)
};
goog.inherits(i18n.phonenumbers.PhoneMetadata, goog.proto2.Message);
i18n.phonenumbers.PhoneMetadata.prototype.clone;
i18n.phonenumbers.PhoneMetadata.prototype.getGeneralDesc = function() {
    return (this.get$Value(1))
};
i18n.phonenumbers.PhoneMetadata.prototype.getGeneralDescOrDefault = function() {
    return (this.get$ValueOrDefault(1))
};
i18n.phonenumbers.PhoneMetadata.prototype.setGeneralDesc = function(a) {
    this.set$Value(1, a)
};
i18n.phonenumbers.PhoneMetadata.prototype.hasGeneralDesc = function() {
    return this.has$Value(1)
};
i18n.phonenumbers.PhoneMetadata.prototype.generalDescCount = function() {
    return this.count$Values(1)
};
i18n.phonenumbers.PhoneMetadata.prototype.clearGeneralDesc = function() {
    this.clear$Field(1)
};
i18n.phonenumbers.PhoneMetadata.prototype.getFixedLine = function() {
    return (this.get$Value(2))
};
i18n.phonenumbers.PhoneMetadata.prototype.getFixedLineOrDefault = function() {
    return (this.get$ValueOrDefault(2))
};
i18n.phonenumbers.PhoneMetadata.prototype.setFixedLine = function(a) {
    this.set$Value(2, a)
};
i18n.phonenumbers.PhoneMetadata.prototype.hasFixedLine = function() {
    return this.has$Value(2)
};
i18n.phonenumbers.PhoneMetadata.prototype.fixedLineCount = function() {
    return this.count$Values(2)
};
i18n.phonenumbers.PhoneMetadata.prototype.clearFixedLine = function() {
    this.clear$Field(2)
};
i18n.phonenumbers.PhoneMetadata.prototype.getMobile = function() {
    return (this.get$Value(3))
};
i18n.phonenumbers.PhoneMetadata.prototype.getMobileOrDefault = function() {
    return (this.get$ValueOrDefault(3))
};
i18n.phonenumbers.PhoneMetadata.prototype.setMobile = function(a) {
    this.set$Value(3, a)
};
i18n.phonenumbers.PhoneMetadata.prototype.hasMobile = function() {
    return this.has$Value(3)
};
i18n.phonenumbers.PhoneMetadata.prototype.mobileCount = function() {
    return this.count$Values(3)
};
i18n.phonenumbers.PhoneMetadata.prototype.clearMobile = function() {
    this.clear$Field(3)
};
i18n.phonenumbers.PhoneMetadata.prototype.getTollFree = function() {
    return (this.get$Value(4))
};
i18n.phonenumbers.PhoneMetadata.prototype.getTollFreeOrDefault = function() {
    return (this.get$ValueOrDefault(4))
};
i18n.phonenumbers.PhoneMetadata.prototype.setTollFree = function(a) {
    this.set$Value(4, a)
};
i18n.phonenumbers.PhoneMetadata.prototype.hasTollFree = function() {
    return this.has$Value(4)
};
i18n.phonenumbers.PhoneMetadata.prototype.tollFreeCount = function() {
    return this.count$Values(4)
};
i18n.phonenumbers.PhoneMetadata.prototype.clearTollFree = function() {
    this.clear$Field(4)
};
i18n.phonenumbers.PhoneMetadata.prototype.getPremiumRate = function() {
    return (this.get$Value(5))
};
i18n.phonenumbers.PhoneMetadata.prototype.getPremiumRateOrDefault = function() {
    return (this.get$ValueOrDefault(5))
};
i18n.phonenumbers.PhoneMetadata.prototype.setPremiumRate = function(a) {
    this.set$Value(5, a)
};
i18n.phonenumbers.PhoneMetadata.prototype.hasPremiumRate = function() {
    return this.has$Value(5)
};
i18n.phonenumbers.PhoneMetadata.prototype.premiumRateCount = function() {
    return this.count$Values(5)
};
i18n.phonenumbers.PhoneMetadata.prototype.clearPremiumRate = function() {
    this.clear$Field(5)
};
i18n.phonenumbers.PhoneMetadata.prototype.getSharedCost = function() {
    return (this.get$Value(6))
};
i18n.phonenumbers.PhoneMetadata.prototype.getSharedCostOrDefault = function() {
    return (this.get$ValueOrDefault(6))
};
i18n.phonenumbers.PhoneMetadata.prototype.setSharedCost = function(a) {
    this.set$Value(6, a)
};
i18n.phonenumbers.PhoneMetadata.prototype.hasSharedCost = function() {
    return this.has$Value(6)
};
i18n.phonenumbers.PhoneMetadata.prototype.sharedCostCount = function() {
    return this.count$Values(6)
};
i18n.phonenumbers.PhoneMetadata.prototype.clearSharedCost = function() {
    this.clear$Field(6)
};
i18n.phonenumbers.PhoneMetadata.prototype.getPersonalNumber = function() {
    return (this.get$Value(7))
};
i18n.phonenumbers.PhoneMetadata.prototype.getPersonalNumberOrDefault = function() {
    return (this.get$ValueOrDefault(7))
};
i18n.phonenumbers.PhoneMetadata.prototype.setPersonalNumber = function(a) {
    this.set$Value(7, a)
};
i18n.phonenumbers.PhoneMetadata.prototype.hasPersonalNumber = function() {
    return this.has$Value(7)
};
i18n.phonenumbers.PhoneMetadata.prototype.personalNumberCount = function() {
    return this.count$Values(7)
};
i18n.phonenumbers.PhoneMetadata.prototype.clearPersonalNumber = function() {
    this.clear$Field(7)
};
i18n.phonenumbers.PhoneMetadata.prototype.getVoip = function() {
    return (this.get$Value(8))
};
i18n.phonenumbers.PhoneMetadata.prototype.getVoipOrDefault = function() {
    return (this.get$ValueOrDefault(8))
};
i18n.phonenumbers.PhoneMetadata.prototype.setVoip = function(a) {
    this.set$Value(8, a)
};
i18n.phonenumbers.PhoneMetadata.prototype.hasVoip = function() {
    return this.has$Value(8)
};
i18n.phonenumbers.PhoneMetadata.prototype.voipCount = function() {
    return this.count$Values(8)
};
i18n.phonenumbers.PhoneMetadata.prototype.clearVoip = function() {
    this.clear$Field(8)
};
i18n.phonenumbers.PhoneMetadata.prototype.getPager = function() {
    return (this.get$Value(21))
};
i18n.phonenumbers.PhoneMetadata.prototype.getPagerOrDefault = function() {
    return (this.get$ValueOrDefault(21))
};
i18n.phonenumbers.PhoneMetadata.prototype.setPager = function(a) {
    this.set$Value(21, a)
};
i18n.phonenumbers.PhoneMetadata.prototype.hasPager = function() {
    return this.has$Value(21)
};
i18n.phonenumbers.PhoneMetadata.prototype.pagerCount = function() {
    return this.count$Values(21)
};
i18n.phonenumbers.PhoneMetadata.prototype.clearPager = function() {
    this.clear$Field(21)
};
i18n.phonenumbers.PhoneMetadata.prototype.getUan = function() {
    return (this.get$Value(25))
};
i18n.phonenumbers.PhoneMetadata.prototype.getUanOrDefault = function() {
    return (this.get$ValueOrDefault(25))
};
i18n.phonenumbers.PhoneMetadata.prototype.setUan = function(a) {
    this.set$Value(25, a)
};
i18n.phonenumbers.PhoneMetadata.prototype.hasUan = function() {
    return this.has$Value(25)
};
i18n.phonenumbers.PhoneMetadata.prototype.uanCount = function() {
    return this.count$Values(25)
};
i18n.phonenumbers.PhoneMetadata.prototype.clearUan = function() {
    this.clear$Field(25)
};
i18n.phonenumbers.PhoneMetadata.prototype.getNoInternationalDialling = function() {
    return (this.get$Value(24))
};
i18n.phonenumbers.PhoneMetadata.prototype.getNoInternationalDiallingOrDefault = function() {
    return (this.get$ValueOrDefault(24))
};
i18n.phonenumbers.PhoneMetadata.prototype.setNoInternationalDialling = function(a) {
    this.set$Value(24, a)
};
i18n.phonenumbers.PhoneMetadata.prototype.hasNoInternationalDialling = function() {
    return this.has$Value(24)
};
i18n.phonenumbers.PhoneMetadata.prototype.noInternationalDiallingCount = function() {
    return this.count$Values(24)
};
i18n.phonenumbers.PhoneMetadata.prototype.clearNoInternationalDialling = function() {
    this.clear$Field(24)
};
i18n.phonenumbers.PhoneMetadata.prototype.getId = function() {
    return (this.get$Value(9))
};
i18n.phonenumbers.PhoneMetadata.prototype.getIdOrDefault = function() {
    return (this.get$ValueOrDefault(9))
};
i18n.phonenumbers.PhoneMetadata.prototype.setId = function(a) {
    this.set$Value(9, a)
};
i18n.phonenumbers.PhoneMetadata.prototype.hasId = function() {
    return this.has$Value(9)
};
i18n.phonenumbers.PhoneMetadata.prototype.idCount = function() {
    return this.count$Values(9)
};
i18n.phonenumbers.PhoneMetadata.prototype.clearId = function() {
    this.clear$Field(9)
};
i18n.phonenumbers.PhoneMetadata.prototype.getCountryCode = function() {
    return (this.get$Value(10))
};
i18n.phonenumbers.PhoneMetadata.prototype.getCountryCodeOrDefault = function() {
    return (this.get$ValueOrDefault(10))
};
i18n.phonenumbers.PhoneMetadata.prototype.setCountryCode = function(a) {
    this.set$Value(10, a)
};
i18n.phonenumbers.PhoneMetadata.prototype.hasCountryCode = function() {
    return this.has$Value(10)
};
i18n.phonenumbers.PhoneMetadata.prototype.countryCodeCount = function() {
    return this.count$Values(10)
};
i18n.phonenumbers.PhoneMetadata.prototype.clearCountryCode = function() {
    this.clear$Field(10)
};
i18n.phonenumbers.PhoneMetadata.prototype.getInternationalPrefix = function() {
    return (this.get$Value(11))
};
i18n.phonenumbers.PhoneMetadata.prototype.getInternationalPrefixOrDefault = function() {
    return (this.get$ValueOrDefault(11))
};
i18n.phonenumbers.PhoneMetadata.prototype.setInternationalPrefix = function(a) {
    this.set$Value(11, a)
};
i18n.phonenumbers.PhoneMetadata.prototype.hasInternationalPrefix = function() {
    return this.has$Value(11)
};
i18n.phonenumbers.PhoneMetadata.prototype.internationalPrefixCount = function() {
    return this.count$Values(11)
};
i18n.phonenumbers.PhoneMetadata.prototype.clearInternationalPrefix = function() {
    this.clear$Field(11)
};
i18n.phonenumbers.PhoneMetadata.prototype.getPreferredInternationalPrefix = function() {
    return (this.get$Value(17))
};
i18n.phonenumbers.PhoneMetadata.prototype.getPreferredInternationalPrefixOrDefault = function() {
    return (this.get$ValueOrDefault(17))
};
i18n.phonenumbers.PhoneMetadata.prototype.setPreferredInternationalPrefix = function(a) {
    this.set$Value(17, a)
};
i18n.phonenumbers.PhoneMetadata.prototype.hasPreferredInternationalPrefix = function() {
    return this.has$Value(17)
};
i18n.phonenumbers.PhoneMetadata.prototype.preferredInternationalPrefixCount = function() {
    return this.count$Values(17)
};
i18n.phonenumbers.PhoneMetadata.prototype.clearPreferredInternationalPrefix = function() {
    this.clear$Field(17)
};
i18n.phonenumbers.PhoneMetadata.prototype.getNationalPrefix = function() {
    return (this.get$Value(12))
};
i18n.phonenumbers.PhoneMetadata.prototype.getNationalPrefixOrDefault = function() {
    return (this.get$ValueOrDefault(12))
};
i18n.phonenumbers.PhoneMetadata.prototype.setNationalPrefix = function(a) {
    this.set$Value(12, a)
};
i18n.phonenumbers.PhoneMetadata.prototype.hasNationalPrefix = function() {
    return this.has$Value(12)
};
i18n.phonenumbers.PhoneMetadata.prototype.nationalPrefixCount = function() {
    return this.count$Values(12)
};
i18n.phonenumbers.PhoneMetadata.prototype.clearNationalPrefix = function() {
    this.clear$Field(12)
};
i18n.phonenumbers.PhoneMetadata.prototype.getPreferredExtnPrefix = function() {
    return (this.get$Value(13))
};
i18n.phonenumbers.PhoneMetadata.prototype.getPreferredExtnPrefixOrDefault = function() {
    return (this.get$ValueOrDefault(13))
};
i18n.phonenumbers.PhoneMetadata.prototype.setPreferredExtnPrefix = function(a) {
    this.set$Value(13, a)
};
i18n.phonenumbers.PhoneMetadata.prototype.hasPreferredExtnPrefix = function() {
    return this.has$Value(13)
};
i18n.phonenumbers.PhoneMetadata.prototype.preferredExtnPrefixCount = function() {
    return this.count$Values(13)
};
i18n.phonenumbers.PhoneMetadata.prototype.clearPreferredExtnPrefix = function() {
    this.clear$Field(13)
};
i18n.phonenumbers.PhoneMetadata.prototype.getNationalPrefixForParsing = function() {
    return (this.get$Value(15))
};
i18n.phonenumbers.PhoneMetadata.prototype.getNationalPrefixForParsingOrDefault = function() {
    return (this.get$ValueOrDefault(15))
};
i18n.phonenumbers.PhoneMetadata.prototype.setNationalPrefixForParsing = function(a) {
    this.set$Value(15, a)
};
i18n.phonenumbers.PhoneMetadata.prototype.hasNationalPrefixForParsing = function() {
    return this.has$Value(15)
};
i18n.phonenumbers.PhoneMetadata.prototype.nationalPrefixForParsingCount = function() {
    return this.count$Values(15)
};
i18n.phonenumbers.PhoneMetadata.prototype.clearNationalPrefixForParsing = function() {
    this.clear$Field(15)
};
i18n.phonenumbers.PhoneMetadata.prototype.getNationalPrefixTransformRule = function() {
    return (this.get$Value(16))
};
i18n.phonenumbers.PhoneMetadata.prototype.getNationalPrefixTransformRuleOrDefault = function() {
    return (this.get$ValueOrDefault(16))
};
i18n.phonenumbers.PhoneMetadata.prototype.setNationalPrefixTransformRule = function(a) {
    this.set$Value(16, a)
};
i18n.phonenumbers.PhoneMetadata.prototype.hasNationalPrefixTransformRule = function() {
    return this.has$Value(16)
};
i18n.phonenumbers.PhoneMetadata.prototype.nationalPrefixTransformRuleCount = function() {
    return this.count$Values(16)
};
i18n.phonenumbers.PhoneMetadata.prototype.clearNationalPrefixTransformRule = function() {
    this.clear$Field(16)
};
i18n.phonenumbers.PhoneMetadata.prototype.getSameMobileAndFixedLinePattern = function() {
    return (this.get$Value(18))
};
i18n.phonenumbers.PhoneMetadata.prototype.getSameMobileAndFixedLinePatternOrDefault = function() {
    return (this.get$ValueOrDefault(18))
};
i18n.phonenumbers.PhoneMetadata.prototype.setSameMobileAndFixedLinePattern = function(a) {
    this.set$Value(18, a)
};
i18n.phonenumbers.PhoneMetadata.prototype.hasSameMobileAndFixedLinePattern = function() {
    return this.has$Value(18)
};
i18n.phonenumbers.PhoneMetadata.prototype.sameMobileAndFixedLinePatternCount = function() {
    return this.count$Values(18)
};
i18n.phonenumbers.PhoneMetadata.prototype.clearSameMobileAndFixedLinePattern = function() {
    this.clear$Field(18)
};
i18n.phonenumbers.PhoneMetadata.prototype.getNumberFormat = function(a) {
    return (this.get$Value(19, a))
};
i18n.phonenumbers.PhoneMetadata.prototype.getNumberFormatOrDefault = function(a) {
    return (this.get$ValueOrDefault(19, a))
};
i18n.phonenumbers.PhoneMetadata.prototype.addNumberFormat = function(a) {
    this.add$Value(19, a)
};
i18n.phonenumbers.PhoneMetadata.prototype.numberFormatArray = function() {
    return (this.array$Values(19))
};
i18n.phonenumbers.PhoneMetadata.prototype.hasNumberFormat = function() {
    return this.has$Value(19)
};
i18n.phonenumbers.PhoneMetadata.prototype.numberFormatCount = function() {
    return this.count$Values(19)
};
i18n.phonenumbers.PhoneMetadata.prototype.clearNumberFormat = function() {
    this.clear$Field(19)
};
i18n.phonenumbers.PhoneMetadata.prototype.getIntlNumberFormat = function(a) {
    return (this.get$Value(20, a))
};
i18n.phonenumbers.PhoneMetadata.prototype.getIntlNumberFormatOrDefault = function(a) {
    return (this.get$ValueOrDefault(20, a))
};
i18n.phonenumbers.PhoneMetadata.prototype.addIntlNumberFormat = function(a) {
    this.add$Value(20, a)
};
i18n.phonenumbers.PhoneMetadata.prototype.intlNumberFormatArray = function() {
    return (this.array$Values(20))
};
i18n.phonenumbers.PhoneMetadata.prototype.hasIntlNumberFormat = function() {
    return this.has$Value(20)
};
i18n.phonenumbers.PhoneMetadata.prototype.intlNumberFormatCount = function() {
    return this.count$Values(20)
};
i18n.phonenumbers.PhoneMetadata.prototype.clearIntlNumberFormat = function() {
    this.clear$Field(20)
};
i18n.phonenumbers.PhoneMetadata.prototype.getMainCountryForCode = function() {
    return (this.get$Value(22))
};
i18n.phonenumbers.PhoneMetadata.prototype.getMainCountryForCodeOrDefault = function() {
    return (this.get$ValueOrDefault(22))
};
i18n.phonenumbers.PhoneMetadata.prototype.setMainCountryForCode = function(a) {
    this.set$Value(22, a)
};
i18n.phonenumbers.PhoneMetadata.prototype.hasMainCountryForCode = function() {
    return this.has$Value(22)
};
i18n.phonenumbers.PhoneMetadata.prototype.mainCountryForCodeCount = function() {
    return this.count$Values(22)
};
i18n.phonenumbers.PhoneMetadata.prototype.clearMainCountryForCode = function() {
    this.clear$Field(22)
};
i18n.phonenumbers.PhoneMetadata.prototype.getLeadingDigits = function() {
    return (this.get$Value(23))
};
i18n.phonenumbers.PhoneMetadata.prototype.getLeadingDigitsOrDefault = function() {
    return (this.get$ValueOrDefault(23))
};
i18n.phonenumbers.PhoneMetadata.prototype.setLeadingDigits = function(a) {
    this.set$Value(23, a)
};
i18n.phonenumbers.PhoneMetadata.prototype.hasLeadingDigits = function() {
    return this.has$Value(23)
};
i18n.phonenumbers.PhoneMetadata.prototype.leadingDigitsCount = function() {
    return this.count$Values(23)
};
i18n.phonenumbers.PhoneMetadata.prototype.clearLeadingDigits = function() {
    this.clear$Field(23)
};
i18n.phonenumbers.PhoneMetadata.prototype.getLeadingZeroPossible = function() {
    return (this.get$Value(26))
};
i18n.phonenumbers.PhoneMetadata.prototype.getLeadingZeroPossibleOrDefault = function() {
    return (this.get$ValueOrDefault(26))
};
i18n.phonenumbers.PhoneMetadata.prototype.setLeadingZeroPossible = function(a) {
    this.set$Value(26, a)
};
i18n.phonenumbers.PhoneMetadata.prototype.hasLeadingZeroPossible = function() {
    return this.has$Value(26)
};
i18n.phonenumbers.PhoneMetadata.prototype.leadingZeroPossibleCount = function() {
    return this.count$Values(26)
};
i18n.phonenumbers.PhoneMetadata.prototype.clearLeadingZeroPossible = function() {
    this.clear$Field(26)
};
i18n.phonenumbers.PhoneMetadataCollection = function() {
    goog.proto2.Message.apply(this)
};
goog.inherits(i18n.phonenumbers.PhoneMetadataCollection, goog.proto2.Message);
i18n.phonenumbers.PhoneMetadataCollection.prototype.clone;
i18n.phonenumbers.PhoneMetadataCollection.prototype.getMetadata = function(a) {
    return (this.get$Value(1, a))
};
i18n.phonenumbers.PhoneMetadataCollection.prototype.getMetadataOrDefault = function(a) {
    return (this.get$ValueOrDefault(1, a))
};
i18n.phonenumbers.PhoneMetadataCollection.prototype.addMetadata = function(a) {
    this.add$Value(1, a)
};
i18n.phonenumbers.PhoneMetadataCollection.prototype.metadataArray = function() {
    return (this.array$Values(1))
};
i18n.phonenumbers.PhoneMetadataCollection.prototype.hasMetadata = function() {
    return this.has$Value(1)
};
i18n.phonenumbers.PhoneMetadataCollection.prototype.metadataCount = function() {
    return this.count$Values(1)
};
i18n.phonenumbers.PhoneMetadataCollection.prototype.clearMetadata = function() {
    this.clear$Field(1)
};
goog.proto2.Message.set$Metadata(i18n.phonenumbers.NumberFormat, {
    0: {
        name: "NumberFormat",
        fullName: "i18n.phonenumbers.NumberFormat"
    },
    1: {
        name: "pattern",
        required: true,
        fieldType: goog.proto2.Message.FieldType.STRING,
        type: String
    },
    2: {
        name: "format",
        required: true,
        fieldType: goog.proto2.Message.FieldType.STRING,
        type: String
    },
    3: {
        name: "leading_digits_pattern",
        repeated: true,
        fieldType: goog.proto2.Message.FieldType.STRING,
        type: String
    },
    4: {
        name: "national_prefix_formatting_rule",
        fieldType: goog.proto2.Message.FieldType.STRING,
        type: String
    },
    5: {
        name: "domestic_carrier_code_formatting_rule",
        fieldType: goog.proto2.Message.FieldType.STRING,
        type: String
    }
});
goog.proto2.Message.set$Metadata(i18n.phonenumbers.PhoneNumberDesc, {
    0: {
        name: "PhoneNumberDesc",
        fullName: "i18n.phonenumbers.PhoneNumberDesc"
    },
    2: {
        name: "national_number_pattern",
        fieldType: goog.proto2.Message.FieldType.STRING,
        type: String
    },
    3: {
        name: "possible_number_pattern",
        fieldType: goog.proto2.Message.FieldType.STRING,
        type: String
    },
    6: {
        name: "example_number",
        fieldType: goog.proto2.Message.FieldType.STRING,
        type: String
    }
});
goog.proto2.Message.set$Metadata(i18n.phonenumbers.PhoneMetadata, {
    0: {
        name: "PhoneMetadata",
        fullName: "i18n.phonenumbers.PhoneMetadata"
    },
    1: {
        name: "general_desc",
        required: true,
        fieldType: goog.proto2.Message.FieldType.MESSAGE,
        type: i18n.phonenumbers.PhoneNumberDesc
    },
    2: {
        name: "fixed_line",
        required: true,
        fieldType: goog.proto2.Message.FieldType.MESSAGE,
        type: i18n.phonenumbers.PhoneNumberDesc
    },
    3: {
        name: "mobile",
        required: true,
        fieldType: goog.proto2.Message.FieldType.MESSAGE,
        type: i18n.phonenumbers.PhoneNumberDesc
    },
    4: {
        name: "toll_free",
        required: true,
        fieldType: goog.proto2.Message.FieldType.MESSAGE,
        type: i18n.phonenumbers.PhoneNumberDesc
    },
    5: {
        name: "premium_rate",
        required: true,
        fieldType: goog.proto2.Message.FieldType.MESSAGE,
        type: i18n.phonenumbers.PhoneNumberDesc
    },
    6: {
        name: "shared_cost",
        required: true,
        fieldType: goog.proto2.Message.FieldType.MESSAGE,
        type: i18n.phonenumbers.PhoneNumberDesc
    },
    7: {
        name: "personal_number",
        required: true,
        fieldType: goog.proto2.Message.FieldType.MESSAGE,
        type: i18n.phonenumbers.PhoneNumberDesc
    },
    8: {
        name: "voip",
        required: true,
        fieldType: goog.proto2.Message.FieldType.MESSAGE,
        type: i18n.phonenumbers.PhoneNumberDesc
    },
    21: {
        name: "pager",
        required: true,
        fieldType: goog.proto2.Message.FieldType.MESSAGE,
        type: i18n.phonenumbers.PhoneNumberDesc
    },
    25: {
        name: "uan",
        required: true,
        fieldType: goog.proto2.Message.FieldType.MESSAGE,
        type: i18n.phonenumbers.PhoneNumberDesc
    },
    24: {
        name: "no_international_dialling",
        required: true,
        fieldType: goog.proto2.Message.FieldType.MESSAGE,
        type: i18n.phonenumbers.PhoneNumberDesc
    },
    9: {
        name: "id",
        required: true,
        fieldType: goog.proto2.Message.FieldType.STRING,
        type: String
    },
    10: {
        name: "country_code",
        required: true,
        fieldType: goog.proto2.Message.FieldType.INT32,
        type: Number
    },
    11: {
        name: "international_prefix",
        required: true,
        fieldType: goog.proto2.Message.FieldType.STRING,
        type: String
    },
    17: {
        name: "preferred_international_prefix",
        fieldType: goog.proto2.Message.FieldType.STRING,
        type: String
    },
    12: {
        name: "national_prefix",
        fieldType: goog.proto2.Message.FieldType.STRING,
        type: String
    },
    13: {
        name: "preferred_extn_prefix",
        fieldType: goog.proto2.Message.FieldType.STRING,
        type: String
    },
    15: {
        name: "national_prefix_for_parsing",
        fieldType: goog.proto2.Message.FieldType.STRING,
        type: String
    },
    16: {
        name: "national_prefix_transform_rule",
        fieldType: goog.proto2.Message.FieldType.STRING,
        type: String
    },
    18: {
        name: "same_mobile_and_fixed_line_pattern",
        fieldType: goog.proto2.Message.FieldType.BOOL,
        defaultValue: false,
        type: Boolean
    },
    19: {
        name: "number_format",
        repeated: true,
        fieldType: goog.proto2.Message.FieldType.MESSAGE,
        type: i18n.phonenumbers.NumberFormat
    },
    20: {
        name: "intl_number_format",
        repeated: true,
        fieldType: goog.proto2.Message.FieldType.MESSAGE,
        type: i18n.phonenumbers.NumberFormat
    },
    22: {
        name: "main_country_for_code",
        fieldType: goog.proto2.Message.FieldType.BOOL,
        defaultValue: false,
        type: Boolean
    },
    23: {
        name: "leading_digits",
        fieldType: goog.proto2.Message.FieldType.STRING,
        type: String
    },
    26: {
        name: "leading_zero_possible",
        fieldType: goog.proto2.Message.FieldType.BOOL,
        defaultValue: false,
        type: Boolean
    }
});
goog.proto2.Message.set$Metadata(i18n.phonenumbers.PhoneMetadataCollection, {
    0: {
        name: "PhoneMetadataCollection",
        fullName: "i18n.phonenumbers.PhoneMetadataCollection"
    },
    1: {
        name: "metadata",
        repeated: true,
        fieldType: goog.proto2.Message.FieldType.MESSAGE,
        type: i18n.phonenumbers.PhoneMetadata
    }
});
goog.provide("i18n.phonenumbers.metadata");
i18n.phonenumbers.metadata.countryCodeToRegionCodeMap = {
    1: ["US", "AG", "AI", "AS", "BB", "BM", "BS", "CA", "DM", "DO", "GD", "GU", "JM", "KN", "KY", "LC", "MP", "MS", "PR", "TC", "TT", "VC", "VG", "VI"],
    7: ["RU", "KZ"],
    20: ["EG"],
    27: ["ZA"],
    30: ["GR"],
    31: ["NL"],
    32: ["BE"],
    33: ["FR"],
    34: ["ES"],
    36: ["HU"],
    39: ["IT"],
    40: ["RO"],
    41: ["CH"],
    43: ["AT"],
    44: ["GB", "GG", "IM", "JE"],
    45: ["DK"],
    46: ["SE"],
    47: ["NO", "SJ"],
    48: ["PL"],
    49: ["DE"],
    51: ["PE"],
    52: ["MX"],
    53: ["CU"],
    54: ["AR"],
    55: ["BR"],
    56: ["CL"],
    57: ["CO"],
    58: ["VE"],
    60: ["MY"],
    61: ["AU", "CC", "CX"],
    62: ["ID"],
    63: ["PH"],
    64: ["NZ"],
    65: ["SG"],
    66: ["TH"],
    81: ["JP"],
    82: ["KR"],
    84: ["VN"],
    86: ["CN"],
    90: ["TR"],
    91: ["IN"],
    92: ["PK"],
    93: ["AF"],
    94: ["LK"],
    95: ["MM"],
    98: ["IR"],
    212: ["MA"],
    213: ["DZ"],
    216: ["TN"],
    218: ["LY"],
    220: ["GM"],
    221: ["SN"],
    222: ["MR"],
    223: ["ML"],
    224: ["GN"],
    225: ["CI"],
    226: ["BF"],
    227: ["NE"],
    228: ["TG"],
    229: ["BJ"],
    230: ["MU"],
    231: ["LR"],
    232: ["SL"],
    233: ["GH"],
    234: ["NG"],
    235: ["TD"],
    236: ["CF"],
    237: ["CM"],
    238: ["CV"],
    239: ["ST"],
    240: ["GQ"],
    241: ["GA"],
    242: ["CG"],
    243: ["CD"],
    244: ["AO"],
    245: ["GW"],
    246: ["IO"],
    247: ["AC"],
    248: ["SC"],
    249: ["SD"],
    250: ["RW"],
    251: ["ET"],
    252: ["SO"],
    253: ["DJ"],
    254: ["KE"],
    255: ["TZ"],
    256: ["UG"],
    257: ["BI"],
    258: ["MZ"],
    260: ["ZM"],
    261: ["MG"],
    262: ["RE", "TF", "YT"],
    263: ["ZW"],
    264: ["NA"],
    265: ["MW"],
    266: ["LS"],
    267: ["BW"],
    268: ["SZ"],
    269: ["KM"],
    290: ["SH"],
    291: ["ER"],
    297: ["AW"],
    298: ["FO"],
    299: ["GL"],
    350: ["GI"],
    351: ["PT"],
    352: ["LU"],
    353: ["IE"],
    354: ["IS"],
    355: ["AL"],
    356: ["MT"],
    357: ["CY"],
    358: ["FI", "AX"],
    359: ["BG"],
    370: ["LT"],
    371: ["LV"],
    372: ["EE"],
    373: ["MD"],
    374: ["AM"],
    375: ["BY"],
    376: ["AD"],
    377: ["MC"],
    378: ["SM"],
    379: ["VA"],
    380: ["UA"],
    381: ["RS"],
    382: ["ME"],
    385: ["HR"],
    386: ["SI"],
    387: ["BA"],
    389: ["MK"],
    420: ["CZ"],
    421: ["SK"],
    423: ["LI"],
    500: ["FK"],
    501: ["BZ"],
    502: ["GT"],
    503: ["SV"],
    504: ["HN"],
    505: ["NI"],
    506: ["CR"],
    507: ["PA"],
    508: ["PM"],
    509: ["HT"],
    590: ["GP", "BL", "MF"],
    591: ["BO"],
    592: ["GY"],
    593: ["EC"],
    594: ["GF"],
    595: ["PY"],
    596: ["MQ"],
    597: ["SR"],
    598: ["UY"],
    599: ["AN"],
    670: ["TL"],
    672: ["NF"],
    673: ["BN"],
    674: ["NR"],
    675: ["PG"],
    676: ["TO"],
    677: ["SB"],
    678: ["VU"],
    679: ["FJ"],
    680: ["PW"],
    681: ["WF"],
    682: ["CK"],
    683: ["NU"],
    685: ["WS"],
    686: ["KI"],
    687: ["NC"],
    688: ["TV"],
    689: ["PF"],
    690: ["TK"],
    691: ["FM"],
    692: ["MH"],
    850: ["KP"],
    852: ["HK"],
    853: ["MO"],
    855: ["KH"],
    856: ["LA"],
    880: ["BD"],
    886: ["TW"],
    960: ["MV"],
    961: ["LB"],
    962: ["JO"],
    963: ["SY"],
    964: ["IQ"],
    965: ["KW"],
    966: ["SA"],
    967: ["YE"],
    968: ["OM"],
    970: ["PS"],
    971: ["AE"],
    972: ["IL"],
    973: ["BH"],
    974: ["QA"],
    975: ["BT"],
    976: ["MN"],
    977: ["NP"],
    992: ["TJ"],
    993: ["TM"],
    994: ["AZ"],
    995: ["GE"],
    996: ["KG"],
    998: ["UZ"]
};
i18n.phonenumbers.metadata.countryToMetadata = {
    AC: [, [, , "[2-46]\\d{3}", "\\d{4}"], [, , "(?:3[0-5]|4[4-6]|[26]\\d)\\d{2}", "\\d{4}"], [, , "NA", "NA"], [, , "NA", "NA"], [, , "NA", "NA"], [, , "NA", "NA"], [, , "NA", "NA"], [, , "NA", "NA"], "AC", 247, "00", , , , , , , , , , [, , "NA", "NA"],
    ,
    ,
    [,
    ,
    "NA",
    "NA"],
    [,
    ,
    "NA",
    "NA"]],
    AD: [,
    [,
    ,
    "(?:[346-9]|180)\\d{5}",
    "\\d{6,8}"],
    [,
    ,
    "[78]\\d{5}",
    "\\d{6}"],
    [,
    ,
    "[346]\\d{5}",
    "\\d{6}"],
    [,
    ,
    "180[02]\\d{4}",
    "\\d{8}"],
    [,
    ,
    "9\\d{5}",
    "\\d{6}"],
    [,
    ,
    "NA",
    "NA"],
    [,
    ,
    "NA",
    "NA"],
    [,
    ,
    "NA",
    "NA"],
    "AD",
    376,
    "00",
    ,
    ,
    ,
    ,
    ,
    ,
    ,
    [[,
    "(\\d{3})(\\d{3})",
    "$1 $2",
    ["[346-9]"],
    "",
    ""],
    [,
    "(180[02])(\\d{4})",
    "$1 $2",
    ["1"],
    "",
    ""]],
    ,
    [,
    ,
    "NA",
    "NA"],
    ,
    ,
    [,
    ,
    "NA",
    "NA"],
    [,
    ,
    "NA",
    "NA"]],
    AE: [,
    [,
    ,
    "[2-79]\\d{7,8}|800\\d{2,9}",
    "\\d{5,12}"],
    [,
    ,
    "(?:[2-4679][2-8]\\d|600[25])\\d{5}",
    "\\d{7,9}"],
    [,
    ,
    "5[056]\\d{7}",
    "\\d{9}"],
    [,
    ,
    "400\\d{6}|800\\d{2,9}",
    "\\d{5,12}"],
    [,
    ,
    "900[02]\\d{5}",
    "\\d{9}"],
    [,
    ,
    "700[05]\\d{5}",
    "\\d{9}"],
    [,
    ,
    "NA",
    "NA"],
    [,
    ,
    "NA",
    "NA"],
    "AE",
    971,
    "00",
    "0",
    ,
    ,
    "0",
    ,
    ,
    ,
    [[,
    "([2-4679])(\\d{3})(\\d{4})",
    "$1 $2 $3",
    ["[2-4679][2-8]"],
    "0$1",
    ""],
    [,
    "(5[056])(\\d{3})(\\d{4})",
    "$1 $2 $3",
    ["5"],
    "0$1",
    ""],
    [,
    "([4679]00)(\\d)(\\d{5})",
    "$1 $2 $3",
    ["[4679]0"],
    "$1",
    ""],
    [,
    "(800)(\\d{2,9})",
    "$1 $2",
    ["8"],
    "$1",
    ""]],
    ,
    [,
    ,
    "NA",
    "NA"],
    ,
    ,
    [,
    ,
    "NA",
    "NA"],
    [,
    ,
    "NA",
    "NA"]],
    AF: [,
    [,
    ,
    "[2-7]\\d{8}",
    "\\d{7,9}"],
    [,
    ,
    "(?:[25][0-8]|[34][0-4]|6[0-5])[2-9]\\d{6}",
    "\\d{7,9}"],
    [,
    ,
    "7[057-9]\\d{7}",
    "\\d{9}"],
    [,
    ,
    "NA",
    "NA"],
    [,
    ,
    "NA",
    "NA"],
    [,
    ,
    "NA",
    "NA"],
    [,
    ,
    "NA",
    "NA"],
    [,
    ,
    "NA",
    "NA"],
    "AF",
    93,
    "00",
    "0",
    ,
    ,
    "0",
    ,
    ,
    ,
    [[,
    "([2-7]\\d)(\\d{3})(\\d{4})",
    "$1 $2 $3",
    ,
    "0$1",
    ""]],
    ,
    [,
    ,
    "NA",
    "NA"],
    ,
    ,
    [,
    ,
    "NA",
    "NA"],
    [,
    ,
    "NA",
    "NA"]],
    AG: [,
    [,
    ,
    "[2589]\\d{9}",
    "\\d{7}(?:\\d{3})?"],
    [,
    ,
    "268(?:4(?:6[0-38]|84)|56[0-2])\\d{4}",
    "\\d{7}(?:\\d{3})?"],
    [,
    ,
    "268(?:464|7(?:2[0-9]|64|7[0-689]|8[02-68]))\\d{4}",
    "\\d{10}"],
    [,
    ,
    "8(?:00|55|66|77|88)[2-9]\\d{6}",
    "\\d{10}"],
    [,
    ,
    "900[2-9]\\d{6}",
    "\\d{10}"],
    [,
    ,
    "NA",
    "NA"],
    [,
    ,
    "5(?:00|33|44)[2-9]\\d{6}",
    "\\d{10}"],
    [,
    ,
    "26848[01]\\d{4}",
    "\\d{10}"],
    "AG",
    1,
    "011",
    "1",
    ,
    ,
    "1",
    ,
    ,
    ,
    ,
    ,
    [,
    ,
    "26840[69]\\d{4}",
    "\\d{10}"],
    ,
    "268",
    [,
    ,
    "NA",
    "NA"],
    [,
    ,
    "NA",
    "NA"]],
    AI: [,
    [,
    ,
    "[2589]\\d{9}",
    "\\d{7}(?:\\d{3})?"],
    [,
    ,
    "2644(?:6[12]|9[78])\\d{4}",
    "\\d{7}(?:\\d{3})?"],
    [,
    ,
    "264(?:235|476|5(?:3[6-9]|8[1-4])|7(?:29|72))\\d{4}",
    "\\d{10}"],
    [,
    ,
    "8(?:00|55|66|77|88)[2-9]\\d{6}",
    "\\d{10}"],
    [,
    ,
    "900[2-9]\\d{6}",
    "\\d{10}"],
    [,
    ,
    "NA",
    "NA"],
    [,
    ,
    "5(?:00|33|44)[2-9]\\d{6}",
    "\\d{10}"],
    [,
    ,
    "NA",
    "NA"],
    "AI",
    1,
    "011",
    "1",
    ,
    ,
    "1",
    ,
    ,
    ,
    ,
    ,
    [,
    ,
    "NA",
    "NA"],
    ,
    "264",
    [,
    ,
    "NA",
    "NA"],
    [,
    ,
    "NA",
    "NA"]],
    AL: [,
    [,
    ,
    "[2-57]\\d{7}|6\\d{8}|8\\d{5,7}|9\\d{5}",
    "\\d{5,9}"],
    [,
    ,
    "(?:2(?:[168][1-9]|[247]\\d|9[1-7])|3(?:1[1-3]|[2-6]\\d|[79][1-8]|8[1-9])|4\\d{2}|5(?:1[1-4]|[2-578]\\d|6[1-5]|9[1-7])|8(?:[19][1-5]|[2-6]\\d|[78][1-7]))\\d{5}",
    "\\d{5,8}"],
    [,
    ,
    "6[6-9]\\d{7}",
    "\\d{9}"],
    [,
    ,
    "800\\d{4}",
    "\\d{7}"],
    [,
    ,
    "900\\d{3}",
    "\\d{6}"],
    [,
    ,
    "808\\d{3}",
    "\\d{6}"],
    [,
    ,
    "700\\d{5}",
    "\\d{8}"],
    [,
    ,
    "NA",
    "NA"],
    "AL",
    355,
    "00",
    "0",
    ,
    ,
    "0",
    ,
    ,
    ,
    [[,
    "(4)(\\d{3})(\\d{4})",
    "$1 $2 $3",
    ["4[0-6]"],
    "0$1",
    ""],
    [,
    "(6[6-9])(\\d{3})(\\d{4})",
    "$1 $2 $3",
    ["6"],
    "0$1",
    ""],
    [,
    "(\\d{2})(\\d{3})(\\d{3})",
    "$1 $2 $3",
    ["[2358][2-5]|4[7-9]"],
    "0$1",
    ""],
    [,
    "(\\d{3})(\\d{3,5})",
    "$1 $2",
    ["[235][16-9]|8[016-9]|[79]"],
    "0$1",
    ""]],
    ,
    [,
    ,
    "NA",
    "NA"],
    ,
    ,
    [,
    ,
    "NA",
    "NA"],
    [,
    ,
    "NA",
    "NA"]],
    AM: [,
    [,
    ,
    "[1-35-9]\\d{7}",
    "\\d{5,8}"],
    [,
    ,
    "(?:10\\d|2(?:2[2-46]|3[1-8]|4[2-69]|5[2-7]|6[1-9]|8[1-7])|3[12]2)\\d{5}",
    "\\d{5,8}"],
    [,
    ,
    "(?:55|77|9[1-46-9])\\d{6}",
    "\\d{8}"],
    [,
    ,
    "800\\d{5}",
    "\\d{8}"],
    [,
    ,
    "90[016]\\d{5}",
    "\\d{8}"],
    [,
    ,
    "80[1-4]\\d{5}",
    "\\d{8}"],
    [,
    ,
    "NA",
    "NA"],
    [,
    ,
    "6027\\d{4}",
    "\\d{8}"],
    "AM",
    374,
    "00",
    "0",
    ,
    ,
    "0",
    ,
    ,
    ,
    [[,
    "(\\d{2})(\\d{6})",
    "$1 $2",
    ["1"],
    "(0$1)",
    ""],
    [,
    "(\\d{2})(\\d{6})",
    "$1 $2",
    ["[5-7]|9[1-9]"],
    "0$1",
    ""],
    [,
    "(\\d{3})(\\d{5})",
    "$1 $2",
    ["[23]"],
    "(0$1)",
    ""],
    [,
    "(\\d{3})(\\d{2})(\\d{3})",
    "$1 $2 $3",
    ["8|90"],
    "0 $1",
    ""]],
    ,
    [,
    ,
    "NA",
    "NA"],
    ,
    ,
    [,
    ,
    "NA",
    "NA"],
    [,
    ,
    "NA",
    "NA"]],
    AN: [,
    [,
    ,
    "[13-79]\\d{6,7}",
    "\\d{7,8}"],
    [,
    ,
    "(?:318|5(?:25|4\\d|8[239])|7(?:1[578]|50)|9(?:[48]\\d{2}|50\\d|7(?:2[0-2]|[34]\\d|6[35-7]|77)))\\d{4}|416[0239]\\d{3}",
    "\\d{7,8}"],
    [,
    ,
    "(?:318|5(?:1[01]|2[0-7]|5\\d|8[016-8])|7(?:0[01]|[89]\\d)|9(?:5(?:[1246]\\d|3[01])|6(?:[1679]\\d|3[01])))\\d{4}|416[15-8]\\d{3}",
    "\\d{7,8}"],
    [,
    ,
    "NA",
    "NA"],
    [,
    ,
    "NA",
    "NA"],
    [,
    ,
    "(?:10|69)\\d{5}",
    "\\d{7,8}"],
    [,
    ,
    "NA",
    "NA"],
    [,
    ,
    "NA",
    "NA"],
    "AN",
    599,
    "00",
    ,
    ,
    ,
    ,
    ,
    ,
    ,
    [[,
    "(\\d{3})(\\d{4})",
    "$1 $2",
    ["[13-7]"],
    "",
    ""],
    [,
    "(9)(\\d{3})(\\d{4})",
    "$1 $2 $3",
    ["9"],
    "",
    ""]],
    ,
    [,
    ,
    "NA",
    "NA"],
    ,
    ,
    [,
    ,
    "NA",
    "NA"],
    [,
    ,
    "NA",
    "NA"]],
    AO: [,
    [,
    ,
    "[29]\\d{8}",
    "\\d{9}"],
    [,
    ,
    "2\\d(?:[26-9]\\d|\\d[26-9])\\d{5}",
    "\\d{9}"],
    [,
    ,
    "9[1-3]\\d{7}",
    "\\d{9}"],
    [,
    ,
    "NA",
    "NA"],
    [,
    ,
    "NA",
    "NA"],
    [,
    ,
    "NA",
    "NA"],
    [,
    ,
    "NA",
    "NA"],
    [,
    ,
    "NA",
    "NA"],
    "AO",
    244,
    "00",
    ,
    ,
    ,
    ,
    ,
    ,
    ,
    [[,
    "(\\d{3})(\\d{3})(\\d{3})",
    "$1 $2 $3",
    ,
    "",
    ""]],
    ,
    [,
    ,
    "NA",
    "NA"],
    ,
    ,
    [,
    ,
    "NA",
    "NA"],
    [,
    ,
    "NA",
    "NA"]],
    AR: [,
    [,
    ,
    "[1-9]\\d{9,11}",
    "\\d{6,12}"],
    [,
    ,
    "[1-9]\\d{9}",
    "\\d{6,10}"],
    [,
    ,
    "9(?:11[2-9]\\d{7}|(?:2(?:2[013]|37|6[14]|9[179])|3(?:4[1235]|5[138]|8[1578]))[2-9]\\d{6}|\\d{4}[2-9]\\d{5})",
    "\\d{6,12}"],
    [,
    ,
    "80\\d{8}",
    "\\d{10}"],
    [,
    ,
    "6(?:0\\d|10)\\d{7}",
    "\\d{10}"],
    [,
    ,
    "NA",
    "NA"],
    [,
    ,
    "NA",
    "NA"],
    [,
    ,
    "NA",
    "NA"],
    "AR",
    54,
    "00",
    "0",
    ,
    ,
    "0(?:(11|2(?:2(?:02?|[13]|2[13-79]|4[1-6]|5[2457]|6[124-8]|7[1-4]|8[13-6]|9[1-367])|3(?:[06]2|1[467]|2[02-6]|3[13-8]|[49][2-6]|5[2-8]|7)|47[3-578]|6(?:1|2[2-7]|4[6-8]?|5[125-8])|9(?:0[1-3]|[19]|2\\d|3[1-6]|4[0-24-68]|5[2-4]|6[2-6]|72?|8[23]?))|3(?:3(?:2[79]|8[2578])|4(?:0[124-9]|[12]|3[5-8]?|4[24-7]|5[4-68]?|6\\d|7[126]|8[237-9]|9[1-36-8])|5(?:1|2[1245]|3[2-4]?|4[1-46-9]|6[2-4]|7[1-6]|8[2-5]?)|7(?:1[15-8]|2[125]|3[1245]|4[13]|5[124-8]|7[2-57]|8[1-36])|8(?:1|2[125-7]|3[23578]|4[13-6]|5[4-8]?|6[1-357-9]|7[5-8]?|8[4-7]?|9[124])))15)?",
    "9$1",
    ,
    ,
    [[,
    "([68]\\d{2})(\\d{3})(\\d{4})",
    "$1-$2-$3",
    ["[68]"],
    "0$1",
    ""],
    [,
    "(9)(11)(\\d{4})(\\d{4})",
    "$2 15-$3-$4",
    ["911"],
    "0$1",
    ""],
    [,
    "(9)(\\d{3})(\\d{3})(\\d{4})",
    "$2 15-$3-$4",
    ["9(?:2[2369]|3[458])",
    "9(?:2(?:2[013]|37|6[14]|9[179])|3(?:4[1235]|5[138]|8[1578]))"],
    "0$1",
    ""],
    [,
    "(9)(\\d{4})(\\d{2})(\\d{4})",
    "$2 15-$3-$4",
    ["9(?:2[2-469]|3[3-578])",
    "9(?:2(?:2[24-9]|3[0-69]|47|6[25]|9[02-68])|3(?:3[28]|4[046-9]|5[2467]|7[1-578]|8[23469]))"],
    "0$1",
    ""],
    [,
    "(11)(\\d{4})(\\d{4})",
    "$1 $2-$3",
    ["1"],
    "0$1",
    ""],
    [,
    "(\\d{3})(\\d{3})(\\d{4})",
    "$1 $2-$3",
    ["2(?:2[013]|37|6[14]|9[179])|3(?:4[1235]|5[138]|8[1578])"],
    "0$1",
    ""],
    [,
    "(\\d{4})(\\d{2})(\\d{4})",
    "$1 $2-$3",
    ["[23]"],
    "0$1",
    ""]],
    [[,
    "([68]\\d{2})(\\d{3})(\\d{4})",
    "$1-$2-$3",
    ["[68]"]],
    [,
    "(9)(11)(\\d{4})(\\d{4})",
    "$1 $2 $3-$4",
    ["911"]],
    [,
    "(9)(\\d{3})(\\d{3})(\\d{4})",
    "$1 $2 $3-$4",
    ["9(?:2[2369]|3[458])",
    "9(?:2(?:2[013]|37|6[14]|9[179])|3(?:4[1235]|5[138]|8[1578]))"]],
    [,
    "(9)(\\d{4})(\\d{2})(\\d{4})",
    "$1 $2 $3-$4",
    ["9(?:2[2-469]|3[3-578])",
    "9(?:2(?:2[24-9]|3[0-69]|47|6[25]|9[02-68])|3(?:3[28]|4[046-9]|5[2467]|7[1-578]|8[23469]))"]],
    [,
    "(11)(\\d{4})(\\d{4})",
    "$1 $2-$3",
    ["1"]],
    [,
    "(\\d{3})(\\d{3})(\\d{4})",
    "$1 $2-$3",
    ["2(?:2[013]|37|6[14]|9[179])|3(?:4[1235]|5[138]|8[1578])"]],
    [,
    "(\\d{4})(\\d{2})(\\d{4})",
    "$1 $2-$3",
    ["[23]"]]],
    [,
    ,
    "NA",
    "NA"],
    ,
    ,
    [,
    ,
    "NA",
    "NA"],
    [,
    ,
    "NA",
    "NA"]],
    AS: [,
    [,
    ,
    "[5689]\\d{9}",
    "\\d{7}(?:\\d{3})?"],
    [,
    ,
    "6846(?:22|33|44|55|77|88|9[19])\\d{4}",
    "\\d{7}(?:\\d{3})?"],
    [,
    ,
    "684(?:733|258)\\d{4}",
    "\\d{10}"],
    [,
    ,
    "8(?:00|55|66|77|88)[2-9]\\d{6}",
    "\\d{10}"],
    [,
    ,
    "900[2-9]\\d{6}",
    "\\d{10}"],
    [,
    ,
    "NA",
    "NA"],
    [,
    ,
    "5(?:00|33|44)[2-9]\\d{6}",
    "\\d{10}"],
    [,
    ,
    "NA",
    "NA"],
    "AS",
    1,
    "011",
    "1",
    ,
    ,
    "1",
    ,
    ,
    ,
    ,
    ,
    [,
    ,
    "NA",
    "NA"],
    ,
    "684",
    [,
    ,
    "NA",
    "NA"],
    [,
    ,
    "NA",
    "NA"]],
    AT: [,
    [,
    ,
    "\\d{4,13}",
    "\\d{3,13}"],
    [,
    ,
    "1\\d{3,12}|(?:2(?:1[467]|2[134-8]|5[2357]|6[1-46-8]|7[1-8]|8[124-7]|8[1458])|3(?:1[1-8]|3[23568]|4[5-7]|5[1378]|6[1-38]|8[3-68])|4(?:2[1-8]|35|63|7[1368]|8[2457])|5(?:1[27]|2[1-8]|3[357]|4[147]|5[12578]|6[37])|6(?:13|2[1-47]|4[1-35-8]|5[468]|62)|7(?:2[1-8]|3[25]|4[13478]|5[68]|6[16-8]|7[1-6]|9[45]))\\d{3,10}|5(?:0[1-9]|[79]\\d)\\d{2,10}|720\\d{6,10}",
    "\\d{3,13}"],
    [,
    ,
    "6(?:44|5[0-3579]|6[013-9]|[7-9]\\d)\\d{4,10}",
    "\\d{7,13}"],
    [,
    ,
    "80[02]\\d{6,10}",
    "\\d{9,13}"],
    [,
    ,
    "(?:711|9(?:0[01]|3[019]))\\d{6,10}",
    "\\d{9,13}"],
    [,
    ,
    "8(?:10|2[018])\\d{6,10}",
    "\\d{9,13}"],
    [,
    ,
    "NA",
    "NA"],
    [,
    ,
    "780\\d{6,10}",
    "\\d{9,13}"],
    "AT",
    43,
    "00",
    "0",
    ,
    ,
    "0",
    ,
    ,
    ,
    [[,
    "([15])(\\d{3,12})",
    "$1 $2",
    ["1|5[079]"],
    "0$1",
    ""],
    [,
    "(\\d{3})(\\d{3,10})",
    "$1 $2",
    ["316|46|51|732|6(?:44|5[0-3579]|[6-9])|7(?:1|[28]0)|[89]"],
    "0$1",
    ""],
    [,
    "(\\d{4})(\\d{3,9})",
    "$1 $2",
    ["2|3(?:1[1-578]|[3-8])|4[2378]|5[2-6]|6(?:[12]|4[1-35-9]|5[468])|7(?:2[1-8]|35|4[1-8]|[57-9])"],
    "0$1",
    ""]],
    ,
    [,
    ,
    "NA",
    "NA"],
    ,
    ,
    [,
    ,
    "NA",
    "NA"],
    [,
    ,
    "NA",
    "NA"]],
    AU: [,
    [,
    ,
    "[1-578]\\d{5,9}",
    "\\d{6,10}"],
    [,
    ,
    "[237]\\d{8}|8(?:[68]\\d{3}|7[1-4]\\d{2}|9(?:[02-9]\\d{2}|1(?:[0-57-9]\\d|6[0135-9])))\\d{4}",
    "\\d{8,9}"],
    [,
    ,
    "4(?:[0-2]\\d|3[0-57-9]|4[47-9]|5[0-37-9]|6[6-9]|7[07-9]|8[7-9])\\d{6}",
    "\\d{9}"],
    [,
    ,
    "1(?:80(?:0\\d{2})?|3(?:00\\d{2})?)\\d{4}",
    "\\d{6,10}"],
    [,
    ,
    "190[0126]\\d{6}",
    "\\d{10}"],
    [,
    ,
    "NA",
    "NA"],
    [,
    ,
    "500\\d{6}",
    "\\d{9}"],
    [,
    ,
    "550\\d{6}",
    "\\d{9}"],
    "AU",
    61,
    "(?:14(?:1[14]|34|4[17]|[56]6|7[47]|88))?001[14-689]",
    "0",
    ,
    ,
    "0",
    ,
    "0011",
    ,
    [[,
    "([2378])(\\d{4})(\\d{4})",
    "$1 $2 $3",
    ["[2378]"],
    "(0$1)",
    ""],
    [,
    "(4\\d{2})(\\d{3})(\\d{3})",
    "$1 $2 $3",
    ["4"],
    "0$1",
    ""],
    [,
    "(5[05]0)(\\d{3})(\\d{3})",
    "$1 $2 $3",
    ["5"],
    "0$1",
    ""],
    [,
    "(1[389]\\d{2})(\\d{3})(\\d{3})",
    "$1 $2 $3",
    ["1(?:[38]0|9)",
    "1(?:[38]00|9)"],
    "$1",
    ""],
    [,
    "(180)(\\d{4})",
    "$1 $2",
    ["180",
    "180[1-9]"],
    "$1",
    ""],
    [,
    "(13)(\\d{2})(\\d{2})",
    "$1 $2 $3",
    ["13[1-9]"],
    "$1",
    ""]],
    ,
    [,
    ,
    "NA",
    "NA"],
    1,
    ,
    [,
    ,
    "NA",
    "NA"],
    [,
    ,
    "NA",
    "NA"]],
    AW: [,
    [,
    ,
    "[25-9]\\d{6}",
    "\\d{7}"],
    [,
    ,
    "5(?:2\\d|8[1-9])\\d{4}",
    "\\d{7}"],
    [,
    ,
    "(?:5(?:6\\d|9[2-478])|6(?:[039]0|22|[46][01])|7[34]\\d|9(?:6[45]|9[4-8]))\\d{4}",
    "\\d{7}"],
    [,
    ,
    "800\\d{4}",
    "\\d{7}"],
    [,
    ,
    "900\\d{4}",
    "\\d{7}"],
    [,
    ,
    "NA",
    "NA"],
    [,
    ,
    "NA",
    "NA"],
    [,
    ,
    "28\\d{5}|501\\d{4}",
    "\\d{7}"],
    "AW",
    297,
    "00",
    ,
    ,
    ,
    ,
    ,
    ,
    ,
    [[,
    "(\\d{3})(\\d{4})",
    "$1 $2",
    ,
    "",
    ""]],
    ,
    [,
    ,
    "NA",
    "NA"],
    ,
    ,
    [,
    ,
    "NA",
    "NA"],
    [,
    ,
    "NA",
    "NA"]],
    AX: [,
    [,
    ,
    "[135]\\d{5,9}|[27]\\d{4,9}|4\\d{5,10}|6\\d{7,8}|8\\d{6,9}",
    "\\d{5,12}"],
    [,
    ,
    "18[1-8]\\d{3,9}",
    "\\d{6,12}"],
    [,
    ,
    "4\\d{5,10}|50\\d{4,8}",
    "\\d{6,11}"],
    [,
    ,
    "800\\d{4,7}",
    "\\d{7,10}"],
    [,
    ,
    "[67]00\\d{5,6}",
    "\\d{8,9}"],
    [,
    ,
    "NA",
    "NA"],
    [,
    ,
    "NA",
    "NA"],
    [,
    ,
    "NA",
    "NA"],
    "AX",
    358,
    "00|99[049]",
    "0",
    ,
    ,
    "0",
    ,
    ,
    ,
    ,
    ,
    [,
    ,
    "NA",
    "NA"],
    ,
    ,
    [,
    ,
    "NA",
    "NA"],
    [,
    ,
    "10[1-9]\\d{3,7}|2(?:0(?:[16-8]\\d{3,7}|2[14-9]\\d{1,6}|[3-5]\\d{2,7}|9[0-7]\\d{1,6})|9\\d{4,8})|30[1-9]\\d{3,7}|7(?:1\\d{7}|3\\d{8}|5[03-9]\\d{2,7})",
    "\\d{5,10}"]],
    AZ: [,
    [,
    ,
    "[1-9]\\d{7,8}",
    "\\d{5,9}"],
    [,
    ,
    "(?:1(?:(?:[28]\\d|9)\\d|02|1[0-589]|3[358]|4[013-79]|5[0-479]|6[02346-9]|7[0-24-8])|2(?:16|2\\d|3[0-24]|4[1468]|55|6[56]|79)|365?\\d|44\\d{2})\\d{5}",
    "\\d{5,9}"],
    [,
    ,
    "(?:[46]0|5[015]|7[07])\\d{7}",
    "\\d{9}"],
    [,
    ,
    "88\\d{7}",
    "\\d{9}"],
    [,
    ,
    "900200\\d{3}",
    "\\d{9}"],
    [,
    ,
    "NA",
    "NA"],
    [,
    ,
    "NA",
    "NA"],
    [,
    ,
    "NA",
    "NA"],
    "AZ",
    994,
    "00",
    "0",
    ,
    ,
    "0",
    ,
    ,
    ,
    [[,
    "(\\d{2})(\\d{3})(\\d{2})(\\d{2})",
    "$1 $2 $3 $4",
    ["1[28]"],
    "(0$1)",
    ""],
    [,
    "(\\d{2})(\\d{2})(\\d{2})(\\d{2})",
    "$1 $2 $3 $4",
    ["22"],
    "(0$1)",
    ""],
    [,
    "(\\d{2})(\\d{2,3})(\\d{2})(\\d{2})",
    "$1 $2 $3 $4",
    ["3"],
    "(0$1)",
    ""],
    [,
    "(\\d{3})(\\d)(\\d{2})(\\d{2})",
    "$1 $2 $3 $4",
    ["1[013-79]|2[013-9]"],
    "(0$1)",
    ""],
    [,
    "(\\d{2})(\\d{3})(\\d{2})(\\d{2})",
    "$1 $2 $3 $4",
    ["[4-8]"],
    "0$1",
    ""],
    [,
    "(\\d{3})(\\d{2})(\\d{2})(\\d{2})",
    "$1 $2 $3 $4",
    ["9"],
    "0$1",
    ""]],
    ,
    [,
    ,
    "NA",
    "NA"],
    ,
    ,
    [,
    ,
    "NA",
    "NA"],
    [,
    ,
    "NA",
    "NA"]],
    BA: [,
    [,
    ,
    "[3-689]\\d{7}",
    "\\d{6,8}"],
    [,
    ,
    "(?:[35]\\d|49)\\d{6}",
    "\\d{6,8}"],
    [,
    ,
    "6[1-356]\\d{6}",
    "\\d{8}"],
    [,
    ,
    "8[08]\\d{6}",
    "\\d{8}"],
    [,
    ,
    "9[0246]\\d{6}",
    "\\d{8}"],
    [,
    ,
    "82\\d{6}",
    "\\d{8}"],
    [,
    ,
    "NA",
    "NA"],
    [,
    ,
    "NA",
    "NA"],
    "BA",
    387,
    "00",
    "0",
    ,
    ,
    "0",
    ,
    ,
    ,
    [[,
    "([3-689]\\d)(\\d{3})(\\d{3})",
    "$1 $2-$3",
    ,
    "0$1",
    ""]],
    ,
    [,
    ,
    "NA",
    "NA"],
    ,
    ,
    [,
    ,
    "NA",
    "NA"],
    [,
    ,
    "81\\d{6}",
    "\\d{8}"]],
    BB: [,
    [,
    ,
    "[2589]\\d{9}",
    "\\d{7}(?:\\d{3})?"],
    [,
    ,
    "246[2-9]\\d{6}",
    "\\d{7}(?:\\d{3})?"],
    [,
    ,
    "246(?:(?:2[346]|45|82)\\d|25[0-4])\\d{4}",
    "\\d{10}"],
    [,
    ,
    "8(?:00|55|66|77|88)[2-9]\\d{6}",
    "\\d{10}"],
    [,
    ,
    "900[2-9]\\d{6}",
    "\\d{10}"],
    [,
    ,
    "NA",
    "NA"],
    [,
    ,
    "5(?:00|33|44)[2-9]\\d{6}",
    "\\d{10}"],
    [,
    ,
    "NA",
    "NA"],
    "BB",
    1,
    "011",
    "1",
    ,
    ,
    "1",
    ,
    ,
    ,
    ,
    ,
    [,
    ,
    "NA",
    "NA"],
    ,
    "246",
    [,
    ,
    "NA",
    "NA"],
    [,
    ,
    "NA",
    "NA"]],
    BD: [,
    [,
    ,
    "[2-79]\\d{5,9}|1\\d{9}|8[0-7]\\d{4,8}",
    "\\d{6,10}"],
    [,
    ,
    "2(?:7\\d1|8(?:[026]1|[1379][1-5]|8[1-8])|9(?:0[0-2]|1[1-4]|3[3-5]|5[56]|6[67]|71|8[078]))\\d{4}|3(?:[6-8]1|(?:0[23]|[25][12]|82|416)\\d|(?:31|12?[5-7])\\d{2})\\d{3}|4(?:(?:02|[49]6|[68]1)|(?:0[13]|21\\d?|[23]2|[457][12]|6[28])\\d|(?:23|[39]1)\\d{2}|1\\d{3})\\d{3}|5(?:(?:[457-9]1|62)|(?:1\\d?|2[12]|3[1-3]|52)\\d|61{2})|6(?:[45]1|(?:11|2[15]|[39]1)\\d|(?:[06-8]1|62)\\d{2})|7(?:(?:32|91)|(?:02|31|[67][12])\\d|[458]1\\d{2}|21\\d{3})\\d{3}|8(?:(?:4[12]|[5-7]2|1\\d?)|(?:0|3[12]|[5-7]1|217)\\d)\\d{4}|9(?:[35]1|(?:[024]2|81)\\d|(?:1|[24]1)\\d{2})\\d{3}",
    "\\d{6,9}"],
    [,
    ,
    "(?:1[13-9]\\d|(?:3[78]|44)[02-9]|6(?:44|6[02-9]))\\d{7}",
    "\\d{10}"],
    [,
    ,
    "80[03]\\d{7}",
    "\\d{10}"],
    [,
    ,
    "NA",
    "NA"],
    [,
    ,
    "NA",
    "NA"],
    [,
    ,
    "NA",
    "NA"],
    [,
    ,
    "NA",
    "NA"],
    "BD",
    880,
    "00[12]?",
    "0",
    ,
    ,
    "0",
    ,
    "00",
    ,
    [[,
    "(2)(\\d{7})",
    "$1 $2",
    ["2"],
    "0$1",
    ""],
    [,
    "(\\d{2})(\\d{4,6})",
    "$1 $2",
    ["[3-79]1"],
    "0$1",
    ""],
    [,
    "(\\d{3})(\\d{3,7})",
    "$1 $2",
    ["[3-79][2-9]|8"],
    "0$1",
    ""],
    [,
    "(\\d{4})(\\d{6})",
    "$1 $2",
    ["1"],
    "0$1",
    ""]],
    ,
    [,
    ,
    "NA",
    "NA"],
    ,
    ,
    [,
    ,
    "NA",
    "NA"],
    [,
    ,
    "NA",
    "NA"]],
    BE: [,
    [,
    ,
    "[1-9]\\d{7,8}",
    "\\d{8,9}"],
    [,
    ,
    "(?:1[0-69]|[23][2-8]|[49][23]|5\\d|6[013-57-9]|7[18])\\d{6}|8(?:0[1-9]|[1-69]\\d)\\d{5}",
    "\\d{8}"],
    [,
    ,
    "4(?:7\\d|8[4-9]|9[1-9])\\d{6}",
    "\\d{9}"],
    [,
    ,
    "800\\d{5}",
    "\\d{8}"],
    [,
    ,
    "(?:90|7[07])\\d{6}",
    "\\d{8}"],
    [,
    ,
    "87\\d{6}",
    "\\d{8}"],
    [,
    ,
    "NA",
    "NA"],
    [,
    ,
    "NA",
    "NA"],
    "BE",
    32,
    "00",
    "0",
    ,
    ,
    "0",
    ,
    ,
    ,
    [[,
    "(4[7-9]\\d)(\\d{2})(\\d{2})(\\d{2})",
    "$1 $2 $3 $4",
    ["4[7-9]"],
    "0$1",
    ""],
    [,
    "([2-49])(\\d{3})(\\d{2})(\\d{2})",
    "$1 $2 $3 $4",
    ["[23]|[49][23]"],
    "0$1",
    ""],
    [,
    "([15-8]\\d)(\\d{2})(\\d{2})(\\d{2})",
    "$1 $2 $3 $4",
    ["[156]|7[0178]|8(?:0[1-9]|[1-79])"],
    "0$1",
    ""],
    [,
    "([89]\\d{2})(\\d{2})(\\d{3})",
    "$1 $2 $3",
    ["(?:80|9)0"],
    "0$1",
    ""]],
    ,
    [,
    ,
    "NA",
    "NA"],
    ,
    ,
    [,
    ,
    "NA",
    "NA"],
    [,
    ,
    "NA",
    "NA"]],
    BF: [,
    [,
    ,
    "[2457]\\d{7}",
    "\\d{8}"],
    [,
    ,
    "(?:20(?:49|5[23]|9[016-9])|40(?:4[569]|55|7[0179])|50[34]\\d)\\d{4}",
    "\\d{8}"],
    [,
    ,
    "7(?:[024-6]\\d|1[0-4689]|3[0-6]|7[01]|8[013-9]|9[0-4])\\d{5}",
    "\\d{8}"],
    [,
    ,
    "NA",
    "NA"],
    [,
    ,
    "NA",
    "NA"],
    [,
    ,
    "NA",
    "NA"],
    [,
    ,
    "NA",
    "NA"],
    [,
    ,
    "NA",
    "NA"],
    "BF",
    226,
    "00",
    ,
    ,
    ,
    ,
    ,
    ,
    ,
    [[,
    "(\\d{2})(\\d{2})(\\d{2})(\\d{2})",
    "$1 $2 $3 $4",
    ,
    "",
    ""]],
    ,
    [,
    ,
    "NA",
    "NA"],
    ,
    ,
    [,
    ,
    "NA",
    "NA"],
    [,
    ,
    "NA",
    "NA"]],
    BG: [,
    [,
    ,
    "[2-9]\\d{6,8}",
    "\\d{7,9}"],
    [,
    ,
    "(?:2\\d|[36]\\d|5[1-9]|8[1-6]|9[1-7])\\d{5,6}|(?:4(?:[124-7]\\d|3[1-6])|7(?:0[1-9]|[1-9]\\d))\\d{4,5}",
    "\\d{7,8}"],
    [,
    ,
    "(?:8[7-9]|98)\\d{7}|4(?:3[0789]|8\\d)\\d{5}",
    "\\d{8,9}"],
    [,
    ,
    "800\\d{5}",
    "\\d{8}"],
    [,
    ,
    "90\\d{6}",
    "\\d{8}"],
    [,
    ,
    "NA",
    "NA"],
    [,
    ,
    "700\\d{5}",
    "\\d{7,9}"],
    [,
    ,
    "NA",
    "NA"],
    "BG",
    359,
    "00",
    "0",
    ,
    ,
    "0",
    ,
    ,
    ,
    [[,
    "(2)(\\d{3})(\\d{3,4})",
    "$1/$2 $3",
    ["2"],
    "0$1",
    ""],
    [,
    "(\\d{3})(\\d{4})",
    "$1/$2",
    ["43[124-7]|70[1-9]"],
    "0$1",
    ""],
    [,
    "(\\d{3})(\\d{3})(\\d{2})",
    "$1/$2 $3",
    ["43[124-7]|70[1-9]"],
    "0$1",
    ""],
    [,
    "(\\d{3})(\\d{2})(\\d{3})",
    "$1 $2 $3",
    ["[78]00"],
    "0$1",
    ""],
    [,
    "(\\d{2})(\\d{3})(\\d{2,3})",
    "$1/$2 $3",
    ["[356]|7[1-9]|8[1-6]|9[1-7]"],
    "0$1",
    ""],
    [,
    "(\\d{2})(\\d{3})(\\d{3,4})",
    "$1 $2 $3",
    ["48|8[7-9]|9[08]"],
    "0$1",
    ""]],
    ,
    [,
    ,
    "NA",
    "NA"],
    ,
    ,
    [,
    ,
    "NA",
    "NA"],
    [,
    ,
    "NA",
    "NA"]],
    BH: [,
    [,
    ,
    "[136-9]\\d{7}",
    "\\d{8}"],
    [,
    ,
    "(?:1(?:3[3-6]|6[0156]|7\\d)|6(?:1[16]|6[03469]|9[69])|77\\d)\\d{5}",
    "\\d{8}"],
    [,
    ,
    "(?:3(?:[369]\\d|77|8[38])|6(?:1[16]|6[03469]|9[69])|77\\d)\\d{5}",
    "\\d{8}"],
    [,
    ,
    "80\\d{6}",
    "\\d{8}"],
    [,
    ,
    "(?:87|9[014578])\\d{6}",
    "\\d{8}"],
    [,
    ,
    "84\\d{6}",
    "\\d{8}"],
    [,
    ,
    "NA",
    "NA"],
    [,
    ,
    "NA",
    "NA"],
    "BH",
    973,
    "00",
    ,
    ,
    ,
    ,
    ,
    ,
    ,
    [[,
    "(\\d{4})(\\d{4})",
    "$1 $2",
    ,
    "",
    ""]],
    ,
    [,
    ,
    "NA",
    "NA"],
    ,
    ,
    [,
    ,
    "NA",
    "NA"],
    [,
    ,
    "NA",
    "NA"]],
    BI: [,
    [,
    ,
    "[27]\\d{7}",
    "\\d{8}"],
    [,
    ,
    "22(?:2[0-7]|[3-5]0)\\d{4}",
    "\\d{8}"],
    [,
    ,
    "(?:29\\d|7(?:1[1-3]|[4-9]\\d))\\d{5}",
    "\\d{8}"],
    [,
    ,
    "NA",
    "NA"],
    [,
    ,
    "NA",
    "NA"],
    [,
    ,
    "NA",
    "NA"],
    [,
    ,
    "NA",
    "NA"],
    [,
    ,
    "NA",
    "NA"],
    "BI",
    257,
    "00",
    ,
    ,
    ,
    ,
    ,
    ,
    ,
    [[,
    "([27]\\d)(\\d{2})(\\d{2})(\\d{2})",
    "$1 $2 $3 $4",
    ,
    "",
    ""]],
    ,
    [,
    ,
    "NA",
    "NA"],
    ,
    ,
    [,
    ,
    "NA",
    "NA"],
    [,
    ,
    "NA",
    "NA"]],
    BJ: [,
    [,
    ,
    "[2689]\\d{7}|7\\d{3}",
    "\\d{4,8}"],
    [,
    ,
    "2(?:02|1[037]|2[45]|3[68])\\d{5}",
    "\\d{8}"],
    [,
    ,
    "66\\d{6}|9(?:0[069]|[35][0-2457-9]|[6-8]\\d)\\d{5}",
    "\\d{8}"],
    [,
    ,
    "7[3-5]\\d{2}",
    "\\d{4}"],
    [,
    ,
    "NA",
    "NA"],
    [,
    ,
    "NA",
    "NA"],
    [,
    ,
    "NA",
    "NA"],
    [,
    ,
    "857[58]\\d{4}",
    "\\d{8}"],
    "BJ",
    229,
    "00",
    ,
    ,
    ,
    ,
    ,
    ,
    ,
    [[,
    "(\\d{2})(\\d{2})(\\d{2})(\\d{2})",
    "$1 $2 $3 $4",
    ,
    "",
    ""]],
    ,
    [,
    ,
    "NA",
    "NA"],
    ,
    ,
    [,
    ,
    "NA",
    "NA"],
    [,
    ,
    "NA",
    "NA"]],
    BL: [,
    [,
    ,
    "[56]\\d{8}",
    "\\d{9}"],
    [,
    ,
    "590(?:2[7-9]|5[12]|87)\\d{4}",
    "\\d{9}"],
    [,
    ,
    "690(?:10|2[27]|66|77|8[78])\\d{4}",
    "\\d{9}"],
    [,
    ,
    "NA",
    "NA"],
    [,
    ,
    "NA",
    "NA"],
    [,
    ,
    "NA",
    "NA"],
    [,
    ,
    "NA",
    "NA"],
    [,
    ,
    "NA",
    "NA"],
    "BL",
    590,
    "00",
    "0",
    ,
    ,
    "0",
    ,
    ,
    ,
    ,
    ,
    [,
    ,
    "NA",
    "NA"],
    ,
    ,
    [,
    ,
    "NA",
    "NA"],
    [,
    ,
    "NA",
    "NA"]],
    BM: [,
    [,
    ,
    "[4589]\\d{9}",
    "\\d{7}(?:\\d{3})?"],
    [,
    ,
    "441(?:2(?:02|23|61|[3479]\\d)|[46]\\d{2}|5(?:4\\d|60|89)|824)\\d{4}",
    "\\d{7}(?:\\d{3})?"],
    [,
    ,
    "441(?:[37]\\d|5[0-39])\\d{5}",
    "\\d{10}"],
    [,
    ,
    "8(?:00|55|66|77|88)[2-9]\\d{6}",
    "\\d{10}"],
    [,
    ,
    "900[2-9]\\d{6}",
    "\\d{10}"],
    [,
    ,
    "NA",
    "NA"],
    [,
    ,
    "5(?:00|33|44)[2-9]\\d{6}",
    "\\d{10}"],
    [,
    ,
    "NA",
    "NA"],
    "BM",
    1,
    "011",
    "1",
    ,
    ,
    "1",
    ,
    ,
    ,
    ,
    ,
    [,
    ,
    "NA",
    "NA"],
    ,
    "441",
    [,
    ,
    "NA",
    "NA"],
    [,
    ,
    "NA",
    "NA"]],
    BN: [,
    [,
    ,
    "[2-578]\\d{6}",
    "\\d{7}"],
    [,
    ,
    "[2-5]\\d{6}",
    "\\d{7}"],
    [,
    ,
    "[78]\\d{6}",
    "\\d{7}"],
    [,
    ,
    "NA",
    "NA"],
    [,
    ,
    "NA",
    "NA"],
    [,
    ,
    "NA",
    "NA"],
    [,
    ,
    "NA",
    "NA"],
    [,
    ,
    "NA",
    "NA"],
    "BN",
    673,
    "00",
    "0",
    ,
    ,
    "0",
    ,
    ,
    ,
    [[,
    "([2-578]\\d{2})(\\d{4})",
    "$1 $2",
    ,
    "0$1",
    ""]],
    ,
    [,
    ,
    "NA",
    "NA"],
    ,
    ,
    [,
    ,
    "NA",
    "NA"],
    [,
    ,
    "NA",
    "NA"]],
    BO: [,
    [,
    ,
    "[23467]\\d{7}",
    "\\d{7,8}"],
    [,
    ,
    "(?:2(?:2\\d{2}|5(?:11|[258]\\d|9[67])|6(?:12|2\\d|9[34])|8(?:2[34]|39|62))|3(?:3\\d{2}|4(?:6\\d|8[24])|8(?:25|42|5[257]|86|9[25])|9(?:2\\d|3[234]|4[248]|5[24]|6[2-6]|7\\d))|4(?:4\\d{2}|6(?:11|[24689]\\d|72)))\\d{4}",
    "\\d{7,8}"],
    [,
    ,
    "[67]\\d{7}",
    "\\d{8}"],
    [,
    ,
    "NA",
    "NA"],
    [,
    ,
    "NA",
    "NA"],
    [,
    ,
    "NA",
    "NA"],
    [,
    ,
    "NA",
    "NA"],
    [,
    ,
    "NA",
    "NA"],
    "BO",
    591,
    "00(1\\d)?",
    "0",
    ,
    ,
    "0(1\\d)?",
    ,
    ,
    ,
    [[,
    "([234])(\\d{7})",
    "$1 $2",
    ["[234]"],
    "",
    "0$CC $1"],
    [,
    "([67]\\d{7})",
    "$1",
    ["[67]"],
    "",
    "0$CC $1"]],
    ,
    [,
    ,
    "NA",
    "NA"],
    ,
    ,
    [,
    ,
    "NA",
    "NA"],
    [,
    ,
    "NA",
    "NA"]],
    BR: [,
    [,
    ,
    "[1-9]\\d{7,9}",
    "\\d{8,10}"],
    [,
    ,
    "(?:[14689][1-9]|2[12478]|3[1-578]|5[13-5]|7[13-579])[2-5]\\d{7}",
    "\\d{8,10}"],
    [,
    ,
    "(?:[14689][1-9]|2[12478]|3[1-578]|5[13-5]|7[13-579])[6-9]\\d{7}",
    "\\d{10}"],
    [,
    ,
    "800\\d{6,7}",
    "\\d{8,10}"],
    [,
    ,
    "[359]00\\d{6,7}",
    "\\d{8,10}"],
    [,
    ,
    "(?:400\\d|3003)\\d{4}",
    "\\d{8,10}"],
    [,
    ,
    "NA",
    "NA"],
    [,
    ,
    "NA",
    "NA"],
    "BR",
    55,
    "00(?:1[45]|2[135]|[34]1|43)",
    "0",
    ,
    ,
    "0(?:(1[245]|2[135]|[34]1)(\\d{10}))?",
    "$2",
    ,
    ,
    [[,
    "(\\d{2})(\\d{4})(\\d{4})",
    "$1 $2-$3",
    ["[1-9][1-9]"],
    "($1)",
    "0 $CC ($1)"],
    [,
    "([34]00\\d)(\\d{4})",
    "$1-$2",
    ["[34]00",
    "400|3003"],
    "",
    ""],
    [,
    "([3589]00)(\\d{2,3})(\\d{4})",
    "$1 $2 $3",
    ["[3589]00"],
    "0$1",
    ""]],
    ,
    [,
    ,
    "NA",
    "NA"],
    ,
    ,
    [,
    ,
    "NA",
    "NA"],
    [,
    ,
    "NA",
    "NA"]],
    BS: [,
    [,
    ,
    "[2589]\\d{9}",
    "\\d{7}(?:\\d{3})?"],
    [,
    ,
    "242(?:3(?:02|[236][1-9]|4[0-24-9]|5[0-68]|7[3467]|8[0-4]|9[2-467])|461|502|6(?:12|7[67]|8[78]|9[89])|702)\\d{4}",
    "\\d{7}(?:\\d{3})?"],
    [,
    ,
    "242(?:3(?:5[79]|[79]5)|4(?:[2-4][1-9]|5[1-8]|6[2-8]|7\\d|81)|5(?:2[34]|3[35]|44|5[1-9]|65|77)|6[34]6|727)\\d{4}",
    "\\d{10}"],
    [,
    ,
    "242300\\d{4}|8(?:00|55|66|77|88)[2-9]\\d{6}",
    "\\d{10}"],
    [,
    ,
    "900[2-9]\\d{6}",
    "\\d{10}"],
    [,
    ,
    "NA",
    "NA"],
    [,
    ,
    "5(?:00|33|44)[2-9]\\d{6}",
    "\\d{10}"],
    [,
    ,
    "NA",
    "NA"],
    "BS",
    1,
    "011",
    "1",
    ,
    ,
    "1",
    ,
    ,
    ,
    ,
    ,
    [,
    ,
    "NA",
    "NA"],
    ,
    "242",
    [,
    ,
    "NA",
    "NA"],
    [,
    ,
    "NA",
    "NA"]],
    BT: [,
    [,
    ,
    "(?:17|[2-8])\\d{6}",
    "\\d{6,8}"],
    [,
    ,
    "(?:2[3-6]|[34][5-7]|5[236]|6[2-46]|7[246]|8[2-4])\\d{5}",
    "\\d{6,7}"],
    [,
    ,
    "17\\d{6}",
    "\\d{8}"],
    [,
    ,
    "NA",
    "NA"],
    [,
    ,
    "NA",
    "NA"],
    [,
    ,
    "NA",
    "NA"],
    [,
    ,
    "NA",
    "NA"],
    [,
    ,
    "NA",
    "NA"],
    "BT",
    975,
    "00",
    ,
    ,
    ,
    ,
    ,
    ,
    ,
    [[,
    "(17)(\\d{2})(\\d{2})(\\d{2})",
    "$1 $2 $3 $4",
    ["1"],
    "",
    ""],
    [,
    "([2-8])(\\d{3})(\\d{3})",
    "$1 $2 $3",
    ["[2-8]"],
    "",
    ""]],
    ,
    [,
    ,
    "NA",
    "NA"],
    ,
    ,
    [,
    ,
    "NA",
    "NA"],
    [,
    ,
    "NA",
    "NA"]],
    BW: [,
    [,
    ,
    "[2-79]\\d{6,7}",
    "\\d{7,8}"],
    [,
    ,
    "(?:2(?:4[0-48]|6[0-24]|9[0578])|3(?:1[0235-9]|55|6\\d|7[01]|9[0-57])|4(?:6[03]|7[1267]|9[0-5])|5(?:3[0389]|4[0489]|7[1-47]|88|9[0-49])|6(?:2[1-35]|5[149]|8[067]))\\d{4}",
    "\\d{7}"],
    [,
    ,
    "7(?:[1-35]\\d{6}|[46][0-7]\\d{5})",
    "\\d{8}"],
    [,
    ,
    "NA",
    "NA"],
    [,
    ,
    "90\\d{5}",
    "\\d{7}"],
    [,
    ,
    "NA",
    "NA"],
    [,
    ,
    "NA",
    "NA"],
    [,
    ,
    "79[12][01]\\d{4}",
    "\\d{8}"],
    "BW",
    267,
    "00",
    ,
    ,
    ,
    ,
    ,
    ,
    ,
    [[,
    "(\\d{3})(\\d{4})",
    "$1 $2",
    ["[2-6]"],
    "",
    ""],
    [,
    "(7\\d)(\\d{3})(\\d{3})",
    "$1 $2 $3",
    ["7"],
    "",
    ""],
    [,
    "(90)(\\d{5})",
    "$1 $2",
    ["9"],
    "",
    ""]],
    ,
    [,
    ,
    "NA",
    "NA"],
    ,
    ,
    [,
    ,
    "NA",
    "NA"],
    [,
    ,
    "NA",
    "NA"]],
    BY: [,
    [,
    ,
    "[12-4]\\d{8}|[89]\\d{9}",
    "\\d{7,10}"],
    [,
    ,
    "(?:1(?:5(?:1[1-5]|2\\d|6[1-4]|9[1-7])|6(?:[235]\\d|4[1-7])|7\\d{2})|2(?:1(?:[246]\\d|3[0-35-9]|5[1-9])|2(?:[235]\\d|4[0-8])|3(?:2\\d|3[02-79]|4[024-7]|5[0-7])))\\d{5}",
    "\\d{7,9}"],
    [,
    ,
    "(?:2(?:5[679]|9[1-9])|33\\d|44\\d)\\d{6}",
    "\\d{9}"],
    [,
    ,
    "80[13]\\d{7}",
    "\\d{10}"],
    [,
    ,
    "902\\d{7}",
    "\\d{10}"],
    [,
    ,
    "NA",
    "NA"],
    [,
    ,
    "NA",
    "NA"],
    [,
    ,
    "NA",
    "NA"],
    "BY",
    375,
    "8~10",
    "8",
    ,
    ,
    "80?",
    ,
    ,
    ,
    [[,
    "([1-4]\\d)(\\d{3})(\\d{4})",
    "$1 $2 $3",
    ["[1-4]"],
    "8 0$1",
    ""],
    [,
    "([89]\\d{2})(\\d{3})(\\d{4})",
    "$1 $2 $3",
    ["[89]"],
    "8 $1",
    ""]],
    ,
    [,
    ,
    "NA",
    "NA"],
    ,
    ,
    [,
    ,
    "NA",
    "NA"],
    [,
    ,
    "NA",
    "NA"]],
    BZ: [,
    [,
    ,
    "[2-8]\\d{6}|0\\d{10}",
    "\\d{7}(?:\\d{4})?"],
    [,
    ,
    "[234578][02]\\d{5}",
    "\\d{7}"],
    [,
    ,
    "6(?:[0-2]\\d|[67][01])\\d{4}",
    "\\d{7}"],
    [,
    ,
    "0800\\d{7}",
    "\\d{11}"],
    [,
    ,
    "NA",
    "NA"],
    [,
    ,
    "NA",
    "NA"],
    [,
    ,
    "NA",
    "NA"],
    [,
    ,
    "NA",
    "NA"],
    "BZ",
    501,
    "00",
    ,
    ,
    ,
    ,
    ,
    ,
    ,
    [[,
    "(\\d{3})(\\d{4})",
    "$1-$2",
    ["[2-8]"],
    "",
    ""],
    [,
    "(0)(800)(\\d{4})(\\d{3})",
    "$1-$2-$3-$4",
    ["0"],
    "",
    ""]],
    ,
    [,
    ,
    "NA",
    "NA"],
    ,
    ,
    [,
    ,
    "NA",
    "NA"],
    [,
    ,
    "NA",
    "NA"],
    1],
    CA: [,
    [,
    ,
    "[2-9]\\d{9}|3\\d{6}",
    "\\d{7}(?:\\d{3})?"],
    [,
    ,
    "(?:2(?:04|26|[48]9|50)|3(?:06|43)|4(?:03|1[68]|38|5[06])|5(?:0[06]|1[49]|79|8[17])|6(?:0[04]|13|47)|7(?:0[059]|[18]0|78)|8(?:[06]7|19|)|90[25])[2-9]\\d{6}|310\\d{4}",
    "\\d{7}(?:\\d{3})?"],
    [,
    ,
    "(?:2(?:04|26|[48]9|50)|3(?:06|43)|4(?:03|1[68]|38|5[06])|5(?:0[06]|1[49]|79|8[17])|6(?:0[04]|13|47)|7(?:0[059]|[18]0|78)|8(?:[06]7|19|)|90[25])[2-9]\\d{6}",
    "\\d{7}(?:\\d{3})?"],
    [,
    ,
    "8(?:00|55|66|77|88)[2-9]\\d{6}|310\\d{4}",
    "\\d{7}(?:\\d{3})?"],
    [,
    ,
    "900[2-9]\\d{6}",
    "\\d{10}"],
    [,
    ,
    "NA",
    "NA"],
    [,
    ,
    "5(?:00|33|44)[2-9]\\d{6}",
    "\\d{10}"],
    [,
    ,
    "NA",
    "NA"],
    "CA",
    1,
    "011",
    "1",
    ,
    ,
    "1",
    ,
    ,
    ,
    ,
    ,
    [,
    ,
    "NA",
    "NA"],
    ,
    ,
    [,
    ,
    "NA",
    "NA"],
    [,
    ,
    "NA",
    "NA"]],
    CC: [,
    [,
    ,
    "[1458]\\d{5,9}",
    "\\d{6,10}"],
    [,
    ,
    "89162\\d{4}",
    "\\d{8,9}"],
    [,
    ,
    "4(?:[0-2]\\d|3[0-57-9]|4[47-9]|5[0-37-9]|6[6-9]|7[07-9]|8[7-9])\\d{6}",
    "\\d{9}"],
    [,
    ,
    "1(?:80(?:0\\d{2})?|3(?:00\\d{2})?)\\d{4}",
    "\\d{6,10}"],
    [,
    ,
    "190[0126]\\d{6}",
    "\\d{10}"],
    [,
    ,
    "NA",
    "NA"],
    [,
    ,
    "500\\d{6}",
    "\\d{9}"],
    [,
    ,
    "550\\d{6}",
    "\\d{9}"],
    "CC",
    61,
    "(?:14(?:1[14]|34|4[17]|[56]6|7[47]|88))?001[14-689]",
    "0",
    ,
    ,
    "0",
    ,
    "0011",
    ,
    ,
    ,
    [,
    ,
    "NA",
    "NA"],
    ,
    ,
    [,
    ,
    "NA",
    "NA"],
    [,
    ,
    "NA",
    "NA"]],
    CD: [,
    [,
    ,
    "[89]\\d{8}|[1-6]\\d{6}",
    "\\d{7,9}"],
    [,
    ,
    "[1-6]\\d{6}",
    "\\d{7}"],
    [,
    ,
    "(?:8[0-2489]|9[7-9])\\d{7}",
    "\\d{9}"],
    [,
    ,
    "NA",
    "NA"],
    [,
    ,
    "NA",
    "NA"],
    [,
    ,
    "NA",
    "NA"],
    [,
    ,
    "NA",
    "NA"],
    [,
    ,
    "NA",
    "NA"],
    "CD",
    243,
    "00",
    "0",
    ,
    ,
    "0",
    ,
    ,
    ,
    [[,
    "([89]\\d{2})(\\d{3})(\\d{3})",
    "$1 $2 $3",
    ["[89]"],
    "0$1",
    ""],
    [,
    "([1-6]\\d)(\\d{5})",
    "$1 $2",
    ["[1-6]"],
    "0$1",
    ""]],
    ,
    [,
    ,
    "NA",
    "NA"],
    ,
    ,
    [,
    ,
    "NA",
    "NA"],
    [,
    ,
    "NA",
    "NA"]],
    CF: [,
    [,
    ,
    "[278]\\d{7}",
    "\\d{8}"],
    [,
    ,
    "2[12]\\d{6}",
    "\\d{8}"],
    [,
    ,
    "7[0257]\\d{6}",
    "\\d{8}"],
    [,
    ,
    "NA",
    "NA"],
    [,
    ,
    "8776\\d{4}",
    "\\d{8}"],
    [,
    ,
    "NA",
    "NA"],
    [,
    ,
    "NA",
    "NA"],
    [,
    ,
    "NA",
    "NA"],
    "CF",
    236,
    "00",
    ,
    ,
    ,
    ,
    ,
    ,
    ,
    [[,
    "(\\d{2})(\\d{2})(\\d{2})(\\d{2})",
    "$1 $2 $3 $4",
    ,
    "",
    ""]],
    ,
    [,
    ,
    "NA",
    "NA"],
    ,
    ,
    [,
    ,
    "NA",
    "NA"],
    [,
    ,
    "NA",
    "NA"]],
    CG: [,
    [,
    ,
    "[028]\\d{8}",
    "\\d{9}"],
    [,
    ,
    "222[1-589]\\d{5}",
    "\\d{9}"],
    [,
    ,
    "0[14-6]\\d{7}",
    "\\d{9}"],
    [,
    ,
    "800\\d{6}",
    "\\d{9}"],
    [,
    ,
    "NA",
    "NA"],
    [,
    ,
    "NA",
    "NA"],
    [,
    ,
    "NA",
    "NA"],
    [,
    ,
    "NA",
    "NA"],
    "CG",
    242,
    "00",
    ,
    ,
    ,
    ,
    ,
    ,
    ,
    [[,
    "(\\d{2})(\\d{3})(\\d{4})",
    "$1 $2 $3",
    ["[02]"],
    "",
    ""],
    [,
    "(\\d)(\\d{4})(\\d{4})",
    "$1 $2 $3",
    ["8"],
    "",
    ""]],
    ,
    [,
    ,
    "NA",
    "NA"],
    ,
    ,
    [,
    ,
    "NA",
    "NA"],
    [,
    ,
    "NA",
    "NA"],
    1],
    CH: [,
    [,
    ,
    "[2-9]\\d{8}",
    "\\d{9}"],
    [,
    ,
    "(?:2[12467]|3[1-4]|4[134]|5[12568]|6[12]|[7-9]1)\\d{7}",
    "\\d{9}"],
    [,
    ,
    "7[46-9]\\d{7}",
    "\\d{9}"],
    [,
    ,
    "800\\d{6}",
    "\\d{9}"],
    [,
    ,
    "90[016]\\d{6}",
    "\\d{9}"],
    [,
    ,
    "84[0248]\\d{6}",
    "\\d{9}"],
    [,
    ,
    "878\\d{6}",
    "\\d{9}"],
    [,
    ,
    "NA",
    "NA"],
    "CH",
    41,
    "00",
    "0",
    ,
    ,
    "0",
    ,
    ,
    ,
    [[,
    "([2-9]\\d)(\\d{3})(\\d{2})(\\d{2})",
    "$1 $2 $3 $4",
    ["[2-7]|[89]1"],
    "0$1",
    ""],
    [,
    "([89]\\d{2})(\\d{3})(\\d{3})",
    "$1 $2 $3",
    ["8[047]|90"],
    "0$1",
    ""]],
    ,
    [,
    ,
    "NA",
    "NA"],
    ,
    ,
    [,
    ,
    "NA",
    "NA"],
    [,
    ,
    "NA",
    "NA"]],
    CI: [,
    [,
    ,
    "[02-5]\\d{7}",
    "\\d{8}"],
    [,
    ,
    "(?:2(?:0[023]|1[02357]|[23][045]|4[03-5])|3(?:0[06]|1[069]|[2-4][07]|5[09]|6[08]))\\d{5}",
    "\\d{8}"],
    [,
    ,
    "(?:0[1-9]|4[04-9]|5[07]|6[067])\\d{6}",
    "\\d{8}"],
    [,
    ,
    "NA",
    "NA"],
    [,
    ,
    "NA",
    "NA"],
    [,
    ,
    "NA",
    "NA"],
    [,
    ,
    "NA",
    "NA"],
    [,
    ,
    "NA",
    "NA"],
    "CI",
    225,
    "00",
    ,
    ,
    ,
    ,
    ,
    ,
    ,
    [[,
    "(\\d{2})(\\d{2})(\\d{2})(\\d{2})",
    "$1 $2 $3 $4",
    ,
    "",
    ""]],
    ,
    [,
    ,
    "NA",
    "NA"],
    ,
    ,
    [,
    ,
    "NA",
    "NA"],
    [,
    ,
    "NA",
    "NA"],
    1],
    CK: [,
    [,
    ,
    "[2-57]\\d{4}",
    "\\d{5}"],
    [,
    ,
    "(?:2\\d|3[13-7]|4[1-5])\\d{3}",
    "\\d{5}"],
    [,
    ,
    "(?:5[0-68]|7\\d)\\d{3}",
    "\\d{5}"],
    [,
    ,
    "NA",
    "NA"],
    [,
    ,
    "NA",
    "NA"],
    [,
    ,
    "NA",
    "NA"],
    [,
    ,
    "NA",
    "NA"],
    [,
    ,
    "NA",
    "NA"],
    "CK",
    682,
    "00",
    ,
    ,
    ,
    ,
    ,
    ,
    ,
    [[,
    "(\\d{2})(\\d{3})",
    "$1 $2",
    ,
    "",
    ""]],
    ,
    [,
    ,
    "NA",
    "NA"],
    ,
    ,
    [,
    ,
    "NA",
    "NA"],
    [,
    ,
    "NA",
    "NA"]],
    CL: [,
    [,
    ,
    "(?:[2-9]|600|123)\\d{7,8}",
    "\\d{6,11}"],
    [,
    ,
    "(?:2|32|41)\\d{7}|(?:3[3-5]|4[235]|5[1-3578]|6[13-57]|7[1-35])\\d{6,7}",
    "\\d{6,9}"],
    [,
    ,
    "9[6-9]\\d{7}",
    "\\d{8,9}"],
    [,
    ,
    "800\\d{6}|1230\\d{7}",
    "\\d{9,11}"],
    [,
    ,
    "600\\d{7,8}",
    "\\d{10,11}"],
    [,
    ,
    "NA",
    "NA"],
    [,
    ,
    "NA",
    "NA"],
    [,
    ,
    "44\\d{7}",
    "\\d{9}"],
    "CL",
    56,
    "(?:0|1(?:1[0-69]|2[0-57]|5[13-58]|69|7[0167]|8[018]))0",
    "0",
    ,
    ,
    "0|(1(?:1[0-69]|2[0-57]|5[13-58]|69|7[0167]|8[018]))",
    ,
    ,
    ,
    [[,
    "(2)(\\d{3})(\\d{4})",
    "$1 $2 $3",
    ["2"],
    "($1)",
    "$CC ($1)"],
    [,
    "(\\d{2})(\\d{2,3})(\\d{4})",
    "$1 $2 $3",
    ["[357]|4[1-35]|6[13-57]"],
    "($1)",
    "$CC ($1)"],
    [,
    "(9)([6-9]\\d{3})(\\d{4})",
    "$1 $2 $3",
    ["9"],
    "0$1",
    ""],
    [,
    "(44)(\\d{3})(\\d{4})",
    "$1 $2 $3",
    ["44"],
    "0$1",
    ""],
    [,
    "([68]00)(\\d{3})(\\d{3,4})",
    "$1 $2 $3",
    ["60|8"],
    "$1",
    ""],
    [,
    "(600)(\\d{3})(\\d{2})(\\d{3})",
    "$1 $2 $3 $4",
    ["60"],
    "$1",
    ""],
    [,
    "(1230)(\\d{3})(\\d{4})",
    "$1 $2 $3",
    ["1"],
    "$1",
    ""]],
    ,
    [,
    ,
    "NA",
    "NA"],
    ,
    ,
    [,
    ,
    "NA",
    "NA"],
    [,
    ,
    "NA",
    "NA"]],
    CM: [,
    [,
    ,
    "[237-9]\\d{7}",
    "\\d{8}"],
    [,
    ,
    "(?:22|33)\\d{6}",
    "\\d{8}"],
    [,
    ,
    "[79]\\d{7}",
    "\\d{8}"],
    [,
    ,
    "800\\d{5}",
    "\\d{8}"],
    [,
    ,
    "88\\d{6}",
    "\\d{8}"],
    [,
    ,
    "NA",
    "NA"],
    [,
    ,
    "NA",
    "NA"],
    [,
    ,
    "NA",
    "NA"],
    "CM",
    237,
    "00",
    ,
    ,
    ,
    ,
    ,
    ,
    ,
    [[,
    "([237-9]\\d)(\\d{2})(\\d{2})(\\d{2})",
    "$1 $2 $3 $4",
    ["[2379]|88"],
    "",
    ""],
    [,
    "(800)(\\d{2})(\\d{3})",
    "$1 $2 $3",
    ["80"],
    "",
    ""]],
    ,
    [,
    ,
    "NA",
    "NA"],
    ,
    ,
    [,
    ,
    "NA",
    "NA"],
    [,
    ,
    "NA",
    "NA"]],
    CN: [,
    [,
    ,
    "[1-79]\\d{7,11}|8[0-357-9]\\d{6,9}",
    "\\d{4,12}"],
    [,
    ,
    "21\\d{8,10}|(?:10|2[02-57-9]|3(?:11|7[159])|4[135]1|5(?:1\\d|2[37]|3[12]|7[13-79]|9[15])|7(?:31|5[457]|6[09])|898)\\d{8}|(?:3(?:1[02-9]|35|49|5\\d|7[02-68]|9[1-68])|4(?:1[02-9]|2[179]|[35][2-9]|6[4789]|7[0-46-9]|8[23])|5(?:3[03-9]|4[36]|5\\d|6[1-6]|7[028]|80|9[2-46-9])|6(?:3[1-5]|6[0238]|9[12])|7(?:01|[1579]\\d|2[248]|3[04-9]|4[3-6]|6[2368])|8(?:1[236-8]|2[5-7]|[37]\\d|5[1-9]|8[3678]|9[1-7])|9(?:0[1-3689]|1[1-79]|[379]\\d|4[13]|5[1-5]))\\d{7}|80(?:29|6[03578]|7[018]|81)\\d{4}",
    "\\d{4,12}"],
    [,
    ,
    "1(?:3\\d|4[57]|5[0-35-9]|8[025-9])\\d{8}",
    "\\d{11}"],
    [,
    ,
    "(?:10)?800\\d{7}",
    "\\d{10,12}"],
    [,
    ,
    "16[08]\\d{5}",
    "\\d{8}"],
    [,
    ,
    "NA",
    "NA"],
    [,
    ,
    "NA",
    "NA"],
    [,
    ,
    "400\\d{7}",
    "\\d{10}"],
    "CN",
    86,
    "00",
    "0",
    ,
    ,
    "0",
    ,
    ,
    ,
    [[,
    "(80\\d{2})(\\d{4})",
    "$1 $2",
    ["80[2678]"],
    "0$1",
    ""],
    [,
    "([48]00)(\\d{3})(\\d{4})",
    "$1 $2 $3",
    ["[48]00"],
    "",
    ""],
    [,
    "(\\d{3,4})(\\d{4})",
    "$1 $2",
    ["[2-9]"],
    "",
    ""],
    [,
    "(21)(\\d{4})(\\d{4,6})",
    "$1 $2 $3",
    ["21"],
    "0$1",
    ""],
    [,
    "([12]\\d)(\\d{4})(\\d{4})",
    "$1 $2 $3",
    ["10[1-9]|2[02-9]",
    "10[1-9]|2[02-9]",
    "10(?:[1-79]|8(?:[1-9]|0[1-9]))|2[02-9]"],
    "0$1",
    ""],
    [,
    "(\\d{3})(\\d{4})(\\d{4})",
    "$1 $2 $3",
    ["3(?:11|7[159])|4[135]1|5(?:1|2[37]|3[12]|7[13-79]|9[15])|7(?:31|5[457]|6[09])|898"],
    "0$1",
    ""],
    [,
    "(\\d{3})(\\d{3})(\\d{4})",
    "$1 $2 $3",
    ["3(?:1[02-9]|35|49|5|7[02-68]|9[1-68])|4(?:1[02-9]|2[179]|[35][2-9]|6[4789]|7[0-46-9]|8[23])|5(?:3[03-9]|4[36]|5|6[1-6]|7[028]|80|9[2-46-9])|6(?:3[1-5]|6[0238]|9[12])|7(?:01|[1579]|2[248]|3[04-9]|4[3-6]|6[2368])|8(?:1[236-8]|2[5-7]|[37]|5[1-9]|8[3678]|9[1-7])|9(?:0[1-3689]|1[1-79]|[379]|4[13]|5[1-5])"],
    "0$1",
    ""],
    [,
    "(1[3-58]\\d)(\\d{4})(\\d{4})",
    "$1 $2 $3",
    ["1[3-58]"],
    "",
    ""],
    [,
    "(10800)(\\d{3})(\\d{4})",
    "$1 $2 $3",
    ["108",
    "1080",
    "10800"],
    "",
    ""]],
    [[,
    "(80\\d{2})(\\d{4})",
    "$1 $2",
    ["80[2678]"]],
    [,
    "([48]00)(\\d{3})(\\d{4})",
    "$1 $2 $3",
    ["[48]00"]],
    [,
    "(21)(\\d{4})(\\d{4,6})",
    "$1 $2 $3",
    ["21"]],
    [,
    "([12]\\d)(\\d{4})(\\d{4})",
    "$1 $2 $3",
    ["10[1-9]|2[02-9]",
    "10[1-9]|2[02-9]",
    "10(?:[1-79]|8(?:[1-9]|0[1-9]))|2[02-9]"]],
    [,
    "(\\d{3})(\\d{4})(\\d{4})",
    "$1 $2 $3",
    ["3(?:11|7[159])|4[135]1|5(?:1|2[37]|3[12]|7[13-79]|9[15])|7(?:31|5[457]|6[09])|898"]],
    [,
    "(\\d{3})(\\d{3})(\\d{4})",
    "$1 $2 $3",
    ["3(?:1[02-9]|35|49|5|7[02-68]|9[1-68])|4(?:1[02-9]|2[179]|[35][2-9]|6[4789]|7[0-46-9]|8[23])|5(?:3[03-9]|4[36]|5|6[1-6]|7[028]|80|9[2-46-9])|6(?:3[1-5]|6[0238]|9[12])|7(?:01|[1579]|2[248]|3[04-9]|4[3-6]|6[2368])|8(?:1[236-8]|2[5-7]|[37]|5[1-9]|8[3678]|9[1-7])|9(?:0[1-3689]|1[1-79]|[379]|4[13]|5[1-5])"]],
    [,
    "(1[3-58]\\d)(\\d{4})(\\d{4})",
    "$1 $2 $3",
    ["1[3-58]"]],
    [,
    "(10800)(\\d{3})(\\d{4})",
    "$1 $2 $3",
    ["108",
    "1080",
    "10800"]]],
    [,
    ,
    "NA",
    "NA"],
    ,
    ,
    [,
    ,
    "NA",
    "NA"],
    [,
    ,
    "NA",
    "NA"]],
    CO: [,
    [,
    ,
    "(?:[13]\\d{0,3}|[24-8])\\d{7}",
    "\\d{7,11}"],
    [,
    ,
    "[124-8][2-9]\\d{6}",
    "\\d{8}"],
    [,
    ,
    "3(?:0[0-24]|1[0-8]|2[01])\\d{7}",
    "\\d{10}"],
    [,
    ,
    "1800\\d{7}",
    "\\d{11}"],
    [,
    ,
    "19(?:0[01]|4[78])\\d{7}",
    "\\d{11}"],
    [,
    ,
    "NA",
    "NA"],
    [,
    ,
    "NA",
    "NA"],
    [,
    ,
    "NA",
    "NA"],
    "CO",
    57,
    "00[579]|#555|#999",
    "0",
    ,
    ,
    "0([3579]|4(?:44|56))",
    ,
    ,
    ,
    [[,
    "(\\d)(\\d{7})",
    "$1 $2",
    ["1(?:8[2-9]|9[0-3]|[2-7])|[24-8]",
    "1(?:8[2-9]|9(?:09|[1-3])|[2-7])|[24-8]"],
    "($1)",
    "0$CC $1"],
    [,
    "(\\d{3})(\\d{7})",
    "$1 $2",
    ["3"],
    "",
    "0$CC $1"],
    [,
    "(1)(\\d{3})(\\d{7})",
    "$1-$2-$3",
    ["1(?:80|9[04])",
    "1(?:800|9(?:0[01]|4[78]))"],
    "0$1",
    ""]],
    [[,
    "(\\d)(\\d{7})",
    "$1 $2",
    ["1(?:8[2-9]|9[0-3]|[2-7])|[24-8]",
    "1(?:8[2-9]|9(?:09|[1-3])|[2-7])|[24-8]"]],
    [,
    "(\\d{3})(\\d{7})",
    "$1 $2",
    ["3"]],
    [,
    "(1)(\\d{3})(\\d{7})",
    "$1 $2 $3",
    ["1(?:80|9[04])",
    "1(?:800|9(?:0[01]|4[78]))"]]],
    [,
    ,
    "NA",
    "NA"],
    ,
    ,
    [,
    ,
    "NA",
    "NA"],
    [,
    ,
    "NA",
    "NA"]],
    CR: [,
    [,
    ,
    "[2489]\\d{7,9}",
    "\\d{8,10}"],
    [,
    ,
    "2[24-7]\\d{6}",
    "\\d{8}"],
    [,
    ,
    "8[36789]\\d{6}",
    "\\d{8}"],
    [,
    ,
    "800\\d{7}",
    "\\d{10}"],
    [,
    ,
    "90[059]\\d{7}",
    "\\d{10}"],
    [,
    ,
    "NA",
    "NA"],
    [,
    ,
    "NA",
    "NA"],
    [,
    ,
    "4000\\d{4}",
    "\\d{8}"],
    "CR",
    506,
    "00",
    ,
    ,
    ,
    "(1900)",
    ,
    ,
    ,
    [[,
    "(\\d{4})(\\d{4})",
    "$1 $2",
    ["[24]|8[3-9]"],
    "",
    "$CC $1"],
    [,
    "(\\d{3})(\\d{3})(\\d{4})",
    "$1-$2-$3",
    ["[89]0"],
    "",
    "$CC $1"]],
    ,
    [,
    ,
    "NA",
    "NA"],
    ,
    ,
    [,
    ,
    "NA",
    "NA"],
    [,
    ,
    "NA",
    "NA"]],
    CU: [,
    [,
    ,
    "[2-57]\\d{5,7}",
    "\\d{4,8}"],
    [,
    ,
    "2[1-4]\\d{5,6}|3(?:1\\d{6}|[23]\\d{4,6})|4(?:[125]\\d{5,6}|[36]\\d{6}|[78]\\d{4,6})|7\\d{6,7}",
    "\\d{4,8}"],
    [,
    ,
    "5\\d{7}",
    "\\d{8}"],
    [,
    ,
    "NA",
    "NA"],
    [,
    ,
    "NA",
    "NA"],
    [,
    ,
    "NA",
    "NA"],
    [,
    ,
    "NA",
    "NA"],
    [,
    ,
    "NA",
    "NA"],
    "CU",
    53,
    "119",
    "0",
    ,
    ,
    "0",
    ,
    ,
    ,
    [[,
    "(\\d)(\\d{6,7})",
    "$1 $2",
    ["7"],
    "(0$1)",
    ""],
    [,
    "(\\d{2})(\\d{4,6})",
    "$1 $2",
    ["[2-4]"],
    "(0$1)",
    ""],
    [,
    "(\\d)(\\d{7})",
    "$1 $2",
    ["5"],
    "0$1",
    ""]],
    ,
    [,
    ,
    "NA",
    "NA"],
    ,
    ,
    [,
    ,
    "NA",
    "NA"],
    [,
    ,
    "NA",
    "NA"]],
    CV: [,
    [,
    ,
    "[259]\\d{6}",
    "\\d{7}"],
    [,
    ,
    "2(?:2[1-7]|3[0-8]|4[12]|5[1256]|6\\d|7[1-3]|8[1-5])\\d{4}",
    "\\d{7}"],
    [,
    ,
    "(?:9\\d|59)\\d{5}",
    "\\d{7}"],
    [,
    ,
    "NA",
    "NA"],
    [,
    ,
    "NA",
    "NA"],
    [,
    ,
    "NA",
    "NA"],
    [,
    ,
    "NA",
    "NA"],
    [,
    ,
    "NA",
    "NA"],
    "CV",
    238,
    "0",
    ,
    ,
    ,
    ,
    ,
    ,
    ,
    [[,
    "(\\d{3})(\\d{2})(\\d{2})",
    "$1 $2 $3",
    ,
    "",
    ""]],
    ,
    [,
    ,
    "NA",
    "NA"],
    ,
    ,
    [,
    ,
    "NA",
    "NA"],
    [,
    ,
    "NA",
    "NA"]],
    CY: [,
    [,
    ,
    "[257-9]\\d{7}",
    "\\d{8}"],
    [,
    ,
    "2[2-6]\\d{6}",
    "\\d{8}"],
    [,
    ,
    "9[5-79]\\d{6}",
    "\\d{8}"],
    [,
    ,
    "800\\d{5}",
    "\\d{8}"],
    [,
    ,
    "90[09]\\d{5}",
    "\\d{8}"],
    [,
    ,
    "80[1-9]\\d{5}",
    "\\d{8}"],
    [,
    ,
    "700\\d{5}",
    "\\d{8}"],
    [,
    ,
    "NA",
    "NA"],
    "CY",
    357,
    "00",
    ,
    ,
    ,
    ,
    ,
    ,
    ,
    [[,
    "(\\d{2})(\\d{6})",
    "$1 $2",
    ,
    "",
    ""]],
    ,
    [,
    ,
    "NA",
    "NA"],
    ,
    ,
    [,
    ,
    "NA",
    "NA"],
    [,
    ,
    "(?:50|77)\\d{6}",
    "\\d{8}"]],
    CX: [,
    [,
    ,
    "[1458]\\d{5,9}",
    "\\d{6,10}"],
    [,
    ,
    "89164\\d{4}",
    "\\d{8,9}"],
    [,
    ,
    "4(?:[0-2]\\d|3[0-57-9]|4[47-9]|5[0-37-9]|6[6-9]|7[07-9]|8[7-9])\\d{6}",
    "\\d{9}"],
    [,
    ,
    "1(?:80(?:0\\d{2})?|3(?:00\\d{2})?)\\d{4}",
    "\\d{6,10}"],
    [,
    ,
    "190[0126]\\d{6}",
    "\\d{10}"],
    [,
    ,
    "NA",
    "NA"],
    [,
    ,
    "500\\d{6}",
    "\\d{9}"],
    [,
    ,
    "550\\d{6}",
    "\\d{9}"],
    "CX",
    61,
    "(?:14(?:1[14]|34|4[17]|[56]6|7[47]|88))?001[14-689]",
    "0",
    ,
    ,
    "0",
    ,
    "0011",
    ,
    ,
    ,
    [,
    ,
    "NA",
    "NA"],
    ,
    ,
    [,
    ,
    "NA",
    "NA"],
    [,
    ,
    "NA",
    "NA"]],
    CZ: [,
    [,
    ,
    "[2-9]\\d{8}",
    "\\d{9}"],
    [,
    ,
    "2\\d{8}|(?:3[1257-9]|4[16-9]|5[13-9])\\d{7}",
    "\\d{9}"],
    [,
    ,
    "(?:60[1-8]|7(?:0[25]|[2379]\\d))\\d{6}",
    "\\d{9}"],
    [,
    ,
    "800\\d{6}",
    "\\d{9}"],
    [,
    ,
    "9(?:0[05689]|76)\\d{6}",
    "\\d{9}"],
    [,
    ,
    "8[134]\\d{7}",
    "\\d{9}"],
    [,
    ,
    "70[01]\\d{6}",
    "\\d{9}"],
    [,
    ,
    "9[17]0\\d{6}",
    "\\d{9}"],
    "CZ",
    420,
    "00",
    ,
    ,
    ,
    ,
    ,
    ,
    ,
    [[,
    "([2-9]\\d{2})(\\d{3})(\\d{3})",
    "$1 $2 $3",
    ,
    "",
    ""]],
    ,
    [,
    ,
    "NA",
    "NA"],
    ,
    ,
    [,
    ,
    "NA",
    "NA"],
    [,
    ,
    "NA",
    "NA"]],
    DE: [,
    [,
    ,
    "[1-35-9]\\d{3,13}|4(?:[0-8]\\d{4,12}|9(?:4[1-8]|[0-35-7]\\d)\\d{2,7})",
    "\\d{2,14}"],
    [,
    ,
    "[246]\\d{5,13}|3(?:[03-9]\\d{4,11}|2\\d{9})|5(?:0[2-8]|[38][0-8]|[124-6]\\d|[79][0-7])\\d{3,10}|7(?:0[2-8]|[1-9]\\d)\\d{3,10}|8(?:0[2-9]|[1-9]\\d)\\d{3,10}|9(?:0[6-9]|[1-9]\\d)\\d{3,10}",
    "\\d{2,14}"],
    [,
    ,
    "1(?:5\\d{9}|7(?:[0-57-9]|6\\d)\\d{7}|6(?:[02]\\d{7,8}|3\\d{7}))",
    "\\d{10,11}"],
    [,
    ,
    "800\\d{7,9}",
    "\\d{10,12}"],
    [,
    ,
    "900(?:[135]\\d{6}|9\\d{7})",
    "\\d{10,11}"],
    [,
    ,
    "180\\d{5,11}",
    "\\d{8,14}"],
    [,
    ,
    "700\\d{8}",
    "\\d{11}"],
    [,
    ,
    "NA",
    "NA"],
    "DE",
    49,
    "00",
    "0",
    ,
    ,
    "0",
    ,
    ,
    ,
    [[,
    "(\\d{2})(\\d{4,11})",
    "$1/$2",
    ["3[02]|40|[68]9"],
    "0$1",
    ""],
    [,
    "(\\d{3})(\\d{3,10})",
    "$1/$2",
    ["2(?:\\d1|0[2389]|1[24]|28|34)|3(?:[3-9][15]|40)|[4-8][1-9]1|9(?:06|[1-9]1)"],
    "0$1",
    ""],
    [,
    "(\\d{4})(\\d{2,8})",
    "$1/$2",
    ["[24-6]|[7-9](?:\\d[1-9]|[1-9]\\d)|3(?:[3569][02-46-9]|4[2-4679]|7[2-467]|8[2-46-8])",
    "[24-6]|[7-9](?:\\d[1-9]|[1-9]\\d)|3(?:3(?:0[1-467]|2[127-9]|3[124578]|[46][1246]|7[1257-9]|8[1256]|9[145])|4(?:2[135]|3[1357]|4[13578]|6[1246]|7[1356]|9[1346])|5(?:0[14]|2[1-3589]|3[1357]|4[1246]|6[1-4]|7[1346]|8[13568]|9[1246])|6(?:0[356]|2[1-489]|3[124-6]|4[1347]|6[13]|7[12579]|8[1-356]|9[135])|7(?:2[1-7]|3[1357]|4[145]|6[1-5]|7[1-4])|8(?:21|3[1468]|4[1347]|6[0135-9]|7[1467]|8[136])|9(?:0[12479]|2[1358]|3[1357]|4[134679]|6[1-9]|7[136]|8[147]|9[1468]))"],
    "0$1",
    ""],
    [,
    "(\\d{5})(\\d{1,6})",
    "$1/$2",
    ["3"],
    "0$1",
    ""],
    [,
    "([18]\\d{2})(\\d{7,9})",
    "$1 $2",
    ["1[5-7]|800"],
    "0$1",
    ""],
    [,
    "(\\d{3})(\\d)(\\d{4,10})",
    "$1 $2 $3",
    ["(?:18|90)0",
    "180|900[1359]"],
    "0$1",
    ""],
    [,
    "(700)(\\d{4})(\\d{4})",
    "$1 $2 $3",
    ["700"],
    "0$1",
    ""]],
    ,
    [,
    ,
    "16(?:4\\d{1,10}|[89]\\d{1,11})",
    "\\d{4,14}"],
    ,
    ,
    [,
    ,
    "NA",
    "NA"],
    [,
    ,
    "NA",
    "NA"]],
    DJ: [,
    [,
    ,
    "[1-8]\\d{5}",
    "\\d{6}"],
    [,
    ,
    "(?:1[05]|[2-5]\\d)\\d{4}",
    "\\d{6}"],
    [,
    ,
    "[6-8]\\d{5}",
    "\\d{6}"],
    [,
    ,
    "NA",
    "NA"],
    [,
    ,
    "NA",
    "NA"],
    [,
    ,
    "NA",
    "NA"],
    [,
    ,
    "NA",
    "NA"],
    [,
    ,
    "NA",
    "NA"],
    "DJ",
    253,
    "00",
    ,
    ,
    ,
    ,
    ,
    ,
    ,
    [[,
    "(\\d{2})(\\d{2})(\\d{2})",
    "$1 $2 $3",
    ,
    "",
    ""]],
    ,
    [,
    ,
    "NA",
    "NA"],
    ,
    ,
    [,
    ,
    "NA",
    "NA"],
    [,
    ,
    "NA",
    "NA"]],
    DK: [,
    [,
    ,
    "[1-9]\\d{7}",
    "\\d{8}"],
    [,
    ,
    "(?:3[2-9]|4[3-9]|5[4-9]|6[2-9]|7[02-9]|8[26-9]|9[6-9])\\d{6}",
    "\\d{8}"],
    [,
    ,
    "(?:2[0-9]|3[0-2]|4[0-2]|5[0-3]|6[01]|7[12]|81|99)\\d{6}",
    "\\d{8}"],
    [,
    ,
    "80\\d{6}",
    "\\d{8}"],
    [,
    ,
    "90\\d{6}",
    "\\d{8}"],
    [,
    ,
    "NA",
    "NA"],
    [,
    ,
    "NA",
    "NA"],
    [,
    ,
    "NA",
    "NA"],
    "DK",
    45,
    "00",
    ,
    ,
    ,
    ,
    ,
    ,
    ,
    [[,
    "([1-9]\\d)(\\d{2})(\\d{2})(\\d{2})",
    "$1 $2 $3 $4",
    ,
    "",
    ""]],
    ,
    [,
    ,
    "NA",
    "NA"],
    ,
    ,
    [,
    ,
    "NA",
    "NA"],
    [,
    ,
    "NA",
    "NA"]],
    DM: [,
    [,
    ,
    "[57-9]\\d{9}",
    "\\d{7}(?:\\d{3})?"],
    [,
    ,
    "767(?:2(?:55|66)|4(?:2[01]|4[0-25-9])|50[0-4])\\d{4}",
    "\\d{7}(?:\\d{3})?"],
    [,
    ,
    "767(?:2(?:[2346]5|7[5-7])|31[5-7]|61[4-7])\\d{4}",
    "\\d{10}"],
    [,
    ,
    "8(?:00|55|66|77|88)[2-9]\\d{6}",
    "\\d{10}"],
    [,
    ,
    "900[2-9]\\d{6}",
    "\\d{10}"],
    [,
    ,
    "NA",
    "NA"],
    [,
    ,
    "5(?:00|33|44)[2-9]\\d{6}",
    "\\d{10}"],
    [,
    ,
    "NA",
    "NA"],
    "DM",
    1,
    "011",
    "1",
    ,
    ,
    "1",
    ,
    ,
    ,
    ,
    ,
    [,
    ,
    "NA",
    "NA"],
    ,
    "767",
    [,
    ,
    "NA",
    "NA"],
    [,
    ,
    "NA",
    "NA"]],
    DO: [,
    [,
    ,
    "[589]\\d{9}",
    "\\d{7}(?:\\d{3})?"],
    [,
    ,
    "8[024]9[2-9]\\d{6}",
    "\\d{7}(?:\\d{3})?"],
    [,
    ,
    "8[024]9[2-9]\\d{6}",
    "\\d{7}(?:\\d{3})?"],
    [,
    ,
    "8(?:00|55|66|77|88)[2-9]\\d{6}",
    "\\d{10}"],
    [,
    ,
    "900[2-9]\\d{6}",
    "\\d{10}"],
    [,
    ,
    "NA",
    "NA"],
    [,
    ,
    "5(?:00|33|44)[2-9]\\d{6}",
    "\\d{10}"],
    [,
    ,
    "NA",
    "NA"],
    "DO",
    1,
    "011",
    "1",
    ,
    ,
    "1",
    ,
    ,
    1,
    ,
    ,
    [,
    ,
    "NA",
    "NA"],
    ,
    "8[024]9",
    [,
    ,
    "NA",
    "NA"],
    [,
    ,
    "NA",
    "NA"]],
    DZ: [,
    [,
    ,
    "(?:[1-4]|[5-9]\\d)\\d{7}",
    "\\d{8,9}"],
    [,
    ,
    "(?:1\\d|2[014-79]|3[0-8]|4[0135689])\\d{6}|9619\\d{5}",
    "\\d{8,9}"],
    [,
    ,
    "(?:5[56]|6[69]|7[79])\\d{7}",
    "\\d{9}"],
    [,
    ,
    "800\\d{6}",
    "\\d{9}"],
    [,
    ,
    "80[3-689]1\\d{5}",
    "\\d{9}"],
    [,
    ,
    "80[12]1\\d{5}",
    "\\d{9}"],
    [,
    ,
    "NA",
    "NA"],
    [,
    ,
    "98[23]\\d{6}",
    "\\d{9}"],
    "DZ",
    213,
    "00",
    "0",
    ,
    ,
    "0",
    ,
    ,
    ,
    [[,
    "([1-4]\\d)(\\d{2})(\\d{2})(\\d{2})",
    "$1 $2 $3 $4",
    ["[1-4]"],
    "0$1",
    ""],
    [,
    "([5-8]\\d{2})(\\d{2})(\\d{2})(\\d{2})",
    "$1 $2 $3 $4",
    ["[5-8]"],
    "0$1",
    ""],
    [,
    "(9\\d)(\\d{3})(\\d{2})(\\d{2})",
    "$1 $2 $3 $4",
    ["9"],
    "0$1",
    ""]],
    ,
    [,
    ,
    "NA",
    "NA"],
    ,
    ,
    [,
    ,
    "NA",
    "NA"],
    [,
    ,
    "NA",
    "NA"]],
    EC: [,
    [,
    ,
    "[2-9]\\d{7}|1\\d{9,10}",
    "\\d{7,11}"],
    [,
    ,
    "[2-7][2-7]\\d{6}",
    "\\d{7,8}"],
    [,
    ,
    "[89]\\d{7}",
    "\\d{8}"],
    [,
    ,
    "1800\\d{6,7}",
    "\\d{10,11}"],
    [,
    ,
    "NA",
    "NA"],
    [,
    ,
    "NA",
    "NA"],
    [,
    ,
    "NA",
    "NA"],
    [,
    ,
    "NA",
    "NA"],
    "EC",
    593,
    "00",
    "0",
    ,
    ,
    "0",
    ,
    ,
    ,
    [[,
    "(\\d)(\\d{3})(\\d{4})",
    "$1 $2-$3",
    ["[2-7]"],
    "(0$1)",
    ""],
    [,
    "(\\d{2})(\\d{3})(\\d{3})",
    "$1 $2 $3",
    ["[89]"],
    "0$1",
    ""],
    [,
    "(1800)(\\d{3})(\\d{3,4})",
    "$1 $2 $3",
    ["1"],
    "$1",
    ""]],
    [[,
    "(\\d)(\\d{3})(\\d{4})",
    "$1-$2-$3",
    ["[2-7]"]],
    [,
    "(\\d{2})(\\d{3})(\\d{3})",
    "$1 $2 $3",
    ["[89]"]],
    [,
    "(1800)(\\d{3})(\\d{3,4})",
    "$1 $2 $3",
    ["1"]]],
    [,
    ,
    "NA",
    "NA"],
    ,
    ,
    [,
    ,
    "NA",
    "NA"],
    [,
    ,
    "NA",
    "NA"]],
    EE: [,
    [,
    ,
    "[3-9]\\d{6,7}|800\\d{6,7}",
    "\\d{7,10}"],
    [,
    ,
    "(?:3[23589]|4(?:0\\d|[3-8])|6\\d|7[1-9]|88)\\d{5}",
    "\\d{7,8}"],
    [,
    ,
    "(?:5\\d|8[1-5])\\d{6}|5(?:[02]\\d{2}|1(?:[0-8]\\d|95)|5[0-478]\\d|64[0-4]|65[1-589])\\d{3}",
    "\\d{7,8}"],
    [,
    ,
    "800(?:0\\d{3}|1\\d|[2-9])\\d{3}",
    "\\d{7,10}"],
    [,
    ,
    "900\\d{4}",
    "\\d{7}"],
    [,
    ,
    "NA",
    "NA"],
    [,
    ,
    "70[0-2]\\d{5}",
    "\\d{8}"],
    [,
    ,
    "NA",
    "NA"],
    "EE",
    372,
    "00",
    ,
    ,
    ,
    ,
    ,
    ,
    ,
    [[,
    "([34-79]\\d{2})(\\d{4})",
    "$1 $2",
    ["[369]|4[3-8]|5(?:[0-2]|5[0-478]|6[45])|7[1-9]",
    "[369]|4[3-8]|5(?:[02]|1(?:[0-8]|95)|5[0-478]|6(?:4[0-4]|5[1-589]))|7[1-9]"],
    "",
    ""],
    [,
    "(70)(\\d{2})(\\d{4})",
    "$1 $2 $3",
    ["70"],
    "",
    ""],
    [,
    "(8000)(\\d{3})(\\d{3})",
    "$1 $2 $3",
    ["800",
    "8000"],
    "",
    ""],
    [,
    "([458]\\d{3})(\\d{3,4})",
    "$1 $2",
    ["40|5|8(?:00|[1-5])",
    "40|5|8(?:00[1-9]|[1-5])"],
    "",
    ""]],
    ,
    [,
    ,
    "NA",
    "NA"],
    ,
    ,
    [,
    ,
    "800[2-9]\\d{3}",
    "\\d{7}"],
    [,
    ,
    "NA",
    "NA"]],
    EG: [,
    [,
    ,
    "1\\d{4,9}|[2-689]\\d{7,9}",
    "\\d{5,10}"],
    [,
    ,
    "(?:1[35][23]|2[23]\\d|3\\d|4(?:0[2-4]|[578][23]|64)|5(?:0[234]|[57][23])|6[24-689]3|8(?:[28][2-4]|42|6[23])|9(?:[25]2|3[24]|6[23]|7[2-4]))\\d{6}|1[69]\\d{3}",
    "\\d{5,9}"],
    [,
    ,
    "1[0-246-9]\\d{7}",
    "\\d{9}"],
    [,
    ,
    "800\\d{7}",
    "\\d{10}"],
    [,
    ,
    "900\\d{7}",
    "\\d{10}"],
    [,
    ,
    "NA",
    "NA"],
    [,
    ,
    "NA",
    "NA"],
    [,
    ,
    "NA",
    "NA"],
    "EG",
    20,
    "00",
    "0",
    ,
    ,
    "0",
    ,
    ,
    ,
    [[,
    "(\\d)(\\d{7,8})",
    "$1 $2",
    ["[23]"],
    "0$1",
    ""],
    [,
    "(\\d{2})(\\d{7})",
    "$1 $2",
    ["[14-6]|[89][2-9]"],
    "0$1",
    ""],
    [,
    "([89]00)(\\d{3})(\\d{4})",
    "$1 $2 $3",
    ["[89]00"],
    "0$1",
    ""]],
    ,
    [,
    ,
    "NA",
    "NA"],
    ,
    ,
    [,
    ,
    "NA",
    "NA"],
    [,
    ,
    "NA",
    "NA"]],
    ER: [,
    [,
    ,
    "[178]\\d{6}",
    "\\d{6,7}"],
    [,
    ,
    "1(?:1[12568]|20|40|55|6[146])\\d{4}|8\\d{6}",
    "\\d{6,7}"],
    [,
    ,
    "17[1-3]\\d{4}|7\\d{6}",
    "\\d{7}"],
    [,
    ,
    "NA",
    "NA"],
    [,
    ,
    "NA",
    "NA"],
    [,
    ,
    "NA",
    "NA"],
    [,
    ,
    "NA",
    "NA"],
    [,
    ,
    "NA",
    "NA"],
    "ER",
    291,
    "00",
    "0",
    ,
    ,
    "0",
    ,
    ,
    ,
    [[,
    "(\\d)(\\d{3})(\\d{3})",
    "$1 $2 $3",
    ,
    "0$1",
    ""]],
    ,
    [,
    ,
    "NA",
    "NA"],
    ,
    ,
    [,
    ,
    "NA",
    "NA"],
    [,
    ,
    "NA",
    "NA"]],
    ES: [,
    [,
    ,
    "[5-9]\\d{8}",
    "\\d{9}"],
    [,
    ,
    "(?:8(?:[13]0|[28][0-8]|[47][1-9]|5[01346-9]|6[0457-9])|9(?:[1238][0-8]|[47][1-9]|[56]\\d))\\d{6}",
    "\\d{9}"],
    [,
    ,
    "6\\d{8}",
    "\\d{9}"],
    [,
    ,
    "[89]00\\d{6}",
    "\\d{9}"],
    [,
    ,
    "80[367]\\d{6}",
    "\\d{9}"],
    [,
    ,
    "90[12]\\d{6}",
    "\\d{9}"],
    [,
    ,
    "70\\d{7}",
    "\\d{9}"],
    [,
    ,
    "NA",
    "NA"],
    "ES",
    34,
    "00",
    ,
    ,
    ,
    ,
    ,
    ,
    ,
    [[,
    "([5-9]\\d{2})(\\d{2})(\\d{2})(\\d{2})",
    "$1 $2 $3 $4",
    ,
    "",
    ""]],
    ,
    [,
    ,
    "NA",
    "NA"],
    ,
    ,
    [,
    ,
    "NA",
    "NA"],
    [,
    ,
    "51\\d{7}",
    "\\d{9}"]],
    ET: [,
    [,
    ,
    "[1-59]\\d{8}",
    "\\d{7,9}"],
    [,
    ,
    "(?:11(?:1(?:1[124]|2[2-57]|3[1-5]|5[5-8]|8[6-8])|2(?:13|3[6-8]|5[89]|7[05-9]|8[2-6])|3(?:2[01]|3[0-289]|4[1289]|7[1-4]|87)|4(?:1[69]|3[2-49]|4[0-23]|6[5-8])|5(?:1[57]|44|5[0-4])|6(?:18|2[69]|4[5-7]|5[1-5]|6[0-59]|8[015-8]))|2(?:2(?:11[1-9]|22[0-7]|33\\d|44[1467]|66[1-68])|5(?:11[124-6]|33[2-8]|44[1467]|55[14]|66[1-3679]|77[124-79]|880))|3(?:3(?:11[0-46-8]|22[0-6]|33[0134689]|44[04]|55[0-6]|66[01467])|4(?:44[0-8]|55[0-69]|66[0-3]|77[1-5]))|4(?:6(?:22[0-24-7]|33[1-5]|44[13-69]|55[14-689]|660|88[1-4])|7(?:11[1-9]|22[1-9]|33[13-7]|44[13-6]|55[1-689]))|5(?:7(?:227|55[05]|(?:66|77)[14-8])|8(?:11[149]|22[013-79]|33[0-68]|44[013-8]|550|66[1-5]|77\\d)))\\d{4}",
    "\\d{7,9}"],
    [,
    ,
    "9[12]\\d{7}",
    "\\d{9}"],
    [,
    ,
    "NA",
    "NA"],
    [,
    ,
    "NA",
    "NA"],
    [,
    ,
    "NA",
    "NA"],
    [,
    ,
    "NA",
    "NA"],
    [,
    ,
    "NA",
    "NA"],
    "ET",
    251,
    "00",
    "0",
    ,
    ,
    "0",
    ,
    ,
    ,
    [[,
    "([1-59]\\d)(\\d{3})(\\d{4})",
    "$1 $2 $3",
    ,
    "0$1",
    ""]],
    ,
    [,
    ,
    "NA",
    "NA"],
    ,
    ,
    [,
    ,
    "NA",
    "NA"],
    [,
    ,
    "NA",
    "NA"]],
    FI: [,
    [,
    ,
    "1\\d{4,11}|[2-9]\\d{4,10}",
    "\\d{5,12}"],
    [,
    ,
    "1(?:[3569][1-8]\\d{3,9}|[47]\\d{5,10})|2[1-8]\\d{3,9}|3(?:[1-8]\\d{3,9}|9\\d{4,8})|[5689][1-8]\\d{3,9}",
    "\\d{5,12}"],
    [,
    ,
    "4\\d{5,10}|50\\d{4,8}",
    "\\d{6,11}"],
    [,
    ,
    "800\\d{4,7}",
    "\\d{7,10}"],
    [,
    ,
    "[67]00\\d{5,6}",
    "\\d{8,9}"],
    [,
    ,
    "NA",
    "NA"],
    [,
    ,
    "NA",
    "NA"],
    [,
    ,
    "NA",
    "NA"],
    "FI",
    358,
    "00|99[049]",
    "0",
    ,
    ,
    "0",
    ,
    ,
    ,
    [[,
    "(\\d{2})(\\d{4,10})",
    "$1 $2",
    ["2[09]|[14]|50|7[135]"],
    "0$1",
    ""],
    [,
    "(\\d)(\\d{4,11})",
    "$1 $2",
    ["[25689][1-8]|3"],
    "0$1",
    ""],
    [,
    "([6-8]00)(\\d{4,7})",
    "$1 $2",
    ["[6-8]0"],
    "0$1",
    ""]],
    ,
    [,
    ,
    "NA",
    "NA"],
    1,
    ,
    [,
    ,
    "NA",
    "NA"],
    [,
    ,
    "10[1-9]\\d{3,7}|2(?:0(?:[16-8]\\d{3,7}|2[14-9]\\d{1,6}|[3-5]\\d{2,7}|9[0-7]\\d{1,6})|9\\d{4,8})|30[1-9]\\d{3,7}|7(?:1\\d{7}|3\\d{8}|5[03-9]\\d{2,7})",
    "\\d{5,10}"]],
    FJ: [,
    [,
    ,
    "[36-9]\\d{6}|0\\d{10}",
    "\\d{7}(?:\\d{4})?"],
    [,
    ,
    "(?:3[0-5]|6[25-7]|8[58])\\d{5}",
    "\\d{7}"],
    [,
    ,
    "(?:7[0-4]|9[27-9])\\d{5}",
    "\\d{7}"],
    [,
    ,
    "0800\\d{7}",
    "\\d{11}"],
    [,
    ,
    "NA",
    "NA"],
    [,
    ,
    "NA",
    "NA"],
    [,
    ,
    "NA",
    "NA"],
    [,
    ,
    "NA",
    "NA"],
    "FJ",
    679,
    "0(?:0|52)",
    ,
    ,
    ,
    ,
    ,
    "00",
    ,
    [[,
    "(\\d{3})(\\d{4})",
    "$1 $2",
    ["[36-9]"],
    "",
    ""],
    [,
    "(\\d{4})(\\d{3})(\\d{4})",
    "$1 $2 $3",
    ["0"],
    "",
    ""]],
    ,
    [,
    ,
    "NA",
    "NA"],
    ,
    ,
    [,
    ,
    "NA",
    "NA"],
    [,
    ,
    "NA",
    "NA"],
    1],
    FK: [,
    [,
    ,
    "[2-7]\\d{4}",
    "\\d{5}"],
    [,
    ,
    "[2-47]\\d{4}",
    "\\d{5}"],
    [,
    ,
    "[56]\\d{4}",
    "\\d{5}"],
    [,
    ,
    "NA",
    "NA"],
    [,
    ,
    "NA",
    "NA"],
    [,
    ,
    "NA",
    "NA"],
    [,
    ,
    "NA",
    "NA"],
    [,
    ,
    "NA",
    "NA"],
    "FK",
    500,
    "00",
    ,
    ,
    ,
    ,
    ,
    ,
    ,
    ,
    ,
    [,
    ,
    "NA",
    "NA"],
    ,
    ,
    [,
    ,
    "NA",
    "NA"],
    [,
    ,
    "NA",
    "NA"]],
    FM: [,
    [,
    ,
    "[39]\\d{6}",
    "\\d{7}"],
    [,
    ,
    "3[2357]0[1-9]\\d{3}|9[2-6]\\d{5}",
    "\\d{7}"],
    [,
    ,
    "3[2357]0[1-9]\\d{3}|9[2-7]\\d{5}",
    "\\d{7}"],
    [,
    ,
    "NA",
    "NA"],
    [,
    ,
    "NA",
    "NA"],
    [,
    ,
    "NA",
    "NA"],
    [,
    ,
    "NA",
    "NA"],
    [,
    ,
    "NA",
    "NA"],
    "FM",
    691,
    "00",
    ,
    ,
    ,
    ,
    ,
    ,
    ,
    [[,
    "(\\d{3})(\\d{4})",
    "$1 $2",
    ,
    "",
    ""]],
    ,
    [,
    ,
    "NA",
    "NA"],
    ,
    ,
    [,
    ,
    "NA",
    "NA"],
    [,
    ,
    "NA",
    "NA"]],
    FO: [,
    [,
    ,
    "[2-9]\\d{5}",
    "\\d{6}"],
    [,
    ,
    "(?:20|[3-4]\\d|8[19])\\d{4}",
    "\\d{6}"],
    [,
    ,
    "(?:2[1-9]|5\\d|7[1-79])\\d{4}",
    "\\d{6}"],
    [,
    ,
    "80[257-9]\\d{3}",
    "\\d{6}"],
    [,
    ,
    "90(?:[1345][15-7]|2[125-7]|99)\\d{2}",
    "\\d{6}"],
    [,
    ,
    "NA",
    "NA"],
    [,
    ,
    "NA",
    "NA"],
    [,
    ,
    "(?:6[0-36]|88)\\d{4}",
    "\\d{6}"],
    "FO",
    298,
    "00",
    ,
    ,
    ,
    "(10(?:01|[12]0|88))",
    ,
    ,
    ,
    [[,
    "(\\d{6})",
    "$1",
    ,
    "",
    "$CC $1"]],
    ,
    [,
    ,
    "NA",
    "NA"],
    ,
    ,
    [,
    ,
    "NA",
    "NA"],
    [,
    ,
    "NA",
    "NA"]],
    FR: [,
    [,
    ,
    "[1-9]\\d{8}",
    "\\d{9}"],
    [,
    ,
    "[1-5]\\d{8}",
    "\\d{9}"],
    [,
    ,
    "6\\d{8}|7[5-9]\\d{7}",
    "\\d{9}"],
    [,
    ,
    "80\\d{7}",
    "\\d{9}"],
    [,
    ,
    "89[1-37-9]\\d{6}",
    "\\d{9}"],
    [,
    ,
    "8(?:1[019]|2[0156]|84|90)\\d{6}",
    "\\d{9}"],
    [,
    ,
    "NA",
    "NA"],
    [,
    ,
    "9\\d{8}",
    "\\d{9}"],
    "FR",
    33,
    "[04579]0",
    "0",
    ,
    ,
    "0",
    ,
    "00",
    ,
    [[,
    "([1-79])(\\d{2})(\\d{2})(\\d{2})(\\d{2})",
    "$1 $2 $3 $4 $5",
    ["[1-79]"],
    "0$1",
    ""],
    [,
    "(8\\d{2})(\\d{2})(\\d{2})(\\d{2})",
    "$1 $2 $3 $4",
    ["8"],
    "0 $1",
    ""]],
    ,
    [,
    ,
    "NA",
    "NA"],
    ,
    ,
    [,
    ,
    "NA",
    "NA"],
    [,
    ,
    "NA",
    "NA"]],
    GA: [,
    [,
    ,
    "[4-9]\\d{5}|0\\d{7}",
    "\\d{6,8}"],
    [,
    ,
    "(?:4(?:[04-8]\\d|2[04])|(?:5[04-689]|6[024-9]|7\\d|8[236]|9[02368])\\d)\\d{3}",
    "\\d{6}"],
    [,
    ,
    "0(?:5(?:0[89]|3[0-4]|8[0-26]|9[238])|6(?:0[3-7]|1[01]|2[0-7]|6[0-589]|71|83|9[57])|7(?:1[2-5]|2[89]|3[35-9]|4[01]|5[0-347-9]|[67]\\d|8[457-9]|9[0146]))\\d{4}",
    "\\d{8}"],
    [,
    ,
    "NA",
    "NA"],
    [,
    ,
    "NA",
    "NA"],
    [,
    ,
    "NA",
    "NA"],
    [,
    ,
    "NA",
    "NA"],
    [,
    ,
    "NA",
    "NA"],
    "GA",
    241,
    "00",
    ,
    ,
    ,
    ,
    ,
    ,
    ,
    [[,
    "(\\d{2})(\\d{2})(\\d{2})",
    "$1 $2 $3",
    ["[4-9]"],
    "",
    ""],
    [,
    "(0\\d)(\\d{2})(\\d{2})(\\d{2})",
    "$1 $2 $3 $4",
    ["0"],
    "",
    ""]],
    ,
    [,
    ,
    "NA",
    "NA"],
    ,
    ,
    [,
    ,
    "NA",
    "NA"],
    [,
    ,
    "NA",
    "NA"],
    1],
    GB: [,
    [,
    ,
    "\\d{7,10}",
    "\\d{4,10}"],
    [,
    ,
    "2(?:0[01378]|3[0189]|4[017]|8[0-46-9]|9[012])\\d{7}|1(?:(?:1(?:3[0-48]|[46][0-4]|5[012789]|7[0-39]|8[01349])|21[0-7]|31[0-8]|[459]1\\d|61[0-46-9]))\\d{6}|1(?:2(?:0[024-9]|2[3-9]|3[3-79]|4[1-689]|[58][02-9]|6[0-4789]|7[013-9]|9\\d)|3(?:0\\d|[25][02-9]|3[02-579]|[468][0-46-9]|7[1235679]|9[24578])|4(?:0[03-9]|[28][02-5789]|[37]\\d|4[02-69]|5[0-8]|[69][0-79])|5(?:0[1235-9]|2[024-9]|3[015689]|4[02-9]|5[03-9]|6\\d|7[0-35-9]|8[0-468]|9[0-5789])|6(?:0[034689]|2[0-35689]|[38][013-9]|4[1-467]|5[0-69]|6[13-9]|7[0-8]|9[0124578])|7(?:0[0246-9]|2\\d|3[023678]|4[03-9]|5[0-46-9]|6[013-9]|7[0-35-9]|8[024-9]|9[02-9])|8(?:0[35-9]|2[1-5789]|3[02-578]|4[0-578]|5[124-9]|6[2-69]|7\\d|8[02-9]|9[02569])|9(?:0[02-589]|2[02-689]|3[1-5789]|4[2-9]|5[0-579]|6[234789]|7[0124578]|8\\d|9[2-57]))\\d{6}|1(?:2(?:0(?:46[1-4]|87[2-9])|545[1-79]|76(?:2\\d|3[1-8]|6[1-6])|9(?:7(?:2[0-4]|3[2-5])|8(?:2[2-8]|7[0-4789]|8[345])))|3(?:638[2-5]|647[23]|8(?:47[04-9]|64[015789]))|4(?:044[1-7]|20(?:2[23]|8\\d)|6(?:0(?:30|5[2-57]|6[1-8]|7[2-8])|140)|8(?:052|87[123]))|5(?:24(?:3[2-79]|6\\d)|276\\d|6(?:26[06-9]|686))|6(?:06(?:4\\d|7[4-79])|295[567]|35[34]\\d|47(?:24|61)|59(?:5[08]|6[67]|74)|955[0-4])|7(?:26(?:6[13-9]|7[0-7])|442\\d|50(?:2[0-3]|[3-68]2|76))|8(?:27[56]\\d|37(?:5[2-5]|8[239])|84(?:3[2-58]))|9(?:0(?:0(?:6[1-8]|85)|52\\d)|3583|4(?:66[1-8]|9(?:2[01]|81))|63(?:23|3[1-4])|9561))\\d{3}|176888[234678]\\d{2}|16977[23]\\d{3}",
    "\\d{4,10}"],
    [,
    ,
    "7(?:[1-4]\\d\\d|5(?:0[0-8]|[13-9]\\d|2[0-35-9])|7(?:0[1-9]|[1-7]\\d|8[02-9]|9[0-689])|8(?:[014-9]\\d|[23][0-8])|9(?:[04-9]\\d|1[02-9]|2[0-35-9]|3[0-689]))\\d{6}",
    "\\d{10}"],
    [,
    ,
    "80(?:0(?:1111|\\d{6,7})|8\\d{7})|500\\d{6}",
    "\\d{7}(?:\\d{2,3})?"],
    [,
    ,
    "(?:87[123]|9(?:[01]\\d|8[0-3]))\\d{7}",
    "\\d{10}"],
    [,
    ,
    "8(?:4(?:5464\\d|[2-5]\\d{7})|70\\d{7})",
    "\\d{7}(?:\\d{3})?"],
    [,
    ,
    "70\\d{8}",
    "\\d{10}"],
    [,
    ,
    "56\\d{8}",
    "\\d{10}"],
    "GB",
    44,
    "00",
    "0",
    " x",
    ,
    "0",
    ,
    ,
    ,
    [[,
    "(\\d{2})(\\d{4})(\\d{4})",
    "$1 $2 $3",
    ["2|5[56]|7(?:0|6[013-9])",
    "2|5[56]|7(?:0|6(?:[013-9]|2[0-35-9]))"],
    "0$1",
    ""],
    [,
    "(\\d{3})(\\d{3})(\\d{4})",
    "$1 $2 $3",
    ["1(?:1|\\d1)|3|9[018]"],
    "0$1",
    ""],
    [,
    "(\\d{5})(\\d{4,5})",
    "$1 $2",
    ["1(?:38|5[23]|69|76|94)",
    "1(?:387|5(?:24|39)|697|768|946)",
    "1(?:3873|5(?:242|39[456])|697[347]|768[347]|9467)"],
    "0$1",
    ""],
    [,
    "(1\\d{3})(\\d{5,6})",
    "$1 $2",
    ["1"],
    "0$1",
    ""],
    [,
    "(7\\d{3})(\\d{6})",
    "$1 $2",
    ["7(?:[1-5789]|62)",
    "7(?:[1-5789]|624)"],
    "0$1",
    ""],
    [,
    "(800)(\\d{4})",
    "$1 $2",
    ["800",
    "8001",
    "80011",
    "800111",
    "8001111"],
    "0$1",
    ""],
    [,
    "(845)(46)(4\\d)",
    "$1 $2 $3",
    ["845",
    "8454",
    "84546",
    "845464"],
    "0$1",
    ""],
    [,
    "(8\\d{2})(\\d{3})(\\d{4})",
    "$1 $2 $3",
    ["8(?:4[2-5]|7[0-3])"],
    "0$1",
    ""],
    [,
    "(80\\d)(\\d{3})(\\d{4})",
    "$1 $2 $3",
    ["80"],
    "0$1",
    ""],
    [,
    "([58]00)(\\d{6})",
    "$1 $2",
    ["[58]00"],
    "0$1",
    ""]],
    ,
    [,
    ,
    "76(?:0[012]|2[356]|4[0134]|5[49]|6[0-369]|77|81|9[39])\\d{6}",
    "\\d{10}"],
    1,
    ,
    [,
    ,
    "NA",
    "NA"],
    [,
    ,
    "(?:3[0347]|55)\\d{8}",
    "\\d{10}"]],
    GD: [,
    [,
    ,
    "[4589]\\d{9}",
    "\\d{7}(?:\\d{3})?"],
    [,
    ,
    "473(?:2(?:3[0-2]|69)|3(?:2[89]|86)|4(?:[06]8|3[5-9]|4[0-49]|5[5-79]|73|90)|63[68]|7(?:58|84)|938)\\d{4}",
    "\\d{7}(?:\\d{3})?"],
    [,
    ,
    "473(?:4(?:0[3-79]|1[04-9]|20|58)|53[3-8])\\d{4}",
    "\\d{10}"],
    [,
    ,
    "8(?:00|55|66|77|88)[2-9]\\d{6}",
    "\\d{10}"],
    [,
    ,
    "900[2-9]\\d{6}",
    "\\d{10}"],
    [,
    ,
    "NA",
    "NA"],
    [,
    ,
    "5(?:00|33|44)[2-9]\\d{6}",
    "\\d{10}"],
    [,
    ,
    "NA",
    "NA"],
    "GD",
    1,
    "011",
    "1",
    ,
    ,
    "1",
    ,
    ,
    ,
    ,
    ,
    [,
    ,
    "NA",
    "NA"],
    ,
    "473",
    [,
    ,
    "NA",
    "NA"],
    [,
    ,
    "NA",
    "NA"]],
    GE: [,
    [,
    ,
    "[13-79]\\d{7}|8\\d{8}",
    "\\d{5,9}"],
    [,
    ,
    "(?:3(?:[256]\\d|4[124-9]|7[0-4])|4(?:1\\d|2[2-7]|3[1-79]|4[2-8]|7[239]|9[1-7]))\\d{5}",
    "\\d{5,8}"],
    [,
    ,
    "(?:14|5[01578]|6[28]|7[0147-9]|9[0-35-9])\\d{6}",
    "\\d{8}"],
    [,
    ,
    "800\\d{6}",
    "\\d{9}"],
    [,
    ,
    "NA",
    "NA"],
    [,
    ,
    "NA",
    "NA"],
    [,
    ,
    "NA",
    "NA"],
    [,
    ,
    "NA",
    "NA"],
    "GE",
    995,
    "8~10",
    "8",
    ,
    ,
    "8",
    ,
    ,
    ,
    [[,
    "(\\d{2})(\\d{2})(\\d{2})(\\d{2})",
    "$1 $2 $3 $4",
    ["[13-79]"],
    "8 $1",
    ""],
    [,
    "(800)(\\d{2})(\\d{2})(\\d{2})",
    "$1 $2 $3 $4",
    ["8"],
    "8 $1",
    ""]],
    ,
    [,
    ,
    "NA",
    "NA"],
    ,
    ,
    [,
    ,
    "NA",
    "NA"],
    [,
    ,
    "NA",
    "NA"]],
    GF: [,
    [,
    ,
    "[56]\\d{8}",
    "\\d{9}"],
    [,
    ,
    "594(?:10|2[012457-9]|3[0-57-9]|4[3-9]|5[7-9]|6[0-3]|9[014])\\d{4}",
    "\\d{9}"],
    [,
    ,
    "694(?:[04][0-7]|1[0-5]|2[0-46-9]|38|9\\d)\\d{4}",
    "\\d{9}"],
    [,
    ,
    "NA",
    "NA"],
    [,
    ,
    "NA",
    "NA"],
    [,
    ,
    "NA",
    "NA"],
    [,
    ,
    "NA",
    "NA"],
    [,
    ,
    "NA",
    "NA"],
    "GF",
    594,
    "00",
    "0",
    ,
    ,
    "0",
    ,
    ,
    ,
    [[,
    "(\\d{3})(\\d{2})(\\d{2})(\\d{2})",
    "$1 $2 $3 $4",
    ,
    "0$1",
    ""]],
    ,
    [,
    ,
    "NA",
    "NA"],
    ,
    ,
    [,
    ,
    "NA",
    "NA"],
    [,
    ,
    "NA",
    "NA"]],
    GG: [,
    [,
    ,
    "[135789]\\d{6,9}",
    "\\d{6,10}"],
    [,
    ,
    "1481\\d{6}",
    "\\d{6,10}"],
    [,
    ,
    "7(?:781|839|911)\\d{6}",
    "\\d{10}"],
    [,
    ,
    "80(?:0(?:1111|\\d{6,7})|8\\d{7})|500\\d{6}",
    "\\d{7}(?:\\d{2,3})?"],
    [,
    ,
    "(?:87[123]|9(?:[01]\\d|8[0-3]))\\d{7}",
    "\\d{10}"],
    [,
    ,
    "8(?:4(?:5464\\d|[2-5]\\d{7})|70\\d{7})",
    "\\d{7}(?:\\d{3})?"],
    [,
    ,
    "70\\d{8}",
    "\\d{10}"],
    [,
    ,
    "56\\d{8}",
    "\\d{10}"],
    "GG",
    44,
    "00",
    "0",
    " x",
    ,
    "0",
    ,
    ,
    ,
    ,
    ,
    [,
    ,
    "76(?:0[012]|2[356]|4[0134]|5[49]|6[0-369]|77|81|9[39])\\d{6}",
    "\\d{10}"],
    ,
    ,
    [,
    ,
    "NA",
    "NA"],
    [,
    ,
    "(?:3[0347]|55)\\d{8}",
    "\\d{10}"]],
    GH: [,
    [,
    ,
    "[235]\\d{6,8}",
    "\\d{7,9}"],
    [,
    ,
    "3(?:0[237]\\d|[167](?:2[0-6]|7\\d)|2(?:2[0-5]|7\\d)|3(?:2[0-37]|7\\d)|4(?:[27]\\d|30)|5(?:2[0-7]|7\\d)|8(?:2[0-2]|7\\d)|9(?:20|7\\d))\\d{5}",
    "\\d{7,9}"],
    [,
    ,
    "(?:2[034678]|54)\\d{7}",
    "\\d{9}"],
    [,
    ,
    "NA",
    "NA"],
    [,
    ,
    "NA",
    "NA"],
    [,
    ,
    "NA",
    "NA"],
    [,
    ,
    "NA",
    "NA"],
    [,
    ,
    "NA",
    "NA"],
    "GH",
    233,
    "00",
    "0",
    ,
    ,
    "0",
    ,
    ,
    ,
    [[,
    "(\\d{2})(\\d{3})(\\d{4})",
    "$1 $2 $3",
    ,
    "0$1",
    ""]],
    ,
    [,
    ,
    "NA",
    "NA"],
    ,
    ,
    [,
    ,
    "NA",
    "NA"],
    [,
    ,
    "NA",
    "NA"]],
    GI: [,
    [,
    ,
    "[2568]\\d{7}",
    "\\d{8}"],
    [,
    ,
    "2(?:00\\d|16[0-7]|22[2457])\\d{4}",
    "\\d{8}"],
    [,
    ,
    "(?:5[4-8]|60)\\d{6}",
    "\\d{8}"],
    [,
    ,
    "80\\d{6}",
    "\\d{8}"],
    [,
    ,
    "8[1-689]\\d{6}",
    "\\d{8}"],
    [,
    ,
    "87\\d{6}",
    "\\d{8}"],
    [,
    ,
    "NA",
    "NA"],
    [,
    ,
    "NA",
    "NA"],
    "GI",
    350,
    "00",
    ,
    ,
    ,
    ,
    ,
    ,
    ,
    ,
    ,
    [,
    ,
    "NA",
    "NA"],
    ,
    ,
    [,
    ,
    "NA",
    "NA"],
    [,
    ,
    "NA",
    "NA"]],
    GL: [,
    [,
    ,
    "[1-689]\\d{5}",
    "\\d{6}"],
    [,
    ,
    "(?:19|3[1-6]|6[14689]|8[14-79]|9\\d)\\d{4}",
    "\\d{6}"],
    [,
    ,
    "[245][2-9]\\d{4}",
    "\\d{6}"],
    [,
    ,
    "80\\d{4}",
    "\\d{6}"],
    [,
    ,
    "NA",
    "NA"],
    [,
    ,
    "NA",
    "NA"],
    [,
    ,
    "NA",
    "NA"],
    [,
    ,
    "3[89]\\d{4}",
    "\\d{6}"],
    "GL",
    299,
    "00",
    ,
    ,
    ,
    ,
    ,
    ,
    ,
    [[,
    "(\\d{2})(\\d{2})(\\d{2})",
    "$1 $2 $3",
    ,
    "",
    ""]],
    ,
    [,
    ,
    "NA",
    "NA"],
    ,
    ,
    [,
    ,
    "NA",
    "NA"],
    [,
    ,
    "NA",
    "NA"]],
    GM: [,
    [,
    ,
    "[3-9]\\d{6}",
    "\\d{7}"],
    [,
    ,
    "(?:4(?:[23]\\d{2}|4(?:1[024679]|[6-9]\\d))|5(?:54[0-7]|6(?:[67]\\d)|7(?:1[04]|2[035]|3[58]|48))|8\\d{3})\\d{3}",
    "\\d{7}"],
    [,
    ,
    "[3679]\\d{6}",
    "\\d{7}"],
    [,
    ,
    "NA",
    "NA"],
    [,
    ,
    "NA",
    "NA"],
    [,
    ,
    "NA",
    "NA"],
    [,
    ,
    "NA",
    "NA"],
    [,
    ,
    "NA",
    "NA"],
    "GM",
    220,
    "00",
    ,
    ,
    ,
    ,
    ,
    ,
    ,
    [[,
    "(\\d{3})(\\d{4})",
    "$1 $2",
    ,
    "",
    ""]],
    ,
    [,
    ,
    "NA",
    "NA"],
    ,
    ,
    [,
    ,
    "NA",
    "NA"],
    [,
    ,
    "NA",
    "NA"]],
    GN: [,
    [,
    ,
    "[3567]\\d{7}",
    "\\d{8}"],
    [,
    ,
    "30(?:24|3[12]|4[1-35-7]|5[13]|6[189]|[78]1|9[1478])\\d{4}",
    "\\d{8}"],
    [,
    ,
    "55\\d{6}|6(?:0(?:2\\d|3[3467]|5[2457-9])|[24578]\\d{2}|3(?:[14]0|35))\\d{4}",
    "\\d{8}"],
    [,
    ,
    "NA",
    "NA"],
    [,
    ,
    "NA",
    "NA"],
    [,
    ,
    "NA",
    "NA"],
    [,
    ,
    "NA",
    "NA"],
    [,
    ,
    "NA",
    "NA"],
    "GN",
    224,
    "00",
    ,
    ,
    ,
    ,
    ,
    ,
    ,
    [[,
    "(\\d{2})(\\d{2})(\\d{2})(\\d{2})",
    "$1 $2 $3 $4",
    ,
    "",
    ""]],
    ,
    [,
    ,
    "NA",
    "NA"],
    ,
    ,
    [,
    ,
    "NA",
    "NA"],
    [,
    ,
    "NA",
    "NA"]],
    GP: [,
    [,
    ,
    "[56]\\d{8}",
    "\\d{9}"],
    [,
    ,
    "590(?:1[12]|2[0-68]|3[28]|4[126-8]|5[067]|6[018]|[89]\\d)\\d{4}",
    "\\d{9}"],
    [,
    ,
    "690(?:00|1[1-9]|2[013-5]|[3-5]\\d|6[0-57-9]|7[1-6]|8[0-6]|9[09])\\d{4}",
    "\\d{9}"],
    [,
    ,
    "NA",
    "NA"],
    [,
    ,
    "NA",
    "NA"],
    [,
    ,
    "NA",
    "NA"],
    [,
    ,
    "NA",
    "NA"],
    [,
    ,
    "NA",
    "NA"],
    "GP",
    590,
    "00",
    "0",
    ,
    ,
    "0",
    ,
    ,
    ,
    [[,
    "([56]90)(\\d{2})(\\d{4})",
    "$1 $2-$3",
    ,
    "0$1",
    ""]],
    ,
    [,
    ,
    "NA",
    "NA"],
    1,
    ,
    [,
    ,
    "NA",
    "NA"],
    [,
    ,
    "NA",
    "NA"]],
    GQ: [,
    [,
    ,
    "[23589]\\d{8}",
    "\\d{9}"],
    [,
    ,
    "3(?:3(?:3\\d[7-9]|[0-24-9]\\d[46])|5\\d{2}[7-9])\\d{4}",
    "\\d{9}"],
    [,
    ,
    "(?:222|551)\\d{6}",
    "\\d{9}"],
    [,
    ,
    "80\\d[1-9]\\d{5}",
    "\\d{9}"],
    [,
    ,
    "90\\d[1-9]\\d{5}",
    "\\d{9}"],
    [,
    ,
    "NA",
    "NA"],
    [,
    ,
    "NA",
    "NA"],
    [,
    ,
    "NA",
    "NA"],
    "GQ",
    240,
    "00",
    ,
    ,
    ,
    ,
    ,
    ,
    ,
    [[,
    "(\\d{3})(\\d{3})(\\d{3})",
    "$1 $2 $3",
    ["[235]"],
    "",
    ""],
    [,
    "(\\d{3})(\\d{6})",
    "$1 $2",
    ["[89]"],
    "",
    ""]],
    ,
    [,
    ,
    "NA",
    "NA"],
    ,
    ,
    [,
    ,
    "NA",
    "NA"],
    [,
    ,
    "NA",
    "NA"]],
    GR: [,
    [,
    ,
    "[26-9]\\d{9}",
    "\\d{10}"],
    [,
    ,
    "2(?:1\\d{2}|2(?:3[1-8]|4[1-7]|5[1-4]|6[1-8]|7[1-5]|[289][1-9])|3(?:1\\d|2[1-5]|3[1-4]|[45][1-3]|7[1-7]|8[1-6]|9[1-79])|4(?:1\\d|2[1-8]|3[1-4]|4[13-5]|6[1-578]|9[1-5])|5(?:1\\d|2[1-3]|4[124]|5[1-6]|[39][1-4])|6(?:1\\d|3[24]|4[1-7]|5[13-9]|[269][1-6]|7[14]|8[1-35])|7(?:1\\d|[23][1-5]|4[1-7]|5[1-57]|6[134]|9[15-7])|8(?:1\\d|2[1-5]|[34][1-4]|9[1-7]))\\d{6}",
    "\\d{10}"],
    [,
    ,
    "69\\d{8}",
    "\\d{10}"],
    [,
    ,
    "800\\d{7}",
    "\\d{10}"],
    [,
    ,
    "90[19]\\d{7}",
    "\\d{10}"],
    [,
    ,
    "8(?:0[16]|12|25)\\d{7}",
    "\\d{10}"],
    [,
    ,
    "70\\d{8}",
    "\\d{10}"],
    [,
    ,
    "NA",
    "NA"],
    "GR",
    30,
    "00",
    ,
    ,
    ,
    ,
    ,
    ,
    ,
    [[,
    "([27]\\d)(\\d{4})(\\d{4})",
    "$1 $2 $3",
    ["21|7"],
    "",
    ""],
    [,
    "(\\d{3})(\\d{3})(\\d{4})",
    "$1 $2 $3",
    ["2[2-9]1|[689]"],
    "",
    ""],
    [,
    "(2\\d{3})(\\d{6})",
    "$1 $2",
    ["2[2-9][02-9]"],
    "",
    ""]],
    ,
    [,
    ,
    "NA",
    "NA"],
    ,
    ,
    [,
    ,
    "NA",
    "NA"],
    [,
    ,
    "NA",
    "NA"]],
    GT: [,
    [,
    ,
    "[2-7]\\d{7}|1[89]\\d{9}",
    "\\d{8}(?:\\d{3})?"],
    [,
    ,
    "[267][2-9]\\d{6}",
    "\\d{8}"],
    [,
    ,
    "[345]\\d{7}",
    "\\d{8}"],
    [,
    ,
    "18[01]\\d{8}",
    "\\d{11}"],
    [,
    ,
    "19\\d{9}",
    "\\d{11}"],
    [,
    ,
    "NA",
    "NA"],
    [,
    ,
    "NA",
    "NA"],
    [,
    ,
    "NA",
    "NA"],
    "GT",
    502,
    "00",
    ,
    ,
    ,
    ,
    ,
    ,
    ,
    [[,
    "(\\d{4})(\\d{4})",
    "$1 $2",
    ["[2-7]"],
    "",
    ""],
    [,
    "(\\d{4})(\\d{3})(\\d{4})",
    "$1 $2 $3",
    ["1"],
    "",
    ""]],
    ,
    [,
    ,
    "NA",
    "NA"],
    ,
    ,
    [,
    ,
    "NA",
    "NA"],
    [,
    ,
    "NA",
    "NA"]],
    GU: [,
    [,
    ,
    "[5689]\\d{9}",
    "\\d{7}(?:\\d{3})?"],
    [,
    ,
    "671(?:3(?:00|3[39]|4[349]|55|6[26])|4(?:56|7[1-9]|8[23678])|5(?:55|6[2-5]|88)|6(?:3[2-578]|4[24-9]|5[34]|78|8[5-9])|7(?:[079]7|2[0167]|3[45]|8[789])|8(?:[2-5789]8|6[48])|9(?:2[29]|6[79]|7[179]|8[789]|9[78]))\\d{4}",
    "\\d{7}(?:\\d{3})?"],
    [,
    ,
    "671(?:3(?:00|3[39]|4[349]|55|6[26])|4(?:56|7[1-9]|8[23678])|5(?:55|6[2-5]|88)|6(?:3[2-578]|4[24-9]|5[34]|78|8[5-9])|7(?:[079]7|2[0167]|3[45]|8[789])|8(?:[2-5789]8|6[48])|9(?:2[29]|6[79]|7[179]|8[789]|9[78]))\\d{4}",
    "\\d{7}(?:\\d{3})?"],
    [,
    ,
    "8(?:00|55|66|77|88)[2-9]\\d{6}",
    "\\d{10}"],
    [,
    ,
    "900[2-9]\\d{6}",
    "\\d{10}"],
    [,
    ,
    "NA",
    "NA"],
    [,
    ,
    "5(?:00|33|44)[2-9]\\d{6}",
    "\\d{10}"],
    [,
    ,
    "NA",
    "NA"],
    "GU",
    1,
    "011",
    "1",
    ,
    ,
    "1",
    ,
    ,
    1,
    ,
    ,
    [,
    ,
    "NA",
    "NA"],
    ,
    "671",
    [,
    ,
    "NA",
    "NA"],
    [,
    ,
    "NA",
    "NA"]],
    GW: [,
    [,
    ,
    "[3567]\\d{6}",
    "\\d{7}"],
    [,
    ,
    "3(?:2[0125]|3[1245]|4[12]|5[1-4]|70|9[1-467])\\d{4}",
    "\\d{7}"],
    [,
    ,
    "[5-7]\\d{6}",
    "\\d{7}"],
    [,
    ,
    "NA",
    "NA"],
    [,
    ,
    "NA",
    "NA"],
    [,
    ,
    "NA",
    "NA"],
    [,
    ,
    "NA",
    "NA"],
    [,
    ,
    "NA",
    "NA"],
    "GW",
    245,
    "00",
    ,
    ,
    ,
    ,
    ,
    ,
    ,
    [[,
    "(\\d{3})(\\d{4})",
    "$1 $2",
    ,
    "",
    ""]],
    ,
    [,
    ,
    "NA",
    "NA"],
    ,
    ,
    [,
    ,
    "NA",
    "NA"],
    [,
    ,
    "NA",
    "NA"]],
    GY: [,
    [,
    ,
    "[2-4679]\\d{6}",
    "\\d{7}"],
    [,
    ,
    "(?:2(?:1[6-9]|2[0-35-9]|3[1-4]|5[3-9]|6\\d|7[0-24-79])|3(?:2[25-9]|3\\d)|4(?:4[0-24]|5[56])|77[1-57])\\d{4}",
    "\\d{7}"],
    [,
    ,
    "6\\d{6}",
    "\\d{7}"],
    [,
    ,
    "(?:289|862)\\d{4}",
    "\\d{7}"],
    [,
    ,
    "9008\\d{3}",
    "\\d{7}"],
    [,
    ,
    "NA",
    "NA"],
    [,
    ,
    "NA",
    "NA"],
    [,
    ,
    "NA",
    "NA"],
    "GY",
    592,
    "001",
    ,
    ,
    ,
    ,
    ,
    ,
    ,
    [[,
    "(\\d{3})(\\d{4})",
    "$1 $2",
    ,
    "",
    ""]],
    ,
    [,
    ,
    "NA",
    "NA"],
    ,
    ,
    [,
    ,
    "NA",
    "NA"],
    [,
    ,
    "NA",
    "NA"]],
    HK: [,
    [,
    ,
    "[235-7]\\d{7}|8\\d{7,8}|9\\d{7,10}",
    "\\d{8,11}"],
    [,
    ,
    "[23]\\d{7}",
    "\\d{8}"],
    [,
    ,
    "[5-79]\\d{7}",
    "\\d{8}"],
    [,
    ,
    "800\\d{6}",
    "\\d{9}"],
    [,
    ,
    "900\\d{8}",
    "\\d{11}"],
    [,
    ,
    "NA",
    "NA"],
    [,
    ,
    "8[1-3]\\d{6}",
    "\\d{8}"],
    [,
    ,
    "NA",
    "NA"],
    "HK",
    852,
    "00",
    ,
    ,
    ,
    ,
    ,
    ,
    ,
    [[,
    "(\\d{4})(\\d{4})",
    "$1 $2",
    ["[235-7]|[89](?:0[1-9]|[1-9])"],
    "",
    ""],
    [,
    "(800)(\\d{3})(\\d{3})",
    "$1 $2 $3",
    ["800"],
    "",
    ""],
    [,
    "(900)(\\d{2})(\\d{3})(\\d{3})",
    "$1 $2 $3 $4",
    ["900"],
    "",
    ""]],
    ,
    [,
    ,
    "NA",
    "NA"],
    ,
    ,
    [,
    ,
    "NA",
    "NA"],
    [,
    ,
    "NA",
    "NA"]],
    HN: [,
    [,
    ,
    "[237-9]\\d{7}",
    "\\d{8}"],
    [,
    ,
    "2(?:2(?:0[019]|1[1-36]|[23]\\d|4[056]|5[57]|9[01])|4(?:2|3-59]|3[13-689]|4[0-68]|5[1-35])|5(?:4[3-5]|5\\d|6[56]|74)|6(?:4[0-378]|[56]\\d|[78][0-8]|9[01])|7(?:6[46-9]|7[02-9]|8[34])|8(?:79|8[0-35789]|9[1-57-9]))\\d{4}",
    "\\d{8}"],
    [,
    ,
    "[37-9]\\d{7}",
    "\\d{8}"],
    [,
    ,
    "NA",
    "NA"],
    [,
    ,
    "NA",
    "NA"],
    [,
    ,
    "NA",
    "NA"],
    [,
    ,
    "NA",
    "NA"],
    [,
    ,
    "NA",
    "NA"],
    "HN",
    504,
    "00",
    ,
    ,
    ,
    ,
    ,
    ,
    ,
    [[,
    "(\\d{4})(\\d{4})",
    "$1-$2",
    ,
    "",
    ""]],
    ,
    [,
    ,
    "NA",
    "NA"],
    ,
    ,
    [,
    ,
    "NA",
    "NA"],
    [,
    ,
    "NA",
    "NA"]],
    HR: [,
    [,
    ,
    "[1-7]\\d{5,8}|[89]\\d{6,11}",
    "\\d{6,12}"],
    [,
    ,
    "(?:1|6[029])\\d{7}|(?:2[0-3]|3[1-5]|4[02-47-9]|5[1-3])\\d{6}",
    "\\d{6,9}"],
    [,
    ,
    "9[12589]\\d{6,10}",
    "\\d{8,12}"],
    [,
    ,
    "80[01]\\d{4,7}",
    "\\d{7,10}"],
    [,
    ,
    "6[145]\\d{4,7}",
    "\\d{6,9}"],
    [,
    ,
    "NA",
    "NA"],
    [,
    ,
    "7[45]\\d{4,7}",
    "\\d{6,9}"],
    [,
    ,
    "NA",
    "NA"],
    "HR",
    385,
    "00",
    "0",
    ,
    ,
    "0",
    ,
    ,
    ,
    [[,
    "(1)(\\d{4})(\\d{3})",
    "$1 $2 $3",
    ["1"],
    "0$1",
    ""],
    [,
    "(6[029])(\\d{4})(\\d{3})",
    "$1 $2 $3",
    ["6[029]"],
    "0$1",
    ""],
    [,
    "([2-5]\\d)(\\d{3})(\\d{3})",
    "$1 $2 $3",
    ["[2-5]"],
    "0$1",
    ""],
    [,
    "(9[12589])(\\d{3,4})(\\d{3,4})",
    "$1 $2 $3",
    ["9"],
    "0$1",
    ""],
    [,
    "(9[12589])(\\d{3,4})(\\d{3})(\\d{3})",
    "$1 $2 $3 $4",
    ["9"],
    "0$1",
    ""],
    [,
    "(\\d{2})(\\d{2})(\\d{2,3})",
    "$1 $2 $3",
    ["6[145]|7"],
    "0$1",
    ""],
    [,
    "(\\d{2})(\\d{3,4})(\\d{3})",
    "$1 $2 $3",
    ["6[145]|7"],
    "0$1",
    ""],
    [,
    "(80[01])(\\d{2})(\\d{2,3})",
    "$1 $2 $3",
    ["8"],
    "0$1",
    ""],
    [,
    "(80[01])(\\d{3,4})(\\d{3})",
    "$1 $2 $3",
    ["8"],
    "0$1",
    ""]],
    ,
    [,
    ,
    "NA",
    "NA"],
    ,
    ,
    [,
    ,
    "NA",
    "NA"],
    [,
    ,
    "NA",
    "NA"]],
    HT: [,
    [,
    ,
    "[2-489]\\d{7}",
    "\\d{8}"],
    [,
    ,
    "2(?:[24]\\d|5[1-5]|94)\\d{5}",
    "\\d{8}"],
    [,
    ,
    "(?:3[4-9]|4\\d)\\d{6}",
    "\\d{8}"],
    [,
    ,
    "8\\d{7}",
    "\\d{8}"],
    [,
    ,
    "NA",
    "NA"],
    [,
    ,
    "NA",
    "NA"],
    [,
    ,
    "NA",
    "NA"],
    [,
    ,
    "98[89]\\d{5}",
    "\\d{8}"],
    "HT",
    509,
    "00",
    ,
    ,
    ,
    ,
    ,
    ,
    ,
    [[,
    "(\\d{2})(\\d{2})(\\d{4})",
    "$1 $2 $3",
    ,
    "",
    ""]],
    ,
    [,
    ,
    "NA",
    "NA"],
    ,
    ,
    [,
    ,
    "NA",
    "NA"],
    [,
    ,
    "NA",
    "NA"]],
    HU: [,
    [,
    ,
    "\\d{8,9}",
    "\\d{6,9}"],
    [,
    ,
    "(?:1\\d|2(?:1\\d|[2-9])|3[2-7]|4[24-9]|5[2-79]|6[23689]|7(?:1\\d|[2-9])|8[2-57-9]|9[2-69])\\d{6}",
    "\\d{6,9}"],
    [,
    ,
    "(?:[27]0|3[01])\\d{7}",
    "\\d{9}"],
    [,
    ,
    "80\\d{6}",
    "\\d{8}"],
    [,
    ,
    "9[01]\\d{6}",
    "\\d{8}"],
    [,
    ,
    "40\\d{6}",
    "\\d{8}"],
    [,
    ,
    "NA",
    "NA"],
    [,
    ,
    "NA",
    "NA"],
    "HU",
    36,
    "00",
    "06",
    ,
    ,
    "06",
    ,
    ,
    ,
    [[,
    "(1)(\\d{3})(\\d{4})",
    "$1 $2 $3",
    ["1"],
    "($1)",
    ""],
    [,
    "(\\d{2})(\\d{3})(\\d{3,4})",
    "$1 $2 $3",
    ["[2-9]"],
    "($1)",
    ""]],
    ,
    [,
    ,
    "NA",
    "NA"],
    ,
    ,
    [,
    ,
    "NA",
    "NA"],
    [,
    ,
    "NA",
    "NA"]],
    ID: [,
    [,
    ,
    "[1-9]\\d{6,10}",
    "\\d{5,11}"],
    [,
    ,
    "2[124]\\d{7,8}|(?:2(?:[35][1-4]|6[0-8]|7[1-6]|8\\d|9[1-8])|3(?:1|2[1-578]|3[1-68]|4[1-3]|5[1-8]|6[1-3568]|7[0-46]|8\\d)|4(?:0[1-589]|1[01347-9]|2[0-36-8]|3[0-24-68]|5[1-378]|6[1-5]|7[134]|8[1245])|5(?:1[1-35-9]|2[25-8]|3[1246-9]|4[1-3589]|5[1-46]|6[1-8])|6(?:19?|[25]\\d|3[1-469]|4[1-6])|7(?:1[1-46-9]|2[14-9]|[36]\\d|4[1-8]|5[1-9]|7[0-36-9])|9(?:0[12]|1[0134-8]|2[0-479]|5[125-8]|6[23679]|7[159]|8[01346]))\\d{5,8}",
    "\\d{5,10}"],
    [,
    ,
    "8[1-35-9]\\d{7,9}",
    "\\d{9,11}"],
    [,
    ,
    "177\\d{6,8}|800\\d{5,7}",
    "\\d{8,11}"],
    [,
    ,
    "809\\d{7}",
    "\\d{10}"],
    [,
    ,
    "NA",
    "NA"],
    [,
    ,
    "NA",
    "NA"],
    [,
    ,
    "NA",
    "NA"],
    "ID",
    62,
    "0(?:0[1789]|10(?:00|1[67]))",
    "0",
    ,
    ,
    "0",
    ,
    ,
    ,
    [[,
    "(\\d{2})(\\d{7,8})",
    "$1 $2",
    ["2[124]|[36]1"],
    "(0$1)",
    ""],
    [,
    "(\\d{3})(\\d{5,7})",
    "$1 $2",
    ["[4579]|2[035-9]|[36][02-9]"],
    "(0$1)",
    ""],
    [,
    "(8\\d{2})(\\d{3,4})(\\d{3,4})",
    "$1-$2-$3",
    ["8[1-35-9]"],
    "0$1",
    ""],
    [,
    "(177)(\\d{6,8})",
    "$1 $2",
    ["1"],
    "0$1",
    ""],
    [,
    "(800)(\\d{5,7})",
    "$1 $2",
    ["800"],
    "0$1",
    ""],
    [,
    "(809)(\\d)(\\d{3})(\\d{3})",
    "$1 $2 $3 $4",
    ["809"],
    "0$1",
    ""]],
    ,
    [,
    ,
    "NA",
    "NA"],
    ,
    ,
    [,
    ,
    "NA",
    "NA"],
    [,
    ,
    "NA",
    "NA"]],
    IE: [,
    [,
    ,
    "[124-9]\\d{6,9}",
    "\\d{5,10}"],
    [,
    ,
    "1\\d{7,8}|2(?:1\\d{6,7}|[24-9]\\d{5}|3\\d{5,7})|4(?:0[24]\\d{5}|[1269]\\d{7}|[34]\\d{5,7}|5\\d{6}|7\\d{5}|8[0-46-9]\\d{7})|5(?:0[45]\\d{5}|1\\d{6}|2\\d{5,7}|[3679]\\d{7}|8\\d{5})|6(?:1\\d{6}|4\\d{5,7}|[237-9]\\d{5}|[56]\\d{7})|7[14]\\d{7}|9(?:1\\d{6}|[04]\\d{7}|[3-9]\\d{5})",
    "\\d{5,10}"],
    [,
    ,
    "8(?:22\\d{6}|[35-9]\\d{7,8})",
    "\\d{9,10}"],
    [,
    ,
    "1800\\d{6}",
    "\\d{10}"],
    [,
    ,
    "15(?:1[2-9]|[2-8]0|59|9[089])\\d{6}",
    "\\d{10}"],
    [,
    ,
    "18[59]0\\d{6}",
    "\\d{10}"],
    [,
    ,
    "700\\d{6}",
    "\\d{9}"],
    [,
    ,
    "76\\d{7}",
    "\\d{9}"],
    "IE",
    353,
    "00",
    "0",
    ,
    ,
    "0",
    ,
    ,
    ,
    [[,
    "(1)(\\d{3,4})(\\d{4})",
    "$1 $2 $3",
    ["1"],
    "(0$1)",
    ""],
    [,
    "(\\d{2})(\\d{5})",
    "$1 $2",
    ["2[2-9]|4[347]|5[2-58]|6[2-47-9]|9[3-9]"],
    "(0$1)",
    ""],
    [,
    "(\\d{3})(\\d{5})",
    "$1 $2",
    ["40[24]|50[45]"],
    "(0$1)",
    ""],
    [,
    "(48)(\\d{4})(\\d{4})",
    "$1 $2 $3",
    ["48"],
    "(0$1)",
    ""],
    [,
    "(818)(\\d{3})(\\d{3})",
    "$1 $2 $3",
    ["81"],
    "(0$1)",
    ""],
    [,
    "(\\d{2})(\\d{3})(\\d{3,4})",
    "$1 $2 $3",
    ["[24-69]|7[14]"],
    "(0$1)",
    ""],
    [,
    "([78]\\d)(\\d{3,4})(\\d{4})",
    "$1 $2 $3",
    ["76|8[35-9]"],
    "0$1",
    ""],
    [,
    "(700)(\\d{3})(\\d{3})",
    "$1 $2 $3",
    ["70"],
    "0$1",
    ""],
    [,
    "(\\d{4})(\\d{3})(\\d{3})",
    "$1 $2 $3",
    ["1(?:8[059]|5)",
    "1(?:8[059]0|5)"],
    "$1",
    ""]],
    ,
    [,
    ,
    "NA",
    "NA"],
    ,
    ,
    [,
    ,
    "NA",
    "NA"],
    [,
    ,
    "818\\d{6}",
    "\\d{9}"]],
    IL: [,
    [,
    ,
    "[17]\\d{6,9}|[2-589]\\d{3}(?:\\d{3,6})?|6\\d{3}",
    "\\d{4,10}"],
    [,
    ,
    "(?:[2-489]|7[2-46-8])\\d{7}",
    "\\d{7,9}"],
    [,
    ,
    "5[024679]\\d{7}",
    "\\d{9}"],
    [,
    ,
    "1(?:80[01]\\d{3}|255)\\d{3}",
    "\\d{7,10}"],
    [,
    ,
    "1(?:212|(?:919|200)\\d{2})\\d{4}",
    "\\d{8,10}"],
    [,
    ,
    "1(?:700|809)\\d{6}",
    "\\d{10}"],
    [,
    ,
    "NA",
    "NA"],
    [,
    ,
    "77\\d{7}",
    "\\d{9}"],
    "IL",
    972,
    "0(?:0|1[2-48])",
    "0",
    ,
    ,
    "0",
    ,
    ,
    ,
    [[,
    "([2-489])(\\d{3})(\\d{4})",
    "$1-$2-$3",
    ["[2-489]"],
    "0$1",
    ""],
    [,
    "([57]\\d)(\\d{3})(\\d{4})",
    "$1-$2-$3",
    ["[57]"],
    "0$1",
    ""],
    [,
    "(1)([7-9]\\d{2})(\\d{3})(\\d{3})",
    "$1-$2-$3-$4",
    ["1[7-9]"],
    "$1",
    ""],
    [,
    "(1255)(\\d{3})",
    "$1-$2",
    ["125"],
    "$1",
    ""],
    [,
    "(1200)(\\d{3})(\\d{3})",
    "$1-$2-$3",
    ["120"],
    "$1",
    ""],
    [,
    "(1212)(\\d{2})(\\d{2})",
    "$1-$2-$3",
    ["121"],
    "$1",
    ""],
    [,
    "(\\d{4})",
    "*$1",
    ["[2-689]"],
    "$1",
    ""]],
    ,
    [,
    ,
    "NA",
    "NA"],
    ,
    ,
    [,
    ,
    "1700\\d{6}|[2-689]\\d{3}",
    "\\d{4,10}"],
    [,
    ,
    "[2-689]\\d{3}",
    "\\d{4}"]],
    IM: [,
    [,
    ,
    "[135789]\\d{6,9}",
    "\\d{6,10}"],
    [,
    ,
    "1624\\d{6}",
    "\\d{6,10}"],
    [,
    ,
    "7[569]24\\d{6}",
    "\\d{10}"],
    [,
    ,
    "808162\\d{4}",
    "\\d{10}"],
    [,
    ,
    "(?:872299|90[0167]624)\\d{4}",
    "\\d{10}"],
    [,
    ,
    "8(?:4(?:40[49]06|5624\\d)|70624\\d)\\d{3}",
    "\\d{10}"],
    [,
    ,
    "70\\d{8}",
    "\\d{10}"],
    [,
    ,
    "56\\d{8}",
    "\\d{10}"],
    "IM",
    44,
    "00",
    "0",
    " x",
    ,
    "0",
    ,
    ,
    ,
    ,
    ,
    [,
    ,
    "NA",
    "NA"],
    ,
    ,
    [,
    ,
    "NA",
    "NA"],
    [,
    ,
    "3(?:08162\\d|3\\d{5}|4(?:40[49]06|5624\\d)|7(?:0624\\d|2299\\d))\\d{3}|55\\d{8}",
    "\\d{10}"]],
    IN: [,
    [,
    ,
    "1\\d{7,11}|[2-9]\\d{9,10}",
    "\\d{6,12}"],
    [,
    ,
    "(?:11|2[02]|33|4[04]|79)[2-6]\\d{7}|80[2-46]\\d{7}|(?:1(?:2[0-249]|3[0-25]|4[145]|[59][14]|6[014]|7[1257]|8[01346])|2(?:1[257]|3[013]|4[01]|5[0137]|6[0158]|78|8[1568]|9[14])|3(?:26|4[1-3]|5[34]|6[01489]|7[02-46]|8[159])|4(?:1[36]|2[1-47]|3[15]|5[12]|6[126-9]|7[0-24-9]|8[013-57]|9[014-7])|5(?:[136][25]|22|4[28]|5[12]|[78]1|9[15])|6(?:12|[2345]1|57|6[13]|7[14]|80)|7(?:12|2[14]|3[134]|4[47]|5[15]|[67]1|88)|8(?:16|2[014]|3[126]|6[136]|7[078]|8[34]|91))[2-6]\\d{6}|(?:(?:1(?:2[35-8]|3[346-9]|4[236-9]|[59][0235-9]|6[235-9]|7[34689]|8[257-9])|2(?:1[134689]|3[24-8]|4[2-8]|5[25689]|6[2-4679]|7[13-79]|8[2-479]|9[235-9])|3(?:01|1[79]|2[1-5]|4[25-8]|5[125689]|6[235-7]|7[157-9]|8[2-467])|4(?:1[14578]|2[5689]|3[2-467]|5[4-7]|6[35]|73|8[2689]|9[2389])|5(?:[16][146-9]|2[14-8]|3[1346]|4[14-69]|5[46]|7[2-4]|8[2-8]|9[246])|6(?:1[1358]|2[2457]|3[2-4]|4[235-7]|5[2-689]|6[24-58]|7[23-689]|8[1-6])|8(?:1[1357-9]|2[235-8]|3[03-57-9]|4[0-24-9]|5\\d|6[2457-9]|7[1-6]|8[1256]|9[2-4]))\\d|7(?:(?:1[013-9]|2[0235-9]|3[2679]|4[1-35689]|5[2-46-9]|[67][02-9]|9\\d)\\d|8(?:2[0-6]|[013-8]\\d)))[2-6]\\d{5}",
    "\\d{6,10}"],
    [,
    ,
    "(?:7(?:2(?:0[04-9]|5[09]|7[5-8]|9[389])|3(?:0[134679]|5[0-489]|7[3679]|8[3-9]|9[689])|4(?:0[4579]|1[15-9]|[29][89]|39|8[389])|5(?:0[0-5789]|[47]9|[25]0|6[6-9]|[89][7-9])|6(?:0[027]|12|20|3[19]|5[45]|6[5-9]|7[679]|9[6-9])|7(?:0[27-9]|[39][5-9]|42|60)|8(?:[03][07-9]|14|2[7-9]|4[25]|6[09]|7\\d|9[013-9]))|8(?:0[01589]\\d|1(?:[024]\\d|15|30|7[19]|97)|2(?:[2369]\\d|52|7[0135]|8[67])|3(?:0[235-8]|4[179]|74|90)|4(?:[02-58]\\d|10|6[09])|5(?:0[079]|[19]1|2\\d|30|4[47]|53|7[45])|6(?:[0589]\\d|7[09])|7(?:1[24]|[2569]\\d)|8(?:[07-9]\\d|17|2[024-8]|44|5[389]|6[0167])|9(?:[057-9]\\d|2[35-9]|3[09]|4[038]|6[0-27-9]))|9\\d{3})\\d{6}",
    "\\d{10}"],
    [,
    ,
    "1(?:600\\d{6}|800\\d{4,8})",
    "\\d{8,12}"],
    [,
    ,
    "NA",
    "NA"],
    [,
    ,
    "NA",
    "NA"],
    [,
    ,
    "NA",
    "NA"],
    [,
    ,
    "NA",
    "NA"],
    "IN",
    91,
    "00",
    "0",
    ,
    ,
    "0",
    ,
    ,
    ,
    [[,
    "(\\d{2})(\\d{2})(\\d{6})",
    "$1 $2 $3",
    ["7(?:2[0579]|3[057-9]|4[0-389]|5[024-9]|6[0-35-9]|7[03469]|8[0-4679])|8(?:0[01589]|1[0-479]|2[236-9]|3[0479]|4[0-68]|5[0-579]6[05789]7[12569]|8[0124-9]|9[02-9])|9",
    "7(?:2(?:0[04-9]|5[09]|7[5-8]|9[389])|3(?:0[134679]|5[0-489]|7[3679]|8[3-9]|9[689])|4(?:0[4579]|1[15-9]|[29][89]|39|8[389])|5(?:0[0-5789]|[47]9|[25]0|6[6-9]|[89][7-9])|6(?:0[027]|12|20|3[19]|5[45]|6[5-9]|7[679]|9[6-9])|7(?:0[27-9]|3[5-9]|42|60|9[5-9])|8(?:[03][07-9]|14|2[7-9]|4[25]|6[09]|7|9[013-9]))|8(?:0[01589]|1(?:[024]|15|30|7[19]|97)|2(?:[2369]|7[0135]|8[67])|3(?:0[235-8]|4[179]|74|90)|4(?:[02-58]|10|6[09])|5(?:0[079]|[19]1|2|30|4[47]|53|7[45])|6(?:[0589]|70)|7(?:1[24]|[2569])|8(?:[07-9]|17|2[024-8]|44|5[389]|6[0167])|9(?:[057-9]|2[35-9]|3[09]|4[038]|6[0-27-9]))|9"],
    "0$1",
    ""],
    [,
    "(\\d{2})(\\d{4})(\\d{4})",
    "$1 $2 $3",
    ["11|2[02]|33|4[04]|79|80[2-46]"],
    "0$1",
    ""],
    [,
    "(\\d{3})(\\d{3})(\\d{4})",
    "$1 $2 $3",
    ["1(?:2[0-249]|3[0-25]|4[145]|[569][14]|7[1257]|8[1346]|[68][1-9])|2(?:1[257]|3[013]|4[01]|5[0137]|6[0158]|78|8[1568]|9[14])|3(?:26|4[1-3]|5[34]|6[01489]|7[02-46]|8[159])|4(?:1[36]|2[1-47]|3[15]|5[12]|6[126-9]|7[0-24-9]|8[013-57]|9[014-7])|5(?:[136][25]|22|4[28]|5[12]|[78]1|9[15])|6(?:12|[2345]1|57|6[13]|7[14]|80)"],
    "0$1",
    ""],
    [,
    "(\\d{3})(\\d{3})(\\d{4})",
    "$1 $2 $3",
    ["7(?:12|2[14]|3[134]|4[47]|5[15]|[67]1|88)",
    "7(?:12|2[14]|3[134]|4[47]|5(?:1|5[2-6])|[67]1|88)"],
    "0$1",
    ""],
    [,
    "(\\d{3})(\\d{3})(\\d{4})",
    "$1 $2 $3",
    ["8(?:16|2[014]|3[126]|6[136]|7[078]|8[34]|91)"],
    "0$1",
    ""],
    [,
    "(\\d{4})(\\d{3})(\\d{3})",
    "$1 $2 $3",
    ["1(?:[2-579]|[68][1-9])|[2-8]"],
    "0$1",
    ""],
    [,
    "(1600)(\\d{2})(\\d{4})",
    "$1 $2 $3",
    ["160",
    "1600"],
    "$1",
    ""],
    [,
    "(1800)(\\d{4,5})",
    "$1 $2",
    ["180",
    "1800"],
    "$1",
    ""],
    [,
    "(18[06]0)(\\d{2,4})(\\d{4})",
    "$1 $2 $3",
    ["18[06]",
    "18[06]0"],
    "$1",
    ""]],
    ,
    [,
    ,
    "NA",
    "NA"],
    ,
    ,
    [,
    ,
    "NA",
    "NA"],
    [,
    ,
    "1860345\\d{4}",
    "\\d{11}"]],
    IO: [,
    [,
    ,
    "3\\d{6}",
    "\\d{7}"],
    [,
    ,
    "37\\d{5}",
    "\\d{7}"],
    [,
    ,
    "38\\d{5}",
    "\\d{7}"],
    [,
    ,
    "NA",
    "NA"],
    [,
    ,
    "NA",
    "NA"],
    [,
    ,
    "NA",
    "NA"],
    [,
    ,
    "NA",
    "NA"],
    [,
    ,
    "NA",
    "NA"],
    "IO",
    246,
    "00",
    ,
    ,
    ,
    ,
    ,
    ,
    ,
    [[,
    "(\\d{3})(\\d{4})",
    "$1 $2",
    ,
    "",
    ""]],
    ,
    [,
    ,
    "NA",
    "NA"],
    ,
    ,
    [,
    ,
    "NA",
    "NA"],
    [,
    ,
    "NA",
    "NA"]],
    IQ: [,
    [,
    ,
    "[1-7]\\d{7,9}",
    "\\d{6,10}"],
    [,
    ,
    "1\\d{7}|(?:2[13-5]|3[02367]|4[023]|5[03]|6[026])\\d{6,7}",
    "\\d{6,9}"],
    [,
    ,
    "7[5-9]\\d{8}",
    "\\d{10}"],
    [,
    ,
    "NA",
    "NA"],
    [,
    ,
    "NA",
    "NA"],
    [,
    ,
    "NA",
    "NA"],
    [,
    ,
    "NA",
    "NA"],
    [,
    ,
    "NA",
    "NA"],
    "IQ",
    964,
    "00",
    "0",
    ,
    ,
    "0",
    ,
    ,
    ,
    [[,
    "(1)(\\d{3})(\\d{4})",
    "$1 $2 $3",
    ["1"],
    "0$1",
    ""],
    [,
    "([2-6]\\d)(\\d{3})(\\d{3,4})",
    "$1 $2 $3",
    ["[2-6]"],
    "0$1",
    ""],
    [,
    "(7[5-9]\\d)(\\d{3})(\\d{4})",
    "$1 $2 $3",
    ["7"],
    "0$1",
    ""]],
    ,
    [,
    ,
    "NA",
    "NA"],
    ,
    ,
    [,
    ,
    "NA",
    "NA"],
    [,
    ,
    "NA",
    "NA"]],
    IR: [,
    [,
    ,
    "[2-6]\\d{4,9}|[1789]\\d{9}",
    "\\d{5,10}"],
    [,
    ,
    "2(?:1[2-9]\\d{2,7}|51\\d{3,7})|(?:241|3(?:11|5[23])|441|5[14]1)\\d{4,7}|(?:3(?:34|41)|6(?:11|52)|)\\d{6,7}|(?:1(?:[134589][12]|[27][1-4])|2(?:2[189]|[3689][12]|42|5[256]|7[34])|3(?:12|2[1-4]|3[125]|4[24-9]|51|[6-9][12])|4(?:[135-9][12]|2[1-467]|4[2-4])|5(?:12|2[89]|3[1-5]|4[2-8]|[5-7][12]|8[1245])|6(?:12|[347-9][12]|51|6[1-6])|7(?:[13589][12]|2[1289]|4[1-4]|6[1-6]|7[1-3])|8(?:[145][12]|3[124578]|6[1256]|7[1245]))\\d{7}",
    "\\d{5,10}"],
    [,
    ,
    "9(?:1\\d|3[124-8])\\d{7}",
    "\\d{10}"],
    [,
    ,
    "NA",
    "NA"],
    [,
    ,
    "NA",
    "NA"],
    [,
    ,
    "NA",
    "NA"],
    [,
    ,
    "NA",
    "NA"],
    [,
    ,
    "993[12]\\d{6}",
    "\\d{10}"],
    "IR",
    98,
    "00",
    "0",
    ,
    ,
    "0",
    ,
    ,
    ,
    [[,
    "(21)(\\d{4})(\\d{4})",
    "$1 $2 $3",
    ["21"],
    "0$1",
    ""],
    [,
    "(\\d{3})(\\d{3})(\\d{4})",
    "$1 $2 $3",
    ["[13-89]|2[02-9]"],
    "0$1",
    ""]],
    ,
    [,
    ,
    "943[24678]\\d{6}",
    "\\d{10}"],
    ,
    ,
    [,
    ,
    "NA",
    "NA"],
    [,
    ,
    "9990\\d{6}",
    "\\d{10}"]],
    IS: [,
    [,
    ,
    "[4-9]\\d{6}|38\\d{7}",
    "\\d{7,9}"],
    [,
    ,
    "(?:4(?:1[0-245]|2[0-7]|[37][0-8]|4[0245]|5[0-356]|6\\d|8[0-46-8]|9[013-79])|5(?:05|[156]\\d|2[02578]|3[013-6]|4[03-6]|7[0-2578]|8[0-25-9]|9[013-689])|87[23])\\d{4}",
    "\\d{7}"],
    [,
    ,
    "38[59]\\d{6}|(?:6(?:1[014-8]|2[0-8]|3[0-27-9]|4[0-29]|5[029]|[67][0-69]|[89]\\d)|7(?:5[057]|7[0-7])|8(?:2[0-5]|[469]\\d|5[1-9]))\\d{4}",
    "\\d{7,9}"],
    [,
    ,
    "800\\d{4}",
    "\\d{7}"],
    [,
    ,
    "90\\d{5}",
    "\\d{7}"],
    [,
    ,
    "NA",
    "NA"],
    [,
    ,
    "NA",
    "NA"],
    [,
    ,
    "49[013-79]\\d{4}",
    "\\d{7}"],
    "IS",
    354,
    "00",
    ,
    ,
    ,
    ,
    ,
    ,
    ,
    [[,
    "(\\d{3})(\\d{4})",
    "$1 $2",
    ["[4-9]"],
    "",
    ""],
    [,
    "(3\\d{2})(\\d{3})(\\d{3})",
    "$1 $2 $3",
    ["3"],
    "",
    ""]],
    ,
    [,
    ,
    "NA",
    "NA"],
    ,
    ,
    [,
    ,
    "NA",
    "NA"],
    [,
    ,
    "NA",
    "NA"]],
    IT: [,
    [,
    ,
    "[01389]\\d{5,10}",
    "\\d{6,11}"],
    [,
    ,
    "0(?:[26]\\d{4,9}|[13-57-9](?:[0159]\\d{4,8}|[2-46-8]\\d{5,8}))",
    "\\d{6,11}"],
    [,
    ,
    "3\\d{8,9}",
    "\\d{9,10}"],
    [,
    ,
    "80(?:0\\d{6}|3\\d{3})",
    "\\d{6,9}"],
    [,
    ,
    "89(?:2\\d{3}|9\\d{6})",
    "\\d{6,9}"],
    [,
    ,
    "84[78]\\d{6,7}",
    "\\d{9,10}"],
    [,
    ,
    "178\\d{6,7}",
    "\\d{9,10}"],
    [,
    ,
    "NA",
    "NA"],
    "IT",
    39,
    "00",
    ,
    ,
    ,
    ,
    ,
    ,
    ,
    [[,
    "(0[26])(\\d{3,4})(\\d{4})",
    "$1 $2 $3",
    ["0[26]"],
    "",
    ""],
    [,
    "(0[26])(\\d{4})(\\d{5})",
    "$1 $2 $3",
    ["0[26]"],
    "",
    ""],
    [,
    "(0[26])(\\d{4,6})",
    "$1 $2",
    ["0[26]"],
    "",
    ""],
    [,
    "(0\\d{2})(\\d{3,4})(\\d{4})",
    "$1 $2 $3",
    ["0[13-57-9][0159]"],
    "",
    ""],
    [,
    "(0\\d{2})(\\d{4,6})",
    "$1 $2",
    ["0[13-57-9][0159]"],
    "",
    ""],
    [,
    "(0\\d{3})(\\d{3})(\\d{4})",
    "$1 $2 $3",
    ["0[13-57-9][2-46-8]"],
    "",
    ""],
    [,
    "(0\\d{3})(\\d{4,6})",
    "$1 $2",
    ["0[13-57-9][2-46-8]"],
    "",
    ""],
    [,
    "(\\d{3})(\\d{3})(\\d{3,4})",
    "$1 $2 $3",
    ["[13]|8(?:00|4[78])"],
    "",
    ""],
    [,
    "(\\d{3})(\\d{3,6})",
    "$1 $2",
    ["8(?:03|9)"],
    "",
    ""]],
    ,
    [,
    ,
    "NA",
    "NA"],
    ,
    ,
    [,
    ,
    "NA",
    "NA"],
    [,
    ,
    "NA",
    "NA"],
    1],
    JE: [,
    [,
    ,
    "[135789]\\d{6,9}",
    "\\d{6,10}"],
    [,
    ,
    "1534\\d{6}",
    "\\d{6,10}"],
    [,
    ,
    "7(?:509|7(?:00|97)|829|937)\\d{6}",
    "\\d{10}"],
    [,
    ,
    "80(?:07(?:35|81)|8901)\\d{4}",
    "\\d{10}"],
    [,
    ,
    "(?:871206|90(?:066[59]|1810|71(?:07|55)))\\d{4}",
    "\\d{10}"],
    [,
    ,
    "8(?:4(?:4(?:4(?:05|42|69)|703)|5(?:041|800))|70002)\\d{4}",
    "\\d{10}"],
    [,
    ,
    "701511\\d{4}",
    "\\d{10}"],
    [,
    ,
    "56\\d{8}",
    "\\d{10}"],
    "JE",
    44,
    "00",
    "0",
    " x",
    ,
    "0",
    ,
    ,
    ,
    ,
    ,
    [,
    ,
    "76(?:0[012]|2[356]|4[0134]|5[49]|6[0-369]|77|81|9[39])\\d{6}",
    "\\d{10}"],
    ,
    ,
    [,
    ,
    "NA",
    "NA"],
    [,
    ,
    "3(?:0(?:07(?:35|81)|8901)|3\\d{4}|4(?:4(?:4(?:05|42|69)|703)|5(?:041|800))|7(?:0002|1206))\\d{4}|55\\d{8}",
    "\\d{10}"]],
    JM: [,
    [,
    ,
    "[589]\\d{9}",
    "\\d{7}(?:\\d{3})?"],
    [,
    ,
    "876(?:5(?:0[12]|1[0-468]|2[35]|63)|6(?:0[1-3579]|1[027]|2[3-5]|34|[45]0|63|7[05]|8[04]|9[4-9])7(?:0[2-689]|[1-6]\\d|8[056]|9[45])|9(?:0[1-8]|1[02378]|[2-8]\\d|9[2-468]))\\d{4}",
    "\\d{7}(?:\\d{3})?"],
    [,
    ,
    "876(?:(?:2[178]|[348]\\d|)\\d|5(?:27|66|[78]\\d)|7(?:0[07]|7\\d|8[1-47-9]|9[0-36-9])|9(?:[01]9|9[0579]))\\d{4}",
    "\\d{10}"],
    [,
    ,
    "8(?:00|55|66|77|88)[2-9]\\d{6}",
    "\\d{10}"],
    [,
    ,
    "900[2-9]\\d{6}",
    "\\d{10}"],
    [,
    ,
    "NA",
    "NA"],
    [,
    ,
    "5(?:00|33|44)[2-9]\\d{6}",
    "\\d{10}"],
    [,
    ,
    "NA",
    "NA"],
    "JM",
    1,
    "011",
    "1",
    ,
    ,
    "1",
    ,
    ,
    ,
    ,
    ,
    [,
    ,
    "NA",
    "NA"],
    ,
    "876",
    [,
    ,
    "NA",
    "NA"],
    [,
    ,
    "NA",
    "NA"]],
    JO: [,
    [,
    ,
    "[235-9]\\d{7,8}",
    "\\d{7,9}"],
    [,
    ,
    "[2356][2-8]\\d{6}",
    "\\d{7,8}"],
    [,
    ,
    "7(?:[1-8]\\d|9[02-9])\\d{6}",
    "\\d{9}"],
    [,
    ,
    "80\\d{6}",
    "\\d{8}"],
    [,
    ,
    "900\\d{5}",
    "\\d{8}"],
    [,
    ,
    "85\\d{6}",
    "\\d{8}"],
    [,
    ,
    "70\\d{7}",
    "\\d{9}"],
    [,
    ,
    "NA",
    "NA"],
    "JO",
    962,
    "00",
    "0",
    ,
    ,
    "0",
    ,
    ,
    ,
    [[,
    "(\\d)(\\d{3})(\\d{4})",
    "$1 $2 $3",
    ["[2356]"],
    "(0$1)",
    ""],
    [,
    "(7)(\\d{2})(\\d{2})(\\d{2})(\\d{2})",
    "$1 $2 $3 $4 $5",
    ["7[457-9]"],
    "0$1",
    ""],
    [,
    "(\\d{3})(\\d{5,6})",
    "$1 $2",
    ["70|[89]"],
    "0$1",
    ""]],
    ,
    [,
    ,
    "NA",
    "NA"],
    ,
    ,
    [,
    ,
    "NA",
    "NA"],
    [,
    ,
    "8(?:10|[78]\\d)\\d{5}",
    "\\d{8}"]],
    JP: [,
    [,
    ,
    "\\d{9,10}",
    "\\d{9,10}"],
    [,
    ,
    "(?:1(?:1[236-8]|2[3-6]|3[3-9]|4[2-6]|[58][2-8]|6[2-7]|7[2-9]|9[1-8])|2[2-9]\\d|[36][1-9]\\d|4(?:6[0235-8]|[2-578]\\d|9[2-59])|5(?:6[1-9]|7[2-8]|[2-589]\\d)|7(?:3[4-9]|4[02-9]|[25-9]\\d)|8(?:3[2-9]|4[5-9]|5[1-9]|8[03-9]|[2679]\\d)|9(?:[679][1-9]|[2-58]\\d))\\d{6}",
    "\\d{9}"],
    [,
    ,
    "(?:[79]0\\d|80[1-9])\\d{7}",
    "\\d{10}"],
    [,
    ,
    "120\\d{6}|800\\d{7}",
    "\\d{9,10}"],
    [,
    ,
    "990\\d{6}",
    "\\d{9}"],
    [,
    ,
    "NA",
    "NA"],
    [,
    ,
    "60\\d{7}",
    "\\d{9}"],
    [,
    ,
    "50\\d{8}",
    "\\d{10}"],
    "JP",
    81,
    "010",
    "0",
    ,
    ,
    "0",
    ,
    ,
    ,
    [[,
    "(\\d{3})(\\d{3})(\\d{3})",
    "$1-$2-$3",
    ["(?:12|57|99)0"],
    "0$1",
    ""],
    [,
    "(\\d{3})(\\d{3})(\\d{4})",
    "$1-$2-$3",
    ["800"],
    "0$1",
    ""],
    [,
    "(\\d{2})(\\d{4})(\\d{4})",
    "$1-$2-$3",
    ["[2579]0|80[1-9]"],
    "0$1",
    ""],
    [,
    "(\\d{4})(\\d)(\\d{4})",
    "$1-$2-$3",
    ["1(?:26|3[79]|4[56]|5[4-68]|6[3-5])|5(?:76|97)|499|746|8(?:3[89]|63|47|51)|9(?:49|80|9[16])",
    "1(?:267|3(?:7[247]|9[278])|4(?:5[67]|66)|5(?:47|58|64|8[67])|6(?:3[245]|48|5[4-68]))|5(?:76|97)9|499[2468]|7468|8(?:3(?:8[78]|96)|636|477|51[24])|9(?:496|802|9(?:1[23]|69))",
    "1(?:267|3(?:7[247]|9[278])|4(?:5[67]|66)|5(?:47|58|64|8[67])|6(?:3[245]|48|5[4-68]))|5(?:769|979[2-69])|499[2468]|7468|8(?:3(?:8[78]|96[2457-9])|636[2-57-9]|477|51[24])|9(?:496|802|9(?:1[23]|69))"],
    "0$1",
    ""],
    [,
    "(\\d{3})(\\d{2})(\\d{4})",
    "$1-$2-$3",
    ["1(?:2[3-6]|3[3-9]|4[2-6]|5[2-8]|[68][2-7]|7[2-689]|9[1-578])|2(?:2[034-9]|3[3-58]|4[0-468]|5[04-8]|6[013-8]|7[06-9]|8[02-57-9]|9[13])|4(?:2[28]|3[689]|6[035-7]|7[05689]|80|9[3-5])|5(?:3[1-36-9]|4[4578]|5[013-8]|6[1-9]|7[2-8]|8[14-7]|9[4-9])|7(?:2[15]|3[5-9]|4[02-9]|6[135-8]|7[0-4689]|9[014-9])|8(?:2[49]|3[3-8]|4[5-8]|5[2-9]|6[35-9]|7[579]|8[03-579]|9[2-8])|9(?:[23]0|4[02-46-9]|5[0245-79]|6[4-9]|7[2-47-9]|8[02-7]|9[3-7])",
    "1(?:2[3-6]|3[3-9]|4[2-6]|5(?:[236-8]|[45][2-69])|[68][2-7]|7[2-689]|9[1-578])|2(?:2(?:[04-9]|3[23])|3[3-58]|4[0-468]|5(?:5[78]|7[2-4]|[0468][2-9])|6(?:[0135-8]|4[2-5])|7(?:[0679]|8[2-7])|8(?:[024578]|3[25-9]|9[6-9])|9(?:11|3[2-4]))|4(?:2(?:2[2-9]|8[237-9])|3[689]|6[035-7]|7(?:[059][2-8]|[68])|80|9[3-5])|5(?:3[1-36-9]|4[4578]|5[013-8]|6[1-9]|7[2-8]|8[14-7]|9(?:[89][2-8]|[4-7]))|7(?:2[15]|3[5-9]|4[02-9]|6[135-8]|7[0-4689]|9(?:[017-9]|4[6-8]|5[2-478]|6[2-589]))|8(?:2(?:4[4-8]|9[2-8])|3(?:7[2-56]|[3-6][2-9]|8[2-5])|4[5-8]|5[2-9]|6(?:[37]|5[4-7]|6[2-9]|8[2-8]|9[236-9])|7[579]|8[03-579]|9[2-8])|9(?:[23]0|4[02-46-9]|5[0245-79]|6[4-9]|7[2-47-9]|8[02-7]|9(?:3[34]|[4-7]))",
    "1(?:2[3-6]|3[3-9]|4[2-6]|5(?:[236-8]|[45][2-69])|[68][2-7]|7[2-689]|9[1-578])|2(?:2(?:[04-9]|3[23])|3[3-58]|4[0-468]|5(?:5[78]|7[2-4]|[0468][2-9])|6(?:[0135-8]|4[2-5])|7(?:[0679]|8[2-7])|8(?:[024578]|3[25-9]|9[6-9])|9(?:11|3[2-4]))|4(?:2(?:2[2-9]|8[237-9])|3[689]|6[035-7]|7(?:[059][2-8]|[68])|80|9[3-5])|5(?:3[1-36-9]|4[4578]|5[013-8]|6[1-9]|7[2-8]|8[14-7]|9(?:[89][2-8]|[4-7]))|7(?:2[15]|3[5-9]|4[02-9]|6[135-8]|7[0-4689]|9(?:[017-9]|4[6-8]|5[2-478]|6[2-589]))|8(?:2(?:4[4-8]|9(?:[3578]|20|4[04-9]|6[56]))|3(?:7(?:[2-5]|6[0-59])|[3-6][2-9]|8[2-5])|4[5-8]|5[2-9]|6(?:[37]|5(?:[467]|5[014-9])|6(?:[2-8]|9[02-69])|8[2-8]|9(?:[236-8]|9[23]))|7[579]|8[03-579]|9[2-8])|9(?:[23]0|4[02-46-9]|5[0245-79]|6[4-9]|7[2-47-9]|8[02-7]|9(?:3(?:3[02-9]|4[0-24689])|4[2-69]|[5-7]))",
    "1(?:2[3-6]|3[3-9]|4[2-6]|5(?:[236-8]|[45][2-69])|[68][2-7]|7[2-689]|9[1-578])|2(?:2(?:[04-9]|3[23])|3[3-58]|4[0-468]|5(?:5[78]|7[2-4]|[0468][2-9])|6(?:[0135-8]|4[2-5])|7(?:[0679]|8[2-7])|8(?:[024578]|3[25-9]|9[6-9])|9(?:11|3[2-4]))|4(?:2(?:2[2-9]|8[237-9])|3[689]|6[035-7]|7(?:[059][2-8]|[68])|80|9[3-5])|5(?:3[1-36-9]|4[4578]|5[013-8]|6[1-9]|7[2-8]|8[14-7]|9(?:[89][2-8]|[4-7]))|7(?:2[15]|3[5-9]|4[02-9]|6[135-8]|7[0-4689]|9(?:[017-9]|4[6-8]|5[2-478]|6[2-589]))|8(?:2(?:4[4-8]|9(?:[3578]|20|4[04-9]|6(?:5[25]|60)))|3(?:7(?:[2-5]|6[0-59])|[3-6][2-9]|8[2-5])|4[5-8]|5[2-9]|6(?:[37]|5(?:[467]|5[014-9])|6(?:[2-8]|9[02-69])|8[2-8]|9(?:[236-8]|9[23]))|7[579]|8[03-579]|9[2-8])|9(?:[23]0|4[02-46-9]|5[0245-79]|6[4-9]|7[2-47-9]|8[02-7]|9(?:3(?:3[02-9]|4[0-24689])|4[2-69]|[5-7]))"],
    "0$1",
    ""],
    [,
    "(\\d{2})(\\d{3})(\\d{4})",
    "$1-$2-$3",
    ["1|2(?:23|5[5-89]|64|78|8[39]|91)|4(?:2[2689]|64|7[347])|5(?:[2-589]|39)|60|8(?:[46-9]|3[279]|2[124589])|9(?:[235-8]|93)",
    "1|2(?:23|5(?:[57]|[68]0|9[19])|64|78|8[39]|917)|4(?:2(?:[68]|20|9[178])|64|7[347])|5(?:[2-589]|39[67])|60|8(?:[46-9]|3[279]|2[124589])|9(?:[235-8]|93[34])",
    "1|2(?:23|5(?:[57]|[68]0|9(?:17|99))|64|78|8[39]|917)|4(?:2(?:[68]|20|9[178])|64|7[347])|5(?:[2-589]|39[67])|60|8(?:[46-9]|3[279]|2[124589])|9(?:[235-8]|93(?:31|4))"],
    "0$1",
    ""],
    [,
    "(\\d{3})(\\d{2})(\\d{4})",
    "$1-$2-$3",
    ["2(?:9[14-79]|74|[34]7|[56]9)|82|993"],
    "0$1",
    ""],
    [,
    "(\\d)(\\d{4})(\\d{4})",
    "$1-$2-$3",
    ["3|4(?:2[09]|7[01])|6[1-9]"],
    "0$1",
    ""],
    [,
    "(\\d{2})(\\d{3})(\\d{4})",
    "$1-$2-$3",
    ["[2479][1-9]"],
    "0$1",
    ""]],
    ,
    [,
    ,
    "20\\d{8}",
    "\\d{10}"],
    ,
    ,
    [,
    ,
    "NA",
    "NA"],
    [,
    ,
    "570\\d{6}",
    "\\d{9}"]],
    KE: [,
    [,
    ,
    "\\d{6,10}",
    "\\d{4,10}"],
    [,
    ,
    "(?:20|4[0-6]|5\\d|6[0-24-9])\\d{4,7}",
    "\\d{4,9}"],
    [,
    ,
    "7(?:0[0-3]|[123]\\d|5[0-3]|7[0-4])\\d{6}",
    "\\d{9}"],
    [,
    ,
    "8(?:00|88)\\d{6,7}",
    "\\d{9,10}"],
    [,
    ,
    "9(?:00|1)\\d{6,7}",
    "\\d{8,10}"],
    [,
    ,
    "NA",
    "NA"],
    [,
    ,
    "NA",
    "NA"],
    [,
    ,
    "NA",
    "NA"],
    "KE",
    254,
    "000",
    "0",
    ,
    ,
    "0",
    ,
    ,
    ,
    [[,
    "(\\d{2})(\\d{4,7})",
    "$1 $2",
    ["[2-6]|91"],
    "0$1",
    ""],
    [,
    "(\\d{3})(\\d{6,7})",
    "$1 $2",
    ["[78]|90"],
    "0$1",
    ""]],
    ,
    [,
    ,
    "NA",
    "NA"],
    ,
    ,
    [,
    ,
    "NA",
    "NA"],
    [,
    ,
    "NA",
    "NA"]],
    KG: [,
    [,
    ,
    "[356-8]\\d{8}",
    "\\d{5,9}"],
    [,
    ,
    "(?:3(?:1(?:2\\d|3[1-9]|52|6[1-8])|2(?:22|3[0-479]|6[0-7])|4(?:22|5[6-9]|6[0-4])|5(?:22|3[4-7]|59|6[0-5])|6(?:22|5[35-7]|6[0-3])|7(?:22|3[468]|4[1-8]|59|6\\d|7[5-7])|9(?:22|4[1-7]|6[0-8]))|6(?:09|12|2[2-4])\\d)\\d{5}",
    "\\d{5,9}"],
    [,
    ,
    "5[124-7]\\d{7}|7(?:0[05]|7\\d)\\d{6}",
    "\\d{9}"],
    [,
    ,
    "800\\d{6}",
    "\\d{9}"],
    [,
    ,
    "NA",
    "NA"],
    [,
    ,
    "NA",
    "NA"],
    [,
    ,
    "NA",
    "NA"],
    [,
    ,
    "NA",
    "NA"],
    "KG",
    996,
    "00",
    "0",
    ,
    ,
    "0",
    ,
    ,
    ,
    [[,
    "(\\d{3})(\\d{3})(\\d{3})",
    "$1 $2 $3",
    ["31[25]|[5-8]"],
    "0$1",
    ""],
    [,
    "(\\d{4})(\\d{5})",
    "$1 $2",
    ["3(?:1[36]|[2-9])"],
    "0$1",
    ""]],
    ,
    [,
    ,
    "NA",
    "NA"],
    ,
    ,
    [,
    ,
    "NA",
    "NA"],
    [,
    ,
    "NA",
    "NA"]],
    KH: [,
    [,
    ,
    "[1-9]\\d{7,9}",
    "\\d{6,10}"],
    [,
    ,
    "(?:2[3-6]|3[2-6]|4[2-4]|[5-7][2-5])[2-47-9]\\d{5}",
    "\\d{6,8}"],
    [,
    ,
    "(?:(?:1[0-35-9]|9[1-49])[1-9]|8(?:0[89]|5[2-689]))\\d{5}",
    "\\d{8}"],
    [,
    ,
    "1800(?:1\\d|2[09])\\d{4}",
    "\\d{10}"],
    [,
    ,
    "1900(?:1\\d|2[09])\\d{4}",
    "\\d{10}"],
    [,
    ,
    "NA",
    "NA"],
    [,
    ,
    "NA",
    "NA"],
    [,
    ,
    "NA",
    "NA"],
    "KH",
    855,
    "00[178]",
    "0",
    ,
    ,
    "0",
    ,
    ,
    ,
    [[,
    "(\\d{2})(\\d{3})(\\d{3})",
    "$1 $2 $3",
    ["1\\d[1-9]|[2-9]"],
    "0$1",
    ""],
    [,
    "(1[89]00)(\\d{3})(\\d{3})",
    "$1 $2 $3",
    ["1[89]0"],
    "",
    ""]],
    ,
    [,
    ,
    "NA",
    "NA"],
    ,
    ,
    [,
    ,
    "NA",
    "NA"],
    [,
    ,
    "NA",
    "NA"]],
    KI: [,
    [,
    ,
    "[2-689]\\d{4}",
    "\\d{5}"],
    [,
    ,
    "(?:[234]\\d|50|8[1-5])\\d{3}",
    "\\d{5}"],
    [,
    ,
    "[69]\\d{4}",
    "\\d{5}"],
    [,
    ,
    "NA",
    "NA"],
    [,
    ,
    "NA",
    "NA"],
    [,
    ,
    "NA",
    "NA"],
    [,
    ,
    "NA",
    "NA"],
    [,
    ,
    "NA",
    "NA"],
    "KI",
    686,
    "00",
    "0",
    ,
    ,
    "0",
    ,
    ,
    ,
    [[,
    "(\\d{5})",
    "$1",
    ,
    "0$1",
    ""]],
    ,
    [,
    ,
    "NA",
    "NA"],
    ,
    ,
    [,
    ,
    "NA",
    "NA"],
    [,
    ,
    "NA",
    "NA"]],
    KM: [,
    [,
    ,
    "[379]\\d{6}",
    "\\d{7}"],
    [,
    ,
    "7(?:6[0-37-9]|7[0-57-9])\\d{4}",
    "\\d{7}"],
    [,
    ,
    "3[23]\\d{5}",
    "\\d{7}"],
    [,
    ,
    "NA",
    "NA"],
    [,
    ,
    "(?:39[01]|9[01]0)\\d{4}",
    "\\d{7}"],
    [,
    ,
    "NA",
    "NA"],
    [,
    ,
    "NA",
    "NA"],
    [,
    ,
    "NA",
    "NA"],
    "KM",
    269,
    "00",
    ,
    ,
    ,
    ,
    ,
    ,
    ,
    [[,
    "(\\d)(\\d{3})(\\d{3})",
    "$1 $2 $3",
    ,
    "",
    ""]],
    ,
    [,
    ,
    "NA",
    "NA"],
    ,
    ,
    [,
    ,
    "NA",
    "NA"],
    [,
    ,
    "NA",
    "NA"]],
    KN: [,
    [,
    ,
    "[589]\\d{9}",
    "\\d{7}(?:\\d{3})?"],
    [,
    ,
    "869(?:2(?:29|36)|302|4(?:6[5-9]|70))\\d{4}",
    "\\d{7}(?:\\d{3})?"],
    [,
    ,
    "869(?:5(?:5[6-8]|6[5-7])|66\\d|76[02-6])\\d{4}",
    "\\d{10}"],
    [,
    ,
    "8(?:00|55|66|77|88)[2-9]\\d{6}",
    "\\d{10}"],
    [,
    ,
    "900[2-9]\\d{6}",
    "\\d{10}"],
    [,
    ,
    "NA",
    "NA"],
    [,
    ,
    "5(?:00|33|44)[2-9]\\d{6}",
    "\\d{10}"],
    [,
    ,
    "NA",
    "NA"],
    "KN",
    1,
    "011",
    "1",
    ,
    ,
    "1",
    ,
    ,
    ,
    ,
    ,
    [,
    ,
    "NA",
    "NA"],
    ,
    "869",
    [,
    ,
    "NA",
    "NA"],
    [,
    ,
    "NA",
    "NA"]],
    KP: [,
    [,
    ,
    "1\\d{9}|[28]\\d{7}",
    "\\d{6,8}|\\d{10}"],
    [,
    ,
    "2\\d{7}|85\\d{6}",
    "\\d{6,8}"],
    [,
    ,
    "19[123]\\d{7}",
    "\\d{10}"],
    [,
    ,
    "NA",
    "NA"],
    [,
    ,
    "NA",
    "NA"],
    [,
    ,
    "NA",
    "NA"],
    [,
    ,
    "NA",
    "NA"],
    [,
    ,
    "NA",
    "NA"],
    "KP",
    850,
    "00|99",
    "0",
    ,
    ,
    "0",
    ,
    ,
    ,
    [[,
    "(\\d{3})(\\d{3})(\\d{4})",
    "$1 $2 $3",
    ["1"],
    "0$1",
    ""],
    [,
    "(\\d)(\\d{3})(\\d{4})",
    "$1 $2 $3",
    ["2"],
    "0$1",
    ""],
    [,
    "(\\d{2})(\\d{3})(\\d{3})",
    "$1 $2 $3",
    ["8"],
    "0$1",
    ""]],
    ,
    [,
    ,
    "NA",
    "NA"],
    ,
    ,
    [,
    ,
    "2(?:[0-24-9]\\d{2}|3(?:[0-79]\\d|8[02-9]))\\d{4}",
    "\\d{8}"],
    [,
    ,
    "NA",
    "NA"]],
    KR: [,
    [,
    ,
    "[1-79]\\d{3,9}|8\\d{8}",
    "\\d{4,10}"],
    [,
    ,
    "(?:2|[34][1-3]|5[1-5]|6[1-4])(?:1\\d{2,3}|[2-9]\\d{6,7})",
    "\\d{4,10}"],
    [,
    ,
    "1[0-25-9]\\d{7,8}",
    "\\d{9,10}"],
    [,
    ,
    "80\\d{7}",
    "\\d{9}"],
    [,
    ,
    "60[2-9]\\d{6}",
    "\\d{9}"],
    [,
    ,
    "NA",
    "NA"],
    [,
    ,
    "50\\d{8}",
    "\\d{10}"],
    [,
    ,
    "70\\d{8}",
    "\\d{10}"],
    "KR",
    82,
    "00(?:[124-68]|[37]\\d{2})",
    "0",
    ,
    ,
    "0(8[1-46-8]|85\\d{2})?",
    ,
    ,
    ,
    [[,
    "(\\d{2})(\\d{4})(\\d{4})",
    "$1-$2-$3",
    ["1(?:0|1[19]|[69]9|5[458])|[57]0",
    "1(?:0|1[19]|[69]9|5(?:44|59|8))|[57]0"],
    "0$1",
    "0$CC-$1"],
    [,
    "(\\d{2})(\\d{3})(\\d{4})",
    "$1-$2-$3",
    ["1(?:[169][2-8]|[78]|5[1-4])|[68]0|[3-9][1-9][2-9]",
    "1(?:[169][2-8]|[78]|5(?:[1-3]|4[56]))|[68]0|[3-9][1-9][2-9]"],
    "0$1",
    "0$CC-$1"],
    [,
    "(\\d{3})(\\d)(\\d{4})",
    "$1-$2-$3",
    ["131",
    "1312"],
    "0$1",
    "0$CC-$1"],
    [,
    "(\\d{3})(\\d{2})(\\d{4})",
    "$1-$2-$3",
    ["131",
    "131[13-9]"],
    "0$1",
    "0$CC-$1"],
    [,
    "(\\d{3})(\\d{3})(\\d{4})",
    "$1-$2-$3",
    ["13[2-9]"],
    "0$1",
    "0$CC-$1"],
    [,
    "(\\d{2})(\\d{2})(\\d{3})(\\d{4})",
    "$1-$2-$3-$4",
    ["30"],
    "0$1",
    "0$CC-$1"],
    [,
    "(\\d)(\\d{4})(\\d{4})",
    "$1-$2-$3",
    ["2(?:[26]|3[0-467])",
    "2(?:[26]|3(?:01|1[45]|2[17-9]|39|4|6[67]|7[078]))"],
    "0$1",
    "0$CC-$1"],
    [,
    "(\\d)(\\d{3})(\\d{4})",
    "$1-$2-$3",
    ["2(?:3[0-35-9]|[457-9])",
    "2(?:3(?:0[02-9]|1[0-36-9]|2[02-6]|3[0-8]|6[0-589]|7[1-69]|[589])|[457-9])"],
    "0$1",
    "0$CC-$1"],
    [,
    "(\\d)(\\d{3,4})",
    "$1-$2",
    ["21[0-46-9]"],
    "0$1",
    "0$CC-$1"],
    [,
    "(\\d{2})(\\d{3,4})",
    "$1-$2",
    ["[3-9][1-9]1",
    "[3-9][1-9]1(?:[0-46-9])"],
    "0$1",
    "0$CC-$1"],
    [,
    "(\\d{4})(\\d{4})",
    "$1-$2",
    ["1(?:5[46-9]|6[04678])",
    "1(?:5(?:44|66|77|88|99)|6(?:00|44|6[16]|70|88))"],
    "$1",
    "0$CC-$1"]],
    ,
    [,
    ,
    "NA",
    "NA"],
    ,
    ,
    [,
    ,
    "NA",
    "NA"],
    [,
    ,
    "1(?:5(?:44|66|77|88|99)|6(?:00|44|6[16]|70|88))\\d{4}",
    "\\d{8}"]],
    KW: [,
    [,
    ,
    "[12569]\\d{6,7}",
    "\\d{7,8}"],
    [,
    ,
    "(?:18\\d|2(?:[23]\\d{2}|4[1-35-9]\\d|5(?:0[034]|[2-46]\\d|5[1-3]|7[1-7])))\\d{4}",
    "\\d{7,8}"],
    [,
    ,
    "(?:5(?:0[0-2]|5\\d)|6(?:0[034679]|5[015-9]|6\\d|7[067]|99)|9(?:0[09]|4[049]|66|[79]\\d))\\d{5}",
    "\\d{8}"],
    [,
    ,
    "NA",
    "NA"],
    [,
    ,
    "NA",
    "NA"],
    [,
    ,
    "NA",
    "NA"],
    [,
    ,
    "NA",
    "NA"],
    [,
    ,
    "NA",
    "NA"],
    "KW",
    965,
    "00",
    ,
    ,
    ,
    ,
    ,
    ,
    ,
    [[,
    "(\\d{4})(\\d{3,4})",
    "$1 $2",
    ["[1269]"],
    "",
    ""],
    [,
    "(5[05]\\d)(\\d{5})",
    "$1 $2",
    ["5"],
    "",
    ""]],
    ,
    [,
    ,
    "NA",
    "NA"],
    ,
    ,
    [,
    ,
    "NA",
    "NA"],
    [,
    ,
    "NA",
    "NA"]],
    KY: [,
    [,
    ,
    "[3589]\\d{9}",
    "\\d{7}(?:\\d{3})?"],
    [,
    ,
    "345(?:2(?:22|44)|444|6(?:23|38|40)|7(?:6[6-9]|77)|8(?:00|1[45]|25|4[89]|88)|9(?:14|4[035-9]))\\d{4}",
    "\\d{7}(?:\\d{3})?"],
    [,
    ,
    "345(?:32[3-79]|5(?:1[467]|2[5-7]|4[5-9])|9(?:1[679]|2[4-9]|3[89]))\\d{4}",
    "\\d{10}"],
    [,
    ,
    "8(?:00|55|66|77|88)[2-9]\\d{6}",
    "\\d{10}"],
    [,
    ,
    "900[2-9]\\d{6}|345976\\d{4}",
    "\\d{10}"],
    [,
    ,
    "NA",
    "NA"],
    [,
    ,
    "5(?:00|33|44)[2-9]\\d{6}",
    "\\d{10}"],
    [,
    ,
    "NA",
    "NA"],
    "KY",
    1,
    "011",
    "1",
    ,
    ,
    "1",
    ,
    ,
    ,
    ,
    ,
    [,
    ,
    "NA",
    "NA"],
    ,
    "345",
    [,
    ,
    "NA",
    "NA"],
    [,
    ,
    "NA",
    "NA"]],
    KZ: [,
    [,
    ,
    "(?:7\\d{2}|80[09])\\d{7}",
    "\\d{10}"],
    [,
    ,
    "7(?:1(?:0(?:[23]\\d|4[023]|59|63)|1(?:[23]\\d|4[0-79]|59)|2(?:[23]\\d|59)|3(?:2\\d|3[1-79]|4[0-35-9]|59)|4(?:2\\d|3[013-79]|4[0-8]|5[1-79])|5(?:2\\d|3[1-8]|4[1-7]|59)|6(?:2\\d|[34]\\d|5[19]|61)|72\\d|8(?:[27]\\d|3[1-46-9]|4[0-5]|))|2(?:1(?:[23]\\d|4[46-9]|5[3469])|2(?:2\\d|3[0679]|46|5[12679]|)|3(?:[234]\\d|5[139]|)|4(?:2\\d|3[1235-9]|59)|5(?:[23]\\d|4[01246-8]|59|61)|6(?:2\\d|3[1-9]|4[0-4]|59)|7(?:[23]\\d|40|5[279]|7\\d)|8(?:[23]\\d|4[0-3]|59)|9(?:2\\d|3[124578]|59))|3622)\\d{5}",
    "\\d{10}"],
    [,
    ,
    "7(?:0[01257]\\d{2}|6[02-4]\\d{2}|7[157]\\d{2})\\d{5}",
    "\\d{10}"],
    [,
    ,
    "800\\d{7}",
    "\\d{10}"],
    [,
    ,
    "809\\d{7}",
    "\\d{10}"],
    [,
    ,
    "NA",
    "NA"],
    [,
    ,
    "NA",
    "NA"],
    [,
    ,
    "751\\d{7}",
    "\\d{10}"],
    "KZ",
    7,
    "8~10",
    "8",
    ,
    ,
    "8",
    ,
    ,
    ,
    ,
    ,
    [,
    ,
    "NA",
    "NA"],
    ,
    ,
    [,
    ,
    "751\\d{7}",
    "\\d{10}"],
    [,
    ,
    "NA",
    "NA"]],
    LA: [,
    [,
    ,
    "[2-57]\\d{7,9}",
    "\\d{6,10}"],
    [,
    ,
    "(?:[2-57]1|54)\\d{6}",
    "\\d{6,8}"],
    [,
    ,
    "20(?:2[23]|5[4-6]|77|9[89])\\d{6}",
    "\\d{10}"],
    [,
    ,
    "NA",
    "NA"],
    [,
    ,
    "NA",
    "NA"],
    [,
    ,
    "NA",
    "NA"],
    [,
    ,
    "NA",
    "NA"],
    [,
    ,
    "NA",
    "NA"],
    "LA",
    856,
    "00",
    "0",
    ,
    ,
    "0",
    ,
    ,
    ,
    [[,
    "(20)(\\d{2})(\\d{3})(\\d{3})",
    "$1 $2 $3 $4",
    ["20"],
    "0$1",
    ""],
    [,
    "([2-57]\\d)(\\d{3})(\\d{3})",
    "$1 $2 $3",
    ["21|[3-57]"],
    "0$1",
    ""]],
    ,
    [,
    ,
    "NA",
    "NA"],
    ,
    ,
    [,
    ,
    "NA",
    "NA"],
    [,
    ,
    "NA",
    "NA"]],
    LB: [,
    [,
    ,
    "[13-9]\\d{6,7}",
    "\\d{7,8}"],
    [,
    ,
    "(?:[14-6]\\d{2}|7(?:[2-57-9]\\d|62)|[89][2-9]\\d)\\d{4}",
    "\\d{7}"],
    [,
    ,
    "(?:3\\d|7(?:[01]\\d|6[67]))\\d{5}",
    "\\d{7,8}"],
    [,
    ,
    "NA",
    "NA"],
    [,
    ,
    "9[01]\\d{6}",
    "\\d{8}"],
    [,
    ,
    "8[01]\\d{6}",
    "\\d{8}"],
    [,
    ,
    "NA",
    "NA"],
    [,
    ,
    "NA",
    "NA"],
    "LB",
    961,
    "00",
    "0",
    ,
    ,
    "0",
    ,
    ,
    ,
    [[,
    "(\\d)(\\d{3})(\\d{3})",
    "$1 $2 $3",
    ["[13-6]|7(?:[2-57-9]|62)|[89][2-9]"],
    "0$1",
    ""],
    [,
    "([7-9]\\d)(\\d{3})(\\d{3})",
    "$1 $2 $3",
    ["[89][01]|7(?:[01]|6[67])"],
    "0$1",
    ""]],
    ,
    [,
    ,
    "NA",
    "NA"],
    ,
    ,
    [,
    ,
    "NA",
    "NA"],
    [,
    ,
    "NA",
    "NA"]],
    LC: [,
    [,
    ,
    "[5789]\\d{9}",
    "\\d{7}(?:\\d{3})?"],
    [,
    ,
    "758(?:234|4(?:5[0-9]|6[2-9]|8[0-2])|638|758)\\d{4}",
    "\\d{7}(?:\\d{3})?"],
    [,
    ,
    "758(?:28[4-7]|384|4(?:6[01]|8[4-9])|5(?:1[89]|20|84)|7(?:1[2-9]|2[0-4]))\\d{4}",
    "\\d{10}"],
    [,
    ,
    "8(?:00|55|66|77|88)[2-9]\\d{6}",
    "\\d{10}"],
    [,
    ,
    "900[2-9]\\d{6}",
    "\\d{10}"],
    [,
    ,
    "NA",
    "NA"],
    [,
    ,
    "5(?:00|33|44)[2-9]\\d{6}",
    "\\d{10}"],
    [,
    ,
    "NA",
    "NA"],
    "LC",
    1,
    "011",
    "1",
    ,
    ,
    "1",
    ,
    ,
    ,
    ,
    ,
    [,
    ,
    "NA",
    "NA"],
    ,
    "758",
    [,
    ,
    "NA",
    "NA"],
    [,
    ,
    "NA",
    "NA"]],
    LI: [,
    [,
    ,
    "(?:66|80|90)\\d{7}|[237-9]\\d{6}",
    "\\d{7,9}"],
    [,
    ,
    "(?:2(?:17|3\\d|6[02-58]|96)|3(?:02|7[01357]|8[048]|9[0269])|870)\\d{4}",
    "\\d{7}"],
    [,
    ,
    "66(?:[0178][0-4]|2[025-9]|[36]\\d|4[129]|5[45]|9[019])\\d{5}|7(?:4[2-59]|56|[6-9]\\d)\\d{4}",
    "\\d{7,9}"],
    [,
    ,
    "80(?:0(?:07|2[238]|79|\\d{4})|9\\d{2})\\d{2}",
    "\\d{7,9}"],
    [,
    ,
    "NA",
    "NA"],
    [,
    ,
    "90(?:0(?:2[278]|79|\\d{4})|1(?:23|\\d{4})|6(?:66|\\d{4}))\\d{2}",
    "\\d{7,9}"],
    [,
    ,
    "701\\d{4}",
    "\\d{7}"],
    [,
    ,
    "NA",
    "NA"],
    "LI",
    423,
    "00",
    ,
    ,
    ,
    ,
    ,
    ,
    ,
    [[,
    "(\\d{3})(\\d{2})(\\d{2})",
    "$1 $2 $3",
    ["[23]|7[4-9]|87"],
    "",
    ""],
    [,
    "(6\\d)(\\d{3})(\\d{3})",
    "$1 $2 $3",
    ["6"],
    "",
    ""],
    [,
    "([7-9]0\\d)(\\d{2})(\\d{2})",
    "$1 $2 $3",
    ["[7-9]0"],
    "",
    ""],
    [,
    "([89]0\\d)(\\d{2})(\\d{2})(\\d{2})",
    "0$1 $2 $3 $4",
    ["[89]0"],
    "",
    ""]],
    ,
    [,
    ,
    "NA",
    "NA"],
    ,
    ,
    [,
    ,
    "NA",
    "NA"],
    [,
    ,
    "NA",
    "NA"]],
    LK: [,
    [,
    ,
    "[1-9]\\d{8}",
    "\\d{7,9}"],
    [,
    ,
    "(?:[189]1|2[13-7]|3[1-8]|4[157]|5[12457]|6[35-7])[2-57]\\d{6}",
    "\\d{7,9}"],
    [,
    ,
    "7[12578]\\d{7}",
    "\\d{9}"],
    [,
    ,
    "NA",
    "NA"],
    [,
    ,
    "NA",
    "NA"],
    [,
    ,
    "NA",
    "NA"],
    [,
    ,
    "NA",
    "NA"],
    [,
    ,
    "NA",
    "NA"],
    "LK",
    94,
    "00",
    "0",
    ,
    ,
    "0",
    ,
    ,
    ,
    [[,
    "(\\d{2})(\\d{1})(\\d{6})",
    "$1 $2 $3",
    ["[1-689]"],
    "0$1",
    ""],
    [,
    "(\\d{2})(\\d{3})(\\d{4})",
    "$1 $2 $3",
    ["7"],
    "0$1",
    ""]],
    ,
    [,
    ,
    "NA",
    "NA"],
    ,
    ,
    [,
    ,
    "NA",
    "NA"],
    [,
    ,
    "NA",
    "NA"]],
    LR: [,
    [,
    ,
    "(?:[279]\\d|[4-6]|[38]\\d{2})\\d{6}",
    "\\d{7,9}"],
    [,
    ,
    "2\\d{7}",
    "\\d{8}"],
    [,
    ,
    "(?:4[67]|5\\d|6[4-8]|7\\d{2}|880\\d)\\d{5}",
    "\\d{7,9}"],
    [,
    ,
    "NA",
    "NA"],
    [,
    ,
    "90\\d{6}",
    "\\d{8}"],
    [,
    ,
    "NA",
    "NA"],
    [,
    ,
    "NA",
    "NA"],
    [,
    ,
    "33200\\d{4}",
    "\\d{9}"],
    "LR",
    231,
    "00",
    "0",
    ,
    ,
    "0",
    ,
    ,
    ,
    [[,
    "([279]\\d)(\\d{3})(\\d{3})",
    "$1 $2 $3",
    ["[279]"],
    "0$1",
    ""],
    [,
    "([4-6])(\\d{3})(\\d{3})",
    "$1 $2 $3",
    ["[4-6]"],
    "0$1",
    ""],
    [,
    "(\\d{2})(\\d{3})(\\d{4})",
    "$1 $2 $3",
    ["[38]"],
    "0$1",
    ""]],
    ,
    [,
    ,
    "NA",
    "NA"],
    ,
    ,
    [,
    ,
    "NA",
    "NA"],
    [,
    ,
    "NA",
    "NA"]],
    LS: [,
    [,
    ,
    "[2568]\\d{7}",
    "\\d{8}"],
    [,
    ,
    "2\\d{7}",
    "\\d{8}"],
    [,
    ,
    "[56]\\d{7}",
    "\\d{8}"],
    [,
    ,
    "800[256]\\d{4}",
    "\\d{8}"],
    [,
    ,
    "NA",
    "NA"],
    [,
    ,
    "NA",
    "NA"],
    [,
    ,
    "NA",
    "NA"],
    [,
    ,
    "NA",
    "NA"],
    "LS",
    266,
    "00",
    ,
    ,
    ,
    ,
    ,
    ,
    ,
    [[,
    "(\\d{4})(\\d{4})",
    "$1 $2",
    ,
    "",
    ""]],
    ,
    [,
    ,
    "NA",
    "NA"],
    ,
    ,
    [,
    ,
    "NA",
    "NA"],
    [,
    ,
    "NA",
    "NA"]],
    LT: [,
    [,
    ,
    "[3-9]\\d{7}",
    "\\d{8}"],
    [,
    ,
    "(?:3[1478]|4[124-6]|52)\\d{6}",
    "\\d{8}"],
    [,
    ,
    "6\\d{7}",
    "\\d{8}"],
    [,
    ,
    "800\\d{5}",
    "\\d{8}"],
    [,
    ,
    "90[0239]\\d{5}",
    "\\d{8}"],
    [,
    ,
    "NA",
    "NA"],
    [,
    ,
    "NA",
    "NA"],
    [,
    ,
    "NA",
    "NA"],
    "LT",
    370,
    "00",
    "8",
    ,
    ,
    "8",
    ,
    ,
    ,
    [[,
    "([34]\\d)(\\d{2})(\\d{2})(\\d{2})",
    "$1 $2 $3 $4",
    ["37|4(?:1|5[45]|6[2-4])"],
    "8 $1",
    ""],
    [,
    "([3-689]\\d{2})(\\d{2})(\\d{3})",
    "$1 $2 $3",
    ["3[148]|4(?:[24]|6[09])|5(?:[0189]|28)|[689]"],
    "8 $1",
    ""],
    [,
    "(5)(2[0-79]\\d)(\\d{4})",
    "$1 $2 $3",
    ["52[0-79]"],
    "8 $1",
    ""]],
    ,
    [,
    ,
    "NA",
    "NA"],
    ,
    ,
    [,
    ,
    "NA",
    "NA"],
    [,
    ,
    "NA",
    "NA"]],
    LU: [,
    [,
    ,
    "[24-9]\\d{3,10}|3(?:[0-46-9]\\d{2,9}|5[013-9]\\d{1,8})",
    "\\d{4,11}"],
    [,
    ,
    "(?:2(?:2\\d{1,2}|3[2-9]|[67]\\d|4[1-8]\\d?|5[1-5]\\d?|9[0-24-9]\\d?)|3(?:[059][05-9]|[13]\\d|[26][015-9]|4[0-26-9]|7[0-389]|8[08])\\d?|4\\d{2,3}|5(?:[01458]\\d|[27][0-69]|3[0-3]|[69][0-7])\\d?|7(?:1[019]|2[05-9]|3[05]|[45][07-9]|[679][089]|8[06-9])\\d?|8(?:0[2-9]|1[0-36-9]|3[3-9]|[469]9|[58][7-9]|7[89])\\d?|9(?:0[89]|2[0-49]|37|49|5[0-27-9]|7[7-9]|9[0-478])\\d?)\\d{1,7}",
    "\\d{4,11}"],
    [,
    ,
    "6[269][18]\\d{6}",
    "\\d{9}"],
    [,
    ,
    "800\\d{5}",
    "\\d{8}"],
    [,
    ,
    "90[01]\\d{5}",
    "\\d{8}"],
    [,
    ,
    "801\\d{5}",
    "\\d{8}"],
    [,
    ,
    "70\\d{6}",
    "\\d{8}"],
    [,
    ,
    "20\\d{2,8}",
    "\\d{4,10}"],
    "LU",
    352,
    "00",
    ,
    ,
    ,
    "(15(?:0[06]|1[12]|35|4[04]|55|6[26]|77|88|99)\\d)",
    ,
    ,
    ,
    [[,
    "(\\d{2})(\\d{3})",
    "$1 $2",
    ["[23-5]|7[1-9]|[89](?:[1-9]|0[2-9])"],
    "",
    "$CC $1"],
    [,
    "(\\d{2})(\\d{2})(\\d{2})",
    "$1 $2 $3",
    ["[23-5]|7[1-9]|[89](?:[1-9]|0[2-9])"],
    "",
    "$CC $1"],
    [,
    "(\\d{2})(\\d{2})(\\d{3})",
    "$1 $2 $3",
    ["20"],
    "",
    "$CC $1"],
    [,
    "(\\d{2})(\\d{2})(\\d{2})(\\d{1,2})",
    "$1 $2 $3 $4",
    ["2(?:[0367]|4[3-8])"],
    "",
    "$CC $1"],
    [,
    "(\\d{2})(\\d{2})(\\d{2})(\\d{3})",
    "$1 $2 $3 $4",
    ["20"],
    "",
    "$CC $1"],
    [,
    "(\\d{2})(\\d{2})(\\d{2})(\\d{2})(\\d{1,2})",
    "$1 $2 $3 $4 $5",
    ["2(?:[0367]|4[3-8])"],
    "",
    "$CC $1"],
    [,
    "(\\d{2})(\\d{2})(\\d{2})(\\d{1,4})",
    "$1 $2 $3 $4",
    ["2(?:[12589]|4[12])|[3-5]|7[1-9]|[89](?:[1-9]|0[2-9])"],
    "",
    "$CC $1"],
    [,
    "(\\d{3})(\\d{2})(\\d{3})",
    "$1 $2 $3",
    ["[89]0[01]|70"],
    "",
    "$CC $1"],
    [,
    "(\\d{3})(\\d{3})(\\d{3})",
    "$1 $2 $3",
    ["6"],
    "",
    "$CC $1"]],
    ,
    [,
    ,
    "NA",
    "NA"],
    ,
    ,
    [,
    ,
    "NA",
    "NA"],
    [,
    ,
    "NA",
    "NA"]],
    LV: [,
    [,
    ,
    "[2689]\\d{7}",
    "\\d{8}"],
    [,
    ,
    "6\\d{7}",
    "\\d{8}"],
    [,
    ,
    "2\\d{7}",
    "\\d{8}"],
    [,
    ,
    "80\\d{6}",
    "\\d{8}"],
    [,
    ,
    "90\\d{6}",
    "\\d{8}"],
    [,
    ,
    "NA",
    "NA"],
    [,
    ,
    "NA",
    "NA"],
    [,
    ,
    "NA",
    "NA"],
    "LV",
    371,
    "00",
    ,
    ,
    ,
    ,
    ,
    ,
    ,
    [[,
    "([2689]\\d)(\\d{3})(\\d{3})",
    "$1 $2 $3",
    ,
    "",
    ""]],
    ,
    [,
    ,
    "NA",
    "NA"],
    ,
    ,
    [,
    ,
    "NA",
    "NA"],
    [,
    ,
    "NA",
    "NA"]],
    LY: [,
    [,
    ,
    "[25679]\\d{8}",
    "\\d{7,9}"],
    [,
    ,
    "(?:2[1345]|5[1347]|6[123479]|71)\\d{7}",
    "\\d{7,9}"],
    [,
    ,
    "9[1-6]\\d{7}",
    "\\d{9}"],
    [,
    ,
    "NA",
    "NA"],
    [,
    ,
    "NA",
    "NA"],
    [,
    ,
    "NA",
    "NA"],
    [,
    ,
    "NA",
    "NA"],
    [,
    ,
    "NA",
    "NA"],
    "LY",
    218,
    "00",
    "0",
    ,
    ,
    "0",
    ,
    ,
    ,
    [[,
    "([25679]\\d)(\\d{7})",
    "$1-$2",
    ,
    "0$1",
    ""]],
    ,
    [,
    ,
    "NA",
    "NA"],
    ,
    ,
    [,
    ,
    "NA",
    "NA"],
    [,
    ,
    "NA",
    "NA"]],
    MA: [,
    [,
    ,
    "[5689]\\d{8}",
    "\\d{9}"],
    [,
    ,
    "5(?:2(?:(?:[015-7]\\d|2[2-9]|3[2-57]|4[2-8]|8[235-9]|)\\d|9(?:0\\d|[89]0))|3(?:(?:[0-4]\\d|[57][2-9]|6[235-8]|9[3-9])\\d|8(?:0\\d|[89]0)))\\d{4}",
    "\\d{9}"],
    [,
    ,
    "6(?:0[06]|[14-7]\\d|2[236]|33|99)\\d{6}",
    "\\d{9}"],
    [,
    ,
    "80\\d{7}",
    "\\d{9}"],
    [,
    ,
    "89\\d{7}",
    "\\d{9}"],
    [,
    ,
    "NA",
    "NA"],
    [,
    ,
    "NA",
    "NA"],
    [,
    ,
    "NA",
    "NA"],
    "MA",
    212,
    "00",
    "0",
    ,
    ,
    "0",
    ,
    ,
    ,
    [[,
    "([56]\\d{2})(\\d{6})",
    "$1-$2",
    ["5(?:2[015-7]|3[0-4])|6"],
    "0$1",
    ""],
    [,
    "([58]\\d{3})(\\d{5})",
    "$1-$2",
    ["5(?:2[2-489]|3[5-9])|892",
    "5(?:2(?:[2-48]|90)|3(?:[5-79]|80))|892"],
    "0$1",
    ""],
    [,
    "(5\\d{4})(\\d{4})",
    "$1-$2",
    ["5(?:29|38)",
    "5(?:29|38)[89]"],
    "0$1",
    ""],
    [,
    "(8[09])(\\d{7})",
    "$1-$2",
    ["8(?:0|9[013-9])"],
    "0$1",
    ""]],
    ,
    [,
    ,
    "NA",
    "NA"],
    ,
    ,
    [,
    ,
    "NA",
    "NA"],
    [,
    ,
    "NA",
    "NA"]],
    MC: [,
    [,
    ,
    "[4689]\\d{7,8}",
    "\\d{8,9}"],
    [,
    ,
    "9[2-47-9]\\d{6}",
    "\\d{8}"],
    [,
    ,
    "6\\d{8}|4\\d{7}",
    "\\d{8,9}"],
    [,
    ,
    "(?:8\\d|90)\\d{6}",
    "\\d{8}"],
    [,
    ,
    "NA",
    "NA"],
    [,
    ,
    "NA",
    "NA"],
    [,
    ,
    "NA",
    "NA"],
    [,
    ,
    "NA",
    "NA"],
    "MC",
    377,
    "00",
    "0",
    ,
    ,
    "0",
    ,
    ,
    ,
    [[,
    "(\\d{2})(\\d{2})(\\d{2})(\\d{2})",
    "$1 $2 $3 $4",
    ["[89]"],
    "0$1",
    ""],
    [,
    "(\\d{2})(\\d{3})(\\d{3})",
    "$1 $2 $3",
    ["4"],
    "0$1",
    ""],
    [,
    "(6)(\\d{2})(\\d{2})(\\d{2})(\\d{2})",
    "$1 $2 $3 $4 $5",
    ["6"],
    "0$1",
    ""]],
    ,
    [,
    ,
    "NA",
    "NA"],
    ,
    ,
    [,
    ,
    "8\\d{7}",
    "\\d{8}"],
    [,
    ,
    "NA",
    "NA"]],
    MD: [,
    [,
    ,
    "[256-9]\\d{7}",
    "\\d{8}"],
    [,
    ,
    "(?:2(?:1[0569]|2\\d|3[015-7]|4[1-46-9]|5[0-24689]|6[2-589]|7[1-37]|9[1347-9])|5(?:33|5[257]))\\d{5}",
    "\\d{5,8}"],
    [,
    ,
    "(?:6(?:0[0-3]|50|7[12]|[89]\\d)|7(?:80|9\\d))\\d{5}",
    "\\d{8}"],
    [,
    ,
    "800\\d{5}",
    "\\d{8}"],
    [,
    ,
    "90[056]\\d{5}",
    "\\d{8}"],
    [,
    ,
    "808\\d{5}",
    "\\d{8}"],
    [,
    ,
    "NA",
    "NA"],
    [,
    ,
    "NA",
    "NA"],
    "MD",
    373,
    "00",
    "0",
    ,
    ,
    "0",
    ,
    ,
    ,
    [[,
    "(22)(\\d{3})(\\d{3})",
    "$1 $2 $3",
    ["22"],
    "0$1",
    ""],
    [,
    "([25-7]\\d{2})(\\d{2})(\\d{3})",
    "$1 $2 $3",
    ["2[13-79]|[5-7]"],
    "0$1",
    ""],
    [,
    "([89]\\d{2})(\\d{5})",
    "$1 $2",
    ["[89]"],
    "0$1",
    ""]],
    ,
    [,
    ,
    "NA",
    "NA"],
    ,
    ,
    [,
    ,
    "NA",
    "NA"],
    [,
    ,
    "8(?:03|14)\\d{5}",
    "\\d{8}"]],
    ME: [,
    [,
    ,
    "[2-9]\\d{7,8}",
    "\\d{6,9}"],
    [,
    ,
    "(?:20[2-8]|3(?:0[2-7]|1[35-7]|2[367]|3[4-7])|4(?:0[237]|1[2467])|5(?:0[47]|1[27]|2[378]))\\d{5}",
    "\\d{6,8}"],
    [,
    ,
    "6(?:32\\d|[89]\\d{2}|7(?:[0-8]\\d|9(?:[3-9]|[0-2]\\d)))\\d{4}",
    "\\d{8,9}"],
    [,
    ,
    "800[28]\\d{4}",
    "\\d{8}"],
    [,
    ,
    "(?:88\\d|9(?:4[13-8]|5[16-8]))\\d{5}",
    "\\d{8}"],
    [,
    ,
    "NA",
    "NA"],
    [,
    ,
    "NA",
    "NA"],
    [,
    ,
    "78[134579]\\d{5}",
    "\\d{8}"],
    "ME",
    382,
    "00",
    "0",
    ,
    ,
    "0",
    ,
    ,
    ,
    [[,
    "(\\d{2})(\\d{3})(\\d{3})",
    "$1 $2 $3",
    ["[2-57-9]|6[3789]",
    "[2-57-9]|6(?:[389]|7(?:[0-8]|9[3-9]))"],
    "0$1",
    ""],
    [,
    "(67)(9)(\\d{3})(\\d{3})",
    "$1 $2 $3 $4",
    ["679",
    "679[0-2]"],
    "0$1",
    ""]],
    ,
    [,
    ,
    "NA",
    "NA"],
    ,
    ,
    [,
    ,
    "NA",
    "NA"],
    [,
    ,
    "77\\d{6}",
    "\\d{8}"]],
    MG: [,
    [,
    ,
    "[23]\\d{8}",
    "\\d{7,9}"],
    [,
    ,
    "2(?:0(?:(?:2\\d|4[47]|5[3467]|6[279]|8[268]|9[245])\\d|7(?:2[29]|[35]\\d))|210\\d)\\d{4}",
    "\\d{7,9}"],
    [,
    ,
    "3[02-4]\\d{7}",
    "\\d{9}"],
    [,
    ,
    "NA",
    "NA"],
    [,
    ,
    "NA",
    "NA"],
    [,
    ,
    "NA",
    "NA"],
    [,
    ,
    "NA",
    "NA"],
    [,
    ,
    "NA",
    "NA"],
    "MG",
    261,
    "00",
    "0",
    ,
    ,
    "0",
    ,
    ,
    ,
    [[,
    "([23]\\d)(\\d{2})(\\d{3})(\\d{2})",
    "$1 $2 $3 $4",
    ,
    "0$1",
    ""]],
    ,
    [,
    ,
    "NA",
    "NA"],
    ,
    ,
    [,
    ,
    "NA",
    "NA"],
    [,
    ,
    "NA",
    "NA"]],
    MF: [,
    [,
    ,
    "[56]\\d{8}",
    "\\d{9}"],
    [,
    ,
    "590(?:10|2[79]|5[128]|[78]7)\\d{4}",
    "\\d{9}"],
    [,
    ,
    "690(?:10|2[27]|66|77|8[78])\\d{4}",
    "\\d{9}"],
    [,
    ,
    "NA",
    "NA"],
    [,
    ,
    "NA",
    "NA"],
    [,
    ,
    "NA",
    "NA"],
    [,
    ,
    "NA",
    "NA"],
    [,
    ,
    "NA",
    "NA"],
    "MF",
    590,
    "00",
    "0",
    ,
    ,
    "0",
    ,
    ,
    ,
    ,
    ,
    [,
    ,
    "NA",
    "NA"],
    ,
    ,
    [,
    ,
    "NA",
    "NA"],
    [,
    ,
    "NA",
    "NA"]],
    MH: [,
    [],
    [],
    [],
    [,
    ,
    "NA",
    "NA"],
    [,
    ,
    "NA",
    "NA"],
    [,
    ,
    "NA",
    "NA"],
    [,
    ,
    "NA",
    "NA"],
    [,
    ,
    "NA",
    "NA"],
    "MH",
    692,
    "011",
    "1",
    ,
    ,
    "1",
    ,
    ,
    1,
    ,
    ,
    [,
    ,
    "NA",
    "NA"],
    ,
    ,
    [,
    ,
    "NA",
    "NA"],
    [,
    ,
    "NA",
    "NA"]],
    MK: [,
    [,
    ,
    "[2-578]\\d{7}",
    "\\d{8}"],
    [,
    ,
    "(?:2(?:[23]\\d|5[125]|61)|3(?:1[3-6]|2[2-6]|3[2-5]|4[235])|4(?:[23][2-6]|4[3-6]|5[25]|6[25-8]|7[24-6]|8[4-6]))\\d{5}",
    "\\d{6,8}"],
    [,
    ,
    "7[0-25-8]\\d{6}",
    "\\d{8}"],
    [,
    ,
    "800\\d{5}",
    "\\d{8}"],
    [,
    ,
    "5[02-9]\\d{6}",
    "\\d{8}"],
    [,
    ,
    "8(?:0[1-9]|[1-9]\\d)\\d{5}",
    "\\d{8}"],
    [,
    ,
    "NA",
    "NA"],
    [,
    ,
    "NA",
    "NA"],
    "MK",
    389,
    "00",
    "0",
    ,
    ,
    "0",
    ,
    ,
    ,
    [[,
    "(2)(\\d{3})(\\d{4})",
    "$1 $2 $3",
    ["2"],
    "0$1",
    ""],
    [,
    "([347]\\d)(\\d{3})(\\d{3})",
    "$1 $2 $3",
    ["[347]"],
    "0$1",
    ""],
    [,
    "([58]\\d{2})(\\d)(\\d{2})(\\d{2})",
    "$1 $2 $3 $4",
    ["[58]"],
    "0$1",
    ""]],
    ,
    [,
    ,
    "NA",
    "NA"],
    ,
    ,
    [,
    ,
    "NA",
    "NA"],
    [,
    ,
    "NA",
    "NA"]],
    ML: [,
    [,
    ,
    "[246-8]\\d{7}",
    "\\d{8}"],
    [,
    ,
    "(?:2(?:0(?:2[0-589]|7[027-9])|1(?:2[5-7]|[3-689]\\d))|442\\d)\\d{4}",
    "\\d{8}"],
    [,
    ,
    "(?:6(?:[569]\\d)|7(?:[08][1-9]|[3579][0-4]|4[014-7]|6\\d))\\d{5}",
    "\\d{8}"],
    [,
    ,
    "800\\d{5}",
    "\\d{8}"],
    [,
    ,
    "NA",
    "NA"],
    [,
    ,
    "NA",
    "NA"],
    [,
    ,
    "NA",
    "NA"],
    [,
    ,
    "NA",
    "NA"],
    "ML",
    223,
    "00",
    "0",
    ,
    ,
    "0",
    ,
    ,
    ,
    [[,
    "([246-8]\\d)(\\d{2})(\\d{2})(\\d{2})",
    "$1 $2 $3 $4",
    ,
    "",
    ""]],
    ,
    [,
    ,
    "NA",
    "NA"],
    ,
    ,
    [,
    ,
    "NA",
    "NA"],
    [,
    ,
    "NA",
    "NA"]],
    MM: [,
    [,
    ,
    "[124-8]\\d{5,7}|9\\d{7,8}",
    "\\d{5,9}"],
    [,
    ,
    "(?:1\\d|2|4[2-6]|5[2-9]|6\\d|7[0-5]|8[1-6])\\d{5}|1333\\d{4}",
    "\\d{5,8}"],
    [,
    ,
    "9(?:[25689]\\d|444)\\d{5}",
    "\\d{8,9}"],
    [,
    ,
    "NA",
    "NA"],
    [,
    ,
    "NA",
    "NA"],
    [,
    ,
    "NA",
    "NA"],
    [,
    ,
    "NA",
    "NA"],
    [,
    ,
    "NA",
    "NA"],
    "MM",
    95,
    "00",
    ,
    ,
    ,
    ,
    ,
    ,
    ,
    [[,
    "(1)(\\d{3})(\\d{3})",
    "$1 $2 $3",
    ["1"],
    "",
    ""],
    [,
    "(1)(3)(33\\d)(\\d{3})",
    "$1 $2 $3 $4",
    ["133",
    "1333"],
    "",
    ""],
    [,
    "(2)(\\d{2})(\\d{3})",
    "$1 $2 $3",
    ["2"],
    "",
    ""],
    [,
    "(\\d{2})(\\d{2})(\\d{3})",
    "$1 $2 $3",
    ["[4-8]"],
    "",
    ""],
    [,
    "(9444)(\\d{5})",
    "$1 $2",
    ["94"],
    "",
    ""],
    [,
    "(9)([25689]\\d{2})(\\d{4})",
    "$1 $2 $3",
    ["9[25689]"],
    "",
    ""]],
    ,
    [,
    ,
    "NA",
    "NA"],
    ,
    ,
    [,
    ,
    "NA",
    "NA"],
    [,
    ,
    "NA",
    "NA"]],
    MN: [,
    [,
    ,
    "[12]\\d{7,9}|[57-9]\\d{7}",
    "\\d{6,10}"],
    [,
    ,
    "[12](?:1\\d|2(?:[1-3]\\d?|7\\d)|3[2-8]\\d{1,2}|4[2-68]\\d{1,2}|5[1-4689]\\d{1,2})\\d{5}|(?:5[0568]|70)\\d{6}",
    "\\d{6,10}"],
    [,
    ,
    "(?:8[89]|9[15689])\\d{6}",
    "\\d{8}"],
    [,
    ,
    "NA",
    "NA"],
    [,
    ,
    "NA",
    "NA"],
    [,
    ,
    "NA",
    "NA"],
    [,
    ,
    "NA",
    "NA"],
    [,
    ,
    "7[569]\\d{6}",
    "\\d{8}"],
    "MN",
    976,
    "001",
    "0",
    ,
    ,
    "0",
    ,
    ,
    ,
    [[,
    "([12]\\d)(\\d{2})(\\d{4})",
    "$1 $2 $3",
    ["[12]1"],
    "0$1",
    ""],
    [,
    "([12]2\\d)(\\d{5,6})",
    "$1 $2",
    ["[12]2[1-3]"],
    "0$1",
    ""],
    [,
    "([12]\\d{3})(\\d{5})",
    "$1 $2",
    ["[12](?:27|[3-5])",
    "[12](?:27|[3-5]\\d)2"],
    "0$1",
    ""],
    [,
    "(\\d{4})(\\d{4})",
    "$1 $2",
    ["[57-9]"],
    "$1",
    ""],
    [,
    "([12]\\d{4})(\\d{4,5})",
    "$1 $2",
    ["[12](?:27|[3-5])",
    "[12](?:27|[3-5]\\d)[4-9]"],
    "0$1",
    ""]],
    ,
    [,
    ,
    "NA",
    "NA"],
    ,
    ,
    [,
    ,
    "NA",
    "NA"],
    [,
    ,
    "NA",
    "NA"]],
    MO: [,
    [,
    ,
    "[268]\\d{7}",
    "\\d{8}"],
    [,
    ,
    "(?:28[2-57-9]|8[2-57-9]\\d)\\d{5}",
    "\\d{8}"],
    [,
    ,
    "6[26]\\d{6}",
    "\\d{8}"],
    [,
    ,
    "NA",
    "NA"],
    [,
    ,
    "NA",
    "NA"],
    [,
    ,
    "NA",
    "NA"],
    [,
    ,
    "NA",
    "NA"],
    [,
    ,
    "NA",
    "NA"],
    "MO",
    853,
    "00",
    ,
    ,
    ,
    ,
    ,
    ,
    ,
    [[,
    "([268]\\d{3})(\\d{4})",
    "$1 $2",
    ,
    "",
    ""]],
    ,
    [,
    ,
    "NA",
    "NA"],
    ,
    ,
    [,
    ,
    "NA",
    "NA"],
    [,
    ,
    "NA",
    "NA"]],
    MP: [,
    [,
    ,
    "[5689]\\d{9}",
    "\\d{7}(?:\\d{3})?"],
    [,
    ,
    "670(?:2(?:3[3-5]|88|56)|32[23]|4[38]3|532|6(?:64|70|8\\d))\\d{4}",
    "\\d{7}(?:\\d{3})?"],
    [,
    ,
    "670(?:2(?:3[3-5]|88|56)|32[23]|4[38]3|532|6(?:64|70|8\\d))\\d{4}",
    "\\d{7}(?:\\d{3})?"],
    [,
    ,
    "8(?:00|55|66|77|88)[2-9]\\d{6}",
    "\\d{10}"],
    [,
    ,
    "900[2-9]\\d{6}",
    "\\d{10}"],
    [,
    ,
    "NA",
    "NA"],
    [,
    ,
    "5(?:00|33|44)[2-9]\\d{6}",
    "\\d{10}"],
    [,
    ,
    "NA",
    "NA"],
    "MP",
    1,
    "011",
    "1",
    ,
    ,
    "1",
    ,
    ,
    1,
    ,
    ,
    [,
    ,
    "NA",
    "NA"],
    ,
    "670",
    [,
    ,
    "NA",
    "NA"],
    [,
    ,
    "NA",
    "NA"]],
    MQ: [,
    [,
    ,
    "[56]\\d{8}",
    "\\d{9}"],
    [,
    ,
    "596(?:0[2-5]|[12]0|3[05-9]|4[024-8]|[5-7]\\d|89|9[4-8])\\d{4}",
    "\\d{9}"],
    [,
    ,
    "696(?:[0-479]\\d|5[01]|8[0-689])\\d{4}",
    "\\d{9}"],
    [,
    ,
    "NA",
    "NA"],
    [,
    ,
    "NA",
    "NA"],
    [,
    ,
    "NA",
    "NA"],
    [,
    ,
    "NA",
    "NA"],
    [,
    ,
    "NA",
    "NA"],
    "MQ",
    596,
    "00",
    "0",
    ,
    ,
    "0",
    ,
    ,
    ,
    [[,
    "(\\d{3})(\\d{2})(\\d{2})(\\d{2})",
    "$1 $2 $3 $4",
    ,
    "0$1",
    ""]],
    ,
    [,
    ,
    "NA",
    "NA"],
    ,
    ,
    [,
    ,
    "NA",
    "NA"],
    [,
    ,
    "NA",
    "NA"]],
    MR: [,
    [,
    ,
    "[2-48]\\d{7}",
    "\\d{8}"],
    [,
    ,
    "25[08]\\d{5}|35\\d{6}|45[1-7]\\d{5}",
    "\\d{8}"],
    [,
    ,
    "(?:2(?:2\\d|70)|3(?:3\\d|6[1-36]|7[1-3])|4(?:4\\d|6[0457-9]|7[4-9]))\\d{5}",
    "\\d{8}"],
    [,
    ,
    "800\\d{5}",
    "\\d{8}"],
    [,
    ,
    "NA",
    "NA"],
    [,
    ,
    "NA",
    "NA"],
    [,
    ,
    "NA",
    "NA"],
    [,
    ,
    "NA",
    "NA"],
    "MR",
    222,
    "00",
    ,
    ,
    ,
    ,
    ,
    ,
    ,
    [[,
    "([2-48]\\d)(\\d{2})(\\d{2})(\\d{2})",
    "$1 $2 $3 $4",
    ,
    "",
    ""]],
    ,
    [,
    ,
    "NA",
    "NA"],
    ,
    ,
    [,
    ,
    "NA",
    "NA"],
    [,
    ,
    "NA",
    "NA"]],
    MS: [,
    [,
    ,
    "[5689]\\d{9}",
    "\\d{7}(?:\\d{3})?"],
    [,
    ,
    "664491\\d{4}",
    "\\d{7}(?:\\d{3})?"],
    [,
    ,
    "664492\\d{4}",
    "\\d{10}"],
    [,
    ,
    "8(?:00|55|66|77|88)[2-9]\\d{6}",
    "\\d{10}"],
    [,
    ,
    "900[2-9]\\d{6}",
    "\\d{10}"],
    [,
    ,
    "NA",
    "NA"],
    [,
    ,
    "5(?:00|33|44)[2-9]\\d{6}",
    "\\d{10}"],
    [,
    ,
    "NA",
    "NA"],
    "MS",
    1,
    "011",
    "1",
    ,
    ,
    "1",
    ,
    ,
    ,
    ,
    ,
    [,
    ,
    "NA",
    "NA"],
    ,
    "664",
    [,
    ,
    "NA",
    "NA"],
    [,
    ,
    "NA",
    "NA"]],
    MT: [,
    [,
    ,
    "[2579]\\d{7}",
    "\\d{8}"],
    [,
    ,
    "2(?:0(?:1[0-6]|[69]\\d)|[1-357]\\d{2})\\d{4}",
    "\\d{8}"],
    [,
    ,
    "(?:7(?:210|[79]\\d{2}|)|9(?:2[13]\\d|696|8(?:1[1-3]|89|97)|9\\d{2}))\\d{4}",
    "\\d{8}"],
    [,
    ,
    "NA",
    "NA"],
    [,
    ,
    "50(?:0(?:3[1679]|4\\d)|[169]\\d{2}|7[06]\\d)\\d{3}",
    "\\d{8}"],
    [,
    ,
    "NA",
    "NA"],
    [,
    ,
    "NA",
    "NA"],
    [,
    ,
    "NA",
    "NA"],
    "MT",
    356,
    "00",
    ,
    ,
    ,
    ,
    ,
    ,
    ,
    [[,
    "(\\d{4})(\\d{4})",
    "$1 $2",
    ,
    "",
    ""]],
    ,
    [,
    ,
    "7117\\d{4}",
    "\\d{8}"],
    ,
    ,
    [,
    ,
    "NA",
    "NA"],
    [,
    ,
    "NA",
    "NA"]],
    MU: [,
    [,
    ,
    "[2-9]\\d{6}",
    "\\d{7}"],
    [,
    ,
    "(?:2(?:[034789]\\d|1[0-8]|2[0-79])|4(?:[013-8]\\d|2[4-7])|[56]\\d{2}|8(?:14|3[129]))\\d{4}",
    "\\d{7}"],
    [,
    ,
    "(?:25\\d|4(?:2[12389]|9\\d)|7\\d{2}|87[15-7]|9[1-8]\\d)\\d{4}",
    "\\d{7}"],
    [,
    ,
    "80[012]\\d{4}",
    "\\d{7}"],
    [,
    ,
    "30\\d{5}",
    "\\d{7}"],
    [,
    ,
    "NA",
    "NA"],
    [,
    ,
    "NA",
    "NA"],
    [,
    ,
    "NA",
    "NA"],
    "MU",
    230,
    "0(?:[2-7]0|33)",
    ,
    ,
    ,
    ,
    ,
    "020",
    ,
    [[,
    "([2-9]\\d{2})(\\d{4})",
    "$1 $2",
    ,
    "",
    ""]],
    ,
    [,
    ,
    "NA",
    "NA"],
    ,
    ,
    [,
    ,
    "NA",
    "NA"],
    [,
    ,
    "NA",
    "NA"]],
    MV: [,
    [,
    ,
    "[367]\\d{6}|9(?:00\\d{7}|\\d{6})",
    "\\d{7,10}"],
    [,
    ,
    "(?:3(?:0[01]|3[0-59]|)|6(?:[567][02468]|8[024689]|90))\\d{4}",
    "\\d{7}"],
    [,
    ,
    "(?:7[3-9]|9[6-9])\\d{5}",
    "\\d{7}"],
    [,
    ,
    "NA",
    "NA"],
    [,
    ,
    "900\\d{7}",
    "\\d{10}"],
    [,
    ,
    "NA",
    "NA"],
    [,
    ,
    "NA",
    "NA"],
    [,
    ,
    "NA",
    "NA"],
    "MV",
    960,
    "0(?:0|19)",
    ,
    ,
    ,
    ,
    ,
    "00",
    ,
    [[,
    "(\\d{3})(\\d{4})",
    "$1-$2",
    ["[367]|9(?:[1-9]|0[1-9])"],
    "",
    ""],
    [,
    "(\\d{3})(\\d{3})(\\d{4})",
    "$1 $2 $3",
    ["900"],
    "",
    ""]],
    ,
    [,
    ,
    "781\\d{4}",
    "\\d{7}"],
    ,
    ,
    [,
    ,
    "NA",
    "NA"],
    [,
    ,
    "NA",
    "NA"]],
    MW: [,
    [,
    ,
    "(?:[13-5]|[27]\\d{2}|[89](?:\\d{2})?)\\d{6}",
    "\\d{7,9}"],
    [,
    ,
    "(?:1[2-9]|21\\d{2})\\d{5}",
    "\\d{7,9}"],
    [,
    ,
    "(?:[3-5]|77|8(?:8\\d)?|9(?:9\\d)?)\\d{6}",
    "\\d{7,9}"],
    [,
    ,
    "NA",
    "NA"],
    [,
    ,
    "NA",
    "NA"],
    [,
    ,
    "NA",
    "NA"],
    [,
    ,
    "NA",
    "NA"],
    [,
    ,
    "NA",
    "NA"],
    "MW",
    265,
    "00",
    "0",
    ,
    ,
    "0",
    ,
    ,
    ,
    [[,
    "(\\d)(\\d{3})(\\d{3})",
    "$1 $2 $3",
    ["[13-5]"],
    "0$1",
    ""],
    [,
    "(2\\d{2})(\\d{3})(\\d{3})",
    "$1 $2 $3",
    ["2"],
    "0$1",
    ""],
    [,
    "(\\d)(\\d{4})(\\d{4})",
    "$1 $2 $3",
    ["7"],
    "0$1",
    ""],
    [,
    "(\\d)(\\d{3,4})(\\d{3,4})",
    "$1 $2 $3",
    ["[89]"],
    "0$1",
    ""]],
    ,
    [,
    ,
    "NA",
    "NA"],
    ,
    ,
    [,
    ,
    "NA",
    "NA"],
    [,
    ,
    "NA",
    "NA"]],
    MX: [,
    [,
    ,
    "[1-9]\\d{9,10}",
    "\\d{7,11}"],
    [,
    ,
    "(?:33|55|81)\\d{8}|(?:2(?:2[2-9]|3[1-35-8]|4[13-9]|7[1-689]|8[1-58]|9[467])|3(?:1[1-79]|[2458][1-9]|7[1-8]|9[1-5])|4(?:1[1-57-9]|[24-6][1-9]|[37][1-8]|8[1-35-9]|9[2-689])|5(?:88|9[1-79])|6(?:1[2-68]|[234][1-9]|5[1-3689]|6[12457-9]|7[1-7]|8[67]|9[4-8])|7(?:[13467][1-9]|2[1-8]|5[13-9]|8[1-69]|9[17])|8(?:2[13-689]|3[1-6]|4[124-6]|6[1246-9]|7[1-378]|9[12479])|9(?:1[346-9]|2[1-4]|3[2-46-8]|5[1348]|[69][1-9]|7[12]|8[1-8]))\\d{7}",
    "\\d{7,10}"],
    [,
    ,
    "1(?:(?:33|55|81)\\d{8}|(?:2(?:2[2-9]|3[1-35-8]|4[13-9]|7[1-689]|8[1-58]|9[467])|3(?:1[1-79]|[2458][1-9]|7[1-8]|9[1-5])|4(?:1[1-57-9]|[24-6][1-9]|[37][1-8]|8[1-35-9]|9[2-689])|5(?:88|9[1-79])|6(?:1[2-68]|[2-4][1-9]|5[1-3689]|6[12457-9]|7[1-7]|8[67]|9[4-8])|7(?:[13467][1-9]|2[1-8]|5[13-9]|8[1-69]|9[17])|8(?:2[13-689]|3[1-6]|4[124-6]|6[1246-9]|7[1-378]|9[12479])|9(?:1[346-9]|2[1-4]|3[2-46-8]|5[1348]|[69][1-9]|7[12]|8[1-8]))\\d{7})",
    "\\d{11}"],
    [,
    ,
    "800\\d{7}",
    "\\d{10}"],
    [,
    ,
    "900\\d{7}",
    "\\d{10}"],
    [,
    ,
    "NA",
    "NA"],
    [,
    ,
    "NA",
    "NA"],
    [,
    ,
    "NA",
    "NA"],
    "MX",
    52,
    "0[09]",
    "01",
    ,
    ,
    "0[12]|04[45](\\d{10})",
    "1$1",
    ,
    ,
    [[,
    "([358]\\d)(\\d{4})(\\d{4})",
    "$1 $2 $3",
    ["33|55|81"],
    "01 $1",
    ""],
    [,
    "(\\d{3})(\\d{3})(\\d{4})",
    "$1 $2 $3",
    ["[2467]|3[12457-9]|5[89]|8[02-9]|9[0-35-9]"],
    "01 $1",
    ""],
    [,
    "(1)([358]\\d)(\\d{4})(\\d{4})",
    "045 $2 $3 $4",
    ["1(?:33|55|81)"],
    "$1",
    ""],
    [,
    "(1)(\\d{3})(\\d{3})(\\d{4})",
    "045 $2 $3 $4",
    ["1(?:[2467]|3[12457-9]|5[89]|8[2-9]|9[1-35-9])"],
    "$1",
    ""]],
    [[,
    "([358]\\d)(\\d{4})(\\d{4})",
    "$1 $2 $3",
    ["33|55|81"]],
    [,
    "(\\d{3})(\\d{3})(\\d{4})",
    "$1 $2 $3",
    ["[2467]|3[12457-9]|5[89]|8[02-9]|9[0-35-9]"]],
    [,
    "(1)([358]\\d)(\\d{4})(\\d{4})",
    "$1 $2 $3 $4",
    ["1(?:33|55|81)"]],
    [,
    "(1)(\\d{3})(\\d{3})(\\d{4})",
    "$1 $2 $3 $4",
    ["1(?:[2467]|3[12457-9]|5[89]|8[2-9]|9[1-35-9])"]]],
    [,
    ,
    "NA",
    "NA"],
    ,
    ,
    [,
    ,
    "NA",
    "NA"],
    [,
    ,
    "NA",
    "NA"]],
    MY: [,
    [,
    ,
    "[13-9]\\d{7,9}",
    "\\d{6,10}"],
    [,
    ,
    "(?:3\\d{2}|[4-79]\\d|8[2-9])\\d{6}",
    "\\d{6,9}"],
    [,
    ,
    "1[0-46-9]\\d{7}",
    "\\d{9}"],
    [,
    ,
    "1[38]00\\d{6}",
    "\\d{10}"],
    [,
    ,
    "1600\\d{6}",
    "\\d{10}"],
    [,
    ,
    "NA",
    "NA"],
    [,
    ,
    "1700\\d{6}",
    "\\d{10}"],
    [,
    ,
    "154\\d{7}",
    "\\d{10}"],
    "MY",
    60,
    "00",
    "0",
    ,
    ,
    "0",
    ,
    ,
    ,
    [[,
    "([4-79])(\\d{3})(\\d{4})",
    "$1-$2 $3",
    ["[4-79]"],
    "0$1",
    ""],
    [,
    "(3)(\\d{4})(\\d{4})",
    "$1-$2 $3",
    ["3"],
    "0$1",
    ""],
    [,
    "([18]\\d)(\\d{3})(\\d{3,4})",
    "$1-$2 $3",
    ["1[0-46-9][1-9]|8"],
    "0$1",
    ""],
    [,
    "(1)([36-8]00)(\\d{2})(\\d{4})",
    "$1-$2-$3-$4",
    ["1[36-8]0"],
    "",
    ""],
    [,
    "(154)(\\d{3})(\\d{4})",
    "$1-$2 $3",
    ["15"],
    "0$1",
    ""]],
    ,
    [,
    ,
    "NA",
    "NA"],
    ,
    ,
    [,
    ,
    "NA",
    "NA"],
    [,
    ,
    "NA",
    "NA"]],
    MZ: [,
    [,
    ,
    "[28]\\d{7,8}",
    "\\d{8,9}"],
    [,
    ,
    "2(?:[1346]\\d|5[0-2]|[78][12]|93)\\d{5}",
    "\\d{8}"],
    [,
    ,
    "8[24]\\d{7}",
    "\\d{9}"],
    [,
    ,
    "800\\d{6}",
    "\\d{9}"],
    [,
    ,
    "NA",
    "NA"],
    [,
    ,
    "NA",
    "NA"],
    [,
    ,
    "NA",
    "NA"],
    [,
    ,
    "NA",
    "NA"],
    "MZ",
    258,
    "00",
    ,
    ,
    ,
    ,
    ,
    ,
    ,
    [[,
    "([28]\\d)(\\d{3})(\\d{3,4})",
    "$1 $2 $3",
    ["2|8[24]"],
    "",
    ""],
    [,
    "(80\\d)(\\d{3})(\\d{3})",
    "$1 $2 $3",
    ["80"],
    "",
    ""]],
    ,
    [,
    ,
    "NA",
    "NA"],
    ,
    ,
    [,
    ,
    "NA",
    "NA"],
    [,
    ,
    "NA",
    "NA"]],
    NA: [,
    [,
    ,
    "[68]\\d{7,8}",
    "\\d{8,9}"],
    [,
    ,
    "6(?:1(?:17|2(?:[0189]\\d|[23-6]|7\\d?)|3(?:2\\d|3[378])|4[01]|69|7[014])|2(?:17|25|5(?:[0-36-8]|4\\d?)|69|70)|3(?:17|2(?:[0237]\\d?|[14-689])|34|6[29]|7[01]|81)|4(?:17|2(?:[012]|7?)|4(?:[06]|1\\d)|5(?:[01357]|[25]\\d?)|69|7[01])|5(?:17|2(?:[0459]|[23678]\\d?)|69|7[01])|6(?:17|2(?:5|6\\d?)|38|42|69|7[01])|7(?:17|2(?:[569]|[234]\\d?)|3(?:0\\d?|[13])|69|7[01]))\\d{4}",
    "\\d{8,9}"],
    [,
    ,
    "(?:60|8[125])\\d{7}",
    "\\d{9}"],
    [,
    ,
    "NA",
    "NA"],
    [,
    ,
    "8701\\d{5}",
    "\\d{9}"],
    [,
    ,
    "NA",
    "NA"],
    [,
    ,
    "NA",
    "NA"],
    [,
    ,
    "886\\d{5}",
    "\\d{8}"],
    "NA",
    264,
    "00",
    "0",
    ,
    ,
    "0",
    ,
    ,
    ,
    [[,
    "(8\\d)(\\d{3})(\\d{4})",
    "$1 $2 $3",
    ["8[125]"],
    "0$1",
    ""],
    [,
    "(6\\d)(\\d{2,3})(\\d{4})",
    "$1 $2 $3",
    ["6"],
    "0$1",
    ""],
    [,
    "(88)(\\d{3})(\\d{3})",
    "$1 $2 $3",
    ["88"],
    "0$1",
    ""],
    [,
    "(870)(\\d{3})(\\d{3})",
    "$1 $2 $3",
    ["870"],
    "0$1",
    ""]],
    ,
    [,
    ,
    "NA",
    "NA"],
    ,
    ,
    [,
    ,
    "NA",
    "NA"],
    [,
    ,
    "NA",
    "NA"]],
    NC: [,
    [,
    ,
    "[2-47-9]\\d{5}",
    "\\d{6}"],
    [,
    ,
    "(?:2[03-9]|35|4[1-7]|88)\\d{4}",
    "\\d{6}"],
    [,
    ,
    "(?:7[4-9]|8[0-79]|9\\d)\\d{4}",
    "\\d{6}"],
    [,
    ,
    "NA",
    "NA"],
    [,
    ,
    "NA",
    "NA"],
    [,
    ,
    "NA",
    "NA"],
    [,
    ,
    "NA",
    "NA"],
    [,
    ,
    "NA",
    "NA"],
    "NC",
    687,
    "00",
    ,
    ,
    ,
    ,
    ,
    ,
    ,
    [[,
    "(\\d{2})(\\d{2})(\\d{2})",
    "$1.$2.$3",
    ,
    "",
    ""]],
    ,
    [,
    ,
    "NA",
    "NA"],
    ,
    ,
    [,
    ,
    "NA",
    "NA"],
    [,
    ,
    "NA",
    "NA"]],
    NE: [,
    [,
    ,
    "[029]\\d{7}",
    "\\d{8}"],
    [,
    ,
    "2(?:0(?:20|3[1-7]|4[134]|5[14]|6[14578]|7[1-578])|1(?:4[145]|5[14]|6[14-68]|7[169]|88))\\d{4}",
    "\\d{8}"],
    [,
    ,
    "9[03467]\\d{6}",
    "\\d{8}"],
    [,
    ,
    "08\\d{6}",
    "\\d{8}"],
    [,
    ,
    "09\\d{6}",
    "\\d{8}"],
    [,
    ,
    "NA",
    "NA"],
    [,
    ,
    "NA",
    "NA"],
    [,
    ,
    "NA",
    "NA"],
    "NE",
    227,
    "00",
    ,
    ,
    ,
    ,
    ,
    ,
    ,
    [[,
    "([029]\\d)(\\d{2})(\\d{2})(\\d{2})",
    "$1 $2 $3 $4",
    ["[29]|09"],
    "",
    ""],
    [,
    "(08)(\\d{3})(\\d{3})",
    "$1 $2 $3",
    ["08"],
    "",
    ""]],
    ,
    [,
    ,
    "NA",
    "NA"],
    ,
    ,
    [,
    ,
    "NA",
    "NA"],
    [,
    ,
    "NA",
    "NA"],
    1],
    NF: [,
    [,
    ,
    "[13]\\d{5}",
    "\\d{5,6}"],
    [,
    ,
    "(?:1(?:06|17|28|39)|3[012]\\d)\\d{3}",
    "\\d{5,6}"],
    [,
    ,
    "38\\d{4}",
    "\\d{5,6}"],
    [,
    ,
    "NA",
    "NA"],
    [,
    ,
    "NA",
    "NA"],
    [,
    ,
    "NA",
    "NA"],
    [,
    ,
    "NA",
    "NA"],
    [,
    ,
    "NA",
    "NA"],
    "NF",
    672,
    "00",
    ,
    ,
    ,
    ,
    ,
    ,
    ,
    [[,
    "(\\d{2})(\\d{4})",
    "$1 $2",
    ["1"],
    "",
    ""],
    [,
    "(\\d)(\\d{5})",
    "$1 $2",
    ["3"],
    "",
    ""]],
    ,
    [,
    ,
    "NA",
    "NA"],
    ,
    ,
    [,
    ,
    "NA",
    "NA"],
    [,
    ,
    "NA",
    "NA"]],
    NG: [,
    [,
    ,
    "[1-69]\\d{5,8}|[78]\\d{5,13}",
    "\\d{5,14}"],
    [,
    ,
    "[12]\\d{6,7}|9\\d{7}|(?:4[023568]|5[02368]|6[02-469]|7[569]|8[2-9])\\d{6}|(?:4[47]|5[14579]|6[1578]|7[0-357])\\d{5,6}|(?:78|41)\\d{5}",
    "\\d{5,9}"],
    [,
    ,
    "(?:70(?:[3-9]\\d|2[1-9])|8(?:0[2-9]|1[23689])\\d)\\d{6}",
    "\\d{10}"],
    [,
    ,
    "800\\d{7,11}",
    "\\d{10,14}"],
    [,
    ,
    "NA",
    "NA"],
    [,
    ,
    "NA",
    "NA"],
    [,
    ,
    "700\\d{7,11}",
    "\\d{10,14}"],
    [,
    ,
    "NA",
    "NA"],
    "NG",
    234,
    "009",
    "0",
    ,
    ,
    "0",
    ,
    ,
    ,
    [[,
    "([129])(\\d{3})(\\d{3,4})",
    "$1 $2 $3",
    ["[129]"],
    "0$1",
    ""],
    [,
    "([3-8]\\d)(\\d{3})(\\d{2,3})",
    "$1 $2 $3",
    ["[3-6]|7(?:[1-79]|0[1-9])|8[2-9]"],
    "0$1",
    ""],
    [,
    "([78]\\d{2})(\\d{3})(\\d{3,4})",
    "$1 $2 $3",
    ["70|8[01]"],
    "0$1",
    ""],
    [,
    "([78]00)(\\d{4})(\\d{4,5})",
    "$1 $2 $3",
    ["[78]00"],
    "0$1",
    ""],
    [,
    "([78]00)(\\d{5})(\\d{5,6})",
    "$1 $2 $3",
    ["[78]00"],
    "0$1",
    ""],
    [,
    "(78)(\\d{2})(\\d{3})",
    "$1 $2 $3",
    ["78"],
    "0$1",
    ""]],
    ,
    [,
    ,
    "NA",
    "NA"],
    ,
    ,
    [,
    ,
    "NA",
    "NA"],
    [,
    ,
    "NA",
    "NA"]],
    NI: [,
    [,
    ,
    "[128]\\d{7}",
    "\\d{8}"],
    [,
    ,
    "2\\d{7}",
    "\\d{8}"],
    [,
    ,
    "8\\d{7}",
    "\\d{8}"],
    [,
    ,
    "1800\\d{4}",
    "\\d{8}"],
    [,
    ,
    "NA",
    "NA"],
    [,
    ,
    "NA",
    "NA"],
    [,
    ,
    "NA",
    "NA"],
    [,
    ,
    "NA",
    "NA"],
    "NI",
    505,
    "00",
    ,
    ,
    ,
    ,
    ,
    ,
    ,
    [[,
    "(\\d{4})(\\d{4})",
    "$1 $2",
    ,
    "",
    ""]],
    ,
    [,
    ,
    "NA",
    "NA"],
    ,
    ,
    [,
    ,
    "NA",
    "NA"],
    [,
    ,
    "NA",
    "NA"]],
    NL: [,
    [,
    ,
    "[1-9]\\d{6,9}",
    "\\d{7,10}"],
    [,
    ,
    "(?:1[0135-8]|2[02-69]|3[0-68]|4[0135-9]|[57]\\d|8[478])\\d{7}",
    "\\d{9}"],
    [,
    ,
    "6[1-58]\\d{7}",
    "\\d{9}"],
    [,
    ,
    "800\\d{4,7}",
    "\\d{7,10}"],
    [,
    ,
    "90[069]\\d{4,7}",
    "\\d{7,10}"],
    [,
    ,
    "NA",
    "NA"],
    [,
    ,
    "NA",
    "NA"],
    [,
    ,
    "85\\d{7}",
    "\\d{9}"],
    "NL",
    31,
    "00",
    "0",
    ,
    ,
    "0",
    ,
    ,
    ,
    [[,
    "([1-578]\\d)(\\d{3})(\\d{4})",
    "$1 $2 $3",
    ["1[035]|2[0346]|3[03568]|4[0356]|5[0358]|7|8[458]"],
    "0$1",
    ""],
    [,
    "([1-5]\\d{2})(\\d{3})(\\d{3})",
    "$1 $2 $3",
    ["1[16-8]|2[259]|3[124]|4[17-9]|5[124679]"],
    "0$1",
    ""],
    [,
    "(6)(\\d{8})",
    "$1 $2",
    ["6"],
    "0$1",
    ""],
    [,
    "([89]0\\d)(\\d{4,7})",
    "$1 $2",
    ["80|9"],
    "0$1",
    ""]],
    ,
    [,
    ,
    "NA",
    "NA"],
    ,
    ,
    [,
    ,
    "NA",
    "NA"],
    [,
    ,
    "NA",
    "NA"]],
    NO: [,
    [,
    ,
    "0\\d{4}|[2-9]\\d{7}",
    "\\d{5}(?:\\d{3})?"],
    [,
    ,
    "(?:2[1-4]|3[1-3578]|5[1-35-7]|6[1-4679]|7[0-8])\\d{6}",
    "\\d{8}"],
    [,
    ,
    "(?:4[015-8]|9\\d)\\d{6}",
    "\\d{8}"],
    [,
    ,
    "80[01]\\d{5}",
    "\\d{8}"],
    [,
    ,
    "82[09]\\d{5}",
    "\\d{8}"],
    [,
    ,
    "810(?:0[0-6]|[2-8]\\d)\\d{3}",
    "\\d{8}"],
    [,
    ,
    "880\\d{5}",
    "\\d{8}"],
    [,
    ,
    "NA",
    "NA"],
    "NO",
    47,
    "00",
    ,
    ,
    ,
    ,
    ,
    ,
    ,
    [[,
    "([489]\\d{2})(\\d{2})(\\d{3})",
    "$1 $2 $3",
    ["[489]"],
    "",
    ""],
    [,
    "([235-7]\\d)(\\d{2})(\\d{2})(\\d{2})",
    "$1 $2 $3 $4",
    ["[235-7]"],
    "",
    ""]],
    ,
    [,
    ,
    "NA",
    "NA"],
    1,
    ,
    [,
    ,
    "NA",
    "NA"],
    [,
    ,
    "0\\d{4}|81(?:0(?:0[7-9]|1\\d)|5\\d{2})\\d{3}",
    "\\d{5}(?:\\d{3})?"],
    1],
    NP: [,
    [,
    ,
    "[1-8]\\d{7}|9(?:[1-69]\\d{6}|7[2-6]\\d{5,7}|8\\d{8})",
    "\\d{6,10}"],
    [,
    ,
    "(?:1[0124-6]|2[13-79]|3[135-8]|4[146-9]|5[135-7]|6[13-9]|7[15-9]|8[1-46-9]|9[1-79])\\d{6}",
    "\\d{6,8}"],
    [,
    ,
    "9(?:7[45]|8[0145])\\d{7}",
    "\\d{10}"],
    [,
    ,
    "NA",
    "NA"],
    [,
    ,
    "NA",
    "NA"],
    [,
    ,
    "NA",
    "NA"],
    [,
    ,
    "NA",
    "NA"],
    [,
    ,
    "NA",
    "NA"],
    "NP",
    977,
    "00",
    "0",
    ,
    ,
    "0",
    ,
    ,
    ,
    [[,
    "(1)(\\d{7})",
    "$1-$2",
    ["1[2-6]"],
    "0$1",
    ""],
    [,
    "(\\d{2})(\\d{6})",
    "$1-$2",
    ["1[01]|[2-8]|9(?:[1-69]|7[15-9])"],
    "0$1",
    ""],
    [,
    "(9\\d{2})(\\d{7})",
    "$1-$2",
    ["9(?:7[45]|8)"],
    "0$1",
    ""]],
    ,
    [,
    ,
    "NA",
    "NA"],
    ,
    ,
    [,
    ,
    "NA",
    "NA"],
    [,
    ,
    "NA",
    "NA"]],
    NR: [,
    [,
    ,
    "[458]\\d{6}",
    "\\d{7}"],
    [,
    ,
    "(?:444|888)\\d{4}",
    "\\d{7}"],
    [,
    ,
    "55[5-9]\\d{4}",
    "\\d{7}"],
    [,
    ,
    "NA",
    "NA"],
    [,
    ,
    "NA",
    "NA"],
    [,
    ,
    "NA",
    "NA"],
    [,
    ,
    "NA",
    "NA"],
    [,
    ,
    "NA",
    "NA"],
    "NR",
    674,
    "00",
    ,
    ,
    ,
    ,
    ,
    ,
    ,
    [[,
    "(\\d{3})(\\d{4})",
    "$1 $2",
    ,
    "",
    ""]],
    ,
    [,
    ,
    "NA",
    "NA"],
    ,
    ,
    [,
    ,
    "NA",
    "NA"],
    [,
    ,
    "NA",
    "NA"]],
    NU: [,
    [,
    ,
    "[1-5]\\d{3}",
    "\\d{4}"],
    [,
    ,
    "[34]\\d{3}",
    "\\d{4}"],
    [,
    ,
    "[125]\\d{3}",
    "\\d{4}"],
    [,
    ,
    "NA",
    "NA"],
    [,
    ,
    "NA",
    "NA"],
    [,
    ,
    "NA",
    "NA"],
    [,
    ,
    "NA",
    "NA"],
    [,
    ,
    "NA",
    "NA"],
    "NU",
    683,
    "00",
    ,
    ,
    ,
    ,
    ,
    ,
    ,
    ,
    ,
    [,
    ,
    "NA",
    "NA"],
    ,
    ,
    [,
    ,
    "NA",
    "NA"],
    [,
    ,
    "NA",
    "NA"]],
    NZ: [,
    [,
    ,
    "6[235-9]\\d{6}|[2-57-9]\\d{7,10}",
    "\\d{7,11}"],
    [,
    ,
    "(?:3[2-79]|[49][2-689]|6[235-9]|7[2-589])\\d{6}|24099\\d{3}",
    "\\d{7,8}"],
    [,
    ,
    "2(?:[079]\\d{7}|1(?:0\\d{5,7}|[12]\\d{5,6}|[3-9]\\d{5})|[28]\\d{7,8}|4[1-9]\\d{6})",
    "\\d{8,10}"],
    [,
    ,
    "508\\d{6,7}|80\\d{6,8}",
    "\\d{8,10}"],
    [,
    ,
    "90\\d{7,9}",
    "\\d{9,11}"],
    [,
    ,
    "NA",
    "NA"],
    [,
    ,
    "NA",
    "NA"],
    [,
    ,
    "NA",
    "NA"],
    "NZ",
    64,
    "0(?:0|161)",
    "0",
    ,
    ,
    "0",
    ,
    "00",
    ,
    [[,
    "([34679])(\\d{3})(\\d{4})",
    "$1-$2 $3",
    ["[3467]|9[1-9]"],
    "0$1",
    ""],
    [,
    "(21)(\\d{4})(\\d{3,4})",
    "$1 $2 $3",
    ["21"],
    "0$1",
    ""],
    [,
    "([2589]\\d{2})(\\d{3})(\\d{3,4})",
    "$1 $2 $3",
    ["2[0247-9]|5|[89]00"],
    "0$1",
    ""],
    [,
    "(\\d{2})(\\d{3})(\\d{3,4})",
    "$1 $2 $3",
    ["2[0169]|86"],
    "0$1",
    ""],
    [,
    "(24099)(\\d{3})",
    "$1 $2",
    ["240",
    "2409",
    "24099"],
    "0$1",
    ""]],
    ,
    [,
    ,
    "[28]6\\d{6,7}",
    "\\d{8,9}"],
    ,
    ,
    [,
    ,
    "NA",
    "NA"],
    [,
    ,
    "NA",
    "NA"]],
    OM: [,
    [,
    ,
    "(?:2[3-6]|5|9[2-9])\\d{6}|800\\d{5,6}",
    "\\d{7,9}"],
    [,
    ,
    "2[3-6]\\d{6}",
    "\\d{8}"],
    [,
    ,
    "9[2-9]\\d{6}",
    "\\d{8}"],
    [,
    ,
    "8007\\d{4,5}|500\\d{4}",
    "\\d{7,9}"],
    [,
    ,
    "NA",
    "NA"],
    [,
    ,
    "NA",
    "NA"],
    [,
    ,
    "NA",
    "NA"],
    [,
    ,
    "NA",
    "NA"],
    "OM",
    968,
    "00",
    ,
    ,
    ,
    ,
    ,
    ,
    ,
    [[,
    "(2\\d)(\\d{6})",
    "$1 $2",
    ["2"],
    "",
    ""],
    [,
    "(9\\d{3})(\\d{4})",
    "$1 $2",
    ["9"],
    "",
    ""],
    [,
    "([58]00)(\\d{4,6})",
    "$1 $2",
    ["[58]"],
    "",
    ""]],
    ,
    [,
    ,
    "NA",
    "NA"],
    ,
    ,
    [,
    ,
    "NA",
    "NA"],
    [,
    ,
    "NA",
    "NA"]],
    PA: [,
    [,
    ,
    "[1-9]\\d{6,7}",
    "\\d{7,8}"],
    [,
    ,
    "(?:1(?:0[02-579]|19|23|3[03]|4[479]|5[57]|65|7[016-8]|8[58]|9[1-49])|2(?:[0235679]\\d|1[0-7]|4[04-9]|8[028])|3(?:0[0-7]|1[14-7]|2[0-3]|3[03]|4[0457]|5[56]|6[068]|7[078]|80|9[0-79])|4(?:3[013-59]|4\\d|7[0-689])|5(?:[01]\\d|2[0-7]|[56]0|79)|7(?:09|2[0-267]|[34]0|5[6-9]|7[0-24-7]|8[89]|99)|8(?:[34]\\d|5[0-5]|8[02])|9(?:0[78]|1[0178]|2[0378]|3[379]|40|5[0489]|6[06-9]|7[046-9]|8[36-8]|9[1-9]))\\d{4}",
    "\\d{7}"],
    [,
    ,
    "(?:161|21[89]|8(?:1[01]|7[23]))\\d{4}|6(?:[04-8]\\d|1[0-5]|2[0-4]|3[7-9]|9[0-8])\\d{5}",
    "\\d{7,8}"],
    [,
    ,
    "80[09]\\d{4}",
    "\\d{7}"],
    [,
    ,
    "(?:779|8(?:2[235]|60|7[578]|86|95)|9(?:0[0-2]|81))\\d{4}",
    "\\d{7}"],
    [,
    ,
    "NA",
    "NA"],
    [,
    ,
    "NA",
    "NA"],
    [,
    ,
    "NA",
    "NA"],
    "PA",
    507,
    "00",
    "0",
    ,
    ,
    "0",
    ,
    ,
    ,
    [[,
    "(\\d{3})(\\d{4})",
    "$1-$2",
    ["[1-57-9]"],
    "",
    ""],
    [,
    "(\\d{4})(\\d{4})",
    "$1-$2",
    ["6"],
    "",
    ""]],
    ,
    [,
    ,
    "NA",
    "NA"],
    ,
    ,
    [,
    ,
    "NA",
    "NA"],
    [,
    ,
    "NA",
    "NA"]],
    PE: [,
    [,
    ,
    "[14-9]\\d{7,8}",
    "\\d{6,9}"],
    [,
    ,
    "(?:1\\d|4[1-4]|5[1-46]|6[1-7]|7[2-46]|8[2-4])\\d{6}",
    "\\d{6,8}"],
    [,
    ,
    "9\\d{8}",
    "\\d{9}"],
    [,
    ,
    "NA",
    "NA"],
    [,
    ,
    "NA",
    "NA"],
    [,
    ,
    "NA",
    "NA"],
    [,
    ,
    "NA",
    "NA"],
    [,
    ,
    "NA",
    "NA"],
    "PE",
    51,
    "19(?:1[124]|77|90)00",
    "0",
    " Anexo ",
    ,
    "0",
    ,
    ,
    ,
    [[,
    "(1)(\\d{7})",
    "$1 $2",
    ["1"],
    "($1)",
    ""],
    [,
    "([4-8]\\d)(\\d{6})",
    "$1 $2",
    ["[4-8]"],
    "($1)",
    ""],
    [,
    "(9\\d{2})(\\d{3})(\\d{3})",
    "$1 $2 $3",
    ["9"],
    "$1",
    ""]],
    ,
    [,
    ,
    "NA",
    "NA"],
    ,
    ,
    [,
    ,
    "NA",
    "NA"],
    [,
    ,
    "NA",
    "NA"]],
    PF: [,
    [,
    ,
    "[2-9]\\d{5}",
    "\\d{6}"],
    [,
    ,
    "(?:36\\d|4(?:[02-9]\\d|1[02-9])|[5689]\\d{2})\\d{3}",
    "\\d{6}"],
    [,
    ,
    "(?:[27]\\d{3}|3[0-49]\\d{2}|411[3-6])\\d{2}",
    "\\d{6}"],
    [,
    ,
    "NA",
    "NA"],
    [,
    ,
    "NA",
    "NA"],
    [,
    ,
    "NA",
    "NA"],
    [,
    ,
    "NA",
    "NA"],
    [,
    ,
    "NA",
    "NA"],
    "PF",
    689,
    "00",
    ,
    ,
    ,
    ,
    ,
    ,
    ,
    [[,
    "(\\d{2})(\\d{2})(\\d{2})",
    "$1 $2 $3",
    ,
    "",
    ""]],
    ,
    [,
    ,
    "NA",
    "NA"],
    ,
    ,
    [,
    ,
    "(?:36|44)\\d{4}",
    "\\d{6}"],
    [,
    ,
    "NA",
    "NA"]],
    PG: [,
    [,
    ,
    "[1-9]\\d{6,7}",
    "\\d{7,8}"],
    [,
    ,
    "(?:3\\d{2}|4[257]\\d|5[34]\\d|6(?:29|4[1-9])|85[02-46-9]|9[78]\\d)\\d{4}",
    "\\d{7}"],
    [,
    ,
    "(?:68|7(?:[126]\\d|3[1-9]))\\d{5}",
    "\\d{7,8}"],
    [,
    ,
    "180\\d{4}",
    "\\d{7}"],
    [,
    ,
    "NA",
    "NA"],
    [,
    ,
    "NA",
    "NA"],
    [,
    ,
    "NA",
    "NA"],
    [,
    ,
    "275\\d{4}",
    "\\d{7}"],
    "PG",
    675,
    "00",
    ,
    ,
    ,
    ,
    ,
    ,
    ,
    [[,
    "(\\d{3})(\\d{4})",
    "$1 $2",
    ["[1-689]"],
    "",
    ""],
    [,
    "(7[1-36]\\d)(\\d{2})(\\d{3})",
    "$1 $2 $3",
    ["7[1-36]"],
    "",
    ""]],
    ,
    [,
    ,
    "NA",
    "NA"],
    ,
    ,
    [,
    ,
    "NA",
    "NA"],
    [,
    ,
    "NA",
    "NA"]],
    PH: [,
    [,
    ,
    "[2-9]\\d{7,9}|1800\\d{7,9}",
    "\\d{7,13}"],
    [,
    ,
    "(?:2|3[2-68]|4[2-9]|5[2-6]|6[2-58]|7[24578]|8[2-8])\\d{7}",
    "\\d{7,9}"],
    [,
    ,
    "9(?:0[5-9]|1[025-9]|2[0-36-9]|3[0235-9]|4[89]|7[349]|89|9[49])\\d{7}",
    "\\d{10}"],
    [,
    ,
    "1800\\d{7,9}",
    "\\d{11,13}"],
    [,
    ,
    "NA",
    "NA"],
    [,
    ,
    "NA",
    "NA"],
    [,
    ,
    "NA",
    "NA"],
    [,
    ,
    "NA",
    "NA"],
    "PH",
    63,
    "00",
    "0",
    ,
    ,
    "0",
    ,
    ,
    ,
    [[,
    "(2)(\\d{3})(\\d{4})",
    "$1 $2 $3",
    ["2"],
    "(0$1)",
    ""],
    [,
    "(\\d{4})(\\d{5})",
    "$1 $2",
    ["3(?:23|39|46)|4(?:2[3-6]|[35]9|4[26]|76)|5(?:22|44)|642|8(?:62|8[245])",
    "3(?:230|397|461)|4(?:2(?:35|[46]4|51)|396|4(?:22|63)|59[347]|76[15])|5(?:221|446)|642[23]|8(?:622|8(?:[24]2|5[13]))"],
    "(0$1)",
    ""],
    [,
    "(\\d{5})(\\d{4})",
    "$1 $2",
    ["346|4(?:27|9[35])|883",
    "3469|4(?:279|9(?:30|56))|8834"],
    "(0$1)",
    ""],
    [,
    "([3-8]\\d)(\\d{3})(\\d{4})",
    "$1 $2 $3",
    ["[3-8]"],
    "(0$1)",
    ""],
    [,
    "(9\\d{2})(\\d{3})(\\d{4})",
    "$1 $2 $3",
    ["9"],
    "0$1",
    ""],
    [,
    "(1800)(\\d{3})(\\d{4})",
    "$1 $2 $3",
    ["1"],
    "",
    ""],
    [,
    "(1800)(\\d{1,2})(\\d{3})(\\d{4})",
    "$1 $2 $3 $4",
    ["1"],
    "",
    ""]],
    ,
    [,
    ,
    "NA",
    "NA"],
    ,
    ,
    [,
    ,
    "NA",
    "NA"],
    [,
    ,
    "NA",
    "NA"]],
    PK: [,
    [,
    ,
    "1\\d{8}|[2-8]\\d{5,11}|9(?:[013-9]\\d{4,9}|2\\d(?:111\\d{6}|\\d{3,7}))",
    "\\d{6,12}"],
    [,
    ,
    "(?:21|42)[2-9]\\d{7}|(?:2[25]|4[0146-9]|5[1-35-7]|6[1-8]|7[14]|8[16]|91)[2-9]\\d{6}|(?:2(?:3[2358]|4[2-4]|9[2-8])|45[3479]|54[2-467]|60[468]|72[236]|8(?:2[2-689]|3[23578]|4[3478]|5[2356])|9(?:1|2[2-8]|3[27-9]|4[2-6]|6[3569]|9[25-8]))[2-9]\\d{5,6}|58[126]\\d{7}",
    "\\d{6,10}"],
    [,
    ,
    "3(?:0\\d|1[2-5]|2[1-3]|3[1-6]|4[2-7]|64)\\d{7}",
    "\\d{10}"],
    [,
    ,
    "800\\d{5}",
    "\\d{8}"],
    [,
    ,
    "900\\d{5}",
    "\\d{8}"],
    [,
    ,
    "NA",
    "NA"],
    [,
    ,
    "122\\d{6}",
    "\\d{9}"],
    [,
    ,
    "NA",
    "NA"],
    "PK",
    92,
    "00",
    "0",
    ,
    ,
    "0",
    ,
    ,
    ,
    [[,
    "(\\d{2})(111)(\\d{3})(\\d{3})",
    "$1 $2 $3 $4",
    ["(?:2[125]|4[0-246-9]|5[1-35-7]|6[1-8]|7[14]|8[16]|91)1",
    "(?:2[125]|4[0-246-9]|5[1-35-7]|6[1-8]|7[14]|8[16]|91)11",
    "(?:2[125]|4[0-246-9]|5[1-35-7]|6[1-8]|7[14]|8[16]|91)111"],
    "(0$1)",
    ""],
    [,
    "(\\d{3})(111)(\\d{3})(\\d{3})",
    "$1 $2 $3 $4",
    ["2[349]|45|54|60|72|8[2-5]|9[2-9]",
    "(?:2[349]|45|54|60|72|8[2-5]|9[2-9])\\d1",
    "(?:2[349]|45|54|60|72|8[2-5]|9[2-9])\\d11",
    "(?:2[349]|45|54|60|72|8[2-5]|9[2-9])\\d111"],
    "(0$1)",
    ""],
    [,
    "(\\d{2})(\\d{7,8})",
    "$1 $2",
    ["(?:2[125]|4[0-246-9]|5[1-35-7]|6[1-8]|7[14]|8[16]|91)[2-9]"],
    "(0$1)",
    ""],
    [,
    "(\\d{3})(\\d{6,7})",
    "$1 $2",
    ["2[349]|45|54|60|72|8[2-5]|9[2-9]",
    "(?:2[349]|45|54|60|72|8[2-5]|9[2-9])\\d[2-9]"],
    "(0$1)",
    ""],
    [,
    "(3\\d{2})(\\d{7})",
    "$1 $2",
    ["3"],
    "0$1",
    ""],
    [,
    "([15]\\d{3})(\\d{5,6})",
    "$1 $2",
    ["58[12]|1"],
    "(0$1)",
    ""],
    [,
    "(586\\d{2})(\\d{5})",
    "$1 $2",
    ["586"],
    "(0$1)",
    ""],
    [,
    "([89]00)(\\d{3})(\\d{2})",
    "$1 $2 $3",
    ["[89]00"],
    "0$1",
    ""]],
    ,
    [,
    ,
    "NA",
    "NA"],
    ,
    ,
    [,
    ,
    "NA",
    "NA"],
    [,
    ,
    "(?:2(?:[125]|3[2358]|4[2-4]|9[2-8])|4(?:[0-246-9]|5[3479])|5(?:[1-35-7]|4[2-467])|6(?:[1-8]|0[468])|7(?:[14]|2[236])|8(?:[16]|2[2-689]|3[23578]|4[3478]|5[2356])|9(?:1|22|3[27-9]|4[2-6]|6[3569]|9[2-7]))111\\d{6}",
    "\\d{11,12}"]],
    PL: [,
    [,
    ,
    "[1-9]\\d{8}",
    "\\d{9}"],
    [,
    ,
    "(?:1[2-8]|2[2-59]|3[2-4]|4[1-468]|5[24-689]|6[1-3578]|7[14-7]|8[1-79]|9[145])\\d{7}",
    "\\d{9}"],
    [,
    ,
    "(?:5[013]|6[069]|7[289]|88)\\d{7}",
    "\\d{9}"],
    [,
    ,
    "800\\d{6}",
    "\\d{9}"],
    [,
    ,
    "70\\d{7}",
    "\\d{9}"],
    [,
    ,
    "801\\d{6}",
    "\\d{9}"],
    [,
    ,
    "NA",
    "NA"],
    [,
    ,
    "39\\d{7}",
    "\\d{9}"],
    "PL",
    48,
    "00",
    ,
    ,
    ,
    ,
    ,
    ,
    ,
    [[,
    "(\\d{2})(\\d{3})(\\d{2})(\\d{2})",
    "$1 $2 $3 $4",
    ["[124]|3[2-4]|5[24-689]|6[1-3578]|7[14-7]|8[1-79]|9[145]"],
    "",
    ""],
    [,
    "(\\d{3})(\\d{3})(\\d{3})",
    "$1 $2 $3",
    ["39|5[013]|6[069]|7[0289]|8[08]"],
    "",
    ""]],
    ,
    [,
    ,
    "NA",
    "NA"],
    ,
    ,
    [,
    ,
    "NA",
    "NA"],
    [,
    ,
    "NA",
    "NA"]],
    PM: [,
    [],
    [],
    [],
    [,
    ,
    "NA",
    "NA"],
    [,
    ,
    "NA",
    "NA"],
    [,
    ,
    "NA",
    "NA"],
    [,
    ,
    "NA",
    "NA"],
    [,
    ,
    "NA",
    "NA"],
    "PM",
    508,
    "00",
    "0",
    ,
    ,
    "0",
    ,
    ,
    1,
    ,
    ,
    [,
    ,
    "NA",
    "NA"],
    ,
    ,
    [,
    ,
    "NA",
    "NA"],
    [,
    ,
    "NA",
    "NA"]],
    PR: [,
    [,
    ,
    "[5789]\\d{9}",
    "\\d{7}(?:\\d{3})?"],
    [,
    ,
    "(?:787|939)[2-9]\\d{6}",
    "\\d{7}(?:\\d{3})?"],
    [,
    ,
    "(?:787|939)[2-9]\\d{6}",
    "\\d{7}(?:\\d{3})?"],
    [,
    ,
    "8(?:00|55|66|77|88)[2-9]\\d{6}",
    "\\d{10}"],
    [,
    ,
    "900[2-9]\\d{6}",
    "\\d{10}"],
    [,
    ,
    "NA",
    "NA"],
    [,
    ,
    "5(?:00|33|44)[2-9]\\d{6}",
    "\\d{10}"],
    [,
    ,
    "NA",
    "NA"],
    "PR",
    1,
    "011",
    "1",
    ,
    ,
    "1",
    ,
    ,
    1,
    ,
    ,
    [,
    ,
    "NA",
    "NA"],
    ,
    "787|939",
    [,
    ,
    "NA",
    "NA"],
    [,
    ,
    "NA",
    "NA"]],
    PS: [,
    [,
    ,
    "[24589]\\d{7,8}|1(?:[78]\\d{8}|[49]\\d{2,3})",
    "\\d{4,10}"],
    [,
    ,
    "(?:22[234789]|42[45]|82[01458]|92[369])\\d{5}",
    "\\d{7,8}"],
    [,
    ,
    "5[69]\\d{7}",
    "\\d{9}"],
    [,
    ,
    "1800\\d{6}",
    "\\d{10}"],
    [,
    ,
    "1(?:4|9\\d)\\d{2}",
    "\\d{4,5}"],
    [,
    ,
    "1700\\d{6}",
    "\\d{10}"],
    [,
    ,
    "NA",
    "NA"],
    [,
    ,
    "NA",
    "NA"],
    "PS",
    970,
    "00",
    "0",
    ,
    ,
    "0",
    ,
    ,
    ,
    [[,
    "([2489])(2\\d{2})(\\d{4})",
    "$1 $2 $3",
    ["[2489]"],
    "0$1",
    ""],
    [,
    "(5[69]\\d)(\\d{3})(\\d{3})",
    "$1 $2 $3",
    ["5"],
    "0$1",
    ""],
    [,
    "(1[78]00)(\\d{3})(\\d{3})",
    "$1 $2 $3",
    ["1[78]"],
    "$1",
    ""]],
    ,
    [,
    ,
    "NA",
    "NA"],
    ,
    ,
    [,
    ,
    "NA",
    "NA"],
    [,
    ,
    "NA",
    "NA"]],
    PT: [,
    [,
    ,
    "[2-46-9]\\d{8}",
    "\\d{9}"],
    [,
    ,
    "2(?:[12]\\d|[35][1-689]|4[1-59]|6[1-35689]|7[1-9]|8[1-69]|9[1256])\\d{6}",
    "\\d{9}"],
    [,
    ,
    "9(?:[136]\\d{2}|2[124-79]\\d|4(?:80|9\\d))\\d{5}",
    "\\d{9}"],
    [,
    ,
    "4\\d{8}|80[02]\\d{6}",
    "\\d{9}"],
    [,
    ,
    "71\\d{7}",
    "\\d{9}"],
    [,
    ,
    "808\\d{6}",
    "\\d{9}"],
    [,
    ,
    "NA",
    "NA"],
    [,
    ,
    "30\\d{7}",
    "\\d{9}"],
    "PT",
    351,
    "00",
    ,
    ,
    ,
    ,
    ,
    ,
    ,
    [[,
    "([2-46-9]\\d{2})(\\d{3})(\\d{3})",
    "$1 $2 $3",
    ,
    "",
    ""]],
    ,
    [,
    ,
    "NA",
    "NA"],
    ,
    ,
    [,
    ,
    "NA",
    "NA"],
    [,
    ,
    "NA",
    "NA"]],
    PW: [,
    [,
    ,
    "[2-8]\\d{6}",
    "\\d{7}"],
    [,
    ,
    "2552255|(?:277|345|488|5(?:35|44|87)|6(?:22|54|79)|7(?:33|47)|8(?:24|55|76))\\d{4}",
    "\\d{7}"],
    [,
    ,
    "(?:6[234689]0|77[45789])\\d{4}",
    "\\d{7}"],
    [,
    ,
    "NA",
    "NA"],
    [,
    ,
    "NA",
    "NA"],
    [,
    ,
    "NA",
    "NA"],
    [,
    ,
    "NA",
    "NA"],
    [,
    ,
    "NA",
    "NA"],
    "PW",
    680,
    "01[12]",
    ,
    ,
    ,
    ,
    ,
    ,
    ,
    [[,
    "(\\d{3})(\\d{4})",
    "$1 $2",
    ,
    "",
    ""]],
    ,
    [,
    ,
    "NA",
    "NA"],
    ,
    ,
    [,
    ,
    "NA",
    "NA"],
    [,
    ,
    "NA",
    "NA"]],
    PY: [,
    [,
    ,
    "5[0-5]\\d{4,7}|[2-46-9]\\d{5,8}",
    "\\d{5,9}"],
    [,
    ,
    "(?:[26]1|3[289]|4[124678]|7[123]|8[1236])\\d{5,7}|(?:2(?:2[4568]|7[15]|9[1-5])|3(?:18|3[167]|4[2357]|51)|4(?:18|2[45]|3[12]|5[13]|64|71|9[1-47])|5(?:[1-4]\\d|5[0234])|6(?:3[1-3]|44|7[1-4678])|7(?:17|4[0-4]|6[1-578]|75|8[0-8])|858)\\d{5,6}",
    "\\d{5,9}"],
    [,
    ,
    "9(?:61|7[12356]|8[1-5]|9[1235])\\d{6}",
    "\\d{9}"],
    [,
    ,
    "NA",
    "NA"],
    [,
    ,
    "NA",
    "NA"],
    [,
    ,
    "NA",
    "NA"],
    [,
    ,
    "NA",
    "NA"],
    [,
    ,
    "8700[0-4]\\d{4}",
    "\\d{9}"],
    "PY",
    595,
    "00",
    "0",
    ,
    ,
    "0",
    ,
    ,
    ,
    [[,
    "(\\d{2})(\\d{5,7})",
    "$1 $2",
    ["(?:[26]1|3[289]|4[124678]|7[123]|8[1236])"],
    "($1)",
    ""],
    [,
    "(\\d{3})(\\d{3,6})",
    "$1 $2",
    ["[2-9]0"],
    "0$1",
    ""],
    [,
    "(\\d{3})(\\d{6})",
    "$1 $2",
    ["9[1-9]"],
    "0$1",
    ""],
    [,
    "(\\d{2})(\\d{3})(\\d{4})",
    "$1 $2 $3",
    ["8700"],
    "",
    ""],
    [,
    "(\\d{3})(\\d{4,6})",
    "$1 $2",
    ["[2-8][1-9]"],
    "($1)",
    ""]],
    ,
    [,
    ,
    "NA",
    "NA"],
    ,
    ,
    [,
    ,
    "NA",
    "NA"],
    [,
    ,
    "[2-9]0\\d{4,7}",
    "\\d{5,9}"]],
    QA: [,
    [,
    ,
    "[3-8]\\d{6,7}",
    "\\d{7,8}"],
    [,
    ,
    "44\\d{6}",
    "\\d{7,8}"],
    [,
    ,
    "(?:33|55|66|77)\\d{6}",
    "\\d{7,8}"],
    [,
    ,
    "800\\d{4}",
    "\\d{7,8}"],
    [,
    ,
    "NA",
    "NA"],
    [,
    ,
    "NA",
    "NA"],
    [,
    ,
    "NA",
    "NA"],
    [,
    ,
    "NA",
    "NA"],
    "QA",
    974,
    "00",
    ,
    ,
    ,
    ,
    ,
    ,
    ,
    [[,
    "(8\\d{2})(\\d{4})",
    "$1 $2",
    ["8"],
    "",
    ""],
    [,
    "([3-7]\\d{3})(\\d{4})",
    "$1 $2",
    ["[3-7]"],
    "",
    ""]],
    ,
    [,
    ,
    "NA",
    "NA"],
    ,
    ,
    [,
    ,
    "NA",
    "NA"],
    [,
    ,
    "NA",
    "NA"]],
    RE: [,
    [,
    ,
    "[268]\\d{8}",
    "\\d{9}"],
    [,
    ,
    "262\\d{6}",
    "\\d{9}"],
    [,
    ,
    "6(?:9[23]|47)\\d{6}",
    "\\d{9}"],
    [,
    ,
    "80\\d{7}",
    "\\d{9}"],
    [,
    ,
    "89[1-37-9]\\d{6}",
    "\\d{9}"],
    [,
    ,
    "8(?:1[019]|2[0156]|84|90)\\d{6}",
    "\\d{9}"],
    [,
    ,
    "NA",
    "NA"],
    [,
    ,
    "NA",
    "NA"],
    "RE",
    262,
    "00",
    "0",
    ,
    ,
    "0",
    ,
    ,
    ,
    [[,
    "([268]\\d{2})(\\d{2})(\\d{2})(\\d{2})",
    "$1 $2 $3 $4",
    ,
    "0$1",
    ""]],
    ,
    [,
    ,
    "NA",
    "NA"],
    1,
    "262|6[49]|8",
    [,
    ,
    "NA",
    "NA"],
    [,
    ,
    "NA",
    "NA"]],
    RO: [,
    [,
    ,
    "[237-9]\\d{8}",
    "\\d{9}"],
    [,
    ,
    "[23][13-6]\\d{7}",
    "\\d{9}"],
    [,
    ,
    "7[1-8]\\d{7}",
    "\\d{9}"],
    [,
    ,
    "800\\d{6}",
    "\\d{9}"],
    [,
    ,
    "90[036]\\d{6}",
    "\\d{9}"],
    [,
    ,
    "801\\d{6}",
    "\\d{9}"],
    [,
    ,
    "802\\d{6}",
    "\\d{9}"],
    [,
    ,
    "NA",
    "NA"],
    "RO",
    40,
    "00",
    "0",
    " int ",
    ,
    "0",
    ,
    ,
    ,
    [[,
    "([237]\\d)(\\d{3})(\\d{4})",
    "$1 $2 $3",
    ["[23]1|7"],
    "0$1",
    ""],
    [,
    "(\\d{3})(\\d{3})(\\d{3})",
    "$1 $2 $3",
    ["[23][02-9]|[89]"],
    "0$1",
    ""]],
    ,
    [,
    ,
    "NA",
    "NA"],
    ,
    ,
    [,
    ,
    "NA",
    "NA"],
    [,
    ,
    "NA",
    "NA"]],
    RS: [,
    [,
    ,
    "[1-46-9]\\d{4,11}",
    "\\d{5,12}"],
    [,
    ,
    "[1-3]\\d{6,9}",
    "\\d{5,10}"],
    [,
    ,
    "6[0-689]\\d{3,10}",
    "\\d{5,12}"],
    [,
    ,
    "800\\d{3,6}",
    "\\d{6,9}"],
    [,
    ,
    "(?:9[0-2]|42)\\d{4,7}",
    "\\d{6,9}"],
    [,
    ,
    "NA",
    "NA"],
    [,
    ,
    "NA",
    "NA"],
    [,
    ,
    "NA",
    "NA"],
    "RS",
    381,
    "00",
    "0",
    ,
    ,
    "0",
    ,
    ,
    ,
    [[,
    "([23]\\d{2})(\\d{4,7})",
    "$1 $2",
    ["(?:2[389]|39)0"],
    "0$1",
    ""],
    [,
    "([1-4]\\d)(\\d{4,8})",
    "$1 $2",
    ["1|2(?:[0-24-7]|[389][1-9])|3(?:[0-8]|9[1-9])|42"],
    "0$1",
    ""],
    [,
    "(6[0-689])(\\d{3,10})",
    "$1 $2",
    ["6"],
    "0$1",
    ""],
    [,
    "([89]\\d{2})(\\d{3,6})",
    "$1 $2",
    ["[89]"],
    "0$1",
    ""]],
    ,
    [,
    ,
    "NA",
    "NA"],
    ,
    ,
    [,
    ,
    "NA",
    "NA"],
    [,
    ,
    "NA",
    "NA"]],
    RU: [,
    [,
    ,
    "[3489]\\d{9}",
    "\\d{10}"],
    [,
    ,
    "(?:3(?:0[12]|4[1-35-79]|5[1-3]|8[1-58]|9[0145])|4(?:01|1[1356]|2[13467]|7[1-5]|8[1-7]|9[1-689])|8(?:1[1-8]|2[01]|3[13-6]|4[0-8]|5[15]|6[1-35-7]|7[1-37-9]))\\d{7}",
    "\\d{10}"],
    [,
    ,
    "9\\d{9}",
    "\\d{10}"],
    [,
    ,
    "80[04]\\d{7}",
    "\\d{10}"],
    [,
    ,
    "80[39]\\d{7}",
    "\\d{10}"],
    [,
    ,
    "NA",
    "NA"],
    [,
    ,
    "NA",
    "NA"],
    [,
    ,
    "NA",
    "NA"],
    "RU",
    7,
    "8~10",
    "8",
    ,
    ,
    "8",
    ,
    ,
    ,
    [[,
    "([3489]\\d{2})(\\d{3})(\\d{2})(\\d{2})",
    "$1 $2-$3-$4",
    ["[34689]"],
    "8 ($1)",
    ""],
    [,
    "(7\\d{2})(\\d{3})(\\d{4})",
    "$1 $2 $3",
    ["7"],
    "8 ($1)",
    ""]],
    ,
    [,
    ,
    "NA",
    "NA"],
    1,
    ,
    [,
    ,
    "NA",
    "NA"],
    [,
    ,
    "NA",
    "NA"]],
    RW: [,
    [,
    ,
    "[27-9]\\d{8}",
    "\\d{9}"],
    [,
    ,
    "25\\d{7}",
    "\\d{9}"],
    [,
    ,
    "7[258]\\d{7}",
    "\\d{9}"],
    [,
    ,
    "800\\d{6}",
    "\\d{9}"],
    [,
    ,
    "900\\d{6}",
    "\\d{9}"],
    [,
    ,
    "NA",
    "NA"],
    [,
    ,
    "NA",
    "NA"],
    [,
    ,
    "NA",
    "NA"],
    "RW",
    250,
    "000",
    "0",
    ,
    ,
    "0",
    ,
    ,
    ,
    [[,
    "(25\\d)(\\d{3})(\\d{3})",
    "$1 $2 $3",
    ["2"],
    "$1",
    ""],
    [,
    "([7-9]\\d{2})(\\d{3})(\\d{3})",
    "$1 $2 $3",
    ["[7-9]"],
    "0$1",
    ""]],
    ,
    [,
    ,
    "NA",
    "NA"],
    ,
    ,
    [,
    ,
    "NA",
    "NA"],
    [,
    ,
    "NA",
    "NA"]],
    SA: [,
    [,
    ,
    "[1-9]\\d{7,10}",
    "\\d{7,11}"],
    [,
    ,
    "(?:1[24-7]|2[24-8]|3[35-8]|4[34-68]|6[2-5]|7[235-7])\\d{6}",
    "\\d{7,8}"],
    [,
    ,
    "(?:5[013-69]\\d|8111)\\d{6}",
    "\\d{9,10}"],
    [,
    ,
    "800\\d{7}",
    "\\d{10}"],
    [,
    ,
    "9200\\d{7}",
    "\\d{11}"],
    [,
    ,
    "NA",
    "NA"],
    [,
    ,
    "NA",
    "NA"],
    [,
    ,
    "NA",
    "NA"],
    "SA",
    966,
    "00",
    "0",
    ,
    ,
    "0",
    ,
    ,
    ,
    [[,
    "([1-467])(\\d{3})(\\d{4})",
    "$1 $2 $3",
    ["[1-467]"],
    "0$1",
    ""],
    [,
    "(9200)(\\d{3})(\\d{4})",
    "$1 $2 $3",
    ["9"],
    "0$1",
    ""],
    [,
    "(5\\d)(\\d{3})(\\d{4})",
    "$1 $2 $3",
    ["5"],
    "0$1",
    ""],
    [,
    "(800)(\\d{3})(\\d{4})",
    "$1 $2 $3",
    ["80"],
    "0$1",
    ""],
    [,
    "(8111)(\\d{3})(\\d{3})",
    "$1 $2 $3",
    ["81"],
    "0$1",
    ""]],
    ,
    [,
    ,
    "NA",
    "NA"],
    ,
    ,
    [,
    ,
    "NA",
    "NA"],
    [,
    ,
    "NA",
    "NA"]],
    SB: [,
    [,
    ,
    "[1-8]\\d{4,6}",
    "\\d{5,7}"],
    [,
    ,
    "(?:1[4-79]|[23]\\d|4[01]|5[03]|6[0-37])\\d{3}",
    "\\d{5}"],
    [,
    ,
    "7(?:4\\d|5[025-7])\\d{4}|8[48]\\d{5}",
    "\\d{7}"],
    [,
    ,
    "1[38]\\d{3}",
    "\\d{5}"],
    [,
    ,
    "NA",
    "NA"],
    [,
    ,
    "NA",
    "NA"],
    [,
    ,
    "NA",
    "NA"],
    [,
    ,
    "5[12]\\d{3}",
    "\\d{5}"],
    "SB",
    677,
    "0[01]",
    ,
    ,
    ,
    ,
    ,
    ,
    ,
    ,
    ,
    [,
    ,
    "NA",
    "NA"],
    ,
    ,
    [,
    ,
    "NA",
    "NA"],
    [,
    ,
    "NA",
    "NA"]],
    SC: [,
    [,
    ,
    "[2-8]\\d{5,6}",
    "\\d{6,7}"],
    [,
    ,
    "(?:2?(?:55[0-5]|78[013])|4?(?:2(?:1[78]|2[14-69]|3[2-4]|4[1-36-8]|6[167]|[89]\\d)|3(?:0[34]|2[1-6]|4[4-6]|55|6[016]|7\\d|8[0-589]|9[0-5])|6(?:0[0-256]|1[0-478]|2[145]|3[02-4]|4[124]|6[015]|7\\d|8[1-3])))\\d{3}",
    "\\d{6,7}"],
    [,
    ,
    "2?(?:5(?:[0-46-9]\\d|5[6-9])|7(?:[0-79]\\d|8[24-9]))\\d{3}",
    "\\d{6,7}"],
    [,
    ,
    "8000\\d{2}",
    "\\d{6}"],
    [,
    ,
    "NA",
    "NA"],
    [,
    ,
    "NA",
    "NA"],
    [,
    ,
    "NA",
    "NA"],
    [,
    ,
    "(?:44[1-3]|647)\\d{4}",
    "\\d{7}"],
    "SC",
    248,
    "0[0-2]",
    ,
    ,
    ,
    ,
    ,
    "00",
    ,
    [[,
    "(\\d{3})(\\d{3})",
    "$1 $2",
    ["[3578]|2[1-4689]|6(?:[0-35-9]|4[0-689])"],
    "",
    ""],
    [,
    "(\\d)(\\d{3})(\\d{3})",
    "$1 $2 $3",
    ["2[57]|4[2-46]|647"],
    "",
    ""]],
    ,
    [,
    ,
    "NA",
    "NA"],
    ,
    ,
    [,
    ,
    "NA",
    "NA"],
    [,
    ,
    "NA",
    "NA"]],
    SD: [,
    [,
    ,
    "[19]\\d{8}",
    "\\d{9}"],
    [,
    ,
    "1(?:[25]\\d|8[3567])\\d{6}",
    "\\d{9}"],
    [,
    ,
    "9[1259]\\d{7}",
    "\\d{9}"],
    [,
    ,
    "NA",
    "NA"],
    [,
    ,
    "NA",
    "NA"],
    [,
    ,
    "NA",
    "NA"],
    [,
    ,
    "NA",
    "NA"],
    [,
    ,
    "NA",
    "NA"],
    "SD",
    249,
    "00",
    "0",
    ,
    ,
    "0",
    ,
    ,
    ,
    [[,
    "(\\d{2})(\\d{3})(\\d{4})",
    "$1 $2 $3",
    ,
    "0$1",
    ""]],
    ,
    [,
    ,
    "NA",
    "NA"],
    ,
    ,
    [,
    ,
    "NA",
    "NA"],
    [,
    ,
    "NA",
    "NA"]],
    SE: [,
    [,
    ,
    "\\d{7,10}",
    "\\d{5,10}"],
    [,
    ,
    "1(?:0[1-8]\\d{6}|[136]\\d{5,7}|(?:2[0-35]|4[0-4]|5[0-25-9]|7[13-6]|[89]\\d)\\d{5,6})|2(?:[136]\\d{5,7}|(?:2[0-7]|4[0136-8]|5[0-38]|7[018]|8[01]|9[0-57])\\d{5,6})|3(?:[356]\\d{5,7}|(?:0[0-4]|1\\d|2[0-25]|4[056]|7[0-2]|8[0-3]|9[023])\\d{5,6})|4(?:[0246]\\d{5,7}|(?:1[01-8]|3[0135]|5[14-79]|7[0-246-9]|8[0156]|9[0-689])\\d{5,6})|5(?:0[0-6]|1[0-5]|2[0-68]|3[0-4]|4\\d|5[0-5]|6[03-5]|7[013]|8[0-79]|9[01])\\d{5,6}|6(?:[03]\\d{5,7}|(?:1[1-3]|2[0-4]|4[02-57]|5[0-37]|6[0-3]|7[0-2]|8[0247]|9[0-356])\\d{5,6})|8\\d{6,8}|9(?:0\\d{5,7}|(?:1[0-68]|2\\d|3[02-59]|4[0-4]|5[0-4]|6[01]|7[0135-8]|8[01])\\d{5,6})",
    "\\d{5,9}"],
    [,
    ,
    "7[02-46]\\d{7}",
    "\\d{9}"],
    [,
    ,
    "20\\d{4,7}",
    "\\d{6,9}"],
    [,
    ,
    "9(?:00|39|44)\\d{7}",
    "\\d{10}"],
    [,
    ,
    "77\\d{7}",
    "\\d{9}"],
    [,
    ,
    "NA",
    "NA"],
    [,
    ,
    "NA",
    "NA"],
    "SE",
    46,
    "00",
    "0",
    ,
    ,
    "0",
    ,
    ,
    ,
    [[,
    "(8)(\\d{2,3})(\\d{2,3})(\\d{2})",
    "$1-$2 $3 $4",
    ["8"],
    "0$1",
    ""],
    [,
    "([1-69]\\d)(\\d{2,3})(\\d{2})(\\d{2})",
    "$1-$2 $3 $4",
    ["1[013689]|2[0136]|3[1356]|4[0246]|54|6[03]|90"],
    "0$1",
    ""],
    [,
    "([1-69]\\d)(\\d{3})(\\d{2})",
    "$1-$2 $3",
    ["1[13689]|2[136]|3[1356]|4[0246]|54|6[03]|90"],
    "0$1",
    ""],
    [,
    "(\\d{3})(\\d{2})(\\d{2})(\\d{2})",
    "$1-$2 $3 $4",
    ["1[2457]|2[2457-9]|3[0247-9]|4[1357-9]|5[0-35-9]|6[124-9]|9(?:[125-8]|3[0-5]|4[0-3])"],
    "0$1",
    ""],
    [,
    "(\\d{3})(\\d{2,3})(\\d{2})",
    "$1-$2 $3",
    ["1[2457]|2[2457-9]|3[0247-9]|4[1357-9]|5[0-35-9]|6[124-9]|9(?:[125-8]|3[0-5]|4[0-3])"],
    "0$1",
    ""],
    [,
    "(7[02-467])(\\d{3})(\\d{2})(\\d{2})",
    "$1-$2 $3 $4",
    ["7[02-467]"],
    "0$1",
    ""],
    [,
    "(20)(\\d{2,3})(\\d{2})",
    "$1-$2 $3",
    ["20"],
    "0$1",
    ""],
    [,
    "(9[034]\\d)(\\d{2})(\\d{2})(\\d{3})",
    "$1-$2 $3 $4",
    ["9[034]"],
    "0$1",
    ""]],
    [[,
    "(8)(\\d{2,3})(\\d{2,3})(\\d{2})",
    "$1 $2 $3 $4",
    ["8"]],
    [,
    "([1-69]\\d)(\\d{2,3})(\\d{2})(\\d{2})",
    "$1 $2 $3 $4",
    ["1[013689]|2[0136]|3[1356]|4[0246]|54|6[03]|90"]],
    [,
    "([1-69]\\d)(\\d{3})(\\d{2})",
    "$1 $2 $3",
    ["1[13689]|2[136]|3[1356]|4[0246]|54|6[03]|90"]],
    [,
    "(\\d{3})(\\d{2})(\\d{2})(\\d{2})",
    "$1 $2 $3 $4",
    ["1[2457]|2[2457-9]|3[0247-9]|4[1357-9]|5[0-35-9]|6[124-9]|9(?:[125-8]|3[0-5]|4[0-3])"]],
    [,
    "(\\d{3})(\\d{2,3})(\\d{2})",
    "$1 $2 $3",
    ["1[2457]|2[2457-9]|3[0247-9]|4[1357-9]|5[0-35-9]|6[124-9]|9(?:[125-8]|3[0-5]|4[0-3])"]],
    [,
    "(7[02-467])(\\d{3})(\\d{2})(\\d{2})",
    "$1 $2 $3 $4",
    ["7[02-467]"]],
    [,
    "(20)(\\d{2,3})(\\d{2})",
    "$1 $2 $3",
    ["20"]],
    [,
    "(9[034]\\d)(\\d{2})(\\d{2})(\\d{3})",
    "$1 $2 $3 $4",
    ["9[034]"]]],
    [,
    ,
    "NA",
    "NA"],
    ,
    ,
    [,
    ,
    "NA",
    "NA"],
    [,
    ,
    "NA",
    "NA"]],
    SG: [,
    [,
    ,
    "[36]\\d{7}|[17-9]\\d{7,10}",
    "\\d{8,11}"],
    [,
    ,
    "6[1-8]\\d{6}",
    "\\d{8}"],
    [,
    ,
    "(?:8[1-5]|9[0-8])\\d{6}",
    "\\d{8}"],
    [,
    ,
    "1?800\\d{7}",
    "\\d{10,11}"],
    [,
    ,
    "1900\\d{7}",
    "\\d{11}"],
    [,
    ,
    "NA",
    "NA"],
    [,
    ,
    "NA",
    "NA"],
    [,
    ,
    "3[0-2]\\d{6}",
    "\\d{8}"],
    "SG",
    65,
    "0[0-3][0-9]",
    ,
    ,
    ,
    ,
    ,
    ,
    ,
    [[,
    "([3689]\\d{3})(\\d{4})",
    "$1 $2",
    ["[369]|8[1-9]"],
    "",
    ""],
    [,
    "(1[89]00)(\\d{3})(\\d{4})",
    "$1 $2 $3",
    ["1[89]"],
    "",
    ""],
    [,
    "(7000)(\\d{4})(\\d{3})",
    "$1 $2 $3",
    ["70"],
    "",
    ""],
    [,
    "(800)(\\d{3})(\\d{4})",
    "$1 $2 $3",
    ["80"],
    "",
    ""]],
    ,
    [,
    ,
    "NA",
    "NA"],
    ,
    ,
    [,
    ,
    "NA",
    "NA"],
    [,
    ,
    "7000\\d{7}",
    "\\d{11}"]],
    SH: [,
    [,
    ,
    "[2-9]\\d{3}",
    "\\d{4}"],
    [,
    ,
    "(?:[2-468]\\d|7[01])\\d{2}",
    "\\d{4}"],
    [,
    ,
    "NA",
    "NA"],
    [,
    ,
    "NA",
    "NA"],
    [,
    ,
    "(?:[59]\\d|7[2-9])\\d{2}",
    "\\d{4}"],
    [,
    ,
    "NA",
    "NA"],
    [,
    ,
    "NA",
    "NA"],
    [,
    ,
    "NA",
    "NA"],
    "SH",
    290,
    "00",
    ,
    ,
    ,
    ,
    ,
    ,
    ,
    ,
    ,
    [,
    ,
    "NA",
    "NA"],
    ,
    ,
    [,
    ,
    "NA",
    "NA"],
    [,
    ,
    "NA",
    "NA"]],
    SI: [,
    [,
    ,
    "[1-7]\\d{6,7}|[89]\\d{4,7}",
    "\\d{5,8}"],
    [,
    ,
    "(?:1\\d|2[2-8]|3[4-8]|4[24-8]|[57][3-8])\\d{6}",
    "\\d{7,8}"],
    [,
    ,
    "(?:[37][01]|4[019]|51|64)\\d{6}",
    "\\d{8}"],
    [,
    ,
    "80\\d{4,6}",
    "\\d{6,8}"],
    [,
    ,
    "90\\d{4,6}|89[1-3]\\d{2,5}",
    "\\d{5,8}"],
    [,
    ,
    "NA",
    "NA"],
    [,
    ,
    "NA",
    "NA"],
    [,
    ,
    "(?:59|8[1-3])\\d{6}",
    "\\d{8}"],
    "SI",
    386,
    "00",
    "0",
    ,
    ,
    "0",
    ,
    ,
    ,
    [[,
    "(\\d)(\\d{3})(\\d{2})(\\d{2})",
    "$1 $2 $3 $4",
    ["[12]|3[4-8]|4[24-8]|5[3-8]|7[3-8]"],
    "(0$1)",
    ""],
    [,
    "([3-7]\\d)(\\d{3})(\\d{3})",
    "$1 $2 $3",
    ["[37][01]|4[019]|51|64"],
    "0$1",
    ""],
    [,
    "([89][09])(\\d{3,6})",
    "$1 $2",
    ["[89][09]"],
    "0$1",
    ""],
    [,
    "([58]\\d{2})(\\d{5})",
    "$1 $2",
    ["59|8[1-3]"],
    "0$1",
    ""]],
    ,
    [,
    ,
    "NA",
    "NA"],
    ,
    ,
    [,
    ,
    "NA",
    "NA"],
    [,
    ,
    "NA",
    "NA"]],
    SJ: [,
    [,
    ,
    "0\\d{4}|[4789]\\d{7}",
    "\\d{5}(?:\\d{3})?"],
    [,
    ,
    "79\\d{6}",
    "\\d{8}"],
    [,
    ,
    "(?:4[015-8]|9\\d)\\d{6}",
    "\\d{8}"],
    [,
    ,
    "80[01]\\d{5}",
    "\\d{8}"],
    [,
    ,
    "82[09]\\d{5}",
    "\\d{8}"],
    [,
    ,
    "810(?:0[0-6]|[2-8]\\d)\\d{3}",
    "\\d{8}"],
    [,
    ,
    "880\\d{5}",
    "\\d{8}"],
    [,
    ,
    "NA",
    "NA"],
    "SJ",
    47,
    "00",
    ,
    ,
    ,
    ,
    ,
    ,
    ,
    ,
    ,
    [,
    ,
    "NA",
    "NA"],
    ,
    ,
    [,
    ,
    "NA",
    "NA"],
    [,
    ,
    "0\\d{4}|81(?:0(?:0[7-9]|1\\d)|5\\d{2})\\d{3}",
    "\\d{5}(?:\\d{3})?"],
    1],
    SK: [,
    [,
    ,
    "[2-689]\\d{8}",
    "\\d{9}"],
    [,
    ,
    "[2-5]\\d{8}",
    "\\d{9}"],
    [,
    ,
    "9(?:0[1-8]|1[0-24-9]|4[0489])\\d{6}",
    "\\d{9}"],
    [,
    ,
    "800\\d{6}",
    "\\d{9}"],
    [,
    ,
    "9(?:[78]\\d{7}|00\\d{6})",
    "\\d{9}"],
    [,
    ,
    "8[5-9]\\d{7}",
    "\\d{9}"],
    [,
    ,
    "NA",
    "NA"],
    [,
    ,
    "6(?:5[0-4]|9[0-6])\\d{6}",
    "\\d{9}"],
    "SK",
    421,
    "00",
    "0",
    ,
    ,
    "0",
    ,
    ,
    ,
    [[,
    "(2)(\\d{3})(\\d{3})(\\d{2})",
    "$1/$2 $3 $4",
    ["2"],
    "0$1",
    ""],
    [,
    "([3-5]\\d)(\\d{3})(\\d{2})(\\d{2})",
    "$1/$2 $3 $4",
    ["[3-5]"],
    "0$1",
    ""],
    [,
    "([689]\\d{2})(\\d{3})(\\d{3})",
    "$1 $2 $3",
    ["[689]"],
    "0$1",
    ""]],
    ,
    [,
    ,
    "NA",
    "NA"],
    ,
    ,
    [,
    ,
    "NA",
    "NA"],
    [,
    ,
    "NA",
    "NA"]],
    SL: [,
    [,
    ,
    "[2-578]\\d{7}",
    "\\d{6,8}"],
    [,
    ,
    "[235]2[2-4][2-9]\\d{4}",
    "\\d{6,8}"],
    [,
    ,
    "(?:25|3[03]|44|5[056]|7[6-8]|88)[1-9]\\d{5}",
    "\\d{6,8}"],
    [,
    ,
    "NA",
    "NA"],
    [,
    ,
    "NA",
    "NA"],
    [,
    ,
    "NA",
    "NA"],
    [,
    ,
    "NA",
    "NA"],
    [,
    ,
    "NA",
    "NA"],
    "SL",
    232,
    "00",
    "0",
    ,
    ,
    "0",
    ,
    ,
    ,
    [[,
    "(\\d{2})(\\d{6})",
    "$1 $2",
    ,
    "(0$1)",
    ""]],
    ,
    [,
    ,
    "NA",
    "NA"],
    ,
    ,
    [,
    ,
    "NA",
    "NA"],
    [,
    ,
    "NA",
    "NA"]],
    SM: [,
    [,
    ,
    "[05-7]\\d{7,9}",
    "\\d{6,10}"],
    [,
    ,
    "0549(?:8[0157-9]|9\\d)\\d{4}",
    "\\d{6,10}"],
    [,
    ,
    "6[16]\\d{6}",
    "\\d{8}"],
    [,
    ,
    "NA",
    "NA"],
    [,
    ,
    "7[178]\\d{6}",
    "\\d{8}"],
    [,
    ,
    "NA",
    "NA"],
    [,
    ,
    "NA",
    "NA"],
    [,
    ,
    "5[158]\\d{6}",
    "\\d{8}"],
    "SM",
    378,
    "00",
    ,
    ,
    ,
    "(?:0549)?([89]\\d{5})",
    "0549$1",
    ,
    ,
    [[,
    "(\\d{2})(\\d{2})(\\d{2})(\\d{2})",
    "$1 $2 $3 $4",
    ["[5-7]"],
    "",
    ""],
    [,
    "(0549)(\\d{6})",
    "$1 $2",
    ["0"],
    "",
    ""],
    [,
    "(\\d{6})",
    "0549 $1",
    ["[89]"],
    "",
    ""]],
    [[,
    "(\\d{2})(\\d{2})(\\d{2})(\\d{2})",
    "$1 $2 $3 $4",
    ["[5-7]"]],
    [,
    "(0549)(\\d{6})",
    "($1) $2",
    ["0"]],
    [,
    "(\\d{6})",
    "(0549) $1",
    ["[89]"]]],
    [,
    ,
    "NA",
    "NA"],
    ,
    ,
    [,
    ,
    "NA",
    "NA"],
    [,
    ,
    "NA",
    "NA"],
    1],
    SN: [,
    [,
    ,
    "[37]\\d{8}",
    "\\d{9}"],
    [,
    ,
    "3(?:010|3(?:8[1-9]|9[2-9]))\\d{5}",
    "\\d{9}"],
    [,
    ,
    "7(?:0[1256]0|6(?:1[23]|2[89]|3[3489]|4[6-9]|5[1-389]|6[5-9]|7[45]|8[3-8])|7(?:01|1[014-8]|[2-79]\\d|8[019]))\\d{5}",
    "\\d{9}"],
    [,
    ,
    "NA",
    "NA"],
    [,
    ,
    "NA",
    "NA"],
    [,
    ,
    "NA",
    "NA"],
    [,
    ,
    "NA",
    "NA"],
    [,
    ,
    "33301\\d{4}",
    "\\d{9}"],
    "SN",
    221,
    "00",
    ,
    ,
    ,
    ,
    ,
    ,
    ,
    [[,
    "(\\d{2})(\\d{3})(\\d{2})(\\d{2})",
    "$1 $2 $3 $4",
    ,
    "",
    ""]],
    ,
    [,
    ,
    "NA",
    "NA"],
    ,
    ,
    [,
    ,
    "NA",
    "NA"],
    [,
    ,
    "NA",
    "NA"]],
    SO: [,
    [,
    ,
    "[13-59]\\d{6,7}",
    "\\d{7,8}"],
    [,
    ,
    "(?:5[57-9]|[134]\\d)\\d{5}",
    "\\d{7}"],
    [,
    ,
    "(?:9[01]|15)\\d{6}",
    "\\d{8}"],
    [,
    ,
    "NA",
    "NA"],
    [,
    ,
    "NA",
    "NA"],
    [,
    ,
    "NA",
    "NA"],
    [,
    ,
    "NA",
    "NA"],
    [,
    ,
    "NA",
    "NA"],
    "SO",
    252,
    "00",
    ,
    ,
    ,
    ,
    ,
    ,
    ,
    [[,
    "([13-5])(\\d{6})",
    "$1 $2",
    ["[13-5]"],
    "",
    ""],
    [,
    "([19]\\d)(\\d{6})",
    "$1 $2",
    ["15|9"],
    "",
    ""]],
    ,
    [,
    ,
    "NA",
    "NA"],
    ,
    ,
    [,
    ,
    "NA",
    "NA"],
    [,
    ,
    "NA",
    "NA"]],
    SR: [,
    [,
    ,
    "[2-8]\\d{5,6}",
    "\\d{6,7}"],
    [,
    ,
    "(?:2[1-3]|3[0-7]|4\\d|5[2-58]|68\\d)\\d{4}",
    "\\d{6,7}"],
    [,
    ,
    "(?:7[1245]|8[1-9])\\d{5}",
    "\\d{7}"],
    [,
    ,
    "NA",
    "NA"],
    [,
    ,
    "NA",
    "NA"],
    [,
    ,
    "NA",
    "NA"],
    [,
    ,
    "NA",
    "NA"],
    [,
    ,
    "56\\d{4}",
    "\\d{6}"],
    "SR",
    597,
    "00",
    ,
    ,
    ,
    ,
    ,
    ,
    ,
    [[,
    "(\\d{3})(\\d{3})",
    "$1-$2",
    ["[2-4]|5[2-58]"],
    "",
    ""],
    [,
    "(\\d{2})(\\d{2})(\\d{2})",
    "$1-$2-$3",
    ["56"],
    "",
    ""],
    [,
    "(\\d{3})(\\d{4})",
    "$1-$2",
    ["[6-8]"],
    "",
    ""]],
    ,
    [,
    ,
    "NA",
    "NA"],
    ,
    ,
    [,
    ,
    "NA",
    "NA"],
    [,
    ,
    "NA",
    "NA"]],
    ST: [,
    [,
    ,
    "[29]\\d{6}",
    "\\d{7}"],
    [,
    ,
    "22\\d{5}",
    "\\d{7}"],
    [,
    ,
    "9[89]\\d{5}",
    "\\d{7}"],
    [,
    ,
    "NA",
    "NA"],
    [,
    ,
    "NA",
    "NA"],
    [,
    ,
    "NA",
    "NA"],
    [,
    ,
    "NA",
    "NA"],
    [,
    ,
    "NA",
    "NA"],
    "ST",
    239,
    "00",
    ,
    ,
    ,
    ,
    ,
    ,
    ,
    [[,
    "(\\d{3})(\\d{4})",
    "$1 $2",
    ,
    "",
    ""]],
    ,
    [,
    ,
    "NA",
    "NA"],
    ,
    ,
    [,
    ,
    "NA",
    "NA"],
    [,
    ,
    "NA",
    "NA"]],
    SV: [,
    [,
    ,
    "[27]\\d{7}|[89]\\d{6}(?:\\d{4})?",
    "\\d{7,8}|\\d{11}"],
    [,
    ,
    "2[1-6]\\d{6}",
    "\\d{8}"],
    [,
    ,
    "7\\d{7}",
    "\\d{8}"],
    [,
    ,
    "800\\d{4}(?:\\d{4})?",
    "\\d{7}(?:\\d{4})?"],
    [,
    ,
    "900\\d{4}(?:\\d{4})?",
    "\\d{7}(?:\\d{4})?"],
    [,
    ,
    "NA",
    "NA"],
    [,
    ,
    "NA",
    "NA"],
    [,
    ,
    "NA",
    "NA"],
    "SV",
    503,
    "00",
    ,
    ,
    ,
    ,
    ,
    ,
    ,
    [[,
    "(\\d{4})(\\d{4})",
    "$1 $2",
    ["[27]"],
    "",
    ""],
    [,
    "(\\d{3})(\\d{4})",
    "$1 $2",
    ["[89]"],
    "",
    ""],
    [,
    "(\\d{3})(\\d{4})(\\d{4})",
    "$1 $2 $3",
    ["[89]"],
    "",
    ""]],
    ,
    [,
    ,
    "NA",
    "NA"],
    ,
    ,
    [,
    ,
    "NA",
    "NA"],
    [,
    ,
    "NA",
    "NA"]],
    SY: [,
    [,
    ,
    "[1-59]\\d{7,8}",
    "\\d{6,9}"],
    [,
    ,
    "(?:1(?:1\\d?|4\\d|[2356])|2[1-35]|3(?:1\\d|[34])|4[13]|5[1-3])\\d{6}",
    "\\d{6,9}"],
    [,
    ,
    "9(?:3[23]|4[457]|55|6[67]|88|9[1-49])\\d{6}",
    "\\d{9}"],
    [,
    ,
    "NA",
    "NA"],
    [,
    ,
    "NA",
    "NA"],
    [,
    ,
    "NA",
    "NA"],
    [,
    ,
    "NA",
    "NA"],
    [,
    ,
    "NA",
    "NA"],
    "SY",
    963,
    "00",
    "0",
    ,
    ,
    "0",
    ,
    ,
    ,
    [[,
    "(\\d{2})(\\d{3})(\\d{3,4})",
    "$1 $2 $3",
    ["[1-5]"],
    "0$1",
    ""],
    [,
    "(9[3-689])(\\d{4})(\\d{3})",
    "$1 $2 $3",
    ["9"],
    "0$1",
    ""]],
    ,
    [,
    ,
    "NA",
    "NA"],
    ,
    ,
    [,
    ,
    "NA",
    "NA"],
    [,
    ,
    "NA",
    "NA"]],
    SZ: [,
    [,
    ,
    "[027]\\d{7}",
    "\\d{8}"],
    [,
    ,
    "2(?:2(?:0[07]|[13]7|2[57])|3(?:0[34]|[1278]3|3[23]|[46][34])|(?:40[4-69]|67)|5(?:0[5-7]|1[6-9]|[23][78]|48|5[01]))\\d{4}",
    "\\d{8}"],
    [,
    ,
    "7[6-8]\\d{6}",
    "\\d{8}"],
    [,
    ,
    "0800\\d{4}",
    "\\d{8}"],
    [,
    ,
    "NA",
    "NA"],
    [,
    ,
    "NA",
    "NA"],
    [,
    ,
    "NA",
    "NA"],
    [,
    ,
    "NA",
    "NA"],
    "SZ",
    268,
    "00",
    ,
    ,
    ,
    ,
    ,
    ,
    ,
    [[,
    "(\\d{4})(\\d{4})",
    "$1 $2",
    ["[027]"],
    "",
    ""]],
    ,
    [,
    ,
    "NA",
    "NA"],
    ,
    ,
    [,
    ,
    "0800\\d{4}",
    "\\d{8}"],
    [,
    ,
    "NA",
    "NA"],
    1],
    TC: [,
    [,
    ,
    "[5689]\\d{9}",
    "\\d{7}(?:\\d{3})?"],
    [,
    ,
    "649(?:712|9(?:4\\d|50))\\d{4}",
    "\\d{7}(?:\\d{3})?"],
    [,
    ,
    "649(?:2(?:3[12]|4[1-5])|3(?:3[1-39]|4[1-57])|4[34][12])\\d{4}",
    "\\d{10}"],
    [,
    ,
    "8(?:00|55|66|77|88)[2-9]\\d{6}",
    "\\d{10}"],
    [,
    ,
    "900[2-9]\\d{6}",
    "\\d{10}"],
    [,
    ,
    "NA",
    "NA"],
    [,
    ,
    "5(?:00|33|44)[2-9]\\d{6}",
    "\\d{10}"],
    [,
    ,
    "64971[01]\\d{4}",
    "\\d{10}"],
    "TC",
    1,
    "011",
    "1",
    ,
    ,
    "1",
    ,
    ,
    ,
    ,
    ,
    [,
    ,
    "NA",
    "NA"],
    ,
    "649",
    [,
    ,
    "NA",
    "NA"],
    [,
    ,
    "NA",
    "NA"]],
    TD: [,
    [,
    ,
    "[2679]\\d{7}",
    "\\d{8}"],
    [,
    ,
    "22(?:[3789]0|5[0-5]|6[89])\\d{4}",
    "\\d{8}"],
    [,
    ,
    "(?:6(?:3[0-7]|6\\d)|77\\d|9(?:5[0-4]|9\\d))\\d{5}",
    "\\d{8}"],
    [,
    ,
    "NA",
    "NA"],
    [,
    ,
    "NA",
    "NA"],
    [,
    ,
    "NA",
    "NA"],
    [,
    ,
    "NA",
    "NA"],
    [,
    ,
    "NA",
    "NA"],
    "TD",
    235,
    "00|16",
    ,
    ,
    ,
    ,
    ,
    "00",
    ,
    [[,
    "(\\d{2})(\\d{2})(\\d{2})(\\d{2})",
    "$1 $2 $3 $4",
    ,
    "",
    ""]],
    ,
    [,
    ,
    "NA",
    "NA"],
    ,
    ,
    [,
    ,
    "NA",
    "NA"],
    [,
    ,
    "NA",
    "NA"]],
    TF: [,
    [],
    [],
    [],
    [,
    ,
    "NA",
    "NA"],
    [,
    ,
    "NA",
    "NA"],
    [,
    ,
    "NA",
    "NA"],
    [,
    ,
    "NA",
    "NA"],
    [,
    ,
    "NA",
    "NA"],
    "TF",
    262,
    "00",
    "0",
    ,
    ,
    "0",
    ,
    ,
    1,
    ,
    ,
    [,
    ,
    "NA",
    "NA"],
    ,
    ,
    [,
    ,
    "NA",
    "NA"],
    [,
    ,
    "NA",
    "NA"]],
    TG: [,
    [,
    ,
    "[02-9]\\d{6}",
    "\\d{7}"],
    [,
    ,
    "(?:2[2-7]|3[23]|44|55|66|77)\\d{5}",
    "\\d{7}"],
    [,
    ,
    "(?:0[1-9]|7[56]|8[1-7]|9\\d)\\d{5}",
    "\\d{7}"],
    [,
    ,
    "NA",
    "NA"],
    [,
    ,
    "NA",
    "NA"],
    [,
    ,
    "NA",
    "NA"],
    [,
    ,
    "NA",
    "NA"],
    [,
    ,
    "NA",
    "NA"],
    "TG",
    228,
    "00",
    ,
    ,
    ,
    ,
    ,
    ,
    ,
    [[,
    "(\\d{3})(\\d{2})(\\d{2})",
    "$1 $2 $3",
    ,
    "",
    ""]],
    ,
    [,
    ,
    "NA",
    "NA"],
    ,
    ,
    [,
    ,
    "NA",
    "NA"],
    [,
    ,
    "NA",
    "NA"],
    1],
    TH: [,
    [,
    ,
    "[2-8]\\d{7,8}|1\\d{9}",
    "\\d{8,10}"],
    [,
    ,
    "(?:2[1-9]|3[24-9]|4[2-5]|5[3-6]|7[3-7])\\d{6}",
    "\\d{8}"],
    [,
    ,
    "8\\d{8}",
    "\\d{9}"],
    [,
    ,
    "1800\\d{6}",
    "\\d{10}"],
    [,
    ,
    "1900\\d{6}",
    "\\d{10}"],
    [,
    ,
    "NA",
    "NA"],
    [,
    ,
    "NA",
    "NA"],
    [,
    ,
    "60\\d{7}",
    "\\d{9}"],
    "TH",
    66,
    "00",
    "0",
    ,
    ,
    "0",
    ,
    ,
    ,
    [[,
    "(2)(\\d{3})(\\d{4})",
    "$1 $2 $3",
    ["2"],
    "0$1",
    ""],
    [,
    "([3-7]\\d)(\\d{3})(\\d{3,4})",
    "$1 $2 $3",
    ["[3-7]"],
    "0$1",
    ""],
    [,
    "(8)(\\d{4})(\\d{4})",
    "$1 $2 $3",
    ["8"],
    "0$1",
    ""],
    [,
    "(1[89]00)(\\d{3})(\\d{3})",
    "$1 $2 $3",
    ["1"],
    "$1",
    ""]],
    ,
    [,
    ,
    "NA",
    "NA"],
    ,
    ,
    [,
    ,
    "NA",
    "NA"],
    [,
    ,
    "NA",
    "NA"]],
    TJ: [,
    [,
    ,
    "[3-59]\\d{8}",
    "\\d{3,9}"],
    [,
    ,
    "(?:3(?:1[3-5]|2[245]|3[12]|4[24-7]|5[25]|72)|4(?:46|74|87))\\d{6}",
    "\\d{3,9}"],
    [,
    ,
    "(?:505|9[0-35-9]\\d)\\d{6}",
    "\\d{9}"],
    [,
    ,
    "NA",
    "NA"],
    [,
    ,
    "NA",
    "NA"],
    [,
    ,
    "NA",
    "NA"],
    [,
    ,
    "NA",
    "NA"],
    [,
    ,
    "NA",
    "NA"],
    "TJ",
    992,
    "8~10",
    "8",
    ,
    ,
    "8",
    ,
    ,
    ,
    [[,
    "([349]\\d{2})(\\d{2})(\\d{4})",
    "$1 $2 $3",
    ["[34]7|91[78]"],
    "(8) $1",
    ""],
    [,
    "([459]\\d)(\\d{3})(\\d{4})",
    "$1 $2 $3",
    ["4[48]|5|9(?:19|[0235-9])"],
    "(8) $1",
    ""],
    [,
    "(331700)(\\d)(\\d{2})",
    "$1 $2 $3",
    ["331",
    "3317",
    "33170",
    "331700"],
    "(8) $1",
    ""],
    [,
    "(\\d{4})(\\d)(\\d{4})",
    "$1 $2 $3",
    ["3[1-5]",
    "3(?:[1245]|3(?:[02-9]|1[0-589]))"],
    "(8) $1",
    ""]],
    ,
    [,
    ,
    "NA",
    "NA"],
    ,
    ,
    [,
    ,
    "NA",
    "NA"],
    [,
    ,
    "NA",
    "NA"]],
    TK: [,
    [],
    [],
    [],
    [,
    ,
    "NA",
    "NA"],
    [,
    ,
    "NA",
    "NA"],
    [,
    ,
    "NA",
    "NA"],
    [,
    ,
    "NA",
    "NA"],
    [,
    ,
    "NA",
    "NA"],
    "TK",
    690,
    "00",
    ,
    ,
    ,
    ,
    ,
    ,
    1,
    ,
    ,
    [,
    ,
    "NA",
    "NA"],
    ,
    ,
    [,
    ,
    "NA",
    "NA"],
    [,
    ,
    "NA",
    "NA"]],
    TL: [,
    [,
    ,
    "[2-47-9]\\d{6}",
    "\\d{7}"],
    [,
    ,
    "(?:2[1-5]|3[1-9]|4[1-4])\\d{5}",
    "\\d{7}"],
    [,
    ,
    "7[2-4]\\d{5}",
    "\\d{7}"],
    [,
    ,
    "80\\d{5}",
    "\\d{7}"],
    [,
    ,
    "90\\d{5}",
    "\\d{7}"],
    [,
    ,
    "NA",
    "NA"],
    [,
    ,
    "70\\d{5}",
    "\\d{7}"],
    [,
    ,
    "NA",
    "NA"],
    "TL",
    670,
    "00",
    ,
    ,
    ,
    ,
    ,
    ,
    ,
    [[,
    "(\\d{3})(\\d{4})",
    "$1 $2",
    ,
    "",
    ""]],
    ,
    [,
    ,
    "NA",
    "NA"],
    ,
    ,
    [,
    ,
    "NA",
    "NA"],
    [,
    ,
    "NA",
    "NA"]],
    TM: [,
    [,
    ,
    "[1-6]\\d{7}",
    "\\d{8}"],
    [,
    ,
    "(?:12\\d|243|[3-5]22)\\d{5}",
    "\\d{8}"],
    [,
    ,
    "6[6-8]\\d{6}",
    "\\d{8}"],
    [,
    ,
    "NA",
    "NA"],
    [,
    ,
    "NA",
    "NA"],
    [,
    ,
    "NA",
    "NA"],
    [,
    ,
    "NA",
    "NA"],
    [,
    ,
    "NA",
    "NA"],
    "TM",
    993,
    "8~10",
    "8",
    ,
    ,
    "8",
    ,
    ,
    ,
    [[,
    "([1-6]\\d)(\\d{2})(\\d{2})(\\d{2})",
    "$1 $2 $3 $4",
    ,
    "8 $1",
    ""]],
    ,
    [,
    ,
    "NA",
    "NA"],
    ,
    ,
    [,
    ,
    "NA",
    "NA"],
    [,
    ,
    "NA",
    "NA"]],
    TN: [,
    [,
    ,
    "[247-9]\\d{7}",
    "\\d{8}"],
    [,
    ,
    "7\\d{7}",
    "\\d{8}"],
    [,
    ,
    "(?:[29]\\d|4[01])\\d{6}",
    "\\d{8}"],
    [,
    ,
    "NA",
    "NA"],
    [,
    ,
    "8[028]\\d{6}",
    "\\d{8}"],
    [,
    ,
    "NA",
    "NA"],
    [,
    ,
    "NA",
    "NA"],
    [,
    ,
    "NA",
    "NA"],
    "TN",
    216,
    "00",
    ,
    ,
    ,
    ,
    ,
    ,
    ,
    [[,
    "([247-9]\\d)(\\d{3})(\\d{3})",
    "$1 $2 $3",
    ,
    "",
    ""]],
    ,
    [,
    ,
    "NA",
    "NA"],
    ,
    ,
    [,
    ,
    "NA",
    "NA"],
    [,
    ,
    "NA",
    "NA"]],
    TO: [,
    [,
    ,
    "[02-8]\\d{4,6}",
    "\\d{5,7}"],
    [,
    ,
    "(?:2\\d|3[1-8]|4[1-4]|[56]0|7[0149]|8[05])\\d{3}",
    "\\d{5}"],
    [,
    ,
    "(?:7[578]|8[7-9])\\d{5}",
    "\\d{7}"],
    [,
    ,
    "0800\\d{3}",
    "\\d{7}"],
    [,
    ,
    "NA",
    "NA"],
    [,
    ,
    "NA",
    "NA"],
    [,
    ,
    "NA",
    "NA"],
    [,
    ,
    "NA",
    "NA"],
    "TO",
    676,
    "00",
    ,
    ,
    ,
    ,
    ,
    ,
    ,
    [[,
    "(\\d{2})(\\d{3})",
    "$1-$2",
    ["[1-6]|7[0-4]|8[05]"],
    "",
    ""],
    [,
    "(\\d{3})(\\d{4})",
    "$1 $2",
    ["7[5-9]|8[7-9]"],
    "",
    ""],
    [,
    "(\\d{4})(\\d{3})",
    "$1 $2",
    ["0"],
    "",
    ""]],
    ,
    [,
    ,
    "NA",
    "NA"],
    ,
    ,
    [,
    ,
    "NA",
    "NA"],
    [,
    ,
    "NA",
    "NA"],
    1],
    TR: [,
    [,
    ,
    "[2-589]\\d{9}|444\\d{4}",
    "\\d{7,10}"],
    [,
    ,
    "(?:2(?:[13][26]|[28][2468]|[45][268]|[67][246])|3(?:[13][28]|[24-6][2468]|[78][02468]|92)|4(?:[16][246]|[23578][2468]|4[26]))\\d{7}",
    "\\d{10}"],
    [,
    ,
    "5(?:0[1-35-7]|22|3\\d|4[1-79]|5[1-5]|9[246])\\d{7}",
    "\\d{10}"],
    [,
    ,
    "800\\d{7}",
    "\\d{10}"],
    [,
    ,
    "900\\d{7}",
    "\\d{10}"],
    [,
    ,
    "NA",
    "NA"],
    [,
    ,
    "NA",
    "NA"],
    [,
    ,
    "NA",
    "NA"],
    "TR",
    90,
    "00",
    "0",
    ,
    ,
    "0",
    ,
    ,
    ,
    [[,
    "(\\d{3})(\\d{3})(\\d{4})",
    "$1 $2 $3",
    ["[23]|4(?:[0-35-9]|4[0-35-9])"],
    "(0$1)",
    ""],
    [,
    "(\\d{3})(\\d{3})(\\d{4})",
    "$1 $2 $3",
    ["[589]"],
    "0$1",
    ""],
    [,
    "(444)(\\d{1})(\\d{3})",
    "$1 $2 $3",
    ["444"],
    "",
    ""]],
    ,
    [,
    ,
    "512\\d{7}",
    "\\d{10}"],
    ,
    ,
    [,
    ,
    "NA",
    "NA"],
    [,
    ,
    "444\\d{4}|850\\d{7}",
    "\\d{7,10}"]],
    TT: [,
    [,
    ,
    "[589]\\d{9}",
    "\\d{7}(?:\\d{3})?"],
    [,
    ,
    "868(?:2(?:01|2[1-4])|6(?:07|1[4-6]|2[1-9]|[3-6]\\d|7[0-79]|9[0-8])|82[12])\\d{4}",
    "\\d{7}(?:\\d{3})?"],
    [,
    ,
    "868(?:29\\d|3(?:0[1-9]|1[02-9]|[2-9]\\d)|4(?:[679]\\d|8[0-4])|6(?:20|78|8\\d)|7(?:1[02-9]|[2-9]\\d))\\d{4}",
    "\\d{10}"],
    [,
    ,
    "8(?:00|55|66|77|88)[2-9]\\d{6}",
    "\\d{10}"],
    [,
    ,
    "900[2-9]\\d{6}",
    "\\d{10}"],
    [,
    ,
    "NA",
    "NA"],
    [,
    ,
    "5(?:00|33|44)[2-9]\\d{6}",
    "\\d{10}"],
    [,
    ,
    "NA",
    "NA"],
    "TT",
    1,
    "011",
    "1",
    ,
    ,
    "1",
    ,
    ,
    ,
    ,
    ,
    [,
    ,
    "NA",
    "NA"],
    ,
    "868",
    [,
    ,
    "NA",
    "NA"],
    [,
    ,
    "NA",
    "NA"]],
    TV: [,
    [,
    ,
    "[29]\\d{4,5}",
    "\\d{5,6}"],
    [,
    ,
    "2[02-9]\\d{3}",
    "\\d{5}"],
    [,
    ,
    "90\\d{4}",
    "\\d{6}"],
    [,
    ,
    "NA",
    "NA"],
    [,
    ,
    "NA",
    "NA"],
    [,
    ,
    "NA",
    "NA"],
    [,
    ,
    "NA",
    "NA"],
    [,
    ,
    "NA",
    "NA"],
    "TV",
    688,
    "00",
    ,
    ,
    ,
    ,
    ,
    ,
    ,
    ,
    ,
    [,
    ,
    "NA",
    "NA"],
    ,
    ,
    [,
    ,
    "NA",
    "NA"],
    [,
    ,
    "NA",
    "NA"]],
    TW: [,
    [,
    ,
    "[2-9]\\d{7,8}",
    "\\d{8,9}"],
    [,
    ,
    "[2-8]\\d{7,8}",
    "\\d{8,9}"],
    [,
    ,
    "9\\d{8}",
    "\\d{9}"],
    [,
    ,
    "800\\d{6}",
    "\\d{9}"],
    [,
    ,
    "900\\d{6}",
    "\\d{9}"],
    [,
    ,
    "NA",
    "NA"],
    [,
    ,
    "NA",
    "NA"],
    [,
    ,
    "NA",
    "NA"],
    "TW",
    886,
    "0(?:0[25679]|19)",
    "0",
    "#",
    ,
    "0",
    ,
    ,
    ,
    [[,
    "([2-8])(\\d{3,4})(\\d{4})",
    "$1 $2 $3",
    ["[2-7]|8[1-9]"],
    "0$1",
    ""],
    [,
    "([89]\\d{2})(\\d{3})(\\d{3})",
    "$1 $2 $3",
    ["80|9"],
    "0$1",
    ""]],
    ,
    [,
    ,
    "NA",
    "NA"],
    ,
    ,
    [,
    ,
    "NA",
    "NA"],
    [,
    ,
    "NA",
    "NA"]],
    TZ: [,
    [,
    ,
    "\\d{9}",
    "\\d{7,9}"],
    [,
    ,
    "2[2-8]\\d{7}",
    "\\d{7,9}"],
    [,
    ,
    "(?:6[158]|7[1-9])\\d{7}",
    "\\d{9}"],
    [,
    ,
    "80[08]\\d{6}",
    "\\d{9}"],
    [,
    ,
    "90\\d{7}",
    "\\d{9}"],
    [,
    ,
    "8(?:40|6[01])\\d{6}",
    "\\d{9}"],
    [,
    ,
    "NA",
    "NA"],
    [,
    ,
    "41\\d{7}",
    "\\d{9}"],
    "TZ",
    255,
    "00[056]",
    "0",
    ,
    ,
    "0",
    ,
    ,
    ,
    [[,
    "([24]\\d)(\\d{3})(\\d{4})",
    "$1 $2 $3",
    ["[24]"],
    "0$1",
    ""],
    [,
    "([67]\\d{2})(\\d{3})(\\d{3})",
    "$1 $2 $3",
    ["[67]"],
    "0$1",
    ""],
    [,
    "([89]\\d{2})(\\d{2})(\\d{4})",
    "$1 $2 $3",
    ["[89]"],
    "0$1",
    ""]],
    ,
    [,
    ,
    "NA",
    "NA"],
    ,
    ,
    [,
    ,
    "NA",
    "NA"],
    [,
    ,
    "NA",
    "NA"]],
    UA: [,
    [,
    ,
    "[3-689]\\d{8}",
    "\\d{5,9}"],
    [,
    ,
    "(?:3[1-8]|4[13-8]|5[1-7]|6[12459])\\d{7}",
    "\\d{5,9}"],
    [,
    ,
    "(?:39|50|6[36-8]|9[1-9])\\d{7}",
    "\\d{9}"],
    [,
    ,
    "800\\d{6}",
    "\\d{9}"],
    [,
    ,
    "900\\d{6}",
    "\\d{9}"],
    [,
    ,
    "NA",
    "NA"],
    [,
    ,
    "NA",
    "NA"],
    [,
    ,
    "NA",
    "NA"],
    "UA",
    380,
    "0~0",
    "0",
    ,
    ,
    "0",
    ,
    ,
    ,
    [[,
    "([3-69]\\d)(\\d{3})(\\d{4})",
    "$1 $2 $3",
    ["39|4(?:[45][0-5]|87)|5(?:0|6[37]|7[37])|6[36-8]|9[1-9]",
    "39|4(?:[45][0-5]|87)|5(?:0|6(?:3[14-7]|7)|7[37])|6[36-8]|9[1-9]"],
    "0$1",
    ""],
    [,
    "([3-689]\\d{2})(\\d{3})(\\d{3})",
    "$1 $2 $3",
    ["3[1-8]2|4[1378]2|5(?:[12457]2|6[24])|6(?:[49]2|[12][29]|5[24])|8|90",
    "3(?:[1-46-8]2[013-9]|52)|4[1378]2|5(?:[12457]2|6[24])|6(?:[49]2|[12][29]|5[24])|8|90"],
    "0$1",
    ""],
    [,
    "([3-6]\\d{3})(\\d{5})",
    "$1 $2",
    ["3(?:5[013-9]|[1-46-8])|4(?:[137][013-9]|6|[45][6-9]|8[4-6])|5(?:[1245][013-9]|6[0135-9]|3|7[4-6])|6(?:[49][013-9]|5[0135-9]|[12][13-8])",
    "3(?:5[013-9]|[1-46-8](?:22|[013-9]))|4(?:[137][013-9]|6|[45][6-9]|8[4-6])|5(?:[1245][013-9]|6(?:3[02389]|[015689])|3|7[4-6])|6(?:[49][013-9]|5[0135-9]|[12][13-8])"],
    "0$1",
    ""]],
    ,
    [,
    ,
    "NA",
    "NA"],
    ,
    ,
    [,
    ,
    "NA",
    "NA"],
    [,
    ,
    "NA",
    "NA"]],
    UG: [,
    [,
    ,
    "\\d{9}",
    "\\d{5,9}"],
    [,
    ,
    "3\\d{8}|4(?:[1-6]\\d|7[136]|8[1356]|96)\\d{6}|20(?:0\\d|24)\\d{5}",
    "\\d{5,9}"],
    [,
    ,
    "7(?:[15789]\\d|0[0-4])\\d{6}",
    "\\d{9}"],
    [,
    ,
    "800[123]\\d{5}",
    "\\d{9}"],
    [,
    ,
    "90[123]\\d{6}",
    "\\d{9}"],
    [,
    ,
    "NA",
    "NA"],
    [,
    ,
    "NA",
    "NA"],
    [,
    ,
    "NA",
    "NA"],
    "UG",
    256,
    "00[057]",
    "0",
    ,
    ,
    "0",
    ,
    ,
    ,
    [[,
    "([247-9]\\d{2})(\\d{6})",
    "$1 $2",
    ["[7-9]|200|4(?:6[45]|[7-9])"],
    "0$1",
    ""],
    [,
    "([34]\\d)(\\d{7})",
    "$1 $2",
    ["3|4(?:[1-5]|6[0-36-9])"],
    "0$1",
    ""],
    [,
    "(2024)(\\d{5})",
    "$1 $2",
    ["202"],
    "0$1",
    ""]],
    ,
    [,
    ,
    "NA",
    "NA"],
    ,
    ,
    [,
    ,
    "NA",
    "NA"],
    [,
    ,
    "NA",
    "NA"]],
    US: [,
    [,
    ,
    "[2-9]\\d{9}",
    "\\d{7}(?:\\d{3})?"],
    [,
    ,
    "(?:2(?:0[1-35-9]|1[02-9]|2[4589]|3[149]|4[08]|5[1-46]|6[0279]|7[06]|8[13])|3(?:0[1-57-9]|1[02-9]|2[0135]|3[014679]|47|5[12]|6[01]|8[056])|4(?:0[124-9]|1[02-579]|2[3-5]|3[0245]|4[0235]|58|69|7[0589]|8[04])|5(?:0[1-57-9]|1[0235-8]|20|3[0149]|4[01]|5[19]|6[1-37]|7[013-5]|8[056])|6(?:0[1-35-9]|1[024-9]|2[036]|3[016]|4[16]|5[017]|6[0-29]|78|8[12])|7(?:0[1-46-8]|1[2-9]|2[047]|3[124]|4[07]|5[47]|6[02359]|7[02-59]|8[156])|8(?:0[1-68]|1[02-8]|28|3[0-25]|4[3578]|5[06-9]|6[02-5]|7[028])|9(?:0[1346-9]|1[02-9]|2[0589]|3[1678]|4[0179]|5[1246]|7[0-3589]|8[059]))[2-9]\\d{6}",
    "\\d{7}(?:\\d{3})?"],
    [,
    ,
    "(?:2(?:0[1-35-9]|1[02-9]|2[4589]|3[149]|4[08]|5[1-46]|6[0279]|7[06]|8[13])|3(?:0[1-57-9]|1[02-9]|2[0135]|3[014679]|47|5[12]|6[01]|8[056])|4(?:0[124-9]|1[02-579]|2[3-5]|3[0245]|4[0235]|58|69|7[0589]|8[04])|5(?:0[1-57-9]|1[0235-8]|20|3[0149]|4[01]|5[19]|6[1-37]|7[013-5]|8[056])|6(?:0[1-35-9]|1[024-9]|2[036]|3[016]|4[16]|5[017]|6[0-29]|78|8[12])|7(?:0[1-46-8]|1[2-9]|2[047]|3[124]|4[07]|5[47]|6[02359]|7[02-59]|8[156])|8(?:0[1-68]|1[02-8]|28|3[0-25]|4[3578]|5[06-9]|6[02-5]|7[028])|9(?:0[1346-9]|1[02-9]|2[0589]|3[1678]|4[0179]|5[1246]|7[0-3589]|8[059]))[2-9]\\d{6}",
    "\\d{7}(?:\\d{3})?"],
    [,
    ,
    "8(?:00|55|66|77|88)[2-9]\\d{6}",
    "\\d{10}"],
    [,
    ,
    "900[2-9]\\d{6}",
    "\\d{10}"],
    [,
    ,
    "NA",
    "NA"],
    [,
    ,
    "5(?:00|33|44)[2-9]\\d{6}",
    "\\d{10}"],
    [,
    ,
    "NA",
    "NA"],
    "US",
    1,
    "011",
    "1",
    ,
    ,
    "1",
    ,
    ,
    1,
    [[,
    "(\\d{3})(\\d{3})(\\d{4})",
    "($1) $2-$3",
    ,
    "",
    ""],
    [,
    "(\\d{3})(\\d{4})",
    "$1-$2",
    ,
    "",
    ""]],
    [[,
    "(\\d{3})(\\d{3})(\\d{4})",
    "$1-$2-$3"]],
    [,
    ,
    "NA",
    "NA"],
    1,
    ,
    [,
    ,
    "NA",
    "NA"],
    [,
    ,
    "NA",
    "NA"]],
    UY: [,
    [,
    ,
    "[2489]\\d{6,7}",
    "\\d{7,8}"],
    [,
    ,
    "2\\d{7}|4[2-7]\\d{6}",
    "\\d{7,8}"],
    [,
    ,
    "9[13-9]\\d{6}",
    "\\d{8}"],
    [,
    ,
    "80[05]\\d{4}",
    "\\d{7}"],
    [,
    ,
    "90[0-8]\\d{4}",
    "\\d{7}"],
    [,
    ,
    "NA",
    "NA"],
    [,
    ,
    "NA",
    "NA"],
    [,
    ,
    "NA",
    "NA"],
    "UY",
    598,
    "0(?:1[3-9]\\d|0)",
    "0",
    " int. ",
    ,
    "0",
    ,
    "00",
    ,
    [[,
    "(\\d{4})(\\d{4})",
    "$1 $2",
    ["[24]"],
    "",
    ""],
    [,
    "(\\d{2})(\\d{3})(\\d{3})",
    "$1 $2 $3",
    ["9[1-9]"],
    "0$1",
    ""],
    [,
    "(\\d{3})(\\d{4})",
    "$1 $2",
    ["[89]0"],
    "0$1",
    ""]],
    ,
    [,
    ,
    "NA",
    "NA"],
    ,
    ,
    [,
    ,
    "NA",
    "NA"],
    [,
    ,
    "NA",
    "NA"]],
    UZ: [,
    [,
    ,
    "[679]\\d{8}",
    "\\d{7,9}"],
    [,
    ,
    "(?:6[125679]|7[0-69])\\d{7}",
    "\\d{7,9}"],
    [,
    ,
    "9[0-57-9]\\d{7}",
    "\\d{7,9}"],
    [,
    ,
    "NA",
    "NA"],
    [,
    ,
    "NA",
    "NA"],
    [,
    ,
    "NA",
    "NA"],
    [,
    ,
    "NA",
    "NA"],
    [,
    ,
    "NA",
    "NA"],
    "UZ",
    998,
    "8~10",
    "8",
    ,
    ,
    "8",
    ,
    ,
    ,
    [[,
    "([679]\\d)(\\d{3})(\\d{2})(\\d{2})",
    "$1 $2 $3 $4",
    ,
    "8$1",
    ""]],
    ,
    [,
    ,
    "NA",
    "NA"],
    ,
    ,
    [,
    ,
    "NA",
    "NA"],
    [,
    ,
    "NA",
    "NA"]],
    VA: [,
    [,
    ,
    "06\\d{8}",
    "\\d{10}"],
    [,
    ,
    "06698\\d{5}",
    "\\d{10}"],
    [,
    ,
    "N/A",
    "N/A"],
    [,
    ,
    "NA",
    "NA"],
    [,
    ,
    "NA",
    "NA"],
    [,
    ,
    "NA",
    "NA"],
    [,
    ,
    "NA",
    "NA"],
    [,
    ,
    "NA",
    "NA"],
    "VA",
    379,
    "00",
    ,
    ,
    ,
    ,
    ,
    ,
    ,
    [[,
    "(06)(\\d{4})(\\d{4})",
    "$1 $2 $3",
    ,
    "",
    ""]],
    ,
    [,
    ,
    "NA",
    "NA"],
    ,
    ,
    [,
    ,
    "NA",
    "NA"],
    [,
    ,
    "NA",
    "NA"],
    1],
    VC: [,
    [,
    ,
    "[5789]\\d{9}",
    "\\d{7}(?:\\d{3})?"],
    [,
    ,
    "784(?:266|3(?:6[6-9]|7\\d|8[0-24-6])|4(?:38|5[0-36-8]|8\\d|9[01])|555|638|784)\\d{4}",
    "\\d{7}(?:\\d{3})?"],
    [,
    ,
    "784(?:4(?:3[0-4]|5[45]|9[2-5])|5(?:2[6-9]|3[0-4]|93))\\d{4}",
    "\\d{10}"],
    [,
    ,
    "8(?:00|55|66|77|88)[2-9]\\d{6}",
    "\\d{10}"],
    [,
    ,
    "900[2-9]\\d{6}",
    "\\d{10}"],
    [,
    ,
    "NA",
    "NA"],
    [,
    ,
    "5(?:00|33|44)[2-9]\\d{6}",
    "\\d{10}"],
    [,
    ,
    "NA",
    "NA"],
    "VC",
    1,
    "011",
    "1",
    ,
    ,
    "1",
    ,
    ,
    ,
    ,
    ,
    [,
    ,
    "NA",
    "NA"],
    ,
    "784",
    [,
    ,
    "NA",
    "NA"],
    [,
    ,
    "NA",
    "NA"]],
    VE: [,
    [,
    ,
    "[24589]\\d{9}",
    "\\d{7,10}"],
    [,
    ,
    "(?:2(?:12|3[457-9]|[58][1-9]|[467]\\d|9[1-6])|50[01])\\d{7}",
    "\\d{7,10}"],
    [,
    ,
    "4(?:1[24-8]|2[46])\\d{7}",
    "\\d{10}"],
    [,
    ,
    "800\\d{7}",
    "\\d{10}"],
    [,
    ,
    "900\\d{7}",
    "\\d{10}"],
    [,
    ,
    "NA",
    "NA"],
    [,
    ,
    "NA",
    "NA"],
    [,
    ,
    "NA",
    "NA"],
    "VE",
    58,
    "00",
    "0",
    ,
    ,
    "(1\\d{2})|0",
    ,
    ,
    ,
    [[,
    "(\\d{3})(\\d{7})",
    "$1-$2",
    ,
    "0$1",
    "$CC $1"]],
    ,
    [,
    ,
    "NA",
    "NA"],
    ,
    ,
    [,
    ,
    "NA",
    "NA"],
    [,
    ,
    "NA",
    "NA"]],
    VG: [,
    [,
    ,
    "[2589]\\d{9}",
    "\\d{7}(?:\\d{3})?"],
    [,
    ,
    "284(?:(?:229|4(?:46|9[45])|8(?:52|6[459]))\\d{4}|496[0-5]\\d{3})",
    "\\d{7}(?:\\d{3})?"],
    [,
    ,
    "284(?:(?:30[0-3]|4(?:4[0-5]|68|99)|54[0-4])\\d{4}|496[6-9]\\d{3})",
    "\\d{10}"],
    [,
    ,
    "8(?:00|55|66|77|88)[2-9]\\d{6}",
    "\\d{10}"],
    [,
    ,
    "900[2-9]\\d{6}",
    "\\d{10}"],
    [,
    ,
    "NA",
    "NA"],
    [,
    ,
    "5(?:00|33|44)[2-9]\\d{6}",
    "\\d{10}"],
    [,
    ,
    "NA",
    "NA"],
    "VG",
    1,
    "011",
    "1",
    ,
    ,
    "1",
    ,
    ,
    ,
    ,
    ,
    [,
    ,
    "NA",
    "NA"],
    ,
    "284",
    [,
    ,
    "NA",
    "NA"],
    [,
    ,
    "NA",
    "NA"]],
    VI: [,
    [,
    ,
    "[3589]\\d{9}",
    "\\d{7}(?:\\d{3})?"],
    [,
    ,
    "340(?:2(?:01|2[067]|36|44|77)|3(?:32|44)|4(?:4[38]|7[34])|5(?:1[34]|55)|6(?:26|4[23]|9[023])|7(?:[17]\\d|27)|884|998)\\d{4}",
    "\\d{7}(?:\\d{3})?"],
    [,
    ,
    "340(?:2(?:01|2[067]|36|44|77)|3(?:32|44)|4(?:4[38]|7[34])|5(?:1[34]|55)|6(?:26|4[23]|9[023])|7(?:[17]\\d|27)|884|998)\\d{4}",
    "\\d{7}(?:\\d{3})?"],
    [,
    ,
    "8(?:00|55|66|77|88)[2-9]\\d{6}",
    "\\d{10}"],
    [,
    ,
    "900[2-9]\\d{6}",
    "\\d{10}"],
    [,
    ,
    "NA",
    "NA"],
    [,
    ,
    "5(?:00|33|44)[2-9]\\d{6}",
    "\\d{10}"],
    [,
    ,
    "NA",
    "NA"],
    "VI",
    1,
    "011",
    "1",
    ,
    ,
    "1",
    ,
    ,
    1,
    ,
    ,
    [,
    ,
    "NA",
    "NA"],
    ,
    "340",
    [,
    ,
    "NA",
    "NA"],
    [,
    ,
    "NA",
    "NA"]],
    VN: [,
    [,
    ,
    "8\\d{5,8}|[1-79]\\d{7,9}",
    "\\d{7,10}"],
    [,
    ,
    "(?:2(?:[025-79]|1[0189]|[348][01])|3(?:[0136-9]|[25][01])|[48]\\d|5(?:[01][01]|[2-9])|6(?:[0-46-8]|5[01])|7(?:[02-79]|[18][01]))\\d{7}|69\\d{5,6}|80\\d{5}",
    "\\d{7,10}"],
    [,
    ,
    "(?:9\\d|1(?:2\\d|6[3-9]|88|99))\\d{7}",
    "\\d{9,10}"],
    [,
    ,
    "1800\\d{4,6}",
    "\\d{8,10}"],
    [,
    ,
    "1900\\d{4,6}",
    "\\d{8,10}"],
    [,
    ,
    "NA",
    "NA"],
    [,
    ,
    "NA",
    "NA"],
    [,
    ,
    "NA",
    "NA"],
    "VN",
    84,
    "00",
    "0",
    ,
    ,
    "0",
    ,
    ,
    ,
    [[,
    "([48])(\\d{4})(\\d{4})",
    "$1 $2 $3",
    ["[48]"],
    "0$1",
    ""],
    [,
    "([235-7]\\d)(\\d{4})(\\d{3})",
    "$1 $2 $3",
    ["2[025-79]|3[0136-9]|5[2-9]|6[0-46-9]|7[02-79]"],
    "0$1",
    ""],
    [,
    "(80)(\\d{5})",
    "$1 $2",
    ["80"],
    "0$1",
    ""],
    [,
    "(69\\d)(\\d{4,5})",
    "$1 $2",
    ["69"],
    "0$1",
    ""],
    [,
    "([235-7]\\d{2})(\\d{4})(\\d{3})",
    "$1 $2 $3",
    ["2[1348]|3[25]|5[01]|65|7[18]"],
    "0$1",
    ""],
    [,
    "(9\\d)(\\d{3})(\\d{2})(\\d{2})",
    "$1 $2 $3 $4",
    ["9"],
    "0$1",
    ""],
    [,
    "(1[2689]\\d)(\\d{3})(\\d{4})",
    "$1 $2 $3",
    ["1(?:[26]|88|99)"],
    "0$1",
    ""],
    [,
    "(1[89]00)(\\d{4,6})",
    "$1 $2",
    ["1[89]0"],
    "$1",
    ""]],
    ,
    [,
    ,
    "NA",
    "NA"],
    ,
    ,
    [,
    ,
    "NA",
    "NA"],
    [,
    ,
    "NA",
    "NA"]],
    VU: [,
    [,
    ,
    "[2-578]\\d{4,6}",
    "\\d{5,7}"],
    [,
    ,
    "(?:2[2-9]\\d|3(?:[67]\\d|8[0-8])|48[4-9]|88\\d)\\d{2}",
    "\\d{5}"],
    [,
    ,
    "(?:5(?:7[2-5]|[3-69]\\d)|7[013-7]\\d)\\d{4}",
    "\\d{7}"],
    [,
    ,
    "NA",
    "NA"],
    [,
    ,
    "NA",
    "NA"],
    [,
    ,
    "NA",
    "NA"],
    [,
    ,
    "NA",
    "NA"],
    [,
    ,
    "NA",
    "NA"],
    "VU",
    678,
    "00",
    ,
    ,
    ,
    ,
    ,
    ,
    ,
    [[,
    "(\\d{3})(\\d{4})",
    "$1 $2",
    ["[57]"],
    "",
    ""]],
    ,
    [,
    ,
    "NA",
    "NA"],
    ,
    ,
    [,
    ,
    "NA",
    "NA"],
    [,
    ,
    "30\\d{3}",
    "\\d{5}"]],
    WF: [,
    [,
    ,
    "[5-7]\\d{5}",
    "\\d{6}"],
    [,
    ,
    "(?:50|68|72)\\d{4}",
    "\\d{6}"],
    [,
    ,
    "(?:50|68|72)\\d{4}",
    "\\d{6}"],
    [,
    ,
    "NA",
    "NA"],
    [,
    ,
    "NA",
    "NA"],
    [,
    ,
    "NA",
    "NA"],
    [,
    ,
    "NA",
    "NA"],
    [,
    ,
    "NA",
    "NA"],
    "WF",
    681,
    "00",
    ,
    ,
    ,
    ,
    ,
    ,
    1,
    [[,
    "(\\d{2})(\\d{2})(\\d{2})",
    "$1 $2 $3",
    ,
    "",
    ""]],
    ,
    [,
    ,
    "NA",
    "NA"],
    ,
    ,
    [,
    ,
    "NA",
    "NA"],
    [,
    ,
    "NA",
    "NA"]],
    WS: [,
    [,
    ,
    "[2-8]\\d{4,6}",
    "\\d{5,7}"],
    [,
    ,
    "(?:[2-5]\\d|6[1-9]|840\\d)\\d{3}",
    "\\d{5,7}"],
    [,
    ,
    "(?:60|7[25-7]\\d)\\d{4}",
    "\\d{6,7}"],
    [,
    ,
    "800\\d{3}",
    "\\d{6}"],
    [,
    ,
    "NA",
    "NA"],
    [,
    ,
    "NA",
    "NA"],
    [,
    ,
    "NA",
    "NA"],
    [,
    ,
    "NA",
    "NA"],
    "WS",
    685,
    "0",
    "0",
    ,
    ,
    "0",
    ,
    ,
    ,
    [[,
    "(8[04]0)(\\d{3,4})",
    "$1 $2",
    ["8[04]0"],
    "0$1",
    ""],
    [,
    "(7[25-7])(\\d{5})",
    "$1 $2",
    ["7[25-7]"],
    "0$1",
    ""]],
    ,
    [,
    ,
    "NA",
    "NA"],
    ,
    ,
    [,
    ,
    "NA",
    "NA"],
    [,
    ,
    "NA",
    "NA"]],
    YE: [,
    [,
    ,
    "[1-7]\\d{6,8}",
    "\\d{6,9}"],
    [,
    ,
    "(?:1(?:7\\d|[2-68])|2[2-68]|3[2358]|4[2-58]|5[2-6]|6[3-58]|7[24-68])\\d{5}",
    "\\d{6,8}"],
    [,
    ,
    "7[137]\\d{7}",
    "\\d{9}"],
    [,
    ,
    "NA",
    "NA"],
    [,
    ,
    "NA",
    "NA"],
    [,
    ,
    "NA",
    "NA"],
    [,
    ,
    "NA",
    "NA"],
    [,
    ,
    "NA",
    "NA"],
    "YE",
    967,
    "00",
    "0",
    ,
    ,
    "0",
    ,
    ,
    ,
    [[,
    "([1-7])(\\d{3})(\\d{3,4})",
    "$1 $2 $3",
    ["[1-6]|7[24-68]"],
    "0$1",
    ""],
    [,
    "(7[137]\\d)(\\d{3})(\\d{3})",
    "$1 $2 $3",
    ["7[137]"],
    "0$1",
    ""]],
    ,
    [,
    ,
    "NA",
    "NA"],
    ,
    ,
    [,
    ,
    "NA",
    "NA"],
    [,
    ,
    "NA",
    "NA"]],
    YT: [,
    [,
    ,
    "[268]\\d{8}",
    "\\d{9}"],
    [,
    ,
    "2696[0-4]\\d{4}",
    "\\d{9}"],
    [,
    ,
    "639\\d{6}",
    "\\d{9}"],
    [,
    ,
    "80\\d{7}",
    "\\d{9}"],
    [,
    ,
    "NA",
    "NA"],
    [,
    ,
    "NA",
    "NA"],
    [,
    ,
    "NA",
    "NA"],
    [,
    ,
    "NA",
    "NA"],
    "YT",
    262,
    "00",
    "0",
    ,
    ,
    "0",
    ,
    ,
    ,
    ,
    ,
    [,
    ,
    "NA",
    "NA"],
    ,
    "269|63",
    [,
    ,
    "NA",
    "NA"],
    [,
    ,
    "NA",
    "NA"]],
    ZA: [,
    [,
    ,
    "\\d{9}",
    "\\d{8,9}"],
    [,
    ,
    "(?:1[0-8]|2[1-478]|3[1-69]|4\\d|5[1346-8])\\d{7}",
    "\\d{8,9}"],
    [,
    ,
    "(?:7[1-4689]|8[1-5789])\\d{7}",
    "\\d{9}"],
    [,
    ,
    "80\\d{7}",
    "\\d{9}"],
    [,
    ,
    "86[1-9]\\d{6}",
    "\\d{9}"],
    [,
    ,
    "860\\d{6}",
    "\\d{9}"],
    [,
    ,
    "NA",
    "NA"],
    [,
    ,
    "87\\d{7}",
    "\\d{9}"],
    "ZA",
    27,
    "00",
    "0",
    ,
    ,
    "0",
    ,
    ,
    ,
    [[,
    "(860)(\\d{3})(\\d{3})",
    "$1 $2 $3",
    ["860"],
    "0$1",
    ""],
    [,
    "([1-578]\\d)(\\d{3})(\\d{4})",
    "$1 $2 $3",
    ["[1-57]|8(?:[0-57-9]|6[1-9])"],
    "0$1",
    ""]],
    ,
    [,
    ,
    "NA",
    "NA"],
    ,
    ,
    [,
    ,
    "NA",
    "NA"],
    [,
    ,
    "NA",
    "NA"]],
    ZM: [,
    [,
    ,
    "[289]\\d{8}",
    "\\d{9}"],
    [,
    ,
    "21[1-8]\\d{6}",
    "\\d{9}"],
    [,
    ,
    "9(?:55|6[3-9]|7[4-9])\\d{6}",
    "\\d{9}"],
    [,
    ,
    "800\\d{6}",
    "\\d{9}"],
    [,
    ,
    "NA",
    "NA"],
    [,
    ,
    "NA",
    "NA"],
    [,
    ,
    "NA",
    "NA"],
    [,
    ,
    "NA",
    "NA"],
    "ZM",
    260,
    "00",
    "0",
    ,
    ,
    "0",
    ,
    ,
    ,
    [[,
    "([29]\\d)(\\d{7})",
    "$1 $2",
    ["[29]"],
    "0$1",
    ""],
    [,
    "(800)(\\d{3})(\\d{3})",
    "$1 $2 $3",
    ["8"],
    "0$1",
    ""]],
    ,
    [,
    ,
    "NA",
    "NA"],
    ,
    ,
    [,
    ,
    "NA",
    "NA"],
    [,
    ,
    "NA",
    "NA"]],
    ZW: [,
    [,
    ,
    "2(?:[012457-9]\\d{3,8}|6\\d{3,6})|[13-79]\\d{4,8}|86\\d{8}",
    "\\d{3,10}"],
    [,
    ,
    "(?:1[3-9]|2(?:0[45]|[16]|2[28]|[49]8?|58[23]|7[246]|8[1346-9])|3(?:08?|17?|3[78]|[2456]|7[1569]|8[379])|5(?:[07-9]|1[78]|483|5(?:7?|8))|6(?:0|28|37?|[45][68][78]|98?)|848)\\d{3,6}|(?:2(?:27|5|7[135789]|8[25])|3[39]|5[1-46]|6[126-8])\\d{4,6}|2(?:0|70)\\d{5,6}|(?:4\\d|9[2-8])\\d{4,7}",
    "\\d{3,10}"],
    [,
    ,
    "7[137]\\d{7}",
    "\\d{9}"],
    [,
    ,
    "NA",
    "NA"],
    [,
    ,
    "NA",
    "NA"],
    [,
    ,
    "NA",
    "NA"],
    [,
    ,
    "NA",
    "NA"],
    [,
    ,
    "86(?:1[12]|22|30|44|8[367]|99)\\d{6}",
    "\\d{10}"],
    "ZW",
    263,
    "00",
    "0",
    ,
    ,
    "0",
    ,
    ,
    ,
    [[,
    "([49])(\\d{3})(\\d{2,5})",
    "$1 $2 $3",
    ["4|9[2-9]"],
    "0$1",
    ""],
    [,
    "([179]\\d)(\\d{3})(\\d{3,4})",
    "$1 $2 $3",
    ["[19]1|7"],
    "0$1",
    ""],
    [,
    "([1-356]\\d)(\\d{3,5})",
    "$1 $2",
    ["1[3-9]|2(?:[1-469]|0[0-35-9]|[45][0-79])|3(?:0[0-79]|1[0-689]|[24-69]|3[0-69])|5(?:[02-46-9]|[15][0-69])|6(?:[0145]|[29][0-79]|3[0-689]|[68][0-69])"],
    "0$1",
    ""],
    [,
    "([1-356]\\d)(\\d{3})(\\d{3})",
    "$1 $2 $3",
    ["1[3-9]|2(?:[1-469]|0[0-35-9]|[45][0-79])|3(?:0[0-79]|1[0-689]|[24-69]|3[0-69])|5(?:[02-46-9]|[15][0-69])|6(?:[0145]|[29][0-79]|3[0-689]|[68][0-69])"],
    "0$1",
    ""],
    [,
    "([2356]\\d{2})(\\d{3,5})",
    "$1 $2",
    ["2(?:[278]|0[45]|48)|3(?:08|17|3[78]|[78])|5[15][78]|6(?:[29]8|37|[68][78])"],
    "0$1",
    ""],
    [,
    "([2356]\\d{2})(\\d{3})(\\d{3})",
    "$1 $2 $3",
    ["2(?:[278]|0[45]|48)|3(?:08|17|3[78]|[78])|5[15][78]|6(?:[29]8|37|[68][78])"],
    "0$1",
    ""],
    [,
    "([25]\\d{3})(\\d{3,5})",
    "$1 $2",
    ["(?:25|54)8",
    "258[23]|5483"],
    "0$1",
    ""],
    [,
    "([25]\\d{3})(\\d{3})(\\d{3})",
    "$1 $2 $3",
    ["(?:25|54)8",
    "258[23]|5483"],
    "0$1",
    ""],
    [,
    "(8\\d{3})(\\d{6})",
    "$1 $2",
    ["8"],
    "0$1",
    ""]],
    ,
    [,
    ,
    "NA",
    "NA"],
    ,
    ,
    [,
    ,
    "NA",
    "NA"],
    [,
    ,
    "NA",
    "NA"]]
};
goog.provide("i18n.phonenumbers.PhoneNumber");
goog.provide("i18n.phonenumbers.PhoneNumber.CountryCodeSource");
goog.require("goog.proto2.Message");
i18n.phonenumbers.PhoneNumber = function() {
    goog.proto2.Message.apply(this)
};
goog.inherits(i18n.phonenumbers.PhoneNumber, goog.proto2.Message);
i18n.phonenumbers.PhoneNumber.prototype.clone;
i18n.phonenumbers.PhoneNumber.prototype.getCountryCode = function() {
    return (this.get$Value(1))
};
i18n.phonenumbers.PhoneNumber.prototype.getCountryCodeOrDefault = function() {
    return (this.get$ValueOrDefault(1))
};
i18n.phonenumbers.PhoneNumber.prototype.setCountryCode = function(a) {
    this.set$Value(1, a)
};
i18n.phonenumbers.PhoneNumber.prototype.hasCountryCode = function() {
    return this.has$Value(1)
};
i18n.phonenumbers.PhoneNumber.prototype.countryCodeCount = function() {
    return this.count$Values(1)
};
i18n.phonenumbers.PhoneNumber.prototype.clearCountryCode = function() {
    this.clear$Field(1)
};
i18n.phonenumbers.PhoneNumber.prototype.getNationalNumber = function() {
    return (this.get$Value(2))
};
i18n.phonenumbers.PhoneNumber.prototype.getNationalNumberOrDefault = function() {
    return (this.get$ValueOrDefault(2))
};
i18n.phonenumbers.PhoneNumber.prototype.setNationalNumber = function(a) {
    this.set$Value(2, a)
};
i18n.phonenumbers.PhoneNumber.prototype.hasNationalNumber = function() {
    return this.has$Value(2)
};
i18n.phonenumbers.PhoneNumber.prototype.nationalNumberCount = function() {
    return this.count$Values(2)
};
i18n.phonenumbers.PhoneNumber.prototype.clearNationalNumber = function() {
    this.clear$Field(2)
};
i18n.phonenumbers.PhoneNumber.prototype.getExtension = function() {
    return (this.get$Value(3))
};
i18n.phonenumbers.PhoneNumber.prototype.getExtensionOrDefault = function() {
    return (this.get$ValueOrDefault(3))
};
i18n.phonenumbers.PhoneNumber.prototype.setExtension = function(a) {
    this.set$Value(3, a)
};
i18n.phonenumbers.PhoneNumber.prototype.hasExtension = function() {
    return this.has$Value(3)
};
i18n.phonenumbers.PhoneNumber.prototype.extensionCount = function() {
    return this.count$Values(3)
};
i18n.phonenumbers.PhoneNumber.prototype.clearExtension = function() {
    this.clear$Field(3)
};
i18n.phonenumbers.PhoneNumber.prototype.getItalianLeadingZero = function() {
    return (this.get$Value(4))
};
i18n.phonenumbers.PhoneNumber.prototype.getItalianLeadingZeroOrDefault = function() {
    return (this.get$ValueOrDefault(4))
};
i18n.phonenumbers.PhoneNumber.prototype.setItalianLeadingZero = function(a) {
    this.set$Value(4, a)
};
i18n.phonenumbers.PhoneNumber.prototype.hasItalianLeadingZero = function() {
    return this.has$Value(4)
};
i18n.phonenumbers.PhoneNumber.prototype.italianLeadingZeroCount = function() {
    return this.count$Values(4)
};
i18n.phonenumbers.PhoneNumber.prototype.clearItalianLeadingZero = function() {
    this.clear$Field(4)
};
i18n.phonenumbers.PhoneNumber.prototype.getRawInput = function() {
    return (this.get$Value(5))
};
i18n.phonenumbers.PhoneNumber.prototype.getRawInputOrDefault = function() {
    return (this.get$ValueOrDefault(5))
};
i18n.phonenumbers.PhoneNumber.prototype.setRawInput = function(a) {
    this.set$Value(5, a)
};
i18n.phonenumbers.PhoneNumber.prototype.hasRawInput = function() {
    return this.has$Value(5)
};
i18n.phonenumbers.PhoneNumber.prototype.rawInputCount = function() {
    return this.count$Values(5)
};
i18n.phonenumbers.PhoneNumber.prototype.clearRawInput = function() {
    this.clear$Field(5)
};
i18n.phonenumbers.PhoneNumber.prototype.getCountryCodeSource = function() {
    return (this.get$Value(6))
};
i18n.phonenumbers.PhoneNumber.prototype.getCountryCodeSourceOrDefault = function() {
    return (this.get$ValueOrDefault(6))
};
i18n.phonenumbers.PhoneNumber.prototype.setCountryCodeSource = function(a) {
    this.set$Value(6, a)
};
i18n.phonenumbers.PhoneNumber.prototype.hasCountryCodeSource = function() {
    return this.has$Value(6)
};
i18n.phonenumbers.PhoneNumber.prototype.countryCodeSourceCount = function() {
    return this.count$Values(6)
};
i18n.phonenumbers.PhoneNumber.prototype.clearCountryCodeSource = function() {
    this.clear$Field(6)
};
i18n.phonenumbers.PhoneNumber.prototype.getPreferredDomesticCarrierCode = function() {
    return (this.get$Value(7))
};
i18n.phonenumbers.PhoneNumber.prototype.getPreferredDomesticCarrierCodeOrDefault = function() {
    return (this.get$ValueOrDefault(7))
};
i18n.phonenumbers.PhoneNumber.prototype.setPreferredDomesticCarrierCode = function(a) {
    this.set$Value(7, a)
};
i18n.phonenumbers.PhoneNumber.prototype.hasPreferredDomesticCarrierCode = function() {
    return this.has$Value(7)
};
i18n.phonenumbers.PhoneNumber.prototype.preferredDomesticCarrierCodeCount = function() {
    return this.count$Values(7)
};
i18n.phonenumbers.PhoneNumber.prototype.clearPreferredDomesticCarrierCode = function() {
    this.clear$Field(7)
};
i18n.phonenumbers.PhoneNumber.CountryCodeSource = {
    FROM_NUMBER_WITH_PLUS_SIGN: 1,
    FROM_NUMBER_WITH_IDD: 5,
    FROM_NUMBER_WITHOUT_PLUS_SIGN: 10,
    FROM_DEFAULT_COUNTRY: 20
};
goog.proto2.Message.set$Metadata(i18n.phonenumbers.PhoneNumber, {
    0: {
        name: "PhoneNumber",
        fullName: "i18n.phonenumbers.PhoneNumber"
    },
    1: {
        name: "country_code",
        required: true,
        fieldType: goog.proto2.Message.FieldType.INT32,
        type: Number
    },
    2: {
        name: "national_number",
        required: true,
        fieldType: goog.proto2.Message.FieldType.UINT64,
        type: Number
    },
    3: {
        name: "extension",
        fieldType: goog.proto2.Message.FieldType.STRING,
        type: String
    },
    4: {
        name: "italian_leading_zero",
        fieldType: goog.proto2.Message.FieldType.BOOL,
        type: Boolean
    },
    5: {
        name: "raw_input",
        fieldType: goog.proto2.Message.FieldType.STRING,
        type: String
    },
    6: {
        name: "country_code_source",
        fieldType: goog.proto2.Message.FieldType.ENUM,
        defaultValue: i18n.phonenumbers.PhoneNumber.CountryCodeSource.FROM_NUMBER_WITH_PLUS_SIGN,
        type: i18n.phonenumbers.PhoneNumber.CountryCodeSource
    },
    7: {
        name: "preferred_domestic_carrier_code",
        fieldType: goog.proto2.Message.FieldType.STRING,
        type: String
    }
});
goog.provide("i18n.phonenumbers.Error");
goog.provide("i18n.phonenumbers.PhoneNumberFormat");
goog.provide("i18n.phonenumbers.PhoneNumberType");
goog.provide("i18n.phonenumbers.PhoneNumberUtil");
goog.require("goog.array");
goog.require("goog.proto2.PbLiteSerializer");
goog.require("goog.string");
goog.require("goog.string.StringBuffer");
goog.require("i18n.phonenumbers.NumberFormat");
goog.require("i18n.phonenumbers.PhoneMetadata");
goog.require("i18n.phonenumbers.PhoneMetadataCollection");
goog.require("i18n.phonenumbers.PhoneNumber");
goog.require("i18n.phonenumbers.PhoneNumber.CountryCodeSource");
goog.require("i18n.phonenumbers.PhoneNumberDesc");
goog.require("i18n.phonenumbers.metadata");
i18n.phonenumbers.PhoneNumberUtil = function() {
    this.regionToMetadataMap = {}
};
goog.addSingletonGetter(i18n.phonenumbers.PhoneNumberUtil);
i18n.phonenumbers.Error = {
    INVALID_COUNTRY_CODE: "Invalid country calling code",
    NOT_A_NUMBER: "The string supplied did not seem to be a phone number",
    TOO_SHORT_AFTER_IDD: "Phone number too short after IDD",
    TOO_SHORT_NSN: "The string supplied is too short to be a phone number",
    TOO_LONG: "The string supplied is too long to be a phone number"
};
i18n.phonenumbers.PhoneNumberUtil.NANPA_COUNTRY_CODE_ = 1;
i18n.phonenumbers.PhoneNumberUtil.MIN_LENGTH_FOR_NSN_ = 3;
i18n.phonenumbers.PhoneNumberUtil.MAX_LENGTH_FOR_NSN_ = 15;
i18n.phonenumbers.PhoneNumberUtil.MAX_LENGTH_COUNTRY_CODE_ = 3;
i18n.phonenumbers.PhoneNumberUtil.UNKNOWN_REGION_ = "ZZ";
i18n.phonenumbers.PhoneNumberUtil.PLUS_SIGN = "+";
i18n.phonenumbers.PhoneNumberUtil.RFC3966_EXTN_PREFIX_ = ";ext=";
i18n.phonenumbers.PhoneNumberUtil.DIGIT_MAPPINGS = {
    "0": "0",
    "1": "1",
    "2": "2",
    "3": "3",
    "4": "4",
    "5": "5",
    "6": "6",
    "7": "7",
    "8": "8",
    "9": "9",
    "\uFF10": "0",
    "\uFF11": "1",
    "\uFF12": "2",
    "\uFF13": "3",
    "\uFF14": "4",
    "\uFF15": "5",
    "\uFF16": "6",
    "\uFF17": "7",
    "\uFF18": "8",
    "\uFF19": "9",
    "\u0660": "0",
    "\u0661": "1",
    "\u0662": "2",
    "\u0663": "3",
    "\u0664": "4",
    "\u0665": "5",
    "\u0666": "6",
    "\u0667": "7",
    "\u0668": "8",
    "\u0669": "9",
    "\u06F0": "0",
    "\u06F1": "1",
    "\u06F2": "2",
    "\u06F3": "3",
    "\u06F4": "4",
    "\u06F5": "5",
    "\u06F6": "6",
    "\u06F7": "7",
    "\u06F8": "8",
    "\u06F9": "9"
};
i18n.phonenumbers.PhoneNumberUtil.ALPHA_MAPPINGS_ = {
    A: "2",
    B: "2",
    C: "2",
    D: "3",
    E: "3",
    F: "3",
    G: "4",
    H: "4",
    I: "4",
    J: "5",
    K: "5",
    L: "5",
    M: "6",
    N: "6",
    O: "6",
    P: "7",
    Q: "7",
    R: "7",
    S: "7",
    T: "8",
    U: "8",
    V: "8",
    W: "9",
    X: "9",
    Y: "9",
    Z: "9"
};
i18n.phonenumbers.PhoneNumberUtil.ALL_NORMALIZATION_MAPPINGS_ = {
    "0": "0",
    "1": "1",
    "2": "2",
    "3": "3",
    "4": "4",
    "5": "5",
    "6": "6",
    "7": "7",
    "8": "8",
    "9": "9",
    "\uFF10": "0",
    "\uFF11": "1",
    "\uFF12": "2",
    "\uFF13": "3",
    "\uFF14": "4",
    "\uFF15": "5",
    "\uFF16": "6",
    "\uFF17": "7",
    "\uFF18": "8",
    "\uFF19": "9",
    "\u0660": "0",
    "\u0661": "1",
    "\u0662": "2",
    "\u0663": "3",
    "\u0664": "4",
    "\u0665": "5",
    "\u0666": "6",
    "\u0667": "7",
    "\u0668": "8",
    "\u0669": "9",
    "\u06F0": "0",
    "\u06F1": "1",
    "\u06F2": "2",
    "\u06F3": "3",
    "\u06F4": "4",
    "\u06F5": "5",
    "\u06F6": "6",
    "\u06F7": "7",
    "\u06F8": "8",
    "\u06F9": "9",
    A: "2",
    B: "2",
    C: "2",
    D: "3",
    E: "3",
    F: "3",
    G: "4",
    H: "4",
    I: "4",
    J: "5",
    K: "5",
    L: "5",
    M: "6",
    N: "6",
    O: "6",
    P: "7",
    Q: "7",
    R: "7",
    S: "7",
    T: "8",
    U: "8",
    V: "8",
    W: "9",
    X: "9",
    Y: "9",
    Z: "9"
};
i18n.phonenumbers.PhoneNumberUtil.ALL_PLUS_NUMBER_GROUPING_SYMBOLS_ = {
    "0": "0",
    "1": "1",
    "2": "2",
    "3": "3",
    "4": "4",
    "5": "5",
    "6": "6",
    "7": "7",
    "8": "8",
    "9": "9",
    A: "A",
    B: "B",
    C: "C",
    D: "D",
    E: "E",
    F: "F",
    G: "G",
    H: "H",
    I: "I",
    J: "J",
    K: "K",
    L: "L",
    M: "M",
    N: "N",
    O: "O",
    P: "P",
    Q: "Q",
    R: "R",
    S: "S",
    T: "T",
    U: "U",
    V: "V",
    W: "W",
    X: "X",
    Y: "Y",
    Z: "Z",
    a: "A",
    b: "B",
    c: "C",
    d: "D",
    e: "E",
    f: "F",
    g: "G",
    h: "H",
    i: "I",
    j: "J",
    k: "K",
    l: "L",
    m: "M",
    n: "N",
    o: "O",
    p: "P",
    q: "Q",
    r: "R",
    s: "S",
    t: "T",
    u: "U",
    v: "V",
    w: "W",
    x: "X",
    y: "Y",
    z: "Z",
    "-": "-",
    "\uFF0D": "-",
    "\u2010": "-",
    "\u2011": "-",
    "\u2012": "-",
    "\u2013": "-",
    "\u2014": "-",
    "\u2015": "-",
    "\u2212": "-",
    "/": "/",
    "\uFF0F": "/",
    " ": " ",
    "\u3000": " ",
    "\u2060": " ",
    ".": ".",
    "\uFF0E": "."
};
i18n.phonenumbers.PhoneNumberUtil.UNIQUE_INTERNATIONAL_PREFIX_ = /[\d]+(?:[~\u2053\u223C\uFF5E][\d]+)?/;
i18n.phonenumbers.PhoneNumberUtil.VALID_PUNCTUATION = "-x\u2010-\u2015\u2212\u30FC\uFF0D-\uFF0F \u00A0\u200B\u2060\u3000()\uFF08\uFF09\uFF3B\uFF3D.\\[\\]/~\u2053\u223C\uFF5E";
i18n.phonenumbers.PhoneNumberUtil.VALID_DIGITS_ = "0-9\uFF10-\uFF19\u0660-\u0669\u06F0-\u06F9";
i18n.phonenumbers.PhoneNumberUtil.VALID_ALPHA_ = "A-Za-z";
i18n.phonenumbers.PhoneNumberUtil.PLUS_CHARS_ = "+\uFF0B";
i18n.phonenumbers.PhoneNumberUtil.PLUS_CHARS_PATTERN_ = new RegExp("^[" + i18n.phonenumbers.PhoneNumberUtil.PLUS_CHARS_ + "]+");
i18n.phonenumbers.PhoneNumberUtil.SEPARATOR_PATTERN_ = new RegExp("[" + i18n.phonenumbers.PhoneNumberUtil.VALID_PUNCTUATION + "]+", "g");
i18n.phonenumbers.PhoneNumberUtil.CAPTURING_DIGIT_PATTERN_ = new RegExp("([" + i18n.phonenumbers.PhoneNumberUtil.VALID_DIGITS_ + "])");
i18n.phonenumbers.PhoneNumberUtil.VALID_START_CHAR_PATTERN = new RegExp("[" + i18n.phonenumbers.PhoneNumberUtil.PLUS_CHARS_ + i18n.phonenumbers.PhoneNumberUtil.VALID_DIGITS_ + "]");
i18n.phonenumbers.PhoneNumberUtil.SECOND_NUMBER_START_PATTERN_ = /[\\\/] *x/;
i18n.phonenumbers.PhoneNumberUtil.UNWANTED_END_CHAR_PATTERN_ = new RegExp("[^" + i18n.phonenumbers.PhoneNumberUtil.VALID_DIGITS_ + i18n.phonenumbers.PhoneNumberUtil.VALID_ALPHA_ + "#]+$");
i18n.phonenumbers.PhoneNumberUtil.VALID_ALPHA_PHONE_PATTERN_ = /(?:.*?[A-Za-z]){3}.*/;
i18n.phonenumbers.PhoneNumberUtil.VALID_PHONE_NUMBER_ = "[" + i18n.phonenumbers.PhoneNumberUtil.PLUS_CHARS_ + "]*(?:[" + i18n.phonenumbers.PhoneNumberUtil.VALID_PUNCTUATION + "]*[" + i18n.phonenumbers.PhoneNumberUtil.VALID_DIGITS_ + "]){3,}[" + i18n.phonenumbers.PhoneNumberUtil.VALID_PUNCTUATION + i18n.phonenumbers.PhoneNumberUtil.VALID_ALPHA_ + i18n.phonenumbers.PhoneNumberUtil.VALID_DIGITS_ + "]*";
i18n.phonenumbers.PhoneNumberUtil.DEFAULT_EXTN_PREFIX_ = " ext. ";
i18n.phonenumbers.PhoneNumberUtil.CAPTURING_EXTN_DIGITS_ = "([" + i18n.phonenumbers.PhoneNumberUtil.VALID_DIGITS_ + "]{1,7})";
i18n.phonenumbers.PhoneNumberUtil.KNOWN_EXTN_PATTERNS_ = i18n.phonenumbers.PhoneNumberUtil.RFC3966_EXTN_PREFIX_ + i18n.phonenumbers.PhoneNumberUtil.CAPTURING_EXTN_DIGITS_ + "|[ \u00A0\\t,]*(?:ext(?:ensi(?:o\u0301?|\u00F3))?n?|\uFF45\uFF58\uFF54\uFF4E?|[,x\uFF58#\uFF03~\uFF5E]|int|anexo|\uFF49\uFF4E\uFF54)[:\\.\uFF0E]?[ \u00A0\\t,-]*" + i18n.phonenumbers.PhoneNumberUtil.CAPTURING_EXTN_DIGITS_ + "#?|[- ]+([" + i18n.phonenumbers.PhoneNumberUtil.VALID_DIGITS_ + "]{1,5})#";
i18n.phonenumbers.PhoneNumberUtil.EXTN_PATTERN_ = new RegExp("(?:" + i18n.phonenumbers.PhoneNumberUtil.KNOWN_EXTN_PATTERNS_ + ")$", "i");
i18n.phonenumbers.PhoneNumberUtil.VALID_PHONE_NUMBER_PATTERN_ = new RegExp("^" + i18n.phonenumbers.PhoneNumberUtil.VALID_PHONE_NUMBER_ + "(?:" + i18n.phonenumbers.PhoneNumberUtil.KNOWN_EXTN_PATTERNS_ + ")?$", "i");
i18n.phonenumbers.PhoneNumberUtil.NON_DIGITS_PATTERN_ = /\D+/;
i18n.phonenumbers.PhoneNumberUtil.FIRST_GROUP_PATTERN_ = /(\$\d)/;
i18n.phonenumbers.PhoneNumberUtil.NP_PATTERN_ = /\$NP/;
i18n.phonenumbers.PhoneNumberUtil.FG_PATTERN_ = /\$FG/;
i18n.phonenumbers.PhoneNumberUtil.CC_PATTERN_ = /\$CC/;
i18n.phonenumbers.PhoneNumberFormat = {
    E164: 0,
    INTERNATIONAL: 1,
    NATIONAL: 2,
    RFC3966: 3
};
i18n.phonenumbers.PhoneNumberType = {
    FIXED_LINE: 0,
    MOBILE: 1,
    FIXED_LINE_OR_MOBILE: 2,
    TOLL_FREE: 3,
    PREMIUM_RATE: 4,
    SHARED_COST: 5,
    VOIP: 6,
    PERSONAL_NUMBER: 7,
    PAGER: 8,
    UAN: 9,
    UNKNOWN: 10
};
i18n.phonenumbers.PhoneNumberUtil.MatchType = {
    NOT_A_NUMBER: 0,
    NO_MATCH: 1,
    SHORT_NSN_MATCH: 2,
    NSN_MATCH: 3,
    EXACT_MATCH: 4
};
i18n.phonenumbers.PhoneNumberUtil.ValidationResult = {
    IS_POSSIBLE: 0,
    INVALID_COUNTRY_CODE: 1,
    TOO_SHORT: 2,
    TOO_LONG: 3
};
i18n.phonenumbers.PhoneNumberUtil.extractPossibleNumber = function(c) {
    var b;
    var d = c.search(i18n.phonenumbers.PhoneNumberUtil.VALID_START_CHAR_PATTERN);
    if (d >= 0) {
        b = c.substring(d);
        b = b.replace(i18n.phonenumbers.PhoneNumberUtil.UNWANTED_END_CHAR_PATTERN_, "");
        var a = b.search(i18n.phonenumbers.PhoneNumberUtil.SECOND_NUMBER_START_PATTERN_);
        if (a >= 0) {
            b = b.substring(0, a)
        }
    } else {
        b = ""
    }
    return b
};
i18n.phonenumbers.PhoneNumberUtil.isViablePhoneNumber = function(a) {
    if (a.length < i18n.phonenumbers.PhoneNumberUtil.MIN_LENGTH_FOR_NSN_) {
        return false
    }
    return i18n.phonenumbers.PhoneNumberUtil.matchesEntirely_(i18n.phonenumbers.PhoneNumberUtil.VALID_PHONE_NUMBER_PATTERN_, a)
};
i18n.phonenumbers.PhoneNumberUtil.normalize = function(a) {
    if (i18n.phonenumbers.PhoneNumberUtil.matchesEntirely_(i18n.phonenumbers.PhoneNumberUtil.VALID_ALPHA_PHONE_PATTERN_, a)) {
        return i18n.phonenumbers.PhoneNumberUtil.normalizeHelper_(a, i18n.phonenumbers.PhoneNumberUtil.ALL_NORMALIZATION_MAPPINGS_, true)
    } else {
        return i18n.phonenumbers.PhoneNumberUtil.normalizeHelper_(a, i18n.phonenumbers.PhoneNumberUtil.DIGIT_MAPPINGS, true)
    }
};
i18n.phonenumbers.PhoneNumberUtil.normalizeSB_ = function(b) {
    var a = i18n.phonenumbers.PhoneNumberUtil.normalize(b.toString());
    b.clear();
    b.append(a)
};
i18n.phonenumbers.PhoneNumberUtil.normalizeDigitsOnly = function(a) {
    return i18n.phonenumbers.PhoneNumberUtil.normalizeHelper_(a, i18n.phonenumbers.PhoneNumberUtil.DIGIT_MAPPINGS, true)
};
i18n.phonenumbers.PhoneNumberUtil.convertAlphaCharactersInNumber = function(a) {
    return i18n.phonenumbers.PhoneNumberUtil.normalizeHelper_(a, i18n.phonenumbers.PhoneNumberUtil.ALL_NORMALIZATION_MAPPINGS_, false)
};
i18n.phonenumbers.PhoneNumberUtil.prototype.getLengthOfGeographicalAreaCode = function(d) {
    if (d == null) {
        return 0
    }
    var a = this.getRegionCodeForNumber(d);
    if (!this.isValidRegionCode_(a)) {
        return 0
    }
    var b = this.getMetadataForRegion(a);
    if (!b.hasNationalPrefix()) {
        return 0
    }
    var c = this.getNumberTypeHelper_(this.getNationalSignificantNumber(d), b);
    if (c != i18n.phonenumbers.PhoneNumberType.FIXED_LINE && c != i18n.phonenumbers.PhoneNumberType.FIXED_LINE_OR_MOBILE) {
        return 0
    }
    return this.getLengthOfNationalDestinationCode(d)
};
i18n.phonenumbers.PhoneNumberUtil.prototype.getLengthOfNationalDestinationCode = function(c) {
    var d;
    if (c.hasExtension()) {
        d = c.clone();
        d.clearExtension()
    } else {
        d = c
    }
    var b = this.format(d, i18n.phonenumbers.PhoneNumberFormat.INTERNATIONAL);
    var a = b.split(i18n.phonenumbers.PhoneNumberUtil.NON_DIGITS_PATTERN_);
    if (a[0].length == 0) {
        a.shift()
    }
    if (a.length <= 2) {
        return 0
    }
    if (this.getRegionCodeForNumber(c) == "AR" && this.getNumberType(c) == i18n.phonenumbers.PhoneNumberType.MOBILE) {
        return a[2].length + 1
    }
    return a[1].length
};
i18n.phonenumbers.PhoneNumberUtil.normalizeHelper_ = function(f, d, b) {
    var e = new goog.string.StringBuffer();
    var g;
    var a;
    var h = f.length;
    for (var c = 0; c < h; ++c) {
        g = f.charAt(c);
        a = d[g.toUpperCase()];
        if (a != null) {
            e.append(a)
        } else {
            if (!b) {
                e.append(g)
            }
        }
    }
    return e.toString()
};
i18n.phonenumbers.PhoneNumberUtil.prototype.isValidRegionCode_ = function(a) {
    return a != null && a.toUpperCase() in i18n.phonenumbers.metadata.countryToMetadata
};
i18n.phonenumbers.PhoneNumberUtil.prototype.format = function(f, a) {
    var d = f.getCountryCodeOrDefault();
    var e = this.getNationalSignificantNumber(f);
    if (a == i18n.phonenumbers.PhoneNumberFormat.E164) {
        return this.formatNumberByFormat_(d, i18n.phonenumbers.PhoneNumberFormat.E164, e, "")
    }
    var c = this.getRegionCodeForCountryCode(d);
    if (!this.isValidRegionCode_(c)) {
        return e
    }
    var g = this.maybeGetFormattedExtension_(f, c, a);
    var b = this.formatNationalNumber_(e, c, a);
    return this.formatNumberByFormat_(d, a, b, g)
};
i18n.phonenumbers.PhoneNumberUtil.prototype.formatByPattern = function(e, j, a) {
    var m = e.getCountryCodeOrDefault();
    var n = this.getNationalSignificantNumber(e);
    var b = this.getRegionCodeForCountryCode(m);
    if (!this.isValidRegionCode_(b)) {
        return n
    }
    var h = [];
    var p = a.length;
    for (var f = 0; f < p; ++f) {
        var k = a[f];
        var o = k.getNationalPrefixFormattingRuleOrDefault();
        if (o.length > 0) {
            var c = k.clone();
            var g = this.getMetadataForRegion(b).getNationalPrefixOrDefault();
            if (g.length > 0) {
                o = o.replace(i18n.phonenumbers.PhoneNumberUtil.NP_PATTERN_, g).replace(i18n.phonenumbers.PhoneNumberUtil.FG_PATTERN_, "$1");
                c.setNationalPrefixFormattingRule(o)
            } else {
                c.clearNationalPrefixFormattingRule()
            }
            h.push(c)
        } else {
            h.push(k)
        }
    }
    var d = this.maybeGetFormattedExtension_(e, b, j);
    var l = this.formatAccordingToFormats_(n, h, j);
    return this.formatNumberByFormat_(m, j, l, d)
};
i18n.phonenumbers.PhoneNumberUtil.prototype.formatNationalNumberWithCarrierCode = function(f, e) {
    var c = f.getCountryCodeOrDefault();
    var d = this.getNationalSignificantNumber(f);
    var b = this.getRegionCodeForCountryCode(c);
    if (!this.isValidRegionCode_(b)) {
        return d
    }
    var g = this.maybeGetFormattedExtension_(f, b, i18n.phonenumbers.PhoneNumberFormat.NATIONAL);
    var a = this.formatNationalNumber_(d, b, i18n.phonenumbers.PhoneNumberFormat.NATIONAL, e);
    return this.formatNumberByFormat_(c, i18n.phonenumbers.PhoneNumberFormat.NATIONAL, a, g)
};
i18n.phonenumbers.PhoneNumberUtil.prototype.formatNationalNumberWithPreferredCarrierCode = function(b, a) {
    return this.formatNationalNumberWithCarrierCode(b, b.hasPreferredDomesticCarrierCode() ? b.getPreferredDomesticCarrierCodeOrDefault() : a)
};
i18n.phonenumbers.PhoneNumberUtil.prototype.formatOutOfCountryCallingNumber = function(d, c) {
    if (!this.isValidRegionCode_(c)) {
        return this.format(d, i18n.phonenumbers.PhoneNumberFormat.INTERNATIONAL)
    }
    var i = d.getCountryCodeOrDefault();
    var a = this.getRegionCodeForCountryCode(i);
    var j = this.getNationalSignificantNumber(d);
    if (!this.isValidRegionCode_(a)) {
        return j
    }
    if (i == i18n.phonenumbers.PhoneNumberUtil.NANPA_COUNTRY_CODE_) {
        if (this.isNANPACountry(c)) {
            return i + " " + this.format(d, i18n.phonenumbers.PhoneNumberFormat.NATIONAL)
        }
    } else {
        if (i == this.getCountryCodeForRegion(c)) {
            return this.format(d, i18n.phonenumbers.PhoneNumberFormat.NATIONAL)
        }
    }
    var h = this.formatNationalNumber_(j, a, i18n.phonenumbers.PhoneNumberFormat.INTERNATIONAL);
    var g = this.getMetadataForRegion(c);
    var f = g.getInternationalPrefixOrDefault();
    var b = this.maybeGetFormattedExtension_(d, a, i18n.phonenumbers.PhoneNumberFormat.INTERNATIONAL);
    var e = "";
    if (i18n.phonenumbers.PhoneNumberUtil.matchesEntirely_(i18n.phonenumbers.PhoneNumberUtil.UNIQUE_INTERNATIONAL_PREFIX_, f)) {
        e = f
    } else {
        if (g.hasPreferredInternationalPrefix()) {
            e = g.getPreferredInternationalPrefixOrDefault()
        }
    }
    return e.length > 0 ? e + " " + i + " " + h + b : this.formatNumberByFormat_(i, i18n.phonenumbers.PhoneNumberFormat.INTERNATIONAL, h, b)
};
i18n.phonenumbers.PhoneNumberUtil.prototype.formatInOriginalFormat = function(b, a) {
    if (!b.hasCountryCodeSource()) {
        return this.format(b, i18n.phonenumbers.PhoneNumberFormat.NATIONAL)
    }
    switch (b.getCountryCodeSource()) {
    case i18n.phonenumbers.PhoneNumber.CountryCodeSource.FROM_NUMBER_WITH_PLUS_SIGN:
        return this.format(b, i18n.phonenumbers.PhoneNumberFormat.INTERNATIONAL);
    case i18n.phonenumbers.PhoneNumber.CountryCodeSource.FROM_NUMBER_WITH_IDD:
        return this.formatOutOfCountryCallingNumber(b, a);
    case i18n.phonenumbers.PhoneNumber.CountryCodeSource.FROM_NUMBER_WITHOUT_PLUS_SIGN:
        return this.format(b, i18n.phonenumbers.PhoneNumberFormat.INTERNATIONAL).substring(1);
    case i18n.phonenumbers.PhoneNumber.CountryCodeSource.FROM_DEFAULT_COUNTRY:
    default:
        return this.format(b, i18n.phonenumbers.PhoneNumberFormat.NATIONAL)
    }
};
i18n.phonenumbers.PhoneNumberUtil.prototype.formatOutOfCountryKeepingAlphaChars = function(f, c) {
    var d = f.getRawInputOrDefault();
    if (d.length == 0) {
        return this.formatOutOfCountryCallingNumber(f, c)
    }
    var h = f.getCountryCodeOrDefault();
    var a = this.getRegionCodeForCountryCode(h);
    if (!this.isValidRegionCode_(a)) {
        return d
    }
    d = i18n.phonenumbers.PhoneNumberUtil.normalizeHelper_(d, i18n.phonenumbers.PhoneNumberUtil.ALL_PLUS_NUMBER_GROUPING_SYMBOLS_, true);
    var e = this.getNationalSignificantNumber(f);
    if (e.length > 3) {
        var o = d.indexOf(e.substring(0, 3));
        if (o!=-1) {
            d = d.substring(o)
        }
    }
    var m = this.getMetadataForRegion(c);
    if (h == i18n.phonenumbers.PhoneNumberUtil.NANPA_COUNTRY_CODE_) {
        if (this.isNANPACountry(c)) {
            return h + " " + d
        }
    } else {
        if (h == this.getCountryCodeForRegion(c)) {
            var l = [];
            for (var g = 0; g < m.numberFormatArray().length; ++g) {
                var n = m.numberFormatArray()[g].clone();
                n.setPattern("(\\d+)(.*)");
                n.setFormat("$1$2");
                l.push(n)
            }
            return this.formatAccordingToFormats_(d, l, i18n.phonenumbers.PhoneNumberFormat.NATIONAL)
        }
    }
    var k = m.getInternationalPrefixOrDefault();
    var j = i18n.phonenumbers.PhoneNumberUtil.matchesEntirely_(i18n.phonenumbers.PhoneNumberUtil.UNIQUE_INTERNATIONAL_PREFIX_, k) ? k: m.getPreferredInternationalPrefixOrDefault();
    var b = this.maybeGetFormattedExtension_(f, a, i18n.phonenumbers.PhoneNumberFormat.INTERNATIONAL);
    return j.length > 0 ? j + " " + h + " " + d + b : this.formatNumberByFormat_(h, i18n.phonenumbers.PhoneNumberFormat.INTERNATIONAL, d, b)
};
i18n.phonenumbers.PhoneNumberUtil.prototype.getNationalSignificantNumber = function(b) {
    var a = "" + b.getNationalNumber();
    if (b.hasItalianLeadingZero() && b.getItalianLeadingZero() && this.isLeadingZeroPossible(b.getCountryCodeOrDefault())) {
        return "0" + a
    }
    return a
};
i18n.phonenumbers.PhoneNumberUtil.prototype.formatNumberByFormat_ = function(c, a, b, d) {
    switch (a) {
    case i18n.phonenumbers.PhoneNumberFormat.E164:
        return i18n.phonenumbers.PhoneNumberUtil.PLUS_SIGN + c + b + d;
    case i18n.phonenumbers.PhoneNumberFormat.INTERNATIONAL:
        return i18n.phonenumbers.PhoneNumberUtil.PLUS_SIGN + c + " " + b + d;
    case i18n.phonenumbers.PhoneNumberFormat.RFC3966:
        return i18n.phonenumbers.PhoneNumberUtil.PLUS_SIGN + c + "-" + b + d;
    case i18n.phonenumbers.PhoneNumberFormat.NATIONAL:
    default:
        return b + d
    }
};
i18n.phonenumbers.PhoneNumberUtil.prototype.formatNationalNumber_ = function(h, d, a, c) {
    var f = this.getMetadataForRegion(d);
    var g = f.intlNumberFormatArray();
    var e = (g.length == 0 || a == i18n.phonenumbers.PhoneNumberFormat.NATIONAL) ? f.numberFormatArray(): f.intlNumberFormatArray();
    var b = this.formatAccordingToFormats_(h, e, a, c);
    if (a == i18n.phonenumbers.PhoneNumberFormat.RFC3966) {
        b = b.replace(i18n.phonenumbers.PhoneNumberUtil.SEPARATOR_PATTERN_, "-")
    }
    return b
};
i18n.phonenumbers.PhoneNumberUtil.prototype.formatAccordingToFormats_ = function(c, j, f, a) {
    var h;
    var b = j.length;
    for (var d = 0; d < b; ++d) {
        h = j[d];
        var o = h.leadingDigitsPatternCount();
        if (o == 0 || c.search(h.getLeadingDigitsPattern(o - 1)) == 0) {
            var k = new RegExp(h.getPattern());
            if (i18n.phonenumbers.PhoneNumberUtil.matchesEntirely_(k, c)) {
                var n = h.getFormatOrDefault();
                var g = h.getDomesticCarrierCodeFormattingRuleOrDefault();
                if (f == i18n.phonenumbers.PhoneNumberFormat.NATIONAL && a != null && a.length > 0 && g.length > 0) {
                    var e = g.replace(i18n.phonenumbers.PhoneNumberUtil.CC_PATTERN_, a);
                    n = n.replace(i18n.phonenumbers.PhoneNumberUtil.FIRST_GROUP_PATTERN_, e);
                    return c.replace(k, n)
                } else {
                    var m = h.getNationalPrefixFormattingRuleOrDefault();
                    if (f == i18n.phonenumbers.PhoneNumberFormat.NATIONAL && m != null && m.length > 0) {
                        return c.replace(k, n.replace(i18n.phonenumbers.PhoneNumberUtil.FIRST_GROUP_PATTERN_, m))
                    } else {
                        return c.replace(k, n)
                    }
                }
            }
        }
    }
    return c
};
i18n.phonenumbers.PhoneNumberUtil.prototype.getExampleNumber = function(a) {
    return this.getExampleNumberForType(a, i18n.phonenumbers.PhoneNumberType.FIXED_LINE)
};
i18n.phonenumbers.PhoneNumberUtil.prototype.getExampleNumberForType = function(a, b) {
    if (!this.isValidRegionCode_(a)) {
        return null
    }
    var d = this.getNumberDescByType_(this.getMetadataForRegion(a), b);
    try {
        if (d.hasExampleNumber()) {
            return this.parse(d.getExampleNumberOrDefault(), a)
        }
    } catch (c) {}
    return null
};
i18n.phonenumbers.PhoneNumberUtil.prototype.maybeGetFormattedExtension_ = function(c, b, a) {
    if (!c.hasExtension() || c.getExtension().length == 0) {
        return ""
    } else {
        if (a == i18n.phonenumbers.PhoneNumberFormat.RFC3966) {
            return i18n.phonenumbers.PhoneNumberUtil.RFC3966_EXTN_PREFIX_ + c.getExtension()
        }
        return this.formatExtension_(c.getExtensionOrDefault(), b)
    }
};
i18n.phonenumbers.PhoneNumberUtil.prototype.formatExtension_ = function(c, a) {
    var b = this.getMetadataForRegion(a);
    if (b.hasPreferredExtnPrefix()) {
        return b.getPreferredExtnPrefix() + c
    } else {
        return i18n.phonenumbers.PhoneNumberUtil.DEFAULT_EXTN_PREFIX_ + c
    }
};
i18n.phonenumbers.PhoneNumberUtil.prototype.getNumberDescByType_ = function(a, b) {
    switch (b) {
    case i18n.phonenumbers.PhoneNumberType.PREMIUM_RATE:
        return a.getPremiumRate();
    case i18n.phonenumbers.PhoneNumberType.TOLL_FREE:
        return a.getTollFree();
    case i18n.phonenumbers.PhoneNumberType.MOBILE:
        return a.getMobile();
    case i18n.phonenumbers.PhoneNumberType.FIXED_LINE:
    case i18n.phonenumbers.PhoneNumberType.FIXED_LINE_OR_MOBILE:
        return a.getFixedLine();
    case i18n.phonenumbers.PhoneNumberType.SHARED_COST:
        return a.getSharedCost();
    case i18n.phonenumbers.PhoneNumberType.VOIP:
        return a.getVoip();
    case i18n.phonenumbers.PhoneNumberType.PERSONAL_NUMBER:
        return a.getPersonalNumber();
    case i18n.phonenumbers.PhoneNumberType.PAGER:
        return a.getPager();
    case i18n.phonenumbers.PhoneNumberType.UAN:
        return a.getUan();
    default:
        return a.getGeneralDesc()
    }
};
i18n.phonenumbers.PhoneNumberUtil.prototype.getNumberType = function(c) {
    var a = this.getRegionCodeForNumber(c);
    if (!this.isValidRegionCode_(a)) {
        return i18n.phonenumbers.PhoneNumberType.UNKNOWN
    }
    var b = this.getNationalSignificantNumber(c);
    return this.getNumberTypeHelper_(b, this.getMetadataForRegion(a))
};
i18n.phonenumbers.PhoneNumberUtil.prototype.getNumberTypeHelper_ = function(a, c) {
    var b = c.getGeneralDesc();
    if (!b.hasNationalNumberPattern() ||!this.isNumberMatchingDesc_(a, b)) {
        return i18n.phonenumbers.PhoneNumberType.UNKNOWN
    }
    if (this.isNumberMatchingDesc_(a, c.getPremiumRate())) {
        return i18n.phonenumbers.PhoneNumberType.PREMIUM_RATE
    }
    if (this.isNumberMatchingDesc_(a, c.getTollFree())) {
        return i18n.phonenumbers.PhoneNumberType.TOLL_FREE
    }
    if (this.isNumberMatchingDesc_(a, c.getSharedCost())) {
        return i18n.phonenumbers.PhoneNumberType.SHARED_COST
    }
    if (this.isNumberMatchingDesc_(a, c.getVoip())) {
        return i18n.phonenumbers.PhoneNumberType.VOIP
    }
    if (this.isNumberMatchingDesc_(a, c.getPersonalNumber())) {
        return i18n.phonenumbers.PhoneNumberType.PERSONAL_NUMBER
    }
    if (this.isNumberMatchingDesc_(a, c.getPager())) {
        return i18n.phonenumbers.PhoneNumberType.PAGER
    }
    if (this.isNumberMatchingDesc_(a, c.getUan())) {
        return i18n.phonenumbers.PhoneNumberType.UAN
    }
    var d = this.isNumberMatchingDesc_(a, c.getFixedLine());
    if (d) {
        if (c.getSameMobileAndFixedLinePattern()) {
            return i18n.phonenumbers.PhoneNumberType.FIXED_LINE_OR_MOBILE
        } else {
            if (this.isNumberMatchingDesc_(a, c.getMobile())) {
                return i18n.phonenumbers.PhoneNumberType.FIXED_LINE_OR_MOBILE
            }
        }
        return i18n.phonenumbers.PhoneNumberType.FIXED_LINE
    }
    if (!c.getSameMobileAndFixedLinePattern() && this.isNumberMatchingDesc_(a, c.getMobile())) {
        return i18n.phonenumbers.PhoneNumberType.MOBILE
    }
    return i18n.phonenumbers.PhoneNumberType.UNKNOWN
};
i18n.phonenumbers.PhoneNumberUtil.prototype.getMetadataForRegion = function(a) {
    if (a == null) {
        return null
    }
    a = a.toUpperCase();
    var b = this.regionToMetadataMap[a];
    if (b == null) {
        var c = new goog.proto2.PbLiteSerializer();
        var d = i18n.phonenumbers.metadata.countryToMetadata[a];
        if (d == null) {
            return null
        }
        b = (c.deserialize(i18n.phonenumbers.PhoneMetadata.getDescriptor(), d));
        this.regionToMetadataMap[a] = b
    }
    return b
};
i18n.phonenumbers.PhoneNumberUtil.prototype.isNumberMatchingDesc_ = function(b, a) {
    return i18n.phonenumbers.PhoneNumberUtil.matchesEntirely_(a.getPossibleNumberPatternOrDefault(), b) && i18n.phonenumbers.PhoneNumberUtil.matchesEntirely_(a.getNationalNumberPatternOrDefault(), b)
};
i18n.phonenumbers.PhoneNumberUtil.prototype.isValidNumber = function(b) {
    var a = this.getRegionCodeForNumber(b);
    return this.isValidRegionCode_(a) && this.isValidNumberForRegion(b, (a))
};
i18n.phonenumbers.PhoneNumberUtil.prototype.isValidNumberForRegion = function(e, a) {
    if (e.getCountryCodeOrDefault() != this.getCountryCodeForRegion(a)) {
        return false
    }
    var c = this.getMetadataForRegion(a);
    var d = c.getGeneralDesc();
    var b = this.getNationalSignificantNumber(e);
    if (!d.hasNationalNumberPattern()) {
        var f = b.length;
        return f > i18n.phonenumbers.PhoneNumberUtil.MIN_LENGTH_FOR_NSN_ && f <= i18n.phonenumbers.PhoneNumberUtil.MAX_LENGTH_FOR_NSN_
    }
    return this.getNumberTypeHelper_(b, c) != i18n.phonenumbers.PhoneNumberType.UNKNOWN
};
i18n.phonenumbers.PhoneNumberUtil.prototype.getRegionCodeForNumber = function(b) {
    if (b == null) {
        return null
    }
    var a = b.getCountryCodeOrDefault();
    var c = i18n.phonenumbers.metadata.countryCodeToRegionCodeMap[a];
    if (c == null) {
        return null
    }
    if (c.length == 1) {
        return c[0]
    } else {
        return this.getRegionCodeForNumberFromRegionList_(b, c)
    }
};
i18n.phonenumbers.PhoneNumberUtil.prototype.getRegionCodeForNumberFromRegionList_ = function(g, f) {
    var a = this.getNationalSignificantNumber(g);
    var b;
    var c = f.length;
    for (var e = 0; e < c; e++) {
        b = f[e];
        var d = this.getMetadataForRegion(b);
        if (d.hasLeadingDigits()) {
            if (a.search(d.getLeadingDigits()) == 0) {
                return b
            }
        } else {
            if (this.getNumberTypeHelper_(a, d) != i18n.phonenumbers.PhoneNumberType.UNKNOWN) {
                return b
            }
        }
    }
    return null
};
i18n.phonenumbers.PhoneNumberUtil.prototype.getRegionCodeForCountryCode = function(a) {
    var b = i18n.phonenumbers.metadata.countryCodeToRegionCodeMap[a];
    return b == null ? i18n.phonenumbers.PhoneNumberUtil.UNKNOWN_REGION_ : b[0]
};
i18n.phonenumbers.PhoneNumberUtil.prototype.getCountryCodeForRegion = function(a) {
    if (!this.isValidRegionCode_(a)) {
        return 0
    }
    var b = this.getMetadataForRegion(a);
    return b.getCountryCodeOrDefault()
};
i18n.phonenumbers.PhoneNumberUtil.prototype.getNddPrefixForRegion = function(b, d) {
    if (!this.isValidRegionCode_(b)) {
        return null
    }
    var c = this.getMetadataForRegion(b);
    var a = c.getNationalPrefixOrDefault();
    if (a.length == 0) {
        return null
    }
    if (d) {
        a = a.replace("~", "")
    }
    return a
};
i18n.phonenumbers.PhoneNumberUtil.prototype.isNANPACountry = function(a) {
    return goog.array.contains(i18n.phonenumbers.metadata.countryCodeToRegionCodeMap[i18n.phonenumbers.PhoneNumberUtil.NANPA_COUNTRY_CODE_], a.toUpperCase())
};
i18n.phonenumbers.PhoneNumberUtil.prototype.isLeadingZeroPossible = function(a) {
    var b = this.getMetadataForRegion(this.getRegionCodeForCountryCode(a));
    return b != null && b.getLeadingZeroPossibleOrDefault()
};
i18n.phonenumbers.PhoneNumberUtil.prototype.isAlphaNumber = function(b) {
    if (!i18n.phonenumbers.PhoneNumberUtil.isViablePhoneNumber(b)) {
        return false
    }
    var a = new goog.string.StringBuffer(b);
    this.maybeStripExtension(a);
    return i18n.phonenumbers.PhoneNumberUtil.matchesEntirely_(i18n.phonenumbers.PhoneNumberUtil.VALID_ALPHA_PHONE_PATTERN_, a.toString())
};
i18n.phonenumbers.PhoneNumberUtil.prototype.isPossibleNumber = function(a) {
    return this.isPossibleNumberWithReason(a) == i18n.phonenumbers.PhoneNumberUtil.ValidationResult.IS_POSSIBLE
};
i18n.phonenumbers.PhoneNumberUtil.prototype.testNumberLengthAgainstPattern_ = function(b, a) {
    if (i18n.phonenumbers.PhoneNumberUtil.matchesEntirely_(b, a)) {
        return i18n.phonenumbers.PhoneNumberUtil.ValidationResult.IS_POSSIBLE
    }
    if (a.search(b) == 0) {
        return i18n.phonenumbers.PhoneNumberUtil.ValidationResult.TOO_LONG
    } else {
        return i18n.phonenumbers.PhoneNumberUtil.ValidationResult.TOO_SHORT
    }
};
i18n.phonenumbers.PhoneNumberUtil.prototype.isPossibleNumberWithReason = function(f) {
    var a = this.getNationalSignificantNumber(f);
    var c = f.getCountryCodeOrDefault();
    var b = this.getRegionCodeForCountryCode(c);
    if (!this.isValidRegionCode_(b)) {
        return i18n.phonenumbers.PhoneNumberUtil.ValidationResult.INVALID_COUNTRY_CODE
    }
    var e = this.getMetadataForRegion(b).getGeneralDesc();
    if (!e.hasNationalNumberPattern()) {
        var g = a.length;
        if (g < i18n.phonenumbers.PhoneNumberUtil.MIN_LENGTH_FOR_NSN_) {
            return i18n.phonenumbers.PhoneNumberUtil.ValidationResult.TOO_SHORT
        } else {
            if (g > i18n.phonenumbers.PhoneNumberUtil.MAX_LENGTH_FOR_NSN_) {
                return i18n.phonenumbers.PhoneNumberUtil.ValidationResult.TOO_LONG
            } else {
                return i18n.phonenumbers.PhoneNumberUtil.ValidationResult.IS_POSSIBLE
            }
        }
    }
    var d = e.getPossibleNumberPatternOrDefault();
    return this.testNumberLengthAgainstPattern_(d, a)
};
i18n.phonenumbers.PhoneNumberUtil.prototype.isPossibleNumberString = function(b, a) {
    try {
        return this.isPossibleNumber(this.parse(b, a))
    } catch (c) {
        return false
    }
};
i18n.phonenumbers.PhoneNumberUtil.prototype.truncateTooLongNumber = function(c) {
    if (this.isValidNumber(c)) {
        return true
    }
    var b = c.clone();
    var a = c.getNationalNumberOrDefault();
    do {
        a = Math.floor(a / 10);
        b.setNationalNumber(a);
        if (a == 0 || this.isPossibleNumberWithReason(b) == i18n.phonenumbers.PhoneNumberUtil.ValidationResult.TOO_SHORT) {
            return false
        }
    }
    while (!this.isValidNumber(b));
    c.setNationalNumber(a);
    return true
};
i18n.phonenumbers.PhoneNumberUtil.prototype.extractCountryCode = function(d, a) {
    var c = d.toString();
    var f;
    var e = c.length;
    for (var b = 1; b <= i18n.phonenumbers.PhoneNumberUtil.MAX_LENGTH_COUNTRY_CODE_ && b <= e; ++b) {
        f = parseInt(c.substring(0, b), 10);
        if (f in i18n.phonenumbers.metadata.countryCodeToRegionCodeMap) {
            a.append(c.substring(b));
            return f
        }
    }
    return 0
};
i18n.phonenumbers.PhoneNumberUtil.prototype.maybeExtractCountryCode = function(i, m, h, d, q) {
    if (i.length == 0) {
        return 0
    }
    var e = new goog.string.StringBuffer(i);
    var j;
    if (m != null) {
        j = m.getInternationalPrefix()
    }
    if (j == null) {
        j = "NonMatch"
    }
    var n = this.maybeStripInternationalPrefixAndNormalize(e, j);
    if (d) {
        q.setCountryCodeSource(n)
    }
    if (n != i18n.phonenumbers.PhoneNumber.CountryCodeSource.FROM_DEFAULT_COUNTRY) {
        if (e.getLength() < i18n.phonenumbers.PhoneNumberUtil.MIN_LENGTH_FOR_NSN_) {
            throw i18n.phonenumbers.Error.TOO_SHORT_AFTER_IDD
        }
        var p = this.extractCountryCode(e, h);
        if (p != 0) {
            q.setCountryCode(p);
            return p
        }
        throw i18n.phonenumbers.Error.INVALID_COUNTRY_CODE
    } else {
        if (m != null) {
            var f = m.getCountryCodeOrDefault();
            var b = "" + f;
            var l = e.toString();
            if (goog.string.startsWith(l, b)) {
                var k = new goog.string.StringBuffer(l.substring(b.length));
                var c = m.getGeneralDesc();
                var g = new RegExp(c.getNationalNumberPatternOrDefault());
                this.maybeStripNationalPrefixAndCarrierCode(k, m);
                var o = k.toString();
                var a = c.getPossibleNumberPatternOrDefault();
                if ((!i18n.phonenumbers.PhoneNumberUtil.matchesEntirely_(g, e.toString()) && i18n.phonenumbers.PhoneNumberUtil.matchesEntirely_(g, o)) || this.testNumberLengthAgainstPattern_(a, e.toString()) == i18n.phonenumbers.PhoneNumberUtil.ValidationResult.TOO_LONG) {
                    h.append(o);
                    if (d) {
                        q.setCountryCodeSource(i18n.phonenumbers.PhoneNumber.CountryCodeSource.FROM_NUMBER_WITHOUT_PLUS_SIGN)
                    }
                    q.setCountryCode(f);
                    return f
                }
            }
        }
    }
    q.setCountryCode(0);
    return 0
};
i18n.phonenumbers.PhoneNumberUtil.prototype.parsePrefixAsIdd_ = function(d, c) {
    var f = c.toString();
    if (f.search(d) == 0) {
        var b = f.match(d)[0].length;
        var a = f.substring(b).match(i18n.phonenumbers.PhoneNumberUtil.CAPTURING_DIGIT_PATTERN_);
        if (a && a[1] != null && a[1].length > 0) {
            var e = i18n.phonenumbers.PhoneNumberUtil.normalizeHelper_(a[1], i18n.phonenumbers.PhoneNumberUtil.DIGIT_MAPPINGS, true);
            if (e == "0") {
                return false
            }
        }
        c.clear();
        c.append(f.substring(b));
        return true
    }
    return false
};
i18n.phonenumbers.PhoneNumberUtil.prototype.maybeStripInternationalPrefixAndNormalize = function(c, a) {
    var d = c.toString();
    if (d.length == 0) {
        return i18n.phonenumbers.PhoneNumber.CountryCodeSource.FROM_DEFAULT_COUNTRY
    }
    if (i18n.phonenumbers.PhoneNumberUtil.PLUS_CHARS_PATTERN_.test(d)) {
        d = d.replace(i18n.phonenumbers.PhoneNumberUtil.PLUS_CHARS_PATTERN_, "");
        c.clear();
        c.append(i18n.phonenumbers.PhoneNumberUtil.normalize(d));
        return i18n.phonenumbers.PhoneNumber.CountryCodeSource.FROM_NUMBER_WITH_PLUS_SIGN
    }
    var b = new RegExp(a);
    if (this.parsePrefixAsIdd_(b, c)) {
        i18n.phonenumbers.PhoneNumberUtil.normalizeSB_(c);
        return i18n.phonenumbers.PhoneNumber.CountryCodeSource.FROM_NUMBER_WITH_IDD
    }
    i18n.phonenumbers.PhoneNumberUtil.normalizeSB_(c);
    return this.parsePrefixAsIdd_(b, c) ? i18n.phonenumbers.PhoneNumber.CountryCodeSource.FROM_NUMBER_WITH_IDD : i18n.phonenumbers.PhoneNumber.CountryCodeSource.FROM_DEFAULT_COUNTRY
};
i18n.phonenumbers.PhoneNumberUtil.prototype.maybeStripNationalPrefixAndCarrierCode = function(e, i) {
    var b = "";
    var l = e.toString();
    var m = l.length;
    var f = i.getNationalPrefixForParsing();
    if (m == 0 || f == null || f.length == 0) {
        return b
    }
    var c = new RegExp("^(?:" + f + ")");
    var k = c.exec(l);
    if (k) {
        var d = new RegExp(i.getGeneralDesc().getNationalNumberPatternOrDefault());
        var j = k.length - 1;
        var g = i.getNationalPrefixTransformRule();
        var h;
        var a = g == null || g.length == 0 || k[j] == null || k[j].length == 0;
        if (a) {
            h = l.substring(k[0].length)
        } else {
            h = l.replace(c, g)
        }
        if (!i18n.phonenumbers.PhoneNumberUtil.matchesEntirely_(d, h)) {
            return b
        }
        if ((a && j > 0 && k[1] != null) || (!a && j > 1)) {
            b = k[1]
        }
        e.clear();
        e.append(h)
    }
    return b
};
i18n.phonenumbers.PhoneNumberUtil.prototype.maybeStripExtension = function(c) {
    var f = c.toString();
    var d = f.search(i18n.phonenumbers.PhoneNumberUtil.EXTN_PATTERN_);
    if (d >= 0 && i18n.phonenumbers.PhoneNumberUtil.isViablePhoneNumber(f.substring(0, d))) {
        var a = f.match(i18n.phonenumbers.PhoneNumberUtil.EXTN_PATTERN_);
        var e = a.length;
        for (var b = 1; b < e; ++b) {
            if (a[b] != null && a[b].length > 0) {
                c.clear();
                c.append(f.substring(0, d));
                return a[b]
            }
        }
    }
    return ""
};
i18n.phonenumbers.PhoneNumberUtil.prototype.checkRegionForParsing_ = function(a, b) {
    return this.isValidRegionCode_(b) || (a != null && a.length > 0 && i18n.phonenumbers.PhoneNumberUtil.PLUS_CHARS_PATTERN_.test(a))
};
i18n.phonenumbers.PhoneNumberUtil.prototype.parse = function(a, b) {
    return this.parseHelper_(a, b, false, true)
};
i18n.phonenumbers.PhoneNumberUtil.prototype.parseAndKeepRawInput = function(a, b) {
    if (!this.isValidRegionCode_(b)) {
        if (a.length > 0 && a.charAt(0) != i18n.phonenumbers.PhoneNumberUtil.PLUS_SIGN) {
            throw i18n.phonenumbers.Error.INVALID_COUNTRY_CODE
        }
    }
    return this.parseHelper_(a, b, true, true)
};
i18n.phonenumbers.PhoneNumberUtil.prototype.parseHelper_ = function(n, l, a, i) {
    if (n == null) {
        throw i18n.phonenumbers.Error.NOT_A_NUMBER
    }
    var e = i18n.phonenumbers.PhoneNumberUtil.extractPossibleNumber(n);
    if (!i18n.phonenumbers.PhoneNumberUtil.isViablePhoneNumber(e)) {
        throw i18n.phonenumbers.Error.NOT_A_NUMBER
    }
    if (i&&!this.checkRegionForParsing_(e, l)) {
        throw i18n.phonenumbers.Error.INVALID_COUNTRY_CODE
    }
    var o = new i18n.phonenumbers.PhoneNumber();
    if (a) {
        o.setRawInput(n)
    }
    var d = new goog.string.StringBuffer(e);
    var j = this.maybeStripExtension(d);
    if (j.length > 0) {
        o.setExtension(j)
    }
    var c = this.getMetadataForRegion(l);
    var m = new goog.string.StringBuffer();
    var f = this.maybeExtractCountryCode(d.toString(), c, m, a, o);
    if (f != 0) {
        var g = this.getRegionCodeForCountryCode(f);
        if (g != l) {
            c = this.getMetadataForRegion(g)
        }
    } else {
        i18n.phonenumbers.PhoneNumberUtil.normalizeSB_(d);
        m.append(d.toString());
        if (l != null) {
            f = c.getCountryCodeOrDefault();
            o.setCountryCode(f)
        } else {
            if (a) {
                o.clearCountryCodeSource()
            }
        }
    }
    if (m.getLength() < i18n.phonenumbers.PhoneNumberUtil.MIN_LENGTH_FOR_NSN_) {
        throw i18n.phonenumbers.Error.TOO_SHORT_NSN
    }
    if (c != null) {
        var b = this.maybeStripNationalPrefixAndCarrierCode(m, c);
        if (a) {
            o.setPreferredDomesticCarrierCode(b)
        }
    }
    var h = m.toString();
    var k = h.length;
    if (k < i18n.phonenumbers.PhoneNumberUtil.MIN_LENGTH_FOR_NSN_) {
        throw i18n.phonenumbers.Error.TOO_SHORT_NSN
    }
    if (k > i18n.phonenumbers.PhoneNumberUtil.MAX_LENGTH_FOR_NSN_) {
        throw i18n.phonenumbers.Error.TOO_LONG
    }
    if (h.charAt(0) == "0" && c != null && c.getLeadingZeroPossibleOrDefault()) {
        o.setItalianLeadingZero(true)
    }
    o.setNationalNumber(parseInt(h, 10));
    return o
};
i18n.phonenumbers.PhoneNumberUtil.prototype.isNumberMatch = function(c, d) {
    var h;
    var a;
    if (typeof c == "string") {
        try {
            h = this.parse(c, i18n.phonenumbers.PhoneNumberUtil.UNKNOWN_REGION_)
        } catch (i) {
            if (i != i18n.phonenumbers.Error.INVALID_COUNTRY_CODE) {
                return i18n.phonenumbers.PhoneNumberUtil.MatchType.NOT_A_NUMBER
            }
            if (typeof d != "string") {
                var g = this.getRegionCodeForCountryCode(d.getCountryCodeOrDefault());
                if (g != i18n.phonenumbers.PhoneNumberUtil.UNKNOWN_REGION_) {
                    try {
                        h = this.parse(c, g)
                    } catch (j) {
                        return i18n.phonenumbers.PhoneNumberUtil.MatchType.NOT_A_NUMBER
                    }
                    var f = this.isNumberMatch(h, d);
                    if (f == i18n.phonenumbers.PhoneNumberUtil.MatchType.EXACT_MATCH) {
                        return i18n.phonenumbers.PhoneNumberUtil.MatchType.NSN_MATCH
                    }
                    return f
                }
            }
            try {
                h = this.parseHelper_(c, null, false, false)
            } catch (j) {
                return i18n.phonenumbers.PhoneNumberUtil.MatchType.NOT_A_NUMBER
            }
        }
    } else {
        h = c.clone()
    }
    if (typeof d == "string") {
        try {
            a = this.parse(d, i18n.phonenumbers.PhoneNumberUtil.UNKNOWN_REGION_);
            return this.isNumberMatch(c, a)
        } catch (i) {
            if (i != i18n.phonenumbers.Error.INVALID_COUNTRY_CODE) {
                return i18n.phonenumbers.PhoneNumberUtil.MatchType.NOT_A_NUMBER
            }
            return this.isNumberMatch(d, h)
        }
    } else {
        a = d.clone()
    }
    h.clearRawInput();
    h.clearCountryCodeSource();
    h.clearPreferredDomesticCarrierCode();
    a.clearRawInput();
    a.clearCountryCodeSource();
    a.clearPreferredDomesticCarrierCode();
    if (h.hasExtension() && h.getExtension().length == 0) {
        h.clearExtension()
    }
    if (a.hasExtension() && a.getExtension().length == 0) {
        a.clearExtension()
    }
    if (h.hasExtension() && a.hasExtension() && h.getExtension() != a.getExtension()) {
        return i18n.phonenumbers.PhoneNumberUtil.MatchType.NO_MATCH
    }
    var b = h.getCountryCodeOrDefault();
    var k = a.getCountryCodeOrDefault();
    if (b != 0 && k != 0) {
        if (h.equals(a)) {
            return i18n.phonenumbers.PhoneNumberUtil.MatchType.EXACT_MATCH
        } else {
            if (b == k && this.isNationalNumberSuffixOfTheOther_(h, a)) {
                return i18n.phonenumbers.PhoneNumberUtil.MatchType.SHORT_NSN_MATCH
            }
        }
        return i18n.phonenumbers.PhoneNumberUtil.MatchType.NO_MATCH
    }
    h.setCountryCode(0);
    a.setCountryCode(0);
    if (h.equals(a)) {
        return i18n.phonenumbers.PhoneNumberUtil.MatchType.NSN_MATCH
    }
    if (this.isNationalNumberSuffixOfTheOther_(h, a)) {
        return i18n.phonenumbers.PhoneNumberUtil.MatchType.SHORT_NSN_MATCH
    }
    return i18n.phonenumbers.PhoneNumberUtil.MatchType.NO_MATCH
};
i18n.phonenumbers.PhoneNumberUtil.prototype.isNationalNumberSuffixOfTheOther_ = function(d, b) {
    var a = "" + d.getNationalNumber();
    var c = "" + b.getNationalNumber();
    return goog.string.endsWith(a, c) || goog.string.endsWith(c, a)
};
i18n.phonenumbers.PhoneNumberUtil.prototype.canBeInternationallyDialled = function(d) {
    var a = this.getRegionCodeForNumber(d);
    var c = this.getNationalSignificantNumber(d);
    if (!this.isValidRegionCode_(a)) {
        return true
    }
    var b = this.getMetadataForRegion(a);
    return !this.isNumberMatchingDesc_(c, b.getNoInternationalDialling())
};
i18n.phonenumbers.PhoneNumberUtil.matchesEntirely_ = function(b, c) {
    var a = (typeof b == "string") ? c.match("^(?:" + b + ")$"): c.match(b);
    if (a && a[0].length == c.length) {
        return true
    }
    return false
};
goog.provide("i18n.phonenumbers.AsYouTypeFormatter");
goog.require("goog.string.StringBuffer");
goog.require("i18n.phonenumbers.NumberFormat");
goog.require("i18n.phonenumbers.PhoneMetadata");
goog.require("i18n.phonenumbers.PhoneMetadataCollection");
goog.require("i18n.phonenumbers.PhoneNumber");
goog.require("i18n.phonenumbers.PhoneNumber.CountryCodeSource");
goog.require("i18n.phonenumbers.PhoneNumberDesc");
goog.require("i18n.phonenumbers.PhoneNumberUtil");
goog.require("i18n.phonenumbers.metadata");
i18n.phonenumbers.AsYouTypeFormatter = function(a) {
    this.digitPlaceholder_ = "\u2008";
    this.digitPattern_ = new RegExp(this.digitPlaceholder_);
    this.currentOutput_ = "";
    this.formattingTemplate_ = new goog.string.StringBuffer();
    this.currentFormattingPattern_ = "";
    this.accruedInput_ = new goog.string.StringBuffer();
    this.accruedInputWithoutFormatting_ = new goog.string.StringBuffer();
    this.ableToFormat_ = true;
    this.isInternationalFormatting_ = false;
    this.isExpectingCountryCallingCode_ = false;
    this.phoneUtil_ = i18n.phonenumbers.PhoneNumberUtil.getInstance();
    this.lastMatchPosition_ = 0;
    this.originalPosition_ = 0;
    this.positionToRemember_ = 0;
    this.prefixBeforeNationalNumber_ = new goog.string.StringBuffer();
    this.nationalNumber_ = new goog.string.StringBuffer();
    this.possibleFormats_ = [];
    this.defaultCountry_ = a;
    this.currentMetaData_ = this.getMetadataForRegion_(this.defaultCountry_);
    this.defaultMetaData_ = this.currentMetaData_
};
i18n.phonenumbers.AsYouTypeFormatter.EMPTY_METADATA_ = new i18n.phonenumbers.PhoneMetadata();
i18n.phonenumbers.AsYouTypeFormatter.EMPTY_METADATA_.setInternationalPrefix("NA");
i18n.phonenumbers.AsYouTypeFormatter.CHARACTER_CLASS_PATTERN_ = /\[([^\[\]])*\]/g;
i18n.phonenumbers.AsYouTypeFormatter.STANDALONE_DIGIT_PATTERN_ = /\d(?=[^,}][^,}])/g;
i18n.phonenumbers.AsYouTypeFormatter.ELIGIBLE_FORMAT_PATTERN_ = new RegExp("^[" + i18n.phonenumbers.PhoneNumberUtil.VALID_PUNCTUATION + "]*(\\$\\d[" + i18n.phonenumbers.PhoneNumberUtil.VALID_PUNCTUATION + "]*)+$");
i18n.phonenumbers.AsYouTypeFormatter.MIN_LEADING_DIGITS_LENGTH_ = 3;
i18n.phonenumbers.AsYouTypeFormatter.prototype.getMetadataForRegion_ = function(a) {
    var b = this.phoneUtil_.getMetadataForRegion(a);
    if (b != null) {
        return b
    }
    return i18n.phonenumbers.AsYouTypeFormatter.EMPTY_METADATA_
};
i18n.phonenumbers.AsYouTypeFormatter.prototype.maybeCreateNewTemplate_ = function() {
    var b = this.possibleFormats_.length;
    for (var c = 0; c < b; ++c) {
        var a = this.possibleFormats_[c];
        var d = a.getPatternOrDefault();
        if (this.currentFormattingPattern_ == d) {
            return false
        }
        if (this.createFormattingTemplate_(a)) {
            this.currentFormattingPattern_ = d;
            return true
        }
    }
    this.ableToFormat_ = false;
    return false
};
i18n.phonenumbers.AsYouTypeFormatter.prototype.getAvailableFormats_ = function(a) {
    var e = (this.isInternationalFormatting_ && this.currentMetaData_.intlNumberFormatCount() > 0) ? this.currentMetaData_.intlNumberFormatArray(): this.currentMetaData_.numberFormatArray();
    var c = e.length;
    for (var b = 0; b < c; ++b) {
        var d = e[b];
        if (this.isFormatEligible_(d.getFormatOrDefault())) {
            this.possibleFormats_.push(d)
        }
    }
    this.narrowDownPossibleFormats_(a)
};
i18n.phonenumbers.AsYouTypeFormatter.prototype.isFormatEligible_ = function(a) {
    return i18n.phonenumbers.AsYouTypeFormatter.ELIGIBLE_FORMAT_PATTERN_.test(a)
};
i18n.phonenumbers.AsYouTypeFormatter.prototype.narrowDownPossibleFormats_ = function(c) {
    var g = [];
    var b = c.length - i18n.phonenumbers.AsYouTypeFormatter.MIN_LEADING_DIGITS_LENGTH_;
    var a = this.possibleFormats_.length;
    for (var e = 0; e < a; ++e) {
        var f = this.possibleFormats_[e];
        if (f.leadingDigitsPatternCount() > b) {
            var d = f.getLeadingDigitsPatternOrDefault(b);
            if (c.search(d) == 0) {
                g.push(this.possibleFormats_[e])
            }
        } else {
            g.push(this.possibleFormats_[e])
        }
    }
    this.possibleFormats_ = g
};
i18n.phonenumbers.AsYouTypeFormatter.prototype.createFormattingTemplate_ = function(c) {
    var a = c.getPatternOrDefault();
    if (a.indexOf("|")!=-1) {
        return false
    }
    a = a.replace(i18n.phonenumbers.AsYouTypeFormatter.CHARACTER_CLASS_PATTERN_, "\\d");
    a = a.replace(i18n.phonenumbers.AsYouTypeFormatter.STANDALONE_DIGIT_PATTERN_, "\\d");
    this.formattingTemplate_.clear();
    var b = this.getFormattingTemplate_(a, c.getFormatOrDefault());
    if (b.length > this.nationalNumber_.getLength()) {
        this.formattingTemplate_.append(b);
        return true
    }
    return false
};
i18n.phonenumbers.AsYouTypeFormatter.prototype.getFormattingTemplate_ = function(f, c) {
    var e = "999999999999999";
    var b = e.match(f);
    var a = b[0];
    var d = a.replace(new RegExp(f, "g"), c);
    d = d.replace(new RegExp("9", "g"), this.digitPlaceholder_);
    return d
};
i18n.phonenumbers.AsYouTypeFormatter.prototype.clear = function() {
    this.currentOutput_ = "";
    this.accruedInput_.clear();
    this.accruedInputWithoutFormatting_.clear();
    this.formattingTemplate_.clear();
    this.lastMatchPosition_ = 0;
    this.currentFormattingPattern_ = "";
    this.prefixBeforeNationalNumber_.clear();
    this.nationalNumber_.clear();
    this.ableToFormat_ = true;
    this.positionToRemember_ = 0;
    this.originalPosition_ = 0;
    this.isInternationalFormatting_ = false;
    this.isExpectingCountryCallingCode_ = false;
    this.possibleFormats_ = [];
    if (this.currentMetaData_ != this.defaultMetaData_) {
        this.currentMetaData_ = this.getMetadataForRegion_(this.defaultCountry_)
    }
};
i18n.phonenumbers.AsYouTypeFormatter.prototype.inputDigit = function(a) {
    this.currentOutput_ = this.inputDigitWithOptionToRememberPosition_(a, false);
    return this.currentOutput_
};
i18n.phonenumbers.AsYouTypeFormatter.prototype.inputDigitAndRememberPosition = function(a) {
    this.currentOutput_ = this.inputDigitWithOptionToRememberPosition_(a, true);
    return this.currentOutput_
};
i18n.phonenumbers.AsYouTypeFormatter.prototype.inputDigitWithOptionToRememberPosition_ = function(d, c) {
    this.accruedInput_.append(d);
    if (c) {
        this.originalPosition_ = this.accruedInput_.getLength()
    }
    if (!i18n.phonenumbers.PhoneNumberUtil.VALID_START_CHAR_PATTERN.test(d)) {
        this.ableToFormat_ = false
    }
    if (!this.ableToFormat_) {
        return this.accruedInput_.toString()
    }
    d = this.normalizeAndAccrueDigitsAndPlusSign_(d, c);
    switch (this.accruedInputWithoutFormatting_.getLength()) {
    case 0:
    case 1:
    case 2:
        return this.accruedInput_.toString();
    case 3:
        if (this.attemptToExtractIdd_()) {
            this.isExpectingCountryCallingCode_ = true
        } else {
            this.removeNationalPrefixFromNationalNumber_();
            return this.attemptToChooseFormattingPattern_()
        }
    case 4:
    case 5:
        if (this.isExpectingCountryCallingCode_) {
            if (this.attemptToExtractCountryCallingCode_()) {
                this.isExpectingCountryCallingCode_ = false
            }
            return this.prefixBeforeNationalNumber_.toString() + this.nationalNumber_.toString()
        }
    case 6:
        if (this.isExpectingCountryCallingCode_&&!this.attemptToExtractCountryCallingCode_()) {
            this.ableToFormat_ = false;
            return this.accruedInput_.toString()
        }
    default:
        if (this.possibleFormats_.length > 0) {
            var a = this.inputDigitHelper_(d);
            var b = this.attemptToFormatAccruedDigits_();
            if (b.length > 0) {
                return b
            }
            this.narrowDownPossibleFormats_(this.nationalNumber_.toString());
            if (this.maybeCreateNewTemplate_()) {
                return this.inputAccruedNationalNumber_()
            }
            return this.ableToFormat_ ? this.prefixBeforeNationalNumber_.toString() + a : a
        } else {
            return this.attemptToChooseFormattingPattern_()
        }
    }
};
i18n.phonenumbers.AsYouTypeFormatter.prototype.attemptToFormatAccruedDigits_ = function() {
    var a = this.nationalNumber_.toString();
    var b = this.possibleFormats_.length;
    for (var c = 0; c < b; ++c) {
        var f = this.possibleFormats_[c];
        var e = f.getPatternOrDefault();
        var d = new RegExp("^(?:" + e + ")$");
        if (d.test(a)) {
            var g = a.replace(new RegExp(e, "g"), f.getFormat());
            return this.prefixBeforeNationalNumber_.toString() + g
        }
    }
    return ""
};
i18n.phonenumbers.AsYouTypeFormatter.prototype.getRememberedPosition = function() {
    if (!this.ableToFormat_) {
        return this.originalPosition_
    }
    var c = 0;
    var b = 0;
    var d = this.accruedInputWithoutFormatting_.toString();
    var a = this.currentOutput_.toString();
    while (c < this.positionToRemember_ && b < a.length) {
        if (d.charAt(c) == a.charAt(b)) {
            c++
        }
        b++
    }
    return b
};
i18n.phonenumbers.AsYouTypeFormatter.prototype.attemptToChooseFormattingPattern_ = function() {
    var a = this.nationalNumber_.toString();
    if (a.length >= i18n.phonenumbers.AsYouTypeFormatter.MIN_LEADING_DIGITS_LENGTH_) {
        this.getAvailableFormats_(a.substring(0, i18n.phonenumbers.AsYouTypeFormatter.MIN_LEADING_DIGITS_LENGTH_));
        this.maybeCreateNewTemplate_();
        return this.inputAccruedNationalNumber_()
    } else {
        return this.prefixBeforeNationalNumber_.toString() + a
    }
};
i18n.phonenumbers.AsYouTypeFormatter.prototype.inputAccruedNationalNumber_ = function() {
    var b = this.nationalNumber_.toString();
    var a = b.length;
    if (a > 0) {
        var d = "";
        for (var c = 0; c < a; c++) {
            d = this.inputDigitHelper_(b.charAt(c))
        }
        return this.ableToFormat_ ? this.prefixBeforeNationalNumber_.toString() + d : d
    } else {
        return this.prefixBeforeNationalNumber_.toString()
    }
};
i18n.phonenumbers.AsYouTypeFormatter.prototype.removeNationalPrefixFromNationalNumber_ = function() {
    var b = this.nationalNumber_.toString();
    var d = 0;
    if (this.currentMetaData_.getCountryCode() == 1 && b.charAt(0) == "1") {
        d = 1;
        this.prefixBeforeNationalNumber_.append("1 ");
        this.isInternationalFormatting_ = true
    } else {
        if (this.currentMetaData_.hasNationalPrefix()) {
            var c = new RegExp("^(?:" + this.currentMetaData_.getNationalPrefixForParsing() + ")");
            var a = b.match(c);
            if (a != null && a[0] != null && a[0].length > 0) {
                this.isInternationalFormatting_ = true;
                d = a[0].length;
                this.prefixBeforeNationalNumber_.append(b.substring(0, d))
            }
        }
    }
    this.nationalNumber_.clear();
    this.nationalNumber_.append(b.substring(d))
};
i18n.phonenumbers.AsYouTypeFormatter.prototype.attemptToExtractIdd_ = function() {
    var b = this.accruedInputWithoutFormatting_.toString();
    var d = new RegExp("^(?:\\" + i18n.phonenumbers.PhoneNumberUtil.PLUS_SIGN + "|" + this.currentMetaData_.getInternationalPrefix() + ")");
    var a = b.match(d);
    if (a != null && a[0] != null && a[0].length > 0) {
        this.isInternationalFormatting_ = true;
        var c = a[0].length;
        this.nationalNumber_.clear();
        this.nationalNumber_.append(b.substring(c));
        this.prefixBeforeNationalNumber_.append(b.substring(0, c));
        if (b.charAt(0) != i18n.phonenumbers.PhoneNumberUtil.PLUS_SIGN) {
            this.prefixBeforeNationalNumber_.append(" ")
        }
        return true
    }
    return false
};
i18n.phonenumbers.AsYouTypeFormatter.prototype.attemptToExtractCountryCallingCode_ = function() {
    if (this.nationalNumber_.getLength() == 0) {
        return false
    }
    var d = new goog.string.StringBuffer();
    var a = this.phoneUtil_.extractCountryCode(this.nationalNumber_, d);
    if (a == 0) {
        return false
    }
    this.nationalNumber_.clear();
    this.nationalNumber_.append(d.toString());
    var c = this.phoneUtil_.getRegionCodeForCountryCode(a);
    if (c != this.defaultCountry_) {
        this.currentMetaData_ = this.getMetadataForRegion_(c)
    }
    var b = "" + a;
    this.prefixBeforeNationalNumber_.append(b).append(" ");
    return true
};
i18n.phonenumbers.AsYouTypeFormatter.prototype.normalizeAndAccrueDigitsAndPlusSign_ = function(b, a) {
    if (b == i18n.phonenumbers.PhoneNumberUtil.PLUS_SIGN) {
        this.accruedInputWithoutFormatting_.append(b)
    } else {
        b = i18n.phonenumbers.PhoneNumberUtil.DIGIT_MAPPINGS[b];
        this.accruedInputWithoutFormatting_.append(b);
        this.nationalNumber_.append(b)
    }
    if (a) {
        this.positionToRemember_ = this.accruedInputWithoutFormatting_.getLength()
    }
    return b
};
i18n.phonenumbers.AsYouTypeFormatter.prototype.inputDigitHelper_ = function(d) {
    var c = this.formattingTemplate_.toString();
    if (c.substring(this.lastMatchPosition_).search(this.digitPattern_) >= 0) {
        var a = c.search(this.digitPattern_);
        var b = c.replace(this.digitPattern_, d);
        this.formattingTemplate_.clear();
        this.formattingTemplate_.append(b);
        this.lastMatchPosition_ = a;
        return b.substring(0, this.lastMatchPosition_ + 1)
    } else {
        if (this.possibleFormats_.length == 1) {
            this.ableToFormat_ = false
        }
        this.currentFormattingPattern_ = "";
        return this.accruedInput_.toString()
    }
};
