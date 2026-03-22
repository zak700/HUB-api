import { db } from "../../../database/postgres.js";
import dataHelper from "./controller.anexo1.js";

const perm = [
  "319001",
  "319003",
  "319004",
  "319011",
  "319012",
  "319013",
  "319016",
  "319091",
  "319092",
  "319094",
  "319096",
  "329021",
  "329022",
  "335041",
  "335043",
  "339008",
  "339014",
  "339030",
  "339032",
  "339033",
  "339034",
  "339035",
  "339036",
  "339037",
  "339039",
  "339040",
  "339041",
  "339042",
  "339043",
  "339045",
  "339046",
  "339047",
  "339048",
  "339049",
  "339091",
  "339092",
  "339093",
  "339096",
  "449051",
  "449052",
  "449061",
  "449092",
  "449093",
  "469070",
  "469071",
  "309030",
  "309031",
  "309032",
  "999999",
  "999999",
];

async function getRreoAnexo(req, res) {
  try {
    const { dataI, dataF, orgao, consolidado, type } = req.query;
    const output = [];

    const getCampo = async (campo, dataType) => {
      const res = dataHelper.filterOrg(
        await db(campo).select("*"),
        orgao,
        consolidado
      );
      if (dataType === "y") {
        return res.filter((e) => {
          return (
            e.data >= dataHelper.dataToYear(dataI) &&
            e.data <= dataHelper.dataToYear(dataF)
          );
        });
      } else if (dataType === "m") {
        return res.filter((e) => {
          let returns = true;

          if (dataHelper.dataToYear(dataI) < dataHelper.dataToYear(e.data)) {
            returns = false;
          }

          if (dataHelper.dataToYear(dataI) === dataHelper.dataToYear(e.data)) {
            dataI.substring(0, 2) > e.data.substring(0, 2)
              ? (returns = false)
              : null;
          }

          if (dataHelper.dataToYear(dataF) > dataHelper.dataToYear(e.data)) {
            returns = false;
          }

          if (dataHelper.dataToYear(dataF) === dataHelper.dataToYear(e.data)) {
            dataF.substring(0, 2) < e.data.substring(0, 2)
              ? (returns = false)
              : null;
          }
          returns;
        });
      } else if (dataType === "bi") {
        return res.filter((e) => {
          let newData = "";
          if (dataF.substring(0, 2) === "01") {
            newData =
              "12" +
              String(parseInt(dataF.substring(2, 4)) - 1).padStart(2, "0");
            if (
              parseInt(newData.substring(2, 4)) <
                parseInt(dataI.substring(2, 4)) ||
              (parseInt(newData.substring(2, 4)) ==
                parseInt(dataI.substring(2, 4)) &&
                parseInt(newData.substring(0, 2)) <=
                  parseInt(dataI.substring(0, 2)))
            ) {
              newData = dataI;
            }
          } else {
            newData =
              String(parseInt(dataF.substring(0, 2)) - 1).padStart(2, "0") +
              dataF.substring(2, 4);
            if (
              parseInt(newData.substring(2, 4)) <
                parseInt(dataI.substring(2, 4)) ||
              (parseInt(newData.substring(2, 4)) ==
                parseInt(dataI.substring(2, 4)) &&
                parseInt(newData.substring(0, 2)) <=
                  parseInt(dataI.substring(0, 2)))
            ) {
              newData = dataI;
            }
          }
          return (
            String(e.data).substring(0, 2) >= newData.substring(0, 2) &&
            String(e.data).substring(2, 4) >= newData.substring(2, 4) &&
            String(e.data).substring(0, 2) <= dataF.substring(0, 2) &&
            String(e.data).substring(2, 4) <= dataF.substring(2, 4)
          );
        });
      } else if (dataType === false) {
        return res;
      }
    };

    const org = await getCampo("orgao", false);
    const rsp = await getCampo("rsp", "m");
    const lqd = await getCampo("lqd", "m");
    const ops = await getCampo("ops", "m");
    const anl = await getCampo("anl", "m");
    // const recO = await getCampo("recO", "m");
    const year = dataHelper.dataToYear(dataF);
    const month = dataF.substring(0, 2);
    const months = [
      "janeiro",
      "fevereiro",
      "março",
      "abril",
      "maio",
      "junho",
      "julho",
      "agosto",
      "setembro",
      "outubro",
      "novembro",
      "dezembro",
    ];

    const poder = {
      1: {
        label: ["01", "Poder Executivo"],
        used: false,
        content: [],
      },
      2: {
        label: ["02", "Poder Legislativo"],
        used: false,
        content: [],
      },
      3: {
        label: ["03", "FUNDEF/FUNDEB"],
        used: false,
        content: [],
      },
      4: {
        label: ["04", "Fundo Especial"],
        used: false,
        content: [],
      },
      5: {
        label: ["05", "Autarquia"],
        used: false,
        content: [],
      },
      6: {
        label: ["06", "Fundação"],
        used: false,
        content: [],
      },
      7: {
        label: ["07", "Empresa Pública - Independente"],
        used: false,
        content: [],
      },
      8: {
        label: ["08", "Sociedade de Economia Mista - Independente"],
        used: false,
        content: [],
      },
      9: {
        label: ["09", "RPPS (Regime Próprio de Previdência Social)"],
        used: false,
        content: [],
      },
      10: {
        label: ["10", "FMS - Fundo Municipal de Saúde"],
        used: false,
        content: [],
      },
      11: {
        label: ["11", "FMAS - Fundo Municipal de Assistência Social"],
        used: false,
        content: [],
      },
      12: {
        label: ["12", "FMCA - Fundo Municipal da Criança e Adolescente"],
        used: false,
        content: [],
      },
      13: {
        label: ["13", "FMH - Fundo Municipal de Habitação"],
        used: false,
        content: [],
      },
      14: {
        label: ["14", "FME - Fundo Municipal de Educação"],
        used: false,
        content: [],
      },
      15: {
        label: ["15", "Empresa Pública - Dependente"],
        used: false,
        content: [],
      },
      16: {
        label: ["16", "Sociedade de Economia Mista - Dependente"],
        used: false,
        content: [],
      },
    };

    org.forEach((e) => {
      try {
        const tipoOrgao = parseInt(e.content.tipoOrgao);
        if (tipoOrgao !== 2) {
          const label = `  ${e.content.tipoOrgao.padStart(
            2,
            "0"
          )}${e.content.codOrgao.padStart(2, "0")} ${e.content.descOrgao}`;
          poder[tipoOrgao].used = true;
          poder[tipoOrgao].content.push(label);
        }
      } catch {
        // console.log("ERROR!", e);
      }
    });

    let restosIndex;
    let arrayRestos = [];

    for (const e in poder) {
      if (poder[e].used) {
        const item = poder[e];
        const beforeLength = output.length;
        restosIndex = beforeLength;

        // ----------------------CONTEUDO----------------------------

        item.content.forEach((label) => {
          const sum = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0];
          rsp.forEach((e) => {
            const natureza = e.content.DotOrigP2002.substring(15, 21);
            if (
              perm.includes(natureza) &&
              label.trim().substring(2, 4) === e.content.codOrgao
            ) {
              sum[0] += parseInt(e.content.vlSaldoAnt.replaceAll(",", ""));
              sum[5] += parseInt(e.content.vlSaldoAnt.replaceAll(",", ""));
              sum[1] += parseInt(e.content.vlOriginal.replaceAll(",", ""));
              sum[6] += parseInt(e.content.vlOriginal.replaceAll(",", ""));
              sum[2] += parseInt(e.content.vlBaixaPgto.replaceAll(",", ""));
            }
          });

          lqd.forEach((e) => {
            // 7
            if (
              perm.includes(e.content.elementoDespesa) &&
              label.trim().substring(2, 4) === e.content.codOrgao
            ) {
              sum[7] += parseInt(e.content.vlLiquidado.replaceAll(",", ""));
            }
          });

          ops.forEach((e) => {
            // 8
            if (
              perm.includes(e.content.elementoDespesa) &&
              label.trim().substring(2, 4) === e.content.codOrgao
            ) {
              sum[8] += parseInt(e.content.vlOP?.replaceAll(",", ""));
            }
          });
          anl.forEach((e) => {
            // 9
            if (
              perm.includes(e.content.elementoDespesa) &&
              label.trim().substring(2, 4) === e.content.codOrgao
            ) {
              sum[8] += parseInt(e.content.vlAnulacao?.replaceAll(",", ""));
            }
          });

          sum[4] = sum[0] + sum[1] - sum[2];
          sum[10] = sum[5] + sum[6] - (sum[8] + sum[9]);
          sum[11] = sum[4] + sum[10];

          sum.forEach((e, i) => {
            sum[i] = dataHelper.toRS(String(e / 100));
          });
          output.push([label, ...sum]);
        });

        // ------------------------SOMA------------------------------

        const sumRestos = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0];
        arrayRestos.push(restosIndex);
        for (let i = restosIndex; i < output.length; i++) {
          output[i].forEach((e, i) => {
            sumRestos[i] += parseInt(e.replaceAll(",", "").replaceAll(".", ""));
          });
        }

        sumRestos.splice(0, 1);

        sumRestos.forEach((e, i) => {
          sumRestos[i] = dataHelper.toRS(String(e / 100));
        });

        output.splice(restosIndex, 0, [
          `${poder[e].label[0]} ${poder[e].label[1]}`,
          ...sumRestos,
        ]);

        output[restosIndex].forEach((e, i) => {
          output[restosIndex][i] = {
            content: e,
            styles: {
              fillColor: [220, 220, 220],
            },
          };
        });
      }
    }

    // RESTOS A PAGAR (EXCETO INTRA-ORÇAMENTÁRIOS) (I)
    const restosAPagar = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0];
    arrayRestos.forEach((restos) => {
      output[restos].forEach((e, i) => {
        if (i !== 0)
          restosAPagar[i - 1] += parseInt(
            e.content.replaceAll(",", "").replaceAll(".", "")
          );
      });
    });
    restosAPagar.forEach((e, i) => {
      restosAPagar[i] = dataHelper.toRS(String(e / 100));
    });
    output.splice(0, 0, [
      "RESTOS A PAGAR (EXCETO INTRA-ORÇAMENTÁRIOS) (I)",
      ...restosAPagar,
    ]);
    output[0].forEach((e, i) => {
      output[0][i] = {
        content: e,
        styles: {
          fillColor: [220, 220, 220],
        },
      };
    });

    // RESTOS A PAGAR (INTRA-ORÇAMENTÁRIOS) (II)
    const restosAPagarIntra = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0];
    let restosIndexIntra;
    const arrayRestosIntra = [];

    for (const e in poder) {
      if (poder[e].used) {
        const perm = [
          "319113",
          "319192",
          "339197",
          "339197",
          "319113",
          "319192",
        ];
        const item = poder[e];
        const beforeLength = output.length;
        restosIndexIntra = beforeLength;

        // ----------------------CONTEUDO----------------------------

        item.content.forEach((label) => {
          const sum = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0];
          rsp.forEach((e) => {
            const natureza = e.content.DotOrigP2002.substring(15, 21);
            if (
              perm.includes(natureza) &&
              label.trim().substring(2, 4) === e.content.codOrgao
            ) {
              sum[0] += parseInt(e.content.vlSaldoAnt.replaceAll(",", ""));
              sum[5] += parseInt(e.content.vlSaldoAnt.replaceAll(",", ""));
              sum[1] += parseInt(e.content.vlOriginal.replaceAll(",", ""));
              sum[6] += parseInt(e.content.vlOriginal.replaceAll(",", ""));
              sum[2] += parseInt(e.content.vlBaixaPgto.replaceAll(",", ""));
            }
          });

          lqd.forEach((e) => {
            // 7
            if (
              perm.includes(e.content.elementoDespesa) &&
              label.trim().substring(2, 4) === e.content.codOrgao
            ) {
              sum[7] += parseInt(e.content.vlLiquidado.replaceAll(",", ""));
            }
          });

          ops.forEach((e) => {
            // 8
            if (
              perm.includes(e.content.elementoDespesa) &&
              label.trim().substring(2, 4) === e.content.codOrgao
            ) {
              sum[8] += parseInt(e.content.vlOP?.replaceAll(",", ""));
            }
          });
          anl.forEach((e) => {
            // 9
            if (
              perm.includes(e.content.elementoDespesa) &&
              label.trim().substring(2, 4) === e.content.codOrgao
            ) {
              sum[8] += parseInt(e.content.vlAnulacao?.replaceAll(",", ""));
            }
          });

          sum[4] = sum[0] + sum[1] - sum[2];
          sum[10] = sum[5] + sum[6] - (sum[8] + sum[9]);
          sum[11] = sum[4] + sum[10];

          sum.forEach((e, i) => {
            sum[i] = dataHelper.toRS(String(e / 100));
          });
          output.push([label, ...sum]);
        });

        // ------------------------SOMA------------------------------

        const sumRestos = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0];
        arrayRestosIntra.push(restosIndexIntra);
        for (let i = restosIndexIntra; i < output.length; i++) {
          output[i].forEach((e, i) => {
            sumRestos[i] += parseInt(e.replaceAll(",", "").replaceAll(".", ""));
          });
        }

        sumRestos.splice(0, 1);

        sumRestos.forEach((e, i) => {
          sumRestos[i] = dataHelper.toRS(String(e / 100));
        });

        output.splice(restosIndexIntra, 0, [
          `${poder[e].label[0]} ${poder[e].label[1]}`,
          ...sumRestos,
        ]);

        output[restosIndexIntra].forEach((e, i) => {
          output[restosIndexIntra][i] = {
            content: e,
            styles: {
              fillColor: [220, 220, 220],
            },
          };
        });
      }
    }

    arrayRestosIntra.forEach((e) => {
      output[e].forEach((out, i) => {
        if (i !== 0) {
          restosAPagarIntra[i - 1] += parseInt(
            out.content.replaceAll(",", "").replaceAll(".", "")
          );
        }
      });
    });

    restosAPagarIntra.forEach((e, i) => {
      restosAPagarIntra[i] = dataHelper.toRS(String(e / 100));
    });

    output.splice(arrayRestosIntra[0], 0, [
      "RESTOS A PAGAR (INTRA-ORÇAMENTÁRIOS) (II)",
      ...restosAPagarIntra,
    ]);

    output[arrayRestosIntra[0]].forEach((e, i) => {
      output[arrayRestosIntra[0]][i] = {
        content: e,
        styles: {
          fillColor: [220, 220, 220],
        },
      };
    });

    // TOTAL
    const total = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0];

    [0, arrayRestosIntra[0]].forEach((e) => {
      output[e].forEach((out, i) => {
        if (i !== 0) {
          total[i - 1] += parseInt(
            out.content.replaceAll(",", "").replaceAll(".", "")
          );
        }
      });
    });

    total.forEach((e, i) => {
      total[i] = dataHelper.toRS(String(e / 100));
    });

    output.push([
      "TOTAL (III) = (I + II)",
      ...total,
    ]);

    output[output.length - 1].forEach((e, i) => {
      output[output.length - 1][i] = {
        content: e,
        styles: {
          fillColor: [220, 220, 220],
        },
      };
    });

    return res.status(200).json({ output: output });
  } catch (error) {
    console.error("error at getRreoAnexo from controller.anexo.3", error);
    return res.status(500).json({ message: "Ocorreu um erro interno no servidor." });
  }
}

export default { getRreoAnexo };
