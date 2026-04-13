import { db } from "../../database/postgres.js";

async function Inserir(req, res) {
  try {
    const tfr = req.body;

    await db("tfr").insert(tfr);

    return res.status(200).json({ message: "ok" });
  } catch (error) {
    console.error(
      "error from Inserir function from /controllers/controller.tfr.js",
      error
    );
    return res.status(500).json({ message: "Ocorreu um erro interno no servidor." });
  }
}

async function InserirTfr(req, res) { 
  const { text, data } = req.body;
  const tfr = [];

  try {
    const lines = await text.split("\n");

    let dataHelper = -1;

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];

      if (line.slice(0, 2) !== "99") {
        if (line.substring(0, 2) === "10") {
          dataHelper++;
          tfr.push({
            data,
            content: {
              tipoRegistro: line.slice(0, 2).trim(),
              codOrgao: line.slice(2, 4).trim(),
              codUnidade: line.slice(4, 6).trim(),
              Banco: line.slice(6, 9).trim(),
              agencia: line.slice(9, 13).trim(),
              contaCorrente: line.slice(13, 25).trim(),
              contaCorrenteDigVerif: line.slice(25, 26).trim(),
              tipoConta: line.slice(26, 27).trim(),
              codFonteOrigem: line.slice(27, 34).trim(),
              vlDecrescido: line.slice(34, 47).trim(),
              nroSequencial: line.slice(53, 59).trim(),
              content: [],
              line
            },
          });
        } else if (line.substring(0, 2) === "11") {
          if (
            tfr[dataHelper] &&
            tfr[dataHelper].content &&
            Array.isArray(tfr[dataHelper].content.content)
          ) {
            tfr[dataHelper].content.content.push({
              tipoRegistro: line.slice(0, 2).trim(),
              codOrgao: line.slice(3, 4).trim(),
              codUnidade: line.slice(4, 6).trim(),
              Banco: line.slice(6, 9).trim(),
              agencia: line.slice(9, 13).trim(),
              contaCorrente: line.slice(13, 25).trim(),
              contaCorrenteDigVerif: line.slice(25, 27).trim(),
              tipoConta: line.slice(27, 28).trim(),
              codFonteOrigem: line.slice(28, 34).trim(),
              codFonteDestino: line.slice(34, 40).trim(),
              vlAcrescido: line.slice(40, 53).trim(),
              nroSequencial: line.slice(53, 59).trim(),
              line
            });
          }
        }
      }
    }

    await db.batchInsert(`${req.body.sch}.tfr`, tfr, 75);

    return res.status(200).json({ message: "TFR inserido com sucesso!" });
  } catch (error) {
    console.error(
      "error from InserirTfr function from /controllers/controller.tfr.js",
      error
    );
    return res.status(500).json({ message: "Ocorreu um erro interno no servidor." });
  }
}
async function deleteTfr(req, res) {
  const { id } = req.params;
  try {
    await db("tfr").delete().where({ id: id });
    return res.status(200).json({ message: "Registro removido com sucesso!" });
  } catch (error) {
    console.error(
      "error from Inserir deleteTfr from /controllers/controller.tfr.js",
      error
    );
    return res.status(500).json({ message: "Ocorreu um erro interno no servidor." });
  }
}

async function getTfrById(req, res) {
  const { id } = req.params;
  try {
    const tfr = await db("tfr").where({ id: id }).first();
    if (!tfr) {
      return res.status(404).json({ message: "Registro não encontrado." });
    }
    return res.status(200).json(tfr);
  } catch (error) {
    console.error(
      "error from getTfrById function from /controllers/controller.tfr.js",
      error
    );
    return res.status(500).json({ message: "Ocorreu um erro interno no servidor." });
  }
}

async function updateTfr(req, res) {
  const { id } = req.params;
  
  const tfrData = req.body;
  const body = tfrData.body;
  const index = tfrData.index;
  const tipoReg = body[0].value;
  try {
    let insert = {};
    for (const item of body) {
      Object.assign(insert, { [item.type]: item.value });
    }
    Object.assign(insert, { tipoRegistro: tipoReg });
    const toUpdate = await db("tfr").select().where({ id: id });

    if (toUpdate.length == 0) {
      return res.status(404).json({ message: "TFR não encontrado." });
    }

    if (insert.tipoRegistro == 10) {
      insert.content = await toUpdate[0].content.content;
      
      await db("tfr").where({ id }).update({ content: insert }).returning("*");
    } else {
      
      toUpdate[0].content.content[index] = insert;
      await db("tfr").where({ id }).update({ content: toUpdate[0].content });
    }
    return res.status(200).json({ message: "got here!" });
  } catch (error) {
    console.error(
      "error from updateTfr function from /controllers/controller.tfr.js",
      error
    );
    return res.status(500).json({ message: "Ocorreu um erro interno no servidor." });
  }
}

async function InserirTfrManual(req, res) {
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
    await db("tfr").insert(insert);
    return res.status(200).json({ message: "Registro inserido com sucesso!" });
  } catch (error) {
    console.error(
      "error from InserirTfrManual function from /controllers/controller.tfr.js",
      error
    );
    return res.status(500).json({ message: "Ocorreu um erro interno no servidor." });
  }
}

export default {
  Inserir,
  InserirTfr,
  deleteTfr,
  getTfrById,
  updateTfr,
  InserirTfrManual,
};

