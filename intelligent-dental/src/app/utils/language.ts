export type PublicLanguage = "TH" | "EN";

export type ApiLanguage = "th" | "en";

export const toApiLanguage = (language: PublicLanguage): ApiLanguage =>
  language === "EN" ? "en" : "th";
