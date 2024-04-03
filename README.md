# golden-retriever

Resolver that finds properties from [deeply] nested objects/arrays, including self referencing ones, given a path or pattern. It also collects properties from multiple branches, without throwing Type Errors.

## Install

    npm install @supernpm2024/molestiae-vitae-labore-voluptatibus --save

## Example

```js
import resolve from '@supernpm2024/molestiae-vitae-labore-voluptatibus';

resolve('regions.east.manager.name', someObj);
```
which can change this:
```js
    if ( company && company.regions && company.regions.east && company.regions.east.manager) {...}
```
to
```js
    if ( resolve('regions.east.manager', company)) {...}
```
<br />

## Usage
```js
    given: const company = {...}
```
### Retrieve a single property:

    resolve('regions.east', company)

### Retrieve a deeply nested property

    resolve('regions.east.manager.name', company)
    or
    resolve('regions.east.manager["name"]', company)

bracket notation for property names is permitted as per JS syntax
<br /><br />

### Retrieve a property on any first level nested object properties

    resolve('regions.*.manager.name', company)
    or
    resolve('regions[].manager.name', company)
    or
    resolve('regions[*].manager.name', company)

this will return an array of any 'manager.name' it finds in the first level of depth or 'manager.name' from any objects it finds in an array (if 'regions' is an array)
<br /><br />

### Retrieve a property on any level of nested objects

    resolve('regions.**.manager.name', company)

this will return any 'manager.name' it finds at any depth including looking thru objects in arrays
<br /><br />

### Retrieve the first element in an array

    resolve('regions.east.orders[0]', company)
    or
    resolve('regions.east.orders[first]', company)

Note that the word 'first' is NOT quoted. Quoting it would change the syntax to mean an indexed property.
<br /><br />

### Retrieve the last element in an array

    resolve('regions.east.orders[last]', company)

Note that the word 'last' is NOT quoted. Quoting it would change the syntax to mean an indexed property.
<br /><br />

### Retrieve a path with an optional property

    resolve('regions.*.?divisions[].name', company)

This will retrieve the 'name' property from any 'regions' as well as any 'regions's 'divisions'.
<br /><br />

## Return Values

'resolve()' will return a property's value if found, "undefined" if nothing was found or the path doesn't exist. And, it will return an array of values if properties where found on multiple branches, like when using wildcards. If the property you look for is an array, and it's found multiple times, 'resolve()' will return an array of arrays.

<br />

## Notes

### Self referencing graphs

Any graph (nested object structure with self references) will not be a problem. Golden-Retriever uses a Set to track all objects visited and will not revisit an object during an invocation.

This does have a unique feature though. When calling:

    resolve('**.orders[].customer', company)

it will return all the 'customer' property values regardless if many are the same exact object, because it's returning a property's value and not looking at the property. This can be compensated for by using the following syntax:

    resolve('**.orders[].customer.*', company)

this will cause the resolver to look at the 'customer' value and thus only look at unique 'customer' objects. Aside from the later being de-duped, they both return the same results.

### Living dangerously

You can attach 'resolve()' to the Object prototype for convenience as such:
```js
    Object.prototype.resolve = resolve
```
this will change it's use to:

    company.resolve('regions.east.manager.name')

Always use caution when extending built-in objects.

