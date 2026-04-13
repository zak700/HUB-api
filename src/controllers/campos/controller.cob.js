import { db } from "../../database/postgres.js";

async function Inserir(req, res) {
  try {
    const cob = req.body;

    await db("cob").insert(cob);

    return res.status(200).json({ message: "ok" });
  } catch (error) {
    console.error(
      "error from Inserir function from /controllers/controller.cob.js",
      error
    );
    return res.status(500).json({ message: "Ocorreu um erro interno no servidor." });
  }
}

async function InserirCob(req, res) { 
  const { text, data } = req.body;
  const cob = [];

  try {
    const lines = await text.split("\n");

    let dataHelper = -1;

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];

      if (line.slice(0, 2) !== "99") {
        if (line.substring(0, 2) === "10") {
          dataHelper++;
          cob.push({
            data,
            content: {
              tipoRegistro: line.slice(0, 2).trim(),
              codOrgao: line.slice(2, 4).trim(),
              codUnidade: line.slice(4, 6).trim(),
              codObra: line.slice(6, 10).trim(),
              anoObra: line.slice(10, 14).trim(),
              especificacao: line.slice(14, 114).trim(),
              latitude: line.slice(114, 122).trim(),
              longitude: line.slice(122, 130).trim(),
              unidadeMedida: line.slice(130, 132).trim(),
              quantidade: line.slice(132, 137).trim(),
              enderecoObra: line.slice(137, 237).trim(),
              bairroObra: line.slice(237, 257).trim(),
              nomeFiscalObra: line.slice(257, 307).trim(),
              cpfFiscalObra: line.slice(307, 318).trim(),
              nroSequencial: line.slice(318, 324).trim(),
              content: [],
              line
            },
          });
        }
      }
    }

    await db.batchInsert(`${req.body.sch}.cob`, cob, 75);

    return res.status(200).json({ message: "COB inserido com sucesso!" });
  } catch (error) {
    console.error(
      "error from InserirCob function from /controllers/controller.cob.js",
      error
    );
    return res.status(500).json({ message: "Ocorreu um erro interno no servidor." });
  }
}
async function deleteCob(req, res) {
  const { id } = req.params;
  try {
    await db("cob").delete().where({ id: id });
    return res.status(200).json({ message: "Registro removido com sucesso!" });
  } catch (error) {
    console.error(
      "error from Inserir deleteCob from /controllers/controller.cob.js",
      error
    );
    return res.status(500).json({ message: "Ocorreu um erro interno no servidor." });
  }
}

async function getCobById(req, res) {
  const { id } = req.params;
  try {
    const cob = await db("cob").where({ id: id }).first();
    if (!cob) {
      return res.status(404).json({ message: "Registro não encontrado." });
    }
    return res.status(200).json(cob);
  } catch (error) {
    console.error(
      "error from getCobById function from /controllers/controller.cob.js",
      error
    );
    return res.status(500).json({ message: "Ocorreu um erro interno no servidor." });
  }
}

async function updateCob(req, res) {
  const { id } = req.params;
  const cobData = req.body;
  const body = cobData.body;
  const index = cobData.index;
  const tipoReg = body[0].value;
  try {
    let insert = {};
    for (const item of body) {
      Object.assign(insert, { [item.type]: item.value });
    }
    Object.assign(insert, { tipoRegistro: tipoReg });
    const toUpdate = await db("cob").select().where({ id: id });

    if (toUpdate.length == 0) {
      return res.status(404).json({ message: "Cob não encontrado." });
    }

    if (insert.tipoRegistro == 10) {
      insert.content = await toUpdate[0].content.content;
      await db("cob").where({ id }).update({ content: insert }).returning("*");
    } else {
      toUpdate[0].content.content[index] = insert;
      await db("cob").where({ id }).update({ content: toUpdate[0].content });
    }
    return res.status(200).json({ message: "got here!" });
  } catch (error) {
    console.error(
      "error from updateCob function from /controllers/controller.cob.js",
      error
    );
    return res.status(500).json({ message: "Ocorreu um erro interno no servidor." });
  }
}

async function InserirCobManual(req, res) {
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
    await db("cob").insert(insert);
    return res.status(200).json({ message: "Registro inserido com sucesso!" });
  } catch (error) {
    console.error(
      "error from InserirCobManual function from /controllers/controller.cob.js",
      error
    );
    return res.status(500).json({ message: "Ocorreu um erro interno no servidor." });
  }
}

export default {
  Inserir,
  InserirCob,
  deleteCob,
  getCobById,
  updateCob,
  InserirCobManual,
};

