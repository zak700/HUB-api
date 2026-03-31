import { db } from "../../../database/postgres.js";
import natureza from "../../../helpers/natureza.js";

async function getSlide2(req, res) {
  try {
    const { dataF, consolidado } = req.query;
    const lastDataI = req.query.dataI;
    const dataI = lastDataI || "01" + dataF.substring(2, 4);
    const orgao = req.query["orgao[codOrgao]"].padStart(2, "0");
    const orgaoType = req.query["orgao[type]"];
    const uoc = req.query["uoc[codUnidade]"];

    const output = {};

    const meses = [
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

    output.dateOptions = {
      ano: new Date().getFullYear(),
      dia: new Date().getDate(),
      mes: meses[new Date().getMonth()],
      mesNumero: String(new Date().getMonth() + 1).padStart(2, "0"),
      dataF: dataF.substring(0, 2),
      dataFMes: meses[parseInt(dataF.substring(0, 2)) - 1],
      dataFAno: natureza.dataToYear(dataF),
      quadrimestre: Math.ceil(parseInt(dataF.substring(0, 2)) / 4),
    };

    const rub_anexo1 = (await db("rubricas").select("*").first()).anexo1;

    const findDiv = (arr) => {
      let div = String(
        ((natureza.toInt(arr[1]) / natureza.toInt(arr[0])) * 100).toFixed(2),
      ).replace(".", ",");

      if (div === "Infinity" || div === "NaN") div = "0,00";

      return [...arr, div + "%"];
    };

    const leftAlign = (string) => {
      return { text: string, options: { align: "left" } };
    };

    //-- RECEITAS ORÇAMENTÁRIAS ------------------//

    const recO = await natureza.getCampo(
      "recO",
      "y",
      orgao,
      consolidado,
      dataI,
      dataF,
    );
    const rec = await natureza.getCampo(
      "rec",
      "m",
      orgao,
      consolidado,
      dataI,
      dataF,
    );
    console.log("rec.length", rec.length, orgao, consolidado, dataI, dataF);
    const are = await natureza.getCampo(
      "are",
      "m",
      orgao,
      consolidado,
      dataI,
      dataF,
    );

    const balanco = (rubrica) => {
      const filteredRecO = natureza.filtrarPerm(
        recO,
        "rubrica",
        rub_anexo1[rubrica],
      );
      const filteredRec = natureza.filtrarPerm(
        rec,
        "rubrica",
        rub_anexo1[rubrica],
      );
      const filteredAre = natureza.filtrarPerm(
        are,
        "rubrica",
        rub_anexo1[rubrica],
      );

      const subRecO = natureza.sum([
        {
          campo: filteredRecO,
          toSum: "vlPrevisto",
        },
      ]);

      const subRec = natureza.sub([
        {
          campo: filteredRec,
          toSub: "vlArrecadado",
        },
        {
          campo: filteredAre,
          toSub: "vlAnulacao",
        },
      ]);

      return [subRecO, subRec, natureza.subRS([subRecO, subRec])[0]].map((e) =>
        e.replaceAll("-", ""),
      );
    };

    output.receitas = [
      {
        onGraf: false,
        styled: true,
        name: "RECEITAS CORRENTES",
        values: findDiv(
          natureza.sumRS([
            balanco("contribuicaoSocial"),
            balanco("remuneracaoBancaria"),
            balanco("outrosRessarcimentos"),
          ]),
        ),
      },
      {
        onGraf: true,
        name: leftAlign("  Contribuições Social"),
        values: findDiv(natureza.sumRS([balanco("contribuicaoSocial")])),
      },
      {
        onGraf: true,
        name: leftAlign("  Patrimonial"),
        values: findDiv(natureza.sumRS([balanco("remuneracaoBancaria")])),
      },
      {
        onGraf: true,
        name: leftAlign("  Outros Ressarcimentos"),
        values: findDiv(natureza.sumRS([balanco("outrosRessarcimentos")])),
      },
    ];
    /*    
    output.receitas_grafico = output.receitas
    .filter((e) => e.onGraf)
    .map((e) => {
      return {
        name: e.name.text || e.name,
        value: natureza.toInt(e.values[1]),
        };
        });
        

    //-- DESPESAS - EMPENHOS / LIQUIDAÇÃO / PAGAS-------------------------//

    const dspO = await natureza.getCampo(
      "dspO",
      "y",
      orgao,
      consolidado,
      dataI,
      dataF
    );
    const aoc = await natureza.getCampo(
      "aoc",
      "m",
      orgao,
      consolidado,
      dataI,
      dataF
    );

    const aocSum = await natureza.filtrarSubPerm(
      aoc,
      "11",
      "tipoAlteracao",
      natureza.aocSumValues
    );

    const aocSub = await natureza.filtrarSubPerm(
      aoc,
      "11",
      "tipoAlteracao",
      natureza.aocSubValues
    );

    const emp = await natureza.getCampo(
      "emp",
      "m",
      orgao,
      consolidado,
      dataI,
      dataF
    );
    const anl = await natureza.getCampo(
      "anl",
      "m",
      orgao,
      consolidado,
      dataI,
      dataF
    );
    const lqd = await natureza.getCampo(
      "lqd",
      "m",
      orgao,
      consolidado,
      dataI,
      dataF
    );
    const alq = await natureza.getCampo(
      "alq",
      "m",
      orgao,
      consolidado,
      dataI,
      dataF
    );
    const ops = await natureza.getCampo(
      "ops",
      "m",
      orgao,
      consolidado,
      dataI,
      dataF
    );
    const aop = await natureza.getCampo(
      "aop",
      "m",
      orgao,
      consolidado,
      dataI,
      dataF
    );

    const balancoDsp = (despesa) => {
      const filteredDspO = natureza.filtrarPerm(
        dspO,
        "elementoDespesa",
        rub_anexo1[despesa]
      );

      const filteredAocSum = natureza.filtrarPerm(
        aocSum,
        "codNaturezaDaDespesa",
        rub_anexo1[despesa]
      );

      const filteredAocSub = natureza.filtrarPerm(
        aocSub,
        "codNaturezaDaDespesa",
        rub_anexo1[despesa]
      );

      const filteredEmp = natureza.filtrarPerm(
        emp,
        "elementoDespesa",
        rub_anexo1[despesa]
      );
      const filteredAnl = natureza.filtrarPerm(
        anl,
        "elementoDespesa",
        rub_anexo1[despesa]
      );
      const filteredLqd = natureza.filtrarPerm(
        lqd,
        "elementoDespesa",
        rub_anexo1[despesa]
      );
      const filteredAlq = natureza.filtrarPerm(
        alq,
        "elementoDespesa",
        rub_anexo1[despesa]
      );
      const filteredOps = natureza.filtrarPerm(
        natureza.filtrarPerm(ops, "elementoDespesa", rub_anexo1[despesa]),
        "tipoOP",
        ["2"]
      );
      const filteredAop = natureza.filtrarPerm(
        aop,
        "elementoDespesa",
        rub_anexo1[despesa]
      );
      const subDspO = natureza.subRS([
        natureza.sum([
          {
            campo: filteredDspO,
            toSum: "recurso",
          },
          {
            campo: filteredAocSum,
            toSum: "vlAlteracao",
          },
        ]),
        natureza.sum([
          {
            campo: filteredAocSub,
            toSum: "vlAlteracao",
          },
        ]),
      ])[0];

      const subEmp = natureza.sub([
        {
          campo: filteredEmp,
          toSub: "vlBruto",
        },
        {
          campo: filteredAnl,
          toSub: "vlAnulacao",
        },
      ]);
      const subLqd = natureza.sub([
        {
          campo: filteredLqd,
          toSub: "vlLiquidado",
        },
        {
          campo: filteredAlq,
          toSub: "vlAnulado",
        },
      ]);
      const subOps = natureza.sub([
        {
          campo: filteredOps,
          toSub: "vlOP",
        },
        {
          campo: filteredAop,
          toSub: "vlAnuladoOP",
        },
      ]);
      return [subDspO, subEmp, subLqd, subOps];
    };

    //-- Detalhamento no Console Empenho--------------//
    const checkEmp = (string) => {
      const filteredEmp = natureza.filtrarPerm(
        emp,
        "elementoDespesa",
        rub_anexo1[string]
      );

      return {
        name: string,
        somaVlBruto: natureza.sum([
          {
            campo: filteredEmp,
            toSum: "vlBruto",
          },
        ]),
        empFiltered: filteredEmp.map((e) => {
          return {
            vlBruto: e.content.vlBruto,
            elementoDespesa: e.content.elementoDespesa,
            nroEmpenho: e.content.nroEmpenho,
            data: e.data,
          };
        }),
      };
    };

    //-- Detalhamento no Console Anulação do Empenho--------------//
    const checkAnl = (string) => {
      const filteredAnl = natureza.filtrarPerm(
        anl,
        "elementoDespesa",
        rub_anexo1[string]
      );

      return {
        name: string,
        somavlAnulacao: natureza.sum([
          {
            campo: filteredAnl,
            toSum: "vlAnulacao",
          },
        ]),
        anlFiltered: filteredAnl.map((e) => {
          return {
            vlAnulacao: e.content.vlAnulacao,
            elementoDespesa: e.content.elementoDespesa,
            nroEmpenho: e.content.nroEmpenho,
            dtAnulacao: e.content.dtAnulacao,
          };
        }),
      };
    };

    //-- Detalhamento no Console Liquidação----------//
    const checkLqd = (string) => {
      const filteredLqd = natureza.filtrarPerm(
        lqd,
        "elementoDespesa",
        rub_anexo1[string]
      );

      return {
        name: string,
        somaVlLiquidado: natureza.sum([
          {
            campo: filteredLqd,
            toSum: "vlLiquidado",
          },
        ]),
        lqdFiltered: filteredLqd.map((e) => {
          return {
            vlLiquidado: e.content.vlLiquidado,
            elementoDespesa: e.content.elementoDespesa,
            nroEmpenho: e.content.nroEmpenho,
            nrLiquidacao: e.content.nrLiquidacao,
            data: e.data,
          };
        }),
      };
    };

    //-- Detalhamento no Console Anulação da Liquidação----------//
    const checkAlq = (string) => {
      const filteredAlq = natureza.filtrarPerm(
        alq,
        "elementoDespesa",
        rub_anexo1[string]
      );

      return {
        name: string,
        somaVlAnulado: natureza.sum([
          {
            campo: filteredAlq,
            toSum: "vlAnulado",
          },
        ]),
        alqFiltered: filteredAlq.map((e) => {
          return {
            vlAnulado: e.content.vlAnulado,
            elementoDespesa: e.content.elementoDespesa,
            nrLiquidacao: e.content.nrLiquidacao,
            nrLiquidacaoANL: e.content.nrLiquidacaoANL,
            dtAnulacaoLiq: e.content.dtAnulacaoLiq,
          };
        }),
      };
    };

    output.despesas = [
      {
        onGraf: false,
        name: leftAlign("DESPESAS CORRENTES"),
        values: findDiv(
          natureza.sumRS([
            balancoDsp("pessoalEncargos"),
            balancoDsp("jurosEncargos"),
            balancoDsp("outrasDespesas"),
          ])
        ),
      },
      {
        onGraf: true,
        name: leftAlign("  Pessoal e Encargos Sociais"),
        values: findDiv(balancoDsp("pessoalEncargos")),
      },
      {
        onGraf: true,
        name: leftAlign("  Juros e Encargos da Dívida"),
        values: findDiv(balancoDsp("jurosEncargos")),
      },
      {
        onGraf: true,
        name: leftAlign("  Outras Despesas Correntes"),
        values: findDiv(balancoDsp("outrasDespesas")),
      },
      {
        onGraf: false,
        name: leftAlign("DESPESAS DE CAPITAL"),
        values: findDiv(
          natureza.sumRS([
            balancoDsp("investimento"),
            balancoDsp("inversoesFinanceira"),
            balancoDsp("amortizacao"),
          ])
        ),
      },
      {
        onGraf: true,
        name: leftAlign("  investimentos"),
        values: findDiv(balancoDsp("investimento")),
      },
      {
        onGraf: true,
        name: leftAlign("  Inversões Financeiras"),
        values: findDiv(balancoDsp("inversoesFinanceira")),
      },
      {
        onGraf: true,
        name: leftAlign("  Amortizações da Dívida"),
        values: findDiv(balancoDsp("amortizacao")),
      },
      {
        onGraf: true,
        name: leftAlign("RESERVA DE CONTIGENCIA"),
        values: findDiv(balancoDsp("reservaContigencia")),
      },
      {
        onGraf: false,
        name: leftAlign("TOTAL DAS DESPESAS"),
        values: findDiv(
          natureza.sumRS([
            natureza.sumRS([
              balancoDsp("pessoalEncargos"),
              balancoDsp("jurosEncargos"),
              balancoDsp("outrasDespesas"),
            ]),
            natureza.sumRS([
              balancoDsp("investimento"),
              balancoDsp("inversoesFinanceira"),
              balancoDsp("amortizacao"),
            ]),
          ])
        ),
      },
      {
        onGraf: true,
        name: leftAlign("DESPESA INTRA-ORÇAMENTÁRIA"),
        values: findDiv(balancoDsp("intraOrcamentaria")),
      },
    ];

    output.despesas_grafico = output.despesas
      .filter((e) => e.onGraf)
      .map((e) => {
        return {
          name: e.name.text || e.name,
          value: natureza.toInt(e.values[1]),
        };
      });

    output.comparativo_grafico = [
      {
        name: "RECEITAS CORRENTES",
        value: natureza.toInt(
          output.receitas[output.receitas.length - 1].values[1]
        ),
      },
      {
        name: "DESPESAS CORRENTES",
        value: natureza.toInt(
          output.despesas[output.despesas.length - 1].values[1]
        ),
      },
    ];

//Comenta aqui
    output.checkEmp = [checkEmp("pessoalEncargos")];

    output.checkAnl = [checkAnl("pessoalEncargos")];

    output.checkLqd = [checkLqd("pessoalEncargos")];

    output.checkAlq = [checkAlq("pessoalEncargos")];

//Tira o comentario

    //-- < 12 > Slide por FUNÇÃO - ANEXO 2 --------------------//

    const rub_anexo2 = (await db("rubricas").select("*"))[0].anexo2;

    const balancoFuncao = (despesa) => {
      const codFuncao = rub_anexo2[despesa].map((e) => e.codFuncao || "");
      const codSubFuncao = rub_anexo2[despesa].map((e) => e.codSubFuncao || "");

      const filteredFuncaoDspO = natureza.filtrarPerm(
        dspO,
        ["codFuncao", "codSubFuncao"],
        [codFuncao, codSubFuncao]
      );

      const filteredFuncaoAocSum = natureza.filtrarPerm(
        aocSum,
        ["codFuncao", "codSubFuncao"],
        [codFuncao, codSubFuncao]
      );

      const filteredFuncaoAocSub = natureza.filtrarPerm(
        aocSub,
        ["codFuncao", "codSubFuncao"],
        [codFuncao, codSubFuncao]
      );

      const filteredFuncaoEmp = natureza.filtrarPerm(
        emp,
        ["codFuncao", "codSubFuncao"],
        [codFuncao, codSubFuncao]
      );
      const filteredFuncaoAnl = natureza.filtrarPerm(
        anl,
        ["codFuncao", "codSubFuncao"],
        [codFuncao, codSubFuncao]
      );
      const filteredFuncaoLqd = natureza.filtrarPerm(
        lqd,
        ["codFuncao", "codSubFuncao"],
        [codFuncao, codSubFuncao]
      );
      const filteredFuncaoAlq = natureza.filtrarPerm(
        alq,
        ["codFuncao", "codSubFuncao"],
        [codFuncao, codSubFuncao]
      );
      const filteredFuncaoOps = natureza.filtrarPerm(
        ops,
        ["tipoOP", "codFuncao", "codSubFuncao"],
        [["2"], codFuncao, codSubFuncao]
      );
      const filteredFuncaoAop = natureza.filtrarPerm(
        aop,
        ["codFuncao", "codSubFuncao"],
        [codFuncao, codSubFuncao]
      );

      const sumFuncaoDspO = natureza.sum([
        {
          campo: filteredFuncaoDspO,
          toSum: "recurso",
        },
      ]);

      // Comenta aqui

      const subFuncaoDspO = natureza.subRS([
        natureza.sum([
          {
            campo: filteredFuncaoDspO,
            toSum: "recurso",
          },
          {
            campo: filteredFuncaoAocSum,
            toSum: "vlAlteracao",
          },
        ]),
        natureza.sum([
          {
            campo: filteredFuncaoAocSub,
            toSum: "vlAlteracao",
          },
         ]), 
        ])[0];

// Tira o Comentário aqui

      const subFuncaoEmp = natureza.sub([
        {
          campo: filteredFuncaoEmp,
          toSub: "vlBruto",
        },
        {
          campo: filteredFuncaoAnl,
          toSub: "vlAnulacao",
        },
      ]);
      const subFuncaoLqd = natureza.sub([
        {
          campo: filteredFuncaoLqd,
          toSub: "vlLiquidado",
        },
        {
          campo: filteredFuncaoAlq,
          toSub: "vlAnulado",
        },
      ]);
      const subFuncaoOps = natureza.sub([
        {
          campo: filteredFuncaoOps,
          toSub: "vlOP",
        },
        {
          campo: filteredFuncaoAop,
          toSub: "vlAnuladoOP",
        },
      ]);
      return [sumFuncaoDspO, subFuncaoEmp, subFuncaoLqd, subFuncaoOps];
    };

    output.funcao = [
      {
        onGraf: true,
        name: leftAlign("Legislativa"),
        values: findDiv(balancoFuncao("legislativa")),
      },
      {
        onGraf: true,
        name: leftAlign("Judiciária"),
        values: findDiv(balancoFuncao("judiciaria")),
      },
      {
        onGraf: true,
        name: leftAlign("Essencial a Justiça"),
        values: findDiv(balancoFuncao("essencialAJustica")),
      },
      {
        onGraf: true,
        name: leftAlign("Administração - Planejamento e Orçamento"),
        values: findDiv(balancoFuncao("administracao121")),
      },
      {
        onGraf: true,
        name: leftAlign("Administração - Administração Geral"),
        values: findDiv(balancoFuncao("administracao122")),
      },
      {
        onGraf: true,
        name: leftAlign("Administração - Administraçao Financeira"),
        values: findDiv(balancoFuncao("administracao123")),
      },
      {
        onGraf: true,
        name: leftAlign("Administração - Controle Interno"),
        values: findDiv(balancoFuncao("administracao124")),
      },
      {
        onGraf: true,
        name: leftAlign("Administração - Normatização e Fiscalização"),
        values: findDiv(balancoFuncao("administracao125")),
      },
      {
        onGraf: true,
        name: leftAlign("Administração - Tecnologia da Informação"),
        values: findDiv(balancoFuncao("administracao126")),
      },
      {
        onGraf: true,
        name: leftAlign("Administração - Ordenamento Terrritorial"),
        values: findDiv(balancoFuncao("administracao127")),
      },
      {
        onGraf: true,
        name: leftAlign("Administração - Formação de Recursos Humanos"),
        values: findDiv(balancoFuncao("administracao128")),
      },
      {
        onGraf: true,
        name: leftAlign("Administração - Administração de Receitas"),
        values: findDiv(balancoFuncao("administracao129")),
      },
      {
        onGraf: true,
        name: leftAlign("Administração - Administração de Concessões"),
        values: findDiv(balancoFuncao("administracao130")),
      },
      {
        onGraf: true,
        name: leftAlign("Administração - Comunicação Social"),
        values: findDiv(balancoFuncao("administracao131")),
      },
      {
        onGraf: true,
        name: leftAlign("Defesa Nacional"),
        values: findDiv(balancoFuncao("defesaNacional")),
      },
      {
        onGraf: true,
        name: leftAlign("Segurança Pública"),
        values: findDiv(balancoFuncao("segurancaPublica")),
      },
      {
        onGraf: true,
        name: leftAlign("Relações Exteriores"),
        values: findDiv(balancoFuncao("relacoesExteriores")),
      },
      {
        onGraf: true,
        name: leftAlign("Previdência Social"),
        values: findDiv(balancoFuncao("previdenciaSocial")),
      },
      {
        onGraf: true,
        name: leftAlign("Saúde"),
        values: findDiv(balancoFuncao("saude")),
      },
      {
        onGraf: true,
        name: leftAlign("Trabalho"),
        values: findDiv(balancoFuncao("trabalho")),
      },
      {
        onGraf: true,
        name: leftAlign("Educação"),
        values: findDiv(balancoFuncao("educacao")),
      },
      {
        onGraf: true,
        name: leftAlign("Cultura"),
        values: findDiv(balancoFuncao("cultura")),
      },
      {
        onGraf: true,
        name: leftAlign("Direitos da Cidadania"),
        values: findDiv(balancoFuncao("direitosDaCidadania")),
      },
      {
        onGraf: true,
        name: leftAlign("Urbanismo"),
        values: findDiv(balancoFuncao("urbanismo")),
      },
      {
        onGraf: true,
        name: leftAlign("Habitação"),
        values: findDiv(balancoFuncao("habitacao")),
      },
      {
        onGraf: true,
        name: leftAlign("Saneamento"),
        values: findDiv(balancoFuncao("saneamento")),
      },
      {
        onGraf: true,
        name: leftAlign("Gestão Ambiental"),
        values: findDiv(balancoFuncao("gestaoAmbiental")),
      },
      {
        onGraf: true,
        name: leftAlign("Ciência e Tecnologia"),
        values: findDiv(balancoFuncao("cienciaETecnologia")),
      },
      {
        onGraf: true,
        name: leftAlign("Agricultura"),
        values: findDiv(balancoFuncao("agricultura")),
      },
      {
        onGraf: true,
        name: leftAlign("Organização Agrária"),
        values: findDiv(balancoFuncao("organizacaoAgraria")),
      },
      {
        onGraf: true,
        name: leftAlign("Industria"),
        values: findDiv(balancoFuncao("industria")),
      },
      {
        onGraf: true,
        name: leftAlign("Comércio e Serviço"),
        values: findDiv(balancoFuncao("comercioEServico")),
      },
      {
        onGraf: true,
        name: leftAlign("Comunicações"),
        values: findDiv(balancoFuncao("comunicacoes")),
      },
      {
        onGraf: true,
        name: leftAlign("Energia"),
        values: findDiv(balancoFuncao("energia")),
      },
      {
        onGraf: true,
        name: leftAlign("Transporte"),
        values: findDiv(balancoFuncao("transporte")),
      },
      {
        onGraf: true,
        name: leftAlign("Desporto e Lazer"),
        values: findDiv(balancoFuncao("desportoELazer")),
      },
      {
        onGraf: true,
        name: leftAlign("Encargos Especiais"),
        values: findDiv(balancoFuncao("encargosEspeciais")),
      },
      {
        onGraf: false,
        name: leftAlign("TOTAL POR FUNÇÃO"),
        values: findDiv(
          natureza.sumRS([
            balancoFuncao("legislativa"),
            balancoFuncao("administracao121"),
            balancoFuncao("segurancaPublica"),
            balancoFuncao("previdenciaSocial"),
            balancoFuncao("saude"),
            balancoFuncao("educacao"),
            balancoFuncao("cultura"),
            balancoFuncao("direitosDaCidadania"),
            balancoFuncao("urbanismo"),
            balancoFuncao("habitacao"),
            balancoFuncao("saneamento"),
            balancoFuncao("gestaoAmbiental"),
            balancoFuncao("comercioEServico"),
            balancoFuncao("encargosEspeciais"),
          ])
        ),
      },
    ];

    //-- Slide <13> por ORGÃO - ANEXO 5 --------------------//

    const rub_anexo7 = (await db("rubricas").select("*"))[0].anexo7;

    const balancoOrgao = (despesa) => {
      const filteredOrgaoDspO = natureza.filtrarPerm(
        dspO,
        "codOrgao",
        rub_anexo7[despesa]
      );
      const filteredOrgaoEmp = natureza.filtrarPerm(
        emp,
        "codOrgao",
        rub_anexo7[despesa]
      );

// Comenta aqui      
      const filteredOrgaoEmp = natureza.filtrarPerm(
        natureza.filtrarPerm(emp, "codOrgao", rub_anexo7[despesa]),
        "tpEmpenho",
        ["01"]
      );
// Tira o cometário aqui

      const filteredOrgaoAnl = natureza.filtrarPerm(
        anl,
        "codOrgao",
        rub_anexo7[despesa]
      );

      const filteredOrgaoLqd = natureza.filtrarPerm(
        lqd,
        "codOrgao",
        rub_anexo7[despesa]
      );

 // Comenta aqui      
      const filteredOrgaoLqd = natureza.filtrarPerm(
        natureza.filtrarPerm(lqd, "codOrgao", rub_anexo7[despesa]),
        "tpLiquidacao",
        ["1"]
      );
// Tira o comentário aqui

      const filteredOrgaoAlq = natureza.filtrarPerm(
        alq,
        "codOrgao",
        rub_anexo7[despesa]
      );
      const filteredOrgaoOps = natureza.filtrarPerm(
        natureza.filtrarPerm(ops, "codOrgao", rub_anexo7[despesa]),
        "tipoOP",
        ["2"]
      );
      const filteredOrgaoAop = natureza.filtrarPerm(
        aop,
        "codOrgao",
        rub_anexo7[despesa]
      );

      const subOrgaoDspO = natureza.sum([
        {
          campo: filteredOrgaoDspO,
          toSum: "recurso",
        },
      ]);
      const subOrgaoEmp = natureza.sub([
        {
          campo: filteredOrgaoEmp,
          toSub: "vlBruto",
        },
        {
          campo: filteredOrgaoAnl,
          toSub: "vlAnulacao",
        },
      ]);
      const subOrgaoLqd = natureza.sub([
        {
          campo: filteredOrgaoLqd,
          toSub: "vlLiquidado",
        },
        {
          campo: filteredOrgaoAlq,
          toSub: "vlAnulado",
        },
      ]);

      const subOrgaoOps = natureza.sub([
        {
          campo: filteredOrgaoOps,
          toSub: "vlOP",
        },
        {
          campo: filteredOrgaoAop,
          toSub: "vlAnuladoOP",
        },
      ]);

      return [subOrgaoDspO, subOrgaoEmp, subOrgaoLqd, subOrgaoOps];
    };

    //-- Detalhamento no Console Empenho--------------//
    const checkOrgaoEmp = (string) => {
      const filteredOrgaoEmp = natureza.filtrarPerm(
        emp,
        "codOrgao",
        rub_anexo7[string]
      );

      return {
        name: string,
        somaVlBruto: natureza.sum([
          {
            campo: filteredOrgaoEmp,
            toSum: "vlBruto",
          },
        ]),
        empFiltered: filteredOrgaoEmp.map((e) => {
          return {
            codOrgao: e.content.codOrgao,
            vlBruto: e.content.vlBruto,
            tpEmpenho: e.content.tpEmpenho,
            elementoDespesa: e.content.elementoDespesa,
            nroEmpenho: e.content.nroEmpenho,
            data: e.data,
          };
        }),
      };
    };

    //-- Detalhamento no Console Anulação do Empenho--------------//
    const checkOrgaoAnl = (string) => {
      const filteredOrgaoAnl = natureza.filtrarPerm(
        anl,
        "codOrgao",
        rub_anexo7[string]
      );

      return {
        name: string,
        somavlAnulacao: natureza.sum([
          {
            campo: filteredOrgaoAnl,
            toSum: "vlAnulacao",
          },
        ]),
        anlFiltered: filteredOrgaoAnl.map((e) => {
          return {
            codOrgao: e.content.codOrgao,
            vlAnulacao: e.content.vlAnulacao,
            elementoDespesa: e.content.elementoDespesa,
            nroEmpenho: e.content.nroEmpenho,
            dtAnulacao: e.content.dtAnulacao,
          };
        }),
      };
    };

    //-- Detalhamento no Console Liquidação----------//
    const checkOrgaoLqd = (string) => {
      const filteredOrgaoLqd = natureza.filtrarPerm(
        lqd,
        "codOrgao",
        rub_anexo7[string]
      );

      return {
        name: string,
        somaVlLiquidado: natureza.sum([
          {
            campo: filteredOrgaoLqd,
            toSum: "vlLiquidado",
          },
        ]),
        lqdFiltered: filteredOrgaoLqd.map((e) => {
          return {
            codOrgao: e.content.codOrgao,
            vlLiquidado: e.content.vlLiquidado,
            elementoDespesa: e.content.elementoDespesa,
            nroEmpenho: e.content.nroEmpenho,
            nrLiquidacao: e.content.nrLiquidacao,
            data: e.data,
          };
        }),
      };
    };

    //-- Detalhamento no Console Anulação da Liquidação----------//
    const checkOrgaoAlq = (string) => {
      const filteredOrgaoAlq = natureza.filtrarPerm(
        alq,
        "codOrgao",
        rub_anexo7[string]
      );

      return {
        name: string,
        somaVlAnulado: natureza.sum([
          {
            campo: filteredOrgaoAlq,
            toSum: "vlAnulado",
          },
        ]),
        alqFiltered: filteredOrgaoAlq.map((e) => {
          return {
            codOrgao: e.content.codOrgao,
            vlAnulado: e.content.vlAnulado,
            elementoDespesa: e.content.elementoDespesa,
            nrLiquidacao: e.content.nrLiquidacao,
            nrLiquidacaoANL: e.content.nrLiquidacaoANL,
            dtAnulacaoLiq: e.content.dtAnulacaoLiq,
          };
        }),
      };
    };

    //-- Detalhamento no Console Pagamento----------//
    const checkOrgaoOps = (string) => {
      const filteredOrgaoOps = natureza.filtrarPerm(
        ops,
        "codOrgao",
        rub_anexo7[string]
      );

      return {
        name: string,
        somavlOP: natureza.sum([
          {
            campo: filteredOrgaoOps,
            toSum: "vlOP",
          },
        ]),
        opsFiltered: filteredOrgaoOps.map((e) => {
          return {
            codOrgao: e.content.codOrgao,
            tipoOP: e.content.tipoOP,
            vlOP: e.content.vlOP,
          };
        }),
      };
    };

    //-- Detalhamento no Console Anulação Pagamento----------//
    const checkOrgaoAop = (string) => {
      const filteredOrgaoAop = natureza.filtrarPerm(
        aop,
        "codOrgao",
        rub_anexo7[string]
      );

      return {
        name: string,
        somavlAnuladoOP: natureza.sum([
          {
            campo: filteredOrgaoAop,
            toSum: "vlAnuladoOP",
          },
        ]),
        opsFiltered: filteredOrgaoAop.map((e) => {
          return {
            codOrgao: e.content.codOrgao,
            vlAnuladoOP: e.content.vlAnuladoOP,
            elementoDespesa: e.content.elementoDespesa,
            nroEmpenho: e.content.nroEmpenho,
            nrAnulacaoOP: e.content.nrAnulacaoOP,
            dtEmissao: e.content.dtEmissao,
          };
        }),
      };
    };

    output.orgao = [
      {
        onGraf: true,
        name: leftAlign("Prefeitura Municipal"),
        values: findDiv(balancoOrgao("prefeitura")),
      },
      {
        onGraf: true,
        name: leftAlign("Iamesc"),
        values: findDiv(balancoOrgao("iamesc")),
      },
      {
        onGraf: true,
        name: leftAlign("Fundeb"),
        values: findDiv(balancoOrgao("fundeb")),
      },
      {
        onGraf: true,
        name: leftAlign("Senaprev"),
        values: findDiv(balancoOrgao("senaprev")),
      },
      {
        onGraf: true,
        name: leftAlign("Fembom"),
        values: findDiv(balancoOrgao("fembom")),
      },
      {
        onGraf: true,
        name: leftAlign("FMS"),
        values: findDiv(balancoOrgao("fms")),
      },
      {
        onGraf: true,
        name: leftAlign("FMAS"),
        values: findDiv(balancoOrgao("fmas")),
      },
      {
        onGraf: true,
        name: leftAlign("FMDCA"),
        values: findDiv(balancoOrgao("fmdca")),
      },
      {
        onGraf: true,
        name: leftAlign("PROCON"),
        values: findDiv(balancoOrgao("procon")),
      },
      {
        onGraf: true,
        name: leftAlign("SANESC"),
        values: findDiv(balancoOrgao("sanesc")),
      },
      {
        onGraf: true,
        name: leftAlign("AMMA"),
        values: findDiv(balancoOrgao("amma")),
      },
      {
        onGraf: true,
        name: leftAlign("FME"),
        values: findDiv(balancoOrgao("fme")),
      },
      {
        onGraf: true,
        name: leftAlign("FUNDI"),
        values: findDiv(balancoOrgao("fundi")),
      },
      {
        onGraf: true,
        name: leftAlign("FUMDEC"),
        values: findDiv(balancoOrgao("fumdec")),
      },
      {
        onGraf: false,
        name: leftAlign("TOTAL POR ORGÃO"),
        values: findDiv(
          natureza.sumRS([
            balancoOrgao("prefeitura"),
            balancoOrgao("iamesc"),
            balancoOrgao("fundeb"),
            balancoOrgao("senaprev"),
            balancoOrgao("fembom"),
            balancoOrgao("fms"),
            balancoOrgao("fmas"),
            balancoOrgao("fmdca"),
            balancoOrgao("procon"),
            balancoOrgao("sanesc"),
            balancoOrgao("amma"),
            balancoOrgao("fme"),
            balancoOrgao("fundi"),
            balancoOrgao("fumdec"),
          ])
        ),
      },
    ];

    output.checkOrgaoEmp = [checkOrgaoEmp("prefeitura")];

    output.checkOrgaoAnl = [checkOrgaoAnl("prefeitura")];

    output.checkOrgaoLqd = [checkOrgaoLqd("prefeitura")];

    output.checkOrgaoAlq = [checkOrgaoAlq("prefeitura")];

    output.checkOrgaoOps = [checkOrgaoOps("prefeitura")];

    output.checkOrgaoAop = [checkOrgaoAop("prefeitura")];

    //-- RECEITAS PREVIDENCIÁRIAS -----------------------------//

    const rub_anexo4 = (await db("rubricas").select("*"))[0].anexo4;

    const orgaoCampo = await db("orgao").select("*");

    const tipoOrgao9 = orgaoCampo
      .filter((orgao) => orgao.content.tipoOrgao === "09")
      .map((orgao) => orgao.content.codOrgao);

    const tipoOrgao14 = orgaoCampo
      .filter((orgao) => orgao.content.tipoOrgao === "14")
      .map((orgao) => orgao.content.codOrgao);

    const balancoRecPrev = (rubrica) => {
      const filteredRecPrevRecO = natureza.filtrarPerm(
        natureza.filtrarPerm(recO, "codOrgao", tipoOrgao9),
        "rubrica",
        rub_anexo4[rubrica]
      );
      const filteredRecPrevRec = natureza.filtrarPerm(
        natureza.filtrarPerm(rec, "codOrgao", tipoOrgao9),
        "rubrica",
        rub_anexo4[rubrica]
      );
      const filteredRecPrevAre = natureza.filtrarPerm(
        natureza.filtrarPerm(are, "codOrgao", tipoOrgao9),
        "rubrica",
        rub_anexo4[rubrica]
      );

      const sumRecPrevRecO = natureza.sum([
        {
          campo: filteredRecPrevRecO,
          toSum: "vlPrevisto",
        },
      ]);

      const subRecPrevRec = natureza.sub([
        {
          campo: filteredRecPrevRec,
          toSub: "vlArrecadado",
        },
        {
          campo: filteredRecPrevAre,
          toSub: "vlAnulacao",
        },
      ]);

      return [
        sumRecPrevRecO,
        subRecPrevRec,
        natureza.subRS([sumRecPrevRecO, subRecPrevRec])[0],
      ];
    };

    output.recPrevidencia = [
      {
        onGraf: false,
        name: leftAlign("RECEITAS CORRENTES"),
        values: findDiv(
          natureza.sumRS([
            balancoRecPrev("contribuicaoSeguradoAtivo"),
            balancoRecPrev("contribuicaoSeguradoInativo"),
            balancoRecPrev("contribuicaoSeguradoPensionista"),
            balancoRecPrev("contribuicaoPatronalAtivo"),
            balancoRecPrev("contribuicaoPatronalInativo"),
            balancoRecPrev("contribuicaoPatronalPensionista"),
            balancoRecPrev("receitaPatrimonial"),
            balancoRecPrev("contribuicaoPatronalInativo"),
            balancoRecPrev("contribuicaoPatronalPensionista"),
            balancoRecPrev("compensacaoEntreRegimes"),
            balancoRecPrev("demaisReceitasCorrentes"),
          ])
        ),
      },
      {
        onGraf: false,
        name: leftAlign("  Receita de Contribuição dos Segurados"),
        values: findDiv(
          natureza.sumRS([
            balancoRecPrev("contribuicaoSeguradoAtivo"),
            balancoRecPrev("contribuicaoSeguradoInativo"),
            balancoRecPrev("contribuicaoSeguradoPensionista"),
          ])
        ),
      },
      {
        onGraf: false,
        name: leftAlign("  Receita de Contribuição Patronal"),
        values: findDiv(
          natureza.sumRS([
            balancoRecPrev("contribuicaoPatronalAtivo"),
            balancoRecPrev("contribuicaoPatronalInativo"),
            balancoRecPrev("contribuicaoPatronalPensionista"),
          ])
        ),
      },
      {
        onGraf: false,
        name: leftAlign("  Receita Patrimonial"),
        values: findDiv(
          natureza.sumRS([
            balancoRecPrev("receitaPatrimonial"),
            balancoRecPrev("contribuicaoPatronalInativo"),
            balancoRecPrev("contribuicaoPatronalPensionista"),
          ])
        ),
      },
      {
        onGraf: false,
        name: leftAlign("  Receita de Serviços"),
        values: findDiv(balancoRecPrev("receitaZerada")),
      },
      {
        onGraf: false,
        name: leftAlign("  Outras Receitas de Serviços"),
        values: findDiv(
          natureza.sumRS([
            balancoRecPrev("compensacaoEntreRegimes"),
            balancoRecPrev("demaisReceitasCorrentes"),
          ])
        ),
      },
      {
        onGraf: false,
        name: leftAlign("RECEITAS DE CAPITAL"),
        values: findDiv(balancoRecPrev("receitaZerada")),
      },
      {
        onGraf: false,
        name: leftAlign("  Aporte Déficit Atuarial"),
        values: findDiv(balancoRecPrev("aporteDeficitAtuarial")),
      },
      {
        onGraf: false,
        name: leftAlign("TOTAL DA RECEITA REGIME PRÓPRIOS PREVIDÊNCIA"),
        values: findDiv(
          natureza.sumRS([
            balancoRecPrev("contribuicaoSeguradoAtivo"),
            balancoRecPrev("contribuicaoSeguradoInativo"),
            balancoRecPrev("contribuicaoSeguradoPensionista"),
            balancoRecPrev("contribuicaoPatronalAtivo"),
            balancoRecPrev("contribuicaoPatronalInativo"),
            balancoRecPrev("contribuicaoPatronalPensionista"),
            balancoRecPrev("receitaPatrimonial"),
            balancoRecPrev("contribuicaoPatronalInativo"),
            balancoRecPrev("contribuicaoPatronalPensionista"),
            balancoRecPrev("compensacaoEntreRegimes"),
            balancoRecPrev("demaisReceitasCorrentes"),
          ])
        ),
      },
      {
        onGraf: false,
        name: leftAlign("RECEITAS INTRA-ORÇAMENTÁRIA"),
        values: findDiv(
          natureza.sumRS([
            balancoRecPrev("contribuicaoPatronalIntra"),
            balancoRecPrev("contribuicaoPatronalParcela"),
          ])
        ),
      },
    ];

    //-- DESPESAS - EMPENHOS / LIQUIDAÇÃO / PAGAS-------------------------//

    const balancoDespPrev = (despesa) => {
      const filteredDespPrevDspO = natureza.filtrarPerm(
        natureza.filtrarPerm(dspO, "codOrgao", tipoOrgao9),
        "elementoDespesa",
        rub_anexo4[despesa]
      );
      const filteredDespPrevEmp = natureza.filtrarPerm(
        natureza.filtrarPerm(emp, "codOrgao", tipoOrgao9),
        "elementoDespesa",
        rub_anexo4[despesa]
      );
      const filteredDespPrevAnl = natureza.filtrarPerm(
        natureza.filtrarPerm(anl, "codOrgao", tipoOrgao9),
        "elementoDespesa",
        rub_anexo4[despesa]
      );
      const filteredDespPrevLqd = natureza.filtrarPerm(
        natureza.filtrarPerm(lqd, "codOrgao", tipoOrgao9),
        "elementoDespesa",
        rub_anexo4[despesa]
      );
      const filteredDespPrevAlq = natureza.filtrarPerm(
        natureza.filtrarPerm(alq, "codOrgao", tipoOrgao9),
        "elementoDespesa",
        rub_anexo4[despesa]
      );
      const filteredDespPrevOps = natureza.filtrarPerm(
        natureza.filtrarPerm(
          natureza.filtrarPerm(ops, "codOrgao", tipoOrgao9),
          "elementoDespesa",
          rub_anexo4[despesa]
        ),
        "tipoOP",
        ["2"]
      );
      const filteredDespPrevAop = natureza.filtrarPerm(
        natureza.filtrarPerm(aop, "codOrgao", tipoOrgao9),
        "elementoDespesa",
        rub_anexo4[despesa]
      );

      const sumDespPrevDspO = natureza.sum([
        {
          campo: filteredDespPrevDspO,
          toSum: "recurso",
        },
      ]);
      const subDespPrevEmp = natureza.sub([
        {
          campo: filteredDespPrevEmp,
          toSub: "vlBruto",
        },
        {
          campo: filteredDespPrevAnl,
          toSub: "vlAnulacao",
        },
      ]);
      const subDespPrevLqd = natureza.sub([
        {
          campo: filteredDespPrevLqd,
          toSub: "vlLiquidado",
        },
        {
          campo: filteredDespPrevAlq,
          toSub: "vlAnulado",
        },
      ]);
      const subDespPrevOps = natureza.sub([
        {
          campo: filteredDespPrevOps,
          toSub: "vlOP",
        },
        {
          campo: filteredDespPrevAop,
          toSub: "vlAnuladoOP",
        },
      ]);
      return [sumDespPrevDspO, subDespPrevEmp, subDespPrevLqd, subDespPrevOps];
    };

    output.despPrevidencia = [
      {
        onGraf: false,
        name: leftAlign("DESPESAS PREVIDENCIÁRIAS"),
        values: findDiv(
          natureza.sumRS([
            balancoDespPrev("beneficioPrevidenciario"),
            balancoDespPrev("compensacaoFinanceira"),
          ])
        ),
      },
      {
        onGraf: false,
        name: leftAlign("  Benefícios"),
        values: findDiv(balancoDespPrev("beneficioPrevidenciario")),
      },
      {
        onGraf: false,
        name: leftAlign("  Outras Despesas Previdenciárias"),
        values: findDiv(
          natureza.sumRS([balancoDespPrev("compensacaoFinanceira")])
        ),
      },
      {
        onGraf: false,
        name: leftAlign("DESPESAS ADMINISTRAÇÃO"),
        values: findDiv(balancoDespPrev("despesaAdministracao")),
      },
      {
        onGraf: false,
        name: leftAlign("TOTAL DESPESAS"),
        values: findDiv(
          natureza.sumRS([
            balancoDespPrev("beneficioPrevidenciario"),
            balancoDespPrev("compensacaoFinanceira"),
            balancoDespPrev("despesaAdministracao"),
          ])
        ),
      },
    ];

    output.despResultado = [
      {
        onGraf: false,
        name: leftAlign("(+) RECEITAS CORRENTES"),
        values: findDiv(
          natureza.sumRS([
            balancoRecPrev("contribuicaoSeguradoAtivo"),
            balancoRecPrev("contribuicaoSeguradoInativo"),
            balancoRecPrev("contribuicaoSeguradoPensionista"),
            balancoRecPrev("contribuicaoPatronalAtivo"),
            balancoRecPrev("contribuicaoPatronalInativo"),
            balancoRecPrev("contribuicaoPatronalPensionista"),
            balancoRecPrev("receitaPatrimonial"),
            balancoRecPrev("contribuicaoPatronalInativo"),
            balancoRecPrev("contribuicaoPatronalPensionista"),
            balancoRecPrev("compensacaoEntreRegimes"),
            balancoRecPrev("demaisReceitasCorrentes"),
          ])
        ),
      },
      {
        onGraf: false,
        name: leftAlign("(-) DESPESAS PREVIDENCIÁRIAS"),
        values: findDiv(
          natureza.sumRS([
            balancoDespPrev("beneficioPrevidenciario"),
            balancoDespPrev("compensacaoFinanceira"),
          ])
        ),
      },
      {
        onGraf: false,
        name: leftAlign("( = ) RESULTADO"),
        values: findDiv(
          natureza.subRS([
            natureza.sumRS([
              balancoRecPrev("contribuicaoSeguradoAtivo"),
              balancoRecPrev("contribuicaoSeguradoInativo"),
              balancoRecPrev("contribuicaoSeguradoPensionista"),
              balancoRecPrev("contribuicaoPatronalAtivo"),
              balancoRecPrev("contribuicaoPatronalInativo"),
              balancoRecPrev("contribuicaoPatronalPensionista"),
              balancoRecPrev("receitaPatrimonial"),
              balancoRecPrev("contribuicaoPatronalInativo"),
              balancoRecPrev("contribuicaoPatronalPensionista"),
              balancoRecPrev("compensacaoEntreRegimes"),
              balancoRecPrev("demaisReceitasCorrentes"),
            ]),
            natureza.sumRS([
              balancoDespPrev("beneficioPrevidenciario"),
              balancoDespPrev("compensacaoFinanceira"),
            ]),
          ])
        ),
      },
    ];

    //-- RECEITAS E DESPESAS COM MANUTENÇÃO E DESENVOLVIMENTO DO ENSINO - MDE--//

    const rub_anexo8 = (await db("rubricas").select("*"))[0].anexo8;

    const balancoMDE = (rubrica) => {
      const filteredMDERecO = natureza.filtrarPerm(
        recO,
        "rubrica",
        rub_anexo8[rubrica]
      );
      const filteredMDERec = natureza.filtrarPerm(
        rec,
        "rubrica",
        rub_anexo8[rubrica]
      );
      const filteredMDEAre = natureza.filtrarPerm(
        are,
        "rubrica",
        rub_anexo8[rubrica]
      );

      const subMDERecO = natureza.sum([
        {
          campo: filteredMDERecO,
          toSum: "vlPrevisto",
        },
      ]);

      const subMDERec = natureza.sub([
        {
          campo: filteredMDERec,
          toSub: "vlArrecadado",
        },
        {
          campo: filteredMDEAre,
          toSub: "vlAnulacao",
        },
      ]);

      return [
        subMDERecO,
        subMDERec,
        natureza.subRS([subMDERecO, subMDERec])[0],
      ];
    };

    output.receitasMDE_3 = [
      {
        onGraf: false,
        styled: true,
        name: leftAlign("L1 - RECEITAS DE IMPOSTOS RECURSOS PRÓPRIOS"),
        values: findDiv(
          natureza.sumRS([
            balancoMDE("iptu"),
            balancoMDE("itbi"),
            balancoMDE("issqn"),
            balancoMDE("irrf"),
          ])
        ),
      },
      {
        onGraf: false,
        styled: true,
        name: leftAlign("L2 - RECEITAS DE IMPOSTOS RECURSOS TRANSFERÊNCIAS"),
        values: findDiv(
          natureza.sumRS([
            balancoMDE("fpm"),
            balancoMDE("fpmExtraOrdinaria"),
            balancoMDE("icms"),
            balancoMDE("ipi"),
            balancoMDE("itr"),
            balancoMDE("ipva"),
            balancoMDE("iofOuro"),
            balancoMDE("outrasTransferencia"),
          ])
        ),
      },
      {
        onGraf: false,
        name: leftAlign("L3 - TOTAL RECEITA RESULTANTE DE IMPOSTOS"),
        values: findDiv(
          natureza.sumRS([
            balancoMDE("iptu"),
            balancoMDE("itbi"),
            balancoMDE("issqn"),
            balancoMDE("irrf"),
            balancoMDE("fpm"),
            balancoMDE("fpmExtraOrdinaria"),
            balancoMDE("icms"),
            balancoMDE("ipi"),
            balancoMDE("itr"),
            balancoMDE("ipva"),
            balancoMDE("iofOuro"),
            balancoMDE("outrasTransferencia"),
          ])
        ),
      },
    ];

    //-- LINHA 4 - TOTAL DESTINHADO AO FUNDEB ------------------------//

    output.receitasMDE_4 = [
      {
        onGraf: false,
        name: leftAlign("L4 - TOTAL DESTINADO AO FUNDEB 20% SOBRE LINHA 2"),
        values: [natureza.multRS(output.receitasMDE_3[1].values[1], "0,20")],
      },
      {
        onGraf: false,
        name: leftAlign(
          "L5 - VALOR MINIMO A SER APLICADO ALÉM DO VALOR DESTINADO AO FUNDEB"
        ),
        values: [natureza.multRS(output.receitasMDE_3[1].values[1], "0,05")],
      },
      {
        onGraf: false,
        name: leftAlign(
          "L5 - VALOR MINIMO A SER APLICADO ALÉM DO VALOR DESTINADO AO FUNDEB"
        ),
        values: [natureza.multRS(output.receitasMDE_3[0].values[1], "0,25")],
      },
      {
        onGraf: false,
        name: leftAlign("( = ) RESULTADO"),
        values: [
          natureza.sumRS([
            natureza.multRS(output.receitasMDE_3[1].values[1], "0,05"),
            natureza.multRS(output.receitasMDE_3[0].values[1], "0,25"),
          ])[0],
        ],
      },
    ];
   

  //-- 6 - RECEITAS DO FUNDEB RECEBIDAS NO EXERCICIO --------//

// Comenta aqui
    const orgaoCampo03 = await db("orgao").select("*");

    const tipoOrgao3 = orgaoCampo03
      .filter((orgao) => orgao.content.tipoOrgao === "03")
      .map((orgao) => orgao.content.codOrgao);

    const balancoMDE_6 = (rubrica) => {
      const codSTNMDE_6 = rub_anexo8[rubrica].map((e) => e.codSTN || "");
      const rubricaMDE_6 = rub_anexo8[rubrica].map((e) => e.rubrica || "");

      const filteredMDE_6RecO = natureza.filtrarSubPerm(
        natureza.filtrarPerm(
          recO,
          ["codOrgao", "rubrica"],
          [tipoOrgao3, rubricaMDE_6]
        ),
        "11",
        "codSTN",
        codSTNMDE_6
      );
      const filteredMDE_6Rec = natureza.filtrarSubPerm(
        natureza.filtrarPerm(
          rec,
          ["codOrgao", "rubrica"],
          [tipoOrgao3, rubricaMDE_6]
        ),
        "12",
        "codSTN",
        codSTNMDE_6
      );
      const filteredMDE_6Are = natureza.filtrarSubPerm(
        natureza.filtrarPerm(
          are,
          ["codOrgao", "rubrica"],
          [tipoOrgao3, rubricaMDE_6]
        ),
        "12",
        "codSTN",
        codSTNMDE_6
      );

// Tira o Comentário aqui

    const orgaoCampo03 = await db("orgao").select("*");

    const tipoOrgao3 = orgaoCampo03
      .filter((orgao) => orgao.content.tipoOrgao === "03")
      .map((orgao) => orgao.content.codOrgao);

    const balancoMDE_6 = (rubrica) => {
      const filteredMDE_6RecO = natureza.filtrarPerm(
        natureza.filtrarPerm(recO, "codOrgao", tipoOrgao3),
        "rubrica",
        rub_anexo8[rubrica]
      );
      const filteredMDE_6Rec = natureza.filtrarPerm(
        natureza.filtrarPerm(rec, "codOrgao", tipoOrgao3),
        "rubrica",
        rub_anexo8[rubrica]
      );
      const filteredMDE_6Are = natureza.filtrarPerm(
        natureza.filtrarPerm(are, "codOrgao", tipoOrgao3),
        "rubrica",
        rub_anexo8[rubrica]
      );

      const subMDE_6RecO = natureza.sum([
        {
          campo: filteredMDE_6RecO,
          toSum: "vlPrevisto",
        },
      ]);

      const subMDE_6Rec = natureza.sub([
        {
          campo: filteredMDE_6Rec,
          toSub: "vlArrecadado",
        },
        {
          campo: filteredMDE_6Are,
          toSub: "vlAnulacao",
        },
      ]);

      return [
        subMDE_6RecO,
        subMDE_6Rec,
        natureza.subRS([subMDE_6RecO, subMDE_6Rec])[0],
      ];
    };

    output.receitasMDE_6 = [
      {
        onGraf: false,
        name: leftAlign("6.1 - FUNDEB - Impostos e Transferências de Impostos"),
        values: findDiv(
          natureza.sumRS([
            balancoMDE_6("611principal"),
            balancoMDE_6("612aplicacaoFinanceira"),
            balancoMDE_6("613ressarcimentoRecursos"),
          ])
        ),
      },
      {
        onGraf: true,
        name: leftAlign("6.1.1 - Principal"),
        values: findDiv(balancoMDE_6("611principal")),
      },
      {
        onGraf: true,
        name: leftAlign("6.1.2 - Rendimento de Aplicação Financeira"),
        values: findDiv(balancoMDE_6("612aplicacaoFinanceira")),
      },
      {
        onGraf: true,
        name: leftAlign("6.1.3 - Ressarcimento de recursos do Fundeb"),
        values: findDiv(balancoMDE_6("613ressarcimentoRecursos")),
      },
    ];

    //-- 20 - DESPESAS COM AÇÕES TÍPICAS DE MDE --------------//

    const balancoMDE20 = (despesa) => {
      const codFuncaoMDE20 = rub_anexo8[despesa].map((e) => e.codFuncao || "");
      const codSubFuncaoMDE20 = rub_anexo8[despesa].map(
        (e) => e.codSubFuncao || ""
      );

      const filteredMDE20DspO = natureza.filtrarPerm(
        dspO,
        ["codOrgao", "codFuncao", "codSubFuncao"],
        [tipoOrgao14, codFuncaoMDE20, codSubFuncaoMDE20]
      );
      const filteredMDE20Emp = natureza.filtrarPerm(
        emp,
        ["codOrgao", "codFuncao", "codSubFuncao"],
        [tipoOrgao14, codFuncaoMDE20, codSubFuncaoMDE20]
      );
      const filteredMDE20Anl = natureza.filtrarPerm(
        anl,
        ["codOrgao", "codFuncao", "codSubFuncao"],
        [tipoOrgao14, codFuncaoMDE20, codSubFuncaoMDE20]
      );
      const filteredMDE20Lqd = natureza.filtrarPerm(
        lqd,
        ["codOrgao", "codFuncao", "codSubFuncao"],
        [tipoOrgao14, codFuncaoMDE20, codSubFuncaoMDE20]
      );
      const filteredMDE20Alq = natureza.filtrarPerm(
        alq,
        ["codOrgao", "codFuncao", "codSubFuncao"],
        [tipoOrgao14, codFuncaoMDE20, codSubFuncaoMDE20]
      );
      const filteredMDE20Ops = natureza.filtrarPerm(
        ops,
        ["tipoOP", "codOrgao", "codFuncao", "codSubFuncao"],
        [["2"], tipoOrgao14, codFuncaoMDE20, codSubFuncaoMDE20]
      );
      const filteredMDE20Aop = natureza.filtrarPerm(
        aop,
        ["codOrgao", "codFuncao", "codSubFuncao"],
        [tipoOrgao14, codFuncaoMDE20, codSubFuncaoMDE20]
      );

      const subMDE20DspO = natureza.sum([
        {
          campo: filteredMDE20DspO,
          toSum: "recurso",
        },
      ]);
      const subMDE20Emp = natureza.sub([
        {
          campo: filteredMDE20Emp,
          toSub: "vlBruto",
        },
        {
          campo: filteredMDE20Anl,
          toSub: "vlAnulacao",
        },
      ]);
      const subMDE20Lqd = natureza.sub([
        {
          campo: filteredMDE20Lqd,
          toSub: "vlLiquidado",
        },
        {
          campo: filteredMDE20Alq,
          toSub: "vlAnulado",
        },
      ]);
      const subMDE20Ops = natureza.sub([
        {
          campo: filteredMDE20Ops,
          toSub: "vlOP",
        },
        {
          campo: filteredMDE20Aop,
          toSub: "vlAnuladoOP",
        },
      ]);
      return [subMDE20DspO, subMDE20Emp, subMDE20Lqd, subMDE20Ops];
    };

    output.despesasMDE20 = [
      {
        onGraf: false,
        name: leftAlign("20 - DESPESAS TIPICAS COM MDE"),
        values: findDiv(
          natureza.sumRS([
            balancoMDE20("1011educacaoInfantil"),
            balancoMDE20("1012ensinoFundamental"),
            balancoMDE20("1013educacaoJovens"),
            balancoMDE20("1014educacaoEspecial"),
            balancoMDE20("1015administracaoGeral"),
            balancoMDE20("1026transporteEscolar"),
            balancoMDE20("1027outras"),
          ])
        ),
      },
      {
        onGraf: true,
        name: leftAlign("365 - Educação Infantil"),
        values: findDiv(balancoMDE20("1011educacaoInfantil")),
      },
      {
        onGraf: true,
        name: leftAlign("361 - Ensino Fundamental"),
        values: findDiv(balancoMDE20("1012ensinoFundamental")),
      },
      {
        onGraf: true,
        name: leftAlign("366 - Educação de Jovens e Adultos"),
        values: findDiv(balancoMDE20("1013educacaoJovens")),
      },
      {
        onGraf: true,
        name: leftAlign("367 - Educação Especial"),
        values: findDiv(balancoMDE20("1014educacaoEspecial")),
      },
      {
        onGraf: true,
        name: leftAlign("04.122 - Administração Geral"),
        values: findDiv(balancoMDE20("1015administracaoGeral")),
      },
      {
        onGraf: true,
        name: leftAlign("26.781 a 785 - transporte (Escolar)"),
        values: findDiv(balancoMDE20("1026transporteEscolar")),
      },
      {
        onGraf: true,
        name: leftAlign("28.843 e 844 - Outras"),
        values: findDiv(balancoMDE20("1027outras")),
      },
      {
        onGraf: false,
        name: leftAlign("29 - Aplicação em MDE SOBRE A RECEITA"),
        values: [natureza.multRS(output.receitasMDE_3[2].values[1], "0,25")],
      },
    ];
 
 // Comenta aqui
 
    const porcentagemMDE = [
      natureza.divRS(
        [output.despesasMDE20[0].values[2]],
        [output.receitasMDE[2].values[1]],
        true
      )[0],
    ];

    const porcentagemMDE2 = [
      natureza.multRS(output.receitasMDE[2].values[1], "0,25"),
    ];

    console.log("porcentagem", porcentagemMDE);
    console.log("porcentagem2", porcentagemMDE2);

// Tira o comentário aqui

//-- Demonstrativo das Receitas com Ações e Serviços Públicos de Saúde--//

    const rub_anexo12 = (await db("rubricas").select("*"))[0].anexo12;

    const balancoRecFMS = (rubrica) => {
      const filteredRecFMSRecO = natureza.filtrarPerm(
        recO,
        "rubrica",
        rub_anexo12[rubrica]
      );
      const filteredRecFMSRec = natureza.filtrarPerm(
        rec,
        "rubrica",
        rub_anexo12[rubrica]
      );
      const filteredRecFMSAre = natureza.filtrarPerm(
        are,
        "rubrica",
        rub_anexo12[rubrica]
      );

      const subRecFMSRecO = natureza.sum([
        {
          campo: filteredRecFMSRecO,
          toSum: "vlPrevisto",
        },
      ]);

      const subRecFMSRec = natureza.sub([
        {
          campo: filteredRecFMSRec,
          toSub: "vlArrecadado",
        },
        {
          campo: filteredRecFMSAre,
          toSub: "vlAnulacao",
        },
      ]);

      return [
        subRecFMSRecO,
        subRecFMSRec,
        natureza.subRS([subRecFMSRecO, subRecFMSRec])[0],
      ];
    };

    output.receitasFMS = [
      {
        onGraf: false,
        styled: true,
        name: leftAlign("RECEITAS DE IMPOSTOS RECURSOS PRÓPRIOS"),
        values: findDiv(
          natureza.sumRS([
            balancoRecFMS("iptu"),
            balancoRecFMS("itbi"),
            balancoRecFMS("issqn"),
            balancoRecFMS("irrf"),
          ])
        ),
      },
      {
        onGraf: false,
        styled: true,
        name: leftAlign("RECEITAS DE IMPOSTOS RECURSOS TRANSFERÊNCIAS"),
        values: findDiv(
          natureza.sumRS([
            balancoRecFMS("fpm"),
            balancoRecFMS("fpmExtraOrdinaria"),
            balancoRecFMS("icms"),
            balancoRecFMS("ipi"),
            balancoRecFMS("itr"),
            balancoRecFMS("ipva"),
            balancoRecFMS("outrasTransferenciasCompensacoes"),
          ])
        ),
      },
      {
        onGraf: false,
        name: leftAlign("TOTAL RECEITA RESULTANTE DE IMPOSTOS"),
        values: findDiv(
          natureza.sumRS([
            balancoRecFMS("iptu"),
            balancoRecFMS("itbi"),
            balancoRecFMS("issqn"),
            balancoRecFMS("irrf"),
            balancoRecFMS("fpm"),
            balancoRecFMS("fpmExtraOrdinaria"),
            balancoRecFMS("icms"),
            balancoRecFMS("ipi"),
            balancoRecFMS("itr"),
            balancoRecFMS("ipva"),
            balancoRecFMS("iofOuro"),
            balancoRecFMS("outrasTransferenciasCompensacoes"),
          ])
        ),
      },
    ];

    //-- Demonstrativo Despesas com Ações e Serviços Públicos de Saúde--//

    const balancoDespFMS = (despesa) => {
      const filteredDespFMSDspO = natureza.filtrarPerm(
        dspO,
        "codSubFuncao",
        rub_anexo12[despesa]
      );
      const filteredDespFMSEmp = natureza.filtrarPerm(
        emp,
        "codSubFuncao",
        rub_anexo12[despesa]
      );
      const filteredDespFMSAnl = natureza.filtrarPerm(
        anl,
        "codSubFuncao",
        rub_anexo12[despesa]
      );
      const filteredDespFMSLqd = natureza.filtrarPerm(
        lqd,
        "codSubFuncao",
        rub_anexo12[despesa]
      );
      const filteredDespFMSAlq = natureza.filtrarPerm(
        alq,
        "codSubFuncao",
        rub_anexo12[despesa]
      );
      const filteredDespFMSOps = natureza.filtrarPerm(
        natureza.filtrarPerm(ops, "codSubFuncao", rub_anexo12[despesa]),
        "tipoOP",
        ["2"]
      );
      const filteredDespFMSAop = natureza.filtrarPerm(
        aop,
        "codSubFuncao",
        rub_anexo12[despesa]
      );

      const subDespFMSDspO = natureza.sum([
        {
          campo: filteredDespFMSDspO,
          toSum: "recurso",
        },
      ]);
      const subDespFMSEmp = natureza.sub([
        {
          campo: filteredDespFMSEmp,
          toSub: "vlBruto",
        },
        {
          campo: filteredDespFMSAnl,
          toSub: "vlAnulacao",
        },
      ]);
      const subDespFMSLqd = natureza.sub([
        {
          campo: filteredDespFMSLqd,
          toSub: "vlLiquidado",
        },
        {
          campo: filteredDespFMSAlq,
          toSub: "vlAnulado",
        },
      ]);
      const subDespFMSOps = natureza.sub([
        {
          campo: filteredDespFMSOps,
          toSub: "vlOP",
        },
        {
          campo: filteredDespFMSAop,
          toSub: "vlAnuladoOP",
        },
      ]);
      return [subDespFMSDspO, subDespFMSEmp, subDespFMSLqd, subDespFMSOps];
    };

    output.despesasFMS = [
      {
        onGraf: true,
        name: leftAlign("Atenção Básica"),
        values: findDiv(balancoDespFMS("QD4atencaoBasicaDspCorrente")),
      },
      {
        onGraf: true,
        name: leftAlign("Assistência Hospitalar e Ambulatorial"),
        values: findDiv(balancoDespFMS("QD4assistenciaHospitalarDspCorrente")),
      },
      {
        onGraf: true,
        name: leftAlign("Suporte Profilático e Terapêutico"),
        values: findDiv(balancoDespFMS("QD4suporteProfilaticoDspCorrente")),
      },
      {
        onGraf: true,
        name: leftAlign("Vigilância Sanitária"),
        values: findDiv(balancoDespFMS("QD4vigilanciaSanitariaDspCorrente")),
      },
      {
        onGraf: true,
        name: leftAlign("Vigilância Epidemológica"),
        values: findDiv(balancoDespFMS("QD4vigilanciaEpidemiologicaDspCorrente")),
      },
      {
        onGraf: true,
        name: leftAlign("Alimentação e Nutrição"),
        values: findDiv(balancoDespFMS("QD4alimentacaoNutricaoDspCorrente")),
      },
      {
        onGraf: true,
        name: leftAlign("Outras SubFunções"),
        values: findDiv(balancoDespFMS("QD4outrasSubFuncoesDspCorrente")),
      },
      {
        onGraf: false,
        name: leftAlign("TOTAL DESPESAS COM ASPS"),
        values: findDiv(
          natureza.sumRS([
            balancoDespFMS("QD4atencaoBasicaDspCorrente"),
            balancoDespFMS("QD4assistenciaHospitalarDspCorrente"),
            balancoDespFMS("QD4suporteProfilaticoDspCorrente"),
            balancoDespFMS("QD4vigilanciaSanitariaDspCorrente"),
            balancoDespFMS("QD4vigilanciaEpidemiologicaDspCorrente"),
            balancoDespFMS("QD4alimentacaoNutricaoDspCorrente"),
            balancoDespFMS("QD4outrasSubFuncoesDspCorrente"),
          ])
        ),
      },
    ];

    output.despesasFMS.push({
      onGraf: false,
      name: leftAlign("Porcentagem"),
      values: [
        "0,00%",
        natureza.divRS(
          [output.despesasFMS[7].values[1]],
          [output.receitasFMS[2].values[1]],
          true
        )[0] + "%",
        natureza.divRS(
          [output.despesasFMS[7].values[2]],
          [output.receitasFMS[2].values[1]],
          true
        )[0] + "%",
        natureza.divRS(
          [output.despesasFMS[7].values[3]],
          [output.receitasFMS[2].values[1]],
          true
        )[0] + "%",
        "0,00%",
      ],
    });

    //-- DEMONSTRATIVO DA DESPESA COM PESSOAL --//

    const rub_anexo14 = (await db("rubricas").select("*"))[0].anexo14;

    const balancoPessoal = (despesa) => {
      const filteredPessoalDspO = natureza.filtrarPerm(
        dspO,
        "elementoDespesa",
        rub_anexo14[despesa]
      );
      const filteredPessoalEmp = natureza.filtrarPerm(
        emp,
        "elementoDespesa",
        rub_anexo14[despesa]
      );
      const filteredPessoalAnl = natureza.filtrarPerm(
        anl,
        "elementoDespesa",
        rub_anexo14[despesa]
      );
      const filteredPessoalLqd = natureza.filtrarPerm(
        lqd,
        "elementoDespesa",
        rub_anexo14[despesa]
      );
      const filteredPessoalAlq = natureza.filtrarPerm(
        alq,
        "elementoDespesa",
        rub_anexo14[despesa]
      );
      const filteredPessoalOps = natureza.filtrarPerm(
        natureza.filtrarPerm(ops, "elementoDespesa", rub_anexo14[despesa]),
        "tipoOP",
        ["2"]
      );
      const filteredPessoalAop = natureza.filtrarPerm(
        aop,
        "elementoDespesa",
        rub_anexo14[despesa]
      );

      const sumPessoalDspO = natureza.sum([
        {
          campo: filteredPessoalDspO,
          toSum: "recurso",
        },
      ]);
      const subPessoalEmp = natureza.sub([
        {
          campo: filteredPessoalEmp,
          toSub: "vlBruto",
        },
        {
          campo: filteredPessoalAnl,
          toSub: "vlAnulacao",
        },
      ]);
      const subPessoalLqd = natureza.sub([
        {
          campo: filteredPessoalLqd,
          toSub: "vlLiquidado",
        },
        {
          campo: filteredPessoalAlq,
          toSub: "vlAnulado",
        },
      ]);
      const subPessoalOps = natureza.sub([
        {
          campo: filteredPessoalOps,
          toSub: "vlOP",
        },
        {
          campo: filteredPessoalAop,
          toSub: "vlAnuladoOP",
        },
      ]);
      return [sumPessoalDspO, subPessoalEmp, subPessoalLqd, subPessoalOps];
    };

    output.despesasPessoal = [
      {
        onGraf: false,
        name: leftAlign("PESSOAL ATIVO"),
        values: findDiv(
          natureza.sumRS([
            balancoPessoal("venctoVantagens"),
            balancoPessoal("obrigacoesPatronais"),
          ])
        ),
      },
      {
        onGraf: true,
        name: leftAlign("Vencimentos e Vantagens Fixas"),
        values: findDiv(balancoPessoal("venctoVantagens")),
      },
      {
        onGraf: true,
        name: leftAlign("Obrigações Patronais"),
        values: findDiv(balancoPessoal("obrigacoesPatronais")),
      },
      {
        onGraf: false,
        name: leftAlign("PESSOAL INATIVO E PENSIONISTAS"),
        values: findDiv(
          natureza.sumRS([
            balancoPessoal("aposentadoria"),
            balancoPessoal("pensoes"),
          ])
        ),
      },
      {
        onGraf: true,
        name: leftAlign("Aposentadoria"),
        values: findDiv(balancoPessoal("aposentadoria")),
      },
      {
        onGraf: true,
        name: leftAlign("Pensões"),
        values: findDiv(balancoPessoal("pensoes")),
      },
      {
        onGraf: true,
        name: leftAlign("Contrato Tercerizados"),
        values: findDiv(balancoPessoal("contratosTercerizados")),
      },
      {
        onGraf: false,
        name: leftAlign(
          "DESPESAS NÃO COMPUTADAS (II) (§ 1º. do art. 19 da LRF)"
        ),
        values: findDiv(
          natureza.sumRS([
            balancoPessoal("indenizacaoDemissao"),
            balancoPessoal("decisaoJudicial"),
          ])
        ),
      },
      {
        onGraf: true,
        name: leftAlign("Indenizações Demissão"),
        values: findDiv(balancoPessoal("indenizacaoDemissao")),
      },
      {
        onGraf: true,
        name: leftAlign("Decisão Judicial"),
        values: findDiv(balancoPessoal("decisaoJudicial")),
      },
    ];
*/
    return res.status(200).json({
      output: output,
      data37: String(parseInt(natureza.dataToYear(dataI)) - 1),
    });
  } catch (error) {
    console.error("error at getRreoAnexo from controller.slide2", error);
    return res.status(500).json({ message: "Internal server error." });
  }
}

export default { getSlide2 };
