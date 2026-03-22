import { Router } from "express";
import controllerEntidade from "../controllers/controller.entidade.js";
import { validateRequest } from "../middlewares/security.js";
import { validateUsuarioRegistration } from "../middlewares/validators.js";
import controllerUsuario from "../controllers/controller.usuario.js";
import multer from "multer";
import validateToken from "../middlewares/validateToken.js";
import controllerPost from "../controllers/controller.posts.js";

// Campos de Dados Específicos do Município ---------------------------------------------

import controllerOrgao from "../controllers/campos/controller.orgao.js";
import controllerIde from "../controllers/campos/controller.ide.js";
import controllerIsi from "../controllers/campos/controller.isi.js";
import controllerUoc from "../controllers/campos/controller.uoc.js";
import controllerRec from "../controllers/campos/controller.rec.js";
import controllerAre from "../controllers/campos/controller.are.js";
import controllerAoc from "../controllers/campos/controller.aoc.js";
import controllerCob from "../controllers/campos/controller.cob.js";
import controllerEmp from "../controllers/campos/controller.emp.js";
import controllerAnl from "../controllers/campos/controller.anl.js";
import controllerEoc from "../controllers/campos/controller.eoc.js";
import controllerLqd from "../controllers/campos/controller.lqd.js";
import controllerAlq from "../controllers/campos/controller.alq.js";
import controllerExt from "../controllers/campos/controller.ext.js";
import controllerAex from "../controllers/campos/controller.aex.js";
import controllerOps from "../controllers/campos/controller.ops.js";
import controllerAop from "../controllers/campos/controller.aop.js";
import controllerRsp from "../controllers/campos/controller.rsp.js";
import controllerCon from "../controllers/campos/controller.con.js";
import controllerCtb from "../controllers/campos/controller.ctb.js";
import controllerTrb from "../controllers/campos/controller.trb.js";
import controllerCvc from "../controllers/campos/controller.cvc.js";
import controllerEcl from "../controllers/campos/controller.ecl.js";
import controllerTfr from "../controllers/campos/controller.tfr.js";
import controllerDfr from "../controllers/campos/controller.dfr.js";
import controllerDic from "../controllers/campos/controller.dic.js";
import controllerDcl from "../controllers/campos/controller.dcl.js";
import controllerPar from "../controllers/campos/controller.par.js";
import controllerPct from "../controllers/campos/controller.pct.js";
import controllerLnc from "../controllers/campos/controller.lnc.js";
import controllerDmr from "../controllers/campos/controller.dmr.js";
import controllerAbl from "../controllers/campos/controller.abl.js";
import controllerRpl from "../controllers/campos/controller.rpl.js";
import controllerHbl from "../controllers/campos/controller.hbl.js";
import controllerJgl from "../controllers/campos/controller.jgl.js";
import controllerHml from "../controllers/campos/controller.hml.js";
import controllerPrl from "../controllers/campos/controller.prl.js";
import controllerArp from "../controllers/campos/controller.arp.js";
import controllerDsi from "../controllers/campos/controller.dsi.js";
import controllerReco from "../controllers/campos/controller.recO.js";
import controllerDspo from "../controllers/campos/controller.dspO.js";
import controllerMassUpload from "../controllers/campos/controller.massUpload.js";
import controllerCampos from "../controllers/controller.campos.js";
import controllerCampos_getAll from "../controllers/campos/controller.campos_getAll.js";

// --------------------------------------------------
const storage = multer.memoryStorage(); // Store file in memory
const upload = multer({
  storage: storage,
  limits: { fileSize: 200 * 1024 * 1024 }, // 200 MB limit for ZIP packages
});

const routerCampos = Router();

// Rota para a raiz da API

routerCampos.post(
  "/campos/criarAnalize/:name",
  validateToken.authenticateToken,
  validateToken.onlyAdmins,
  controllerCampos_getAll.criarAnalize
)

routerCampos.put(
  "/campos/novo-registro/:name",
  validateToken.authenticateToken,
  validateToken.onlyAdmins,
  controllerCampos_getAll.novo_registro
)

routerCampos.put(
  "/update-campo/:name/:id",
  validateToken.authenticateToken,
  validateToken.onlyAdmins,
  controllerCampos_getAll.editarRegistro
)

routerCampos.delete(
  "/campo/delete/:name/:id/:subId",
  validateToken.authenticateToken,
  validateToken.onlyAdmins,
  controllerCampos_getAll.deleteCampo
)

routerCampos.get(
  "/campos/json/:name",
  validateToken.authenticateToken,
  validateToken.onlyAdmins,
  controllerCampos_getAll.getAsJson
)

routerCampos.delete(
  "/campo/delete/:name/:id/",
  validateToken.authenticateToken,
  validateToken.onlyAdmins,
  controllerCampos_getAll.deleteCampo
)

routerCampos.put(
  "/campos/enviar/:name",
  validateToken.authenticateToken,
  validateToken.onlyAdmins,
  upload.single("arquivo"),
  controllerCampos_getAll.enviarJson
)

routerCampos.get(
  "/campos/getAll/:name",
  validateToken.authenticateToken,
  validateToken.onlyAdmins,
  controllerCampos_getAll.getAllCampos
)

routerCampos.get(
  "/table/:name",
  validateToken.authenticateToken,
  validateToken.onlyAdmins,
  controllerCampos.getAllFromTable
)

routerCampos.put(
  "/table/edit/:name",
  validateToken.authenticateToken,
  validateToken.onlyAdmins,
  controllerCampos.updateTable
)

routerCampos.delete(
  "/campos/delete-all/:date",
  validateToken.authenticateToken,
  validateToken.onlyAdmins,
  controllerCampos.deleteCampos
)

// accept a single zip file through multer so it doesn't live in JSON body
routerCampos.post(
  "/zipUpload",
  validateToken.authenticateToken,
  validateToken.onlyAdmins,
  upload.single("arquivo"),
  controllerMassUpload.zipUpload
);

// ENTIDADE --------------------------------------------------------
routerCampos.post(
  "/entidades/register",
  validateToken.authenticateToken,
  validateToken.onlyAdmins,
  validateRequest,
  controllerEntidade.register
);

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

