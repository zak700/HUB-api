import { db } from "../../database/postgres.js";

async function Inserir(req, res) {
  try {
    const dsi = req.body;

    await db("dsi").insert(dsi);

    return res.status(200).json({ message: "ok" });
  } catch (error) {
    console.error(
      "error from Inserir function from /controllers/controller.dsi.js",
      error
    );
    return res.status(500).json({ message: "Ocorreu um erro interno no servidor." });
  }
}

async function InserirDsi(req, res) { 
  const { text, data } = req.body;
  const dsi = [];

  try {
    const lines = await text.split("\n");

    let dataHelper = -1;

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];

      if (line.slice(0, 2) !== "99") {
        if (line.substring(0, 2) === "10") {
          dataHelper++;
          dsi.push({
            data,
            content: {
              tipoRegistro: line.slice(0, 2).trim(),
              codOrgao: line.slice(2, 4).trim(),
              codUnidade: line.slice(4, 6).trim(),
              nroProcesso: line.slice(6, 18).trim(),
              anoExercicioProcesso: line.slice(18, 22).trim(),
              tipoProcesso: line.slice(22, 23).trim(),
              dtAbertura: line.slice(23, 31).trim(),
              naturezaObjeto: line.slice(31, 32).trim(),
              objeto: line.slice(32, 282).trim(),
              Justificativa: line.slice(282, 532).trim(),
              Razão: line.slice(532, 782).trim(),
              dtPublicacaoTermoRatificacao: line.slice(782, 790).trim(),
              veiculoPublicacao: line.slice(790, 1040).trim(),
              nroSequencial: line.slice(1040, 1046).trim(),
              content: [],
              line
            },
          });
        } else if (line.substring(0, 2) === "11") {
          if (
            dsi[dataHelper] &&
            dsi[dataHelper].content &&
            Array.isArray(dsi[dataHelper].content.content)
          ) {
            dsi[dataHelper].content.content.push({
              tipoRegistro: line.slice(0, 2).trim(),
              codOrgao: line.slice(2, 4).trim(),
              codUnidade: line.slice(4, 6).trim(),
              nroProcesso: line.slice(6, 18).trim(),
              anoExercicioProcesso: line.slice(18, 22).trim(),
              tipoProcesso: line.slice(22, 23).trim(),
              tipoResp: line.slice(23, 24).trim(),
              nroCPFResponsavel: line.slice(24, 35).trim(),
              nomeResp: line.slice(35, 135).trim(),
              logradouro: line.slice(135, 185).trim(),
              setor: line.slice(185, 205).trim(),
              cidade: line.slice(205, 225).trim(),
              uf: line.slice(225, 227).trim(),
              CEP: line.slice(227, 235).trim(),
              telefone: line.slice(235, 245).trim(),
              email: line.slice(245, 325).trim(),
              nroSequencial: line.slice(1040, 1046).trim(),
              line
            });
          }
        } else if (line.substring(0, 2) === "12") {
          if (
            dsi[dataHelper] &&
            dsi[dataHelper].content &&
            Array.isArray(dsi[dataHelper].content.content)
          ) {
            dsi[dataHelper].content.content.push({
              tipoRegistro: line.slice(0, 2).trim(),
              codOrgao: line.slice(2, 4).trim(),
              codUnidade: line.slice(4, 6).trim(),
              nroProcesso: line.slice(6, 18).trim(),
              anoExercicioProcesso: line.slice(18, 22).trim(),
              tipoProcesso: line.slice(22, 23).trim(),
              nroLote: line.slice(23, 27).trim(),
              nroItem: line.slice(27, 31).trim(),
              dscItem: line.slice(31, 281).trim(),
              vlCotPrecosUnitario: line.slice(281, 294).trim(),
              nroSequencial: line.slice(1040, 1046).trim(),
              line
            });
          }
        } else if (line.substring(0, 2) === "13") {
          if (
            dsi[dataHelper] &&
            dsi[dataHelper].content &&
            Array.isArray(dsi[dataHelper].content.content)
          ) {
            dsi[dataHelper].content.content.push({
              tipoRegistro: line.slice(0, 2).trim(),
              codOrgao: line.slice(2, 4).trim(),
              codUnidade: line.slice(4, 6).trim(),
              nroProcesso: line.slice(6, 18).trim(),
              anoExercicioProcesso: line.slice(18, 22).trim(),
              tipoProcesso: line.slice(22, 23).trim(),
              codFuncao: line.slice(23, 25).trim(),
              codSubfuncao: line.slice(25, 28).trim(),
              codPrograma: line.slice(28, 32).trim(),
              naturezaAcao: line.slice(32, 33).trim(),
              nroProjAtiv: line.slice(33, 36).trim(),
              elementoDespesa: line.slice(36, 42).trim(),
              subElemento: line.slice(42, 44).trim(),
              codFonteRecurso: line.slice(44, 50).trim(),
              valorRecurso: line.slice(50, 63).trim(),
              nroSequencial: line.slice(1040, 1046).trim(),
              line
            });
          }
        } else if (line.substring(0, 2) === "14") {
          if (
            dsi[dataHelper] &&
            dsi[dataHelper].content &&
            Array.isArray(dsi[dataHelper].content.content)
          ) {
            dsi[dataHelper].content.content.push({
              tipoRegistro: line.slice(0, 2).trim(),
              codOrgao: line.slice(2, 4).trim(),
              codUnidade: line.slice(4, 6).trim(),
              nroProcesso: line.slice(6, 18).trim(),
              anoExercicioProcesso: line.slice(18, 22).trim(),
              tipoProcesso: line.slice(22, 23).trim(),
              tipoDocumento: line.slice(23, 24).trim(),
              nroDocumento: line.slice(24, 38).trim(),
              nroLote: line.slice(38, 42).trim(),
              nroItem: line.slice(42, 46).trim(),
              nomeRazaoSocial: line.slice(46, 146).trim(),
              nroInscricaoEstadual: line.slice(146, 161).trim(),
              ufInscricaoEstadual: line.slice(161, 163).trim(),
              nroCertidaoRegularidadeINSS: line.slice(163, 183).trim(),
              dtEmissaoCertidaoRegularidadeINSS: line.slice(183, 191).trim(),
              dtValidadeCertidaoRegularidadeINSS: line.slice(191, 199).trim(),
              nroCertidaoRegularidadeFGTS: line.slice(199, 229).trim(),
              dtEmissaoCertidaoRegularidadeFGTS: line.slice(229, 237).trim(),
              dtValidadeCertidaoRegularidadeFGTS: line.slice(237, 245).trim(),
              dtEmissaoCNDT: line.slice(245, 260).trim(),
              dtValidadeCNDT: line.slice(260, 268).trim(),
              quantidade: line.slice(268, 276).trim(),
              valorItem: line.slice(276, 289).trim(),
              nroSequencial: line.slice(1040, 1046).trim(),
              line
            });
          }
        } else if (line.substring(0, 2) === "15") {
          if (
            dsi[dataHelper] &&
            dsi[dataHelper].content &&
            Array.isArray(dsi[dataHelper].content.content)
          ) {
            dsi[dataHelper].content.content.push({
              tipoRegistro: line.slice(0, 2).trim(),
              codOrgao: line.slice(2, 4).trim(),
              codUnidade: line.slice(4, 6).trim(),
              nroProcesso: line.slice(6, 18).trim(),
              anoExercicioProcesso: line.slice(18, 22).trim(),
              tipoProcesso: line.slice(22, 23).trim(),
              tipoDocumento: line.slice(23, 24).trim(),
              nroDocumento: line.slice(24, 38).trim(),
              dataCredenciamento: line.slice(38, 46).trim(),
              nroLote: line.slice(46, 50).trim(),
              nroItem: line.slice(50, 54).trim(),
              nomeRazaoSocial: line.slice(54, 154).trim(),
              nroInscricaoEstadual: line.slice(154, 169).trim(),
              ufInscricaoEstadual: line.slice(169, 171).trim(),
              nroCertidaoRegularidadeINSS: line.slice(171, 191).trim(),
              dtEmissaoCertidaoRegularidadeINSS: line.slice(191, 199).trim(),
              dtValidadeCertidaoRegularidadeINSS: line.slice(199, 207).trim(),
              nroCertidaoRegularidadeFGTS: line.slice(207, 237).trim(),
              dtEmissaoCertidaoRegularidadeFGTS: line.slice(237, 245).trim(),
              dtValidadeCertidaoRegularidadeFGTS: line.slice(245, 253).trim(),
              nroCNDT: line.slice(253, 268).trim(),
              dtEmissaoCNDT: line.slice(268, 276).trim(),
              dtValidadeCNDT: line.slice(276, 284).trim(),
              nroSequencial: line.slice(1040, 1046).trim(),
              line
            });
          }
        }
      }
    }

    await db.batchInsert(`${req.body.sch}.dsi`, dsi, 75);

    return res.status(200).json({ message: "DSI inserido com sucesso!" });
  } catch (error) {
    console.error(
      "error from InserirEmp function from /controllers/controller.dsi.js",
      error
    );
    return res.status(500).json({ message: "Ocorreu um erro interno no servidor." });
  }
}
async function deleteDsi(req, res) {
  const { id } = req.params;
  try {
    await db("dsi").delete().where({ id: id });
    return res.status(200).json({ message: "Registro removido com sucesso!" });
  } catch (error) {
    console.error(
      "error from Inserir deleteDsifrom /controllers/controller.dsi.js",
      error
    );
    return res.status(500).json({ message: "Ocorreu um erro interno no servidor." });
  }
}

