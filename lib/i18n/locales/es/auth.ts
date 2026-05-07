// lib/i18n/locales/es/auth.ts

export const esAuth = {
  // ── Login ──
  loginSuccess: "¡Inicio de sesión exitoso!",
  emailPlaceholder: "tu@email.com",

  // ── Forgot Password ──
  recoverAccountTitle: "Recupera tu cuenta",
  enterEmailForReset: "Ingresa tu correo electrónico y te enviaremos un enlace seguro.",
  checkVSCodeLink: "Revisa la terminal de VS Code para ver el enlace secreto.",
  checkVSCode: "¡Revisa tu terminal de VS Code!",
  generateLink: "Generar enlace de recuperación",
  linkGeneratedSuccess: "¡Enlace generado exitosamente! Míralo en VS Code.",
  tryAnotherEmail: "Intentar con otro correo",
  backToLoginBtn: "Volver al inicio de sesión",
  connectionError: "Ocurrió un error de conexión.",

  // ── Reset Password ──
  createNewPasswordTitle: "Crear nueva contraseña",
  enterNewPasswordDesc: "Ingresa tu nueva contraseña a continuación.",
  newPasswordLabel: "Nueva Contraseña",
  confirmPasswordLabel: "Confirmar Contraseña",
  saveNewPassword: "Guardar Nueva Contraseña",
  savingPassword: "Guardando...",
  allSetTitle: "¡Todo listo!",
  passwordChangedSuccess: "Tu contraseña ha sido cambiada exitosamente.",
  goToLogin: "Ir a Iniciar Sesión",
  invalidResetLink: "Enlace de recuperación inválido o incompleto.",
  requestNewLink: "Solicitar uno nuevo",
  noValidToken: "No se encontró un token válido en la URL.",
  passwordsDontMatch: "Las contraseñas no coinciden.",
  passwordTooShort: "La contraseña debe ser más larga.",
  passwordUpdatedSuccess: "¡Contraseña actualizada con éxito!",
  connectionErrorServer: "Ocurrió un error al conectar con el servidor.",

  // ── Footer ──
  allRightsReserved: "© 2026 ProfileManager. Todos los derechos reservados.",
} as const;
