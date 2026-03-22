import jwt from "jsonwebtoken";
import { db } from "../database/postgres.js";
import serviceUsuario from "../services/service.usuario.js";
import tokenHelper from "../helpers/tokens.js";
import transporter from "../utils/nodemailer.js";
import { StatusCodes } from "http-status-codes";
import axios from "axios";
import sharp from "sharp";

const siteLink = "http://localhost:5173/";

const salt = 13;

// ----------------------------------------------------------------------------------
// Function to handle user registration

async function register(req, res) {
  const { nome, email, password, cpf, telefone } = req.body;

  try {
    const result = await serviceUsuario.register(
      nome,
      email,
      password,
      salt,
      cpf,
      telefone
    );

    if (!result.success) {
      console.error(result.message);
      return res.status(400).json({ message: result.message });
    }

    const token = tokenHelper.generateToken(result.user[0].id_usuario);
    const refreshToken = tokenHelper.generateRefreshToken(
      result.user[0].id_usuario
    );

    return res
      .status(201)
      .cookie("refreshToken", refreshToken, {
        httpOnly: true,
        secure: true, // true in production with HTTPS
        sameSite: "None", // Adjust as needed
      })
      .json({ message: result.message, token });
  } catch (error) {
    console.error("Error in register function controller.usuario.js", error);
    return res.status(500).json({ message: "Ocorreu um erro interno no servidor." });
  }
}

// ----------------------------------------------------------------------------------
// Function to handle user login

async function login(req, res) {
  const { email, password } = req.body;

  try {
    const result = await serviceUsuario.login(email, password);

    if (!result.success) {
      console.error(result.message);
      return res.status(400).json({ message: result.message });
    }

    const token = tokenHelper.generateToken(result.id);
    const refreshToken = tokenHelper.generateRefreshToken(result.id);

    // check if account is active
    const dbUser = await db("usuarios").select("id_usuario", "ativo").where({ id_usuario: result.id }).first();
    if (dbUser && dbUser.ativo === false) {
      return res.status(403).json({ message: "Conta inativa." });
    }

    return res
      .status(200)
      .cookie("refreshToken", refreshToken, {
        path: "/",
        httpOnly: true,
        secure: true, // true in production with HTTPS
        sameSite: "None", // Adjust as needed
      })
      .json({ message: result.message, token }); // <-- should come AFTER cookie
  } catch (error) {
    console.error("Error in login function controller.usuario.js", error);
    return res.status(500).json({ message: "Ocorreu um erro interno no servidor." });
  }
}

// ----------------------------------------------------------------------------------
// Function to get user by email

async function getUserByEmail(req, res) {
  const { email } = req.params;

  try {
    const user = await db("usuarios")
      .select(
        "id_usuario",
        "nome",
        "email",
        "telefone",
        "permissoes"
      )
      .where({ email })
      .first();

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    if (user.ativo === false) {
      return res.status(403).json({ message: "Usuário inativo." });
    }

    if (user.ativo === false) {
      return res.status(403).json({ message: "Usuário inativo." });
    }

    if (user.ativo === false) {
      return res.status(403).json({ message: "Usuário inativo." });
    }

    if (user.ativo === false) {
      return res.status(403).json({ message: "Usuário inativo." });
    }

    return res.status(200).json(user);
  } catch (error) {
    console.error(
      "Error in getUserByEmail function controller.usuario.js",
      error
    );
    return res.status(500).json({ message: "Ocorreu um erro interno no servidor." });
  }
}

async function getUserByToken(req, res) {
  const token = req.headers["authorization"]?.split(" ")[1];

  if (!token) {
    return res.status(401).json({ message: "No token provided" });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    const user = await db("usuarios")
      .select("id_usuario", "nome", "email", "cpf", "telefone", "enderecos")
      .where({ id_usuario: decoded.id })
      .first();

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    return res.status(200).json(user);
  } catch (error) {
    console.error("Error in getUserByToken function:", error);

    if (error.name === "TokenExpiredError") {
      return res.status(401).json({ message: "Token has expired" });
    }

    return res.status(403).json({ message: "Invalid token" });
  }
}

