import { string } from 'yup';

/* eslint-disable no-undef */

export const useEmailWithValidation = (defaultValue = '') => {
    let value = $state(defaultValue);
    let error = $state('');

    const set = async (email) => {
        try {
            await string().email('Invalid email format').required('Email is required').validate(email);
            error = '';
            value = email;
        } catch (e) {
            if (email === '') {
                error = '';
            }
            if (e.type !== 'required') {
                error = e.message;
            }
            return false;
        }
    };

    return {
        get value() {
            return value;
        },
        get error() {
            return error;
        },
        set,
    };
};
