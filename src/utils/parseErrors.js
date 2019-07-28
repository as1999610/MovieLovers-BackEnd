import _ from 'lodash';

export default function() {
    const result = {};
    _.forEach(errors, (val, key) => {
        result[key] = val.message;
    })
    return result;
}