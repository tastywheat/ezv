`ezv` is a minimal, but highly composable validation library.


# Installation

`npm install ezv`



### Basic Usage

```

var input = {
    name: 123
};

var validators = {
    name: [
        {
            validate: function (value, sourceObject) {
                return typeof value === 'string';
            },
            message: function (value, fieldName) {
                return 'Name must be a string';
            }
        }
    ]
};

var errors = ezv(input, validators);

errors === [
  {
    field: 'name',
    message: 'Name must be a string',
    value: '123'
  }
]
```


`ezv(sourceObject, validatorMapping)`

- `sourceObject` the object you want to validate

- `validatorMapping` each property should match an associated field on the `sourceObject`, and provide an array value of `[validator options]`


### Validator options

`validate (value, sourceObject)`
- `value` is the value being validated
- `sourceObject` is the object which was provided as ezv's first parameter


`message (value, fieldName)`
- can be a `string` or `function`
- `value` is the value being validated
- `fieldName` is the property name of the value

`breakOnFail`
- `boolean` which defaults to `false`
- when `true` the validation pipeline will stop `validate` failure

`breakOnSuccess`
- `boolean` which defaults to `false`
- when `true` the validation pipeline will stop on `validate` success


### Example validators:

#### Is string
```
var data = {
  name: 123
};

var validators = {
  name: [
    {
      validate (value) {
        return _.isString(value)          // Return a bool checking that 'value' is a string
      },
      message: 'must be string'
    }
  ]
}
```

#### Access source object
```
var data = {
  name: 123,
  foobar: 9999
};

var validators = {
  name: [
    {
      validate (value, source) {             // Second argument is 'data'
        return value < source.foobar;
      },
      message: 'must be less than foobar'
    }
  ]
}
```


#### Custom message
```
var data = {
  name: 123
};

var validators = {
  name: [
    {
      validate (value) {
        return _.isString(value)
      },
      message (value) {                        // Use a function instead of a string
        return `${value} must be a string`;
      }
    }
  ]
}
```

#### Nested properties
```
var data = {
  name: 123,
  address: {
    postalCode: 123
  }
};

var validators = {
  address: {
    postalCode: [                                // Nest a set of validators under the parent
      {
        validate (value) {
          return _.isString(value)
        },
        message (value, fieldName) {
          return `${fieldName} must be a string, found: ${value}`;    // The field property will be 'address.postalCode'
        }
      }
    ]
  }
}

errors === [{
  message: 'postalCode must be a string',
  field: 'address.postalCode',
  value: 123
}]
```



### Creating Helpers

#### isString

```
function isString (min, max) {
    return {
        validate (value, source) {

            if (!_.isString(value)) {
                return false;
            }

            if (min && max) {
                return min <= value.length && value.length <= max;
            }

            if (min) {
                return min <= value.length;
            }

            return true;
        },
        message (value) {

            if (!_.isString(value)) {
                return 'Must be a string';
            }

            if (min && max) {
                return `Must be between ${min} and ${max} characters`;
            }

            if (min) {
                return `Must be at least ${min} characters`;
            }

            return 'Must be a string';
        }
    };
}

validators = {
    name: [
        isString(),       // value is of string type
        isString(1),      // value is string, and min length is 1
        isString(1, 5)    // value is string, and between 1-5 (inclusive) length.
    ]
}
```

#### isOptional

```

function isOptional () {
    return {
        validate (value) {
            return value === undefined;  // Return true when value is not found
        },
        breakOnSuccess: true           // Break out of the pipeline because any subsequent validators are irrelevant.
                                 // If 'value' exists, no error will be returned for THIS validator.
    }

}

validators = {
    name: [
        isOptional(),    // If value is undefined, break out of pipeline, do not return errors.
        isString(2)      // When value is something, ensure it is a string of at least 2 characters.
    ]
}
```

#### Is required
```

function isRequired () {
    return {
        validate (value) {
            return value !== undefined;  // Return true when value is not found
        },
        breakOnFail: true           // Break out of the pipeline because any subsequent validators are irrelevant.
                                 // If 'value' exists, no error will be returned for THIS validator.
    }
}

validators = {
    name: [
        isRequired(),    // If value is undefined, break out of pipeline, do not return errors.
        isString(2)      // When value is something, ensure it is a string of at least 2 characters.
    ]
}

```


#### Override a message from a helper

```
validators = {
    name: [
        {
            ...(isString(2,10)),                              // Shallow copy the helper object,
            message: 'Name field must be a string'        // then overwrite the message property.
        }
    ]
}
```