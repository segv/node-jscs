/**
 * Requires semicolon after:
 *
 * * var declaration
 * * expression statement
 * * return
 * * throw
 * * break
 * * continue
 * * do-while
 *
 * Type: `Boolean`
 *
 * Value: `true`
 *
 * #### Example
 *
 * ```js
 * "requireSemicolons": true
 * ```
 *
 * ##### Valid
 *
 * ```js
 * var a = 1;
 * ```
 *
 * ##### Invalid
 *
 * ```js
 * var a = 1
 * ```
*/

var assert = require('assert');

module.exports = function() {};

module.exports.prototype = {

    configure: function(options) {
        assert(
            options === true,
            this.getOptionName() + ' option requires a true value or should be removed'
        );
    },

    getOptionName: function() {
        return 'requireSemicolons';
    },

    check: function(file, errors) {
        file.iterateNodesByType([
            'VariableDeclaration',
            'ImportDeclaration',
            'ExportDeclaration',
            'ExpressionStatement',
            'DoWhileStatement',
            'ReturnStatement',
            'ThrowStatement',
            'BreakStatement',
            'ContinueStatement',
            'DebuggerStatement'
        ], function(node) {
            // ignore variable declaration inside for and for-in
            if (node.type === 'VariableDeclaration') {
                if ((node.parentNode.type === 'ForInStatement' && node.parentNode.left === node) ||
                    (node.parentNode.type === 'ForOfStatement' && node.parentNode.left === node) ||
                    (node.parentNode.type === 'ForStatement' && node.parentNode.init === node)) {
                    return;
                }
            }

            // get last token inside node
            var lastToken = file.getLastNodeToken(node);
            var checkToken = lastToken;

            // if last token is not a semicolon punctuator, try to get next token in file
            if (checkToken && (checkToken.type !== 'Punctuator' || checkToken.value !== ';')) {
                checkToken = file.getNextToken(checkToken);
            }

            // check token is semicolon
            if (!checkToken || checkToken.type !== 'Punctuator' || checkToken.value !== ';') {
                errors.add(
                    'Missing semicolon after statement',
                    (lastToken || node).loc.end
                );
            }
        });
    }
};
