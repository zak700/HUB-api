

function isValidEmail(email) {
    // Expressão regular para validar email
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(email);
}

function isValidPassword(password) {
    // Verificar comprimento da senha (8 a 50 caracteres)
    return password && password.length >= 8 && password.length <= 50;

}

export default { isValidEmail, isValidPassword };
