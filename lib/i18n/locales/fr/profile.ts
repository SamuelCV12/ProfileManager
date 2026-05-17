// lib/i18n/locales/fr/profile.ts

export const frProfile = {
  // ── Profile page ──
  backToDashboard: "Retour au tableau de bord",
  profileNotFound: "Profil non trouvé. Vous devez vous inscrire d'abord.",
  profileFooter: "© 2026 ProfileManager. Tous droits réservés.",

  // ── ProfileForm header ──
  myProfile: "Mon Profil",
  profileSubtitle: "Mettez à jour vos informations personnelles et professionnelles",
  profileCompleteMsg100: "Parfait ! Votre profil est complet 🎉",
  profileCompleteMsg80: "Excellent ! Votre profil est presque complet",
  profileCompleteMsg50: "Bon progrès, continuez à compléter votre profil",
  profileCompleteMsgLow: "Complétez votre profil pour améliorer vos opportunités",

  // ── CV processing ──
  autocompleteCV: "Complétez automatiquement votre profil ",
  uploadCVDesc: "Téléchargez votre CV en PDF, Word ou texte et nous extrairons les informations automatiquement",
  cvSuccess: "CV traité avec succès !",
  reviewCV: "Vérifiez les données extraites et enregistrez les modifications",
  processing: "Traitement...",
  uploadAnotherCV: "Télécharger un autre CV",
  uploadCV: "Télécharger CV",
  profilePhoto: "Photo de Profil",
  photoFormat: "JPG, PNG ou GIF. Max 5Mo.",

  // ── Personal Info ──
  personalInfo: "Informations Personnelles",
  firstName: "Prénom",
  lastName: "Nom de famille",
  birthDate: "Date de Naissance",
  phone: "Téléphone",
  email: "Adresse e-mail",
  desiredRole: "Poste Souhaité",
  description: "Description Personnelle",

  // ── Placeholders ──
  phonePlaceholder: "+33 6 12 34 56 78",
  desiredRolePlaceholder: "Ex: Développeur Backend",
  aboutYouPlaceholder: "Parlez-nous de vous...",

  // ── Skills ──
  skills: "Compétences",
  onePerLine: "Écrivez une compétence par ligne",

  // ── Education ──
  education: "Éducation",
  add: "Ajouter",
  degree: "Diplôme / Filière",
  institution: "Établissement",
  year: "Année",
  noEducation: "Aucun registre d'éducation. Ajoutez-en un avec le bouton +",

  // ── Experience ──
  workExperience: "Expérience Professionnelle",
  experience: "Expérience",
  role: "Poste",
  company: "Entreprise",
  period: "Période",
  responsibilities: "Responsabilités et réalisations",
  noExperience: "Aucun registre d'expérience. Ajoutez-en un avec le bouton +",

  // ── Actions ──
  saving: "Enregistrement...",
  saveChanges: "Enregistrer les Modifications",
  cancel: "Annuler",

  // ── Toasts ──
  profileUpdatedSuccess: "Profil mis à jour avec succès !",
  profileUpdateError: "Erreur lors de la mise à jour du profil.",
  avatarUploaded: "Photo téléchargée. Enregistrez pour confirmer.",
  cvProcessedReview: "CV traité ! Vérifiez les données et enregistrez.",
  cvMismatchError: "Ce CV semble appartenir à {firstName} {lastName}, pas à votre profil. Veuillez télécharger votre propre CV.",
  fileTooLarge: "Le fichier ne doit pas dépasser 15Mo",
  unsupportedFormat: "Format non pris en charge. Utilisez PDF, Word (.docx) ou texte.",
  analyzingCV: "Analyse de votre CV avec l'IA...",
  cvProcessingError: "Erreur de traitement du CV : {error}",
  unknownError: "Erreur inconnue",

  // ── Company Profile ──
  backToPanelCompany: "Retour au panneau",
  companyProfileTitle: "Profil de l'Entreprise",
  companyProfileSubtitle: "Mettez à jour les données de votre entreprise",
  employeeCountLabel: "Nombre Approximatif d'Employés *",
  corporateEmailLabel: "Email professionnel",
  coreBusinessPlaceholder: "Décrivez l'activité principale de votre entreprise...",
  savingLoading: "Enregistrement...",
  saveChangesBtn: "Enregistrer les Modifications",
  cancelBtn: "Annuler",
  companyProfileUpdated: "Profil de l'entreprise mis à jour !",
  companyProfileUpdateError: "Erreur de mise à jour du profil de l'entreprise.",
  employeeCountPlaceholder: "Ex: 50",

  // ── Common Footer ──
  allRightsReserved: "© 2026 ProfileManager. Tous droits réservés.",
} as const;
