// Expresiones regulares para validar datos de entrada
// Permite letras (a-z, A-Z), vocales con acentos (á, é, í, ó, ú), ñ, Ñ y espacios
export const name_regex = /^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$/;

// Expresión regular para validar formato de email
export const email_regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

// Debe tener al menos 8 caracteres, una letra minúscula, una mayúscula y un número
export const password_regex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[a-zA-Z\d@$!%*?&]{8,}$/;

// CURP: Formato CURP válido (12 letras, 6 números, 1 letra y 2 números al final)
export const curp_regex = /^[A-Z]{4}\d{6}[HM][A-Z]{5}\d{2}$/;