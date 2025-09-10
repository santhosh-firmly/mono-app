/**
 * Partner configuration module
 * Contains all partner-specific branding and configuration data
 *
 * Partner disclaimers are displayed in the checkout footer and override
 * the default merchant terms when present. Each partner can define:
 * - text: The disclaimer message (supports "Terms of Service" and "Privacy Policy" text replacement)
 * - links: Object containing termsOfService and privacyPolicy URLs for link replacement
 */

const PARTNER_CONFIGS = {
	forbes: {
		name: 'Forbes',
		largeLogo:
			"data:image/svg+xml,%3Csvg class='forbes-logo_svg__fs-icon forbes-logo_svg__fs-icon--forbes-logo' xmlns='http://www.w3.org/2000/svg' viewBox='0 0 200 54'%3E%3Cpath d='M113.3 18.2c0-5.8.1-11.2.4-16.2L98.4 4.9v1.4l1.5.2c1.1.1 1.8.5 2.2 1.1.4.7.7 1.7.9 3.2.2 2.9.4 9.5.3 19.9 0 10.3-.1 16.8-.3 19.3 5.5 1.2 9.8 1.7 13 1.7 6 0 10.7-1.7 14.1-5.2 3.4-3.4 5.2-8.2 5.2-14.1 0-4.7-1.3-8.6-3.9-11.7-2.6-3.1-5.9-4.6-9.8-4.6-2.6 0-5.3.7-8.3 2.1zm.3 30.8c-.2-3.2-.4-12.8-.4-28.5.9-.3 2.1-.5 3.6-.5 2.4 0 4.3 1.2 5.7 3.7 1.4 2.5 2.1 5.5 2.1 9.3 0 4.7-.8 8.5-2.4 11.7-1.6 3.1-3.6 4.7-6.1 4.7-.8-.2-1.6-.3-2.5-.4zM41 3H1v2l2.1.2c1.6.3 2.7.9 3.4 1.8.7 1 1.1 2.6 1.2 4.8.8 10.8.8 20.9 0 30.2-.2 2.2-.6 3.8-1.2 4.8-.7 1-1.8 1.6-3.4 1.8l-2.1.3v2h25.8v-2l-2.7-.2c-1.6-.2-2.7-.9-3.4-1.8-.7-1-1.1-2.6-1.2-4.8-.3-4-.5-8.6-.5-13.7l5.4.1c2.9.1 4.9 2.3 5.9 6.7h2V18.9h-2c-1 4.3-2.9 6.5-5.9 6.6l-5.4.1c0-9 .2-15.4.5-19.3h7.9c5.6 0 9.4 3.6 11.6 10.8l2.4-.7L41 3zm-4.7 30.8c0 5.2 1.5 9.5 4.4 12.9 2.9 3.4 7.2 5 12.6 5s9.8-1.7 13-5.2c3.2-3.4 4.7-7.7 4.7-12.9s-1.5-9.5-4.4-12.9c-2.9-3.4-7.2-5-12.6-5s-9.8 1.7-13 5.2c-3.2 3.4-4.7 7.7-4.7 12.9zm22.3-11.4c1.2 2.9 1.7 6.7 1.7 11.3 0 10.6-2.2 15.8-6.5 15.8-2.2 0-3.9-1.5-5.1-4.5-1.2-3-1.7-6.8-1.7-11.3C47 23.2 49.2 18 53.5 18c2.2-.1 3.9 1.4 5.1 4.4zm84.5 24.3c3.3 3.3 7.5 5 12.5 5 3.1 0 5.8-.6 8.2-1.9 2.4-1.2 4.3-2.7 5.6-4.5l-1-1.2c-2.2 1.7-4.7 2.5-7.6 2.5-4 0-7.1-1.3-9.2-4-2.2-2.7-3.2-6.1-3-10.5H170c0-4.8-1.2-8.7-3.7-11.8-2.5-3-6-4.5-10.5-4.5-5.6 0-9.9 1.8-13 5.3-3.1 3.5-4.6 7.8-4.6 12.9 0 5.2 1.6 9.4 4.9 12.7zm7.4-25.1c1.1-2.4 2.5-3.6 4.4-3.6 3 0 4.5 3.8 4.5 11.5l-10.6.2c.1-3 .6-5.7 1.7-8.1zm46.4-4c-2.7-1.2-6.1-1.9-10.2-1.9-4.2 0-7.5 1.1-10 3.2s-3.8 4.7-3.8 7.8c0 2.7.8 4.8 2.3 6.3 1.5 1.5 3.9 2.8 7 3.9 2.8 1 4.8 2 5.8 2.9 1 1 1.6 2.1 1.6 3.6 0 1.4-.5 2.7-1.6 3.7-1 1.1-2.4 1.6-4.2 1.6-4.4 0-7.7-3.2-10-9.6l-1.7.5.4 10c3.6 1.4 7.6 2.1 12 2.1 4.6 0 8.1-1 10.7-3.1 2.6-2 3.9-4.9 3.9-8.5 0-2.4-.6-4.4-1.9-5.9-1.3-1.5-3.4-2.8-6.4-4-3.3-1.2-5.6-2.3-6.8-3.3-1.2-1-1.8-2.2-1.8-3.7s.4-2.7 1.3-3.7 2-1.4 3.4-1.4c4 0 6.9 2.9 8.7 8.6l1.7-.5-.4-8.6zm-96.2-.9c-1.4-.7-2.9-1-4.6-1-1.7 0-3.4.7-5.3 2.1-1.9 1.4-3.3 3.3-4.4 5.9l.1-8-15.2 3v1.4l1.5.1c1.9.2 3 1.7 3.2 4.4.6 6.2.6 12.8 0 19.8-.2 2.7-1.3 4.1-3.2 4.4l-1.5.2v1.9h21.2V49l-2.7-.2c-1.9-.2-3-1.7-3.2-4.4-.6-5.8-.7-12-.2-18.4.6-1 1.9-1.6 3.9-1.8 2-.2 4.3.4 6.7 1.8l3.7-9.3z'%3E%3C/path%3E%3C/svg%3E",
		smallLogo: null,
		disclaimer: null
	},
	gannett: {
		name: 'USA TODAY',
		largeLogo:
			'data:image/svg+xml;base64,PHN2ZyB4bWxuczpkYz0iaHR0cDovL3B1cmwub3JnL2RjL2VsZW1lbnRzLzEuMS8iIHhtbG5zOmNjPSJodHRwOi8vY3JlYXRpdmVjb21tb25zLm9yZy9ucyMiIHhtbG5zOnJkZj0iaHR0cDovL3d3dy53My5vcmcvMTk5OS8wMi8yMi1yZGYtc3ludGF4LW5zIyIgeG1sbnM6c3ZnPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIiB4bWxuczpzb2RpcG9kaT0iaHR0cDovL3NvZGlwb2RpLnNvdXJjZWZvcmdlLm5ldC9EVEQvc29kaXBvZGktMC5kdGQiIHhtbG5zOmlua3NjYXBlPSJodHRwOi8vd3d3Lmlua3NjYXBlLm9yZy9uYW1lc3BhY2VzL2lua3NjYXBlIiB3aWR0aD0iNjAwIiBoZWlnaHQ9Ijg5LjgyNjQ0NyIgdmlld0JveD0iMCAwIDE1OC43NSAyMy43NjY1ODEiIHZlcnNpb249IjEuMSIgaWQ9InN2ZzQ5Njg3IiBpbmtzY2FwZTp2ZXJzaW9uPSIwLjkyLjQgKDVkYTY4OWMzMTMsIDIwMTktMDEtMTQpIiBzb2RpcG9kaTpkb2NuYW1lPSJVU0EgVG9kYXkgKDIwMjAtMDEtMjkpLnN2ZyI+CiAgPGRlZnMgaWQ9ImRlZnM0OTY4MSIvPgogIDxzb2RpcG9kaTpuYW1lZHZpZXcgaWQ9ImJhc2UiIHBhZ2Vjb2xvcj0iI2ZmZmZmZiIgYm9yZGVyY29sb3I9IiM2NjY2NjYiIGJvcmRlcm9wYWNpdHk9IjEuMCIgaW5rc2NhcGU6cGFnZW9wYWNpdHk9IjAuMCIgaW5rc2NhcGU6cGFnZXNoYWRvdz0iMiIgaW5rc2NhcGU6em9vbT0iMi4wMDY2NjY3IiBpbmtzY2FwZTpjeD0iMzAwIiBpbmtzY2FwZTpjeT0iNDQuOTEzMjI1IiBpbmtzY2FwZTpkb2N1bWVudC11bml0cz0icHgiIGlua3NjYXBlOmN1cnJlbnQtbGF5ZXI9InN2ZzQ5Njg3IiBzaG93Z3JpZD0iZmFsc2UiIHVuaXRzPSJweCIgZml0LW1hcmdpbi10b3A9IjAiIGZpdC1tYXJnaW4tbGVmdD0iMCIgZml0LW1hcmdpbi1yaWdodD0iMCIgZml0LW1hcmdpbi1ib3R0b209IjAiIGlua3NjYXBlOnBhZ2VjaGVja2VyYm9hcmQ9InRydWUiIGlua3NjYXBlOndpbmRvdy13aWR0aD0iMTkyMCIgaW5rc2NhcGU6d2luZG93LWhlaWdodD0iMTAwMSIgaW5rc2NhcGU6d2luZG93LXg9Ii05IiBpbmtzY2FwZTp3aW5kb3cteT0iLTkiIGlua3NjYXBlOndpbmRvdy1tYXhpbWl6ZWQ9IjEiLz4KICA8bWV0YWRhdGEgaWQ9Im1ldGFkYXRhNDk2ODQiPgogICAgPHJkZjpSREY+CiAgICAgIDxjYzpXb3JrIHJkZjphYm91dD0iIj4KICAgICAgICA8ZGM6Zm9ybWF0PgogICAgICAgICAgaW1hZ2Uvc3ZnK3htbAogICAgICAgIDwvZGM6Zm9ybWF0PgogICAgICAgIDxkYzp0eXBlIHJkZjpyZXNvdXJjZT0iaHR0cDovL3B1cmwub3JnL2RjL2RjbWl0eXBlL1N0aWxsSW1hZ2UiLz4KICAgICAgICA8ZGM6dGl0bGUvPgogICAgICA8L2NjOldvcms+CiAgICA8L3JkZjpSREY+CiAgPC9tZXRhZGF0YT4KICA8cGF0aCBpbmtzY2FwZTpjb25uZWN0b3ItY3VydmF0dXJlPSIwIiBpZD0icGF0aDY5MTgiIGQ9Im0gMjMuNzY3OTEsMTEuODgzMjkgYyAwLDYuNTYyOTcgLTUuMzIwMzIsMTEuODgzMjkgLTExLjg4NDYyLDExLjg4MzI5IEMgNS4zMjAzMiwyMy43NjY1OCAwLDE4LjQ0NjI2IDAsMTEuODgzMjkgMCw1LjMyMDMyIDUuMzIwMzIsMCAxMS44ODMyOSwwIGMgNi41NjQzLDAgMTEuODg0NjIsNS4zMjAzMiAxMS44ODQ2MiwxMS44ODMyOSIgc3R5bGU9ImZpbGw6IzAwYWJlNjtmaWxsLW9wYWNpdHk6MTtmaWxsLXJ1bGU6bm9uemVybztzdHJva2U6bm9uZTtzdHJva2Utd2lkdGg6MC4zMzkxNDQxMSIvPgogIDxwYXRoIGlua3NjYXBlOmNvbm5lY3Rvci1jdXJ2YXR1cmU9IjAiIHN0eWxlPSJmaWxsOiMzMzI2MWM7ZmlsbC1vcGFjaXR5OjE7c3Ryb2tlOm5vbmU7c3Ryb2tlLXdpZHRoOjAuMzM5MTQ0MDgiIGQ9Im0gMzQuODczODYsMTYuOTgzNDEyIGMgLTEuODcwNTksMCAtMi45MTQ1MiwtMS4xNDQ2MiAtMi45MTQ1MiwtMy4xNjM1OCBWIDMuNTcxMzIwMSBIIDI3LjMyMjYgViAxMy43OTMzMzIgYyAwLDQuNDg4MzYgMi43Mzk2NSw3LjA1MzE0IDcuNTUxMjYsNy4wNTMxNCA0LjgxMTYxLDAgNy41NTEyNiwtMi41NjQ3OCA3LjU1MTI2LC03LjA1MzE0IFYgMy41NzEzMjAxIEggMzcuNzg4MzggViAxMy44MTk4MzIgYyAwLDIuMDE4OTYgLTEuMDQzOTMsMy4xNjM1OCAtMi45MTQ1MiwzLjE2MzU4IHogbSAwLDAiIGlkPSJwYXRoNDI1OTAiLz4KICA8cGF0aCBpbmtzY2FwZTpjb25uZWN0b3ItY3VydmF0dXJlPSIwIiBzdHlsZT0iZmlsbDojMzMyNjFjO2ZpbGwtb3BhY2l0eToxO3N0cm9rZTpub25lO3N0cm9rZS13aWR0aDowLjMzOTE0NDA4IiBkPSJtIDUwLjYwOTAzLDIwLjg0NjQ3MiBjIDQuMDY0NDMsMCA2LjcyOTg5MSwtMi4xNjczNCA2LjcyOTg5MSwtNS4zODM5MSAwLC0yLjI5NDUyIC0xLjM3MjQ3MSwtNC4wNjQ0MzEgLTUuMDEyOTcxLC01LjA2MDY2MiBsIC0xLjI3MTc5LC0wLjM0OTc1IGMgLTEuODE3NiwtMC40OTgxMTk4IC0yLjQ5MDU5LC0xLjA0MzkyOTkgLTIuNDkwNTksLTEuODQ0MSAwLC0wLjg0Nzg1OTkgMC43NDcxNywtMS4zMTk0OCAyLjA2NjY2LC0xLjMxOTQ4IDEuNjAwMzQsMCAzLjMxNzI1OSwwLjg5NTU1IDQuNTE0ODUsMS45MTgyOSBMIDU3LjQ2MDgwMSw1Ljg5MjMzMDEgQyA1NS42NDMyMDEsNC4yNDQzMDAxIDUzLjIwMDMsMy4yNDgwNyA1MC42MDkwMywzLjI0ODA3IGMgLTMuOTE2MDUsMCAtNi42NTU3LDIuMTE5NjUwMSAtNi42NTU3LDUuMzgzOTIgMCwyLjUxNzA4MSAxLjY0MjcyLDQuMTY1MTEyIDQuNjg0NDMsNC45NTk5ODIgbCAxLjA0OTIzLDAuMjc1NTUgYyAyLjI2ODAyLDAuNTk4OCAzLjA0MTY5LDEuMDQ5MjMgMy4wNDE2OSwxLjk0NDc4IDAsMC45MjIwNSAtMC44MDAxNiwxLjM5MzY3IC0yLjE0NjE0LDEuMzkzNjcgLTEuOTkyNDgsMCAtMy42NDA1LC0wLjcyMDY4IC00Ljk4NjQ5LC0xLjkxODI4IGwgLTIuMjQxNTMsMi44MTkxNCBjIDEuODcwNiwxLjc0MzQgNC40ODgzNywyLjczOTY0IDcuMjU0NTEsMi43Mzk2NCB6IG0gMCwwIiBpZD0icGF0aDQyNTg2Ii8+CiAgPHBhdGggaW5rc2NhcGU6Y29ubmVjdG9yLWN1cnZhdHVyZT0iMCIgc3R5bGU9ImZpbGw6IzMzMjYxYztmaWxsLW9wYWNpdHk6MTtzdHJva2U6bm9uZTtzdHJva2Utd2lkdGg6MC4zMzkxNDQwOCIgZD0ibSA3MC41NzIwNjksMjAuNTIzMjMyIGggNC43MTYyMTIgTCA2OS4wNzc3MTEsMy41NzEzMjAxIEggNjMuNjkzOCBMIDU3LjQ4ODUxOSwyMC41MjMyMzIgaCA0LjU4Mzc1IGwgMS4wNzU3MTEsLTMuMTYzNTkgaCA2LjM1MzY1OSB6IE0gNjQuMzE5MSwxMy45MTUyMTIgNjYuMzM4MDU5LDcuOTg1NDkwMiA2OC4zMzA1NCwxMy45MTUyMTIgWiBtIDAsMCIgaWQ9InBhdGg0MjU4MiIvPgogIDxwYXRoIGlua3NjYXBlOmNvbm5lY3Rvci1jdXJ2YXR1cmU9IjAiIHN0eWxlPSJmaWxsOiMzMzI2MWM7ZmlsbC1vcGFjaXR5OjE7c3Ryb2tlOm5vbmU7c3Ryb2tlLXdpZHRoOjAuMzM5MTQ0MDgiIGQ9Im0gODQuMjMyNTcsMjAuNTIzMjMyIGggNC42MzY3MzYgViA3LjMxMjUgaCA1LjAzOTQ3MSBWIDMuNTcxMzIwMSBIIDc5LjE5ODM5OSBWIDcuMzEyNSBoIDUuMDM0MTcxIHogbSAwLDAiIGlkPSJwYXRoNDI1NzgiLz4KICA8cGF0aCBpbmtzY2FwZTpjb25uZWN0b3ItY3VydmF0dXJlPSIwIiBzdHlsZT0iZmlsbDojMzMyNjFjO2ZpbGwtb3BhY2l0eToxO3N0cm9rZTpub25lO3N0cm9rZS13aWR0aDowLjMzOTE0NDA4IiBkPSJtIDEwMi41OTQzOCwyMC44NDY0NzIgYyA1LjA4MTg2LDAgOC43OTY1NSwtMy42MTQgOC43OTY1NSwtOC43NzUzNjEgMCwtNS4xNTYwNDA5IC0zLjcxNDY5LC04LjgyMzA0MSAtOC43OTY1NSwtOC44MjMwNDEgLTUuMDg3MTY0LDAgLTguODAxODU1LDMuNjY3MDAwMSAtOC44MDE4NTUsOC44MjMwNDEgMCw1LjE2MTM2MSAzLjcxNDY5MSw4Ljc3NTM2MSA4LjgwMTg1NSw4Ljc3NTM2MSB6IG0gMCwtMy44MzY1NyBjIC0yLjQxNjQsMCAtNC4wOTA5MzMsLTEuOTk3NzcgLTQuMDkwOTMzLC00LjkzODc5MSAwLC0yLjk0MTAxMDggMS42NzQ1MzMsLTQuOTgxMTcwOSA0LjA5MDkzMywtNC45ODExNzA5IDIuNDE2NCwwIDQuMDg1NjIsMi4wNDAxNjAxIDQuMDg1NjIsNC45ODExNzA5IDAsMi45NDEwMjEgLTEuNjY5MjIsNC45Mzg3OTEgLTQuMDg1NjIsNC45Mzg3OTEgeiBtIDAsMCIgaWQ9InBhdGg0MjU3MCIvPgogIDxwYXRoIGlua3NjYXBlOmNvbm5lY3Rvci1jdXJ2YXR1cmU9IjAiIHN0eWxlPSJmaWxsOiMzMzI2MWM7ZmlsbC1vcGFjaXR5OjE7c3Ryb2tlOm5vbmU7c3Ryb2tlLXdpZHRoOjAuMzM5MTQ0MDgiIGQ9Im0gMTEyLjk5NDQxLDIwLjUyMzIzMiBoIDYuNjc2OSBjIDUuMDEyOTcsMCA4LjU3OTI4LC0zLjQ5MjEzIDguNTc5MjgsLTguNDczMzExIDAsLTQuOTg2NDgxIC0zLjU2NjMxLC04LjQ3ODYwMDkgLTguNTc5MjgsLTguNDc4NjAwOSBoIC02LjY3NjkgeiBtIDQuNTYyNTUsLTMuNjYxNyBWIDcuMjM4MzEgaCAyLjExNDM1IGMgMi40NDI4OSwwIDMuOTQyNTUsMS45MTgyOTAxIDMuOTQyNTUsNC44MTE2MTEgMCwyLjg4ODAzMSAtMS40OTk2Niw0LjgxMTYxMSAtMy45NDI1NSw0LjgxMTYxMSB6IG0gMCwwIiBpZD0icGF0aDQyNTY2Ii8+CiAgPHBhdGggaW5rc2NhcGU6Y29ubmVjdG9yLWN1cnZhdHVyZT0iMCIgc3R5bGU9ImZpbGw6IzMzMjYxYztmaWxsLW9wYWNpdHk6MTtzdHJva2U6bm9uZTtzdHJva2Utd2lkdGg6MC4zMzkxNDQwOCIgZD0ibSAxNDAuNDc4MTYsMjAuNTIzMjMyIGggNC43MTYyMyBMIDEzOC45ODM4LDMuNTcxMzIwMSBoIC01LjM4MzkgbCAtNi4yMDUyOCwxNi45NTE5MTE5IGggNC41ODM3NCBsIDEuMDc1NzIsLTMuMTYzNTkgaCA2LjM1MzY1IHogbSAtNi4yNTI5NywtNi42MDgwMiAyLjAxODk3LC01LjkyOTcyMTggMS45OTI0Nyw1LjkyOTcyMTggeiBtIDAsMCIgaWQ9InBhdGg0MjU1OCIvPgogIDxwYXRoIGlua3NjYXBlOmNvbm5lY3Rvci1jdXJ2YXR1cmU9IjAiIHN0eWxlPSJmaWxsOiMzMzI2MWM7ZmlsbC1vcGFjaXR5OjE7c3Ryb2tlOm5vbmU7c3Ryb2tlLXdpZHRoOjAuMzM5MTQ0MDgiIGQ9Ik0gMTUyLjc0NjEsMTQuNDE4NjMyIDE1OC43NSwzLjU3MTMyMDEgaCAtNS4yMzAyMyBMIDE1MC40MDM4OCwxMC4zMDEyIDE0Ny4yNjE1LDMuNTcxMzIwMSBoIC01LjIzNTU0IGwgNi4wMDkyMSwxMC44NDczMTE5IHYgNi4xMDQ2IGggNC43MTA5MyB6IG0gMCwwIiBpZD0icGF0aDQyNTYyIi8+Cjwvc3ZnPgo=',
		smallLogo: null,
		disclaimer: {
			text: 'By tapping "Buy Now", you agree that we can share information about you and your purchase transaction with our commerce partners to facilitate payment and with the merchant to fulfill the order. By completing this transaction you agree to our Terms of Service, Privacy Policy, and FTC compliance policy.',
			links: {
				termsOfService: 'https://cm.usatoday.com/terms/',
				privacyPolicy: 'https://cm.usatoday.com/privacy'
			}
		}
	}
};

