// lib/i18n/locales/fr/auth.ts

export const frAuth = {
  // ── Login ──
  loginSuccess: "Connexion réussie !",
  emailPlaceholder: "votre@email.com",

  // ── Forgot Password ──
  recoverAccountTitle: "Récupérez votre compte",
  enterEmailForReset: "Entrez votre adresse e-mail et nous vous enverrons un lien sécurisé.",
  checkVSCodeLink: "Vérifiez le terminal de VS Code pour voir le lien secret.",
  checkVSCode: "Vérifiez votre terminal VS Code !",
  generateLink: "Générer le lien de récupération",
  linkGeneratedSuccess: "Lien généré avec succès ! Vérifiez VS Code.",
  tryAnotherEmail: "Essayer un autre e-mail",
  backToLoginBtn: "Retour à la connexion",
  connectionError: "Une erreur de connexion s'est produite.",

  // ── Reset Password ──
  createNewPasswordTitle: "Créer un nouveau mot de passe",
  enterNewPasswordDesc: "Entrez votre nouveau mot de passe ci-dessous.",
  newPasswordLabel: "Nouveau mot de passe",
  confirmPasswordLabel: "Confirmer le mot de passe",
  saveNewPassword: "Enregistrer le nouveau mot de passe",
  savingPassword: "Enregistrement...",
  allSetTitle: "Tout est prêt !",
  passwordChangedSuccess: "Votre mot de passe a été changé avec succès.",
  goToLogin: "Aller à la connexion",
  invalidResetLink: "Lien de récupération invalide ou incomplet.",
  requestNewLink: "Demander un nouveau lien",
  noValidToken: "Aucun token valide trouvé dans l'URL.",
  passwordsDontMatch: "Les mots de passe ne correspondent pas.",
  passwordTooShort: "Le mot de passe doit être plus long.",
  passwordUpdatedSuccess: "Mot de passe mis à jour avec succès !",
  connectionErrorServer: "Une erreur s'est produite lors de la connexion au serveur.",

  // ── Footer ──
  allRightsReserved: "© 2026 ProfileManager. Tous droits réservés.",
} as const;
