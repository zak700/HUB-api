import { db } from "../../database/postgres.js";

async function getAllRecO(req, res) {
  // Paginacao
  let { page, pageSize } = req.params;
  page = parseInt(page, 10);
  pageSize = parseInt(pageSize, 10);
  if (isNaN(page) || page < 0) page = 0;
  if (isNaN(pageSize) || pageSize <= 0) pageSize = 10;
  const { mes, ano, org } = req.query;

  try {
    let query = db("recO");

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
      "error from getAllRecO function from /controllers/controller.recO.js",
      error
    );
    return res.status(500).json({ message: "Ocorreu um erro interno no servidor." });
  }
}

async function Inserir(req, res) {
  try {
    const recO = req.body;

    await db("recO").insert(recO);

    return res.status(200).json({ message: "ok" });
  } catch (error) {
    console.error(
      "error from Inserir function from /controllers/controller.recO.js",
      error
    );
    return res.status(500).json({ message: "Ocorreu um erro interno no servidor." });
  }
}

async function InserirRecO(req, res) {
  const { text, data } = req.body;
  const recO = [];

  try {
    const lines = await text.split("\n");

    let dataHelper = -1;

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];

      if (line.slice(0, 2) !== "99") {
        if (line.substring(0, 2) === "10") {
          dataHelper++;
          recO.push({
            data,
            content: {
              tipoRegistro: line.slice(0, 2).trim(),
              codOrgao: line.slice(2, 4).trim(),
              codUnidade: line.slice(4, 6).trim(),
              rubrica: line.slice(6, 15).trim(),
              especificacao: line.slice(15, 115).trim(),
              vlPrevisto: line.slice(115, 130).trim(),
              nroSequencial: line.slice(130, 136).trim(),
              content: [],
              line
            },
          });
        } else if (line.substring(0, 2) === "11") {
          if (
            recO[dataHelper] &&
            recO[dataHelper].content &&
            Array.isArray(recO[dataHelper].content.content)
          ) {
            recO[dataHelper].content.content.push({
              tipoRegistro: line.slice(0, 2).trim(),
              codOrgao: line.slice(2, 4).trim(),
              codUnidade: line.slice(4, 6).trim(),
              rubrica: line.slice(6, 15).trim(),
              codFontRecursos: line.slice(15, 18).trim(),
              vlFontRecursos: line.slice(18, 33).trim(),
              nroSequencial: line.slice(130, 136).trim(),
              codFontRecursosMSC: "nan",
              poderOrgao: "nan",
              codAEO: "nan",
              line
            });
          }
        }
      }
    }

    await db.batchInsert("recO", recO, 75)

    return res.status(200).json({ message: "RecO inserido com sucesso!" });
  } catch (error) {
    console.error(
      "error from InserirRecO function from /controllers/controller.recO.js",
      error
    );
    return res.status(500).json({ message: "Ocorreu um erro interno no servidor." });
  }
}
async function deleteRecO(req, res) {
  const { id } = req.params;
  try {
    await db("recO").delete().where({ id: id });
    return res.status(200).json({ message: "Registro removido com sucesso!" });
  } catch (error) {
    console.error(
      "error from Inserir deleteRecO from /controllers/controller.recO.js",
      error
    );
    return res.status(500).json({ message: "Ocorreu um erro interno no servidor." });
  }
}

async function getRecOById(req, res) {
  const { id } = req.params;
  try {
    const recO = await db("recO").where({ id: id }).first();
    if (!recO) {
      return res.status(404).json({ message: "Registro não encontrado." });
    }
    return res.status(200).json(recO);
  } catch (error) {
    console.error(
      "error from getRecOById function from /controllers/controller.recO.js",
      error
    );
    return res.status(500).json({ message: "Ocorreu um erro interno no servidor." });
  }
}

async function updateRecO(req, res) {
  const { id } = req.params;
  
  const recOData = req.body;
  const body = recOData.body;
  const index = recOData.index;
  const tipoReg = body[0].value;
  try {
    let insert = {};
    for (const item of body) {
      Object.assign(insert, { [item.type]: item.value });
    }
    Object.assign(insert, { tipoRegistro: tipoReg });
    const toUpdate = await db("recO").select().where({ id: id });

    if (toUpdate.length == 0) {
      return res.status(404).json({ message: "RECo não encontrado." });
    }

    if (insert.tipoRegistro == 10) {
      insert.content = await toUpdate[0].content.content;
      
      await db("recO").where({ id }).update({ content: insert }).returning("*");
    } else {
      
      toUpdate[0].content.content[index] = insert;
      await db("recO").where({ id }).update({ content: toUpdate[0].content });
    }
    return res.status(200).json({ message: "got here!" });
  } catch (error) {
    console.error(
      "error from updateRecO function from /controllers/controller.recO.js",
      error
    );
    return res.status(500).json({ message: "Ocorreu um erro interno no servidor." });
  }
}

async function InserirRecOManual(req, res) {
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
    await db("recO").insert(insert);
    return res.status(200).json({ message: "Registro inserido com sucesso!" });
  } catch (error) {
    console.error(
      "error from InserirRecOManual function from /controllers/controller.recO.js",
      error
    );
    return res.status(500).json({ message: "Ocorreu um erro interno no servidor." });
  }
}

export default {
  getAllRecO,
  Inserir,
  InserirRecO,
  deleteRecO,
  getRecOById,
  updateRecO,
  InserirRecOManual,
};