async function getDsiById(req, res) {
  const { id } = req.params;
  try {
    const dsi = await db("dsi").where({ id: id }).first();
    if (!dsi) {
      return res.status(404).json({ message: "Registro não encontrado." });
    }
    return res.status(200).json(dsi);
  } catch (error) {
    console.error(
      "error from getDsiById function from /controllers/controller.dsi.js",
      error
    );
    return res.status(500).json({ message: "Ocorreu um erro interno no servidor." });
  }
}

async function updateDsi(req, res) {
  const { id } = req.params;
  
  const dsiData = req.body;
  const body = dsiData.body;
  const index = dsiData.index;
  const tipoReg = body[0].value;
  try {
    let insert = {};
    for (const item of body) {
      Object.assign(insert, { [item.type]: item.value });
    }
    Object.assign(insert, { tipoRegistro: tipoReg });
    const toUpdate = await db("dsi").select().where({ id: id });

    if (toUpdate.length == 0) {
      return res.status(404).json({ message: "Dsi não encontrado." });
    }

    if (insert.tipoRegistro == 10) {
      insert.content = await toUpdate[0].content.content;
      
      await db("dsi").where({ id }).update({ content: insert }).returning("*");
    } else {
      
      toUpdate[0].content.content[index] = insert;
      await db("dsi").where({ id }).update({ content: toUpdate[0].content });
    }
    return res.status(200).json({ message: "got here!" });
  } catch (error) {
    console.error(
      "error from updateDsi function from /controllers/controller.dsi.js",
      error
    );
    return res.status(500).json({ message: "Ocorreu um erro interno no servidor." });
  }
}

async function InserirDsiManual(req, res) {
  const { body } = req.body;
  const { data } = req.body;
  try {
    let dataHelper = null;
    let insert = {};
    for (const item of body) {
      if (item.type === "tipoRegistro") {
        dataHelper = item.value;
        insert[item.value] = {};
        continue;
      }
      insert[dataHelper][item.type] = item.value;
    }
    insert.data = data;
    await db("dsi").insert(insert);
    return res.status(200).json({ message: "Registro inserido com sucesso!" });
  } catch (error) {
    console.error(
      "error from InserirDsiManual function from /controllers/controller.dsi.js",
      error
    );
    return res.status(500).json({ message: "Ocorreu um erro interno no servidor." });
  }
}

export default {
  Inserir,
  InserirDsi,
  deleteDsi,
  getDsiById,
  updateDsi,
  InserirDsiManual,
};

