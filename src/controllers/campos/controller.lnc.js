import { db, query } from "../../database/postgres.js";
import natureza from "../../helpers/natureza.js";
import layoutMSC from "../balanceteContabil/layoutMSC.js";
import codND from "./addicionalInfo/codND.js";
import bulkUpdate from "../../helpers/bulkUpdate.js";

const layoutMSC_corrected = new Map(
  Object.entries(layoutMSC)
    .filter(([key, value]) => value?.tipoConta?.toUpperCase() === "A")
    .map(([key, value]) => [key.padEnd(9, "0"), value]),
);

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
      query = query.whereRaw(
        `content ->> 'codOrgao' = '${String(org).padStart(2, "0")}'`,
      );
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

    return res
      .status(200)
      .json({ response, totalPages: total, currentPage: page });
  } catch (error) {
    console.error(
      "error from getAllLnc function from /controllers/controller.lnc.js",
      error,
    );
    return res
      .status(500)
      .json({ message: "Ocorreu um erro interno no servidor." });
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
      error,
    );
    return res
      .status(500)
      .json({ message: "Ocorreu um erro interno no servidor." });
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
              line,
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
              line,
            });
          }
        }
      }
    }

    const added = await db.batchInsert("lnc", lnc, 75).returning("*");

    return res
      .status(200)
      .json({ message: "LNC inserido com sucesso!", lnc: added });
  } catch (error) {
    console.error(
      "error from InserirLnc function from /controllers/controller.lnc.js",
      error,
    );
    return res
      .status(500)
      .json({ message: "Ocorreu um erro interno no servidor." });
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
      error,
    );
    return res
      .status(500)
      .json({ message: "Ocorreu um erro interno no servidor." });
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
      error,
    );
    return res
      .status(500)
      .json({ message: "Ocorreu um erro interno no servidor." });
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
      error,
    );
    return res
      .status(500)
      .json({ message: "Ocorreu um erro interno no servidor." });
  }
}

