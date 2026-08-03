import { Router } from "express";
import controllerEntidade from "../controllers/controller.entidade.js";
import { validateRequest } from "../middlewares/security.js";
import { validateUsuarioRegistration } from "../middlewares/validators.js";
import controllerUsuario from "../controllers/controller.usuario.js";
import multer from "multer";
import validateToken from "../middlewares/validateToken.js";
import controllerPost from "../controllers/controller.posts.js";

// Campos de Dados Específicos do Município ---------------------------------------------

import controllerReco from "../controllers/campos/controller.recO.js";
import controllerDspo from "../controllers/campos/controller.dspO.js";
import controllerMassUpload from "../controllers/campos/controller.massUpload.js";
import create_tables from "../controllers/create_tables.js";
import controllerSchemas from "../controllers/controller.schemas.js";
import controllerLayoutMsc from "../controllers/controller.layoutMsc.js";
import controllerCampos from "../controllers/campos/controller.campos.js";
import DCA from "../controllers/balanceteContabil/DCA.js";
import controllerCodPrograma from "../controllers/campos/controller.codPrograma.js";

// --------------------------------------------------
const storage = multer.memoryStorage(); // Store file in memory
const upload = multer({
  storage: storage,
  limits: { fileSize: 200 * 1024 * 1024 }, // 200 MB limit for ZIP packages
});

const routerCampos = Router();

// Rota para a raiz da API


routerCampos.get(
  "/cod-programa",
  validateToken.authenticateToken,
  validateToken.onlyAdmins,
  controllerCodPrograma.getAll
)

routerCampos.get(
  "/dca/:orgao/:dataI/:dataF/:all",
  validateToken.authenticateToken,
  validateToken.onlyAdmins,
  DCA.getDCA
)

routerCampos.post(
  "/cod-programa",
  validateToken.authenticateToken,
  validateToken.onlyAdmins,
  controllerCodPrograma.saveCod
)

routerCampos.put(
  "/cod-programa",
  validateToken.authenticateToken,
  validateToken.onlyAdmins,
  controllerCodPrograma.updateCod
)

routerCampos.delete(
  "/cod-programa/:id",
  validateToken.authenticateToken,
  validateToken.onlyAdmins,
  controllerCodPrograma.deleteCod
)

routerCampos.post(
  "/layout-msc/env-files/:data",
  validateToken.authenticateToken,
  validateToken.onlyAdmins,
  upload.single("file"),
  controllerLayoutMsc.uploadFile
)

routerCampos.get(
  "/layout-msc/get-basic",
  validateToken.authenticateToken,
  validateToken.onlyAdmins,
  controllerLayoutMsc.getSafe
)

routerCampos.get(
  "/layout-msc/get-values",
  validateToken.authenticateToken,
  validateToken.onlyAdmins,
  controllerLayoutMsc.getValues
)

routerCampos.delete(
  "/layout-msc/delete/:data",
  validateToken.authenticateToken,
  validateToken.onlyAdmins,
  controllerLayoutMsc.deleteByData
)

routerCampos.post(
  "/rubrica-save",
  validateToken.authenticateToken,
  validateToken.onlyAdmins,
  controllerEntidade.saveRubrica
);

routerCampos.get("/cidades",
  validateToken.authenticateToken,
  validateToken.normalUserPerm,
  controllerSchemas.getAllSchemas
)

routerCampos.get(
  "/get-campo/:name/:page/:pageSize",
  validateToken.authenticateToken,
  validateToken.onlyAdmins,
  controllerCampos.query.getCampo
);

routerCampos.post(
  "/tipos-orgao/save",
  validateToken.authenticateToken,
  validateToken.onlyAdmins,
  controllerCampos.query.saveTipoOrgaos
)

routerCampos.get(
  "/tipos-orgao",
  validateToken.authenticateToken,
  validateToken.onlyAdmins,
  controllerCampos.query.getAllTipoOrgaos
)

routerCampos.post(
  "/campos/criarAnalize/:name",
  validateToken.authenticateToken,
  validateToken.onlyAdmins,
  controllerCampos.query.criarAnalize
)

routerCampos.get(
  "/campos/criar-tables",
  create_tables.create_default_tables
)

routerCampos.put(
  "/campos/novo-registro/:name",
  validateToken.authenticateToken,
  validateToken.onlyAdmins,
  controllerCampos.query.novo_registro
)

routerCampos.put(
  "/update-campo/:name/:id",
  validateToken.authenticateToken,
  validateToken.onlyAdmins,
  controllerCampos.query.editarRegistro
)

routerCampos.delete(
  "/campo/delete/:name/:id/:subId",
  validateToken.authenticateToken,
  validateToken.onlyAdmins,
  controllerCampos.query.deleteCampo
)

routerCampos.get(
  "/campos/json/:name",
  validateToken.authenticateToken,
  validateToken.onlyAdmins,
  controllerCampos.query.getAsJson
)

routerCampos.delete(
  "/campo/delete/:name/:id/",
  validateToken.authenticateToken,
  validateToken.onlyAdmins,
  controllerCampos.query.deleteCampo
)

routerCampos.put(
  "/campos/enviar/:name",
  validateToken.authenticateToken,
  validateToken.onlyAdmins,
  upload.single("arquivo"),
  controllerCampos.query.enviarJson
)

