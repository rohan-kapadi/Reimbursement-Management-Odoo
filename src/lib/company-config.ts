export const DEFAULT_COUNTRY = "US"

export const COUNTRY_OPTIONS = [
  { code: "US", label: "United States", currency: "USD" },
  { code: "IN", label: "India", currency: "INR" },
  { code: "GB", label: "United Kingdom", currency: "GBP" },
  { code: "DE", label: "Germany", currency: "EUR" },
  { code: "FR", label: "France", currency: "EUR" },
  { code: "CA", label: "Canada", currency: "CAD" },
  { code: "AU", label: "Australia", currency: "AUD" },
  { code: "SG", label: "Singapore", currency: "SGD" },
  { code: "AE", label: "United Arab Emirates", currency: "AED" },
  { code: "JP", label: "Japan", currency: "JPY" },
] as const

export type SupportedCountryCode = (typeof COUNTRY_OPTIONS)[number]["code"]

export function getCompanyConfigByCountry(countryCode: string) {
  return COUNTRY_OPTIONS.find((country) => country.code === countryCode) ?? null
}
