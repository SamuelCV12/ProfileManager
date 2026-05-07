// lib/i18n/locales/en/company.ts

export const enCompany = {
  // ── Header ──
  registerCompany: "Register Company",
  companyRegisterDesc: "Fill in the form to register your company",
  backToLogin: "Back to login",

  // ── Company Information ──
  companyInfo: "Company Information",
  companyName: "Company Name *",
  companyNamePlaceholder: "Tech Solutions Colombia S.A.S",
  nit: "NIT",
  nitPlaceholder: "900123456-7",
  locationLabel: "Location *",
  locationPlaceholder: "Bogotá, Colombia",
  coreBusiness: "Core Business",
  coreBusinessPlaceholder: "Describe your company's main line of business (e.g: Software Development, Technology Consulting, etc.)",
  employeeCount: "Number of Employees *",
  employeeCountPlaceholder: "50",

  // ── Available Positions ──
  availablePositions: "Available Positions (Optional)",
  positionsDesc: "You can add and modify positions later",
  addPosition: "Add Position",
  newVacancy: "New Vacancy",
  positionTitle: "Position Title *",
  positionTitlePlaceholder: "E.g: Senior Backend Developer",
  positionInfo: "Position Information / Requirements",
  positionInfoPlaceholder: "Additional information...",
  salary: "Offered Salary (COP)",
  salaryPlaceholder: "E.g: 8000000",
  cancel: "Cancel",
  savePosition: "Save Position",

  // ── Credentials ──
  accessCredentials: "Access Credentials",
  corporateEmail: "Corporate Email *",
  corporateEmailPlaceholder: "hr@company.com",
  password: "Password *",
  passwordPlaceholder: "••••••••",

  // ── Buttons ──
  registerButton: "Register Company",
  processingButton: "Processing...",

  // ── Links ──
  alreadyAccount: "Already have an account?",
  loginHere: "Sign in here",
  areYouCandidate: "Are you a candidate?",
  individualRegistration: "Individual registration",

  // ── Messages ──
  companyRegistered: "Company registered successfully!",
  serverError: "An error occurred while connecting to the server.",
  allRightsReserved: "© 2026 ProfileManager. All rights reserved.",
} as const;