validateToken.authenticateToken,
  validateToken.onlyAdmins,
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
validateToken.authenticateToken,
  validateToken.onlyAdmins,

  validateToken.authenticateToken,
  validateToken.onlyAdmins,
  // Identidade do Município----------------------------------------------

  routerCampos.get(
    "/ide/:page/:pageSize",
    validateToken.authenticateToken,
    validateToken.onlyAdmins,
    controllerIde.getAllIde
  );
routerCampos.post(
  "/ide/inserir",
  validateToken.authenticateToken,
  validateToken.onlyAdmins,
  controllerIde.Inserir
);
routerCampos.post(
  "/ide/post-ide",
  validateToken.authenticateToken,
  validateToken.onlyAdmins,
  controllerIde.InserirIde
);
routerCampos.delete(
  "/ide/delete/:id",
  validateToken.authenticateToken,
  validateToken.onlyAdmins,
  controllerIde.deleteIde
);
routerCampos.get(
  "/ide/:id",
  validateToken.authenticateToken,
  validateToken.onlyAdmins,
  controllerIde.getIdeById
);
routerCampos.put(
  "/ide/update/:id",
  validateToken.authenticateToken,
  validateToken.onlyAdmins,
  controllerIde.updateIde
);

// ORGAO ----------------------------------------------------------

routerCampos.get(
  "/orgao/:page/:pageSize",
  validateToken.authenticateToken,
  validateToken.onlyAdmins,
  controllerOrgao.getAllOrgao
);
routerCampos.get(
  "/orgao/names",
  validateToken.authenticateToken,
  validateToken.onlyAdmins,
  controllerOrgao.getOrgaoNames
);
routerCampos.post(
  "/orgao/inserir",
  validateToken.authenticateToken,
  validateToken.onlyAdmins,
  controllerOrgao.Inserir
);
routerCampos.post(
  "/orgao/post-Orgao",
  validateToken.authenticateToken,
  validateToken.onlyAdmins,
  controllerOrgao.InserirOrgao
);
routerCampos.delete(
  "/orgao/delete/:id",
  validateToken.authenticateToken,
  validateToken.onlyAdmins,
  controllerOrgao.deleteOrgao
);
routerCampos.get(
  "/orgao/:id",
  validateToken.authenticateToken,
  validateToken.onlyAdmins,
  controllerOrgao.getOrgaoById
);
routerCampos.put(
  "/orgao/update/:id",
  validateToken.authenticateToken,
  validateToken.onlyAdmins,
  controllerOrgao.updateOrgao
);

// Informações do Sistema de Informática----------------------------------------

routerCampos.get(
  "/isi/:page/:pageSize",
  validateToken.authenticateToken,
  validateToken.onlyAdmins,
  controllerIsi.getAllIsi
);
routerCampos.post(
  "/isi/inserir",
  validateToken.authenticateToken,
  validateToken.onlyAdmins,
  controllerIsi.Inserir
);
routerCampos.post(
  "/isi/post-isi",
  validateToken.authenticateToken,
  validateToken.onlyAdmins,
  controllerIsi.InserirIsi
);
routerCampos.delete(
  "/isi/delete/:id",
  validateToken.authenticateToken,
  validateToken.onlyAdmins,
  controllerIsi.deleteIsi
);
routerCampos.get(
  "/isi/:id",
  validateToken.authenticateToken,
  validateToken.onlyAdmins,
  controllerIsi.getIsiById
);
routerCampos.put(
  "/isi/update/:id",
  validateToken.authenticateToken,
  validateToken.onlyAdmins,
  controllerIsi.updateIsi
);

// Unidade Orçamentária ----------------------------------------------------------

routerCampos.get(
  "/uoc/:page/:pageSize",
  validateToken.authenticateToken,
  validateToken.onlyAdmins,
  controllerUoc.getAllUoc
);
routerCampos.post(
  "/uoc/inserir",
  validateToken.authenticateToken,
  validateToken.onlyAdmins,
  controllerUoc.Inserir
);
routerCampos.post(
  "/uoc/post-uoc",
  validateToken.authenticateToken,
  validateToken.onlyAdmins,
  controllerUoc.InserirUoc
);
routerCampos.delete(
  "/uoc/delete/:id",
  validateToken.authenticateToken,
  validateToken.onlyAdmins,
  controllerUoc.deleteUoc
);
routerCampos.get(
  "/uoc/:id",
  validateToken.authenticateToken,
  validateToken.onlyAdmins,
  controllerUoc.getUocById
);
routerCampos.put(
  "/uoc/update/:id",
  validateToken.authenticateToken,
  validateToken.onlyAdmins,
  controllerUoc.updateUoc
);


// Receita ---------------------------------------------------------------------

routerCampos.get(
  "/rec/:page/:pageSize",
  validateToken.authenticateToken,
  validateToken.onlyAdmins,
  controllerRec.getAllRec
);
routerCampos.post(
  "/rec/inserir",
  validateToken.authenticateToken,
  validateToken.onlyAdmins,
  controllerRec.Inserir
);
routerCampos.post(
  "/rec/post-rec",
  validateToken.authenticateToken,
  validateToken.onlyAdmins,
  controllerRec.InserirRec
);
routerCampos.delete(
  "/rec/delete/:id",
  validateToken.authenticateToken,
  validateToken.onlyAdmins,
  controllerRec.deleteRec
);
routerCampos.get(
  "/rec/:id",
  validateToken.authenticateToken,
  validateToken.onlyAdmins,
  controllerRec.getRecById
);
routerCampos.put(
  "/rec/update/:id",
  validateToken.authenticateToken,
  validateToken.onlyAdmins,
  controllerRec.updateRec
);


// Anulação de Receita ----------------------------------------------------------

