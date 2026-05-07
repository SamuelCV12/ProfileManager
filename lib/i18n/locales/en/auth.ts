// lib/i18n/locales/en/auth.ts

export const enAuth = {
  // ── Login ──
  loginSuccess: "Login successful!",
  emailPlaceholder: "your@email.com",

  // ── Forgot Password ──
  recoverAccountTitle: "Recover your account",
  enterEmailForReset: "Enter your email address and we'll send you a secure link.",
  checkVSCodeLink: "Check the VS Code terminal to see the secret link.",
  checkVSCode: "Check your VS Code terminal!",
  generateLink: "Generate recovery link",
  linkGeneratedSuccess: "Link generated successfully! Check VS Code.",
  tryAnotherEmail: "Try another email",
  backToLoginBtn: "Back to login",
  connectionError: "A connection error occurred.",

  // ── Reset Password ──
  createNewPasswordTitle: "Create new password",
  enterNewPasswordDesc: "Enter your new password below.",
  newPasswordLabel: "New Password",
  confirmPasswordLabel: "Confirm Password",
  saveNewPassword: "Save New Password",
  savingPassword: "Saving...",
  allSetTitle: "All set!",
  passwordChangedSuccess: "Your password has been changed successfully.",
  goToLogin: "Go to Sign In",
  invalidResetLink: "Invalid or incomplete recovery link.",
  requestNewLink: "Request a new one",
  noValidToken: "No valid token found in the URL.",
  passwordsDontMatch: "Passwords don't match.",
  passwordTooShort: "Password must be longer.",
  passwordUpdatedSuccess: "Password updated successfully!",
  connectionErrorServer: "An error occurred while connecting to the server.",

  // ── Footer ──
  allRightsReserved: "© 2026 ProfileManager. All rights reserved.",
} as const;