async function addValtoLnc(lnc, codOrgao, data) {
  try {
    const all = [];
    all.push(
      await db("rec")
        .select("*")
        .whereRaw(
          `content ->> 'codOrgao' = '${String(codOrgao).padStart(2, "0")}' AND SUBSTRING(data, 3, 2) = '${String(data).substring(2, 4)}'`,
        ),
    );
    all.push(
      await db("are")
        .select("*")
        .whereRaw(
          `content ->> 'codOrgao' = '${String(codOrgao).padStart(2, "0")}' AND data = '${data}'`,
        ),
    );
    all.push(
      await db("aoc")
        .select("*")
        .whereRaw(
          `content ->> 'codOrgao' = '${String(codOrgao).padStart(2, "0")}' AND data = '${data}'`,
        ),
    );
    all.push(
      await db("emp")
        .select("*")
        .whereRaw(
          `content ->> 'codOrgao' = '${String(codOrgao).padStart(2, "0")}' AND SUBSTRING(data, 3, 2) = '${String(data).substring(2, 4)}'`,
        ),
    );
    all.push(
      await db("emp")
        .select("*")
        .whereRaw(
          `content ->> 'codOrgao' = '${String(codOrgao).padStart(2, "0")}' AND SUBSTRING(data, 3, 2) = '${String(parseInt(natureza.dataToYear(data)) - 1).substring(2, 4)}'`,
        ),
    );
    all.push(
      await db("anl")
        .select("*")
        .whereRaw(
          `content ->> 'codOrgao' = '${String(codOrgao).padStart(2, "0")}' AND data = '${data}'`,
        ),
    );
    all.push(
      await db("lqd")
        .select("*")
        .whereRaw(
          `content ->> 'codOrgao' = '${String(codOrgao).padStart(2, "0")}' AND data = '${data}'`,
        ),
    );
    all.push(
      await db("alq")
        .select("*")
        .whereRaw(
          `content ->> 'codOrgao' = '${String(codOrgao).padStart(2, "0")}' AND data = '${data}'`,
        ),
    );
    all.push(
      await db("ext")
        .select("*")
        .whereRaw(
          `content ->> 'codOrgao' = '${String(codOrgao).padStart(2, "0")}' AND data = '${data}'`,
        ),
    );
    all.push(
      await db("aex")
        .select("*")
        .whereRaw(
          `content ->> 'codOrgao' = '${String(codOrgao).padStart(2, "0")}' AND data = '${data}'`,
        ),
    );
    all.push(
      await db("ops")
        .select("*")
        .whereRaw(
          `content ->> 'codOrgao' = '${String(codOrgao).padStart(2, "0")}' AND data = '${data}'`,
        ),
    );
    all.push(
      await db("aop")
        .select("*")
        .whereRaw(
          `content ->> 'codOrgao' = '${String(codOrgao).padStart(2, "0")}' AND data = '${data}'`,
        ),
    );
    all.push(
      await db("rsp")
        .select("*")
        .whereRaw(
          `content ->> 'codOrgao' = '${String(codOrgao).padStart(2, "0")}' AND data = '${data}'`,
        ),
    );
    all.push(
      await db("con")
        .select("*")
        .whereRaw(
          `content ->> 'codOrgao' = '${String(codOrgao).padStart(2, "0")}' AND data = '${data}'`,
        ),
    );
    all.push(
      await db("ctb")
        .select("*")
        .whereRaw(
          `content ->> 'codOrgao' = '${String(codOrgao).padStart(2, "0")}' AND data = '${data}'`,
        ),
    );
    all.push(
      await db("trb")
        .select("*")
        .whereRaw(
          `content ->> 'codOrgao' = '${String(codOrgao).padStart(2, "0")}' AND data = '${data}'`,
        ),
    );
    all.push(
      await db("recO")
        .select("*")
        .whereRaw(
          `content ->> 'codOrgao' = '${String(codOrgao).padStart(2, "0")}' AND data = '${natureza.dataToYear(data)}'`,
        ),
    );
    all.push(
      await db("dspO")
        .select("*")
        .whereRaw(
          `content ->> 'codOrgao' = '${String(codOrgao).padStart(2, "0")}' AND data = '${natureza.dataToYear(data)}'`,
        ),
    );

    const PO_values = natureza.PO_values;
    const campos = {};
    const allCampos = [
      "rec",
      "are",
      "aoc",
      "emp",
      "emp24",
      "anl",
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
      "recO",
      "dspO",
    ];

    allCampos.forEach((name, index) => {
      campos[name] = all[index];
    });

    const rejected = [];

    lnc.forEach((c, cIndex) => {
      const content = c.content;
      const types = [];

      const ICs = { cods: [], arqs: [] };

      // beginning_balances
      if (c.tipoLancamento === "1") {
        content.content.forEach((item, index) => {
          lnc[cIndex].content.content[index].FR =
            item.codFontRecursos.substring(0, 1) + "802";
        });
      }

      // period changes adiante
      content.content.forEach((item, index) => {
        const layoutItem = layoutMSC_corrected.get(
          item.codConta.substring(0, 9),
        );

        if (item.tipoArquivoSicom === "00") {
          if (layoutItem?.contaICs) {
            const kVal = {
              cod: item.codConta.substring(0, 9),
              arq00: layoutItem?.arquivo?.nome,
              req: layoutItem.values,
              arq: item.tipoArquivoSicom,
              spec: {
                has: {
                  ...layoutItem.contaICs,
                },
              },
            };
            types.push(kVal);
            ICs.cods.push(item.codConta.substring(0, 9));
            ICs.arqs.push(item.tipoArquivoSicom);
            Object.entries(layoutItem.contaICs).forEach(
              ([key, value]) => (ICs[key] = value),
            );
          }
          if (layoutItem?.arquivo?.nome) {
            const name =
              { dspo: "dspO", reco: "recO" }[
                layoutItem.arquivo.nome.toLowerCase()
              ] || layoutItem.arquivo.nome.toLowerCase();
            const campName = {
              dspO: "valorFonte",
              recO: "vlFontRecursos",
              ext: "vlMovimentacao",
              emp: "vlRecurso",
              lqd: "vlDespesaFR",
            }[name];
            if (!campName) {
              return;
            }

            const campVal = campos[name]
              .flatMap((e) => e.content.content)
              .filter((e) => e.tipoRegistro === "11")
              .filter((e) => {
                return (
                  parseFloat(e[campName].replace(",", ".")) ===
                  parseFloat(item.valor.replace(",", "."))
                );
              });

            if (!campVal || campVal.length !== 1) return;
            const kVal = {
              cod: item.codConta.substring(0, 9),
              arq00: layoutItem?.arquivo?.nome,
              req: layoutItem.values,
              arq: item.tipoArquivoSicom,
            };

            const spec = {
              dspO: {
                has: {
                  ND: `${campVal.elementoDespesaMSC}${campVal.subElementoMSC}`,
                  FR: campVal.codFontRecursosMSC,
                  CO: campVal.codAEO,
                  PO: campVal.poderOrgao,
                },
              },
              recO: {
                has: {
                  CO: campVal.codAEO,
                  PO: campVal.poderOrgao,
                  FR: campVal.codFontRecursosMSC,
                  NR: campVal.rubrica,
                },
              },
              ext: {
                has: {
                  FR: "1869",
                  CO: "0000",
                },
              },
              emp: {
                ND: `${campVal.elementoDespesaMSC}${campVal.subElementoMSC}`,
                FR: `${campVal.codFontRecursosMSC}`,
                PO: `${campVal.poderOrgao}`,
                CO: `${campVal.codAEO}`,
                FS: `${campVal.codFuncao}${campVal.codSubFuncao}`,
              },
              lqd: {
                chave: campVal.nroEmpenho,
                campo: "emp",
                tipoReg: "11",
                toFilter: "nroEmpenho",
                toGet: {
                  ND: "elementoDespesaMSC|subElementoMSC",
                  FR: "codFontRecursosMSC",
                  PO: "poderOrgao",
                  CO: "codAEO",
                  FS: "codFuncao|codSubFuncao",
                },
              },
            };

            kVal.spec = spec[campName];
            types.push(kVal);
            return;
          }
        }

        if (!layoutItem) {
          console.log(item.codConta.substring(0, 9), "SEM layoutItem");
          return;
        }

        const kVal = {
          cod: item.codConta.substring(0, 9),
          arq00: layoutItem?.arquivo?.nome,
          req: layoutItem.values,
          arq: item.tipoArquivoSicom,
        };

        const spec = {
          "00": {
            campoSpecific: "00|cod",
            codConta: kVal.cod,
            valor: item.valor,
            lncId: c.id,
          },
          "01": {
            campoSpecific: "rec",
            chave: item.chaveArquivo.substring(item.chaveArquivo.length - 9),
          },
          "02": {
            chave: item.chaveArquivo.substring(item.chaveArquivo.length - 9),
            campo: "rec",
            tipoReg: "12",
            toFilter: "rubrica",
            toGet: {
              PO: "poderOrgao",
              FR: "codFontRecursosMSC",
              CO: "codAEO",
              NR: "rubrica",
            },
          },
          "03": {
            campoSpecific: "dspO|03",
            chaveArquivo: item.chaveArquivo,
            chave: `${item.chaveArquivo.substring(item.chaveArquivo.length - 17)}`,
          },
          "04": {
            chave: item.chaveArquivo.substring(item.chaveArquivo.length - 6),
            campo: "emp",
            tipoReg: "11",
            toFilter: "nroEmpenho",
            toGet: {
              ND: "elementoDespesaMSC|subElementoMSC",
              FR: "codFontRecursosMSC",
              PO: "poderOrgao",
              CO: "codAEO",
              FS: "codFuncao|codSubFuncao",
            },
          },
          "05": {
            chave: item.chaveArquivo.substring(133, 139),
            campo: "emp",
            tipoReg: "11",
            toFilter: "nroEmpenho",
            toGet: {
              ND: "elementoDespesaMSC|subElementoMSC",
              FR: "codFontRecursosMSC",
              PO: "poderOrgao",
              CO: "codAEO",
              FS: "codFuncao|codSubFuncao",
            },
          },
          "06": {
            chave: item.chaveArquivo.substring(122, 128),
            campo: "emp",
            tipoReg: "11",
            toFilter: "nroEmpenho",
            toGet: {
              ND: "elementoDespesaMSC|subElementoMSC",
              FR: "codFontRecursosMSC",
              PO: "poderOrgao",
              CO: "codAEO",
              FS: "codFuncao|codSubFuncao",
            },
          },
          "07": {
            chave: item.chaveArquivo.substring(108, 114),
            campo: "emp",
            tipoReg: "11",
            toFilter: "nroEmpenho",
            toGet: {
              ND: "elementoDespesaMSC|subElementoMSC",
              FR: "codFontRecursosMSC",
              PO: "poderOrgao",
              CO: "codAEO",
              FS: "codFuncao|codSubFuncao",
            },
          },
          "08": {
            has: {
              FR: "1869",
              CO: "",
            },
          },
          "09": {
            has: {
              FR: "1869",
              CO: "",
            },
          },
          10: {
            campoSpecific: "emp|10",
            chave: item.chaveArquivo.substring(
              item.chaveArquivo.length - 12,
              item.chaveArquivo.length - 6,
            ),
          },
          11: {
            chave: item.chaveArquivo.substring(138, 144),
            campo: "emp",
            tipoReg: "12",
            toFilter: "nroEmpenho",
            toGet: {
              ND: "elementoDespesaMSC|subElementoMSC",
              FR: "codFontRecursosMSC",
              PO: "poderOrgao",
              CO: "codAEO",
              FS: "codFuncao|codSubFuncao",
            },
          },
          14: {
            campoSpecific: "ctb|beginning",
            chave: item.chaveArquivo.substring(
              item.chaveArquivo.length - 26,
              item.chaveArquivo.length,
            ),
            chaveArquivo: item.chaveArquivo,
            valor: item.valor.substring(3),
          },
          15: {
            campoSpecific: "trb",
            chaveArquivo: item.chaveArquivo,
          },
        };
        kVal.spec = spec[item.tipoArquivoSicom];
        if (c.content.tipoLancamento !== "1" && item.tipoArquivoSicom === "14")
          kVal.spec = undefined;
        types.push(kVal);
        ICs.cods.push(item.codConta.substring(0, 9));
        ICs.arqs.push(item.tipoArquivoSicom);
      });

      if (ICs.NR && ICs.NR !== "nan") ICs.NR = "0" + ICs.NR.substring(1);

      types.forEach((e) => e?.req?.forEach((e) => (ICs[e] = "")));
      const inicialVals = [];
      Object.keys(ICs).forEach((e) => {
        if (!["CO", "PO", "FP", "DC", "cods", "arqs"].includes(e))
          inicialVals.push(e);
      });

      types.forEach((e) => {
        if (e?.spec?.has) {
          Object.entries(e.spec.has).forEach(([key, val]) => (ICs[key] = val));
          return;
        }
        if (!e.spec) return;

        if (e.spec.campoSpecific) {
          switch (e.spec.campoSpecific) {
            case "trb":
              const trb = campos.trb
                .flatMap((e) => e.content.content)
                .find((trbCamp) => {
                  return e.spec.chaveArquivo.endsWith(
                    [
                      trbCamp.codUnidadeDestino,
                      trbCamp.bancoDestino,
                      trbCamp.agenciaDestino,
                      trbCamp.contaCorrenteDestino,
                      trbCamp.contaCorrenteDestinoDigVerif,
                      trbCamp.tipoContaDestino,
                    ].join(""),
                  );
                });
              if (!trb) {
                console.log("non", e.spec.chave);
                return;
              }
              ICs.FR = trb.codFontRecursosMSC;
              break;
            case "dspO|03":
              const dspO = campos.dspO
                .flatMap((e) => e.content.content)
                .filter((e) => e.tipoRegistro === "11")
                .find(
                  (dspO) =>
                    [
                      dspO.codPrograma,
                      dspO.codOrgao,
                      dspO.codUnidade,
                      dspO.codFuncao,
                      dspO.codSubFuncao,
                      dspO.naturezaAcao,
                      dspO.nroProjAtiv,
                    ].join("") === e.spec.chave,
                );

              if (!dspO) break;

              ICs.FR = dspO.codFontRecursosMSC;
              ICs.ND = `${dspO.elementoDespesaMSC}${dspO.subElementoMSC}`;
              ICs.CO = dspO.codAEO;
              ICs.FS = `${dspO.codFuncao}${dspO.codSubFuncao}`;
              break;
            case "rec":
              const rec = campos.rec
                .flatMap((e) => e.content.content)
                .filter((e) => e.tipoRegistro === "12")
                .find((r) => r.rubrica === e.spec.chave);
              if (!rec) return;
              ICs.CO = rec.codAEO;
              ICs.FR = rec.codFontRecursosMSC;
              ICs.NR = rec.rubrica;
              // console.log("01", ICs.CO, "CO")
              // console.log("01", ICs.FR, "FR")
              // console.log("01", ICs.NR, "NR")
              break;
            case "emp|10":
              const emp = campos.emp
                .flatMap((e) => e.content.content)
                .filter((e) => e.tipoRegistro === "11")
                .find((emp) => emp.nroEmpenho === e.spec.chave);
              if (!emp) {
                const ops = campos.ops
                  .flatMap((e) => e.content)
                  .find((ops) => ops.nroEmpenho === e.spec.chave);
                // console.log(ops, "opsAAA")
                ICs.ND = codND.get(ops.elementoDespesa + ops.subElemento);
                ICs.AI = ops.dtInscricao.substring(4);
                ICs.FR = "1869";
                ICs.FS = ops.codFuncao + ops.codSubFuncao;
                return;
              }
              // console.log(emp, "emp")
              ICs.FR = emp.codFontRecursosMSC;
              ICs.ND = emp.elementoDespesaMSC + emp.subElementoMSC;
              ICs.CO = emp.codAEO;
              ICs.FS = emp.codFuncao + emp.codSubFuncao;
              break;
            case "00|cod":
              switch (e.spec.codConta) {
                case "632700000":
                  let path = {};
                  lnc.forEach((c, i) => {
                    if (c.id !== e.spec.lncId) return;
                    path.base = i;
                    path.content = c.content.content.findIndex(
                      (e) => e.codConta.substring(0, 9) === "632700000",
                    );
                  });

                  lnc[path.base].content.content[path.content].subCampos = [
                    ...campos.rsp.map((e) => {
                      const emp24 = campos.emp24
                        .flatMap((e) =>
                          e.content.content.filter(
                            (e) => e.tipoRegistro === "11",
                          ),
                        )
                        .find(
                          (emp11) => e.content.nroEmpenho === emp11.nroEmpenho,
                        );

                      if (!emp24) {
                        console.log(
                          e.content.nroEmpenho,
                          e.content.DotOrigP2002,
                          e.content.dtEmpenho,
                        );
                        return;
                      }

                      return {
                        natureza: "C",
                        ND: codND.get(e.content.DotOrigP2002.substring(15, 23)),
                        FS: e.content.DotOrigP2002.substring(6, 11),
                        AI: e.content.dtEmpenho.substring(4),
                        FR:
                          emp24.codFontRecursosMSC &&
                          emp24.codFontRecursosMSC !== "nan"
                            ? emp24.codFontRecursosMSC
                            : `err:${emp24.codFontRecursos}`,
                        nroEmpenho: e.content.nroEmpenho,
                        valor: e.content.vlSaldoAnt,
                      };
                    }),
                  ];
                  // console.log(lnc[path.base].content.content[path.content].subCampos)
                  break;
              }
              break;
            case "ctb|beginning":
              const ctb = campos.ctb
                .map((e) => e.content)
                .find((ctb) => {
                  let chave = e.spec.chave;
                  if (chave.substring(0, 2) !== codOrgao) {
                    chave =
                      chave.substring(1, chave.length - 2) +
                      "X" +
                      chave.substring(chave.length - 2);
                  }
                  return ctb.line.substring(2, 28) === chave;
                });

              if (!ctb || !ctb?.content) {
                console.log(
                  "CTB BEGINNING",
                  e.spec.chave,
                  e.spec.valor,
                  `\n${e.spec.chaveArquivo}`,
                );
                break;
              }

              let ctb11 =
                ctb.content.find(
                  (ctb11) => ctb11.saldoInicial === e.spec.valor,
                ) || ctb.content;
              if (!ctb11) break;
              if (Array.isArray(ctb11)) {
                if (ctb11.length === 0) break;
                let can = true;
                const { codFontRecursosMSC, codAEO } = ctb11[0];

                ctb11.forEach((e) => {
                  if (
                    e.codFontRecursosMSC !== codFontRecursosMSC ||
                    e.codAEO !== codAEO
                  )
                    can = false;
                });
                ICs.FR = ICs.FR || codFontRecursosMSC;
                ICs.CO = ICs.CO || codAEO;
                break;
              }
              ICs.FR = ICs.FR || ctb11.codFontRecursosMSC;
              ICs.CO = ICs.CO || ctb11.codAEO;

              break;
          }
          return;
        }

        const campo = campos[e.spec.campo]
          .flatMap((e) => e.content.content)
          .find(
            (val) =>
              val.tipoRegistro === e.spec.tipoReg &&
              e.spec.chave === val[e.spec.toFilter],
          );

        if (!campo) return;
        Object.entries(e.spec.toGet).forEach(([key, val]) => {
          const env = [];
          val.split("|").forEach((k) => {
            env.push(campo[k]);
          });
          if (Object.keys(ICs).includes(key)) ICs[key] = env.join("");
        });
      });

      let passed = true;
      // console.log(inicialVals)
      inicialVals.forEach((key) => {
        if (!ICs[key] || ICs[key] === "nan") {
          passed = false;
          // console.log("falt", key, ICs)
        } else {
          // console.log("pass")
        }
      });

      content.content.forEach((e, i) => {
        const env = {};
        Object.entries(ICs).forEach(([key, val]) => {
          if (!["cods", "arqs"].includes(key)) env[key] = val;
        });
        lnc[cIndex].content.content[i] = { ...e, ...env };
      });

      if (!passed) rejected.push(c.id);
    });

    await db.transaction(async (trx) => {
      await bulkUpdate({
        trx,
        idField: "id",
        data: lnc,
        table: "lnc",
      });
    });

    console.log(rejected.length);
    return rejected;
  } catch (error) {
    console.error(
      "error from addValtoLnc function from C:\\Users\\isacc\\Documents\\newHub\\hub-api\\src\\controllers\\campos\\controller.lnc.js",
      error,
    );
    return null;
  }
}

