import { redirect } from '@sveltejs/kit';
import { PUBLIC_AZURE_AD_CLIENT_ID, PUBLIC_AZURE_AD_TENANT_ID, PUBLIC_AZURE_REDIRECT_URL } from '$env/static/public';
import { AZURE_AD_CLIENT_SECRET, FIRMLY_AUTH_COOKIE } from '$env/static/private';

export async function GET({url, cookies}) {

    const payload = new URLSearchParams({
        grant_type:'authorization_code',
        client_id: PUBLIC_AZURE_AD_CLIENT_ID,
        scope: 'openid profile email',
        code: url.searchParams.get('code'),
        redirect_uri: PUBLIC_AZURE_REDIRECT_URL,
        client_secret: AZURE_AD_CLIENT_SECRET,
    });

    const response = await fetch(`https://login.microsoftonline.com/${PUBLIC_AZURE_AD_TENANT_ID}/oauth2/v2.0/token`, {
        method: 'POST',
        body: payload,
        headers: {
            'content-type': 'application/x-www-form-urlencoded'
        }
    });

    // Sample Response.
    // {
    //     "token_type": "Bearer",
    //     "scope": "email openid profile",
    //     "expires_in": 3954,
    //     "ext_expires_in": 3954,
    //     "access_token": "eyJ0eXAiOiJKV1QiLCJub25jZSI6IllQUW5xTWlGcEJBMVVJZS0tUWFNM2VHRVpOcHdyYnF4cnRfZV9samZ6X00iLCJhbGciOiJSUzI1NiIsIng1dCI6Ii1LSTNROW5OUjdiUm9meG1lWm9YcWJIWkdldyIsImtpZCI6Ii1LSTNROW5OUjdiUm9meG1lWm9YcWJIWkdldyJ9.eyJhdWQiOiIwMDAwMDAwMy0wMDAwLTAwMDAtYzAwMC0wMDAwMDAwMDAwMDAiLCJpc3MiOiJodHRwczovL3N0cy53aW5kb3dzLm5ldC85ODE4NjMyMC00OGFjLTRiMTEtYjFhZi05ZjZiMGIxNDBhNDUvIiwiaWF0IjoxNjg5MTk4ODQxLCJuYmYiOjE2ODkxOTg4NDEsImV4cCI6MTY4OTIwMzA5NiwiYWNjdCI6MCwiYWNyIjoiMSIsImFpbyI6IkFWUUFxLzhUQUFBQVJZallNRFpRQTNlc2s1Z09ENktjcllIMDZEUGV6RWxOU3hGWHBGU056endsRFpWSHdkWHI2SzlhbjViN203T09Fbm5GZTdiSUNjbmpwS29iY1o2aUg5WkRhclVDdlFqN1ZYa0hRYm1jcUI0PSIsImFtciI6WyJwd2QiLCJtZmEiXSwiYXBwX2Rpc3BsYXluYW1lIjoiRmlybWx5IERhc2hib2FyZCBEZXYvTG9jYWwiLCJhcHBpZCI6IjE5NGYyNGQxLWY0OGQtNDAxZS1hY2FhLWIwZTI5MDBiY2U2NyIsImFwcGlkYWNyIjoiMSIsImZhbWlseV9uYW1lIjoiR291dmVhIiwiZ2l2ZW5fbmFtZSI6IlJvbWVvIiwiaWR0eXAiOiJ1c2VyIiwiaXBhZGRyIjoiMjYwNzpmYjkxOjE1OWY6OWM2Mjo1ZDM5OjNlMmI6ZWU4ODo0YTBiIiwibmFtZSI6IlJvbWVvIEdvdXZlYSIsIm9pZCI6IjA2NjY3N2Q0LWU5NWYtNDQ1Ni05MDMwLWE0ZTNlNjhmYjQyMyIsInBsYXRmIjoiNSIsInB1aWQiOiIxMDAzMjAwMUUxNzUwNUU0IiwicmgiOiIwLkFYd0FJR01ZbUt4SUVVdXhyNTlyQ3hRS1JRTUFBQUFBQUFBQXdBQUFBQUFBQUFCOEFOYy4iLCJzY3AiOiJlbWFpbCBvcGVuaWQgcHJvZmlsZSIsInNpZ25pbl9zdGF0ZSI6WyJrbXNpIl0sInN1YiI6IjB0ZEQ5LXpGY1Vva0R3SGNoN3pTdGFhakdBc1ZsSkZBUlBELVhNeXJDWlEiLCJ0ZW5hbnRfcmVnaW9uX3Njb3BlIjoiTkEiLCJ0aWQiOiI5ODE4NjMyMC00OGFjLTRiMTEtYjFhZi05ZjZiMGIxNDBhNDUiLCJ1bmlxdWVfbmFtZSI6InJvbWVvQGZpcm1seS5haSIsInVwbiI6InJvbWVvQGZpcm1seS5haSIsInV0aSI6IlBMNUlULWMtdVVDZG5aT0J6ekU4QUEiLCJ2ZXIiOiIxLjAiLCJ3aWRzIjpbImZlOTMwYmU3LTVlNjItNDdkYi05MWFmLTk4YzNhNDlhMzhiMSIsIjI5MjMyY2RmLTkzMjMtNDJmZC1hZGUyLTFkMDk3YWYzZTRkZSIsIjY5MDkxMjQ2LTIwZTgtNGE1Ni1hYTRkLTA2NjA3NWIyYTdhOCIsImI3OWZiZjRkLTNlZjktNDY4OS04MTQzLTc2YjE5NGU4NTUwOSJdLCJ4bXNfc3QiOnsic3ViIjoiNTZtRURMU3FoaV82YkVxTGNzTnpWbkREd2RWLWFtVHNRSTJGRXRWVHRlWSJ9LCJ4bXNfdGNkdCI6MTYyMTI5ODQ1OX0.Jby_xKI5U9-gki26SnV34LW4ETZP3z0xjGycKWSTcxP8eUm11K0B52Hsj-0_dWvmkY_dAOKGRE3C1jThf0FAb7g-YmuhWwZQFILU_VXt-jkkastGAXX9ablmINoEBjIjpWC4yxJdYguepGgFxQKOtnKYVZbZwS_oKbIEwVmQXD3F5BIL45Gdnez47_ulZPcSABDEH5kNpo32vUodSRvP5TmlRJtNvOo4z9MB8TDpi5qKg8L-ka_oMhFyj2f2J-uCHxKgqfSVem_JxLbDO_8VFIV1gP-keUFtrwEa5LIGxXznqMNBHi40KJxIDIqNjFFZ7yM3pln18JEMrDdPlkQU6g",
    //     "id_token": "eyJ0eXAiOiJKV1QiLCJhbGciOiJSUzI1NiIsImtpZCI6Ii1LSTNROW5OUjdiUm9meG1lWm9YcWJIWkdldyJ9.eyJhdWQiOiIxOTRmMjRkMS1mNDhkLTQwMWUtYWNhYS1iMGUyOTAwYmNlNjciLCJpc3MiOiJodHRwczovL2xvZ2luLm1pY3Jvc29mdG9ubGluZS5jb20vOTgxODYzMjAtNDhhYy00YjExLWIxYWYtOWY2YjBiMTQwYTQ1L3YyLjAiLCJpYXQiOjE2ODkxOTg4NDEsIm5iZiI6MTY4OTE5ODg0MSwiZXhwIjoxNjg5MjAyNzQxLCJlbWFpbCI6InJvbWVvQGZpcm1seS5haSIsIm5hbWUiOiJSb21lbyBHb3V2ZWEiLCJvaWQiOiIwNjY2NzdkNC1lOTVmLTQ0NTYtOTAzMC1hNGUzZTY4ZmI0MjMiLCJwcmVmZXJyZWRfdXNlcm5hbWUiOiJyb21lb0BmaXJtbHkuYWkiLCJyaCI6IjAuQVh3QUlHTVltS3hJRVV1eHI1OXJDeFFLUmRFa1R4bU45QjVBcktxdzRwQUx6bWQ4QU5jLiIsInN1YiI6IjU2bUVETFNxaGlfNmJFcUxjc056Vm5ERHdkVi1hbVRzUUkyRkV0VlR0ZVkiLCJ0aWQiOiI5ODE4NjMyMC00OGFjLTRiMTEtYjFhZi05ZjZiMGIxNDBhNDUiLCJ1dGkiOiJQTDVJVC1jLXVVQ2RuWk9CenpFOEFBIiwidmVyIjoiMi4wIn0.nlrM4a7PISLd_4-yT7hVA-VPEnKAfeXuZ-An9OZge1L2NRO8l9dHZhRMr59vydjuC1s3UepDn5rShnQp9A1Ui0QiRCUzm_18KOjnJgPEtEMBcOeepyn7QSIIZZ69JSvHtiSJ4d1UQMBl4vUitJ5Lq2NPwtKiUk9E1R8GeMyhH4HuWTJ-549EjrIDgB_C6vM17K1PwwkOVRGls3Uxoqk3Y3JRKPHR6S6iso4MXxZX2m04DMqKZnY8eaQ19pTcRT9mAw1vIrWjU120iVEaN5csraUBjLfloyBcPIfW5s7JQMoned0YihPY8oZ_5Cw9qYyFd83GwS1TBvlOjNY5YJBeaw"
    // }
    if (response.ok) {
        const userDetails = await response.json();
        cookies.set(FIRMLY_AUTH_COOKIE, userDetails.id_token, {
            path: '/',
            maxAge: userDetails.expires_in,
        });

        throw redirect(302, '/');
    }

    // Unable to Authenticate.
    // TODO: Redirect user and show specific message

	return new Response('Not able to auth user', {status: 500});
}
