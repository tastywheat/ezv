var isPlainObject = require('lodash.isplainobject');
var reduce = require('lodash.reduce');


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

            // Optional fields will use a breakOnSuccess
            if (result === true && validator.breakOnSuccess === true) {
                _break = true;
                return fieldErrors;
            }


            if (result === false) {

                _break = validator.breakOnFail;

                // Message is not provided, ignore any errors
                // Some validators do not have messages: breakOnSuccess, nested validators
                if (!validator.message) {
                    return fieldErrors;
                }

                return fieldErrors.concat({
                    field: _path.concat(fieldName).join('.'),
                    value: valueToValidate,
                    message: (typeof validator.message === 'string') ?
                        validator.message :
                        validator.message(valueToValidate, fieldName)
                });
            }

            return fieldErrors;

        }, errors);

    }, []);
}

module.exports = validate;