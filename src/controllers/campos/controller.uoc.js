import { db } from "../../database/postgres.js";
async function Inserir(req, res) {
  try {
    const uoc = req.body;

    await db("uoc").insert(uoc);

    return res.status(200).json({ message: "ok" });
  } catch (error) {
    console.error(
      "error from Inserir function from /controllers/controller.uoc.js",
      error
    );
    return res.status(500).json({ message: "Ocorreu um erro interno no servidor." });
  }
}

async function InserirUoc(req, res) { 
  const { text, data } = req.body;
  const uoc = [];

  try {
    const lines = await text.split("\n");

    let dataHelper = -1;

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];

      if (line.slice(0, 2) !== "99") {
        if (line.substring(0, 2) === "10") {
          dataHelper++;
          uoc.push({
            data,
            content: {
              tipoRegistro: line.slice(0, 2).trim(),
              codOrgao: line.slice(2, 4).trim(),
              codUnidade: line.slice(4, 6).trim(),
              descrição: line.slice(6, 56).trim(),
              numConsolidacao: line.slice(56, 58).trim(),
              nroSequencial: line.slice(384, 390).trim(),
              content: [],
              line
            },
          });
        } else if (line.substring(0, 2) === "11") {
          if (
            uoc[dataHelper] &&
            uoc[dataHelper].content &&
            Array.isArray(uoc[dataHelper].content.content)
          ) {
            uoc[dataHelper].content.content.push({
              tipoRegistro: line.slice(0, 2).trim(),
              codOrgao: line.slice(2, 4).trim(),
              codUnidade: line.slice(4, 6).trim(),
              cpfOrdenadorDespesa: line.slice(6, 17).trim(),
              dataInicio: line.slice(17, 25).trim(),
              tipoResponsável: line.slice(25, 26).trim(),
              dataFim: line.slice(26, 34).trim(),
              nomeOrdendorDespesa: line.slice(34, 84).trim(),
              cargoOrdenadorDespesa: line.slice(84, 134).trim(),
              lograResOrdenador: line.slice(134, 184).trim(),
              setorLograOrdenador: line.slice(184, 204).trim(),
              cidadeLograOrdenador: line.slice(204, 224).trim(),
              ufCidadeLograOrdendor: line.slice(224, 226).trim(),
              cepLograOrdenador: line.slice(226, 234).trim(),
              foneOrdenador: line.slice(234, 244).trim(),
              email: line.slice(244, 324).trim(),
              escolaridade: line.slice(324, 326).trim(),
              nroSequencial: line.slice(384, 390).trim(),
              line
            });
          }
        } else if (line.substring(0, 2) === "12") {
          if (
            uoc[dataHelper] &&
            uoc[dataHelper].content &&
            Array.isArray(uoc[dataHelper].content.content)
          ) {
            uoc[dataHelper].content.content.push({
              tipoRegistro: line.slice(0, 2).trim(),
              codOrgao: line.slice(2, 4).trim(),
              codUnidade: line.slice(4, 6).trim(),
              cpf: line.slice(6, 17).trim(),
              dtInicio: line.slice(17, 25).trim(),
              dtFinal: line.slice(25, 33).trim(),
              nome: line.slice(33, 83).trim(),
              crc: line.slice(83, 94).trim(),
              ufCrc: line.slice(94, 96).trim(),
              provimento: line.slice(96, 98).trim(),
              cnpjEmpresaTerceirizada: line.slice(98, 112).trim(),
              razaoSocialTerceirizada: line.slice(112, 192).trim(),
              lograRes: line.slice(192, 242).trim(),
              setorLogra: line.slice(242, 262).trim(),
              cidadeLogra: line.slice(262, 282).trim(),
              ufCidadeLogra: line.slice(282, 284).trim(),
              cepLogra: line.slice(284, 292).trim(),
              fone: line.slice(292, 302).trim(),
              email: line.slice(302, 382).trim(),
              escolaridade: line.slice(382, 384).trim(),
              nroSequencial: line.slice(384, 390).trim(),
              line
            });
          }
        } else if (line.substring(0, 2) === "13") {
          if (
            uoc[dataHelper] &&
            uoc[dataHelper].content &&
            Array.isArray(uoc[dataHelper].content.content)
          ) {
            uoc[dataHelper].content.content.push({
              tipoRegistro: line.slice(0, 2).trim(),
              codOrgao: line.slice(2, 4).trim(),
              codUnidade: line.slice(4, 6).trim(),
              cpf: line.slice(6, 17).trim(),
              dtInicio: line.slice(17, 25).trim(),
              dtFinal: line.slice(25, 33).trim(),
              nome: line.slice(33, 83).trim(),
              lograRes: line.slice(83, 133).trim(),
              setorLogra: line.slice(133, 153).trim(),
              cidadeLogra: line.slice(153, 173).trim(),
              ufCidadeLogra: line.slice(173, 175).trim(),
              cepLogra: line.slice(175, 183).trim(),
              fone: line.slice(183, 193).trim(),
              email: line.slice(193, 273).trim(),
              escolaridade: line.slice(273, 275).trim(),
              nroSequencial: line.slice(384, 390).trim(),
              line
            });
          }
        } else if (line.substring(0, 2) === "14") {
          if (
            uoc[dataHelper] &&
            uoc[dataHelper].content &&
            Array.isArray(uoc[dataHelper].content.content)
          ) {
            uoc[dataHelper].content.content.push({
              tipoRegistro: line.slice(0, 2).trim(),
              codOrgao: line.slice(2, 4).trim(),
              codUnidade: line.slice(4, 6).trim(),
              cpf: line.slice(6, 17).trim(),
              dtInicio: line.slice(17, 25).trim(),
              dtFinal: line.slice(25, 33).trim(),
              nome: line.slice(33, 83).trim(),
              oab: line.slice(83, 91).trim(),
              ufOab: line.slice(91, 93).trim(),
              provimento: line.slice(93, 95).trim(),
              cnpjEmpresaTerceirizada: line.slice(95, 109).trim(),
              razaoSocialTerceirizada: line.slice(109, 189).trim(),
              lograRes: line.slice(189, 239).trim(),
              setorLogra: line.slice(239, 259).trim(),
              cidadeLogra: line.slice(259, 279).trim(),
              ufCidadeLogra: line.slice(279, 281).trim(),
              cepLogra: line.slice(281, 289).trim(),
              fone: line.slice(289, 299).trim(),
              email: line.slice(299, 379).trim(),
              nroSequencial: line.slice(384, 390).trim(),
              line
            });
          }
        }
      }
    }

    await db.batchInsert(`${req.body.sch}.uoc`, uoc, 75);

    return res.status(200).json({ message: "UOC inserido com sucesso!" });
  } catch (error) {
    console.error(
      "error from InserirUoc function from /controllers/controller.uoc.js",
      error
    );
    return res.status(500).json({ message: "Ocorreu um erro interno no servidor." });
  }
}
async function deleteUoc(req, res) {
  const { id } = req.params;
  try {
    await db("uoc").delete().where({ id: id });
    return res.status(200).json({ message: "Registro removido com sucesso!" });
  } catch (error) {
    console.error(
      "error from Inserir deleteUoc from /controllers/controller.uoc.js",
      error
    );
    return res.status(500).json({ message: "Ocorreu um erro interno no servidor." });
  }
}