routerCampos.get(
  "/are/:page/:pageSize",
  validateToken.authenticateToken,
  validateToken.onlyAdmins,
  controllerAre.getAllAre
);
routerCampos.post(
  "/are/inserir",
  validateToken.authenticateToken,
  validateToken.onlyAdmins,
  controllerAre.Inserir
);
routerCampos.post(
  "/are/post-are",
  validateToken.authenticateToken,
  validateToken.onlyAdmins,
  controllerAre.InserirAre
);
routerCampos.delete(
  "/are/delete/:id",
  validateToken.authenticateToken,
  validateToken.onlyAdmins,
  controllerAre.deleteAre
);
routerCampos.get(
  "/are/:id",
  validateToken.authenticateToken,
  validateToken.onlyAdmins,
  controllerAre.getAreById
);
routerCampos.put(
  "/are/update/:id",
  validateToken.authenticateToken,
  validateToken.onlyAdmins,
  controllerAre.updateAre
);


// Alterações Orçamentárias ----------------------------------------------------------

routerCampos.get(
  "/aoc/:page/:pageSize",
  validateToken.authenticateToken,
  validateToken.onlyAdmins,
  controllerAoc.getAllAoc
);
routerCampos.post(
  "/aoc/inserir",
  validateToken.authenticateToken,
  validateToken.onlyAdmins,
  controllerAoc.Inserir
);
routerCampos.post(
  "/aoc/post-aoc",
  validateToken.authenticateToken,
  validateToken.onlyAdmins,
  controllerAoc.InserirAoc
);
routerCampos.delete(
  "/aoc/delete/:id",
  validateToken.authenticateToken,
  validateToken.onlyAdmins,
  controllerAoc.deleteAoc
);
routerCampos.get(
  "/aoc/:id",
  validateToken.authenticateToken,
  validateToken.onlyAdmins,
  controllerAoc.getAocById
);
routerCampos.put(
  "/aoc/update/:id",
  validateToken.authenticateToken,
  validateToken.onlyAdmins,
  controllerAoc.updateAoc
);


// Cadastro de Obras em Andamento ----------------------------------------------------------

routerCampos.get(
  "/cob/:page/:pageSize",
  validateToken.authenticateToken,
  validateToken.onlyAdmins,
  controllerCob.getAllCob
);
routerCampos.post(
  "/cob/inserir",
  validateToken.authenticateToken,
  validateToken.onlyAdmins,
  controllerCob.Inserir
);
routerCampos.post(
  "/cob/post-cob",
  validateToken.authenticateToken,
  validateToken.onlyAdmins,
  controllerCob.InserirCob
);
routerCampos.delete(
  "/cob/delete/:id",
  validateToken.authenticateToken,
  validateToken.onlyAdmins,
  controllerCob.deleteCob
);
routerCampos.get(
  "/cob/:id",
  validateToken.authenticateToken,
  validateToken.onlyAdmins,
  controllerCob.getCobById
);
routerCampos.put(
  "/cob/update/:id",
  validateToken.authenticateToken,
  validateToken.onlyAdmins,
  controllerCob.updateCob
);


// Empenho ----------------------------------------------------------

routerCampos.get(
  "/emp/:page/:pageSize",
  validateToken.authenticateToken,
  validateToken.onlyAdmins,
  controllerEmp.getAllEmp
);
routerCampos.post(
  "/emp/inserir",
  validateToken.authenticateToken,
  validateToken.onlyAdmins,
  controllerEmp.Inserir
);
routerCampos.post(
  "/emp/post-emp",
  validateToken.authenticateToken,
  validateToken.onlyAdmins,
  controllerEmp.InserirEmp
);
routerCampos.delete(
  "/emp/delete/:id",
  validateToken.authenticateToken,
  validateToken.onlyAdmins,
  controllerEmp.deleteEmp
);
routerCampos.get(
  "/emp/:id",
  validateToken.authenticateToken,
  validateToken.onlyAdmins,
  controllerEmp.getEmpById
);
routerCampos.put(
  "/emp/update/:id",
  validateToken.authenticateToken,
  validateToken.onlyAdmins,
  controllerEmp.updateEmp
);


// Anulação do Empenho ----------------------------------------------------------

routerCampos.get(
  "/anl/:page/:pageSize",
  validateToken.authenticateToken,
  validateToken.onlyAdmins,
  controllerAnl.getAllAnl
);
routerCampos.post(
  "/anl/inserir",
  validateToken.authenticateToken,
  validateToken.onlyAdmins,
  controllerAnl.Inserir
);
routerCampos.post(
  "/anl/post-anl",
  validateToken.authenticateToken,
  validateToken.onlyAdmins,
  controllerAnl.InserirAnl
);
routerCampos.delete(
  "/anl/delete/:id",
  validateToken.authenticateToken,
  validateToken.onlyAdmins,
  controllerAnl.deleteAnl
);
routerCampos.get(
  "/anl/:id",
  validateToken.authenticateToken,
  validateToken.onlyAdmins,
  controllerAnl.getAnlById
);
routerCampos.put(
  "/anl/update/:id",
  validateToken.authenticateToken,
  validateToken.onlyAdmins,
  controllerAnl.updateAnl
);


// Vínculo de Empenho Existente com Obra e/ou Contrato------------------------------

routerCampos.get(
  "/eoc/:page/:pageSize",
  validateToken.authenticateToken,
  validateToken.onlyAdmins,
  controllerEoc.getAllEoc
);
routerCampos.post(
  "/eoc/inserir",
  validateToken.authenticateToken,
  validateToken.onlyAdmins,
  controllerEoc.Inserir
);
routerCampos.post(
  "/eoc/post-eoc",
  validateToken.authenticateToken,
  validateToken.onlyAdmins,
  controllerEoc.InserirEoc
);
routerCampos.delete(
  "/eoc/delete/:id",
  validateToken.authenticateToken,
  validateToken.onlyAdmins,
  controllerEoc.deleteEoc
);
routerCampos.get(
  "/eoc/:id",
  validateToken.authenticateToken,
  validateToken.onlyAdmins,
  controllerEoc.getEocById
);
routerCampos.put(
  "/eoc/update/:id",
  validateToken.authenticateToken,
  validateToken.onlyAdmins,
  controllerEoc.updateEoc
);


// (LQD) Liquidação de Despesa------------------------------------------------

