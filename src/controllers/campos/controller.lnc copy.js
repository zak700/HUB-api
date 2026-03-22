import { db } from "../../database/postgres.js";
import natureza from "../../helpers/natureza.js";
import layoutMSC from "../balanceteContabil/layoutMSC.js";

const layoutMSC_corrected = new Map(
  Object.entries(layoutMSC).filter(([key, value]) => value?.tipoConta?.toUpperCase() === "A").map(([key, value]) => [key.padEnd(9, "0"), value])
)

async function getAllLnc(req, res) {
  // Paginacao
  let { page, pageSize } = req.params;
  page = parseInt(page, 10);
  pageSize = parseInt(pageSize, 10);
  if (isNaN(page) || page < 0) page = 0;
  if (isNaN(pageSize) || pageSize <= 0) pageSize = 10;
  const { mes, ano, org } = req.query;

  try {
    let query = db("lnc");

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
      "error from getAllLnc function from /controllers/controller.lnc.js",
      error
    );
    return res.status(500).json({ message: "Ocorreu um erro interno no servidor." });
  }
}

async function Inserir(req, res) {
  try {
    const lnc = req.body;

    await db("lnc").insert(lnc);

    return res.status(200).json({ message: "ok" });
  } catch (error) {
    console.error(
      "error from Inserir function from /controllers/controller.lnc.js",
      error
    );
    return res.status(500).json({ message: "Ocorreu um erro interno no servidor." });
  }
}

async function InserirLnc(req, res) {
  const { text, data, codOrgao } = req.body;

  const lnc = [];

  try {

    const lines = await text.split("\n");

    let dataHelper = -1;

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];

      if (line.slice(0, 2) !== "99") {
        if (line.substring(0, 2) === "10") {
          dataHelper++;
          lnc.push({
            data,
            content: {
              tipoRegistro: line.slice(0, 2).trim(),
              codOrgao,
              tipoUnidade: line.slice(2, 4).trim(),
              numControle: line.slice(4, 17).trim(),
              mesReferencia: line.slice(17, 19).trim(),
              dataRegistro: line.slice(19, 27).trim(),
              tipoLancamento: line.slice(27, 28).trim(),
              dataTransacao: line.slice(28, 36).trim(),
              histórico: line.slice(36, 1036).trim(),
              nroSequencial: line.slice(1036, 1042).trim(),
              content: [],
            },
          });
        } else if (line.substring(0, 2) === "11") {
          if (
            lnc[dataHelper] &&
            lnc[dataHelper].content &&
            Array.isArray(lnc[dataHelper].content.content)
          ) {
            lnc[dataHelper].content.content.push({
              tipoRegistro: line.slice(0, 2).trim(),
              tipoUnidade: line.slice(2, 4).trim(),
              numrControle: line.slice(4, 17).trim(),
              codConta: line.slice(17, 47).trim(),
              atributoConta: line.slice(47, 48).trim(),
              natLancamento: line.slice(48, 49).trim(),
              valor: line.slice(49, 65).trim(),
              tipoArquivoSicom: line.slice(65, 67).trim(),
              chaveArquivo: line.slice(67, 217).trim(),
              nroSequencial: line.slice(1036, 1042).trim(),
            });
          }
        }
      }
    }

    const added = []

    // upload
    for (const item of lnc) {
      const val = await db("lnc").insert(item).returning("*")
      added.push(val)
    }

    return res.status(200).json({ message: "LNC inserido com sucesso!", lnc: added });
  } catch (error) {
    console.error(
      "error from InserirLnc function from /controllers/controller.lnc.js",
      error
    );
    return res.status(500).json({ message: "Ocorreu um erro interno no servidor." });
  }
}
async function deleteLnc(req, res) {
  const { id } = req.params;
  try {
    await db("lnc").delete().where({ id: id });
    return res.status(200).json({ message: "Registro removido com sucesso!" });
  } catch (error) {
    console.error(
      "error from Inserir deleteLnc from /controllers/controller.lnc.js",
      error
    );
    return res.status(500).json({ message: "Ocorreu um erro interno no servidor." });
  }
}

async function getLncById(req, res) {
  const { id } = req.params;
  try {
    const lnc = await db("lnc").where({ id: id }).first();
    if (!lnc) {
      return res.status(404).json({ message: "Registro não encontrado." });
    }
    return res.status(200).json(lnc);
  } catch (error) {
    console.error(
      "error from getLncById function from /controllers/controller.lnc.js",
      error
    );
    return res.status(500).json({ message: "Ocorreu um erro interno no servidor." });
  }
}

