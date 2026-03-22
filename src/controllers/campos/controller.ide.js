import { db } from "../../database/postgres.js";

async function getAllIde(req, res) {
  // Paginacao
  let { page, pageSize } = req.params;
  page = parseInt(page, 10);
  pageSize = parseInt(pageSize, 10);
  if (isNaN(page) || page < 0) page = 0;
  if (isNaN(pageSize) || pageSize <= 0) pageSize = 10;

  try {
    let query = db("ide");

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
      "error from getAllIde function from /controllers/controller.ide.js",
      error
    );
    return res.status(500).json({ message: "Ocorreu um erro interno no servidor." });
  }
}

async function Inserir(req, res) {
  try {
    const ide = req.body;

    await db("ide").insert(ide);

    return res.status(200).json({ message: "ok" });
  } catch (error) {
    console.error(
      "error from Inserir function from /controllers/controller.ide.js",
      error
    );
    return res.status(500).json({ message: "Ocorreu um erro interno no servidor." });
  }
}

async function InserirIde(req, res) { 
  const { text } = req.body;
  const ide = [];

  try {
    const lines = await text.split("\n");

    let dataHelper = -1;

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];

      if (line.slice(0, 2) !== "99") {
        if (line.substring(0, 2) === "10") {
          dataHelper++;
          ide.push({
            content: {
              tipoRegistro: line.slice(0, 2).trim(),
              codMunicipio: line.slice(2, 6).trim(),
              tipoBalancete: line.slice(6, 8).trim(),
              anoReferencia: line.slice(8, 12).trim(),
              mesReferencia: line.slice(12, 14).trim(),
              dataGeracao: line.slice(14, 22).trim(),
              nroSequencial: line.slice(22, 28).trim(),
              content: [],
              line
            },
          });
        }
      }
    }

    await db.batchInsert("ide", ide, 75)

    return res.status(200).json({ message: "IDE inserido com sucesso!" });
  } catch (error) {
    console.error(
      "error from InserirIde function from /controllers/controller.ide.js",
      error
    );
    return res.status(500).json({ message: "Ocorreu um erro interno no servidor." });
  }
}
async function deleteIde(req, res) {
  const { id } = req.params;
  try {
    await db("ide").delete().where({ id: id });
    return res.status(200).json({ message: "Registro removido com sucesso!" });
  } catch (error) {
    console.error(
      "error from Inserir deleteIde from /controllers/controller.ide.js",
      error
    );
    return res.status(500).json({ message: "Ocorreu um erro interno no servidor." });
  }
}

async function getIdeById(req, res) {
  const { id } = req.params;
  try {
    const ide = await db("ide").where({ id: id }).first();
    if (!ide) {
      return res.status(404).json({ message: "Registro não encontrado." });
    }
    return res.status(200).json(ide);
  } catch (error) {
    console.error(
      "error from getIdeById function from /controllers/controller.ide.js",
      error
    );
    return res.status(500).json({ message: "Ocorreu um erro interno no servidor." });
  }
}

async function updateIde(req, res) {
  const { id } = req.params;
  
  const ideData = req.body;
  const body = ideData.body;
  const index = ideData.index;
  const tipoReg = body[0].value;
  try {
    let insert = {};
    for (const item of body) {
      Object.assign(insert, { [item.type]: item.value });
    }
    Object.assign(insert, { tipoRegistro: tipoReg });
    const toUpdate = await db("ide").select().where({ id: id });

    if (toUpdate.length == 0) {
      return res.status(404).json({ message: "Ide não encontrado." });
    }

    if (insert.tipoRegistro == 10) {
      insert.content = await toUpdate[0].content.content;
      
      await db("ide").where({ id }).update({ content: insert }).returning("*");
    } else {
      
      toUpdate[0].content.content[index] = insert;
      await db("ide").where({ id }).update({ content: toUpdate[0].content });
    }
    return res.status(200).json({ message: "got here!" });
  } catch (error) {
    console.error(
      "error from updateIde function from /controllers/controller.ide.js",
      error
    );
    return res.status(500).json({ message: "Ocorreu um erro interno no servidor." });
  }
}

async function InserirIdeManual(req, res) {
  const { body } = req.body;
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
    await db("ide").insert(insert);
    return res.status(200).json({ message: "Registro inserido com sucesso!" });
  } catch (error) {
    console.error(
      "error from InserirIdeManual function from /controllers/controller.ide.js",
      error
    );
    return res.status(500).json({ message: "Ocorreu um erro interno no servidor." });
  }
}

export default {
  getAllIde,
  Inserir,
  InserirIde,
  deleteIde,
  getIdeById,
  updateIde,
  InserirIdeManual,
};

