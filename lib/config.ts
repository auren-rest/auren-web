/** Site-wide constants. Public env vars override defaults at build time. */
export const AUREN_URL = (process.env.NEXT_PUBLIC_AUREN_URL ?? "https://www.auren.rest").replace(/\/$/, "");
export const ZENT_URL = (process.env.NEXT_PUBLIC_ZENT_URL ?? "https://zent.auren.rest").replace(/\/$/, "");

/** Address shown to visitors. */
export const CONTACT_EMAIL = process.env.NEXT_PUBLIC_CONTACT_EMAIL ?? "auren.rest@gmail.com";
/** Where mailto: links actually deliver. */
export const CONTACT_MAILTO = CONTACT_EMAIL;
