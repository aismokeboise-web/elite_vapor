# empire

## Server environment configuration

The Node/Express API in the `server` folder uses environment variables for:

- **SMTP email delivery** (for admin password reset / password-changed emails)
- **Password reset link base URL** (where the React admin UI is hosted)

Create a `.env` file in the `server` folder (this file is already git-ignored) and define the variables below. You can also use `server/.env.example` as a starting point.

### SMTP variables (required to send emails)

These values are read in `server/src/email/mailer.ts`. If any of them are missing, the server will log a warning and **no admin password reset / password-changed emails will be sent**, but the rest of the app will continue to work.

- **`SMTP_HOST`**: Hostname of your SMTP server, e.g. `smtp.sendgrid.net` or `smtp.gmail.com`.
- **`SMTP_PORT`**: Port for SMTP, e.g. `587` (TLS) or `465` (SSL).
- **`SMTP_USER`**: Username for authenticating with the SMTP server.
- **`SMTP_PASS`**: Password or API key for the SMTP user.
- **`SMTP_FROM`**: From address used for outgoing admin emails.  
  If omitted, it falls back to `no-reply@empirevaporcasper.com`.

Example:

```bash
SMTP_HOST=smtp.example.com
SMTP_PORT=587
SMTP_USER=your-smtp-username
SMTP_PASS=your-smtp-password
SMTP_FROM=no-reply@empirevaporcasper.com
```

### Password reset link base URL

When an admin requests a password reset, the backend generates a short-lived token and builds a reset URL that points to the React admin UI (the `AdminResetPasswordPage` in the client). This URL is included in the email.

The base URL for that link is resolved in `server/src/routes/adminAuth.ts` as:

1. **`ADMIN_BASE_URL`** – preferred, specific base URL for the admin UI  
2. **`APP_BASE_URL`** – fallback if `ADMIN_BASE_URL` is not set  
3. Defaults to `http://localhost:5173` in development if neither is provided

Set at least **one** of these:

- **`ADMIN_BASE_URL`**: The origin where the admin React app is served, e.g. `https://admin.example.com` or `https://example.com`. The final reset link will look like:

  \[
  \text{<ADMIN_BASE_URL>}/admin/reset-password?token=<JWT\_TOKEN>
  \]

- **`APP_BASE_URL`** (optional): Fallback origin used when `ADMIN_BASE_URL` is not set. Useful if the public site and admin share the same origin.

Example (local development):

```bash
ADMIN_BASE_URL=http://localhost:5173
# Or alternatively:
# APP_BASE_URL=http://localhost:5173
```

### Admin JWT secrets (for completeness)

These are already wired up in the server; set them in your `server/.env` file so tokens are secure:

- **`ADMIN_JWT_SECRET`**: Secret key used to sign admin auth tokens.
- **`ADMIN_RESET_JWT_SECRET`** (optional): Separate secret for password reset tokens. If not provided, it falls back to `ADMIN_JWT_SECRET`.

Example:

```bash
ADMIN_JWT_SECRET=change-me-admin-jwt-secret
# Optional separate secret for reset tokens:
# ADMIN_RESET_JWT_SECRET=change-me-admin-reset-secret
```