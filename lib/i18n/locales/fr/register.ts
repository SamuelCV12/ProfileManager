// lib/i18n/locales/fr/register.ts

export const frRegister = {
  // ── En-tête ──
  createAccount: "Créer un compte",
  registerDesc: "Remplissez le formulaire pour vous inscrire sur notre portail",
  backToLogin: "Retour à la connexion",

  // ── Banneau CV ──
  autoFillCV: "Remplissage automatique avec CV (Optionnel)",
  autoFillCVDesc: "Téléchargez votre CV en PDF ou Word et l'IA remplira le formulaire automatiquement",
  cvProcessed: "CV traité ! Vérifiez les champs pré-remplis",
  cvProcessedDesc: "Vous pouvez modifier n'importe quel champ avant de créer votre compte",
  uploadCVButton: "Télécharger CV (PDF, Word)",
  uploadAnotherCV: "Télécharger un autre CV",
  processingCV: "Traitement en cours...",

  // ── Photo de profil ──
  profilePhoto: "Photo de profil (Optionnel)",
  chooseFile: "Choisir un fichier",
  changePhoto: "Changer la photo",
  removePhoto: "Supprimer",
  photoHint: "JPG, PNG ou WEBP · Max 5MB",

  // ── Informations personnelles ──
  personalInfo: "Informations personnelles",
  names: "Prénoms *",
  namesPlaceholder: "Ex: Jean Carlos",
  surnames: "Noms *",
  surnamePlaceholder: "Ex: García López",
  birthDate: "Date de naissance *",
  personalDescription: "Description personnelle (Optionnel)",
  personalDescriptionPlaceholder: "Écrivez une brève description sur vous-même",

  // ── Poste souhaité ──
  desiredRole: "Poste souhaité *",
  desiredRolePlaceholder: "Ex: Développeur Backend",

  // ── Compétences ──
  skills: "Compétences (Optionnel)",
  skillsHint: "Une par ligne",
  skillsPlaceholder: "React\nNode.js\nTypeScript",

  // ── Éducation ──
  education: "Éducation (Optionnel)",
  degree: "Diplôme / Carrière",
  institution: "Institution",
  year: "Année (Ex: 2019-2023)",
  noEducationEntries: "Aucune entrée. Téléchargez votre CV ou cliquez sur Ajouter.",
  addEducation: "Ajouter",

  // ── Expérience ──
  experience: "Expérience professionnelle (Optionnel)",
  role: "Poste",
  company: "Entreprise",
  period: "Période (Ex: 2020-2024)",
  experienceDescription: "Description des responsabilités...",
  noExperienceEntries: "Aucune entrée. Téléchargez votre CV ou cliquez sur Ajouter.",
  addExperience: "Ajouter",

  // ── Identifiants ──
  accessCredentials: "Identifiants d'accès",
  email: "Adresse e-mail *",
  emailPlaceholder: "votre@email.com",
  password: "Mot de passe *",
  passwordPlaceholder: "••••••••",

  // ── Boutons ──
  createAccountButton: "Créer un compte",
  creatingAccount: "Création du compte...",

  // ── Pied de page ──
  alreadyAccount: "Vous avez déjà un compte?",
  loginHere: "Connectez-vous ici",
  isCompany: "Êtes-vous une entreprise?",
  registerCompany: "Enregistrement de l'entreprise",

  // ── Erreurs et messages ──
  fileTooLarge: "Le fichier ne doit pas dépasser 15MB",
  unsupportedFormat: "Format non supporté. Utilisez PDF, Word (.docx) ou texte.",
  analyzingCV: "Analyse de votre CV avec l'IA...",
  cvProcessedSuccess: "CV traité ! Vérifiez les données et complétez le formulaire.",
  cvProcessError: "Erreur lors du traitement du CV",
  accountCreated: "Compte créé avec succès !",
  cvProcessErrorMsg: "Erreur lors du traitement du CV : {error}",
  unknownError: "Erreur inconnue",
  allRightsReserved: "© 2026 ProfileManager. Tous droits réservés.",
} as const;

