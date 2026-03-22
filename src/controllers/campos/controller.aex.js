import { db } from "../../database/postgres.js";
async function getAllAex(req, res) {
  // Paginacao
  let { page, pageSize } = req.params;
  page = parseInt(page, 10);
  pageSize = parseInt(pageSize, 10);
  if (isNaN(page) || page < 0) page = 0;
  if (isNaN(pageSize) || pageSize <= 0) pageSize = 10;
  const { mes, ano, org } = req.query;

  try {
    let query = db("aex");

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
      "error from getAllAex function from /controllers/controller.aex.js",
      error
    );
    return res.status(500).json({ message: "Ocorreu um erro interno no servidor." });
  }
}

async function Inserir(req, res) {
  try {
    const aex = req.body;

    await db("aex").insert(aex);

    return res.status(200).json({ message: "ok" });
  } catch (error) {
    console.error(
      "error from Inserir function from /controllers/controller.aex.js",
      error
    );
    return res.status(500).json({ message: "Ocorreu um erro interno no servidor." });
  }
}

async function InserirAex(req, res) { 
  const { text, data } = req.body;
  const aex = [];

  try {
    const lines = await text.split("\n");

    let dataHelper = -1;

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];

      if (line.slice(0, 2) !== "99") {
        if (line.substring(0, 2) === "10") {
          dataHelper++;
          aex.push({
            data,
            content: {
              tipoRegistro: line.slice(0, 2).trim(),
              codOrgao: line.slice(2, 4).trim(),
              codUnidade: line.slice(4, 6).trim(),
              Categoria: line.slice(6, 7).trim(),
              tipoLancamento: line.slice(7, 9).trim(),
              subTipo: line.slice(9, 12).trim(),
              desdobraSubTipo: line.slice(12, 15).trim(),
              nrExtraOrcamentaria: line.slice(15, 21).trim(),
              dataAnulacao: line.slice(21, 29).trim(),
              vlAnulacao: line.slice(29, 42).trim(),
              nroSequencial: line.slice(72, 78).trim(),
              content: [],
              line
            },
          });
        } else if (line.substring(0, 2) === "11") {
          if (
            aex[dataHelper] &&
            aex[dataHelper].content &&
            Array.isArray(aex[dataHelper].content.content)
          ) {
            aex[dataHelper].content.content.push({
              tipoRegistro: line.slice(0, 2).trim(),
              codOrgao: line.slice(2, 4).trim(),
              codUnidade: line.slice(4, 6).trim(),
              Categoria: line.slice(6, 7).trim(),
              tipoLancamento: line.slice(7, 9).trim(),
              subTipo: line.slice(9, 12).trim(),
              desdobraSubTipo: line.slice(12, 15).trim(),
              nrExtraOrcamentaria: line.slice(15, 21).trim(),
              dataAnulacao: line.slice(21, 29).trim(),
              codUnidadeFinanceira: line.slice(29, 31).trim(),
              banco: line.slice(31, 34).trim(),
              agencia: line.slice(34, 38).trim(),
              contaCorrente: line.slice(38, 50).trim(),
              contaCorrenteDigVerif: line.slice(50, 51).trim(),
              tipoConta: line.slice(51, 53).trim(),
              vlAnulacaoMovimentacao: line.slice(53, 66).trim(),
              nroSequencial: line.slice(72, 78).trim(),
              line
            });
          }
        } else if (line.substring(0, 2) === "12") {
          if (
            aex[dataHelper] &&
            aex[dataHelper].content &&
            Array.isArray(aex[dataHelper].content.content)
          ) {
            aex[dataHelper].content.content.push({
              tipoRegistro: line.slice(0, 2).trim(),
              codOrgao: line.slice(2, 4).trim(),
              codUnidade: line.slice(4, 6).trim(),
              Categoria: line.slice(6, 7).trim(),
              tipoLancamento: line.slice(7, 9).trim(),
              subTipo: line.slice(9, 12).trim(),
              desdobraSubTipo: line.slice(12, 15).trim(),
              nrExtraOrcamentaria: line.slice(15, 21).trim(),
              dataAnulacao: line.slice(21, 29).trim(),
              codUnidadeFinanceira: line.slice(29, 31).trim(),
              banco: line.slice(31, 34).trim(),
              agencia: line.slice(34, 38).trim(),
              contaCorrente: line.slice(38, 50).trim(),
              contaCorrenteDigVerif: line.slice(50, 51).trim(),
              tipoConta: line.slice(51, 53).trim(),
              codFonteRecurso: line.slice(53, 59).trim(),
              vlAnulacaoFR: line.slice(59, 72).trim(),
              nroSequencial: line.slice(72, 78).trim(),
              line
            });
          }
        }
      }
    }

    await db.batchInsert("aex", aex, 75)

    return res.status(200).json({ message: "AEX inserido com sucesso!" });
  } catch (error) {
    console.error(
      "error from InserirAex function from /controllers/controller.aex.js",
      error
    );
    return res.status(500).json({ message: "Ocorreu um erro interno no servidor." });
  }
}
async function deleteAex(req, res) {
  const { id } = req.params;
  try {
    await db("aex").delete().where({ id: id });
    return res.status(200).json({ message: "Registro removido com sucesso!" });
  } catch (error) {
    console.error(
      "error from Inserir deleteAex from /controllers/controller.aex.js",
      error
    );
    return res.status(500).json({ message: "Ocorreu um erro interno no servidor." });
  }
}

async function getAexById(req, res) {
  const { id } = req.params;
  try {
    const emp = await db("aex").where({ id: id }).first();
    if (!emp) {
      return res.status(404).json({ message: "Registro não encontrado." });
    }
    return res.status(200).json(emp);
  } catch (error) {
    console.error(
      "error from getAexById function from /controllers/controller.aex.js",
      error
    );
    return res.status(500).json({ message: "Ocorreu um erro interno no servidor." });
  }
}

async function updateAex(req, res) {
  const { id } = req.params;
  const aexData = req.body;
  const body = aexData.body;
  const index = aexData.index;
  const tipoReg = body[0].value;
  try {
    let insert = {};
    for (const item of body) {
      Object.assign(insert, { [item.type]: item.value });
    }
    Object.assign(insert, { tipoRegistro: tipoReg });
    const toUpdate = await db("aex").select().where({ id: id });

    if (toUpdate.length == 0) {
      return res.status(404).json({ message: "Emp não encontrado." });
    }

    if (insert.tipoRegistro == 10) {
      insert.content = await toUpdate[0].content.content;
      await db("aex").where({ id }).update({ content: insert }).returning("*");
    } else {
      toUpdate[0].content.content[index] = insert;
      await db("aex").where({ id }).update({ content: toUpdate[0].content });
    }
    return res.status(200).json({ message: "got here!" });
  } catch (error) {
    console.error(
      "error from updateAex function from /controllers/controller.aex.js",
      error
    );
    return res.status(500).json({ message: "Ocorreu um erro interno no servidor." });
  }
}

async function InserirAexManual(req, res) {
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
    await db("aex").insert(insert);
    return res.status(200).json({ message: "Registro inserido com sucesso!" });
  } catch (error) {
    console.error(
      "error from InserirAexManual function from /controllers/controller.aex.js",
      error
    );
    return res.status(500).json({ message: "Ocorreu um erro interno no servidor." });
  }
}

export default {
  getAllAex,
  Inserir,
  InserirAex,
  deleteAex,
  getAexById,
  updateAex,
  InserirAexManual,
};

