// Expresiones regulares para validar datos de entrada
// Permite letras (a-z, A-Z), vocales con acentos (á, é, í, ó, ú), ñ, Ñ y espacios
export const name_regex = /^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$/;

// Expresión regular para validar formato de email
export const email_regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

// Debe tener al menos 8 caracteres, una letra minúscula, una mayúscula y un número
export const password_regex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}$

// CURP: Formato CURP válido (12 letras, 6 números, 1 letra y 2 números al final)
export const curp_regex = /^[A-Z]{4}\d{6}[HM][A-Z]{6}\d{2}$/;

export const patron_curp = /^[A-Z]{1}[AEIOU]{1}[A-Z]{2}\d{2}(0[1-9]|1[0-2])(0[1-9]|[12][0-9]|3[01])[HM]{1}(AS|BC|BS|CC|CL|CM|CS|CH|DF|DG|GT|GR|HG|JC|MC|MN|MS|NT|NL|OC|PL|QT|QR|SP|SL|SR|TC|TS|TL|VZ|YN|ZS|NE)[B-DF-HJ-NP-TV-Z]{3}[A-Z\d]{1}[A-Z\d]{1}$/;
