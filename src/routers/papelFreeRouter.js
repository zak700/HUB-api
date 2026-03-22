import { Router } from "express";
import papel_controllerUsuario from "../controllers/papelFree/controller.usuario.js";
import controllerNotifications from "../controllers/papelFree/controller.notifications.js";

const papelFreeRouter = Router();

papelFreeRouter.get(
  "/papelfree/checkUser/:id",
  papel_controllerUsuario.checkPapelFree
);

papelFreeRouter.post(
  "/papelfree/requestAccess",
  controllerNotifications.accessRequest
);

papelFreeRouter.put(
  "/papelfree/connectEntity",
  papel_controllerUsuario.connect
)

export default papelFreeRouter;
