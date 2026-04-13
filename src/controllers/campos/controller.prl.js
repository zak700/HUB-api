import { db } from "../../database/postgres.js";

async function Inserir(req, res) {
  try {
    const prl = req.body;

    await db("prl").insert(prl);

    return res.status(200).json({ message: "ok" });
  } catch (error) {
    console.error(
      "error from Inserir function from /controllers/controller.prl.js",
      error
    );
    return res.status(500).json({ message: "Ocorreu um erro interno no servidor." });
  }
}

async function InserirPrl(req, res) { 
  const { text, data } = req.body;
  const prl = [];

  try {
    const lines = await text.split("\n");

    let dataHelper = -1;

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];

      if (line.slice(0, 2) !== "99") {
        if (line.substring(0, 2) === "10") {
          dataHelper++;
          prl.push({
            data,
            content: {
              tipoRegistro: line.slice(0, 2).trim(),
              codOrgao: line.slice(2, 4).trim(),
              codUnidade: line.slice(4, 6).trim(),
              exercicioLicitacao: line.slice(6, 10).trim(),
              nroProcessoLicitatorio: line.slice(10, 22).trim(),
              dataParecer: line.slice(22, 30).trim(),
              tipoParecer: line.slice(30, 31).trim(),
              nroCpf: line.slice(31, 42).trim(),
              nomeRespParecer: line.slice(42, 142).trim(),
              lograResp: line.slice(142, 192).trim(),
              setorLogra: line.slice(192, 212).trim(),
              cidadeLogra: line.slice(212, 232).trim(),
              ufCidadeLogra: line.slice(232, 234).trim(),
              cepLogra: line.slice(234, 242).trim(),
              fone: line.slice(242, 252).trim(),
              email: line.slice(252, 332).trim(),
              nroSequencial: line.slice(332, 338).trim(),
              content: [],
              line
            },
          });
        }
      }
    }

    await db.batchInsert(`${req.body.sch}.prl`, prl, 75);

    return res.status(200).json({ message: "PRL inserido com sucesso!" });
  } catch (error) {
    console.error(
      "error from InserirPrl function from /controllers/controller.prl.js",
      error
    );
    return res.status(500).json({ message: "Ocorreu um erro interno no servidor." });
  }
}
async function deletePrl(req, res) {
  const { id } = req.params;
  try {
    await db("prl").delete().where({ id: id });
    return res.status(200).json({ message: "Registro removido com sucesso!" });
  } catch (error) {
    console.error(
      "error from Inserir deletePrl from /controllers/controller.prl.js",
      error
    );
    return res.status(500).json({ message: "Ocorreu um erro interno no servidor." });
  }
}

async function getPrlById(req, res) {
  const { id } = req.params;
  try {
    const prl = await db("prl").where({ id: id }).first();
    if (!prl) {
      return res.status(404).json({ message: "Registro não encontrado." });
    }
    return res.status(200).json(prl);
  } catch (error) {
    console.error(
      "error from getPrlById function from /controllers/controller.prl.js",
      error
    );
    return res.status(500).json({ message: "Ocorreu um erro interno no servidor." });
  }
}

async function updatePrl(req, res) {
  const { id } = req.params;
  
  const prlData = req.body;
  const body = prlData.body;
  const index = prlData.index;
  const tipoReg = body[0].value;
  try {
    let insert = {};
    for (const item of body) {
      Object.assign(insert, { [item.type]: item.value });
    }
    Object.assign(insert, { tipoRegistro: tipoReg });
    const toUpdate = await db("prl").select().where({ id: id });

    if (toUpdate.length == 0) {
      return res.status(404).json({ message: "Prl não encontrado." });
    }

    if (insert.tipoRegistro == 10) {
      insert.content = await toUpdate[0].content.content;
      
      await db("prl").where({ id }).update({ content: insert }).returning("*");
    } else {
      
      toUpdate[0].content.content[index] = insert;
      await db("prl").where({ id }).update({ content: toUpdate[0].content });
    }
    return res.status(200).json({ message: "got here!" });
  } catch (error) {
    console.error(
      "error from updatePrl function from /controllers/controller.prl.js",
      error
    );
    return res.status(500).json({ message: "Ocorreu um erro interno no servidor." });
  }
}

async function InserirPrlManual(req, res) {
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
    await db("prl").insert(insert);
    return res.status(200).json({ message: "Registro inserido com sucesso!" });
  } catch (error) {
    console.error(
      "error from InserirPrlManual function from /controllers/controller.prl.js",
      error
    );
    return res.status(500).json({ message: "Ocorreu um erro interno no servidor." });
  }
}

export default {
  Inserir,
  InserirPrl,
  deletePrl,
  getPrlById,
  updatePrl,
  InserirPrlManual,
};