async function getUocById(req, res) {
  const { id } = req.params;
  try {
    const uoc = await db("uoc").where({ id: id }).first();
    if (!uoc) {
      return res.status(404).json({ message: "Registro não encontrado." });
    }
    return res.status(200).json(uoc);
  } catch (error) {
    console.error(
      "error from getUocById function from /controllers/controller.uoc.js",
      error
    );
    return res.status(500).json({ message: "Ocorreu um erro interno no servidor." });
  }
}

async function updateUoc(req, res) {
  const { id } = req.params;
  
  const uocData = req.body;
  const body = uocData.body;
  const index = uocData.index;
  const tipoReg = body[0].value;
  try {
    let insert = {};
    for (const item of body) {
      Object.assign(insert, { [item.type]: item.value });
    }
    Object.assign(insert, { tipoRegistro: tipoReg });
    const toUpdate = await db("uoc").select().where({ id: id });

    if (toUpdate.length == 0) {
      return res.status(404).json({ message: "UOC não encontrado." });
    }

    if (insert.tipoRegistro == 10) {
      insert.content = await toUpdate[0].content.content;
      
      await db("uoc").where({ id }).update({ content: insert }).returning("*");
    } else {
      
      toUpdate[0].content.content[index] = insert;
      await db("uoc").where({ id }).update({ content: toUpdate[0].content });
    }
    return res.status(200).json({ message: "got here!" });
  } catch (error) {
    console.error(
      "error from updateUoc function from /controllers/controller.uoc.js",
      error
    );
    return res.status(500).json({ message: "Ocorreu um erro interno no servidor." });
  }
}

async function InserirUocManual(req, res) {
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
    await db("uoc").insert(insert);
    return res.status(200).json({ message: "Registro inserido com sucesso!" });
  } catch (error) {
    console.error(
      "error from InserirUocManual function from /controllers/controller.uoc.js",
      error
    );
    return res.status(500).json({ message: "Ocorreu um erro interno no servidor." });
  }
}

export default {
  Inserir,
  InserirUoc,
  deleteUoc,
  getUocById,
  updateUoc,
  InserirUocManual,
};

