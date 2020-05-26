(window["webpackJsonp"] = window["webpackJsonp"] || []).push([["vendors~app"],{

/***/ "./node_modules/sprintf-js/src/sprintf.js":
/*!************************************************!*\
  !*** ./node_modules/sprintf-js/src/sprintf.js ***!
  \************************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

(function(window) {
    var re = {
        not_string: /[^s]/,
        number: /[diefg]/,
        json: /[j]/,
        not_json: /[^j]/,
        text: /^[^\x25]+/,
        modulo: /^\x25{2}/,
        placeholder: /^\x25(?:([1-9]\d*)\$|\(([^\)]+)\))?(\+)?(0|'[^$])?(-)?(\d+)?(?:\.(\d+))?([b-gijosuxX])/,
        key: /^([a-z_][a-z_\d]*)/i,
        key_access: /^\.([a-z_][a-z_\d]*)/i,
        index_access: /^\[(\d+)\]/,
        sign: /^[\+\-]/
    }

    function sprintf() {
        var key = arguments[0], cache = sprintf.cache
        if (!(cache[key] && cache.hasOwnProperty(key))) {
            cache[key] = sprintf.parse(key)
        }
        return sprintf.format.call(null, cache[key], arguments)
    }

    sprintf.format = function(parse_tree, argv) {
        var cursor = 1, tree_length = parse_tree.length, node_type = "", arg, output = [], i, k, match, pad, pad_character, pad_length, is_positive = true, sign = ""
        for (i = 0; i < tree_length; i++) {
            node_type = get_type(parse_tree[i])
            if (node_type === "string") {
                output[output.length] = parse_tree[i]
            }
            else if (node_type === "array") {
                match = parse_tree[i] // convenience purposes only
                if (match[2]) { // keyword argument
                    arg = argv[cursor]
                    for (k = 0; k < match[2].length; k++) {
                        if (!arg.hasOwnProperty(match[2][k])) {
                            throw new Error(sprintf("[sprintf] property '%s' does not exist", match[2][k]))
                        }
                        arg = arg[match[2][k]]
                    }
                }
                else if (match[1]) { // positional argument (explicit)
                    arg = argv[match[1]]
                }
                else { // positional argument (implicit)
                    arg = argv[cursor++]
                }

                if (get_type(arg) == "function") {
                    arg = arg()
                }

                if (re.not_string.test(match[8]) && re.not_json.test(match[8]) && (get_type(arg) != "number" && isNaN(arg))) {
                    throw new TypeError(sprintf("[sprintf] expecting number but found %s", get_type(arg)))
                }

                if (re.number.test(match[8])) {
                    is_positive = arg >= 0
                }

                switch (match[8]) {
                    case "b":
                        arg = arg.toString(2)
                    break
                    case "c":
                        arg = String.fromCharCode(arg)
                    break
                    case "d":
                    case "i":
                        arg = parseInt(arg, 10)
                    break
                    case "j":
                        arg = JSON.stringify(arg, null, match[6] ? parseInt(match[6]) : 0)
                    break
                    case "e":
                        arg = match[7] ? arg.toExponential(match[7]) : arg.toExponential()
                    break
                    case "f":
                        arg = match[7] ? parseFloat(arg).toFixed(match[7]) : parseFloat(arg)
                    break
                    case "g":
                        arg = match[7] ? parseFloat(arg).toPrecision(match[7]) : parseFloat(arg)
                    break
                    case "o":
                        arg = arg.toString(8)
                    break
                    case "s":
                        arg = ((arg = String(arg)) && match[7] ? arg.substring(0, match[7]) : arg)
                    break
                    case "u":
                        arg = arg >>> 0
                    break
                    case "x":
                        arg = arg.toString(16)
                    break
                    case "X":
                        arg = arg.toString(16).toUpperCase()
                    break
                }
                if (re.json.test(match[8])) {
                    output[output.length] = arg
                }
                else {
                    if (re.number.test(match[8]) && (!is_positive || match[3])) {
                        sign = is_positive ? "+" : "-"
                        arg = arg.toString().replace(re.sign, "")
                    }
                    else {
                        sign = ""
                    }
                    pad_character = match[4] ? match[4] === "0" ? "0" : match[4].charAt(1) : " "
                    pad_length = match[6] - (sign + arg).length
                    pad = match[6] ? (pad_length > 0 ? str_repeat(pad_character, pad_length) : "") : ""
                    output[output.length] = match[5] ? sign + arg + pad : (pad_character === "0" ? sign + pad + arg : pad + sign + arg)
                }
            }
        }
        return output.join("")
    }

    sprintf.cache = {}

    sprintf.parse = function(fmt) {
        var _fmt = fmt, match = [], parse_tree = [], arg_names = 0
        while (_fmt) {
            if ((match = re.text.exec(_fmt)) !== null) {
                parse_tree[parse_tree.length] = match[0]
            }
            else if ((match = re.modulo.exec(_fmt)) !== null) {
                parse_tree[parse_tree.length] = "%"
            }
            else if ((match = re.placeholder.exec(_fmt)) !== null) {
                if (match[2]) {
                    arg_names |= 1
                    var field_list = [], replacement_field = match[2], field_match = []
                    if ((field_match = re.key.exec(replacement_field)) !== null) {
                        field_list[field_list.length] = field_match[1]
                        while ((replacement_field = replacement_field.substring(field_match[0].length)) !== "") {
                            if ((field_match = re.key_access.exec(replacement_field)) !== null) {
                                field_list[field_list.length] = field_match[1]
                            }
                            else if ((field_match = re.index_access.exec(replacement_field)) !== null) {
                                field_list[field_list.length] = field_match[1]
                            }
                            else {
                                throw new SyntaxError("[sprintf] failed to parse named argument key")
                            }
                        }
                    }
                    else {
                        throw new SyntaxError("[sprintf] failed to parse named argument key")
                    }
                    match[2] = field_list
                }
                else {
                    arg_names |= 2
                }
                if (arg_names === 3) {
                    throw new Error("[sprintf] mixing positional and named placeholders is not (yet) supported")
                }
                parse_tree[parse_tree.length] = match
            }
            else {
                throw new SyntaxError("[sprintf] unexpected placeholder")
            }
            _fmt = _fmt.substring(match[0].length)
        }
        return parse_tree
    }

    var vsprintf = function(fmt, argv, _argv) {
        _argv = (argv || []).slice(0)
        _argv.splice(0, 0, fmt)
        return sprintf.apply(null, _argv)
    }

    /**
     * helpers
     */
    function get_type(variable) {
        return Object.prototype.toString.call(variable).slice(8, -1).toLowerCase()
    }

    function str_repeat(input, multiplier) {
        return Array(multiplier + 1).join(input)
    }

    /**
     * export to either browser or node.js
     */
    if (true) {
        exports.sprintf = sprintf
        exports.vsprintf = vsprintf
    }
    else {}
})(typeof window === "undefined" ? this : window);


/***/ }),

/***/ "./node_modules/underscore.string/camelize.js":
/*!****************************************************!*\
  !*** ./node_modules/underscore.string/camelize.js ***!
  \****************************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

var trim = __webpack_require__(/*! ./trim */ "./node_modules/underscore.string/trim.js");
var decap = __webpack_require__(/*! ./decapitalize */ "./node_modules/underscore.string/decapitalize.js");

module.exports = function camelize(str, decapitalize) {
  str = trim(str).replace(/[-_\s]+(.)?/g, function(match, c) {
    return c ? c.toUpperCase() : '';
  });

  if (decapitalize === true) {
    return decap(str);
  } else {
    return str;
  }
};


/***/ }),

/***/ "./node_modules/underscore.string/capitalize.js":
/*!******************************************************!*\
  !*** ./node_modules/underscore.string/capitalize.js ***!
  \******************************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

var makeString = __webpack_require__(/*! ./helper/makeString */ "./node_modules/underscore.string/helper/makeString.js");

module.exports = function capitalize(str, lowercaseRest) {
  str = makeString(str);
  var remainingChars = !lowercaseRest ? str.slice(1) : str.slice(1).toLowerCase();

  return str.charAt(0).toUpperCase() + remainingChars;
};


/***/ }),

/***/ "./node_modules/underscore.string/chars.js":
/*!*************************************************!*\
  !*** ./node_modules/underscore.string/chars.js ***!
  \*************************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

var makeString = __webpack_require__(/*! ./helper/makeString */ "./node_modules/underscore.string/helper/makeString.js");

module.exports = function chars(str) {
  return makeString(str).split('');
};


/***/ }),

/***/ "./node_modules/underscore.string/chop.js":
/*!************************************************!*\
  !*** ./node_modules/underscore.string/chop.js ***!
  \************************************************/
/*! no static exports found */
/***/ (function(module, exports) {

module.exports = function chop(str, step) {
  if (str == null) return [];
  str = String(str);
  step = ~~step;
  return step > 0 ? str.match(new RegExp('.{1,' + step + '}', 'g')) : [str];
};


/***/ }),

/***/ "./node_modules/underscore.string/classify.js":
/*!****************************************************!*\
  !*** ./node_modules/underscore.string/classify.js ***!
  \****************************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

var capitalize = __webpack_require__(/*! ./capitalize */ "./node_modules/underscore.string/capitalize.js");
var camelize = __webpack_require__(/*! ./camelize */ "./node_modules/underscore.string/camelize.js");
var makeString = __webpack_require__(/*! ./helper/makeString */ "./node_modules/underscore.string/helper/makeString.js");

module.exports = function classify(str) {
  str = makeString(str);
  return capitalize(camelize(str.replace(/[\W_]/g, ' ')).replace(/\s/g, ''));
};


/***/ }),

/***/ "./node_modules/underscore.string/clean.js":
/*!*************************************************!*\
  !*** ./node_modules/underscore.string/clean.js ***!
  \*************************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

var trim = __webpack_require__(/*! ./trim */ "./node_modules/underscore.string/trim.js");

module.exports = function clean(str) {
  return trim(str).replace(/\s\s+/g, ' ');
};


/***/ }),

/***/ "./node_modules/underscore.string/cleanDiacritics.js":
/*!***********************************************************!*\
  !*** ./node_modules/underscore.string/cleanDiacritics.js ***!
  \***********************************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {


var makeString = __webpack_require__(/*! ./helper/makeString */ "./node_modules/underscore.string/helper/makeString.js");

var from  = 'ąàáäâãåæăćčĉęèéëêĝĥìíïîĵłľńňòóöőôõðøśșşšŝťțţŭùúüűûñÿýçżźž',
  to    = 'aaaaaaaaaccceeeeeghiiiijllnnoooooooossssstttuuuuuunyyczzz';

from += from.toUpperCase();
to += to.toUpperCase();

to = to.split('');

// for tokens requireing multitoken output
from += 'ß';
to.push('ss');


module.exports = function cleanDiacritics(str) {
  return makeString(str).replace(/.{1}/g, function(c){
    var index = from.indexOf(c);
    return index === -1 ? c : to[index];
  });
};


/***/ }),

/***/ "./node_modules/underscore.string/count.js":
/*!*************************************************!*\
  !*** ./node_modules/underscore.string/count.js ***!
  \*************************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

var makeString = __webpack_require__(/*! ./helper/makeString */ "./node_modules/underscore.string/helper/makeString.js");

module.exports = function(str, substr) {
  str = makeString(str);
  substr = makeString(substr);

  if (str.length === 0 || substr.length === 0) return 0;
  
  return str.split(substr).length - 1;
};


/***/ }),

/***/ "./node_modules/underscore.string/dasherize.js":
/*!*****************************************************!*\
  !*** ./node_modules/underscore.string/dasherize.js ***!
  \*****************************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

var trim = __webpack_require__(/*! ./trim */ "./node_modules/underscore.string/trim.js");

module.exports = function dasherize(str) {
  return trim(str).replace(/([A-Z])/g, '-$1').replace(/[-_\s]+/g, '-').toLowerCase();
};


/***/ }),

/***/ "./node_modules/underscore.string/decapitalize.js":
/*!********************************************************!*\
  !*** ./node_modules/underscore.string/decapitalize.js ***!
  \********************************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

var makeString = __webpack_require__(/*! ./helper/makeString */ "./node_modules/underscore.string/helper/makeString.js");

module.exports = function decapitalize(str) {
  str = makeString(str);
  return str.charAt(0).toLowerCase() + str.slice(1);
};


/***/ }),

/***/ "./node_modules/underscore.string/dedent.js":
/*!**************************************************!*\
  !*** ./node_modules/underscore.string/dedent.js ***!
  \**************************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

var makeString = __webpack_require__(/*! ./helper/makeString */ "./node_modules/underscore.string/helper/makeString.js");

function getIndent(str) {
  var matches = str.match(/^[\s\\t]*/gm);
  var indent = matches[0].length;
  
  for (var i = 1; i < matches.length; i++) {
    indent = Math.min(matches[i].length, indent);
  }

  return indent;
}

module.exports = function dedent(str, pattern) {
  str = makeString(str);
  var indent = getIndent(str);
  var reg;

  if (indent === 0) return str;

  if (typeof pattern === 'string') {
    reg = new RegExp('^' + pattern, 'gm');
  } else {
    reg = new RegExp('^[ \\t]{' + indent + '}', 'gm');
  }

  return str.replace(reg, '');
};


/***/ }),

/***/ "./node_modules/underscore.string/endsWith.js":
/*!****************************************************!*\
  !*** ./node_modules/underscore.string/endsWith.js ***!
  \****************************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

var makeString = __webpack_require__(/*! ./helper/makeString */ "./node_modules/underscore.string/helper/makeString.js");
var toPositive = __webpack_require__(/*! ./helper/toPositive */ "./node_modules/underscore.string/helper/toPositive.js");

module.exports = function endsWith(str, ends, position) {
  str = makeString(str);
  ends = '' + ends;
  if (typeof position == 'undefined') {
    position = str.length - ends.length;
  } else {
    position = Math.min(toPositive(position), str.length) - ends.length;
  }
  return position >= 0 && str.indexOf(ends, position) === position;
};


/***/ }),

/***/ "./node_modules/underscore.string/escapeHTML.js":
/*!******************************************************!*\
  !*** ./node_modules/underscore.string/escapeHTML.js ***!
  \******************************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

var makeString = __webpack_require__(/*! ./helper/makeString */ "./node_modules/underscore.string/helper/makeString.js");
var escapeChars = __webpack_require__(/*! ./helper/escapeChars */ "./node_modules/underscore.string/helper/escapeChars.js");

var regexString = '[';
for(var key in escapeChars) {
  regexString += key;
}
regexString += ']';

var regex = new RegExp( regexString, 'g');

module.exports = function escapeHTML(str) {

  return makeString(str).replace(regex, function(m) {
    return '&' + escapeChars[m] + ';';
  });
};


/***/ }),

/***/ "./node_modules/underscore.string/exports.js":
/*!***************************************************!*\
  !*** ./node_modules/underscore.string/exports.js ***!
  \***************************************************/
/*! no static exports found */
/***/ (function(module, exports) {

module.exports = function() {
  var result = {};

  for (var prop in this) {
    if (!this.hasOwnProperty(prop) || prop.match(/^(?:include|contains|reverse|join|map|wrap)$/)) continue;
    result[prop] = this[prop];
  }

  return result;
};


/***/ }),

/***/ "./node_modules/underscore.string/helper/adjacent.js":
/*!***********************************************************!*\
  !*** ./node_modules/underscore.string/helper/adjacent.js ***!
  \***********************************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

var makeString = __webpack_require__(/*! ./makeString */ "./node_modules/underscore.string/helper/makeString.js");

module.exports = function adjacent(str, direction) {
  str = makeString(str);
  if (str.length === 0) {
    return '';
  }
  return str.slice(0, -1) + String.fromCharCode(str.charCodeAt(str.length - 1) + direction);
};


/***/ }),

/***/ "./node_modules/underscore.string/helper/defaultToWhiteSpace.js":
/*!**********************************************************************!*\
  !*** ./node_modules/underscore.string/helper/defaultToWhiteSpace.js ***!
  \**********************************************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

var escapeRegExp = __webpack_require__(/*! ./escapeRegExp */ "./node_modules/underscore.string/helper/escapeRegExp.js");

module.exports = function defaultToWhiteSpace(characters) {
  if (characters == null)
    return '\\s';
  else if (characters.source)
    return characters.source;
  else
    return '[' + escapeRegExp(characters) + ']';
};


/***/ }),

/***/ "./node_modules/underscore.string/helper/escapeChars.js":
/*!**************************************************************!*\
  !*** ./node_modules/underscore.string/helper/escapeChars.js ***!
  \**************************************************************/
/*! no static exports found */
/***/ (function(module, exports) {

/* We're explicitly defining the list of entities we want to escape.
nbsp is an HTML entity, but we don't want to escape all space characters in a string, hence its omission in this map.

*/
var escapeChars = {
  '¢' : 'cent',
  '£' : 'pound',
  '¥' : 'yen',
  '€': 'euro',
  '©' :'copy',
  '®' : 'reg',
  '<' : 'lt',
  '>' : 'gt',
  '"' : 'quot',
  '&' : 'amp',
  '\'' : '#39'
};

module.exports = escapeChars;


/***/ }),

/***/ "./node_modules/underscore.string/helper/escapeRegExp.js":
/*!***************************************************************!*\
  !*** ./node_modules/underscore.string/helper/escapeRegExp.js ***!
  \***************************************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

var makeString = __webpack_require__(/*! ./makeString */ "./node_modules/underscore.string/helper/makeString.js");

module.exports = function escapeRegExp(str) {
  return makeString(str).replace(/([.*+?^=!:${}()|[\]\/\\])/g, '\\$1');
};


/***/ }),

/***/ "./node_modules/underscore.string/helper/htmlEntities.js":
/*!***************************************************************!*\
  !*** ./node_modules/underscore.string/helper/htmlEntities.js ***!
  \***************************************************************/
/*! no static exports found */
/***/ (function(module, exports) {

/*
We're explicitly defining the list of entities that might see in escape HTML strings
*/
var htmlEntities = {
  nbsp: ' ',
  cent: '¢',
  pound: '£',
  yen: '¥',
  euro: '€',
  copy: '©',
  reg: '®',
  lt: '<',
  gt: '>',
  quot: '"',
  amp: '&',
  apos: '\''
};

module.exports = htmlEntities;


/***/ }),

/***/ "./node_modules/underscore.string/helper/makeString.js":
/*!*************************************************************!*\
  !*** ./node_modules/underscore.string/helper/makeString.js ***!
  \*************************************************************/
/*! no static exports found */
/***/ (function(module, exports) {

/**
 * Ensure some object is a coerced to a string
 **/
module.exports = function makeString(object) {
  if (object == null) return '';
  return '' + object;
};


/***/ }),

/***/ "./node_modules/underscore.string/helper/strRepeat.js":
/*!************************************************************!*\
  !*** ./node_modules/underscore.string/helper/strRepeat.js ***!
  \************************************************************/
/*! no static exports found */
/***/ (function(module, exports) {

module.exports = function strRepeat(str, qty){
  if (qty < 1) return '';
  var result = '';
  while (qty > 0) {
    if (qty & 1) result += str;
    qty >>= 1, str += str;
  }
  return result;
};


/***/ }),

/***/ "./node_modules/underscore.string/helper/toPositive.js":
/*!*************************************************************!*\
  !*** ./node_modules/underscore.string/helper/toPositive.js ***!
  \*************************************************************/
/*! no static exports found */
/***/ (function(module, exports) {

module.exports = function toPositive(number) {
  return number < 0 ? 0 : (+number || 0);
};


/***/ }),

/***/ "./node_modules/underscore.string/humanize.js":
/*!****************************************************!*\
  !*** ./node_modules/underscore.string/humanize.js ***!
  \****************************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

var capitalize = __webpack_require__(/*! ./capitalize */ "./node_modules/underscore.string/capitalize.js");
var underscored = __webpack_require__(/*! ./underscored */ "./node_modules/underscore.string/underscored.js");
var trim = __webpack_require__(/*! ./trim */ "./node_modules/underscore.string/trim.js");

module.exports = function humanize(str) {
  return capitalize(trim(underscored(str).replace(/_id$/, '').replace(/_/g, ' ')));
};


/***/ }),

/***/ "./node_modules/underscore.string/include.js":
/*!***************************************************!*\
  !*** ./node_modules/underscore.string/include.js ***!
  \***************************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

var makeString = __webpack_require__(/*! ./helper/makeString */ "./node_modules/underscore.string/helper/makeString.js");

module.exports = function include(str, needle) {
  if (needle === '') return true;
  return makeString(str).indexOf(needle) !== -1;
};


/***/ }),

/***/ "./node_modules/underscore.string/index.js":
/*!*************************************************!*\
  !*** ./node_modules/underscore.string/index.js ***!
  \*************************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

"use strict";
/*
* Underscore.string
* (c) 2010 Esa-Matti Suuronen <esa-matti aet suuronen dot org>
* Underscore.string is freely distributable under the terms of the MIT license.
* Documentation: https://github.com/epeli/underscore.string
* Some code is borrowed from MooTools and Alexandru Marasteanu.
* Version '3.3.4'
* @preserve
*/



function s(value) {
  /* jshint validthis: true */
  if (!(this instanceof s)) return new s(value);
  this._wrapped = value;
}

s.VERSION = '3.3.4';

s.isBlank          = __webpack_require__(/*! ./isBlank */ "./node_modules/underscore.string/isBlank.js");
s.stripTags        = __webpack_require__(/*! ./stripTags */ "./node_modules/underscore.string/stripTags.js");
s.capitalize       = __webpack_require__(/*! ./capitalize */ "./node_modules/underscore.string/capitalize.js");
s.decapitalize     = __webpack_require__(/*! ./decapitalize */ "./node_modules/underscore.string/decapitalize.js");
s.chop             = __webpack_require__(/*! ./chop */ "./node_modules/underscore.string/chop.js");
s.trim             = __webpack_require__(/*! ./trim */ "./node_modules/underscore.string/trim.js");
s.clean            = __webpack_require__(/*! ./clean */ "./node_modules/underscore.string/clean.js");
s.cleanDiacritics  = __webpack_require__(/*! ./cleanDiacritics */ "./node_modules/underscore.string/cleanDiacritics.js");
s.count            = __webpack_require__(/*! ./count */ "./node_modules/underscore.string/count.js");
s.chars            = __webpack_require__(/*! ./chars */ "./node_modules/underscore.string/chars.js");
s.swapCase         = __webpack_require__(/*! ./swapCase */ "./node_modules/underscore.string/swapCase.js");
s.escapeHTML       = __webpack_require__(/*! ./escapeHTML */ "./node_modules/underscore.string/escapeHTML.js");
s.unescapeHTML     = __webpack_require__(/*! ./unescapeHTML */ "./node_modules/underscore.string/unescapeHTML.js");
s.splice           = __webpack_require__(/*! ./splice */ "./node_modules/underscore.string/splice.js");
s.insert           = __webpack_require__(/*! ./insert */ "./node_modules/underscore.string/insert.js");
s.replaceAll       = __webpack_require__(/*! ./replaceAll */ "./node_modules/underscore.string/replaceAll.js");
s.include          = __webpack_require__(/*! ./include */ "./node_modules/underscore.string/include.js");
s.join             = __webpack_require__(/*! ./join */ "./node_modules/underscore.string/join.js");
s.lines            = __webpack_require__(/*! ./lines */ "./node_modules/underscore.string/lines.js");
s.dedent           = __webpack_require__(/*! ./dedent */ "./node_modules/underscore.string/dedent.js");
s.reverse          = __webpack_require__(/*! ./reverse */ "./node_modules/underscore.string/reverse.js");
s.startsWith       = __webpack_require__(/*! ./startsWith */ "./node_modules/underscore.string/startsWith.js");
s.endsWith         = __webpack_require__(/*! ./endsWith */ "./node_modules/underscore.string/endsWith.js");
s.pred             = __webpack_require__(/*! ./pred */ "./node_modules/underscore.string/pred.js");
s.succ             = __webpack_require__(/*! ./succ */ "./node_modules/underscore.string/succ.js");
s.titleize         = __webpack_require__(/*! ./titleize */ "./node_modules/underscore.string/titleize.js");
s.camelize         = __webpack_require__(/*! ./camelize */ "./node_modules/underscore.string/camelize.js");
s.underscored      = __webpack_require__(/*! ./underscored */ "./node_modules/underscore.string/underscored.js");
s.dasherize        = __webpack_require__(/*! ./dasherize */ "./node_modules/underscore.string/dasherize.js");
s.classify         = __webpack_require__(/*! ./classify */ "./node_modules/underscore.string/classify.js");
s.humanize         = __webpack_require__(/*! ./humanize */ "./node_modules/underscore.string/humanize.js");
s.ltrim            = __webpack_require__(/*! ./ltrim */ "./node_modules/underscore.string/ltrim.js");
s.rtrim            = __webpack_require__(/*! ./rtrim */ "./node_modules/underscore.string/rtrim.js");
s.truncate         = __webpack_require__(/*! ./truncate */ "./node_modules/underscore.string/truncate.js");
s.prune            = __webpack_require__(/*! ./prune */ "./node_modules/underscore.string/prune.js");
s.words            = __webpack_require__(/*! ./words */ "./node_modules/underscore.string/words.js");
s.pad              = __webpack_require__(/*! ./pad */ "./node_modules/underscore.string/pad.js");
s.lpad             = __webpack_require__(/*! ./lpad */ "./node_modules/underscore.string/lpad.js");
s.rpad             = __webpack_require__(/*! ./rpad */ "./node_modules/underscore.string/rpad.js");
s.lrpad            = __webpack_require__(/*! ./lrpad */ "./node_modules/underscore.string/lrpad.js");
s.sprintf          = __webpack_require__(/*! ./sprintf */ "./node_modules/underscore.string/sprintf.js");
s.vsprintf         = __webpack_require__(/*! ./vsprintf */ "./node_modules/underscore.string/vsprintf.js");
s.toNumber         = __webpack_require__(/*! ./toNumber */ "./node_modules/underscore.string/toNumber.js");
s.numberFormat     = __webpack_require__(/*! ./numberFormat */ "./node_modules/underscore.string/numberFormat.js");
s.strRight         = __webpack_require__(/*! ./strRight */ "./node_modules/underscore.string/strRight.js");
s.strRightBack     = __webpack_require__(/*! ./strRightBack */ "./node_modules/underscore.string/strRightBack.js");
s.strLeft          = __webpack_require__(/*! ./strLeft */ "./node_modules/underscore.string/strLeft.js");
s.strLeftBack      = __webpack_require__(/*! ./strLeftBack */ "./node_modules/underscore.string/strLeftBack.js");
s.toSentence       = __webpack_require__(/*! ./toSentence */ "./node_modules/underscore.string/toSentence.js");
s.toSentenceSerial = __webpack_require__(/*! ./toSentenceSerial */ "./node_modules/underscore.string/toSentenceSerial.js");
s.slugify          = __webpack_require__(/*! ./slugify */ "./node_modules/underscore.string/slugify.js");
s.surround         = __webpack_require__(/*! ./surround */ "./node_modules/underscore.string/surround.js");
s.quote            = __webpack_require__(/*! ./quote */ "./node_modules/underscore.string/quote.js");
s.unquote          = __webpack_require__(/*! ./unquote */ "./node_modules/underscore.string/unquote.js");
s.repeat           = __webpack_require__(/*! ./repeat */ "./node_modules/underscore.string/repeat.js");
s.naturalCmp       = __webpack_require__(/*! ./naturalCmp */ "./node_modules/underscore.string/naturalCmp.js");
s.levenshtein      = __webpack_require__(/*! ./levenshtein */ "./node_modules/underscore.string/levenshtein.js");
s.toBoolean        = __webpack_require__(/*! ./toBoolean */ "./node_modules/underscore.string/toBoolean.js");
s.exports          = __webpack_require__(/*! ./exports */ "./node_modules/underscore.string/exports.js");
s.escapeRegExp     = __webpack_require__(/*! ./helper/escapeRegExp */ "./node_modules/underscore.string/helper/escapeRegExp.js");
s.wrap             = __webpack_require__(/*! ./wrap */ "./node_modules/underscore.string/wrap.js");
s.map              = __webpack_require__(/*! ./map */ "./node_modules/underscore.string/map.js");

// Aliases
s.strip     = s.trim;
s.lstrip    = s.ltrim;
s.rstrip    = s.rtrim;
s.center    = s.lrpad;
s.rjust     = s.lpad;
s.ljust     = s.rpad;
s.contains  = s.include;
s.q         = s.quote;
s.toBool    = s.toBoolean;
s.camelcase = s.camelize;
s.mapChars  = s.map;


// Implement chaining
s.prototype = {
  value: function value() {
    return this._wrapped;
  }
};

function fn2method(key, fn) {
  if (typeof fn !== 'function') return;
  s.prototype[key] = function() {
    var args = [this._wrapped].concat(Array.prototype.slice.call(arguments));
    var res = fn.apply(null, args);
    // if the result is non-string stop the chain and return the value
    return typeof res === 'string' ? new s(res) : res;
  };
}

// Copy functions to instance methods for chaining
for (var key in s) fn2method(key, s[key]);

fn2method('tap', function tap(string, fn) {
  return fn(string);
});

function prototype2method(methodName) {
  fn2method(methodName, function(context) {
    var args = Array.prototype.slice.call(arguments, 1);
    return String.prototype[methodName].apply(context, args);
  });
}

var prototypeMethods = [
  'toUpperCase',
  'toLowerCase',
  'split',
  'replace',
  'slice',
  'substring',
  'substr',
  'concat'
];

for (var method in prototypeMethods) prototype2method(prototypeMethods[method]);


module.exports = s;


/***/ }),

/***/ "./node_modules/underscore.string/insert.js":
/*!**************************************************!*\
  !*** ./node_modules/underscore.string/insert.js ***!
  \**************************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

var splice = __webpack_require__(/*! ./splice */ "./node_modules/underscore.string/splice.js");

module.exports = function insert(str, i, substr) {
  return splice(str, i, 0, substr);
};


/***/ }),

/***/ "./node_modules/underscore.string/isBlank.js":
/*!***************************************************!*\
  !*** ./node_modules/underscore.string/isBlank.js ***!
  \***************************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

var makeString = __webpack_require__(/*! ./helper/makeString */ "./node_modules/underscore.string/helper/makeString.js");

module.exports = function isBlank(str) {
  return (/^\s*$/).test(makeString(str));
};


/***/ }),

/***/ "./node_modules/underscore.string/join.js":
/*!************************************************!*\
  !*** ./node_modules/underscore.string/join.js ***!
  \************************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

var makeString = __webpack_require__(/*! ./helper/makeString */ "./node_modules/underscore.string/helper/makeString.js");
var slice = [].slice;

module.exports = function join() {
  var args = slice.call(arguments),
    separator = args.shift();

  return args.join(makeString(separator));
};


/***/ }),

/***/ "./node_modules/underscore.string/levenshtein.js":
/*!*******************************************************!*\
  !*** ./node_modules/underscore.string/levenshtein.js ***!
  \*******************************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

var makeString = __webpack_require__(/*! ./helper/makeString */ "./node_modules/underscore.string/helper/makeString.js");

/**
 * Based on the implementation here: https://github.com/hiddentao/fast-levenshtein
 */
module.exports = function levenshtein(str1, str2) {
  'use strict';
  str1 = makeString(str1);
  str2 = makeString(str2);

  // Short cut cases  
  if (str1 === str2) return 0;
  if (!str1 || !str2) return Math.max(str1.length, str2.length);

  // two rows
  var prevRow = new Array(str2.length + 1);

  // initialise previous row
  for (var i = 0; i < prevRow.length; ++i) {
    prevRow[i] = i;
  }

  // calculate current row distance from previous row
  for (i = 0; i < str1.length; ++i) {
    var nextCol = i + 1;

    for (var j = 0; j < str2.length; ++j) {
      var curCol = nextCol;

      // substution
      nextCol = prevRow[j] + ( (str1.charAt(i) === str2.charAt(j)) ? 0 : 1 );
      // insertion
      var tmp = curCol + 1;
      if (nextCol > tmp) {
        nextCol = tmp;
      }
      // deletion
      tmp = prevRow[j + 1] + 1;
      if (nextCol > tmp) {
        nextCol = tmp;
      }

      // copy current col value into previous (in preparation for next iteration)
      prevRow[j] = curCol;
    }

    // copy last col value into previous (in preparation for next iteration)
    prevRow[j] = nextCol;
  }

  return nextCol;
};


/***/ }),

/***/ "./node_modules/underscore.string/lines.js":
/*!*************************************************!*\
  !*** ./node_modules/underscore.string/lines.js ***!
  \*************************************************/
/*! no static exports found */
/***/ (function(module, exports) {

module.exports = function lines(str) {
  if (str == null) return [];
  return String(str).split(/\r\n?|\n/);
};


/***/ }),

/***/ "./node_modules/underscore.string/lpad.js":
/*!************************************************!*\
  !*** ./node_modules/underscore.string/lpad.js ***!
  \************************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

var pad = __webpack_require__(/*! ./pad */ "./node_modules/underscore.string/pad.js");

module.exports = function lpad(str, length, padStr) {
  return pad(str, length, padStr);
};


/***/ }),

/***/ "./node_modules/underscore.string/lrpad.js":
/*!*************************************************!*\
  !*** ./node_modules/underscore.string/lrpad.js ***!
  \*************************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

var pad = __webpack_require__(/*! ./pad */ "./node_modules/underscore.string/pad.js");

module.exports = function lrpad(str, length, padStr) {
  return pad(str, length, padStr, 'both');
};


/***/ }),

/***/ "./node_modules/underscore.string/ltrim.js":
/*!*************************************************!*\
  !*** ./node_modules/underscore.string/ltrim.js ***!
  \*************************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

var makeString = __webpack_require__(/*! ./helper/makeString */ "./node_modules/underscore.string/helper/makeString.js");
var defaultToWhiteSpace = __webpack_require__(/*! ./helper/defaultToWhiteSpace */ "./node_modules/underscore.string/helper/defaultToWhiteSpace.js");
var nativeTrimLeft = String.prototype.trimLeft;

module.exports = function ltrim(str, characters) {
  str = makeString(str);
  if (!characters && nativeTrimLeft) return nativeTrimLeft.call(str);
  characters = defaultToWhiteSpace(characters);
  return str.replace(new RegExp('^' + characters + '+'), '');
};


/***/ }),

/***/ "./node_modules/underscore.string/map.js":
/*!***********************************************!*\
  !*** ./node_modules/underscore.string/map.js ***!
  \***********************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

var makeString = __webpack_require__(/*! ./helper/makeString */ "./node_modules/underscore.string/helper/makeString.js");

module.exports = function(str, callback) {
  str = makeString(str);

  if (str.length === 0 || typeof callback !== 'function') return str;

  return str.replace(/./g, callback);
};


/***/ }),

/***/ "./node_modules/underscore.string/naturalCmp.js":
/*!******************************************************!*\
  !*** ./node_modules/underscore.string/naturalCmp.js ***!
  \******************************************************/
/*! no static exports found */
/***/ (function(module, exports) {

module.exports = function naturalCmp(str1, str2) {
  if (str1 == str2) return 0;
  if (!str1) return -1;
  if (!str2) return 1;

  var cmpRegex = /(\.\d+|\d+|\D+)/g,
    tokens1 = String(str1).match(cmpRegex),
    tokens2 = String(str2).match(cmpRegex),
    count = Math.min(tokens1.length, tokens2.length);

  for (var i = 0; i < count; i++) {
    var a = tokens1[i],
      b = tokens2[i];

    if (a !== b) {
      var num1 = +a;
      var num2 = +b;
      if (num1 === num1 && num2 === num2) {
        return num1 > num2 ? 1 : -1;
      }
      return a < b ? -1 : 1;
    }
  }

  if (tokens1.length != tokens2.length)
    return tokens1.length - tokens2.length;

  return str1 < str2 ? -1 : 1;
};


/***/ }),

/***/ "./node_modules/underscore.string/numberFormat.js":
/*!********************************************************!*\
  !*** ./node_modules/underscore.string/numberFormat.js ***!
  \********************************************************/
/*! no static exports found */
/***/ (function(module, exports) {

module.exports = function numberFormat(number, dec, dsep, tsep) {
  if (isNaN(number) || number == null) return '';

  number = number.toFixed(~~dec);
  tsep = typeof tsep == 'string' ? tsep : ',';

  var parts = number.split('.'),
    fnums = parts[0],
    decimals = parts[1] ? (dsep || '.') + parts[1] : '';

  return fnums.replace(/(\d)(?=(?:\d{3})+$)/g, '$1' + tsep) + decimals;
};


/***/ }),

/***/ "./node_modules/underscore.string/pad.js":
/*!***********************************************!*\
  !*** ./node_modules/underscore.string/pad.js ***!
  \***********************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

var makeString = __webpack_require__(/*! ./helper/makeString */ "./node_modules/underscore.string/helper/makeString.js");
var strRepeat = __webpack_require__(/*! ./helper/strRepeat */ "./node_modules/underscore.string/helper/strRepeat.js");

module.exports = function pad(str, length, padStr, type) {
  str = makeString(str);
  length = ~~length;

  var padlen = 0;

  if (!padStr)
    padStr = ' ';
  else if (padStr.length > 1)
    padStr = padStr.charAt(0);

  switch (type) {
  case 'right':
    padlen = length - str.length;
    return str + strRepeat(padStr, padlen);
  case 'both':
    padlen = length - str.length;
    return strRepeat(padStr, Math.ceil(padlen / 2)) + str + strRepeat(padStr, Math.floor(padlen / 2));
  default: // 'left'
    padlen = length - str.length;
    return strRepeat(padStr, padlen) + str;
  }
};


/***/ }),

/***/ "./node_modules/underscore.string/pred.js":
/*!************************************************!*\
  !*** ./node_modules/underscore.string/pred.js ***!
  \************************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

var adjacent = __webpack_require__(/*! ./helper/adjacent */ "./node_modules/underscore.string/helper/adjacent.js");

module.exports = function succ(str) {
  return adjacent(str, -1);
};


/***/ }),

/***/ "./node_modules/underscore.string/prune.js":
/*!*************************************************!*\
  !*** ./node_modules/underscore.string/prune.js ***!
  \*************************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

/**
 * _s.prune: a more elegant version of truncate
 * prune extra chars, never leaving a half-chopped word.
 * @author github.com/rwz
 */
var makeString = __webpack_require__(/*! ./helper/makeString */ "./node_modules/underscore.string/helper/makeString.js");
var rtrim = __webpack_require__(/*! ./rtrim */ "./node_modules/underscore.string/rtrim.js");

module.exports = function prune(str, length, pruneStr) {
  str = makeString(str);
  length = ~~length;
  pruneStr = pruneStr != null ? String(pruneStr) : '...';

  if (str.length <= length) return str;

  var tmpl = function(c) {
      return c.toUpperCase() !== c.toLowerCase() ? 'A' : ' ';
    },
    template = str.slice(0, length + 1).replace(/.(?=\W*\w*$)/g, tmpl); // 'Hello, world' -> 'HellAA AAAAA'

  if (template.slice(template.length - 2).match(/\w\w/))
    template = template.replace(/\s*\S+$/, '');
  else
    template = rtrim(template.slice(0, template.length - 1));

  return (template + pruneStr).length > str.length ? str : str.slice(0, template.length) + pruneStr;
};


/***/ }),

/***/ "./node_modules/underscore.string/quote.js":
/*!*************************************************!*\
  !*** ./node_modules/underscore.string/quote.js ***!
  \*************************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

var surround = __webpack_require__(/*! ./surround */ "./node_modules/underscore.string/surround.js");

module.exports = function quote(str, quoteChar) {
  return surround(str, quoteChar || '"');
};


/***/ }),

/***/ "./node_modules/underscore.string/repeat.js":
/*!**************************************************!*\
  !*** ./node_modules/underscore.string/repeat.js ***!
  \**************************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

var makeString = __webpack_require__(/*! ./helper/makeString */ "./node_modules/underscore.string/helper/makeString.js");
var strRepeat = __webpack_require__(/*! ./helper/strRepeat */ "./node_modules/underscore.string/helper/strRepeat.js");

module.exports = function repeat(str, qty, separator) {
  str = makeString(str);

  qty = ~~qty;

  // using faster implementation if separator is not needed;
  if (separator == null) return strRepeat(str, qty);

  // this one is about 300x slower in Google Chrome
  /*eslint no-empty: 0*/
  for (var repeat = []; qty > 0; repeat[--qty] = str) {}
  return repeat.join(separator);
};


/***/ }),

/***/ "./node_modules/underscore.string/replaceAll.js":
/*!******************************************************!*\
  !*** ./node_modules/underscore.string/replaceAll.js ***!
  \******************************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

var makeString = __webpack_require__(/*! ./helper/makeString */ "./node_modules/underscore.string/helper/makeString.js");

module.exports = function replaceAll(str, find, replace, ignorecase) {
  var flags = (ignorecase === true)?'gi':'g';
  var reg = new RegExp(find, flags);

  return makeString(str).replace(reg, replace);
};


/***/ }),

/***/ "./node_modules/underscore.string/reverse.js":
/*!***************************************************!*\
  !*** ./node_modules/underscore.string/reverse.js ***!
  \***************************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

var chars = __webpack_require__(/*! ./chars */ "./node_modules/underscore.string/chars.js");

module.exports = function reverse(str) {
  return chars(str).reverse().join('');
};


/***/ }),

/***/ "./node_modules/underscore.string/rpad.js":
/*!************************************************!*\
  !*** ./node_modules/underscore.string/rpad.js ***!
  \************************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

var pad = __webpack_require__(/*! ./pad */ "./node_modules/underscore.string/pad.js");

module.exports = function rpad(str, length, padStr) {
  return pad(str, length, padStr, 'right');
};


/***/ }),

/***/ "./node_modules/underscore.string/rtrim.js":
/*!*************************************************!*\
  !*** ./node_modules/underscore.string/rtrim.js ***!
  \*************************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

var makeString = __webpack_require__(/*! ./helper/makeString */ "./node_modules/underscore.string/helper/makeString.js");
var defaultToWhiteSpace = __webpack_require__(/*! ./helper/defaultToWhiteSpace */ "./node_modules/underscore.string/helper/defaultToWhiteSpace.js");
var nativeTrimRight = String.prototype.trimRight;

module.exports = function rtrim(str, characters) {
  str = makeString(str);
  if (!characters && nativeTrimRight) return nativeTrimRight.call(str);
  characters = defaultToWhiteSpace(characters);
  return str.replace(new RegExp(characters + '+$'), '');
};


/***/ }),

/***/ "./node_modules/underscore.string/slugify.js":
/*!***************************************************!*\
  !*** ./node_modules/underscore.string/slugify.js ***!
  \***************************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

var trim = __webpack_require__(/*! ./trim */ "./node_modules/underscore.string/trim.js");
var dasherize = __webpack_require__(/*! ./dasherize */ "./node_modules/underscore.string/dasherize.js");
var cleanDiacritics = __webpack_require__(/*! ./cleanDiacritics */ "./node_modules/underscore.string/cleanDiacritics.js");

module.exports = function slugify(str) {
  return trim(dasherize(cleanDiacritics(str).replace(/[^\w\s-]/g, '-').toLowerCase()), '-');
};


/***/ }),

/***/ "./node_modules/underscore.string/splice.js":
/*!**************************************************!*\
  !*** ./node_modules/underscore.string/splice.js ***!
  \**************************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

var chars = __webpack_require__(/*! ./chars */ "./node_modules/underscore.string/chars.js");

module.exports = function splice(str, i, howmany, substr) {
  var arr = chars(str);
  arr.splice(~~i, ~~howmany, substr);
  return arr.join('');
};


/***/ }),

/***/ "./node_modules/underscore.string/sprintf.js":
/*!***************************************************!*\
  !*** ./node_modules/underscore.string/sprintf.js ***!
  \***************************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

var deprecate = __webpack_require__(/*! util-deprecate */ "./node_modules/util-deprecate/browser.js");

module.exports = deprecate(__webpack_require__(/*! sprintf-js */ "./node_modules/sprintf-js/src/sprintf.js").sprintf,
  'sprintf() will be removed in the next major release, use the sprintf-js package instead.');


/***/ }),

/***/ "./node_modules/underscore.string/startsWith.js":
/*!******************************************************!*\
  !*** ./node_modules/underscore.string/startsWith.js ***!
  \******************************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

var makeString = __webpack_require__(/*! ./helper/makeString */ "./node_modules/underscore.string/helper/makeString.js");
var toPositive = __webpack_require__(/*! ./helper/toPositive */ "./node_modules/underscore.string/helper/toPositive.js");

module.exports = function startsWith(str, starts, position) {
  str = makeString(str);
  starts = '' + starts;
  position = position == null ? 0 : Math.min(toPositive(position), str.length);
  return str.lastIndexOf(starts, position) === position;
};


/***/ }),

/***/ "./node_modules/underscore.string/strLeft.js":
/*!***************************************************!*\
  !*** ./node_modules/underscore.string/strLeft.js ***!
  \***************************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

var makeString = __webpack_require__(/*! ./helper/makeString */ "./node_modules/underscore.string/helper/makeString.js");

module.exports = function strLeft(str, sep) {
  str = makeString(str);
  sep = makeString(sep);
  var pos = !sep ? -1 : str.indexOf(sep);
  return~ pos ? str.slice(0, pos) : str;
};


/***/ }),

/***/ "./node_modules/underscore.string/strLeftBack.js":
/*!*******************************************************!*\
  !*** ./node_modules/underscore.string/strLeftBack.js ***!
  \*******************************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

var makeString = __webpack_require__(/*! ./helper/makeString */ "./node_modules/underscore.string/helper/makeString.js");

module.exports = function strLeftBack(str, sep) {
  str = makeString(str);
  sep = makeString(sep);
  var pos = str.lastIndexOf(sep);
  return~ pos ? str.slice(0, pos) : str;
};


/***/ }),

/***/ "./node_modules/underscore.string/strRight.js":
/*!****************************************************!*\
  !*** ./node_modules/underscore.string/strRight.js ***!
  \****************************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

var makeString = __webpack_require__(/*! ./helper/makeString */ "./node_modules/underscore.string/helper/makeString.js");

module.exports = function strRight(str, sep) {
  str = makeString(str);
  sep = makeString(sep);
  var pos = !sep ? -1 : str.indexOf(sep);
  return~ pos ? str.slice(pos + sep.length, str.length) : str;
};


/***/ }),

/***/ "./node_modules/underscore.string/strRightBack.js":
/*!********************************************************!*\
  !*** ./node_modules/underscore.string/strRightBack.js ***!
  \********************************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

var makeString = __webpack_require__(/*! ./helper/makeString */ "./node_modules/underscore.string/helper/makeString.js");

module.exports = function strRightBack(str, sep) {
  str = makeString(str);
  sep = makeString(sep);
  var pos = !sep ? -1 : str.lastIndexOf(sep);
  return~ pos ? str.slice(pos + sep.length, str.length) : str;
};


/***/ }),

/***/ "./node_modules/underscore.string/stripTags.js":
/*!*****************************************************!*\
  !*** ./node_modules/underscore.string/stripTags.js ***!
  \*****************************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

var makeString = __webpack_require__(/*! ./helper/makeString */ "./node_modules/underscore.string/helper/makeString.js");

module.exports = function stripTags(str) {
  return makeString(str).replace(/<\/?[^>]+>/g, '');
};


/***/ }),

/***/ "./node_modules/underscore.string/succ.js":
/*!************************************************!*\
  !*** ./node_modules/underscore.string/succ.js ***!
  \************************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

var adjacent = __webpack_require__(/*! ./helper/adjacent */ "./node_modules/underscore.string/helper/adjacent.js");

module.exports = function succ(str) {
  return adjacent(str, 1);
};


/***/ }),

/***/ "./node_modules/underscore.string/surround.js":
/*!****************************************************!*\
  !*** ./node_modules/underscore.string/surround.js ***!
  \****************************************************/
/*! no static exports found */
/***/ (function(module, exports) {

module.exports = function surround(str, wrapper) {
  return [wrapper, str, wrapper].join('');
};


/***/ }),

/***/ "./node_modules/underscore.string/swapCase.js":
/*!****************************************************!*\
  !*** ./node_modules/underscore.string/swapCase.js ***!
  \****************************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

var makeString = __webpack_require__(/*! ./helper/makeString */ "./node_modules/underscore.string/helper/makeString.js");

module.exports = function swapCase(str) {
  return makeString(str).replace(/\S/g, function(c) {
    return c === c.toUpperCase() ? c.toLowerCase() : c.toUpperCase();
  });
};


/***/ }),

/***/ "./node_modules/underscore.string/titleize.js":
/*!****************************************************!*\
  !*** ./node_modules/underscore.string/titleize.js ***!
  \****************************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

var makeString = __webpack_require__(/*! ./helper/makeString */ "./node_modules/underscore.string/helper/makeString.js");

module.exports = function titleize(str) {
  return makeString(str).toLowerCase().replace(/(?:^|\s|-)\S/g, function(c) {
    return c.toUpperCase();
  });
};


/***/ }),

/***/ "./node_modules/underscore.string/toBoolean.js":
/*!*****************************************************!*\
  !*** ./node_modules/underscore.string/toBoolean.js ***!
  \*****************************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

var trim = __webpack_require__(/*! ./trim */ "./node_modules/underscore.string/trim.js");

function boolMatch(s, matchers) {
  var i, matcher, down = s.toLowerCase();
  matchers = [].concat(matchers);
  for (i = 0; i < matchers.length; i += 1) {
    matcher = matchers[i];
    if (!matcher) continue;
    if (matcher.test && matcher.test(s)) return true;
    if (matcher.toLowerCase() === down) return true;
  }
}

module.exports = function toBoolean(str, trueValues, falseValues) {
  if (typeof str === 'number') str = '' + str;
  if (typeof str !== 'string') return !!str;
  str = trim(str);
  if (boolMatch(str, trueValues || ['true', '1'])) return true;
  if (boolMatch(str, falseValues || ['false', '0'])) return false;
};


/***/ }),

/***/ "./node_modules/underscore.string/toNumber.js":
/*!****************************************************!*\
  !*** ./node_modules/underscore.string/toNumber.js ***!
  \****************************************************/
/*! no static exports found */
/***/ (function(module, exports) {

module.exports = function toNumber(num, precision) {
  if (num == null) return 0;
  var factor = Math.pow(10, isFinite(precision) ? precision : 0);
  return Math.round(num * factor) / factor;
};


/***/ }),

/***/ "./node_modules/underscore.string/toSentence.js":
/*!******************************************************!*\
  !*** ./node_modules/underscore.string/toSentence.js ***!
  \******************************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

var rtrim = __webpack_require__(/*! ./rtrim */ "./node_modules/underscore.string/rtrim.js");

module.exports = function toSentence(array, separator, lastSeparator, serial) {
  separator = separator || ', ';
  lastSeparator = lastSeparator || ' and ';
  var a = array.slice(),
    lastMember = a.pop();

  if (array.length > 2 && serial) lastSeparator = rtrim(separator) + lastSeparator;

  return a.length ? a.join(separator) + lastSeparator + lastMember : lastMember;
};


/***/ }),

/***/ "./node_modules/underscore.string/toSentenceSerial.js":
/*!************************************************************!*\
  !*** ./node_modules/underscore.string/toSentenceSerial.js ***!
  \************************************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

var toSentence = __webpack_require__(/*! ./toSentence */ "./node_modules/underscore.string/toSentence.js");

module.exports = function toSentenceSerial(array, sep, lastSep) {
  return toSentence(array, sep, lastSep, true);
};


/***/ }),

/***/ "./node_modules/underscore.string/trim.js":
/*!************************************************!*\
  !*** ./node_modules/underscore.string/trim.js ***!
  \************************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

var makeString = __webpack_require__(/*! ./helper/makeString */ "./node_modules/underscore.string/helper/makeString.js");
var defaultToWhiteSpace = __webpack_require__(/*! ./helper/defaultToWhiteSpace */ "./node_modules/underscore.string/helper/defaultToWhiteSpace.js");
var nativeTrim = String.prototype.trim;

module.exports = function trim(str, characters) {
  str = makeString(str);
  if (!characters && nativeTrim) return nativeTrim.call(str);
  characters = defaultToWhiteSpace(characters);
  return str.replace(new RegExp('^' + characters + '+|' + characters + '+$', 'g'), '');
};


/***/ }),

/***/ "./node_modules/underscore.string/truncate.js":
/*!****************************************************!*\
  !*** ./node_modules/underscore.string/truncate.js ***!
  \****************************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

var makeString = __webpack_require__(/*! ./helper/makeString */ "./node_modules/underscore.string/helper/makeString.js");

module.exports = function truncate(str, length, truncateStr) {
  str = makeString(str);
  truncateStr = truncateStr || '...';
  length = ~~length;
  return str.length > length ? str.slice(0, length) + truncateStr : str;
};


/***/ }),

/***/ "./node_modules/underscore.string/underscored.js":
/*!*******************************************************!*\
  !*** ./node_modules/underscore.string/underscored.js ***!
  \*******************************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

var trim = __webpack_require__(/*! ./trim */ "./node_modules/underscore.string/trim.js");

module.exports = function underscored(str) {
  return trim(str).replace(/([a-z\d])([A-Z]+)/g, '$1_$2').replace(/[-\s]+/g, '_').toLowerCase();
};


/***/ }),

/***/ "./node_modules/underscore.string/unescapeHTML.js":
/*!********************************************************!*\
  !*** ./node_modules/underscore.string/unescapeHTML.js ***!
  \********************************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

var makeString = __webpack_require__(/*! ./helper/makeString */ "./node_modules/underscore.string/helper/makeString.js");
var htmlEntities = __webpack_require__(/*! ./helper/htmlEntities */ "./node_modules/underscore.string/helper/htmlEntities.js");

module.exports = function unescapeHTML(str) {
  return makeString(str).replace(/\&([^;]{1,10});/g, function(entity, entityCode) {
    var match;

    if (entityCode in htmlEntities) {
      return htmlEntities[entityCode];
    /*eslint no-cond-assign: 0*/
    } else if (match = entityCode.match(/^#x([\da-fA-F]+)$/)) {
      return String.fromCharCode(parseInt(match[1], 16));
    /*eslint no-cond-assign: 0*/
    } else if (match = entityCode.match(/^#(\d+)$/)) {
      return String.fromCharCode(~~match[1]);
    } else {
      return entity;
    }
  });
};


/***/ }),

/***/ "./node_modules/underscore.string/unquote.js":
/*!***************************************************!*\
  !*** ./node_modules/underscore.string/unquote.js ***!
  \***************************************************/
/*! no static exports found */
/***/ (function(module, exports) {

module.exports = function unquote(str, quoteChar) {
  quoteChar = quoteChar || '"';
  if (str[0] === quoteChar && str[str.length - 1] === quoteChar)
    return str.slice(1, str.length - 1);
  else return str;
};


/***/ }),

/***/ "./node_modules/underscore.string/vsprintf.js":
/*!****************************************************!*\
  !*** ./node_modules/underscore.string/vsprintf.js ***!
  \****************************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

var deprecate = __webpack_require__(/*! util-deprecate */ "./node_modules/util-deprecate/browser.js");

module.exports = deprecate(__webpack_require__(/*! sprintf-js */ "./node_modules/sprintf-js/src/sprintf.js").vsprintf,
  'vsprintf() will be removed in the next major release, use the sprintf-js package instead.');


/***/ }),

/***/ "./node_modules/underscore.string/words.js":
/*!*************************************************!*\
  !*** ./node_modules/underscore.string/words.js ***!
  \*************************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

var isBlank = __webpack_require__(/*! ./isBlank */ "./node_modules/underscore.string/isBlank.js");
var trim = __webpack_require__(/*! ./trim */ "./node_modules/underscore.string/trim.js");

module.exports = function words(str, delimiter) {
  if (isBlank(str)) return [];
  return trim(str, delimiter).split(delimiter || /\s+/);
};


/***/ }),

/***/ "./node_modules/underscore.string/wrap.js":
/*!************************************************!*\
  !*** ./node_modules/underscore.string/wrap.js ***!
  \************************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

// Wrap
// wraps a string by a certain width

var makeString = __webpack_require__(/*! ./helper/makeString */ "./node_modules/underscore.string/helper/makeString.js");

module.exports = function wrap(str, options){
  str = makeString(str);
  
  options = options || {};
  
  var width = options.width || 75;
  var seperator = options.seperator || '\n';
  var cut = options.cut || false;
  var preserveSpaces = options.preserveSpaces || false;
  var trailingSpaces = options.trailingSpaces || false;
  
  var result;
  
  if(width <= 0){
    return str;
  }
  
  else if(!cut){
  
    var words = str.split(' ');
    var current_column = 0;
    result = '';
  
    while(words.length > 0){
      
      // if adding a space and the next word would cause this line to be longer than width...
      if(1 + words[0].length + current_column > width){
        //start a new line if this line is not already empty
        if(current_column > 0){
          // add a space at the end of the line is preserveSpaces is true
          if (preserveSpaces){
            result += ' ';
            current_column++;
          }
          // fill the rest of the line with spaces if trailingSpaces option is true
          else if(trailingSpaces){
            while(current_column < width){
              result += ' ';
              current_column++;
            }            
          }
          //start new line
          result += seperator;
          current_column = 0;
        }
      }
  
      // if not at the begining of the line, add a space in front of the word
      if(current_column > 0){
        result += ' ';
        current_column++;
      }
  
      // tack on the next word, update current column, a pop words array
      result += words[0];
      current_column += words[0].length;
      words.shift();
  
    }
  
    // fill the rest of the line with spaces if trailingSpaces option is true
    if(trailingSpaces){
      while(current_column < width){
        result += ' ';
        current_column++;
      }            
    }
  
    return result;
  
  }
  
  else {
  
    var index = 0;
    result = '';
  
    // walk through each character and add seperators where appropriate
    while(index < str.length){
      if(index % width == 0 && index > 0){
        result += seperator;
      }
      result += str.charAt(index);
      index++;
    }
  
    // fill the rest of the line with spaces if trailingSpaces option is true
    if(trailingSpaces){
      while(index % width > 0){
        result += ' ';
        index++;
      }            
    }
    
    return result;
  }
};


/***/ }),

/***/ "./node_modules/underscore/modules/index-all.js":
/*!******************************************************!*\
  !*** ./node_modules/underscore/modules/index-all.js ***!
  \******************************************************/
/*! exports provided: default, VERSION, iteratee, restArguments, each, forEach, map, collect, reduce, foldl, inject, reduceRight, foldr, find, detect, filter, select, reject, every, all, some, any, contains, includes, include, invoke, pluck, where, findWhere, max, min, shuffle, sample, sortBy, groupBy, indexBy, countBy, toArray, size, partition, first, head, take, initial, last, rest, tail, drop, compact, flatten, without, uniq, unique, union, intersection, difference, unzip, zip, object, findIndex, findLastIndex, sortedIndex, indexOf, lastIndexOf, range, chunk, bind, partial, bindAll, memoize, delay, defer, throttle, debounce, wrap, negate, compose, after, before, once, keys, allKeys, values, mapObject, pairs, invert, functions, methods, extend, extendOwn, assign, findKey, pick, omit, defaults, create, clone, tap, isMatch, isEqual, isEmpty, isElement, isArray, isObject, isArguments, isFunction, isString, isNumber, isDate, isRegExp, isError, isSymbol, isMap, isWeakMap, isSet, isWeakSet, isFinite, isNaN, isBoolean, isNull, isUndefined, has, identity, constant, noop, property, propertyOf, matcher, matches, times, random, now, escape, unescape, result, uniqueId, templateSettings, template, chain, mixin */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony import */ var _index_default_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./index-default.js */ "./node_modules/underscore/modules/index-default.js");
/* harmony reexport (safe) */ __webpack_require__.d(__webpack_exports__, "default", function() { return _index_default_js__WEBPACK_IMPORTED_MODULE_0__["default"]; });

/* harmony import */ var _index_js__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ./index.js */ "./node_modules/underscore/modules/index.js");
/* harmony reexport (safe) */ __webpack_require__.d(__webpack_exports__, "VERSION", function() { return _index_js__WEBPACK_IMPORTED_MODULE_1__["VERSION"]; });

/* harmony reexport (safe) */ __webpack_require__.d(__webpack_exports__, "iteratee", function() { return _index_js__WEBPACK_IMPORTED_MODULE_1__["iteratee"]; });

/* harmony reexport (safe) */ __webpack_require__.d(__webpack_exports__, "restArguments", function() { return _index_js__WEBPACK_IMPORTED_MODULE_1__["restArguments"]; });

/* harmony reexport (safe) */ __webpack_require__.d(__webpack_exports__, "each", function() { return _index_js__WEBPACK_IMPORTED_MODULE_1__["each"]; });

/* harmony reexport (safe) */ __webpack_require__.d(__webpack_exports__, "forEach", function() { return _index_js__WEBPACK_IMPORTED_MODULE_1__["forEach"]; });

/* harmony reexport (safe) */ __webpack_require__.d(__webpack_exports__, "map", function() { return _index_js__WEBPACK_IMPORTED_MODULE_1__["map"]; });

/* harmony reexport (safe) */ __webpack_require__.d(__webpack_exports__, "collect", function() { return _index_js__WEBPACK_IMPORTED_MODULE_1__["collect"]; });

/* harmony reexport (safe) */ __webpack_require__.d(__webpack_exports__, "reduce", function() { return _index_js__WEBPACK_IMPORTED_MODULE_1__["reduce"]; });

/* harmony reexport (safe) */ __webpack_require__.d(__webpack_exports__, "foldl", function() { return _index_js__WEBPACK_IMPORTED_MODULE_1__["foldl"]; });

/* harmony reexport (safe) */ __webpack_require__.d(__webpack_exports__, "inject", function() { return _index_js__WEBPACK_IMPORTED_MODULE_1__["inject"]; });

/* harmony reexport (safe) */ __webpack_require__.d(__webpack_exports__, "reduceRight", function() { return _index_js__WEBPACK_IMPORTED_MODULE_1__["reduceRight"]; });

/* harmony reexport (safe) */ __webpack_require__.d(__webpack_exports__, "foldr", function() { return _index_js__WEBPACK_IMPORTED_MODULE_1__["foldr"]; });

/* harmony reexport (safe) */ __webpack_require__.d(__webpack_exports__, "find", function() { return _index_js__WEBPACK_IMPORTED_MODULE_1__["find"]; });

/* harmony reexport (safe) */ __webpack_require__.d(__webpack_exports__, "detect", function() { return _index_js__WEBPACK_IMPORTED_MODULE_1__["detect"]; });

/* harmony reexport (safe) */ __webpack_require__.d(__webpack_exports__, "filter", function() { return _index_js__WEBPACK_IMPORTED_MODULE_1__["filter"]; });

/* harmony reexport (safe) */ __webpack_require__.d(__webpack_exports__, "select", function() { return _index_js__WEBPACK_IMPORTED_MODULE_1__["select"]; });

/* harmony reexport (safe) */ __webpack_require__.d(__webpack_exports__, "reject", function() { return _index_js__WEBPACK_IMPORTED_MODULE_1__["reject"]; });

/* harmony reexport (safe) */ __webpack_require__.d(__webpack_exports__, "every", function() { return _index_js__WEBPACK_IMPORTED_MODULE_1__["every"]; });

/* harmony reexport (safe) */ __webpack_require__.d(__webpack_exports__, "all", function() { return _index_js__WEBPACK_IMPORTED_MODULE_1__["all"]; });

/* harmony reexport (safe) */ __webpack_require__.d(__webpack_exports__, "some", function() { return _index_js__WEBPACK_IMPORTED_MODULE_1__["some"]; });

/* harmony reexport (safe) */ __webpack_require__.d(__webpack_exports__, "any", function() { return _index_js__WEBPACK_IMPORTED_MODULE_1__["any"]; });

/* harmony reexport (safe) */ __webpack_require__.d(__webpack_exports__, "contains", function() { return _index_js__WEBPACK_IMPORTED_MODULE_1__["contains"]; });

/* harmony reexport (safe) */ __webpack_require__.d(__webpack_exports__, "includes", function() { return _index_js__WEBPACK_IMPORTED_MODULE_1__["includes"]; });

/* harmony reexport (safe) */ __webpack_require__.d(__webpack_exports__, "include", function() { return _index_js__WEBPACK_IMPORTED_MODULE_1__["include"]; });

/* harmony reexport (safe) */ __webpack_require__.d(__webpack_exports__, "invoke", function() { return _index_js__WEBPACK_IMPORTED_MODULE_1__["invoke"]; });

/* harmony reexport (safe) */ __webpack_require__.d(__webpack_exports__, "pluck", function() { return _index_js__WEBPACK_IMPORTED_MODULE_1__["pluck"]; });

/* harmony reexport (safe) */ __webpack_require__.d(__webpack_exports__, "where", function() { return _index_js__WEBPACK_IMPORTED_MODULE_1__["where"]; });

/* harmony reexport (safe) */ __webpack_require__.d(__webpack_exports__, "findWhere", function() { return _index_js__WEBPACK_IMPORTED_MODULE_1__["findWhere"]; });

/* harmony reexport (safe) */ __webpack_require__.d(__webpack_exports__, "max", function() { return _index_js__WEBPACK_IMPORTED_MODULE_1__["max"]; });

/* harmony reexport (safe) */ __webpack_require__.d(__webpack_exports__, "min", function() { return _index_js__WEBPACK_IMPORTED_MODULE_1__["min"]; });

/* harmony reexport (safe) */ __webpack_require__.d(__webpack_exports__, "shuffle", function() { return _index_js__WEBPACK_IMPORTED_MODULE_1__["shuffle"]; });

/* harmony reexport (safe) */ __webpack_require__.d(__webpack_exports__, "sample", function() { return _index_js__WEBPACK_IMPORTED_MODULE_1__["sample"]; });

/* harmony reexport (safe) */ __webpack_require__.d(__webpack_exports__, "sortBy", function() { return _index_js__WEBPACK_IMPORTED_MODULE_1__["sortBy"]; });

/* harmony reexport (safe) */ __webpack_require__.d(__webpack_exports__, "groupBy", function() { return _index_js__WEBPACK_IMPORTED_MODULE_1__["groupBy"]; });

/* harmony reexport (safe) */ __webpack_require__.d(__webpack_exports__, "indexBy", function() { return _index_js__WEBPACK_IMPORTED_MODULE_1__["indexBy"]; });

/* harmony reexport (safe) */ __webpack_require__.d(__webpack_exports__, "countBy", function() { return _index_js__WEBPACK_IMPORTED_MODULE_1__["countBy"]; });

/* harmony reexport (safe) */ __webpack_require__.d(__webpack_exports__, "toArray", function() { return _index_js__WEBPACK_IMPORTED_MODULE_1__["toArray"]; });

/* harmony reexport (safe) */ __webpack_require__.d(__webpack_exports__, "size", function() { return _index_js__WEBPACK_IMPORTED_MODULE_1__["size"]; });

/* harmony reexport (safe) */ __webpack_require__.d(__webpack_exports__, "partition", function() { return _index_js__WEBPACK_IMPORTED_MODULE_1__["partition"]; });

/* harmony reexport (safe) */ __webpack_require__.d(__webpack_exports__, "first", function() { return _index_js__WEBPACK_IMPORTED_MODULE_1__["first"]; });

/* harmony reexport (safe) */ __webpack_require__.d(__webpack_exports__, "head", function() { return _index_js__WEBPACK_IMPORTED_MODULE_1__["head"]; });

/* harmony reexport (safe) */ __webpack_require__.d(__webpack_exports__, "take", function() { return _index_js__WEBPACK_IMPORTED_MODULE_1__["take"]; });

/* harmony reexport (safe) */ __webpack_require__.d(__webpack_exports__, "initial", function() { return _index_js__WEBPACK_IMPORTED_MODULE_1__["initial"]; });

/* harmony reexport (safe) */ __webpack_require__.d(__webpack_exports__, "last", function() { return _index_js__WEBPACK_IMPORTED_MODULE_1__["last"]; });

/* harmony reexport (safe) */ __webpack_require__.d(__webpack_exports__, "rest", function() { return _index_js__WEBPACK_IMPORTED_MODULE_1__["rest"]; });

/* harmony reexport (safe) */ __webpack_require__.d(__webpack_exports__, "tail", function() { return _index_js__WEBPACK_IMPORTED_MODULE_1__["tail"]; });

/* harmony reexport (safe) */ __webpack_require__.d(__webpack_exports__, "drop", function() { return _index_js__WEBPACK_IMPORTED_MODULE_1__["drop"]; });

/* harmony reexport (safe) */ __webpack_require__.d(__webpack_exports__, "compact", function() { return _index_js__WEBPACK_IMPORTED_MODULE_1__["compact"]; });

/* harmony reexport (safe) */ __webpack_require__.d(__webpack_exports__, "flatten", function() { return _index_js__WEBPACK_IMPORTED_MODULE_1__["flatten"]; });

/* harmony reexport (safe) */ __webpack_require__.d(__webpack_exports__, "without", function() { return _index_js__WEBPACK_IMPORTED_MODULE_1__["without"]; });

/* harmony reexport (safe) */ __webpack_require__.d(__webpack_exports__, "uniq", function() { return _index_js__WEBPACK_IMPORTED_MODULE_1__["uniq"]; });

/* harmony reexport (safe) */ __webpack_require__.d(__webpack_exports__, "unique", function() { return _index_js__WEBPACK_IMPORTED_MODULE_1__["unique"]; });

/* harmony reexport (safe) */ __webpack_require__.d(__webpack_exports__, "union", function() { return _index_js__WEBPACK_IMPORTED_MODULE_1__["union"]; });

/* harmony reexport (safe) */ __webpack_require__.d(__webpack_exports__, "intersection", function() { return _index_js__WEBPACK_IMPORTED_MODULE_1__["intersection"]; });

/* harmony reexport (safe) */ __webpack_require__.d(__webpack_exports__, "difference", function() { return _index_js__WEBPACK_IMPORTED_MODULE_1__["difference"]; });

/* harmony reexport (safe) */ __webpack_require__.d(__webpack_exports__, "unzip", function() { return _index_js__WEBPACK_IMPORTED_MODULE_1__["unzip"]; });

/* harmony reexport (safe) */ __webpack_require__.d(__webpack_exports__, "zip", function() { return _index_js__WEBPACK_IMPORTED_MODULE_1__["zip"]; });

/* harmony reexport (safe) */ __webpack_require__.d(__webpack_exports__, "object", function() { return _index_js__WEBPACK_IMPORTED_MODULE_1__["object"]; });

/* harmony reexport (safe) */ __webpack_require__.d(__webpack_exports__, "findIndex", function() { return _index_js__WEBPACK_IMPORTED_MODULE_1__["findIndex"]; });

/* harmony reexport (safe) */ __webpack_require__.d(__webpack_exports__, "findLastIndex", function() { return _index_js__WEBPACK_IMPORTED_MODULE_1__["findLastIndex"]; });

/* harmony reexport (safe) */ __webpack_require__.d(__webpack_exports__, "sortedIndex", function() { return _index_js__WEBPACK_IMPORTED_MODULE_1__["sortedIndex"]; });

/* harmony reexport (safe) */ __webpack_require__.d(__webpack_exports__, "indexOf", function() { return _index_js__WEBPACK_IMPORTED_MODULE_1__["indexOf"]; });

/* harmony reexport (safe) */ __webpack_require__.d(__webpack_exports__, "lastIndexOf", function() { return _index_js__WEBPACK_IMPORTED_MODULE_1__["lastIndexOf"]; });

/* harmony reexport (safe) */ __webpack_require__.d(__webpack_exports__, "range", function() { return _index_js__WEBPACK_IMPORTED_MODULE_1__["range"]; });

/* harmony reexport (safe) */ __webpack_require__.d(__webpack_exports__, "chunk", function() { return _index_js__WEBPACK_IMPORTED_MODULE_1__["chunk"]; });

/* harmony reexport (safe) */ __webpack_require__.d(__webpack_exports__, "bind", function() { return _index_js__WEBPACK_IMPORTED_MODULE_1__["bind"]; });

/* harmony reexport (safe) */ __webpack_require__.d(__webpack_exports__, "partial", function() { return _index_js__WEBPACK_IMPORTED_MODULE_1__["partial"]; });

/* harmony reexport (safe) */ __webpack_require__.d(__webpack_exports__, "bindAll", function() { return _index_js__WEBPACK_IMPORTED_MODULE_1__["bindAll"]; });

/* harmony reexport (safe) */ __webpack_require__.d(__webpack_exports__, "memoize", function() { return _index_js__WEBPACK_IMPORTED_MODULE_1__["memoize"]; });

/* harmony reexport (safe) */ __webpack_require__.d(__webpack_exports__, "delay", function() { return _index_js__WEBPACK_IMPORTED_MODULE_1__["delay"]; });

/* harmony reexport (safe) */ __webpack_require__.d(__webpack_exports__, "defer", function() { return _index_js__WEBPACK_IMPORTED_MODULE_1__["defer"]; });

/* harmony reexport (safe) */ __webpack_require__.d(__webpack_exports__, "throttle", function() { return _index_js__WEBPACK_IMPORTED_MODULE_1__["throttle"]; });

/* harmony reexport (safe) */ __webpack_require__.d(__webpack_exports__, "debounce", function() { return _index_js__WEBPACK_IMPORTED_MODULE_1__["debounce"]; });

/* harmony reexport (safe) */ __webpack_require__.d(__webpack_exports__, "wrap", function() { return _index_js__WEBPACK_IMPORTED_MODULE_1__["wrap"]; });

/* harmony reexport (safe) */ __webpack_require__.d(__webpack_exports__, "negate", function() { return _index_js__WEBPACK_IMPORTED_MODULE_1__["negate"]; });

/* harmony reexport (safe) */ __webpack_require__.d(__webpack_exports__, "compose", function() { return _index_js__WEBPACK_IMPORTED_MODULE_1__["compose"]; });

/* harmony reexport (safe) */ __webpack_require__.d(__webpack_exports__, "after", function() { return _index_js__WEBPACK_IMPORTED_MODULE_1__["after"]; });

/* harmony reexport (safe) */ __webpack_require__.d(__webpack_exports__, "before", function() { return _index_js__WEBPACK_IMPORTED_MODULE_1__["before"]; });

/* harmony reexport (safe) */ __webpack_require__.d(__webpack_exports__, "once", function() { return _index_js__WEBPACK_IMPORTED_MODULE_1__["once"]; });

/* harmony reexport (safe) */ __webpack_require__.d(__webpack_exports__, "keys", function() { return _index_js__WEBPACK_IMPORTED_MODULE_1__["keys"]; });

/* harmony reexport (safe) */ __webpack_require__.d(__webpack_exports__, "allKeys", function() { return _index_js__WEBPACK_IMPORTED_MODULE_1__["allKeys"]; });

/* harmony reexport (safe) */ __webpack_require__.d(__webpack_exports__, "values", function() { return _index_js__WEBPACK_IMPORTED_MODULE_1__["values"]; });

/* harmony reexport (safe) */ __webpack_require__.d(__webpack_exports__, "mapObject", function() { return _index_js__WEBPACK_IMPORTED_MODULE_1__["mapObject"]; });

/* harmony reexport (safe) */ __webpack_require__.d(__webpack_exports__, "pairs", function() { return _index_js__WEBPACK_IMPORTED_MODULE_1__["pairs"]; });

/* harmony reexport (safe) */ __webpack_require__.d(__webpack_exports__, "invert", function() { return _index_js__WEBPACK_IMPORTED_MODULE_1__["invert"]; });

/* harmony reexport (safe) */ __webpack_require__.d(__webpack_exports__, "functions", function() { return _index_js__WEBPACK_IMPORTED_MODULE_1__["functions"]; });

/* harmony reexport (safe) */ __webpack_require__.d(__webpack_exports__, "methods", function() { return _index_js__WEBPACK_IMPORTED_MODULE_1__["methods"]; });

/* harmony reexport (safe) */ __webpack_require__.d(__webpack_exports__, "extend", function() { return _index_js__WEBPACK_IMPORTED_MODULE_1__["extend"]; });

/* harmony reexport (safe) */ __webpack_require__.d(__webpack_exports__, "extendOwn", function() { return _index_js__WEBPACK_IMPORTED_MODULE_1__["extendOwn"]; });

/* harmony reexport (safe) */ __webpack_require__.d(__webpack_exports__, "assign", function() { return _index_js__WEBPACK_IMPORTED_MODULE_1__["assign"]; });

/* harmony reexport (safe) */ __webpack_require__.d(__webpack_exports__, "findKey", function() { return _index_js__WEBPACK_IMPORTED_MODULE_1__["findKey"]; });

/* harmony reexport (safe) */ __webpack_require__.d(__webpack_exports__, "pick", function() { return _index_js__WEBPACK_IMPORTED_MODULE_1__["pick"]; });

/* harmony reexport (safe) */ __webpack_require__.d(__webpack_exports__, "omit", function() { return _index_js__WEBPACK_IMPORTED_MODULE_1__["omit"]; });

/* harmony reexport (safe) */ __webpack_require__.d(__webpack_exports__, "defaults", function() { return _index_js__WEBPACK_IMPORTED_MODULE_1__["defaults"]; });

/* harmony reexport (safe) */ __webpack_require__.d(__webpack_exports__, "create", function() { return _index_js__WEBPACK_IMPORTED_MODULE_1__["create"]; });

/* harmony reexport (safe) */ __webpack_require__.d(__webpack_exports__, "clone", function() { return _index_js__WEBPACK_IMPORTED_MODULE_1__["clone"]; });

/* harmony reexport (safe) */ __webpack_require__.d(__webpack_exports__, "tap", function() { return _index_js__WEBPACK_IMPORTED_MODULE_1__["tap"]; });

/* harmony reexport (safe) */ __webpack_require__.d(__webpack_exports__, "isMatch", function() { return _index_js__WEBPACK_IMPORTED_MODULE_1__["isMatch"]; });

/* harmony reexport (safe) */ __webpack_require__.d(__webpack_exports__, "isEqual", function() { return _index_js__WEBPACK_IMPORTED_MODULE_1__["isEqual"]; });

/* harmony reexport (safe) */ __webpack_require__.d(__webpack_exports__, "isEmpty", function() { return _index_js__WEBPACK_IMPORTED_MODULE_1__["isEmpty"]; });

/* harmony reexport (safe) */ __webpack_require__.d(__webpack_exports__, "isElement", function() { return _index_js__WEBPACK_IMPORTED_MODULE_1__["isElement"]; });

/* harmony reexport (safe) */ __webpack_require__.d(__webpack_exports__, "isArray", function() { return _index_js__WEBPACK_IMPORTED_MODULE_1__["isArray"]; });

/* harmony reexport (safe) */ __webpack_require__.d(__webpack_exports__, "isObject", function() { return _index_js__WEBPACK_IMPORTED_MODULE_1__["isObject"]; });

/* harmony reexport (safe) */ __webpack_require__.d(__webpack_exports__, "isArguments", function() { return _index_js__WEBPACK_IMPORTED_MODULE_1__["isArguments"]; });

/* harmony reexport (safe) */ __webpack_require__.d(__webpack_exports__, "isFunction", function() { return _index_js__WEBPACK_IMPORTED_MODULE_1__["isFunction"]; });

/* harmony reexport (safe) */ __webpack_require__.d(__webpack_exports__, "isString", function() { return _index_js__WEBPACK_IMPORTED_MODULE_1__["isString"]; });

/* harmony reexport (safe) */ __webpack_require__.d(__webpack_exports__, "isNumber", function() { return _index_js__WEBPACK_IMPORTED_MODULE_1__["isNumber"]; });

/* harmony reexport (safe) */ __webpack_require__.d(__webpack_exports__, "isDate", function() { return _index_js__WEBPACK_IMPORTED_MODULE_1__["isDate"]; });

/* harmony reexport (safe) */ __webpack_require__.d(__webpack_exports__, "isRegExp", function() { return _index_js__WEBPACK_IMPORTED_MODULE_1__["isRegExp"]; });

/* harmony reexport (safe) */ __webpack_require__.d(__webpack_exports__, "isError", function() { return _index_js__WEBPACK_IMPORTED_MODULE_1__["isError"]; });

/* harmony reexport (safe) */ __webpack_require__.d(__webpack_exports__, "isSymbol", function() { return _index_js__WEBPACK_IMPORTED_MODULE_1__["isSymbol"]; });

/* harmony reexport (safe) */ __webpack_require__.d(__webpack_exports__, "isMap", function() { return _index_js__WEBPACK_IMPORTED_MODULE_1__["isMap"]; });

/* harmony reexport (safe) */ __webpack_require__.d(__webpack_exports__, "isWeakMap", function() { return _index_js__WEBPACK_IMPORTED_MODULE_1__["isWeakMap"]; });

/* harmony reexport (safe) */ __webpack_require__.d(__webpack_exports__, "isSet", function() { return _index_js__WEBPACK_IMPORTED_MODULE_1__["isSet"]; });

/* harmony reexport (safe) */ __webpack_require__.d(__webpack_exports__, "isWeakSet", function() { return _index_js__WEBPACK_IMPORTED_MODULE_1__["isWeakSet"]; });

/* harmony reexport (safe) */ __webpack_require__.d(__webpack_exports__, "isFinite", function() { return _index_js__WEBPACK_IMPORTED_MODULE_1__["isFinite"]; });

/* harmony reexport (safe) */ __webpack_require__.d(__webpack_exports__, "isNaN", function() { return _index_js__WEBPACK_IMPORTED_MODULE_1__["isNaN"]; });

/* harmony reexport (safe) */ __webpack_require__.d(__webpack_exports__, "isBoolean", function() { return _index_js__WEBPACK_IMPORTED_MODULE_1__["isBoolean"]; });

/* harmony reexport (safe) */ __webpack_require__.d(__webpack_exports__, "isNull", function() { return _index_js__WEBPACK_IMPORTED_MODULE_1__["isNull"]; });

/* harmony reexport (safe) */ __webpack_require__.d(__webpack_exports__, "isUndefined", function() { return _index_js__WEBPACK_IMPORTED_MODULE_1__["isUndefined"]; });

/* harmony reexport (safe) */ __webpack_require__.d(__webpack_exports__, "has", function() { return _index_js__WEBPACK_IMPORTED_MODULE_1__["has"]; });

/* harmony reexport (safe) */ __webpack_require__.d(__webpack_exports__, "identity", function() { return _index_js__WEBPACK_IMPORTED_MODULE_1__["identity"]; });

/* harmony reexport (safe) */ __webpack_require__.d(__webpack_exports__, "constant", function() { return _index_js__WEBPACK_IMPORTED_MODULE_1__["constant"]; });

/* harmony reexport (safe) */ __webpack_require__.d(__webpack_exports__, "noop", function() { return _index_js__WEBPACK_IMPORTED_MODULE_1__["noop"]; });

/* harmony reexport (safe) */ __webpack_require__.d(__webpack_exports__, "property", function() { return _index_js__WEBPACK_IMPORTED_MODULE_1__["property"]; });

/* harmony reexport (safe) */ __webpack_require__.d(__webpack_exports__, "propertyOf", function() { return _index_js__WEBPACK_IMPORTED_MODULE_1__["propertyOf"]; });

/* harmony reexport (safe) */ __webpack_require__.d(__webpack_exports__, "matcher", function() { return _index_js__WEBPACK_IMPORTED_MODULE_1__["matcher"]; });

/* harmony reexport (safe) */ __webpack_require__.d(__webpack_exports__, "matches", function() { return _index_js__WEBPACK_IMPORTED_MODULE_1__["matches"]; });

/* harmony reexport (safe) */ __webpack_require__.d(__webpack_exports__, "times", function() { return _index_js__WEBPACK_IMPORTED_MODULE_1__["times"]; });

/* harmony reexport (safe) */ __webpack_require__.d(__webpack_exports__, "random", function() { return _index_js__WEBPACK_IMPORTED_MODULE_1__["random"]; });

/* harmony reexport (safe) */ __webpack_require__.d(__webpack_exports__, "now", function() { return _index_js__WEBPACK_IMPORTED_MODULE_1__["now"]; });

/* harmony reexport (safe) */ __webpack_require__.d(__webpack_exports__, "escape", function() { return _index_js__WEBPACK_IMPORTED_MODULE_1__["escape"]; });

/* harmony reexport (safe) */ __webpack_require__.d(__webpack_exports__, "unescape", function() { return _index_js__WEBPACK_IMPORTED_MODULE_1__["unescape"]; });

/* harmony reexport (safe) */ __webpack_require__.d(__webpack_exports__, "result", function() { return _index_js__WEBPACK_IMPORTED_MODULE_1__["result"]; });

/* harmony reexport (safe) */ __webpack_require__.d(__webpack_exports__, "uniqueId", function() { return _index_js__WEBPACK_IMPORTED_MODULE_1__["uniqueId"]; });

/* harmony reexport (safe) */ __webpack_require__.d(__webpack_exports__, "templateSettings", function() { return _index_js__WEBPACK_IMPORTED_MODULE_1__["templateSettings"]; });

/* harmony reexport (safe) */ __webpack_require__.d(__webpack_exports__, "template", function() { return _index_js__WEBPACK_IMPORTED_MODULE_1__["template"]; });

/* harmony reexport (safe) */ __webpack_require__.d(__webpack_exports__, "chain", function() { return _index_js__WEBPACK_IMPORTED_MODULE_1__["chain"]; });

/* harmony reexport (safe) */ __webpack_require__.d(__webpack_exports__, "mixin", function() { return _index_js__WEBPACK_IMPORTED_MODULE_1__["mixin"]; });





/***/ }),

/***/ "./node_modules/underscore/modules/index-default.js":
/*!**********************************************************!*\
  !*** ./node_modules/underscore/modules/index-default.js ***!
  \**********************************************************/
/*! exports provided: default */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony import */ var _index_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./index.js */ "./node_modules/underscore/modules/index.js");



// Add all of the Underscore functions to the wrapper object.
var _ = Object(_index_js__WEBPACK_IMPORTED_MODULE_0__["mixin"])(_index_js__WEBPACK_IMPORTED_MODULE_0__);
// Legacy Node.js API
_._ = _;
// Export the Underscore API.
/* harmony default export */ __webpack_exports__["default"] = (_);


/***/ }),

/***/ "./node_modules/underscore/modules/index.js":
/*!**************************************************!*\
  !*** ./node_modules/underscore/modules/index.js ***!
  \**************************************************/
/*! exports provided: default, VERSION, iteratee, restArguments, each, forEach, map, collect, reduce, foldl, inject, reduceRight, foldr, find, detect, filter, select, reject, every, all, some, any, contains, includes, include, invoke, pluck, where, findWhere, max, min, shuffle, sample, sortBy, groupBy, indexBy, countBy, toArray, size, partition, first, head, take, initial, last, rest, tail, drop, compact, flatten, without, uniq, unique, union, intersection, difference, unzip, zip, object, findIndex, findLastIndex, sortedIndex, indexOf, lastIndexOf, range, chunk, bind, partial, bindAll, memoize, delay, defer, throttle, debounce, wrap, negate, compose, after, before, once, keys, allKeys, values, mapObject, pairs, invert, functions, methods, extend, extendOwn, assign, findKey, pick, omit, defaults, create, clone, tap, isMatch, isEqual, isEmpty, isElement, isArray, isObject, isArguments, isFunction, isString, isNumber, isDate, isRegExp, isError, isSymbol, isMap, isWeakMap, isSet, isWeakSet, isFinite, isNaN, isBoolean, isNull, isUndefined, has, identity, constant, noop, property, propertyOf, matcher, matches, times, random, now, escape, unescape, result, uniqueId, templateSettings, template, chain, mixin */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* WEBPACK VAR INJECTION */(function(global) {/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "default", function() { return _; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "VERSION", function() { return VERSION; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "iteratee", function() { return iteratee; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "restArguments", function() { return restArguments; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "each", function() { return each; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "forEach", function() { return each; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "map", function() { return map; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "collect", function() { return map; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "reduce", function() { return reduce; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "foldl", function() { return reduce; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "inject", function() { return reduce; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "reduceRight", function() { return reduceRight; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "foldr", function() { return reduceRight; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "find", function() { return find; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "detect", function() { return find; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "filter", function() { return filter; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "select", function() { return filter; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "reject", function() { return reject; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "every", function() { return every; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "all", function() { return every; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "some", function() { return some; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "any", function() { return some; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "contains", function() { return contains; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "includes", function() { return contains; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "include", function() { return contains; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "invoke", function() { return invoke; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "pluck", function() { return pluck; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "where", function() { return where; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "findWhere", function() { return findWhere; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "max", function() { return max; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "min", function() { return min; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "shuffle", function() { return shuffle; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "sample", function() { return sample; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "sortBy", function() { return sortBy; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "groupBy", function() { return groupBy; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "indexBy", function() { return indexBy; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "countBy", function() { return countBy; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "toArray", function() { return toArray; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "size", function() { return size; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "partition", function() { return partition; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "first", function() { return first; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "head", function() { return first; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "take", function() { return first; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "initial", function() { return initial; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "last", function() { return last; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "rest", function() { return rest; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "tail", function() { return rest; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "drop", function() { return rest; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "compact", function() { return compact; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "flatten", function() { return flatten; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "without", function() { return without; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "uniq", function() { return uniq; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "unique", function() { return uniq; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "union", function() { return union; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "intersection", function() { return intersection; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "difference", function() { return difference; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "unzip", function() { return unzip; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "zip", function() { return zip; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "object", function() { return object; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "findIndex", function() { return findIndex; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "findLastIndex", function() { return findLastIndex; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "sortedIndex", function() { return sortedIndex; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "indexOf", function() { return indexOf; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "lastIndexOf", function() { return lastIndexOf; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "range", function() { return range; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "chunk", function() { return chunk; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "bind", function() { return bind; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "partial", function() { return partial; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "bindAll", function() { return bindAll; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "memoize", function() { return memoize; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "delay", function() { return delay; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "defer", function() { return defer; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "throttle", function() { return throttle; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "debounce", function() { return debounce; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "wrap", function() { return wrap; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "negate", function() { return negate; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "compose", function() { return compose; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "after", function() { return after; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "before", function() { return before; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "once", function() { return once; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "keys", function() { return keys; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "allKeys", function() { return allKeys; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "values", function() { return values; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "mapObject", function() { return mapObject; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "pairs", function() { return pairs; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "invert", function() { return invert; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "functions", function() { return functions; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "methods", function() { return functions; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "extend", function() { return extend; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "extendOwn", function() { return extendOwn; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "assign", function() { return extendOwn; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "findKey", function() { return findKey; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "pick", function() { return pick; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "omit", function() { return omit; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "defaults", function() { return defaults; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "create", function() { return create; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "clone", function() { return clone; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "tap", function() { return tap; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "isMatch", function() { return isMatch; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "isEqual", function() { return isEqual; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "isEmpty", function() { return isEmpty; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "isElement", function() { return isElement; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "isArray", function() { return isArray; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "isObject", function() { return isObject; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "isArguments", function() { return isArguments; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "isFunction", function() { return isFunction; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "isString", function() { return isString; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "isNumber", function() { return isNumber; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "isDate", function() { return isDate; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "isRegExp", function() { return isRegExp; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "isError", function() { return isError; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "isSymbol", function() { return isSymbol; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "isMap", function() { return isMap; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "isWeakMap", function() { return isWeakMap; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "isSet", function() { return isSet; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "isWeakSet", function() { return isWeakSet; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "isFinite", function() { return isFinite; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "isNaN", function() { return isNaN; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "isBoolean", function() { return isBoolean; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "isNull", function() { return isNull; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "isUndefined", function() { return isUndefined; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "has", function() { return has; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "identity", function() { return identity; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "constant", function() { return constant; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "noop", function() { return noop; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "property", function() { return property; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "propertyOf", function() { return propertyOf; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "matcher", function() { return matcher; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "matches", function() { return matcher; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "times", function() { return times; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "random", function() { return random; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "now", function() { return now; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "escape", function() { return escape; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "unescape", function() { return unescape; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "result", function() { return result; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "uniqueId", function() { return uniqueId; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "templateSettings", function() { return templateSettings; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "template", function() { return template; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "chain", function() { return chain; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "mixin", function() { return mixin; });
//     Underscore.js 1.10.2
//     https://underscorejs.org
//     (c) 2009-2020 Jeremy Ashkenas, DocumentCloud and Investigative Reporters & Editors
//     Underscore may be freely distributed under the MIT license.

// Baseline setup
// --------------

// Establish the root object, `window` (`self`) in the browser, `global`
// on the server, or `this` in some virtual machines. We use `self`
// instead of `window` for `WebWorker` support.
var root = typeof self == 'object' && self.self === self && self ||
          typeof global == 'object' && global.global === global && global ||
          Function('return this')() ||
          {};

// Save bytes in the minified (but not gzipped) version:
var ArrayProto = Array.prototype, ObjProto = Object.prototype;
var SymbolProto = typeof Symbol !== 'undefined' ? Symbol.prototype : null;

// Create quick reference variables for speed access to core prototypes.
var push = ArrayProto.push,
    slice = ArrayProto.slice,
    toString = ObjProto.toString,
    hasOwnProperty = ObjProto.hasOwnProperty;

// All **ECMAScript 5** native function implementations that we hope to use
// are declared here.
var nativeIsArray = Array.isArray,
    nativeKeys = Object.keys,
    nativeCreate = Object.create;

// Create references to these builtin functions because we override them.
var _isNaN = root.isNaN,
    _isFinite = root.isFinite;

// Naked function reference for surrogate-prototype-swapping.
var Ctor = function(){};

// The Underscore object. All exported functions below are added to it in the
// modules/index-all.js using the mixin function.
function _(obj) {
  if (obj instanceof _) return obj;
  if (!(this instanceof _)) return new _(obj);
  this._wrapped = obj;
}

// Current version.
var VERSION = _.VERSION = '1.10.2';

// Internal function that returns an efficient (for current engines) version
// of the passed-in callback, to be repeatedly applied in other Underscore
// functions.
function optimizeCb(func, context, argCount) {
  if (context === void 0) return func;
  switch (argCount == null ? 3 : argCount) {
    case 1: return function(value) {
      return func.call(context, value);
    };
    // The 2-argument case is omitted because we’re not using it.
    case 3: return function(value, index, collection) {
      return func.call(context, value, index, collection);
    };
    case 4: return function(accumulator, value, index, collection) {
      return func.call(context, accumulator, value, index, collection);
    };
  }
  return function() {
    return func.apply(context, arguments);
  };
}

// An internal function to generate callbacks that can be applied to each
// element in a collection, returning the desired result — either `identity`,
// an arbitrary callback, a property matcher, or a property accessor.
function baseIteratee(value, context, argCount) {
  if (value == null) return identity;
  if (isFunction(value)) return optimizeCb(value, context, argCount);
  if (isObject(value) && !isArray(value)) return matcher(value);
  return property(value);
}

// External wrapper for our callback generator. Users may customize
// `_.iteratee` if they want additional predicate/iteratee shorthand styles.
// This abstraction hides the internal-only argCount argument.
_.iteratee = iteratee;
function iteratee(value, context) {
  return baseIteratee(value, context, Infinity);
}

// The function we actually call internally. It invokes _.iteratee if
// overridden, otherwise baseIteratee.
function cb(value, context, argCount) {
  if (_.iteratee !== iteratee) return _.iteratee(value, context);
  return baseIteratee(value, context, argCount);
}

// Some functions take a variable number of arguments, or a few expected
// arguments at the beginning and then a variable number of values to operate
// on. This helper accumulates all remaining arguments past the function’s
// argument length (or an explicit `startIndex`), into an array that becomes
// the last argument. Similar to ES6’s "rest parameter".
function restArguments(func, startIndex) {
  startIndex = startIndex == null ? func.length - 1 : +startIndex;
  return function() {
    var length = Math.max(arguments.length - startIndex, 0),
        rest = Array(length),
        index = 0;
    for (; index < length; index++) {
      rest[index] = arguments[index + startIndex];
    }
    switch (startIndex) {
      case 0: return func.call(this, rest);
      case 1: return func.call(this, arguments[0], rest);
      case 2: return func.call(this, arguments[0], arguments[1], rest);
    }
    var args = Array(startIndex + 1);
    for (index = 0; index < startIndex; index++) {
      args[index] = arguments[index];
    }
    args[startIndex] = rest;
    return func.apply(this, args);
  };
}

// An internal function for creating a new object that inherits from another.
function baseCreate(prototype) {
  if (!isObject(prototype)) return {};
  if (nativeCreate) return nativeCreate(prototype);
  Ctor.prototype = prototype;
  var result = new Ctor;
  Ctor.prototype = null;
  return result;
}

function shallowProperty(key) {
  return function(obj) {
    return obj == null ? void 0 : obj[key];
  };
}

function _has(obj, path) {
  return obj != null && hasOwnProperty.call(obj, path);
}

function deepGet(obj, path) {
  var length = path.length;
  for (var i = 0; i < length; i++) {
    if (obj == null) return void 0;
    obj = obj[path[i]];
  }
  return length ? obj : void 0;
}

// Helper for collection methods to determine whether a collection
// should be iterated as an array or as an object.
// Related: https://people.mozilla.org/~jorendorff/es6-draft.html#sec-tolength
// Avoids a very nasty iOS 8 JIT bug on ARM-64. #2094
var MAX_ARRAY_INDEX = Math.pow(2, 53) - 1;
var getLength = shallowProperty('length');
function isArrayLike(collection) {
  var length = getLength(collection);
  return typeof length == 'number' && length >= 0 && length <= MAX_ARRAY_INDEX;
}

// Collection Functions
// --------------------

// The cornerstone, an `each` implementation, aka `forEach`.
// Handles raw objects in addition to array-likes. Treats all
// sparse array-likes as if they were dense.
function each(obj, iteratee, context) {
  iteratee = optimizeCb(iteratee, context);
  var i, length;
  if (isArrayLike(obj)) {
    for (i = 0, length = obj.length; i < length; i++) {
      iteratee(obj[i], i, obj);
    }
  } else {
    var _keys = keys(obj);
    for (i = 0, length = _keys.length; i < length; i++) {
      iteratee(obj[_keys[i]], _keys[i], obj);
    }
  }
  return obj;
}


// Return the results of applying the iteratee to each element.
function map(obj, iteratee, context) {
  iteratee = cb(iteratee, context);
  var _keys = !isArrayLike(obj) && keys(obj),
      length = (_keys || obj).length,
      results = Array(length);
  for (var index = 0; index < length; index++) {
    var currentKey = _keys ? _keys[index] : index;
    results[index] = iteratee(obj[currentKey], currentKey, obj);
  }
  return results;
}


// Create a reducing function iterating left or right.
function createReduce(dir) {
  // Wrap code that reassigns argument variables in a separate function than
  // the one that accesses `arguments.length` to avoid a perf hit. (#1991)
  var reducer = function(obj, iteratee, memo, initial) {
    var _keys = !isArrayLike(obj) && keys(obj),
        length = (_keys || obj).length,
        index = dir > 0 ? 0 : length - 1;
    if (!initial) {
      memo = obj[_keys ? _keys[index] : index];
      index += dir;
    }
    for (; index >= 0 && index < length; index += dir) {
      var currentKey = _keys ? _keys[index] : index;
      memo = iteratee(memo, obj[currentKey], currentKey, obj);
    }
    return memo;
  };

  return function(obj, iteratee, memo, context) {
    var initial = arguments.length >= 3;
    return reducer(obj, optimizeCb(iteratee, context, 4), memo, initial);
  };
}

// **Reduce** builds up a single result from a list of values, aka `inject`,
// or `foldl`.
var reduce = createReduce(1);


// The right-associative version of reduce, also known as `foldr`.
var reduceRight = createReduce(-1);


// Return the first value which passes a truth test.
function find(obj, predicate, context) {
  var keyFinder = isArrayLike(obj) ? findIndex : findKey;
  var key = keyFinder(obj, predicate, context);
  if (key !== void 0 && key !== -1) return obj[key];
}


// Return all the elements that pass a truth test.
function filter(obj, predicate, context) {
  var results = [];
  predicate = cb(predicate, context);
  each(obj, function(value, index, list) {
    if (predicate(value, index, list)) results.push(value);
  });
  return results;
}


// Return all the elements for which a truth test fails.
function reject(obj, predicate, context) {
  return filter(obj, negate(cb(predicate)), context);
}

// Determine whether all of the elements match a truth test.
function every(obj, predicate, context) {
  predicate = cb(predicate, context);
  var _keys = !isArrayLike(obj) && keys(obj),
      length = (_keys || obj).length;
  for (var index = 0; index < length; index++) {
    var currentKey = _keys ? _keys[index] : index;
    if (!predicate(obj[currentKey], currentKey, obj)) return false;
  }
  return true;
}


// Determine if at least one element in the object matches a truth test.
function some(obj, predicate, context) {
  predicate = cb(predicate, context);
  var _keys = !isArrayLike(obj) && keys(obj),
      length = (_keys || obj).length;
  for (var index = 0; index < length; index++) {
    var currentKey = _keys ? _keys[index] : index;
    if (predicate(obj[currentKey], currentKey, obj)) return true;
  }
  return false;
}


// Determine if the array or object contains a given item (using `===`).
function contains(obj, item, fromIndex, guard) {
  if (!isArrayLike(obj)) obj = values(obj);
  if (typeof fromIndex != 'number' || guard) fromIndex = 0;
  return indexOf(obj, item, fromIndex) >= 0;
}


// Invoke a method (with arguments) on every item in a collection.
var invoke = restArguments(function(obj, path, args) {
  var contextPath, func;
  if (isFunction(path)) {
    func = path;
  } else if (isArray(path)) {
    contextPath = path.slice(0, -1);
    path = path[path.length - 1];
  }
  return map(obj, function(context) {
    var method = func;
    if (!method) {
      if (contextPath && contextPath.length) {
        context = deepGet(context, contextPath);
      }
      if (context == null) return void 0;
      method = context[path];
    }
    return method == null ? method : method.apply(context, args);
  });
});

// Convenience version of a common use case of `map`: fetching a property.
function pluck(obj, key) {
  return map(obj, property(key));
}

// Convenience version of a common use case of `filter`: selecting only objects
// containing specific `key:value` pairs.
function where(obj, attrs) {
  return filter(obj, matcher(attrs));
}

// Convenience version of a common use case of `find`: getting the first object
// containing specific `key:value` pairs.
function findWhere(obj, attrs) {
  return find(obj, matcher(attrs));
}

// Return the maximum element (or element-based computation).
function max(obj, iteratee, context) {
  var result = -Infinity, lastComputed = -Infinity,
      value, computed;
  if (iteratee == null || typeof iteratee == 'number' && typeof obj[0] != 'object' && obj != null) {
    obj = isArrayLike(obj) ? obj : values(obj);
    for (var i = 0, length = obj.length; i < length; i++) {
      value = obj[i];
      if (value != null && value > result) {
        result = value;
      }
    }
  } else {
    iteratee = cb(iteratee, context);
    each(obj, function(v, index, list) {
      computed = iteratee(v, index, list);
      if (computed > lastComputed || computed === -Infinity && result === -Infinity) {
        result = v;
        lastComputed = computed;
      }
    });
  }
  return result;
}

// Return the minimum element (or element-based computation).
function min(obj, iteratee, context) {
  var result = Infinity, lastComputed = Infinity,
      value, computed;
  if (iteratee == null || typeof iteratee == 'number' && typeof obj[0] != 'object' && obj != null) {
    obj = isArrayLike(obj) ? obj : values(obj);
    for (var i = 0, length = obj.length; i < length; i++) {
      value = obj[i];
      if (value != null && value < result) {
        result = value;
      }
    }
  } else {
    iteratee = cb(iteratee, context);
    each(obj, function(v, index, list) {
      computed = iteratee(v, index, list);
      if (computed < lastComputed || computed === Infinity && result === Infinity) {
        result = v;
        lastComputed = computed;
      }
    });
  }
  return result;
}

// Shuffle a collection.
function shuffle(obj) {
  return sample(obj, Infinity);
}

// Sample **n** random values from a collection using the modern version of the
// [Fisher-Yates shuffle](https://en.wikipedia.org/wiki/Fisher–Yates_shuffle).
// If **n** is not specified, returns a single random element.
// The internal `guard` argument allows it to work with `map`.
function sample(obj, n, guard) {
  if (n == null || guard) {
    if (!isArrayLike(obj)) obj = values(obj);
    return obj[random(obj.length - 1)];
  }
  var sample = isArrayLike(obj) ? clone(obj) : values(obj);
  var length = getLength(sample);
  n = Math.max(Math.min(n, length), 0);
  var last = length - 1;
  for (var index = 0; index < n; index++) {
    var rand = random(index, last);
    var temp = sample[index];
    sample[index] = sample[rand];
    sample[rand] = temp;
  }
  return sample.slice(0, n);
}

// Sort the object's values by a criterion produced by an iteratee.
function sortBy(obj, iteratee, context) {
  var index = 0;
  iteratee = cb(iteratee, context);
  return pluck(map(obj, function(value, key, list) {
    return {
      value: value,
      index: index++,
      criteria: iteratee(value, key, list)
    };
  }).sort(function(left, right) {
    var a = left.criteria;
    var b = right.criteria;
    if (a !== b) {
      if (a > b || a === void 0) return 1;
      if (a < b || b === void 0) return -1;
    }
    return left.index - right.index;
  }), 'value');
}

// An internal function used for aggregate "group by" operations.
function group(behavior, partition) {
  return function(obj, iteratee, context) {
    var result = partition ? [[], []] : {};
    iteratee = cb(iteratee, context);
    each(obj, function(value, index) {
      var key = iteratee(value, index, obj);
      behavior(result, value, key);
    });
    return result;
  };
}

// Groups the object's values by a criterion. Pass either a string attribute
// to group by, or a function that returns the criterion.
var groupBy = group(function(result, value, key) {
  if (_has(result, key)) result[key].push(value); else result[key] = [value];
});

// Indexes the object's values by a criterion, similar to `groupBy`, but for
// when you know that your index values will be unique.
var indexBy = group(function(result, value, key) {
  result[key] = value;
});

// Counts instances of an object that group by a certain criterion. Pass
// either a string attribute to count by, or a function that returns the
// criterion.
var countBy = group(function(result, value, key) {
  if (_has(result, key)) result[key]++; else result[key] = 1;
});

var reStrSymbol = /[^\ud800-\udfff]|[\ud800-\udbff][\udc00-\udfff]|[\ud800-\udfff]/g;
// Safely create a real, live array from anything iterable.
function toArray(obj) {
  if (!obj) return [];
  if (isArray(obj)) return slice.call(obj);
  if (isString(obj)) {
    // Keep surrogate pair characters together
    return obj.match(reStrSymbol);
  }
  if (isArrayLike(obj)) return map(obj, identity);
  return values(obj);
}

// Return the number of elements in an object.
function size(obj) {
  if (obj == null) return 0;
  return isArrayLike(obj) ? obj.length : keys(obj).length;
}

// Split a collection into two arrays: one whose elements all satisfy the given
// predicate, and one whose elements all do not satisfy the predicate.
var partition = group(function(result, value, pass) {
  result[pass ? 0 : 1].push(value);
}, true);

// Array Functions
// ---------------

// Get the first element of an array. Passing **n** will return the first N
// values in the array. The **guard** check allows it to work with `map`.
function first(array, n, guard) {
  if (array == null || array.length < 1) return n == null ? void 0 : [];
  if (n == null || guard) return array[0];
  return initial(array, array.length - n);
}


// Returns everything but the last entry of the array. Especially useful on
// the arguments object. Passing **n** will return all the values in
// the array, excluding the last N.
function initial(array, n, guard) {
  return slice.call(array, 0, Math.max(0, array.length - (n == null || guard ? 1 : n)));
}

// Get the last element of an array. Passing **n** will return the last N
// values in the array.
function last(array, n, guard) {
  if (array == null || array.length < 1) return n == null ? void 0 : [];
  if (n == null || guard) return array[array.length - 1];
  return rest(array, Math.max(0, array.length - n));
}

// Returns everything but the first entry of the array. Especially useful on
// the arguments object. Passing an **n** will return the rest N values in the
// array.
function rest(array, n, guard) {
  return slice.call(array, n == null || guard ? 1 : n);
}


// Trim out all falsy values from an array.
function compact(array) {
  return filter(array, Boolean);
}

// Internal implementation of a recursive `flatten` function.
function _flatten(input, shallow, strict, output) {
  output = output || [];
  var idx = output.length;
  for (var i = 0, length = getLength(input); i < length; i++) {
    var value = input[i];
    if (isArrayLike(value) && (isArray(value) || isArguments(value))) {
      // Flatten current level of array or arguments object.
      if (shallow) {
        var j = 0, len = value.length;
        while (j < len) output[idx++] = value[j++];
      } else {
        _flatten(value, shallow, strict, output);
        idx = output.length;
      }
    } else if (!strict) {
      output[idx++] = value;
    }
  }
  return output;
}

// Flatten out an array, either recursively (by default), or just one level.
function flatten(array, shallow) {
  return _flatten(array, shallow, false);
}

// Return a version of the array that does not contain the specified value(s).
var without = restArguments(function(array, otherArrays) {
  return difference(array, otherArrays);
});

// Produce a duplicate-free version of the array. If the array has already
// been sorted, you have the option of using a faster algorithm.
// The faster algorithm will not work with an iteratee if the iteratee
// is not a one-to-one function, so providing an iteratee will disable
// the faster algorithm.
function uniq(array, isSorted, iteratee, context) {
  if (!isBoolean(isSorted)) {
    context = iteratee;
    iteratee = isSorted;
    isSorted = false;
  }
  if (iteratee != null) iteratee = cb(iteratee, context);
  var result = [];
  var seen = [];
  for (var i = 0, length = getLength(array); i < length; i++) {
    var value = array[i],
        computed = iteratee ? iteratee(value, i, array) : value;
    if (isSorted && !iteratee) {
      if (!i || seen !== computed) result.push(value);
      seen = computed;
    } else if (iteratee) {
      if (!contains(seen, computed)) {
        seen.push(computed);
        result.push(value);
      }
    } else if (!contains(result, value)) {
      result.push(value);
    }
  }
  return result;
}


// Produce an array that contains the union: each distinct element from all of
// the passed-in arrays.
var union = restArguments(function(arrays) {
  return uniq(_flatten(arrays, true, true));
});

// Produce an array that contains every item shared between all the
// passed-in arrays.
function intersection(array) {
  var result = [];
  var argsLength = arguments.length;
  for (var i = 0, length = getLength(array); i < length; i++) {
    var item = array[i];
    if (contains(result, item)) continue;
    var j;
    for (j = 1; j < argsLength; j++) {
      if (!contains(arguments[j], item)) break;
    }
    if (j === argsLength) result.push(item);
  }
  return result;
}

// Take the difference between one array and a number of other arrays.
// Only the elements present in just the first array will remain.
var difference = restArguments(function(array, rest) {
  rest = _flatten(rest, true, true);
  return filter(array, function(value){
    return !contains(rest, value);
  });
});

// Complement of zip. Unzip accepts an array of arrays and groups
// each array's elements on shared indices.
function unzip(array) {
  var length = array && max(array, getLength).length || 0;
  var result = Array(length);

  for (var index = 0; index < length; index++) {
    result[index] = pluck(array, index);
  }
  return result;
}

// Zip together multiple lists into a single array -- elements that share
// an index go together.
var zip = restArguments(unzip);

// Converts lists into objects. Pass either a single array of `[key, value]`
// pairs, or two parallel arrays of the same length -- one of keys, and one of
// the corresponding values. Passing by pairs is the reverse of pairs.
function object(list, values) {
  var result = {};
  for (var i = 0, length = getLength(list); i < length; i++) {
    if (values) {
      result[list[i]] = values[i];
    } else {
      result[list[i][0]] = list[i][1];
    }
  }
  return result;
}

// Generator function to create the findIndex and findLastIndex functions.
function createPredicateIndexFinder(dir) {
  return function(array, predicate, context) {
    predicate = cb(predicate, context);
    var length = getLength(array);
    var index = dir > 0 ? 0 : length - 1;
    for (; index >= 0 && index < length; index += dir) {
      if (predicate(array[index], index, array)) return index;
    }
    return -1;
  };
}

// Returns the first index on an array-like that passes a predicate test.
var findIndex = createPredicateIndexFinder(1);
var findLastIndex = createPredicateIndexFinder(-1);

// Use a comparator function to figure out the smallest index at which
// an object should be inserted so as to maintain order. Uses binary search.
function sortedIndex(array, obj, iteratee, context) {
  iteratee = cb(iteratee, context, 1);
  var value = iteratee(obj);
  var low = 0, high = getLength(array);
  while (low < high) {
    var mid = Math.floor((low + high) / 2);
    if (iteratee(array[mid]) < value) low = mid + 1; else high = mid;
  }
  return low;
}

// Generator function to create the indexOf and lastIndexOf functions.
function createIndexFinder(dir, predicateFind, sortedIndex) {
  return function(array, item, idx) {
    var i = 0, length = getLength(array);
    if (typeof idx == 'number') {
      if (dir > 0) {
        i = idx >= 0 ? idx : Math.max(idx + length, i);
      } else {
        length = idx >= 0 ? Math.min(idx + 1, length) : idx + length + 1;
      }
    } else if (sortedIndex && idx && length) {
      idx = sortedIndex(array, item);
      return array[idx] === item ? idx : -1;
    }
    if (item !== item) {
      idx = predicateFind(slice.call(array, i, length), isNaN);
      return idx >= 0 ? idx + i : -1;
    }
    for (idx = dir > 0 ? i : length - 1; idx >= 0 && idx < length; idx += dir) {
      if (array[idx] === item) return idx;
    }
    return -1;
  };
}

// Return the position of the first occurrence of an item in an array,
// or -1 if the item is not included in the array.
// If the array is large and already in sort order, pass `true`
// for **isSorted** to use binary search.
var indexOf = createIndexFinder(1, findIndex, sortedIndex);
var lastIndexOf = createIndexFinder(-1, findLastIndex);

// Generate an integer Array containing an arithmetic progression. A port of
// the native Python `range()` function. See
// [the Python documentation](https://docs.python.org/library/functions.html#range).
function range(start, stop, step) {
  if (stop == null) {
    stop = start || 0;
    start = 0;
  }
  if (!step) {
    step = stop < start ? -1 : 1;
  }

  var length = Math.max(Math.ceil((stop - start) / step), 0);
  var range = Array(length);

  for (var idx = 0; idx < length; idx++, start += step) {
    range[idx] = start;
  }

  return range;
}

// Chunk a single array into multiple arrays, each containing `count` or fewer
// items.
function chunk(array, count) {
  if (count == null || count < 1) return [];
  var result = [];
  var i = 0, length = array.length;
  while (i < length) {
    result.push(slice.call(array, i, i += count));
  }
  return result;
}

// Function (ahem) Functions
// ------------------

// Determines whether to execute a function as a constructor
// or a normal function with the provided arguments.
function executeBound(sourceFunc, boundFunc, context, callingContext, args) {
  if (!(callingContext instanceof boundFunc)) return sourceFunc.apply(context, args);
  var self = baseCreate(sourceFunc.prototype);
  var result = sourceFunc.apply(self, args);
  if (isObject(result)) return result;
  return self;
}

// Create a function bound to a given object (assigning `this`, and arguments,
// optionally). Delegates to **ECMAScript 5**'s native `Function.bind` if
// available.
var bind = restArguments(function(func, context, args) {
  if (!isFunction(func)) throw new TypeError('Bind must be called on a function');
  var bound = restArguments(function(callArgs) {
    return executeBound(func, bound, context, this, args.concat(callArgs));
  });
  return bound;
});

// Partially apply a function by creating a version that has had some of its
// arguments pre-filled, without changing its dynamic `this` context. _ acts
// as a placeholder by default, allowing any combination of arguments to be
// pre-filled. Set `partial.placeholder` for a custom placeholder argument.
var partial = restArguments(function(func, boundArgs) {
  var placeholder = partial.placeholder;
  var bound = function() {
    var position = 0, length = boundArgs.length;
    var args = Array(length);
    for (var i = 0; i < length; i++) {
      args[i] = boundArgs[i] === placeholder ? arguments[position++] : boundArgs[i];
    }
    while (position < arguments.length) args.push(arguments[position++]);
    return executeBound(func, bound, this, this, args);
  };
  return bound;
});

partial.placeholder = _;

// Bind a number of an object's methods to that object. Remaining arguments
// are the method names to be bound. Useful for ensuring that all callbacks
// defined on an object belong to it.
var bindAll = restArguments(function(obj, _keys) {
  _keys = _flatten(_keys, false, false);
  var index = _keys.length;
  if (index < 1) throw new Error('bindAll must be passed function names');
  while (index--) {
    var key = _keys[index];
    obj[key] = bind(obj[key], obj);
  }
});

// Memoize an expensive function by storing its results.
function memoize(func, hasher) {
  var memoize = function(key) {
    var cache = memoize.cache;
    var address = '' + (hasher ? hasher.apply(this, arguments) : key);
    if (!_has(cache, address)) cache[address] = func.apply(this, arguments);
    return cache[address];
  };
  memoize.cache = {};
  return memoize;
}

// Delays a function for the given number of milliseconds, and then calls
// it with the arguments supplied.
var delay = restArguments(function(func, wait, args) {
  return setTimeout(function() {
    return func.apply(null, args);
  }, wait);
});

// Defers a function, scheduling it to run after the current call stack has
// cleared.
var defer = partial(delay, _, 1);

// Returns a function, that, when invoked, will only be triggered at most once
// during a given window of time. Normally, the throttled function will run
// as much as it can, without ever going more than once per `wait` duration;
// but if you'd like to disable the execution on the leading edge, pass
// `{leading: false}`. To disable execution on the trailing edge, ditto.
function throttle(func, wait, options) {
  var timeout, context, args, result;
  var previous = 0;
  if (!options) options = {};

  var later = function() {
    previous = options.leading === false ? 0 : now();
    timeout = null;
    result = func.apply(context, args);
    if (!timeout) context = args = null;
  };

  var throttled = function() {
    var _now = now();
    if (!previous && options.leading === false) previous = _now;
    var remaining = wait - (_now - previous);
    context = this;
    args = arguments;
    if (remaining <= 0 || remaining > wait) {
      if (timeout) {
        clearTimeout(timeout);
        timeout = null;
      }
      previous = _now;
      result = func.apply(context, args);
      if (!timeout) context = args = null;
    } else if (!timeout && options.trailing !== false) {
      timeout = setTimeout(later, remaining);
    }
    return result;
  };

  throttled.cancel = function() {
    clearTimeout(timeout);
    previous = 0;
    timeout = context = args = null;
  };

  return throttled;
}

// Returns a function, that, as long as it continues to be invoked, will not
// be triggered. The function will be called after it stops being called for
// N milliseconds. If `immediate` is passed, trigger the function on the
// leading edge, instead of the trailing.
function debounce(func, wait, immediate) {
  var timeout, result;

  var later = function(context, args) {
    timeout = null;
    if (args) result = func.apply(context, args);
  };

  var debounced = restArguments(function(args) {
    if (timeout) clearTimeout(timeout);
    if (immediate) {
      var callNow = !timeout;
      timeout = setTimeout(later, wait);
      if (callNow) result = func.apply(this, args);
    } else {
      timeout = delay(later, wait, this, args);
    }

    return result;
  });

  debounced.cancel = function() {
    clearTimeout(timeout);
    timeout = null;
  };

  return debounced;
}

// Returns the first function passed as an argument to the second,
// allowing you to adjust arguments, run code before and after, and
// conditionally execute the original function.
function wrap(func, wrapper) {
  return partial(wrapper, func);
}

// Returns a negated version of the passed-in predicate.
function negate(predicate) {
  return function() {
    return !predicate.apply(this, arguments);
  };
}

// Returns a function that is the composition of a list of functions, each
// consuming the return value of the function that follows.
function compose() {
  var args = arguments;
  var start = args.length - 1;
  return function() {
    var i = start;
    var result = args[start].apply(this, arguments);
    while (i--) result = args[i].call(this, result);
    return result;
  };
}

// Returns a function that will only be executed on and after the Nth call.
function after(times, func) {
  return function() {
    if (--times < 1) {
      return func.apply(this, arguments);
    }
  };
}

// Returns a function that will only be executed up to (but not including) the Nth call.
function before(times, func) {
  var memo;
  return function() {
    if (--times > 0) {
      memo = func.apply(this, arguments);
    }
    if (times <= 1) func = null;
    return memo;
  };
}

// Returns a function that will be executed at most one time, no matter how
// often you call it. Useful for lazy initialization.
var once = partial(before, 2);

// Object Functions
// ----------------

// Keys in IE < 9 that won't be iterated by `for key in ...` and thus missed.
var hasEnumBug = !{toString: null}.propertyIsEnumerable('toString');
var nonEnumerableProps = ['valueOf', 'isPrototypeOf', 'toString',
  'propertyIsEnumerable', 'hasOwnProperty', 'toLocaleString'];

function collectNonEnumProps(obj, _keys) {
  var nonEnumIdx = nonEnumerableProps.length;
  var constructor = obj.constructor;
  var proto = isFunction(constructor) && constructor.prototype || ObjProto;

  // Constructor is a special case.
  var prop = 'constructor';
  if (_has(obj, prop) && !contains(_keys, prop)) _keys.push(prop);

  while (nonEnumIdx--) {
    prop = nonEnumerableProps[nonEnumIdx];
    if (prop in obj && obj[prop] !== proto[prop] && !contains(_keys, prop)) {
      _keys.push(prop);
    }
  }
}

// Retrieve the names of an object's own properties.
// Delegates to **ECMAScript 5**'s native `Object.keys`.
function keys(obj) {
  if (!isObject(obj)) return [];
  if (nativeKeys) return nativeKeys(obj);
  var _keys = [];
  for (var key in obj) if (_has(obj, key)) _keys.push(key);
  // Ahem, IE < 9.
  if (hasEnumBug) collectNonEnumProps(obj, _keys);
  return _keys;
}

// Retrieve all the property names of an object.
function allKeys(obj) {
  if (!isObject(obj)) return [];
  var _keys = [];
  for (var key in obj) _keys.push(key);
  // Ahem, IE < 9.
  if (hasEnumBug) collectNonEnumProps(obj, _keys);
  return _keys;
}

// Retrieve the values of an object's properties.
function values(obj) {
  var _keys = keys(obj);
  var length = _keys.length;
  var values = Array(length);
  for (var i = 0; i < length; i++) {
    values[i] = obj[_keys[i]];
  }
  return values;
}

// Returns the results of applying the iteratee to each element of the object.
// In contrast to map it returns an object.
function mapObject(obj, iteratee, context) {
  iteratee = cb(iteratee, context);
  var _keys = keys(obj),
      length = _keys.length,
      results = {};
  for (var index = 0; index < length; index++) {
    var currentKey = _keys[index];
    results[currentKey] = iteratee(obj[currentKey], currentKey, obj);
  }
  return results;
}

// Convert an object into a list of `[key, value]` pairs.
// The opposite of object.
function pairs(obj) {
  var _keys = keys(obj);
  var length = _keys.length;
  var pairs = Array(length);
  for (var i = 0; i < length; i++) {
    pairs[i] = [_keys[i], obj[_keys[i]]];
  }
  return pairs;
}

// Invert the keys and values of an object. The values must be serializable.
function invert(obj) {
  var result = {};
  var _keys = keys(obj);
  for (var i = 0, length = _keys.length; i < length; i++) {
    result[obj[_keys[i]]] = _keys[i];
  }
  return result;
}

// Return a sorted list of the function names available on the object.
function functions(obj) {
  var names = [];
  for (var key in obj) {
    if (isFunction(obj[key])) names.push(key);
  }
  return names.sort();
}


// An internal function for creating assigner functions.
function createAssigner(keysFunc, defaults) {
  return function(obj) {
    var length = arguments.length;
    if (defaults) obj = Object(obj);
    if (length < 2 || obj == null) return obj;
    for (var index = 1; index < length; index++) {
      var source = arguments[index],
          _keys = keysFunc(source),
          l = _keys.length;
      for (var i = 0; i < l; i++) {
        var key = _keys[i];
        if (!defaults || obj[key] === void 0) obj[key] = source[key];
      }
    }
    return obj;
  };
}

// Extend a given object with all the properties in passed-in object(s).
var extend = createAssigner(allKeys);

// Assigns a given object with all the own properties in the passed-in object(s).
// (https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Object/assign)
var extendOwn = createAssigner(keys);


// Returns the first key on an object that passes a predicate test.
function findKey(obj, predicate, context) {
  predicate = cb(predicate, context);
  var _keys = keys(obj), key;
  for (var i = 0, length = _keys.length; i < length; i++) {
    key = _keys[i];
    if (predicate(obj[key], key, obj)) return key;
  }
}

// Internal pick helper function to determine if `obj` has key `key`.
function keyInObj(value, key, obj) {
  return key in obj;
}

// Return a copy of the object only containing the whitelisted properties.
var pick = restArguments(function(obj, _keys) {
  var result = {}, iteratee = _keys[0];
  if (obj == null) return result;
  if (isFunction(iteratee)) {
    if (_keys.length > 1) iteratee = optimizeCb(iteratee, _keys[1]);
    _keys = allKeys(obj);
  } else {
    iteratee = keyInObj;
    _keys = _flatten(_keys, false, false);
    obj = Object(obj);
  }
  for (var i = 0, length = _keys.length; i < length; i++) {
    var key = _keys[i];
    var value = obj[key];
    if (iteratee(value, key, obj)) result[key] = value;
  }
  return result;
});

// Return a copy of the object without the blacklisted properties.
var omit = restArguments(function(obj, _keys) {
  var iteratee = _keys[0], context;
  if (isFunction(iteratee)) {
    iteratee = negate(iteratee);
    if (_keys.length > 1) context = _keys[1];
  } else {
    _keys = map(_flatten(_keys, false, false), String);
    iteratee = function(value, key) {
      return !contains(_keys, key);
    };
  }
  return pick(obj, iteratee, context);
});

// Fill in a given object with default properties.
var defaults = createAssigner(allKeys, true);

// Creates an object that inherits from the given prototype object.
// If additional properties are provided then they will be added to the
// created object.
function create(prototype, props) {
  var result = baseCreate(prototype);
  if (props) extendOwn(result, props);
  return result;
}

// Create a (shallow-cloned) duplicate of an object.
function clone(obj) {
  if (!isObject(obj)) return obj;
  return isArray(obj) ? obj.slice() : extend({}, obj);
}

// Invokes interceptor with the obj, and then returns obj.
// The primary purpose of this method is to "tap into" a method chain, in
// order to perform operations on intermediate results within the chain.
function tap(obj, interceptor) {
  interceptor(obj);
  return obj;
}

// Returns whether an object has a given set of `key:value` pairs.
function isMatch(object, attrs) {
  var _keys = keys(attrs), length = _keys.length;
  if (object == null) return !length;
  var obj = Object(object);
  for (var i = 0; i < length; i++) {
    var key = _keys[i];
    if (attrs[key] !== obj[key] || !(key in obj)) return false;
  }
  return true;
}


// Internal recursive comparison function for `isEqual`.
function eq(a, b, aStack, bStack) {
  // Identical objects are equal. `0 === -0`, but they aren't identical.
  // See the [Harmony `egal` proposal](https://wiki.ecmascript.org/doku.php?id=harmony:egal).
  if (a === b) return a !== 0 || 1 / a === 1 / b;
  // `null` or `undefined` only equal to itself (strict comparison).
  if (a == null || b == null) return false;
  // `NaN`s are equivalent, but non-reflexive.
  if (a !== a) return b !== b;
  // Exhaust primitive checks
  var type = typeof a;
  if (type !== 'function' && type !== 'object' && typeof b != 'object') return false;
  return deepEq(a, b, aStack, bStack);
}

// Internal recursive comparison function for `isEqual`.
function deepEq(a, b, aStack, bStack) {
  // Unwrap any wrapped objects.
  if (a instanceof _) a = a._wrapped;
  if (b instanceof _) b = b._wrapped;
  // Compare `[[Class]]` names.
  var className = toString.call(a);
  if (className !== toString.call(b)) return false;
  switch (className) {
    // Strings, numbers, regular expressions, dates, and booleans are compared by value.
    case '[object RegExp]':
    // RegExps are coerced to strings for comparison (Note: '' + /a/i === '/a/i')
    case '[object String]':
      // Primitives and their corresponding object wrappers are equivalent; thus, `"5"` is
      // equivalent to `new String("5")`.
      return '' + a === '' + b;
    case '[object Number]':
      // `NaN`s are equivalent, but non-reflexive.
      // Object(NaN) is equivalent to NaN.
      if (+a !== +a) return +b !== +b;
      // An `egal` comparison is performed for other numeric values.
      return +a === 0 ? 1 / +a === 1 / b : +a === +b;
    case '[object Date]':
    case '[object Boolean]':
      // Coerce dates and booleans to numeric primitive values. Dates are compared by their
      // millisecond representations. Note that invalid dates with millisecond representations
      // of `NaN` are not equivalent.
      return +a === +b;
    case '[object Symbol]':
      return SymbolProto.valueOf.call(a) === SymbolProto.valueOf.call(b);
  }

  var areArrays = className === '[object Array]';
  if (!areArrays) {
    if (typeof a != 'object' || typeof b != 'object') return false;

    // Objects with different constructors are not equivalent, but `Object`s or `Array`s
    // from different frames are.
    var aCtor = a.constructor, bCtor = b.constructor;
    if (aCtor !== bCtor && !(isFunction(aCtor) && aCtor instanceof aCtor &&
                             isFunction(bCtor) && bCtor instanceof bCtor)
                        && ('constructor' in a && 'constructor' in b)) {
      return false;
    }
  }
  // Assume equality for cyclic structures. The algorithm for detecting cyclic
  // structures is adapted from ES 5.1 section 15.12.3, abstract operation `JO`.

  // Initializing stack of traversed objects.
  // It's done here since we only need them for objects and arrays comparison.
  aStack = aStack || [];
  bStack = bStack || [];
  var length = aStack.length;
  while (length--) {
    // Linear search. Performance is inversely proportional to the number of
    // unique nested structures.
    if (aStack[length] === a) return bStack[length] === b;
  }

  // Add the first object to the stack of traversed objects.
  aStack.push(a);
  bStack.push(b);

  // Recursively compare objects and arrays.
  if (areArrays) {
    // Compare array lengths to determine if a deep comparison is necessary.
    length = a.length;
    if (length !== b.length) return false;
    // Deep compare the contents, ignoring non-numeric properties.
    while (length--) {
      if (!eq(a[length], b[length], aStack, bStack)) return false;
    }
  } else {
    // Deep compare objects.
    var _keys = keys(a), key;
    length = _keys.length;
    // Ensure that both objects contain the same number of properties before comparing deep equality.
    if (keys(b).length !== length) return false;
    while (length--) {
      // Deep compare each member
      key = _keys[length];
      if (!(_has(b, key) && eq(a[key], b[key], aStack, bStack))) return false;
    }
  }
  // Remove the first object from the stack of traversed objects.
  aStack.pop();
  bStack.pop();
  return true;
}

// Perform a deep comparison to check if two objects are equal.
function isEqual(a, b) {
  return eq(a, b);
}

// Is a given array, string, or object empty?
// An "empty" object has no enumerable own-properties.
function isEmpty(obj) {
  if (obj == null) return true;
  if (isArrayLike(obj) && (isArray(obj) || isString(obj) || isArguments(obj))) return obj.length === 0;
  return keys(obj).length === 0;
}

// Is a given value a DOM element?
function isElement(obj) {
  return !!(obj && obj.nodeType === 1);
}

// Internal function for creating a toString-based type tester.
function tagTester(name) {
  return function(obj) {
    return toString.call(obj) === '[object ' + name + ']';
  };
}

// Is a given value an array?
// Delegates to ECMA5's native Array.isArray
var isArray = nativeIsArray || tagTester('Array');

// Is a given variable an object?
function isObject(obj) {
  var type = typeof obj;
  return type === 'function' || type === 'object' && !!obj;
}

// Add some isType methods: isArguments, isFunction, isString, isNumber, isDate, isRegExp, isError, isMap, isWeakMap, isSet, isWeakSet.
var isArguments = tagTester('Arguments');
var isFunction = tagTester('Function');
var isString = tagTester('String');
var isNumber = tagTester('Number');
var isDate = tagTester('Date');
var isRegExp = tagTester('RegExp');
var isError = tagTester('Error');
var isSymbol = tagTester('Symbol');
var isMap = tagTester('Map');
var isWeakMap = tagTester('WeakMap');
var isSet = tagTester('Set');
var isWeakSet = tagTester('WeakSet');

// Define a fallback version of the method in browsers (ahem, IE < 9), where
// there isn't any inspectable "Arguments" type.
(function() {
  if (!isArguments(arguments)) {
    isArguments = function(obj) {
      return _has(obj, 'callee');
    };
  }
}());

// Optimize `isFunction` if appropriate. Work around some typeof bugs in old v8,
// IE 11 (#1621), Safari 8 (#1929), and PhantomJS (#2236).
var nodelist = root.document && root.document.childNodes;
if ( true && typeof Int8Array != 'object' && typeof nodelist != 'function') {
  isFunction = function(obj) {
    return typeof obj == 'function' || false;
  };
}

// Is a given object a finite number?
function isFinite(obj) {
  return !isSymbol(obj) && _isFinite(obj) && !_isNaN(parseFloat(obj));
}

// Is the given value `NaN`?
function isNaN(obj) {
  return isNumber(obj) && _isNaN(obj);
}

// Is a given value a boolean?
function isBoolean(obj) {
  return obj === true || obj === false || toString.call(obj) === '[object Boolean]';
}

// Is a given value equal to null?
function isNull(obj) {
  return obj === null;
}

// Is a given variable undefined?
function isUndefined(obj) {
  return obj === void 0;
}

// Shortcut function for checking if an object has a given property directly
// on itself (in other words, not on a prototype).
function has(obj, path) {
  if (!isArray(path)) {
    return _has(obj, path);
  }
  var length = path.length;
  for (var i = 0; i < length; i++) {
    var key = path[i];
    if (obj == null || !hasOwnProperty.call(obj, key)) {
      return false;
    }
    obj = obj[key];
  }
  return !!length;
}

// Utility Functions
// -----------------

// Keep the identity function around for default iteratees.
function identity(value) {
  return value;
}

// Predicate-generating functions. Often useful outside of Underscore.
function constant(value) {
  return function() {
    return value;
  };
}

function noop(){}

// Creates a function that, when passed an object, will traverse that object’s
// properties down the given `path`, specified as an array of keys or indexes.
function property(path) {
  if (!isArray(path)) {
    return shallowProperty(path);
  }
  return function(obj) {
    return deepGet(obj, path);
  };
}

// Generates a function for a given object that returns a given property.
function propertyOf(obj) {
  if (obj == null) {
    return function(){};
  }
  return function(path) {
    return !isArray(path) ? obj[path] : deepGet(obj, path);
  };
}

// Returns a predicate for checking whether an object has a given set of
// `key:value` pairs.
function matcher(attrs) {
  attrs = extendOwn({}, attrs);
  return function(obj) {
    return isMatch(obj, attrs);
  };
}


// Run a function **n** times.
function times(n, iteratee, context) {
  var accum = Array(Math.max(0, n));
  iteratee = optimizeCb(iteratee, context, 1);
  for (var i = 0; i < n; i++) accum[i] = iteratee(i);
  return accum;
}

// Return a random integer between min and max (inclusive).
function random(min, max) {
  if (max == null) {
    max = min;
    min = 0;
  }
  return min + Math.floor(Math.random() * (max - min + 1));
}

// A (possibly faster) way to get the current timestamp as an integer.
var now = Date.now || function() {
  return new Date().getTime();
};

// List of HTML entities for escaping.
var escapeMap = {
  '&': '&amp;',
  '<': '&lt;',
  '>': '&gt;',
  '"': '&quot;',
  "'": '&#x27;',
  '`': '&#x60;'
};
var unescapeMap = invert(escapeMap);

// Functions for escaping and unescaping strings to/from HTML interpolation.
function createEscaper(map) {
  var escaper = function(match) {
    return map[match];
  };
  // Regexes for identifying a key that needs to be escaped.
  var source = '(?:' + keys(map).join('|') + ')';
  var testRegexp = RegExp(source);
  var replaceRegexp = RegExp(source, 'g');
  return function(string) {
    string = string == null ? '' : '' + string;
    return testRegexp.test(string) ? string.replace(replaceRegexp, escaper) : string;
  };
}
var escape = createEscaper(escapeMap);
var unescape = createEscaper(unescapeMap);

// Traverses the children of `obj` along `path`. If a child is a function, it
// is invoked with its parent as context. Returns the value of the final
// child, or `fallback` if any child is undefined.
function result(obj, path, fallback) {
  if (!isArray(path)) path = [path];
  var length = path.length;
  if (!length) {
    return isFunction(fallback) ? fallback.call(obj) : fallback;
  }
  for (var i = 0; i < length; i++) {
    var prop = obj == null ? void 0 : obj[path[i]];
    if (prop === void 0) {
      prop = fallback;
      i = length; // Ensure we don't continue iterating.
    }
    obj = isFunction(prop) ? prop.call(obj) : prop;
  }
  return obj;
}

// Generate a unique integer id (unique within the entire client session).
// Useful for temporary DOM ids.
var idCounter = 0;
function uniqueId(prefix) {
  var id = ++idCounter + '';
  return prefix ? prefix + id : id;
}

// By default, Underscore uses ERB-style template delimiters, change the
// following template settings to use alternative delimiters.
var templateSettings = _.templateSettings = {
  evaluate: /<%([\s\S]+?)%>/g,
  interpolate: /<%=([\s\S]+?)%>/g,
  escape: /<%-([\s\S]+?)%>/g
};

// When customizing `templateSettings`, if you don't want to define an
// interpolation, evaluation or escaping regex, we need one that is
// guaranteed not to match.
var noMatch = /(.)^/;

// Certain characters need to be escaped so that they can be put into a
// string literal.
var escapes = {
  "'": "'",
  '\\': '\\',
  '\r': 'r',
  '\n': 'n',
  '\u2028': 'u2028',
  '\u2029': 'u2029'
};

var escapeRegExp = /\\|'|\r|\n|\u2028|\u2029/g;

var escapeChar = function(match) {
  return '\\' + escapes[match];
};

// JavaScript micro-templating, similar to John Resig's implementation.
// Underscore templating handles arbitrary delimiters, preserves whitespace,
// and correctly escapes quotes within interpolated code.
// NB: `oldSettings` only exists for backwards compatibility.
function template(text, settings, oldSettings) {
  if (!settings && oldSettings) settings = oldSettings;
  settings = defaults({}, settings, _.templateSettings);

  // Combine delimiters into one regular expression via alternation.
  var matcher = RegExp([
    (settings.escape || noMatch).source,
    (settings.interpolate || noMatch).source,
    (settings.evaluate || noMatch).source
  ].join('|') + '|$', 'g');

  // Compile the template source, escaping string literals appropriately.
  var index = 0;
  var source = "__p+='";
  text.replace(matcher, function(match, escape, interpolate, evaluate, offset) {
    source += text.slice(index, offset).replace(escapeRegExp, escapeChar);
    index = offset + match.length;

    if (escape) {
      source += "'+\n((__t=(" + escape + "))==null?'':_.escape(__t))+\n'";
    } else if (interpolate) {
      source += "'+\n((__t=(" + interpolate + "))==null?'':__t)+\n'";
    } else if (evaluate) {
      source += "';\n" + evaluate + "\n__p+='";
    }

    // Adobe VMs need the match returned to produce the correct offset.
    return match;
  });
  source += "';\n";

  // If a variable is not specified, place data values in local scope.
  if (!settings.variable) source = 'with(obj||{}){\n' + source + '}\n';

  source = "var __t,__p='',__j=Array.prototype.join," +
    "print=function(){__p+=__j.call(arguments,'');};\n" +
    source + 'return __p;\n';

  var render;
  try {
    render = new Function(settings.variable || 'obj', '_', source);
  } catch (e) {
    e.source = source;
    throw e;
  }

  var template = function(data) {
    return render.call(this, data, _);
  };

  // Provide the compiled source as a convenience for precompilation.
  var argument = settings.variable || 'obj';
  template.source = 'function(' + argument + '){\n' + source + '}';

  return template;
}

// Add a "chain" function. Start chaining a wrapped Underscore object.
function chain(obj) {
  var instance = _(obj);
  instance._chain = true;
  return instance;
}

// OOP
// ---------------
// If Underscore is called as a function, it returns a wrapped object that
// can be used OO-style. This wrapper holds altered versions of all the
// underscore functions. Wrapped objects may be chained.

// Helper function to continue chaining intermediate results.
function chainResult(instance, obj) {
  return instance._chain ? _(obj).chain() : obj;
}

// Add your own custom functions to the Underscore object.
function mixin(obj) {
  each(functions(obj), function(name) {
    var func = _[name] = obj[name];
    _.prototype[name] = function() {
      var args = [this._wrapped];
      push.apply(args, arguments);
      return chainResult(this, func.apply(_, args));
    };
  });
  return _;
}

// Add all mutator Array functions to the wrapper.
each(['pop', 'push', 'reverse', 'shift', 'sort', 'splice', 'unshift'], function(name) {
  var method = ArrayProto[name];
  _.prototype[name] = function() {
    var obj = this._wrapped;
    method.apply(obj, arguments);
    if ((name === 'shift' || name === 'splice') && obj.length === 0) delete obj[0];
    return chainResult(this, obj);
  };
});

// Add all accessor Array functions to the wrapper.
each(['concat', 'join', 'slice'], function(name) {
  var method = ArrayProto[name];
  _.prototype[name] = function() {
    return chainResult(this, method.apply(this._wrapped, arguments));
  };
});

// Extracts the result from a wrapped and chained object.
_.prototype.value = function() {
  return this._wrapped;
};

// Provide unwrapping proxy for some methods used in engine operations
// such as arithmetic and JSON stringification.
_.prototype.valueOf = _.prototype.toJSON = _.prototype.value;

_.prototype.toString = function() {
  return String(this._wrapped);
};

/* WEBPACK VAR INJECTION */}.call(this, __webpack_require__(/*! ./../../webpack/buildin/global.js */ "./node_modules/webpack/buildin/global.js")))

/***/ }),

/***/ "./node_modules/util-deprecate/browser.js":
/*!************************************************!*\
  !*** ./node_modules/util-deprecate/browser.js ***!
  \************************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

/* WEBPACK VAR INJECTION */(function(global) {
/**
 * Module exports.
 */

module.exports = deprecate;

/**
 * Mark that a method should not be used.
 * Returns a modified function which warns once by default.
 *
 * If `localStorage.noDeprecation = true` is set, then it is a no-op.
 *
 * If `localStorage.throwDeprecation = true` is set, then deprecated functions
 * will throw an Error when invoked.
 *
 * If `localStorage.traceDeprecation = true` is set, then deprecated functions
 * will invoke `console.trace()` instead of `console.error()`.
 *
 * @param {Function} fn - the function to deprecate
 * @param {String} msg - the string to print to the console when `fn` is invoked
 * @returns {Function} a new "deprecated" version of `fn`
 * @api public
 */

function deprecate (fn, msg) {
  if (config('noDeprecation')) {
    return fn;
  }

  var warned = false;
  function deprecated() {
    if (!warned) {
      if (config('throwDeprecation')) {
        throw new Error(msg);
      } else if (config('traceDeprecation')) {
        console.trace(msg);
      } else {
        console.warn(msg);
      }
      warned = true;
    }
    return fn.apply(this, arguments);
  }

  return deprecated;
}

/**
 * Checks `localStorage` for boolean values for the given `name`.
 *
 * @param {String} name
 * @returns {Boolean}
 * @api private
 */

function config (name) {
  // accessing global.localStorage can trigger a DOMException in sandboxed iframes
  try {
    if (!global.localStorage) return false;
  } catch (_) {
    return false;
  }
  var val = global.localStorage[name];
  if (null == val) return false;
  return String(val).toLowerCase() === 'true';
}

/* WEBPACK VAR INJECTION */}.call(this, __webpack_require__(/*! ./../webpack/buildin/global.js */ "./node_modules/webpack/buildin/global.js")))

/***/ }),

/***/ "./node_modules/webpack/buildin/global.js":
/*!***********************************!*\
  !*** (webpack)/buildin/global.js ***!
  \***********************************/
/*! no static exports found */
/***/ (function(module, exports) {

var g;

// This works in non-strict mode
g = (function() {
	return this;
})();

try {
	// This works if eval is allowed (see CSP)
	g = g || new Function("return this")();
} catch (e) {
	// This works if the window reference is available
	if (typeof window === "object") g = window;
}

// g can still be undefined, but nothing to do about it...
// We return undefined, instead of nothing here, so it's
// easier to handle this case. if(!global) { ...}

module.exports = g;


/***/ })

}]);
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIndlYnBhY2s6Ly8vLi9ub2RlX21vZHVsZXMvc3ByaW50Zi1qcy9zcmMvc3ByaW50Zi5qcyIsIndlYnBhY2s6Ly8vLi9ub2RlX21vZHVsZXMvdW5kZXJzY29yZS5zdHJpbmcvY2FtZWxpemUuanMiLCJ3ZWJwYWNrOi8vLy4vbm9kZV9tb2R1bGVzL3VuZGVyc2NvcmUuc3RyaW5nL2NhcGl0YWxpemUuanMiLCJ3ZWJwYWNrOi8vLy4vbm9kZV9tb2R1bGVzL3VuZGVyc2NvcmUuc3RyaW5nL2NoYXJzLmpzIiwid2VicGFjazovLy8uL25vZGVfbW9kdWxlcy91bmRlcnNjb3JlLnN0cmluZy9jaG9wLmpzIiwid2VicGFjazovLy8uL25vZGVfbW9kdWxlcy91bmRlcnNjb3JlLnN0cmluZy9jbGFzc2lmeS5qcyIsIndlYnBhY2s6Ly8vLi9ub2RlX21vZHVsZXMvdW5kZXJzY29yZS5zdHJpbmcvY2xlYW4uanMiLCJ3ZWJwYWNrOi8vLy4vbm9kZV9tb2R1bGVzL3VuZGVyc2NvcmUuc3RyaW5nL2NsZWFuRGlhY3JpdGljcy5qcyIsIndlYnBhY2s6Ly8vLi9ub2RlX21vZHVsZXMvdW5kZXJzY29yZS5zdHJpbmcvY291bnQuanMiLCJ3ZWJwYWNrOi8vLy4vbm9kZV9tb2R1bGVzL3VuZGVyc2NvcmUuc3RyaW5nL2Rhc2hlcml6ZS5qcyIsIndlYnBhY2s6Ly8vLi9ub2RlX21vZHVsZXMvdW5kZXJzY29yZS5zdHJpbmcvZGVjYXBpdGFsaXplLmpzIiwid2VicGFjazovLy8uL25vZGVfbW9kdWxlcy91bmRlcnNjb3JlLnN0cmluZy9kZWRlbnQuanMiLCJ3ZWJwYWNrOi8vLy4vbm9kZV9tb2R1bGVzL3VuZGVyc2NvcmUuc3RyaW5nL2VuZHNXaXRoLmpzIiwid2VicGFjazovLy8uL25vZGVfbW9kdWxlcy91bmRlcnNjb3JlLnN0cmluZy9lc2NhcGVIVE1MLmpzIiwid2VicGFjazovLy8uL25vZGVfbW9kdWxlcy91bmRlcnNjb3JlLnN0cmluZy9leHBvcnRzLmpzIiwid2VicGFjazovLy8uL25vZGVfbW9kdWxlcy91bmRlcnNjb3JlLnN0cmluZy9oZWxwZXIvYWRqYWNlbnQuanMiLCJ3ZWJwYWNrOi8vLy4vbm9kZV9tb2R1bGVzL3VuZGVyc2NvcmUuc3RyaW5nL2hlbHBlci9kZWZhdWx0VG9XaGl0ZVNwYWNlLmpzIiwid2VicGFjazovLy8uL25vZGVfbW9kdWxlcy91bmRlcnNjb3JlLnN0cmluZy9oZWxwZXIvZXNjYXBlQ2hhcnMuanMiLCJ3ZWJwYWNrOi8vLy4vbm9kZV9tb2R1bGVzL3VuZGVyc2NvcmUuc3RyaW5nL2hlbHBlci9lc2NhcGVSZWdFeHAuanMiLCJ3ZWJwYWNrOi8vLy4vbm9kZV9tb2R1bGVzL3VuZGVyc2NvcmUuc3RyaW5nL2hlbHBlci9odG1sRW50aXRpZXMuanMiLCJ3ZWJwYWNrOi8vLy4vbm9kZV9tb2R1bGVzL3VuZGVyc2NvcmUuc3RyaW5nL2hlbHBlci9tYWtlU3RyaW5nLmpzIiwid2VicGFjazovLy8uL25vZGVfbW9kdWxlcy91bmRlcnNjb3JlLnN0cmluZy9oZWxwZXIvc3RyUmVwZWF0LmpzIiwid2VicGFjazovLy8uL25vZGVfbW9kdWxlcy91bmRlcnNjb3JlLnN0cmluZy9oZWxwZXIvdG9Qb3NpdGl2ZS5qcyIsIndlYnBhY2s6Ly8vLi9ub2RlX21vZHVsZXMvdW5kZXJzY29yZS5zdHJpbmcvaHVtYW5pemUuanMiLCJ3ZWJwYWNrOi8vLy4vbm9kZV9tb2R1bGVzL3VuZGVyc2NvcmUuc3RyaW5nL2luY2x1ZGUuanMiLCJ3ZWJwYWNrOi8vLy4vbm9kZV9tb2R1bGVzL3VuZGVyc2NvcmUuc3RyaW5nL2luZGV4LmpzIiwid2VicGFjazovLy8uL25vZGVfbW9kdWxlcy91bmRlcnNjb3JlLnN0cmluZy9pbnNlcnQuanMiLCJ3ZWJwYWNrOi8vLy4vbm9kZV9tb2R1bGVzL3VuZGVyc2NvcmUuc3RyaW5nL2lzQmxhbmsuanMiLCJ3ZWJwYWNrOi8vLy4vbm9kZV9tb2R1bGVzL3VuZGVyc2NvcmUuc3RyaW5nL2pvaW4uanMiLCJ3ZWJwYWNrOi8vLy4vbm9kZV9tb2R1bGVzL3VuZGVyc2NvcmUuc3RyaW5nL2xldmVuc2h0ZWluLmpzIiwid2VicGFjazovLy8uL25vZGVfbW9kdWxlcy91bmRlcnNjb3JlLnN0cmluZy9saW5lcy5qcyIsIndlYnBhY2s6Ly8vLi9ub2RlX21vZHVsZXMvdW5kZXJzY29yZS5zdHJpbmcvbHBhZC5qcyIsIndlYnBhY2s6Ly8vLi9ub2RlX21vZHVsZXMvdW5kZXJzY29yZS5zdHJpbmcvbHJwYWQuanMiLCJ3ZWJwYWNrOi8vLy4vbm9kZV9tb2R1bGVzL3VuZGVyc2NvcmUuc3RyaW5nL2x0cmltLmpzIiwid2VicGFjazovLy8uL25vZGVfbW9kdWxlcy91bmRlcnNjb3JlLnN0cmluZy9tYXAuanMiLCJ3ZWJwYWNrOi8vLy4vbm9kZV9tb2R1bGVzL3VuZGVyc2NvcmUuc3RyaW5nL25hdHVyYWxDbXAuanMiLCJ3ZWJwYWNrOi8vLy4vbm9kZV9tb2R1bGVzL3VuZGVyc2NvcmUuc3RyaW5nL251bWJlckZvcm1hdC5qcyIsIndlYnBhY2s6Ly8vLi9ub2RlX21vZHVsZXMvdW5kZXJzY29yZS5zdHJpbmcvcGFkLmpzIiwid2VicGFjazovLy8uL25vZGVfbW9kdWxlcy91bmRlcnNjb3JlLnN0cmluZy9wcmVkLmpzIiwid2VicGFjazovLy8uL25vZGVfbW9kdWxlcy91bmRlcnNjb3JlLnN0cmluZy9wcnVuZS5qcyIsIndlYnBhY2s6Ly8vLi9ub2RlX21vZHVsZXMvdW5kZXJzY29yZS5zdHJpbmcvcXVvdGUuanMiLCJ3ZWJwYWNrOi8vLy4vbm9kZV9tb2R1bGVzL3VuZGVyc2NvcmUuc3RyaW5nL3JlcGVhdC5qcyIsIndlYnBhY2s6Ly8vLi9ub2RlX21vZHVsZXMvdW5kZXJzY29yZS5zdHJpbmcvcmVwbGFjZUFsbC5qcyIsIndlYnBhY2s6Ly8vLi9ub2RlX21vZHVsZXMvdW5kZXJzY29yZS5zdHJpbmcvcmV2ZXJzZS5qcyIsIndlYnBhY2s6Ly8vLi9ub2RlX21vZHVsZXMvdW5kZXJzY29yZS5zdHJpbmcvcnBhZC5qcyIsIndlYnBhY2s6Ly8vLi9ub2RlX21vZHVsZXMvdW5kZXJzY29yZS5zdHJpbmcvcnRyaW0uanMiLCJ3ZWJwYWNrOi8vLy4vbm9kZV9tb2R1bGVzL3VuZGVyc2NvcmUuc3RyaW5nL3NsdWdpZnkuanMiLCJ3ZWJwYWNrOi8vLy4vbm9kZV9tb2R1bGVzL3VuZGVyc2NvcmUuc3RyaW5nL3NwbGljZS5qcyIsIndlYnBhY2s6Ly8vLi9ub2RlX21vZHVsZXMvdW5kZXJzY29yZS5zdHJpbmcvc3ByaW50Zi5qcyIsIndlYnBhY2s6Ly8vLi9ub2RlX21vZHVsZXMvdW5kZXJzY29yZS5zdHJpbmcvc3RhcnRzV2l0aC5qcyIsIndlYnBhY2s6Ly8vLi9ub2RlX21vZHVsZXMvdW5kZXJzY29yZS5zdHJpbmcvc3RyTGVmdC5qcyIsIndlYnBhY2s6Ly8vLi9ub2RlX21vZHVsZXMvdW5kZXJzY29yZS5zdHJpbmcvc3RyTGVmdEJhY2suanMiLCJ3ZWJwYWNrOi8vLy4vbm9kZV9tb2R1bGVzL3VuZGVyc2NvcmUuc3RyaW5nL3N0clJpZ2h0LmpzIiwid2VicGFjazovLy8uL25vZGVfbW9kdWxlcy91bmRlcnNjb3JlLnN0cmluZy9zdHJSaWdodEJhY2suanMiLCJ3ZWJwYWNrOi8vLy4vbm9kZV9tb2R1bGVzL3VuZGVyc2NvcmUuc3RyaW5nL3N0cmlwVGFncy5qcyIsIndlYnBhY2s6Ly8vLi9ub2RlX21vZHVsZXMvdW5kZXJzY29yZS5zdHJpbmcvc3VjYy5qcyIsIndlYnBhY2s6Ly8vLi9ub2RlX21vZHVsZXMvdW5kZXJzY29yZS5zdHJpbmcvc3Vycm91bmQuanMiLCJ3ZWJwYWNrOi8vLy4vbm9kZV9tb2R1bGVzL3VuZGVyc2NvcmUuc3RyaW5nL3N3YXBDYXNlLmpzIiwid2VicGFjazovLy8uL25vZGVfbW9kdWxlcy91bmRlcnNjb3JlLnN0cmluZy90aXRsZWl6ZS5qcyIsIndlYnBhY2s6Ly8vLi9ub2RlX21vZHVsZXMvdW5kZXJzY29yZS5zdHJpbmcvdG9Cb29sZWFuLmpzIiwid2VicGFjazovLy8uL25vZGVfbW9kdWxlcy91bmRlcnNjb3JlLnN0cmluZy90b051bWJlci5qcyIsIndlYnBhY2s6Ly8vLi9ub2RlX21vZHVsZXMvdW5kZXJzY29yZS5zdHJpbmcvdG9TZW50ZW5jZS5qcyIsIndlYnBhY2s6Ly8vLi9ub2RlX21vZHVsZXMvdW5kZXJzY29yZS5zdHJpbmcvdG9TZW50ZW5jZVNlcmlhbC5qcyIsIndlYnBhY2s6Ly8vLi9ub2RlX21vZHVsZXMvdW5kZXJzY29yZS5zdHJpbmcvdHJpbS5qcyIsIndlYnBhY2s6Ly8vLi9ub2RlX21vZHVsZXMvdW5kZXJzY29yZS5zdHJpbmcvdHJ1bmNhdGUuanMiLCJ3ZWJwYWNrOi8vLy4vbm9kZV9tb2R1bGVzL3VuZGVyc2NvcmUuc3RyaW5nL3VuZGVyc2NvcmVkLmpzIiwid2VicGFjazovLy8uL25vZGVfbW9kdWxlcy91bmRlcnNjb3JlLnN0cmluZy91bmVzY2FwZUhUTUwuanMiLCJ3ZWJwYWNrOi8vLy4vbm9kZV9tb2R1bGVzL3VuZGVyc2NvcmUuc3RyaW5nL3VucXVvdGUuanMiLCJ3ZWJwYWNrOi8vLy4vbm9kZV9tb2R1bGVzL3VuZGVyc2NvcmUuc3RyaW5nL3ZzcHJpbnRmLmpzIiwid2VicGFjazovLy8uL25vZGVfbW9kdWxlcy91bmRlcnNjb3JlLnN0cmluZy93b3Jkcy5qcyIsIndlYnBhY2s6Ly8vLi9ub2RlX21vZHVsZXMvdW5kZXJzY29yZS5zdHJpbmcvd3JhcC5qcyIsIndlYnBhY2s6Ly8vLi9ub2RlX21vZHVsZXMvdW5kZXJzY29yZS9tb2R1bGVzL2luZGV4LWFsbC5qcyIsIndlYnBhY2s6Ly8vLi9ub2RlX21vZHVsZXMvdW5kZXJzY29yZS9tb2R1bGVzL2luZGV4LWRlZmF1bHQuanMiLCJ3ZWJwYWNrOi8vLy4vbm9kZV9tb2R1bGVzL3VuZGVyc2NvcmUvbW9kdWxlcy9pbmRleC5qcyIsIndlYnBhY2s6Ly8vLi9ub2RlX21vZHVsZXMvdXRpbC1kZXByZWNhdGUvYnJvd3Nlci5qcyIsIndlYnBhY2s6Ly8vKHdlYnBhY2spL2J1aWxkaW4vZ2xvYmFsLmpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7Ozs7OztBQUFBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsdUJBQXVCLEVBQUU7QUFDekI7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQSxtQkFBbUIsaUJBQWlCO0FBQ3BDO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLCtCQUErQjtBQUMvQjtBQUNBLCtCQUErQixxQkFBcUI7QUFDcEQ7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0Esb0NBQW9DO0FBQ3BDO0FBQ0E7QUFDQSxzQkFBc0I7QUFDdEI7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7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QUFDdkMscUJBQXFCLG1CQUFPLENBQUMsNERBQVU7QUFDdkMscUJBQXFCLG1CQUFPLENBQUMsb0VBQWM7QUFDM0MscUJBQXFCLG1CQUFPLENBQUMsOERBQVc7QUFDeEMscUJBQXFCLG1CQUFPLENBQUMsd0RBQVE7QUFDckMscUJBQXFCLG1CQUFPLENBQUMsMERBQVM7QUFDdEMscUJBQXFCLG1CQUFPLENBQUMsNERBQVU7QUFDdkMscUJBQXFCLG1CQUFPLENBQUMsOERBQVc7QUFDeEMscUJBQXFCLG1CQUFPLENBQUMsb0VBQWM7QUFDM0MscUJBQXFCLG1CQUFPLENBQUMsZ0VBQVk7QUFDekMscUJBQXFCLG1CQUFPLENBQUMsd0RBQVE7QUFDckMscUJBQXFCLG1CQUFPLENBQUMsd0RBQVE7QUFDckMscUJBQXFCLG1CQUFPLENBQUMsZ0VBQVk7QUFDekMscUJBQXFCLG1CQUFPLENBQUMsZ0VBQVk7QUFDekMscUJBQXFCLG1CQUFPLENBQUMsc0VBQWU7QUFDNUMscUJBQXFCLG1CQUFPLENBQUMsa0VBQWE7QUFDMUMscUJBQXFCLG1CQUFPLENBQUMsZ0VBQVk7QUFDekMscUJBQXFCLG1CQUFPLENBQUMsZ0VBQVk7QUFDekMscUJBQXFCLG1CQUFPLENBQUMsMERBQVM7QUFDdEMscUJBQXFCLG1CQUFPLENBQUMsMERBQVM7QUFDdEMscUJBQXFCLG1CQUFPLENBQUMsZ0VBQVk7QUFDekMscUJBQXFCLG1CQUFPLENBQUMsMERBQVM7QUFDdEMscUJBQXFCLG1CQUFPLENBQUMsMERBQVM7QUFDdEMscUJBQXFCLG1CQUFPLENBQUMsc0RBQU87QUFDcEMscUJBQXFCLG1CQUFPLENBQUMsd0RBQVE7QUFDckMscUJBQXFCLG1CQUFPLENBQUMsd0RBQVE7QUFDckMscUJBQXFCLG1CQUFPLENBQUMsMERBQVM7QUFDdEMscUJBQXFCLG1CQUFPLENBQUMsOERBQVc7QUFDeEMscUJBQXFCLG1CQUFPLENBQUMsZ0VBQVk7QUFDekMscUJBQXFCLG1CQUFPLENBQUMsZ0VBQVk7QUFDekMscUJBQXFCLG1CQUFPLENBQUMsd0VBQWdC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QUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBNkM7QUFDbEI7Ozs7Ozs7Ozs7Ozs7QUNEM0I7QUFBQTtBQUF5QztBQUNOOztBQUVuQztBQUNBLFFBQVEsdURBQUssQ0FBQyxzQ0FBVTtBQUN4QjtBQUNBO0FBQ0E7QUFDZSxnRUFBQyxFQUFDOzs7Ozs7Ozs7Ozs7O0FDUmpCO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTs7QUFFQTtBQUNBO0FBQ2U7QUFDZjtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNPOztBQUVQO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDTztBQUNQO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDTztBQUNQO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxVQUFVLGdCQUFnQjtBQUMxQjtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsbUJBQW1CLG9CQUFvQjtBQUN2QztBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQSxpQkFBaUIsWUFBWTtBQUM3QjtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ087QUFDUDtBQUNBO0FBQ0E7QUFDQSxvQ0FBb0MsWUFBWTtBQUNoRDtBQUNBO0FBQ0EsR0FBRztBQUNIO0FBQ0Esc0NBQXNDLFlBQVk7QUFDbEQ7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUMyQjs7QUFFM0I7QUFDTztBQUNQO0FBQ0E7QUFDQTtBQUNBO0FBQ0EscUJBQXFCLGdCQUFnQjtBQUNyQztBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQzBCOztBQUUxQjtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxVQUFVLDhCQUE4QjtBQUN4QztBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNPO0FBQ3NDOztBQUU3QztBQUNPO0FBQ3lCOztBQUVoQztBQUNPO0FBQ1A7QUFDQTtBQUNBO0FBQ0E7QUFDMEI7O0FBRTFCO0FBQ087QUFDUDtBQUNBO0FBQ0E7QUFDQTtBQUNBLEdBQUc7QUFDSDtBQUNBO0FBQzRCOztBQUU1QjtBQUNPO0FBQ1A7QUFDQTs7QUFFQTtBQUNPO0FBQ1A7QUFDQTtBQUNBO0FBQ0EscUJBQXFCLGdCQUFnQjtBQUNyQztBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ3dCOztBQUV4QjtBQUNPO0FBQ1A7QUFDQTtBQUNBO0FBQ0EscUJBQXFCLGdCQUFnQjtBQUNyQztBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ3VCOztBQUV2QjtBQUNPO0FBQ1A7QUFDQTtBQUNBO0FBQ0E7QUFDcUQ7O0FBRXJEO0FBQ087QUFDUDtBQUNBO0FBQ0E7QUFDQSxHQUFHO0FBQ0g7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxHQUFHO0FBQ0gsQ0FBQzs7QUFFRDtBQUNPO0FBQ1A7QUFDQTs7QUFFQTtBQUNBO0FBQ087QUFDUDtBQUNBOztBQUVBO0FBQ0E7QUFDTztBQUNQO0FBQ0E7O0FBRUE7QUFDTztBQUNQO0FBQ0E7QUFDQTtBQUNBO0FBQ0Esd0NBQXdDLFlBQVk7QUFDcEQ7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLEdBQUc7QUFDSDtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLEtBQUs7QUFDTDtBQUNBO0FBQ0E7O0FBRUE7QUFDTztBQUNQO0FBQ0E7QUFDQTtBQUNBO0FBQ0Esd0NBQXdDLFlBQVk7QUFDcEQ7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLEdBQUc7QUFDSDtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLEtBQUs7QUFDTDtBQUNBO0FBQ0E7O0FBRUE7QUFDTztBQUNQO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDTztBQUNQO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxxQkFBcUIsV0FBVztBQUNoQztBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNPO0FBQ1A7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLEdBQUc7QUFDSDtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLEdBQUc7QUFDSDs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsS0FBSztBQUNMO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ087QUFDUCxpREFBaUQ7QUFDakQsQ0FBQzs7QUFFRDtBQUNBO0FBQ087QUFDUDtBQUNBLENBQUM7O0FBRUQ7QUFDQTtBQUNBO0FBQ087QUFDUCx1Q0FBdUM7QUFDdkMsQ0FBQzs7QUFFRDtBQUNBO0FBQ087QUFDUDtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDTztBQUNQO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ087QUFDUDtBQUNBLENBQUM7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QUVEO0FBQ0E7QUFDTzs7QUFFUDtBQUNBO0FBQ0E7QUFDQTtBQUNBLEtBQUssZUFBZTtBQUNiO0FBQ1A7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsS0FBSztBQUNMO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNPO0FBQ1A7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsS0FBSztBQUNMO0FBQ0E7O0FBRUE7QUFDQSxHQUFHOztBQUVIO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ087QUFDUDtBQUNBOztBQUVBO0FBQ087QUFDUDtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ087QUFDUDtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDTztBQUNQO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNPO0FBQ1A7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDTzs7QUFFUDtBQUNBOztBQUVBO0FBQ0EsbUJBQW1CLGVBQWU7QUFDbEM7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNPO0FBQ1A7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNPO0FBQ1A7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDTztBQUNQO0FBQ0E7QUFDQTtBQUNBLGlCQUFpQixZQUFZO0FBQzdCO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDTztBQUNQO0FBQ0E7QUFDQTtBQUNBO0FBQ0EscUJBQXFCLGdCQUFnQjtBQUNyQztBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDTztBQUNQO0FBQ0E7QUFDQTtBQUNBLGlCQUFpQixZQUFZO0FBQzdCO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ087QUFDUDtBQUNBO0FBQ0Esd0NBQXdDLFlBQVk7QUFDcEQ7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDTztBQUNQO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNnQzs7QUFFaEM7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsdUJBQXVCLGdCQUFnQjtBQUN2QztBQUNBO0FBQ0E7QUFDQSxxQkFBcUIsT0FBTztBQUM1QjtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNPOztBQUVQO0FBQ0E7QUFDTztBQUN3Qjs7QUFFL0I7QUFDTztBQUNQO0FBQ0E7QUFDQSx3Q0FBd0MsWUFBWTtBQUNwRDtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNPO0FBQ1AsaUJBQWlCO0FBQ2pCO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsR0FBRztBQUNIO0FBQ0E7QUFDQTtBQUNBO0FBQ0Esd0NBQXdDLFlBQVk7QUFDcEQ7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLENBQUM7O0FBRUQ7QUFDTztBQUNQO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsR0FBRztBQUNIO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLENBQUM7O0FBRUQ7QUFDTzs7QUFFUDtBQUNBO0FBQ0E7QUFDTztBQUNQO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ087QUFDUDtBQUNBLCtDQUErQztBQUMvQzs7QUFFQTtBQUNBO0FBQ0E7QUFDTztBQUNQO0FBQ0E7QUFDQTs7QUFFQTtBQUNPO0FBQ1A7QUFDQTtBQUNBO0FBQ0EsaUJBQWlCLFlBQVk7QUFDN0I7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7O0FBR0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLDJFQUEyRTtBQUMzRTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxHQUFHO0FBQ0g7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDTztBQUNQO0FBQ0E7O0FBRUE7QUFDQTtBQUNPO0FBQ1A7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDTztBQUNQO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDTzs7QUFFUDtBQUNPO0FBQ1A7QUFDQTtBQUNBOztBQUVBO0FBQ087QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVQO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxDQUFDOztBQUVEO0FBQ0E7QUFDQTtBQUNBLElBQUksS0FBd0I7QUFDNUI7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDTztBQUNQO0FBQ0E7O0FBRUE7QUFDTztBQUNQO0FBQ0E7O0FBRUE7QUFDTztBQUNQO0FBQ0E7O0FBRUE7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QUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0EsV0FBVyxPQUFPO0FBQ2xCLGFBQWE7QUFDYjtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsR0FBRztBQUNIO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7Ozs7Ozs7Ozs7OztBQ2xFQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQSxDQUFDOztBQUVEO0FBQ0E7QUFDQTtBQUNBLENBQUM7QUFDRDtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBLDRDQUE0Qzs7QUFFNUMiLCJmaWxlIjoidmVuZG9yc35hcHAuanMiLCJzb3VyY2VzQ29udGVudCI6WyIoZnVuY3Rpb24od2luZG93KSB7XG4gICAgdmFyIHJlID0ge1xuICAgICAgICBub3Rfc3RyaW5nOiAvW15zXS8sXG4gICAgICAgIG51bWJlcjogL1tkaWVmZ10vLFxuICAgICAgICBqc29uOiAvW2pdLyxcbiAgICAgICAgbm90X2pzb246IC9bXmpdLyxcbiAgICAgICAgdGV4dDogL15bXlxceDI1XSsvLFxuICAgICAgICBtb2R1bG86IC9eXFx4MjV7Mn0vLFxuICAgICAgICBwbGFjZWhvbGRlcjogL15cXHgyNSg/OihbMS05XVxcZCopXFwkfFxcKChbXlxcKV0rKVxcKSk/KFxcKyk/KDB8J1teJF0pPygtKT8oXFxkKyk/KD86XFwuKFxcZCspKT8oW2ItZ2lqb3N1eFhdKS8sXG4gICAgICAgIGtleTogL14oW2Etel9dW2Etel9cXGRdKikvaSxcbiAgICAgICAga2V5X2FjY2VzczogL15cXC4oW2Etel9dW2Etel9cXGRdKikvaSxcbiAgICAgICAgaW5kZXhfYWNjZXNzOiAvXlxcWyhcXGQrKVxcXS8sXG4gICAgICAgIHNpZ246IC9eW1xcK1xcLV0vXG4gICAgfVxuXG4gICAgZnVuY3Rpb24gc3ByaW50ZigpIHtcbiAgICAgICAgdmFyIGtleSA9IGFyZ3VtZW50c1swXSwgY2FjaGUgPSBzcHJpbnRmLmNhY2hlXG4gICAgICAgIGlmICghKGNhY2hlW2tleV0gJiYgY2FjaGUuaGFzT3duUHJvcGVydHkoa2V5KSkpIHtcbiAgICAgICAgICAgIGNhY2hlW2tleV0gPSBzcHJpbnRmLnBhcnNlKGtleSlcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gc3ByaW50Zi5mb3JtYXQuY2FsbChudWxsLCBjYWNoZVtrZXldLCBhcmd1bWVudHMpXG4gICAgfVxuXG4gICAgc3ByaW50Zi5mb3JtYXQgPSBmdW5jdGlvbihwYXJzZV90cmVlLCBhcmd2KSB7XG4gICAgICAgIHZhciBjdXJzb3IgPSAxLCB0cmVlX2xlbmd0aCA9IHBhcnNlX3RyZWUubGVuZ3RoLCBub2RlX3R5cGUgPSBcIlwiLCBhcmcsIG91dHB1dCA9IFtdLCBpLCBrLCBtYXRjaCwgcGFkLCBwYWRfY2hhcmFjdGVyLCBwYWRfbGVuZ3RoLCBpc19wb3NpdGl2ZSA9IHRydWUsIHNpZ24gPSBcIlwiXG4gICAgICAgIGZvciAoaSA9IDA7IGkgPCB0cmVlX2xlbmd0aDsgaSsrKSB7XG4gICAgICAgICAgICBub2RlX3R5cGUgPSBnZXRfdHlwZShwYXJzZV90cmVlW2ldKVxuICAgICAgICAgICAgaWYgKG5vZGVfdHlwZSA9PT0gXCJzdHJpbmdcIikge1xuICAgICAgICAgICAgICAgIG91dHB1dFtvdXRwdXQubGVuZ3RoXSA9IHBhcnNlX3RyZWVbaV1cbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGVsc2UgaWYgKG5vZGVfdHlwZSA9PT0gXCJhcnJheVwiKSB7XG4gICAgICAgICAgICAgICAgbWF0Y2ggPSBwYXJzZV90cmVlW2ldIC8vIGNvbnZlbmllbmNlIHB1cnBvc2VzIG9ubHlcbiAgICAgICAgICAgICAgICBpZiAobWF0Y2hbMl0pIHsgLy8ga2V5d29yZCBhcmd1bWVudFxuICAgICAgICAgICAgICAgICAgICBhcmcgPSBhcmd2W2N1cnNvcl1cbiAgICAgICAgICAgICAgICAgICAgZm9yIChrID0gMDsgayA8IG1hdGNoWzJdLmxlbmd0aDsgaysrKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBpZiAoIWFyZy5oYXNPd25Qcm9wZXJ0eShtYXRjaFsyXVtrXSkpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB0aHJvdyBuZXcgRXJyb3Ioc3ByaW50ZihcIltzcHJpbnRmXSBwcm9wZXJ0eSAnJXMnIGRvZXMgbm90IGV4aXN0XCIsIG1hdGNoWzJdW2tdKSlcbiAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgICAgIGFyZyA9IGFyZ1ttYXRjaFsyXVtrXV1cbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICBlbHNlIGlmIChtYXRjaFsxXSkgeyAvLyBwb3NpdGlvbmFsIGFyZ3VtZW50IChleHBsaWNpdClcbiAgICAgICAgICAgICAgICAgICAgYXJnID0gYXJndlttYXRjaFsxXV1cbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgZWxzZSB7IC8vIHBvc2l0aW9uYWwgYXJndW1lbnQgKGltcGxpY2l0KVxuICAgICAgICAgICAgICAgICAgICBhcmcgPSBhcmd2W2N1cnNvcisrXVxuICAgICAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgICAgIGlmIChnZXRfdHlwZShhcmcpID09IFwiZnVuY3Rpb25cIikge1xuICAgICAgICAgICAgICAgICAgICBhcmcgPSBhcmcoKVxuICAgICAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgICAgIGlmIChyZS5ub3Rfc3RyaW5nLnRlc3QobWF0Y2hbOF0pICYmIHJlLm5vdF9qc29uLnRlc3QobWF0Y2hbOF0pICYmIChnZXRfdHlwZShhcmcpICE9IFwibnVtYmVyXCIgJiYgaXNOYU4oYXJnKSkpIHtcbiAgICAgICAgICAgICAgICAgICAgdGhyb3cgbmV3IFR5cGVFcnJvcihzcHJpbnRmKFwiW3NwcmludGZdIGV4cGVjdGluZyBudW1iZXIgYnV0IGZvdW5kICVzXCIsIGdldF90eXBlKGFyZykpKVxuICAgICAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgICAgIGlmIChyZS5udW1iZXIudGVzdChtYXRjaFs4XSkpIHtcbiAgICAgICAgICAgICAgICAgICAgaXNfcG9zaXRpdmUgPSBhcmcgPj0gMFxuICAgICAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgICAgIHN3aXRjaCAobWF0Y2hbOF0pIHtcbiAgICAgICAgICAgICAgICAgICAgY2FzZSBcImJcIjpcbiAgICAgICAgICAgICAgICAgICAgICAgIGFyZyA9IGFyZy50b1N0cmluZygyKVxuICAgICAgICAgICAgICAgICAgICBicmVha1xuICAgICAgICAgICAgICAgICAgICBjYXNlIFwiY1wiOlxuICAgICAgICAgICAgICAgICAgICAgICAgYXJnID0gU3RyaW5nLmZyb21DaGFyQ29kZShhcmcpXG4gICAgICAgICAgICAgICAgICAgIGJyZWFrXG4gICAgICAgICAgICAgICAgICAgIGNhc2UgXCJkXCI6XG4gICAgICAgICAgICAgICAgICAgIGNhc2UgXCJpXCI6XG4gICAgICAgICAgICAgICAgICAgICAgICBhcmcgPSBwYXJzZUludChhcmcsIDEwKVxuICAgICAgICAgICAgICAgICAgICBicmVha1xuICAgICAgICAgICAgICAgICAgICBjYXNlIFwialwiOlxuICAgICAgICAgICAgICAgICAgICAgICAgYXJnID0gSlNPTi5zdHJpbmdpZnkoYXJnLCBudWxsLCBtYXRjaFs2XSA/IHBhcnNlSW50KG1hdGNoWzZdKSA6IDApXG4gICAgICAgICAgICAgICAgICAgIGJyZWFrXG4gICAgICAgICAgICAgICAgICAgIGNhc2UgXCJlXCI6XG4gICAgICAgICAgICAgICAgICAgICAgICBhcmcgPSBtYXRjaFs3XSA/IGFyZy50b0V4cG9uZW50aWFsKG1hdGNoWzddKSA6IGFyZy50b0V4cG9uZW50aWFsKClcbiAgICAgICAgICAgICAgICAgICAgYnJlYWtcbiAgICAgICAgICAgICAgICAgICAgY2FzZSBcImZcIjpcbiAgICAgICAgICAgICAgICAgICAgICAgIGFyZyA9IG1hdGNoWzddID8gcGFyc2VGbG9hdChhcmcpLnRvRml4ZWQobWF0Y2hbN10pIDogcGFyc2VGbG9hdChhcmcpXG4gICAgICAgICAgICAgICAgICAgIGJyZWFrXG4gICAgICAgICAgICAgICAgICAgIGNhc2UgXCJnXCI6XG4gICAgICAgICAgICAgICAgICAgICAgICBhcmcgPSBtYXRjaFs3XSA/IHBhcnNlRmxvYXQoYXJnKS50b1ByZWNpc2lvbihtYXRjaFs3XSkgOiBwYXJzZUZsb2F0KGFyZylcbiAgICAgICAgICAgICAgICAgICAgYnJlYWtcbiAgICAgICAgICAgICAgICAgICAgY2FzZSBcIm9cIjpcbiAgICAgICAgICAgICAgICAgICAgICAgIGFyZyA9IGFyZy50b1N0cmluZyg4KVxuICAgICAgICAgICAgICAgICAgICBicmVha1xuICAgICAgICAgICAgICAgICAgICBjYXNlIFwic1wiOlxuICAgICAgICAgICAgICAgICAgICAgICAgYXJnID0gKChhcmcgPSBTdHJpbmcoYXJnKSkgJiYgbWF0Y2hbN10gPyBhcmcuc3Vic3RyaW5nKDAsIG1hdGNoWzddKSA6IGFyZylcbiAgICAgICAgICAgICAgICAgICAgYnJlYWtcbiAgICAgICAgICAgICAgICAgICAgY2FzZSBcInVcIjpcbiAgICAgICAgICAgICAgICAgICAgICAgIGFyZyA9IGFyZyA+Pj4gMFxuICAgICAgICAgICAgICAgICAgICBicmVha1xuICAgICAgICAgICAgICAgICAgICBjYXNlIFwieFwiOlxuICAgICAgICAgICAgICAgICAgICAgICAgYXJnID0gYXJnLnRvU3RyaW5nKDE2KVxuICAgICAgICAgICAgICAgICAgICBicmVha1xuICAgICAgICAgICAgICAgICAgICBjYXNlIFwiWFwiOlxuICAgICAgICAgICAgICAgICAgICAgICAgYXJnID0gYXJnLnRvU3RyaW5nKDE2KS50b1VwcGVyQ2FzZSgpXG4gICAgICAgICAgICAgICAgICAgIGJyZWFrXG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIGlmIChyZS5qc29uLnRlc3QobWF0Y2hbOF0pKSB7XG4gICAgICAgICAgICAgICAgICAgIG91dHB1dFtvdXRwdXQubGVuZ3RoXSA9IGFyZ1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgaWYgKHJlLm51bWJlci50ZXN0KG1hdGNoWzhdKSAmJiAoIWlzX3Bvc2l0aXZlIHx8IG1hdGNoWzNdKSkge1xuICAgICAgICAgICAgICAgICAgICAgICAgc2lnbiA9IGlzX3Bvc2l0aXZlID8gXCIrXCIgOiBcIi1cIlxuICAgICAgICAgICAgICAgICAgICAgICAgYXJnID0gYXJnLnRvU3RyaW5nKCkucmVwbGFjZShyZS5zaWduLCBcIlwiKVxuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICAgICAgc2lnbiA9IFwiXCJcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICBwYWRfY2hhcmFjdGVyID0gbWF0Y2hbNF0gPyBtYXRjaFs0XSA9PT0gXCIwXCIgPyBcIjBcIiA6IG1hdGNoWzRdLmNoYXJBdCgxKSA6IFwiIFwiXG4gICAgICAgICAgICAgICAgICAgIHBhZF9sZW5ndGggPSBtYXRjaFs2XSAtIChzaWduICsgYXJnKS5sZW5ndGhcbiAgICAgICAgICAgICAgICAgICAgcGFkID0gbWF0Y2hbNl0gPyAocGFkX2xlbmd0aCA+IDAgPyBzdHJfcmVwZWF0KHBhZF9jaGFyYWN0ZXIsIHBhZF9sZW5ndGgpIDogXCJcIikgOiBcIlwiXG4gICAgICAgICAgICAgICAgICAgIG91dHB1dFtvdXRwdXQubGVuZ3RoXSA9IG1hdGNoWzVdID8gc2lnbiArIGFyZyArIHBhZCA6IChwYWRfY2hhcmFjdGVyID09PSBcIjBcIiA/IHNpZ24gKyBwYWQgKyBhcmcgOiBwYWQgKyBzaWduICsgYXJnKVxuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gb3V0cHV0LmpvaW4oXCJcIilcbiAgICB9XG5cbiAgICBzcHJpbnRmLmNhY2hlID0ge31cblxuICAgIHNwcmludGYucGFyc2UgPSBmdW5jdGlvbihmbXQpIHtcbiAgICAgICAgdmFyIF9mbXQgPSBmbXQsIG1hdGNoID0gW10sIHBhcnNlX3RyZWUgPSBbXSwgYXJnX25hbWVzID0gMFxuICAgICAgICB3aGlsZSAoX2ZtdCkge1xuICAgICAgICAgICAgaWYgKChtYXRjaCA9IHJlLnRleHQuZXhlYyhfZm10KSkgIT09IG51bGwpIHtcbiAgICAgICAgICAgICAgICBwYXJzZV90cmVlW3BhcnNlX3RyZWUubGVuZ3RoXSA9IG1hdGNoWzBdXG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBlbHNlIGlmICgobWF0Y2ggPSByZS5tb2R1bG8uZXhlYyhfZm10KSkgIT09IG51bGwpIHtcbiAgICAgICAgICAgICAgICBwYXJzZV90cmVlW3BhcnNlX3RyZWUubGVuZ3RoXSA9IFwiJVwiXG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBlbHNlIGlmICgobWF0Y2ggPSByZS5wbGFjZWhvbGRlci5leGVjKF9mbXQpKSAhPT0gbnVsbCkge1xuICAgICAgICAgICAgICAgIGlmIChtYXRjaFsyXSkge1xuICAgICAgICAgICAgICAgICAgICBhcmdfbmFtZXMgfD0gMVxuICAgICAgICAgICAgICAgICAgICB2YXIgZmllbGRfbGlzdCA9IFtdLCByZXBsYWNlbWVudF9maWVsZCA9IG1hdGNoWzJdLCBmaWVsZF9tYXRjaCA9IFtdXG4gICAgICAgICAgICAgICAgICAgIGlmICgoZmllbGRfbWF0Y2ggPSByZS5rZXkuZXhlYyhyZXBsYWNlbWVudF9maWVsZCkpICE9PSBudWxsKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBmaWVsZF9saXN0W2ZpZWxkX2xpc3QubGVuZ3RoXSA9IGZpZWxkX21hdGNoWzFdXG4gICAgICAgICAgICAgICAgICAgICAgICB3aGlsZSAoKHJlcGxhY2VtZW50X2ZpZWxkID0gcmVwbGFjZW1lbnRfZmllbGQuc3Vic3RyaW5nKGZpZWxkX21hdGNoWzBdLmxlbmd0aCkpICE9PSBcIlwiKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgaWYgKChmaWVsZF9tYXRjaCA9IHJlLmtleV9hY2Nlc3MuZXhlYyhyZXBsYWNlbWVudF9maWVsZCkpICE9PSBudWxsKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGZpZWxkX2xpc3RbZmllbGRfbGlzdC5sZW5ndGhdID0gZmllbGRfbWF0Y2hbMV1cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgZWxzZSBpZiAoKGZpZWxkX21hdGNoID0gcmUuaW5kZXhfYWNjZXNzLmV4ZWMocmVwbGFjZW1lbnRfZmllbGQpKSAhPT0gbnVsbCkge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBmaWVsZF9saXN0W2ZpZWxkX2xpc3QubGVuZ3RoXSA9IGZpZWxkX21hdGNoWzFdXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB0aHJvdyBuZXcgU3ludGF4RXJyb3IoXCJbc3ByaW50Zl0gZmFpbGVkIHRvIHBhcnNlIG5hbWVkIGFyZ3VtZW50IGtleVwiKVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHRocm93IG5ldyBTeW50YXhFcnJvcihcIltzcHJpbnRmXSBmYWlsZWQgdG8gcGFyc2UgbmFtZWQgYXJndW1lbnQga2V5XCIpXG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgbWF0Y2hbMl0gPSBmaWVsZF9saXN0XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICBhcmdfbmFtZXMgfD0gMlxuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICBpZiAoYXJnX25hbWVzID09PSAzKSB7XG4gICAgICAgICAgICAgICAgICAgIHRocm93IG5ldyBFcnJvcihcIltzcHJpbnRmXSBtaXhpbmcgcG9zaXRpb25hbCBhbmQgbmFtZWQgcGxhY2Vob2xkZXJzIGlzIG5vdCAoeWV0KSBzdXBwb3J0ZWRcIilcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgcGFyc2VfdHJlZVtwYXJzZV90cmVlLmxlbmd0aF0gPSBtYXRjaFxuICAgICAgICAgICAgfVxuICAgICAgICAgICAgZWxzZSB7XG4gICAgICAgICAgICAgICAgdGhyb3cgbmV3IFN5bnRheEVycm9yKFwiW3NwcmludGZdIHVuZXhwZWN0ZWQgcGxhY2Vob2xkZXJcIilcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIF9mbXQgPSBfZm10LnN1YnN0cmluZyhtYXRjaFswXS5sZW5ndGgpXG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIHBhcnNlX3RyZWVcbiAgICB9XG5cbiAgICB2YXIgdnNwcmludGYgPSBmdW5jdGlvbihmbXQsIGFyZ3YsIF9hcmd2KSB7XG4gICAgICAgIF9hcmd2ID0gKGFyZ3YgfHwgW10pLnNsaWNlKDApXG4gICAgICAgIF9hcmd2LnNwbGljZSgwLCAwLCBmbXQpXG4gICAgICAgIHJldHVybiBzcHJpbnRmLmFwcGx5KG51bGwsIF9hcmd2KVxuICAgIH1cblxuICAgIC8qKlxuICAgICAqIGhlbHBlcnNcbiAgICAgKi9cbiAgICBmdW5jdGlvbiBnZXRfdHlwZSh2YXJpYWJsZSkge1xuICAgICAgICByZXR1cm4gT2JqZWN0LnByb3RvdHlwZS50b1N0cmluZy5jYWxsKHZhcmlhYmxlKS5zbGljZSg4LCAtMSkudG9Mb3dlckNhc2UoKVxuICAgIH1cblxuICAgIGZ1bmN0aW9uIHN0cl9yZXBlYXQoaW5wdXQsIG11bHRpcGxpZXIpIHtcbiAgICAgICAgcmV0dXJuIEFycmF5KG11bHRpcGxpZXIgKyAxKS5qb2luKGlucHV0KVxuICAgIH1cblxuICAgIC8qKlxuICAgICAqIGV4cG9ydCB0byBlaXRoZXIgYnJvd3NlciBvciBub2RlLmpzXG4gICAgICovXG4gICAgaWYgKHR5cGVvZiBleHBvcnRzICE9PSBcInVuZGVmaW5lZFwiKSB7XG4gICAgICAgIGV4cG9ydHMuc3ByaW50ZiA9IHNwcmludGZcbiAgICAgICAgZXhwb3J0cy52c3ByaW50ZiA9IHZzcHJpbnRmXG4gICAgfVxuICAgIGVsc2Uge1xuICAgICAgICB3aW5kb3cuc3ByaW50ZiA9IHNwcmludGZcbiAgICAgICAgd2luZG93LnZzcHJpbnRmID0gdnNwcmludGZcblxuICAgICAgICBpZiAodHlwZW9mIGRlZmluZSA9PT0gXCJmdW5jdGlvblwiICYmIGRlZmluZS5hbWQpIHtcbiAgICAgICAgICAgIGRlZmluZShmdW5jdGlvbigpIHtcbiAgICAgICAgICAgICAgICByZXR1cm4ge1xuICAgICAgICAgICAgICAgICAgICBzcHJpbnRmOiBzcHJpbnRmLFxuICAgICAgICAgICAgICAgICAgICB2c3ByaW50ZjogdnNwcmludGZcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9KVxuICAgICAgICB9XG4gICAgfVxufSkodHlwZW9mIHdpbmRvdyA9PT0gXCJ1bmRlZmluZWRcIiA/IHRoaXMgOiB3aW5kb3cpO1xuIiwidmFyIHRyaW0gPSByZXF1aXJlKCcuL3RyaW0nKTtcbnZhciBkZWNhcCA9IHJlcXVpcmUoJy4vZGVjYXBpdGFsaXplJyk7XG5cbm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24gY2FtZWxpemUoc3RyLCBkZWNhcGl0YWxpemUpIHtcbiAgc3RyID0gdHJpbShzdHIpLnJlcGxhY2UoL1stX1xcc10rKC4pPy9nLCBmdW5jdGlvbihtYXRjaCwgYykge1xuICAgIHJldHVybiBjID8gYy50b1VwcGVyQ2FzZSgpIDogJyc7XG4gIH0pO1xuXG4gIGlmIChkZWNhcGl0YWxpemUgPT09IHRydWUpIHtcbiAgICByZXR1cm4gZGVjYXAoc3RyKTtcbiAgfSBlbHNlIHtcbiAgICByZXR1cm4gc3RyO1xuICB9XG59O1xuIiwidmFyIG1ha2VTdHJpbmcgPSByZXF1aXJlKCcuL2hlbHBlci9tYWtlU3RyaW5nJyk7XG5cbm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24gY2FwaXRhbGl6ZShzdHIsIGxvd2VyY2FzZVJlc3QpIHtcbiAgc3RyID0gbWFrZVN0cmluZyhzdHIpO1xuICB2YXIgcmVtYWluaW5nQ2hhcnMgPSAhbG93ZXJjYXNlUmVzdCA/IHN0ci5zbGljZSgxKSA6IHN0ci5zbGljZSgxKS50b0xvd2VyQ2FzZSgpO1xuXG4gIHJldHVybiBzdHIuY2hhckF0KDApLnRvVXBwZXJDYXNlKCkgKyByZW1haW5pbmdDaGFycztcbn07XG4iLCJ2YXIgbWFrZVN0cmluZyA9IHJlcXVpcmUoJy4vaGVscGVyL21ha2VTdHJpbmcnKTtcblxubW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbiBjaGFycyhzdHIpIHtcbiAgcmV0dXJuIG1ha2VTdHJpbmcoc3RyKS5zcGxpdCgnJyk7XG59O1xuIiwibW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbiBjaG9wKHN0ciwgc3RlcCkge1xuICBpZiAoc3RyID09IG51bGwpIHJldHVybiBbXTtcbiAgc3RyID0gU3RyaW5nKHN0cik7XG4gIHN0ZXAgPSB+fnN0ZXA7XG4gIHJldHVybiBzdGVwID4gMCA/IHN0ci5tYXRjaChuZXcgUmVnRXhwKCcuezEsJyArIHN0ZXAgKyAnfScsICdnJykpIDogW3N0cl07XG59O1xuIiwidmFyIGNhcGl0YWxpemUgPSByZXF1aXJlKCcuL2NhcGl0YWxpemUnKTtcbnZhciBjYW1lbGl6ZSA9IHJlcXVpcmUoJy4vY2FtZWxpemUnKTtcbnZhciBtYWtlU3RyaW5nID0gcmVxdWlyZSgnLi9oZWxwZXIvbWFrZVN0cmluZycpO1xuXG5tb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uIGNsYXNzaWZ5KHN0cikge1xuICBzdHIgPSBtYWtlU3RyaW5nKHN0cik7XG4gIHJldHVybiBjYXBpdGFsaXplKGNhbWVsaXplKHN0ci5yZXBsYWNlKC9bXFxXX10vZywgJyAnKSkucmVwbGFjZSgvXFxzL2csICcnKSk7XG59O1xuIiwidmFyIHRyaW0gPSByZXF1aXJlKCcuL3RyaW0nKTtcblxubW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbiBjbGVhbihzdHIpIHtcbiAgcmV0dXJuIHRyaW0oc3RyKS5yZXBsYWNlKC9cXHNcXHMrL2csICcgJyk7XG59O1xuIiwiXG52YXIgbWFrZVN0cmluZyA9IHJlcXVpcmUoJy4vaGVscGVyL21ha2VTdHJpbmcnKTtcblxudmFyIGZyb20gID0gJ8SFw6DDocOkw6LDo8Olw6bEg8SHxI3EicSZw6jDqcOrw6rEncSlw6zDrcOvw67EtcWCxL7FhMWIw7LDs8O2xZHDtMO1w7DDuMWbyJnFn8WhxZ3FpcibxaPFrcO5w7rDvMWxw7vDscO/w73Dp8W8xbrFvicsXG4gIHRvICAgID0gJ2FhYWFhYWFhYWNjY2VlZWVlZ2hpaWlpamxsbm5vb29vb29vb3Nzc3NzdHR0dXV1dXV1bnl5Y3p6eic7XG5cbmZyb20gKz0gZnJvbS50b1VwcGVyQ2FzZSgpO1xudG8gKz0gdG8udG9VcHBlckNhc2UoKTtcblxudG8gPSB0by5zcGxpdCgnJyk7XG5cbi8vIGZvciB0b2tlbnMgcmVxdWlyZWluZyBtdWx0aXRva2VuIG91dHB1dFxuZnJvbSArPSAnw58nO1xudG8ucHVzaCgnc3MnKTtcblxuXG5tb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uIGNsZWFuRGlhY3JpdGljcyhzdHIpIHtcbiAgcmV0dXJuIG1ha2VTdHJpbmcoc3RyKS5yZXBsYWNlKC8uezF9L2csIGZ1bmN0aW9uKGMpe1xuICAgIHZhciBpbmRleCA9IGZyb20uaW5kZXhPZihjKTtcbiAgICByZXR1cm4gaW5kZXggPT09IC0xID8gYyA6IHRvW2luZGV4XTtcbiAgfSk7XG59O1xuIiwidmFyIG1ha2VTdHJpbmcgPSByZXF1aXJlKCcuL2hlbHBlci9tYWtlU3RyaW5nJyk7XG5cbm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24oc3RyLCBzdWJzdHIpIHtcbiAgc3RyID0gbWFrZVN0cmluZyhzdHIpO1xuICBzdWJzdHIgPSBtYWtlU3RyaW5nKHN1YnN0cik7XG5cbiAgaWYgKHN0ci5sZW5ndGggPT09IDAgfHwgc3Vic3RyLmxlbmd0aCA9PT0gMCkgcmV0dXJuIDA7XG4gIFxuICByZXR1cm4gc3RyLnNwbGl0KHN1YnN0cikubGVuZ3RoIC0gMTtcbn07XG4iLCJ2YXIgdHJpbSA9IHJlcXVpcmUoJy4vdHJpbScpO1xuXG5tb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uIGRhc2hlcml6ZShzdHIpIHtcbiAgcmV0dXJuIHRyaW0oc3RyKS5yZXBsYWNlKC8oW0EtWl0pL2csICctJDEnKS5yZXBsYWNlKC9bLV9cXHNdKy9nLCAnLScpLnRvTG93ZXJDYXNlKCk7XG59O1xuIiwidmFyIG1ha2VTdHJpbmcgPSByZXF1aXJlKCcuL2hlbHBlci9tYWtlU3RyaW5nJyk7XG5cbm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24gZGVjYXBpdGFsaXplKHN0cikge1xuICBzdHIgPSBtYWtlU3RyaW5nKHN0cik7XG4gIHJldHVybiBzdHIuY2hhckF0KDApLnRvTG93ZXJDYXNlKCkgKyBzdHIuc2xpY2UoMSk7XG59O1xuIiwidmFyIG1ha2VTdHJpbmcgPSByZXF1aXJlKCcuL2hlbHBlci9tYWtlU3RyaW5nJyk7XG5cbmZ1bmN0aW9uIGdldEluZGVudChzdHIpIHtcbiAgdmFyIG1hdGNoZXMgPSBzdHIubWF0Y2goL15bXFxzXFxcXHRdKi9nbSk7XG4gIHZhciBpbmRlbnQgPSBtYXRjaGVzWzBdLmxlbmd0aDtcbiAgXG4gIGZvciAodmFyIGkgPSAxOyBpIDwgbWF0Y2hlcy5sZW5ndGg7IGkrKykge1xuICAgIGluZGVudCA9IE1hdGgubWluKG1hdGNoZXNbaV0ubGVuZ3RoLCBpbmRlbnQpO1xuICB9XG5cbiAgcmV0dXJuIGluZGVudDtcbn1cblxubW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbiBkZWRlbnQoc3RyLCBwYXR0ZXJuKSB7XG4gIHN0ciA9IG1ha2VTdHJpbmcoc3RyKTtcbiAgdmFyIGluZGVudCA9IGdldEluZGVudChzdHIpO1xuICB2YXIgcmVnO1xuXG4gIGlmIChpbmRlbnQgPT09IDApIHJldHVybiBzdHI7XG5cbiAgaWYgKHR5cGVvZiBwYXR0ZXJuID09PSAnc3RyaW5nJykge1xuICAgIHJlZyA9IG5ldyBSZWdFeHAoJ14nICsgcGF0dGVybiwgJ2dtJyk7XG4gIH0gZWxzZSB7XG4gICAgcmVnID0gbmV3IFJlZ0V4cCgnXlsgXFxcXHRdeycgKyBpbmRlbnQgKyAnfScsICdnbScpO1xuICB9XG5cbiAgcmV0dXJuIHN0ci5yZXBsYWNlKHJlZywgJycpO1xufTtcbiIsInZhciBtYWtlU3RyaW5nID0gcmVxdWlyZSgnLi9oZWxwZXIvbWFrZVN0cmluZycpO1xudmFyIHRvUG9zaXRpdmUgPSByZXF1aXJlKCcuL2hlbHBlci90b1Bvc2l0aXZlJyk7XG5cbm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24gZW5kc1dpdGgoc3RyLCBlbmRzLCBwb3NpdGlvbikge1xuICBzdHIgPSBtYWtlU3RyaW5nKHN0cik7XG4gIGVuZHMgPSAnJyArIGVuZHM7XG4gIGlmICh0eXBlb2YgcG9zaXRpb24gPT0gJ3VuZGVmaW5lZCcpIHtcbiAgICBwb3NpdGlvbiA9IHN0ci5sZW5ndGggLSBlbmRzLmxlbmd0aDtcbiAgfSBlbHNlIHtcbiAgICBwb3NpdGlvbiA9IE1hdGgubWluKHRvUG9zaXRpdmUocG9zaXRpb24pLCBzdHIubGVuZ3RoKSAtIGVuZHMubGVuZ3RoO1xuICB9XG4gIHJldHVybiBwb3NpdGlvbiA+PSAwICYmIHN0ci5pbmRleE9mKGVuZHMsIHBvc2l0aW9uKSA9PT0gcG9zaXRpb247XG59O1xuIiwidmFyIG1ha2VTdHJpbmcgPSByZXF1aXJlKCcuL2hlbHBlci9tYWtlU3RyaW5nJyk7XG52YXIgZXNjYXBlQ2hhcnMgPSByZXF1aXJlKCcuL2hlbHBlci9lc2NhcGVDaGFycycpO1xuXG52YXIgcmVnZXhTdHJpbmcgPSAnWyc7XG5mb3IodmFyIGtleSBpbiBlc2NhcGVDaGFycykge1xuICByZWdleFN0cmluZyArPSBrZXk7XG59XG5yZWdleFN0cmluZyArPSAnXSc7XG5cbnZhciByZWdleCA9IG5ldyBSZWdFeHAoIHJlZ2V4U3RyaW5nLCAnZycpO1xuXG5tb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uIGVzY2FwZUhUTUwoc3RyKSB7XG5cbiAgcmV0dXJuIG1ha2VTdHJpbmcoc3RyKS5yZXBsYWNlKHJlZ2V4LCBmdW5jdGlvbihtKSB7XG4gICAgcmV0dXJuICcmJyArIGVzY2FwZUNoYXJzW21dICsgJzsnO1xuICB9KTtcbn07XG4iLCJtb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uKCkge1xuICB2YXIgcmVzdWx0ID0ge307XG5cbiAgZm9yICh2YXIgcHJvcCBpbiB0aGlzKSB7XG4gICAgaWYgKCF0aGlzLmhhc093blByb3BlcnR5KHByb3ApIHx8IHByb3AubWF0Y2goL14oPzppbmNsdWRlfGNvbnRhaW5zfHJldmVyc2V8am9pbnxtYXB8d3JhcCkkLykpIGNvbnRpbnVlO1xuICAgIHJlc3VsdFtwcm9wXSA9IHRoaXNbcHJvcF07XG4gIH1cblxuICByZXR1cm4gcmVzdWx0O1xufTtcbiIsInZhciBtYWtlU3RyaW5nID0gcmVxdWlyZSgnLi9tYWtlU3RyaW5nJyk7XG5cbm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24gYWRqYWNlbnQoc3RyLCBkaXJlY3Rpb24pIHtcbiAgc3RyID0gbWFrZVN0cmluZyhzdHIpO1xuICBpZiAoc3RyLmxlbmd0aCA9PT0gMCkge1xuICAgIHJldHVybiAnJztcbiAgfVxuICByZXR1cm4gc3RyLnNsaWNlKDAsIC0xKSArIFN0cmluZy5mcm9tQ2hhckNvZGUoc3RyLmNoYXJDb2RlQXQoc3RyLmxlbmd0aCAtIDEpICsgZGlyZWN0aW9uKTtcbn07XG4iLCJ2YXIgZXNjYXBlUmVnRXhwID0gcmVxdWlyZSgnLi9lc2NhcGVSZWdFeHAnKTtcblxubW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbiBkZWZhdWx0VG9XaGl0ZVNwYWNlKGNoYXJhY3RlcnMpIHtcbiAgaWYgKGNoYXJhY3RlcnMgPT0gbnVsbClcbiAgICByZXR1cm4gJ1xcXFxzJztcbiAgZWxzZSBpZiAoY2hhcmFjdGVycy5zb3VyY2UpXG4gICAgcmV0dXJuIGNoYXJhY3RlcnMuc291cmNlO1xuICBlbHNlXG4gICAgcmV0dXJuICdbJyArIGVzY2FwZVJlZ0V4cChjaGFyYWN0ZXJzKSArICddJztcbn07XG4iLCIvKiBXZSdyZSBleHBsaWNpdGx5IGRlZmluaW5nIHRoZSBsaXN0IG9mIGVudGl0aWVzIHdlIHdhbnQgdG8gZXNjYXBlLlxubmJzcCBpcyBhbiBIVE1MIGVudGl0eSwgYnV0IHdlIGRvbid0IHdhbnQgdG8gZXNjYXBlIGFsbCBzcGFjZSBjaGFyYWN0ZXJzIGluIGEgc3RyaW5nLCBoZW5jZSBpdHMgb21pc3Npb24gaW4gdGhpcyBtYXAuXG5cbiovXG52YXIgZXNjYXBlQ2hhcnMgPSB7XG4gICfCoicgOiAnY2VudCcsXG4gICfCoycgOiAncG91bmQnLFxuICAnwqUnIDogJ3llbicsXG4gICfigqwnOiAnZXVybycsXG4gICfCqScgOidjb3B5JyxcbiAgJ8KuJyA6ICdyZWcnLFxuICAnPCcgOiAnbHQnLFxuICAnPicgOiAnZ3QnLFxuICAnXCInIDogJ3F1b3QnLFxuICAnJicgOiAnYW1wJyxcbiAgJ1xcJycgOiAnIzM5J1xufTtcblxubW9kdWxlLmV4cG9ydHMgPSBlc2NhcGVDaGFycztcbiIsInZhciBtYWtlU3RyaW5nID0gcmVxdWlyZSgnLi9tYWtlU3RyaW5nJyk7XG5cbm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24gZXNjYXBlUmVnRXhwKHN0cikge1xuICByZXR1cm4gbWFrZVN0cmluZyhzdHIpLnJlcGxhY2UoLyhbLiorP149IToke30oKXxbXFxdXFwvXFxcXF0pL2csICdcXFxcJDEnKTtcbn07XG4iLCIvKlxuV2UncmUgZXhwbGljaXRseSBkZWZpbmluZyB0aGUgbGlzdCBvZiBlbnRpdGllcyB0aGF0IG1pZ2h0IHNlZSBpbiBlc2NhcGUgSFRNTCBzdHJpbmdzXG4qL1xudmFyIGh0bWxFbnRpdGllcyA9IHtcbiAgbmJzcDogJyAnLFxuICBjZW50OiAnwqInLFxuICBwb3VuZDogJ8KjJyxcbiAgeWVuOiAnwqUnLFxuICBldXJvOiAn4oKsJyxcbiAgY29weTogJ8KpJyxcbiAgcmVnOiAnwq4nLFxuICBsdDogJzwnLFxuICBndDogJz4nLFxuICBxdW90OiAnXCInLFxuICBhbXA6ICcmJyxcbiAgYXBvczogJ1xcJydcbn07XG5cbm1vZHVsZS5leHBvcnRzID0gaHRtbEVudGl0aWVzO1xuIiwiLyoqXG4gKiBFbnN1cmUgc29tZSBvYmplY3QgaXMgYSBjb2VyY2VkIHRvIGEgc3RyaW5nXG4gKiovXG5tb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uIG1ha2VTdHJpbmcob2JqZWN0KSB7XG4gIGlmIChvYmplY3QgPT0gbnVsbCkgcmV0dXJuICcnO1xuICByZXR1cm4gJycgKyBvYmplY3Q7XG59O1xuIiwibW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbiBzdHJSZXBlYXQoc3RyLCBxdHkpe1xuICBpZiAocXR5IDwgMSkgcmV0dXJuICcnO1xuICB2YXIgcmVzdWx0ID0gJyc7XG4gIHdoaWxlIChxdHkgPiAwKSB7XG4gICAgaWYgKHF0eSAmIDEpIHJlc3VsdCArPSBzdHI7XG4gICAgcXR5ID4+PSAxLCBzdHIgKz0gc3RyO1xuICB9XG4gIHJldHVybiByZXN1bHQ7XG59O1xuIiwibW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbiB0b1Bvc2l0aXZlKG51bWJlcikge1xuICByZXR1cm4gbnVtYmVyIDwgMCA/IDAgOiAoK251bWJlciB8fCAwKTtcbn07XG4iLCJ2YXIgY2FwaXRhbGl6ZSA9IHJlcXVpcmUoJy4vY2FwaXRhbGl6ZScpO1xudmFyIHVuZGVyc2NvcmVkID0gcmVxdWlyZSgnLi91bmRlcnNjb3JlZCcpO1xudmFyIHRyaW0gPSByZXF1aXJlKCcuL3RyaW0nKTtcblxubW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbiBodW1hbml6ZShzdHIpIHtcbiAgcmV0dXJuIGNhcGl0YWxpemUodHJpbSh1bmRlcnNjb3JlZChzdHIpLnJlcGxhY2UoL19pZCQvLCAnJykucmVwbGFjZSgvXy9nLCAnICcpKSk7XG59O1xuIiwidmFyIG1ha2VTdHJpbmcgPSByZXF1aXJlKCcuL2hlbHBlci9tYWtlU3RyaW5nJyk7XG5cbm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24gaW5jbHVkZShzdHIsIG5lZWRsZSkge1xuICBpZiAobmVlZGxlID09PSAnJykgcmV0dXJuIHRydWU7XG4gIHJldHVybiBtYWtlU3RyaW5nKHN0cikuaW5kZXhPZihuZWVkbGUpICE9PSAtMTtcbn07XG4iLCIvKlxuKiBVbmRlcnNjb3JlLnN0cmluZ1xuKiAoYykgMjAxMCBFc2EtTWF0dGkgU3V1cm9uZW4gPGVzYS1tYXR0aSBhZXQgc3V1cm9uZW4gZG90IG9yZz5cbiogVW5kZXJzY29yZS5zdHJpbmcgaXMgZnJlZWx5IGRpc3RyaWJ1dGFibGUgdW5kZXIgdGhlIHRlcm1zIG9mIHRoZSBNSVQgbGljZW5zZS5cbiogRG9jdW1lbnRhdGlvbjogaHR0cHM6Ly9naXRodWIuY29tL2VwZWxpL3VuZGVyc2NvcmUuc3RyaW5nXG4qIFNvbWUgY29kZSBpcyBib3Jyb3dlZCBmcm9tIE1vb1Rvb2xzIGFuZCBBbGV4YW5kcnUgTWFyYXN0ZWFudS5cbiogVmVyc2lvbiAnMy4zLjQnXG4qIEBwcmVzZXJ2ZVxuKi9cblxuJ3VzZSBzdHJpY3QnO1xuXG5mdW5jdGlvbiBzKHZhbHVlKSB7XG4gIC8qIGpzaGludCB2YWxpZHRoaXM6IHRydWUgKi9cbiAgaWYgKCEodGhpcyBpbnN0YW5jZW9mIHMpKSByZXR1cm4gbmV3IHModmFsdWUpO1xuICB0aGlzLl93cmFwcGVkID0gdmFsdWU7XG59XG5cbnMuVkVSU0lPTiA9ICczLjMuNCc7XG5cbnMuaXNCbGFuayAgICAgICAgICA9IHJlcXVpcmUoJy4vaXNCbGFuaycpO1xucy5zdHJpcFRhZ3MgICAgICAgID0gcmVxdWlyZSgnLi9zdHJpcFRhZ3MnKTtcbnMuY2FwaXRhbGl6ZSAgICAgICA9IHJlcXVpcmUoJy4vY2FwaXRhbGl6ZScpO1xucy5kZWNhcGl0YWxpemUgICAgID0gcmVxdWlyZSgnLi9kZWNhcGl0YWxpemUnKTtcbnMuY2hvcCAgICAgICAgICAgICA9IHJlcXVpcmUoJy4vY2hvcCcpO1xucy50cmltICAgICAgICAgICAgID0gcmVxdWlyZSgnLi90cmltJyk7XG5zLmNsZWFuICAgICAgICAgICAgPSByZXF1aXJlKCcuL2NsZWFuJyk7XG5zLmNsZWFuRGlhY3JpdGljcyAgPSByZXF1aXJlKCcuL2NsZWFuRGlhY3JpdGljcycpO1xucy5jb3VudCAgICAgICAgICAgID0gcmVxdWlyZSgnLi9jb3VudCcpO1xucy5jaGFycyAgICAgICAgICAgID0gcmVxdWlyZSgnLi9jaGFycycpO1xucy5zd2FwQ2FzZSAgICAgICAgID0gcmVxdWlyZSgnLi9zd2FwQ2FzZScpO1xucy5lc2NhcGVIVE1MICAgICAgID0gcmVxdWlyZSgnLi9lc2NhcGVIVE1MJyk7XG5zLnVuZXNjYXBlSFRNTCAgICAgPSByZXF1aXJlKCcuL3VuZXNjYXBlSFRNTCcpO1xucy5zcGxpY2UgICAgICAgICAgID0gcmVxdWlyZSgnLi9zcGxpY2UnKTtcbnMuaW5zZXJ0ICAgICAgICAgICA9IHJlcXVpcmUoJy4vaW5zZXJ0Jyk7XG5zLnJlcGxhY2VBbGwgICAgICAgPSByZXF1aXJlKCcuL3JlcGxhY2VBbGwnKTtcbnMuaW5jbHVkZSAgICAgICAgICA9IHJlcXVpcmUoJy4vaW5jbHVkZScpO1xucy5qb2luICAgICAgICAgICAgID0gcmVxdWlyZSgnLi9qb2luJyk7XG5zLmxpbmVzICAgICAgICAgICAgPSByZXF1aXJlKCcuL2xpbmVzJyk7XG5zLmRlZGVudCAgICAgICAgICAgPSByZXF1aXJlKCcuL2RlZGVudCcpO1xucy5yZXZlcnNlICAgICAgICAgID0gcmVxdWlyZSgnLi9yZXZlcnNlJyk7XG5zLnN0YXJ0c1dpdGggICAgICAgPSByZXF1aXJlKCcuL3N0YXJ0c1dpdGgnKTtcbnMuZW5kc1dpdGggICAgICAgICA9IHJlcXVpcmUoJy4vZW5kc1dpdGgnKTtcbnMucHJlZCAgICAgICAgICAgICA9IHJlcXVpcmUoJy4vcHJlZCcpO1xucy5zdWNjICAgICAgICAgICAgID0gcmVxdWlyZSgnLi9zdWNjJyk7XG5zLnRpdGxlaXplICAgICAgICAgPSByZXF1aXJlKCcuL3RpdGxlaXplJyk7XG5zLmNhbWVsaXplICAgICAgICAgPSByZXF1aXJlKCcuL2NhbWVsaXplJyk7XG5zLnVuZGVyc2NvcmVkICAgICAgPSByZXF1aXJlKCcuL3VuZGVyc2NvcmVkJyk7XG5zLmRhc2hlcml6ZSAgICAgICAgPSByZXF1aXJlKCcuL2Rhc2hlcml6ZScpO1xucy5jbGFzc2lmeSAgICAgICAgID0gcmVxdWlyZSgnLi9jbGFzc2lmeScpO1xucy5odW1hbml6ZSAgICAgICAgID0gcmVxdWlyZSgnLi9odW1hbml6ZScpO1xucy5sdHJpbSAgICAgICAgICAgID0gcmVxdWlyZSgnLi9sdHJpbScpO1xucy5ydHJpbSAgICAgICAgICAgID0gcmVxdWlyZSgnLi9ydHJpbScpO1xucy50cnVuY2F0ZSAgICAgICAgID0gcmVxdWlyZSgnLi90cnVuY2F0ZScpO1xucy5wcnVuZSAgICAgICAgICAgID0gcmVxdWlyZSgnLi9wcnVuZScpO1xucy53b3JkcyAgICAgICAgICAgID0gcmVxdWlyZSgnLi93b3JkcycpO1xucy5wYWQgICAgICAgICAgICAgID0gcmVxdWlyZSgnLi9wYWQnKTtcbnMubHBhZCAgICAgICAgICAgICA9IHJlcXVpcmUoJy4vbHBhZCcpO1xucy5ycGFkICAgICAgICAgICAgID0gcmVxdWlyZSgnLi9ycGFkJyk7XG5zLmxycGFkICAgICAgICAgICAgPSByZXF1aXJlKCcuL2xycGFkJyk7XG5zLnNwcmludGYgICAgICAgICAgPSByZXF1aXJlKCcuL3NwcmludGYnKTtcbnMudnNwcmludGYgICAgICAgICA9IHJlcXVpcmUoJy4vdnNwcmludGYnKTtcbnMudG9OdW1iZXIgICAgICAgICA9IHJlcXVpcmUoJy4vdG9OdW1iZXInKTtcbnMubnVtYmVyRm9ybWF0ICAgICA9IHJlcXVpcmUoJy4vbnVtYmVyRm9ybWF0Jyk7XG5zLnN0clJpZ2h0ICAgICAgICAgPSByZXF1aXJlKCcuL3N0clJpZ2h0Jyk7XG5zLnN0clJpZ2h0QmFjayAgICAgPSByZXF1aXJlKCcuL3N0clJpZ2h0QmFjaycpO1xucy5zdHJMZWZ0ICAgICAgICAgID0gcmVxdWlyZSgnLi9zdHJMZWZ0Jyk7XG5zLnN0ckxlZnRCYWNrICAgICAgPSByZXF1aXJlKCcuL3N0ckxlZnRCYWNrJyk7XG5zLnRvU2VudGVuY2UgICAgICAgPSByZXF1aXJlKCcuL3RvU2VudGVuY2UnKTtcbnMudG9TZW50ZW5jZVNlcmlhbCA9IHJlcXVpcmUoJy4vdG9TZW50ZW5jZVNlcmlhbCcpO1xucy5zbHVnaWZ5ICAgICAgICAgID0gcmVxdWlyZSgnLi9zbHVnaWZ5Jyk7XG5zLnN1cnJvdW5kICAgICAgICAgPSByZXF1aXJlKCcuL3N1cnJvdW5kJyk7XG5zLnF1b3RlICAgICAgICAgICAgPSByZXF1aXJlKCcuL3F1b3RlJyk7XG5zLnVucXVvdGUgICAgICAgICAgPSByZXF1aXJlKCcuL3VucXVvdGUnKTtcbnMucmVwZWF0ICAgICAgICAgICA9IHJlcXVpcmUoJy4vcmVwZWF0Jyk7XG5zLm5hdHVyYWxDbXAgICAgICAgPSByZXF1aXJlKCcuL25hdHVyYWxDbXAnKTtcbnMubGV2ZW5zaHRlaW4gICAgICA9IHJlcXVpcmUoJy4vbGV2ZW5zaHRlaW4nKTtcbnMudG9Cb29sZWFuICAgICAgICA9IHJlcXVpcmUoJy4vdG9Cb29sZWFuJyk7XG5zLmV4cG9ydHMgICAgICAgICAgPSByZXF1aXJlKCcuL2V4cG9ydHMnKTtcbnMuZXNjYXBlUmVnRXhwICAgICA9IHJlcXVpcmUoJy4vaGVscGVyL2VzY2FwZVJlZ0V4cCcpO1xucy53cmFwICAgICAgICAgICAgID0gcmVxdWlyZSgnLi93cmFwJyk7XG5zLm1hcCAgICAgICAgICAgICAgPSByZXF1aXJlKCcuL21hcCcpO1xuXG4vLyBBbGlhc2VzXG5zLnN0cmlwICAgICA9IHMudHJpbTtcbnMubHN0cmlwICAgID0gcy5sdHJpbTtcbnMucnN0cmlwICAgID0gcy5ydHJpbTtcbnMuY2VudGVyICAgID0gcy5scnBhZDtcbnMucmp1c3QgICAgID0gcy5scGFkO1xucy5sanVzdCAgICAgPSBzLnJwYWQ7XG5zLmNvbnRhaW5zICA9IHMuaW5jbHVkZTtcbnMucSAgICAgICAgID0gcy5xdW90ZTtcbnMudG9Cb29sICAgID0gcy50b0Jvb2xlYW47XG5zLmNhbWVsY2FzZSA9IHMuY2FtZWxpemU7XG5zLm1hcENoYXJzICA9IHMubWFwO1xuXG5cbi8vIEltcGxlbWVudCBjaGFpbmluZ1xucy5wcm90b3R5cGUgPSB7XG4gIHZhbHVlOiBmdW5jdGlvbiB2YWx1ZSgpIHtcbiAgICByZXR1cm4gdGhpcy5fd3JhcHBlZDtcbiAgfVxufTtcblxuZnVuY3Rpb24gZm4ybWV0aG9kKGtleSwgZm4pIHtcbiAgaWYgKHR5cGVvZiBmbiAhPT0gJ2Z1bmN0aW9uJykgcmV0dXJuO1xuICBzLnByb3RvdHlwZVtrZXldID0gZnVuY3Rpb24oKSB7XG4gICAgdmFyIGFyZ3MgPSBbdGhpcy5fd3JhcHBlZF0uY29uY2F0KEFycmF5LnByb3RvdHlwZS5zbGljZS5jYWxsKGFyZ3VtZW50cykpO1xuICAgIHZhciByZXMgPSBmbi5hcHBseShudWxsLCBhcmdzKTtcbiAgICAvLyBpZiB0aGUgcmVzdWx0IGlzIG5vbi1zdHJpbmcgc3RvcCB0aGUgY2hhaW4gYW5kIHJldHVybiB0aGUgdmFsdWVcbiAgICByZXR1cm4gdHlwZW9mIHJlcyA9PT0gJ3N0cmluZycgPyBuZXcgcyhyZXMpIDogcmVzO1xuICB9O1xufVxuXG4vLyBDb3B5IGZ1bmN0aW9ucyB0byBpbnN0YW5jZSBtZXRob2RzIGZvciBjaGFpbmluZ1xuZm9yICh2YXIga2V5IGluIHMpIGZuMm1ldGhvZChrZXksIHNba2V5XSk7XG5cbmZuMm1ldGhvZCgndGFwJywgZnVuY3Rpb24gdGFwKHN0cmluZywgZm4pIHtcbiAgcmV0dXJuIGZuKHN0cmluZyk7XG59KTtcblxuZnVuY3Rpb24gcHJvdG90eXBlMm1ldGhvZChtZXRob2ROYW1lKSB7XG4gIGZuMm1ldGhvZChtZXRob2ROYW1lLCBmdW5jdGlvbihjb250ZXh0KSB7XG4gICAgdmFyIGFyZ3MgPSBBcnJheS5wcm90b3R5cGUuc2xpY2UuY2FsbChhcmd1bWVudHMsIDEpO1xuICAgIHJldHVybiBTdHJpbmcucHJvdG90eXBlW21ldGhvZE5hbWVdLmFwcGx5KGNvbnRleHQsIGFyZ3MpO1xuICB9KTtcbn1cblxudmFyIHByb3RvdHlwZU1ldGhvZHMgPSBbXG4gICd0b1VwcGVyQ2FzZScsXG4gICd0b0xvd2VyQ2FzZScsXG4gICdzcGxpdCcsXG4gICdyZXBsYWNlJyxcbiAgJ3NsaWNlJyxcbiAgJ3N1YnN0cmluZycsXG4gICdzdWJzdHInLFxuICAnY29uY2F0J1xuXTtcblxuZm9yICh2YXIgbWV0aG9kIGluIHByb3RvdHlwZU1ldGhvZHMpIHByb3RvdHlwZTJtZXRob2QocHJvdG90eXBlTWV0aG9kc1ttZXRob2RdKTtcblxuXG5tb2R1bGUuZXhwb3J0cyA9IHM7XG4iLCJ2YXIgc3BsaWNlID0gcmVxdWlyZSgnLi9zcGxpY2UnKTtcblxubW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbiBpbnNlcnQoc3RyLCBpLCBzdWJzdHIpIHtcbiAgcmV0dXJuIHNwbGljZShzdHIsIGksIDAsIHN1YnN0cik7XG59O1xuIiwidmFyIG1ha2VTdHJpbmcgPSByZXF1aXJlKCcuL2hlbHBlci9tYWtlU3RyaW5nJyk7XG5cbm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24gaXNCbGFuayhzdHIpIHtcbiAgcmV0dXJuICgvXlxccyokLykudGVzdChtYWtlU3RyaW5nKHN0cikpO1xufTtcbiIsInZhciBtYWtlU3RyaW5nID0gcmVxdWlyZSgnLi9oZWxwZXIvbWFrZVN0cmluZycpO1xudmFyIHNsaWNlID0gW10uc2xpY2U7XG5cbm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24gam9pbigpIHtcbiAgdmFyIGFyZ3MgPSBzbGljZS5jYWxsKGFyZ3VtZW50cyksXG4gICAgc2VwYXJhdG9yID0gYXJncy5zaGlmdCgpO1xuXG4gIHJldHVybiBhcmdzLmpvaW4obWFrZVN0cmluZyhzZXBhcmF0b3IpKTtcbn07XG4iLCJ2YXIgbWFrZVN0cmluZyA9IHJlcXVpcmUoJy4vaGVscGVyL21ha2VTdHJpbmcnKTtcblxuLyoqXG4gKiBCYXNlZCBvbiB0aGUgaW1wbGVtZW50YXRpb24gaGVyZTogaHR0cHM6Ly9naXRodWIuY29tL2hpZGRlbnRhby9mYXN0LWxldmVuc2h0ZWluXG4gKi9cbm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24gbGV2ZW5zaHRlaW4oc3RyMSwgc3RyMikge1xuICAndXNlIHN0cmljdCc7XG4gIHN0cjEgPSBtYWtlU3RyaW5nKHN0cjEpO1xuICBzdHIyID0gbWFrZVN0cmluZyhzdHIyKTtcblxuICAvLyBTaG9ydCBjdXQgY2FzZXMgIFxuICBpZiAoc3RyMSA9PT0gc3RyMikgcmV0dXJuIDA7XG4gIGlmICghc3RyMSB8fCAhc3RyMikgcmV0dXJuIE1hdGgubWF4KHN0cjEubGVuZ3RoLCBzdHIyLmxlbmd0aCk7XG5cbiAgLy8gdHdvIHJvd3NcbiAgdmFyIHByZXZSb3cgPSBuZXcgQXJyYXkoc3RyMi5sZW5ndGggKyAxKTtcblxuICAvLyBpbml0aWFsaXNlIHByZXZpb3VzIHJvd1xuICBmb3IgKHZhciBpID0gMDsgaSA8IHByZXZSb3cubGVuZ3RoOyArK2kpIHtcbiAgICBwcmV2Um93W2ldID0gaTtcbiAgfVxuXG4gIC8vIGNhbGN1bGF0ZSBjdXJyZW50IHJvdyBkaXN0YW5jZSBmcm9tIHByZXZpb3VzIHJvd1xuICBmb3IgKGkgPSAwOyBpIDwgc3RyMS5sZW5ndGg7ICsraSkge1xuICAgIHZhciBuZXh0Q29sID0gaSArIDE7XG5cbiAgICBmb3IgKHZhciBqID0gMDsgaiA8IHN0cjIubGVuZ3RoOyArK2opIHtcbiAgICAgIHZhciBjdXJDb2wgPSBuZXh0Q29sO1xuXG4gICAgICAvLyBzdWJzdHV0aW9uXG4gICAgICBuZXh0Q29sID0gcHJldlJvd1tqXSArICggKHN0cjEuY2hhckF0KGkpID09PSBzdHIyLmNoYXJBdChqKSkgPyAwIDogMSApO1xuICAgICAgLy8gaW5zZXJ0aW9uXG4gICAgICB2YXIgdG1wID0gY3VyQ29sICsgMTtcbiAgICAgIGlmIChuZXh0Q29sID4gdG1wKSB7XG4gICAgICAgIG5leHRDb2wgPSB0bXA7XG4gICAgICB9XG4gICAgICAvLyBkZWxldGlvblxuICAgICAgdG1wID0gcHJldlJvd1tqICsgMV0gKyAxO1xuICAgICAgaWYgKG5leHRDb2wgPiB0bXApIHtcbiAgICAgICAgbmV4dENvbCA9IHRtcDtcbiAgICAgIH1cblxuICAgICAgLy8gY29weSBjdXJyZW50IGNvbCB2YWx1ZSBpbnRvIHByZXZpb3VzIChpbiBwcmVwYXJhdGlvbiBmb3IgbmV4dCBpdGVyYXRpb24pXG4gICAgICBwcmV2Um93W2pdID0gY3VyQ29sO1xuICAgIH1cblxuICAgIC8vIGNvcHkgbGFzdCBjb2wgdmFsdWUgaW50byBwcmV2aW91cyAoaW4gcHJlcGFyYXRpb24gZm9yIG5leHQgaXRlcmF0aW9uKVxuICAgIHByZXZSb3dbal0gPSBuZXh0Q29sO1xuICB9XG5cbiAgcmV0dXJuIG5leHRDb2w7XG59O1xuIiwibW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbiBsaW5lcyhzdHIpIHtcbiAgaWYgKHN0ciA9PSBudWxsKSByZXR1cm4gW107XG4gIHJldHVybiBTdHJpbmcoc3RyKS5zcGxpdCgvXFxyXFxuP3xcXG4vKTtcbn07XG4iLCJ2YXIgcGFkID0gcmVxdWlyZSgnLi9wYWQnKTtcblxubW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbiBscGFkKHN0ciwgbGVuZ3RoLCBwYWRTdHIpIHtcbiAgcmV0dXJuIHBhZChzdHIsIGxlbmd0aCwgcGFkU3RyKTtcbn07XG4iLCJ2YXIgcGFkID0gcmVxdWlyZSgnLi9wYWQnKTtcblxubW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbiBscnBhZChzdHIsIGxlbmd0aCwgcGFkU3RyKSB7XG4gIHJldHVybiBwYWQoc3RyLCBsZW5ndGgsIHBhZFN0ciwgJ2JvdGgnKTtcbn07XG4iLCJ2YXIgbWFrZVN0cmluZyA9IHJlcXVpcmUoJy4vaGVscGVyL21ha2VTdHJpbmcnKTtcbnZhciBkZWZhdWx0VG9XaGl0ZVNwYWNlID0gcmVxdWlyZSgnLi9oZWxwZXIvZGVmYXVsdFRvV2hpdGVTcGFjZScpO1xudmFyIG5hdGl2ZVRyaW1MZWZ0ID0gU3RyaW5nLnByb3RvdHlwZS50cmltTGVmdDtcblxubW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbiBsdHJpbShzdHIsIGNoYXJhY3RlcnMpIHtcbiAgc3RyID0gbWFrZVN0cmluZyhzdHIpO1xuICBpZiAoIWNoYXJhY3RlcnMgJiYgbmF0aXZlVHJpbUxlZnQpIHJldHVybiBuYXRpdmVUcmltTGVmdC5jYWxsKHN0cik7XG4gIGNoYXJhY3RlcnMgPSBkZWZhdWx0VG9XaGl0ZVNwYWNlKGNoYXJhY3RlcnMpO1xuICByZXR1cm4gc3RyLnJlcGxhY2UobmV3IFJlZ0V4cCgnXicgKyBjaGFyYWN0ZXJzICsgJysnKSwgJycpO1xufTtcbiIsInZhciBtYWtlU3RyaW5nID0gcmVxdWlyZSgnLi9oZWxwZXIvbWFrZVN0cmluZycpO1xuXG5tb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uKHN0ciwgY2FsbGJhY2spIHtcbiAgc3RyID0gbWFrZVN0cmluZyhzdHIpO1xuXG4gIGlmIChzdHIubGVuZ3RoID09PSAwIHx8IHR5cGVvZiBjYWxsYmFjayAhPT0gJ2Z1bmN0aW9uJykgcmV0dXJuIHN0cjtcblxuICByZXR1cm4gc3RyLnJlcGxhY2UoLy4vZywgY2FsbGJhY2spO1xufTtcbiIsIm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24gbmF0dXJhbENtcChzdHIxLCBzdHIyKSB7XG4gIGlmIChzdHIxID09IHN0cjIpIHJldHVybiAwO1xuICBpZiAoIXN0cjEpIHJldHVybiAtMTtcbiAgaWYgKCFzdHIyKSByZXR1cm4gMTtcblxuICB2YXIgY21wUmVnZXggPSAvKFxcLlxcZCt8XFxkK3xcXEQrKS9nLFxuICAgIHRva2VuczEgPSBTdHJpbmcoc3RyMSkubWF0Y2goY21wUmVnZXgpLFxuICAgIHRva2VuczIgPSBTdHJpbmcoc3RyMikubWF0Y2goY21wUmVnZXgpLFxuICAgIGNvdW50ID0gTWF0aC5taW4odG9rZW5zMS5sZW5ndGgsIHRva2VuczIubGVuZ3RoKTtcblxuICBmb3IgKHZhciBpID0gMDsgaSA8IGNvdW50OyBpKyspIHtcbiAgICB2YXIgYSA9IHRva2VuczFbaV0sXG4gICAgICBiID0gdG9rZW5zMltpXTtcblxuICAgIGlmIChhICE9PSBiKSB7XG4gICAgICB2YXIgbnVtMSA9ICthO1xuICAgICAgdmFyIG51bTIgPSArYjtcbiAgICAgIGlmIChudW0xID09PSBudW0xICYmIG51bTIgPT09IG51bTIpIHtcbiAgICAgICAgcmV0dXJuIG51bTEgPiBudW0yID8gMSA6IC0xO1xuICAgICAgfVxuICAgICAgcmV0dXJuIGEgPCBiID8gLTEgOiAxO1xuICAgIH1cbiAgfVxuXG4gIGlmICh0b2tlbnMxLmxlbmd0aCAhPSB0b2tlbnMyLmxlbmd0aClcbiAgICByZXR1cm4gdG9rZW5zMS5sZW5ndGggLSB0b2tlbnMyLmxlbmd0aDtcblxuICByZXR1cm4gc3RyMSA8IHN0cjIgPyAtMSA6IDE7XG59O1xuIiwibW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbiBudW1iZXJGb3JtYXQobnVtYmVyLCBkZWMsIGRzZXAsIHRzZXApIHtcbiAgaWYgKGlzTmFOKG51bWJlcikgfHwgbnVtYmVyID09IG51bGwpIHJldHVybiAnJztcblxuICBudW1iZXIgPSBudW1iZXIudG9GaXhlZCh+fmRlYyk7XG4gIHRzZXAgPSB0eXBlb2YgdHNlcCA9PSAnc3RyaW5nJyA/IHRzZXAgOiAnLCc7XG5cbiAgdmFyIHBhcnRzID0gbnVtYmVyLnNwbGl0KCcuJyksXG4gICAgZm51bXMgPSBwYXJ0c1swXSxcbiAgICBkZWNpbWFscyA9IHBhcnRzWzFdID8gKGRzZXAgfHwgJy4nKSArIHBhcnRzWzFdIDogJyc7XG5cbiAgcmV0dXJuIGZudW1zLnJlcGxhY2UoLyhcXGQpKD89KD86XFxkezN9KSskKS9nLCAnJDEnICsgdHNlcCkgKyBkZWNpbWFscztcbn07XG4iLCJ2YXIgbWFrZVN0cmluZyA9IHJlcXVpcmUoJy4vaGVscGVyL21ha2VTdHJpbmcnKTtcbnZhciBzdHJSZXBlYXQgPSByZXF1aXJlKCcuL2hlbHBlci9zdHJSZXBlYXQnKTtcblxubW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbiBwYWQoc3RyLCBsZW5ndGgsIHBhZFN0ciwgdHlwZSkge1xuICBzdHIgPSBtYWtlU3RyaW5nKHN0cik7XG4gIGxlbmd0aCA9IH5+bGVuZ3RoO1xuXG4gIHZhciBwYWRsZW4gPSAwO1xuXG4gIGlmICghcGFkU3RyKVxuICAgIHBhZFN0ciA9ICcgJztcbiAgZWxzZSBpZiAocGFkU3RyLmxlbmd0aCA+IDEpXG4gICAgcGFkU3RyID0gcGFkU3RyLmNoYXJBdCgwKTtcblxuICBzd2l0Y2ggKHR5cGUpIHtcbiAgY2FzZSAncmlnaHQnOlxuICAgIHBhZGxlbiA9IGxlbmd0aCAtIHN0ci5sZW5ndGg7XG4gICAgcmV0dXJuIHN0ciArIHN0clJlcGVhdChwYWRTdHIsIHBhZGxlbik7XG4gIGNhc2UgJ2JvdGgnOlxuICAgIHBhZGxlbiA9IGxlbmd0aCAtIHN0ci5sZW5ndGg7XG4gICAgcmV0dXJuIHN0clJlcGVhdChwYWRTdHIsIE1hdGguY2VpbChwYWRsZW4gLyAyKSkgKyBzdHIgKyBzdHJSZXBlYXQocGFkU3RyLCBNYXRoLmZsb29yKHBhZGxlbiAvIDIpKTtcbiAgZGVmYXVsdDogLy8gJ2xlZnQnXG4gICAgcGFkbGVuID0gbGVuZ3RoIC0gc3RyLmxlbmd0aDtcbiAgICByZXR1cm4gc3RyUmVwZWF0KHBhZFN0ciwgcGFkbGVuKSArIHN0cjtcbiAgfVxufTtcbiIsInZhciBhZGphY2VudCA9IHJlcXVpcmUoJy4vaGVscGVyL2FkamFjZW50Jyk7XG5cbm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24gc3VjYyhzdHIpIHtcbiAgcmV0dXJuIGFkamFjZW50KHN0ciwgLTEpO1xufTtcbiIsIi8qKlxuICogX3MucHJ1bmU6IGEgbW9yZSBlbGVnYW50IHZlcnNpb24gb2YgdHJ1bmNhdGVcbiAqIHBydW5lIGV4dHJhIGNoYXJzLCBuZXZlciBsZWF2aW5nIGEgaGFsZi1jaG9wcGVkIHdvcmQuXG4gKiBAYXV0aG9yIGdpdGh1Yi5jb20vcnd6XG4gKi9cbnZhciBtYWtlU3RyaW5nID0gcmVxdWlyZSgnLi9oZWxwZXIvbWFrZVN0cmluZycpO1xudmFyIHJ0cmltID0gcmVxdWlyZSgnLi9ydHJpbScpO1xuXG5tb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uIHBydW5lKHN0ciwgbGVuZ3RoLCBwcnVuZVN0cikge1xuICBzdHIgPSBtYWtlU3RyaW5nKHN0cik7XG4gIGxlbmd0aCA9IH5+bGVuZ3RoO1xuICBwcnVuZVN0ciA9IHBydW5lU3RyICE9IG51bGwgPyBTdHJpbmcocHJ1bmVTdHIpIDogJy4uLic7XG5cbiAgaWYgKHN0ci5sZW5ndGggPD0gbGVuZ3RoKSByZXR1cm4gc3RyO1xuXG4gIHZhciB0bXBsID0gZnVuY3Rpb24oYykge1xuICAgICAgcmV0dXJuIGMudG9VcHBlckNhc2UoKSAhPT0gYy50b0xvd2VyQ2FzZSgpID8gJ0EnIDogJyAnO1xuICAgIH0sXG4gICAgdGVtcGxhdGUgPSBzdHIuc2xpY2UoMCwgbGVuZ3RoICsgMSkucmVwbGFjZSgvLig/PVxcVypcXHcqJCkvZywgdG1wbCk7IC8vICdIZWxsbywgd29ybGQnIC0+ICdIZWxsQUEgQUFBQUEnXG5cbiAgaWYgKHRlbXBsYXRlLnNsaWNlKHRlbXBsYXRlLmxlbmd0aCAtIDIpLm1hdGNoKC9cXHdcXHcvKSlcbiAgICB0ZW1wbGF0ZSA9IHRlbXBsYXRlLnJlcGxhY2UoL1xccypcXFMrJC8sICcnKTtcbiAgZWxzZVxuICAgIHRlbXBsYXRlID0gcnRyaW0odGVtcGxhdGUuc2xpY2UoMCwgdGVtcGxhdGUubGVuZ3RoIC0gMSkpO1xuXG4gIHJldHVybiAodGVtcGxhdGUgKyBwcnVuZVN0cikubGVuZ3RoID4gc3RyLmxlbmd0aCA/IHN0ciA6IHN0ci5zbGljZSgwLCB0ZW1wbGF0ZS5sZW5ndGgpICsgcHJ1bmVTdHI7XG59O1xuIiwidmFyIHN1cnJvdW5kID0gcmVxdWlyZSgnLi9zdXJyb3VuZCcpO1xuXG5tb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uIHF1b3RlKHN0ciwgcXVvdGVDaGFyKSB7XG4gIHJldHVybiBzdXJyb3VuZChzdHIsIHF1b3RlQ2hhciB8fCAnXCInKTtcbn07XG4iLCJ2YXIgbWFrZVN0cmluZyA9IHJlcXVpcmUoJy4vaGVscGVyL21ha2VTdHJpbmcnKTtcbnZhciBzdHJSZXBlYXQgPSByZXF1aXJlKCcuL2hlbHBlci9zdHJSZXBlYXQnKTtcblxubW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbiByZXBlYXQoc3RyLCBxdHksIHNlcGFyYXRvcikge1xuICBzdHIgPSBtYWtlU3RyaW5nKHN0cik7XG5cbiAgcXR5ID0gfn5xdHk7XG5cbiAgLy8gdXNpbmcgZmFzdGVyIGltcGxlbWVudGF0aW9uIGlmIHNlcGFyYXRvciBpcyBub3QgbmVlZGVkO1xuICBpZiAoc2VwYXJhdG9yID09IG51bGwpIHJldHVybiBzdHJSZXBlYXQoc3RyLCBxdHkpO1xuXG4gIC8vIHRoaXMgb25lIGlzIGFib3V0IDMwMHggc2xvd2VyIGluIEdvb2dsZSBDaHJvbWVcbiAgLyplc2xpbnQgbm8tZW1wdHk6IDAqL1xuICBmb3IgKHZhciByZXBlYXQgPSBbXTsgcXR5ID4gMDsgcmVwZWF0Wy0tcXR5XSA9IHN0cikge31cbiAgcmV0dXJuIHJlcGVhdC5qb2luKHNlcGFyYXRvcik7XG59O1xuIiwidmFyIG1ha2VTdHJpbmcgPSByZXF1aXJlKCcuL2hlbHBlci9tYWtlU3RyaW5nJyk7XG5cbm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24gcmVwbGFjZUFsbChzdHIsIGZpbmQsIHJlcGxhY2UsIGlnbm9yZWNhc2UpIHtcbiAgdmFyIGZsYWdzID0gKGlnbm9yZWNhc2UgPT09IHRydWUpPydnaSc6J2cnO1xuICB2YXIgcmVnID0gbmV3IFJlZ0V4cChmaW5kLCBmbGFncyk7XG5cbiAgcmV0dXJuIG1ha2VTdHJpbmcoc3RyKS5yZXBsYWNlKHJlZywgcmVwbGFjZSk7XG59O1xuIiwidmFyIGNoYXJzID0gcmVxdWlyZSgnLi9jaGFycycpO1xuXG5tb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uIHJldmVyc2Uoc3RyKSB7XG4gIHJldHVybiBjaGFycyhzdHIpLnJldmVyc2UoKS5qb2luKCcnKTtcbn07XG4iLCJ2YXIgcGFkID0gcmVxdWlyZSgnLi9wYWQnKTtcblxubW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbiBycGFkKHN0ciwgbGVuZ3RoLCBwYWRTdHIpIHtcbiAgcmV0dXJuIHBhZChzdHIsIGxlbmd0aCwgcGFkU3RyLCAncmlnaHQnKTtcbn07XG4iLCJ2YXIgbWFrZVN0cmluZyA9IHJlcXVpcmUoJy4vaGVscGVyL21ha2VTdHJpbmcnKTtcbnZhciBkZWZhdWx0VG9XaGl0ZVNwYWNlID0gcmVxdWlyZSgnLi9oZWxwZXIvZGVmYXVsdFRvV2hpdGVTcGFjZScpO1xudmFyIG5hdGl2ZVRyaW1SaWdodCA9IFN0cmluZy5wcm90b3R5cGUudHJpbVJpZ2h0O1xuXG5tb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uIHJ0cmltKHN0ciwgY2hhcmFjdGVycykge1xuICBzdHIgPSBtYWtlU3RyaW5nKHN0cik7XG4gIGlmICghY2hhcmFjdGVycyAmJiBuYXRpdmVUcmltUmlnaHQpIHJldHVybiBuYXRpdmVUcmltUmlnaHQuY2FsbChzdHIpO1xuICBjaGFyYWN0ZXJzID0gZGVmYXVsdFRvV2hpdGVTcGFjZShjaGFyYWN0ZXJzKTtcbiAgcmV0dXJuIHN0ci5yZXBsYWNlKG5ldyBSZWdFeHAoY2hhcmFjdGVycyArICcrJCcpLCAnJyk7XG59O1xuIiwidmFyIHRyaW0gPSByZXF1aXJlKCcuL3RyaW0nKTtcbnZhciBkYXNoZXJpemUgPSByZXF1aXJlKCcuL2Rhc2hlcml6ZScpO1xudmFyIGNsZWFuRGlhY3JpdGljcyA9IHJlcXVpcmUoJy4vY2xlYW5EaWFjcml0aWNzJyk7XG5cbm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24gc2x1Z2lmeShzdHIpIHtcbiAgcmV0dXJuIHRyaW0oZGFzaGVyaXplKGNsZWFuRGlhY3JpdGljcyhzdHIpLnJlcGxhY2UoL1teXFx3XFxzLV0vZywgJy0nKS50b0xvd2VyQ2FzZSgpKSwgJy0nKTtcbn07XG4iLCJ2YXIgY2hhcnMgPSByZXF1aXJlKCcuL2NoYXJzJyk7XG5cbm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24gc3BsaWNlKHN0ciwgaSwgaG93bWFueSwgc3Vic3RyKSB7XG4gIHZhciBhcnIgPSBjaGFycyhzdHIpO1xuICBhcnIuc3BsaWNlKH5+aSwgfn5ob3dtYW55LCBzdWJzdHIpO1xuICByZXR1cm4gYXJyLmpvaW4oJycpO1xufTtcbiIsInZhciBkZXByZWNhdGUgPSByZXF1aXJlKCd1dGlsLWRlcHJlY2F0ZScpO1xuXG5tb2R1bGUuZXhwb3J0cyA9IGRlcHJlY2F0ZShyZXF1aXJlKCdzcHJpbnRmLWpzJykuc3ByaW50ZixcbiAgJ3NwcmludGYoKSB3aWxsIGJlIHJlbW92ZWQgaW4gdGhlIG5leHQgbWFqb3IgcmVsZWFzZSwgdXNlIHRoZSBzcHJpbnRmLWpzIHBhY2thZ2UgaW5zdGVhZC4nKTtcbiIsInZhciBtYWtlU3RyaW5nID0gcmVxdWlyZSgnLi9oZWxwZXIvbWFrZVN0cmluZycpO1xudmFyIHRvUG9zaXRpdmUgPSByZXF1aXJlKCcuL2hlbHBlci90b1Bvc2l0aXZlJyk7XG5cbm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24gc3RhcnRzV2l0aChzdHIsIHN0YXJ0cywgcG9zaXRpb24pIHtcbiAgc3RyID0gbWFrZVN0cmluZyhzdHIpO1xuICBzdGFydHMgPSAnJyArIHN0YXJ0cztcbiAgcG9zaXRpb24gPSBwb3NpdGlvbiA9PSBudWxsID8gMCA6IE1hdGgubWluKHRvUG9zaXRpdmUocG9zaXRpb24pLCBzdHIubGVuZ3RoKTtcbiAgcmV0dXJuIHN0ci5sYXN0SW5kZXhPZihzdGFydHMsIHBvc2l0aW9uKSA9PT0gcG9zaXRpb247XG59O1xuIiwidmFyIG1ha2VTdHJpbmcgPSByZXF1aXJlKCcuL2hlbHBlci9tYWtlU3RyaW5nJyk7XG5cbm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24gc3RyTGVmdChzdHIsIHNlcCkge1xuICBzdHIgPSBtYWtlU3RyaW5nKHN0cik7XG4gIHNlcCA9IG1ha2VTdHJpbmcoc2VwKTtcbiAgdmFyIHBvcyA9ICFzZXAgPyAtMSA6IHN0ci5pbmRleE9mKHNlcCk7XG4gIHJldHVybn4gcG9zID8gc3RyLnNsaWNlKDAsIHBvcykgOiBzdHI7XG59O1xuIiwidmFyIG1ha2VTdHJpbmcgPSByZXF1aXJlKCcuL2hlbHBlci9tYWtlU3RyaW5nJyk7XG5cbm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24gc3RyTGVmdEJhY2soc3RyLCBzZXApIHtcbiAgc3RyID0gbWFrZVN0cmluZyhzdHIpO1xuICBzZXAgPSBtYWtlU3RyaW5nKHNlcCk7XG4gIHZhciBwb3MgPSBzdHIubGFzdEluZGV4T2Yoc2VwKTtcbiAgcmV0dXJufiBwb3MgPyBzdHIuc2xpY2UoMCwgcG9zKSA6IHN0cjtcbn07XG4iLCJ2YXIgbWFrZVN0cmluZyA9IHJlcXVpcmUoJy4vaGVscGVyL21ha2VTdHJpbmcnKTtcblxubW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbiBzdHJSaWdodChzdHIsIHNlcCkge1xuICBzdHIgPSBtYWtlU3RyaW5nKHN0cik7XG4gIHNlcCA9IG1ha2VTdHJpbmcoc2VwKTtcbiAgdmFyIHBvcyA9ICFzZXAgPyAtMSA6IHN0ci5pbmRleE9mKHNlcCk7XG4gIHJldHVybn4gcG9zID8gc3RyLnNsaWNlKHBvcyArIHNlcC5sZW5ndGgsIHN0ci5sZW5ndGgpIDogc3RyO1xufTtcbiIsInZhciBtYWtlU3RyaW5nID0gcmVxdWlyZSgnLi9oZWxwZXIvbWFrZVN0cmluZycpO1xuXG5tb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uIHN0clJpZ2h0QmFjayhzdHIsIHNlcCkge1xuICBzdHIgPSBtYWtlU3RyaW5nKHN0cik7XG4gIHNlcCA9IG1ha2VTdHJpbmcoc2VwKTtcbiAgdmFyIHBvcyA9ICFzZXAgPyAtMSA6IHN0ci5sYXN0SW5kZXhPZihzZXApO1xuICByZXR1cm5+IHBvcyA/IHN0ci5zbGljZShwb3MgKyBzZXAubGVuZ3RoLCBzdHIubGVuZ3RoKSA6IHN0cjtcbn07XG4iLCJ2YXIgbWFrZVN0cmluZyA9IHJlcXVpcmUoJy4vaGVscGVyL21ha2VTdHJpbmcnKTtcblxubW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbiBzdHJpcFRhZ3Moc3RyKSB7XG4gIHJldHVybiBtYWtlU3RyaW5nKHN0cikucmVwbGFjZSgvPFxcLz9bXj5dKz4vZywgJycpO1xufTtcbiIsInZhciBhZGphY2VudCA9IHJlcXVpcmUoJy4vaGVscGVyL2FkamFjZW50Jyk7XG5cbm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24gc3VjYyhzdHIpIHtcbiAgcmV0dXJuIGFkamFjZW50KHN0ciwgMSk7XG59O1xuIiwibW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbiBzdXJyb3VuZChzdHIsIHdyYXBwZXIpIHtcbiAgcmV0dXJuIFt3cmFwcGVyLCBzdHIsIHdyYXBwZXJdLmpvaW4oJycpO1xufTtcbiIsInZhciBtYWtlU3RyaW5nID0gcmVxdWlyZSgnLi9oZWxwZXIvbWFrZVN0cmluZycpO1xuXG5tb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uIHN3YXBDYXNlKHN0cikge1xuICByZXR1cm4gbWFrZVN0cmluZyhzdHIpLnJlcGxhY2UoL1xcUy9nLCBmdW5jdGlvbihjKSB7XG4gICAgcmV0dXJuIGMgPT09IGMudG9VcHBlckNhc2UoKSA/IGMudG9Mb3dlckNhc2UoKSA6IGMudG9VcHBlckNhc2UoKTtcbiAgfSk7XG59O1xuIiwidmFyIG1ha2VTdHJpbmcgPSByZXF1aXJlKCcuL2hlbHBlci9tYWtlU3RyaW5nJyk7XG5cbm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24gdGl0bGVpemUoc3RyKSB7XG4gIHJldHVybiBtYWtlU3RyaW5nKHN0cikudG9Mb3dlckNhc2UoKS5yZXBsYWNlKC8oPzpefFxcc3wtKVxcUy9nLCBmdW5jdGlvbihjKSB7XG4gICAgcmV0dXJuIGMudG9VcHBlckNhc2UoKTtcbiAgfSk7XG59O1xuIiwidmFyIHRyaW0gPSByZXF1aXJlKCcuL3RyaW0nKTtcblxuZnVuY3Rpb24gYm9vbE1hdGNoKHMsIG1hdGNoZXJzKSB7XG4gIHZhciBpLCBtYXRjaGVyLCBkb3duID0gcy50b0xvd2VyQ2FzZSgpO1xuICBtYXRjaGVycyA9IFtdLmNvbmNhdChtYXRjaGVycyk7XG4gIGZvciAoaSA9IDA7IGkgPCBtYXRjaGVycy5sZW5ndGg7IGkgKz0gMSkge1xuICAgIG1hdGNoZXIgPSBtYXRjaGVyc1tpXTtcbiAgICBpZiAoIW1hdGNoZXIpIGNvbnRpbnVlO1xuICAgIGlmIChtYXRjaGVyLnRlc3QgJiYgbWF0Y2hlci50ZXN0KHMpKSByZXR1cm4gdHJ1ZTtcbiAgICBpZiAobWF0Y2hlci50b0xvd2VyQ2FzZSgpID09PSBkb3duKSByZXR1cm4gdHJ1ZTtcbiAgfVxufVxuXG5tb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uIHRvQm9vbGVhbihzdHIsIHRydWVWYWx1ZXMsIGZhbHNlVmFsdWVzKSB7XG4gIGlmICh0eXBlb2Ygc3RyID09PSAnbnVtYmVyJykgc3RyID0gJycgKyBzdHI7XG4gIGlmICh0eXBlb2Ygc3RyICE9PSAnc3RyaW5nJykgcmV0dXJuICEhc3RyO1xuICBzdHIgPSB0cmltKHN0cik7XG4gIGlmIChib29sTWF0Y2goc3RyLCB0cnVlVmFsdWVzIHx8IFsndHJ1ZScsICcxJ10pKSByZXR1cm4gdHJ1ZTtcbiAgaWYgKGJvb2xNYXRjaChzdHIsIGZhbHNlVmFsdWVzIHx8IFsnZmFsc2UnLCAnMCddKSkgcmV0dXJuIGZhbHNlO1xufTtcbiIsIm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24gdG9OdW1iZXIobnVtLCBwcmVjaXNpb24pIHtcbiAgaWYgKG51bSA9PSBudWxsKSByZXR1cm4gMDtcbiAgdmFyIGZhY3RvciA9IE1hdGgucG93KDEwLCBpc0Zpbml0ZShwcmVjaXNpb24pID8gcHJlY2lzaW9uIDogMCk7XG4gIHJldHVybiBNYXRoLnJvdW5kKG51bSAqIGZhY3RvcikgLyBmYWN0b3I7XG59O1xuIiwidmFyIHJ0cmltID0gcmVxdWlyZSgnLi9ydHJpbScpO1xuXG5tb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uIHRvU2VudGVuY2UoYXJyYXksIHNlcGFyYXRvciwgbGFzdFNlcGFyYXRvciwgc2VyaWFsKSB7XG4gIHNlcGFyYXRvciA9IHNlcGFyYXRvciB8fCAnLCAnO1xuICBsYXN0U2VwYXJhdG9yID0gbGFzdFNlcGFyYXRvciB8fCAnIGFuZCAnO1xuICB2YXIgYSA9IGFycmF5LnNsaWNlKCksXG4gICAgbGFzdE1lbWJlciA9IGEucG9wKCk7XG5cbiAgaWYgKGFycmF5Lmxlbmd0aCA+IDIgJiYgc2VyaWFsKSBsYXN0U2VwYXJhdG9yID0gcnRyaW0oc2VwYXJhdG9yKSArIGxhc3RTZXBhcmF0b3I7XG5cbiAgcmV0dXJuIGEubGVuZ3RoID8gYS5qb2luKHNlcGFyYXRvcikgKyBsYXN0U2VwYXJhdG9yICsgbGFzdE1lbWJlciA6IGxhc3RNZW1iZXI7XG59O1xuIiwidmFyIHRvU2VudGVuY2UgPSByZXF1aXJlKCcuL3RvU2VudGVuY2UnKTtcblxubW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbiB0b1NlbnRlbmNlU2VyaWFsKGFycmF5LCBzZXAsIGxhc3RTZXApIHtcbiAgcmV0dXJuIHRvU2VudGVuY2UoYXJyYXksIHNlcCwgbGFzdFNlcCwgdHJ1ZSk7XG59O1xuIiwidmFyIG1ha2VTdHJpbmcgPSByZXF1aXJlKCcuL2hlbHBlci9tYWtlU3RyaW5nJyk7XG52YXIgZGVmYXVsdFRvV2hpdGVTcGFjZSA9IHJlcXVpcmUoJy4vaGVscGVyL2RlZmF1bHRUb1doaXRlU3BhY2UnKTtcbnZhciBuYXRpdmVUcmltID0gU3RyaW5nLnByb3RvdHlwZS50cmltO1xuXG5tb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uIHRyaW0oc3RyLCBjaGFyYWN0ZXJzKSB7XG4gIHN0ciA9IG1ha2VTdHJpbmcoc3RyKTtcbiAgaWYgKCFjaGFyYWN0ZXJzICYmIG5hdGl2ZVRyaW0pIHJldHVybiBuYXRpdmVUcmltLmNhbGwoc3RyKTtcbiAgY2hhcmFjdGVycyA9IGRlZmF1bHRUb1doaXRlU3BhY2UoY2hhcmFjdGVycyk7XG4gIHJldHVybiBzdHIucmVwbGFjZShuZXcgUmVnRXhwKCdeJyArIGNoYXJhY3RlcnMgKyAnK3wnICsgY2hhcmFjdGVycyArICcrJCcsICdnJyksICcnKTtcbn07XG4iLCJ2YXIgbWFrZVN0cmluZyA9IHJlcXVpcmUoJy4vaGVscGVyL21ha2VTdHJpbmcnKTtcblxubW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbiB0cnVuY2F0ZShzdHIsIGxlbmd0aCwgdHJ1bmNhdGVTdHIpIHtcbiAgc3RyID0gbWFrZVN0cmluZyhzdHIpO1xuICB0cnVuY2F0ZVN0ciA9IHRydW5jYXRlU3RyIHx8ICcuLi4nO1xuICBsZW5ndGggPSB+fmxlbmd0aDtcbiAgcmV0dXJuIHN0ci5sZW5ndGggPiBsZW5ndGggPyBzdHIuc2xpY2UoMCwgbGVuZ3RoKSArIHRydW5jYXRlU3RyIDogc3RyO1xufTtcbiIsInZhciB0cmltID0gcmVxdWlyZSgnLi90cmltJyk7XG5cbm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24gdW5kZXJzY29yZWQoc3RyKSB7XG4gIHJldHVybiB0cmltKHN0cikucmVwbGFjZSgvKFthLXpcXGRdKShbQS1aXSspL2csICckMV8kMicpLnJlcGxhY2UoL1stXFxzXSsvZywgJ18nKS50b0xvd2VyQ2FzZSgpO1xufTtcbiIsInZhciBtYWtlU3RyaW5nID0gcmVxdWlyZSgnLi9oZWxwZXIvbWFrZVN0cmluZycpO1xudmFyIGh0bWxFbnRpdGllcyA9IHJlcXVpcmUoJy4vaGVscGVyL2h0bWxFbnRpdGllcycpO1xuXG5tb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uIHVuZXNjYXBlSFRNTChzdHIpIHtcbiAgcmV0dXJuIG1ha2VTdHJpbmcoc3RyKS5yZXBsYWNlKC9cXCYoW147XXsxLDEwfSk7L2csIGZ1bmN0aW9uKGVudGl0eSwgZW50aXR5Q29kZSkge1xuICAgIHZhciBtYXRjaDtcblxuICAgIGlmIChlbnRpdHlDb2RlIGluIGh0bWxFbnRpdGllcykge1xuICAgICAgcmV0dXJuIGh0bWxFbnRpdGllc1tlbnRpdHlDb2RlXTtcbiAgICAvKmVzbGludCBuby1jb25kLWFzc2lnbjogMCovXG4gICAgfSBlbHNlIGlmIChtYXRjaCA9IGVudGl0eUNvZGUubWF0Y2goL14jeChbXFxkYS1mQS1GXSspJC8pKSB7XG4gICAgICByZXR1cm4gU3RyaW5nLmZyb21DaGFyQ29kZShwYXJzZUludChtYXRjaFsxXSwgMTYpKTtcbiAgICAvKmVzbGludCBuby1jb25kLWFzc2lnbjogMCovXG4gICAgfSBlbHNlIGlmIChtYXRjaCA9IGVudGl0eUNvZGUubWF0Y2goL14jKFxcZCspJC8pKSB7XG4gICAgICByZXR1cm4gU3RyaW5nLmZyb21DaGFyQ29kZSh+fm1hdGNoWzFdKTtcbiAgICB9IGVsc2Uge1xuICAgICAgcmV0dXJuIGVudGl0eTtcbiAgICB9XG4gIH0pO1xufTtcbiIsIm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24gdW5xdW90ZShzdHIsIHF1b3RlQ2hhcikge1xuICBxdW90ZUNoYXIgPSBxdW90ZUNoYXIgfHwgJ1wiJztcbiAgaWYgKHN0clswXSA9PT0gcXVvdGVDaGFyICYmIHN0cltzdHIubGVuZ3RoIC0gMV0gPT09IHF1b3RlQ2hhcilcbiAgICByZXR1cm4gc3RyLnNsaWNlKDEsIHN0ci5sZW5ndGggLSAxKTtcbiAgZWxzZSByZXR1cm4gc3RyO1xufTtcbiIsInZhciBkZXByZWNhdGUgPSByZXF1aXJlKCd1dGlsLWRlcHJlY2F0ZScpO1xuXG5tb2R1bGUuZXhwb3J0cyA9IGRlcHJlY2F0ZShyZXF1aXJlKCdzcHJpbnRmLWpzJykudnNwcmludGYsXG4gICd2c3ByaW50ZigpIHdpbGwgYmUgcmVtb3ZlZCBpbiB0aGUgbmV4dCBtYWpvciByZWxlYXNlLCB1c2UgdGhlIHNwcmludGYtanMgcGFja2FnZSBpbnN0ZWFkLicpO1xuIiwidmFyIGlzQmxhbmsgPSByZXF1aXJlKCcuL2lzQmxhbmsnKTtcbnZhciB0cmltID0gcmVxdWlyZSgnLi90cmltJyk7XG5cbm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24gd29yZHMoc3RyLCBkZWxpbWl0ZXIpIHtcbiAgaWYgKGlzQmxhbmsoc3RyKSkgcmV0dXJuIFtdO1xuICByZXR1cm4gdHJpbShzdHIsIGRlbGltaXRlcikuc3BsaXQoZGVsaW1pdGVyIHx8IC9cXHMrLyk7XG59O1xuIiwiLy8gV3JhcFxuLy8gd3JhcHMgYSBzdHJpbmcgYnkgYSBjZXJ0YWluIHdpZHRoXG5cbnZhciBtYWtlU3RyaW5nID0gcmVxdWlyZSgnLi9oZWxwZXIvbWFrZVN0cmluZycpO1xuXG5tb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uIHdyYXAoc3RyLCBvcHRpb25zKXtcbiAgc3RyID0gbWFrZVN0cmluZyhzdHIpO1xuICBcbiAgb3B0aW9ucyA9IG9wdGlvbnMgfHwge307XG4gIFxuICB2YXIgd2lkdGggPSBvcHRpb25zLndpZHRoIHx8IDc1O1xuICB2YXIgc2VwZXJhdG9yID0gb3B0aW9ucy5zZXBlcmF0b3IgfHwgJ1xcbic7XG4gIHZhciBjdXQgPSBvcHRpb25zLmN1dCB8fCBmYWxzZTtcbiAgdmFyIHByZXNlcnZlU3BhY2VzID0gb3B0aW9ucy5wcmVzZXJ2ZVNwYWNlcyB8fCBmYWxzZTtcbiAgdmFyIHRyYWlsaW5nU3BhY2VzID0gb3B0aW9ucy50cmFpbGluZ1NwYWNlcyB8fCBmYWxzZTtcbiAgXG4gIHZhciByZXN1bHQ7XG4gIFxuICBpZih3aWR0aCA8PSAwKXtcbiAgICByZXR1cm4gc3RyO1xuICB9XG4gIFxuICBlbHNlIGlmKCFjdXQpe1xuICBcbiAgICB2YXIgd29yZHMgPSBzdHIuc3BsaXQoJyAnKTtcbiAgICB2YXIgY3VycmVudF9jb2x1bW4gPSAwO1xuICAgIHJlc3VsdCA9ICcnO1xuICBcbiAgICB3aGlsZSh3b3Jkcy5sZW5ndGggPiAwKXtcbiAgICAgIFxuICAgICAgLy8gaWYgYWRkaW5nIGEgc3BhY2UgYW5kIHRoZSBuZXh0IHdvcmQgd291bGQgY2F1c2UgdGhpcyBsaW5lIHRvIGJlIGxvbmdlciB0aGFuIHdpZHRoLi4uXG4gICAgICBpZigxICsgd29yZHNbMF0ubGVuZ3RoICsgY3VycmVudF9jb2x1bW4gPiB3aWR0aCl7XG4gICAgICAgIC8vc3RhcnQgYSBuZXcgbGluZSBpZiB0aGlzIGxpbmUgaXMgbm90IGFscmVhZHkgZW1wdHlcbiAgICAgICAgaWYoY3VycmVudF9jb2x1bW4gPiAwKXtcbiAgICAgICAgICAvLyBhZGQgYSBzcGFjZSBhdCB0aGUgZW5kIG9mIHRoZSBsaW5lIGlzIHByZXNlcnZlU3BhY2VzIGlzIHRydWVcbiAgICAgICAgICBpZiAocHJlc2VydmVTcGFjZXMpe1xuICAgICAgICAgICAgcmVzdWx0ICs9ICcgJztcbiAgICAgICAgICAgIGN1cnJlbnRfY29sdW1uKys7XG4gICAgICAgICAgfVxuICAgICAgICAgIC8vIGZpbGwgdGhlIHJlc3Qgb2YgdGhlIGxpbmUgd2l0aCBzcGFjZXMgaWYgdHJhaWxpbmdTcGFjZXMgb3B0aW9uIGlzIHRydWVcbiAgICAgICAgICBlbHNlIGlmKHRyYWlsaW5nU3BhY2VzKXtcbiAgICAgICAgICAgIHdoaWxlKGN1cnJlbnRfY29sdW1uIDwgd2lkdGgpe1xuICAgICAgICAgICAgICByZXN1bHQgKz0gJyAnO1xuICAgICAgICAgICAgICBjdXJyZW50X2NvbHVtbisrO1xuICAgICAgICAgICAgfSAgICAgICAgICAgIFxuICAgICAgICAgIH1cbiAgICAgICAgICAvL3N0YXJ0IG5ldyBsaW5lXG4gICAgICAgICAgcmVzdWx0ICs9IHNlcGVyYXRvcjtcbiAgICAgICAgICBjdXJyZW50X2NvbHVtbiA9IDA7XG4gICAgICAgIH1cbiAgICAgIH1cbiAgXG4gICAgICAvLyBpZiBub3QgYXQgdGhlIGJlZ2luaW5nIG9mIHRoZSBsaW5lLCBhZGQgYSBzcGFjZSBpbiBmcm9udCBvZiB0aGUgd29yZFxuICAgICAgaWYoY3VycmVudF9jb2x1bW4gPiAwKXtcbiAgICAgICAgcmVzdWx0ICs9ICcgJztcbiAgICAgICAgY3VycmVudF9jb2x1bW4rKztcbiAgICAgIH1cbiAgXG4gICAgICAvLyB0YWNrIG9uIHRoZSBuZXh0IHdvcmQsIHVwZGF0ZSBjdXJyZW50IGNvbHVtbiwgYSBwb3Agd29yZHMgYXJyYXlcbiAgICAgIHJlc3VsdCArPSB3b3Jkc1swXTtcbiAgICAgIGN1cnJlbnRfY29sdW1uICs9IHdvcmRzWzBdLmxlbmd0aDtcbiAgICAgIHdvcmRzLnNoaWZ0KCk7XG4gIFxuICAgIH1cbiAgXG4gICAgLy8gZmlsbCB0aGUgcmVzdCBvZiB0aGUgbGluZSB3aXRoIHNwYWNlcyBpZiB0cmFpbGluZ1NwYWNlcyBvcHRpb24gaXMgdHJ1ZVxuICAgIGlmKHRyYWlsaW5nU3BhY2VzKXtcbiAgICAgIHdoaWxlKGN1cnJlbnRfY29sdW1uIDwgd2lkdGgpe1xuICAgICAgICByZXN1bHQgKz0gJyAnO1xuICAgICAgICBjdXJyZW50X2NvbHVtbisrO1xuICAgICAgfSAgICAgICAgICAgIFxuICAgIH1cbiAgXG4gICAgcmV0dXJuIHJlc3VsdDtcbiAgXG4gIH1cbiAgXG4gIGVsc2Uge1xuICBcbiAgICB2YXIgaW5kZXggPSAwO1xuICAgIHJlc3VsdCA9ICcnO1xuICBcbiAgICAvLyB3YWxrIHRocm91Z2ggZWFjaCBjaGFyYWN0ZXIgYW5kIGFkZCBzZXBlcmF0b3JzIHdoZXJlIGFwcHJvcHJpYXRlXG4gICAgd2hpbGUoaW5kZXggPCBzdHIubGVuZ3RoKXtcbiAgICAgIGlmKGluZGV4ICUgd2lkdGggPT0gMCAmJiBpbmRleCA+IDApe1xuICAgICAgICByZXN1bHQgKz0gc2VwZXJhdG9yO1xuICAgICAgfVxuICAgICAgcmVzdWx0ICs9IHN0ci5jaGFyQXQoaW5kZXgpO1xuICAgICAgaW5kZXgrKztcbiAgICB9XG4gIFxuICAgIC8vIGZpbGwgdGhlIHJlc3Qgb2YgdGhlIGxpbmUgd2l0aCBzcGFjZXMgaWYgdHJhaWxpbmdTcGFjZXMgb3B0aW9uIGlzIHRydWVcbiAgICBpZih0cmFpbGluZ1NwYWNlcyl7XG4gICAgICB3aGlsZShpbmRleCAlIHdpZHRoID4gMCl7XG4gICAgICAgIHJlc3VsdCArPSAnICc7XG4gICAgICAgIGluZGV4Kys7XG4gICAgICB9ICAgICAgICAgICAgXG4gICAgfVxuICAgIFxuICAgIHJldHVybiByZXN1bHQ7XG4gIH1cbn07XG4iLCJleHBvcnQgeyBkZWZhdWx0IH0gZnJvbSAnLi9pbmRleC1kZWZhdWx0LmpzJztcbmV4cG9ydCAqIGZyb20gJy4vaW5kZXguanMnO1xuIiwiaW1wb3J0ICogYXMgYWxsRXhwb3J0cyBmcm9tICcuL2luZGV4LmpzJztcbmltcG9ydCB7IG1peGluIH0gZnJvbSAnLi9pbmRleC5qcyc7XG5cbi8vIEFkZCBhbGwgb2YgdGhlIFVuZGVyc2NvcmUgZnVuY3Rpb25zIHRvIHRoZSB3cmFwcGVyIG9iamVjdC5cbnZhciBfID0gbWl4aW4oYWxsRXhwb3J0cyk7XG4vLyBMZWdhY3kgTm9kZS5qcyBBUElcbl8uXyA9IF87XG4vLyBFeHBvcnQgdGhlIFVuZGVyc2NvcmUgQVBJLlxuZXhwb3J0IGRlZmF1bHQgXztcbiIsIi8vICAgICBVbmRlcnNjb3JlLmpzIDEuMTAuMlxuLy8gICAgIGh0dHBzOi8vdW5kZXJzY29yZWpzLm9yZ1xuLy8gICAgIChjKSAyMDA5LTIwMjAgSmVyZW15IEFzaGtlbmFzLCBEb2N1bWVudENsb3VkIGFuZCBJbnZlc3RpZ2F0aXZlIFJlcG9ydGVycyAmIEVkaXRvcnNcbi8vICAgICBVbmRlcnNjb3JlIG1heSBiZSBmcmVlbHkgZGlzdHJpYnV0ZWQgdW5kZXIgdGhlIE1JVCBsaWNlbnNlLlxuXG4vLyBCYXNlbGluZSBzZXR1cFxuLy8gLS0tLS0tLS0tLS0tLS1cblxuLy8gRXN0YWJsaXNoIHRoZSByb290IG9iamVjdCwgYHdpbmRvd2AgKGBzZWxmYCkgaW4gdGhlIGJyb3dzZXIsIGBnbG9iYWxgXG4vLyBvbiB0aGUgc2VydmVyLCBvciBgdGhpc2AgaW4gc29tZSB2aXJ0dWFsIG1hY2hpbmVzLiBXZSB1c2UgYHNlbGZgXG4vLyBpbnN0ZWFkIG9mIGB3aW5kb3dgIGZvciBgV2ViV29ya2VyYCBzdXBwb3J0LlxudmFyIHJvb3QgPSB0eXBlb2Ygc2VsZiA9PSAnb2JqZWN0JyAmJiBzZWxmLnNlbGYgPT09IHNlbGYgJiYgc2VsZiB8fFxuICAgICAgICAgIHR5cGVvZiBnbG9iYWwgPT0gJ29iamVjdCcgJiYgZ2xvYmFsLmdsb2JhbCA9PT0gZ2xvYmFsICYmIGdsb2JhbCB8fFxuICAgICAgICAgIEZ1bmN0aW9uKCdyZXR1cm4gdGhpcycpKCkgfHxcbiAgICAgICAgICB7fTtcblxuLy8gU2F2ZSBieXRlcyBpbiB0aGUgbWluaWZpZWQgKGJ1dCBub3QgZ3ppcHBlZCkgdmVyc2lvbjpcbnZhciBBcnJheVByb3RvID0gQXJyYXkucHJvdG90eXBlLCBPYmpQcm90byA9IE9iamVjdC5wcm90b3R5cGU7XG52YXIgU3ltYm9sUHJvdG8gPSB0eXBlb2YgU3ltYm9sICE9PSAndW5kZWZpbmVkJyA/IFN5bWJvbC5wcm90b3R5cGUgOiBudWxsO1xuXG4vLyBDcmVhdGUgcXVpY2sgcmVmZXJlbmNlIHZhcmlhYmxlcyBmb3Igc3BlZWQgYWNjZXNzIHRvIGNvcmUgcHJvdG90eXBlcy5cbnZhciBwdXNoID0gQXJyYXlQcm90by5wdXNoLFxuICAgIHNsaWNlID0gQXJyYXlQcm90by5zbGljZSxcbiAgICB0b1N0cmluZyA9IE9ialByb3RvLnRvU3RyaW5nLFxuICAgIGhhc093blByb3BlcnR5ID0gT2JqUHJvdG8uaGFzT3duUHJvcGVydHk7XG5cbi8vIEFsbCAqKkVDTUFTY3JpcHQgNSoqIG5hdGl2ZSBmdW5jdGlvbiBpbXBsZW1lbnRhdGlvbnMgdGhhdCB3ZSBob3BlIHRvIHVzZVxuLy8gYXJlIGRlY2xhcmVkIGhlcmUuXG52YXIgbmF0aXZlSXNBcnJheSA9IEFycmF5LmlzQXJyYXksXG4gICAgbmF0aXZlS2V5cyA9IE9iamVjdC5rZXlzLFxuICAgIG5hdGl2ZUNyZWF0ZSA9IE9iamVjdC5jcmVhdGU7XG5cbi8vIENyZWF0ZSByZWZlcmVuY2VzIHRvIHRoZXNlIGJ1aWx0aW4gZnVuY3Rpb25zIGJlY2F1c2Ugd2Ugb3ZlcnJpZGUgdGhlbS5cbnZhciBfaXNOYU4gPSByb290LmlzTmFOLFxuICAgIF9pc0Zpbml0ZSA9IHJvb3QuaXNGaW5pdGU7XG5cbi8vIE5ha2VkIGZ1bmN0aW9uIHJlZmVyZW5jZSBmb3Igc3Vycm9nYXRlLXByb3RvdHlwZS1zd2FwcGluZy5cbnZhciBDdG9yID0gZnVuY3Rpb24oKXt9O1xuXG4vLyBUaGUgVW5kZXJzY29yZSBvYmplY3QuIEFsbCBleHBvcnRlZCBmdW5jdGlvbnMgYmVsb3cgYXJlIGFkZGVkIHRvIGl0IGluIHRoZVxuLy8gbW9kdWxlcy9pbmRleC1hbGwuanMgdXNpbmcgdGhlIG1peGluIGZ1bmN0aW9uLlxuZXhwb3J0IGRlZmF1bHQgZnVuY3Rpb24gXyhvYmopIHtcbiAgaWYgKG9iaiBpbnN0YW5jZW9mIF8pIHJldHVybiBvYmo7XG4gIGlmICghKHRoaXMgaW5zdGFuY2VvZiBfKSkgcmV0dXJuIG5ldyBfKG9iaik7XG4gIHRoaXMuX3dyYXBwZWQgPSBvYmo7XG59XG5cbi8vIEN1cnJlbnQgdmVyc2lvbi5cbmV4cG9ydCB2YXIgVkVSU0lPTiA9IF8uVkVSU0lPTiA9ICcxLjEwLjInO1xuXG4vLyBJbnRlcm5hbCBmdW5jdGlvbiB0aGF0IHJldHVybnMgYW4gZWZmaWNpZW50IChmb3IgY3VycmVudCBlbmdpbmVzKSB2ZXJzaW9uXG4vLyBvZiB0aGUgcGFzc2VkLWluIGNhbGxiYWNrLCB0byBiZSByZXBlYXRlZGx5IGFwcGxpZWQgaW4gb3RoZXIgVW5kZXJzY29yZVxuLy8gZnVuY3Rpb25zLlxuZnVuY3Rpb24gb3B0aW1pemVDYihmdW5jLCBjb250ZXh0LCBhcmdDb3VudCkge1xuICBpZiAoY29udGV4dCA9PT0gdm9pZCAwKSByZXR1cm4gZnVuYztcbiAgc3dpdGNoIChhcmdDb3VudCA9PSBudWxsID8gMyA6IGFyZ0NvdW50KSB7XG4gICAgY2FzZSAxOiByZXR1cm4gZnVuY3Rpb24odmFsdWUpIHtcbiAgICAgIHJldHVybiBmdW5jLmNhbGwoY29udGV4dCwgdmFsdWUpO1xuICAgIH07XG4gICAgLy8gVGhlIDItYXJndW1lbnQgY2FzZSBpcyBvbWl0dGVkIGJlY2F1c2Ugd2XigJlyZSBub3QgdXNpbmcgaXQuXG4gICAgY2FzZSAzOiByZXR1cm4gZnVuY3Rpb24odmFsdWUsIGluZGV4LCBjb2xsZWN0aW9uKSB7XG4gICAgICByZXR1cm4gZnVuYy5jYWxsKGNvbnRleHQsIHZhbHVlLCBpbmRleCwgY29sbGVjdGlvbik7XG4gICAgfTtcbiAgICBjYXNlIDQ6IHJldHVybiBmdW5jdGlvbihhY2N1bXVsYXRvciwgdmFsdWUsIGluZGV4LCBjb2xsZWN0aW9uKSB7XG4gICAgICByZXR1cm4gZnVuYy5jYWxsKGNvbnRleHQsIGFjY3VtdWxhdG9yLCB2YWx1ZSwgaW5kZXgsIGNvbGxlY3Rpb24pO1xuICAgIH07XG4gIH1cbiAgcmV0dXJuIGZ1bmN0aW9uKCkge1xuICAgIHJldHVybiBmdW5jLmFwcGx5KGNvbnRleHQsIGFyZ3VtZW50cyk7XG4gIH07XG59XG5cbi8vIEFuIGludGVybmFsIGZ1bmN0aW9uIHRvIGdlbmVyYXRlIGNhbGxiYWNrcyB0aGF0IGNhbiBiZSBhcHBsaWVkIHRvIGVhY2hcbi8vIGVsZW1lbnQgaW4gYSBjb2xsZWN0aW9uLCByZXR1cm5pbmcgdGhlIGRlc2lyZWQgcmVzdWx0IOKAlCBlaXRoZXIgYGlkZW50aXR5YCxcbi8vIGFuIGFyYml0cmFyeSBjYWxsYmFjaywgYSBwcm9wZXJ0eSBtYXRjaGVyLCBvciBhIHByb3BlcnR5IGFjY2Vzc29yLlxuZnVuY3Rpb24gYmFzZUl0ZXJhdGVlKHZhbHVlLCBjb250ZXh0LCBhcmdDb3VudCkge1xuICBpZiAodmFsdWUgPT0gbnVsbCkgcmV0dXJuIGlkZW50aXR5O1xuICBpZiAoaXNGdW5jdGlvbih2YWx1ZSkpIHJldHVybiBvcHRpbWl6ZUNiKHZhbHVlLCBjb250ZXh0LCBhcmdDb3VudCk7XG4gIGlmIChpc09iamVjdCh2YWx1ZSkgJiYgIWlzQXJyYXkodmFsdWUpKSByZXR1cm4gbWF0Y2hlcih2YWx1ZSk7XG4gIHJldHVybiBwcm9wZXJ0eSh2YWx1ZSk7XG59XG5cbi8vIEV4dGVybmFsIHdyYXBwZXIgZm9yIG91ciBjYWxsYmFjayBnZW5lcmF0b3IuIFVzZXJzIG1heSBjdXN0b21pemVcbi8vIGBfLml0ZXJhdGVlYCBpZiB0aGV5IHdhbnQgYWRkaXRpb25hbCBwcmVkaWNhdGUvaXRlcmF0ZWUgc2hvcnRoYW5kIHN0eWxlcy5cbi8vIFRoaXMgYWJzdHJhY3Rpb24gaGlkZXMgdGhlIGludGVybmFsLW9ubHkgYXJnQ291bnQgYXJndW1lbnQuXG5fLml0ZXJhdGVlID0gaXRlcmF0ZWU7XG5leHBvcnQgZnVuY3Rpb24gaXRlcmF0ZWUodmFsdWUsIGNvbnRleHQpIHtcbiAgcmV0dXJuIGJhc2VJdGVyYXRlZSh2YWx1ZSwgY29udGV4dCwgSW5maW5pdHkpO1xufVxuXG4vLyBUaGUgZnVuY3Rpb24gd2UgYWN0dWFsbHkgY2FsbCBpbnRlcm5hbGx5LiBJdCBpbnZva2VzIF8uaXRlcmF0ZWUgaWZcbi8vIG92ZXJyaWRkZW4sIG90aGVyd2lzZSBiYXNlSXRlcmF0ZWUuXG5mdW5jdGlvbiBjYih2YWx1ZSwgY29udGV4dCwgYXJnQ291bnQpIHtcbiAgaWYgKF8uaXRlcmF0ZWUgIT09IGl0ZXJhdGVlKSByZXR1cm4gXy5pdGVyYXRlZSh2YWx1ZSwgY29udGV4dCk7XG4gIHJldHVybiBiYXNlSXRlcmF0ZWUodmFsdWUsIGNvbnRleHQsIGFyZ0NvdW50KTtcbn1cblxuLy8gU29tZSBmdW5jdGlvbnMgdGFrZSBhIHZhcmlhYmxlIG51bWJlciBvZiBhcmd1bWVudHMsIG9yIGEgZmV3IGV4cGVjdGVkXG4vLyBhcmd1bWVudHMgYXQgdGhlIGJlZ2lubmluZyBhbmQgdGhlbiBhIHZhcmlhYmxlIG51bWJlciBvZiB2YWx1ZXMgdG8gb3BlcmF0ZVxuLy8gb24uIFRoaXMgaGVscGVyIGFjY3VtdWxhdGVzIGFsbCByZW1haW5pbmcgYXJndW1lbnRzIHBhc3QgdGhlIGZ1bmN0aW9u4oCZc1xuLy8gYXJndW1lbnQgbGVuZ3RoIChvciBhbiBleHBsaWNpdCBgc3RhcnRJbmRleGApLCBpbnRvIGFuIGFycmF5IHRoYXQgYmVjb21lc1xuLy8gdGhlIGxhc3QgYXJndW1lbnQuIFNpbWlsYXIgdG8gRVM24oCZcyBcInJlc3QgcGFyYW1ldGVyXCIuXG5leHBvcnQgZnVuY3Rpb24gcmVzdEFyZ3VtZW50cyhmdW5jLCBzdGFydEluZGV4KSB7XG4gIHN0YXJ0SW5kZXggPSBzdGFydEluZGV4ID09IG51bGwgPyBmdW5jLmxlbmd0aCAtIDEgOiArc3RhcnRJbmRleDtcbiAgcmV0dXJuIGZ1bmN0aW9uKCkge1xuICAgIHZhciBsZW5ndGggPSBNYXRoLm1heChhcmd1bWVudHMubGVuZ3RoIC0gc3RhcnRJbmRleCwgMCksXG4gICAgICAgIHJlc3QgPSBBcnJheShsZW5ndGgpLFxuICAgICAgICBpbmRleCA9IDA7XG4gICAgZm9yICg7IGluZGV4IDwgbGVuZ3RoOyBpbmRleCsrKSB7XG4gICAgICByZXN0W2luZGV4XSA9IGFyZ3VtZW50c1tpbmRleCArIHN0YXJ0SW5kZXhdO1xuICAgIH1cbiAgICBzd2l0Y2ggKHN0YXJ0SW5kZXgpIHtcbiAgICAgIGNhc2UgMDogcmV0dXJuIGZ1bmMuY2FsbCh0aGlzLCByZXN0KTtcbiAgICAgIGNhc2UgMTogcmV0dXJuIGZ1bmMuY2FsbCh0aGlzLCBhcmd1bWVudHNbMF0sIHJlc3QpO1xuICAgICAgY2FzZSAyOiByZXR1cm4gZnVuYy5jYWxsKHRoaXMsIGFyZ3VtZW50c1swXSwgYXJndW1lbnRzWzFdLCByZXN0KTtcbiAgICB9XG4gICAgdmFyIGFyZ3MgPSBBcnJheShzdGFydEluZGV4ICsgMSk7XG4gICAgZm9yIChpbmRleCA9IDA7IGluZGV4IDwgc3RhcnRJbmRleDsgaW5kZXgrKykge1xuICAgICAgYXJnc1tpbmRleF0gPSBhcmd1bWVudHNbaW5kZXhdO1xuICAgIH1cbiAgICBhcmdzW3N0YXJ0SW5kZXhdID0gcmVzdDtcbiAgICByZXR1cm4gZnVuYy5hcHBseSh0aGlzLCBhcmdzKTtcbiAgfTtcbn1cblxuLy8gQW4gaW50ZXJuYWwgZnVuY3Rpb24gZm9yIGNyZWF0aW5nIGEgbmV3IG9iamVjdCB0aGF0IGluaGVyaXRzIGZyb20gYW5vdGhlci5cbmZ1bmN0aW9uIGJhc2VDcmVhdGUocHJvdG90eXBlKSB7XG4gIGlmICghaXNPYmplY3QocHJvdG90eXBlKSkgcmV0dXJuIHt9O1xuICBpZiAobmF0aXZlQ3JlYXRlKSByZXR1cm4gbmF0aXZlQ3JlYXRlKHByb3RvdHlwZSk7XG4gIEN0b3IucHJvdG90eXBlID0gcHJvdG90eXBlO1xuICB2YXIgcmVzdWx0ID0gbmV3IEN0b3I7XG4gIEN0b3IucHJvdG90eXBlID0gbnVsbDtcbiAgcmV0dXJuIHJlc3VsdDtcbn1cblxuZnVuY3Rpb24gc2hhbGxvd1Byb3BlcnR5KGtleSkge1xuICByZXR1cm4gZnVuY3Rpb24ob2JqKSB7XG4gICAgcmV0dXJuIG9iaiA9PSBudWxsID8gdm9pZCAwIDogb2JqW2tleV07XG4gIH07XG59XG5cbmZ1bmN0aW9uIF9oYXMob2JqLCBwYXRoKSB7XG4gIHJldHVybiBvYmogIT0gbnVsbCAmJiBoYXNPd25Qcm9wZXJ0eS5jYWxsKG9iaiwgcGF0aCk7XG59XG5cbmZ1bmN0aW9uIGRlZXBHZXQob2JqLCBwYXRoKSB7XG4gIHZhciBsZW5ndGggPSBwYXRoLmxlbmd0aDtcbiAgZm9yICh2YXIgaSA9IDA7IGkgPCBsZW5ndGg7IGkrKykge1xuICAgIGlmIChvYmogPT0gbnVsbCkgcmV0dXJuIHZvaWQgMDtcbiAgICBvYmogPSBvYmpbcGF0aFtpXV07XG4gIH1cbiAgcmV0dXJuIGxlbmd0aCA/IG9iaiA6IHZvaWQgMDtcbn1cblxuLy8gSGVscGVyIGZvciBjb2xsZWN0aW9uIG1ldGhvZHMgdG8gZGV0ZXJtaW5lIHdoZXRoZXIgYSBjb2xsZWN0aW9uXG4vLyBzaG91bGQgYmUgaXRlcmF0ZWQgYXMgYW4gYXJyYXkgb3IgYXMgYW4gb2JqZWN0LlxuLy8gUmVsYXRlZDogaHR0cHM6Ly9wZW9wbGUubW96aWxsYS5vcmcvfmpvcmVuZG9yZmYvZXM2LWRyYWZ0Lmh0bWwjc2VjLXRvbGVuZ3RoXG4vLyBBdm9pZHMgYSB2ZXJ5IG5hc3R5IGlPUyA4IEpJVCBidWcgb24gQVJNLTY0LiAjMjA5NFxudmFyIE1BWF9BUlJBWV9JTkRFWCA9IE1hdGgucG93KDIsIDUzKSAtIDE7XG52YXIgZ2V0TGVuZ3RoID0gc2hhbGxvd1Byb3BlcnR5KCdsZW5ndGgnKTtcbmZ1bmN0aW9uIGlzQXJyYXlMaWtlKGNvbGxlY3Rpb24pIHtcbiAgdmFyIGxlbmd0aCA9IGdldExlbmd0aChjb2xsZWN0aW9uKTtcbiAgcmV0dXJuIHR5cGVvZiBsZW5ndGggPT0gJ251bWJlcicgJiYgbGVuZ3RoID49IDAgJiYgbGVuZ3RoIDw9IE1BWF9BUlJBWV9JTkRFWDtcbn1cblxuLy8gQ29sbGVjdGlvbiBGdW5jdGlvbnNcbi8vIC0tLS0tLS0tLS0tLS0tLS0tLS0tXG5cbi8vIFRoZSBjb3JuZXJzdG9uZSwgYW4gYGVhY2hgIGltcGxlbWVudGF0aW9uLCBha2EgYGZvckVhY2hgLlxuLy8gSGFuZGxlcyByYXcgb2JqZWN0cyBpbiBhZGRpdGlvbiB0byBhcnJheS1saWtlcy4gVHJlYXRzIGFsbFxuLy8gc3BhcnNlIGFycmF5LWxpa2VzIGFzIGlmIHRoZXkgd2VyZSBkZW5zZS5cbmV4cG9ydCBmdW5jdGlvbiBlYWNoKG9iaiwgaXRlcmF0ZWUsIGNvbnRleHQpIHtcbiAgaXRlcmF0ZWUgPSBvcHRpbWl6ZUNiKGl0ZXJhdGVlLCBjb250ZXh0KTtcbiAgdmFyIGksIGxlbmd0aDtcbiAgaWYgKGlzQXJyYXlMaWtlKG9iaikpIHtcbiAgICBmb3IgKGkgPSAwLCBsZW5ndGggPSBvYmoubGVuZ3RoOyBpIDwgbGVuZ3RoOyBpKyspIHtcbiAgICAgIGl0ZXJhdGVlKG9ialtpXSwgaSwgb2JqKTtcbiAgICB9XG4gIH0gZWxzZSB7XG4gICAgdmFyIF9rZXlzID0ga2V5cyhvYmopO1xuICAgIGZvciAoaSA9IDAsIGxlbmd0aCA9IF9rZXlzLmxlbmd0aDsgaSA8IGxlbmd0aDsgaSsrKSB7XG4gICAgICBpdGVyYXRlZShvYmpbX2tleXNbaV1dLCBfa2V5c1tpXSwgb2JqKTtcbiAgICB9XG4gIH1cbiAgcmV0dXJuIG9iajtcbn1cbmV4cG9ydCB7IGVhY2ggYXMgZm9yRWFjaCB9O1xuXG4vLyBSZXR1cm4gdGhlIHJlc3VsdHMgb2YgYXBwbHlpbmcgdGhlIGl0ZXJhdGVlIHRvIGVhY2ggZWxlbWVudC5cbmV4cG9ydCBmdW5jdGlvbiBtYXAob2JqLCBpdGVyYXRlZSwgY29udGV4dCkge1xuICBpdGVyYXRlZSA9IGNiKGl0ZXJhdGVlLCBjb250ZXh0KTtcbiAgdmFyIF9rZXlzID0gIWlzQXJyYXlMaWtlKG9iaikgJiYga2V5cyhvYmopLFxuICAgICAgbGVuZ3RoID0gKF9rZXlzIHx8IG9iaikubGVuZ3RoLFxuICAgICAgcmVzdWx0cyA9IEFycmF5KGxlbmd0aCk7XG4gIGZvciAodmFyIGluZGV4ID0gMDsgaW5kZXggPCBsZW5ndGg7IGluZGV4KyspIHtcbiAgICB2YXIgY3VycmVudEtleSA9IF9rZXlzID8gX2tleXNbaW5kZXhdIDogaW5kZXg7XG4gICAgcmVzdWx0c1tpbmRleF0gPSBpdGVyYXRlZShvYmpbY3VycmVudEtleV0sIGN1cnJlbnRLZXksIG9iaik7XG4gIH1cbiAgcmV0dXJuIHJlc3VsdHM7XG59XG5leHBvcnQgeyBtYXAgYXMgY29sbGVjdCB9O1xuXG4vLyBDcmVhdGUgYSByZWR1Y2luZyBmdW5jdGlvbiBpdGVyYXRpbmcgbGVmdCBvciByaWdodC5cbmZ1bmN0aW9uIGNyZWF0ZVJlZHVjZShkaXIpIHtcbiAgLy8gV3JhcCBjb2RlIHRoYXQgcmVhc3NpZ25zIGFyZ3VtZW50IHZhcmlhYmxlcyBpbiBhIHNlcGFyYXRlIGZ1bmN0aW9uIHRoYW5cbiAgLy8gdGhlIG9uZSB0aGF0IGFjY2Vzc2VzIGBhcmd1bWVudHMubGVuZ3RoYCB0byBhdm9pZCBhIHBlcmYgaGl0LiAoIzE5OTEpXG4gIHZhciByZWR1Y2VyID0gZnVuY3Rpb24ob2JqLCBpdGVyYXRlZSwgbWVtbywgaW5pdGlhbCkge1xuICAgIHZhciBfa2V5cyA9ICFpc0FycmF5TGlrZShvYmopICYmIGtleXMob2JqKSxcbiAgICAgICAgbGVuZ3RoID0gKF9rZXlzIHx8IG9iaikubGVuZ3RoLFxuICAgICAgICBpbmRleCA9IGRpciA+IDAgPyAwIDogbGVuZ3RoIC0gMTtcbiAgICBpZiAoIWluaXRpYWwpIHtcbiAgICAgIG1lbW8gPSBvYmpbX2tleXMgPyBfa2V5c1tpbmRleF0gOiBpbmRleF07XG4gICAgICBpbmRleCArPSBkaXI7XG4gICAgfVxuICAgIGZvciAoOyBpbmRleCA+PSAwICYmIGluZGV4IDwgbGVuZ3RoOyBpbmRleCArPSBkaXIpIHtcbiAgICAgIHZhciBjdXJyZW50S2V5ID0gX2tleXMgPyBfa2V5c1tpbmRleF0gOiBpbmRleDtcbiAgICAgIG1lbW8gPSBpdGVyYXRlZShtZW1vLCBvYmpbY3VycmVudEtleV0sIGN1cnJlbnRLZXksIG9iaik7XG4gICAgfVxuICAgIHJldHVybiBtZW1vO1xuICB9O1xuXG4gIHJldHVybiBmdW5jdGlvbihvYmosIGl0ZXJhdGVlLCBtZW1vLCBjb250ZXh0KSB7XG4gICAgdmFyIGluaXRpYWwgPSBhcmd1bWVudHMubGVuZ3RoID49IDM7XG4gICAgcmV0dXJuIHJlZHVjZXIob2JqLCBvcHRpbWl6ZUNiKGl0ZXJhdGVlLCBjb250ZXh0LCA0KSwgbWVtbywgaW5pdGlhbCk7XG4gIH07XG59XG5cbi8vICoqUmVkdWNlKiogYnVpbGRzIHVwIGEgc2luZ2xlIHJlc3VsdCBmcm9tIGEgbGlzdCBvZiB2YWx1ZXMsIGFrYSBgaW5qZWN0YCxcbi8vIG9yIGBmb2xkbGAuXG5leHBvcnQgdmFyIHJlZHVjZSA9IGNyZWF0ZVJlZHVjZSgxKTtcbmV4cG9ydCB7IHJlZHVjZSBhcyBmb2xkbCwgcmVkdWNlIGFzIGluamVjdCB9O1xuXG4vLyBUaGUgcmlnaHQtYXNzb2NpYXRpdmUgdmVyc2lvbiBvZiByZWR1Y2UsIGFsc28ga25vd24gYXMgYGZvbGRyYC5cbmV4cG9ydCB2YXIgcmVkdWNlUmlnaHQgPSBjcmVhdGVSZWR1Y2UoLTEpO1xuZXhwb3J0IHsgcmVkdWNlUmlnaHQgYXMgZm9sZHIgfTtcblxuLy8gUmV0dXJuIHRoZSBmaXJzdCB2YWx1ZSB3aGljaCBwYXNzZXMgYSB0cnV0aCB0ZXN0LlxuZXhwb3J0IGZ1bmN0aW9uIGZpbmQob2JqLCBwcmVkaWNhdGUsIGNvbnRleHQpIHtcbiAgdmFyIGtleUZpbmRlciA9IGlzQXJyYXlMaWtlKG9iaikgPyBmaW5kSW5kZXggOiBmaW5kS2V5O1xuICB2YXIga2V5ID0ga2V5RmluZGVyKG9iaiwgcHJlZGljYXRlLCBjb250ZXh0KTtcbiAgaWYgKGtleSAhPT0gdm9pZCAwICYmIGtleSAhPT0gLTEpIHJldHVybiBvYmpba2V5XTtcbn1cbmV4cG9ydCB7IGZpbmQgYXMgZGV0ZWN0IH07XG5cbi8vIFJldHVybiBhbGwgdGhlIGVsZW1lbnRzIHRoYXQgcGFzcyBhIHRydXRoIHRlc3QuXG5leHBvcnQgZnVuY3Rpb24gZmlsdGVyKG9iaiwgcHJlZGljYXRlLCBjb250ZXh0KSB7XG4gIHZhciByZXN1bHRzID0gW107XG4gIHByZWRpY2F0ZSA9IGNiKHByZWRpY2F0ZSwgY29udGV4dCk7XG4gIGVhY2gob2JqLCBmdW5jdGlvbih2YWx1ZSwgaW5kZXgsIGxpc3QpIHtcbiAgICBpZiAocHJlZGljYXRlKHZhbHVlLCBpbmRleCwgbGlzdCkpIHJlc3VsdHMucHVzaCh2YWx1ZSk7XG4gIH0pO1xuICByZXR1cm4gcmVzdWx0cztcbn1cbmV4cG9ydCB7IGZpbHRlciBhcyBzZWxlY3QgfTtcblxuLy8gUmV0dXJuIGFsbCB0aGUgZWxlbWVudHMgZm9yIHdoaWNoIGEgdHJ1dGggdGVzdCBmYWlscy5cbmV4cG9ydCBmdW5jdGlvbiByZWplY3Qob2JqLCBwcmVkaWNhdGUsIGNvbnRleHQpIHtcbiAgcmV0dXJuIGZpbHRlcihvYmosIG5lZ2F0ZShjYihwcmVkaWNhdGUpKSwgY29udGV4dCk7XG59XG5cbi8vIERldGVybWluZSB3aGV0aGVyIGFsbCBvZiB0aGUgZWxlbWVudHMgbWF0Y2ggYSB0cnV0aCB0ZXN0LlxuZXhwb3J0IGZ1bmN0aW9uIGV2ZXJ5KG9iaiwgcHJlZGljYXRlLCBjb250ZXh0KSB7XG4gIHByZWRpY2F0ZSA9IGNiKHByZWRpY2F0ZSwgY29udGV4dCk7XG4gIHZhciBfa2V5cyA9ICFpc0FycmF5TGlrZShvYmopICYmIGtleXMob2JqKSxcbiAgICAgIGxlbmd0aCA9IChfa2V5cyB8fCBvYmopLmxlbmd0aDtcbiAgZm9yICh2YXIgaW5kZXggPSAwOyBpbmRleCA8IGxlbmd0aDsgaW5kZXgrKykge1xuICAgIHZhciBjdXJyZW50S2V5ID0gX2tleXMgPyBfa2V5c1tpbmRleF0gOiBpbmRleDtcbiAgICBpZiAoIXByZWRpY2F0ZShvYmpbY3VycmVudEtleV0sIGN1cnJlbnRLZXksIG9iaikpIHJldHVybiBmYWxzZTtcbiAgfVxuICByZXR1cm4gdHJ1ZTtcbn1cbmV4cG9ydCB7IGV2ZXJ5IGFzIGFsbCB9O1xuXG4vLyBEZXRlcm1pbmUgaWYgYXQgbGVhc3Qgb25lIGVsZW1lbnQgaW4gdGhlIG9iamVjdCBtYXRjaGVzIGEgdHJ1dGggdGVzdC5cbmV4cG9ydCBmdW5jdGlvbiBzb21lKG9iaiwgcHJlZGljYXRlLCBjb250ZXh0KSB7XG4gIHByZWRpY2F0ZSA9IGNiKHByZWRpY2F0ZSwgY29udGV4dCk7XG4gIHZhciBfa2V5cyA9ICFpc0FycmF5TGlrZShvYmopICYmIGtleXMob2JqKSxcbiAgICAgIGxlbmd0aCA9IChfa2V5cyB8fCBvYmopLmxlbmd0aDtcbiAgZm9yICh2YXIgaW5kZXggPSAwOyBpbmRleCA8IGxlbmd0aDsgaW5kZXgrKykge1xuICAgIHZhciBjdXJyZW50S2V5ID0gX2tleXMgPyBfa2V5c1tpbmRleF0gOiBpbmRleDtcbiAgICBpZiAocHJlZGljYXRlKG9ialtjdXJyZW50S2V5XSwgY3VycmVudEtleSwgb2JqKSkgcmV0dXJuIHRydWU7XG4gIH1cbiAgcmV0dXJuIGZhbHNlO1xufVxuZXhwb3J0IHsgc29tZSBhcyBhbnkgfTtcblxuLy8gRGV0ZXJtaW5lIGlmIHRoZSBhcnJheSBvciBvYmplY3QgY29udGFpbnMgYSBnaXZlbiBpdGVtICh1c2luZyBgPT09YCkuXG5leHBvcnQgZnVuY3Rpb24gY29udGFpbnMob2JqLCBpdGVtLCBmcm9tSW5kZXgsIGd1YXJkKSB7XG4gIGlmICghaXNBcnJheUxpa2Uob2JqKSkgb2JqID0gdmFsdWVzKG9iaik7XG4gIGlmICh0eXBlb2YgZnJvbUluZGV4ICE9ICdudW1iZXInIHx8IGd1YXJkKSBmcm9tSW5kZXggPSAwO1xuICByZXR1cm4gaW5kZXhPZihvYmosIGl0ZW0sIGZyb21JbmRleCkgPj0gMDtcbn1cbmV4cG9ydCB7IGNvbnRhaW5zIGFzIGluY2x1ZGVzLCBjb250YWlucyBhcyBpbmNsdWRlIH07XG5cbi8vIEludm9rZSBhIG1ldGhvZCAod2l0aCBhcmd1bWVudHMpIG9uIGV2ZXJ5IGl0ZW0gaW4gYSBjb2xsZWN0aW9uLlxuZXhwb3J0IHZhciBpbnZva2UgPSByZXN0QXJndW1lbnRzKGZ1bmN0aW9uKG9iaiwgcGF0aCwgYXJncykge1xuICB2YXIgY29udGV4dFBhdGgsIGZ1bmM7XG4gIGlmIChpc0Z1bmN0aW9uKHBhdGgpKSB7XG4gICAgZnVuYyA9IHBhdGg7XG4gIH0gZWxzZSBpZiAoaXNBcnJheShwYXRoKSkge1xuICAgIGNvbnRleHRQYXRoID0gcGF0aC5zbGljZSgwLCAtMSk7XG4gICAgcGF0aCA9IHBhdGhbcGF0aC5sZW5ndGggLSAxXTtcbiAgfVxuICByZXR1cm4gbWFwKG9iaiwgZnVuY3Rpb24oY29udGV4dCkge1xuICAgIHZhciBtZXRob2QgPSBmdW5jO1xuICAgIGlmICghbWV0aG9kKSB7XG4gICAgICBpZiAoY29udGV4dFBhdGggJiYgY29udGV4dFBhdGgubGVuZ3RoKSB7XG4gICAgICAgIGNvbnRleHQgPSBkZWVwR2V0KGNvbnRleHQsIGNvbnRleHRQYXRoKTtcbiAgICAgIH1cbiAgICAgIGlmIChjb250ZXh0ID09IG51bGwpIHJldHVybiB2b2lkIDA7XG4gICAgICBtZXRob2QgPSBjb250ZXh0W3BhdGhdO1xuICAgIH1cbiAgICByZXR1cm4gbWV0aG9kID09IG51bGwgPyBtZXRob2QgOiBtZXRob2QuYXBwbHkoY29udGV4dCwgYXJncyk7XG4gIH0pO1xufSk7XG5cbi8vIENvbnZlbmllbmNlIHZlcnNpb24gb2YgYSBjb21tb24gdXNlIGNhc2Ugb2YgYG1hcGA6IGZldGNoaW5nIGEgcHJvcGVydHkuXG5leHBvcnQgZnVuY3Rpb24gcGx1Y2sob2JqLCBrZXkpIHtcbiAgcmV0dXJuIG1hcChvYmosIHByb3BlcnR5KGtleSkpO1xufVxuXG4vLyBDb252ZW5pZW5jZSB2ZXJzaW9uIG9mIGEgY29tbW9uIHVzZSBjYXNlIG9mIGBmaWx0ZXJgOiBzZWxlY3Rpbmcgb25seSBvYmplY3RzXG4vLyBjb250YWluaW5nIHNwZWNpZmljIGBrZXk6dmFsdWVgIHBhaXJzLlxuZXhwb3J0IGZ1bmN0aW9uIHdoZXJlKG9iaiwgYXR0cnMpIHtcbiAgcmV0dXJuIGZpbHRlcihvYmosIG1hdGNoZXIoYXR0cnMpKTtcbn1cblxuLy8gQ29udmVuaWVuY2UgdmVyc2lvbiBvZiBhIGNvbW1vbiB1c2UgY2FzZSBvZiBgZmluZGA6IGdldHRpbmcgdGhlIGZpcnN0IG9iamVjdFxuLy8gY29udGFpbmluZyBzcGVjaWZpYyBga2V5OnZhbHVlYCBwYWlycy5cbmV4cG9ydCBmdW5jdGlvbiBmaW5kV2hlcmUob2JqLCBhdHRycykge1xuICByZXR1cm4gZmluZChvYmosIG1hdGNoZXIoYXR0cnMpKTtcbn1cblxuLy8gUmV0dXJuIHRoZSBtYXhpbXVtIGVsZW1lbnQgKG9yIGVsZW1lbnQtYmFzZWQgY29tcHV0YXRpb24pLlxuZXhwb3J0IGZ1bmN0aW9uIG1heChvYmosIGl0ZXJhdGVlLCBjb250ZXh0KSB7XG4gIHZhciByZXN1bHQgPSAtSW5maW5pdHksIGxhc3RDb21wdXRlZCA9IC1JbmZpbml0eSxcbiAgICAgIHZhbHVlLCBjb21wdXRlZDtcbiAgaWYgKGl0ZXJhdGVlID09IG51bGwgfHwgdHlwZW9mIGl0ZXJhdGVlID09ICdudW1iZXInICYmIHR5cGVvZiBvYmpbMF0gIT0gJ29iamVjdCcgJiYgb2JqICE9IG51bGwpIHtcbiAgICBvYmogPSBpc0FycmF5TGlrZShvYmopID8gb2JqIDogdmFsdWVzKG9iaik7XG4gICAgZm9yICh2YXIgaSA9IDAsIGxlbmd0aCA9IG9iai5sZW5ndGg7IGkgPCBsZW5ndGg7IGkrKykge1xuICAgICAgdmFsdWUgPSBvYmpbaV07XG4gICAgICBpZiAodmFsdWUgIT0gbnVsbCAmJiB2YWx1ZSA+IHJlc3VsdCkge1xuICAgICAgICByZXN1bHQgPSB2YWx1ZTtcbiAgICAgIH1cbiAgICB9XG4gIH0gZWxzZSB7XG4gICAgaXRlcmF0ZWUgPSBjYihpdGVyYXRlZSwgY29udGV4dCk7XG4gICAgZWFjaChvYmosIGZ1bmN0aW9uKHYsIGluZGV4LCBsaXN0KSB7XG4gICAgICBjb21wdXRlZCA9IGl0ZXJhdGVlKHYsIGluZGV4LCBsaXN0KTtcbiAgICAgIGlmIChjb21wdXRlZCA+IGxhc3RDb21wdXRlZCB8fCBjb21wdXRlZCA9PT0gLUluZmluaXR5ICYmIHJlc3VsdCA9PT0gLUluZmluaXR5KSB7XG4gICAgICAgIHJlc3VsdCA9IHY7XG4gICAgICAgIGxhc3RDb21wdXRlZCA9IGNvbXB1dGVkO1xuICAgICAgfVxuICAgIH0pO1xuICB9XG4gIHJldHVybiByZXN1bHQ7XG59XG5cbi8vIFJldHVybiB0aGUgbWluaW11bSBlbGVtZW50IChvciBlbGVtZW50LWJhc2VkIGNvbXB1dGF0aW9uKS5cbmV4cG9ydCBmdW5jdGlvbiBtaW4ob2JqLCBpdGVyYXRlZSwgY29udGV4dCkge1xuICB2YXIgcmVzdWx0ID0gSW5maW5pdHksIGxhc3RDb21wdXRlZCA9IEluZmluaXR5LFxuICAgICAgdmFsdWUsIGNvbXB1dGVkO1xuICBpZiAoaXRlcmF0ZWUgPT0gbnVsbCB8fCB0eXBlb2YgaXRlcmF0ZWUgPT0gJ251bWJlcicgJiYgdHlwZW9mIG9ialswXSAhPSAnb2JqZWN0JyAmJiBvYmogIT0gbnVsbCkge1xuICAgIG9iaiA9IGlzQXJyYXlMaWtlKG9iaikgPyBvYmogOiB2YWx1ZXMob2JqKTtcbiAgICBmb3IgKHZhciBpID0gMCwgbGVuZ3RoID0gb2JqLmxlbmd0aDsgaSA8IGxlbmd0aDsgaSsrKSB7XG4gICAgICB2YWx1ZSA9IG9ialtpXTtcbiAgICAgIGlmICh2YWx1ZSAhPSBudWxsICYmIHZhbHVlIDwgcmVzdWx0KSB7XG4gICAgICAgIHJlc3VsdCA9IHZhbHVlO1xuICAgICAgfVxuICAgIH1cbiAgfSBlbHNlIHtcbiAgICBpdGVyYXRlZSA9IGNiKGl0ZXJhdGVlLCBjb250ZXh0KTtcbiAgICBlYWNoKG9iaiwgZnVuY3Rpb24odiwgaW5kZXgsIGxpc3QpIHtcbiAgICAgIGNvbXB1dGVkID0gaXRlcmF0ZWUodiwgaW5kZXgsIGxpc3QpO1xuICAgICAgaWYgKGNvbXB1dGVkIDwgbGFzdENvbXB1dGVkIHx8IGNvbXB1dGVkID09PSBJbmZpbml0eSAmJiByZXN1bHQgPT09IEluZmluaXR5KSB7XG4gICAgICAgIHJlc3VsdCA9IHY7XG4gICAgICAgIGxhc3RDb21wdXRlZCA9IGNvbXB1dGVkO1xuICAgICAgfVxuICAgIH0pO1xuICB9XG4gIHJldHVybiByZXN1bHQ7XG59XG5cbi8vIFNodWZmbGUgYSBjb2xsZWN0aW9uLlxuZXhwb3J0IGZ1bmN0aW9uIHNodWZmbGUob2JqKSB7XG4gIHJldHVybiBzYW1wbGUob2JqLCBJbmZpbml0eSk7XG59XG5cbi8vIFNhbXBsZSAqKm4qKiByYW5kb20gdmFsdWVzIGZyb20gYSBjb2xsZWN0aW9uIHVzaW5nIHRoZSBtb2Rlcm4gdmVyc2lvbiBvZiB0aGVcbi8vIFtGaXNoZXItWWF0ZXMgc2h1ZmZsZV0oaHR0cHM6Ly9lbi53aWtpcGVkaWEub3JnL3dpa2kvRmlzaGVy4oCTWWF0ZXNfc2h1ZmZsZSkuXG4vLyBJZiAqKm4qKiBpcyBub3Qgc3BlY2lmaWVkLCByZXR1cm5zIGEgc2luZ2xlIHJhbmRvbSBlbGVtZW50LlxuLy8gVGhlIGludGVybmFsIGBndWFyZGAgYXJndW1lbnQgYWxsb3dzIGl0IHRvIHdvcmsgd2l0aCBgbWFwYC5cbmV4cG9ydCBmdW5jdGlvbiBzYW1wbGUob2JqLCBuLCBndWFyZCkge1xuICBpZiAobiA9PSBudWxsIHx8IGd1YXJkKSB7XG4gICAgaWYgKCFpc0FycmF5TGlrZShvYmopKSBvYmogPSB2YWx1ZXMob2JqKTtcbiAgICByZXR1cm4gb2JqW3JhbmRvbShvYmoubGVuZ3RoIC0gMSldO1xuICB9XG4gIHZhciBzYW1wbGUgPSBpc0FycmF5TGlrZShvYmopID8gY2xvbmUob2JqKSA6IHZhbHVlcyhvYmopO1xuICB2YXIgbGVuZ3RoID0gZ2V0TGVuZ3RoKHNhbXBsZSk7XG4gIG4gPSBNYXRoLm1heChNYXRoLm1pbihuLCBsZW5ndGgpLCAwKTtcbiAgdmFyIGxhc3QgPSBsZW5ndGggLSAxO1xuICBmb3IgKHZhciBpbmRleCA9IDA7IGluZGV4IDwgbjsgaW5kZXgrKykge1xuICAgIHZhciByYW5kID0gcmFuZG9tKGluZGV4LCBsYXN0KTtcbiAgICB2YXIgdGVtcCA9IHNhbXBsZVtpbmRleF07XG4gICAgc2FtcGxlW2luZGV4XSA9IHNhbXBsZVtyYW5kXTtcbiAgICBzYW1wbGVbcmFuZF0gPSB0ZW1wO1xuICB9XG4gIHJldHVybiBzYW1wbGUuc2xpY2UoMCwgbik7XG59XG5cbi8vIFNvcnQgdGhlIG9iamVjdCdzIHZhbHVlcyBieSBhIGNyaXRlcmlvbiBwcm9kdWNlZCBieSBhbiBpdGVyYXRlZS5cbmV4cG9ydCBmdW5jdGlvbiBzb3J0Qnkob2JqLCBpdGVyYXRlZSwgY29udGV4dCkge1xuICB2YXIgaW5kZXggPSAwO1xuICBpdGVyYXRlZSA9IGNiKGl0ZXJhdGVlLCBjb250ZXh0KTtcbiAgcmV0dXJuIHBsdWNrKG1hcChvYmosIGZ1bmN0aW9uKHZhbHVlLCBrZXksIGxpc3QpIHtcbiAgICByZXR1cm4ge1xuICAgICAgdmFsdWU6IHZhbHVlLFxuICAgICAgaW5kZXg6IGluZGV4KyssXG4gICAgICBjcml0ZXJpYTogaXRlcmF0ZWUodmFsdWUsIGtleSwgbGlzdClcbiAgICB9O1xuICB9KS5zb3J0KGZ1bmN0aW9uKGxlZnQsIHJpZ2h0KSB7XG4gICAgdmFyIGEgPSBsZWZ0LmNyaXRlcmlhO1xuICAgIHZhciBiID0gcmlnaHQuY3JpdGVyaWE7XG4gICAgaWYgKGEgIT09IGIpIHtcbiAgICAgIGlmIChhID4gYiB8fCBhID09PSB2b2lkIDApIHJldHVybiAxO1xuICAgICAgaWYgKGEgPCBiIHx8IGIgPT09IHZvaWQgMCkgcmV0dXJuIC0xO1xuICAgIH1cbiAgICByZXR1cm4gbGVmdC5pbmRleCAtIHJpZ2h0LmluZGV4O1xuICB9KSwgJ3ZhbHVlJyk7XG59XG5cbi8vIEFuIGludGVybmFsIGZ1bmN0aW9uIHVzZWQgZm9yIGFnZ3JlZ2F0ZSBcImdyb3VwIGJ5XCIgb3BlcmF0aW9ucy5cbmZ1bmN0aW9uIGdyb3VwKGJlaGF2aW9yLCBwYXJ0aXRpb24pIHtcbiAgcmV0dXJuIGZ1bmN0aW9uKG9iaiwgaXRlcmF0ZWUsIGNvbnRleHQpIHtcbiAgICB2YXIgcmVzdWx0ID0gcGFydGl0aW9uID8gW1tdLCBbXV0gOiB7fTtcbiAgICBpdGVyYXRlZSA9IGNiKGl0ZXJhdGVlLCBjb250ZXh0KTtcbiAgICBlYWNoKG9iaiwgZnVuY3Rpb24odmFsdWUsIGluZGV4KSB7XG4gICAgICB2YXIga2V5ID0gaXRlcmF0ZWUodmFsdWUsIGluZGV4LCBvYmopO1xuICAgICAgYmVoYXZpb3IocmVzdWx0LCB2YWx1ZSwga2V5KTtcbiAgICB9KTtcbiAgICByZXR1cm4gcmVzdWx0O1xuICB9O1xufVxuXG4vLyBHcm91cHMgdGhlIG9iamVjdCdzIHZhbHVlcyBieSBhIGNyaXRlcmlvbi4gUGFzcyBlaXRoZXIgYSBzdHJpbmcgYXR0cmlidXRlXG4vLyB0byBncm91cCBieSwgb3IgYSBmdW5jdGlvbiB0aGF0IHJldHVybnMgdGhlIGNyaXRlcmlvbi5cbmV4cG9ydCB2YXIgZ3JvdXBCeSA9IGdyb3VwKGZ1bmN0aW9uKHJlc3VsdCwgdmFsdWUsIGtleSkge1xuICBpZiAoX2hhcyhyZXN1bHQsIGtleSkpIHJlc3VsdFtrZXldLnB1c2godmFsdWUpOyBlbHNlIHJlc3VsdFtrZXldID0gW3ZhbHVlXTtcbn0pO1xuXG4vLyBJbmRleGVzIHRoZSBvYmplY3QncyB2YWx1ZXMgYnkgYSBjcml0ZXJpb24sIHNpbWlsYXIgdG8gYGdyb3VwQnlgLCBidXQgZm9yXG4vLyB3aGVuIHlvdSBrbm93IHRoYXQgeW91ciBpbmRleCB2YWx1ZXMgd2lsbCBiZSB1bmlxdWUuXG5leHBvcnQgdmFyIGluZGV4QnkgPSBncm91cChmdW5jdGlvbihyZXN1bHQsIHZhbHVlLCBrZXkpIHtcbiAgcmVzdWx0W2tleV0gPSB2YWx1ZTtcbn0pO1xuXG4vLyBDb3VudHMgaW5zdGFuY2VzIG9mIGFuIG9iamVjdCB0aGF0IGdyb3VwIGJ5IGEgY2VydGFpbiBjcml0ZXJpb24uIFBhc3Ncbi8vIGVpdGhlciBhIHN0cmluZyBhdHRyaWJ1dGUgdG8gY291bnQgYnksIG9yIGEgZnVuY3Rpb24gdGhhdCByZXR1cm5zIHRoZVxuLy8gY3JpdGVyaW9uLlxuZXhwb3J0IHZhciBjb3VudEJ5ID0gZ3JvdXAoZnVuY3Rpb24ocmVzdWx0LCB2YWx1ZSwga2V5KSB7XG4gIGlmIChfaGFzKHJlc3VsdCwga2V5KSkgcmVzdWx0W2tleV0rKzsgZWxzZSByZXN1bHRba2V5XSA9IDE7XG59KTtcblxudmFyIHJlU3RyU3ltYm9sID0gL1teXFx1ZDgwMC1cXHVkZmZmXXxbXFx1ZDgwMC1cXHVkYmZmXVtcXHVkYzAwLVxcdWRmZmZdfFtcXHVkODAwLVxcdWRmZmZdL2c7XG4vLyBTYWZlbHkgY3JlYXRlIGEgcmVhbCwgbGl2ZSBhcnJheSBmcm9tIGFueXRoaW5nIGl0ZXJhYmxlLlxuZXhwb3J0IGZ1bmN0aW9uIHRvQXJyYXkob2JqKSB7XG4gIGlmICghb2JqKSByZXR1cm4gW107XG4gIGlmIChpc0FycmF5KG9iaikpIHJldHVybiBzbGljZS5jYWxsKG9iaik7XG4gIGlmIChpc1N0cmluZyhvYmopKSB7XG4gICAgLy8gS2VlcCBzdXJyb2dhdGUgcGFpciBjaGFyYWN0ZXJzIHRvZ2V0aGVyXG4gICAgcmV0dXJuIG9iai5tYXRjaChyZVN0clN5bWJvbCk7XG4gIH1cbiAgaWYgKGlzQXJyYXlMaWtlKG9iaikpIHJldHVybiBtYXAob2JqLCBpZGVudGl0eSk7XG4gIHJldHVybiB2YWx1ZXMob2JqKTtcbn1cblxuLy8gUmV0dXJuIHRoZSBudW1iZXIgb2YgZWxlbWVudHMgaW4gYW4gb2JqZWN0LlxuZXhwb3J0IGZ1bmN0aW9uIHNpemUob2JqKSB7XG4gIGlmIChvYmogPT0gbnVsbCkgcmV0dXJuIDA7XG4gIHJldHVybiBpc0FycmF5TGlrZShvYmopID8gb2JqLmxlbmd0aCA6IGtleXMob2JqKS5sZW5ndGg7XG59XG5cbi8vIFNwbGl0IGEgY29sbGVjdGlvbiBpbnRvIHR3byBhcnJheXM6IG9uZSB3aG9zZSBlbGVtZW50cyBhbGwgc2F0aXNmeSB0aGUgZ2l2ZW5cbi8vIHByZWRpY2F0ZSwgYW5kIG9uZSB3aG9zZSBlbGVtZW50cyBhbGwgZG8gbm90IHNhdGlzZnkgdGhlIHByZWRpY2F0ZS5cbmV4cG9ydCB2YXIgcGFydGl0aW9uID0gZ3JvdXAoZnVuY3Rpb24ocmVzdWx0LCB2YWx1ZSwgcGFzcykge1xuICByZXN1bHRbcGFzcyA/IDAgOiAxXS5wdXNoKHZhbHVlKTtcbn0sIHRydWUpO1xuXG4vLyBBcnJheSBGdW5jdGlvbnNcbi8vIC0tLS0tLS0tLS0tLS0tLVxuXG4vLyBHZXQgdGhlIGZpcnN0IGVsZW1lbnQgb2YgYW4gYXJyYXkuIFBhc3NpbmcgKipuKiogd2lsbCByZXR1cm4gdGhlIGZpcnN0IE5cbi8vIHZhbHVlcyBpbiB0aGUgYXJyYXkuIFRoZSAqKmd1YXJkKiogY2hlY2sgYWxsb3dzIGl0IHRvIHdvcmsgd2l0aCBgbWFwYC5cbmV4cG9ydCBmdW5jdGlvbiBmaXJzdChhcnJheSwgbiwgZ3VhcmQpIHtcbiAgaWYgKGFycmF5ID09IG51bGwgfHwgYXJyYXkubGVuZ3RoIDwgMSkgcmV0dXJuIG4gPT0gbnVsbCA/IHZvaWQgMCA6IFtdO1xuICBpZiAobiA9PSBudWxsIHx8IGd1YXJkKSByZXR1cm4gYXJyYXlbMF07XG4gIHJldHVybiBpbml0aWFsKGFycmF5LCBhcnJheS5sZW5ndGggLSBuKTtcbn1cbmV4cG9ydCB7IGZpcnN0IGFzIGhlYWQsIGZpcnN0IGFzIHRha2UgfTtcblxuLy8gUmV0dXJucyBldmVyeXRoaW5nIGJ1dCB0aGUgbGFzdCBlbnRyeSBvZiB0aGUgYXJyYXkuIEVzcGVjaWFsbHkgdXNlZnVsIG9uXG4vLyB0aGUgYXJndW1lbnRzIG9iamVjdC4gUGFzc2luZyAqKm4qKiB3aWxsIHJldHVybiBhbGwgdGhlIHZhbHVlcyBpblxuLy8gdGhlIGFycmF5LCBleGNsdWRpbmcgdGhlIGxhc3QgTi5cbmV4cG9ydCBmdW5jdGlvbiBpbml0aWFsKGFycmF5LCBuLCBndWFyZCkge1xuICByZXR1cm4gc2xpY2UuY2FsbChhcnJheSwgMCwgTWF0aC5tYXgoMCwgYXJyYXkubGVuZ3RoIC0gKG4gPT0gbnVsbCB8fCBndWFyZCA/IDEgOiBuKSkpO1xufVxuXG4vLyBHZXQgdGhlIGxhc3QgZWxlbWVudCBvZiBhbiBhcnJheS4gUGFzc2luZyAqKm4qKiB3aWxsIHJldHVybiB0aGUgbGFzdCBOXG4vLyB2YWx1ZXMgaW4gdGhlIGFycmF5LlxuZXhwb3J0IGZ1bmN0aW9uIGxhc3QoYXJyYXksIG4sIGd1YXJkKSB7XG4gIGlmIChhcnJheSA9PSBudWxsIHx8IGFycmF5Lmxlbmd0aCA8IDEpIHJldHVybiBuID09IG51bGwgPyB2b2lkIDAgOiBbXTtcbiAgaWYgKG4gPT0gbnVsbCB8fCBndWFyZCkgcmV0dXJuIGFycmF5W2FycmF5Lmxlbmd0aCAtIDFdO1xuICByZXR1cm4gcmVzdChhcnJheSwgTWF0aC5tYXgoMCwgYXJyYXkubGVuZ3RoIC0gbikpO1xufVxuXG4vLyBSZXR1cm5zIGV2ZXJ5dGhpbmcgYnV0IHRoZSBmaXJzdCBlbnRyeSBvZiB0aGUgYXJyYXkuIEVzcGVjaWFsbHkgdXNlZnVsIG9uXG4vLyB0aGUgYXJndW1lbnRzIG9iamVjdC4gUGFzc2luZyBhbiAqKm4qKiB3aWxsIHJldHVybiB0aGUgcmVzdCBOIHZhbHVlcyBpbiB0aGVcbi8vIGFycmF5LlxuZXhwb3J0IGZ1bmN0aW9uIHJlc3QoYXJyYXksIG4sIGd1YXJkKSB7XG4gIHJldHVybiBzbGljZS5jYWxsKGFycmF5LCBuID09IG51bGwgfHwgZ3VhcmQgPyAxIDogbik7XG59XG5leHBvcnQgeyByZXN0IGFzIHRhaWwsIHJlc3QgYXMgZHJvcCB9O1xuXG4vLyBUcmltIG91dCBhbGwgZmFsc3kgdmFsdWVzIGZyb20gYW4gYXJyYXkuXG5leHBvcnQgZnVuY3Rpb24gY29tcGFjdChhcnJheSkge1xuICByZXR1cm4gZmlsdGVyKGFycmF5LCBCb29sZWFuKTtcbn1cblxuLy8gSW50ZXJuYWwgaW1wbGVtZW50YXRpb24gb2YgYSByZWN1cnNpdmUgYGZsYXR0ZW5gIGZ1bmN0aW9uLlxuZnVuY3Rpb24gX2ZsYXR0ZW4oaW5wdXQsIHNoYWxsb3csIHN0cmljdCwgb3V0cHV0KSB7XG4gIG91dHB1dCA9IG91dHB1dCB8fCBbXTtcbiAgdmFyIGlkeCA9IG91dHB1dC5sZW5ndGg7XG4gIGZvciAodmFyIGkgPSAwLCBsZW5ndGggPSBnZXRMZW5ndGgoaW5wdXQpOyBpIDwgbGVuZ3RoOyBpKyspIHtcbiAgICB2YXIgdmFsdWUgPSBpbnB1dFtpXTtcbiAgICBpZiAoaXNBcnJheUxpa2UodmFsdWUpICYmIChpc0FycmF5KHZhbHVlKSB8fCBpc0FyZ3VtZW50cyh2YWx1ZSkpKSB7XG4gICAgICAvLyBGbGF0dGVuIGN1cnJlbnQgbGV2ZWwgb2YgYXJyYXkgb3IgYXJndW1lbnRzIG9iamVjdC5cbiAgICAgIGlmIChzaGFsbG93KSB7XG4gICAgICAgIHZhciBqID0gMCwgbGVuID0gdmFsdWUubGVuZ3RoO1xuICAgICAgICB3aGlsZSAoaiA8IGxlbikgb3V0cHV0W2lkeCsrXSA9IHZhbHVlW2orK107XG4gICAgICB9IGVsc2Uge1xuICAgICAgICBfZmxhdHRlbih2YWx1ZSwgc2hhbGxvdywgc3RyaWN0LCBvdXRwdXQpO1xuICAgICAgICBpZHggPSBvdXRwdXQubGVuZ3RoO1xuICAgICAgfVxuICAgIH0gZWxzZSBpZiAoIXN0cmljdCkge1xuICAgICAgb3V0cHV0W2lkeCsrXSA9IHZhbHVlO1xuICAgIH1cbiAgfVxuICByZXR1cm4gb3V0cHV0O1xufVxuXG4vLyBGbGF0dGVuIG91dCBhbiBhcnJheSwgZWl0aGVyIHJlY3Vyc2l2ZWx5IChieSBkZWZhdWx0KSwgb3IganVzdCBvbmUgbGV2ZWwuXG5leHBvcnQgZnVuY3Rpb24gZmxhdHRlbihhcnJheSwgc2hhbGxvdykge1xuICByZXR1cm4gX2ZsYXR0ZW4oYXJyYXksIHNoYWxsb3csIGZhbHNlKTtcbn1cblxuLy8gUmV0dXJuIGEgdmVyc2lvbiBvZiB0aGUgYXJyYXkgdGhhdCBkb2VzIG5vdCBjb250YWluIHRoZSBzcGVjaWZpZWQgdmFsdWUocykuXG5leHBvcnQgdmFyIHdpdGhvdXQgPSByZXN0QXJndW1lbnRzKGZ1bmN0aW9uKGFycmF5LCBvdGhlckFycmF5cykge1xuICByZXR1cm4gZGlmZmVyZW5jZShhcnJheSwgb3RoZXJBcnJheXMpO1xufSk7XG5cbi8vIFByb2R1Y2UgYSBkdXBsaWNhdGUtZnJlZSB2ZXJzaW9uIG9mIHRoZSBhcnJheS4gSWYgdGhlIGFycmF5IGhhcyBhbHJlYWR5XG4vLyBiZWVuIHNvcnRlZCwgeW91IGhhdmUgdGhlIG9wdGlvbiBvZiB1c2luZyBhIGZhc3RlciBhbGdvcml0aG0uXG4vLyBUaGUgZmFzdGVyIGFsZ29yaXRobSB3aWxsIG5vdCB3b3JrIHdpdGggYW4gaXRlcmF0ZWUgaWYgdGhlIGl0ZXJhdGVlXG4vLyBpcyBub3QgYSBvbmUtdG8tb25lIGZ1bmN0aW9uLCBzbyBwcm92aWRpbmcgYW4gaXRlcmF0ZWUgd2lsbCBkaXNhYmxlXG4vLyB0aGUgZmFzdGVyIGFsZ29yaXRobS5cbmV4cG9ydCBmdW5jdGlvbiB1bmlxKGFycmF5LCBpc1NvcnRlZCwgaXRlcmF0ZWUsIGNvbnRleHQpIHtcbiAgaWYgKCFpc0Jvb2xlYW4oaXNTb3J0ZWQpKSB7XG4gICAgY29udGV4dCA9IGl0ZXJhdGVlO1xuICAgIGl0ZXJhdGVlID0gaXNTb3J0ZWQ7XG4gICAgaXNTb3J0ZWQgPSBmYWxzZTtcbiAgfVxuICBpZiAoaXRlcmF0ZWUgIT0gbnVsbCkgaXRlcmF0ZWUgPSBjYihpdGVyYXRlZSwgY29udGV4dCk7XG4gIHZhciByZXN1bHQgPSBbXTtcbiAgdmFyIHNlZW4gPSBbXTtcbiAgZm9yICh2YXIgaSA9IDAsIGxlbmd0aCA9IGdldExlbmd0aChhcnJheSk7IGkgPCBsZW5ndGg7IGkrKykge1xuICAgIHZhciB2YWx1ZSA9IGFycmF5W2ldLFxuICAgICAgICBjb21wdXRlZCA9IGl0ZXJhdGVlID8gaXRlcmF0ZWUodmFsdWUsIGksIGFycmF5KSA6IHZhbHVlO1xuICAgIGlmIChpc1NvcnRlZCAmJiAhaXRlcmF0ZWUpIHtcbiAgICAgIGlmICghaSB8fCBzZWVuICE9PSBjb21wdXRlZCkgcmVzdWx0LnB1c2godmFsdWUpO1xuICAgICAgc2VlbiA9IGNvbXB1dGVkO1xuICAgIH0gZWxzZSBpZiAoaXRlcmF0ZWUpIHtcbiAgICAgIGlmICghY29udGFpbnMoc2VlbiwgY29tcHV0ZWQpKSB7XG4gICAgICAgIHNlZW4ucHVzaChjb21wdXRlZCk7XG4gICAgICAgIHJlc3VsdC5wdXNoKHZhbHVlKTtcbiAgICAgIH1cbiAgICB9IGVsc2UgaWYgKCFjb250YWlucyhyZXN1bHQsIHZhbHVlKSkge1xuICAgICAgcmVzdWx0LnB1c2godmFsdWUpO1xuICAgIH1cbiAgfVxuICByZXR1cm4gcmVzdWx0O1xufVxuZXhwb3J0IHsgdW5pcSBhcyB1bmlxdWUgfTtcblxuLy8gUHJvZHVjZSBhbiBhcnJheSB0aGF0IGNvbnRhaW5zIHRoZSB1bmlvbjogZWFjaCBkaXN0aW5jdCBlbGVtZW50IGZyb20gYWxsIG9mXG4vLyB0aGUgcGFzc2VkLWluIGFycmF5cy5cbmV4cG9ydCB2YXIgdW5pb24gPSByZXN0QXJndW1lbnRzKGZ1bmN0aW9uKGFycmF5cykge1xuICByZXR1cm4gdW5pcShfZmxhdHRlbihhcnJheXMsIHRydWUsIHRydWUpKTtcbn0pO1xuXG4vLyBQcm9kdWNlIGFuIGFycmF5IHRoYXQgY29udGFpbnMgZXZlcnkgaXRlbSBzaGFyZWQgYmV0d2VlbiBhbGwgdGhlXG4vLyBwYXNzZWQtaW4gYXJyYXlzLlxuZXhwb3J0IGZ1bmN0aW9uIGludGVyc2VjdGlvbihhcnJheSkge1xuICB2YXIgcmVzdWx0ID0gW107XG4gIHZhciBhcmdzTGVuZ3RoID0gYXJndW1lbnRzLmxlbmd0aDtcbiAgZm9yICh2YXIgaSA9IDAsIGxlbmd0aCA9IGdldExlbmd0aChhcnJheSk7IGkgPCBsZW5ndGg7IGkrKykge1xuICAgIHZhciBpdGVtID0gYXJyYXlbaV07XG4gICAgaWYgKGNvbnRhaW5zKHJlc3VsdCwgaXRlbSkpIGNvbnRpbnVlO1xuICAgIHZhciBqO1xuICAgIGZvciAoaiA9IDE7IGogPCBhcmdzTGVuZ3RoOyBqKyspIHtcbiAgICAgIGlmICghY29udGFpbnMoYXJndW1lbnRzW2pdLCBpdGVtKSkgYnJlYWs7XG4gICAgfVxuICAgIGlmIChqID09PSBhcmdzTGVuZ3RoKSByZXN1bHQucHVzaChpdGVtKTtcbiAgfVxuICByZXR1cm4gcmVzdWx0O1xufVxuXG4vLyBUYWtlIHRoZSBkaWZmZXJlbmNlIGJldHdlZW4gb25lIGFycmF5IGFuZCBhIG51bWJlciBvZiBvdGhlciBhcnJheXMuXG4vLyBPbmx5IHRoZSBlbGVtZW50cyBwcmVzZW50IGluIGp1c3QgdGhlIGZpcnN0IGFycmF5IHdpbGwgcmVtYWluLlxuZXhwb3J0IHZhciBkaWZmZXJlbmNlID0gcmVzdEFyZ3VtZW50cyhmdW5jdGlvbihhcnJheSwgcmVzdCkge1xuICByZXN0ID0gX2ZsYXR0ZW4ocmVzdCwgdHJ1ZSwgdHJ1ZSk7XG4gIHJldHVybiBmaWx0ZXIoYXJyYXksIGZ1bmN0aW9uKHZhbHVlKXtcbiAgICByZXR1cm4gIWNvbnRhaW5zKHJlc3QsIHZhbHVlKTtcbiAgfSk7XG59KTtcblxuLy8gQ29tcGxlbWVudCBvZiB6aXAuIFVuemlwIGFjY2VwdHMgYW4gYXJyYXkgb2YgYXJyYXlzIGFuZCBncm91cHNcbi8vIGVhY2ggYXJyYXkncyBlbGVtZW50cyBvbiBzaGFyZWQgaW5kaWNlcy5cbmV4cG9ydCBmdW5jdGlvbiB1bnppcChhcnJheSkge1xuICB2YXIgbGVuZ3RoID0gYXJyYXkgJiYgbWF4KGFycmF5LCBnZXRMZW5ndGgpLmxlbmd0aCB8fCAwO1xuICB2YXIgcmVzdWx0ID0gQXJyYXkobGVuZ3RoKTtcblxuICBmb3IgKHZhciBpbmRleCA9IDA7IGluZGV4IDwgbGVuZ3RoOyBpbmRleCsrKSB7XG4gICAgcmVzdWx0W2luZGV4XSA9IHBsdWNrKGFycmF5LCBpbmRleCk7XG4gIH1cbiAgcmV0dXJuIHJlc3VsdDtcbn1cblxuLy8gWmlwIHRvZ2V0aGVyIG11bHRpcGxlIGxpc3RzIGludG8gYSBzaW5nbGUgYXJyYXkgLS0gZWxlbWVudHMgdGhhdCBzaGFyZVxuLy8gYW4gaW5kZXggZ28gdG9nZXRoZXIuXG5leHBvcnQgdmFyIHppcCA9IHJlc3RBcmd1bWVudHModW56aXApO1xuXG4vLyBDb252ZXJ0cyBsaXN0cyBpbnRvIG9iamVjdHMuIFBhc3MgZWl0aGVyIGEgc2luZ2xlIGFycmF5IG9mIGBba2V5LCB2YWx1ZV1gXG4vLyBwYWlycywgb3IgdHdvIHBhcmFsbGVsIGFycmF5cyBvZiB0aGUgc2FtZSBsZW5ndGggLS0gb25lIG9mIGtleXMsIGFuZCBvbmUgb2Zcbi8vIHRoZSBjb3JyZXNwb25kaW5nIHZhbHVlcy4gUGFzc2luZyBieSBwYWlycyBpcyB0aGUgcmV2ZXJzZSBvZiBwYWlycy5cbmV4cG9ydCBmdW5jdGlvbiBvYmplY3QobGlzdCwgdmFsdWVzKSB7XG4gIHZhciByZXN1bHQgPSB7fTtcbiAgZm9yICh2YXIgaSA9IDAsIGxlbmd0aCA9IGdldExlbmd0aChsaXN0KTsgaSA8IGxlbmd0aDsgaSsrKSB7XG4gICAgaWYgKHZhbHVlcykge1xuICAgICAgcmVzdWx0W2xpc3RbaV1dID0gdmFsdWVzW2ldO1xuICAgIH0gZWxzZSB7XG4gICAgICByZXN1bHRbbGlzdFtpXVswXV0gPSBsaXN0W2ldWzFdO1xuICAgIH1cbiAgfVxuICByZXR1cm4gcmVzdWx0O1xufVxuXG4vLyBHZW5lcmF0b3IgZnVuY3Rpb24gdG8gY3JlYXRlIHRoZSBmaW5kSW5kZXggYW5kIGZpbmRMYXN0SW5kZXggZnVuY3Rpb25zLlxuZnVuY3Rpb24gY3JlYXRlUHJlZGljYXRlSW5kZXhGaW5kZXIoZGlyKSB7XG4gIHJldHVybiBmdW5jdGlvbihhcnJheSwgcHJlZGljYXRlLCBjb250ZXh0KSB7XG4gICAgcHJlZGljYXRlID0gY2IocHJlZGljYXRlLCBjb250ZXh0KTtcbiAgICB2YXIgbGVuZ3RoID0gZ2V0TGVuZ3RoKGFycmF5KTtcbiAgICB2YXIgaW5kZXggPSBkaXIgPiAwID8gMCA6IGxlbmd0aCAtIDE7XG4gICAgZm9yICg7IGluZGV4ID49IDAgJiYgaW5kZXggPCBsZW5ndGg7IGluZGV4ICs9IGRpcikge1xuICAgICAgaWYgKHByZWRpY2F0ZShhcnJheVtpbmRleF0sIGluZGV4LCBhcnJheSkpIHJldHVybiBpbmRleDtcbiAgICB9XG4gICAgcmV0dXJuIC0xO1xuICB9O1xufVxuXG4vLyBSZXR1cm5zIHRoZSBmaXJzdCBpbmRleCBvbiBhbiBhcnJheS1saWtlIHRoYXQgcGFzc2VzIGEgcHJlZGljYXRlIHRlc3QuXG5leHBvcnQgdmFyIGZpbmRJbmRleCA9IGNyZWF0ZVByZWRpY2F0ZUluZGV4RmluZGVyKDEpO1xuZXhwb3J0IHZhciBmaW5kTGFzdEluZGV4ID0gY3JlYXRlUHJlZGljYXRlSW5kZXhGaW5kZXIoLTEpO1xuXG4vLyBVc2UgYSBjb21wYXJhdG9yIGZ1bmN0aW9uIHRvIGZpZ3VyZSBvdXQgdGhlIHNtYWxsZXN0IGluZGV4IGF0IHdoaWNoXG4vLyBhbiBvYmplY3Qgc2hvdWxkIGJlIGluc2VydGVkIHNvIGFzIHRvIG1haW50YWluIG9yZGVyLiBVc2VzIGJpbmFyeSBzZWFyY2guXG5leHBvcnQgZnVuY3Rpb24gc29ydGVkSW5kZXgoYXJyYXksIG9iaiwgaXRlcmF0ZWUsIGNvbnRleHQpIHtcbiAgaXRlcmF0ZWUgPSBjYihpdGVyYXRlZSwgY29udGV4dCwgMSk7XG4gIHZhciB2YWx1ZSA9IGl0ZXJhdGVlKG9iaik7XG4gIHZhciBsb3cgPSAwLCBoaWdoID0gZ2V0TGVuZ3RoKGFycmF5KTtcbiAgd2hpbGUgKGxvdyA8IGhpZ2gpIHtcbiAgICB2YXIgbWlkID0gTWF0aC5mbG9vcigobG93ICsgaGlnaCkgLyAyKTtcbiAgICBpZiAoaXRlcmF0ZWUoYXJyYXlbbWlkXSkgPCB2YWx1ZSkgbG93ID0gbWlkICsgMTsgZWxzZSBoaWdoID0gbWlkO1xuICB9XG4gIHJldHVybiBsb3c7XG59XG5cbi8vIEdlbmVyYXRvciBmdW5jdGlvbiB0byBjcmVhdGUgdGhlIGluZGV4T2YgYW5kIGxhc3RJbmRleE9mIGZ1bmN0aW9ucy5cbmZ1bmN0aW9uIGNyZWF0ZUluZGV4RmluZGVyKGRpciwgcHJlZGljYXRlRmluZCwgc29ydGVkSW5kZXgpIHtcbiAgcmV0dXJuIGZ1bmN0aW9uKGFycmF5LCBpdGVtLCBpZHgpIHtcbiAgICB2YXIgaSA9IDAsIGxlbmd0aCA9IGdldExlbmd0aChhcnJheSk7XG4gICAgaWYgKHR5cGVvZiBpZHggPT0gJ251bWJlcicpIHtcbiAgICAgIGlmIChkaXIgPiAwKSB7XG4gICAgICAgIGkgPSBpZHggPj0gMCA/IGlkeCA6IE1hdGgubWF4KGlkeCArIGxlbmd0aCwgaSk7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICBsZW5ndGggPSBpZHggPj0gMCA/IE1hdGgubWluKGlkeCArIDEsIGxlbmd0aCkgOiBpZHggKyBsZW5ndGggKyAxO1xuICAgICAgfVxuICAgIH0gZWxzZSBpZiAoc29ydGVkSW5kZXggJiYgaWR4ICYmIGxlbmd0aCkge1xuICAgICAgaWR4ID0gc29ydGVkSW5kZXgoYXJyYXksIGl0ZW0pO1xuICAgICAgcmV0dXJuIGFycmF5W2lkeF0gPT09IGl0ZW0gPyBpZHggOiAtMTtcbiAgICB9XG4gICAgaWYgKGl0ZW0gIT09IGl0ZW0pIHtcbiAgICAgIGlkeCA9IHByZWRpY2F0ZUZpbmQoc2xpY2UuY2FsbChhcnJheSwgaSwgbGVuZ3RoKSwgaXNOYU4pO1xuICAgICAgcmV0dXJuIGlkeCA+PSAwID8gaWR4ICsgaSA6IC0xO1xuICAgIH1cbiAgICBmb3IgKGlkeCA9IGRpciA+IDAgPyBpIDogbGVuZ3RoIC0gMTsgaWR4ID49IDAgJiYgaWR4IDwgbGVuZ3RoOyBpZHggKz0gZGlyKSB7XG4gICAgICBpZiAoYXJyYXlbaWR4XSA9PT0gaXRlbSkgcmV0dXJuIGlkeDtcbiAgICB9XG4gICAgcmV0dXJuIC0xO1xuICB9O1xufVxuXG4vLyBSZXR1cm4gdGhlIHBvc2l0aW9uIG9mIHRoZSBmaXJzdCBvY2N1cnJlbmNlIG9mIGFuIGl0ZW0gaW4gYW4gYXJyYXksXG4vLyBvciAtMSBpZiB0aGUgaXRlbSBpcyBub3QgaW5jbHVkZWQgaW4gdGhlIGFycmF5LlxuLy8gSWYgdGhlIGFycmF5IGlzIGxhcmdlIGFuZCBhbHJlYWR5IGluIHNvcnQgb3JkZXIsIHBhc3MgYHRydWVgXG4vLyBmb3IgKippc1NvcnRlZCoqIHRvIHVzZSBiaW5hcnkgc2VhcmNoLlxuZXhwb3J0IHZhciBpbmRleE9mID0gY3JlYXRlSW5kZXhGaW5kZXIoMSwgZmluZEluZGV4LCBzb3J0ZWRJbmRleCk7XG5leHBvcnQgdmFyIGxhc3RJbmRleE9mID0gY3JlYXRlSW5kZXhGaW5kZXIoLTEsIGZpbmRMYXN0SW5kZXgpO1xuXG4vLyBHZW5lcmF0ZSBhbiBpbnRlZ2VyIEFycmF5IGNvbnRhaW5pbmcgYW4gYXJpdGhtZXRpYyBwcm9ncmVzc2lvbi4gQSBwb3J0IG9mXG4vLyB0aGUgbmF0aXZlIFB5dGhvbiBgcmFuZ2UoKWAgZnVuY3Rpb24uIFNlZVxuLy8gW3RoZSBQeXRob24gZG9jdW1lbnRhdGlvbl0oaHR0cHM6Ly9kb2NzLnB5dGhvbi5vcmcvbGlicmFyeS9mdW5jdGlvbnMuaHRtbCNyYW5nZSkuXG5leHBvcnQgZnVuY3Rpb24gcmFuZ2Uoc3RhcnQsIHN0b3AsIHN0ZXApIHtcbiAgaWYgKHN0b3AgPT0gbnVsbCkge1xuICAgIHN0b3AgPSBzdGFydCB8fCAwO1xuICAgIHN0YXJ0ID0gMDtcbiAgfVxuICBpZiAoIXN0ZXApIHtcbiAgICBzdGVwID0gc3RvcCA8IHN0YXJ0ID8gLTEgOiAxO1xuICB9XG5cbiAgdmFyIGxlbmd0aCA9IE1hdGgubWF4KE1hdGguY2VpbCgoc3RvcCAtIHN0YXJ0KSAvIHN0ZXApLCAwKTtcbiAgdmFyIHJhbmdlID0gQXJyYXkobGVuZ3RoKTtcblxuICBmb3IgKHZhciBpZHggPSAwOyBpZHggPCBsZW5ndGg7IGlkeCsrLCBzdGFydCArPSBzdGVwKSB7XG4gICAgcmFuZ2VbaWR4XSA9IHN0YXJ0O1xuICB9XG5cbiAgcmV0dXJuIHJhbmdlO1xufVxuXG4vLyBDaHVuayBhIHNpbmdsZSBhcnJheSBpbnRvIG11bHRpcGxlIGFycmF5cywgZWFjaCBjb250YWluaW5nIGBjb3VudGAgb3IgZmV3ZXJcbi8vIGl0ZW1zLlxuZXhwb3J0IGZ1bmN0aW9uIGNodW5rKGFycmF5LCBjb3VudCkge1xuICBpZiAoY291bnQgPT0gbnVsbCB8fCBjb3VudCA8IDEpIHJldHVybiBbXTtcbiAgdmFyIHJlc3VsdCA9IFtdO1xuICB2YXIgaSA9IDAsIGxlbmd0aCA9IGFycmF5Lmxlbmd0aDtcbiAgd2hpbGUgKGkgPCBsZW5ndGgpIHtcbiAgICByZXN1bHQucHVzaChzbGljZS5jYWxsKGFycmF5LCBpLCBpICs9IGNvdW50KSk7XG4gIH1cbiAgcmV0dXJuIHJlc3VsdDtcbn1cblxuLy8gRnVuY3Rpb24gKGFoZW0pIEZ1bmN0aW9uc1xuLy8gLS0tLS0tLS0tLS0tLS0tLS0tXG5cbi8vIERldGVybWluZXMgd2hldGhlciB0byBleGVjdXRlIGEgZnVuY3Rpb24gYXMgYSBjb25zdHJ1Y3RvclxuLy8gb3IgYSBub3JtYWwgZnVuY3Rpb24gd2l0aCB0aGUgcHJvdmlkZWQgYXJndW1lbnRzLlxuZnVuY3Rpb24gZXhlY3V0ZUJvdW5kKHNvdXJjZUZ1bmMsIGJvdW5kRnVuYywgY29udGV4dCwgY2FsbGluZ0NvbnRleHQsIGFyZ3MpIHtcbiAgaWYgKCEoY2FsbGluZ0NvbnRleHQgaW5zdGFuY2VvZiBib3VuZEZ1bmMpKSByZXR1cm4gc291cmNlRnVuYy5hcHBseShjb250ZXh0LCBhcmdzKTtcbiAgdmFyIHNlbGYgPSBiYXNlQ3JlYXRlKHNvdXJjZUZ1bmMucHJvdG90eXBlKTtcbiAgdmFyIHJlc3VsdCA9IHNvdXJjZUZ1bmMuYXBwbHkoc2VsZiwgYXJncyk7XG4gIGlmIChpc09iamVjdChyZXN1bHQpKSByZXR1cm4gcmVzdWx0O1xuICByZXR1cm4gc2VsZjtcbn1cblxuLy8gQ3JlYXRlIGEgZnVuY3Rpb24gYm91bmQgdG8gYSBnaXZlbiBvYmplY3QgKGFzc2lnbmluZyBgdGhpc2AsIGFuZCBhcmd1bWVudHMsXG4vLyBvcHRpb25hbGx5KS4gRGVsZWdhdGVzIHRvICoqRUNNQVNjcmlwdCA1KioncyBuYXRpdmUgYEZ1bmN0aW9uLmJpbmRgIGlmXG4vLyBhdmFpbGFibGUuXG5leHBvcnQgdmFyIGJpbmQgPSByZXN0QXJndW1lbnRzKGZ1bmN0aW9uKGZ1bmMsIGNvbnRleHQsIGFyZ3MpIHtcbiAgaWYgKCFpc0Z1bmN0aW9uKGZ1bmMpKSB0aHJvdyBuZXcgVHlwZUVycm9yKCdCaW5kIG11c3QgYmUgY2FsbGVkIG9uIGEgZnVuY3Rpb24nKTtcbiAgdmFyIGJvdW5kID0gcmVzdEFyZ3VtZW50cyhmdW5jdGlvbihjYWxsQXJncykge1xuICAgIHJldHVybiBleGVjdXRlQm91bmQoZnVuYywgYm91bmQsIGNvbnRleHQsIHRoaXMsIGFyZ3MuY29uY2F0KGNhbGxBcmdzKSk7XG4gIH0pO1xuICByZXR1cm4gYm91bmQ7XG59KTtcblxuLy8gUGFydGlhbGx5IGFwcGx5IGEgZnVuY3Rpb24gYnkgY3JlYXRpbmcgYSB2ZXJzaW9uIHRoYXQgaGFzIGhhZCBzb21lIG9mIGl0c1xuLy8gYXJndW1lbnRzIHByZS1maWxsZWQsIHdpdGhvdXQgY2hhbmdpbmcgaXRzIGR5bmFtaWMgYHRoaXNgIGNvbnRleHQuIF8gYWN0c1xuLy8gYXMgYSBwbGFjZWhvbGRlciBieSBkZWZhdWx0LCBhbGxvd2luZyBhbnkgY29tYmluYXRpb24gb2YgYXJndW1lbnRzIHRvIGJlXG4vLyBwcmUtZmlsbGVkLiBTZXQgYHBhcnRpYWwucGxhY2Vob2xkZXJgIGZvciBhIGN1c3RvbSBwbGFjZWhvbGRlciBhcmd1bWVudC5cbmV4cG9ydCB2YXIgcGFydGlhbCA9IHJlc3RBcmd1bWVudHMoZnVuY3Rpb24oZnVuYywgYm91bmRBcmdzKSB7XG4gIHZhciBwbGFjZWhvbGRlciA9IHBhcnRpYWwucGxhY2Vob2xkZXI7XG4gIHZhciBib3VuZCA9IGZ1bmN0aW9uKCkge1xuICAgIHZhciBwb3NpdGlvbiA9IDAsIGxlbmd0aCA9IGJvdW5kQXJncy5sZW5ndGg7XG4gICAgdmFyIGFyZ3MgPSBBcnJheShsZW5ndGgpO1xuICAgIGZvciAodmFyIGkgPSAwOyBpIDwgbGVuZ3RoOyBpKyspIHtcbiAgICAgIGFyZ3NbaV0gPSBib3VuZEFyZ3NbaV0gPT09IHBsYWNlaG9sZGVyID8gYXJndW1lbnRzW3Bvc2l0aW9uKytdIDogYm91bmRBcmdzW2ldO1xuICAgIH1cbiAgICB3aGlsZSAocG9zaXRpb24gPCBhcmd1bWVudHMubGVuZ3RoKSBhcmdzLnB1c2goYXJndW1lbnRzW3Bvc2l0aW9uKytdKTtcbiAgICByZXR1cm4gZXhlY3V0ZUJvdW5kKGZ1bmMsIGJvdW5kLCB0aGlzLCB0aGlzLCBhcmdzKTtcbiAgfTtcbiAgcmV0dXJuIGJvdW5kO1xufSk7XG5cbnBhcnRpYWwucGxhY2Vob2xkZXIgPSBfO1xuXG4vLyBCaW5kIGEgbnVtYmVyIG9mIGFuIG9iamVjdCdzIG1ldGhvZHMgdG8gdGhhdCBvYmplY3QuIFJlbWFpbmluZyBhcmd1bWVudHNcbi8vIGFyZSB0aGUgbWV0aG9kIG5hbWVzIHRvIGJlIGJvdW5kLiBVc2VmdWwgZm9yIGVuc3VyaW5nIHRoYXQgYWxsIGNhbGxiYWNrc1xuLy8gZGVmaW5lZCBvbiBhbiBvYmplY3QgYmVsb25nIHRvIGl0LlxuZXhwb3J0IHZhciBiaW5kQWxsID0gcmVzdEFyZ3VtZW50cyhmdW5jdGlvbihvYmosIF9rZXlzKSB7XG4gIF9rZXlzID0gX2ZsYXR0ZW4oX2tleXMsIGZhbHNlLCBmYWxzZSk7XG4gIHZhciBpbmRleCA9IF9rZXlzLmxlbmd0aDtcbiAgaWYgKGluZGV4IDwgMSkgdGhyb3cgbmV3IEVycm9yKCdiaW5kQWxsIG11c3QgYmUgcGFzc2VkIGZ1bmN0aW9uIG5hbWVzJyk7XG4gIHdoaWxlIChpbmRleC0tKSB7XG4gICAgdmFyIGtleSA9IF9rZXlzW2luZGV4XTtcbiAgICBvYmpba2V5XSA9IGJpbmQob2JqW2tleV0sIG9iaik7XG4gIH1cbn0pO1xuXG4vLyBNZW1vaXplIGFuIGV4cGVuc2l2ZSBmdW5jdGlvbiBieSBzdG9yaW5nIGl0cyByZXN1bHRzLlxuZXhwb3J0IGZ1bmN0aW9uIG1lbW9pemUoZnVuYywgaGFzaGVyKSB7XG4gIHZhciBtZW1vaXplID0gZnVuY3Rpb24oa2V5KSB7XG4gICAgdmFyIGNhY2hlID0gbWVtb2l6ZS5jYWNoZTtcbiAgICB2YXIgYWRkcmVzcyA9ICcnICsgKGhhc2hlciA/IGhhc2hlci5hcHBseSh0aGlzLCBhcmd1bWVudHMpIDoga2V5KTtcbiAgICBpZiAoIV9oYXMoY2FjaGUsIGFkZHJlc3MpKSBjYWNoZVthZGRyZXNzXSA9IGZ1bmMuYXBwbHkodGhpcywgYXJndW1lbnRzKTtcbiAgICByZXR1cm4gY2FjaGVbYWRkcmVzc107XG4gIH07XG4gIG1lbW9pemUuY2FjaGUgPSB7fTtcbiAgcmV0dXJuIG1lbW9pemU7XG59XG5cbi8vIERlbGF5cyBhIGZ1bmN0aW9uIGZvciB0aGUgZ2l2ZW4gbnVtYmVyIG9mIG1pbGxpc2Vjb25kcywgYW5kIHRoZW4gY2FsbHNcbi8vIGl0IHdpdGggdGhlIGFyZ3VtZW50cyBzdXBwbGllZC5cbmV4cG9ydCB2YXIgZGVsYXkgPSByZXN0QXJndW1lbnRzKGZ1bmN0aW9uKGZ1bmMsIHdhaXQsIGFyZ3MpIHtcbiAgcmV0dXJuIHNldFRpbWVvdXQoZnVuY3Rpb24oKSB7XG4gICAgcmV0dXJuIGZ1bmMuYXBwbHkobnVsbCwgYXJncyk7XG4gIH0sIHdhaXQpO1xufSk7XG5cbi8vIERlZmVycyBhIGZ1bmN0aW9uLCBzY2hlZHVsaW5nIGl0IHRvIHJ1biBhZnRlciB0aGUgY3VycmVudCBjYWxsIHN0YWNrIGhhc1xuLy8gY2xlYXJlZC5cbmV4cG9ydCB2YXIgZGVmZXIgPSBwYXJ0aWFsKGRlbGF5LCBfLCAxKTtcblxuLy8gUmV0dXJucyBhIGZ1bmN0aW9uLCB0aGF0LCB3aGVuIGludm9rZWQsIHdpbGwgb25seSBiZSB0cmlnZ2VyZWQgYXQgbW9zdCBvbmNlXG4vLyBkdXJpbmcgYSBnaXZlbiB3aW5kb3cgb2YgdGltZS4gTm9ybWFsbHksIHRoZSB0aHJvdHRsZWQgZnVuY3Rpb24gd2lsbCBydW5cbi8vIGFzIG11Y2ggYXMgaXQgY2FuLCB3aXRob3V0IGV2ZXIgZ29pbmcgbW9yZSB0aGFuIG9uY2UgcGVyIGB3YWl0YCBkdXJhdGlvbjtcbi8vIGJ1dCBpZiB5b3UnZCBsaWtlIHRvIGRpc2FibGUgdGhlIGV4ZWN1dGlvbiBvbiB0aGUgbGVhZGluZyBlZGdlLCBwYXNzXG4vLyBge2xlYWRpbmc6IGZhbHNlfWAuIFRvIGRpc2FibGUgZXhlY3V0aW9uIG9uIHRoZSB0cmFpbGluZyBlZGdlLCBkaXR0by5cbmV4cG9ydCBmdW5jdGlvbiB0aHJvdHRsZShmdW5jLCB3YWl0LCBvcHRpb25zKSB7XG4gIHZhciB0aW1lb3V0LCBjb250ZXh0LCBhcmdzLCByZXN1bHQ7XG4gIHZhciBwcmV2aW91cyA9IDA7XG4gIGlmICghb3B0aW9ucykgb3B0aW9ucyA9IHt9O1xuXG4gIHZhciBsYXRlciA9IGZ1bmN0aW9uKCkge1xuICAgIHByZXZpb3VzID0gb3B0aW9ucy5sZWFkaW5nID09PSBmYWxzZSA/IDAgOiBub3coKTtcbiAgICB0aW1lb3V0ID0gbnVsbDtcbiAgICByZXN1bHQgPSBmdW5jLmFwcGx5KGNvbnRleHQsIGFyZ3MpO1xuICAgIGlmICghdGltZW91dCkgY29udGV4dCA9IGFyZ3MgPSBudWxsO1xuICB9O1xuXG4gIHZhciB0aHJvdHRsZWQgPSBmdW5jdGlvbigpIHtcbiAgICB2YXIgX25vdyA9IG5vdygpO1xuICAgIGlmICghcHJldmlvdXMgJiYgb3B0aW9ucy5sZWFkaW5nID09PSBmYWxzZSkgcHJldmlvdXMgPSBfbm93O1xuICAgIHZhciByZW1haW5pbmcgPSB3YWl0IC0gKF9ub3cgLSBwcmV2aW91cyk7XG4gICAgY29udGV4dCA9IHRoaXM7XG4gICAgYXJncyA9IGFyZ3VtZW50cztcbiAgICBpZiAocmVtYWluaW5nIDw9IDAgfHwgcmVtYWluaW5nID4gd2FpdCkge1xuICAgICAgaWYgKHRpbWVvdXQpIHtcbiAgICAgICAgY2xlYXJUaW1lb3V0KHRpbWVvdXQpO1xuICAgICAgICB0aW1lb3V0ID0gbnVsbDtcbiAgICAgIH1cbiAgICAgIHByZXZpb3VzID0gX25vdztcbiAgICAgIHJlc3VsdCA9IGZ1bmMuYXBwbHkoY29udGV4dCwgYXJncyk7XG4gICAgICBpZiAoIXRpbWVvdXQpIGNvbnRleHQgPSBhcmdzID0gbnVsbDtcbiAgICB9IGVsc2UgaWYgKCF0aW1lb3V0ICYmIG9wdGlvbnMudHJhaWxpbmcgIT09IGZhbHNlKSB7XG4gICAgICB0aW1lb3V0ID0gc2V0VGltZW91dChsYXRlciwgcmVtYWluaW5nKTtcbiAgICB9XG4gICAgcmV0dXJuIHJlc3VsdDtcbiAgfTtcblxuICB0aHJvdHRsZWQuY2FuY2VsID0gZnVuY3Rpb24oKSB7XG4gICAgY2xlYXJUaW1lb3V0KHRpbWVvdXQpO1xuICAgIHByZXZpb3VzID0gMDtcbiAgICB0aW1lb3V0ID0gY29udGV4dCA9IGFyZ3MgPSBudWxsO1xuICB9O1xuXG4gIHJldHVybiB0aHJvdHRsZWQ7XG59XG5cbi8vIFJldHVybnMgYSBmdW5jdGlvbiwgdGhhdCwgYXMgbG9uZyBhcyBpdCBjb250aW51ZXMgdG8gYmUgaW52b2tlZCwgd2lsbCBub3Rcbi8vIGJlIHRyaWdnZXJlZC4gVGhlIGZ1bmN0aW9uIHdpbGwgYmUgY2FsbGVkIGFmdGVyIGl0IHN0b3BzIGJlaW5nIGNhbGxlZCBmb3Jcbi8vIE4gbWlsbGlzZWNvbmRzLiBJZiBgaW1tZWRpYXRlYCBpcyBwYXNzZWQsIHRyaWdnZXIgdGhlIGZ1bmN0aW9uIG9uIHRoZVxuLy8gbGVhZGluZyBlZGdlLCBpbnN0ZWFkIG9mIHRoZSB0cmFpbGluZy5cbmV4cG9ydCBmdW5jdGlvbiBkZWJvdW5jZShmdW5jLCB3YWl0LCBpbW1lZGlhdGUpIHtcbiAgdmFyIHRpbWVvdXQsIHJlc3VsdDtcblxuICB2YXIgbGF0ZXIgPSBmdW5jdGlvbihjb250ZXh0LCBhcmdzKSB7XG4gICAgdGltZW91dCA9IG51bGw7XG4gICAgaWYgKGFyZ3MpIHJlc3VsdCA9IGZ1bmMuYXBwbHkoY29udGV4dCwgYXJncyk7XG4gIH07XG5cbiAgdmFyIGRlYm91bmNlZCA9IHJlc3RBcmd1bWVudHMoZnVuY3Rpb24oYXJncykge1xuICAgIGlmICh0aW1lb3V0KSBjbGVhclRpbWVvdXQodGltZW91dCk7XG4gICAgaWYgKGltbWVkaWF0ZSkge1xuICAgICAgdmFyIGNhbGxOb3cgPSAhdGltZW91dDtcbiAgICAgIHRpbWVvdXQgPSBzZXRUaW1lb3V0KGxhdGVyLCB3YWl0KTtcbiAgICAgIGlmIChjYWxsTm93KSByZXN1bHQgPSBmdW5jLmFwcGx5KHRoaXMsIGFyZ3MpO1xuICAgIH0gZWxzZSB7XG4gICAgICB0aW1lb3V0ID0gZGVsYXkobGF0ZXIsIHdhaXQsIHRoaXMsIGFyZ3MpO1xuICAgIH1cblxuICAgIHJldHVybiByZXN1bHQ7XG4gIH0pO1xuXG4gIGRlYm91bmNlZC5jYW5jZWwgPSBmdW5jdGlvbigpIHtcbiAgICBjbGVhclRpbWVvdXQodGltZW91dCk7XG4gICAgdGltZW91dCA9IG51bGw7XG4gIH07XG5cbiAgcmV0dXJuIGRlYm91bmNlZDtcbn1cblxuLy8gUmV0dXJucyB0aGUgZmlyc3QgZnVuY3Rpb24gcGFzc2VkIGFzIGFuIGFyZ3VtZW50IHRvIHRoZSBzZWNvbmQsXG4vLyBhbGxvd2luZyB5b3UgdG8gYWRqdXN0IGFyZ3VtZW50cywgcnVuIGNvZGUgYmVmb3JlIGFuZCBhZnRlciwgYW5kXG4vLyBjb25kaXRpb25hbGx5IGV4ZWN1dGUgdGhlIG9yaWdpbmFsIGZ1bmN0aW9uLlxuZXhwb3J0IGZ1bmN0aW9uIHdyYXAoZnVuYywgd3JhcHBlcikge1xuICByZXR1cm4gcGFydGlhbCh3cmFwcGVyLCBmdW5jKTtcbn1cblxuLy8gUmV0dXJucyBhIG5lZ2F0ZWQgdmVyc2lvbiBvZiB0aGUgcGFzc2VkLWluIHByZWRpY2F0ZS5cbmV4cG9ydCBmdW5jdGlvbiBuZWdhdGUocHJlZGljYXRlKSB7XG4gIHJldHVybiBmdW5jdGlvbigpIHtcbiAgICByZXR1cm4gIXByZWRpY2F0ZS5hcHBseSh0aGlzLCBhcmd1bWVudHMpO1xuICB9O1xufVxuXG4vLyBSZXR1cm5zIGEgZnVuY3Rpb24gdGhhdCBpcyB0aGUgY29tcG9zaXRpb24gb2YgYSBsaXN0IG9mIGZ1bmN0aW9ucywgZWFjaFxuLy8gY29uc3VtaW5nIHRoZSByZXR1cm4gdmFsdWUgb2YgdGhlIGZ1bmN0aW9uIHRoYXQgZm9sbG93cy5cbmV4cG9ydCBmdW5jdGlvbiBjb21wb3NlKCkge1xuICB2YXIgYXJncyA9IGFyZ3VtZW50cztcbiAgdmFyIHN0YXJ0ID0gYXJncy5sZW5ndGggLSAxO1xuICByZXR1cm4gZnVuY3Rpb24oKSB7XG4gICAgdmFyIGkgPSBzdGFydDtcbiAgICB2YXIgcmVzdWx0ID0gYXJnc1tzdGFydF0uYXBwbHkodGhpcywgYXJndW1lbnRzKTtcbiAgICB3aGlsZSAoaS0tKSByZXN1bHQgPSBhcmdzW2ldLmNhbGwodGhpcywgcmVzdWx0KTtcbiAgICByZXR1cm4gcmVzdWx0O1xuICB9O1xufVxuXG4vLyBSZXR1cm5zIGEgZnVuY3Rpb24gdGhhdCB3aWxsIG9ubHkgYmUgZXhlY3V0ZWQgb24gYW5kIGFmdGVyIHRoZSBOdGggY2FsbC5cbmV4cG9ydCBmdW5jdGlvbiBhZnRlcih0aW1lcywgZnVuYykge1xuICByZXR1cm4gZnVuY3Rpb24oKSB7XG4gICAgaWYgKC0tdGltZXMgPCAxKSB7XG4gICAgICByZXR1cm4gZnVuYy5hcHBseSh0aGlzLCBhcmd1bWVudHMpO1xuICAgIH1cbiAgfTtcbn1cblxuLy8gUmV0dXJucyBhIGZ1bmN0aW9uIHRoYXQgd2lsbCBvbmx5IGJlIGV4ZWN1dGVkIHVwIHRvIChidXQgbm90IGluY2x1ZGluZykgdGhlIE50aCBjYWxsLlxuZXhwb3J0IGZ1bmN0aW9uIGJlZm9yZSh0aW1lcywgZnVuYykge1xuICB2YXIgbWVtbztcbiAgcmV0dXJuIGZ1bmN0aW9uKCkge1xuICAgIGlmICgtLXRpbWVzID4gMCkge1xuICAgICAgbWVtbyA9IGZ1bmMuYXBwbHkodGhpcywgYXJndW1lbnRzKTtcbiAgICB9XG4gICAgaWYgKHRpbWVzIDw9IDEpIGZ1bmMgPSBudWxsO1xuICAgIHJldHVybiBtZW1vO1xuICB9O1xufVxuXG4vLyBSZXR1cm5zIGEgZnVuY3Rpb24gdGhhdCB3aWxsIGJlIGV4ZWN1dGVkIGF0IG1vc3Qgb25lIHRpbWUsIG5vIG1hdHRlciBob3dcbi8vIG9mdGVuIHlvdSBjYWxsIGl0LiBVc2VmdWwgZm9yIGxhenkgaW5pdGlhbGl6YXRpb24uXG5leHBvcnQgdmFyIG9uY2UgPSBwYXJ0aWFsKGJlZm9yZSwgMik7XG5cbi8vIE9iamVjdCBGdW5jdGlvbnNcbi8vIC0tLS0tLS0tLS0tLS0tLS1cblxuLy8gS2V5cyBpbiBJRSA8IDkgdGhhdCB3b24ndCBiZSBpdGVyYXRlZCBieSBgZm9yIGtleSBpbiAuLi5gIGFuZCB0aHVzIG1pc3NlZC5cbnZhciBoYXNFbnVtQnVnID0gIXt0b1N0cmluZzogbnVsbH0ucHJvcGVydHlJc0VudW1lcmFibGUoJ3RvU3RyaW5nJyk7XG52YXIgbm9uRW51bWVyYWJsZVByb3BzID0gWyd2YWx1ZU9mJywgJ2lzUHJvdG90eXBlT2YnLCAndG9TdHJpbmcnLFxuICAncHJvcGVydHlJc0VudW1lcmFibGUnLCAnaGFzT3duUHJvcGVydHknLCAndG9Mb2NhbGVTdHJpbmcnXTtcblxuZnVuY3Rpb24gY29sbGVjdE5vbkVudW1Qcm9wcyhvYmosIF9rZXlzKSB7XG4gIHZhciBub25FbnVtSWR4ID0gbm9uRW51bWVyYWJsZVByb3BzLmxlbmd0aDtcbiAgdmFyIGNvbnN0cnVjdG9yID0gb2JqLmNvbnN0cnVjdG9yO1xuICB2YXIgcHJvdG8gPSBpc0Z1bmN0aW9uKGNvbnN0cnVjdG9yKSAmJiBjb25zdHJ1Y3Rvci5wcm90b3R5cGUgfHwgT2JqUHJvdG87XG5cbiAgLy8gQ29uc3RydWN0b3IgaXMgYSBzcGVjaWFsIGNhc2UuXG4gIHZhciBwcm9wID0gJ2NvbnN0cnVjdG9yJztcbiAgaWYgKF9oYXMob2JqLCBwcm9wKSAmJiAhY29udGFpbnMoX2tleXMsIHByb3ApKSBfa2V5cy5wdXNoKHByb3ApO1xuXG4gIHdoaWxlIChub25FbnVtSWR4LS0pIHtcbiAgICBwcm9wID0gbm9uRW51bWVyYWJsZVByb3BzW25vbkVudW1JZHhdO1xuICAgIGlmIChwcm9wIGluIG9iaiAmJiBvYmpbcHJvcF0gIT09IHByb3RvW3Byb3BdICYmICFjb250YWlucyhfa2V5cywgcHJvcCkpIHtcbiAgICAgIF9rZXlzLnB1c2gocHJvcCk7XG4gICAgfVxuICB9XG59XG5cbi8vIFJldHJpZXZlIHRoZSBuYW1lcyBvZiBhbiBvYmplY3QncyBvd24gcHJvcGVydGllcy5cbi8vIERlbGVnYXRlcyB0byAqKkVDTUFTY3JpcHQgNSoqJ3MgbmF0aXZlIGBPYmplY3Qua2V5c2AuXG5leHBvcnQgZnVuY3Rpb24ga2V5cyhvYmopIHtcbiAgaWYgKCFpc09iamVjdChvYmopKSByZXR1cm4gW107XG4gIGlmIChuYXRpdmVLZXlzKSByZXR1cm4gbmF0aXZlS2V5cyhvYmopO1xuICB2YXIgX2tleXMgPSBbXTtcbiAgZm9yICh2YXIga2V5IGluIG9iaikgaWYgKF9oYXMob2JqLCBrZXkpKSBfa2V5cy5wdXNoKGtleSk7XG4gIC8vIEFoZW0sIElFIDwgOS5cbiAgaWYgKGhhc0VudW1CdWcpIGNvbGxlY3ROb25FbnVtUHJvcHMob2JqLCBfa2V5cyk7XG4gIHJldHVybiBfa2V5cztcbn1cblxuLy8gUmV0cmlldmUgYWxsIHRoZSBwcm9wZXJ0eSBuYW1lcyBvZiBhbiBvYmplY3QuXG5leHBvcnQgZnVuY3Rpb24gYWxsS2V5cyhvYmopIHtcbiAgaWYgKCFpc09iamVjdChvYmopKSByZXR1cm4gW107XG4gIHZhciBfa2V5cyA9IFtdO1xuICBmb3IgKHZhciBrZXkgaW4gb2JqKSBfa2V5cy5wdXNoKGtleSk7XG4gIC8vIEFoZW0sIElFIDwgOS5cbiAgaWYgKGhhc0VudW1CdWcpIGNvbGxlY3ROb25FbnVtUHJvcHMob2JqLCBfa2V5cyk7XG4gIHJldHVybiBfa2V5cztcbn1cblxuLy8gUmV0cmlldmUgdGhlIHZhbHVlcyBvZiBhbiBvYmplY3QncyBwcm9wZXJ0aWVzLlxuZXhwb3J0IGZ1bmN0aW9uIHZhbHVlcyhvYmopIHtcbiAgdmFyIF9rZXlzID0ga2V5cyhvYmopO1xuICB2YXIgbGVuZ3RoID0gX2tleXMubGVuZ3RoO1xuICB2YXIgdmFsdWVzID0gQXJyYXkobGVuZ3RoKTtcbiAgZm9yICh2YXIgaSA9IDA7IGkgPCBsZW5ndGg7IGkrKykge1xuICAgIHZhbHVlc1tpXSA9IG9ialtfa2V5c1tpXV07XG4gIH1cbiAgcmV0dXJuIHZhbHVlcztcbn1cblxuLy8gUmV0dXJucyB0aGUgcmVzdWx0cyBvZiBhcHBseWluZyB0aGUgaXRlcmF0ZWUgdG8gZWFjaCBlbGVtZW50IG9mIHRoZSBvYmplY3QuXG4vLyBJbiBjb250cmFzdCB0byBtYXAgaXQgcmV0dXJucyBhbiBvYmplY3QuXG5leHBvcnQgZnVuY3Rpb24gbWFwT2JqZWN0KG9iaiwgaXRlcmF0ZWUsIGNvbnRleHQpIHtcbiAgaXRlcmF0ZWUgPSBjYihpdGVyYXRlZSwgY29udGV4dCk7XG4gIHZhciBfa2V5cyA9IGtleXMob2JqKSxcbiAgICAgIGxlbmd0aCA9IF9rZXlzLmxlbmd0aCxcbiAgICAgIHJlc3VsdHMgPSB7fTtcbiAgZm9yICh2YXIgaW5kZXggPSAwOyBpbmRleCA8IGxlbmd0aDsgaW5kZXgrKykge1xuICAgIHZhciBjdXJyZW50S2V5ID0gX2tleXNbaW5kZXhdO1xuICAgIHJlc3VsdHNbY3VycmVudEtleV0gPSBpdGVyYXRlZShvYmpbY3VycmVudEtleV0sIGN1cnJlbnRLZXksIG9iaik7XG4gIH1cbiAgcmV0dXJuIHJlc3VsdHM7XG59XG5cbi8vIENvbnZlcnQgYW4gb2JqZWN0IGludG8gYSBsaXN0IG9mIGBba2V5LCB2YWx1ZV1gIHBhaXJzLlxuLy8gVGhlIG9wcG9zaXRlIG9mIG9iamVjdC5cbmV4cG9ydCBmdW5jdGlvbiBwYWlycyhvYmopIHtcbiAgdmFyIF9rZXlzID0ga2V5cyhvYmopO1xuICB2YXIgbGVuZ3RoID0gX2tleXMubGVuZ3RoO1xuICB2YXIgcGFpcnMgPSBBcnJheShsZW5ndGgpO1xuICBmb3IgKHZhciBpID0gMDsgaSA8IGxlbmd0aDsgaSsrKSB7XG4gICAgcGFpcnNbaV0gPSBbX2tleXNbaV0sIG9ialtfa2V5c1tpXV1dO1xuICB9XG4gIHJldHVybiBwYWlycztcbn1cblxuLy8gSW52ZXJ0IHRoZSBrZXlzIGFuZCB2YWx1ZXMgb2YgYW4gb2JqZWN0LiBUaGUgdmFsdWVzIG11c3QgYmUgc2VyaWFsaXphYmxlLlxuZXhwb3J0IGZ1bmN0aW9uIGludmVydChvYmopIHtcbiAgdmFyIHJlc3VsdCA9IHt9O1xuICB2YXIgX2tleXMgPSBrZXlzKG9iaik7XG4gIGZvciAodmFyIGkgPSAwLCBsZW5ndGggPSBfa2V5cy5sZW5ndGg7IGkgPCBsZW5ndGg7IGkrKykge1xuICAgIHJlc3VsdFtvYmpbX2tleXNbaV1dXSA9IF9rZXlzW2ldO1xuICB9XG4gIHJldHVybiByZXN1bHQ7XG59XG5cbi8vIFJldHVybiBhIHNvcnRlZCBsaXN0IG9mIHRoZSBmdW5jdGlvbiBuYW1lcyBhdmFpbGFibGUgb24gdGhlIG9iamVjdC5cbmV4cG9ydCBmdW5jdGlvbiBmdW5jdGlvbnMob2JqKSB7XG4gIHZhciBuYW1lcyA9IFtdO1xuICBmb3IgKHZhciBrZXkgaW4gb2JqKSB7XG4gICAgaWYgKGlzRnVuY3Rpb24ob2JqW2tleV0pKSBuYW1lcy5wdXNoKGtleSk7XG4gIH1cbiAgcmV0dXJuIG5hbWVzLnNvcnQoKTtcbn1cbmV4cG9ydCB7IGZ1bmN0aW9ucyBhcyBtZXRob2RzIH07XG5cbi8vIEFuIGludGVybmFsIGZ1bmN0aW9uIGZvciBjcmVhdGluZyBhc3NpZ25lciBmdW5jdGlvbnMuXG5mdW5jdGlvbiBjcmVhdGVBc3NpZ25lcihrZXlzRnVuYywgZGVmYXVsdHMpIHtcbiAgcmV0dXJuIGZ1bmN0aW9uKG9iaikge1xuICAgIHZhciBsZW5ndGggPSBhcmd1bWVudHMubGVuZ3RoO1xuICAgIGlmIChkZWZhdWx0cykgb2JqID0gT2JqZWN0KG9iaik7XG4gICAgaWYgKGxlbmd0aCA8IDIgfHwgb2JqID09IG51bGwpIHJldHVybiBvYmo7XG4gICAgZm9yICh2YXIgaW5kZXggPSAxOyBpbmRleCA8IGxlbmd0aDsgaW5kZXgrKykge1xuICAgICAgdmFyIHNvdXJjZSA9IGFyZ3VtZW50c1tpbmRleF0sXG4gICAgICAgICAgX2tleXMgPSBrZXlzRnVuYyhzb3VyY2UpLFxuICAgICAgICAgIGwgPSBfa2V5cy5sZW5ndGg7XG4gICAgICBmb3IgKHZhciBpID0gMDsgaSA8IGw7IGkrKykge1xuICAgICAgICB2YXIga2V5ID0gX2tleXNbaV07XG4gICAgICAgIGlmICghZGVmYXVsdHMgfHwgb2JqW2tleV0gPT09IHZvaWQgMCkgb2JqW2tleV0gPSBzb3VyY2Vba2V5XTtcbiAgICAgIH1cbiAgICB9XG4gICAgcmV0dXJuIG9iajtcbiAgfTtcbn1cblxuLy8gRXh0ZW5kIGEgZ2l2ZW4gb2JqZWN0IHdpdGggYWxsIHRoZSBwcm9wZXJ0aWVzIGluIHBhc3NlZC1pbiBvYmplY3QocykuXG5leHBvcnQgdmFyIGV4dGVuZCA9IGNyZWF0ZUFzc2lnbmVyKGFsbEtleXMpO1xuXG4vLyBBc3NpZ25zIGEgZ2l2ZW4gb2JqZWN0IHdpdGggYWxsIHRoZSBvd24gcHJvcGVydGllcyBpbiB0aGUgcGFzc2VkLWluIG9iamVjdChzKS5cbi8vIChodHRwczovL2RldmVsb3Blci5tb3ppbGxhLm9yZy9kb2NzL1dlYi9KYXZhU2NyaXB0L1JlZmVyZW5jZS9HbG9iYWxfT2JqZWN0cy9PYmplY3QvYXNzaWduKVxuZXhwb3J0IHZhciBleHRlbmRPd24gPSBjcmVhdGVBc3NpZ25lcihrZXlzKTtcbmV4cG9ydCB7IGV4dGVuZE93biBhcyBhc3NpZ24gfTtcblxuLy8gUmV0dXJucyB0aGUgZmlyc3Qga2V5IG9uIGFuIG9iamVjdCB0aGF0IHBhc3NlcyBhIHByZWRpY2F0ZSB0ZXN0LlxuZXhwb3J0IGZ1bmN0aW9uIGZpbmRLZXkob2JqLCBwcmVkaWNhdGUsIGNvbnRleHQpIHtcbiAgcHJlZGljYXRlID0gY2IocHJlZGljYXRlLCBjb250ZXh0KTtcbiAgdmFyIF9rZXlzID0ga2V5cyhvYmopLCBrZXk7XG4gIGZvciAodmFyIGkgPSAwLCBsZW5ndGggPSBfa2V5cy5sZW5ndGg7IGkgPCBsZW5ndGg7IGkrKykge1xuICAgIGtleSA9IF9rZXlzW2ldO1xuICAgIGlmIChwcmVkaWNhdGUob2JqW2tleV0sIGtleSwgb2JqKSkgcmV0dXJuIGtleTtcbiAgfVxufVxuXG4vLyBJbnRlcm5hbCBwaWNrIGhlbHBlciBmdW5jdGlvbiB0byBkZXRlcm1pbmUgaWYgYG9iamAgaGFzIGtleSBga2V5YC5cbmZ1bmN0aW9uIGtleUluT2JqKHZhbHVlLCBrZXksIG9iaikge1xuICByZXR1cm4ga2V5IGluIG9iajtcbn1cblxuLy8gUmV0dXJuIGEgY29weSBvZiB0aGUgb2JqZWN0IG9ubHkgY29udGFpbmluZyB0aGUgd2hpdGVsaXN0ZWQgcHJvcGVydGllcy5cbmV4cG9ydCB2YXIgcGljayA9IHJlc3RBcmd1bWVudHMoZnVuY3Rpb24ob2JqLCBfa2V5cykge1xuICB2YXIgcmVzdWx0ID0ge30sIGl0ZXJhdGVlID0gX2tleXNbMF07XG4gIGlmIChvYmogPT0gbnVsbCkgcmV0dXJuIHJlc3VsdDtcbiAgaWYgKGlzRnVuY3Rpb24oaXRlcmF0ZWUpKSB7XG4gICAgaWYgKF9rZXlzLmxlbmd0aCA+IDEpIGl0ZXJhdGVlID0gb3B0aW1pemVDYihpdGVyYXRlZSwgX2tleXNbMV0pO1xuICAgIF9rZXlzID0gYWxsS2V5cyhvYmopO1xuICB9IGVsc2Uge1xuICAgIGl0ZXJhdGVlID0ga2V5SW5PYmo7XG4gICAgX2tleXMgPSBfZmxhdHRlbihfa2V5cywgZmFsc2UsIGZhbHNlKTtcbiAgICBvYmogPSBPYmplY3Qob2JqKTtcbiAgfVxuICBmb3IgKHZhciBpID0gMCwgbGVuZ3RoID0gX2tleXMubGVuZ3RoOyBpIDwgbGVuZ3RoOyBpKyspIHtcbiAgICB2YXIga2V5ID0gX2tleXNbaV07XG4gICAgdmFyIHZhbHVlID0gb2JqW2tleV07XG4gICAgaWYgKGl0ZXJhdGVlKHZhbHVlLCBrZXksIG9iaikpIHJlc3VsdFtrZXldID0gdmFsdWU7XG4gIH1cbiAgcmV0dXJuIHJlc3VsdDtcbn0pO1xuXG4vLyBSZXR1cm4gYSBjb3B5IG9mIHRoZSBvYmplY3Qgd2l0aG91dCB0aGUgYmxhY2tsaXN0ZWQgcHJvcGVydGllcy5cbmV4cG9ydCB2YXIgb21pdCA9IHJlc3RBcmd1bWVudHMoZnVuY3Rpb24ob2JqLCBfa2V5cykge1xuICB2YXIgaXRlcmF0ZWUgPSBfa2V5c1swXSwgY29udGV4dDtcbiAgaWYgKGlzRnVuY3Rpb24oaXRlcmF0ZWUpKSB7XG4gICAgaXRlcmF0ZWUgPSBuZWdhdGUoaXRlcmF0ZWUpO1xuICAgIGlmIChfa2V5cy5sZW5ndGggPiAxKSBjb250ZXh0ID0gX2tleXNbMV07XG4gIH0gZWxzZSB7XG4gICAgX2tleXMgPSBtYXAoX2ZsYXR0ZW4oX2tleXMsIGZhbHNlLCBmYWxzZSksIFN0cmluZyk7XG4gICAgaXRlcmF0ZWUgPSBmdW5jdGlvbih2YWx1ZSwga2V5KSB7XG4gICAgICByZXR1cm4gIWNvbnRhaW5zKF9rZXlzLCBrZXkpO1xuICAgIH07XG4gIH1cbiAgcmV0dXJuIHBpY2sob2JqLCBpdGVyYXRlZSwgY29udGV4dCk7XG59KTtcblxuLy8gRmlsbCBpbiBhIGdpdmVuIG9iamVjdCB3aXRoIGRlZmF1bHQgcHJvcGVydGllcy5cbmV4cG9ydCB2YXIgZGVmYXVsdHMgPSBjcmVhdGVBc3NpZ25lcihhbGxLZXlzLCB0cnVlKTtcblxuLy8gQ3JlYXRlcyBhbiBvYmplY3QgdGhhdCBpbmhlcml0cyBmcm9tIHRoZSBnaXZlbiBwcm90b3R5cGUgb2JqZWN0LlxuLy8gSWYgYWRkaXRpb25hbCBwcm9wZXJ0aWVzIGFyZSBwcm92aWRlZCB0aGVuIHRoZXkgd2lsbCBiZSBhZGRlZCB0byB0aGVcbi8vIGNyZWF0ZWQgb2JqZWN0LlxuZXhwb3J0IGZ1bmN0aW9uIGNyZWF0ZShwcm90b3R5cGUsIHByb3BzKSB7XG4gIHZhciByZXN1bHQgPSBiYXNlQ3JlYXRlKHByb3RvdHlwZSk7XG4gIGlmIChwcm9wcykgZXh0ZW5kT3duKHJlc3VsdCwgcHJvcHMpO1xuICByZXR1cm4gcmVzdWx0O1xufVxuXG4vLyBDcmVhdGUgYSAoc2hhbGxvdy1jbG9uZWQpIGR1cGxpY2F0ZSBvZiBhbiBvYmplY3QuXG5leHBvcnQgZnVuY3Rpb24gY2xvbmUob2JqKSB7XG4gIGlmICghaXNPYmplY3Qob2JqKSkgcmV0dXJuIG9iajtcbiAgcmV0dXJuIGlzQXJyYXkob2JqKSA/IG9iai5zbGljZSgpIDogZXh0ZW5kKHt9LCBvYmopO1xufVxuXG4vLyBJbnZva2VzIGludGVyY2VwdG9yIHdpdGggdGhlIG9iaiwgYW5kIHRoZW4gcmV0dXJucyBvYmouXG4vLyBUaGUgcHJpbWFyeSBwdXJwb3NlIG9mIHRoaXMgbWV0aG9kIGlzIHRvIFwidGFwIGludG9cIiBhIG1ldGhvZCBjaGFpbiwgaW5cbi8vIG9yZGVyIHRvIHBlcmZvcm0gb3BlcmF0aW9ucyBvbiBpbnRlcm1lZGlhdGUgcmVzdWx0cyB3aXRoaW4gdGhlIGNoYWluLlxuZXhwb3J0IGZ1bmN0aW9uIHRhcChvYmosIGludGVyY2VwdG9yKSB7XG4gIGludGVyY2VwdG9yKG9iaik7XG4gIHJldHVybiBvYmo7XG59XG5cbi8vIFJldHVybnMgd2hldGhlciBhbiBvYmplY3QgaGFzIGEgZ2l2ZW4gc2V0IG9mIGBrZXk6dmFsdWVgIHBhaXJzLlxuZXhwb3J0IGZ1bmN0aW9uIGlzTWF0Y2gob2JqZWN0LCBhdHRycykge1xuICB2YXIgX2tleXMgPSBrZXlzKGF0dHJzKSwgbGVuZ3RoID0gX2tleXMubGVuZ3RoO1xuICBpZiAob2JqZWN0ID09IG51bGwpIHJldHVybiAhbGVuZ3RoO1xuICB2YXIgb2JqID0gT2JqZWN0KG9iamVjdCk7XG4gIGZvciAodmFyIGkgPSAwOyBpIDwgbGVuZ3RoOyBpKyspIHtcbiAgICB2YXIga2V5ID0gX2tleXNbaV07XG4gICAgaWYgKGF0dHJzW2tleV0gIT09IG9ialtrZXldIHx8ICEoa2V5IGluIG9iaikpIHJldHVybiBmYWxzZTtcbiAgfVxuICByZXR1cm4gdHJ1ZTtcbn1cblxuXG4vLyBJbnRlcm5hbCByZWN1cnNpdmUgY29tcGFyaXNvbiBmdW5jdGlvbiBmb3IgYGlzRXF1YWxgLlxuZnVuY3Rpb24gZXEoYSwgYiwgYVN0YWNrLCBiU3RhY2spIHtcbiAgLy8gSWRlbnRpY2FsIG9iamVjdHMgYXJlIGVxdWFsLiBgMCA9PT0gLTBgLCBidXQgdGhleSBhcmVuJ3QgaWRlbnRpY2FsLlxuICAvLyBTZWUgdGhlIFtIYXJtb255IGBlZ2FsYCBwcm9wb3NhbF0oaHR0cHM6Ly93aWtpLmVjbWFzY3JpcHQub3JnL2Rva3UucGhwP2lkPWhhcm1vbnk6ZWdhbCkuXG4gIGlmIChhID09PSBiKSByZXR1cm4gYSAhPT0gMCB8fCAxIC8gYSA9PT0gMSAvIGI7XG4gIC8vIGBudWxsYCBvciBgdW5kZWZpbmVkYCBvbmx5IGVxdWFsIHRvIGl0c2VsZiAoc3RyaWN0IGNvbXBhcmlzb24pLlxuICBpZiAoYSA9PSBudWxsIHx8IGIgPT0gbnVsbCkgcmV0dXJuIGZhbHNlO1xuICAvLyBgTmFOYHMgYXJlIGVxdWl2YWxlbnQsIGJ1dCBub24tcmVmbGV4aXZlLlxuICBpZiAoYSAhPT0gYSkgcmV0dXJuIGIgIT09IGI7XG4gIC8vIEV4aGF1c3QgcHJpbWl0aXZlIGNoZWNrc1xuICB2YXIgdHlwZSA9IHR5cGVvZiBhO1xuICBpZiAodHlwZSAhPT0gJ2Z1bmN0aW9uJyAmJiB0eXBlICE9PSAnb2JqZWN0JyAmJiB0eXBlb2YgYiAhPSAnb2JqZWN0JykgcmV0dXJuIGZhbHNlO1xuICByZXR1cm4gZGVlcEVxKGEsIGIsIGFTdGFjaywgYlN0YWNrKTtcbn1cblxuLy8gSW50ZXJuYWwgcmVjdXJzaXZlIGNvbXBhcmlzb24gZnVuY3Rpb24gZm9yIGBpc0VxdWFsYC5cbmZ1bmN0aW9uIGRlZXBFcShhLCBiLCBhU3RhY2ssIGJTdGFjaykge1xuICAvLyBVbndyYXAgYW55IHdyYXBwZWQgb2JqZWN0cy5cbiAgaWYgKGEgaW5zdGFuY2VvZiBfKSBhID0gYS5fd3JhcHBlZDtcbiAgaWYgKGIgaW5zdGFuY2VvZiBfKSBiID0gYi5fd3JhcHBlZDtcbiAgLy8gQ29tcGFyZSBgW1tDbGFzc11dYCBuYW1lcy5cbiAgdmFyIGNsYXNzTmFtZSA9IHRvU3RyaW5nLmNhbGwoYSk7XG4gIGlmIChjbGFzc05hbWUgIT09IHRvU3RyaW5nLmNhbGwoYikpIHJldHVybiBmYWxzZTtcbiAgc3dpdGNoIChjbGFzc05hbWUpIHtcbiAgICAvLyBTdHJpbmdzLCBudW1iZXJzLCByZWd1bGFyIGV4cHJlc3Npb25zLCBkYXRlcywgYW5kIGJvb2xlYW5zIGFyZSBjb21wYXJlZCBieSB2YWx1ZS5cbiAgICBjYXNlICdbb2JqZWN0IFJlZ0V4cF0nOlxuICAgIC8vIFJlZ0V4cHMgYXJlIGNvZXJjZWQgdG8gc3RyaW5ncyBmb3IgY29tcGFyaXNvbiAoTm90ZTogJycgKyAvYS9pID09PSAnL2EvaScpXG4gICAgY2FzZSAnW29iamVjdCBTdHJpbmddJzpcbiAgICAgIC8vIFByaW1pdGl2ZXMgYW5kIHRoZWlyIGNvcnJlc3BvbmRpbmcgb2JqZWN0IHdyYXBwZXJzIGFyZSBlcXVpdmFsZW50OyB0aHVzLCBgXCI1XCJgIGlzXG4gICAgICAvLyBlcXVpdmFsZW50IHRvIGBuZXcgU3RyaW5nKFwiNVwiKWAuXG4gICAgICByZXR1cm4gJycgKyBhID09PSAnJyArIGI7XG4gICAgY2FzZSAnW29iamVjdCBOdW1iZXJdJzpcbiAgICAgIC8vIGBOYU5gcyBhcmUgZXF1aXZhbGVudCwgYnV0IG5vbi1yZWZsZXhpdmUuXG4gICAgICAvLyBPYmplY3QoTmFOKSBpcyBlcXVpdmFsZW50IHRvIE5hTi5cbiAgICAgIGlmICgrYSAhPT0gK2EpIHJldHVybiArYiAhPT0gK2I7XG4gICAgICAvLyBBbiBgZWdhbGAgY29tcGFyaXNvbiBpcyBwZXJmb3JtZWQgZm9yIG90aGVyIG51bWVyaWMgdmFsdWVzLlxuICAgICAgcmV0dXJuICthID09PSAwID8gMSAvICthID09PSAxIC8gYiA6ICthID09PSArYjtcbiAgICBjYXNlICdbb2JqZWN0IERhdGVdJzpcbiAgICBjYXNlICdbb2JqZWN0IEJvb2xlYW5dJzpcbiAgICAgIC8vIENvZXJjZSBkYXRlcyBhbmQgYm9vbGVhbnMgdG8gbnVtZXJpYyBwcmltaXRpdmUgdmFsdWVzLiBEYXRlcyBhcmUgY29tcGFyZWQgYnkgdGhlaXJcbiAgICAgIC8vIG1pbGxpc2Vjb25kIHJlcHJlc2VudGF0aW9ucy4gTm90ZSB0aGF0IGludmFsaWQgZGF0ZXMgd2l0aCBtaWxsaXNlY29uZCByZXByZXNlbnRhdGlvbnNcbiAgICAgIC8vIG9mIGBOYU5gIGFyZSBub3QgZXF1aXZhbGVudC5cbiAgICAgIHJldHVybiArYSA9PT0gK2I7XG4gICAgY2FzZSAnW29iamVjdCBTeW1ib2xdJzpcbiAgICAgIHJldHVybiBTeW1ib2xQcm90by52YWx1ZU9mLmNhbGwoYSkgPT09IFN5bWJvbFByb3RvLnZhbHVlT2YuY2FsbChiKTtcbiAgfVxuXG4gIHZhciBhcmVBcnJheXMgPSBjbGFzc05hbWUgPT09ICdbb2JqZWN0IEFycmF5XSc7XG4gIGlmICghYXJlQXJyYXlzKSB7XG4gICAgaWYgKHR5cGVvZiBhICE9ICdvYmplY3QnIHx8IHR5cGVvZiBiICE9ICdvYmplY3QnKSByZXR1cm4gZmFsc2U7XG5cbiAgICAvLyBPYmplY3RzIHdpdGggZGlmZmVyZW50IGNvbnN0cnVjdG9ycyBhcmUgbm90IGVxdWl2YWxlbnQsIGJ1dCBgT2JqZWN0YHMgb3IgYEFycmF5YHNcbiAgICAvLyBmcm9tIGRpZmZlcmVudCBmcmFtZXMgYXJlLlxuICAgIHZhciBhQ3RvciA9IGEuY29uc3RydWN0b3IsIGJDdG9yID0gYi5jb25zdHJ1Y3RvcjtcbiAgICBpZiAoYUN0b3IgIT09IGJDdG9yICYmICEoaXNGdW5jdGlvbihhQ3RvcikgJiYgYUN0b3IgaW5zdGFuY2VvZiBhQ3RvciAmJlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICBpc0Z1bmN0aW9uKGJDdG9yKSAmJiBiQ3RvciBpbnN0YW5jZW9mIGJDdG9yKVxuICAgICAgICAgICAgICAgICAgICAgICAgJiYgKCdjb25zdHJ1Y3RvcicgaW4gYSAmJiAnY29uc3RydWN0b3InIGluIGIpKSB7XG4gICAgICByZXR1cm4gZmFsc2U7XG4gICAgfVxuICB9XG4gIC8vIEFzc3VtZSBlcXVhbGl0eSBmb3IgY3ljbGljIHN0cnVjdHVyZXMuIFRoZSBhbGdvcml0aG0gZm9yIGRldGVjdGluZyBjeWNsaWNcbiAgLy8gc3RydWN0dXJlcyBpcyBhZGFwdGVkIGZyb20gRVMgNS4xIHNlY3Rpb24gMTUuMTIuMywgYWJzdHJhY3Qgb3BlcmF0aW9uIGBKT2AuXG5cbiAgLy8gSW5pdGlhbGl6aW5nIHN0YWNrIG9mIHRyYXZlcnNlZCBvYmplY3RzLlxuICAvLyBJdCdzIGRvbmUgaGVyZSBzaW5jZSB3ZSBvbmx5IG5lZWQgdGhlbSBmb3Igb2JqZWN0cyBhbmQgYXJyYXlzIGNvbXBhcmlzb24uXG4gIGFTdGFjayA9IGFTdGFjayB8fCBbXTtcbiAgYlN0YWNrID0gYlN0YWNrIHx8IFtdO1xuICB2YXIgbGVuZ3RoID0gYVN0YWNrLmxlbmd0aDtcbiAgd2hpbGUgKGxlbmd0aC0tKSB7XG4gICAgLy8gTGluZWFyIHNlYXJjaC4gUGVyZm9ybWFuY2UgaXMgaW52ZXJzZWx5IHByb3BvcnRpb25hbCB0byB0aGUgbnVtYmVyIG9mXG4gICAgLy8gdW5pcXVlIG5lc3RlZCBzdHJ1Y3R1cmVzLlxuICAgIGlmIChhU3RhY2tbbGVuZ3RoXSA9PT0gYSkgcmV0dXJuIGJTdGFja1tsZW5ndGhdID09PSBiO1xuICB9XG5cbiAgLy8gQWRkIHRoZSBmaXJzdCBvYmplY3QgdG8gdGhlIHN0YWNrIG9mIHRyYXZlcnNlZCBvYmplY3RzLlxuICBhU3RhY2sucHVzaChhKTtcbiAgYlN0YWNrLnB1c2goYik7XG5cbiAgLy8gUmVjdXJzaXZlbHkgY29tcGFyZSBvYmplY3RzIGFuZCBhcnJheXMuXG4gIGlmIChhcmVBcnJheXMpIHtcbiAgICAvLyBDb21wYXJlIGFycmF5IGxlbmd0aHMgdG8gZGV0ZXJtaW5lIGlmIGEgZGVlcCBjb21wYXJpc29uIGlzIG5lY2Vzc2FyeS5cbiAgICBsZW5ndGggPSBhLmxlbmd0aDtcbiAgICBpZiAobGVuZ3RoICE9PSBiLmxlbmd0aCkgcmV0dXJuIGZhbHNlO1xuICAgIC8vIERlZXAgY29tcGFyZSB0aGUgY29udGVudHMsIGlnbm9yaW5nIG5vbi1udW1lcmljIHByb3BlcnRpZXMuXG4gICAgd2hpbGUgKGxlbmd0aC0tKSB7XG4gICAgICBpZiAoIWVxKGFbbGVuZ3RoXSwgYltsZW5ndGhdLCBhU3RhY2ssIGJTdGFjaykpIHJldHVybiBmYWxzZTtcbiAgICB9XG4gIH0gZWxzZSB7XG4gICAgLy8gRGVlcCBjb21wYXJlIG9iamVjdHMuXG4gICAgdmFyIF9rZXlzID0ga2V5cyhhKSwga2V5O1xuICAgIGxlbmd0aCA9IF9rZXlzLmxlbmd0aDtcbiAgICAvLyBFbnN1cmUgdGhhdCBib3RoIG9iamVjdHMgY29udGFpbiB0aGUgc2FtZSBudW1iZXIgb2YgcHJvcGVydGllcyBiZWZvcmUgY29tcGFyaW5nIGRlZXAgZXF1YWxpdHkuXG4gICAgaWYgKGtleXMoYikubGVuZ3RoICE9PSBsZW5ndGgpIHJldHVybiBmYWxzZTtcbiAgICB3aGlsZSAobGVuZ3RoLS0pIHtcbiAgICAgIC8vIERlZXAgY29tcGFyZSBlYWNoIG1lbWJlclxuICAgICAga2V5ID0gX2tleXNbbGVuZ3RoXTtcbiAgICAgIGlmICghKF9oYXMoYiwga2V5KSAmJiBlcShhW2tleV0sIGJba2V5XSwgYVN0YWNrLCBiU3RhY2spKSkgcmV0dXJuIGZhbHNlO1xuICAgIH1cbiAgfVxuICAvLyBSZW1vdmUgdGhlIGZpcnN0IG9iamVjdCBmcm9tIHRoZSBzdGFjayBvZiB0cmF2ZXJzZWQgb2JqZWN0cy5cbiAgYVN0YWNrLnBvcCgpO1xuICBiU3RhY2sucG9wKCk7XG4gIHJldHVybiB0cnVlO1xufVxuXG4vLyBQZXJmb3JtIGEgZGVlcCBjb21wYXJpc29uIHRvIGNoZWNrIGlmIHR3byBvYmplY3RzIGFyZSBlcXVhbC5cbmV4cG9ydCBmdW5jdGlvbiBpc0VxdWFsKGEsIGIpIHtcbiAgcmV0dXJuIGVxKGEsIGIpO1xufVxuXG4vLyBJcyBhIGdpdmVuIGFycmF5LCBzdHJpbmcsIG9yIG9iamVjdCBlbXB0eT9cbi8vIEFuIFwiZW1wdHlcIiBvYmplY3QgaGFzIG5vIGVudW1lcmFibGUgb3duLXByb3BlcnRpZXMuXG5leHBvcnQgZnVuY3Rpb24gaXNFbXB0eShvYmopIHtcbiAgaWYgKG9iaiA9PSBudWxsKSByZXR1cm4gdHJ1ZTtcbiAgaWYgKGlzQXJyYXlMaWtlKG9iaikgJiYgKGlzQXJyYXkob2JqKSB8fCBpc1N0cmluZyhvYmopIHx8IGlzQXJndW1lbnRzKG9iaikpKSByZXR1cm4gb2JqLmxlbmd0aCA9PT0gMDtcbiAgcmV0dXJuIGtleXMob2JqKS5sZW5ndGggPT09IDA7XG59XG5cbi8vIElzIGEgZ2l2ZW4gdmFsdWUgYSBET00gZWxlbWVudD9cbmV4cG9ydCBmdW5jdGlvbiBpc0VsZW1lbnQob2JqKSB7XG4gIHJldHVybiAhIShvYmogJiYgb2JqLm5vZGVUeXBlID09PSAxKTtcbn1cblxuLy8gSW50ZXJuYWwgZnVuY3Rpb24gZm9yIGNyZWF0aW5nIGEgdG9TdHJpbmctYmFzZWQgdHlwZSB0ZXN0ZXIuXG5mdW5jdGlvbiB0YWdUZXN0ZXIobmFtZSkge1xuICByZXR1cm4gZnVuY3Rpb24ob2JqKSB7XG4gICAgcmV0dXJuIHRvU3RyaW5nLmNhbGwob2JqKSA9PT0gJ1tvYmplY3QgJyArIG5hbWUgKyAnXSc7XG4gIH07XG59XG5cbi8vIElzIGEgZ2l2ZW4gdmFsdWUgYW4gYXJyYXk/XG4vLyBEZWxlZ2F0ZXMgdG8gRUNNQTUncyBuYXRpdmUgQXJyYXkuaXNBcnJheVxuZXhwb3J0IHZhciBpc0FycmF5ID0gbmF0aXZlSXNBcnJheSB8fCB0YWdUZXN0ZXIoJ0FycmF5Jyk7XG5cbi8vIElzIGEgZ2l2ZW4gdmFyaWFibGUgYW4gb2JqZWN0P1xuZXhwb3J0IGZ1bmN0aW9uIGlzT2JqZWN0KG9iaikge1xuICB2YXIgdHlwZSA9IHR5cGVvZiBvYmo7XG4gIHJldHVybiB0eXBlID09PSAnZnVuY3Rpb24nIHx8IHR5cGUgPT09ICdvYmplY3QnICYmICEhb2JqO1xufVxuXG4vLyBBZGQgc29tZSBpc1R5cGUgbWV0aG9kczogaXNBcmd1bWVudHMsIGlzRnVuY3Rpb24sIGlzU3RyaW5nLCBpc051bWJlciwgaXNEYXRlLCBpc1JlZ0V4cCwgaXNFcnJvciwgaXNNYXAsIGlzV2Vha01hcCwgaXNTZXQsIGlzV2Vha1NldC5cbmV4cG9ydCB2YXIgaXNBcmd1bWVudHMgPSB0YWdUZXN0ZXIoJ0FyZ3VtZW50cycpO1xuZXhwb3J0IHZhciBpc0Z1bmN0aW9uID0gdGFnVGVzdGVyKCdGdW5jdGlvbicpO1xuZXhwb3J0IHZhciBpc1N0cmluZyA9IHRhZ1Rlc3RlcignU3RyaW5nJyk7XG5leHBvcnQgdmFyIGlzTnVtYmVyID0gdGFnVGVzdGVyKCdOdW1iZXInKTtcbmV4cG9ydCB2YXIgaXNEYXRlID0gdGFnVGVzdGVyKCdEYXRlJyk7XG5leHBvcnQgdmFyIGlzUmVnRXhwID0gdGFnVGVzdGVyKCdSZWdFeHAnKTtcbmV4cG9ydCB2YXIgaXNFcnJvciA9IHRhZ1Rlc3RlcignRXJyb3InKTtcbmV4cG9ydCB2YXIgaXNTeW1ib2wgPSB0YWdUZXN0ZXIoJ1N5bWJvbCcpO1xuZXhwb3J0IHZhciBpc01hcCA9IHRhZ1Rlc3RlcignTWFwJyk7XG5leHBvcnQgdmFyIGlzV2Vha01hcCA9IHRhZ1Rlc3RlcignV2Vha01hcCcpO1xuZXhwb3J0IHZhciBpc1NldCA9IHRhZ1Rlc3RlcignU2V0Jyk7XG5leHBvcnQgdmFyIGlzV2Vha1NldCA9IHRhZ1Rlc3RlcignV2Vha1NldCcpO1xuXG4vLyBEZWZpbmUgYSBmYWxsYmFjayB2ZXJzaW9uIG9mIHRoZSBtZXRob2QgaW4gYnJvd3NlcnMgKGFoZW0sIElFIDwgOSksIHdoZXJlXG4vLyB0aGVyZSBpc24ndCBhbnkgaW5zcGVjdGFibGUgXCJBcmd1bWVudHNcIiB0eXBlLlxuKGZ1bmN0aW9uKCkge1xuICBpZiAoIWlzQXJndW1lbnRzKGFyZ3VtZW50cykpIHtcbiAgICBpc0FyZ3VtZW50cyA9IGZ1bmN0aW9uKG9iaikge1xuICAgICAgcmV0dXJuIF9oYXMob2JqLCAnY2FsbGVlJyk7XG4gICAgfTtcbiAgfVxufSgpKTtcblxuLy8gT3B0aW1pemUgYGlzRnVuY3Rpb25gIGlmIGFwcHJvcHJpYXRlLiBXb3JrIGFyb3VuZCBzb21lIHR5cGVvZiBidWdzIGluIG9sZCB2OCxcbi8vIElFIDExICgjMTYyMSksIFNhZmFyaSA4ICgjMTkyOSksIGFuZCBQaGFudG9tSlMgKCMyMjM2KS5cbnZhciBub2RlbGlzdCA9IHJvb3QuZG9jdW1lbnQgJiYgcm9vdC5kb2N1bWVudC5jaGlsZE5vZGVzO1xuaWYgKHR5cGVvZiAvLi8gIT0gJ2Z1bmN0aW9uJyAmJiB0eXBlb2YgSW50OEFycmF5ICE9ICdvYmplY3QnICYmIHR5cGVvZiBub2RlbGlzdCAhPSAnZnVuY3Rpb24nKSB7XG4gIGlzRnVuY3Rpb24gPSBmdW5jdGlvbihvYmopIHtcbiAgICByZXR1cm4gdHlwZW9mIG9iaiA9PSAnZnVuY3Rpb24nIHx8IGZhbHNlO1xuICB9O1xufVxuXG4vLyBJcyBhIGdpdmVuIG9iamVjdCBhIGZpbml0ZSBudW1iZXI/XG5leHBvcnQgZnVuY3Rpb24gaXNGaW5pdGUob2JqKSB7XG4gIHJldHVybiAhaXNTeW1ib2wob2JqKSAmJiBfaXNGaW5pdGUob2JqKSAmJiAhX2lzTmFOKHBhcnNlRmxvYXQob2JqKSk7XG59XG5cbi8vIElzIHRoZSBnaXZlbiB2YWx1ZSBgTmFOYD9cbmV4cG9ydCBmdW5jdGlvbiBpc05hTihvYmopIHtcbiAgcmV0dXJuIGlzTnVtYmVyKG9iaikgJiYgX2lzTmFOKG9iaik7XG59XG5cbi8vIElzIGEgZ2l2ZW4gdmFsdWUgYSBib29sZWFuP1xuZXhwb3J0IGZ1bmN0aW9uIGlzQm9vbGVhbihvYmopIHtcbiAgcmV0dXJuIG9iaiA9PT0gdHJ1ZSB8fCBvYmogPT09IGZhbHNlIHx8IHRvU3RyaW5nLmNhbGwob2JqKSA9PT0gJ1tvYmplY3QgQm9vbGVhbl0nO1xufVxuXG4vLyBJcyBhIGdpdmVuIHZhbHVlIGVxdWFsIHRvIG51bGw/XG5leHBvcnQgZnVuY3Rpb24gaXNOdWxsKG9iaikge1xuICByZXR1cm4gb2JqID09PSBudWxsO1xufVxuXG4vLyBJcyBhIGdpdmVuIHZhcmlhYmxlIHVuZGVmaW5lZD9cbmV4cG9ydCBmdW5jdGlvbiBpc1VuZGVmaW5lZChvYmopIHtcbiAgcmV0dXJuIG9iaiA9PT0gdm9pZCAwO1xufVxuXG4vLyBTaG9ydGN1dCBmdW5jdGlvbiBmb3IgY2hlY2tpbmcgaWYgYW4gb2JqZWN0IGhhcyBhIGdpdmVuIHByb3BlcnR5IGRpcmVjdGx5XG4vLyBvbiBpdHNlbGYgKGluIG90aGVyIHdvcmRzLCBub3Qgb24gYSBwcm90b3R5cGUpLlxuZXhwb3J0IGZ1bmN0aW9uIGhhcyhvYmosIHBhdGgpIHtcbiAgaWYgKCFpc0FycmF5KHBhdGgpKSB7XG4gICAgcmV0dXJuIF9oYXMob2JqLCBwYXRoKTtcbiAgfVxuICB2YXIgbGVuZ3RoID0gcGF0aC5sZW5ndGg7XG4gIGZvciAodmFyIGkgPSAwOyBpIDwgbGVuZ3RoOyBpKyspIHtcbiAgICB2YXIga2V5ID0gcGF0aFtpXTtcbiAgICBpZiAob2JqID09IG51bGwgfHwgIWhhc093blByb3BlcnR5LmNhbGwob2JqLCBrZXkpKSB7XG4gICAgICByZXR1cm4gZmFsc2U7XG4gICAgfVxuICAgIG9iaiA9IG9ialtrZXldO1xuICB9XG4gIHJldHVybiAhIWxlbmd0aDtcbn1cblxuLy8gVXRpbGl0eSBGdW5jdGlvbnNcbi8vIC0tLS0tLS0tLS0tLS0tLS0tXG5cbi8vIEtlZXAgdGhlIGlkZW50aXR5IGZ1bmN0aW9uIGFyb3VuZCBmb3IgZGVmYXVsdCBpdGVyYXRlZXMuXG5leHBvcnQgZnVuY3Rpb24gaWRlbnRpdHkodmFsdWUpIHtcbiAgcmV0dXJuIHZhbHVlO1xufVxuXG4vLyBQcmVkaWNhdGUtZ2VuZXJhdGluZyBmdW5jdGlvbnMuIE9mdGVuIHVzZWZ1bCBvdXRzaWRlIG9mIFVuZGVyc2NvcmUuXG5leHBvcnQgZnVuY3Rpb24gY29uc3RhbnQodmFsdWUpIHtcbiAgcmV0dXJuIGZ1bmN0aW9uKCkge1xuICAgIHJldHVybiB2YWx1ZTtcbiAgfTtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIG5vb3AoKXt9XG5cbi8vIENyZWF0ZXMgYSBmdW5jdGlvbiB0aGF0LCB3aGVuIHBhc3NlZCBhbiBvYmplY3QsIHdpbGwgdHJhdmVyc2UgdGhhdCBvYmplY3TigJlzXG4vLyBwcm9wZXJ0aWVzIGRvd24gdGhlIGdpdmVuIGBwYXRoYCwgc3BlY2lmaWVkIGFzIGFuIGFycmF5IG9mIGtleXMgb3IgaW5kZXhlcy5cbmV4cG9ydCBmdW5jdGlvbiBwcm9wZXJ0eShwYXRoKSB7XG4gIGlmICghaXNBcnJheShwYXRoKSkge1xuICAgIHJldHVybiBzaGFsbG93UHJvcGVydHkocGF0aCk7XG4gIH1cbiAgcmV0dXJuIGZ1bmN0aW9uKG9iaikge1xuICAgIHJldHVybiBkZWVwR2V0KG9iaiwgcGF0aCk7XG4gIH07XG59XG5cbi8vIEdlbmVyYXRlcyBhIGZ1bmN0aW9uIGZvciBhIGdpdmVuIG9iamVjdCB0aGF0IHJldHVybnMgYSBnaXZlbiBwcm9wZXJ0eS5cbmV4cG9ydCBmdW5jdGlvbiBwcm9wZXJ0eU9mKG9iaikge1xuICBpZiAob2JqID09IG51bGwpIHtcbiAgICByZXR1cm4gZnVuY3Rpb24oKXt9O1xuICB9XG4gIHJldHVybiBmdW5jdGlvbihwYXRoKSB7XG4gICAgcmV0dXJuICFpc0FycmF5KHBhdGgpID8gb2JqW3BhdGhdIDogZGVlcEdldChvYmosIHBhdGgpO1xuICB9O1xufVxuXG4vLyBSZXR1cm5zIGEgcHJlZGljYXRlIGZvciBjaGVja2luZyB3aGV0aGVyIGFuIG9iamVjdCBoYXMgYSBnaXZlbiBzZXQgb2Zcbi8vIGBrZXk6dmFsdWVgIHBhaXJzLlxuZXhwb3J0IGZ1bmN0aW9uIG1hdGNoZXIoYXR0cnMpIHtcbiAgYXR0cnMgPSBleHRlbmRPd24oe30sIGF0dHJzKTtcbiAgcmV0dXJuIGZ1bmN0aW9uKG9iaikge1xuICAgIHJldHVybiBpc01hdGNoKG9iaiwgYXR0cnMpO1xuICB9O1xufVxuZXhwb3J0IHsgbWF0Y2hlciBhcyBtYXRjaGVzIH07XG5cbi8vIFJ1biBhIGZ1bmN0aW9uICoqbioqIHRpbWVzLlxuZXhwb3J0IGZ1bmN0aW9uIHRpbWVzKG4sIGl0ZXJhdGVlLCBjb250ZXh0KSB7XG4gIHZhciBhY2N1bSA9IEFycmF5KE1hdGgubWF4KDAsIG4pKTtcbiAgaXRlcmF0ZWUgPSBvcHRpbWl6ZUNiKGl0ZXJhdGVlLCBjb250ZXh0LCAxKTtcbiAgZm9yICh2YXIgaSA9IDA7IGkgPCBuOyBpKyspIGFjY3VtW2ldID0gaXRlcmF0ZWUoaSk7XG4gIHJldHVybiBhY2N1bTtcbn1cblxuLy8gUmV0dXJuIGEgcmFuZG9tIGludGVnZXIgYmV0d2VlbiBtaW4gYW5kIG1heCAoaW5jbHVzaXZlKS5cbmV4cG9ydCBmdW5jdGlvbiByYW5kb20obWluLCBtYXgpIHtcbiAgaWYgKG1heCA9PSBudWxsKSB7XG4gICAgbWF4ID0gbWluO1xuICAgIG1pbiA9IDA7XG4gIH1cbiAgcmV0dXJuIG1pbiArIE1hdGguZmxvb3IoTWF0aC5yYW5kb20oKSAqIChtYXggLSBtaW4gKyAxKSk7XG59XG5cbi8vIEEgKHBvc3NpYmx5IGZhc3Rlcikgd2F5IHRvIGdldCB0aGUgY3VycmVudCB0aW1lc3RhbXAgYXMgYW4gaW50ZWdlci5cbmV4cG9ydCB2YXIgbm93ID0gRGF0ZS5ub3cgfHwgZnVuY3Rpb24oKSB7XG4gIHJldHVybiBuZXcgRGF0ZSgpLmdldFRpbWUoKTtcbn07XG5cbi8vIExpc3Qgb2YgSFRNTCBlbnRpdGllcyBmb3IgZXNjYXBpbmcuXG52YXIgZXNjYXBlTWFwID0ge1xuICAnJic6ICcmYW1wOycsXG4gICc8JzogJyZsdDsnLFxuICAnPic6ICcmZ3Q7JyxcbiAgJ1wiJzogJyZxdW90OycsXG4gIFwiJ1wiOiAnJiN4Mjc7JyxcbiAgJ2AnOiAnJiN4NjA7J1xufTtcbnZhciB1bmVzY2FwZU1hcCA9IGludmVydChlc2NhcGVNYXApO1xuXG4vLyBGdW5jdGlvbnMgZm9yIGVzY2FwaW5nIGFuZCB1bmVzY2FwaW5nIHN0cmluZ3MgdG8vZnJvbSBIVE1MIGludGVycG9sYXRpb24uXG5mdW5jdGlvbiBjcmVhdGVFc2NhcGVyKG1hcCkge1xuICB2YXIgZXNjYXBlciA9IGZ1bmN0aW9uKG1hdGNoKSB7XG4gICAgcmV0dXJuIG1hcFttYXRjaF07XG4gIH07XG4gIC8vIFJlZ2V4ZXMgZm9yIGlkZW50aWZ5aW5nIGEga2V5IHRoYXQgbmVlZHMgdG8gYmUgZXNjYXBlZC5cbiAgdmFyIHNvdXJjZSA9ICcoPzonICsga2V5cyhtYXApLmpvaW4oJ3wnKSArICcpJztcbiAgdmFyIHRlc3RSZWdleHAgPSBSZWdFeHAoc291cmNlKTtcbiAgdmFyIHJlcGxhY2VSZWdleHAgPSBSZWdFeHAoc291cmNlLCAnZycpO1xuICByZXR1cm4gZnVuY3Rpb24oc3RyaW5nKSB7XG4gICAgc3RyaW5nID0gc3RyaW5nID09IG51bGwgPyAnJyA6ICcnICsgc3RyaW5nO1xuICAgIHJldHVybiB0ZXN0UmVnZXhwLnRlc3Qoc3RyaW5nKSA/IHN0cmluZy5yZXBsYWNlKHJlcGxhY2VSZWdleHAsIGVzY2FwZXIpIDogc3RyaW5nO1xuICB9O1xufVxuZXhwb3J0IHZhciBlc2NhcGUgPSBjcmVhdGVFc2NhcGVyKGVzY2FwZU1hcCk7XG5leHBvcnQgdmFyIHVuZXNjYXBlID0gY3JlYXRlRXNjYXBlcih1bmVzY2FwZU1hcCk7XG5cbi8vIFRyYXZlcnNlcyB0aGUgY2hpbGRyZW4gb2YgYG9iamAgYWxvbmcgYHBhdGhgLiBJZiBhIGNoaWxkIGlzIGEgZnVuY3Rpb24sIGl0XG4vLyBpcyBpbnZva2VkIHdpdGggaXRzIHBhcmVudCBhcyBjb250ZXh0LiBSZXR1cm5zIHRoZSB2YWx1ZSBvZiB0aGUgZmluYWxcbi8vIGNoaWxkLCBvciBgZmFsbGJhY2tgIGlmIGFueSBjaGlsZCBpcyB1bmRlZmluZWQuXG5leHBvcnQgZnVuY3Rpb24gcmVzdWx0KG9iaiwgcGF0aCwgZmFsbGJhY2spIHtcbiAgaWYgKCFpc0FycmF5KHBhdGgpKSBwYXRoID0gW3BhdGhdO1xuICB2YXIgbGVuZ3RoID0gcGF0aC5sZW5ndGg7XG4gIGlmICghbGVuZ3RoKSB7XG4gICAgcmV0dXJuIGlzRnVuY3Rpb24oZmFsbGJhY2spID8gZmFsbGJhY2suY2FsbChvYmopIDogZmFsbGJhY2s7XG4gIH1cbiAgZm9yICh2YXIgaSA9IDA7IGkgPCBsZW5ndGg7IGkrKykge1xuICAgIHZhciBwcm9wID0gb2JqID09IG51bGwgPyB2b2lkIDAgOiBvYmpbcGF0aFtpXV07XG4gICAgaWYgKHByb3AgPT09IHZvaWQgMCkge1xuICAgICAgcHJvcCA9IGZhbGxiYWNrO1xuICAgICAgaSA9IGxlbmd0aDsgLy8gRW5zdXJlIHdlIGRvbid0IGNvbnRpbnVlIGl0ZXJhdGluZy5cbiAgICB9XG4gICAgb2JqID0gaXNGdW5jdGlvbihwcm9wKSA/IHByb3AuY2FsbChvYmopIDogcHJvcDtcbiAgfVxuICByZXR1cm4gb2JqO1xufVxuXG4vLyBHZW5lcmF0ZSBhIHVuaXF1ZSBpbnRlZ2VyIGlkICh1bmlxdWUgd2l0aGluIHRoZSBlbnRpcmUgY2xpZW50IHNlc3Npb24pLlxuLy8gVXNlZnVsIGZvciB0ZW1wb3JhcnkgRE9NIGlkcy5cbnZhciBpZENvdW50ZXIgPSAwO1xuZXhwb3J0IGZ1bmN0aW9uIHVuaXF1ZUlkKHByZWZpeCkge1xuICB2YXIgaWQgPSArK2lkQ291bnRlciArICcnO1xuICByZXR1cm4gcHJlZml4ID8gcHJlZml4ICsgaWQgOiBpZDtcbn1cblxuLy8gQnkgZGVmYXVsdCwgVW5kZXJzY29yZSB1c2VzIEVSQi1zdHlsZSB0ZW1wbGF0ZSBkZWxpbWl0ZXJzLCBjaGFuZ2UgdGhlXG4vLyBmb2xsb3dpbmcgdGVtcGxhdGUgc2V0dGluZ3MgdG8gdXNlIGFsdGVybmF0aXZlIGRlbGltaXRlcnMuXG5leHBvcnQgdmFyIHRlbXBsYXRlU2V0dGluZ3MgPSBfLnRlbXBsYXRlU2V0dGluZ3MgPSB7XG4gIGV2YWx1YXRlOiAvPCUoW1xcc1xcU10rPyklPi9nLFxuICBpbnRlcnBvbGF0ZTogLzwlPShbXFxzXFxTXSs/KSU+L2csXG4gIGVzY2FwZTogLzwlLShbXFxzXFxTXSs/KSU+L2dcbn07XG5cbi8vIFdoZW4gY3VzdG9taXppbmcgYHRlbXBsYXRlU2V0dGluZ3NgLCBpZiB5b3UgZG9uJ3Qgd2FudCB0byBkZWZpbmUgYW5cbi8vIGludGVycG9sYXRpb24sIGV2YWx1YXRpb24gb3IgZXNjYXBpbmcgcmVnZXgsIHdlIG5lZWQgb25lIHRoYXQgaXNcbi8vIGd1YXJhbnRlZWQgbm90IHRvIG1hdGNoLlxudmFyIG5vTWF0Y2ggPSAvKC4pXi87XG5cbi8vIENlcnRhaW4gY2hhcmFjdGVycyBuZWVkIHRvIGJlIGVzY2FwZWQgc28gdGhhdCB0aGV5IGNhbiBiZSBwdXQgaW50byBhXG4vLyBzdHJpbmcgbGl0ZXJhbC5cbnZhciBlc2NhcGVzID0ge1xuICBcIidcIjogXCInXCIsXG4gICdcXFxcJzogJ1xcXFwnLFxuICAnXFxyJzogJ3InLFxuICAnXFxuJzogJ24nLFxuICAnXFx1MjAyOCc6ICd1MjAyOCcsXG4gICdcXHUyMDI5JzogJ3UyMDI5J1xufTtcblxudmFyIGVzY2FwZVJlZ0V4cCA9IC9cXFxcfCd8XFxyfFxcbnxcXHUyMDI4fFxcdTIwMjkvZztcblxudmFyIGVzY2FwZUNoYXIgPSBmdW5jdGlvbihtYXRjaCkge1xuICByZXR1cm4gJ1xcXFwnICsgZXNjYXBlc1ttYXRjaF07XG59O1xuXG4vLyBKYXZhU2NyaXB0IG1pY3JvLXRlbXBsYXRpbmcsIHNpbWlsYXIgdG8gSm9obiBSZXNpZydzIGltcGxlbWVudGF0aW9uLlxuLy8gVW5kZXJzY29yZSB0ZW1wbGF0aW5nIGhhbmRsZXMgYXJiaXRyYXJ5IGRlbGltaXRlcnMsIHByZXNlcnZlcyB3aGl0ZXNwYWNlLFxuLy8gYW5kIGNvcnJlY3RseSBlc2NhcGVzIHF1b3RlcyB3aXRoaW4gaW50ZXJwb2xhdGVkIGNvZGUuXG4vLyBOQjogYG9sZFNldHRpbmdzYCBvbmx5IGV4aXN0cyBmb3IgYmFja3dhcmRzIGNvbXBhdGliaWxpdHkuXG5leHBvcnQgZnVuY3Rpb24gdGVtcGxhdGUodGV4dCwgc2V0dGluZ3MsIG9sZFNldHRpbmdzKSB7XG4gIGlmICghc2V0dGluZ3MgJiYgb2xkU2V0dGluZ3MpIHNldHRpbmdzID0gb2xkU2V0dGluZ3M7XG4gIHNldHRpbmdzID0gZGVmYXVsdHMoe30sIHNldHRpbmdzLCBfLnRlbXBsYXRlU2V0dGluZ3MpO1xuXG4gIC8vIENvbWJpbmUgZGVsaW1pdGVycyBpbnRvIG9uZSByZWd1bGFyIGV4cHJlc3Npb24gdmlhIGFsdGVybmF0aW9uLlxuICB2YXIgbWF0Y2hlciA9IFJlZ0V4cChbXG4gICAgKHNldHRpbmdzLmVzY2FwZSB8fCBub01hdGNoKS5zb3VyY2UsXG4gICAgKHNldHRpbmdzLmludGVycG9sYXRlIHx8IG5vTWF0Y2gpLnNvdXJjZSxcbiAgICAoc2V0dGluZ3MuZXZhbHVhdGUgfHwgbm9NYXRjaCkuc291cmNlXG4gIF0uam9pbignfCcpICsgJ3wkJywgJ2cnKTtcblxuICAvLyBDb21waWxlIHRoZSB0ZW1wbGF0ZSBzb3VyY2UsIGVzY2FwaW5nIHN0cmluZyBsaXRlcmFscyBhcHByb3ByaWF0ZWx5LlxuICB2YXIgaW5kZXggPSAwO1xuICB2YXIgc291cmNlID0gXCJfX3ArPSdcIjtcbiAgdGV4dC5yZXBsYWNlKG1hdGNoZXIsIGZ1bmN0aW9uKG1hdGNoLCBlc2NhcGUsIGludGVycG9sYXRlLCBldmFsdWF0ZSwgb2Zmc2V0KSB7XG4gICAgc291cmNlICs9IHRleHQuc2xpY2UoaW5kZXgsIG9mZnNldCkucmVwbGFjZShlc2NhcGVSZWdFeHAsIGVzY2FwZUNoYXIpO1xuICAgIGluZGV4ID0gb2Zmc2V0ICsgbWF0Y2gubGVuZ3RoO1xuXG4gICAgaWYgKGVzY2FwZSkge1xuICAgICAgc291cmNlICs9IFwiJytcXG4oKF9fdD0oXCIgKyBlc2NhcGUgKyBcIikpPT1udWxsPycnOl8uZXNjYXBlKF9fdCkpK1xcbidcIjtcbiAgICB9IGVsc2UgaWYgKGludGVycG9sYXRlKSB7XG4gICAgICBzb3VyY2UgKz0gXCInK1xcbigoX190PShcIiArIGludGVycG9sYXRlICsgXCIpKT09bnVsbD8nJzpfX3QpK1xcbidcIjtcbiAgICB9IGVsc2UgaWYgKGV2YWx1YXRlKSB7XG4gICAgICBzb3VyY2UgKz0gXCInO1xcblwiICsgZXZhbHVhdGUgKyBcIlxcbl9fcCs9J1wiO1xuICAgIH1cblxuICAgIC8vIEFkb2JlIFZNcyBuZWVkIHRoZSBtYXRjaCByZXR1cm5lZCB0byBwcm9kdWNlIHRoZSBjb3JyZWN0IG9mZnNldC5cbiAgICByZXR1cm4gbWF0Y2g7XG4gIH0pO1xuICBzb3VyY2UgKz0gXCInO1xcblwiO1xuXG4gIC8vIElmIGEgdmFyaWFibGUgaXMgbm90IHNwZWNpZmllZCwgcGxhY2UgZGF0YSB2YWx1ZXMgaW4gbG9jYWwgc2NvcGUuXG4gIGlmICghc2V0dGluZ3MudmFyaWFibGUpIHNvdXJjZSA9ICd3aXRoKG9ianx8e30pe1xcbicgKyBzb3VyY2UgKyAnfVxcbic7XG5cbiAgc291cmNlID0gXCJ2YXIgX190LF9fcD0nJyxfX2o9QXJyYXkucHJvdG90eXBlLmpvaW4sXCIgK1xuICAgIFwicHJpbnQ9ZnVuY3Rpb24oKXtfX3ArPV9fai5jYWxsKGFyZ3VtZW50cywnJyk7fTtcXG5cIiArXG4gICAgc291cmNlICsgJ3JldHVybiBfX3A7XFxuJztcblxuICB2YXIgcmVuZGVyO1xuICB0cnkge1xuICAgIHJlbmRlciA9IG5ldyBGdW5jdGlvbihzZXR0aW5ncy52YXJpYWJsZSB8fCAnb2JqJywgJ18nLCBzb3VyY2UpO1xuICB9IGNhdGNoIChlKSB7XG4gICAgZS5zb3VyY2UgPSBzb3VyY2U7XG4gICAgdGhyb3cgZTtcbiAgfVxuXG4gIHZhciB0ZW1wbGF0ZSA9IGZ1bmN0aW9uKGRhdGEpIHtcbiAgICByZXR1cm4gcmVuZGVyLmNhbGwodGhpcywgZGF0YSwgXyk7XG4gIH07XG5cbiAgLy8gUHJvdmlkZSB0aGUgY29tcGlsZWQgc291cmNlIGFzIGEgY29udmVuaWVuY2UgZm9yIHByZWNvbXBpbGF0aW9uLlxuICB2YXIgYXJndW1lbnQgPSBzZXR0aW5ncy52YXJpYWJsZSB8fCAnb2JqJztcbiAgdGVtcGxhdGUuc291cmNlID0gJ2Z1bmN0aW9uKCcgKyBhcmd1bWVudCArICcpe1xcbicgKyBzb3VyY2UgKyAnfSc7XG5cbiAgcmV0dXJuIHRlbXBsYXRlO1xufVxuXG4vLyBBZGQgYSBcImNoYWluXCIgZnVuY3Rpb24uIFN0YXJ0IGNoYWluaW5nIGEgd3JhcHBlZCBVbmRlcnNjb3JlIG9iamVjdC5cbmV4cG9ydCBmdW5jdGlvbiBjaGFpbihvYmopIHtcbiAgdmFyIGluc3RhbmNlID0gXyhvYmopO1xuICBpbnN0YW5jZS5fY2hhaW4gPSB0cnVlO1xuICByZXR1cm4gaW5zdGFuY2U7XG59XG5cbi8vIE9PUFxuLy8gLS0tLS0tLS0tLS0tLS0tXG4vLyBJZiBVbmRlcnNjb3JlIGlzIGNhbGxlZCBhcyBhIGZ1bmN0aW9uLCBpdCByZXR1cm5zIGEgd3JhcHBlZCBvYmplY3QgdGhhdFxuLy8gY2FuIGJlIHVzZWQgT08tc3R5bGUuIFRoaXMgd3JhcHBlciBob2xkcyBhbHRlcmVkIHZlcnNpb25zIG9mIGFsbCB0aGVcbi8vIHVuZGVyc2NvcmUgZnVuY3Rpb25zLiBXcmFwcGVkIG9iamVjdHMgbWF5IGJlIGNoYWluZWQuXG5cbi8vIEhlbHBlciBmdW5jdGlvbiB0byBjb250aW51ZSBjaGFpbmluZyBpbnRlcm1lZGlhdGUgcmVzdWx0cy5cbmZ1bmN0aW9uIGNoYWluUmVzdWx0KGluc3RhbmNlLCBvYmopIHtcbiAgcmV0dXJuIGluc3RhbmNlLl9jaGFpbiA/IF8ob2JqKS5jaGFpbigpIDogb2JqO1xufVxuXG4vLyBBZGQgeW91ciBvd24gY3VzdG9tIGZ1bmN0aW9ucyB0byB0aGUgVW5kZXJzY29yZSBvYmplY3QuXG5leHBvcnQgZnVuY3Rpb24gbWl4aW4ob2JqKSB7XG4gIGVhY2goZnVuY3Rpb25zKG9iaiksIGZ1bmN0aW9uKG5hbWUpIHtcbiAgICB2YXIgZnVuYyA9IF9bbmFtZV0gPSBvYmpbbmFtZV07XG4gICAgXy5wcm90b3R5cGVbbmFtZV0gPSBmdW5jdGlvbigpIHtcbiAgICAgIHZhciBhcmdzID0gW3RoaXMuX3dyYXBwZWRdO1xuICAgICAgcHVzaC5hcHBseShhcmdzLCBhcmd1bWVudHMpO1xuICAgICAgcmV0dXJuIGNoYWluUmVzdWx0KHRoaXMsIGZ1bmMuYXBwbHkoXywgYXJncykpO1xuICAgIH07XG4gIH0pO1xuICByZXR1cm4gXztcbn1cblxuLy8gQWRkIGFsbCBtdXRhdG9yIEFycmF5IGZ1bmN0aW9ucyB0byB0aGUgd3JhcHBlci5cbmVhY2goWydwb3AnLCAncHVzaCcsICdyZXZlcnNlJywgJ3NoaWZ0JywgJ3NvcnQnLCAnc3BsaWNlJywgJ3Vuc2hpZnQnXSwgZnVuY3Rpb24obmFtZSkge1xuICB2YXIgbWV0aG9kID0gQXJyYXlQcm90b1tuYW1lXTtcbiAgXy5wcm90b3R5cGVbbmFtZV0gPSBmdW5jdGlvbigpIHtcbiAgICB2YXIgb2JqID0gdGhpcy5fd3JhcHBlZDtcbiAgICBtZXRob2QuYXBwbHkob2JqLCBhcmd1bWVudHMpO1xuICAgIGlmICgobmFtZSA9PT0gJ3NoaWZ0JyB8fCBuYW1lID09PSAnc3BsaWNlJykgJiYgb2JqLmxlbmd0aCA9PT0gMCkgZGVsZXRlIG9ialswXTtcbiAgICByZXR1cm4gY2hhaW5SZXN1bHQodGhpcywgb2JqKTtcbiAgfTtcbn0pO1xuXG4vLyBBZGQgYWxsIGFjY2Vzc29yIEFycmF5IGZ1bmN0aW9ucyB0byB0aGUgd3JhcHBlci5cbmVhY2goWydjb25jYXQnLCAnam9pbicsICdzbGljZSddLCBmdW5jdGlvbihuYW1lKSB7XG4gIHZhciBtZXRob2QgPSBBcnJheVByb3RvW25hbWVdO1xuICBfLnByb3RvdHlwZVtuYW1lXSA9IGZ1bmN0aW9uKCkge1xuICAgIHJldHVybiBjaGFpblJlc3VsdCh0aGlzLCBtZXRob2QuYXBwbHkodGhpcy5fd3JhcHBlZCwgYXJndW1lbnRzKSk7XG4gIH07XG59KTtcblxuLy8gRXh0cmFjdHMgdGhlIHJlc3VsdCBmcm9tIGEgd3JhcHBlZCBhbmQgY2hhaW5lZCBvYmplY3QuXG5fLnByb3RvdHlwZS52YWx1ZSA9IGZ1bmN0aW9uKCkge1xuICByZXR1cm4gdGhpcy5fd3JhcHBlZDtcbn07XG5cbi8vIFByb3ZpZGUgdW53cmFwcGluZyBwcm94eSBmb3Igc29tZSBtZXRob2RzIHVzZWQgaW4gZW5naW5lIG9wZXJhdGlvbnNcbi8vIHN1Y2ggYXMgYXJpdGhtZXRpYyBhbmQgSlNPTiBzdHJpbmdpZmljYXRpb24uXG5fLnByb3RvdHlwZS52YWx1ZU9mID0gXy5wcm90b3R5cGUudG9KU09OID0gXy5wcm90b3R5cGUudmFsdWU7XG5cbl8ucHJvdG90eXBlLnRvU3RyaW5nID0gZnVuY3Rpb24oKSB7XG4gIHJldHVybiBTdHJpbmcodGhpcy5fd3JhcHBlZCk7XG59O1xuIiwiXG4vKipcbiAqIE1vZHVsZSBleHBvcnRzLlxuICovXG5cbm1vZHVsZS5leHBvcnRzID0gZGVwcmVjYXRlO1xuXG4vKipcbiAqIE1hcmsgdGhhdCBhIG1ldGhvZCBzaG91bGQgbm90IGJlIHVzZWQuXG4gKiBSZXR1cm5zIGEgbW9kaWZpZWQgZnVuY3Rpb24gd2hpY2ggd2FybnMgb25jZSBieSBkZWZhdWx0LlxuICpcbiAqIElmIGBsb2NhbFN0b3JhZ2Uubm9EZXByZWNhdGlvbiA9IHRydWVgIGlzIHNldCwgdGhlbiBpdCBpcyBhIG5vLW9wLlxuICpcbiAqIElmIGBsb2NhbFN0b3JhZ2UudGhyb3dEZXByZWNhdGlvbiA9IHRydWVgIGlzIHNldCwgdGhlbiBkZXByZWNhdGVkIGZ1bmN0aW9uc1xuICogd2lsbCB0aHJvdyBhbiBFcnJvciB3aGVuIGludm9rZWQuXG4gKlxuICogSWYgYGxvY2FsU3RvcmFnZS50cmFjZURlcHJlY2F0aW9uID0gdHJ1ZWAgaXMgc2V0LCB0aGVuIGRlcHJlY2F0ZWQgZnVuY3Rpb25zXG4gKiB3aWxsIGludm9rZSBgY29uc29sZS50cmFjZSgpYCBpbnN0ZWFkIG9mIGBjb25zb2xlLmVycm9yKClgLlxuICpcbiAqIEBwYXJhbSB7RnVuY3Rpb259IGZuIC0gdGhlIGZ1bmN0aW9uIHRvIGRlcHJlY2F0ZVxuICogQHBhcmFtIHtTdHJpbmd9IG1zZyAtIHRoZSBzdHJpbmcgdG8gcHJpbnQgdG8gdGhlIGNvbnNvbGUgd2hlbiBgZm5gIGlzIGludm9rZWRcbiAqIEByZXR1cm5zIHtGdW5jdGlvbn0gYSBuZXcgXCJkZXByZWNhdGVkXCIgdmVyc2lvbiBvZiBgZm5gXG4gKiBAYXBpIHB1YmxpY1xuICovXG5cbmZ1bmN0aW9uIGRlcHJlY2F0ZSAoZm4sIG1zZykge1xuICBpZiAoY29uZmlnKCdub0RlcHJlY2F0aW9uJykpIHtcbiAgICByZXR1cm4gZm47XG4gIH1cblxuICB2YXIgd2FybmVkID0gZmFsc2U7XG4gIGZ1bmN0aW9uIGRlcHJlY2F0ZWQoKSB7XG4gICAgaWYgKCF3YXJuZWQpIHtcbiAgICAgIGlmIChjb25maWcoJ3Rocm93RGVwcmVjYXRpb24nKSkge1xuICAgICAgICB0aHJvdyBuZXcgRXJyb3IobXNnKTtcbiAgICAgIH0gZWxzZSBpZiAoY29uZmlnKCd0cmFjZURlcHJlY2F0aW9uJykpIHtcbiAgICAgICAgY29uc29sZS50cmFjZShtc2cpO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgY29uc29sZS53YXJuKG1zZyk7XG4gICAgICB9XG4gICAgICB3YXJuZWQgPSB0cnVlO1xuICAgIH1cbiAgICByZXR1cm4gZm4uYXBwbHkodGhpcywgYXJndW1lbnRzKTtcbiAgfVxuXG4gIHJldHVybiBkZXByZWNhdGVkO1xufVxuXG4vKipcbiAqIENoZWNrcyBgbG9jYWxTdG9yYWdlYCBmb3IgYm9vbGVhbiB2YWx1ZXMgZm9yIHRoZSBnaXZlbiBgbmFtZWAuXG4gKlxuICogQHBhcmFtIHtTdHJpbmd9IG5hbWVcbiAqIEByZXR1cm5zIHtCb29sZWFufVxuICogQGFwaSBwcml2YXRlXG4gKi9cblxuZnVuY3Rpb24gY29uZmlnIChuYW1lKSB7XG4gIC8vIGFjY2Vzc2luZyBnbG9iYWwubG9jYWxTdG9yYWdlIGNhbiB0cmlnZ2VyIGEgRE9NRXhjZXB0aW9uIGluIHNhbmRib3hlZCBpZnJhbWVzXG4gIHRyeSB7XG4gICAgaWYgKCFnbG9iYWwubG9jYWxTdG9yYWdlKSByZXR1cm4gZmFsc2U7XG4gIH0gY2F0Y2ggKF8pIHtcbiAgICByZXR1cm4gZmFsc2U7XG4gIH1cbiAgdmFyIHZhbCA9IGdsb2JhbC5sb2NhbFN0b3JhZ2VbbmFtZV07XG4gIGlmIChudWxsID09IHZhbCkgcmV0dXJuIGZhbHNlO1xuICByZXR1cm4gU3RyaW5nKHZhbCkudG9Mb3dlckNhc2UoKSA9PT0gJ3RydWUnO1xufVxuIiwidmFyIGc7XG5cbi8vIFRoaXMgd29ya3MgaW4gbm9uLXN0cmljdCBtb2RlXG5nID0gKGZ1bmN0aW9uKCkge1xuXHRyZXR1cm4gdGhpcztcbn0pKCk7XG5cbnRyeSB7XG5cdC8vIFRoaXMgd29ya3MgaWYgZXZhbCBpcyBhbGxvd2VkIChzZWUgQ1NQKVxuXHRnID0gZyB8fCBuZXcgRnVuY3Rpb24oXCJyZXR1cm4gdGhpc1wiKSgpO1xufSBjYXRjaCAoZSkge1xuXHQvLyBUaGlzIHdvcmtzIGlmIHRoZSB3aW5kb3cgcmVmZXJlbmNlIGlzIGF2YWlsYWJsZVxuXHRpZiAodHlwZW9mIHdpbmRvdyA9PT0gXCJvYmplY3RcIikgZyA9IHdpbmRvdztcbn1cblxuLy8gZyBjYW4gc3RpbGwgYmUgdW5kZWZpbmVkLCBidXQgbm90aGluZyB0byBkbyBhYm91dCBpdC4uLlxuLy8gV2UgcmV0dXJuIHVuZGVmaW5lZCwgaW5zdGVhZCBvZiBub3RoaW5nIGhlcmUsIHNvIGl0J3Ncbi8vIGVhc2llciB0byBoYW5kbGUgdGhpcyBjYXNlLiBpZighZ2xvYmFsKSB7IC4uLn1cblxubW9kdWxlLmV4cG9ydHMgPSBnO1xuIl0sInNvdXJjZVJvb3QiOiIifQ==