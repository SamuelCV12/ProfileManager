// lib/i18n/locales/en/register.ts

export const enRegister = {
  // ── Header ──
  createAccount: "Create Account",
  registerDesc: "Fill in the form to register on our portal",
  backToLogin: "Back to login",

  // ── CV Banner ──
  autoFillCV: "Auto-fill with CV (Optional)",
  autoFillCVDesc: "Upload your CV in PDF or Word and AI will fill the form automatically",
  cvProcessed: "CV processed! Review the auto-filled fields",
  cvProcessedDesc: "You can edit any field before creating your account",
  uploadCVButton: "Upload CV (PDF, Word)",
  uploadAnotherCV: "Upload another CV",
  processingCV: "Processing...",

  // ── Profile Photo ──
  profilePhoto: "Profile Photo (Optional)",
  chooseFile: "Choose file",
  changePhoto: "Change photo",
  removePhoto: "Remove",
  photoHint: "JPG, PNG or WEBP · Max 5MB",

  // ── Personal Information ──
  personalInfo: "Personal Information",
  names: "First Names *",
  namesPlaceholder: "E.g: John Carlos",
  surnames: "Last Names *",
  surnamePlaceholder: "E.g: García López",
  birthDate: "Birth Date *",
  personalDescription: "Personal Description (Optional)",
  personalDescriptionPlaceholder: "Write a brief description about yourself",

  // ── Desired Role ──
  desiredRole: "Desired Position *",
  desiredRolePlaceholder: "E.g: Backend Developer",

  // ── Skills ──
  skills: "Skills (Optional)",
  skillsHint: "One per line",
  skillsPlaceholder: "React\nNode.js\nTypeScript",

  // ── Education ──
  education: "Education (Optional)",
  degree: "Degree / Career",
  institution: "Institution",
  year: "Year (E.g: 2019-2023)",
  noEducationEntries: "No entries. Upload your CV or click Add.",
  addEducation: "Add",

  // ── Experience ──
  experience: "Work Experience (Optional)",
  role: "Position",
  company: "Company",
  period: "Period (E.g: 2020-2024)",
  experienceDescription: "Description of responsibilities...",
  noExperienceEntries: "No entries. Upload your CV or click Add.",
  addExperience: "Add",

  // ── Credentials ──
  accessCredentials: "Access Credentials",
  email: "Email address *",
  emailPlaceholder: "your@email.com",
  password: "Password *",
  passwordPlaceholder: "••••••••",

  // ── Buttons ──
  createAccountButton: "Create Account",
  creatingAccount: "Creating account...",

  // ── Footer ──
  alreadyAccount: "Already have an account?",
  loginHere: "Sign in here",
  isCompany: "Are you a company?",
  registerCompany: "Company Registration",

  // ── Errors and Messages ──
  fileTooLarge: "File must not exceed 15MB",
  unsupportedFormat: "Unsupported format. Use PDF, Word (.docx) or text.",
  analyzingCV: "Analyzing your CV with AI...",
  cvProcessedSuccess: "CV processed! Review the data and complete the form.",
  cvProcessError: "Error processing CV",
  accountCreated: "Account created successfully!",
  cvProcessErrorMsg: "Error processing CV: {error}",
  unknownError: "Unknown error",
  allRightsReserved: "© 2026 ProfileManager. All rights reserved.",
} as const;


