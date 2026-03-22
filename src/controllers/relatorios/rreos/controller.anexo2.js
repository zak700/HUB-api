import { db } from "../../../database/postgres.js";
import dataHelper from "./controller.anexo1.js";

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
      } else {
        return;
      }
    };

    const dspO = await getCampo("dspO", "y");
    const aoc = await getCampo("aoc", "m");
    const emp = await getCampo("emp", "m");
    const empBI = await getCampo("emp", "bi");
    const anl = await getCampo("anl", "m");
    const anlBI = await getCampo("anl", "bi");
    const lqd = await getCampo("lqd", "m");
    const lqdBI = await getCampo("lqd", "bi");
    const alq = await getCampo("alq", "m");
    const alqBI = await getCampo("alq", "bi");
    const rsp = await getCampo("rsp", "m");
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

    const funcoes = {
      1: {
        label: "Legislativa",
        31: { used: false, label: "Ação Legislativa" },
        32: { used: false, label: "Controle Externo" },
      },
      2: {
        label: "Judiciária",
        61: { used: false, label: "Ação Judiciária" },
        62: {
          used: false,
          label: "Defesa do Interesse Público no Processo Judiciário",
        },
      },
      3: {
        label: "Essencial à Justiça",
        91: { used: false, label: "Defesa da Ordem Jurídica" },
        92: { used: false, label: "Representação Judicial e Extrajudicial" },
      },
      4: {
        label: "Administração",
        121: { used: false, label: "Planejamento e Orçamento" },
        122: { used: false, label: "Administração Geral" },
        123: { used: false, label: "Administração Financeira" },
        124: { used: false, label: "Controle Interno" },
        125: { used: false, label: "Normatização e Fiscalização" },
        126: { used: false, label: "Tecnologia da Informação" },
        127: { used: false, label: "Ordenamento Territorial" },
        128: { used: false, label: "Formação de Recursos Humanos" },
        129: { used: false, label: "Administração de Receitas" },
        130: { used: false, label: "Administração de Concessões" },
        131: { used: false, label: "Comunicação Social" },
      },
      5: {
        label: "Defesa Nacional",
        151: { used: false, label: "Defesa Aérea" },
        152: { used: false, label: "Defesa Naval" },
        153: { used: false, label: "Defesa Terrestre" },
      },
      6: {
        label: "Segurança Pública",
        181: { used: false, label: "Policiamento" },
        182: { used: false, label: "Defesa Civil" },
        183: { used: false, label: "Informação e Inteligência" },
      },
      7: {
        label: "Relações Exteriores",
        211: { used: false, label: "Relações Diplomáticas" },
        212: { used: false, label: "Cooperação Internacional" },
      },
      8: {
        label: "Assistência Social",
        241: { used: false, label: "Assistência ao Idoso" },
        242: { used: false, label: "Assistência ao Portador de Deficiência" },
        243: { used: false, label: "Assistência à Criança e ao Adolescente" },
        244: { used: false, label: "Assistência Comunitária" },
      },
      9: {
        label: "Previdência Social",
        271: { used: false, label: "Previdência Básica" },
        272: { used: false, label: "Previdência do Regime Estatutário" },
        273: { used: false, label: "Previdência Complementar" },
        274: { used: false, label: "Previdência Especial" },
      },
      10: {
        label: "Saúde",
        301: { used: false, label: "Atenção Básica" },
        302: { used: false, label: "Assistência Hospitalar e Ambulatorial" },
        303: { used: false, label: "Suporte Profilático e Terapêutico" },
        304: { used: false, label: "Vigilância Sanitária" },
        305: { used: false, label: "Vigilância Epidemiológica" },
        306: { used: false, label: "Alimentação e Nutrição" },
      },
      11: {
        label: "Trabalho",
        331: { used: false, label: "Proteção e Benefícios ao Trabalhador" },
        332: { used: false, label: "Relações de Trabalho" },
        333: { used: false, label: "Empregabilidade" },
        334: { used: false, label: "Fomento ao Trabalho" },
      },
      12: {
        label: "Educação",
        361: { used: false, label: "Ensino Fundamental" },
        362: { used: false, label: "Ensino Médio" },
        363: { used: false, label: "Ensino Profissional" },
        364: { used: false, label: "Ensino Superior" },
        365: { used: false, label: "Educação Infantil" },
        366: { used: false, label: "Educação de Jovens e Adultos" },
        367: { used: false, label: "Educação Especial" },
        368: { used: false, label: "Educação Básica (4)" },
      },
      13: {
        label: "Cultura",
        391: {
          used: false,
          label: "Patrimônio Histórico, Artístico e Arqueológico",
        },
        392: { used: false, label: "Difusão Cultural" },
      },
      14: {
        label: "Direitos da Cidadania",
        421: { used: false, label: "Custódia e Reintegração Social" },
        422: {
          used: false,
          label: "Direitos Individuais, Coletivos e Difusos",
        },
        423: { used: false, label: "Assistência aos Povos Indígenas" },
      },
      15: {
        label: "Urbanismo",
        451: { used: false, label: "Infra-Estrutura Urbana" },
        452: { used: false, label: "Serviços Urbanos" },
        453: { used: false, label: "Transportes Coletivos Urbanos" },
      },
      16: {
        label: "Habitação",
        481: { used: false, label: "Habitação Rural" },
        482: { used: false, label: "Habitação Urbana" },
      },
      17: {
        label: "Saneamento",
        511: { used: false, label: "Saneamento Básico Rural" },
        512: { used: false, label: "Saneamento Básico Urbano" },
      },
      18: {
        label: "Gestão Ambiental",
        541: { used: false, label: "Preservação e Conservação Ambiental" },
        542: { used: false, label: "Controle Ambiental" },
        543: { used: false, label: "Recuperação de Áreas Degradadas" },
        544: { used: false, label: "Recursos Hídricos" },
        545: { used: false, label: "Meteorologia" },
      },
      19: {
        label: "Ciência e Tecnologia",
        571: { used: false, label: "Desenvolvimento Científico" },
        572: { used: false, label: "Desenvolvimento Tecnológico e Engenharia" },
        573: {
          used: false,
          label: "Difusão do Conhecimento Científico e Tecnológico",
        },
      },
      20: {
        label: "Agricultura",
        601: { used: false, label: "Promoção da Produção Vegetal" },
        602: { used: false, label: "Promoção da Produção Animal" },
        603: { used: false, label: "Defesa Sanitária Vegetal" },
        604: { used: false, label: "Defesa Sanitária Animal" },
        605: { used: false, label: "Abastecimento" },
        606: { used: false, label: "Extensão Rural" },
        607: { used: false, label: "Irrigação" },
      },
      21: {
        label: "Organização Agrária",
        631: { used: false, label: "Reforma Agrária" },
        632: { used: false, label: "Colonização" },
      },
      22: {
        label: "Indústria",
        661: { used: false, label: "Promoção Industrial" },
        662: { used: false, label: "Produção Industrial" },
        663: { used: false, label: "Mineração" },
        664: { used: false, label: "Propriedade Industrial" },
        665: { used: false, label: "Normalização e Qualidade" },
      },
      23: {
        label: "Comércio e Serviços",
        691: { used: false, label: "Promoção Comercial" },
        692: { used: false, label: "Comercialização" },
        693: { used: false, label: "Comércio Exterior" },
        694: { used: false, label: "Serviços Financeiros" },
        695: { used: false, label: "Turismo" },
      },
      24: {
        label: "Comunicações",
        721: { used: false, label: "Comunicações Postais" },
        722: { used: false, label: "Telecomunicações" },
      },
      25: {
        label: "Energia",
        751: { used: false, label: "Conservação de Energia" },
        752: { used: false, label: "Energia Elétrica" },
        753: { used: false, label: "Combustíveis Minerais (3)" },
        754: { used: false, label: "Biocombustíveis (3)" },
      },
      26: {
        label: "Transporte",
        781: { used: false, label: "Transporte Aéreo" },
        782: { used: false, label: "Transporte Rodoviário" },
        783: { used: false, label: "Transporte Ferroviário" },
        784: { used: false, label: "Transporte Hidroviário" },
        785: { used: false, label: "Transportes Especiais" },
      },
      27: {
        label: "Desporto e Lazer",
        811: { used: false, label: "Desporto de Rendimento" },
        812: { used: false, label: "Desporto Comunitário" },
        813: { used: false, label: "Lazer" },
      },
      28: {
        label: "Encargos Especiais",
        841: { used: false, label: "Refinanciamento da Dívida Interna" },
        842: { used: false, label: "Refinanciamento da Dívida Externa" },
        843: { used: false, label: "Serviço da Dívida Interna" },
        844: { used: false, label: "Serviço da Dívida Externa" },
        845: { used: false, label: "Outras Transferências (1)" },
        846: { used: false, label: "Outros Encargos Especiais" },
        847: {
          used: false,
          label: "Transferências para a Educação Básica (2)",
        },
      },
    };

    emp.forEach((emp) => {
      try {
        funcoes[parseInt(emp.content.codFuncao)][
          parseInt(emp.content.codSubFuncao)
        ].used = true;
      } catch {}
    });

    for (const codFuncao in funcoes) {
      let made = false;
      for (const codSubFuncao in funcoes[codFuncao]) {
        if (funcoes[codFuncao][codSubFuncao].used === true) {
          if (made === false) {
            made = true;
            output.push([funcoes[codFuncao].label]);
          }

          const sum = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0];

          dspO.forEach((e) => {
            if (
              parseInt(e.content.codFuncao) === parseInt(codFuncao) &&
              parseInt(e.content.codSubFuncao) === parseInt(codSubFuncao)
            ) {
              sum[0] += parseInt(e.content.recurso.replace(",", ""));
            }
          });

          sum[1] = sum[0];

          aoc.forEach((e) => {
            if (
              parseInt(e.content.codFuncao) === parseInt(codFuncao) &&
              parseInt(e.content.codSubFuncao) === parseInt(codSubFuncao)
            ) {
              e.content.content.forEach((e) => {
                if (e.tipoRegistro == "11") {
                  if (e.codNaturezaDaDespesa !== "999999") {
                    parseInt(e.vlSaldoAntDotacao.replace(",", "")) >
                    parseInt(e.vlSaldoAtual.replace(",", ""))
                      ? (sum[1] -= parseInt(e.vlAlteracao.replace(",", "")))
                      : (sum[1] += parseInt(e.vlAlteracao.replace(",", "")));
                  } else {
                    sum[1] -= parseInt(e.vlAlteracao.replace(",", ""));
                  }
                }
              });
            }
          });

          empBI.forEach((e) => {
            if (
              parseInt(e.content.codFuncao) === parseInt(codFuncao) &&
              parseInt(e.content.codSubFuncao) === parseInt(codSubFuncao)
            ) {
              sum[2] += parseInt(e.content.vlBruto.replace(",", ""));
            }
          });

          anlBI.forEach((e) => {
            if (
              parseInt(e.content.codFuncao) === parseInt(codFuncao) &&
              parseInt(e.content.codSubFuncao) === parseInt(codSubFuncao)
            ) {
              sum[2] -= parseInt(e.content.vlAnulacao.replace(",", ""));
            }
          });

          emp.forEach((e) => {
            if (
              parseInt(e.content.codFuncao) === parseInt(codFuncao) &&
              parseInt(e.content.codSubFuncao) === parseInt(codSubFuncao)
            ) {
              sum[3] += parseInt(e.content.vlBruto.replace(",", ""));
            }
          });

          anl.forEach((e) => {
            if (
              parseInt(e.content.codFuncao) === parseInt(codFuncao) &&
              parseInt(e.content.codSubFuncao) === parseInt(codSubFuncao)
            ) {
              sum[3] -= parseInt(e.content.vlAnulacao.replace(",", ""));
            }
          });

          lqdBI.forEach((e) => {
            if (
              parseInt(e.content.codFuncao) === parseInt(codFuncao) &&
              parseInt(e.content.codSubFuncao) === parseInt(codSubFuncao)
            ) {
              sum[6] += parseInt(e.content.vlLiquidado.replace(",", ""));
            }
          });

          alqBI.forEach((e) => {
            if (
              parseInt(e.content.codFuncao) === parseInt(codFuncao) &&
              parseInt(e.content.codSubFuncao) === parseInt(codSubFuncao)
            ) {
              sum[6] -= parseInt(e.content.vlAnulado.replace(",", ""));
            }
          });

          lqd.forEach((e) => {
            if (
              parseInt(e.content.codFuncao) === parseInt(codFuncao) &&
              parseInt(e.content.codSubFuncao) === parseInt(codSubFuncao)
            ) {
              sum[7] += parseInt(e.content.vlLiquidado.replace(",", ""));
            }
          });

          alq.forEach((e) => {
            if (
              parseInt(e.content.codFuncao) === parseInt(codFuncao) &&
              parseInt(e.content.codSubFuncao) === parseInt(codSubFuncao)
            ) {
              sum[7] -= parseInt(e.content.vlAnulado.replace(",", ""));
            }
          });

          sum[5] = sum[1] - sum[3];
          sum[9] = sum[1] - sum[7];

          rsp.forEach((e) => {
            if (
              parseInt(e.content.DotOrigP2002.substring(6, 8)) ===
                parseInt(codFuncao) &&
              parseInt(e.content.DotOrigP2002.substring(8, 11)) ===
                parseInt(codSubFuncao)
            ) {
              sum[10] += parseInt(e.content.vlBaixaPgto.replace(",", ""));
            }
          });

          sum.forEach((e, i) => {
            sum[i] = dataHelper.toRS(String(e / 100));
          });

          output.push([funcoes[codFuncao][codSubFuncao].label, ...sum]);
        }
      }
    }

    const summed = [];

    output.forEach((e, i) => {
      if (e.length === 1) {
        summed.push(i);
        let helper = { isTrue: true, index: i };
        const sum = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0];
        while (helper.isTrue) {
          helper.index++;
          if (helper.index >= output.length) {
            helper.isTrue = false;
            break;
          }
          if (output[parseInt(helper.index)].length != 1) {
            output[parseInt(helper.index)].forEach((e, i) => {
              if (i !== 0) {
                sum[i - 1] += parseInt(
                  e.replaceAll(",", "").replaceAll(".", "")
                );
              }
            });
          } else {
            helper.isTrue = false;
          }
        }

        sum.forEach((sum) => {
          output[i].push(dataHelper.toRS(String(sum / 100)));
        });

        output[i].forEach((e, index) => {
          output[i][index] = {
            content: e,
            styles: {
              fillColor: [220, 220, 220],
            },
          };
        });
      }
    });

    let helper = 0;
    output.forEach((e, i) => {
      if (i !== 0) {
        if (!summed.includes(i)) {
          const sum = dataHelper.toRS(
            String(
              (
                (parseInt(e[4].replaceAll(",", "").replaceAll(".", "")) /
                  parseInt(
                    output[summed[helper]][4].content
                      .replaceAll(",", "")
                      .replaceAll(".", "")
                  )) *
                100
              ).toFixed(2)
            )
          );
          const sum2 = dataHelper.toRS(
            String(
              (
                (parseInt(e[8].replaceAll(",", "").replaceAll(".", "")) /
                  parseInt(
                    output[summed[helper]][8].content
                      .replaceAll(",", "")
                      .replaceAll(".", "")
                  )) *
                100
              ).toFixed(2)
            )
          );
          output[i][5] = sum;
          output[i][9] = sum2;
          output[summed[helper]][5].content = dataHelper.sumValues(
            output[summed[helper]][5].content,
            sum,
            true
          );
          output[summed[helper]][9].content = dataHelper.sumValues(
            output[summed[helper]][9].content,
            sum2,
            true
          );
        } else {
          helper++;
        }
      }
    });

    return res.status(200).json({ output: output });
  } catch (error) {
    console.error("error at getRreoAnexo from controller.anexo.3", error);
    return res.status(500).json({ message: "Ocorreu um erro interno no servidor." });
  }
}

export default { getRreoAnexo };
