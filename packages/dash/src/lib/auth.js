import { getContext, setContext } from "svelte";

const authInfoKey = Symbol();

export function setUserContext (authInfo) {
    setContext(authInfoKey, authInfo);
}

export function getUsercontext () {
    return getContext(authInfoKey);
}