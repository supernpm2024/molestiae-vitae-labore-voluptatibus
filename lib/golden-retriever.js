
export function pathParts(path) {
    let tmpMatch;
    let pathArray = [];
    const RE = /([^\.\[]+)|(\[[^\]]*?\])/g;
    while ((tmpMatch = RE.exec(path)) !== null) {
        let tmpStr = tmpMatch[1] || tmpMatch[2];
        tmpStr = tmpStr.replace(/\[["']|["']\]/g, ''); // strip brackets with quotes
        pathArray.push(tmpStr);
    }

    return pathArray;
}


/**
 * @param {String} path
 * @param {Object} obj
 * @returns {* | [*]}
 */

export function resolve(path, obj = this) {

    const memory = new Set();
    const fifo = [];
    let results = [];

    fifo.push({ cObj: obj, path: pathParts(path) });  // seed the stack

    while (fifo.length) {

        let { cObj, path } = fifo.shift();

        if (!memory.has(cObj)) {

            memory.add(cObj);  // remember which objects we've seen, so we don't get in a loop

            if (cObj && typeof cObj === 'object') {

                switch (path[0]) {
                    case '*':   // match any property of this object
                    case '[]':  // match any object element in this array
                    case '[*]':

                        if (path.length === 1) {
                            // last part of the path, we're done return this object
                            results.push(cObj);
                        } else {
                            // add all object properties to the stack with the path shifted
                            for (let key in cObj) {
                                if (cObj[key] && typeof cObj[key] === 'object') {
                                    fifo.push({ cObj: cObj[key], path: path.slice(1) });
                                }
                            }
                        }
                        break;

                    case '[0]':
                    case '[first]': // get the first element of an array
                        if (path.length === 1) {
                            // last part of the path, we found a match and we're done
                            results.push(cObj[0]);
                        } else if (cObj[0] && typeof cObj[0] === 'object') {
                            // there are more parts to the path so push this object property onto the stack with the path shifted
                            fifo.push({ cObj: cObj[0], path: path.slice(1) });
                        }
                        break;

                    case '[last]':
                        if (path.length === 1) {
                            // last part of the path, we found a match and we're done
                            results.push(cObj[cObj.length - 1]);
                        } else if (cObj[cObj.length - 1] && typeof cObj[cObj.length - 1] === 'object') {
                            // there are more parts to the path so push this object property onto the stack with the path shifted
                            fifo.push({ cObj: cObj[cObj.length - 1], path: path.slice(1) });
                        }
                        break;

                    case '**':  // match any property and any object property of this object, i.e.: search the entire graph for the path

                        if (path.length > 1) {
                            // add this object back into the stack but shift the path
                            fifo.push({ cObj: cObj, path: path.slice(1) });
                            memory.delete(cObj); // we need to forget we saw this object to reprocess it

                            // add in any object properties into the stack with the unshifted path
                            for (let key in cObj) {
                                if (cObj[key] && typeof cObj[key] === 'object') {
                                    fifo.push({ cObj: cObj[key], path: path });
                                }
                            }
                        } else {
                            // last part of the path, just return the object
                            results.push(cObj);
                        }
                        break;

                    default:
                        if (path[0].startsWith('?')) {
                            // this is an optional path element, if it's the last element ignore it
                            if (path.length > 1) {
                                // add this object back into the stack without the optional path element
                                // if the next path element is a wildcard, remove it as well
                                let idx = ['*', '[]', '[*]'].includes(path[1]) ? 2 : 1;
                                fifo.push({ cObj: cObj, path: path.slice(idx) });
                                // forget we saw this object so we can reprocess
                                memory.delete(cObj); // we need to forget we saw this object to reprocess it
                            }
                            // remove the '?' from path[0] so we can process it below with the optional element
                            path[0] = path[0].substring(1);
                        }

                        // look for path[0] as a property
                        let keys = Object.keys(cObj);
                        if (keys.includes(path[0])) {
                            if (path.length === 1) {
                                // last part of the path, we found a match and we're done
                                results.push(cObj[path[0]]);
                            } else if (cObj[path[0]] && typeof cObj[path[0]] === 'object') {
                                // there are more parts to the path so push this object property onto the stack with the path shifted
                                fifo.push({ cObj: cObj[path[0]], path: path.slice(1) });
                            }
                        }
                }
            }
        }
    }

    if (results.length < 2) {
        results = results[0];
    }
    return results;
}
