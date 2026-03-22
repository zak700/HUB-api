import { db } from "../../database/postgres.js";
async function getAllDcl(req, res) {
  // Paginacao
  let { page, pageSize } = req.params;
  page = parseInt(page, 10);
  pageSize = parseInt(pageSize, 10);
  if (isNaN(page) || page < 0) page = 0;
  if (isNaN(pageSize) || pageSize <= 0) pageSize = 10;
  const { mes, ano, org } = req.query;

  try {
    let query = db("dcl");

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
      "error from getAllDcl function from /controllers/controller.dcl.js",
      error
    );
    return res.status(500).json({ message: "Ocorreu um erro interno no servidor." });
  }
}

async function Inserir(req, res) {
  try {
    const dcl = req.body;

    await db("dcl").insert(dcl);

    return res.status(200).json({ message: "ok" });
  } catch (error) {
    console.error(
      "error from Inserir function from /controllers/controller.dcl.js",
      error
    );
    return res.status(500).json({ message: "Ocorreu um erro interno no servidor." });
  }
}

async function InserirDcl(req, res) { 
  const { text, data } = req.body;
  const dcl = [];

  try {
    const lines = await text.split("\n");

    let dataHelper = -1;

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];

      if (line.slice(0, 2) !== "99") {
        if (line.substring(0, 2) === "10") {
          dataHelper++;
          dcl.push({
            data,
            content: {
              tipoRegistro: line.slice(0, 2).trim(),
              codOrgao: line.slice(2, 4).trim(),
              codUnidade: line.slice(4, 6).trim(),
              vlSaldoAtualConcGarantia: line.slice(6, 19).trim(),
              recPrivatizacao: line.slice(19, 32).trim(),
              vlLiqIncentContrib: line.slice(32, 45).trim(),
              vlLiqIncenInstFinanc: line.slice(45, 58).trim(),
              vlInscRPNPIcentContrib: line.slice(58, 71).trim(),
              vlInscRPNPIncentInstFinanc: line.slice(71, 84).trim(),
              nroSequencial: line.slice(84, 90).trim(),
              content: [],
              line
            },
          });
        }
      }
    }

    await db.batchInsert("dcl", dcl, 75)

    return res.status(200).json({ message: "DCL inserido com sucesso!" });
  } catch (error) {
    console.error(
      "error from InserirDcl function from /controllers/controller.dcl.js",
      error
    );
    return res.status(500).json({ message: "Ocorreu um erro interno no servidor." });
  }
}
async function deleteDcl(req, res) {
  const { id } = req.params;
  try {
    await db("dcl").delete().where({ id: id });
    return res.status(200).json({ message: "Registro removido com sucesso!" });
  } catch (error) {
    console.error(
      "error from Inserir deleteDcl from /controllers/controller.dcl.js",
      error
    );
    return res.status(500).json({ message: "Ocorreu um erro interno no servidor." });
  }
}

async function getDclById(req, res) {
  const { id } = req.params;
  try {
    const dcl = await db("dcl").where({ id: id }).first();
    if (!dcl) {
      return res.status(404).json({ message: "Registro não encontrado." });
    }
    return res.status(200).json(dcl);
  } catch (error) {
    console.error(
      "error from getDclById function from /controllers/controller.dcl.js",
      error
    );
    return res.status(500).json({ message: "Ocorreu um erro interno no servidor." });
  }
}

async function updateDcl(req, res) {
  const { id } = req.params;
  const dclData = req.body;
  const body = dclData.body;
  const index = dclData.index;
  const tipoReg = body[0].value;
  try {
    let insert = {};
    for (const item of body) {
      Object.assign(insert, { [item.type]: item.value });
    }
    Object.assign(insert, { tipoRegistro: tipoReg });
    const toUpdate = await db("dcl").select().where({ id: id });

    if (toUpdate.length == 0) {
      return res.status(404).json({ message: "DCL não encontrado." });
    }

    if (insert.tipoRegistro == 10) {
      insert.content = await toUpdate[0].content.content;
      
      await db("dcl").where({ id }).update({ content: insert }).returning("*");
    } else {
      
      toUpdate[0].content.content[index] = insert;
      await db("dcl").where({ id }).update({ content: toUpdate[0].content });
    }
    return res.status(200).json({ message: "got here!" });
  } catch (error) {
    console.error(
      "error from updateDcl function from /controllers/controller.dcl.js",
      error
    );
    return res.status(500).json({ message: "Ocorreu um erro interno no servidor." });
  }
}

async function InserirDclManual(req, res) {
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
    await db("dcl").insert(insert);
    return res.status(200).json({ message: "Registro inserido com sucesso!" });
  } catch (error) {
    console.error(
      "error from InserirDclManual function from /controllers/controller.dcl.js",
      error
    );
    return res.status(500).json({ message: "Ocorreu um erro interno no servidor." });
  }
}

export default {
  getAllDcl,
  Inserir,
  InserirDcl,
  deleteDcl,
  getDclById,
  updateDcl,
  InserirDclManual,
};

