import { db } from "../../database/postgres.js";

async function getAllRsp(req, res) {
  // Paginacao
  let { page, pageSize } = req.params;
  page = parseInt(page, 10);
  pageSize = parseInt(pageSize, 10);
  if (isNaN(page) || page < 0) page = 0;
  if (isNaN(pageSize) || pageSize <= 0) pageSize = 10;
  const { mes, ano, org } = req.query;

  try {
    let query = db("rsp");

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
      "error from getAllRsp function from /controllers/controller.rsp.js",
      error
    );
    return res.status(500).json({ message: "Ocorreu um erro interno no servidor." });
  }
}

async function Inserir(req, res) {
  try {
    const rsp = req.body;

    await db("rsp").insert(rsp);

    return res.status(200).json({ message: "ok" });
  } catch (error) {
    console.error(
      "error from Inserir function from /controllers/controller.rsp.js",
      error
    );
    return res.status(500).json({ message: "Ocorreu um erro interno no servidor." });
  }
}
 
async function InserirRsp(req, res) {
  const { text, data } = req.body;
  const rsp = [];

  try {
    const lines = await text.split("\n");

    let dataHelper = -1;

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];

      if (line.slice(0, 2) !== "99") {
        if (line.substring(0, 2) === "10") {
          dataHelper++;
          rsp.push({
            data,
            content: {
              tipoRegistro: line.slice(0, 2).trim(),
              codOrgao: line.slice(2, 4).trim(),
              DotOrigP2001: line.slice(4, 25).trim(),
              DotOrigP2002: line.slice(25, 48).trim(),
              nroEmpenho: line.slice(48, 54).trim(),
              dtEmpenho: line.slice(54, 62).trim(),
              nomeCredor: line.slice(62, 112).trim(),
              vlOriginal: line.slice(112, 125).trim(),
              vlSaldoAnt: line.slice(125, 138).trim(),
              vlBaixaPgto: line.slice(138, 151).trim(),
              nroSequencial: line.slice(151, 157).trim(),
              content: [],
              line
            },
          });
        } else if (line.substring(0, 2) === "11") {
          if (
            rsp[dataHelper] &&
            rsp[dataHelper].content &&
            Array.isArray(rsp[dataHelper].content.content)
          ) {
            rsp[dataHelper].content.content.push({
              tipoRegistro: line.slice(0, 2).trim(),
              codOrgao: line.slice(2, 4).trim(),
              DotOrigP2001: line.slice(4, 25).trim(),
              DotOrigP2002: line.slice(25, 48).trim(),
              nroEmpenho: line.slice(48, 54).trim(),
              dtEmpenho: line.slice(54, 62).trim(),
              nomeCredor: line.slice(62, 112).trim(),
              dtCancelamento: line.slice(112, 120).trim(),
              nrCancelamento: line.slice(120, 123).trim(),
              vlBaixaCancelamento: line.slice(123, 136).trim(),
              nroSequencial: line.slice(151, 157).trim(),
              line
            });
          }
        } else if (line.substring(0, 2) === "12") {
          if (
            rsp[dataHelper] &&
            rsp[dataHelper].content &&
            Array.isArray(rsp[dataHelper].content.content)
          ) {
            rsp[dataHelper].content.content.push({
              tipoRegistro: line.slice(0, 2).trim(),
              codOrgao: line.slice(2, 4).trim(),
              DotOrigP2001: line.slice(4, 25).trim(),
              DotOrigP2002: line.slice(25, 48).trim(),
              nroEmpenho: line.slice(48, 54).trim(),
              dtEmpenho: line.slice(54, 62).trim(),
              nomeCredor: line.slice(62, 112).trim(),
              tipoEncampacao: line.slice(112, 114).trim(),
              codOrgao: line.slice(114, 116).trim(),
              codUnidade: line.slice(116, 118).trim(),
              vlEncampacao: line.slice(118, 131).trim(),
              nroSequencial: line.slice(151, 157).trim(),
              line
            });
          }
        }
      }
    }

    await db.batchInsert("rsp", rsp, 75)

    return res.status(200).json({ message: "RSP inserido com sucesso!" });
  } catch (error) {
    console.error(
      "error from InserirRsp function from /controllers/controller.rsp.js",
      error
    );
    return res.status(500).json({ message: "Ocorreu um erro interno no servidor." });
  }
}
async function deleteRsp(req, res) {
  const { id } = req.params;
  try {
    await db("rsp").delete().where({ id: id });
    return res.status(200).json({ message: "Registro removido com sucesso!" });
  } catch (error) {
    console.error(
      "error from Inserir deleteRsp from /controllers/controller.rsp.js",
      error
    );
    return res.status(500).json({ message: "Ocorreu um erro interno no servidor." });
  }
}

async function getRspById(req, res) {
  const { id } = req.params;
  try {
    const rsp = await db("rsp").where({ id: id }).first();
    if (!rsp) {
      return res.status(404).json({ message: "Registro não encontrado." });
    }
    return res.status(200).json(rsp);
  } catch (error) {
    console.error(
      "error from getRspById function from /controllers/controller.rsp.js",
      error
    );
    return res.status(500).json({ message: "Ocorreu um erro interno no servidor." });
  }
}

async function updateRsp(req, res) {
  const { id } = req.params;
  
  const rspData = req.body;
  const body = rspData.body;
  const index = rspData.index;
  const tipoReg = body[0].value;
  try {
    let insert = {};
    for (const item of body) {
      Object.assign(insert, { [item.type]: item.value });
    }
    Object.assign(insert, { tipoRegistro: tipoReg });
    const toUpdate = await db("rsp").select().where({ id: id });

    if (toUpdate.length == 0) {
      return res.status(404).json({ message: "Rsp não encontrado." });
    }

    if (insert.tipoRegistro == 10) {
      insert.content = await toUpdate[0].content.content;
      
      await db("rsp").where({ id }).update({ content: insert }).returning("*");
    } else {
      
      toUpdate[0].content.content[index] = insert;
      await db("rsp").where({ id }).update({ content: toUpdate[0].content });
    }
    return res.status(200).json({ message: "got here!" });
  } catch (error) {
    console.error(
      "error from updateRsp function from /controllers/controller.rsp.js",
      error
    );
    return res.status(500).json({ message: "Ocorreu um erro interno no servidor." });
  }
}

async function InserirRspManual(req, res) {
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
    await db("rsp").insert(insert);
    return res.status(200).json({ message: "Registro inserido com sucesso!" });
  } catch (error) {
    console.error(
      "error from InserirRspManual function from /controllers/controller.rsp.js",
      error
    );
    return res.status(500).json({ message: "Ocorreu um erro interno no servidor." });
  }
}

export default {
  getAllRsp,
  Inserir,
  InserirRsp,
  deleteRsp,
  getRspById,
  updateRsp,
  InserirRspManual,
};

