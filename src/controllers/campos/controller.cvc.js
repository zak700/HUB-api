import { db } from "../../database/postgres.js";

async function Inserir(req, res) {
  try {
    const cvc = req.body;

    await db("cvc").insert(cvc);

    return res.status(200).json({ message: "ok" });
  } catch (error) {
    console.error(
      "error from Inserir function from /controllers/controller.cvc.js",
      error
    );
    return res.status(500).json({ message: "Ocorreu um erro interno no servidor." });
  }
}
 
async function InserirCvc(req, res) {
  const { text, data } = req.body;
  const cvc = [];

  try {
    const lines = await text.split("\n");

    let dataHelper = -1;

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];

      if (line.slice(0, 2) !== "99") {
        if (line.substring(0, 2) === "10") {
          dataHelper++;
          cvc.push({
            data,
            content: {
              tipoRegistro: line.slice(0, 2).trim(),
              codOrgao: line.slice(2, 4).trim(),
              codUnidade: line.slice(4, 6).trim(),
              codVeiculo: line.slice(6, 16).trim(),
              descVeiculo: line.slice(16, 116).trim(),
              tpVeiculo: line.slice(116, 118).trim(),
              subTipoVeiculo: line.slice(118, 120).trim(),
              modelo: line.slice(120, 170).trim(),
              ano: line.slice(170, 174).trim(),
              placa: line.slice(174, 182).trim(),
              chassi: line.slice(182, 212).trim(),
              nrSerie: line.slice(212, 232).trim(),
              situacao: line.slice(232, 234).trim(),
              tpDeslocamento: line.slice(234, 236).trim(),
              qtdeInicial: line.slice(236, 242).trim(),
              qtdeFinal: line.slice(242, 248).trim(),
              trocaHodHor: line.slice(248, 249).trim(),
              qtdeHodHorAnt: line.slice(249, 255).trim(),
              atestadoControle: line.slice(255, 256).trim(),
              nroSequencial: line.slice(256, 262).trim(),
              content: [],
              line
            },
          });
        } else if (line.substring(0, 2) === "11") {
          if (
            cvc[dataHelper] &&
            cvc[dataHelper].content &&
            Array.isArray(cvc[dataHelper].content.content)
          ) {
            cvc[dataHelper].content.content.push({
              tipoRegistro: line.slice(0, 2).trim(),
              codOrgao: line.slice(2, 4).trim(),
              codUnidade: line.slice(4, 6).trim(),
              codVeiculo: line.slice(6, 16).trim(),
              tipoGasto: line.slice(16, 18).trim(),
              tpCombustivelLub: line.slice(18, 20).trim(),
              origemCombustivel: line.slice(20, 21).trim(),
              orgaoLotacao: line.slice(21, 23).trim(),
              unidadeLotacao: line.slice(23, 25).trim(),
              qtdeUtilizada: line.slice(25, 30).trim(),
              nroSequencial: line.slice(256, 262).trim(),
              line
            });
          }
        } else if (line.substring(0, 2) === "20") {
          if (
            cvc[dataHelper] &&
            cvc[dataHelper].content &&
            Array.isArray(cvc[dataHelper].content.content)
          ) {
            cvc[dataHelper].content.content.push({
              tipoRegistro: line.slice(0, 2).trim(),
              codPrograma: line.slice(2, 6).trim(),
              codOrgao: line.slice(6, 8).trim(),
              codUnidade: line.slice(8, 10).trim(),
              codFuncao: line.slice(10, 12).trim(),
              codSubFuncao: line.slice(12, 15).trim(),
              naturezaAcao: line.slice(15, 16).trim(),
              nroProjAtiv: line.slice(16, 19).trim(),
              elementoDespesa: line.slice(19, 25).trim(),
              subelementoDespesa: line.slice(25, 27).trim(),
              nroEmpenho: line.slice(27, 33).trim(),
              dtEmpenho: line.slice(33, 41).trim(),
              nroSequencial: line.slice(256, 262).trim(),
              line
            });
          }
        }
      }
    }

    await db.batchInsert(`${req.body.sch}.cvc`, cvc, 75);

    return res.status(200).json({ message: "CVC inserido com sucesso!" });
  } catch (error) {
    console.error(
      "error from InserirCvc function from /controllers/controller.cvc.js",
      error
    );
    return res.status(500).json({ message: "Ocorreu um erro interno no servidor." });
  }
}
async function deleteCvc(req, res) {
  const { id } = req.params;
  try {
    await db("cvc").delete().where({ id: id });
    return res.status(200).json({ message: "Registro removido com sucesso!" });
  } catch (error) {
    console.error(
      "error from Inserir deleteCvc from /controllers/controller.cvc.js",
      error
    );
    return res.status(500).json({ message: "Ocorreu um erro interno no servidor." });
  }
}

async function getCvcById(req, res) {
  const { id } = req.params;
  try {
    const cvc = await db("cvc").where({ id: id }).first();
    if (!cvc) {
      return res.status(404).json({ message: "Registro não encontrado." });
    }
    return res.status(200).json(cvc);
  } catch (error) {
    console.error(
      "error from getCvcById function from /controllers/controller.cvc.js",
      error
    );
    return res.status(500).json({ message: "Ocorreu um erro interno no servidor." });
  }
}

async function updateCvc(req, res) {
  const { id } = req.params;
  const cvcData = req.body;
  const body = cvcData.body;
  const index = cvcData.index;
  const tipoReg = body[0].value;
  try {
    let insert = {};
    for (const item of body) {
      Object.assign(insert, { [item.type]: item.value });
    }
    Object.assign(insert, { tipoRegistro: tipoReg });
    const toUpdate = await db("cvc").select().where({ id: id });

    if (toUpdate.length == 0) {
      return res.status(404).json({ message: "CVC não encontrado." });
    }

    if (insert.tipoRegistro == 10) {
      insert.content = await toUpdate[0].content.content;
      await db("cvc").where({ id }).update({ content: insert }).returning("*");
    } else {
      toUpdate[0].content.content[index] = insert;
      await db("cvc").where({ id }).update({ content: toUpdate[0].content });
    }
    return res.status(200).json({ message: "got here!" });
  } catch (error) {
    console.error(
      "error from updateCvc function from /controllers/controller.cvc.js",
      error
    );
    return res.status(500).json({ message: "Ocorreu um erro interno no servidor." });
  }
}

async function InserirCvcManual(req, res) {
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
    await db("cvc").insert(insert);
    return res.status(200).json({ message: "Registro inserido com sucesso!" });
  } catch (error) {
    console.error(
      "error from InserirCvcManual function from /controllers/controller.cvc.js",
      error
    );
    return res.status(500).json({ message: "Ocorreu um erro interno no servidor." });
  }
}

export default {
  Inserir,
  InserirCvc,
  deleteCvc,
  getCvcById,
  updateCvc,
  InserirCvcManual,
};

