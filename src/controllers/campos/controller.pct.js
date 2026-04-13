import { db } from "../../database/postgres.js";
async function getAllPct(req, res) {
  // Paginacao
  let { page, pageSize } = req.params;
  page = parseInt(page, 10);
  pageSize = parseInt(pageSize, 10);
  if (isNaN(page) || page < 0) page = 0;
  if (isNaN(pageSize) || pageSize <= 0) pageSize = 10;
  const { mes, ano, org } = req.query;

  try {
    let query = db("pct");

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
      "error from getAllPct function from /controllers/controller.pct.js",
      error
    );
    return res.status(500).json({ message: "Ocorreu um erro interno no servidor." });
  }
}

async function Inserir(req, res) {
  try {
    const pct = req.body;

    await db("pct").insert(pct);

    return res.status(200).json({ message: "ok" });
  } catch (error) {
    console.error(
      "error from Inserir function from /controllers/controller.pct.js",
      error
    );
    return res.status(500).json({ message: "Ocorreu um erro interno no servidor." });
  }
}

async function InserirPct(req, res) { 
  const { text, data } = req.body;
  const pct = [];

  try {
    const lines = await text.split("\n");

    let dataHelper = -1;

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];

      if (line.slice(0, 2) !== "99") {
        if (line.substring(0, 2) === "10") {
          dataHelper++;
          pct.push({
            data,
            content: {
              tipoRegistro: line.slice(0, 2).trim(),
              tipoUnidade: line.slice(2, 4).trim(),
              envioPlanoContas: line.slice(4, 5).trim(),
              nroSequencial: line.slice(179, 185).trim(),
              content: [],
              line
            },
          });
        } else if (line.substring(0, 2) === "11") {
          if (
            pct[dataHelper] &&
            pct[dataHelper].content &&
            Array.isArray(pct[dataHelper].content.content)
          ) {
            pct[dataHelper].content.content.push({
              tipoRegistro: line.slice(0, 2).trim(),
              tipoUnidade: line.slice(2, 4).trim(),
              nível: line.slice(4, 6).trim(),
              qtDigitosNivel: line.slice(6, 8).trim(),
              nroSequencial: line.slice(179, 185).trim(),
              line
            });
          }
        } else if (line.substring(0, 2) === "12") {
          if (
            pct[dataHelper] &&
            pct[dataHelper].content &&
            Array.isArray(pct[dataHelper].content.content)
          ) {
            pct[dataHelper].content.content.push({
              tipoRegistro: line.slice(0, 2).trim(),
              tipoUnidade: line.slice(2, 4).trim(),
              codConta: line.slice(4, 34).trim(),
              indicadorCalcSupFinanceiro: line.slice(34, 35).trim(),
              codContaSuperior: line.slice(35, 65).trim(),
              nível: line.slice(65, 67).trim(),
              descricao: line.slice(67, 167).trim(),
              naturezaConta: line.slice(167, 168).trim(),
              tipoConta: line.slice(168, 169).trim(),
              contaPCASP: line.slice(169, 178).trim(),
              indicadorCalcSupFinanceiroPCASP: line.slice(178, 179).trim(),
              nroSequencial: line.slice(179, 185).trim(),
              line
            });
          }
        } else if (line.substring(0, 2) === "13") {
          if (
            pct[dataHelper] &&
            pct[dataHelper].content &&
            Array.isArray(pct[dataHelper].content.content)
          ) {
            pct[dataHelper].content.content.push({
              tipoRegistro: line.slice(0, 2).trim(),
              tipoUnidade: line.slice(2, 4).trim(),
              codConta: line.slice(4, 34).trim(),
              indicadorCalcSupFinanceiro: line.slice(34, 35).trim(),
              descricao: line.slice(35, 135).trim(),
              contaPCASP: line.slice(135, 144).trim(),
              indicadorCalcSupFinanceiroPCASP: line.slice(144, 179).trim(),
              nroSequencial: line.slice(179, 185).trim(),
              line
            });
          }
        } else if (line.substring(0, 2) === "14") {
          if (
            pct[dataHelper] &&
            pct[dataHelper].content &&
            Array.isArray(pct[dataHelper].content.content)
          ) {
            pct[dataHelper].content.content.push({
              tipoRegistro: line.slice(0, 2).trim(),
              tipoUnidade: line.slice(2, 4).trim(),
              codConta: line.slice(4, 34).trim(),
              indicadorCalcSupFinanceiro: line.slice(34, 35).trim(),
              nroSequencial: line.slice(179, 185).trim(),
              line
            });
          }
        }
      }
    }

    await db.batchInsert(`${req.body.sch}.pct`, pct, 75);

    return res.status(200).json({ message: "PCT inserido com sucesso!" });
  } catch (error) {
    console.error(
      "error from InserirPct function from /controllers/controller.pct.js",
      error
    );
    return res.status(500).json({ message: "Ocorreu um erro interno no servidor." });
  }
}
async function deletePct(req, res) {
  const { id } = req.params;
  try {
    await db("pct").delete().where({ id: id });
    return res.status(200).json({ message: "Registro removido com sucesso!" });
  } catch (error) {
    console.error(
      "error from Inserir deletePct from /controllers/controller.pct.js",
      error
    );
    return res.status(500).json({ message: "Ocorreu um erro interno no servidor." });
  }
}

async function getPctById(req, res) {
  const { id } = req.params;
  try {
    const pct = await db("pct").where({ id: id }).first();
    if (!pct) {
      return res.status(404).json({ message: "Registro não encontrado." });
    }
    return res.status(200).json(pct);
  } catch (error) {
    console.error(
      "error from getPctById function from /controllers/controller.pct.js",
      error
    );
    return res.status(500).json({ message: "Ocorreu um erro interno no servidor." });
  }
}

async function updatePct(req, res) {
  const { id } = req.params;
  
  const pctData = req.body;
  const body = pctData.body;
  const index = pctData.index;
  const tipoReg = body[0].value;
  try {
    let insert = {};
    for (const item of body) {
      Object.assign(insert, { [item.type]: item.value });
    }
    Object.assign(insert, { tipoRegistro: tipoReg });
    const toUpdate = await db("pct").select().where({ id: id });

    if (toUpdate.length == 0) {
      return res.status(404).json({ message: "PCT não encontrado." });
    }

    if (insert.tipoRegistro == 10) {
      insert.content = await toUpdate[0].content.content;
      
      await db("pct").where({ id }).update({ content: insert }).returning("*");
    } else {
      
      toUpdate[0].content.content[index] = insert;
      await db("pct").where({ id }).update({ content: toUpdate[0].content });
    }
    return res.status(200).json({ message: "got here!" });
  } catch (error) {
    console.error(
      "error from updatePct function from /controllers/controller.pct.js",
      error
    );
    return res.status(500).json({ message: "Ocorreu um erro interno no servidor." });
  }
}

async function InserirPctManual(req, res) {
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
    await db("pct").insert(insert);
    return res.status(200).json({ message: "Registro inserido com sucesso!" });
  } catch (error) {
    console.error(
      "error from InserirPctManual function from /controllers/controller.pct.js",
      error
    );
    return res.status(500).json({ message: "Ocorreu um erro interno no servidor." });
  }
}

export default {
  Inserir,
  InserirPct,
  deletePct,
  getPctById,
  updatePct,
  InserirPctManual,
};