routerCampos.get(
  "/lqd/:page/:pageSize",
  validateToken.authenticateToken,
  validateToken.onlyAdmins,
  controllerLqd.getAllLqd
);
routerCampos.post(
  "/lqd/inserir",
  validateToken.authenticateToken,
  validateToken.onlyAdmins,
  controllerLqd.Inserir
);
routerCampos.post(
  "/lqd/post-lqd",
  validateToken.authenticateToken,
  validateToken.onlyAdmins,
  controllerLqd.InserirLqd
);
routerCampos.delete(
  "/lqd/delete/:id",
  validateToken.authenticateToken,
  validateToken.onlyAdmins,
  controllerLqd.deleteLqd
);
routerCampos.get(
  "/lqd/:id",
  validateToken.authenticateToken,
  validateToken.onlyAdmins,
  controllerLqd.getLqdById
);
routerCampos.put(
  "/lqd/update/:id",
  validateToken.authenticateToken,
  validateToken.onlyAdmins,
  controllerLqd.updateLqd
);


// (Alq) Anulação da Liquidação de Despesa-----------------------------------

routerCampos.get(
  "/alq/:page/:pageSize",
  validateToken.authenticateToken,
  validateToken.onlyAdmins,
  controllerAlq.getAllAlq
);
routerCampos.post(
  "/alq/inserir",
  validateToken.authenticateToken,
  validateToken.onlyAdmins,
  controllerAlq.Inserir
);
routerCampos.post(
  "/alq/post-alq",
  validateToken.authenticateToken,
  validateToken.onlyAdmins,
  controllerAlq.InserirAlq
);
routerCampos.delete(
  "/alq/delete/:id",
  validateToken.authenticateToken,
  validateToken.onlyAdmins,
  controllerAlq.deleteAlq
);
routerCampos.get(
  "/alq/:id",
  validateToken.authenticateToken,
  validateToken.onlyAdmins,
  controllerAlq.getAlqById
);
routerCampos.put(
  "/alq/update/:id",
  validateToken.authenticateToken,
  validateToken.onlyAdmins,
  controllerAlq.updateAlq
);


// (Ext) ExtraOrçamentária --------------------------------------------------

routerCampos.get(
  "/ext/:page/:pageSize",
  validateToken.authenticateToken,
  validateToken.onlyAdmins,
  controllerExt.getAllExt
);
routerCampos.post(
  "/ext/inserir",
  validateToken.authenticateToken,
  validateToken.onlyAdmins,
  controllerExt.Inserir
);
routerCampos.post(
  "/ext/post-ext",
  validateToken.authenticateToken,
  validateToken.onlyAdmins,
  controllerExt.InserirExt
);
routerCampos.delete(
  "/ext/delete/:id",
  validateToken.authenticateToken,
  validateToken.onlyAdmins,
  controllerExt.deleteExt
);
routerCampos.get(
  "/ext/:id",
  validateToken.authenticateToken,
  validateToken.onlyAdmins,
  controllerExt.getExtById
);
routerCampos.put(
  "/ext/update/:id",
  validateToken.authenticateToken,
  validateToken.onlyAdmins,
  controllerExt.updateExt
);


// (Aex) Anulação de ExtraOrçamentária-------------------------------------

routerCampos.get(
  "/aex/:page/:pageSize",
  validateToken.authenticateToken,
  validateToken.onlyAdmins,
  controllerAex.getAllAex
);
routerCampos.post(
  "/aex/inserir",
  validateToken.authenticateToken,
  validateToken.onlyAdmins,
  controllerAex.Inserir
);
routerCampos.post(
  "/aex/post-aex",
  validateToken.authenticateToken,
  validateToken.onlyAdmins,
  controllerAex.InserirAex
);
routerCampos.delete(
  "/aex/delete/:id",
  validateToken.authenticateToken,
  validateToken.onlyAdmins,
  controllerAex.deleteAex
);
routerCampos.get(
  "/aex/:id",
  validateToken.authenticateToken,
  validateToken.onlyAdmins,
  controllerAex.getAexById
);
routerCampos.put(
  "/aex/update/:id",
  validateToken.authenticateToken,
  validateToken.onlyAdmins,
  controllerAex.updateAex
);


// (Ops) Ordens de Pagamento------------------------------------------

routerCampos.get(
  "/ops/:page/:pageSize",
  validateToken.authenticateToken,
  validateToken.onlyAdmins,
  controllerOps.getAllOps
);
routerCampos.post(
  "/ops/inserir",
  validateToken.authenticateToken,
  validateToken.onlyAdmins,
  controllerOps.Inserir
);
routerCampos.post(
  "/ops/post-ops",
  validateToken.authenticateToken,
  validateToken.onlyAdmins,
  controllerOps.InserirOps
);
routerCampos.delete(
  "/ops/delete/:id",
  validateToken.authenticateToken,
  validateToken.onlyAdmins,
  controllerOps.deleteOps
);
routerCampos.get(
  "/ops/:id",
  validateToken.authenticateToken,
  validateToken.onlyAdmins,
  controllerOps.getOpsById
);
routerCampos.put(
  "/ops/update/:id",
  validateToken.authenticateToken,
  validateToken.onlyAdmins,
  controllerOps.updateOps
);


// (Aop) Anulações das Ordens de Pagamento------------------------------------------

routerCampos.get(
  "/aop/:page/:pageSize",
  validateToken.authenticateToken,
  validateToken.onlyAdmins,
  controllerAop.getAllAop
);
routerCampos.post(
  "/aop/inserir",
  validateToken.authenticateToken,
  validateToken.onlyAdmins,
  controllerAop.Inserir
);
routerCampos.post(
  "/aop/post-aop",
  validateToken.authenticateToken,
  validateToken.onlyAdmins,
  controllerAop.InserirAop
);
routerCampos.delete(
  "/aop/delete/:id",
  validateToken.authenticateToken,
  validateToken.onlyAdmins,
  controllerAop.deleteAop
);
routerCampos.get(
  "/aop/:id",
  validateToken.authenticateToken,
  validateToken.onlyAdmins,
  controllerAop.getAopById
);
routerCampos.put(
  "/aop/update/:id",
  validateToken.authenticateToken,
  validateToken.onlyAdmins,
  controllerAop.updateAop
);


