// lib/i18n/locales/en/profile.ts

export const enProfile = {
  // ── Profile page ──
  backToDashboard: "Back to Dashboard",
  profileNotFound: "Profile not found. You must register first.",
  profileFooter: "© 2026 ProfileManager. All rights reserved.",

  // ── ProfileForm header ──
  myProfile: "My Profile",
  profileSubtitle: "Update your personal and professional information",
  profileCompleteMsg100: "Perfect! Your profile is complete 🎉",
  profileCompleteMsg80: "Excellent! Your profile is almost complete",
  profileCompleteMsg50: "Good progress, keep completing your profile",
  profileCompleteMsgLow: "Complete your profile to improve your opportunities",

  // ── CV processing ──
  autocompleteCV: "Auto-fill your profile with AI",
  uploadCVDesc: "Upload your CV in PDF, Word or text and we'll extract the information automatically",
  cvSuccess: "CV processed successfully!",
  reviewCV: "Review extracted data and save changes",
  processing: "Processing...",
  uploadAnotherCV: "Upload another CV",
  uploadCV: "Upload CV",
  profilePhoto: "Profile Photo",
  photoFormat: "JPG, PNG or GIF. Max 5MB.",

  // ── Personal Info ──
  personalInfo: "Personal Information",
  firstName: "First Name",
  lastName: "Last Name",
  birthDate: "Date of Birth",
  phone: "Phone",
  email: "Email address",
  desiredRole: "Desired Role",
  description: "Personal Description",

  // ── Placeholders ──
  phonePlaceholder: "+1 555 123 4567",
  desiredRolePlaceholder: "E.g: Backend Developer",
  aboutYouPlaceholder: "Tell us about yourself...",

  // ── Skills ──
  skills: "Skills",
  onePerLine: "Write one skill per line",

  // ── Education ──
  education: "Education",
  add: "Add",
  degree: "Degree / Major",
  institution: "Institution",
  year: "Year",
  noEducation: "No education records. Add one with the + button",

  // ── Experience ──
  workExperience: "Work Experience",
  experience: "Experience",
  role: "Role",
  company: "Company",
  period: "Period",
  responsibilities: "Responsibilities and achievements",
  noExperience: "No experience records. Add one with the + button",

  // ── Actions ──
  saving: "Saving...",
  saveChanges: "Save Changes",
  cancel: "Cancel",

  // ── Toasts ──
  profileUpdatedSuccess: "Profile updated successfully!",
  profileUpdateError: "Error updating profile.",
  avatarUploaded: "Photo uploaded. Save changes to confirm.",
  cvProcessedReview: "CV processed! Review the data and save changes.",
  cvMismatchError: "This CV seems to belong to {firstName} {lastName}, not your profile. Please upload your own CV.",
  fileTooLarge: "File must not exceed 15MB",
  unsupportedFormat: "Unsupported format. Use PDF, Word (.docx) or text.",
  analyzingCV: "Analyzing your CV with AI...",
  cvProcessingError: "Error processing CV: {error}",
  unknownError: "Unknown error",

  // ── Company Profile ──
  backToPanelCompany: "Back to Panel",
  companyProfileTitle: "Company Profile",
  companyProfileSubtitle: "Update your company data",
  employeeCountLabel: "Approximate Number of Employees ",
  corporateEmailLabel: "Corporate email",
  coreBusinessPlaceholder: "Describe your company's main activity...",
  savingLoading: "Saving...",
  saveChangesBtn: "Save Changes",
  cancelBtn: "Cancel",
  companyProfileUpdated: "Company profile updated!",
  companyProfileUpdateError: "Error updating company profile.",
  employeeCountPlaceholder: "E.g: 50",

  // ── Common Footer ──
  allRightsReserved: "© 2026 ProfileManager. All rights reserved.",
} as const;
