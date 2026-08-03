

// -----------------------------------------------
import { db } from "../../database/postgres.js";
import { StatusCodes } from "http-status-codes";
import natureza from "../../helpers/natureza.js";
import controllerCampos from "./controller.campos.js";

async function zipUpload(req, res) {
  try {
    /**
     * @typedef {Object} fileContent
     * @property {String} name
     * @property {content} content
     */
    /** @type {[fileContent]()} */
    const files = req.body.files
    const user = await natureza.getUser(req)
    files.forEach((e, i) => {
      files[i].name = e.name.toLowerCase();
    });

    const orgaoSpecifics = {};

    const [orgao] = files.filter((e) => e.name.substring(0, 5) == "orgao");

    orgaoSpecifics.codOrgao = orgao.content.substring(2, 4);
    orgaoSpecifics.tipoOrgao = orgao.content.substring(81, 83);
    console.log(orgaoSpecifics.codOrgao)
    const hasTipoOrgao = await db.schema.withSchema(user.schema).hasTable("tipoOrgaos")
    if (!hasTipoOrgao) {
      return res.status(StatusCodes.FAILED_DEPENDENCY).json({ message: "Tipo de manejamento de dados não especificado para este orgão, Nenhuma alteração foi feita." })
    }
    const tipoOrgao = await db.withSchema(user.schema).table("tipoOrgaos").select("*").first()
    const ManejOrgao = tipoOrgao.tipos.find((e) => e.cod === orgaoSpecifics.codOrgao)?.tipo
    if (!ManejOrgao) {
      return res.status(StatusCodes.FAILED_DEPENDENCY).json({ message: "Tipo de manejamento de dados não especificado para este orgão, Nenhuma alteração foi feita." })
    }

    const checkOrg = (await db.withSchema(user.schema).table("orgao").select("*")).filter(
      (e) =>
        e.content.dtFinal === orgao.content.slice(23, 31).trim() &&
        e.content.dtInicio === orgao.content.slice(15, 23).trim() &&
        e.content.codOrgao === orgao.content.slice(2, 4).trim() &&
        e.content.descOrgao === orgao.content.slice(31, 81).trim() &&
        e.content.tipoOrgao === orgao.content.slice(81, 83).trim(),
    );

    if (checkOrg.length !== 0) {
      return res.status(StatusCodes.BAD_REQUEST).json({
        orgao: true,
        message:
          "Este órgão já foi adicionado neste mês. Nenhum dado novo foi incluído.",
      });
    }


    const codOrgao = orgao.content.slice(2, 4).trim();
    const data = files.find((f) => f.name.startsWith("lnc")).name.substring(3, 7)

    const order = [
      "ide",
      "isi",
      "uoc",
      "rec",
      "are",
      "aoc",
      "cob",
      "emp",
      "anl",
      "eoc",
      "lqd",
      "alq",
      "ext",
      "aex",
      "ops",
      "aop",
      "rsp",
      "con",
      "ctb",
      "trb",
      "cvc",
      "ecl",
      "tfr",
      "dfr",
      "dic",
      "dcl",
      "par",
      "pct",
      "dmr",
      "abl",
      "rpl",
      "hbl",
      "jgl",
      "hml",
      "prl",
      "arp",
      "dsi",
    ]

    const defaultInfo = {
      data,
      sch: user.schema,
      codOrgao
      
    }

    const org = await controllerCampos.inserir.orgao({
      text: files.find((e) => e.name.startsWith("orgao")).content,
      ...defaultInfo
    })

    const lnc = await controllerCampos.inserir.lnc({
      text: files.find((e) => e.name.startsWith("lnc")).content,
      ...defaultInfo
    })

    if (!lnc) return res.status(StatusCodes.FAILED_DEPENDENCY).json({ message: "Não foi possível enviar o LNC." })

    for (const index in order) {
      const name = order[index]
      const camp = await controllerCampos.inserir[name]({
        text: files.find((e) => e.name.startsWith(name)).content,
        ...defaultInfo,
      })
    }

    await controllerCampos.special.addValtoLnc(lnc, codOrgao, data, user, ManejOrgao)

    return res.status(200).json({ message: "OK" })
  } catch (error) {
    console.error(
      "error from zipUpload function from /controllers/controller.massUpload.js",
      error,
    );
    return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json();
  }
}

export default { zipUpload };