// (Rsp) Movimentos de Restos a Pagar-------------------------------------

routerCampos.get(
  "/rsp/:page/:pageSize",
  validateToken.authenticateToken,
  validateToken.onlyAdmins,
  controllerRsp.getAllRsp
);
routerCampos.post(
  "/rsp/inserir",
  validateToken.authenticateToken,
  validateToken.onlyAdmins,
  controllerRsp.Inserir
);
routerCampos.post(
  "/rsp/post-rsp",
  validateToken.authenticateToken,
  validateToken.onlyAdmins,
  controllerRsp.InserirRsp
);
routerCampos.delete(
  "/rsp/delete/:id",
  validateToken.authenticateToken,
  validateToken.onlyAdmins,
  controllerRsp.deleteRsp
);
routerCampos.get(
  "/rsp/:id",
  validateToken.authenticateToken,
  validateToken.onlyAdmins,
  controllerRsp.getRspById
);
routerCampos.put(
  "/rsp/update/:id",
  validateToken.authenticateToken,
  validateToken.onlyAdmins,
  controllerRsp.updateRsp
);


// (Con) Contratos----------------------------------------------------------

routerCampos.get(
  "/con/:page/:pageSize",
  validateToken.authenticateToken,
  validateToken.onlyAdmins,
  controllerCon.getAllCon
);
routerCampos.post(
  "/con/inserir",
  validateToken.authenticateToken,
  validateToken.onlyAdmins,
  controllerCon.Inserir
);
routerCampos.post(
  "/con/post-con",
  validateToken.authenticateToken,
  validateToken.onlyAdmins,
  controllerCon.InserirCon
);
routerCampos.delete(
  "/con/delete/:id",
  validateToken.authenticateToken,
  validateToken.onlyAdmins,
  controllerCon.deleteCon
);
routerCampos.get(
  "/con/:id",
  validateToken.authenticateToken,
  validateToken.onlyAdmins,
  controllerCon.getConById
);
routerCampos.put(
  "/con/update/:id",
  validateToken.authenticateToken,
  validateToken.onlyAdmins,
  controllerCon.updateCon
);


// (Ctb) Contas Bancárias e Caixa (Disponível)--------------------------------------

routerCampos.get(
  "/ctb/:page/:pageSize",
  validateToken.authenticateToken,
  validateToken.onlyAdmins,
  controllerCtb.getAllCtb
);

routerCampos.put(
  "/ctb/update-conta",
  validateToken.authenticateToken,
  validateToken.onlyAdmins,
  controllerCtb.contaUpdate
)

routerCampos.post(
  "/ctb/inserir",
  validateToken.authenticateToken,
  validateToken.onlyAdmins,
  controllerCtb.Inserir
);
routerCampos.post(
  "/ctb/post-ctb",
  validateToken.authenticateToken,
  validateToken.onlyAdmins,
  controllerCtb.InserirCtb
);
routerCampos.delete(
  "/ctb/delete/:id",
  validateToken.authenticateToken,
  validateToken.onlyAdmins,
  controllerCtb.deleteCtb
);
routerCampos.get(
  "/ctb/:id",
  validateToken.authenticateToken,
  validateToken.onlyAdmins,
  controllerCtb.getCtbById
);
routerCampos.put(
  "/ctb/update/:id",
  validateToken.authenticateToken,
  validateToken.onlyAdmins,
  controllerCtb.updateCtb
);


// (Trb) Transferências Bancárias-------------------------------------------------

routerCampos.get(
  "/trb/:page/:pageSize",
  validateToken.authenticateToken,
  validateToken.onlyAdmins,
  controllerTrb.getAllTrb
);
routerCampos.post(
  "/trb/inserir",
  validateToken.authenticateToken,
  validateToken.onlyAdmins,
  controllerTrb.Inserir
);
routerCampos.post(
  "/trb/post-trb",
  validateToken.authenticateToken,
  validateToken.onlyAdmins,
  controllerTrb.InserirTrb
);
routerCampos.delete(
  "/trb/delete/:id",
  validateToken.authenticateToken,
  validateToken.onlyAdmins,
  controllerTrb.deleteTrb
);
routerCampos.get(
  "/trb/:id",
  validateToken.authenticateToken,
  validateToken.onlyAdmins,
  controllerTrb.getTrbById
);
routerCampos.put(
  "/trb/update/:id",
  validateToken.authenticateToken,
  validateToken.onlyAdmins,
  controllerTrb.updateTrb
);


// (Cvc) Cadastro de Veículos em Situação de Consumo------------------------------

routerCampos.get(
  "/cvc/:page/:pageSize",
  validateToken.authenticateToken,
  validateToken.onlyAdmins,
  controllerCvc.getAllCvc
);
routerCampos.post(
  "/cvc/inserir",
  validateToken.authenticateToken,
  validateToken.onlyAdmins,
  controllerCvc.Inserir
);
routerCampos.post(
  "/cvc/post-cvc",
  validateToken.authenticateToken,
  validateToken.onlyAdmins,
  controllerCvc.InserirCvc
);
routerCampos.delete(
  "/cvc/delete/:id",
  validateToken.authenticateToken,
  validateToken.onlyAdmins,
  controllerCvc.deleteCvc
);
routerCampos.get(
  "/cvc/:id",
  validateToken.authenticateToken,
  validateToken.onlyAdmins,
  controllerCvc.getCvcById
);
routerCampos.put(
  "/cvc/update/:id",
  validateToken.authenticateToken,
  validateToken.onlyAdmins,
  controllerCvc.updateCvc
);


// (Ecl) Estoque de Combustível / Lubrificante----------------------------------------

routerCampos.get(
  "/ecl/:page/:pageSize",
  validateToken.authenticateToken,
  validateToken.onlyAdmins,
  controllerEcl.getAllEcl
);
routerCampos.post(
  "/ecl/inserir",
  validateToken.authenticateToken,
  validateToken.onlyAdmins,
  controllerEcl.Inserir
);
routerCampos.post(
  "/ecl/post-ecl",
  validateToken.authenticateToken,
  validateToken.onlyAdmins,
  controllerEcl.InserirEcl
);
routerCampos.delete(
  "/ecl/delete/:id",
  validateToken.authenticateToken,
  validateToken.onlyAdmins,
  controllerEcl.deleteEcl
);
routerCampos.get(
  "/ecl/:id",
  validateToken.authenticateToken,
  validateToken.onlyAdmins,
  controllerEcl.getEclById
);
routerCampos.put(
  "/ecl/update/:id",
  validateToken.authenticateToken,
  validateToken.onlyAdmins,
  controllerEcl.updateEcl
);