async function getUserById(req, res) {
  const { id } = req.params;

  try {
    const user = await db("usuarios")
      .select(
        "id_usuario",
        "nome",
        "email",
        "telefone",
        "permissoes",
        "pfp_image"
      )
      .where({ id_usuario: id })
      .first();

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    return res.status(200).json(user);
  } catch (error) {
    console.error("Error in getUserById function controller.usuario.js", error);
    return res.status(500).json({ message: "Ocorreu um erro interno no servidor." });
  }
}

async function getOwnUserById(req, res) {
  const { id } = req.params;

  try {
    const user = await db("usuarios")
      .select("*")
      .where({ id_usuario: id })
      .first();

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    return res.status(200).json(user);
  } catch (error) {
    console.error("Error in getUserById function controller.usuario.js", error);
    return res.status(500).json({ message: "Ocorreu um erro interno no servidor." });
  }
}

async function refreshToken(req, res) {
  const refreshToken = req.cookies?.refreshToken;

  if (!refreshToken) {
    return res.status(401).json({ message: "No refresh token provided" });
  }

  try {
    const decoded = tokenHelper.verifyRefreshToken(refreshToken);

    if (!decoded) {
      return res.status(403).json({ message: "Invalid refresh token" });
    }

    const newToken = tokenHelper.generateToken(decoded.userId);
    const newRefreshToken = tokenHelper.generateRefreshToken(decoded.userId);
    if (res.headersSent) return;
    return res
      .status(200)
      .cookie("refreshToken", newRefreshToken, {
        path: "/",
        httpOnly: true,
        secure: true, // true in production with HTTPS
        sameSite: "None", // Adjust as needed
      })
      .json({
        message: "Token refreshed successfully",
        token: newToken,
      });
  } catch (error) {
    console.error("Error verifying refresh token:", error);
    if (res.headersSent) return;
    return res.status(403).json({ message: "Invalid refresh token" });
  }
}

async function updateUser(req, res) {
  const { id } = req.params;

  const { nome, email, telefone, cpf } = req.body;

  try {
    // ensure target user is active
    const target = await db("usuarios").select("id_usuario", "ativo").where({ id_usuario: id }).first();
    if (!target) return res.status(404).json({ message: "User not found" });
    if (target.ativo === false) return res.status(403).json({ message: "Usuário inativo." });

    const result = await serviceUsuario.updateUser(
      id,
      nome,
      email,
      telefone,
      cpf
    );

    if (!result.success) {
      console.error(result.message);
      return res.status(400).json({ message: result.message });
    }

    return res.status(200).json({ message: result.message });
  } catch (error) {
    console.error("Error in updateUser function controller.usuario.js", error);
    return res.status(500).json({ message: "Ocorreu um erro interno no servidor." });
  }
}

async function uploadImage(req, res) {
  const { id } = req.params;
  const image = req.file;

  if (!image) {
    return res.status(400).json({ message: "No image provided" });
  }

  try {
    const target = await db("usuarios").select("id_usuario", "ativo").where({ id_usuario: id }).first();
    if (!target) return res.status(404).json({ message: "User not found" });
    if (target.ativo === false) return res.status(403).json({ message: "Usuário inativo." });

    // turn image to 420px / 420px max
    const resizedImageBuffer = await sharp(image.buffer)
      .resize(420, 420, { fit: 'cover' })
      .toBuffer();
    const result = await serviceUsuario.uploadImage(id, resizedImageBuffer);

    if (!result.success) {
      console.error(result.message);
      return res.status(400).json({ message: result.message });
    }

    return res.status(200).json({ message: result.message });
  } catch (error) {
    console.error("Error in uploadImage function controller.usuario.js", error);
    return res.status(500).json({ message: "Ocorreu um erro interno no servidor." });
  }
}

async function logout(req, res) {
  try {
    res.clearCookie("refreshToken", {
      httpOnly: true,
      secure: true, // true in production with HTTPS
      sameSite: "None", // Adjust as needed
    });
    return res.status(200).json({ message: "Logged out successfully" });
  } catch (error) {
    console.error("Error in logout function controller.usuario.js", error);
    return res.status(500).json({ message: "Ocorreu um erro interno no servidor." });
  }
}

