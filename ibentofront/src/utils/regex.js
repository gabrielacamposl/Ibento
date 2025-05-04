// Expresiones regulares para validar datos de entrada

// Nombre y Apellido: Solo letras (mayúsculas y minúsculas) y longitud de 1 a 50 caracteres
export const name_regex = /^[a-zA-Z]{3,50}$/;
// Email: Formato de correo electrónico válido
export const email_regex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
// Password: Al menos 8 caracteres, al menos una letra mayúscula, una letra minúscula y un número
export const password_regex = /^(?=.[a-z])(?=.[A-Z])(?=.\d)[A-Za-z\d@$!%?&]{8,}$/;
// CURP: Formato CURP válido (12 letras, 6 números, 1 letra y 2 números al final)
export const curp_regex = /^[A-Z]{4}\d{6}[HM][A-Z]{5}\d{2}$/;