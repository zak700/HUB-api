import { db } from "../../../database/postgres.js";
import natureza from "../../../helpers/natureza.js";

async function getRreoAnexo(req, res) {
  try {
    const { dataF, consolidado } = req.query;
    const lastDataI = req.query.dataI;
    const dataI = lastDataI || "01" + dataF.substring(2, 4);
    const orgao = req.query["orgao[codOrgao]"];
    const orgaoType = req.query["orgao[type]"];

    const output = {};

    const recO = await natureza.getCampo(
      "recO",
      "y",
      orgao,
      consolidado,
      dataI,
      dataF
    );

    const rec = await natureza.getCampo(
      "rec",
      "m",
      orgao,
      consolidado,
      dataI,
      dataF
    );

    const are = await natureza.getCampo(
      "are",
      "m",
      orgao,
      consolidado,
      dataI,
      dataF
    );

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

    const findDiv = (arr) => {
      let div = String(
        ((natureza.toInt(arr[1]) / natureza.toInt(arr[0])) * 100).toFixed(2)
      ).replace(".", ",");

      if (div === "Infinity" || div === "NaN") div = "0,00";

      return [...arr, div + "%"];
    };

    const leftAlign = (string) => {
      return { text: string, options: { align: "left" } };
    };

    const orgaos = await db("orgao").select("*");

    const tipoOrgao3 = orgaos
      .filter((orgao) => orgao.content.tipoOrgao === "03")
      .map((orgao) => orgao.content.codOrgao);

    const tipoOrgao14 = orgaos
      .filter((orgao) => orgao.content.tipoOrgao === "14")
      .map((orgao) => orgao.content.codOrgao);

    //-- L1 A L5 - RECEITAS COM MANUTENÇÃO E DESENVOLVIMENTO DO ENSINO - MDE--//

    const rub_anexo8 = (await db("rubricas").select("*"))[0].anexo8;

    const filtroMDE_1 = (rubrica) => {
      const filteredMDE_1RecO = natureza.filtrarPerm(
        recO,
        "rubrica",
        rub_anexo8[rubrica]
      );
      const filteredMDE_1Rec = natureza.filtrarPerm(
        rec,
        "rubrica",
        rub_anexo8[rubrica]
      );
      const filteredMDE_1Are = natureza.filtrarPerm(
        are,
        "rubrica",
        rub_anexo8[rubrica]
      );

      const subMDE_1RecO = natureza.sum([
        {
          campo: filteredMDE_1RecO,
          toSum: "vlPrevisto",
        },
      ]);

      const subMDE_1Rec = natureza.sub([
        {
          campo: filteredMDE_1Rec,
          toSub: "vlArrecadado",
        },
        {
          campo: filteredMDE_1Are,
          toSub: "vlAnulacao",
        },
      ]);

      return [subMDE_1RecO, subMDE_1Rec];
    };

    output.receitasMDE_1 = [
      {
        name: "1 - RECEITA DE IMPOSTOS",
        values: natureza.sumRS([
          filtroMDE_1("iptu"),
          filtroMDE_1("itbi"),
          filtroMDE_1("issqn"),
          filtroMDE_1("irrf"),
        ]),
      },
      {
        name: "   1.1 - Receita Resultante do Imposto sobre a Propriedade Predial e Territorial Urbana - IPTU",
        values: filtroMDE_1("iptu"),
      },
      {
        name: "   1.2 - Receita Resultante do Imposto sobre Transmissão Inter Vivos - ITBI",
        values: filtroMDE_1("itbi"),
      },
      {
        name: "   1.3 - Receita Resultante do Imposto sobre Serviços de Qualquer Natureza - ISS",
        values: filtroMDE_1("issqn"),
      },
      {
        name: "   1.4 - Receita Resultante do Imposto de Renda Retido na Fonte - IRRF",
        values: filtroMDE_1("irrf"),
      },
      {
        name: "2 - RECEITA DE TRANSFERÊNCIAS CONSTITUCIONAIS E LEGAIS",
        values: natureza.sumRS([
          filtroMDE_1("fpm"),
          filtroMDE_1("fpmExtraOrdinaria"),
          filtroMDE_1("icms"),
          filtroMDE_1("ipi"),
          filtroMDE_1("itr"),
          filtroMDE_1("ipva"),
          filtroMDE_1("iofOuro"),
          filtroMDE_1("outrasTransferencia"),
        ]),
      },
      {
        name: "   2.1 - Cota-Parte FPM",
        values: natureza.sumRS([
          filtroMDE_1("fpm"),
          filtroMDE_1("fpmExtraOrdinaria"),
        ]),
      },
      {
        name: "        2.1.1 - Parcela referente à CF. Art. 159, I, alínea B",
        values: filtroMDE_1("fpm"),
      },
      {
        name: "        2.1.2 - Parcela referente à CF. Art. 159, I, alínea D e E",
        values: filtroMDE_1("fpmExtraOrdinaria"),
      },
      {
        name: "   2.2 - Cota-Parte ICMS",
        values: filtroMDE_1("icms"),
      },
      {
        name: "   2.3 - Cota-Parte IPI-Exportação",
        values: filtroMDE_1("ipi"),
      },
      {
        name: "   2.4 - Cota-Parte ITR ",
        values: filtroMDE_1("itr"),
      },
      {
        name: "   2.5 - Cota-Parte IPVA ",
        values: filtroMDE_1("ipva"),
      },
      {
        name: "   2.6 - Cota-Parte IOF-Ouro ",
        values: filtroMDE_1("iofOuro"),
      },
      {
        name: "   2.7 - Outras Tranferências ou Compesações Financeiras Provenientes de Impostos e Transferências Constitucionais ",
        values: filtroMDE_1("outrasTransferencia"),
      },
      {
        name: "3 - TOTAL DA RECEITA RESULTANTE DE IMPOSTOS (1 + 2)",
        values: natureza.sumRS([
          filtroMDE_1("iptu"),
          filtroMDE_1("itbi"),
          filtroMDE_1("issqn"),
          filtroMDE_1("irrf"),
          filtroMDE_1("fpm"),
          filtroMDE_1("fpmExtraOrdinaria"),
          filtroMDE_1("icms"),
          filtroMDE_1("ipi"),
          filtroMDE_1("itr"),
          filtroMDE_1("ipva"),
          filtroMDE_1("iofOuro"),
          filtroMDE_1("outrasTransferencia"),
        ]),
      },
    ];

    output.receitasMDE_1.push(
      {
        name: "4 - TOTAL DESTINADO AO FUNDEB - 20% DE ((2.1.1) + (2.2) + (2.3) + (2.4) + (2.5) + (2.7))¹",
        values: [
          natureza.sumRS([
            natureza.multRS(output.receitasMDE_1[7].values[0], "0,20"),
            natureza.multRS(output.receitasMDE_1[9].values[0], "0,20"),
            natureza.multRS(output.receitasMDE_1[10].values[0], "0,20"),
            natureza.multRS(output.receitasMDE_1[11].values[0], "0,20"),
            natureza.multRS(output.receitasMDE_1[12].values[0], "0,20"),
          ]),
          natureza.sumRS([
            natureza.multRS(output.receitasMDE_1[7].values[1], "0,20"),
            natureza.multRS(output.receitasMDE_1[9].values[1], "0,20"),
            natureza.multRS(output.receitasMDE_1[10].values[1], "0,20"),
            natureza.multRS(output.receitasMDE_1[11].values[1], "0,20"),
            natureza.multRS(output.receitasMDE_1[12].values[1], "0,20"),
          ]),
          //          natureza.multRS(output.receitasMDE_1[5].values[1], "0,20"),
        ],
      },
      {
        name: "L5 - VALOR MINIMO A SER APLICADO ALÉM DO VALOR DESTINADO AO FUNDEB - 0.05% de LINHA 2",
        values: [
          //          "",
          natureza.multRS(output.receitasMDE_1[5].values[0], "0,05"),
          natureza.multRS(output.receitasMDE_1[5].values[1], "0,05"),
        ],
      },
      {
        name: "L5 - VALOR MINIMO A SER APLICADO ALÉM DO VALOR DESTINADO AO FUNDEB - 0.25% de LINHA 1",
        values: [
          natureza.multRS(output.receitasMDE_1[0].values[0], "0,25"),
          natureza.multRS(output.receitasMDE_1[0].values[1], "0,25"),
        ],
      },
      {
        name: "5 - VALOR MÍNIMO A SER APLICADO ALÉM DO VALOR DESTINADO AO FUNDEB 5% DE ((2.1.1)+(2.2)+(2.3)+(2.4)+(2.5)+(2.7)) + 25% DE (1.1)+(1.2)+(1.3)+(1.4)+(2.1.2)+(2.6))",
        values: [
          natureza.sumRS([
            natureza.multRS(output.receitasMDE_1[5].values[0], "0,05"),
            natureza.multRS(output.receitasMDE_1[0].values[0], "0,25"),
          ])[0],
          natureza.sumRS([
            natureza.multRS(output.receitasMDE_1[5].values[1], "0,05"),
            natureza.multRS(output.receitasMDE_1[0].values[1], "0,25"),
          ])[0],
        ],
      }
    );

    //-- L6 - RECEITAS COM MANUTENÇÃO E DESENVOLVIMENTO DO ENSINO - MDE--//

    const filtroMDE_6 = (rubrica) => {
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

      return [subMDE_6RecO, subMDE_6Rec];
    };

    output.receitasMDE_6 = [
      {
        name: "6 - TOTAL DAS RECEITAS DO FUNDEB RECEBIDAS",
        values: natureza.sumRS([
          filtroMDE_6("611principal"),
          filtroMDE_6("612aplicacaoFinanceira"),
          filtroMDE_6("613ressarcimentoRecursos"),
          filtroMDE_6("621principal"),
          filtroMDE_6("622aplicacaoFinanceira"),
          filtroMDE_6("623ressarcimentoRecursos"),
          filtroMDE_6("631principal"),
          filtroMDE_6("632aplicacaoFinanceira"),
          filtroMDE_6("633ressarcimentoRecursos"),
          filtroMDE_6("641principal"),
          filtroMDE_6("642aplicacaoFinanceira"),
          filtroMDE_6("643ressarcimentoRecursos"),
        ]),
      },
      {
        name: "   6.1 - FUNDEB - Impostos e Transferências de Impostos",
        values: natureza.sumRS([
          filtroMDE_6("611principal"),
          filtroMDE_6("612aplicacaoFinanceira"),
          filtroMDE_6("613ressarcimentoRecursos"),
        ]),
      },
      {
        name: "        6.1.1 - Principal",
        values: filtroMDE_6("611principal"),
      },
      {
        name: "       6.1.2 - Rendimento de Aplicação Financeira",
        values: filtroMDE_6("612aplicacaoFinanceira"),
      },
      {
        name: "       6.1.3 - Ressarcimento de Recursos do Fundeb",
        values: filtroMDE_6("613ressarcimentoRecursos"),
      },
      {
        name: "   6.2 - FUNDEB - Complementação da União - VAAF",
        values: natureza.sumRS([
          filtroMDE_6("621principal"),
          filtroMDE_6("622aplicacaoFinanceira"),
          filtroMDE_6("623ressarcimentoRecursos"),
        ]),
      },
      {
        name: "       6.2.1 - Principal",
        values: filtroMDE_6("621principal"),
      },
      {
        name: "       6.2.2 - Rendimento de Aplicação Financeira",
        values: filtroMDE_6("622aplicacaoFinanceira"),
      },
      {
        name: "       6.2.3 - Ressarcimento de Recursos do Fundeb",
        values: filtroMDE_6("623ressarcimentoRecursos"),
      },
      {
        name: "   6.3 - FUNDEB - Complemntação da União - VAAT",
        values: natureza.sumRS([
          filtroMDE_6("631principal"),
          filtroMDE_6("632aplicacaoFinanceira"),
          filtroMDE_6("633ressarcimentoRecursos"),
        ]),
      },
      {
        name: "       6.3.1 - Principal",
        values: filtroMDE_6("621principal"),
      },
      {
        name: "       6.3.2 - Rendimento de Aplicação Financeira",
        values: filtroMDE_6("622aplicacaoFinanceira"),
      },
      {
        name: "       6.3.3 - Ressarcimento de Recursos do Fundeb",
        values: filtroMDE_6("623ressarcimentoRecursos"),
      },
      {
        name: "   6.4 - FUNDEB - Complemntação da União - VAAR",
        values: natureza.sumRS([
          filtroMDE_6("641principal"),
          filtroMDE_6("642aplicacaoFinanceira"),
          filtroMDE_6("643ressarcimentoRecursos"),
        ]),
      },
      {
        name: "       6.4.1 - Principal",
        values: filtroMDE_6("641principal"),
      },
      {
        name: "       6.4.2 - Rendimento de Aplicação Financeira",
        values: filtroMDE_6("642aplicacaoFinanceira"),
      },
      {
        name: "       6.4.3 - Ressarcimento de Recursos do Fundeb",
        values: filtroMDE_6("643ressarcimentoRecursos"),
      },
    ];

    output.receitasMDE_7 = [
      {
        name: "7 - RESULTADO LÍQUIDO DAS TRANSFERÊNCIAS DO FUNDEB (6.1.1 - 4)",
        values: [
          natureza.subRS([
            natureza.sumRS([output.receitasMDE_6[2].values[0]]),
            output.receitasMDE_1[16].values[0],
          ]),
          natureza.subRS([
            natureza.sumRS([output.receitasMDE_6[2].values[1]]),
            output.receitasMDE_1[16].values[1],
          ]),
        ],
      },
    ];
    /*
    const campo8 = natureza.sum([
      {
        campo: natureza.filtrarPerm(ctb, "codOrgao", tipoOrgao3),
        toSum: "saldoFinal",
      },
    ]);

    campo1Type4.forEach((e, i) => {
      e.forEach((e, iIndex) => {
        campo1Type4[i][iIndex] = natureza.toRS(
          String(
            (
              parseInt(e.replaceAll(",", "").replaceAll(".", "") / 5) / 100
            ).toFixed(2)
          )
        );
      });
    });
*/

    //-- L10 - DESPESAS COM RECURSOS DO FUNDEB ---------//

    const filtroMDE_10 = (despesa) => {
      const { codSTN, elementoDespesa, codFuncao, codSubFuncao } =
        rub_anexo8[despesa];

      const filteredMDE_10DspO = natureza.filtrarPerm(
        dspO,
        ["codOrgao", "elementoDespesa", "codFuncao", "codSubFuncao"],
        [tipoOrgao3, elementoDespesa, codFuncao, codSubFuncao]
      );
      const filteredMDE_10Emp = natureza.filtrarPerm(
        emp,
        ["codOrgao", "codSTN", "elementoDespesa", "codFuncao", "codSubFuncao"],
        [tipoOrgao3, codSTN, elementoDespesa, codFuncao, codSubFuncao]
      );
      const filteredMDE_10Anl = natureza.filtrarPerm(
        anl,
        ["codOrgao", "codSTN", "elementoDespesa", "codFuncao", "codSubFuncao"],
        [tipoOrgao3, codSTN, elementoDespesa, codFuncao, codSubFuncao]
      );
      const filteredMDE_10Lqd = natureza.filtrarSubPerm(
        natureza.filtrarPerm(
          lqd,
          ["codOrgao", "elementoDespesa", "codFuncao", "codSubFuncao"],
          [tipoOrgao3, elementoDespesa, codFuncao, codSubFuncao]
        ),
        "11",
        "codSTN",
        codSTN
      );
      const filteredMDE_10Alq = natureza.filtrarSubPerm(
        natureza.filtrarPerm(
          alq,
          ["codOrgao", "elementoDespesa", "codFuncao", "codSubFuncao"],
          [tipoOrgao3, elementoDespesa, codFuncao, codSubFuncao]
        ),
        "11",
        "codSTN",
        codSTN
      );
      const filteredMDE_10Ops = natureza.filtrarSubPerm(
        natureza.filtrarPerm(
          ops,
          [
            "codOrgao",
            "elementoDespesa",
            "codFuncao",
            "codSubFuncao",
            "tipoOP",
          ],
          [
            tipoOrgao3,
            elementoDespesa,
            codFuncao,
            codSubFuncao,
            ["2", "3", "8"],
          ]
        ),
        "13",
        "codSTN",
        codSTN
      );
      const filteredMDE_10Aop = natureza.filtrarSubPerm(
        natureza.filtrarPerm(
          aop,
          [
            "codOrgao",
            "elementoDespesa",
            "codFuncao",
            "codSubFuncao",
            "tipoOP",
          ],
          [
            tipoOrgao3,
            elementoDespesa,
            codFuncao,
            codSubFuncao,
            ["2", "3", "8"],
          ]
        ),
        "13",
        "codSTN",
        codSTN
      );

      const subMDE_10DspO = natureza.sum([
        {
          campo: filteredMDE_10DspO,
          toSum: "recurso",
        },
      ]);
      const subMDE_10Emp = natureza.sub([
        {
          campo: filteredMDE_10Emp,
          toSub: "vlBruto",
        },
        {
          campo: filteredMDE_10Anl,
          toSub: "vlAnulacao",
        },
      ]);
      const subMDE_10Lqd = natureza.sub([
        {
          campo: filteredMDE_10Lqd,
          toSub: "vlDespesaFR",
        },
        {
          campo: filteredMDE_10Alq,
          toSub: "vlAnuladoFR",
        },
      ]);
      const subMDE_10Ops = natureza.sub([
        {
          campo: filteredMDE_10Ops,
          toSub: "vlFR",
        },
        {
          campo: filteredMDE_10Aop,
          toSub: "vlAnulacaoFR",
        },
      ]);
      return [
        subMDE_10DspO,
        subMDE_10Emp,
        subMDE_10Lqd,
        subMDE_10Ops,
        natureza.subRS([subMDE_10Emp, subMDE_10Lqd])[0].replace("-", ""),
      ];
    };

    output.despesasMDE_10 = [
      {
        name: "10 - TOTAL DAS DESPESAS COM RECURSOS DO FUNDEB",
        values: natureza.sumRS([
          filtroMDE_10("1011educacaoInfantil"),
          filtroMDE_10("1012ensinoFundamental"),
          filtroMDE_10("1013educacaoJovens"),
          filtroMDE_10("1014educacaoEspecial"),
          filtroMDE_10("1015administracaoGeral"),
          filtroMDE_10("1021educacaoInfantil"),
          filtroMDE_10("1022ensinoFundamental"),
          filtroMDE_10("1023educacaoJovens"),
          filtroMDE_10("1024educacaoEspecial"),
          filtroMDE_10("1025administracaoGeral"),
          filtroMDE_10("1026transporteEscolar"),
          filtroMDE_10("1027outras"),
        ]),
      },
      {
        name: "     10.1 - PROFISSIONAIS DA EDUCAÇÃO BÁSICA",
        values: natureza.sumRS([
          filtroMDE_10("1011educacaoInfantil"),
          filtroMDE_10("1012ensinoFundamental"),
          filtroMDE_10("1013educacaoJovens"),
          filtroMDE_10("1014educacaoEspecial"),
          filtroMDE_10("1015administracaoGeral"),
        ]),
      },
      {
        name: "            10.1.1 - Educação Infantil",
        values: filtroMDE_10("1011educacaoInfantil"),
      },
      {
        name: "            10.1.2 - Educação Fundamental",
        values: filtroMDE_10("1012ensinoFundamental"),
      },
      {
        name: "            10.1.3 - Educação de Jovens e Adultos",
        values: filtroMDE_10("1013educacaoJovens"),
      },
      {
        name: "            10.1.4 - Educação Especial",
        values: filtroMDE_10("1014educacaoEspecial"),
      },
      {
        name: "            10.1.5 - Administração Geral",
        values: filtroMDE_10("1015administracaoGeral"),
      },
      {
        name: "     10.2 - OUTRAS DESPESAS",
        values: natureza.sumRS([
          filtroMDE_10("1021educacaoInfantil"),
          filtroMDE_10("1022ensinoFundamental"),
          filtroMDE_10("1023educacaoJovens"),
          filtroMDE_10("1024educacaoEspecial"),
          filtroMDE_10("1025administracaoGeral"),
          filtroMDE_10("1026transporteEscolar"),
          filtroMDE_10("1027outras"),
        ]),
      },
      {
        name: "            10.2.1 - Educação Infantil",
        values: filtroMDE_10("1021educacaoInfantil"),
      },
      {
        name: "            10.2.2 - Ensino Fundamental",
        values: filtroMDE_10("1022ensinoFundamental"),
      },
      {
        name: "            10.2.3 - Educação de Jovens e Adultos",
        values: filtroMDE_10("1023educacaoJovens"),
      },
      {
        name: "            10.2.4 - Educação Especial",
        values: filtroMDE_10("1024educacaoEspecial"),
      },
      {
        name: "            10.2.5 - Administração Geral",
        values: filtroMDE_10("1025administracaoGeral"),
      },
      {
        name: "            10.2.6 - Transporte (Escolar)",
        values: filtroMDE_10("1026transporteEscolar"),
      },
      {
        name: "            10.2.7 - Outras",
        values: filtroMDE_10("1027outras"),
      },
    ];

    //-- L11 - DESPESAS CUSTEADAS COM RECEITAS DO FUNDEB RECEBIDAS NO EXERCICIO--//

    const filtroMDE_11 = (despesa) => {
      const { codSTN, elementoDespesa } = rub_anexo8[despesa];

      const filteredMDE_11Emp = natureza.filtrarPerm(
        emp,
        ["codOrgao", "codSTN", "elementoDespesa"],
        [tipoOrgao3, codSTN, elementoDespesa]
      );
      const filteredMDE_11Anl = natureza.filtrarPerm(
        anl,
        ["codOrgao", "codSTN", "elementoDespesa"],
        [tipoOrgao3, codSTN, elementoDespesa]
      );
      const filteredMDE_11Lqd = natureza.filtrarSubPerm(
        natureza.filtrarPerm(
          lqd,
          ["codOrgao", "elementoDespesa"],
          [tipoOrgao3, elementoDespesa]
        ),
        "11",
        "codSTN",
        codSTN
      );
      const filteredMDE_11Alq = natureza.filtrarSubPerm(
        natureza.filtrarPerm(
          alq,
          ["codOrgao", "elementoDespesa"],
          [tipoOrgao3, elementoDespesa]
        ),
        "11",
        "codSTN",
        codSTN
      );
      const filteredMDE_11Ops = natureza.filtrarSubPerm(
        natureza.filtrarPerm(
          ops,
          ["codOrgao", "elementoDespesa", "tipoOP"],
          [tipoOrgao3, elementoDespesa, ["2", "3", "8"]]
        ),
        "13",
        "codSTN",
        codSTN
      );
      const filteredMDE_11Aop = natureza.filtrarSubPerm(
        natureza.filtrarPerm(
          aop,
          ["codOrgao", "elementoDespesa", "tipoOP"],
          [tipoOrgao3, elementoDespesa, ["2", "3", "8"]]
        ),
        "13",
        "codSTN",
        codSTN
      );

      const subMDE_11Emp = natureza.sub([
        {
          campo: filteredMDE_11Emp,
          toSub: "vlBruto",
        },
        {
          campo: filteredMDE_11Anl,
          toSub: "vlAnulacao",
        },
      ]);
      const subMDE_11Lqd = natureza.sub([
        {
          campo: filteredMDE_11Lqd,
          toSub: "vlDespesaFR",
        },
        {
          campo: filteredMDE_11Alq,
          toSub: "vlAnuladoFR",
        },
      ]);
      const subMDE_11Ops = natureza.sub([
        {
          campo: filteredMDE_11Ops,
          toSub: "vlFR",
        },
        {
          campo: filteredMDE_11Aop,
          toSub: "vlAnulacaoFR",
        },
      ]);
      return [
        subMDE_11Emp,
        subMDE_11Lqd,
        subMDE_11Ops,
        natureza.subRS([subMDE_11Emp, subMDE_11Lqd])[0].replace("-", ""),
        "0,00",
        "0,00",
      ];
    };

    output.despesasMDE_11 = [
      {
        name: "11 - TOTAL DAS DESPESAS CUSTEADAS COM RECURSOS DO FUNDEB RECEBIDAS NO EXERCÍCIO",
        values: natureza.sumRS([
          filtroMDE_11("1111totalDespesasCusteadasFundeb"),
          filtroMDE_11("1112totalDespesasCusteadasFundebVAAF"),
          filtroMDE_11("1113totalDespesasCusteadasFundebVAAT"),
          filtroMDE_11("1114totalDespesasCusteadasFundebVAAR"),
        ]),
      },
      {
        name: "     11.1 - Total das Despesas custeadas com FUNDEB - Impostos e Transferências de Impostos",
        values: filtroMDE_11("1111totalDespesasCusteadasFundeb"),
      },
      {
        name: "     11.2 - Total das Despesas custeadas com FUNDEB - Complementação da União - VAAF",
        values: filtroMDE_11("1112totalDespesasCusteadasFundebVAAF"),
      },
      {
        name: "     11.3 - Total das Despesas custeadas com FUNDEB - Complementação da União - VAAT",
        values: filtroMDE_11("1113totalDespesasCusteadasFundebVAAT"),
      },
      {
        name: "     11.4 - Total das Despesas custeadas com FUNDEB - Complementação da União - VAAT",
        values: filtroMDE_11("1114totalDespesasCusteadasFundebVAAR"),
      },
      {
        name: "12 - TOTAL DAS DESPESAS DO FUNDEB COM PROFISSIONAIS DA EDUCAÇÃO BÁSICA",
        values: filtroMDE_11("12totalDespesasFundebComProfissionais"),
      },
      {
        name: "13 - TOTAL DAS DESPESAS CUSTEADAS COM FUNDEB - COMPLEMENTO DA UNIÃO VAAT APLICADAS NA EDUCAÇÃO INFANTIL",
        values: filtroMDE_11("13totalDespesasCusteadasFundebVAAT"),
      },
      {
        name: "14 - TOTAL DAS DESPEAS CUSTEADAS COM FUNDEB - COMPLEMENTO DA UNIÃO - VAAT APLICADAS EM DESPESA DE CAPITAL",
        values: filtroMDE_11("14totalDespesasFundebCapitalVAAT"),
      },
    ];

    output.despesasMDE_15 = [
      {
        name: "15 - MÍNIMO DE 70% DO FUNDEB NA REMUNERAÇÃO DOS PROFISSIONAIS DA EDUCAÇÃO BÁSICA",
        values: [
          natureza.multRS(
            natureza.subRS([
              output.receitasMDE_6[0].values[1],
              output.receitasMDE_6[13].values[1],
            ])[0],
            "0,70"
          ),
          output.despesasMDE_11[5].values[1],
          natureza.subRS([
             output.despesasMDE_11[5].values[1],
             output.despesasMDE_11[5].values[3],
          ])[0],
 // ver com ISAC          
          natureza.multRS(
               natureza.subRS([
                 output.despesasMDE_11[5].values[1],
                 output.despesasMDE_11[5].values[3],
               ])[0],
               natureza.multRS(
                 natureza.subRS([
                   output.receitasMDE_6[0].values[1],
                   output.receitasMDE_6[13].values[1],
                 ])[0],
                 "0,70"
                )[0],
                true
              ),
        ],
      },
      {
        name: "16 - PERCENTUAL DA COMPLEMENTAÇÃO DA UNIÃO AO FUNDEB - VAAT NA EDUCAÇÃO INFANTIL (INDICADOR IEI)",
        values: ["0,00", "0,00", "0,00", "0,00"],
      },
      {
        name: "17 - MÍNIMO DE 15% DA COMPLEMENTAÇÃO DA UNIÃO AO FUNDEB - VAAT EM DESPESAS DE CAPITAL",
        values: ["0,00", "0,00", "0,00", "0,00"],
      },
    ];

    output.despesasMDE_18 = [
      {
        name: "18 - TOTAL DA RECEITA RECEBIDA E NÃO APLICADA NO EXERCÍCIO",
        values: [
          natureza.multRS(output.receitasMDE_6[0].values[1], "0,10"),
          natureza.subRS([
            output.receitasMDE_6[0].values[1],
            output.despesasMDE_11[5].values[1],
          ]),
          natureza.subRS([
            output.receitasMDE_6[0].values[1],
            output.despesasMDE_11[5].values[1],
          ]),
        ],
      },
    ];

    output.despesasMDE_18[0].values.push(
      natureza.subRS([
        output.despesasMDE_18[0].values[1],
        output.despesasMDE_18[0].values[1],
      ]),
      natureza.divRS(
        output.despesasMDE_18[0].values[2],
        [output.receitasMDE_6[0].values[1]],
        true
      )[0] + "%"
    );

    output.despesasMDE_19 = [
      {
        name: "19 - TOTAL DAS DESPESAS CUSTEADAS COM SUPERÁVIT DO FUNDEB",
        values: ["0,00", "0,00", "0,00", "0,00"],
      },
      {
        name: "   19.1 - Total das Despesas custeadas com FUNDEB - Impostos e Transferências de Impostos",
        values: ["0,00", "0,00", "0,00", "0,00"],
      },
      {
        name: "   19.2 - Total das Despesas custeadas com FUNDEB - Complementação da União(VAAF + VAAT + VAAR)",
        values: ["0,00", "0,00", "0,00", "0,00"],
      },
    ];

    //-- L20 - DESPESAS COM MDE EXCETO CUSTEADAS COM RECEITAS DO FUNDEB ---------//
/*
    const filtroMDE_20 = (despesa) => {
      const { codSTN, elementoDespesa, codFuncao, codSubFuncao } = rub_anexo8[despesa];

      const filteredMDE_20DspO = natureza.filtrarPerm(
        dspO,
        ["codOrgao", "elementoDespesa", "codFuncao", "codSubFuncao"],
        [tipoOrgao3, elementoDespesa, codFuncao, codSubFuncao]
      );
      const filteredMDE_20Emp = natureza.filtrarPerm(
        emp,
        ["codOrgao", "codSTN", "elementoDespesa", "codFuncao", "codSubFuncao"],
        [tipoOrgao3, codSTN, elementoDespesa, codFuncao, codSubFuncao]
      );
      const filteredMDE_20Anl = natureza.filtrarPerm(
        anl,
        ["codOrgao", "codSTN", "elementoDespesa", "codFuncao", "codSubFuncao"],
        [tipoOrgao3, codSTN, elementoDespesa, codFuncao, codSubFuncao]
      );
      const filteredMDE_20Lqd = natureza.filtrarSubPerm(
        natureza.filtrarPerm(
          lqd,
          ["codOrgao", "elementoDespesa", "codFuncao", "codSubFuncao"],
          [tipoOrgao3, elementoDespesa, codFuncao, codSubFuncao]
        ),
        "11",
        "codSTN",
        codSTN
      );
      const filteredMDE_20Alq = natureza.filtrarSubPerm(
        natureza.filtrarPerm(
          alq,
          ["codOrgao", "elementoDespesa", "codFuncao", "codSubFuncao"],
          [tipoOrgao3, elementoDespesa, codFuncao, codSubFuncao]
        ),
        "11",
        "codSTN",
        codSTN
      );
      const filteredMDE_20Ops = natureza.filtrarSubPerm(
        natureza.filtrarPerm(
          ops,
          [
            "codOrgao",
            "elementoDespesa",
            "codFuncao",
            "codSubFuncao",
            "tipoOP",
          ],
          [
            tipoOrgao3,
            elementoDespesa,
            codFuncao,
            codSubFuncao,
            ["2", "3", "8"],
          ]
        ),
        "13",
        "codSTN",
        codSTN
      );
      const filteredMDE_20Aop = natureza.filtrarSubPerm(
        natureza.filtrarPerm(
          aop,
          [
            "codOrgao",
            "elementoDespesa",
            "codFuncao",
            "codSubFuncao",
            "tipoOP",
          ],
          [
            tipoOrgao3,
            elementoDespesa,
            codFuncao,
            codSubFuncao,
            ["2", "3", "8"],
          ]
        ),
        "13",
        "codSTN",
        codSTN
      );

      const subMDE_20DspO = natureza.sum([
        {
          campo: filteredMDE_20DspO,
          toSum: "recurso",
        },
      ]);
      const subMDE_20Emp = natureza.sub([
        {
          campo: filteredMDE_20Emp,
          toSub: "vlBruto",
        },
        {
          campo: filteredMDE_20Anl,
          toSub: "vlAnulacao",
        },
      ]);
      const subMDE_20Lqd = natureza.sub([
        {
          campo: filteredMDE_20Lqd,
          toSub: "vlDespesaFR",
        },
        {
          campo: filteredMDE_20Alq,
          toSub: "vlAnuladoFR",
        },
      ]);
      const subMDE_20Ops = natureza.sub([
        {
          campo: filteredMDE_20Ops,
          toSub: "vlFR",
        },
        {
          campo: filteredMDE_20Aop,
          toSub: "vlAnulacaoFR",
        },
      ]);
      return [
        subMDE_20DspO,
        subMDE_20Emp,
        subMDE_20Lqd,
        subMDE_20Ops,
        natureza.subRS([subMDE_20Emp, subMDE_20Lqd])[0].replace("-", ""),
      ];
    };

    output.despesasMDE_20 = [
      {
        name: "            20.1 - Educação Infantil",
        values: filtroMDE_20("201educacaoInfantil"),
      },
    ];





    const filtroMDE_20 = (despesa) => {
      const codFuncaoMDE_20 = rub_anexo8[despesa].map((e) => e.codFuncao || "");
      const codSubFuncaoMDE_20 = rub_anexo8[despesa].map(
        (e) => e.codSubFuncao || ""
      );

      const filteredMDE_20DspO = natureza.filtrarPerm(
        dspO,
        ["codOrgao", "codFuncao", "codSubFuncao"],
        [tipoOrgao14, codFuncaoMDE_20, codSubFuncaoMDE_20]
      );
      const filteredMDE_20Emp = natureza.filtrarPerm(
        emp,
        ["codOrgao", "codFuncao", "codSubFuncao"],
        [tipoOrgao14, codFuncaoMDE_20, codSubFuncaoMDE_20]
      );
      const filteredMDE_20Anl = natureza.filtrarPerm(
        anl,
        ["codOrgao", "codFuncao", "codSubFuncao"],
        [tipoOrgao14, codFuncaoMDE_20, codSubFuncaoMDE_20]
      );
      const filteredMDE_20Lqd = natureza.filtrarPerm(
        lqd,
        ["codOrgao", "codFuncao", "codSubFuncao"],
        [tipoOrgao14, codFuncaoMDE_20, codSubFuncaoMDE_20]
      );
      const filteredMDE_20Alq = natureza.filtrarPerm(
        alq,
        ["codOrgao", "codFuncao", "codSubFuncao"],
        [tipoOrgao14, codFuncaoMDE_20, codSubFuncaoMDE_20]
      );
      const filteredMDE_20Ops = natureza.filtrarPerm(
        ops,
        ["tipoOP", "codOrgao", "codFuncao", "codSubFuncao"],
        [["2"], tipoOrgao14, codFuncaoMDE_20, codSubFuncaoMDE_20]
      );
      const filteredMDE_20Aop = natureza.filtrarPerm(
        aop,
        ["codOrgao", "codFuncao", "codSubFuncao"],
        [tipoOrgao14, codFuncaoMDE_20, codSubFuncaoMDE_20]
      );

      const subMDE_20DspO = natureza.sum([
        {
          campo: filteredMDE_20DspO,
          toSum: "recurso",
        },
      ]);
      const subMDE_20Emp = natureza.sub([
        {
          campo: filteredMDE_20Emp,
          toSub: "vlBruto",
        },
        {
          campo: filteredMDE_20Anl,
          toSub: "vlAnulacao",
        },
      ]);
      const subMDE_20Lqd = natureza.sub([
        {
          campo: filteredMDE_20Lqd,
          toSub: "vlLiquidado",
        },
        {
          campo: filteredMDE_20Alq,
          toSub: "vlAnulado",
        },
      ]);
      const subMDE_20Ops = natureza.sub([
        {
          campo: filteredMDE_20Ops,
          toSub: "vlOP",
        },
        {
          campo: filteredMDE_20Aop,
          toSub: "vlAnuladoOP",
        },
      ]);
      return [
        subMDE_20DspO,
        subMDE_20Emp,
        subMDE_20Lqd,
        subMDE_20Ops,
        natureza.subRS([subMDE_20Emp, subMDE_20Lqd])[0],
      ];
    };

    output.despesasMDE_20 = [
      {
        name: "20 - TOTAL DAS DESPESAS COM AÇÕES TÍPICAS DE MDE CUSTEADAS COM RECEITAS DE IMPOSTOS",
        values: natureza.sumRS([
          filtroMDE_20("201educacaoInfantil"),
          filtroMDE_20("202ensinoFundamental"),
          filtroMDE_20("203educacaoJovens"),
          filtroMDE_20("204educacaoEspecial"),
          filtroMDE_20("205administracaoGeral"),
          filtroMDE_20("206transporteEscolar"),
          filtroMDE_20("207outras"),
        ]),
      },
      {
        name: "    20.1 - Educação Infantil",
        values: filtroMDE_20("201educacaoInfantil"),
      },
      {
        name: "    20.2 - Ensino Fundamental",
        values: filtroMDE_20("202ensinoFundamental"),
      },
      {
        name: "    20.3 - Educação de Jovens e Adultos",
        values: filtroMDE_20("203educacaoJovens"),
      },
      {
        name: "    20.4 - Educação Especial",
        values: filtroMDE_20("204educacaoEspecial"),
      },
      {
        name: "    20.5 - Administração Geral",
        values: filtroMDE_20("205administracaoGeral"),
      },
      {
        name: "    20.6 - Transporte (Escolar)",
        values: filtroMDE_20("206transporteEscolar"),
      },
      {
        name: "    20.7 - Outras",
        values: filtroMDE_20("207outras"),
      },
    ];
*/
    //-- L21 - DESPESAS COM MDE CUSTEADAS COM RECEITAS DE IMPOSTOS E COM RECURSOS DO FUNDEB--//
/*
    const filtroMDE_21 = (despesa) => {
      const codFuncaoMDE_21 = rub_anexo8[despesa].map((e) => e.codFuncao || "");
      const codSubFuncaoMDE_21 = rub_anexo8[despesa].map(
        (e) => e.codSubFuncao || ""
      );

      const filteredMDE_21DspO = natureza.filtrarPerm(
        dspO,
        ["codOrgao", "codFuncao", "codSubFuncao"],
        [tipoOrgao3, codFuncaoMDE_21, codSubFuncaoMDE_21]
      );
      const filteredMDE_21Emp = natureza.filtrarPerm(
        emp,
        ["codOrgao", "codFuncao", "codSubFuncao"],
        [tipoOrgao3, codFuncaoMDE_21, codSubFuncaoMDE_21]
      );
      const filteredMDE_21Anl = natureza.filtrarPerm(
        anl,
        ["codOrgao", "codFuncao", "codSubFuncao"],
        [tipoOrgao3, codFuncaoMDE_21, codSubFuncaoMDE_21]
      );
      const filteredMDE_21Lqd = natureza.filtrarPerm(
        lqd,
        ["codOrgao", "codFuncao", "codSubFuncao"],
        [tipoOrgao3, codFuncaoMDE_21, codSubFuncaoMDE_21]
      );
      const filteredMDE_21Alq = natureza.filtrarPerm(
        alq,
        ["codOrgao", "codFuncao", "codSubFuncao"],
        [tipoOrgao3, codFuncaoMDE_21, codSubFuncaoMDE_21]
      );
      const filteredMDE_21Ops = natureza.filtrarPerm(
        ops,
        ["tipoOP", "codOrgao", "codFuncao", "codSubFuncao"],
        [["2"], tipoOrgao3, codFuncaoMDE_21, codSubFuncaoMDE_21]
      );
      const filteredMDE_21Aop = natureza.filtrarPerm(
        aop,
        ["codOrgao", "codFuncao", "codSubFuncao"],
        [tipoOrgao3, codFuncaoMDE_21, codSubFuncaoMDE_21]
      );

      const subMDE_21DspO = natureza.sum([
        {
          campo: filteredMDE_21DspO,
          toSum: "recurso",
        },
      ]);
      const subMDE_21Emp = natureza.sub([
        {
          campo: filteredMDE_21Emp,
          toSub: "vlBruto",
        },
        {
          campo: filteredMDE_21Anl,
          toSub: "vlAnulacao",
        },
      ]);
      const subMDE_21Lqd = natureza.sub([
        {
          campo: filteredMDE_21Lqd,
          toSub: "vlLiquidado",
        },
        {
          campo: filteredMDE_21Alq,
          toSub: "vlAnulado",
        },
      ]);
      const subMDE_21Ops = natureza.sub([
        {
          campo: filteredMDE_21Ops,
          toSub: "vlOP",
        },
        {
          campo: filteredMDE_21Aop,
          toSub: "vlAnuladoOP",
        },
      ]);
      return [
        subMDE_21DspO,
        subMDE_21Emp,
        subMDE_21Lqd,
        subMDE_21Ops,
        natureza.subRS([subMDE_21Emp, subMDE_21Lqd])[0],
      ];
    };

    output.despesasMDE_21 = [
      {
        name: "21 - TOTAL DAS DESPESAS COM AÇÕES TÍPICAS DE MDE CUSTEADAS COM RECEITAS DE IMPOSTOS E FUNDEB",
        values: natureza.sumRS([
          filtroMDE_21("201educacaoInfantil"),
          filtroMDE_21("201educacaoInfantil"),
          filtroMDE_21("202ensinoFundamental"),
        ]),
      },
      {
        name: "    21.1 - EDUCAÇÃO INFANTIL",
        values: natureza.sumRS([
          filtroMDE_21("201educacaoInfantil"),
          filtroMDE_21("202ensinoFundamental"),
        ]),
      },
      {
        name: "          21.1.1 - CRECHE",
        values: filtroMDE_21("201educacaoInfantil"),
      },
      {
        name: "          21.1.2 - PRÉ-ESCOLA",
        values: filtroMDE_21("201educacaoInfantil"),
      },
      {
        name: "    21.2 - ENSINO FUNDAMENTAL",
        values: filtroMDE_21("202ensinoFundamental"),
      },
    ];

    //-- L22 - APURAÇÃO DAS DESPESAS PARA FINS DE LIMITE MÍNIMO CONSTITUCIONAL --//

    output.despesasMDE_22 = [
      {
        name: "22 - TOTAL DAS DESPESAS DE MDE CUSTEADAS COM RECURSOS DE IMPOSTOS = L20(d ou e)",
        values: [natureza.sumRS([output.despesasMDE_20[0].values[2]])],
      },
      {
        name: "23 - TOTAL DAS RECEITAS TRANSFERIDAS AO FUNDEB = (L4)",
        values: [natureza.sumRS([output.receitasMDE_1[16].values[1]])],
      },
      {
        name: "24 - (-) RECEITA DO FUNDEB NÃO UTILIZADAS NO EXERCÍCIO, EM VALOR SUPERIOR A 10% = L18(q)",
        values: [natureza.sumRS([output.despesasMDE_18[0].values[3]])],
      },
      {
        name: "25 - (-) SUPERÁVIT PERMITIDO NO EXERCÍCIO IMEDIATAMENTE ANTERIOR NÃO APLICADO ATÉ O PRIMEIRO QUADRIMESTRE DO EXERCÍCIO ATUAL = L19.1(x)",
        values: ["0,00"],
      },
      {
        name: "26 - (-) RESTOS A PAGAR NÃO PROCESSADOS INSCRITOS NO EXERCÍCIO SEM DISPONIBILIDADE FINANCEIRA DE RECURSOS DE IMPOSTOS",
        values: ["0,00"],
      },
      {
        name: "27 - (-) CANCELAMENTO, NO EXERCÍCIO, DE RESTOS A PAGAR INSCRITOS COM DISPONILIDADE FINANCEIRA DE RECURSOS DE IMPOSTOS VINCULADOS AO ENSINO = (L30.1(af))",
        values: ["0,00"],
      },
    ];

    output.despesasMDE_28 = [
      {
        name: "28 - TOTAL DAS DESPESAS PARA FINS DE LIMITE (22 + 23 - 24 - 25 - 26 27)",
        values: [
          natureza.subRS([
            natureza.sumRS([
              output.despesasMDE_22[0].values[0],
              output.despesasMDE_22[1].values[0],
            ]),
            output.despesasMDE_22[2].values[0],
          ]),
        ],
      },
    ];

    //-- L29 - APURAÇÃO DO LIMITE MÍNIMO CONSTITUCIONAL --//

    output.despesasMDE_29 = [
      {
        name: "29 - APLICAÇÃO EM MDE SOBRE A RECEITA RESULTANTE DE IMPOSTOS",
        values: [
          natureza.multRS(output.receitasMDE_1[15].values[1], "0,25"),
          natureza.sumRS([output.despesasMDE_28[0].values[0]]),
        ],
      },
    ];
    // -- LINHA 29 - CALCULA O PERCENTUAL APLICADO

    output.despesasMDE_29[0].values.push(
      natureza.divRS(
        output.despesasMDE_28[0].values[0],
        [output.receitasMDE_1[15].values[1]],
        true
      )[0] + "%"
    );

    //-- L30 - RESTOS A PAGAR INSCRITOS EM EXERCÍCIOS ANTERIORES DE DESPESAS CONSIDERADAS PARA CUMPRIMENTO DO LIMITE 8 --//

    output.despesasMDE_30 = [
      {
        name: "30 - RESTOS A PAGAR DE DESPESAS COM MDE",
        values: ["0,00", "0,00", "0,00", "0,00", "0,00"],
      },
      {
        name: "     30.1 - EXECUTADAS COM RECURSOS DE IMPOSTOS E TRANSFERÊNCIAS DE IMPOSTOS",
        values: ["0,00", "0,00", "0,00", "0,00", "0,00"],
      },
      {
        name: "     30.2 - EXECUTADAS COM RECURSOS DO FUNDEB - IMPOSTOS",
        values: ["0,00", "0,00", "0,00", "0,00", "0,00"],
      },
      {
        name: "     30.3 - EXECUTADAS COM RECURSOS DO FUNDEB - COMPLEMENTAÇÃO DA UNIÃO (VAAT + VAAF + VAAR)",
        values: ["0,00", "0,00", "0,00", "0,00", "0,00"],
      },
    ];

    //-- L1 A L5 - RECEITAS COM MANUTENÇÃO E DESENVOLVIMENTO DO ENSINO - MDE--//
    //     /*
        const orgaoCampo31 = await db("orgao").select("*");

    const tipoOrgao31 = orgaoCampo31
      .filter((orgao) => orgao.content.tipoOrgao === "14")
      .map((orgao) => orgao.content.codOrgao);
      const filtroMDE_31 = (rubrica) => {
        const filteredMDE_31RecO = natureza.filtrarPerm(
        natureza.filtrarPerm(recO, "codOrgao", tipoOrgao14),
        "rubrica",
        rub_anexo8[rubrica]
      );
      const filteredMDE_31Rec = natureza.filtrarPerm(
        natureza.filtrarPerm(rec, "codOrgao", tipoOrgao14),
        "rubrica",
        rub_anexo8[rubrica]
      );
      const filteredMDE_31Are = natureza.filtrarPerm(
        natureza.filtrarPerm(are, "codOrgao", tipoOrgao14),
        "rubrica",
        rub_anexo8[rubrica]
      );
      
      const subMDE_31RecO = natureza.sum([
        {
          campo: filteredMDE_31RecO,
          toSum: "vlPrevisto",
        },
      ]);

      const subMDE_31Rec = natureza.sub([
        {
          campo: filteredMDE_31Rec,
          toSub: "vlArrecadado",
        },
        {
          campo: filteredMDE_31Are,
          toSub: "vlAnulacao",
        },
      ]);

      return [subMDE_31RecO, subMDE_31Rec];
    };

    output.receitasMDE_31 = [
      {
        name: "31.1.1 - Salário-Educação",
        values: filtroMDE_31("3111salarioEducacao"),
      },
    ];
 */
    
    return res.status(200).json({
      output: output,
      data37: String(parseInt(natureza.dataToYear(dataI)) - 1),
    });
  } catch (error) {
    console.error("error at getRreoAnexo8 from controller.anexo.8", error);
    return res.status(500).json({ message: "Internal server error." });
  }
}

export default { getRreoAnexo };
