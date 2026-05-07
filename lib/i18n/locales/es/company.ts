// lib/i18n/locales/es/company.ts

export const esCompany = {
  // ── Encabezado ──
  registerCompany: "Registrar Empresa",
  companyRegisterDesc: "Completa el formulario para registrar tu empresa",
  backToLogin: "Volver al login",

  // ── Información de la Empresa ──
  companyInfo: "Información de la Empresa",
  companyName: "Nombre de la Empresa",
  companyNamePlaceholder: "Tech Solutions Colombia S.A.S",
  nit: "NIT ",
  nitPlaceholder: "900123456-7",
  locationLabel: "Ubicación",
  locationPlaceholder: "Bogotá, Colombia",
  coreBusiness: "Giro Principal (Core Business)",
  coreBusinessPlaceholder: "Describe el giro principal de tu empresa (ej: Desarrollo de software, Consultoría tecnológica, etc.)",
  employeeCount: "Cantidad de Empleados",
  employeeCountPlaceholder: "50",

  // ── Cargos Disponibles ──
  availablePositions: "Cargos Disponibles (Opcional)",
  positionsDesc: "Puedes agregar y modificar cargos más adelante",
  addPosition: "Agregar Cargo",
  newVacancy: "Nueva Vacante",
  positionTitle: "Título de la Vacante",
  positionTitlePlaceholder: "Ej: Desarrollador Backend Senior",
  positionInfo: "Información del Cargo / Requisitos",
  positionInfoPlaceholder: "Información adicional...",
  salary: "Salario ofrecido (COP)",
  salaryPlaceholder: "Ej: 8000000",
  cancel: "Cancelar",
  savePosition: "Guardar Cargo",

  // ── Credenciales ──
  accessCredentials: "Credenciales de Acceso",
  corporateEmail: "Correo electrónico corporativo",
  corporateEmailPlaceholder: "rrhh@empresa.com",
  password: "Contraseña",
  passwordPlaceholder: "••••••••",

  // ── Botones ──
  registerButton: "Registrar Empresa",
  processingButton: "Procesando...",

  // ── Enlaces ──
  alreadyAccount: "¿Ya tienes una cuenta?",
  loginHere: "Inicia sesión aquí",
  areYouCandidate: "¿Eres un solicitante?",
  individualRegistration: "Registro individual",

  // ── Mensajes ──
  companyRegistered: "¡Empresa registrada exitosamente!",
  serverError: "Ocurrió un error al conectar con el servidor.",
  allRightsReserved: "© 2026 ProfileManager. Todos los derechos reservados.",
} as const;