// (Tfr) Transferência de Fontes de Recursos nas Contas Bancárias-----------------

routerCampos.get(
  "/tfr/:page/:pageSize",
  validateToken.authenticateToken,
  validateToken.onlyAdmins,
  controllerTfr.getAllTfr
);
routerCampos.post(
  "/tfr/inserir",
  validateToken.authenticateToken,
  validateToken.onlyAdmins,
  controllerTfr.Inserir
);
routerCampos.post(
  "/trf/post-tfr",
  validateToken.authenticateToken,
  validateToken.onlyAdmins,
  controllerTfr.InserirTfr
);
routerCampos.delete(
  "/tfr/delete/:id",
  validateToken.authenticateToken,
  validateToken.onlyAdmins,
  controllerTfr.deleteTfr
);
routerCampos.get(
  "/tfr/:id",
  validateToken.authenticateToken,
  validateToken.onlyAdmins,
  controllerTfr.getTfrById
);
routerCampos.put(
  "/tfr/update/:id",
  validateToken.authenticateToken,
  validateToken.onlyAdmins,
  controllerTfr.updateTfr
);


// (Dfr) Detalhamento da Fonte de Recurso-----------------------------------------------

routerCampos.get(
  "/dfr/:page/:pageSize",
  validateToken.authenticateToken,
  validateToken.onlyAdmins,
  controllerDfr.getAllDfr
);
routerCampos.post(
  "/dfr/inserir",
  validateToken.authenticateToken,
  validateToken.onlyAdmins,
  controllerDfr.Inserir
);
routerCampos.post(
  "/drf/post-dfr",
  validateToken.authenticateToken,
  validateToken.onlyAdmins,
  controllerDfr.InserirDfr
);
routerCampos.delete(
  "/dfr/delete/:id",
  validateToken.authenticateToken,
  validateToken.onlyAdmins,
  controllerDfr.deleteDfr
);
routerCampos.get(
  "/dfr/:id",
  validateToken.authenticateToken,
  validateToken.onlyAdmins,
  controllerDfr.getDfrById
);
routerCampos.put(
  "/dfr/update/:id",
  validateToken.authenticateToken,
  validateToken.onlyAdmins,
  controllerDfr.updateDfr
);


// (Dic) Dívida Consolidada-------------------------------------------

routerCampos.get(
  "/dic/:page/:pageSize",
  validateToken.authenticateToken,
  validateToken.onlyAdmins,
  controllerDic.getAllDic
);
routerCampos.post(
  "/dic/inserir",
  validateToken.authenticateToken,
  validateToken.onlyAdmins,
  controllerDic.Inserir
);
routerCampos.post(
  "/dic/post-dic",
  validateToken.authenticateToken,
  validateToken.onlyAdmins,
  controllerDic.InserirDic
);
routerCampos.delete(
  "/dic/delete/:id",
  validateToken.authenticateToken,
  validateToken.onlyAdmins,
  controllerDic.deleteDic
);
routerCampos.get(
  "/dic/:id",
  validateToken.authenticateToken,
  validateToken.onlyAdmins,
  controllerDic.getDicById
);
routerCampos.put(
  "/dic/update/:id",
  validateToken.authenticateToken,
  validateToken.onlyAdmins,
  controllerDic.updateDic
);


// (Dcl) Dados Complementares à LRF-------------------------------------------

routerCampos.get(
  "/dcl/:page/:pageSize",
  validateToken.authenticateToken,
  validateToken.onlyAdmins,
  controllerDcl.getAllDcl
);
routerCampos.post(
  "/dcl/inserir",
  validateToken.authenticateToken,
  validateToken.onlyAdmins,
  controllerDcl.Inserir
);
routerCampos.post(
  "/dcl/post-dcl",
  validateToken.authenticateToken,
  validateToken.onlyAdmins,
  controllerDcl.InserirDcl
);
routerCampos.delete(
  "/dcl/delete/:id",
  validateToken.authenticateToken,
  validateToken.onlyAdmins,
  controllerDcl.deleteDcl
);
routerCampos.get(
  "/dcl/:id",
  validateToken.authenticateToken,
  validateToken.onlyAdmins,
  controllerDcl.getDclById
);
routerCampos.put(
  "/dcl/update/:id",
  validateToken.authenticateToken,
  validateToken.onlyAdmins,
  controllerDcl.updateDcl
);


// (Par) Projeção Atuarial do RPPS-------------------------------------------------

routerCampos.get(
  "/par/:page/:pageSize",
  validateToken.authenticateToken,
  validateToken.onlyAdmins,
  controllerPar.getAllPar
);
routerCampos.post(
  "/par/inserir",
  validateToken.authenticateToken,
  validateToken.onlyAdmins,
  controllerPar.Inserir
);
routerCampos.post(
  "/par/post-par",
  validateToken.authenticateToken,
  validateToken.onlyAdmins,
  controllerPar.InserirPar
);
routerCampos.delete(
  "/par/delete/:id",
  validateToken.authenticateToken,
  validateToken.onlyAdmins,
  controllerPar.deletePar
);
routerCampos.get(
  "/par/:id",
  validateToken.authenticateToken,
  validateToken.onlyAdmins,
  controllerPar.getParById
);
routerCampos.put(
  "/par/update/:id",
  validateToken.authenticateToken,
  validateToken.onlyAdmins,
  controllerPar.updatePar
);


// (Pct) Plano de Contas-----------------------------------------------------------

