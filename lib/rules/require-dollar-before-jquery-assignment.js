/**
 * Require a $ before variable names that are jquery assignments.
 *
 * Types: `Boolean` or `String`
 *
 * Values: `true` or `"ignoreProperties"`
 *
 * #### Example
 *
 * ```js
 * "requireDollarBeforejQueryAssignment": true
 * ```
 *
 * ##### Valid example for mode `true`
 *
 * ```js
 * var $x = $(".foo");
 * var y = {
 *   $x: $(".bar")
 * };
 * ```
 *
 * ##### Invalid example for mode `true`
 *
 * ```js
 * var x = $(".foo");
 * var y = {
 *   x: $(".bar")
 * };
 * ```
 *
 * ##### Valid example for mode `ignoreProperties`
 *
 * ```js
 * var $x = $(".foo");
 * var y = {
 *   x: $(".bar")
 * };
 * ```
 *
 * ##### Invalid example for mode `ignoreProperties`
 *
 * ```js
 * var x = $(".foo");
 * ```
 */

var assert = require('assert');

module.exports = function() {};

module.exports.prototype = {

    _ignoreProperties: false,

    configure: function(options) {
        assert(
            options === true || options === 'ignoreProperties',
            this.getOptionName() + ' option requires true or "ignoreProperties" value, or should be removed'
        );

        this._ignoreProperties = (options === 'ignoreProperties');
    },

    getOptionName: function() {
        return 'requireDollarBeforejQueryAssignment';
    },

    check: function(file, errors) {
        var ignoreProperties = this._ignoreProperties;

        file.iterateNodesByType(['VariableDeclarator', 'AssignmentExpression', 'ObjectExpression'], function(token) {
            var type = token.type;
            var left;
            var varName;
            var right;

            if (type === 'VariableDeclarator') {
                left = token.id;
                varName = left.name;
                right = token.init;

            } else if (ignoreProperties) {
                return;

            } else if (type === 'AssignmentExpression') {
                left = token.left;
                if (left.computed) {
                    return;
                }

                varName = left.name || left.property.name;
                right = token.right;

            } else {// type === 'ObjectExpression'
                var props = token.properties[0];

                if (!props) {
                    return;
                }

                left = props.key;

                if (!left.name) {
                    return;
                }

                varName = left.name;
                right = props.value;
            }

            if (varName.indexOf('$') === 0 || varName.indexOf('_$') === 0) {
                return;
            }

            if (!right || right.type !== 'CallExpression') {
                return;
            }

            var nextToken = file.getTokenByRangeStart(right.callee.range[0]);
            if (nextToken.value !== '$') {
                return;
            }

            nextToken = file.getNextToken(nextToken);
            if (nextToken.value !== '(') {
                return;
            }

            while (!(nextToken.type === 'Punctuator' && nextToken.value === ')')) {
                nextToken = file.getNextToken(nextToken);
            }

            nextToken = file.getNextToken(nextToken);

            if (!nextToken || !(nextToken.type === 'Punctuator' && nextToken.value === '.')) {
                errors.add(
                    'jQuery identifiers must start with a $',
                    left.loc.start.line,
                    left.loc.start.column
                );
            }
        });
    }
};
