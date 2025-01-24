export function filterObjectBy(obj, filterFunction = ([, value]) => value !== undefined && value !== null) {
    return Object.fromEntries(Object.entries(obj).filter(filterFunction));
}

export function pick(input, ...pick) {
    return Object.fromEntries(pick.filter((key) => key in input).map((key) => [key, input[key]]));
}

export function omit(input, ...omit) {
    return Object.fromEntries(Object.entries(input).filter(([key]) => !omit.includes(key)));
}

export function isChanged(left, right, keys) {
    let isChanged = keys.reduce((a, k) => {
        a |= left[k] != right[k];
        return a;
    }, false);
    return isChanged;
}

export function isEqual(left, right) {
    if (left === right) {
        return true;
    }

    return _isEqual(left, right, 0);
}

export function isEmpty(value) {
    return value === undefined || value === null || (typeof value === 'object' && Object.keys(value).length === 0) || (typeof value === 'string' && value.trim().length === 0);
}

function _isEqual(left, right, level = 0) {
    if (left == null || right == null || typeof left !== 'object' || typeof right !== 'object') {
        return false;
    }

    const keysLeft = Object.keys(left);
    const keysRight = Object.keys(right);

    if (keysLeft.length !== keysRight.length) {
        return false;
    }

    const rightHasOwnProperty = Object.prototype.hasOwnProperty.bind(right);

    for (let idx = 0; idx < keysLeft.length; idx++) {
        const key = keysLeft[idx];

        if (!rightHasOwnProperty(key)) {
            return false;
        }

        if (left[key] !== right[key]) {
            let deepRet = false;
            if (typeof left[key] === 'object' && typeof right[key] === 'object' && level < 2) {
                // check only for 2 levels.
                deepRet = _isEqual(left[key], right[key], level++);
            } else {
                return false;
            }
            if (!deepRet) {
                return false;
            }
            //otherwise continue, as the inner object is equal.
        }
    }

    return true;
}

// Returns a function, that, as long as it continues to be invoked, will not
// be triggered. The function will be called after it stops being called for
// N milliseconds. If `immediate` is passed, trigger the function on the
// leading edge, instead of the trailing.
export function debounce(func, wait, immediate) {
    let timeout = null;
    return function () {
        const context = this,
            args = arguments;
        const callNow = immediate && !timeout;
        const later = function () {
            timeout = null;
            if (!immediate) func.apply(context, args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
        if (callNow) {
            func.apply(context, args);
        }
    };
}

export function bindEvent(element, eventName, eventHandler, options = false) {
    if (element.addEventListener) {
        element.addEventListener(eventName, eventHandler, options);
    } else if (element.attachEvent) {
        element.attachEvent('on' + eventName, eventHandler);
    }
}
