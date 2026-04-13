import { db } from "../../database/postgres.js";

async function Inserir(req, res) {
  try {
    const ops = req.body;

    await db("ops").insert(ops);

    return res.status(200).json({ message: "ok" });
  } catch (error) {
    console.error(
      "error from Inserir function from /controllers/controller.ops.js",
      error
    );
    return res.status(500).json({ message: "Ocorreu um erro interno no servidor." });
  }
}
 
async function InserirOps(req, res) {
  const { text, data } = req.body;
  const ops = [];

  try {
    const lines = await text.split("\n");

    let dataHelper = -1;

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];

      if (line.slice(0, 2) !== "99") {
        if (line.substring(0, 2) === "10") {
          dataHelper++;
          ops.push({
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
              elementoDespesa: line.slice(19, 25).trim(),
              subElemento: line.slice(25, 27).trim(),
              dotOrigP2001: line.slice(27, 48).trim(),
              nroEmpenho: line.slice(48, 54).trim(),
              nroOP: line.slice(54, 60).trim(),
              tipoOP: line.slice(60, 61).trim(),
              dtInscricao: line.slice(61, 69).trim(),
              dtEmissao: line.slice(69, 77).trim(),
              vlOP: line.slice(77, 90).trim(),
              nomeCredor: line.slice(90, 140).trim(),
              tipoCredor: line.slice(140, 141).trim(),
              cpfCnpj: line.slice(141, 155).trim(),
              especificacaoOP: line.slice(155, 355).trim(),
              cpfRespOP: line.slice(355, 366).trim(),
              nomeRespOP: line.slice(366, 416).trim(),
              nrExtraOrcamentaria: line.slice(416, 422).trim(),
              idColare: line.slice(422, 437).trim(),
              nroSequencial: line.slice(437, 443).trim(),
              content: [],
              line
            },
          });
        } else if (line.substring(0, 2) === "11") {
          if (
            ops[dataHelper] &&
            ops[dataHelper].content &&
            Array.isArray(ops[dataHelper].content.content)
          ) {
            ops[dataHelper].content.content.push({
              tipoRegistro: line.slice(0, 2).trim(),
              codPrograma: line.slice(2, 6).trim(),
              codOrgao: line.slice(6, 8).trim(),
              codUnidade: line.slice(8, 10).trim(),
              codFuncao: line.slice(10, 12).trim(),
              codSubFuncao: line.slice(12, 15).trim(),
              naturezaAcao: line.slice(15, 16).trim(),
              nroProjAtiv: line.slice(16, 19).trim(),
              elementoDespesa: line.slice(19, 25).trim(),
              subElemento: line.slice(25, 27).trim(),
              dotOrigP2001: line.slice(27, 48).trim(),
              nroEmpenho: line.slice(48, 54).trim(), // chave
              nroOP: line.slice(54, 60).trim(),
              nrLiquidacao: line.slice(60, 66).trim(),
              dtLiquidacao: line.slice(66, 74).trim(),
              vlLiquidacao: line.slice(74, 87).trim(),
              vlOPVinculadoLiquidacao: line.slice(87, 100).trim(),
              nroSequencial: line.slice(437, 443).trim(),
              line
            });
          }
        } else if (line.substring(0, 2) === "12") {
          if (
            ops[dataHelper] &&
            ops[dataHelper].content &&
            Array.isArray(ops[dataHelper].content.content)
          ) {
            ops[dataHelper].content.content.push({
              tipoRegistro: line.slice(0, 2).trim(),
              codPrograma: line.slice(2, 6).trim(),
              codOrgao: line.slice(6, 8).trim(),
              codUnidade: line.slice(8, 10).trim(),
              codFuncao: line.slice(10, 12).trim(),
              codSubFuncao: line.slice(12, 15).trim(),
              naturezaAcao: line.slice(15, 16).trim(),
              nroProjAtiv: line.slice(16, 19).trim(),
              elementoDespesa: line.slice(19, 25).trim(),
              subElemento: line.slice(25, 27).trim(),
              dotOrigP2001: line.slice(27, 48).trim(),
              nroEmpenho: line.slice(48, 54).trim(),
              nroOP: line.slice(54, 60).trim(),
              codUnidadeFinanceira: line.slice(60, 62).trim(),
              banco: line.slice(62, 65).trim(),
              agencia: line.slice(65, 69).trim(),
              contaCorrente: line.slice(69, 81).trim(),
              contaCorrenteDigVerif: line.slice(81, 82).trim(),
              tipoConta: line.slice(82, 84).trim(),
              nrDocumento: line.slice(84, 99).trim(),
              tipoDocumento: line.slice(99, 101).trim(),
              vlDocumento: line.slice(101, 114).trim(),
              dtEmissao: line.slice(114, 122).trim(),
              vlAssociado: line.slice(122, 135).trim(),
              nroSequencial: line.slice(437, 443).trim(),
              line
            });
          }
        } else if (line.substring(0, 2) === "13") {
          if (
            ops[dataHelper] &&
            ops[dataHelper].content &&
            Array.isArray(ops[dataHelper].content.content)
          ) {
            ops[dataHelper].content.content.push({
              tipoRegistro: line.slice(0, 2).trim(),
              codPrograma: line.slice(2, 6).trim(),
              codOrgao: line.slice(6, 8).trim(),
              codUnidade: line.slice(8, 10).trim(),
              codFuncao: line.slice(10, 12).trim(),
              codSubFuncao: line.slice(12, 15).trim(),
              naturezaAcao: line.slice(15, 16).trim(),
              nroProjAtiv: line.slice(16, 19).trim(),
              elementoDespesa: line.slice(19, 25).trim(),
              subElemento: line.slice(25, 27).trim(),
              dotOrigP2001: line.slice(27, 48).trim(),
              nroEmpenho: line.slice(48, 54).trim(),
              nroOP: line.slice(54, 60).trim(),
              codUnidadeFinanceira: line.slice(60, 62).trim(),
              banco: line.slice(62, 65).trim(),
              agencia: line.slice(65, 69).trim(),
              contaCorrente: line.slice(69, 81).trim(),
              contaCorrenteDigVerif: line.slice(81, 82).trim(),
              tipoConta: line.slice(82, 84).trim(),
              nrDocumento: line.slice(84, 99).trim(),
              codFonteRecurso: line.slice(99, 105).trim(),
              vlFR: line.slice(105, 118).trim(),
              nroSequencial: line.slice(437, 443).trim(),
              line
            });
          }
        } else if (line.substring(0, 2) === "14") {
          if (
            ops[dataHelper] &&
            ops[dataHelper].content &&
            Array.isArray(ops[dataHelper].content.content)
          ) {
            ops[dataHelper].content.content.push({
              tipoRegistro: line.slice(0, 2).trim(),
              codPrograma: line.slice(2, 6).trim(),
              codOrgao: line.slice(6, 8).trim(),
              codUnidade: line.slice(8, 10).trim(),
              codFuncao: line.slice(10, 12).trim(),
              codSubFuncao: line.slice(12, 15).trim(),
              naturezaAcao: line.slice(15, 16).trim(),
              nroProjAtiv: line.slice(16, 19).trim(),
              elementoDespesa: line.slice(19, 25).trim(),
              subElemento: line.slice(25, 27).trim(),
              dotOrigP2001: line.slice(27, 48).trim(),
              nroEmpenho: line.slice(48, 54).trim(),
              nroOP: line.slice(54, 60).trim(),
              tipoRetencao: line.slice(60, 62).trim(),
              nrExtraOrcamentaria: line.slice(62, 68).trim(),
              descricaoRetencao: line.slice(68, 118).trim(),
              VlRetencao: line.slice(118, 131).trim(),
              nroSequencial: line.slice(437, 443).trim(),
              line
            });
          }
        }
      }
    }

    await db.batchInsert(`${req.body.sch}.ops`, ops, 75);

    return res.status(200).json({ message: "EMP inserido com sucesso!" });
  } catch (error) {
    console.error(
      "error from InserirOps function from /controllers/controller.ops.js",
      error
    );
    return res.status(500).json({ message: "Ocorreu um erro interno no servidor." });
  }
}
async function deleteOps(req, res) {
  const { id } = req.params;
  try {
    await db("ops").delete().where({ id: id });
    return res.status(200).json({ message: "Registro removido com sucesso!" });
  } catch (error) {
    console.error(
      "error from Inserir deleteOps from /controllers/controller.ops.js",
      error
    );
    return res.status(500).json({ message: "Ocorreu um erro interno no servidor." });
  }
}

