var isPlainObject = require('lodash.isplainobject');
var reduce = require('lodash.reduce');


function validate (source, validatorMapping) {

    // process each field
    return reduce(validatorMapping, function (errors, validators, fieldName) {

        if (!validators) { return errors; }

        var valueToValidate = source[fieldName];

        var _break = false;

        // run field validators against field value
        return reduce(validators, function (fieldErrors, validator) {

            if (typeof validator.validate !== 'function') { throw new Error('validator.validate must be a function') }

            if (_break) { return fieldErrors; }

            var result = validator.validate(valueToValidate, source);

            var isFailure = (
                result === false ||
                typeof result === 'string' ||
                Array.isArray(result)
            );

            var isSuccess = !isFailure;

            function getMessage () {

                if (Array.isArray(result)) {
                    return result;
                }

                if (typeof result === 'string') {
                    return result;
                }

                // Allow override of error message result
                if (validator.message) {
                    return (typeof validator.message === 'string') ?
                        validator.message :
                        validator.message(valueToValidate, fieldName);

                }
            }


            if (validator.breakOnSuccess) {

                if (isSuccess) {
                    _break = true;
                }

                // Errors are never added when breaking on success
                return fieldErrors;
            }


            if (isFailure) {

                var message = getMessage();

                _break = validator.breakOnFail;

                if (Array.isArray(message)) {
                    return fieldErrors.concat(message);
                } else {
                    return fieldErrors.concat({
                        field: fieldName,
                        value: valueToValidate,
                        message: message
                    });
                }

            }

            return fieldErrors;

        }, errors);

    }, []);
}


function validate2 (source, validatorMapping) {

}

/*




var data = {
    fruit: {  // validate this is object
        apples: [1,2,3,4],
        bannanas: ["1", "2", "3"]
    },
    friends: [
        { name: 'wheat' },
        { name: 'tasty' },
        123
    ]
}

var personValidator = {
    name: [
        isString()
    ]
}

var fruitValidator = {
    apples: [
        isArray()
    ],
    banannas: [
        isArray()
    ]
}


var validators = {
    foobar: [
        function (value) {
            this.breakOnFail = true;
            this.message = '';

            return 'foo' === foo // bool
            return ezv(value, otherschema) // array
        }
    ]
    fruit: [
        isObject(),
        function (value) {
            return ezv(value, fruitValidator);
        }
    ],
    friends: [
        isArray(),
        function (value) {
            return _.map(friend => ezv(friend, personSchmea))
        }
    ]
}

field: 'friends.3'
message: 'must be a person'
*/
module.exports = validate;