import { db } from "../../database/postgres.js";
import natureza from "../../helpers/natureza.js";

async function Inserir(req, res) {
  try {
    const dspO = req.body;

    await db("dspO").insert(dspO);

    return res.status(200).json({ message: "ok" });
  } catch (error) {
    console.error(
      "error from Inserir function from /controllers/controller.dspO.js",
      error
    );
    return res.status(500).json({ message: "Ocorreu um erro interno no servidor." });
  }
}

async function InserirDspO(req, res) {
  const { text, data } = req.body;
  const dspO = [];

  try {
    const lines = await text.split("\n");

    let dataHelper = -1;

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];

      if (line.slice(0, 2) !== "99") {
        if (line.substring(0, 2) === "10") {
          dataHelper++;
          dspO.push({
            data,
            content: {
              tipoRegistro: line.slice(0, 2).trim(),
              codPrograma: line.slice(2, 6).trim(),
              codOrgao: line.slice(6, 8).trim(),
              codUnidade: line.slice(8, 10).trim(),
              codFuncao: line.slice(10, 12).trim(),
              codSubFuncao: line.slice(12, 15).trim(),
              naturezaAcao: line.slice(15, 16).trim(),
              nroProjAtiv: line.slice(16, 19).trim(),
              codNaturezaDaDespesa: line.slice(19, 25).trim(),
              recurso: line.slice(25, 40).trim(),
              nroSequencial: line.slice(58, 64).trim(),
              content: [],
              line
            },
          });
        } else if (line.substring(0, 2) === "11") {
          if (
            dspO[dataHelper] &&
            dspO[dataHelper].content &&
            Array.isArray(dspO[dataHelper].content.content)
          ) {
            dspO[dataHelper].content.content.push({
              tipoRegistro: line.slice(0, 2).trim(),
              codPrograma: line.slice(2, 6).trim(),
              codOrgao: line.slice(6, 8).trim(),
              codUnidade: line.slice(8, 10).trim(),
              codFuncao: line.slice(10, 12).trim(),
              codSubFuncao: line.slice(12, 15).trim(),
              naturezaAcao: line.slice(15, 16).trim(),
              nroProjAtiv: line.slice(16, 19).trim(),
              codNaturezaDaDespesa: line.slice(19, 25).trim(),
              codFontRecursos: line.slice(25, 28).trim(),
              valorFonte: line.slice(28, 43).trim(),
              valorFonteImpositiva: line.slice(43, 58).trim(),
              nroSequencial: line.slice(58, 64).trim(),
              line,
              // adicionais
              elementoDespesaMSC: line.slice(19, 25).trim(),
              subElementoMSC: "00",
              codFontRecursosMSC: "nan",
              codAEO: "nan",
              ficha: "nan",
            });
          }
        }
      }
    }

    let user

    if (!req.body.sch) user = await natureza.getUser(req)

    await db.batchInsert(`${user?.schema || req.body.sch}.dspO`, dspO, 75);

    return res.status(200).json({ message: "DspO inserido com sucesso!" });
  } catch (error) {
    console.error(
      "error from InserirDspO function from /controllers/controller.dspO.js",
      error
    );
    return res.status(500).json({ message: "Ocorreu um erro interno no servidor." });
  }
}
async function deleteDspO(req, res) {
  const { id } = req.params;
  try {
    await db("dspO").delete().where({ id: id });
    return res.status(200).json({ message: "Registro removido com sucesso!" });
  } catch (error) {
    console.error(
      "error from Inserir deleteRecO from /controllers/controller.dspO.js",
      error
    );
    return res.status(500).json({ message: "Ocorreu um erro interno no servidor." });
  }
}

async function getDspOById(req, res) {
  const { id } = req.params;
  try {
    const recO = await db("dspO").where({ id: id }).first();
    if (!recO) {
      return res.status(404).json({ message: "Registro não encontrado." });
    }
    return res.status(200).json(dspO);
  } catch (error) {
    console.error(
      "error from getDspOById function from /controllers/controller.dspO.js",
      error
    );
    return res.status(500).json({ message: "Ocorreu um erro interno no servidor." });
  }
}

async function updateDspO(req, res) {
  const { id } = req.params;
  const dspOData = req.body;
  const body = dspOData.body;
  const index = dspOData.index;
  const tipoReg = body[0].value;
  try {
    let insert = {};
    for (const item of body) {
      Object.assign(insert, { [item.type]: item.value });
    }
    Object.assign(insert, { tipoRegistro: tipoReg });
    const toUpdate = await db("dspO").select().where({ id: id });

    if (toUpdate.length == 0) {
      return res.status(404).json({ message: "DSPo não encontrado." });
    }

    if (insert.tipoRegistro == 10) {
      insert.content = await toUpdate[0].content.content;
      await db("dspO").where({ id }).update({ content: insert }).returning("*");
    } else {
      toUpdate[0].content.content[index] = insert;
      await db("dspO").where({ id }).update({ content: toUpdate[0].content });
    }
    return res.status(200).json({ message: "got here!" });
  } catch (error) {
    console.error(
      "error from updateDspO function from /controllers/controller.dspO.js",
      error
    );
    return res.status(500).json({ message: "Ocorreu um erro interno no servidor." });
  }
}

export default {
  Inserir,
  InserirDspO,
  deleteDspO,
  getDspOById,
  updateDspO,
};