routerCampos.get(
  "/pct/:page/:pageSize",
  validateToken.authenticateToken,
  validateToken.onlyAdmins,
  controllerPct.getAllPct
);
routerCampos.post(
  "/pct/inserir",
  validateToken.authenticateToken,
  validateToken.onlyAdmins,
  controllerPct.Inserir
);
routerCampos.post(
  "/pct/post-pct",
  validateToken.authenticateToken,
  validateToken.onlyAdmins,
  controllerPct.InserirPct
);
routerCampos.delete(
  "/pct/delete/:id",
  validateToken.authenticateToken,
  validateToken.onlyAdmins,
  controllerPct.deletePct
);
routerCampos.get(
  "/pct/:id",
  validateToken.authenticateToken,
  validateToken.onlyAdmins,
  controllerPct.getPctById
);
routerCampos.put(
  "/pct/update/:id",
  validateToken.authenticateToken,
  validateToken.onlyAdmins,
  controllerPct.updatePct
);


// (Lnc) Lançamentos Contábeis------------------------------------------------------

routerCampos.get(
  "/lnc/:page/:pageSize",
  validateToken.authenticateToken,
  validateToken.onlyAdmins,
  controllerLnc.getAllLnc
);
routerCampos.get(
  "/lnc/getInvalid",
  validateToken.authenticateToken,
  validateToken.onlyAdmins,
  controllerLnc.getInvalid
);
routerCampos.post(
  "/lnc/inserir",
  validateToken.authenticateToken,
  validateToken.onlyAdmins,
  controllerLnc.Inserir
);

routerCampos.post(
  "/lnc/recarregar-data-adicional",
  validateToken.authenticateToken,
  validateToken.onlyAdmins,
  controllerLnc.recarregarData
)

routerCampos.post(
  "/lnc/post-lnc",
  validateToken.authenticateToken,
  validateToken.onlyAdmins,
  controllerLnc.InserirLnc
);
routerCampos.delete(
  "/lnc/delete/:id",
  validateToken.authenticateToken,
  validateToken.onlyAdmins,
  controllerLnc.deleteLnc
);
routerCampos.get(
  "/lnc/:id",
  validateToken.authenticateToken,
  validateToken.onlyAdmins,
  controllerLnc.getLncById
);
routerCampos.put(
  "/lnc/update/:id",
  validateToken.authenticateToken,
  validateToken.onlyAdmins,
  controllerLnc.updateLnc
);


// (Dmr) Decreto Municipal Regulamentador do Pregão / Registro de preços-----------------

routerCampos.get(
  "/dmr/:page/:pageSize",
  validateToken.authenticateToken,
  validateToken.onlyAdmins,
  controllerDmr.getAllDmr
);
routerCampos.post(
  "/dmr/inserir",
  validateToken.authenticateToken,
  validateToken.onlyAdmins,
  controllerDmr.Inserir
);
routerCampos.post(
  "/dmr/post-dmr",
  validateToken.authenticateToken,
  validateToken.onlyAdmins,
  controllerDmr.InserirDmr
);
routerCampos.delete(
  "/dmr/delete/:id",
  validateToken.authenticateToken,
  validateToken.onlyAdmins,
  controllerDmr.deleteDmr
);
routerCampos.get(
  "/dmr/:id",
  validateToken.authenticateToken,
  validateToken.onlyAdmins,
  controllerDmr.getDmrById
);
routerCampos.put(
  "/dmr/update/:id",
  validateToken.authenticateToken,
  validateToken.onlyAdmins,
  controllerDmr.updateDmr
);


// (Abl) Abertura da Licitação----------------------------------------------------------

routerCampos.get(
  "/abl/:page/:pageSize",
  validateToken.authenticateToken,
  validateToken.onlyAdmins,
  controllerAbl.getAllAbl
);
routerCampos.post(
  "/abl/inserir",
  validateToken.authenticateToken,
  validateToken.onlyAdmins,
  controllerAbl.Inserir
);
routerCampos.post(
  "/abl/post-abl",
  validateToken.authenticateToken,
  validateToken.onlyAdmins,
  controllerAbl.InserirAbl
);
routerCampos.delete(
  "/abl/delete/:id",
  validateToken.authenticateToken,
  validateToken.onlyAdmins,
  controllerAbl.deleteAbl
);
routerCampos.get(
  "/abl/:id",
  validateToken.authenticateToken,
  validateToken.onlyAdmins,
  controllerAbl.getAblById
);
routerCampos.put(
  "/abl/update/:id",
  validateToken.authenticateToken,
  validateToken.onlyAdmins,
  controllerAbl.updateAbl
);


// (Rpl) Responsável pela Licitação--------------------------------------------------

routerCampos.get(
  "/rpl/:page/:pageSize",
  validateToken.authenticateToken,
  validateToken.onlyAdmins,
  controllerRpl.getAllRpl
);
routerCampos.post(
  "/rpl/inserir",
  validateToken.authenticateToken,
  validateToken.onlyAdmins,
  controllerRpl.Inserir
);
routerCampos.post(
  "/rpl/post-rpl",
  validateToken.authenticateToken,
  validateToken.onlyAdmins,
  controllerRpl.InserirRpl
);
routerCampos.delete(
  "/rpl/delete/:id",
  validateToken.authenticateToken,
  validateToken.onlyAdmins,
  controllerRpl.deleteRpl
);
routerCampos.get(
  "/rpl/:id",
  validateToken.authenticateToken,
  validateToken.onlyAdmins,
  controllerRpl.getRplById
);
routerCampos.put(
  "/rpl/update/:id",
  validateToken.authenticateToken,
  validateToken.onlyAdmins,
  controllerRpl.updateRpl
);


// (Hbl) Habilitação da Licitação------------------------------------------------

routerCampos.get(
  "/hbl/:page/:pageSize",
  validateToken.authenticateToken,
  validateToken.onlyAdmins,
  controllerHbl.getAllHbl
);
routerCampos.post(
  "/hbl/inserir",
  validateToken.authenticateToken,
  validateToken.onlyAdmins,
  controllerHbl.Inserir
);
routerCampos.post(
  "/hbl/post-hbl",
  validateToken.authenticateToken,
  validateToken.onlyAdmins,
  controllerHbl.InserirHbl
);
routerCampos.delete(
  "/hbl/delete/:id",
  validateToken.authenticateToken,
  validateToken.onlyAdmins,
  controllerHbl.deleteHbl
);
routerCampos.get(
  "/hbl/:id",
  validateToken.authenticateToken,
  validateToken.onlyAdmins,
  controllerHbl.getHblById
);
routerCampos.put(
  "/hbl/update/:id",
  validateToken.authenticateToken,
  validateToken.onlyAdmins,
  controllerHbl.updateHbl
);


