# Drivebase customer records

A React/Vite prototype for an automotive customer-record landing page and an admin workspace. The landing page includes a CSS/SVG car motion illustration; the admin workspace supports searching, filtering, adding, editing, and deleting customer records.

## Run locally

```sh
npm install
npm run dev
```

Open the local URL printed by Vite. Choose **Admin login** to enter the demo workspace.

## Demo access

- Email: `admin@drivebase.com`
- Password: `Drivebase2026`

This is a front-end demo, not production authentication. The demo credentials are included in the client bundle, the login state is held in memory, and customer records are stored in the current browser's `localStorage`. Do not use it for real customer data. A production deployment should connect the UI to a server-side authentication provider and a protected database/API.
