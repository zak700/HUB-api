import { db } from "../../database/postgres.js";
import codFR from "./addicionalInfo/codFR.js";

async function getAllTrb(req, res) {
  // Paginacao
  let { page, pageSize } = req.params;
  page = parseInt(page, 10);
  pageSize = parseInt(pageSize, 10);
  if (isNaN(page) || page < 0) page = 0;
  if (isNaN(pageSize) || pageSize <= 0) pageSize = 10;
  const { mes, ano, org } = req.query;

  try {
    let query = db("trb");

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
      "error from getAllTrb function from /controllers/controller.trb.js",
      error
    );
    return res.status(500).json({ message: "Ocorreu um erro interno no servidor." });
  }
}

async function Inserir(req, res) {
  try {
    const trb = req.body;

    await db("trb").insert(trb);

    return res.status(200).json({ message: "ok" });
  } catch (error) {
    console.error(
      "error from Inserir function from /controllers/controller.trb.js",
      error
    );
    return res.status(500).json({ message: "Ocorreu um erro interno no servidor." });
  }
}

async function InserirTrb(req, res) {
  const { text, data } = req.body;
  const trb = [];

  try {
    const lines = await text.split("\n");

    let dataHelper = -1;

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];

      if (line.slice(0, 2) !== "99") {
        if (line.substring(0, 2) === "10") {
          dataHelper++;
          trb.push({
            data,
            content: {
              tipoRegistro: line.slice(0, 2).trim(),
              codOrgao: line.slice(2, 4).trim(),
              codUnidadeOrigem: line.slice(4, 6).trim(),
              bancoOrigem: line.slice(6, 9).trim(),
              agenciaOrigem: line.slice(9, 13).trim(),
              contaCorrenteOrigem: line.slice(13, 25).trim(),
              contaCorrenteOrigemDigVerif: line.slice(25, 26).trim(),
              tipoContaOrigem: line.slice(26, 28).trim(),
              codFonteRecurso: line.slice(28, 34).trim(),
              vlTransfOrigem: line.slice(34, 47).trim(),
              nroSequencial: line.slice(71, 77).trim(),
              content: [],
              line
            },
          });
        } else if (line.substring(0, 2) === "11") {
          if (
            trb[dataHelper] &&
            trb[dataHelper].content &&
            Array.isArray(trb[dataHelper].content.content)
          ) {
            trb[dataHelper].content.content.push({
              tipoRegistro: line.slice(0, 2).trim(),
              codOrgao: line.slice(2, 4).trim(),
              codUnidadeOrigem: line.slice(4, 6).trim(),
              bancoOrigem: line.slice(6, 9).trim(),
              agenciaOrigem: line.slice(9, 13).trim(),
              contaCorrenteOrigem: line.slice(13, 25).trim(),
              contaCorrenteOrigemDigVerif: line.slice(25, 26).trim(),
              tipoContaOrigem: line.slice(26, 28).trim(),
              codFonteRecurso: line.slice(28, 34).trim(), // FR TCM
              codFontRecursosMSC: `${line.slice(28, 29)}${codFR.get(line.slice(29, 34))}`, // FR
              codUnidadeDestino: line.slice(34, 36).trim(),
              bancoDestino: line.slice(36, 39).trim(),
              agenciaDestino: line.slice(39, 43).trim(),
              contaCorrenteDestino: line.slice(43, 55).trim(),
              contaCorrenteDestinoDigVerif: line.slice(55, 56).trim(),
              tipoContaDestino: line.slice(56, 58).trim(),
              vlTransfDestino: line.slice(58, 71).trim(),
              nroSequencial: line.slice(71, 77).trim(),
              line
            });
          }
        }
      }
    }

    await db.batchInsert("trb", trb, 75)

    return res.status(200).json({ message: "TRB inserido com sucesso!" });
  } catch (error) {
    console.error(
      "error from InserirTrb function from /controllers/controller.trb.js",
      error
    );
    return res.status(500).json({ message: "Ocorreu um erro interno no servidor." });
  }
}
async function deleteTrb(req, res) {
  const { id } = req.params;
  try {
    await db("trb").delete().where({ id: id });
    return res.status(200).json({ message: "Registro removido com sucesso!" });
  } catch (error) {
    console.error(
      "error from Inserir deleteTrb from /controllers/controller.trb.js",
      error
    );
    return res.status(500).json({ message: "Ocorreu um erro interno no servidor." });
  }
}

async function getTrbById(req, res) {
  const { id } = req.params;
  try {
    const trb = await db("trb").where({ id: id }).first();
    if (!trb) {
      return res.status(404).json({ message: "Registro não encontrado." });
    }
    return res.status(200).json(trb);
  } catch (error) {
    console.error(
      "error from getTrbById function from /controllers/controller.trb.js",
      error
    );
    return res.status(500).json({ message: "Ocorreu um erro interno no servidor." });
  }
}

async function updateTrb(req, res) {
  const { id } = req.params;

  const trbData = req.body;
  const body = trbData.body;
  const index = trbData.index;
  const tipoReg = body[0].value;
  try {
    let insert = {};
    for (const item of body) {
      Object.assign(insert, { [item.type]: item.value });
    }
    Object.assign(insert, { tipoRegistro: tipoReg });
    const toUpdate = await db("trb").select().where({ id: id });

    if (toUpdate.length == 0) {
      return res.status(404).json({ message: "Trb não encontrado." });
    }

    if (insert.tipoRegistro == 10) {
      insert.content = await toUpdate[0].content.content;

      await db("trb").where({ id }).update({ content: insert }).returning("*");
    } else {

      toUpdate[0].content.content[index] = insert;
      await db("trb").where({ id }).update({ content: toUpdate[0].content });
    }
    return res.status(200).json({ message: "got here!" });
  } catch (error) {
    console.error(
      "error from updateTrb function from /controllers/controller.trb.js",
      error
    );
    return res.status(500).json({ message: "Ocorreu um erro interno no servidor." });
  }
}

async function InserirTrbManual(req, res) {
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
    await db("trb").insert(insert);
    return res.status(200).json({ message: "Registro inserido com sucesso!" });
  } catch (error) {
    console.error(
      "error from InserirTrbManual function from /controllers/controller.trb.js",
      error
    );
    return res.status(500).json({ message: "Ocorreu um erro interno no servidor." });
  }
}

export default {
  getAllTrb,
  Inserir,
  InserirTrb,
  deleteTrb,
  getTrbById,
  updateTrb,
  InserirTrbManual,
};