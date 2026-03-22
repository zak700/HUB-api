import { body } from "express-validator";

// Validação para registro de usuário
const validateUsuarioRegistration = [
  body("nome")
    .trim()
    .notEmpty()
    .withMessage("Nome é obrigatório")
    .isLength({ min: 3 })
    .withMessage("Nome deve ter no mínimo 3 caracteres")
    .matches(/^[a-zA-Z\s]+$/)
    .withMessage("Nome deve conter apenas letras e espaços"),

  body("email")
    .trim()
    .notEmpty()
    .withMessage("Email é obrigatório")
    .isEmail()
    .withMessage("Email inválido. Por favor, insira um email válido.")
    .normalizeEmail(),

  body("password")
    .trim()
    .notEmpty()
    .withMessage("Senha é obrigatória")
    .isLength({ min: 6 })
    .withMessage("Senha deve ter no mínimo 6 caracteres")
    .matches(/^(?=.*\d)(?=.*[a-z])(?=.*[A-Z])(?=.*[^a-zA-Z0-9])/)
    .withMessage(
      "Senha deve conter pelo menos uma letra maiúscula, uma minúscula, um número e um caractere especial."
    ),
];

// Validação para login
const validateLogin = [
  body("email")
    .trim()
    .notEmpty()
    .withMessage("Email é obrigatório")
    .isEmail()
    .withMessage("Email inválido. Por favor, insira um email válido.")
    .normalizeEmail(),

  body("password")
    .trim()
    .notEmpty()
    .withMessage("Senha é obrigatória")
    .isLength({ min: 6 })
    .withMessage(
      "Senha inválida. Certifique-se de que sua senha tem pelo menos 6 caracteres."
    ),
];

export { validateUsuarioRegistration, validateLogin };
