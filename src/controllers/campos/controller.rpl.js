import { db } from "../../database/postgres.js";

async function Inserir(req, res) {
  try {
    const rpl = req.body;

    await db("rpl").insert(rpl);

    return res.status(200).json({ message: "ok" });
  } catch (error) {
    console.error(
      "error from Inserir function from /controllers/controller.rpl.js",
      error
    );
    return res.status(500).json({ message: "Ocorreu um erro interno no servidor." });
  }
}

async function InserirRpl(req, res) { 
  const { text, data } = req.body;
  const rpl = [];

  try {
    const lines = await text.split("\n");

    let dataHelper = -1;

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];

      if (line.slice(0, 2) !== "99") {
        if (line.substring(0, 2) === "10") {
          dataHelper++;
          rpl.push({
            data,
            content: {
              tipoRegistro: line.slice(0, 2).trim(),
              codOrgao: line.slice(2, 4).trim(),
              codUnidade: line.slice(4, 6).trim(),
              exercicioLicitacao: line.slice(6, 10).trim(),
              nroProcessoLicitatorio: line.slice(10, 22).trim(),
              tipoResponsabilidade: line.slice(22, 23).trim(),
              cpfResponsavel: line.slice(23, 34).trim(),
              nomeResponsavel: line.slice(34, 134).trim(),
              cargoResponsavel: line.slice(134, 184).trim(),
              lograResResponsavel: line.slice(184, 234).trim(),
              setorLograResponsavel: line.slice(234, 254).trim(),
              cidadeLograResponsavel: line.slice(254, 274).trim(),
              ufCidadeLograResponsavel: line.slice(274, 276).trim(),
              cepLograResponsavel: line.slice(276, 284).trim(),
              foneResponsavel: line.slice(284, 294).trim(),
              email: line.slice(294, 374).trim(),
              escolaridade: line.slice(374, 376).trim(),
              nroSequencial: line.slice(391, 397).trim(),
              content: [],
              line
            },
          });
        } else if (line.substring(0, 2) === "20") {
          if (
            rpl[dataHelper] &&
            rpl[dataHelper].content &&
            Array.isArray(rpl[dataHelper].content.content)
          ) {
            rpl[dataHelper].content.content.push({
              tipoRegistro: line.slice(0, 2).trim(),
              codOrgao: line.slice(2, 4).trim(),
              codUnidade: line.slice(4, 6).trim(),
              exercicioLicitacao: line.slice(6, 10).trim(),
              nroProcessoLicitatorio: line.slice(10, 22).trim(),
              tipoComissao: line.slice(22, 23).trim(),
              codAtribuicao: line.slice(23, 24).trim(),
              cpfMembroComissao: line.slice(24, 35).trim(),
              tipoAtoNomeacao: line.slice(35, 36).trim(),
              nroAtoNomeacao: line.slice(36, 44).trim(),
              dataAtoNomeacao: line.slice(44, 52).trim(),
              inicioVigencia: line.slice(52, 60).trim(),
              finalVigencia: line.slice(60, 68).trim(),
              nomMembroComLic: line.slice(68, 148).trim(),
              cargo: line.slice(148, 198).trim(),
              naturezaCargo: line.slice(198, 199).trim(),
              lograResMembro: line.slice(199, 249).trim(),
              setorLograMembro: line.slice(249, 269).trim(),
              cidadeLograMembro: line.slice(269, 289).trim(),
              ufCidadeLograMembro: line.slice(289, 291).trim(),
              cepLograMembro: line.slice(291, 299).trim(),
              foneMembro: line.slice(299, 309).trim(),
              email: line.slice(309, 389).trim(),
              escolaridade: line.slice(389, 391).trim(),
              nroSequencial: line.slice(391, 397).trim(),
              line
            });
          }
        }
      }
    }

    await db.batchInsert(`${req.body.sch}.rpl`, rpl, 75);

    return res.status(200).json({ message: "EMP inserido com sucesso!" });
  } catch (error) {
    console.error(
      "error from InserirRpl function from /controllers/controller.rpl.js",
      error
    );
    return res.status(500).json({ message: "Ocorreu um erro interno no servidor." });
  }
}
async function deleteRpl(req, res) {
  const { id } = req.params;
  try {
    await db("rpl").delete().where({ id: id });
    return res.status(200).json({ message: "Registro removido com sucesso!" });
  } catch (error) {
    console.error(
      "error from Inserir deleteRpl from /controllers/controller.rpl.js",
      error
    );
    return res.status(500).json({ message: "Ocorreu um erro interno no servidor." });
  }
}

async function getRplById(req, res) {
  const { id } = req.params;
  try {
    const rpl = await db("rpl").where({ id: id }).first();
    if (!rpl) {
      return res.status(404).json({ message: "Registro não encontrado." });
    }
    return res.status(200).json(rpl);
  } catch (error) {
    console.error(
      "error from getRplById function from /controllers/controller.rpl.js",
      error
    );
    return res.status(500).json({ message: "Ocorreu um erro interno no servidor." });
  }
}

async function updateRpl(req, res) {
  const { id } = req.params;
  
  const rplData = req.body;
  const body = rplData.body;
  const index = rplData.index;
  const tipoReg = body[0].value;
  try {
    let insert = {};
    for (const item of body) {
      Object.assign(insert, { [item.type]: item.value });
    }
    Object.assign(insert, { tipoRegistro: tipoReg });
    const toUpdate = await db("rpl").select().where({ id: id });

    if (toUpdate.length == 0) {
      return res.status(404).json({ message: "Emp não encontrado." });
    }

    if (insert.tipoRegistro == 10) {
      insert.content = await toUpdate[0].content.content;
      
      await db("rpl").where({ id }).update({ content: insert }).returning("*");
    } else {
      
      toUpdate[0].content.content[index] = insert;
      await db("rpl").where({ id }).update({ content: toUpdate[0].content });
    }
    return res.status(200).json({ message: "got here!" });
  } catch (error) {
    console.error(
      "error from updateRpl function from /controllers/controller.rpl.js",
      error
    );
    return res.status(500).json({ message: "Ocorreu um erro interno no servidor." });
  }
}

async function InserirRplManual(req, res) {
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
    await db("rpl").insert(insert);
    return res.status(200).json({ message: "Registro inserido com sucesso!" });
  } catch (error) {
    console.error(
      "error from InserirRplManual function from /controllers/controller.rpl.js",
      error
    );
    return res.status(500).json({ message: "Ocorreu um erro interno no servidor." });
  }
}

export default {
  Inserir,
  InserirRpl,
  deleteRpl,
  getRplById,
  updateRpl,
  InserirRplManual,
};