// (Jgl) Julgamento da Licitação----------------------------------------------------

routerCampos.get(
  "/jgl/:page/:pageSize",
  validateToken.authenticateToken,
  validateToken.onlyAdmins,
  controllerJgl.getAllJgl
);
routerCampos.post(
  "/jgl/inserir",
  validateToken.authenticateToken,
  validateToken.onlyAdmins,
  controllerJgl.Inserir
);
routerCampos.post(
  "/jgl/post-jgl",
  validateToken.authenticateToken,
  validateToken.onlyAdmins,
  controllerJgl.InserirJgl
);
routerCampos.delete(
  "/jgl/delete/:id",
  validateToken.authenticateToken,
  validateToken.onlyAdmins,
  controllerJgl.deleteJgl
);
routerCampos.get(
  "/jgl/:id",
  validateToken.authenticateToken,
  validateToken.onlyAdmins,
  controllerJgl.getJglById
);
routerCampos.put(
  "/jgl/update/:id",
  validateToken.authenticateToken,
  validateToken.onlyAdmins,
  controllerJgl.updateJgl
);


// (Hml) Homologação da Licitação------------------------------------------------

routerCampos.get(
  "/hml/:page/:pageSize",
  validateToken.authenticateToken,
  validateToken.onlyAdmins,
  controllerHml.getAllHml
);
routerCampos.post(
  "/hml/inserir",
  validateToken.authenticateToken,
  validateToken.onlyAdmins,
  controllerHml.Inserir
);
routerCampos.post(
  "/hml/post-hml",
  validateToken.authenticateToken,
  validateToken.onlyAdmins,
  controllerHml.InserirHml
);
routerCampos.delete(
  "/hml/delete/:id",
  validateToken.authenticateToken,
  validateToken.onlyAdmins,
  controllerHml.deleteHml
);
routerCampos.get(
  "/hml/:id",
  validateToken.authenticateToken,
  validateToken.onlyAdmins,
  controllerHml.getHmlById
);
routerCampos.put(
  "/hml/update/:id",
  validateToken.authenticateToken,
  validateToken.onlyAdmins,
  controllerHml.updateHml
);


// (Prl) Parecer da Licitação----------------------------------------------------------

routerCampos.get(
  "/prl/:page/:pageSize",
  validateToken.authenticateToken,
  validateToken.onlyAdmins,
  controllerPrl.getAllPrl
);
routerCampos.post(
  "/prl/inserir",
  validateToken.authenticateToken,
  validateToken.onlyAdmins,
  controllerPrl.Inserir
);
routerCampos.post(
  "/prl/post-prl",
  validateToken.authenticateToken,
  validateToken.onlyAdmins,
  controllerPrl.InserirPrl
);
routerCampos.delete(
  "/prl/delete/:id",
  validateToken.authenticateToken,
  validateToken.onlyAdmins,
  controllerPrl.deletePrl
);
routerCampos.get(
  "/prl/:id",
  validateToken.authenticateToken,
  validateToken.onlyAdmins,
  controllerPrl.getPrlById
);
routerCampos.put(
  "/prl/update/:id",
  validateToken.authenticateToken,
  validateToken.onlyAdmins,
  controllerPrl.updatePrl
);


// (Arp) Adesão a Registro de Preços-------------------------------------------------

routerCampos.get(
  "/arp/:page/:pageSize",
  validateToken.authenticateToken,
  validateToken.onlyAdmins,
  controllerArp.getAllArp
);
routerCampos.post(
  "/arp/inserir",
  validateToken.authenticateToken,
  validateToken.onlyAdmins,
  controllerArp.Inserir
);
routerCampos.post(
  "/arp/post-arp",
  validateToken.authenticateToken,
  validateToken.onlyAdmins,
  controllerArp.InserirArp
);
routerCampos.delete(
  "/arp/delete/:id",
  validateToken.authenticateToken,
  validateToken.onlyAdmins,
  controllerArp.deleteArp
);
routerCampos.get(
  "/arp/:id",
  validateToken.authenticateToken,
  validateToken.onlyAdmins,
  controllerArp.getArpById
);
routerCampos.put(
  "/arp/update/:id",
  validateToken.authenticateToken,
  validateToken.onlyAdmins,
  controllerArp.updateArp
);


// (Dsi) Dispensa ou Inexigibilidade-------------------------------------------------

routerCampos.get(
  "/dsi/:page/:pageSize",
  validateToken.authenticateToken,
  validateToken.onlyAdmins,
  controllerDsi.getAllDsi
);
routerCampos.post(
  "/dsi/inserir",
  validateToken.authenticateToken,
  validateToken.onlyAdmins,
  controllerDsi.Inserir
);
routerCampos.post(
  "/dsi/post-dsi",
  validateToken.authenticateToken,
  validateToken.onlyAdmins,
  controllerDsi.InserirDsi
);
routerCampos.delete(
  "/dsi/delete/:id",
  validateToken.authenticateToken,
  validateToken.onlyAdmins,
  controllerDsi.deleteDsi
);
routerCampos.get(
  "/dsi/:id",
  validateToken.authenticateToken,
  validateToken.onlyAdmins,
  controllerDsi.getDsiById
);
routerCampos.put(
  "/dsi/update/:id",
  validateToken.authenticateToken,
  validateToken.onlyAdmins,
  controllerDsi.updateDsi
);


// RECo -------------------------------------------

routerCampos.get(
  "/reco/:page/:pageSize",
  validateToken.authenticateToken,
  validateToken.onlyAdmins,
  controllerReco.getAllRecO
);
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


// RECo -------------------------------------------

routerCampos.get(
  "/dspo/:page/:pageSize",
  validateToken.authenticateToken,
  validateToken.onlyAdmins,
  controllerDspo.getAllDspO
);
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
