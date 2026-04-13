import bcrypt from "bcrypt";
import { db } from "../database/postgres.js";

async function register({ nome, email, password, salt, cpf, telefone, endereco }) {
  try {
    cpf = cpf.replaceAll("-", "").replaceAll(".", "");
    const existingCpf = await db("usuarios").where({ cpf }).first();
    const existingUser = await db("usuarios").where({ email }).first();
    if (existingUser) {
      return { success: false, message: "Já existe uma conta com o email especificado." };
    }
    if (existingCpf) {
      return { success: false, message: "Já existe uma conta com o CPF especificado." };
    }

    const hashedPassword = await bcrypt.hash(password, salt);

    const user = await db("usuarios")
      .insert({
        nome,
        email,
        password: hashedPassword,
        cpf,
        telefone,
        permissoes: ["admin"],
        enderecos: endereco,
      })
      .returning("id_usuario");

    return { success: true, message: "User registered successfully", user };
  } catch (error) {
    console.error("error from register at service.usuario.js", error);
    return { success: false, message: "Internal server error" };
  }
}

async function login(email, password, salt) {
  try {
    const user = email.includes("@")
      ? await db("usuarios").where({ email }).first().returning("*")
      : await db("usuarios").where({ cpf: email }).first().returning("*");
    if (!user) {
      return { success: false, message: "Invalid email or password" };
    }
    const isPasswordValid = await bcrypt.compare(password, user.password);

    if (!isPasswordValid) {
      return { success: false, message: "Invalid email or password" };
    }

    return {
      success: true,
      message: "User found",
      id: user.id_usuario,
      nome: user.nome,
      email: user.email,
      pfp_image: user.pfp_image,
      cpf: user.cpf,
      telefone: user.telefone,
      enderecos: user.enderecos,
    };
  } catch (error) {
    console.error("error from login at service.usuario.js", error);
    return { success: false, message: "Internal server error" };
  }
}

async function updateUser(id, nome, email, telefone, cpf) {
  try {
    const user = await db("usuarios").where({ id_usuario: id }).first();
    if (!user) {
      return { success: false, message: "User not found" };
    }

    const existingEmail = await db("usuarios")
      .where({ email })
      .andWhereNot({ id_usuario: id })
      .first();
    if (existingEmail) {
      return { success: false, message: "Email already registered" };
    }

    const existingCpf = await db("usuarios")
      .where({ cpf })
      .andWhereNot({ id_usuario: id })
      .first();
    if (existingCpf) {
      return { success: false, message: "CPF already registered" };
    }
    const existingTelefone = await db("usuarios")
      .where({ telefone })
      .andWhereNot({ id_usuario: id })
      .first();
    if (existingTelefone) {
      return { success: false, message: "Telefone already registered" };
    }
    if (nome.length > 50) {
      return { success: false, message: "Name too long" };
    }

    const updatedUser = await db("usuarios")
      .where({ id_usuario: id })
      .update({ nome, email, telefone, cpf });

    return {
      success: true,
      message: "User updated successfully",
      user: updatedUser,
    };
  } catch (error) {
    console.error("error from updateUser at service.usuario.js", error);
    return { success: false, message: "Internal server error" };
  }
}

async function uploadImage(id, image) {
  try {
    const user = await db("usuarios").where({ id_usuario: id }).first();
    if (!user) {
      return { success: false, message: "User not found" };
    }

    const updatedUser = await db("usuarios")
      .where({ id_usuario: id })
      .update({ pfp_image: image });

    return {
      success: true,
      message: "Image uploaded successfully",
      user: updatedUser,
    };
  } catch (error) {
    console.error("error from uploadImage at service.usuario.js", error);
    return { success: false, message: "Internal server error" };
  }
}

export default { register, login, updateUser, uploadImage };
