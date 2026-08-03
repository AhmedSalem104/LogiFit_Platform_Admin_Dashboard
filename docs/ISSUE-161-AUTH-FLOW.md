# Platform Dashboard authentication — Issue #161

Current contract for the dashboard:

1. The `/auth/login` screen collects only Email and Password.
2. `POST /api/platform/auth/login` validates the active linked platform identity and returns the
   Platform `AuthResponseDto` directly. No OTP challenge or second login request is sent.
3. The API sets the Platform refresh token in an HttpOnly, Secure, SameSite cookie. The dashboard
   stores only the short-lived access token and permission snapshot; it never reads or stores a
   refresh token in JavaScript storage.
4. `POST /api/platform/auth/refresh` is sent with credentials so the browser includes the cookie.
   Rotation responses replace the in-memory access token and permission snapshot.
5. Platform and tenant sessions remain separate. Permission guards are still enforced by the API;
   hiding a dashboard action is only a usability improvement.

No OTP, Phone Login, Passkey, WebAuthn, or development fixed code is part of this UI contract.
