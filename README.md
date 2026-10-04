# FundDreams Backend
Node + Express + MongoDB (Mongoose) + Socket.io + Firebase Admin.

Setup: `cp .env.example .env` -> edit -> `npm install` -> start MongoDB (`mongod`, or an Atlas URI) -> `npm run seed` -> `npm run dev`.

Seed logins: admin@funddreams.com/Admin@123, creator@funddreams.com/Creator@123, backer@funddreams.com/Backer@123.

Sockets: emit `join:campaign` with a campaign id; listen for `funding:progress` and `campaign:update`.
Firebase: set FIREBASE_SERVICE_ACCOUNT to a service-account JSON path; clients register tokens via PUT /api/auth/fcm-token.
Fee: PLATFORM_FEE_PERCENT (default 8) is deducted on POST /api/payouts.


## API Documentation
Swagger UI is available at `http://localhost:5001/api/docs` when the server is running.

## Firebase Authentication
The backend supports both local JWT authentication and Firebase Authentication. The Firebase client should sign the user in with Firebase Auth and send the resulting Firebase ID token to `POST /api/auth/firebase`. The backend verifies that token with Firebase Admin, creates/links the MongoDB user, and returns the application's JWT.

Set `FIREBASE_SERVICE_ACCOUNT` to the path of a Firebase Admin service-account JSON file, or use `FIREBASE_SERVICE_ACCOUNT_JSON` for the JSON contents. Do not commit service-account credentials to Git.

Firebase Cloud Messaging is supported through `PUT /api/auth/fcm-token` and `POST /api/notifications/send`.
