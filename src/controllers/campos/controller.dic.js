import { db } from "../../database/postgres.js";

async function Inserir(req, res) {
  try {
    const dic = req.body;

    await db("dic").insert(dic);

    return res.status(200).json({ message: "ok" });
  } catch (error) {
    console.error(
      "error from Inserir function from /controllers/controller.dic.js",
      error
    );
    return res.status(500).json({ message: "Ocorreu um erro interno no servidor." });
  }
}

async function InserirDic(req, res) { 
  const { text, data } = req.body;
  const dic = [];

  try {
    const lines = await text.split("\n");

    let dataHelper = -1;

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];

      if (line.slice(0, 2) !== "99") {
        if (line.substring(0, 2) === "10") {
          dataHelper++;
          dic.push({
            data,
            content: {
              tipoRegistro: line.slice(0, 2).trim(),
              codOrgao: line.slice(2, 4).trim(),
              codUnidade: line.slice(4, 6).trim(),
              tpLancamento: line.slice(6, 8).trim(),
              nroLeiAutorizacao: line.slice(8, 16).trim(),
              dtLeiAutorizacao: line.slice(16, 24).trim(),
              nomeCredor: line.slice(24, 104).trim(),
              tipoPessoa: line.slice(104, 105).trim(),
              cpfCnpjCredor: line.slice(105, 119).trim(),
              vlSaldoAnterior: line.slice(119, 132).trim(),
              vlContratacao: line.slice(132, 145).trim(),
              vlAmortizacao: line.slice(145, 158).trim(),
              vlCancelamento: line.slice(158, 171).trim(),
              vlEncampacao: line.slice(171, 184).trim(),
              vlAtualizacao: line.slice(184, 197).trim(),
              vlSaldoAtual: line.slice(197, 210).trim(),
              nroSequencial: line.slice(210, 216).trim(),
              content: [],
              line
            },
          });
        }
      }
    }

    await db.batchInsert(`${req.body.sch}.dic`, dic, 75);

    return res.status(200).json({ message: "DIC inserido com sucesso!" });
  } catch (error) {
    console.error(
      "error from InserirDic function from /controllers/controller.dic.js",
      error
    );
    return res.status(500).json({ message: "Ocorreu um erro interno no servidor." });
  }
}
async function deleteDic(req, res) {
  const { id } = req.params;
  try {
    await db("dic").delete().where({ id: id });
    return res.status(200).json({ message: "Registro removido com sucesso!" });
  } catch (error) {
    console.error(
      "error from Inserir deleteDic from /controllers/controller.dic.js",
      error
    );
    return res.status(500).json({ message: "Ocorreu um erro interno no servidor." });
  }
}

async function getDicById(req, res) {
  const { id } = req.params;
  try {
    const dic = await db("dic").where({ id: id }).first();
    if (!dic) {
      return res.status(404).json({ message: "Registro não encontrado." });
    }
    return res.status(200).json(dic);
  } catch (error) {
    console.error(
      "error from getDicById function from /controllers/controller.dic.js",
      error
    );
    return res.status(500).json({ message: "Ocorreu um erro interno no servidor." });
  }
}

async function updateDic(req, res) {
  const { id } = req.params;
  
  const dicData = req.body;
  const body = dicData.body;
  const index = dicData.index;
  const tipoReg = body[0].value;
  try {
    let insert = {};
    for (const item of body) {
      Object.assign(insert, { [item.type]: item.value });
    }
    Object.assign(insert, { tipoRegistro: tipoReg });
    const toUpdate = await db("dic").select().where({ id: id });

    if (toUpdate.length == 0) {
      return res.status(404).json({ message: "DIC não encontrado." });
    }

    if (insert.tipoRegistro == 10) {
      insert.content = await toUpdate[0].content.content;
      
      await db("dic").where({ id }).update({ content: insert }).returning("*");
    } else {
      
      toUpdate[0].content.content[index] = insert;
      await db("dic").where({ id }).update({ content: toUpdate[0].content });
    }
    return res.status(200).json({ message: "got here!" });
  } catch (error) {
    console.error(
      "error from updateDic function from /controllers/controller.dic.js",
      error
    );
    return res.status(500).json({ message: "Ocorreu um erro interno no servidor." });
  }
}

async function InserirDicManual(req, res) {
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
    await db("dic").insert(insert);
    return res.status(200).json({ message: "Registro inserido com sucesso!" });
  } catch (error) {
    console.error(
      "error from InserirDicManual function from /controllers/controller.dic.js",
      error
    );
    return res.status(500).json({ message: "Ocorreu um erro interno no servidor." });
  }
}

export default {
  Inserir,
  InserirDic,
  deleteDic,
  getDicById,
  updateDic,
  InserirDicManual,
};

