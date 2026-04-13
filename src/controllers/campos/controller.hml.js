import { db } from "../../database/postgres.js";

async function Inserir(req, res) {
  try {
    const hml = req.body;

    await db("hml").insert(hml);

    return res.status(200).json({ message: "ok" });
  } catch (error) {
    console.error(
      "error from Inserir function from /controllers/controller.hml.js",
      error
    );
    return res.status(500).json({ message: "Ocorreu um erro interno no servidor." });
  }
}

async function InserirHml(req, res) { 
  const { text, data } = req.body;
  const hml = [];

  try {
    const lines = await text.split("\n");

    let dataHelper = -1;

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];

      if (line.slice(0, 2) !== "99") {
        if (line.substring(0, 2) === "10") {
          dataHelper++;
          hml.push({
            data,
            content: {
              tipoRegistro: line.slice(0, 2).trim(),
              codOrgao: line.slice(2, 4).trim(),
              codUnidade: line.slice(4, 6).trim(),
              exercicioLicitacao: line.slice(6, 10).trim(),
              nroProcessoLicitatorio: line.slice(10, 22).trim(),
              tipoDocumento: line.slice(22, 23).trim(),
              nroDocumento: line.slice(23, 37).trim(),
              nroLote: line.slice(37, 41).trim(),
              nroItem: line.slice(41, 45).trim(),
              dscItem: line.slice(45, 295).trim(),
              quantidade: line.slice(295, 308).trim(),
              unidade: line.slice(308, 310).trim(),
              vlUnitarioHomologacao: line.slice(310, 323).trim(),
              nroSequencial: line.slice(323, 329).trim(),
              content: [],
              line
            },
          });
        } else if (line.substring(0, 2) === "20") {
          if (
            hml[dataHelper] &&
            hml[dataHelper].content &&
            Array.isArray(hml[dataHelper].content.content)
          ) {
            hml[dataHelper].content.content.push({
              tipoRegistro: line.slice(0, 2).trim(),
              codOrgao: line.slice(2, 4).trim(),
              codUnidade: line.slice(4, 6).trim(),
              exercicioLicitacao: line.slice(6, 10).trim(),
              nroProcessoLicitatorio: line.slice(10, 22).trim(),
              tipoDocumento: line.slice(22, 23).trim(),
              nroDocumento: line.slice(23, 37).trim(),
              nroLote: line.slice(37, 41).trim(),
              nroItem: line.slice(41, 45).trim(),
              percDesconto: line.slice(45, 58).trim(),
              nroSequencial: line.slice(323, 329).trim(),
              line
            });
          }
        } else if (line.substring(0, 2) === "30") {
          if (
            hml[dataHelper] &&
            hml[dataHelper].content &&
            Array.isArray(hml[dataHelper].content.content)
          ) {
            hml[dataHelper].content.content.push({
              tipoRegistro: line.slice(0, 2).trim(),
              codOrgao: line.slice(2, 4).trim(),
              codUnidade: line.slice(4, 6).trim(),
              exercicioLicitacao: line.slice(6, 10).trim(),
              nroProcessoLicitatorio: line.slice(10, 22).trim(),
              tipoDocumento: line.slice(22, 23).trim(),
              nroDocumento: line.slice(23, 37).trim(),
              dtHomologacao: line.slice(37, 45).trim(),
              dtAdjudicacao: line.slice(45, 53).trim(),
              nroSequencial: line.slice(323, 329).trim(),
              line
            });
          }
        }
      }
    }

    await db.batchInsert(`${req.body.sch}.hml`, hml, 75);

    return res.status(200).json({ message: "HML inserido com sucesso!" });
  } catch (error) {
    console.error(
      "error from Inserirhml function from /controllers/controller.hml.js",
      error
    );
    return res.status(500).json({ message: "Ocorreu um erro interno no servidor." });
  }
}
async function deleteHml(req, res) {
  const { id } = req.params;
  try {
    await db("hml").delete().where({ id: id });
    return res.status(200).json({ message: "Registro removido com sucesso!" });
  } catch (error) {
    console.error(
      "error from Inserir deleteHml from /controllers/controller.hml.js",
      error
    );
    return res.status(500).json({ message: "Ocorreu um erro interno no servidor." });
  }
}

async function getHmlById(req, res) {
  const { id } = req.params;
  try {
    const hml = await db("hml").where({ id: id }).first();
    if (!hml) {
      return res.status(404).json({ message: "Registro não encontrado." });
    }
    return res.status(200).json(hml);
  } catch (error) {
    console.error(
      "error from getHmlById function from /controllers/controller.hml.js",
      error
    );
    return res.status(500).json({ message: "Ocorreu um erro interno no servidor." });
  }
}

async function updateHml(req, res) {
  const { id } = req.params;
  
  const hmlData = req.body;
  const body = hmlData.body;
  const index = hmlData.index;
  const tipoReg = body[0].value;
  try {
    let insert = {};
    for (const item of body) {
      Object.assign(insert, { [item.type]: item.value });
    }
    Object.assign(insert, { tipoRegistro: tipoReg });
    const toUpdate = await db("hml").select().where({ id: id });

    if (toUpdate.length == 0) {
      return res.status(404).json({ message: "Hml não encontrado." });
    }

    if (insert.tipoRegistro == 10) {
      insert.content = await toUpdate[0].content.content;
      
      await db("hml").where({ id }).update({ content: insert }).returning("*");
    } else {
      
      toUpdate[0].content.content[index] = insert;
      await db("hml").where({ id }).update({ content: toUpdate[0].content });
    }
    return res.status(200).json({ message: "got here!" });
  } catch (error) {
    console.error(
      "error from updateHml function from /controllers/controller.hml.js",
      error
    );
    return res.status(500).json({ message: "Ocorreu um erro interno no servidor." });
  }
}

async function InserirHmlManual(req, res) {
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
    await db("hml").insert(insert);
    return res.status(200).json({ message: "Registro inserido com sucesso!" });
  } catch (error) {
    console.error(
      "error from InserirHmlManual function from /controllers/controller.hml.js",
      error
    );
    return res.status(500).json({ message: "Ocorreu um erro interno no servidor." });
  }
}

export default {
  Inserir,
  InserirHml,
  deleteHml,
  getHmlById,
  updateHml,
  InserirHmlManual,
};

