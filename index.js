var isPlainObject = require('lodash.isplainobject');
var reduce = require('lodash.reduce');
var ezv2 = require('./src/v2');

function validate (source, validatorMapping, path) {
    var _path = path || [];

    if (!isPlainObject(source)) { throw new Error('@source must be a plain object') }
    if (!isPlainObject(validatorMapping)) { throw new Error('@validatorMapping must be a plain object') }

    return reduce(validatorMapping, function (errors, validators, fieldName) {

        if (!validators) { return errors; }

        var valueToValidate = source[fieldName];

        // Validators have nested childre, run validate on them
        if (isPlainObject(validators)) {
            return errors.concat(
                validate(valueToValidate, validators, _path.concat(fieldName))
            );
        }


        var _break = false;

        return reduce(validators, function (fieldErrors, validator) {

            if (typeof validator.validate !== 'function') { throw new Error('validator.validate must be a function') }

            if (_break) {
                return fieldErrors;
            }

            var result = validator.validate(valueToValidate, source);

            var isFailure = (result === false || typeof result === 'string');

            function getMessage () {

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

            // Optional fields will use a breakOnSuccess
            if (result === true && validator.breakOnSuccess === true) {
                _break = true;
                return fieldErrors;
            }

            var message = getMessage();


            if (isFailure) {

                _break = validator.breakOnFail;

                // Message is not provided, ignore any errors
                // Some validators do not have messages: breakOnSuccess, nested validators
                if (!message) {
                    return fieldErrors;
                }

                return fieldErrors.concat({
                    field: _path.concat(fieldName).join('.'),
                    value: valueToValidate,
                    message: message
                });
            }

            return fieldErrors;

        }, errors);

    }, []);
}

validate.v2 = ezv2;

module.exports = validate;
