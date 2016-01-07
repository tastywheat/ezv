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
            validate: function (value) {
                return typeof value === 'string';
            },
            message: 'Name must be a string'
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
- when `true` the validation pipeline will stop after the first encountered failure

`breakOnSuccess`
- `boolean` which defaults to `false`
- when `true` the validation pipeline will stop after the first encountered success


### Examples:

#### Is string
```
const data = {
  name: 123
};

const validators = {
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
const data = {
  name: 123,
  foobar: 9999
};

const validators = {
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
const data = {
  name: 123
};

const validators = {
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
const data = {
  name: 123,
  address: {
    postalCode: 123
  }
};

const validators = {
  address: {
    postalCode: [                                // Nest a set of validators under the parent
      {
        validate (value) {
          return _.isString(value)
        },
        message (value) {
          return `${value} must be a string`;    // The field property will be 'address.postalCode'
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

#### Is required
```
const data = {
  name: 123,
};

const validators = {
  name: [
    {
      validate (value) {
          return value !== undefined;   // Check for value existence
      },
      message: 'Field is required',
      breakOnFail: true                    // Break out of the pipeline because any subsequent validators are irrelevant
    }
  ]
}
```


#### Is optional
```
const data = {

};

const validators = {
  name: [
    {
      validate (value) {
        return value === undefined;  // Return true when value is not found
      },
      breakOnSuccess: true           // Break out of the pipeline because any subsequent validators are irrelevant.
                                     // If 'value' exists, no error will be returned for THIS validator.
    }
  ]
}
```

### Helpers

#### isString

```
validators = {
    name: [
        isString(),       // value is of string type
        isString(1),      // value is string, and min length is 1
        isString(1, 5)    // value is string, and between 1-5 (inclusive) length.
    ]
}
```

#### isNumber

```
validators = {
    name: [
        isNumber(),       // value is of number type
        isNumber(1),      // value is number, and min value is 1
        isNumber(1, 5)    // value is number, and between 1-5 (inclusive) value.
    ]
}
```

#### isArray

```
validators = {
    name: [
        isArray(),       // value is of array type
        isArray(1),      // value is array, and min element length is 1
        isArray(1, 5)    // value is array, and between 1-5 (inclusive) element length.
    ]
}
```

#### isOptional

```
validators = {
    name: [
        isOptional(),    // If value is undefined, break out of pipeline, do not return errors.
        isString(2)      // When value is something, ensure it is a string of at least 2 characters.
    ]
}
```

### Tips

#### Use custom message instead of helper message

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