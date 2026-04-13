import { db } from "../../database/postgres.js";
import natureza from "../../helpers/natureza.js";

async function Inserir(req, res) {
  try {
    const orgao = req.body;

    await db("orgao").insert(orgao);

    return res.status(200).json({ message: "ok" });
  } catch (error) {
    console.error(
      "error from Inserir function from /controllers/controller.orgão.js",
      error
    );
    return res.status(500).json({ message: "Ocorreu um erro interno no servidor." });
  }
}

async function InserirOrgao(req, res) {
  const { text } = req.body;
  const orgao = [];

  try {
    const lines = await text.split("\n");

    let dataHelper = -1;
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];

      if (line.slice(0, 2) !== "99") {
        if (line.substring(0, 2) === "10") {
          dataHelper++;
          orgao.push({
            content: {
              tipoRegistro: line.slice(0, 2).trim(),
              codOrgao: line.slice(2, 4).trim(),
              cpfGestor: line.slice(4, 15).trim(),
              dtInicio: line.slice(15, 23).trim(),
              dtFinal: line.slice(23, 31).trim(),
              descOrgao: line.slice(31, 81).trim(),
              tipoOrgao: line.slice(81, 83).trim(),
              cnpjOrgao: line.slice(83, 97).trim(),
              nomeGestor: line.slice(97, 147).trim(),
              cargoGestor: line.slice(147, 197).trim(),
              lograResGestor: line.slice(197, 247).trim(),
              setorLograGestor: line.slice(247, 267).trim(),
              cidadeLograGestor: line.slice(267, 287).trim(),
              ufCidadeLograGestor: line.slice(287, 289).trim(),
              cepLograGestor: line.slice(289, 297).trim(),
              foneGestor: line.slice(297, 307).trim(),
              emailGestor: line.slice(307, 407).trim(),
              nroSequencial: line.slice(407, 413).trim(),
              content: [],
              line
            },
          });
        }
      }
    }


    await db.batchInsert(`${req.body.sch}.orgao`, orgao, 75);

    return res.status(200).json({ message: "ORGAO inserido com sucesso!" });
  } catch (error) {
    console.error(
      "error from InserirOrgao function from /controllers/controller.orgao.js",
      error
    );
    return res.status(500).json({ message: "Ocorreu um erro interno no servidor." });
  }
}
async function deleteOrgao(req, res) {
  const { id } = req.params;
  try {
    await db("orgao").delete().where({ id: id });
    return res.status(200).json({ message: "Registro removido com sucesso!" });
  } catch (error) {
    console.error(
      "error from Inserir deleteOrgao from /controllers/controller.orgao.js",
      error
    );
    return res.status(500).json({ message: "Ocorreu um erro interno no servidor." });
  }
}

async function getOrgaoById(req, res) {
  const { id } = req.params;
  try {
    const orgao = await db("orgao").where({ id: id }).first();
    if (!orgao) {
      return res.status(404).json({ message: "Registro não encontrado." });
    }
    return res.status(200).json(orgao);
  } catch (error) {
    console.error(
      "error from getOrgaoById function from /controllers/controller.orgao.js",
      error
    );
    return res.status(500).json({ message: "Ocorreu um erro interno no servidor." });
  }
}

async function updateOrgao(req, res) {
  const { id } = req.params;
  const orgaoData = req.body;
  const body = orgaoData.body;
  const index = orgaoData.index;
  const tipoReg = body[0].value;
  try {
    let insert = {};
    for (const item of body) {
      Object.assign(insert, { [item.type]: item.value });
    }
    Object.assign(insert, { tipoRegistro: tipoReg });
    const toUpdate = await db("orgao").select().where({ id: id });

    if (toUpdate.length == 0) {
      return res.status(404).json({ message: "Orgão não encontrado." });
    }

    if (insert.tipoRegistro == 10) {
      insert.content = await toUpdate[0].content.content;
      await db("orgao")
        .where({ id })
        .update({ content: insert })
        .returning("*");
    } else {

      toUpdate[0].content.content[index] = insert;
      await db("orgao").where({ id }).update({ content: toUpdate[0].content });
    }
    return res.status(200).json({ message: "got here!" });
  } catch (error) {
    console.error(
      "error from updateOrgao function from /controllers/controller.orgao.js",
      error
    );
    return res.status(500).json({ message: "Ocorreu um erro interno no servidor." });
  }
}

async function InserirOrgaoManual(req, res) {
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
    await db("orgao").insert(insert);
    return res.status(200).json({ message: "Registro inserido com sucesso!" });
  } catch (error) {
    console.error(
      "error from InserirOrgaoManual function from /controllers/controller.orgao.js",
      error
    );
    return res.status(500).json({ message: "Ocorreu um erro interno no servidor." });
  }
}

async function getOrgaoNames(req, res) {
  try {
    const user = await natureza.getUser(req)
    const tableNames = await db.raw(`SELECT table_name 
            FROM information_schema.tables 
            WHERE table_schema = '${user.schema}'
    `)
    console.log(tableNames.rows, "TABLE NAMES")
    const fetch = await db.withSchema(user.schema).table("orgao").select("*");
    const response = [];
    const dataNames = [];
    fetch.forEach((e) => {
      if (!dataNames.includes(e.content.descOrgao)) {
        response.push({
          value: parseInt(e.content.codOrgao),
          label: `${e.content.codOrgao} - ${e.content.descOrgao}`,
          type: e.content.tipoOrgao,
        });
      }
      dataNames.push(e.content.descOrgao);
    });

    return res.status(200).json({ response });
  } catch (error) {
    console.error(
      "error from getOrgaoNames function from /controllers/controller.orgao.js",
      error
    );
    return res.status(500).json({ message: "Ocorreu um erro interno no servidor." });
  }
}

export default {
  Inserir,
  InserirOrgao,
  deleteOrgao,
  getOrgaoById,
  updateOrgao,
  InserirOrgaoManual,
  getOrgaoNames,
};

