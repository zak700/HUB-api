import { db } from "../../database/postgres.js";
async function getAllAre(req, res) {
  // Paginacao
  let { page, pageSize } = req.params;
  page = parseInt(page, 10);
  pageSize = parseInt(pageSize, 10);
  if (isNaN(page) || page < 0) page = 0;
  if (isNaN(pageSize) || pageSize <= 0) pageSize = 10;
  const { mes, ano, org } = req.query;

  try {
    let query = db("are");

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
      "error from getAllAre function from /controllers/controller.are.js",
      error
    );
    return res.status(500).json({ message: "Ocorreu um erro interno no servidor." });
  }
}

async function Inserir(req, res) {
  try {
    const are = req.body;

    await db("are").insert(are);

    return res.status(200).json({ message: "ok" });
  } catch (error) {
    console.error(
      "error from Inserir function from /controllers/controller.are.js",
      error
    );
    return res.status(500).json({ message: "Ocorreu um erro interno no servidor." });
  }
}

async function InserirAre(req, res) { 
  const { text, data } = req.body;
  const are = [];

  try {
    const lines = await text.split("\n");

    let dataHelper = -1;

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];

      if (line.slice(0, 2) !== "99") {
        if (line.substring(0, 2) === "10") {
          dataHelper++;
          are.push({
            data,
            content: {
              tipoRegistro: line.slice(0, 2).trim(),
              codOrgao: line.slice(2, 4).trim(),
              codUnidade: line.slice(4, 6).trim(),
              rubrica: line.slice(6, 15).trim(),
              vlAnulacao: line.slice(15, 28).trim(),
              justificativa: line.slice(28, 283).trim(),
              nroSequencial: line.slice(283, 289).trim(),
              content: [],
              line
            },
          });
        } else if (line.substring(0, 2) === "11") {
          if (
            are[dataHelper] &&
            are[dataHelper].content &&
            Array.isArray(are[dataHelper].content.content)
          ) {
            are[dataHelper].content.content.push({
              tipoRegistro: line.slice(0, 2).trim(),
              codOrgao: line.slice(2, 4).trim(),
              codUnidade: line.slice(4, 6).trim(),
              rubrica: line.slice(6, 15).trim(),
              banco: line.slice(15, 18).trim(),
              agencia: line.slice(18, 22).trim(),
              contaCorrente: line.slice(22, 34).trim(),
              contaCorrenteDigVerif: line.slice(34, 35).trim(),
              tipoConta: line.slice(35, 37).trim(),
              vlAnulado: line.slice(37, 50).trim(),
              nroSequencial: line.slice(283, 289).trim(),
              line
            });
          }
        } else if (line.substring(0, 2) === "12") {
          if (
            are[dataHelper] &&
            are[dataHelper].content &&
            Array.isArray(are[dataHelper].content.content)
          ) {
            are[dataHelper].content.content.push({
              tipoRegistro: line.slice(0, 2).trim(),
              codOrgao: line.slice(2, 4).trim(),
              codUnidade: line.slice(4, 6).trim(),
              rubrica: line.slice(6, 15).trim(),
              banco: line.slice(15, 18).trim(),
              agencia: line.slice(18, 22).trim(),
              contaCorrente: line.slice(22, 34).trim(),
              contaCorrenteDigVerif: line.slice(34, 35).trim(),
              tipoConta: line.slice(35, 37).trim(),
              codFonteRecurso: line.slice(37, 43).trim(),
              vlAnuladoFonteRecurso: line.slice(43, 56).trim(),
              nroSequencial: line.slice(283, 289).trim(),
              line
            });
          }
        }
      }
    }

    await db.batchInsert("are", are, 75)

    return res.status(200).json({ message: "ARE inserido com sucesso!" });
  } catch (error) {
    console.error(
      "error from InserirAre function from /controllers/controller.are.js",
      error
    );
    return res.status(500).json({ message: "Ocorreu um erro interno no servidor." });
  }
}
async function deleteAre(req, res) {
  const { id } = req.params;
  try {
    await db("are").delete().where({ id: id });
    return res.status(200).json({ message: "Registro removido com sucesso!" });
  } catch (error) {
    console.error(
      "error from Inserir deleteAre from /controllers/controller.are.js",
      error
    );
    return res.status(500).json({ message: "Ocorreu um erro interno no servidor." });
  }
}

async function getAreById(req, res) {
  const { id } = req.params;
  try {
    const are = await db("are").where({ id: id }).first();
    if (!are) {
      return res.status(404).json({ message: "Registro não encontrado." });
    }
    return res.status(200).json(are);
  } catch (error) {
    console.error(
      "error from getAreById function from /controllers/controller.are.js",
      error
    );
    return res.status(500).json({ message: "Ocorreu um erro interno no servidor." });
  }
}

async function updateAre(req, res) {
  const { id } = req.params;
  const areData = req.body;
  const body = areData.body;
  const index = areData.index;
  const tipoReg = body[0].value;
  try {
    let insert = {};
    for (const item of body) {
      Object.assign(insert, { [item.type]: item.value });
    }
    Object.assign(insert, { tipoRegistro: tipoReg });
    const toUpdate = await db("are").select().where({ id: id });

    if (toUpdate.length == 0) {
      return res.status(404).json({ message: "Are não encontrado." });
    }

    if (insert.tipoRegistro == 10) {
      insert.content = await toUpdate[0].content.content;
      await db("are").where({ id }).update({ content: insert }).returning("*");
    } else {
      toUpdate[0].content.content[index] = insert;
      await db("are").where({ id }).update({ content: toUpdate[0].content });
    }
    return res.status(200).json({ message: "got here!" });
  } catch (error) {
    console.error(
      "error from updateAre function from /controllers/controller.are.js",
      error
    );
    return res.status(500).json({ message: "Ocorreu um erro interno no servidor." });
  }
}

async function InserirAreManual(req, res) {
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
    await db("are").insert(insert);
    return res.status(200).json({ message: "Registro inserido com sucesso!" });
  } catch (error) {
    console.error(
      "error from InserirAreManual function from /controllers/controller.are.js",
      error
    );
    return res.status(500).json({ message: "Ocorreu um erro interno no servidor." });
  }
}

export default {
  getAllAre,
  Inserir,
  InserirAre,
  deleteAre,
  getAreById,
  updateAre,
  InserirAreManual,
};

