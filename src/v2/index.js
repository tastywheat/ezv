var reduce = require('lodash.reduce');


function validate (source, schema, fieldPrefix) {
    var _fieldPrefix = fieldPrefix !== undefined ? (fieldPrefix + '.') : '';


    if (typeof schema === 'function') {
        return processScalar(source, schema);
    }

    if (Array.isArray(source)) {
        return processNested(source, schema);
    }

    return processTop(source, schema, _fieldPrefix)
}

function processScalar (source, schema) {
    return reduce(source, function (errors, item, index) {

        var result = schema(item, source);

        if (typeof result === 'string') {
            return errors.concat({
                field: index,
                value: item,
                message: result
            });
        }

        return errors;
    }, []);
}

function processNested (source, schema) {
    return reduce(source, function (errors, item, index) {
        var itemErrors = validate(item, schema, index);
        return errors.concat(itemErrors);
    }, []);
}

function processTop (source, schema, fieldPrefix) {
    return reduce(schema, function (errors, validator, fieldName) {

        var valueToValidate = source[fieldName];

        var result = validator(valueToValidate, source);

        // process nested validation
        if (isSchema(result)) {
            var childErrors = validate(valueToValidate, result);
            return childErrors.map(function (error) {
                return Object.assign({}, error, {
                    field: fieldName + '.' + error.field
                });
            })
            .concat(errors);
        }

        // TODO: deprecate
        // result is an array when doing nested validation
        if (Array.isArray(result)) {

            // prefix child error field with the parent's field name
            return result.map(function (error) {
                return Object.assign({}, error, {
                    field: fieldName + '.' + error.field
                });
            })
            .concat(errors);
        }

        if (typeof result === 'string') {
            return errors.concat({
                field: fieldPrefix + fieldName,
                value: valueToValidate,
                message: result
            });
        }

        return errors;

    }, []);
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