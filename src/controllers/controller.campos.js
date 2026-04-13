import { db } from "../database/postgres.js";
import natureza from "../helpers/natureza.js";

const campos = [
  "abl",
  "isi",
  "lnc",
  "lqd",
  "pct",
  "ops",
  "orgao",
  "par",
  "prl",
  "rec",
  "reo",
  "rpl",
  "rsp",
  "tfr",
  "trb",
  "anl",
  "aoc",
  "aop",
  "uoc",
  "are",
  "arp",
  "cvc",
  "ctb",
  "dcl",
  "dfr",
  "dmr",
  "dic",
  "dsi",
  "ecl",
  "eoc",
  "cob",
  "emp",
  "con",
  "hml",
  "ide",
  "jgl",
  "ext",
  "hbl",
  "aex",
  "alq",
];

async function deleteCampos(req, res) {
  try {
    const user = await natureza.getUser(req)
    const [date, org] = [req.params.date.split("-")[0], req.params.date.split("-")[1].padStart(2, "0")]
    let whereStr = ""
    
    if (date) whereStr += `data = ${date}`
    if (date && org) whereStr += " AND"
    if (org) whereStr += `content ->> 'codOrgao' = org`
    for (const name in campos) {
      if (date) {
        try {
          whereStr
            ? await db(campos[name]).whereRaw(whereStr).delete()
            : await db(campos[name]).delete()
        } catch {
          // console.log(`'${date.substring(0, 2)}${natureza.dataToYear(date)}' ${campos[name]}`)
          await db(`${user.schema}.${campos[name]}`).whereRaw(`SUBSTRING(content ->> 'dtInicio', 3, 6) = '${date.substring(0, 2)}${natureza.dataToYear(date)}'`).delete()
        }
      } else {
        await db(`${user.schema}.${campos[name]}`).delete()
      }
    }
    res.status(200).json({ message: "Todos os campos deletados com sucesso" });
  } catch (error) {
    console.error("Error in deleteCampos function controller.campos.js", error);
    return res.status(500).json({ message: "Ocorreu um erro interno no servidor." });
  }
}

async function getCampo(req, res) {
  // Paginacao
  let { page, pageSize, name } = req.params;
  page = parseInt(page, 10);
  pageSize = parseInt(pageSize, 10);
  if (isNaN(page) || page < 0) page = 0;
  if (isNaN(pageSize) || pageSize <= 0) pageSize = 10;
  const { mes, ano, org } = req.query;
  const user = await natureza.getUser(req)
  console.log(user.schema)
  try {
    let query = db(`${user.schema}.${name}`);

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
      "error from getAllAre function from /controllers/controller.are.js",
      error
    );
    return res.status(500).json({ message: "Ocorreu um erro interno no servidor." });
  }
}

async function getAllFromTable(req, res) {
  try {
    const { name } = req.params
    const result = await db.raw(`
      SELECT table_name
      FROM information_schema.tables
      WHERE table_schema = 'public'
      ORDER BY table_name
    `);
    const tableNames = result.rows.map(row => row.table_name);

    if (!tableNames.includes(name)) return res.status(404).json({ message: "Campo não encontrado." })

    const table = await db(name).select("*")

    res.status(200).json(table)

  } catch (error) {
    console.error("Error in getAllFromTable function controller.campos.js", error);
    return res.status(500).json({ message: "Ocorreu um erro interno no servidor." });
  }
}

async function updateTable(req, res) {
  try {
    const { name } = req.params
    const { campoToEnv } = req.body

    const idName = {}[name] || "id"

    await db(name).where({ [idName]: campoToEnv[idName] }).update(campoToEnv)

    res.status(200).json({ message: "ok" })
  } catch (error) {
    console.error("Error in updateTable function controller.campos.js", error);
    return res.status(500).json({ message: "Ocorreu um erro ao enviar o campo, não altere o id." });
  }
}

export default { deleteCampos, getAllFromTable, updateTable, getCampo };