async function getAllUsers(req, res) {
  try {
    // Return only active users by default
    const response = await db("usuarios").select("*").where({ ativo: true });
    res.status(200).json(response);
  } catch (error) {
    console.error("Error in getAllUsers function controller.usuario.js", error);
    return res.status(500).json({ message: "Ocorreu um erro interno no servidor." });
  }
}

async function logUser(req, res) {
  try {
    const { id, adminId, permiting } = req.body;

    if (permiting) {
      const user = await db("usuarios").select("id_usuario", "ativo").where({ id_usuario: id }).first();
      const admin = await db("usuarios").select("id_usuario", "permissoes").where({ id_usuario: adminId }).first();

      if (!user)
        return res
          .status(StatusCodes.NOT_FOUND)
          .json({ message: "usuário não encontrado ou inexistente." });
      if (!admin || !(admin.permissoes.includes("admin")))
        return res.status(StatusCodes.NOT_FOUND).json({
          message: "Administrador não encontrado/verificado ou inexistente.",
        });

      await db("usuarios")
        .update({ permissoes: ["user"], perm_by: adminId, ativo: true })
        .where({ id_usuario: id });
    } else {
      const user = await db("usuarios").select("id_usuario", "email").where({ id_usuario: id }).first();
      const admin = await db("usuarios").select("id_usuario", "permissoes").where({ id_usuario: adminId }).first();

      if (!admin || !(admin.permissoes.includes("admin")))
        return res.status(StatusCodes.NOT_FOUND).json({
          message: "Administrador não encontrado/verificado ou inexistente.",
        });

      // Soft-disable the user instead of deleting
      await db("usuarios").update({ ativo: false, perm_by: adminId }).where({ id_usuario: id });

      const mailOptions = {
        from: process.env.SENDER_EMAIL,
        to: user.email,
        subject: "Aviso: Conta Desativada",
        text: "Sua conta foi desativada por não atender aos critérios de permissão.",
        html: `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; border: 1px solid #ddd; border-radius: 8px; padding: 20px; background-color: #fafafa;">
      <h2 style="color: #d9534f; text-align: center;">⚠️ Conta Desativada</h2>
      <p style="font-size: 16px; color: #333;">
        Prezado usuário,
      </p>
      <p style="font-size: 15px; color: #555; line-height: 1.5;">
        Informamos que sua conta foi <strong>desativada</strong> do sistema, 
        pois não atendeu aos critérios de <strong>permissão de acesso</strong>.
      </p>
      <p style="font-size: 15px; color: #555; line-height: 1.5;">
        Caso acredite que se trata de um engano, recomendamos entrar em contato 
        com a administração para mais esclarecimentos.
      </p>
      <p>admin id: ${admin.id_usuario}</p>
      <hr style="margin: 20px 0;">
      <p style="font-size: 13px; color: #999; text-align: center;">
        Esta é uma mensagem automática. Por favor, não responda este e-mail.
      </p>
    </div>
  `,
      };

      transporter.sendMail(mailOptions, (error, info) => {
        if (error) {
          return console.log("Error occurred: ", error);
        }
        // console.log("Email sent: " + info.response);
      });
    }

    return res.status(StatusCodes.OK).json({ message: "tudo certo" });
  } catch (error) {
    console.error(
      "Error in sendLoggedInMessage function controller.usuario.js",
      error
    );
    return res.status(500).json({ message: "Ocorreu um erro interno no servidor." });
  }
}

async function updateLocation(req, res) {
  const { id } = req.params;
  const { estado, cidade, cep } = req.body;

  try {
    const target = await db("usuarios").select("id_usuario", "ativo").where({ id_usuario: id }).first();
    if (!target) return res.status(404).json({ message: "User not found" });
    if (target.ativo === false) return res.status(403).json({ message: "Usuário inativo." });

    await db("usuarios").update({ enderecos: { estado, cidade, cep } }).where({ id_usuario: id })
    return res.status(200).json({ message: "ok" })
  } catch (error) {
    console.error(
      "Error in updateLocation function controller.usuario.js",
      error
    );
    return res.status(500).json({ message: "Ocorreu um erro interno no servidor." });
  }
}

export default {
  register,
  login,
  getUserByEmail,
  getUserByToken,
  getOwnUserById,
  getUserById,
  refreshToken,
  updateUser,
  uploadImage,
  logout,
  getAllUsers,
  logUser,
  updateLocation,
};
