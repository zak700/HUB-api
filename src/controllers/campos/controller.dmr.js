import { db } from "../../database/postgres.js";

async function Inserir(req, res) {
  try {
    const dmr = req.body;

    await db("dmr").insert(dmr);

    return res.status(200).json({ message: "ok" });
  } catch (error) {
    console.error(
      "error from Inserir function from /controllers/controller.dmr.js",
      error
    );
    return res.status(500).json({ message: "Ocorreu um erro interno no servidor." });
  }
}

async function InserirDmr(req, res) { 
  const { text, data } = req.body;
  const dmr = [];

  try {
    const lines = await text.split("\n");

    let dataHelper = -1;

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];

      if (line.slice(0, 2) !== "99") {
        if (line.substring(0, 2) === "10") {
          dataHelper++;
          dmr.push({
            data,
            content: {
              tipoRegistro: line.slice(0, 2).trim(),
              codOrgao: line.slice(2, 4).trim(),
              tipo: line.slice(4, 5).trim(),
              nroDecretoMunicipal: line.slice(5, 13).trim(),
              dataDecretoMunicipal: line.slice(13, 21).trim(),
              dataPublicacaoDecretoMunicipal: line.slice(21, 29).trim(),
              nroSequencial: line.slice(29, 35).trim(),
              content: [],
              line
            },
          });
        }
      }
    }

    await db.batchInsert(`${req.body.sch}.dmr`, dmr, 75);

    return res.status(200).json({ message: "DMR inserido com sucesso!" });
  } catch (error) {
    console.error(
      "error from InserirDmr function from /controllers/controller.dmr.js",
      error
    );
    return res.status(500).json({ message: "Ocorreu um erro interno no servidor." });
  }
}
async function deleteDmr(req, res) {
  const { id } = req.params;
  try {
    await db("dmr").delete().where({ id: id });
    return res.status(200).json({ message: "Registro removido com sucesso!" });
  } catch (error) {
    console.error(
      "error from Inserir deleteDmr from /controllers/controller.dmr.js",
      error
    );
    return res.status(500).json({ message: "Ocorreu um erro interno no servidor." });
  }
}

async function getDmrById(req, res) {
  const { id } = req.params;
  try {
    const dmr = await db("dmr").where({ id: id }).first();
    if (!dmr) {
      return res.status(404).json({ message: "Registro não encontrado." });
    }
    return res.status(200).json(dmr);
  } catch (error) {
    console.error(
      "error from getDmrById function from /controllers/controller.dmr.js",
      error
    );
    return res.status(500).json({ message: "Ocorreu um erro interno no servidor." });
  }
}

async function updateDmr(req, res) {
  const { id } = req.params;
  
  const dmrData = req.body;
  const body = dmrData.body;
  const index = dmrData.index;
  const tipoReg = body[0].value;
  try {
    let insert = {};
    for (const item of body) {
      Object.assign(insert, { [item.type]: item.value });
    }
    Object.assign(insert, { tipoRegistro: tipoReg });
    const toUpdate = await db("dmr").select().where({ id: id });

    if (toUpdate.length == 0) {
      return res.status(404).json({ message: "DMR não encontrado." });
    }

    if (insert.tipoRegistro == 10) {
      insert.content = await toUpdate[0].content.content;
      
      await db("dmr").where({ id }).update({ content: insert }).returning("*");
    } else {
      
      toUpdate[0].content.content[index] = insert;
      await db("dmr").where({ id }).update({ content: toUpdate[0].content });
    }
    return res.status(200).json({ message: "got here!" });
  } catch (error) {
    console.error(
      "error from updateDmr function from /controllers/controller.dmr.js",
      error
    );
    return res.status(500).json({ message: "Ocorreu um erro interno no servidor." });
  }
}

async function InserirDmrManual(req, res) {
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
    await db("dmr").insert(insert);
    return res.status(200).json({ message: "Registro inserido com sucesso!" });
  } catch (error) {
    console.error(
      "error from InserirDmrManual function from /controllers/controller.dmr.js",
      error
    );
    return res.status(500).json({ message: "Ocorreu um erro interno no servidor." });
  }
}

export default {
  Inserir,
  InserirDmr,
  deleteDmr,
  getDmrById,
  updateDmr,
  InserirDmrManual,
};

