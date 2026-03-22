import { db } from "../../database/postgres.js";
async function getAllHbl(req, res) {
  // Paginacao
  let { page, pageSize } = req.params;
  page = parseInt(page, 10);
  pageSize = parseInt(pageSize, 10);
  if (isNaN(page) || page < 0) page = 0;
  if (isNaN(pageSize) || pageSize <= 0) pageSize = 10;
  const { mes, ano, org } = req.query;

  try {
    let query = db("hbl");

    if (mes) {
      query = query.whereRaw("SUBSTRING(data, 1, 2) = ?", [
        mes.padStart(2, "0"),
      ]);
    }
    if (org) {
      query = query.whereRaw(`content ->> 'codOrgao' = '${String(org).padStart(2, "0")}'`)
    }
    if (ano) {
      query = query.whereRaw("SUBSTRING(data, 3, 2) = ?", [
        String(ano).substring(2, 4),
      ]);
    }

    const totalCount = await query.clone().count("* as count");
    const total = Math.ceil(totalCount[0]?.count / pageSize);

    if (Number(page) >= Number(total)) {
      page = Math.max(0, total - 1);
    }

    const response = await query
      .clone()
      .select("*")
      .orderBy("id", "asc")
      .offset(page * pageSize)
      .limit(pageSize);

    return res.status(200).json({ response, totalPages: total, currentPage: page });
  } catch (error) {
    console.error(
      "error from getAllHbl function from /controllers/controller.hbl.js",
      error
    );
    return res.status(500).json({ message: "Ocorreu um erro interno no servidor." });
  }
}

async function Inserir(req, res) {
  try {
    const hbl = req.body;

    await db("hbl").insert(hbl);

    return res.status(200).json({ message: "ok" });
  } catch (error) {
    console.error(
      "error from Inserir function from /controllers/controller.hbl.js",
      error
    );
    return res.status(500).json({ message: "Ocorreu um erro interno no servidor." });
  }
}

async function InserirHbl(req, res) { 
  const { text, data } = req.body;
  const hbl = [];

  try {
    const lines = await text.split("\n");

    let dataHelper = -1;

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];

      if (line.slice(0, 2) !== "99") {
        if (line.substring(0, 2) === "10") {
          dataHelper++;
          hbl.push({
            data,
            content: {
              tipoRegistro: line.slice(0, 2).trim(),
              codOrgao: line.slice(2, 4).trim(),
              codUnidade: line.slice(4, 6).trim(),
              exercicioLicitacao: line.slice(6, 10).trim(),
              nroProcessoLicitatorio: line.slice(10, 22).trim(),
              tipoDocumento: line.slice(22, 23).trim(),
              nroDocumento: line.slice(23, 37).trim(),
              nomeRazaoSocial: line.slice(37, 137).trim(),
              objetoSocial: line.slice(137, 637).trim(),
              orgaoRespRegistro: line.slice(637, 737).trim(),
              dataRegistro: line.slice(738, 745).trim(),
              nroRegistro: line.slice(745, 760).trim(),
              dataRegistroCVM: line.slice(760, 768).trim(),
              nroRegistroCVM: line.slice(768, 783).trim(),
              nroInscricaoEstadual: line.slice(783, 798).trim(),
              ufInscricaoEstadual: line.slice(798, 800).trim(),
              nroCertidaoRegularidadeINSS: line.slice(800, 820).trim(),
              dtEmissaoCertidaoRegularidadeINSS: line.slice(820, 828).trim(),
              dtValidadeCertidaoRegularidadeINSS: line.slice(828, 836).trim(),
              nroCertidaoRegularidadeFGTS: line.slice(836, 866).trim(),
              dtEmissaoCertidaoRegularidadeFGTS: line.slice(866, 874).trim(),
              dtValidadeCertidaoRegularidadeFGTS: line.slice(874, 882).trim(),
              nroCNDT: line.slice(882, 897).trim(),
              dtEmissaoCNDT: line.slice(897, 905).trim(),
              dtValidadeCNDT: line.slice(905, 913).trim(),
              dtHabilitacao: line.slice(913, 921).trim(),
              AtaPresençaLicitantes: line.slice(921, 922).trim(),
              renunciaRecurso: line.slice(922, 923).trim(),
              nroSequencial: line.slice(923, 929).trim(),
              content: [],
              line
            },
          });
        } else if (line.substring(0, 2) === "11") {
          if (
            hbl[dataHelper] &&
            hbl[dataHelper].content &&
            Array.isArray(hbl[dataHelper].content.content)
          ) {
            hbl[dataHelper].content.content.push({
              tipoRegistro: line.slice(0, 2).trim(),
              codOrgao: line.slice(2, 4).trim(),
              codUnidade: line.slice(4, 6).trim(),
              exercicioLicitacao: line.slice(6, 10).trim(),
              nroProcessoLicitatorio: line.slice(10, 22).trim(),
              nroCNPJ: line.slice(22, 36).trim(),
              tipoDocumentoSocio: line.slice(36, 37).trim(),
              nroDocumentoSocio: line.slice(37, 51).trim(),
              tipoParticipacao: line.slice(51, 52).trim(),
              nomeSocio: line.slice(52, 152).trim(),
              nroSequencial: line.slice(923, 929).trim(),
              line
            });
          }
        } else if (line.substring(0, 2) === "20") {
          if (
            hbl[dataHelper] &&
            hbl[dataHelper].content &&
            Array.isArray(hbl[dataHelper].content.content)
          ) {
            hbl[dataHelper].content.content.push({
              tipoRegistro: line.slice(0, 2).trim(),
              codOrgao: line.slice(2, 4).trim(),
              codUnidade: line.slice(4, 6).trim(),
              exercicioLicitacao: line.slice(6, 10).trim(),
              nroProcessoLicitatorio: line.slice(10, 22).trim(),
              tipoDocumentoSocio: line.slice(22, 23).trim(),
              nroDocumentoSocio: line.slice(23, 37).trim(),
              dataCredenciamento: line.slice(37, 45).trim(),
              nroLote: line.slice(45, 49).trim(),
              nroItem: line.slice(49, 53).trim(),
              nomRazaoSocial: line.slice(53, 153).trim(),
              nroInscricaoEstadual: line.slice(153, 168).trim(),
              ufInscricaoEstadual: line.slice(168, 170).trim(),
              nroCertidaoRegularidadeINSS: line.slice(170, 190).trim(),
              dtEmissaoCertidaoRegularidadeINSS: line.slice(190, 198).trim(),
              dtValidadeCertidaoRegularidadeINSS: line.slice(198, 206).trim(),
              nroCertidaoRegularidadeFGTS: line.slice(206, 236).trim(),
              dtEmissaoCertidaoRegularidadeFGTS: line.slice(236, 244).trim(),
              dtValidadeCertidaoRegularidadeFGTS: line.slice(244, 252).trim(),
              nroCNDT: line.slice(252, 267).trim(),
              dtEmissaoCNDT: line.slice(267, 275).trim(),
              dtValidadeCNDT: line.slice(275, 283).trim(),
              nroSequencial: line.slice(923, 929).trim(),
              line
            });
          }
        }
      }
    }

    await db.batchInsert("hbl", hbl, 75)

    return res.status(200).json({ message: "HBL inserido com sucesso!" });
  } catch (error) {
    console.error(
      "error from InserirHbl function from /controllers/controller.hbl.js",
      error
    );
    return res.status(500).json({ message: "Ocorreu um erro interno no servidor." });
  }
}
async function deleteHbl(req, res) {
  const { id } = req.params;
  try {
    await db("hbl").delete().where({ id: id });
    return res.status(200).json({ message: "Registro removido com sucesso!" });
  } catch (error) {
    console.error(
      "error from Inserir deleteHbl from /controllers/controller.hbl.js",
      error
    );
    return res.status(500).json({ message: "Ocorreu um erro interno no servidor." });
  }
}

