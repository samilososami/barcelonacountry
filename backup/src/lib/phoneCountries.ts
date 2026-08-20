export type PhoneCountry = {
  name: string;
  dial: string;
  iso: string;
};

export const phoneCountries: PhoneCountry[] = [
  { name: "España", dial: "+34", iso: "ES" },
  { name: "Alemania", dial: "+49", iso: "DE" },
  { name: "Andorra", dial: "+376", iso: "AD" },
  { name: "Argentina", dial: "+54", iso: "AR" },
  { name: "Bélgica", dial: "+32", iso: "BE" },
  { name: "Brasil", dial: "+55", iso: "BR" },
  { name: "Canadá", dial: "+1", iso: "CA" },
  { name: "Chile", dial: "+56", iso: "CL" },
  { name: "Colombia", dial: "+57", iso: "CO" },
  { name: "Estados Unidos", dial: "+1", iso: "US" },
  { name: "Francia", dial: "+33", iso: "FR" },
  { name: "Irlanda", dial: "+353", iso: "IE" },
  { name: "Italia", dial: "+39", iso: "IT" },
  { name: "México", dial: "+52", iso: "MX" },
  { name: "Países Bajos", dial: "+31", iso: "NL" },
  { name: "Portugal", dial: "+351", iso: "PT" },
  { name: "Reino Unido", dial: "+44", iso: "GB" },
  { name: "Suiza", dial: "+41", iso: "CH" },
  { name: "Uruguay", dial: "+598", iso: "UY" }
];

const countriesByIso = new Map(phoneCountries.map((country) => [country.iso, country]));
const countriesByDial = [...phoneCountries]
  .filter((country) => country.iso !== "CA")
  .sort((left, right) => right.dial.length - left.dial.length);

const normalizePhone = (phone: string) => phone.trim().replace(/[\s().-]/g, "");

export const getPhoneCountry = (phone: string, countryIso?: string | null) => {
  const savedCountry = countryIso ? countriesByIso.get(countryIso.toUpperCase()) : undefined;
  if (savedCountry) return savedCountry;

  const normalizedPhone = normalizePhone(phone);
  return countriesByDial.find((country) => normalizedPhone.startsWith(country.dial));
};

export const countryFlag = (iso: string) =>
  String.fromCodePoint(...iso.toUpperCase().split("").map((letter) => 127397 + letter.charCodeAt(0)));

export const phoneDisplayParts = (phone: string, countryIso?: string | null) => {
  const country = getPhoneCountry(phone, countryIso);
  if (!country) return { country: undefined, prefix: "", rest: phone.trim() };

  const trimmedPhone = phone.trim();
  const normalizedPhone = normalizePhone(trimmedPhone);
  const rest = normalizedPhone.startsWith(country.dial)
    ? trimmedPhone.slice(country.dial.length).trimStart()
    : trimmedPhone;

  return { country, prefix: country.dial, rest };
};
