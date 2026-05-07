// lib/i18n/locales/es/register.ts

export const esRegister = {
  // ── Encabezado ──
  createAccount: "Crear Cuenta",
  registerDesc: "Completa el formulario para registrarte en nuestro portal",
  backToLogin: "Volver al login",

  // ── CV Banner ──
  autoFillCV: "Autocompletar con CV (Opcional)",
  autoFillCVDesc: "Sube tu CV en PDF o Word y la IA completará el formulario automáticamente",
  cvProcessed: "¡CV procesado! Revisa los campos autocompletados",
  cvProcessedDesc: "Puedes editar cualquier campo antes de crear tu cuenta",
  uploadCVButton: "Subir CV (PDF, Word)",
  uploadAnotherCV: "Subir otro CV",
  processingCV: "Procesando...",

  // ── Foto de Perfil ──
  profilePhoto: "Foto de Perfil (Opcional)",
  chooseFile: "Elegir archivo",
  changePhoto: "Cambiar foto",
  removePhoto: "Eliminar",
  photoHint: "JPG, PNG o WEBP · Máx 5MB",

  // ── Información Personal ──
  personalInfo: "Información Personal",
  names: "Nombres",
  namesPlaceholder: "Ej: Juan Carlos",
  surnames: "Apellidos",
  surnamePlaceholder: "Ej: García López",
  birthDate: "Fecha de Nacimiento *",
  personalDescription: "Descripción Personal (Opcional)",
  personalDescriptionPlaceholder: "Escribe una breve descripción de ti mismo",

  // ── Cargo Deseado ──
  desiredRole: "Cargo Deseado",
  desiredRolePlaceholder: "Ej: Desarrollador Backend",

  // ── Habilidades ──
  skills: "Habilidades (Opcional)",
  skillsHint: "Una por línea",
  skillsPlaceholder: "React\nNode.js\nTypeScript",

  // ── Educación ──
  education: "Educación (Opcional)",
  degree: "Título / Carrera",
  institution: "Institución",
  year: "Año (Ej: 2019-2023)",
  noEducationEntries: "No hay entradas. Sube tu CV o haz clic en Agregar.",
  addEducation: "Agregar",

  // ── Experiencia ──
  experience: "Experiencia Laboral (Opcional)",
  role: "Cargo",
  company: "Empresa",
  period: "Período (Ej: 2020-2024)",
  experienceDescription: "Descripción de responsabilidades...",
  noExperienceEntries: "No hay entradas. Sube tu CV o haz clic en Agregar.",
  addExperience: "Agregar",

  // ── Credenciales ──
  accessCredentials: "Credenciales de Acceso",
  email: "Correo electrónico",
  emailPlaceholder: "tu@email.com",
  password: "Contraseña *",
  passwordPlaceholder: "••••••••",

  // ── Botones ──
  createAccountButton: "Crear Cuenta",
  creatingAccount: "Creando cuenta...",

  // ── Pie de página ──
  alreadyAccount: "¿Ya tienes una cuenta?",
  loginHere: "Inicia sesión aquí",
  isCompany: "¿Eres una empresa?",
  registerCompany: "Registrar Empresa",

  // ── Errores y mensajes ──
  fileTooLarge: "El archivo no debe superar los 15MB",
  unsupportedFormat: "Formato no soportado. Usa PDF, Word (.docx) o texto.",
  analyzingCV: "Analizando tu CV con IA...",
  cvProcessedSuccess: "¡CV procesado! Revisa los datos y completa el formulario.",
  cvProcessError: "Error al procesar el CV",
  accountCreated: "¡Cuenta creada exitosamente!",
  cvProcessErrorMsg: "Error al procesar el CV: {error}",
  unknownError: "Error desconocido",
  allRightsReserved: "© 2026 ProfileManager. Todos los derechos reservados.",
} as const;