async function getInvalid(req, res) {
  try {
    const all_lnc = await db("lnc").select("*");

    const response = all_lnc.filter((lnc) => {
      let valid = true;

      lnc.content.content.forEach((e) => {
        if (e.tipoRegistro !== "11") return;
        const layoutItem = layoutMSC_corrected.get(e.codConta.substring(0, 9));
        if (!layoutItem) {
          console.log(
            "layoutItem faltando para codConta",
            e.codConta.substring(0, 9),
          );
        }
        layoutItem.values.forEach((key) => {
          const check = e[key];
          if (!check || check === "nan" || check === "nannan") valid = false;
        });
      });

      return !valid;
    });

    res.status(200).json(response);
  } catch (error) {
    console.error(
      "error from getInvalid function from C:\\Users\\isacc\\Documents\\newHub\\hub-api\\src\\controllers\\campos\\controller.lnc.js",
      error,
    );
  }
}

async function recarregarData(req, res) {
  try {
    const { data } = req.body;
    const lncs = data
      ? await db("lnc").select("*").where({ data })
      : await db("lnc").select("*");
    if (lncs.length === 0)
      return res.status(404).json({
        message: `Nenhum lnc encontrado${data ? " para a data especificada." : ""}`,
      });
    const lncsByOrg = {};
    lncs.forEach((lnc) => {
      const org = lnc.content.codOrgao;
      if (!lncsByOrg[org]) lncsByOrg[org] = {};
      if (!lncsByOrg[org][lnc.data]) lncsByOrg[org][lnc.data] = [];
      lncsByOrg[org][lnc.data].push(lnc);
    });

    const sorted = [];

    Object.entries(lncsByOrg).forEach(([org, val]) => {
      const datas = Object.keys(val).toSorted((a, b) => {
        if (
          parseInt(natureza.dataToYear(a)) -
            parseInt(natureza.dataToYear(b)) !==
          0
        )
          return natureza.dataToYear(a) - natureza.dataToYear(b);
        return parseInt(a.substring(0, 2)) - parseInt(b.substring(0, 2));
      });
      datas.forEach((d) => sorted.push(`${org}|${d}`));
    });

    const promiseResponse = await Promise.all(
      sorted.map((e) =>
        addValtoLnc(
          lncsByOrg[e.split("|")[0]][e.split("|")[1]],
          e.split("|")[0],
          e.split("|")[1],
        ),
      ),
    );

    console.log(promiseResponse);
  } catch (error) {
    console.error(
      "error from recarregarData function from C:\\Users\\isacc\\Documents\\newHub\\hub-api\\src\\controllers\\campos\\controller.lnc.js",
      error,
    );
  }
}

export default {
  getAllLnc,
  Inserir,
  InserirLnc,
  deleteLnc,
  getLncById,
  updateLnc,
  addValtoLnc,
  getInvalid,
  recarregarData,
};
