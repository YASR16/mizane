export const brand = {
  name: "Mizane",
  domain: "mizane.ma",
  legalName: "Mizane",
  email: "bonjour@mizane.ma",
  privacyEmail: "privacy@mizane.ma",
  tagline:
    "Analysez votre CV avant de l'envoyer. Découvrez ce que les recruteurs et les ATS voient réellement.",
  promise:
    "Votre CV mérite plus qu'un simple avis. Obtenez une analyse professionnelle complète.",
} as const;

export const fileLimits = {
  maxSizeBytes: 5 * 1024 * 1024,
  maxSizeLabel: "5 Mo",
  accepted: ["application/pdf", "application/vnd.openxmlformats-officedocument.wordprocessingml.document"],
  extensions: [".pdf", ".docx"] as const,
};

export const retentionDays = Number(process.env.CV_RETENTION_DAYS ?? 30);
