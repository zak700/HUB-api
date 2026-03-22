import { db } from "../../database/postgres.js";

async function getAllIsi(req, res) {
  // Paginacao
  let { page, pageSize } = req.params;
  page = parseInt(page, 10);
  pageSize = parseInt(pageSize, 10);
  if (isNaN(page) || page < 0) page = 0;
  if (isNaN(pageSize) || pageSize <= 0) pageSize = 10;
  const { mes, ano, org } = req.query;

  try {
    let query = db("isi");

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
      "error from getAllIsi function from /controllers/controller.isi.js",
      error
    );
    return res.status(500).json({ message: "Ocorreu um erro interno no servidor." });
  }
}

async function Inserir(req, res) {
  try {
    const isi = req.body;

    await db("isi").insert(isi);

    return res.status(200).json({ message: "ok" });
  } catch (error) {
    console.error(
      "error from Inserir function from /controllers/controller.isi.js",
      error
    );
    return res.status(500).json({ message: "Ocorreu um erro interno no servidor." });
  }
}

async function InserirIsi(req, res) { 
  const { text, data } = req.body;
  const isi = [];

  try {
    const lines = await text.split("\n");

    let dataHelper = -1;

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];

      if (line.slice(0, 2) !== "99") {
        if (line.substring(0, 2) === "10") {
          dataHelper++;
          isi.push({
            data,
            content: {
              tipoRegistro: line.slice(0, 2).trim(),
              cpfCnpjProprietario: line.slice(2, 16).trim(),
              tipoPessoa: line.slice(16, 17).trim(),
              nomeRazaoSocial: line.slice(17, 117).trim(),
              lograProprietario: line.slice(117, 167).trim(),
              setorLograProprietario: line.slice(167, 187).trim(),
              cidadeLograProprietario: line.slice(187, 207).trim(),
              ufLograProprietario: line.slice(207, 209).trim(),
              cepLograProprietario: line.slice(209, 217).trim(),
              foneProprietario: line.slice(217, 227).trim(),
              emailProprietario: line.slice(227, 307).trim(),
              cpfRespTecnico: line.slice(307, 318).trim(),
              nomeRespTecnico: line.slice(318, 368).trim(),
              emailRespTecnico: line.slice(368, 468).trim(),
              nomeSistema: line.slice(468, 518).trim(),
              versaoSistema: line.slice(518, 528).trim(),
              possuiPortalTransparencia: line.slice(528, 529).trim(),
              urlPortalTransparencia: line.slice(529, 629).trim(),
              possuiSistemaIntegrado: line.slice(629, 630).trim(),
              disponibilizaDespesa: line.slice(630, 631).trim(),
              disponibilizaReceita: line.slice(631, 632).trim(),
              nroSequencial: line.slice(632, 638).trim(),
              content: [],
              line
            },
          });
        }
      }
    }

    await db.batchInsert("isi", isi, 75)

    return res.status(200).json({ message: "ISI inserido com sucesso!" });
  } catch (error) {
    console.error(
      "error from InserirIsi function from /controllers/controller.isi.js",
      error
    );
    return res.status(500).json({ message: "Ocorreu um erro interno no servidor." });
  }
}
async function deleteIsi(req, res) {
  const { id } = req.params;
  try {
    await db("isi").delete().where({ id: id });
    return res.status(200).json({ message: "Registro removido com sucesso!" });
  } catch (error) {
    console.error(
      "error from Inserir deleteIsi from /controllers/controller.isi.js",
      error
    );
    return res.status(500).json({ message: "Ocorreu um erro interno no servidor." });
  }
}

async function getIsiById(req, res) {
  const { id } = req.params;
  try {
    const isi = await db("isi").where({ id: id }).first();
    if (!isi) {
      return res.status(404).json({ message: "Registro não encontrado." });
    }
    return res.status(200).json(isi);
  } catch (error) {
    console.error(
      "error from getIsiById function from /controllers/controller.isi.js",
      error
    );
    return res.status(500).json({ message: "Ocorreu um erro interno no servidor." });
  }
}

async function updateIsi(req, res) {
  const { id } = req.params;
  
  const isiData = req.body;
  const body = isiData.body;
  const index = isiData.index;
  const tipoReg = body[0].value;
  try {
    let insert = {};
    for (const item of body) {
      Object.assign(insert, { [item.type]: item.value });
    }
    Object.assign(insert, { tipoRegistro: tipoReg });
    const toUpdate = await db("isi").select().where({ id: id });

    if (toUpdate.length == 0) {
      return res.status(404).json({ message: "Isi não encontrado." });
    }

    if (insert.tipoRegistro == 10) {
      insert.content = await toUpdate[0].content.content;
      
      await db("isi").where({ id }).update({ content: insert }).returning("*");
    } else {
      
      toUpdate[0].content.content[index] = insert;
      await db("isi").where({ id }).update({ content: toUpdate[0].content });
    }
    return res.status(200).json({ message: "got here!" });
  } catch (error) {
    console.error(
      "error from updateIsi function from /controllers/controller.isi.js",
      error
    );
    return res.status(500).json({ message: "Ocorreu um erro interno no servidor." });
  }
}

async function InserirIsiManual(req, res) {
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
    await db("isi").insert(insert);
    return res.status(200).json({ message: "Registro inserido com sucesso!" });
  } catch (error) {
    console.error(
      "error from InserirIsiManual function from /controllers/controller.isi.js",
      error
    );
    return res.status(500).json({ message: "Ocorreu um erro interno no servidor." });
  }
}

export default {
  getAllIsi,
  Inserir,
  InserirIsi,
  deleteIsi,
  getIsiById,
  updateIsi,
  InserirIsiManual,
};