routerCampos.get(
  "/campos/getAll/:name",
  validateToken.authenticateToken,
  validateToken.onlyAdmins,
  controllerCampos.query.getAllCampos
)

routerCampos.get(
  "/table/:name",
  validateToken.authenticateToken,
  validateToken.onlyAdmins,
  controllerCampos.query.getAllFromTable
)

routerCampos.put(
  "/table/edit/:name",
  validateToken.authenticateToken,
  validateToken.onlyAdmins,
  controllerCampos.query.updateTable
)

routerCampos.delete(
  "/campos/delete-all/:data/:orgao",
  validateToken.authenticateToken,
  validateToken.onlyAdmins,
  controllerCampos.query.deleteCampos
)

// accept a single zip file through multer so it doesn't live in JSON body
routerCampos.post(
  "/zipUpload",
  validateToken.authenticateToken,
  validateToken.onlyAdmins,
  validateToken.checkSchema,
  upload.single("arquivo"),
  controllerMassUpload.zipUpload
);

routerCampos.get(
  "/lnc/recarregar-data-adicional/:data/:orgao",
  validateToken.authenticateToken,
  validateToken.onlyAdmins,
  controllerCampos.query.recarregarLnc
)

// ENTIDADE --------------------------------------------------------

routerCampos.post(
  "/entidades/register",
  validateToken.authenticateToken,
  validateToken.onlyAdmins,
  validateRequest,
  controllerEntidade.register
);

routerCampos.get(
  "/lnc/getInvalid",
  validateToken.authenticateToken,
  validateToken.onlyAdmins,
  controllerCampos.query.getInvalidLnc
)

routerCampos.get(
  "/entidades/organograma/:id",
  validateToken.authenticateToken,
  validateToken.onlyAdmins,
  controllerEntidade.organograma
);

routerCampos.get(
  "/entidades/organograma",
  validateToken.authenticateToken,
  validateToken.onlyAdmins,
  controllerEntidade.organograma
);


routerCampos.post(
  "/entidades/new-rubrica/:anexo",
  validateToken.authenticateToken,
  validateToken.onlyAdmins,
  validateRequest,
  controllerEntidade.newRubrica
);
routerCampos.get(
  "/entidades/existing-rubrica",
  validateToken.authenticateToken,
  validateToken.onlyAdmins,
  controllerEntidade.getRubrica
);
routerCampos.get(
  "/entidades",
  validateToken.authenticateToken,
  validateToken.onlyAdmins,
  controllerEntidade.getAllEntitys
);

routerCampos.get("/entidades/get_safe", controllerEntidade.getAllEntitysSafe);

routerCampos.get(
  "/entidades/usable",
  validateToken.authenticateToken,
  validateToken.onlyAdmins,
  controllerEntidade.getUsableEntitys
);
routerCampos.delete(
  "/entidades/delete/:id",
  validateToken.authenticateToken,
  validateToken.onlyAdmins,
  controllerEntidade.deleteEntity
);
routerCampos.put(
  "/entidades/update/:id",
  validateToken.authenticateToken,
  validateToken.onlyAdmins,
  controllerEntidade.updateEntity
);

// POSTMANAGER --------------------------------------------------------
routerCampos.get("/posts/:page", controllerPost.getPosts);
routerCampos.get("/posts/id/:id", controllerPost.getPostById);
// ORGAO ----------------------------------------------------------

routerCampos.get(
  "/orgao/names",
  validateToken.authenticateToken,
  validateToken.onlyAdmins,
  controllerCampos.query.getOrgaoNames
);


// RECo -------------------------------------------

routerCampos.post(
  "/reco/inserir",
  validateToken.authenticateToken,
  validateToken.onlyAdmins,
  controllerReco.Inserir
);
routerCampos.post(
  "/reco/post-reco",
  validateToken.authenticateToken,
  validateToken.onlyAdmins,
  controllerReco.InserirRecO
);
routerCampos.delete(
  "/reco/delete/:id",
  validateToken.authenticateToken,
  validateToken.onlyAdmins,
  controllerReco.deleteRecO
);
routerCampos.get(
  "/reco/:id",
  validateToken.authenticateToken,
  validateToken.onlyAdmins,
  controllerReco.getRecOById
);
routerCampos.put(
  "/reco/update/:id",
  validateToken.authenticateToken,
  validateToken.onlyAdmins,
  controllerReco.updateRecO
);


// DSPo -------------------------------------------

routerCampos.post(
  "/dspo/inserir",
  validateToken.authenticateToken,
  validateToken.onlyAdmins,
  controllerDspo.Inserir
);
routerCampos.post(
  "/dspo/post-dspo",
  validateToken.authenticateToken,
  validateToken.onlyAdmins,
  controllerDspo.InserirDspO
);
routerCampos.delete(
  "/dspo/delete/:id",
  validateToken.authenticateToken,
  validateToken.onlyAdmins,
  controllerDspo.deleteDspO
);

routerCampos.get(
  "/dspo/:id",
  validateToken.authenticateToken,
  validateToken.onlyAdmins,
  controllerDspo.getDspOById
);
routerCampos.put(
  "/dspo/update/:id",
  validateToken.authenticateToken,
  validateToken.onlyAdmins,
  controllerDspo.updateDspO
);

export default routerCampos;
