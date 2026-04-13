import { Router } from "express";
import multer from "multer";
import controllerUsuario from "../controllers/controller.usuario.js";
import validateToken from "../middlewares/validateToken.js";

const storage = multer.memoryStorage(); // Store file in memory
const upload = multer({
  storage: storage,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10 MB limit
});

const usersRouter = Router();

usersRouter.get("/usuarios/email/:email", controllerUsuario.getUserByEmail);

usersRouter.get(
  "/usuarios/id/:id",
  controllerUsuario.getUserById
);

usersRouter.get(
  "/usuarios/own/id",
  controllerUsuario.getOwnUserById,
);

usersRouter.get(
  "/usuarios/token",
  validateToken.authenticateToken,
  controllerUsuario.getUserByToken
);

usersRouter.get(
  "/usuarios",
  validateToken.authenticateToken,
  controllerUsuario.getAllUsers
);

usersRouter.post("/usuarios/register", controllerUsuario.register);

usersRouter.post("/usuarios/login", controllerUsuario.login);

usersRouter.post(
  "/usuarios/upload/image/:id",
  validateToken.authenticateToken,
  upload.single("image"),
  controllerUsuario.uploadImage
);

usersRouter.post(
  "/usuarios/refreshToken",
  validateToken.authenticateToken,
  controllerUsuario.refreshToken
);

usersRouter.put(
  "/usuarios/change-sch-location",
  validateToken.authenticateToken,
  validateToken.onlyAdmins,
  controllerUsuario.changeSchLocation
)

usersRouter.get(
  "/has/schema",
  controllerUsuario.hasSchemaForUser
)

usersRouter.post(
  "/usuarios/logout",
  validateToken.authenticateToken,
  controllerUsuario.logout
);

usersRouter.post(
  "/usuarios/autorizarAcesso",
  validateToken.onlyAdmins,
  controllerUsuario.logUser
);

usersRouter.put(
  "/usuarios/update/:id",
  validateToken.normalUserPermLimiter,
  validateToken.normalUserPerm,
  controllerUsuario.updateUser
);

usersRouter.put(
  "/usuarios/update/location",
  validateToken.authenticateToken,
  controllerUsuario.updateLocation
);

export default usersRouter