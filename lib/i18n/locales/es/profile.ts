// lib/i18n/locales/es/profile.ts

export const esProfile = {
  // ── Profile page ──
  backToDashboard: "Volver al Dashboard",
  profileNotFound: "Perfil no encontrado. Debes registrarte primero.",
  profileFooter: "© 2026 ProfileManager. Todos los derechos reservados.",

  // ── ProfileForm header ──
  myProfile: "Mi Perfil",
  profileSubtitle: "Actualiza tu información personal y profesional",
  profileCompleteMsg100: "¡Perfecto! Tu perfil está completo 🎉",
  profileCompleteMsg80: "¡Excelente! Tu perfil está casi completo",
  profileCompleteMsg50: "Buen progreso, sigue completando tu perfil",
  profileCompleteMsgLow: "Completa tu perfil para mejorar tus oportunidades",

  // ── CV processing ──
  autocompleteCV: "Autocompleta tu perfil con IA",
  uploadCVDesc: "Sube tu CV en PDF, Word o texto y extraeremos la información automáticamente",
  cvSuccess: "¡CV procesado exitosamente!",
  reviewCV: "Revisa los datos extraídos y guarda los cambios",
  processing: "Procesando...",
  uploadAnotherCV: "Subir otro CV",
  uploadCV: "Subir CV",
  profilePhoto: "Foto de Perfil",
  photoFormat: "JPG, PNG o GIF. Máx 5MB.",

  // ── Personal Info ──
  personalInfo: "Información Personal",
  firstName: "Nombre",
  lastName: "Apellido",
  birthDate: "Fecha de Nacimiento",
  phone: "Teléfono",
  email: "Correo electrónico",
  desiredRole: "Cargo Deseado",
  description: "Descripción Personal",

  // ── Placeholders ──
  phonePlaceholder: "+57 300 123 4567",
  desiredRolePlaceholder: "Ej: Desarrollador Backend",
  aboutYouPlaceholder: "Cuéntanos sobre ti...",

  // ── Skills ──
  skills: "Habilidades",
  onePerLine: "Escribe una habilidad por línea",

  // ── Education ──
  education: "Educación",
  add: "Agregar",
  degree: "Título / Carrera",
  institution: "Institución",
  year: "Año",
  noEducation: "No hay registros de educación. Agrega uno con el botón +",

  // ── Experience ──
  workExperience: "Experiencia Laboral",
  experience: "Experiencia",
  role: "Cargo",
  company: "Empresa",
  period: "Período",
  responsibilities: "Responsabilidades y logros",
  noExperience: "No hay registros de experiencia. Agrega uno con el botón +",

  // ── Actions ──
  saving: "Guardando...",
  saveChanges: "Guardar Cambios",
  cancel: "Cancelar",

  // ── Toasts ──
  profileUpdatedSuccess: "¡Perfil actualizado con éxito!",
  profileUpdateError: "Error al actualizar el perfil.",
  avatarUploaded: "Foto subida. Guarda los cambios para confirmar.",
  cvProcessedReview: "¡CV procesado! Revisa los datos y guarda los cambios.",
  cvMismatchError: "Este CV parece pertenecer a {firstName} {lastName}, no a tu perfil. Por favor sube tu propio CV.",
  fileTooLarge: "El archivo no debe superar los 15MB",
  unsupportedFormat: "Formato no soportado. Usa PDF, Word (.docx) o texto.",
  analyzingCV: "Analizando tu CV con IA...",
  cvProcessingError: "Error al procesar el CV: {error}",
  unknownError: "Error desconocido",

  // ── Company Profile ──
  backToPanelCompany: "Volver al Panel",
  companyProfileTitle: "Perfil de Empresa",
  companyProfileSubtitle: "Actualiza los datos de tu empresa",
  employeeCountLabel: "Número Aproximado de Empleados",
  corporateEmailLabel: "Correo corporativo",
  coreBusinessPlaceholder: "Describe el giro principal de tu empresa...",
  savingLoading: "Guardando...",
  saveChangesBtn: "Guardar Cambios",
  cancelBtn: "Cancelar",
  companyProfileUpdated: "¡Perfil de empresa actualizado!",
  companyProfileUpdateError: "Error al actualizar el perfil de empresa.",
  employeeCountPlaceholder: "Ej: 50",

  // ── Common Footer ──
  allRightsReserved: "© 2026 ProfileManager. Todos los derechos reservados.",
} as const;