async function getHblById(req, res) {
  const { id } = req.params;
  try {
    const hbl = await db("hbl").where({ id: id }).first();
    if (!hbl) {
      return res.status(404).json({ message: "Registro não encontrado." });
    }
    return res.status(200).json(hbl);
  } catch (error) {
    console.error(
      "error from getHblById function from /controllers/controller.hbl.js",
      error
    );
    return res.status(500).json({ message: "Ocorreu um erro interno no servidor." });
  }
}

async function updateHbl(req, res) {
  const { id } = req.params;
  
  const hblData = req.body;
  const body = hblData.body;
  const index = hblData.index;
  const tipoReg = body[0].value;
  try {
    let insert = {};
    for (const item of body) {
      Object.assign(insert, { [item.type]: item.value });
    }
    Object.assign(insert, { tipoRegistro: tipoReg });
    const toUpdate = await db("hbl").select().where({ id: id });

    if (toUpdate.length == 0) {
      return res.status(404).json({ message: "HBL não encontrado." });
    }

    if (insert.tipoRegistro == 10) {
      insert.content = await toUpdate[0].content.content;
      
      await db("hbl").where({ id }).update({ content: insert }).returning("*");
    } else {
      
      toUpdate[0].content.content[index] = insert;
      await db("hbl").where({ id }).update({ content: toUpdate[0].content });
    }
    return res.status(200).json({ message: "got here!" });
  } catch (error) {
    console.error(
      "error from updateHbl function from /controllers/controller.hbl.js",
      error
    );
    return res.status(500).json({ message: "Ocorreu um erro interno no servidor." });
  }
}

async function InserirHblManual(req, res) {
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
    await db("hbl").insert(insert);
    return res.status(200).json({ message: "Registro inserido com sucesso!" });
  } catch (error) {
    console.error(
      "error from InserirHblManual function from /controllers/controller.hbl.js",
      error
    );
    return res.status(500).json({ message: "Ocorreu um erro interno no servidor." });
  }
}

export default {
  getAllHbl,
  Inserir,
  InserirHbl,
  deleteHbl,
  getHblById,
  updateHbl,
  InserirHblManual,
};

