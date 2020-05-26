'use strict';

const _ = require('underscore');
const underscoreString = require('underscore.string');

module.exports = (function() {
    _.mixin(underscoreString.exports());

    console.log(_.camelcase('foo-bar'));
}());