async function updateLnc(req, res) {
  const { id } = req.params;

  const lncData = req.body;
  const body = lncData.body;
  const index = lncData.index;
  const tipoReg = body[0].value;
  try {
    let insert = {};
    for (const item of body) {
      Object.assign(insert, { [item.type]: item.value });
    }
    Object.assign(insert, { tipoRegistro: tipoReg });
    const toUpdate = await db("lnc").select().where({ id: id });

    if (toUpdate.length == 0) {
      return res.status(404).json({ message: "Emp não encontrado." });
    }

    if (insert.tipoRegistro == 10) {
      insert.content = await toUpdate[0].content.content;

      await db("lnc").where({ id }).update({ content: insert }).returning("*");
    } else {

      toUpdate[0].content.content[index] = insert;
      await db("lnc").where({ id }).update({ content: toUpdate[0].content });
    }
    return res.status(200).json({ message: "got here!" });
  } catch (error) {
    console.error(
      "error from updateLnc function from /controllers/controller.lnc.js",
      error
    );
    return res.status(500).json({ message: "Ocorreu um erro interno no servidor." });
  }
}

async function addValtoLnc(lnc, codOrgao, data) {
  try {
    const all = await Promise.all([
      db("rec").select("*").whereRaw(`content ->> 'codOrgao' = '${String(codOrgao).padStart(2, "0")}' AND data = '${data}'`),
      db("are").select("*").whereRaw(`content ->> 'codOrgao' = '${String(codOrgao).padStart(2, "0")}' AND data = '${data}'`),
      db("aoc").select("*").whereRaw(`content ->> 'codOrgao' = '${String(codOrgao).padStart(2, "0")}' AND data = '${data}'`),
      db("emp").select("*").whereRaw(`content ->> 'codOrgao' = '${String(codOrgao).padStart(2, "0")}' AND data = '${data}'`),
      db("anl").select("*").whereRaw(`content ->> 'codOrgao' = '${String(codOrgao).padStart(2, "0")}' AND data = '${data}'`),
      db("lqd").select("*").whereRaw(`content ->> 'codOrgao' = '${String(codOrgao).padStart(2, "0")}' AND data = '${data}'`),
      db("alq").select("*").whereRaw(`content ->> 'codOrgao' = '${String(codOrgao).padStart(2, "0")}' AND data = '${data}'`),
      db("ext").select("*").whereRaw(`content ->> 'codOrgao' = '${String(codOrgao).padStart(2, "0")}' AND data = '${data}'`),
      db("aex").select("*").whereRaw(`content ->> 'codOrgao' = '${String(codOrgao).padStart(2, "0")}' AND data = '${data}'`),
      db("ops").select("*").whereRaw(`content ->> 'codOrgao' = '${String(codOrgao).padStart(2, "0")}' AND data = '${data}'`),
      db("aop").select("*").whereRaw(`content ->> 'codOrgao' = '${String(codOrgao).padStart(2, "0")}' AND data = '${data}'`),
      db("rsp").select("*").whereRaw(`content ->> 'codOrgao' = '${String(codOrgao).padStart(2, "0")}' AND data = '${data}'`),
      db("con").select("*").whereRaw(`content ->> 'codOrgao' = '${String(codOrgao).padStart(2, "0")}' AND data = '${data}'`),
      db("ctb").select("*").whereRaw(`content ->> 'codOrgao' = '${String(codOrgao).padStart(2, "0")}' AND data = '${data}'`),
      db("trb").select("*").whereRaw(`content ->> 'codOrgao' = '${String(codOrgao).padStart(2, "0")}' AND data = '${data}'`),
      db("recO").select("*").whereRaw(`content ->> 'codOrgao' = '${String(codOrgao).padStart(2, "0")}' AND data = '${natureza.dataToYear(data)}'`),
      db("dspO").select("*").whereRaw(`content ->> 'codOrgao' = '${String(codOrgao).padStart(2, "0")}' AND data = '${natureza.dataToYear(data)}'`),
    ])
    const campos = {}
    const allCampos = ["rec", "are", "aoc", "emp", "anl", "lqd", "alq", "ext", "aex", "ops", "aop", "rsp", "con", "ctb", "trb", "recO", "dspO"]

    console.log(all)

    allCampos.forEach((name, index) => {
      campos[name] = all[index];
    })

    const got = {}

    lnc.forEach(({ content }, cIndex) => {
      content.content.forEach((item, index) => {
        const layoutItem = layoutMSC_corrected.get(item.codConta.substring(0, 9))

        const getArq = {
          "521110000|621100000": () => {
            const key = item.valor + "|" + item.codConta.substring(0, 9) + "|" + item.natLancamento
            const recO = campos.recO.map((e) => e.content.content).flat().filter((rec) => {
              return parseFloat(rec.vlFontRecursos.replace(",", ".")) ===
                parseFloat(item.valor.replace(",", "."))
            }
            )
            if (!got.recO) got.recO = {}
            if (got.recO[key] !== undefined) got.recO[key] = got.recO[key] + 1
            else got.recO[key] = 0

            if (!recO[got.recO[key]]) return null

            return {
              FR: recO[got.recO[key]].codFontRecursosMSC,
              PO: recO[got.recO[key]].poderOrgao,
              CO: recO[got.recO[key]].codAEO,
            }
          },
          "622110000|522110100": () => {
            const key = item.valor + "|" + item.codConta.substring(0, 9) + "|" + item.natLancamento
            const dspO = campos.dspO.map((e) => e.content.content).flat().filter((dspO) => {
              return parseFloat(dspO.valorFonte.replace(",", ".")) ===
                parseFloat(item.valor.replace(",", "."))
            }
            )
            if (!got.dspO) got.dspO = {}
            if (got.dspO[key] !== undefined) got.dspO[key] = got.dspO[key] + 1
            else got.dspO[key] = 0

            if (!dspO[got.dspO[key]]) return null

            return {
              FS: `${dspO[got.dspO[key]].codFuncao}${dspO[got.dspO[key]].codSubFuncao}`,
              ND: `${dspO[got.dspO[key]].codNaturezaDaDespesa}00`,
              FR: dspO[got.dspO[key]].codFontRecursosMSC,
              PO: dspO[got.dspO[key]].poderOrgao,
              CO: dspO[got.dspO[key]].codAEO,
            }
          },
          "622920101|622130100|821120100|522920101|622110000|821110100": () => {
            const emp = campos.emp
              .map((e) => e.content.content)
              .flat()
              .find((e) => e.nroEmpenho === item.chaveArquivo.substring(item.chaveArquivo.length - 6))

            // -------------------------
            // suspeita que pode se dar numeros errados por estar sem key

            if (!emp) return null

            return {
              ND: `${emp.elementoDespesaMSC}${emp.subElementoMSC}`,
              FR: emp.codFontRecursosMSC || "",
              CO: emp.codAEO || "",
              FS: emp.codFuncao || "" + emp.codSubFuncao || "",
            }
          },
          "111110200|621200000|821110100|499130000|621100000|721120000": () => {
            if (item.codConta.substring(0, 9) === "111110200") return {}
            const rec = campos.rec
              .flatMap((e) => e.content.content)
              .filter((e) => e.tipoRegistro === "12")
              .find((e) => e.rubrica === item.chaveArquivo.substring(item.chaveArquivo.length - 9))
            if (!rec) return null

            const env = {
              PO: rec.poderOrgao,
              FR: rec.codFontRecursosMSC,
              CO: rec.codAEO,
              NR: item.chaveArquivo.substring(item.chaveArquivo.length - 9)
            }

            if (item.codConta.substring(0, 9) === "621200000") {
              lnc[cIndex].content.content[0] = {
                ...lnc[cIndex].content.content[0],
                ...env
              }
            }

            return env
          },
          "218910102|622920103|622130300|821130100|622920101|622130100|821120100|399610000": () => {
            const chave = item.chaveArquivo.substring(122, 128)

            const emp = campos.emp
              .flatMap((e) => e.content.content)
              .find((e) => e.nroEmpenho === chave)

            if (!emp) return null

            return {
              ND: `${emp.elementoDespesaMSC}${emp.subElementoMSC}`,
              FR: emp.codFontRecursosMSC || "",
              CO: emp.codAEO || "",
              FS: emp.codFuncao || "" + emp.codSubFuncao || "",
            }
          },
          "111110200|622920104|622130400|821110100|821140100|218910102|622920103|622130300|821110100|821130100": () => {
            if (item.codConta.substring(0, 9) === "111110200") return {}
            const chave = item.chaveArquivo.substring(138, 138 + 6)

            const emp = campos.emp
              .flatMap((e) => e.content.content)
              .find((e) => e.nroEmpenho === chave)

            if (!emp) return null

            const env = {
              ND: `${emp.elementoDespesaMSC}${emp.subElementoMSC}`,
              FR: emp.codFontRecursosMSC || "",
              CO: emp.codAEO || "",
              FS: emp.codFuncao || "" + emp.codSubFuncao || "",
            }

            if (item.codConta.substring(0, 9) === "622130400") {
              lnc[cIndex].content.content[0] = {
                ...lnc[cIndex].content.content[0],
                ...env
              }
            }

            return env
          },
          "421110201|621200000|821110100|621100000|721120000|111110200": () => {
            if (item.codConta.substring(0, 9) === "111110200") return {}
            const rec = campos.rec
              .flatMap((e) => e.content.content)
              .filter((e) => e.tipoRegistro === "12")
              .find((e) => e.rubrica === item.chaveArquivo.substring(item.chaveArquivo.length - 9))
            if (!rec) return null

            const env = {
              PO: rec.poderOrgao,
              FR: rec.codFontRecursosMSC,
              CO: rec.codAEO,
              NR: item.chaveArquivo.substring(item.chaveArquivo.length - 9)
            }

            if (item.codConta.substring(0, 9) === "721120000") content.content[5] = { ...content.content[5], ...env }

            return env
          },
          "111110200|421120101|621200000|821110100|621100000|721120000": () => {
            if (item.codConta.substring(0, 9) === "111110200") return {}
            const rec = campos.rec
              .flatMap((e) => e.content.content)
              .filter((e) => e.tipoRegistro === "12")
              .find((e) => e.rubrica === item.chaveArquivo.substring(item.chaveArquivo.length - 9))
            if (!rec) return null

            const env = {
              PO: rec.poderOrgao,
              FR: rec.codFontRecursosMSC,
              CO: rec.codAEO,
              NR: item.chaveArquivo.substring(item.chaveArquivo.length - 9)
            }

            if (item.codConta.substring(0, 9) === "421120101") {
              lnc[cIndex].content.content[0] = {
                ...lnc[cIndex].content.content[0],
                ...env
              }
            }

            return env
          },
          "821130200|111110200|111110604|821140200|218810115": () => {
            return { FR: "1869", CO: "" }
          },
          "622920101|622130100|821120100|622110000|522920101|821110100": () => {
            const chave = item.chaveArquivo.substring(item.chaveArquivo.length - 6)

            const emp = campos.emp
              .flatMap((e) => e.content.content)
              .find((e) => e.nroEmpenho === chave)

            if (!emp) return null

            return {
              ND: `${emp.elementoDespesaMSC}${emp.subElementoMSC}`,
              FR: emp.codFontRecursosMSC || "",
              CO: emp.codAEO || "",
              FS: emp.codFuncao || "" + emp.codSubFuncao || "",
            }
          },
          "622910200|622920101|622130100|821120100|622910100|622120200|522920101|821110100": () => {
            const chave = item.chaveArquivo.substring(item.chaveArquivo.length - 6)

            const emp = campos.emp
              .flatMap((e) => e.content.content)
              .find((e) => e.nroEmpenho === chave)

            if (!emp) return null

            return {
              ND: `${emp.elementoDespesaMSC}${emp.subElementoMSC}`,
              FR: emp.codFontRecursosMSC || "",
              CO: emp.codAEO || "",
              FS: emp.codFuncao || "" + emp.codSubFuncao || "",
            }
          },
          "211430700|622920102|622130200|821120200|221430200|622920101|622130100|821120100": () => {
            const chave = item.chaveArquivo.substring(item.chaveArquivo.length - 6)

            const emp = campos.emp
              .flatMap((e) => e.content.content)
              .find((e) => e.nroEmpenho === chave)

            if (!emp) return null

            return {
              ND: `${emp.elementoDespesaMSC}${emp.subElementoMSC}`,
              FR: emp.codFontRecursosMSC || "",
              CO: emp.codAEO || "",
              FS: emp.codFuncao || "" + emp.codSubFuncao || "",
            }
          },
          "812310202|812310201": () => {
            
          }

          // "622910100|622120200|522910100|622110000" inserir manualmente
        }

        const key = Object.keys(getArq).find((cod) => {
          const ord = cod.split("|")
          if (ord.length !== content.content.length) return false
          return ord.every((o, i) => o === content.content[i].codConta.substring(0, 9))
        })


        const arq = getArq[key]?.()
        if (arq) {
          console.log("Found", arq, item.codConta.substring(0, 9), layoutItem.arquivo?.nome)
          lnc[cIndex].content.content[index] = {
            ...item,
            ...arq,
          }
        } else if (key) {
          console.log(item.codConta.substring(0, 9), "not found in", key, "with value", item.valor)
        }
      }
      )
    })
  } catch (error) {
    console.error(
      "error from addValtoLnc function from C:\\Users\\isacc\\Documents\\newHub\\hub-api\\src\\controllers\\campos\\controller.lnc.js",
      error
    );
    return null;
  }
}

export default {
  getAllLnc,
  Inserir,
  InserirLnc,
  deleteLnc,
  getLncById,
  updateLnc,
  addValtoLnc
};
