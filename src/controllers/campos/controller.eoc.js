import { db } from "../../database/postgres.js";

async function Inserir(req, res) {
  try {
    const eoc = req.body;

    await db("eoc").insert(eoc);

    return res.status(200).json({ message: "ok" });
  } catch (error) {
    console.error(
      "error from Inserir function from /controllers/controller.eoc.js",
      error
    );
    return res.status(500).json({ message: "Ocorreu um erro interno no servidor." });
  }
}

async function InserirEoc(req, res) { 
  const { text, data } = req.body;
  const eoc = [];

  try {
    const lines = await text.split("\n");

    let dataHelper = -1;

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];

      if (line.slice(0, 2) !== "99") {
        if (line.substring(0, 2) === "10") {
          dataHelper++;
          eoc.push({
            data,
            content: {
              tipoRegistro: line.slice(0, 2).trim(),
              codPrograma: line.slice(2, 6).trim(),
              codOrgao: line.slice(6, 8).trim(),
              codUnidade: line.slice(8, 10).trim(),
              codFuncao: line.slice(10, 12).trim(),
              codSubFuncao: line.slice(12, 15).trim(),
              naturezaAcao: line.slice(15, 16).trim(),
              nroProjAtiv: line.slice(16, 19).trim(),
              elementoDespesa: line.slice(19, 25).trim(),
              subElemento: line.slice(25, 27).trim(),
              nroEmpenho: line.slice(27, 33).trim(),
              nroSequencial: line.slice(71, 77).trim(),
              content: [],
              line
            },
          });
        } else if (line.substring(0, 2) === "11") {
          if (
            eoc[dataHelper] &&
            eoc[dataHelper].content &&
            Array.isArray(eoc[dataHelper].content.content)
          ) {
            eoc[dataHelper].content.content.push({
              tipoRegistro: line.slice(0, 2).trim(),
              codPrograma: line.slice(2, 6).trim(),
              codOrgao: line.slice(6, 8).trim(),
              codUnidade: line.slice(8, 10).trim(),
              codFuncao: line.slice(10, 12).trim(),
              codSubFuncao: line.slice(12, 15).trim(),
              naturezaAcao: line.slice(15, 16).trim(),
              nroProjAtiv: line.slice(16, 19).trim(),
              elementoDespesa: line.slice(19, 25).trim(),
              subElemento: line.slice(25, 27).trim(),
              nroEmpenho: line.slice(27, 33).trim(),
              codUnidadeObra: line.slice(33, 35).trim(),
              codObra: line.slice(35, 39).trim(),
              anoObra: line.slice(39, 43).trim(),
              vlAssociadoObra: line.slice(43, 56).trim(),
              nroSequencial: line.slice(71, 77).trim(),
              line
            });
          }
        } else if (line.substring(0, 2) === "12") {
          if (
            eoc[dataHelper] &&
            eoc[dataHelper].content &&
            Array.isArray(eoc[dataHelper].content.content)
          ) {
            eoc[dataHelper].content.content.push({
              tipoRegistro: line.slice(0, 2).trim(),
              codPrograma: line.slice(2, 6).trim(),
              codOrgao: line.slice(6, 8).trim(),
              codUnidade: line.slice(8, 10).trim(),
              codFuncao: line.slice(10, 12).trim(),
              codSubFuncao: line.slice(12, 15).trim(),
              naturezaAcao: line.slice(15, 16).trim(),
              nroProjAtiv: line.slice(16, 19).trim(),
              elementoDespesa: line.slice(19, 25).trim(),
              subElemento: line.slice(25, 27).trim(),
              nroEmpenho: line.slice(27, 33).trim(),
              codUnidadeContrato: line.slice(33, 35).trim(),
              nroContrato: line.slice(35, 55).trim(),
              anoContrato: line.slice(55, 59).trim(),
              tipoAjuste: line.slice(59, 60).trim(),
              vlAssociadoContrato: line.slice(60, 71).trim(),
              nroSequencial: line.slice(71, 77).trim(),
              line
            });
          }
        }
      }
    }

    await db.batchInsert(`${req.body.sch}.eoc`, eoc, 75);

    return res.status(200).json({ message: "EOC inserido com sucesso!" });
  } catch (error) {
    console.error(
      "error from InserirEoc function from /controllers/controller.eoc.js",
      error
    );
    return res.status(500).json({ message: "Ocorreu um erro interno no servidor." });
  }
}
async function deleteEoc(req, res) {
  const { id } = req.params;
  try {
    await db("eoc").delete().where({ id: id });
    return res.status(200).json({ message: "Registro removido com sucesso!" });
  } catch (error) {
    console.error(
      "error from Inserir deleteEoc from /controllers/controller.eoc.js",
      error
    );
    return res.status(500).json({ message: "Ocorreu um erro interno no servidor." });
  }
}

async function getEocById(req, res) {
  const { id } = req.params;
  try {
    const eoc = await db("eoc").where({ id: id }).first();
    if (!eoc) {
      return res.status(404).json({ message: "Registro não encontrado." });
    }
    return res.status(200).json(eoc);
  } catch (error) {
    console.error(
      "error from getEocById function from /controllers/controller.eoc.js",
      error
    );
    return res.status(500).json({ message: "Ocorreu um erro interno no servidor." });
  }
}

async function updateEoc(req, res) {
  const { id } = req.params;
  
  const eocData = req.body;
  const body = eocData.body;
  const index = eocData.index;
  const tipoReg = body[0].value;
  try {
    let insert = {};
    for (const item of body) {
      Object.assign(insert, { [item.type]: item.value });
    }
    Object.assign(insert, { tipoRegistro: tipoReg });
    const toUpdate = await db("eoc").select().where({ id: id });

    if (toUpdate.length == 0) {
      return res.status(404).json({ message: "Eoc não encontrado." });
    }

    if (insert.tipoRegistro == 10) {
      insert.content = await toUpdate[0].content.content;
      
      await db("eoc").where({ id }).update({ content: insert }).returning("*");
    } else {
      
      toUpdate[0].content.content[index] = insert;
      await db("eoc").where({ id }).update({ content: toUpdate[0].content });
    }
    return res.status(200).json({ message: "got here!" });
  } catch (error) {
    console.error(
      "error from updateEoc function from /controllers/controller.eoc.js",
      error
    );
    return res.status(500).json({ message: "Ocorreu um erro interno no servidor." });
  }
}

async function InserirEocManual(req, res) {
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
    await db("eoc").insert(insert);
    return res.status(200).json({ message: "Registro inserido com sucesso!" });
  } catch (error) {
    console.error(
      "error from InserirEocManual function from /controllers/controller.eoc.js",
      error
    );
    return res.status(500).json({ message: "Ocorreu um erro interno no servidor." });
  }
}

export default {
  Inserir,
  InserirEoc,
  deleteEoc,
  getEocById,
  updateEoc,
  InserirEocManual,
};

