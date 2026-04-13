import { db } from "../../database/postgres.js";

async function Inserir(req, res) {
  try {
    const arp = req.body;

    await db("arp").insert(arp);

    return res.status(200).json({ message: "ok" });
  } catch (error) {
    console.error(
      "error from Inserir function from /controllers/controller.arp.js",
      error
    );
    return res.status(500).json({ message: "Ocorreu um erro interno no servidor." });
  }
}

async function InserirArp(req, res) { 
  const { text, data } = req.body;
  const arp = [];

  try {
    const lines = await text.split("\n");

    let dataHelper = -1;

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];

      if (line.slice(0, 2) !== "99") {
        if (line.substring(0, 2) === "10") {
          dataHelper++;
          arp.push({
            data,
            content: {
              tipoRegistro: line.slice(0, 2).trim(),
              codOrgao: line.slice(2, 4).trim(),
              codUnidade: line.slice(4, 6).trim(),
              nroProcessoAdesao: line.slice(6, 10).trim(),
              dataAberturaProc: line.slice(10, 18).trim(),
              nomeOrgaoGerenciador: line.slice(18, 118).trim(),
              exercicioLicitacao: line.slice(118, 122).trim(),
              nroProcessoLicitatorio: line.slice(122, 134).trim(),
              codModalidadeLicitacao: line.slice(134, 135).trim(),
              nroModalidade: line.slice(135, 145).trim(),
              dataAtaRegPreco: line.slice(145, 153).trim(),
              dataValidade: line.slice(153, 161).trim(),
              naturezaProcedimento: line.slice(161, 162).trim(),
              dtPublicacaoAvisoIntencao: line.slice(162, 170).trim(),
              objetoAdesao: line.slice(170, 420).trim(),
              nroCpfResponsavel: line.slice(420, 431).trim(),
              nomeResponsavel: line.slice(431, 481).trim(),
              logradouro: line.slice(481, 531).trim(),
              setor: line.slice(531, 551).trim(),
              cidade: line.slice(551, 571).trim(),
              uf: line.slice(571, 573).trim(),
              CEP: line.slice(573, 581).trim(),
              telefone: line.slice(581, 591).trim(),
              email: line.slice(591, 671).trim(),
              descontoTabela: line.slice(671, 672).trim(),
              nroSequencial: line.slice(672, 678).trim(),
              content: [],
              line
            },
          });
        } else if (line.substring(0, 2) === "11") {
          if (
            arp[dataHelper] &&
            arp[dataHelper].content &&
            Array.isArray(arp[dataHelper].content.content)
          ) {
            arp[dataHelper].content.content.push({
              tipoRegistro: line.slice(0, 2).trim(),
              codOrgao: line.slice(2, 4).trim(),
              codUnidade: line.slice(4, 6).trim(),
              nroProcessoAdesao: line.slice(6, 10).trim(),
              dataAberturaProc: line.slice(10, 18).trim(),
              nroLote: line.slice(18, 22).trim(),
              nroItem: line.slice(22, 26).trim(),
              dtCotacao: line.slice(26, 34).trim(),
              dscItem: line.slice(34, 284).trim(),
              vlCotPrecosUnitario: line.slice(284, 297).trim(),
              quantidade: line.slice(297, 310).trim(),
              unidade: line.slice(310, 312).trim(),
              nroSequencial: line.slice(672, 678).trim(),
              line
            });
          }
        } else if (line.substring(0, 2) === "12") {
          if (
            arp[dataHelper] &&
            arp[dataHelper].content &&
            Array.isArray(arp[dataHelper].content.content)
          ) {
            arp[dataHelper].content.content.push({
              tipoRegistro: line.slice(0, 2).trim(),
              codOrgao: line.slice(2, 4).trim(),
              codUnidade: line.slice(4, 6).trim(),
              nroProcessoAdesao: line.slice(6, 10).trim(),
              dataAberturaProc: line.slice(10, 18).trim(),
              nroLote: line.slice(18, 22).trim(),
              nroItem: line.slice(22, 26).trim(),
              dscItem: line.slice(27, 276).trim(),
              precoUnitario: line.slice(276, 289).trim(),
              quantidadeLicitada: line.slice(289, 302).trim(),
              quantidadeAderida: line.slice(302, 315).trim(),
              unidade: line.slice(315, 317).trim(),
              nomeVencedor: line.slice(317, 417).trim(),
              tipoDocumento: line.slice(417, 418).trim(),
              nroDocumento: line.slice(418, 432).trim(),
              nroSequencial: line.slice(672, 678).trim(),
              line
            });
          }
        } else if (line.substring(0, 2) === "20") {
          if (
            arp[dataHelper] &&
            arp[dataHelper].content &&
            Array.isArray(arp[dataHelper].content.content)
          ) {
            arp[dataHelper].content.content.push({
              tipoRegistro: line.slice(0, 2).trim(),
              codOrgao: line.slice(2, 4).trim(),
              codUnidade: line.slice(4, 6).trim(),
              nroProcessoAdesao: line.slice(6, 10).trim(),
              dataAberturaProc: line.slice(10, 18).trim(),
              nroLote: line.slice(18, 22).trim(),
              nroItem: line.slice(22, 26).trim(),
              dscItem: line.slice(27, 276).trim(),
              percDesconto: line.slice(276, 289).trim(),
              nomeVencedor: line.slice(289, 389).trim(),
              tipoDocumento: line.slice(389, 390).trim(),
              nroDocumento: line.slice(390, 404).trim(),
              nroSequencial: line.slice(672, 678).trim(),
              line
            });
          }
        }
      }
    }

    await db.batchInsert(`${req.body.sch}.arp`, arp, 75);

    return res.status(200).json({ message: "ARP inserido com sucesso!" });
  } catch (error) {
    console.error(
      "error from InserirArp function from /controllers/controller.arp.js",
      error
    );
    return res.status(500).json({ message: "Ocorreu um erro interno no servidor." });
  }
}
async function deleteArp(req, res) {
  const { id } = req.params;
  try {
    await db("arp").delete().where({ id: id });
    return res.status(200).json({ message: "Registro removido com sucesso!" });
  } catch (error) {
    console.error(
      "error from Inserir deleteArp from /controllers/controller.arp.js",
      error
    );
    return res.status(500).json({ message: "Ocorreu um erro interno no servidor." });
  }
}

