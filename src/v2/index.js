var reduce = require('lodash.reduce');
var isPlainObject = require('lodash.isPlainObject');
var virtualFieldRegex = /^__.*/;

var DEBUG = false;
function log (message) {
    if (DEBUG) {
        console.log(message);
    }
}

function validate (source, schema, fieldPrefix) {
    var _fieldPrefix = fieldPrefix !== undefined ? (fieldPrefix + '.') : '';
    log('Prefix: ' + _fieldPrefix);

    if (isArrayOfScalars(source)) {
        log('Validating array of scalars');
        return validateArrayOfScalars(source, schema, _fieldPrefix);
    }

    if (isArrayOfObjects(source)) {
        log('Validating array of objects');
        return validateArrayOfObjects(source, schema, _fieldPrefix);
    }

    if (isPlainObject(source)) {
        log('Validating object');
        return validateObject(source, schema, _fieldPrefix)
    }
}

/**
 * Validate a list of scalar values; string, number, boolean.
 * Iteration must be done on the source.
 */
function validateArrayOfScalars (source, schema, fieldPrefix) {
    return reduce(source, function (errors, valueToValidate, index) {
        var pipelineErrors = processPipeline(schema, valueToValidate, source, index, fieldPrefix);

        log('Scalar result: ' + pipelineErrors)

        return errors.concat(pipelineErrors);
    }, []);
}

/**
 * Validate a list of objects.
 * Iteration must be on the source.
 */
function validateArrayOfObjects (source, schema, fieldPrefix) {
    var _fieldPrefix = fieldPrefix !== undefined ? (fieldPrefix) : '';

    return reduce(source, function (errors, item, index) {
        var itemErrors = validate(item, schema, _fieldPrefix + index);
        return errors.concat(itemErrors);
    }, []);
}

/**
 * Validate a plain object.
 * Iteration is done on the schema, which is considered the master.
 */
function validateObject (source, schema, fieldPrefix) {
    return reduce(schema, function (errors, validator, fieldName) {

        var isVirtualField = virtualFieldRegex.test(fieldName);
        var valueToValidate = isVirtualField ? source : source[fieldName];

        var pipelineErrors = processPipeline(validator, valueToValidate, source, fieldName, fieldPrefix);

        return errors.concat(pipelineErrors);
    }, []);
}

function processPipeline (validators, valueToValidate, source, fieldName, fieldPrefix) {
    var breakEarly = false;
    var errors = [];
    var _validators = [].concat(validators);

    _validators.forEach(function (validator, index) {
        if (breakEarly) {
            return;
        }

        var result = validator(valueToValidate, source);

        switch (true) {
            case isSchema(result):
                log('Nested schema: ' + index)

                var childErrors = validate(valueToValidate, result, fieldName);
                errors = errors.concat(childErrors);

                breakEarly = true;
                break;

            case typeof result === 'string':
                log('Error message: ' + index)

                errors = [{
                    field: fieldPrefix + fieldName,
                    value: valueToValidate,
                    message: result
                }];
                breakEarly = true;
                break;

            case result === true:
                log('Break early: ' + index)

                breakEarly = true;
                break;
        }
    });

    return errors;
}

function isArrayOfObjects (source) {
    if (!Array.isArray(source)) {
        return false;
    }

    return isPlainObject(source[0]);
}

function isArrayOfScalars (source) {
    if (!Array.isArray(source)) {
        return false;
    }

    var firstItem = source[0];

    return (
        typeof firstItem === 'number' ||
        typeof firstItem === 'string' ||
        typeof firstItem === 'boolean'
    );
}

function isSchema (value) {
    if (typeof value === 'function') {
        return true;
    }
    if (isPlainObject(value)) {
        return Object.keys(value)
            .reduce(function (acc, fieldName) {
                return acc && typeof value[fieldName] === 'function';
            }, true);
    }
}

module.exports = validate;