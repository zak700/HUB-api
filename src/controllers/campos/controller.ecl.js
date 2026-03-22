import { db } from "../../database/postgres.js";
async function getAllEcl(req, res) {
  // Paginacao
  let { page, pageSize } = req.params;
  page = parseInt(page, 10);
  pageSize = parseInt(pageSize, 10);
  if (isNaN(page) || page < 0) page = 0;
  if (isNaN(pageSize) || pageSize <= 0) pageSize = 10;
  const { mes, ano, org } = req.query;

  try {
    let query = db("ecl");

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
      "error from getAllEcl function from /controllers/controller.ecl.js",
      error
    );
    return res.status(500).json({ message: "Ocorreu um erro interno no servidor." });
  }
}

async function Inserir(req, res) {
  try {
    const ecl = req.body;

    await db("ecl").insert(ecl);

    return res.status(200).json({ message: "ok" });
  } catch (error) {
    console.error(
      "error from Inserir function from /controllers/controller.ecl.js",
      error
    );
    return res.status(500).json({ message: "Ocorreu um erro interno no servidor." });
  }
}

async function InserirEcl(req, res) { 
  const { text, data } = req.body;
  const ecl = [];

  try {
    const lines = await text.split("\n");

    let dataHelper = -1;

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];

      if (line.slice(0, 2) !== "99") {
        if (line.substring(0, 2) === "10") {
          dataHelper++;
          ecl.push({
            data,
            content: {
              tipoRegistro: line.slice(0, 2).trim(),
              codOrgao: line.slice(2, 4).trim(),
              codUnidade: line.slice(4, 6).trim(),
              tipoCombustivelLub: line.slice(6, 8).trim(),
              subTipoCombustívelLub: line.slice(8, 10).trim(),
              qtdeInicial: line.slice(10, 20).trim(),
              qtdeEntradaCompra: line.slice(20, 30).trim(),
              qtdeEntradaDoacao: line.slice(30, 40).trim(),
              qtdeSaidaConsumo: line.slice(40, 50).trim(),
              qtdeSaidaDoacao: line.slice(50, 60).trim(),
              qtdeFinal: line.slice(60, 70).trim(),
              nroSequencial: line.slice(70, 76).trim(),
              content: [],
              line
            },
          });
        } else if (line.substring(0, 2) === "20") {
          if (
            ecl[dataHelper] &&
            ecl[dataHelper].content &&
            Array.isArray(ecl[dataHelper].content.content)
          ) {
            ecl[dataHelper].content.content.push({
              tipoRegistro: line.slice(0, 2).trim(),
              codPrograma: line.slice(2, 6).trim(),
              codOrgao: line.slice(6, 8).trim(),
              codUnidade: line.slice(8, 10).trim(),
              codCodFuncao: line.slice(10, 12).trim(),
              codCodSubFuncao: line.slice(12, 15).trim(),
              naturezaAcao: line.slice(15, 16).trim(),
              nroProjAtiv: line.slice(16, 19).trim(),
              elementoDespesa: line.slice(19, 25).trim(),
              SubelementoDespesa: line.slice(25, 27).trim(),
              nroEmpenho: line.slice(27, 33).trim(),
              dtEmpenho: line.slice(33, 41).trim(),
              nroSequencial: line.slice(70, 76).trim(),
              line
            });
          }
        }
      }
    }

    await db.batchInsert("ecl", ecl, 75)

    return res.status(200).json({ message: "EMP inserido com sucesso!" });
  } catch (error) {
    console.error(
      "error from InserirEcl function from /controllers/controller.ecl.js",
      error
    );
    return res.status(500).json({ message: "Ocorreu um erro interno no servidor." });
  }
}
async function deleteEcl(req, res) {
  const { id } = req.params;
  try {
    await db("ecl").delete().where({ id: id });
    return res.status(200).json({ message: "Registro removido com sucesso!" });
  } catch (error) {
    console.error(
      "error from Inserir deleteEcl from /controllers/controller.ecl.js",
      error
    );
    return res.status(500).json({ message: "Ocorreu um erro interno no servidor." });
  }
}

async function getEclById(req, res) {
  const { id } = req.params;
  try {
    const ecl = await db("ecl").where({ id: id }).first();
    if (!ecl) {
      return res.status(404).json({ message: "Registro não encontrado." });
    }
    return res.status(200).json(ecl);
  } catch (error) {
    console.error(
      "error from getEclById function from /controllers/controller.ecl.js",
      error
    );
    return res.status(500).json({ message: "Ocorreu um erro interno no servidor." });
  }
}

async function updateEcl(req, res) {
  const { id } = req.params;
  
  const eclData = req.body;
  const body = eclData.body;
  const index = eclData.index;
  const tipoReg = body[0].value;
  try {
    let insert = {};
    for (const item of body) {
      Object.assign(insert, { [item.type]: item.value });
    }
    Object.assign(insert, { tipoRegistro: tipoReg });
    const toUpdate = await db("ecl").select().where({ id: id });

    if (toUpdate.length == 0) {
      return res.status(404).json({ message: "ECL não encontrado." });
    }

    if (insert.tipoRegistro == 10) {
      insert.content = await toUpdate[0].content.content;
      
      await db("ecl").where({ id }).update({ content: insert }).returning("*");
    } else {
      
      toUpdate[0].content.content[index] = insert;
      await db("ecl").where({ id }).update({ content: toUpdate[0].content });
    }
    return res.status(200).json({ message: "got here!" });
  } catch (error) {
    console.error(
      "error from updateEcl function from /controllers/controller.ecl.js",
      error
    );
    return res.status(500).json({ message: "Ocorreu um erro interno no servidor." });
  }
}

async function InserirEclManual(req, res) {
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
    await db("ecl").insert(insert);
    return res.status(200).json({ message: "Registro inserido com sucesso!" });
  } catch (error) {
    console.error(
      "error from InserirEclManual function from /controllers/controller.ecl.js",
      error
    );
    return res.status(500).json({ message: "Ocorreu um erro interno no servidor." });
  }
}

export default {
  getAllEcl,
  Inserir,
  InserirEcl,
  deleteEcl,
  getEclById,
  updateEcl,
  InserirEclManual,
};