async function getArpById(req, res) {
  const { id } = req.params;
  try {
    const arp = await db("arp").where({ id: id }).first();
    if (!arp) {
      return res.status(404).json({ message: "Registro não encontrado." });
    }
    return res.status(200).json(arp);
  } catch (error) {
    console.error(
      "error from getArpById function from /controllers/controller.arp.js",
      error
    );
    return res.status(500).json({ message: "Ocorreu um erro interno no servidor." });
  }
}

async function updateArp(req, res) {
  const { id } = req.params;
  const arpData = req.body;
  const body = arpData.body;
  const index = arpData.index;
  const tipoReg = body[0].value;
  try {
    let insert = {};
    for (const item of body) {
      Object.assign(insert, { [item.type]: item.value });
    }
    Object.assign(insert, { tipoRegistro: tipoReg });
    const toUpdate = await db("arp").select().where({ id: id });

    if (toUpdate.length == 0) {
      return res.status(404).json({ message: "Aep não encontrado." });
    }

    if (insert.tipoRegistro == 10) {
      insert.content = await toUpdate[0].content.content;
      await db("arp").where({ id }).update({ content: insert }).returning("*");
    } else {
      toUpdate[0].content.content[index] = insert;
      await db("arp").where({ id }).update({ content: toUpdate[0].content });
    }
    return res.status(200).json({ message: "got here!" });
  } catch (error) {
    console.error(
      "error from updateArp function from /controllers/controller.arp.js",
      error
    );
    return res.status(500).json({ message: "Ocorreu um erro interno no servidor." });
  }
}

async function InserirArpManual(req, res) {
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
    await db("arp").insert(insert);
    return res.status(200).json({ message: "Registro inserido com sucesso!" });
  } catch (error) {
    console.error(
      "error from InserirArpManual function from /controllers/controller.arp.js",
      error
    );
    return res.status(500).json({ message: "Ocorreu um erro interno no servidor." });
  }
}

export default {
  Inserir,
  InserirArp,
  deleteArp,
  getArpById,
  updateArp,
  InserirArpManual,
};

