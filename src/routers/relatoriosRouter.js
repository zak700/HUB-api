import { Router } from "express";

import controllerRreo1 from "../controllers/relatorios/rreos/controller.anexo1.js";
import controllerRreo2 from "../controllers/relatorios/rreos/controller.anexo2.js";
import controllerRreo3 from "../controllers/relatorios/rreos/controller.anexo3.js";
import controllerRreo4 from "../controllers/relatorios/rreos/controller.anexo4.js";
import controllerRreo6 from "../controllers/relatorios/rreos/controller.anexo6.js";
import controllerRreo7 from "../controllers/relatorios/rreos/controller.anexo7.js";
import controllerRreo8 from "../controllers/relatorios/rreos/controller.anexo8.js";
import controllerRreo9 from "../controllers/relatorios/rreos/controller.anexo9.js";
import controllerRreo10 from "../controllers/relatorios/rreos/controller.anexo10.js";
import controllerRreo11 from "../controllers/relatorios/rreos/controller.anexo11.js";
import controllerRreo12 from "../controllers/relatorios/rreos/controller.anexo12.js";
import controllerRreo13 from "../controllers/relatorios/rreos/controller.anexo13.js";
import controllerRreo14 from "../controllers/relatorios/rreos/controller.anexo14.js";
import validateToken from "../middlewares/validateToken.js";
import controllerRgf1 from "../controllers/relatorios/RGF/controller.anexo1.js";
import controllerRgf2 from "../controllers/relatorios/RGF/controller.anexo2.js";
import controllerRgf3 from "../controllers/relatorios/RGF/controller.anexo3.js";
import controllerRgf4 from "../controllers/relatorios/RGF/controller.anexo4.js";
import controllerRgf5 from "../controllers/relatorios/RGF/controller.anexo5.js";
import controllerRgf6 from "../controllers/relatorios/RGF/controller.anexo6.js";
import controllerSlide1 from "../controllers/relatorios/Slide/controller.slide1.js";
import balanceteContabil from "../controllers/balanceteContabil/balanceteContabil.js";
import controllerCandidatos from "../controllers/controller.candidatos.js";
import matrizContabil from "../controllers/balanceteContabil/matrizContabil.js";
import multer from "multer"
const routerRelatorios = Router();
// config multer
const upload = multer({ storage: multer.memoryStorage() });

// ------------------------------------------------------ RREO

routerRelatorios.post(
  "/cadastrar-candidato",
  validateToken.authenticateToken, // get multer multiple files
  upload.any(),
  controllerCandidatos.cadastrarCandidato
)

routerRelatorios.get(
  "/candidatos/show-all",
  validateToken.authenticateToken,
  validateToken.onlyAdmins,
  controllerCandidatos.fetchCandidatos
)

routerRelatorios.post(
  "/matriz-contabil",
  validateToken.authenticateToken,
  matrizContabil
)

routerRelatorios.get(
  "/balanceteContabil/:date/:codOrgao/:lancamento",
  validateToken.authenticateToken,
  balanceteContabil
)

routerRelatorios.get(
  "/rreo/anexo/1",
  validateToken.authenticateToken,
  controllerRreo1.getRreoAnexo,
  
);

routerRelatorios.get(
  "/rreo/anexo/2",
  validateToken.authenticateToken,
  controllerRreo2.getRreoAnexo
);

routerRelatorios.get(
  "/rreo/anexo/3",
  validateToken.authenticateToken,
  controllerRreo3.getRreoAnexo
);

routerRelatorios.get(
  "/rreo/anexo/4",
  validateToken.authenticateToken,
  controllerRreo4.getRreoAnexo
);

routerRelatorios.get(
  "/rreo/anexo/6",
  validateToken.authenticateToken,
  controllerRreo6.getRreoAnexo
);

routerRelatorios.get(
  "/rreo/anexo/7",
  validateToken.authenticateToken,
  controllerRreo7.getRreoAnexo
);

routerRelatorios.get(
  "/rreo/anexo/8",
  validateToken.authenticateToken,
  controllerRreo8.getRreoAnexo
);

routerRelatorios.get(
  "/rreo/anexo/9",
  validateToken.authenticateToken,
  controllerRreo9.getRreoAnexo
);

routerRelatorios.get(
  "/rreo/anexo/10",
  validateToken.authenticateToken,
  controllerRreo10.getRreoAnexo
);

routerRelatorios.get(
  "/rreo/anexo/11",
  validateToken.authenticateToken,
  controllerRreo11.getRreoAnexo
);

routerRelatorios.get(
  "/rreo/anexo/12",
  validateToken.authenticateToken,
  controllerRreo12.getRreoAnexo
);

routerRelatorios.get(
  "/rreo/anexo/13",
  validateToken.authenticateToken,
  controllerRreo13.getRreoAnexo
);

routerRelatorios.get(
  "/rreo/anexo/14",
  validateToken.authenticateToken,
  controllerRreo14.getRreoAnexo
);

// ------------------------------------------------------ RGF

routerRelatorios.get(
  "/rgf/anexo/1",
  validateToken.authenticateToken,
  controllerRgf1.getRGFAnexo
);

routerRelatorios.get(
  "/rgf/anexo/2",
  validateToken.authenticateToken,
  controllerRgf2.getRGFAnexo
);

routerRelatorios.get(
  "/rgf/anexo/3",
  validateToken.authenticateToken,
  controllerRgf3.getRGFAnexo
);

routerRelatorios.get(
  "/rgf/anexo/4",
  validateToken.authenticateToken,
  controllerRgf4.getRGFAnexo
);

routerRelatorios.get(
  "/rgf/anexo/5",
  validateToken.authenticateToken,
  controllerRgf5.getRGFAnexo
);

routerRelatorios.get(
  "/rgf/anexo/6",
  validateToken.authenticateToken,
  controllerRgf6.getRGFAnexo
);

routerRelatorios.get(
  "/slide/slide/1",
  validateToken.authenticateToken,
  controllerSlide1.getSlide1
);

export default routerRelatorios;