const PARTNER_SUBDOMAIN_MAP = {
	gannett: 'gannett',
	forbes: 'forbes'
};

/**
 * Detects partner based on domain subdomain
 * @param {string} domain - The full domain to analyze
 * @returns {string|null} - Partner identifier or null if no partner detected
 */
export function detectPartner(domain) {
	if (!domain) return null;

	const domainParts = domain.split('.');
	const firstSubdomain = domainParts.length > 2 ? domainParts[0] : null;

	if (firstSubdomain && PARTNER_SUBDOMAIN_MAP[firstSubdomain]) {
		return PARTNER_SUBDOMAIN_MAP[firstSubdomain];
	}

	return null;
}

/**
 * Gets complete partner configuration
 * @param {string|null} partnerId - Partner identifier
 * @returns {Object|null} - Partner configuration object or null if not found
 */
export function getPartnerConfig(partnerId) {
	if (!partnerId || !PARTNER_CONFIGS[partnerId]) {
		return null;
	}

	return {
		id: partnerId,
		...PARTNER_CONFIGS[partnerId]
	};
}

/**
 * Gets partner information with fallback to default
 * @param {string} domain - The domain to detect partner from
 * @returns {Object} - Partner information object
 */
export function getPartnerInfo(domain) {
	const partnerId = detectPartner(domain);
	const partnerConfig = getPartnerConfig(partnerId);

	if (partnerConfig) {
		return {
			partnerId,
			partnerInfo: {
				largeLogo: partnerConfig.largeLogo,
				smallLogo: partnerConfig.smallLogo,
				name: partnerConfig.name,
				disclaimer: partnerConfig.disclaimer
			}
		};
	}

	// Return default (no partner detected)
	return {
		partnerId: null,
		partnerInfo: null
	};
}
