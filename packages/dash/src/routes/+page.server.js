export const load = (async ({ cookies, locals }) => {
  return {
    authInfo: locals.authInfo
  };
});