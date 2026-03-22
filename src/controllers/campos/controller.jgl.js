import { db } from "../../database/postgres.js";

async function getAllJgl(req, res) {
  // Paginacao
  let { page, pageSize } = req.params;
  page = parseInt(page, 10);
  pageSize = parseInt(pageSize, 10);
  if (isNaN(page) || page < 0) page = 0;
  if (isNaN(pageSize) || pageSize <= 0) pageSize = 10;
  const { mes, ano, org } = req.query;

  try {
    let query = db("jgl");

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
      "error from getAllJgl function from /controllers/controller.jgl.js",
      error
    );
    return res.status(500).json({ message: "Ocorreu um erro interno no servidor." });
  }
}

async function Inserir(req, res) {
  try {
    const jgl = req.body;

    await db("jgl").insert(jgl);

    return res.status(200).json({ message: "ok" });
  } catch (error) {
    console.error(
      "error from Inserir function from /controllers/controller.jgl.js",
      error
    );
    return res.status(500).json({ message: "Ocorreu um erro interno no servidor." });
  }
}

async function InserirJgl(req, res) { 
  const { text, data } = req.body;
  const jgl = [];

  try {
    const lines = await text.split("\n");

    let dataHelper = -1;

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];

      if (line.slice(0, 2) !== "99") {
        if (line.substring(0, 2) === "10") {
          dataHelper++;
          jgl.push({
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
              dscProdutoServico: line.slice(45, 295).trim(),
              vlUnitario: line.slice(295, 308).trim(),
              quantidade: line.slice(308, 321).trim(),
              unidade: line.slice(321, 323).trim(),
              nroSequencial: line.slice(323, 329).trim(),
              content: [],
              line
            },
          });
        } else if (line.substring(0, 2) === "20") {
          if (
            jgl[dataHelper] &&
            jgl[dataHelper].content &&
            Array.isArray(jgl[dataHelper].content.content)
          ) {
            jgl[dataHelper].content.content.push({
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
            jgl[dataHelper] &&
            jgl[dataHelper].content &&
            Array.isArray(jgl[dataHelper].content.content)
          ) {
            jgl[dataHelper].content.content.push({
              tipoRegistro: line.slice(0, 2).trim(),
              codOrgao: line.slice(2, 4).trim(),
              codUnidade: line.slice(4, 6).trim(),
              exercicioLicitacao: line.slice(6, 10).trim(),
              nroProcessoLicitatorio: line.slice(10, 22).trim(),
              dtJulgamento: line.slice(22, 30).trim(),
              AtaPresençaLicitantes: line.slice(30, 31).trim(),
              renunciaRecurso: line.slice(31, 32).trim(),
              nroSequencial: line.slice(323, 329).trim(),
              line
            });
          }
        }
      }
    }

    await db.batchInsert("jgl", jgl, 75)

    return res.status(200).json({ message: "JGL inserido com sucesso!" });
  } catch (error) {
    console.error(
      "error from InserirJgl function from /controllers/controller.jgl.js",
      error
    );
    return res.status(500).json({ message: "Ocorreu um erro interno no servidor." });
  }
}
async function deleteJgl(req, res) {
  const { id } = req.params;
  try {
    await db("jgl").delete().where({ id: id });
    return res.status(200).json({ message: "Registro removido com sucesso!" });
  } catch (error) {
    console.error(
      "error from Inserir deleteJgl from /controllers/controller.jgl.js",
      error
    );
    return res.status(500).json({ message: "Ocorreu um erro interno no servidor." });
  }
}

async function getJglById(req, res) {
  const { id } = req.params;
  try {
    const jgl = await db("jgl").where({ id: id }).first();
    if (!jgl) {
      return res.status(404).json({ message: "Registro não encontrado." });
    }
    return res.status(200).json(jgl);
  } catch (error) {
    console.error(
      "error from getJglById function from /controllers/controller.jgl.js",
      error
    );
    return res.status(500).json({ message: "Ocorreu um erro interno no servidor." });
  }
}

async function updateJgl(req, res) {
  const { id } = req.params;
  
  const jglData = req.body;
  const body = jglData.body;
  const index = jglData.index;
  const tipoReg = body[0].value;
  try {
    let insert = {};
    for (const item of body) {
      Object.assign(insert, { [item.type]: item.value });
    }
    Object.assign(insert, { tipoRegistro: tipoReg });
    const toUpdate = await db("jgl").select().where({ id: id });

    if (toUpdate.length == 0) {
      return res.status(404).json({ message: "Jgl não encontrado." });
    }

    if (insert.tipoRegistro == 10) {
      insert.content = await toUpdate[0].content.content;
      
      await db("jgl").where({ id }).update({ content: insert }).returning("*");
    } else {
      
      toUpdate[0].content.content[index] = insert;
      await db("jgl").where({ id }).update({ content: toUpdate[0].content });
    }
    return res.status(200).json({ message: "got here!" });
  } catch (error) {
    console.error(
      "error from updateJgl function from /controllers/controller.jgl.js",
      error
    );
    return res.status(500).json({ message: "Ocorreu um erro interno no servidor." });
  }
}

async function InserirJglManual(req, res) {
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
    await db("jgl").insert(insert);
    return res.status(200).json({ message: "Registro inserido com sucesso!" });
  } catch (error) {
    console.error(
      "error from InserirJglManual function from /controllers/controller.jgl.js",
      error
    );
    return res.status(500).json({ message: "Ocorreu um erro interno no servidor." });
  }
}

export default {
  getAllJgl,
  Inserir,
  InserirJgl,
  deleteJgl,
  getJglById,
  updateJgl,
  InserirJglManual,
};