async function getOpsById(req, res) {
  const { id } = req.params;
  try {
    const ops = await db("ops").where({ id: id }).first();
    if (!ops) {
      return res.status(404).json({ message: "Registro não encontrado." });
    }
    return res.status(200).json(ops);
  } catch (error) {
    console.error(
      "error from getObsById function from /controllers/controller.ops.js",
      error
    );
    return res.status(500).json({ message: "Ocorreu um erro interno no servidor." });
  }
}

async function updateOps(req, res) {
  const { id } = req.params;
  
  const opsData = req.body;
  const body = opsData.body;
  const index = opsData.index;
  const tipoReg = body[0].value;
  try {
    let insert = {};
    for (const item of body) {
      Object.assign(insert, { [item.type]: item.value });
    }
    Object.assign(insert, { tipoRegistro: tipoReg });
    const toUpdate = await db("ops").select().where({ id: id });

    if (toUpdate.length == 0) {
      return res.status(404).json({ message: "Ops não encontrado." });
    }

    if (insert.tipoRegistro == 10) {
      insert.content = await toUpdate[0].content.content;
      
      await db("ops").where({ id }).update({ content: insert }).returning("*");
    } else {
      
      toUpdate[0].content.content[index] = insert;
      await db("ops").where({ id }).update({ content: toUpdate[0].content });
    }
    return res.status(200).json({ message: "got here!" });
  } catch (error) {
    console.error(
      "error from updateOps function from /controllers/controller.ops.js",
      error
    );
    return res.status(500).json({ message: "Ocorreu um erro interno no servidor." });
  }
}

async function InserirOpsManual(req, res) {
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
    await db("ops").insert(insert);
    return res.status(200).json({ message: "Registro inserido com sucesso!" });
  } catch (error) {
    console.error(
      "error from InserirOpsManual function from /controllers/controller.ops.js",
      error
    );
    return res.status(500).json({ message: "Ocorreu um erro interno no servidor." });
  }
}

export default {
  Inserir,
  InserirOps,
  deleteOps,
  getOpsById,
  updateOps,
  InserirOpsManual,
};

