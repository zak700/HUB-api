import { db } from "../../database/postgres.js";
import natureza from "../../helpers/natureza.js";

async function Inserir(req, res) {
  try {
    const emp = req.body;

    await db("emp").insert(emp);

    return res.status(200).json({ message: "ok" });
  } catch (error) {
    console.error(
      "error from Inserir function from /controllers/controller.emp.js",
      error,
    );
    return res.status(500).json({ message: "Internal server error." });
  }
}

async function InserirEmp(req, res) {
  const { text, data, codOrgao, sch } = req.body;

  const emp = [];
  const orgao = (await db(`${req.body.sch}.orgao`).select("*")).filter(
    (e) =>
      e.content.dtInicio.substring(4) === String(natureza.dataToYear(data)),
  );

  const orgaoTypes = {};

  orgao.forEach((org) => {
    const content = org.content;
    orgaoTypes[content.codOrgao] = content.tipoOrgao;
  });

  try {
    const lines = await text.split("\n");

    let dataHelper = -1;

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];

      if (line.slice(0, 2) !== "99") {
        if (line.substring(0, 2) === "10") {
          dataHelper++;
          emp.push({
            data,
            content: {
              tipoRegistro: line.slice(0, 2).trim(),
              codPrograma: line.slice(2, 6).trim(),
              codOrgao,
              codUnidade: line.slice(8, 10).trim(),
              codFuncao: line.slice(10, 12).trim(),
              codSubFuncao: line.slice(12, 15).trim(),
              naturezaAcao: line.slice(15, 16).trim(),
              nroProjAtiv: line.slice(16, 19).trim(),
              elementoDespesa: line.slice(19, 25).trim(),
              subElemento: line.slice(25, 27).trim(),
              nroEmpenho: line.slice(27, 33).trim(),
              modalidadeLicitacao: line.slice(33, 35).trim(),
              fundamentacaoLegal: line.slice(35, 37).trim(),
              justificativaDispensaInexibilidade: line.slice(37, 250).trim(),
              razaoEscolha: line.slice(250, 532).trim(),
              nroProcLicitacao: line.slice(532, 540).trim(),
              anoProcLicitacao: line.slice(540, 544).trim(),
              nroProcAdmCorrespondente: line.slice(544, 564).trim(),
              nroInstrumentoContrato: line.slice(564, 567).trim(),
              assunto: line.slice(567, 569).trim(),
              tpEmpenho: line.slice(569, 571).trim(),
              dtEmpenho: line.slice(571, 579).trim(),
              vlBruto: line.slice(579, 592).trim(),
              nomeCredor: line.slice(592, 642).trim(),
              tipoCredor: line.slice(642, 643).trim(),
              cpfCnpj: line.slice(643, 657).trim(),
              especificacaoEmpenho: line.slice(657, 912).trim(),
              cpfRespEmpenho: line.slice(912, 923).trim(),
              nomeRespEmpenho: line.slice(923, 958).trim(),
              idColare: line.slice(958, 973).trim(),
              nroSequencial: line.slice(973, 979).trim(),
              content: [],
            },
          });
        } else if (line.substring(0, 2) === "11") {
          if (
            emp[dataHelper] &&
            emp[dataHelper].content &&
            Array.isArray(emp[dataHelper].content.content)
          ) {
            emp[dataHelper].content.content.push({
              tipoRegistro: line.slice(0, 2).trim(),
              codPrograma: line.slice(2, 6).trim(),
              codOrgao: line.slice(6, 8),
              codUnidade: line.slice(8, 10).trim(),
              codFuncao: line.slice(10, 12).trim(), // FS (junção)
              codSubFuncao: line.slice(12, 15).trim(), // FS (junção)
              naturezaAcao: line.slice(15, 16).trim(),
              nroProjAtiv: line.slice(16, 19).trim(),
              elementoDespesa: line.slice(19, 25).trim(),
              subElemento: line.slice(25, 27).trim(),
              contaDeb: "nan", // conta pra filtrar
              contaCred: "nan",
              elementoDespesaMSC: "nan", // ND (junção)
              subElementoMSC: "nan", // ND (junção)
              nroEmpenho: line.slice(27, 33).trim(), // chave
              codFontRecursos: line.slice(33, 39).trim(),
              codFontRecursosMSC: "nan", // FR
              poderOrgao: "nan", // PO
              codAEO: "nan", // CO
              ficha: "nan",
              vlRecurso: line.slice(39, 52).trim(),
              nroSequencial: line.slice(973, 979).trim(),
            });
          }
        } else if (line.substring(0, 2) === "12") {
          if (
            emp[dataHelper] &&
            emp[dataHelper].content &&
            Array.isArray(emp[dataHelper].content.content)
          ) {
            emp[dataHelper].content.content.push({
              tipoRegistro: line.slice(0, 2).trim(),
              codPrograma: line.slice(2, 6).trim(),
              codOrgao: line.slice(6, 8),
              codUnidade: line.slice(8, 10).trim(),
              codFuncao: line.slice(10, 12).trim(),
              codSubFuncao: line.slice(12, 15).trim(),
              naturezaAcao: line.slice(15, 16).trim(),
              nroProjAtiv: line.slice(16, 19).trim(),
              elementoDespesa: line.slice(19, 25).trim(),
              subElemento: line.slice(25, 27).trim(),
              nroEmpenho: line.slice(27, 33).trim(),
              codUnidadeObra: line.slice(33, 35).trim(),
              codObra: line.slice(35, 39).trim(),
              anoObra: line.slice(39, 43).trim(),
              vlAssociadoObra: line.slice(43, 56).trim(),
              nroSequencial: line.slice(973, 979).trim(),
            });
          }
        } else if (line.substring(0, 2) === "13") {
          if (
            emp[dataHelper] &&
            emp[dataHelper].content &&
            Array.isArray(emp[dataHelper].content.content)
          ) {
            emp[dataHelper].content.content.push({
              tipoRegistro: line.slice(0, 2).trim(),
              codPrograma: line.slice(2, 6).trim(),
              codOrgao: line.slice(6, 8),
              codUnidade: line.slice(8, 10).trim(),
              codFuncao: line.slice(10, 12).trim(),
              codSubFuncao: line.slice(12, 15).trim(),
              naturezaAcao: line.slice(15, 16).trim(),
              nroProjAtiv: line.slice(16, 19).trim(),
              elementoDespesa: line.slice(19, 25).trim(),
              subElemento: line.slice(25, 27).trim(),
              nroEmpenho: line.slice(27, 33).trim(),
              codUnidadeContrato: line.slice(33, 35).trim(),
              nroContrato: line.slice(35, 55).trim(),
              anoContrato: line.slice(55, 59).trim(),
              tipoAjuste: line.slice(59, 60).trim(),
              vlAssociadoContrato: line.slice(60, 73).trim(),
              idColare: line.slice(73, 88).trim(),
              nroSequencial: line.slice(973, 979).trim(),
            });
          }
        } else if (line.substring(0, 2) === "14") {
          if (
            emp[dataHelper] &&
            emp[dataHelper].content &&
            Array.isArray(emp[dataHelper].content.content)
          ) {
            emp[dataHelper].content.content.push({
              tipoRegistro: line.slice(0, 2).trim(),
              codPrograma: line.slice(2, 6).trim(),
              codOrgao: line.slice(6, 8),
              codUnidade: line.slice(8, 10).trim(),
              codFuncao: line.slice(10, 12).trim(),
              codSubFuncao: line.slice(12, 15).trim(),
              naturezaAcao: line.slice(15, 16).trim(),
              nroProjAtiv: line.slice(16, 19).trim(),
              elementoDespesa: line.slice(19, 25).trim(),
              subElemento: line.slice(25, 27).trim(),
              nroEmpenho: line.slice(27, 33).trim(),
              cpfCnpjCredor: line.slice(33, 47).trim(),
              tipoCredor: line.slice(47, 48).trim(),
              nomeCredor: line.slice(48, 98).trim(),
              vlAssociadoCredor: line.slice(98, 111).trim(),
              nroSequencial: line.slice(973, 979).trim(),
            });
          }
        }
      }
    }

    emp.forEach((empValue, empIndex) => {
      const tipo10 = empValue.content;

      if (orgaoTypes[tipo10.codOrgao]) {
        emp[empIndex].content.tipoOrgao = orgaoTypes[tipo10.codOrgao];
      } else {
        // console.log("Erro por falta de orgão !");
        return res.status(404).json({
          message:
            "É obrigatório que o orgão correspondente seja adicionado antes do empenho !",
        });
      }

      if (tipo10.tipoRegistro != "99") {
        tipo10.content.forEach((tipo11, tipo11Index) => {
          if (tipo11.tipoRegistro === "11") {
            let codFontRecursosMSC = "nan";
            let poderOrgao = "nan";
            let codAEO = "nan";
            let ficha = "nan";
            // 03 - PREFEITURA MUNICIPAL DE SENADOR CANEDO
            if (tipo11.codOrgao === "03") {
              if (
                verificarCod(
                  tipo11,
                  ["01"],
                  ["04"],
                  ["122"],
                  ["4100"],
                  ["4"],
                  ["042"],
                  ["319011"],
                  ["100000"],
                )
              ) {
                poderOrgao = "10131";
                codFontRecursosMSC = "1500";
                codAEO = "nan";
                ficha = "001";
              } else if (
                verificarCod(
                  tipo11,
                  ["01"],
                  ["04"],
                  ["122"],
                  ["4100"],
                  ["4"],
                  ["042"],
                  ["319094"],
                  ["100000"],
                )
              ) {
                poderOrgao = "10131";
                codFontRecursosMSC = "1500";
                codAEO = "nan";
                ficha = "002";
              } else if (
                verificarCod(
                  tipo11,
                  ["01"],
                  ["04"],
                  ["122"],
                  ["4100"],
                  ["4"],
                  ["042"],
                  ["339014"],
                  ["100000"],
                )
              ) {
                poderOrgao = "10131";
                codFontRecursosMSC = "1500";
                codAEO = "nan";
                ficha = "004";
              } else if (
                verificarCod(
                  tipo11,
                  ["01"],
                  ["04"],
                  ["122"],
                  ["4100"],
                  ["4"],
                  ["042"],
                  ["339030"],
                  ["100000"],
                )
              ) {
                poderOrgao = "10131";
                codFontRecursosMSC = "1500";
                codAEO = "nan";
                ficha = "005";
              } else if (
                verificarCod(
                  tipo11,
                  ["01"],
                  ["04"],
                  ["122"],
                  ["4100"],
                  ["4"],
                  ["042"],
                  ["339033"],
                  ["100000"],
                )
              ) {
                poderOrgao = "10131";
                codFontRecursosMSC = "1500";
                codAEO = "nan";
                ficha = "006";
              } else if (
                verificarCod(
                  tipo11,
                  ["01"],
                  ["04"],
                  ["122"],
                  ["4100"],
                  ["4"],
                  ["042"],
                  ["339039"],
                  ["100000"],
                )
              ) {
                poderOrgao = "10131";
                codFontRecursosMSC = "1500";
                codAEO = "nan";
                ficha = "008";
              } else if (
                verificarCod(
                  tipo11,
                  ["01"],
                  ["04"],
                  ["122"],
                  ["4100"],
                  ["4"],
                  ["045"],
                  ["319011"],
                  ["100000"],
                )
              ) {
                poderOrgao = "10131";
                codFontRecursosMSC = "1500";
                codAEO = "nan";
                ficha = "012";
              } else if (
                verificarCod(
                  tipo11,
                  ["01"],
                  ["04"],
                  ["122"],
                  ["4100"],
                  ["4"],
                  ["045"],
                  ["319094"],
                  ["100000"],
                )
              ) {
                poderOrgao = "10131";
                codFontRecursosMSC = "1500";
                codAEO = "nan";
                ficha = "013";
              } else if (
                verificarCod(
                  tipo11,
                  ["01"],
                  ["04"],
                  ["122"],
                  ["4100"],
                  ["4"],
                  ["045"],
                  ["339014"],
                  ["100000"],
                )
              ) {
                poderOrgao = "10131";
                codFontRecursosMSC = "1500";
                codAEO = "nan";
                ficha = "015";
              } else if (
                verificarCod(
                  tipo11,
                  ["01"],
                  ["04"],
                  ["122"],
                  ["4100"],
                  ["2"],
                  ["331"],
                  ["319004"],
                  ["100000"],
                )
              ) {
                poderOrgao = "10131";
                codFontRecursosMSC = "1500";
                codAEO = "nan";
                ficha = "1174";
              } else if (
                verificarCod(
                  tipo11,
                  ["01"],
                  ["04"],
                  ["122"],
                  ["4100"],
                  ["2"],
                  ["331"],
                  ["319011"],
                  ["100000"],
                )
              ) {
                poderOrgao = "10131";
                codFontRecursosMSC = "1500";
                codAEO = "nan";
                ficha = "023";
              } else if (
                verificarCod(
                  tipo11,
                  ["01"],
                  ["04"],
                  ["122"],
                  ["4100"],
                  ["4"],
                  ["045"],
                  ["319094"],
                  ["100000"],
                )
              ) {
                poderOrgao = "10131";
                codFontRecursosMSC = "1500";
                codAEO = "nan";
                ficha = "024";
              } else if (
                verificarCod(
                  tipo11,
                  ["01"],
                  ["04"],
                  ["122"],
                  ["4100"],
                  ["2"],
                  ["331"],
                  ["339030"],
                  ["100000"],
                )
              ) {
                poderOrgao = "10131";
                codFontRecursosMSC = "1500";
                codAEO = "nan";
                ficha = "027";
              } else if (
                verificarCod(
                  tipo11,
                  ["01"],
                  ["04"],
                  ["122"],
                  ["4100"],
                  ["2"],
                  ["331"],
                  ["339031"],
                  ["100000"],
                )
              ) {
                poderOrgao = "10131";
                codFontRecursosMSC = "1500";
                codAEO = "nan";
                ficha = "028";
              } else if (
                verificarCod(
                  tipo11,
                  ["01"],
                  ["04"],
                  ["122"],
                  ["4100"],
                  ["2"],
                  ["331"],
                  ["339039"],
                  ["100000"],
                )
              ) {
                poderOrgao = "10131";
                codFontRecursosMSC = "1500";
                codAEO = "nan";
                ficha = "031";
              } else if (
                verificarCod(
                  tipo11,
                  ["01"],
                  ["04"],
                  ["122"],
                  ["4100"],
                  ["2"],
                  ["331"],
                  ["339039"],
                  ["137000"],
                )
              ) {
                poderOrgao = "10131";
                codFontRecursosMSC = "1710";
                codAEO = "3210";
                ficha = "1066";
              } else if (
                verificarCod(
                  tipo11,
                  ["01"],
                  ["04"],
                  ["122"],
                  ["4100"],
                  ["2"],
                  ["331"],
                  ["339039"],
                  ["237000"],
                )
              ) {
                poderOrgao = "10131";
                codFontRecursosMSC = "2710";
                codAEO = "3210";
                ficha = "1079";
              } else if (
                verificarCod(
                  tipo11,
                  ["01"],
                  ["04"],
                  ["122"],
                  ["4100"],
                  ["2"],
                  ["331"],
                  ["339039"],
                  ["136000"],
                )
              ) {
                poderOrgao = "10131";
                codFontRecursosMSC = "1710";
                codAEO = "3210";
                ficha = "1135";
              } else if (
                verificarCod(
                  tipo11,
                  ["01"],
                  ["04"],
                  ["122"],
                  ["4100"],
                  ["2"],
                  ["331"],
                  ["339039"],
                  ["236000"],
                )
              ) {
                poderOrgao = "10131";
                codFontRecursosMSC = "2710";
                codAEO = "3210";
                ficha = "1136";
              } else if (
                verificarCod(
                  tipo11,
                  ["01"],
                  ["04"],
                  ["122"],
                  ["4100"],
                  ["2"],
                  ["331"],
                  ["339039"],
                  ["200000"],
                )
              ) {
                poderOrgao = "10131";
                codFontRecursosMSC = "2500";
                codAEO = "nan";
                ficha = "1181";
              } else if (
                verificarCod(
                  tipo11,
                  ["01"],
                  ["04"],
                  ["122"],
                  ["4100"],
                  ["2"],
                  ["331"],
                  ["339046"],
                  ["100000"],
                )
              ) {
                poderOrgao = "10131";
                codFontRecursosMSC = "1500";
                codAEO = "nan";
                ficha = "032";
              } else if (
                verificarCod(
                  tipo11,
                  ["01"],
                  ["04"],
                  ["122"],
                  ["4100"],
                  ["2"],
                  ["331"],
                  ["339049"],
                  ["100000"],
                )
              ) {
                poderOrgao = "10131";
                codFontRecursosMSC = "1500";
                codAEO = "nan";
                ficha = "033";
              } else if (
                verificarCod(
                  tipo11,
                  ["01"],
                  ["04"],
                  ["122"],
                  ["4100"],
                  ["2"],
                  ["331"],
                  ["449052"],
                  ["100000"],
                )
              ) {
                poderOrgao = "10131";
                codFontRecursosMSC = "1500";
                codAEO = "nan";
                ficha = "034";
              } else if (
                verificarCod(
                  tipo11,
                  ["01"],
                  ["04"],
                  ["122"],
                  ["4100"],
                  ["4"],
                  ["168"],
                  ["319004"],
                  ["100000"],
                )
              ) {
                poderOrgao = "10131";
                codFontRecursosMSC = "1500";
                codAEO = "nan";
                ficha = "1175";
              } else if (
                verificarCod(
                  tipo11,
                  ["01"],
                  ["04"],
                  ["122"],
                  ["4100"],
                  ["4"],
                  ["168"],
                  ["319011"],
                  ["100000"],
                )
              ) {
                poderOrgao = "10131";
                codFontRecursosMSC = "1500";
                codAEO = "nan";
                ficha = "035";
              } else if (
                verificarCod(
                  tipo11,
                  ["01"],
                  ["04"],
                  ["122"],
                  ["4100"],
                  ["4"],
                  ["168"],
                  ["319011"],
                  ["100000"],
                )
              ) {
                poderOrgao = "10131";
                codFontRecursosMSC = "1500";
                codAEO = "nan";
                ficha = "1009";
              } else if (
                verificarCod(
                  tipo11,
                  ["01"],
                  ["04"],
                  ["122"],
                  ["4100"],
                  ["4"],
                  ["168"],
                  ["319094"],
                  ["100000"],
                )
              ) {
                poderOrgao = "10131";
                codFontRecursosMSC = "1500";
                codAEO = "nan";
                ficha = "036";
              } else if (
                verificarCod(
                  tipo11,
                  ["01"],
                  ["04"],
                  ["122"],
                  ["4100"],
                  ["4"],
                  ["168"],
                  ["339008"],
                  ["100000"],
                )
              ) {
                poderOrgao = "10131";
                codFontRecursosMSC = "1500";
                codAEO = "nan";
                ficha = "038";
              } else if (
                verificarCod(
                  tipo11,
                  ["01"],
                  ["04"],
                  ["122"],
                  ["4100"],
                  ["4"],
                  ["168"],
                  ["339014"],
                  ["100000"],
                )
              ) {
                poderOrgao = "10131";
                codFontRecursosMSC = "1500";
                codAEO = "nan";
                ficha = "039";
              } else if (
                verificarCod(
                  tipo11,
                  ["01"],
                  ["04"],
                  ["122"],
                  ["4100"],
                  ["4"],
                  ["168"],
                  ["339030"],
                  ["100000"],
                )
              ) {
                poderOrgao = "10131";
                codFontRecursosMSC = "1500";
                codAEO = "nan";
                ficha = "040";
              } else if (
                verificarCod(
                  tipo11,
                  ["01"],
                  ["04"],
                  ["122"],
                  ["4100"],
                  ["4"],
                  ["168"],
                  ["339030"],
                  ["106000"],
                )
              ) {
                poderOrgao = "10131";
                codFontRecursosMSC = "1753";
                codAEO = "nan";
                ficha = "041";
              } else if (
                verificarCod(
                  tipo11,
                  ["01"],
                  ["04"],
                  ["122"],
                  ["4100"],
                  ["4"],
                  ["168"],
                  ["339030"],
                  ["280000"],
                )
              ) {
                poderOrgao = "10131";
                codFontRecursosMSC = "2706";
                codAEO = "3110";
                ficha = "1085";
              } else if (
                verificarCod(
                  tipo11,
                  ["01"],
                  ["04"],
                  ["122"],
                  ["4100"],
                  ["4"],
                  ["168"],
                  ["339034"],
                  ["100000"],
                )
              ) {
                poderOrgao = "10131";
                codFontRecursosMSC = "1500";
                codAEO = "nan";
                ficha = "043";
              } else if (
                verificarCod(
                  tipo11,
                  ["01"],
                  ["04"],
                  ["122"],
                  ["4100"],
                  ["4"],
                  ["168"],
                  ["339036"],
                  ["100000"],
                )
              ) {
                poderOrgao = "10131";
                codFontRecursosMSC = "1500";
                codAEO = "nan";
                ficha = "044";
              } else if (
                verificarCod(
                  tipo11,
                  ["01"],
                  ["04"],
                  ["122"],
                  ["4100"],
                  ["4"],
                  ["168"],
                  ["339039"],
                  ["100000"],
                )
              ) {
                poderOrgao = "10131";
                codFontRecursosMSC = "1500";
                codAEO = "nan";
                ficha = "045";
              } else if (
                verificarCod(
                  tipo11,
                  ["01"],
                  ["04"],
                  ["122"],
                  ["4100"],
                  ["4"],
                  ["168"],
                  ["339040"],
                  ["100000"],
                )
              ) {
                poderOrgao = "10131";
                codFontRecursosMSC = "1500";
                codAEO = "nan";
                ficha = "046";
              } else if (
                verificarCod(
                  tipo11,
                  ["01"],
                  ["04"],
                  ["122"],
                  ["4100"],
                  ["4"],
                  ["168"],
                  ["339041"],
                  ["100000"],
                )
              ) {
                poderOrgao = "10131";
                codFontRecursosMSC = "1500";
                codAEO = "nan";
                ficha = "047";
              } else if (
                verificarCod(
                  tipo11,
                  ["01"],
                  ["04"],
                  ["122"],
                  ["4100"],
                  ["4"],
                  ["168"],
                  ["339046"],
                  ["100000"],
                )
              ) {
                poderOrgao = "10131";
                codFontRecursosMSC = "1500";
                codAEO = "nan";
                ficha = "050";
              } else if (
                verificarCod(
                  tipo11,
                  ["01"],
                  ["04"],
                  ["122"],
                  ["4100"],
                  ["4"],
                  ["168"],
                  ["339049"],
                  ["100000"],
                )
              ) {
                poderOrgao = "10131";
                codFontRecursosMSC = "1500";
                codAEO = "nan";
                ficha = "053";
              } else if (
                verificarCod(
                  tipo11,
                  ["01"],
                  ["04"],
                  ["122"],
                  ["4100"],
                  ["4"],
                  ["168"],
                  ["339093"],
                  ["100000"],
                )
              ) {
                poderOrgao = "10131";
                codFontRecursosMSC = "1500";
                codAEO = "nan";
                ficha = "055";
              } else if (
                verificarCod(
                  tipo11,
                  ["01"],
                  ["04"],
                  ["122"],
                  ["4100"],
                  ["4"],
                  ["168"],
                  ["449052"],
                  ["100000"],
                )
              ) {
                poderOrgao = "10131";
                codFontRecursosMSC = "1500";
                codAEO = "nan";
                ficha = "056";
              } else if (
                verificarCod(
                  tipo11,
                  ["01"],
                  ["04"],
                  ["122"],
                  ["4100"],
                  ["4"],
                  ["168"],
                  ["449052"],
                  ["190024"],
                )
              ) {
                poderOrgao = "10131";
                codFontRecursosMSC = "1754";
                codAEO = "nan";
                ficha = "1037";
              } else if (
                verificarCod(
                  tipo11,
                  ["01"],
                  ["04"],
                  ["122"],
                  ["4100"],
                  ["4"],
                  ["168"],
                  ["449052"],
                  ["236000"],
                )
              ) {
                poderOrgao = "10131";
                codFontRecursosMSC = "2710";
                codAEO = "3210";
                ficha = "1038";
              } else if (
                verificarCod(
                  tipo11,
                  ["01"],
                  ["04"],
                  ["122"],
                  ["4100"],
                  ["4"],
                  ["168"],
                  ["449052"],
                  ["237000"],
                )
              ) {
                poderOrgao = "10131";
                codFontRecursosMSC = "2710";
                codAEO = "3210";
                ficha = "1039";
              } else if (
                verificarCod(
                  tipo11,
                  ["01"],
                  ["04"],
                  ["122"],
                  ["4100"],
                  ["4"],
                  ["168"],
                  ["449052"],
                  ["280000"],
                )
              ) {
                poderOrgao = "10131";
                codFontRecursosMSC = "2706";
                codAEO = "3110";
                ficha = "1040";
              } else if (
                verificarCod(
                  tipo11,
                  ["01"],
                  ["04"],
                  ["122"],
                  ["4100"],
                  ["4"],
                  ["168"],
                  ["449052"],
                  ["137000"],
                )
              ) {
                poderOrgao = "10131";
                codFontRecursosMSC = "1710";
                codAEO = "3210";
                ficha = "1067";
              } else if (
                verificarCod(
                  tipo11,
                  ["01"],
                  ["04"],
                  ["123"],
                  ["4100"],
                  ["4"],
                  ["127"],
                  ["319007"],
                  ["100000"],
                )
              ) {
                poderOrgao = "10131";
                codFontRecursosMSC = "1500";
                codAEO = "nan";
                ficha = "1215";
              } else if (
                verificarCod(
                  tipo11,
                  ["01"],
                  ["04"],
                  ["123"],
                  ["4100"],
                  ["4"],
                  ["127"],
                  ["319011"],
                  ["100000"],
                )
              ) {
                poderOrgao = "10131";
                codFontRecursosMSC = "1500";
                codAEO = "nan";
                ficha = "057";
              } else if (
                verificarCod(
                  tipo11,
                  ["01"],
                  ["04"],
                  ["123"],
                  ["4100"],
                  ["4"],
                  ["127"],
                  ["319007"],
                  ["100000"],
                )
              ) {
                poderOrgao = "10131";
                codFontRecursosMSC = "1500";
                codAEO = "nan";
                ficha = "1215";
              } else if (
                verificarCod(
                  tipo11,
                  ["01"],
                  ["04"],
                  ["123"],
                  ["4100"],
                  ["4"],
                  ["127"],
                  ["319011"],
                  ["200089"],
                )
              ) {
                poderOrgao = "10131";
                codFontRecursosMSC = "2749";
                codAEO = "nan";
                ficha = "1007";
              } else if (
                verificarCod(
                  tipo11,
                  ["01"],
                  ["04"],
                  ["123"],
                  ["4100"],
                  ["4"],
                  ["127"],
                  ["319013"],
                  ["100000"],
                )
              ) {
                poderOrgao = "10131";
                codFontRecursosMSC = "1500";
                codAEO = "nan";
                ficha = "058";
              } else if (
                verificarCod(
                  tipo11,
                  ["01"],
                  ["04"],
                  ["123"],
                  ["4100"],
                  ["4"],
                  ["127"],
                  ["319094"],
                  ["100089"],
                )
              ) {
                poderOrgao = "10131";
                codFontRecursosMSC = "1500";
                codAEO = "nan";
                ficha = "059";
              } else if (
                verificarCod(
                  tipo11,
                  ["01"],
                  ["04"],
                  ["123"],
                  ["4100"],
                  ["4"],
                  ["127"],
                  ["319113"],
                  ["100000"],
                )
              ) {
                poderOrgao = "10131";
                codFontRecursosMSC = "1500";
                codAEO = "nan";
                ficha = "060";
              } else if (
                verificarCod(
                  tipo11,
                  ["01"],
                  ["04"],
                  ["123"],
                  ["4100"],
                  ["4"],
                  ["127"],
                  ["339014"],
                  ["100000"],
                )
              ) {
                poderOrgao = "10131";
                codFontRecursosMSC = "1500";
                codAEO = "nan";
                ficha = "062";
              } else if (
                verificarCod(
                  tipo11,
                  ["01"],
                  ["04"],
                  ["123"],
                  ["4100"],
                  ["4"],
                  ["127"],
                  ["339033"],
                  ["100000"],
                )
              ) {
                poderOrgao = "10131";
                codFontRecursosMSC = "1500";
                codAEO = "nan";
                ficha = "064";
              } else if (
                verificarCod(
                  tipo11,
                  ["01"],
                  ["04"],
                  ["123"],
                  ["4100"],
                  ["4"],
                  ["127"],
                  ["339034"],
                  ["100000"],
                )
              ) {
                poderOrgao = "10131";
                codFontRecursosMSC = "1500";
                codAEO = "nan";
                ficha = "065";
              } else if (
                verificarCod(
                  tipo11,
                  ["01"],
                  ["04"],
                  ["123"],
                  ["4100"],
                  ["4"],
                  ["127"],
                  ["339036"],
                  ["100000"],
                )
              ) {
                poderOrgao = "10131";
                codFontRecursosMSC = "1500";
                codAEO = "nan";
                ficha = "066";
              } else if (
                verificarCod(
                  tipo11,
                  ["01"],
                  ["04"],
                  ["123"],
                  ["4100"],
                  ["4"],
                  ["127"],
                  ["339036"],
                  ["100000"],
                )
              ) {
                poderOrgao = "10131";
                codFontRecursosMSC = "1500";
                codAEO = "nan";
                ficha = "066";
              } else if (
                verificarCod(
                  tipo11,
                  ["01"],
                  ["04"],
                  ["123"],
                  ["4100"],
                  ["4"],
                  ["127"],
                  ["339039"],
                  ["100000"],
                )
              ) {
                poderOrgao = "10131";
                codFontRecursosMSC = "1500";
                codAEO = "nan";
                ficha = "067";
              } else if (
                verificarCod(
                  tipo11,
                  ["01"],
                  ["04"],
                  ["123"],
                  ["4100"],
                  ["4"],
                  ["127"],
                  ["339039"],
                  ["116000"],
                )
              ) {
                poderOrgao = "10131";
                codFontRecursosMSC = "1750";
                codAEO = "nan";
                ficha = "068";
              } else if (
                verificarCod(
                  tipo11,
                  ["01"],
                  ["04"],
                  ["123"],
                  ["4100"],
                  ["4"],
                  ["127"],
                  ["339039"],
                  ["123000"],
                )
              ) {
                poderOrgao = "10131";
                codFontRecursosMSC = "1700";
                codAEO = "nan";
                ficha = "069";
              } else if (
                verificarCod(
                  tipo11,
                  ["01"],
                  ["04"],
                  ["123"],
                  ["4100"],
                  ["4"],
                  ["127"],
                  ["339039"],
                  ["170072"],
                )
              ) {
                poderOrgao = "10131";
                codFontRecursosMSC = "1708";
                codAEO = "nan";
                ficha = "070";
              } else if (
                verificarCod(
                  tipo11,
                  ["01"],
                  ["04"],
                  ["123"],
                  ["4100"],
                  ["4"],
                  ["127"],
                  ["339039"],
                  ["170074"],
                )
              ) {
                poderOrgao = "10131";
                codFontRecursosMSC = "1705";
                codAEO = "nan";
                ficha = "071";
              } else if (
                verificarCod(
                  tipo11,
                  ["01"],
                  ["04"],
                  ["123"],
                  ["4100"],
                  ["4"],
                  ["127"],
                  ["339039"],
                  ["181000"],
                )
              ) {
                poderOrgao = "10131";
                codFontRecursosMSC = "1706";
                codAEO = "3110";
                ficha = "072";
              } else if (
                verificarCod(
                  tipo11,
                  ["01"],
                  ["04"],
                  ["123"],
                  ["4100"],
                  ["4"],
                  ["127"],
                  ["339039"],
                  ["200000"],
                )
              ) {
                poderOrgao = "10131";
                codFontRecursosMSC = "2500";
                codAEO = "nan";
                ficha = "1134";
              } else if (
                verificarCod(
                  tipo11,
                  ["01"],
                  ["04"],
                  ["123"],
                  ["4100"],
                  ["4"],
                  ["127"],
                  ["339039"],
                  ["180000"],
                )
              ) {
                poderOrgao = "10131";
                codFontRecursosMSC = "1706";
                codAEO = "3110";
                ficha = "1231";
              } else if (
                verificarCod(
                  tipo11,
                  ["01"],
                  ["04"],
                  ["123"],
                  ["4100"],
                  ["4"],
                  ["127"],
                  ["339040"],
                  ["100000"],
                )
              ) {
                poderOrgao = "10131";
                codFontRecursosMSC = "1500";
                codAEO = "nan";
                ficha = "074";
              } else if (
                verificarCod(
                  tipo11,
                  ["01"],
                  ["04"],
                  ["123"],
                  ["4100"],
                  ["4"],
                  ["127"],
                  ["339045"],
                  ["100000"],
                )
              ) {
                poderOrgao = "10131";
                codFontRecursosMSC = "1500";
                codAEO = "nan";
                ficha = "076";
              } else if (
                verificarCod(
                  tipo11,
                  ["01"],
                  ["04"],
                  ["123"],
                  ["4100"],
                  ["4"],
                  ["127"],
                  ["339045"],
                  ["200000"],
                )
              ) {
                poderOrgao = "10131";
                codFontRecursosMSC = "2500";
                codAEO = "nan";
                ficha = "1229";
              } else if (
                verificarCod(
                  tipo11,
                  ["01"],
                  ["04"],
                  ["123"],
                  ["4100"],
                  ["4"],
                  ["127"],
                  ["339049"],
                  ["100000"],
                )
              ) {
                poderOrgao = "10131";
                codFontRecursosMSC = "1500";
                codAEO = "nan";
                ficha = "078";
              } else if (
                verificarCod(
                  tipo11,
                  ["01"],
                  ["04"],
                  ["123"],
                  ["4100"],
                  ["4"],
                  ["127"],
                  ["339093"],
                  ["100000"],
                )
              ) {
                poderOrgao = "10131";
                codFontRecursosMSC = "1500";
                codAEO = "nan";
                ficha = "080";
              } else if (
                verificarCod(
                  tipo11,
                  ["01"],
                  ["04"],
                  ["123"],
                  ["4100"],
                  ["4"],
                  ["127"],
                  ["339093"],
                  ["281000"],
                )
              ) {
                poderOrgao = "10131";
                codFontRecursosMSC = "2706";
                codAEO = "3110";
                ficha = "1025";
              } else if (
                verificarCod(
                  tipo11,
                  ["01"],
                  ["04"],
                  ["123"],
                  ["4100"],
                  ["4"],
                  ["127"],
                  ["3390933"],
                  ["181000"],
                )
              ) {
                poderOrgao = "10131";
                codFontRecursosMSC = "1706";
                codAEO = "3110";
                ficha = "1026";
              } else if (
                verificarCod(
                  tipo11,
                  ["01"],
                  ["04"],
                  ["123"],
                  ["4100"],
                  ["4"],
                  ["127"],
                  ["339093"],
                  ["237000"],
                )
              ) {
                poderOrgao = "10131";
                codFontRecursosMSC = "2710";
                codAEO = "3210";
                ficha = "1028";
              } else if (
                verificarCod(
                  tipo11,
                  ["01"],
                  ["04"],
                  ["123"],
                  ["4100"],
                  ["4"],
                  ["127"],
                  ["339093"],
                  ["144000"],
                )
              ) {
                poderOrgao = "10131";
                codFontRecursosMSC = "1501";
                codAEO = "nan";
                ficha = "1076";
              } else if (
                verificarCod(
                  tipo11,
                  ["01"],
                  ["04"],
                  ["123"],
                  ["4100"],
                  ["4"],
                  ["127"],
                  ["339033"],
                  ["137000"],
                )
              ) {
                poderOrgao = "10131";
                codFontRecursosMSC = "1710";
                codAEO = "3210";
                ficha = "1154";
              } else if (
                verificarCod(
                  tipo11,
                  ["01"],
                  ["04"],
                  ["123"],
                  ["4100"],
                  ["4"],
                  ["127"],
                  ["339033"],
                  ["200000"],
                )
              ) {
                poderOrgao = "10131";
                codFontRecursosMSC = "2500";
                codAEO = "nan";
                ficha = "1172";
              } else if (
                verificarCod(
                  tipo11,
                  ["01"],
                  ["04"],
                  ["123"],
                  ["4100"],
                  ["4"],
                  ["127"],
                  ["339096"],
                  ["100000"],
                )
              ) {
                poderOrgao = "10131";
                codFontRecursosMSC = "1500";
                codAEO = "nan";
                ficha = "081";
              } else if (
                verificarCod(
                  tipo11,
                  ["01"],
                  ["04"],
                  ["123"],
                  ["4100"],
                  ["4"],
                  ["127"],
                  ["339197"],
                  ["100000"],
                )
              ) {
                poderOrgao = "10131";
                codFontRecursosMSC = "1500";
                codAEO = "nan";
                ficha = "082";
              } else if (
                verificarCod(
                  tipo11,
                  ["01"],
                  ["04"],
                  ["123"],
                  ["4100"],
                  ["4"],
                  ["127"],
                  ["457042"],
                  ["100000"],
                )
              ) {
                poderOrgao = "10131";
                codFontRecursosMSC = "1500";
                codAEO = "nan";
                ficha = "1078";
              } else if (
                verificarCod(
                  tipo11,
                  ["01"],
                  ["04"],
                  ["123"],
                  ["4100"],
                  ["4"],
                  ["127"],
                  ["339091"],
                  ["100000"],
                )
              ) {
                poderOrgao = "10131";
                codFontRecursosMSC = "1500";
                codAEO = "nan";
                ficha = "084";
              } else if (
                verificarCod(
                  tipo11,
                  ["01"],
                  ["04"],
                  ["123"],
                  ["4100"],
                  ["4"],
                  ["127"],
                  ["339047"],
                  ["100000"],
                )
              ) {
                poderOrgao = "10131";
                codFontRecursosMSC = "1500";
                codAEO = "nan";
                ficha = "088";
              } else if (
                verificarCod(
                  tipo11,
                  ["01"],
                  ["04"],
                  ["123"],
                  ["4100"],
                  ["4"],
                  ["127"],
                  ["339047"],
                  ["116000"],
                )
              ) {
                poderOrgao = "10131";
                codFontRecursosMSC = "1750";
                codAEO = "nan";
                ficha = "089";
              } else if (
                verificarCod(
                  tipo11,
                  ["01"],
                  ["04"],
                  ["123"],
                  ["4100"],
                  ["4"],
                  ["127"],
                  ["339047"],
                  ["170072"],
                )
              ) {
                poderOrgao = "10131";
                codFontRecursosMSC = "1708";
                codAEO = "nan";
                ficha = "091";
              } else if (
                verificarCod(
                  tipo11,
                  ["01"],
                  ["04"],
                  ["123"],
                  ["4100"],
                  ["4"],
                  ["127"],
                  ["339047"],
                  ["170074"],
                )
              ) {
                poderOrgao = "10131";
                codFontRecursosMSC = "1705";
                codAEO = "nan";
                ficha = "092";
              } else if (
                verificarCod(
                  tipo11,
                  ["01"],
                  ["04"],
                  ["846"],
                  ["4108"],
                  ["9"],
                  ["025"],
                  ["469071"],
                  ["100000"],
                )
              ) {
                poderOrgao = "10131";
                codFontRecursosMSC = "1500";
                codAEO = "nan";
                ficha = "094";
              } else if (
                verificarCod(
                  tipo11,
                  ["01"],
                  ["28"],
                  ["843"],
                  ["4108"],
                  ["2"],
                  ["003"],
                  ["329021"],
                  ["100000"],
                )
              ) {
                poderOrgao = "10131";
                codFontRecursosMSC = "1500";
                codAEO = "nan";
                ficha = "095";
              } else if (
                verificarCod(
                  tipo11,
                  ["01"],
                  ["28"],
                  ["843"],
                  ["4108"],
                  ["2"],
                  ["003"],
                  ["469071"],
                  ["100000"],
                )
              ) {
                poderOrgao = "10131";
                codFontRecursosMSC = "1500";
                codAEO = "nan";
                ficha = "097";
              } else if (
                verificarCod(
                  tipo11,
                  ["01"],
                  ["04"],
                  ["122"],
                  ["4100"],
                  ["4"],
                  ["080"],
                  ["319004"],
                  ["100000"],
                )
              ) {
                poderOrgao = "10131";
                codFontRecursosMSC = "1500";
                codAEO = "nan";
                ficha = "098";
              } else if (
                verificarCod(
                  tipo11,
                  ["01"],
                  ["04"],
                  ["122"],
                  ["4100"],
                  ["4"],
                  ["080"],
                  ["319011"],
                  ["100000"],
                )
              ) {
                poderOrgao = "10131";
                codFontRecursosMSC = "1500";
                codAEO = "nan";
                ficha = "099";
              } else if (
                verificarCod(
                  tipo11,
                  ["01"],
                  ["04"],
                  ["122"],
                  ["4100"],
                  ["4"],
                  ["080"],
                  ["319094"],
                  ["100000", "100089"],
                )
              ) {
                poderOrgao = "10131";
                codFontRecursosMSC = "1500";
                codAEO = "nan";
                ficha = "100";
              } else if (
                verificarCod(
                  tipo11,
                  ["01"],
                  ["04"],
                  ["122"],
                  ["4100"],
                  ["4"],
                  ["080"],
                  ["339014"],
                  ["100000"],
                )
              ) {
                poderOrgao = "10131";
                codFontRecursosMSC = "1500";
                codAEO = "nan";
                ficha = "102";
              } else if (
                verificarCod(
                  tipo11,
                  ["01"],
                  ["04"],
                  ["122"],
                  ["4100"],
                  ["4"],
                  ["080"],
                  ["339030"],
                  ["100000"],
                )
              ) {
                poderOrgao = "10131";
                codFontRecursosMSC = "1500";
                codAEO = "nan";
                ficha = "103";
              } else if (
                verificarCod(
                  tipo11,
                  ["01"],
                  ["04"],
                  ["122"],
                  ["4100"],
                  ["4"],
                  ["080"],
                  ["339039"],
                  ["100000"],
                )
              ) {
                poderOrgao = "10131";
                codFontRecursosMSC = "1500";
                codAEO = "nan";
                ficha = "106";
              } else if (
                verificarCod(
                  tipo11,
                  ["01"],
                  ["04"],
                  ["122"],
                  ["4100"],
                  ["4"],
                  ["080"],
                  ["339046"],
                  ["100000"],
                )
              ) {
                poderOrgao = "10131";
                codFontRecursosMSC = "1500";
                codAEO = "nan";
                ficha = "107";
              } else if (
                verificarCod(
                  tipo11,
                  ["01"],
                  ["04"],
                  ["122"],
                  ["4100"],
                  ["4"],
                  ["080"],
                  ["449052"],
                  ["237000"],
                )
              ) {
                poderOrgao = "10131";
                codFontRecursosMSC = "2710";
                codAEO = "3210";
                ficha = "1075";
              } else if (
                verificarCod(
                  tipo11,
                  ["01"],
                  ["04"],
                  ["122"],
                  ["4100"],
                  ["4"],
                  ["080"],
                  ["319011"],
                  ["100000"],
                )
              ) {
                poderOrgao = "10131";
                codFontRecursosMSC = "1500";
                codAEO = "nan";
                ficha = "113";
              } else if (
                verificarCod(
                  tipo11,
                  ["01"],
                  ["04"],
                  ["122"],
                  ["4100"],
                  ["4"],
                  ["080"],
                  ["319011"],
                  ["200089"],
                )
              ) {
                poderOrgao = "10131";
                codFontRecursosMSC = "2749";
                codAEO = "nan";
                ficha = "1010";
              } else if (
                verificarCod(
                  tipo11,
                  ["01"],
                  ["04"],
                  ["122"],
                  ["4100"],
                  ["4"],
                  ["080"],
                  ["319094"],
                  ["100000"],
                )
              ) {
                poderOrgao = "10131";
                codFontRecursosMSC = "1500";
                codAEO = "nan";
                ficha = "114";
              } else if (
                verificarCod(
                  tipo11,
                  ["01"],
                  ["04"],
                  ["122"],
                  ["4100"],
                  ["4"],
                  ["080"],
                  ["339014"],
                  ["100000"],
                )
              ) {
                poderOrgao = "10131";
                codFontRecursosMSC = "1500";
                codAEO = "nan";
                ficha = "116";
              } else if (
                verificarCod(
                  tipo11,
                  ["01"],
                  ["04"],
                  ["122"],
                  ["4100"],
                  ["4"],
                  ["125"],
                  ["3339036"],
                  ["100000"],
                )
              ) {
                poderOrgao = "10131";
                codFontRecursosMSC = "1500";
                codAEO = "nan";
                ficha = "119";
              } else if (
                verificarCod(
                  tipo11,
                  ["01"],
                  ["04"],
                  ["122"],
                  ["4100"],
                  ["4"],
                  ["125"],
                  ["339039"],
                  ["100000"],
                )
              ) {
                poderOrgao = "10131";
                codFontRecursosMSC = "1500";
                codAEO = "nan";
                ficha = "120";
              } else if (
                verificarCod(
                  tipo11,
                  ["01"],
                  ["04"],
                  ["122"],
                  ["4100"],
                  ["4"],
                  ["125"],
                  ["339046"],
                  ["100000"],
                )
              ) {
                poderOrgao = "10131";
                codFontRecursosMSC = "1500";
                codAEO = "nan";
                ficha = "122";
              } else if (
                verificarCod(
                  tipo11,
                  ["01"],
                  ["04"],
                  ["122"],
                  ["4100"],
                  ["4"],
                  ["125"],
                  ["339047"],
                  ["100000"],
                )
              ) {
                poderOrgao = "10131";
                codFontRecursosMSC = "1500";
                codAEO = "nan";
                ficha = "1031";
              } else if (
                verificarCod(
                  tipo11,
                  ["01"],
                  ["04"],
                  ["122"],
                  ["4100"],
                  ["4"],
                  ["125"],
                  ["339049"],
                  ["100000"],
                )
              ) {
                poderOrgao = "10131";
                codFontRecursosMSC = "1500";
                codAEO = "nan";
                ficha = "123";
              } else if (
                verificarCod(
                  tipo11,
                  ["01"],
                  ["04"],
                  ["122"],
                  ["4100"],
                  ["4"],
                  ["126"],
                  ["319004"],
                  ["100000"],
                )
              ) {
                poderOrgao = "10131";
                codFontRecursosMSC = "1500";
                codAEO = "nan";
                ficha = "128";
              } else if (
                verificarCod(
                  tipo11,
                  ["01"],
                  ["04"],
                  ["122"],
                  ["4100"],
                  ["4"],
                  ["125"],
                  ["319011"],
                  ["100000"],
                )
              ) {
                poderOrgao = "10131";
                codFontRecursosMSC = "1500";
                codAEO = "nan";
                ficha = "129";
              } else if (
                verificarCod(
                  tipo11,
                  ["01"],
                  ["04"],
                  ["122"],
                  ["4100"],
                  ["4"],
                  ["126"],
                  ["319011"],
                  ["200089"],
                )
              ) {
                poderOrgao = "10131";
                codFontRecursosMSC = "2749";
                codAEO = "nan";
                ficha = "1006";
              } else if (
                verificarCod(
                  tipo11,
                  ["01"],
                  ["04"],
                  ["122"],
                  ["4100"],
                  ["4"],
                  ["126"],
                  ["319094"],
                  ["100000"],
                )
              ) {
                poderOrgao = "10131";
                codFontRecursosMSC = "1500";
                codAEO = "nan";
                ficha = "130";
              } else if (
                verificarCod(
                  tipo11,
                  ["01"],
                  ["04"],
                  ["122"],
                  ["4100"],
                  ["4"],
                  ["126"],
                  ["339008"],
                  ["100000"],
                )
              ) {
                poderOrgao = "10131";
                codFontRecursosMSC = "1500";
                codAEO = "nan";
                ficha = "131";
              } else if (
                verificarCod(
                  tipo11,
                  ["01"],
                  ["04"],
                  ["122"],
                  ["4100"],
                  ["4"],
                  ["126"],
                  ["339014"],
                  ["171019"],
                )
              ) {
                poderOrgao = "10131";
                codFontRecursosMSC = "1752";
                codAEO = "nan";
                ficha = "133";
              } else if (
                verificarCod(
                  tipo11,
                  ["01"],
                  ["04"],
                  ["122"],
                  ["4100"],
                  ["4"],
                  ["126"],
                  ["339030"],
                  ["100000"],
                )
              ) {
                poderOrgao = "10131";
                codFontRecursosMSC = "1500";
                codAEO = "nan";
                ficha = "134";
              } else if (
                verificarCod(
                  tipo11,
                  ["01"],
                  ["04"],
                  ["122"],
                  ["4100"],
                  ["4"],
                  ["126"],
                  ["339030"],
                  ["106000"],
                )
              ) {
                poderOrgao = "10131";
                codFontRecursosMSC = "1753";
                codAEO = "nan";
                ficha = "135";
              } else if (
                verificarCod(
                  tipo11,
                  ["01"],
                  ["04"],
                  ["122"],
                  ["4100"],
                  ["4"],
                  ["126"],
                  ["339030"],
                  ["170072"],
                )
              ) {
                poderOrgao = "10131";
                codFontRecursosMSC = "1708";
                codAEO = "nan";
                ficha = "136";
              } else if (
                verificarCod(
                  tipo11,
                  ["01"],
                  ["04"],
                  ["122"],
                  ["4100"],
                  ["4"],
                  ["126"],
                  ["339030"],
                  ["170074"],
                )
              ) {
                poderOrgao = "10131";
                codFontRecursosMSC = "1705";
                codAEO = "nan";
                ficha = "137";
              } else if (
                verificarCod(
                  tipo11,
                  ["01"],
                  ["04"],
                  ["122"],
                  ["4100"],
                  ["4"],
                  ["126"],
                  ["339030"],
                  ["171019"],
                )
              ) {
                poderOrgao = "10131";
                codFontRecursosMSC = "1752";
                codAEO = "nan";
                ficha = "138";
              } else if (
                verificarCod(
                  tipo11,
                  ["01"],
                  ["04"],
                  ["122"],
                  ["4100"],
                  ["4"],
                  ["126"],
                  ["339030"],
                  ["200000"],
                )
              ) {
                poderOrgao = "10131";
                codFontRecursosMSC = "2500";
                codAEO = "nan";
                ficha = "1198";
              } else if (
                verificarCod(
                  tipo11,
                  ["01"],
                  ["04"],
                  ["122"],
                  ["4100"],
                  ["4"],
                  ["126"],
                  ["339036"],
                  ["100000"],
                )
              ) {
                poderOrgao = "10131";
                codFontRecursosMSC = "1500";
                codAEO = "nan";
                ficha = "141";
              } else if (
                verificarCod(
                  tipo11,
                  ["01"],
                  ["04"],
                  ["122"],
                  ["4100"],
                  ["4"],
                  ["126"],
                  ["339036"],
                  ["171019"],
                )
              ) {
                poderOrgao = "10131";
                codFontRecursosMSC = "1752";
                codAEO = "nan";
                ficha = "142";
              } else if (
                verificarCod(
                  tipo11,
                  ["01"],
                  ["04"],
                  ["122"],
                  ["4100"],
                  ["4"],
                  ["126"],
                  ["339039"],
                  ["100000"],
                )
              ) {
                poderOrgao = "10131";
                codFontRecursosMSC = "1500";
                codAEO = "nan";
                ficha = "143";
              } else if (
                verificarCod(
                  tipo11,
                  ["01"],
                  ["04"],
                  ["122"],
                  ["4100"],
                  ["4"],
                  ["126"],
                  ["339039"],
                  ["171019"],
                )
              ) {
                poderOrgao = "10131";
                codFontRecursosMSC = "1752";
                codAEO = "nan";
                ficha = "145";
              } else if (
                verificarCod(
                  tipo11,
                  ["01"],
                  ["04"],
                  ["122"],
                  ["4100"],
                  ["4"],
                  ["126"],
                  ["339039"],
                  ["200000"],
                )
              ) {
                poderOrgao = "10131";
                codFontRecursosMSC = "2500";
                codAEO = "nan";
                ficha = "1199";
              } else if (
                verificarCod(
                  tipo11,
                  ["01"],
                  ["04"],
                  ["122"],
                  ["4100"],
                  ["4"],
                  ["126"],
                  ["339046"],
                  ["100000"],
                )
              ) {
                poderOrgao = "10131";
                codFontRecursosMSC = "1500";
                codAEO = "nan";
                ficha = "1463";
              } else if (
                verificarCod(
                  tipo11,
                  ["01"],
                  ["04"],
                  ["122"],
                  ["4100"],
                  ["4"],
                  ["126"],
                  ["339046"],
                  ["100000"],
                )
              ) {
                poderOrgao = "10131";
                codFontRecursosMSC = "1500";
                codAEO = "nan";
                ficha = "146";
              } else if (
                verificarCod(
                  tipo11,
                  ["01"],
                  ["04"],
                  ["122"],
                  ["4100"],
                  ["4"],
                  ["126"],
                  ["339047"],
                  ["100000"],
                )
              ) {
                poderOrgao = "10131";
                codFontRecursosMSC = "1500";
                codAEO = "nan";
                ficha = "147";
              } else if (
                verificarCod(
                  tipo11,
                  ["01"],
                  ["04"],
                  ["122"],
                  ["4100"],
                  ["4"],
                  ["126"],
                  ["339049"],
                  ["100000"],
                )
              ) {
                poderOrgao = "10131";
                codFontRecursosMSC = "1500";
                codAEO = "nan";
                ficha = "148";
              } else if (
                verificarCod(
                  tipo11,
                  ["01"],
                  ["04"],
                  ["122"],
                  ["4100"],
                  ["4"],
                  ["126"],
                  ["339093"],
                  ["100000"],
                )
              ) {
                poderOrgao = "10131";
                codFontRecursosMSC = "1500";
                codAEO = "nan";
                ficha = "150";
              } else if (
                verificarCod(
                  tipo11,
                  ["01"],
                  ["04"],
                  ["122"],
                  ["4100"],
                  ["4"],
                  ["126"],
                  ["339093"],
                  ["171000"],
                )
              ) {
                poderOrgao = "10131";
                codFontRecursosMSC = "1752";
                codAEO = "nan";
                ficha = "1029";
              } else if (
                verificarCod(
                  tipo11,
                  ["01"],
                  ["04"],
                  ["122"],
                  ["4100"],
                  ["4"],
                  ["126"],
                  ["449051"],
                  ["181000"],
                )
              ) {
                poderOrgao = "10131";
                codFontRecursosMSC = "1706";
                codAEO = "3110";
                ficha = "153";
              } else if (
                verificarCod(
                  tipo11,
                  ["01"],
                  ["04"],
                  ["122"],
                  ["4100"],
                  ["4"],
                  ["126"],
                  ["449051"],
                  ["181000"],
                )
              ) {
                poderOrgao = "10131";
                codFontRecursosMSC = "1706";
                codAEO = "3110";
                ficha = "153";
              } else if (
                verificarCod(
                  tipo11,
                  ["01"],
                  ["04"],
                  ["122"],
                  ["4100"],
                  ["4"],
                  ["126"],
                  ["449052"],
                  ["100000"],
                )
              ) {
                poderOrgao = "10131";
                codFontRecursosMSC = "1500";
                codAEO = "nan";
                ficha = "154";
              } else if (
                verificarCod(
                  tipo11,
                  ["01"],
                  ["04"],
                  ["122"],
                  ["4100"],
                  ["4"],
                  ["126"],
                  ["449052"],
                  ["171000"],
                )
              ) {
                poderOrgao = "10131";
                codFontRecursosMSC = "1752";
                codAEO = "nan";
                ficha = "155";
              } else if (
                verificarCod(
                  tipo11,
                  ["01"],
                  ["04"],
                  ["122"],
                  ["4100"],
                  ["4"],
                  ["126"],
                  ["449093"],
                  ["200000"],
                )
              ) {
                poderOrgao = "10131";
                codFontRecursosMSC = "2500";
                codAEO = "nan";
                ficha = "1193";
              } else if (
                verificarCod(
                  tipo11,
                  ["01"],
                  ["04"],
                  ["361"],
                  ["5001"],
                  ["1"],
                  ["102"],
                  ["449051"],
                  ["190000"],
                )
              ) {
                poderOrgao = "10131";
                codFontRecursosMSC = "1574";
                codAEO = "nan";
                ficha = "162";
              } else if (
                verificarCod(
                  tipo11,
                  ["01"],
                  ["04"],
                  ["361"],
                  ["5001"],
                  ["1"],
                  ["102"],
                  ["449051"],
                  ["280000"],
                )
              ) {
                poderOrgao = "10131";
                codFontRecursosMSC = "2706";
                codAEO = "3110";
                ficha = "1043";
              } else if (
                verificarCod(
                  tipo11,
                  ["01"],
                  ["04"],
                  ["361"],
                  ["5001"],
                  ["1"],
                  ["102"],
                  ["449051"],
                  ["180000"],
                )
              ) {
                poderOrgao = "10131";
                codFontRecursosMSC = "1706";
                codAEO = "3110";
                ficha = "1169";
              } else if (
                verificarCod(
                  tipo11,
                  ["01"],
                  ["15"],
                  ["451"],
                  ["4121"],
                  ["1"],
                  ["016"],
                  ["339030"],
                  ["170000"],
                )
              ) {
                poderOrgao = "10131";
                codFontRecursosMSC = "1705";
                codAEO = "nan";
                ficha = "166";
              } else if (
                verificarCod(
                  tipo11,
                  ["01"],
                  ["15"],
                  ["451"],
                  ["4121"],
                  ["1"],
                  ["016"],
                  ["339030"],
                  ["206000"],
                )
              ) {
                poderOrgao = "10131";
                codFontRecursosMSC = "2753";
                codAEO = "nan";
                ficha = "1081";
              } else if (
                verificarCod(
                  tipo11,
                  ["01"],
                  ["15"],
                  ["451"],
                  ["4121"],
                  ["1"],
                  ["016"],
                  ["339030"],
                  ["216000"],
                )
              ) {
                poderOrgao = "10131";
                codFontRecursosMSC = "2750";
                codAEO = "nan";
                ficha = "1082";
              } else if (
                verificarCod(
                  tipo11,
                  ["01"],
                  ["15"],
                  ["451"],
                  ["4121"],
                  ["1"],
                  ["016"],
                  ["339030"],
                  ["270000"],
                )
              ) {
                poderOrgao = "10131";
                codFontRecursosMSC = "2708";
                codAEO = "nan";
                ficha = "1083";
              } else if (
                verificarCod(
                  tipo11,
                  ["01"],
                  ["15"],
                  ["451"],
                  ["4121"],
                  ["1"],
                  ["016"],
                  ["339030"],
                  ["270000"],
                )
              ) {
                poderOrgao = "10131";
                codFontRecursosMSC = "2705";
                codAEO = "nan";
                ficha = "1084";
              } else if (
                verificarCod(
                  tipo11,
                  ["01"],
                  ["15"],
                  ["451"],
                  ["4121"],
                  ["1"],
                  ["016"],
                  ["339030"],
                  ["200000"],
                )
              ) {
                poderOrgao = "10131";
                codFontRecursosMSC = "2500";
                codAEO = "nan";
                ficha = "1203";
              } else if (
                verificarCod(
                  tipo11,
                  ["01"],
                  ["15"],
                  ["451"],
                  ["4121"],
                  ["1"],
                  ["016"],
                  ["449051"],
                  ["190000"],
                )
              ) {
                poderOrgao = "10131";
                codFontRecursosMSC = "1754";
                codAEO = "nan";
                ficha = "171";
              } else if (
                verificarCod(
                  tipo11,
                  ["01"],
                  ["15"],
                  ["451"],
                  ["4121"],
                  ["1"],
                  ["069"],
                  ["449051"],
                  ["190000"],
                )
              ) {
                poderOrgao = "10131";
                codFontRecursosMSC = "1754";
                codAEO = "nan";
                ficha = "175";
              } else if (
                verificarCod(
                  tipo11,
                  ["01"],
                  ["15"],
                  ["451"],
                  ["5128"],
                  ["2"],
                  ["342"],
                  ["449051"],
                  ["100000"],
                )
              ) {
                poderOrgao = "10131";
                codFontRecursosMSC = "1500";
                codAEO = "nan";
                ficha = "178";
              } else if (
                verificarCod(
                  tipo11,
                  ["01"],
                  ["15"],
                  ["451"],
                  ["5128"],
                  ["2"],
                  ["342"],
                  ["449051"],
                  ["181000"],
                )
              ) {
                poderOrgao = "10131";
                codFontRecursosMSC = "1706";
                codAEO = "3110";
                ficha = "179";
              } else if (
                verificarCod(
                  tipo11,
                  ["01"],
                  ["15"],
                  ["452"],
                  ["5128"],
                  ["2"],
                  ["341"],
                  ["319011"],
                  ["117000"],
                )
              ) {
                poderOrgao = "10131";
                codFontRecursosMSC = "1751";
                codAEO = "nan";
                ficha = "181";
              } else if (
                verificarCod(
                  tipo11,
                  ["01"],
                  ["15"],
                  ["452"],
                  ["5128"],
                  ["2"],
                  ["341"],
                  ["319011"],
                  ["117000"],
                )
              ) {
                poderOrgao = "10131";
                codFontRecursosMSC = "1751";
                codAEO = "nan";
                ficha = "181";
              } else if (
                verificarCod(
                  tipo11,
                  ["01"],
                  ["15"],
                  ["452"],
                  ["5128"],
                  ["2"],
                  ["341"],
                  ["339030"],
                  ["100000"],
                )
              ) {
                poderOrgao = "10131";
                codFontRecursosMSC = "1500";
                codAEO = "nan";
                ficha = "185";
              } else if (
                verificarCod(
                  tipo11,
                  ["01"],
                  ["15"],
                  ["452"],
                  ["5128"],
                  ["2"],
                  ["341"],
                  ["339030"],
                  ["117000"],
                )
              ) {
                poderOrgao = "10131";
                codFontRecursosMSC = "1751";
                codAEO = "nan";
                ficha = "186";
              } else if (
                verificarCod(
                  tipo11,
                  ["01"],
                  ["15"],
                  ["452"],
                  ["5128"],
                  ["2"],
                  ["341"],
                  ["339030"],
                  ["217000"],
                )
              ) {
                poderOrgao = "10131";
                codFontRecursosMSC = "2751";
                codAEO = "nan";
                ficha = "1194";
              } else if (
                verificarCod(
                  tipo11,
                  ["01"],
                  ["15"],
                  ["452"],
                  ["5128"],
                  ["2"],
                  ["341"],
                  ["339039"],
                  ["117000"],
                )
              ) {
                poderOrgao = "10131";
                codFontRecursosMSC = "1751";
                codAEO = "nan";
                ficha = "188";
              } else if (
                verificarCod(
                  tipo11,
                  ["01"],
                  ["15"],
                  ["452"],
                  ["5128"],
                  ["2"],
                  ["341"],
                  ["339046"],
                  ["117000"],
                )
              ) {
                poderOrgao = "10131";
                codFontRecursosMSC = "1751";
                codAEO = "nan";
                ficha = "189";
              } else if (
                verificarCod(
                  tipo11,
                  ["01"],
                  ["15"],
                  ["452"],
                  ["5128"],
                  ["2"],
                  ["341"],
                  ["339039"],
                  ["217000"],
                )
              ) {
                poderOrgao = "10131";
                codFontRecursosMSC = "2751";
                codAEO = "nan";
                ficha = "1195";
              } else if (
                verificarCod(
                  tipo11,
                  ["01"],
                  ["15"],
                  ["452"],
                  ["5128"],
                  ["2"],
                  ["341"],
                  ["339046"],
                  ["117000"],
                )
              ) {
                poderOrgao = "10131";
                codFontRecursosMSC = "1751";
                codAEO = "nan";
                ficha = "189";
              } else if (
                verificarCod(
                  tipo11,
                  ["01"],
                  ["15"],
                  ["452"],
                  ["5128"],
                  ["2"],
                  ["341"],
                  ["339049"],
                  ["117000"],
                )
              ) {
                poderOrgao = "10131";
                codFontRecursosMSC = "1751";
                codAEO = "nan";
                ficha = "190";
              } else if (
                verificarCod(
                  tipo11,
                  ["01"],
                  ["15"],
                  ["452"],
                  ["5128"],
                  ["2"],
                  ["341"],
                  ["449051"],
                  ["117000"],
                )
              ) {
                poderOrgao = "10131";
                codFontRecursosMSC = "1751";
                codAEO = "nan";
                ficha = "192";
              } else if (
                verificarCod(
                  tipo11,
                  ["01"],
                  ["04"],
                  ["122"],
                  ["4100"],
                  ["4"],
                  ["210"],
                  ["319011"],
                  ["100000"],
                )
              ) {
                poderOrgao = "10131";
                codFontRecursosMSC = "1500";
                codAEO = "nan";
                ficha = "196";
              } else if (
                verificarCod(
                  tipo11,
                  ["01"],
                  ["04"],
                  ["122"],
                  ["4100"],
                  ["4"],
                  ["210"],
                  ["319094"],
                  ["100000"],
                )
              ) {
                poderOrgao = "10131";
                codFontRecursosMSC = "1500";
                codAEO = "nan";
                ficha = "197";
              } else if (
                verificarCod(
                  tipo11,
                  ["01"],
                  ["04"],
                  ["122"],
                  ["4100"],
                  ["4"],
                  ["210"],
                  ["339036"],
                  ["100000"],
                )
              ) {
                poderOrgao = "10131";
                codFontRecursosMSC = "1500";
                codAEO = "nan";
                ficha = "202";
              } else if (
                verificarCod(
                  tipo11,
                  ["01"],
                  ["04"],
                  ["122"],
                  ["4100"],
                  ["4"],
                  ["210"],
                  ["339039"],
                  ["100000"],
                )
              ) {
                poderOrgao = "10131";
                codFontRecursosMSC = "1500";
                codAEO = "nan";
                ficha = "203";
              } else if (
                verificarCod(
                  tipo11,
                  ["01"],
                  ["04"],
                  ["122"],
                  ["4100"],
                  ["4"],
                  ["210"],
                  ["339049"],
                  ["100000"],
                )
              ) {
                poderOrgao = "10131";
                codFontRecursosMSC = "1500";
                codAEO = "nan";
                ficha = "205";
              } else if (
                verificarCod(
                  tipo11,
                  ["01"],
                  ["04"],
                  ["122"],
                  ["4100"],
                  ["4"],
                  ["215"],
                  ["339049"],
                  ["100000"],
                )
              ) {
                poderOrgao = "10131";
                codFontRecursosMSC = "1500";
                codAEO = "nan";
                ficha = "208";
              } else if (
                verificarCod(
                  tipo11,
                  ["01"],
                  ["04"],
                  ["122"],
                  ["4100"],
                  ["4"],
                  ["216"],
                  ["319011"],
                  ["100000"],
                )
              ) {
                poderOrgao = "10131";
                codFontRecursosMSC = "1500";
                codAEO = "nan";
                ficha = "209";
              } else if (
                verificarCod(
                  tipo11,
                  ["01"],
                  ["04"],
                  ["122"],
                  ["4100"],
                  ["4"],
                  ["216"],
                  ["319094"],
                  ["100000"],
                )
              ) {
                poderOrgao = "10131";
                codFontRecursosMSC = "1500";
                codAEO = "nan";
                ficha = "210";
              } else if (
                verificarCod(
                  tipo11,
                  ["01"],
                  ["04"],
                  ["122"],
                  ["4100"],
                  ["4"],
                  ["216"],
                  ["339008"],
                  ["100000"],
                )
              ) {
                poderOrgao = "10131";
                codFontRecursosMSC = "1500";
                codAEO = "nan";
                ficha = "211";
              } else if (
                verificarCod(
                  tipo11,
                  ["01"],
                  ["04"],
                  ["122"],
                  ["4100"],
                  ["4"],
                  ["216"],
                  ["339036"],
                  ["100000"],
                )
              ) {
                poderOrgao = "10131";
                codFontRecursosMSC = "1500";
                codAEO = "nan";
                ficha = "213";
              } else if (
                verificarCod(
                  tipo11,
                  ["01"],
                  ["04"],
                  ["122"],
                  ["4100"],
                  ["4"],
                  ["216"],
                  ["339046"],
                  ["100000"],
                )
              ) {
                poderOrgao = "10131";
                codFontRecursosMSC = "1500";
                codAEO = "nan";
                ficha = "215";
              } else if (
                verificarCod(
                  tipo11,
                  ["01"],
                  ["04"],
                  ["126"],
                  ["4100"],
                  ["4"],
                  ["212"],
                  ["319004"],
                  ["100000"],
                )
              ) {
                poderOrgao = "10131";
                codFontRecursosMSC = "1500";
                codAEO = "nan";
                ficha = "1177";
              } else if (
                verificarCod(
                  tipo11,
                  ["01"],
                  ["04"],
                  ["126"],
                  ["4100"],
                  ["4"],
                  ["212"],
                  ["319011"],
                  ["100000"],
                )
              ) {
                poderOrgao = "10131";
                codFontRecursosMSC = "1500";
                codAEO = "nan";
                ficha = "218";
              } else if (
                verificarCod(
                  tipo11,
                  ["01"],
                  ["04"],
                  ["126"],
                  ["4100"],
                  ["4"],
                  ["212"],
                  ["319094"],
                  ["100000"],
                )
              ) {
                poderOrgao = "10131";
                codFontRecursosMSC = "1500";
                codAEO = "nan";
                ficha = "219";
              } else if (
                verificarCod(
                  tipo11,
                  ["01"],
                  ["04"],
                  ["126"],
                  ["4100"],
                  ["4"],
                  ["212"],
                  ["319094"],
                  ["200089"],
                )
              ) {
                poderOrgao = "10131";
                codFontRecursosMSC = "2749";
                codAEO = "nan";
                ficha = "1023";
              } else if (
                verificarCod(
                  tipo11,
                  ["01"],
                  ["04"],
                  ["126"],
                  ["4100"],
                  ["4"],
                  ["212"],
                  ["339014"],
                  ["100000"],
                )
              ) {
                poderOrgao = "10131";
                codFontRecursosMSC = "1500";
                codAEO = "nan";
                ficha = "221";
              } else if (
                verificarCod(
                  tipo11,
                  ["01"],
                  ["04"],
                  ["126"],
                  ["4100"],
                  ["4"],
                  ["212"],
                  ["319094"],
                  ["200000"],
                )
              ) {
                poderOrgao = "10131";
                codFontRecursosMSC = "2749";
                codAEO = "nan";
                ficha = "1023";
              } else if (
                verificarCod(
                  tipo11,
                  ["01"],
                  ["04"],
                  ["126"],
                  ["4100"],
                  ["4"],
                  ["212"],
                  ["339030"],
                  ["100000"],
                )
              ) {
                poderOrgao = "10131";
                codFontRecursosMSC = "1500";
                codAEO = "nan";
                ficha = "222";
              } else if (
                verificarCod(
                  tipo11,
                  ["01"],
                  ["04"],
                  ["126"],
                  ["4100"],
                  ["4"],
                  ["212"],
                  ["339033"],
                  ["100000"],
                )
              ) {
                poderOrgao = "10131";
                codFontRecursosMSC = "1500";
                codAEO = "nan";
                ficha = "223";
              } else if (
                verificarCod(
                  tipo11,
                  ["01"],
                  ["04"],
                  ["126"],
                  ["4100"],
                  ["4"],
                  ["212"],
                  ["339036"],
                  ["100000"],
                )
              ) {
                poderOrgao = "10131";
                codFontRecursosMSC = "1500";
                codAEO = "nan";
                ficha = "225";
              } else if (
                verificarCod(
                  tipo11,
                  ["01"],
                  ["04"],
                  ["126"],
                  ["4100"],
                  ["4"],
                  ["212"],
                  ["339039"],
                  ["100000"],
                )
              ) {
                poderOrgao = "10131";
                codFontRecursosMSC = "1500";
                codAEO = "nan";
                ficha = "226";
              } else if (
                verificarCod(
                  tipo11,
                  ["01"],
                  ["04"],
                  ["126"],
                  ["4100"],
                  ["4"],
                  ["212"],
                  ["339039"],
                  ["200000"],
                )
              ) {
                poderOrgao = "10131";
                codFontRecursosMSC = "2500";
                codAEO = "nan";
                ficha = "1208";
              } else if (
                verificarCod(
                  tipo11,
                  ["01"],
                  ["04"],
                  ["126"],
                  ["4100"],
                  ["4"],
                  ["212"],
                  ["339040"],
                  ["100000"],
                )
              ) {
                poderOrgao = "10131";
                codFontRecursosMSC = "1500";
                codAEO = "nan";
                ficha = "227";
              } else if (
                verificarCod(
                  tipo11,
                  ["01"],
                  ["04"],
                  ["126"],
                  ["4100"],
                  ["4"],
                  ["212"],
                  ["339041"],
                  ["100000"],
                )
              ) {
                poderOrgao = "10131";
                codFontRecursosMSC = "1500";
                codAEO = "nan";
                ficha = "1072";
              } else if (
                verificarCod(
                  tipo11,
                  ["01"],
                  ["04"],
                  ["126"],
                  ["4100"],
                  ["4"],
                  ["212"],
                  ["339046"],
                  ["100000"],
                )
              ) {
                poderOrgao = "10131";
                codFontRecursosMSC = "1500";
                codAEO = "nan";
                ficha = "228";
              } else if (
                verificarCod(
                  tipo11,
                  ["01"],
                  ["04"],
                  ["126"],
                  ["4100"],
                  ["4"],
                  ["212"],
                  ["339047"],
                  ["100000"],
                )
              ) {
                poderOrgao = "10131";
                codFontRecursosMSC = "1500";
                codAEO = "nan";
                ficha = "1201";
              } else if (
                verificarCod(
                  tipo11,
                  ["01"],
                  ["04"],
                  ["126"],
                  ["4100"],
                  ["4"],
                  ["212"],
                  ["339049"],
                  ["100000"],
                )
              ) {
                poderOrgao = "10131";
                codFontRecursosMSC = "1500";
                codAEO = "nan";
                ficha = "229";
              } else if (
                verificarCod(
                  tipo11,
                  ["01"],
                  ["04"],
                  ["126"],
                  ["4100"],
                  ["4"],
                  ["212"],
                  ["449052"],
                  ["100000"],
                )
              ) {
                poderOrgao = "10131";
                codFontRecursosMSC = "1500";
                codAEO = "nan";
                ficha = "232";
              } else if (
                verificarCod(
                  tipo11,
                  ["01"],
                  ["04"],
                  ["122"],
                  ["4100"],
                  ["4"],
                  ["214"],
                  ["319011"],
                  ["100000"],
                )
              ) {
                poderOrgao = "10131";
                codFontRecursosMSC = "1500";
                codAEO = "nan";
                ficha = "233";
              } else if (
                verificarCod(
                  tipo11,
                  ["01"],
                  ["04"],
                  ["122"],
                  ["4100"],
                  ["4"],
                  ["214"],
                  ["319094"],
                  ["100000"],
                )
              ) {
                poderOrgao = "10131";
                codFontRecursosMSC = "1500";
                codAEO = "nan";
                ficha = "234";
              } else if (
                verificarCod(
                  tipo11,
                  ["01"],
                  ["04"],
                  ["126"],
                  ["4100"],
                  ["4"],
                  ["214"],
                  ["339030"],
                  ["100000"],
                )
              ) {
                poderOrgao = "10131";
                codFontRecursosMSC = "1500";
                codAEO = "nan";
                ficha = "236";
              } else if (
                verificarCod(
                  tipo11,
                  ["01"],
                  ["04"],
                  ["122"],
                  ["4100"],
                  ["4"],
                  ["214"],
                  ["339039"],
                  ["100000"],
                )
              ) {
                poderOrgao = "10131";
                codFontRecursosMSC = "1500";
                codAEO = "nan";
                ficha = "239";
              } else if (
                verificarCod(
                  tipo11,
                  ["01"],
                  ["04"],
                  ["122"],
                  ["4100"],
                  ["4"],
                  ["214"],
                  ["339049"],
                  ["100000"],
                )
              ) {
                poderOrgao = "10131";
                codFontRecursosMSC = "1500";
                codAEO = "nan";
                ficha = "241";
              } else if (
                verificarCod(
                  tipo11,
                  ["01"],
                  ["16"],
                  ["482"],
                  ["5112"],
                  ["1"],
                  ["078"],
                  ["449051"],
                  ["190024"],
                )
              ) {
                poderOrgao = "10131";
                codFontRecursosMSC = "1754";
                codAEO = "nan";
                ficha = "250";
              } else if (
                verificarCod(
                  tipo11,
                  ["01"],
                  ["04"],
                  ["122"],
                  ["4100"],
                  ["4"],
                  ["215"],
                  ["319011"],
                  ["100000"],
                )
              ) {
                poderOrgao = "10131";
                codFontRecursosMSC = "1500";
                codAEO = "nan";
                ficha = "252";
              } else if (
                verificarCod(
                  tipo11,
                  ["01"],
                  ["04"],
                  ["122"],
                  ["4100"],
                  ["4"],
                  ["215"],
                  ["319011"],
                  ["200089"],
                )
              ) {
                poderOrgao = "10131";
                codFontRecursosMSC = "2749";
                codAEO = "nan";
                ficha = "1011";
              } else if (
                verificarCod(
                  tipo11,
                  ["01"],
                  ["04"],
                  ["122"],
                  ["4100"],
                  ["4"],
                  ["215"],
                  ["319094"],
                  ["100000", "100089"],
                )
              ) {
                poderOrgao = "10131";
                codFontRecursosMSC = "1500";
                codAEO = "nan";
                ficha = "253";
              } else if (
                verificarCod(
                  tipo11,
                  ["01"],
                  ["04"],
                  ["122"],
                  ["4100"],
                  ["4"],
                  ["215"],
                  ["339036"],
                  ["100000"],
                )
              ) {
                poderOrgao = "10131";
                codFontRecursosMSC = "1500";
                codAEO = "nan";
                ficha = "258";
              } else if (
                verificarCod(
                  tipo11,
                  ["01"],
                  ["04"],
                  ["122"],
                  ["4100"],
                  ["4"],
                  ["215"],
                  ["339046"],
                  ["100000"],
                )
              ) {
                poderOrgao = "10131";
                codFontRecursosMSC = "1500";
                codAEO = "nan";
                ficha = "260";
              } else if (
                verificarCod(
                  tipo11,
                  ["01"],
                  ["04"],
                  ["122"],
                  ["4100"],
                  ["4"],
                  ["215"],
                  ["339049"],
                  ["100000"],
                )
              ) {
                poderOrgao = "10131";
                codFontRecursosMSC = "1500";
                codAEO = "nan";
                ficha = "261";
              } else if (
                verificarCod(
                  tipo11,
                  ["01"],
                  ["04"],
                  ["122"],
                  ["4100"],
                  ["4"],
                  ["218"],
                  ["319094"],
                  ["100000"],
                )
              ) {
                poderOrgao = "10131";
                codFontRecursosMSC = "1500";
                codAEO = "nan";
                ficha = "1176";
              } else if (
                verificarCod(
                  tipo11,
                  ["01"],
                  ["04"],
                  ["122"],
                  ["4100"],
                  ["4"],
                  ["218"],
                  ["319011"],
                  ["100000"],
                )
              ) {
                poderOrgao = "10131";
                codFontRecursosMSC = "1500";
                codAEO = "nan";
                ficha = "263";
              } else if (
                verificarCod(
                  tipo11,
                  ["01"],
                  ["04"],
                  ["122"],
                  ["4100"],
                  ["4"],
                  ["218"],
                  ["319094"],
                  ["100000"],
                )
              ) {
                poderOrgao = "10131";
                codFontRecursosMSC = "1500";
                codAEO = "nan";
                ficha = "264";
              } else if (
                verificarCod(
                  tipo11,
                  ["01"],
                  ["04"],
                  ["122"],
                  ["4100"],
                  ["4"],
                  ["218"],
                  ["339030"],
                  ["100000"],
                )
              ) {
                poderOrgao = "10131";
                codFontRecursosMSC = "1500";
                codAEO = "nan";
                ficha = "267";
              } else if (
                verificarCod(
                  tipo11,
                  ["01"],
                  ["04"],
                  ["122"],
                  ["4100"],
                  ["4"],
                  ["218"],
                  ["339036"],
                  ["100000"],
                )
              ) {
                poderOrgao = "10131";
                codFontRecursosMSC = "1500";
                codAEO = "nan";
                ficha = "269";
              } else if (
                verificarCod(
                  tipo11,
                  ["01"],
                  ["04"],
                  ["122"],
                  ["4100"],
                  ["4"],
                  ["218"],
                  ["339039"],
                  ["100000"],
                )
              ) {
                poderOrgao = "10131";
                codFontRecursosMSC = "1500";
                codAEO = "nan";
                ficha = "270";
              } else if (
                verificarCod(
                  tipo11,
                  ["01"],
                  ["04"],
                  ["122"],
                  ["4100"],
                  ["4"],
                  ["218"],
                  ["339046"],
                  ["100000"],
                )
              ) {
                poderOrgao = "10131";
                codFontRecursosMSC = "1500";
                codAEO = "nan";
                ficha = "271";
              } else if (
                verificarCod(
                  tipo11,
                  ["01"],
                  ["04"],
                  ["122"],
                  ["4100"],
                  ["4"],
                  ["218"],
                  ["339049"],
                  ["100000"],
                )
              ) {
                poderOrgao = "10131";
                codFontRecursosMSC = "1500";
                codAEO = "nan";
                ficha = "272";
              } else if (
                verificarCod(
                  tipo11,
                  ["01"],
                  ["04"],
                  ["122"],
                  ["4100"],
                  ["4"],
                  ["218"],
                  ["449052"],
                  ["100000"],
                )
              ) {
                poderOrgao = "10131";
                codFontRecursosMSC = "1500";
                codAEO = "nan";
                ficha = "274";
              } else if (
                verificarCod(
                  tipo11,
                  ["01"],
                  ["04"],
                  ["124"],
                  ["4100"],
                  ["4"],
                  ["218"],
                  ["319011"],
                  ["100000"],
                )
              ) {
                poderOrgao = "10131";
                codFontRecursosMSC = "1500";
                codAEO = "nan";
                ficha = "275";
              } else if (
                verificarCod(
                  tipo11,
                  ["01"],
                  ["04"],
                  ["124"],
                  ["4100"],
                  ["4"],
                  ["147"],
                  ["339039"],
                  ["100000"],
                )
              ) {
                poderOrgao = "10131";
                codFontRecursosMSC = "1500";
                codAEO = "nan";
                ficha = "283";
              } else if (
                verificarCod(
                  tipo11,
                  ["01"],
                  ["04"],
                  ["124"],
                  ["4100"],
                  ["4"],
                  ["147"],
                  ["339046"],
                  ["100000"],
                )
              ) {
                poderOrgao = "10131";
                codFontRecursosMSC = "1500";
                codAEO = "nan";
                ficha = "284";
              } else if (
                verificarCod(
                  tipo11,
                  ["01"],
                  ["04"],
                  ["124"],
                  ["4100"],
                  ["4"],
                  ["147"],
                  ["339049"],
                  ["100000"],
                )
              ) {
                poderOrgao = "10131";
                codFontRecursosMSC = "1500";
                codAEO = "nan";
                ficha = "285";
              } else if (
                verificarCod(
                  tipo11,
                  ["01"],
                  ["04"],
                  ["124"],
                  ["4100"],
                  ["4"],
                  ["147"],
                  ["339093"],
                  ["100000"],
                )
              ) {
                poderOrgao = "10131";
                codFontRecursosMSC = "1500";
                codAEO = "nan";
                ficha = "1087";
              } else if (
                verificarCod(
                  tipo11,
                  ["01"],
                  ["04"],
                  ["122"],
                  ["4100"],
                  ["4"],
                  ["133"],
                  ["319011"],
                  ["100000"],
                )
              ) {
                poderOrgao = "10131";
                codFontRecursosMSC = "1500";
                codAEO = "nan";
                ficha = "287";
              } else if (
                verificarCod(
                  tipo11,
                  ["01"],
                  ["04"],
                  ["122"],
                  ["4100"],
                  ["4"],
                  ["133"],
                  ["319016"],
                  ["144000"],
                )
              ) {
                poderOrgao = "10131";
                codFontRecursosMSC = "1501";
                codAEO = "nan";
                ficha = "288";
              } else if (
                verificarCod(
                  tipo11,
                  ["01"],
                  ["04"],
                  ["122"],
                  ["4100"],
                  ["4"],
                  ["133"],
                  ["319016"],
                  ["244000"],
                )
              ) {
                poderOrgao = "10131";
                codFontRecursosMSC = "2501";
                codAEO = "nan";
                ficha = "1014";
              } else if (
                verificarCod(
                  tipo11,
                  ["01"],
                  ["04"],
                  ["122"],
                  ["4100"],
                  ["4"],
                  ["133"],
                  ["319094"],
                  ["100000", "100089"],
                )
              ) {
                poderOrgao = "10131";
                codFontRecursosMSC = "1500";
                codAEO = "nan";
                ficha = "289";
              } else if (
                verificarCod(
                  tipo11,
                  ["01"],
                  ["04"],
                  ["122"],
                  ["4100"],
                  ["4"],
                  ["133"],
                  ["339036"],
                  ["100000"],
                )
              ) {
                poderOrgao = "10131";
                codFontRecursosMSC = "1500";
                codAEO = "nan";
                ficha = "294";
              } else if (
                verificarCod(
                  tipo11,
                  ["01"],
                  ["04"],
                  ["122"],
                  ["4100"],
                  ["4"],
                  ["133"],
                  ["339039"],
                  ["100000"],
                )
              ) {
                poderOrgao = "10131";
                codFontRecursosMSC = "1500";
                codAEO = "nan";
                ficha = "295";
              } else if (
                verificarCod(
                  tipo11,
                  ["01"],
                  ["04"],
                  ["122"],
                  ["4100"],
                  ["4"],
                  ["133"],
                  ["339039"],
                  ["244000"],
                )
              ) {
                poderOrgao = "10131";
                codFontRecursosMSC = "2501";
                codAEO = "nan";
                ficha = "1002";
              } else if (
                verificarCod(
                  tipo11,
                  ["01"],
                  ["04"],
                  ["122"],
                  ["4100"],
                  ["4"],
                  ["133"],
                  ["339040"],
                  ["100000"],
                )
              ) {
                poderOrgao = "10131";
                codFontRecursosMSC = "1500";
                codAEO = "nan";
                ficha = "296";
              } else if (
                verificarCod(
                  tipo11,
                  ["01"],
                  ["04"],
                  ["122"],
                  ["4100"],
                  ["4"],
                  ["133"],
                  ["339046"],
                  ["100000"],
                )
              ) {
                poderOrgao = "10131";
                codFontRecursosMSC = "1500";
                codAEO = "nan";
                ficha = "297";
              } else if (
                verificarCod(
                  tipo11,
                  ["01"],
                  ["04"],
                  ["122"],
                  ["4100"],
                  ["4"],
                  ["133"],
                  ["339049"],
                  ["100000"],
                )
              ) {
                poderOrgao = "10131";
                codFontRecursosMSC = "1500";
                codAEO = "nan";
                ficha = "298";
              } else if (
                verificarCod(
                  tipo11,
                  ["01"],
                  ["04"],
                  ["122"],
                  ["4100"],
                  ["4"],
                  ["133"],
                  ["339091"],
                  ["100000"],
                )
              ) {
                poderOrgao = "10131";
                codFontRecursosMSC = "1500";
                codAEO = "nan";
                ficha = "299";
              } else if (
                verificarCod(
                  tipo11,
                  ["01"],
                  ["06"],
                  ["122"],
                  ["4100"],
                  ["4"],
                  ["130"],
                  ["319004"],
                  ["100000"],
                )
              ) {
                poderOrgao = "10131";
                codFontRecursosMSC = "1500";
                codAEO = "nan";
                ficha = "1178";
              } else if (
                verificarCod(
                  tipo11,
                  ["01"],
                  ["06"],
                  ["122"],
                  ["4100"],
                  ["4"],
                  ["130"],
                  ["319011"],
                  ["100000"],
                )
              ) {
                poderOrgao = "10131";
                codFontRecursosMSC = "1500";
                codAEO = "nan";
                ficha = "301";
              } else if (
                verificarCod(
                  tipo11,
                  ["01"],
                  ["06"],
                  ["122"],
                  ["4100"],
                  ["4"],
                  ["130"],
                  ["319011"],
                  ["200089"],
                )
              ) {
                poderOrgao = "10131";
                codFontRecursosMSC = "2749";
                codAEO = "nan";
                ficha = "1008";
              } else if (
                verificarCod(
                  tipo11,
                  ["01"],
                  ["06"],
                  ["122"],
                  ["4100"],
                  ["4"],
                  ["130"],
                  ["319094"],
                  ["100000"],
                )
              ) {
                poderOrgao = "10131";
                codFontRecursosMSC = "1500";
                codAEO = "nan";
                ficha = "302";
              } else if (
                verificarCod(
                  tipo11,
                  ["01"],
                  ["06"],
                  ["122"],
                  ["4100"],
                  ["4"],
                  ["130"],
                  ["339014"],
                  ["100000"],
                )
              ) {
                poderOrgao = "10131";
                codFontRecursosMSC = "1500";
                codAEO = "nan";
                ficha = "304";
              } else if (
                verificarCod(
                  tipo11,
                  ["01"],
                  ["06"],
                  ["122"],
                  ["4100"],
                  ["4"],
                  ["130"],
                  ["339030"],
                  ["100000"],
                )
              ) {
                poderOrgao = "10131";
                codFontRecursosMSC = "1500";
                codAEO = "nan";
                ficha = "305";
              } else if (
                verificarCod(
                  tipo11,
                  ["01"],
                  ["06"],
                  ["122"],
                  ["4100"],
                  ["4"],
                  ["130"],
                  ["339033"],
                  ["100000"],
                )
              ) {
                poderOrgao = "10131";
                codFontRecursosMSC = "1500";
                codAEO = "nan";
                ficha = "307";
              } else if (
                verificarCod(
                  tipo11,
                  ["01"],
                  ["06"],
                  ["122"],
                  ["4100"],
                  ["4"],
                  ["130"],
                  ["339036"],
                  ["100000"],
                )
              ) {
                poderOrgao = "10131";
                codFontRecursosMSC = "1500";
                codAEO = "nan";
                ficha = "308";
              } else if (
                verificarCod(
                  tipo11,
                  ["01"],
                  ["06"],
                  ["122"],
                  ["4100"],
                  ["4"],
                  ["130"],
                  ["339039"],
                  ["100000"],
                )
              ) {
                poderOrgao = "10131";
                codFontRecursosMSC = "1500";
                codAEO = "nan";
                ficha = "309";
              } else if (
                verificarCod(
                  tipo11,
                  ["01"],
                  ["06"],
                  ["122"],
                  ["4100"],
                  ["4"],
                  ["130"],
                  ["339046"],
                  ["100000"],
                )
              ) {
                poderOrgao = "10131";
                codFontRecursosMSC = "1500";
                codAEO = "nan";
                ficha = "310";
              } else if (
                verificarCod(
                  tipo11,
                  ["01"],
                  ["06"],
                  ["122"],
                  ["4100"],
                  ["4"],
                  ["130"],
                  ["339049"],
                  ["100000"],
                )
              ) {
                poderOrgao = "10131";
                codFontRecursosMSC = "1500";
                codAEO = "nan";
                ficha = "311";
              } else if (
                verificarCod(
                  tipo11,
                  ["01"],
                  ["06"],
                  ["122"],
                  ["4100"],
                  ["4"],
                  ["130"],
                  ["339093"],
                  ["100000"],
                )
              ) {
                poderOrgao = "10131";
                codFontRecursosMSC = "1500";
                codAEO = "nan";
                ficha = "312";
              } else if (
                verificarCod(
                  tipo11,
                  ["01"],
                  ["06"],
                  ["122"],
                  ["4100"],
                  ["4"],
                  ["130"],
                  ["449052"],
                  ["100000"],
                )
              ) {
                poderOrgao = "10131";
                codFontRecursosMSC = "1500";
                codAEO = "nan";
                ficha = "314";
              } else if (
                verificarCod(
                  tipo11,
                  ["01"],
                  ["06"],
                  ["122"],
                  ["4100"],
                  ["4"],
                  ["130"],
                  ["449052"],
                  ["137000"],
                )
              ) {
                poderOrgao = "10131";
                codFontRecursosMSC = "1710";
                codAEO = "3210";
                ficha = "1158";
              } else if (
                verificarCod(
                  tipo11,
                  ["01"],
                  ["06"],
                  ["122"],
                  ["4100"],
                  ["4"],
                  ["130"],
                  ["449052"],
                  ["237000"],
                )
              ) {
                poderOrgao = "10131";
                codFontRecursosMSC = "2710";
                codAEO = "3210";
                ficha = "1159";
              } else if (
                verificarCod(
                  tipo11,
                  ["01"],
                  ["04"],
                  ["122"],
                  ["4100"],
                  ["4"],
                  ["079"],
                  ["319004"],
                  ["100000"],
                )
              ) {
                poderOrgao = "10131";
                codFontRecursosMSC = "1500";
                codAEO = "nan";
                ficha = "1179";
              } else if (
                verificarCod(
                  tipo11,
                  ["01"],
                  ["04"],
                  ["122"],
                  ["4100"],
                  ["4"],
                  ["079"],
                  ["319011"],
                  ["100000"],
                )
              ) {
                poderOrgao = "10131";
                codFontRecursosMSC = "1500";
                codAEO = "nan";
                ficha = "315";
              } else if (
                verificarCod(
                  tipo11,
                  ["01"],
                  ["04"],
                  ["122"],
                  ["4100"],
                  ["4"],
                  ["079"],
                  ["319011"],
                  ["200089"],
                )
              ) {
                poderOrgao = "10131";
                codFontRecursosMSC = "2749";
                codAEO = "nan";
                ficha = "1012";
              } else if (
                verificarCod(
                  tipo11,
                  ["01"],
                  ["04"],
                  ["122"],
                  ["4100"],
                  ["4"],
                  ["079"],
                  ["319094"],
                  ["100000"],
                )
              ) {
                poderOrgao = "10131";
                codFontRecursosMSC = "1500";
                codAEO = "nan";
                ficha = "316";
              } else if (
                verificarCod(
                  tipo11,
                  ["01"],
                  ["04"],
                  ["122"],
                  ["4100"],
                  ["4"],
                  ["079"],
                  ["339008"],
                  ["100000"],
                )
              ) {
                poderOrgao = "10131";
                codFontRecursosMSC = "1500";
                codAEO = "nan";
                ficha = "318";
              } else if (
                verificarCod(
                  tipo11,
                  ["01"],
                  ["04"],
                  ["122"],
                  ["4100"],
                  ["4"],
                  ["079"],
                  ["339014"],
                  ["100000"],
                )
              ) {
                poderOrgao = "10131";
                codFontRecursosMSC = "1500";
                codAEO = "nan";
                ficha = "319";
              } else if (
                verificarCod(
                  tipo11,
                  ["01"],
                  ["04"],
                  ["122"],
                  ["4100"],
                  ["4"],
                  ["079"],
                  ["339030"],
                  ["100000"],
                )
              ) {
                poderOrgao = "10131";
                codFontRecursosMSC = "1500";
                codAEO = "nan";
                ficha = "320";
              } else if (
                verificarCod(
                  tipo11,
                  ["01"],
                  ["04"],
                  ["122"],
                  ["4100"],
                  ["4"],
                  ["079"],
                  ["339030"],
                  ["123000"],
                )
              ) {
                poderOrgao = "10131";
                codFontRecursosMSC = "1700";
                codAEO = "nan";
                ficha = "1105";
              } else if (
                verificarCod(
                  tipo11,
                  ["01"],
                  ["04"],
                  ["122"],
                  ["4100"],
                  ["4"],
                  ["079"],
                  ["339030"],
                  ["200000"],
                )
              ) {
                poderOrgao = "10131";
                codFontRecursosMSC = "2500";
                codAEO = "nan";
                ficha = "1107";
              } else if (
                verificarCod(
                  tipo11,
                  ["01"],
                  ["04"],
                  ["122"],
                  ["4100"],
                  ["4"],
                  ["079"],
                  ["339030"],
                  ["220000"],
                )
              ) {
                poderOrgao = "10131";
                codFontRecursosMSC = "2570";
                codAEO = "nan";
                ficha = "1108";
              } else if (
                verificarCod(
                  tipo11,
                  ["01"],
                  ["04"],
                  ["122"],
                  ["4100"],
                  ["4"],
                  ["079"],
                  ["339030"],
                  ["223000"],
                )
              ) {
                poderOrgao = "10131";
                codFontRecursosMSC = "2700";
                codAEO = "nan";
                ficha = "1110";
              } else if (
                verificarCod(
                  tipo11,
                  ["01"],
                  ["04"],
                  ["122"],
                  ["4100"],
                  ["4"],
                  ["079"],
                  ["339030"],
                  ["237000"],
                )
              ) {
                poderOrgao = "10131";
                codFontRecursosMSC = "2710";
                codAEO = "3210";
                ficha = "1111";
              } else if (
                verificarCod(
                  tipo11,
                  ["01"],
                  ["04"],
                  ["122"],
                  ["4100"],
                  ["4"],
                  ["079"],
                  ["339036"],
                  ["100000"],
                )
              ) {
                poderOrgao = "10131";
                codFontRecursosMSC = "1500";
                codAEO = "nan";
                ficha = "324";
              } else if (
                verificarCod(
                  tipo11,
                  ["01"],
                  ["04"],
                  ["122"],
                  ["4100"],
                  ["4"],
                  ["079"],
                  ["339039"],
                  ["100000"],
                )
              ) {
                poderOrgao = "10131";
                codFontRecursosMSC = "1500";
                codAEO = "nan";
                ficha = "325";
              } else if (
                verificarCod(
                  tipo11,
                  ["01"],
                  ["04"],
                  ["122"],
                  ["4100"],
                  ["4"],
                  ["079"],
                  ["339049"],
                  ["100000"],
                )
              ) {
                poderOrgao = "10131";
                codFontRecursosMSC = "1500";
                codAEO = "nan";
                ficha = "328";
              } else if (
                verificarCod(
                  tipo11,
                  ["01"],
                  ["04"],
                  ["122"],
                  ["4100"],
                  ["4"],
                  ["079"],
                  ["339093"],
                  ["100000"],
                )
              ) {
                poderOrgao = "10131";
                codFontRecursosMSC = "1500";
                codAEO = "nan";
                ficha = "330";
              } else if (
                verificarCod(
                  tipo11,
                  ["01"],
                  ["04"],
                  ["122"],
                  ["4100"],
                  ["4"],
                  ["079"],
                  ["449052"],
                  ["237000"],
                )
              ) {
                poderOrgao = "10131";
                codFontRecursosMSC = "2710";
                codAEO = "nan";
                ficha = "1112";
              } else if (
                verificarCod(
                  tipo11,
                  ["01"],
                  ["04"],
                  ["122"],
                  ["4100"],
                  ["4"],
                  ["079"],
                  ["449052"],
                  ["137000"],
                )
              ) {
                poderOrgao = "10131";
                codFontRecursosMSC = "1710";
                codAEO = "3210";
                ficha = "1150";
              } else if (
                verificarCod(
                  tipo11,
                  ["01"],
                  ["134"],
                  ["392"],
                  ["5006"],
                  ["4"],
                  ["199"],
                  ["339030"],
                  ["100000"],
                )
              ) {
                poderOrgao = "10131";
                codFontRecursosMSC = "1500";
                codAEO = "nan";
                ficha = "333";
              } else if (
                verificarCod(
                  tipo11,
                  ["01"],
                  ["13"],
                  ["392"],
                  ["5006"],
                  ["4"],
                  ["199"],
                  ["339036"],
                  ["100000"],
                )
              ) {
                poderOrgao = "10131";
                codFontRecursosMSC = "1500";
                codAEO = "nan";
                ficha = "336";
              } else if (
                verificarCod(
                  tipo11,
                  ["01"],
                  ["13"],
                  ["392"],
                  ["5006"],
                  ["4"],
                  ["199"],
                  ["339039"],
                  ["100000"],
                )
              ) {
                poderOrgao = "10131";
                codFontRecursosMSC = "1500";
                codAEO = "nan";
                ficha = "337";
              } else if (
                verificarCod(
                  tipo11,
                  ["01"],
                  ["13"],
                  ["392"],
                  ["5006"],
                  ["4"],
                  ["199"],
                  ["339039"],
                  ["237000"],
                )
              ) {
                poderOrgao = "10131";
                codFontRecursosMSC = "2710";
                codAEO = "3210";
                ficha = "1088";
              } else if (
                verificarCod(
                  tipo11,
                  ["01"],
                  ["13"],
                  ["392"],
                  ["5006"],
                  ["4"],
                  ["199"],
                  ["339039"],
                  ["137000"],
                )
              ) {
                poderOrgao = "10131";
                codFontRecursosMSC = "1710";
                codAEO = "3210";
                ficha = "1235";
              } else if (
                verificarCod(
                  tipo11,
                  ["01"],
                  ["13"],
                  ["392"],
                  ["5006"],
                  ["4"],
                  ["199"],
                  ["339036"],
                  ["100000"],
                )
              ) {
                poderOrgao = "10131";
                codFontRecursosMSC = "1500";
                codAEO = "nan";
                ficha = "336";
              }
            }
            // 05 - IAMESC - INSTITUTO DE ASSISTÊNCIA A SAÚDE DO SERVIDOR PÚBLICO
            if (tipo11.codOrgao === "05") {
              if (
                verificarCod(
                  tipo11,
                  ["02"],
                  ["04"],
                  ["122"],
                  ["4100"],
                  ["4"],
                  ["193"],
                  ["319011"],
                  ["158000"],
                )
              ) {
                poderOrgao = "10131";
                codFontRecursosMSC = "1659";
                codAEO = "nan";
                ficha = "347";
              } else if (
                verificarCod(
                  tipo11,
                  ["02"],
                  ["04"],
                  ["122"],
                  ["4100"],
                  ["4"],
                  ["193"],
                  ["319013"],
                  ["158000"],
                )
              ) {
                poderOrgao = "10131";
                codFontRecursosMSC = "1659";
                codAEO = "nan";
                ficha = "348";
              } else if (
                verificarCod(
                  tipo11,
                  ["02"],
                  ["04"],
                  ["122"],
                  ["4100"],
                  ["4"],
                  ["193"],
                  ["319094"],
                  ["158000"],
                )
              ) {
                poderOrgao = "10131";
                codFontRecursosMSC = "1659";
                codAEO = "nan";
                ficha = "349";
              } else if (
                verificarCod(
                  tipo11,
                  ["02"],
                  ["04"],
                  ["122"],
                  ["4100"],
                  ["4"],
                  ["193"],
                  ["319113"],
                  ["158000"],
                )
              ) {
                poderOrgao = "10131";
                codFontRecursosMSC = "1659";
                codAEO = "nan";
                ficha = "351";
              } else if (
                verificarCod(
                  tipo11,
                  ["02"],
                  ["04"],
                  ["122"],
                  ["4100"],
                  ["4"],
                  ["193"],
                  ["339014"],
                  ["158000"],
                )
              ) {
                poderOrgao = "10131";
                codFontRecursosMSC = "1659";
                codAEO = "nan";
                ficha = "355";
              } else if (
                verificarCod(
                  tipo11,
                  ["02"],
                  ["04"],
                  ["122"],
                  ["4100"],
                  ["4"],
                  ["193"],
                  ["339030"],
                  ["158000"],
                )
              ) {
                poderOrgao = "10131";
                codFontRecursosMSC = "1659";
                codAEO = "nan";
                ficha = "356";
              } else if (
                verificarCod(
                  tipo11,
                  ["02"],
                  ["04"],
                  ["122"],
                  ["4100"],
                  ["4"],
                  ["193"],
                  ["339034"],
                  ["158000"],
                )
              ) {
                poderOrgao = "10131";
                codFontRecursosMSC = "1659";
                codAEO = "nan";
                ficha = "358";
              } else if (
                verificarCod(
                  tipo11,
                  ["02"],
                  ["04"],
                  ["122"],
                  ["4100"],
                  ["4"],
                  ["193"],
                  ["339036"],
                  ["158000"],
                )
              ) {
                poderOrgao = "10131";
                codFontRecursosMSC = "1659";
                codAEO = "nan";
                ficha = "359";
              } else if (
                verificarCod(
                  tipo11,
                  ["02"],
                  ["04"],
                  ["122"],
                  ["4100"],
                  ["4"],
                  ["193"],
                  ["339039"],
                  ["158000"],
                )
              ) {
                poderOrgao = "10131";
                codFontRecursosMSC = "1659";
                codAEO = "nan";
                ficha = "360";
              } else if (
                verificarCod(
                  tipo11,
                  ["02"],
                  ["04"],
                  ["122"],
                  ["4100"],
                  ["4"],
                  ["193"],
                  ["339040"],
                  ["158000"],
                )
              ) {
                poderOrgao = "10131";
                codFontRecursosMSC = "1659";
                codAEO = "nan";
                ficha = "361";
              } else if (
                verificarCod(
                  tipo11,
                  ["02"],
                  ["04"],
                  ["122"],
                  ["4100"],
                  ["4"],
                  ["193"],
                  ["339047"],
                  ["158000"],
                )
              ) {
                poderOrgao = "10131";
                codFontRecursosMSC = "1659";
                codAEO = "nan";
                ficha = "363";
              } else if (
                verificarCod(
                  tipo11,
                  ["02"],
                  ["04"],
                  ["122"],
                  ["4100"],
                  ["4"],
                  ["193"],
                  ["339049"],
                  ["158000"],
                )
              ) {
                poderOrgao = "10131";
                codFontRecursosMSC = "1659";
                codAEO = "nan";
                ficha = "364";
              } else if (
                verificarCod(
                  tipo11,
                  ["02"],
                  ["04"],
                  ["122"],
                  ["4100"],
                  ["4"],
                  ["193"],
                  ["339091"],
                  ["158000"],
                )
              ) {
                poderOrgao = "10131";
                codFontRecursosMSC = "1659";
                codAEO = "nan";
                ficha = "365";
              } else if (
                verificarCod(
                  tipo11,
                  ["02"],
                  ["04"],
                  ["122"],
                  ["4100"],
                  ["4"],
                  ["193"],
                  ["339091"],
                  ["258000"],
                )
              ) {
                poderOrgao = "10131";
                codFontRecursosMSC = "2659";
                codAEO = "nan";
                ficha = "1128";
              } else if (
                verificarCod(
                  tipo11,
                  ["02"],
                  ["04"],
                  ["122"],
                  ["4100"],
                  ["4"],
                  ["193"],
                  ["339093"],
                  ["158000"],
                )
              ) {
                poderOrgao = "10131";
                codFontRecursosMSC = "1659";
                codAEO = "nan";
                ficha = "367";
              } else if (
                verificarCod(
                  tipo11,
                  ["02"],
                  ["04"],
                  ["122"],
                  ["4100"],
                  ["4"],
                  ["193"],
                  ["339197"],
                  ["158000"],
                )
              ) {
                poderOrgao = "10131";
                codFontRecursosMSC = "1659";
                codAEO = "nan";
                ficha = "368";
              } else if (
                verificarCod(
                  tipo11,
                  ["02"],
                  ["04"],
                  ["122"],
                  ["4100"],
                  ["4"],
                  ["193"],
                  ["449052"],
                  ["158000"],
                )
              ) {
                poderOrgao = "10131";
                codFontRecursosMSC = "1659";
                codAEO = "nan";
                ficha = "369";
              } else if (
                verificarCod(
                  tipo11,
                  ["02"],
                  ["04"],
                  ["122"],
                  ["4100"],
                  ["4"],
                  ["193"],
                  ["449052"],
                  ["212000"],
                )
              ) {
                poderOrgao = "10131";
                codFontRecursosMSC = "2659";
                codAEO = "nan";
                ficha = "1186";
              } else if (
                verificarCod(
                  tipo11,
                  ["02"],
                  ["04"],
                  ["122"],
                  ["4100"],
                  ["4"],
                  ["193"],
                  ["469071"],
                  ["158000"],
                )
              ) {
                poderOrgao = "10131";
                codFontRecursosMSC = "1659";
                codAEO = "nan";
                ficha = "370";
              } else if (
                verificarCod(
                  tipo11,
                  ["02"],
                  ["04"],
                  ["122"],
                  ["4100"],
                  ["4"],
                  ["193"],
                  ["339091"],
                  ["158000"],
                )
              ) {
                poderOrgao = "10131";
                codFontRecursosMSC = "1659";
                codAEO = "nan";
                ficha = "371";
              } else if (
                verificarCod(
                  tipo11,
                  ["02"],
                  ["10"],
                  ["302"],
                  ["4150"],
                  ["2"],
                  ["007"],
                  ["339036"],
                  ["158000"],
                )
              ) {
                poderOrgao = "10131";
                codFontRecursosMSC = "1659";
                codAEO = "nan";
                ficha = "376";
              } else if (
                verificarCod(
                  tipo11,
                  ["02"],
                  ["10"],
                  ["302"],
                  ["4150"],
                  ["2"],
                  ["007"],
                  ["339039"],
                  ["158000"],
                )
              ) {
                poderOrgao = "10131";
                codFontRecursosMSC = "1659";
                codAEO = "nan";
                ficha = "377";
              } else if (
                verificarCod(
                  tipo11,
                  ["02"],
                  ["10"],
                  ["302"],
                  ["4150"],
                  ["2"],
                  ["007"],
                  ["339039"],
                  ["258000"],
                )
              ) {
                poderOrgao = "10131";
                codFontRecursosMSC = "2659";
                codAEO = "nan";
                ficha = "1126";
              }
            }
            // 06 - FUNDEB - SENADOR CANEDO
            if (tipo11.codOrgao === "06") {
              if (
                verificarCod(
                  tipo11,
                  ["02"],
                  ["12"],
                  ["361"],
                  ["5002"],
                  ["3"],
                  ["006"],
                  ["319011"],
                  ["118000"],
                )
              ) {
                poderOrgao = "10131";
                codFontRecursosMSC = "1540";
                codAEO = "nan";
                ficha = "378";
              } else if (
                verificarCod(
                  tipo11,
                  ["02"],
                  ["12"],
                  ["365"],
                  ["5002"],
                  ["3"],
                  ["007"],
                  ["319011"],
                  ["118000"],
                )
              ) {
                poderOrgao = "10131";
                codFontRecursosMSC = "1540";
                codAEO = "nan";
                ficha = "392";
              } else if (
                verificarCod(
                  tipo11,
                  ["02"],
                  ["12"],
                  ["366"],
                  ["5005"],
                  ["3"],
                  ["008"],
                  ["319011"],
                  ["118000"],
                )
              ) {
                poderOrgao = "10131";
                codFontRecursosMSC = "1540";
                codAEO = "nan";
                ficha = "404";
              } else if (
                verificarCod(
                  tipo11,
                  ["02"],
                  ["12"],
                  ["361"],
                  ["5002"],
                  ["3"],
                  ["006"],
                  ["319094"],
                  ["118000"],
                )
              ) {
                poderOrgao = "10131";
                codFontRecursosMSC = "1540";
                codAEO = "nan";
                ficha = "379";
              } else if (
                verificarCod(
                  tipo11,
                  ["02"],
                  ["12"],
                  ["365"],
                  ["5002"],
                  ["3"],
                  ["007"],
                  ["319094"],
                  ["118000"],
                )
              ) {
                poderOrgao = "10131";
                codFontRecursosMSC = "1540";
                codAEO = "nan";
                ficha = "393";
              } else if (
                verificarCod(
                  tipo11,
                  ["02"],
                  ["12"],
                  ["366"],
                  ["5005"],
                  ["3"],
                  ["008"],
                  ["319094"],
                  ["118000"],
                )
              ) {
                poderOrgao = "10131";
                codFontRecursosMSC = "1540";
                codAEO = "nan";
                ficha = "405";
              } else if (
                verificarCod(
                  tipo11,
                  ["02"],
                  ["12"],
                  ["361"],
                  ["5002"],
                  ["3"],
                  ["006"],
                  ["319113"],
                  ["118000"],
                )
              ) {
                poderOrgao = "10131";
                codFontRecursosMSC = "1540";
                codAEO = "nan";
                ficha = "380";
              } else if (
                verificarCod(
                  tipo11,
                  ["02"],
                  ["12"],
                  ["361"],
                  ["5002"],
                  ["3"],
                  ["007"],
                  ["319113"],
                  ["118000"],
                )
              ) {
                poderOrgao = "10131";
                codFontRecursosMSC = "1540";
                codAEO = "nan";
                ficha = "394";
              } else if (
                verificarCod(
                  tipo11,
                  ["02"],
                  ["12"],
                  ["366"],
                  ["5002"],
                  ["3"],
                  ["007"],
                  ["319113"],
                  ["118000"],
                )
              ) {
                poderOrgao = "10131";
                codFontRecursosMSC = "1540";
                codAEO = "nan";
                ficha = "406";
              } else if (
                verificarCod(
                  tipo11,
                  ["02"],
                  ["12"],
                  ["361"],
                  ["5002"],
                  ["3"],
                  ["006"],
                  ["339008"],
                  ["118000"],
                )
              ) {
                poderOrgao = "10131";
                codFontRecursosMSC = "1540";
                codAEO = "1070";
                ficha = "381";
              } else if (
                verificarCod(
                  tipo11,
                  ["02"],
                  ["12"],
                  ["365"],
                  ["5002"],
                  ["3"],
                  ["007"],
                  ["339008"],
                  ["118000"],
                )
              ) {
                poderOrgao = "10131";
                codFontRecursosMSC = "1540";
                codAEO = "1070";
                ficha = "395";
              } else if (
                verificarCod(
                  tipo11,
                  ["02"],
                  ["12"],
                  ["361"],
                  ["5002"],
                  ["3"],
                  ["006"],
                  ["339030"],
                  ["219000"],
                )
              ) {
                poderOrgao = "10131";
                codFontRecursosMSC = "2540";
                codAEO = "nan";
                ficha = "985";
              } else if (
                verificarCod(
                  tipo11,
                  ["02"],
                  ["12"],
                  ["361"],
                  ["5002"],
                  ["3"],
                  ["006"],
                  ["339030"],
                  ["287000"],
                )
              ) {
                poderOrgao = "10131";
                codFontRecursosMSC = "2543";
                codAEO = "nan";
                ficha = "1048";
              } else if (
                verificarCod(
                  tipo11,
                  ["02"],
                  ["12"],
                  ["365"],
                  ["5002"],
                  ["3"],
                  ["007"],
                  ["339030"],
                  ["287000"],
                )
              ) {
                poderOrgao = "10131";
                codFontRecursosMSC = "2543";
                codAEO = "nan";
                ficha = "1050";
              } else if (
                verificarCod(
                  tipo11,
                  ["02"],
                  ["12"],
                  ["361"],
                  ["5002"],
                  ["3"],
                  ["006"],
                  ["339032"],
                  ["219000"],
                )
              ) {
                poderOrgao = "10131";
                codFontRecursosMSC = "2540";
                codAEO = "nan";
                ficha = "987";
              } else if (
                verificarCod(
                  tipo11,
                  ["02"],
                  ["12"],
                  ["365"],
                  ["5002"],
                  ["3"],
                  ["007"],
                  ["339032"],
                  ["219000"],
                )
              ) {
                poderOrgao = "10131";
                codFontRecursosMSC = "2540";
                codAEO = "nan";
                ficha = "988";
              } else if (
                verificarCod(
                  tipo11,
                  ["02"],
                  ["12"],
                  ["361"],
                  ["5002"],
                  ["3"],
                  ["006"],
                  ["339032"],
                  ["119000"],
                )
              ) {
                poderOrgao = "10131";
                codFontRecursosMSC = "1540";
                codAEO = "nan";
                ficha = "1054";
              } else if (
                verificarCod(
                  tipo11,
                  ["02"],
                  ["12"],
                  ["361"],
                  ["5002"],
                  ["3"],
                  ["006"],
                  ["339039"],
                  ["119000"],
                )
              ) {
                poderOrgao = "10131";
                codFontRecursosMSC = "1540";
                codAEO = "1070";
                ficha = "383";
              } else if (
                verificarCod(
                  tipo11,
                  ["02"],
                  ["12"],
                  ["361"],
                  ["5002"],
                  ["3"],
                  ["006"],
                  ["339039"],
                  ["118000"],
                )
              ) {
                poderOrgao = "10131";
                codFontRecursosMSC = "1543";
                codAEO = "nan";
                ficha = "8008";
              } else if (
                verificarCod(
                  tipo11,
                  ["02"],
                  ["12"],
                  ["361"],
                  ["5002"],
                  ["3"],
                  ["006"],
                  ["339049"],
                  ["118000"],
                )
              ) {
                poderOrgao = "10131";
                codFontRecursosMSC = "1540";
                codAEO = "1070";
                ficha = "387";
              } else if (
                verificarCod(
                  tipo11,
                  ["02"],
                  ["12"],
                  ["365"],
                  ["5002"],
                  ["3"],
                  ["007"],
                  ["339049"],
                  ["118000"],
                )
              ) {
                poderOrgao = "10131";
                codFontRecursosMSC = "1540";
                codAEO = "1070";
                ficha = "401";
              } else if (
                verificarCod(
                  tipo11,
                  ["02"],
                  ["12"],
                  ["365"],
                  ["5002"],
                  ["3"],
                  ["007"],
                  ["339049"],
                  ["118000"],
                )
              ) {
                poderOrgao = "10131";
                codFontRecursosMSC = "1540";
                codAEO = "1070";
                ficha = "409";
              } else if (
                verificarCod(
                  tipo11,
                  ["02"],
                  ["12"],
                  ["361"],
                  ["5002"],
                  ["3"],
                  ["006"],
                  ["339197"],
                  ["118000"],
                )
              ) {
                poderOrgao = "10131";
                codFontRecursosMSC = "1540";
                codAEO = "1070";
                ficha = "388";
              } else if (
                verificarCod(
                  tipo11,
                  ["02"],
                  ["12"],
                  ["361"],
                  ["5002"],
                  ["3"],
                  ["006"],
                  ["449052"],
                  ["119000"],
                )
              ) {
                poderOrgao = "10131";
                codFontRecursosMSC = "1540";
                codAEO = "nan";
                ficha = "390";
              } else if (
                verificarCod(
                  tipo11,
                  ["02"],
                  ["12"],
                  ["361"],
                  ["5002"],
                  ["3"],
                  ["006"],
                  ["449052"],
                  ["187000"],
                )
              ) {
                poderOrgao = "10131";
                codFontRecursosMSC = "1543";
                codAEO = "nan";
                ficha = "391";
              } else if (
                verificarCod(
                  tipo11,
                  ["02"],
                  ["12"],
                  ["365"],
                  ["5002"],
                  ["3"],
                  ["007"],
                  ["449052"],
                  ["187000"],
                )
              ) {
                poderOrgao = "10131";
                codFontRecursosMSC = "1543";
                codAEO = "nan";
                ficha = "403";
              } else if (
                verificarCod(
                  tipo11,
                  ["02"],
                  ["12"],
                  ["366"],
                  ["5005"],
                  ["3"],
                  ["008"],
                  ["449052"],
                  ["119000"],
                )
              ) {
                poderOrgao = "10131";
                codFontRecursosMSC = "1540";
                codAEO = "nan";
                ficha = "410";
              } else if (
                verificarCod(
                  tipo11,
                  ["02"],
                  ["12"],
                  ["361"],
                  ["5002"],
                  ["3"],
                  ["006"],
                  ["449052"],
                  ["286000"],
                )
              ) {
                poderOrgao = "10131";
                codFontRecursosMSC = "2542";
                codAEO = "nan";
                ficha = "1049";
              } else if (
                verificarCod(
                  tipo11,
                  ["02"],
                  ["12"],
                  ["365"],
                  ["5002"],
                  ["3"],
                  ["007"],
                  ["449052"],
                  ["286000"],
                )
              ) {
                poderOrgao = "10131";
                codFontRecursosMSC = "2542";
                codAEO = "nan";
                ficha = "1051";
              } else if (
                verificarCod(
                  tipo11,
                  ["02"],
                  ["12"],
                  ["361"],
                  ["5002"],
                  ["3"],
                  ["006"],
                  ["449052"],
                  ["219000"],
                )
              ) {
                poderOrgao = "10131";
                codFontRecursosMSC = "2540";
                codAEO = "nan";
                ficha = "1069";
              } else if (
                verificarCod(
                  tipo11,
                  ["02"],
                  ["12"],
                  ["361"],
                  ["5002"],
                  ["3"],
                  ["006"],
                  ["449052"],
                  ["187000"],
                )
              ) {
                poderOrgao = "10131";
                codFontRecursosMSC = "1543";
                codAEO = "nan";
                ficha = "8008";
              } else if (
                verificarCod(
                  tipo11,
                  ["02"],
                  ["12"],
                  ["365"],
                  ["5002"],
                  ["3"],
                  ["007"],
                  ["449052"],
                  ["186000"],
                )
              ) {
                poderOrgao = "10131";
                codFontRecursosMSC = "1542";
                codAEO = "nan";
                ficha = "8008";
              } else if (
                verificarCod(
                  tipo11,
                  ["02"],
                  ["12"],
                  ["365"],
                  ["5002"],
                  ["3"],
                  ["007"],
                  ["449052"],
                  ["286000"],
                )
              ) {
                poderOrgao = "10131";
                codFontRecursosMSC = "2542";
                codAEO = "nan";
                ficha = "8008";
              }
            }
            // 07 - SENAPREV
            if (tipo11.codOrgao === "07") {
              if (
                verificarCod(
                  tipo11,
                  ["01"],
                  ["09"],
                  ["122"],
                  ["4100"],
                  ["4"],
                  ["201"],
                  ["319011"],
                  ["177000"],
                )
              ) {
                poderOrgao = "10132";
                codFontRecursosMSC = "1802";
                codAEO = "nan";
                ficha = "411";
              } else if (
                verificarCod(
                  tipo11,
                  ["01"],
                  ["09"],
                  ["122"],
                  ["4100"],
                  ["4"],
                  ["201"],
                  ["319013"],
                  ["177000"],
                )
              ) {
                poderOrgao = "10131";
                codFontRecursosMSC = "1802";
                codAEO = "nan";
                ficha = "412";
              } else if (
                verificarCod(
                  tipo11,
                  ["01"],
                  ["09"],
                  ["122"],
                  ["4100"],
                  ["4"],
                  ["201"],
                  ["319094"],
                  ["177000"],
                )
              ) {
                poderOrgao = "10131";
                codFontRecursosMSC = "1802";
                codAEO = "nan";
                ficha = "413";
              } else if (
                verificarCod(
                  tipo11,
                  ["01"],
                  ["09"],
                  ["122"],
                  ["4100"],
                  ["4"],
                  ["201"],
                  ["319113"],
                  ["177000"],
                )
              ) {
                poderOrgao = "10131";
                codFontRecursosMSC = "1802";
                codAEO = "nan";
                ficha = "414";
              } else if (
                verificarCod(
                  tipo11,
                  ["01"],
                  ["09"],
                  ["122"],
                  ["4100"],
                  ["4"],
                  ["201"],
                  ["339008"],
                  ["177000"],
                )
              ) {
                poderOrgao = "10131";
                codFontRecursosMSC = "1802";
                codAEO = "nan";
                ficha = "417";
              } else if (
                verificarCod(
                  tipo11,
                  ["01"],
                  ["09"],
                  ["122"],
                  ["4100"],
                  ["4"],
                  ["201"],
                  ["339014"],
                  ["177000"],
                )
              ) {
                poderOrgao = "10131";
                codFontRecursosMSC = "1802";
                codAEO = "nan";
                ficha = "418";
              } else if (
                verificarCod(
                  tipo11,
                  ["01"],
                  ["09"],
                  ["122"],
                  ["4100"],
                  ["4"],
                  ["201"],
                  ["339030"],
                  ["177000"],
                )
              ) {
                poderOrgao = "10131";
                codFontRecursosMSC = "1802";
                codAEO = "nan";
                ficha = "419";
              } else if (
                verificarCod(
                  tipo11,
                  ["01"],
                  ["09"],
                  ["122"],
                  ["4100"],
                  ["4"],
                  ["201"],
                  ["339033"],
                  ["177000"],
                )
              ) {
                poderOrgao = "10131";
                codFontRecursosMSC = "1802";
                codAEO = "nan";
                ficha = "420";
              } else if (
                verificarCod(
                  tipo11,
                  ["01"],
                  ["09"],
                  ["122"],
                  ["4100"],
                  ["4"],
                  ["201"],
                  ["339034"],
                  ["177000"],
                )
              ) {
                poderOrgao = "10131";
                codFontRecursosMSC = "1802";
                codAEO = "nan";
                ficha = "421";
              } else if (
                verificarCod(
                  tipo11,
                  ["01"],
                  ["09"],
                  ["122"],
                  ["4100"],
                  ["4"],
                  ["201"],
                  ["339035"],
                  ["177000"],
                )
              ) {
                poderOrgao = "10131";
                codFontRecursosMSC = "1802";
                codAEO = "nan";
                ficha = "422";
              } else if (
                verificarCod(
                  tipo11,
                  ["01"],
                  ["09"],
                  ["122"],
                  ["4100"],
                  ["4"],
                  ["201"],
                  ["339036"],
                  ["177000"],
                )
              ) {
                poderOrgao = "10131";
                codFontRecursosMSC = "1802";
                codAEO = "nan";
                ficha = "423";
              } else if (
                verificarCod(
                  tipo11,
                  ["01"],
                  ["09"],
                  ["122"],
                  ["4100"],
                  ["4"],
                  ["201"],
                  ["339039"],
                  ["177000"],
                )
              ) {
                poderOrgao = "10131";
                codFontRecursosMSC = "1802";
                codAEO = "nan";
                ficha = "424";
              } else if (
                verificarCod(
                  tipo11,
                  ["01"],
                  ["09"],
                  ["122"],
                  ["4100"],
                  ["4"],
                  ["201"],
                  ["339040"],
                  ["177000"],
                )
              ) {
                poderOrgao = "10131";
                codFontRecursosMSC = "1802";
                codAEO = "nan";
                ficha = "425";
              } else if (
                verificarCod(
                  tipo11,
                  ["01"],
                  ["09"],
                  ["122"],
                  ["4100"],
                  ["4"],
                  ["201"],
                  ["339041"],
                  ["177000"],
                )
              ) {
                poderOrgao = "10131";
                codFontRecursosMSC = "1802";
                codAEO = "nan";
                ficha = "1056";
              } else if (
                verificarCod(
                  tipo11,
                  ["01"],
                  ["09"],
                  ["122"],
                  ["4100"],
                  ["4"],
                  ["201"],
                  ["339047"],
                  ["177000"],
                )
              ) {
                poderOrgao = "10131";
                codFontRecursosMSC = "1802";
                codAEO = "nan";
                ficha = "427";
              } else if (
                verificarCod(
                  tipo11,
                  ["01"],
                  ["09"],
                  ["122"],
                  ["4100"],
                  ["4"],
                  ["201"],
                  ["339049"],
                  ["177000"],
                )
              ) {
                poderOrgao = "10131";
                codFontRecursosMSC = "1802";
                codAEO = "nan";
                ficha = "428";
              } else if (
                verificarCod(
                  tipo11,
                  ["01"],
                  ["09"],
                  ["122"],
                  ["4100"],
                  ["4"],
                  ["201"],
                  ["339093"],
                  ["103000"],
                )
              ) {
                poderOrgao = "10131";
                codFontRecursosMSC = "1800";
                codAEO = "nan";
                ficha = "431";
              } else if (
                verificarCod(
                  tipo11,
                  ["01"],
                  ["09"],
                  ["122"],
                  ["4100"],
                  ["4"],
                  ["201"],
                  ["339093"],
                  ["177000"],
                )
              ) {
                poderOrgao = "10131";
                codFontRecursosMSC = "1802";
                codAEO = "nan";
                ficha = "432";
              } else if (
                verificarCod(
                  tipo11,
                  ["01"],
                  ["09"],
                  ["122"],
                  ["4100"],
                  ["4"],
                  ["201"],
                  ["339197"],
                  ["177000"],
                )
              ) {
                poderOrgao = "10131";
                codFontRecursosMSC = "1802";
                codAEO = "nan";
                ficha = "433";
              } else if (
                verificarCod(
                  tipo11,
                  ["01"],
                  ["09"],
                  ["122"],
                  ["4100"],
                  ["4"],
                  ["201"],
                  ["449052"],
                  ["177000"],
                )
              ) {
                poderOrgao = "10131";
                codFontRecursosMSC = "1802";
                codAEO = "nan";
                ficha = "434";
              } else if (
                verificarCod(
                  tipo11,
                  ["01"],
                  ["09"],
                  ["122"],
                  ["4100"],
                  ["4"],
                  ["201"],
                  ["469071"],
                  ["177000"],
                )
              ) {
                poderOrgao = "10131";
                codFontRecursosMSC = "1802";
                codAEO = "nan";
                ficha = "435";
              } else if (
                verificarCod(
                  tipo11,
                  ["01"],
                  ["09"],
                  ["122"],
                  ["4153"],
                  ["1"],
                  ["701"],
                  ["449051"],
                  ["177000"],
                )
              ) {
                poderOrgao = "10131";
                codFontRecursosMSC = "1802";
                codAEO = "nan";
                ficha = "436";
              } else if (
                verificarCod(
                  tipo11,
                  ["01"],
                  ["09"],
                  ["122"],
                  ["4153"],
                  ["1"],
                  ["701"],
                  ["449051"],
                  ["277000"],
                )
              ) {
                poderOrgao = "10131";
                codFontRecursosMSC = "2802";
                codAEO = "nan";
                ficha = "1062";
              } else if (
                verificarCod(
                  tipo11,
                  ["01"],
                  ["09"],
                  ["271"],
                  ["4153"],
                  ["1"],
                  ["040"],
                  ["449052"],
                  ["177000"],
                )
              ) {
                poderOrgao = "10131";
                codFontRecursosMSC = "1802";
                codAEO = "nan";
                ficha = "438";
              } else if (
                verificarCod(
                  tipo11,
                  ["01"],
                  ["09"],
                  ["271"],
                  ["4153"],
                  ["1"],
                  ["040"],
                  ["449052"],
                  ["277000"],
                )
              ) {
                poderOrgao = "10131";
                codFontRecursosMSC = "2802";
                codAEO = "nan";
                ficha = "1077";
              } else if (
                verificarCod(
                  tipo11,
                  ["01"],
                  ["09"],
                  ["272"],
                  ["4152"],
                  ["2"],
                  ["008"],
                  ["319001"],
                  ["103000"],
                )
              ) {
                poderOrgao = "10131";
                codFontRecursosMSC = "1800";
                codAEO = "1111";
                ficha = "439";
              } else if (
                verificarCod(
                  tipo11,
                  ["01"],
                  ["09"],
                  ["272"],
                  ["4152"],
                  ["2"],
                  ["008"],
                  ["319003"],
                  ["103000"],
                )
              ) {
                poderOrgao = "10131";
                codFontRecursosMSC = "1800";
                codAEO = "1111";
                ficha = "440";
              } else if (
                verificarCod(
                  tipo11,
                  ["01"],
                  ["09"],
                  ["846"],
                  ["4108"],
                  ["9"],
                  ["024"],
                  ["339091"],
                  ["177000"],
                )
              ) {
                poderOrgao = "10131";
                codFontRecursosMSC = "1802";
                codAEO = "nan";
                ficha = "441";
              } else if (
                verificarCod(
                  tipo11,
                  ["01"],
                  ["09"],
                  ["122"],
                  ["4100"],
                  ["4"],
                  ["201"],
                  ["319013"],
                  ["277000"],
                )
              ) {
                poderOrgao = "10131";
                codFontRecursosMSC = "2802";
                codAEO = "nan";
                ficha = "8009";
              }
            }
            // 08 - FEMBOM - FUNDO ESPECIAL MUN. PARA FRAÇAO DE BOMBEIRO
            if (tipo11.codOrgao === "08") {
              if (
                verificarCod(
                  tipo11,
                  ["01"],
                  ["06"],
                  ["182"],
                  ["0678"],
                  ["1"],
                  ["001"],
                  ["449052"],
                  ["110000"],
                )
              ) {
                poderOrgao = "10131";
                codFontRecursosMSC = "1759";
                codAEO = "nan";
                ficha = "444";
              } else if (
                verificarCod(
                  tipo11,
                  ["01"],
                  ["06"],
                  ["182"],
                  ["0678"],
                  ["2"],
                  ["002"],
                  ["339030"],
                  ["110000"],
                )
              ) {
                poderOrgao = "10131";
                codFontRecursosMSC = "1759";
                codAEO = "nan";
                ficha = "446";
              } else if (
                verificarCod(
                  tipo11,
                  ["01"],
                  ["06"],
                  ["182"],
                  ["0678"],
                  ["2"],
                  ["002"],
                  ["339030"],
                  ["210000"],
                )
              ) {
                poderOrgao = "10131";
                codFontRecursosMSC = "2759";
                codAEO = "nan";
                ficha = "1120";
              } else if (
                verificarCod(
                  tipo11,
                  ["01"],
                  ["06"],
                  ["182"],
                  ["0678"],
                  ["2"],
                  ["002"],
                  ["339039"],
                  ["110000"],
                )
              ) {
                poderOrgao = "10131";
                codFontRecursosMSC = "1759";
                codAEO = "nan";
                ficha = "449";
              } else if (
                verificarCod(
                  tipo11,
                  ["01"],
                  ["06"],
                  ["182"],
                  ["0678"],
                  ["2"],
                  ["002"],
                  ["339040"],
                  ["110000"],
                )
              ) {
                poderOrgao = "10131";
                codFontRecursosMSC = "1759";
                codAEO = "nan";
                ficha = "450";
              } else if (
                verificarCod(
                  tipo11,
                  ["01"],
                  ["06"],
                  ["182"],
                  ["0678"],
                  ["2"],
                  ["002"],
                  ["339039"],
                  ["210000"],
                )
              ) {
                poderOrgao = "10131";
                codFontRecursosMSC = "2759";
                codAEO = "nan";
                ficha = "1103";
              } else if (
                verificarCod(
                  tipo11,
                  ["01"],
                  ["06"],
                  ["182"],
                  ["0678"],
                  ["2"],
                  ["002"],
                  ["339040"],
                  ["110000"],
                )
              ) {
                poderOrgao = "10131";
                codFontRecursosMSC = "1759";
                codAEO = "nan";
                ficha = "450";
              } else if (
                verificarCod(
                  tipo11,
                  ["01"],
                  ["06"],
                  ["182"],
                  ["0678"],
                  ["2"],
                  ["002"],
                  ["339092"],
                  ["110000"],
                )
              ) {
                poderOrgao = "10131";
                codFontRecursosMSC = "1759";
                codAEO = "nan";
                ficha = "1171";
              }
            }
            // 09 - FMS = FUNDO MUNICIPAL DE SAÚDE
            if (tipo11.codOrgao === "09") {
              if (
                verificarCod(
                  tipo11,
                  ["01"],
                  ["10"],
                  ["122"],
                  ["4100"],
                  ["2"],
                  ["016"],
                  ["319004"],
                  ["102000"],
                )
              ) {
                poderOrgao = "10131";
                codFontRecursosMSC = "1500";
                codAEO = "1002";
                ficha = "451";
              } else if (
                verificarCod(
                  tipo11,
                  ["01"],
                  ["10"],
                  ["122"],
                  ["4100"],
                  ["2"],
                  ["016"],
                  ["319004"],
                  ["107008"],
                )
              ) {
                poderOrgao = "10131";
                codFontRecursosMSC = "1600";
                codAEO = "nan";
                ficha = "1089";
              } else if (
                verificarCod(
                  tipo11,
                  ["01"],
                  ["10"],
                  ["122"],
                  ["4100"],
                  ["2"],
                  ["016"],
                  ["319004"],
                  ["107017"],
                )
              ) {
                poderOrgao = "10131";
                codFontRecursosMSC = "1600";
                codAEO = "nan";
                ficha = "1090";
              } else if (
                verificarCod(
                  tipo11,
                  ["01"],
                  ["10"],
                  ["122"],
                  ["4100"],
                  ["2"],
                  ["016"],
                  ["319004"],
                  ["107011"],
                )
              ) {
                poderOrgao = "10131";
                codFontRecursosMSC = "1600";
                codAEO = "nan";
                ficha = "1137";
              } else if (
                verificarCod(
                  tipo11,
                  ["01"],
                  ["10"],
                  ["122"],
                  ["4100"],
                  ["2"],
                  ["016"],
                  ["319004"],
                  ["207062"],
                )
              ) {
                poderOrgao = "10131";
                codFontRecursosMSC = "2600";
                codAEO = "nan";
                ficha = "1138";
              } else if (
                verificarCod(
                  tipo11,
                  ["01"],
                  ["10"],
                  ["122"],
                  ["4100"],
                  ["2"],
                  ["016"],
                  ["319007"],
                  ["102000"],
                )
              ) {
                poderOrgao = "10131";
                codFontRecursosMSC = "1500";
                codAEO = "1002";
                ficha = "1213";
              } else if (
                verificarCod(
                  tipo11,
                  ["01"],
                  ["10"],
                  ["122"],
                  ["4100"],
                  ["2"],
                  ["016"],
                  ["319011"],
                  ["102000"],
                )
              ) {
                poderOrgao = "10131";
                codFontRecursosMSC = "1500";
                codAEO = "1002";
                ficha = "452";
              } else if (
                verificarCod(
                  tipo11,
                  ["01"],
                  ["10"],
                  ["122"],
                  ["4100"],
                  ["2"],
                  ["016"],
                  ["319013"],
                  ["102000"],
                )
              ) {
                poderOrgao = "10131";
                codFontRecursosMSC = "1500";
                codAEO = "1002";
                ficha = "453";
              } else if (
                verificarCod(
                  tipo11,
                  ["01"],
                  ["10"],
                  ["122"],
                  ["4100"],
                  ["2"],
                  ["016"],
                  ["319016"],
                  ["107097"],
                )
              ) {
                poderOrgao = "10131";
                codFontRecursosMSC = "1605";
                codAEO = "nan";
                ficha = "454";
              } else if (
                verificarCod(
                  tipo11,
                  ["01"],
                  ["10"],
                  ["122"],
                  ["4100"],
                  ["2"],
                  ["016"],
                  ["319016"],
                  ["207097"],
                )
              ) {
                poderOrgao = "10131";
                codFontRecursosMSC = "207097";
                codAEO = "nan";
                ficha = "1001";
              } else if (
                verificarCod(
                  tipo11,
                  ["01"],
                  ["10"],
                  ["122"],
                  ["4100"],
                  ["2"],
                  ["016"],
                  ["319094"],
                  ["102000"],
                )
              ) {
                poderOrgao = "10131";
                codFontRecursosMSC = "1500";
                codAEO = "1002";
                ficha = "455";
              } else if (
                verificarCod(
                  tipo11,
                  ["01"],
                  ["10"],
                  ["122"],
                  ["4100"],
                  ["2"],
                  ["016"],
                  ["319094"],
                  ["107008"],
                )
              ) {
                poderOrgao = "10131";
                codFontRecursosMSC = "1600";
                codAEO = "nan";
                ficha = "1196";
              } else if (
                verificarCod(
                  tipo11,
                  ["01"],
                  ["10"],
                  ["122"],
                  ["4100"],
                  ["2"],
                  ["016"],
                  ["319094"],
                  ["107017"],
                )
              ) {
                poderOrgao = "10131";
                codFontRecursosMSC = "1600";
                codAEO = "nan";
                ficha = "1197";
              } else if (
                verificarCod(
                  tipo11,
                  ["01"],
                  ["10"],
                  ["122"],
                  ["4100"],
                  ["2"],
                  ["016"],
                  ["319094"],
                  ["207062"],
                )
              ) {
                poderOrgao = "10131";
                codFontRecursosMSC = "2600";
                codAEO = "nan";
                ficha = "1212";
              } else if (
                verificarCod(
                  tipo11,
                  ["01"],
                  ["10"],
                  ["122"],
                  ["4100"],
                  ["2"],
                  ["016"],
                  ["319094"],
                  ["107011"],
                )
              ) {
                poderOrgao = "10131";
                codFontRecursosMSC = "1600";
                codAEO = "nan";
                ficha = "1228";
              } else if (
                verificarCod(
                  tipo11,
                  ["01"],
                  ["10"],
                  ["122"],
                  ["4100"],
                  ["2"],
                  ["016"],
                  ["319113"],
                  ["102000"],
                )
              ) {
                poderOrgao = "10131";
                codFontRecursosMSC = "1500";
                codAEO = "1002";
                ficha = "456";
              } else if (
                verificarCod(
                  tipo11,
                  ["01"],
                  ["10"],
                  ["122"],
                  ["4100"],
                  ["2"],
                  ["016"],
                  ["319008"],
                  ["102000"],
                )
              ) {
                poderOrgao = "10131";
                codFontRecursosMSC = "1500";
                codAEO = "1002";
                ficha = "457";
              } else if (
                verificarCod(
                  tipo11,
                  ["01"],
                  ["10"],
                  ["122"],
                  ["4100"],
                  ["2"],
                  ["016"],
                  ["339014"],
                  ["102000"],
                )
              ) {
                poderOrgao = "10131";
                codFontRecursosMSC = "1500";
                codAEO = "1002";
                ficha = "458";
              } else if (
                verificarCod(
                  tipo11,
                  ["01"],
                  ["10"],
                  ["122"],
                  ["4100"],
                  ["2"],
                  ["016"],
                  ["339030"],
                  ["102000"],
                )
              ) {
                poderOrgao = "10131";
                codFontRecursosMSC = "1500";
                codAEO = "1002";
                ficha = "459";
              } else if (
                verificarCod(
                  tipo11,
                  ["01"],
                  ["10"],
                  ["122"],
                  ["4100"],
                  ["2"],
                  ["016"],
                  ["339034"],
                  ["102000"],
                )
              ) {
                poderOrgao = "10131";
                codFontRecursosMSC = "1500";
                codAEO = "1002";
                ficha = "462";
              } else if (
                verificarCod(
                  tipo11,
                  ["01"],
                  ["10"],
                  ["122"],
                  ["4100"],
                  ["2"],
                  ["016"],
                  ["339036"],
                  ["102000"],
                )
              ) {
                poderOrgao = "10131";
                codFontRecursosMSC = "1500";
                codAEO = "1002";
                ficha = "464";
              } else if (
                verificarCod(
                  tipo11,
                  ["01"],
                  ["10"],
                  ["122"],
                  ["4100"],
                  ["2"],
                  ["016"],
                  ["339039"],
                  ["102000"],
                )
              ) {
                poderOrgao = "10131";
                codFontRecursosMSC = "1500";
                codAEO = "1002";
                ficha = "465";
              } else if (
                verificarCod(
                  tipo11,
                  ["01"],
                  ["10"],
                  ["122"],
                  ["4100"],
                  ["2"],
                  ["016"],
                  ["339039"],
                  ["107097"],
                )
              ) {
                poderOrgao = "10131";
                codFontRecursosMSC = "1605";
                codAEO = "nan";
                ficha = "466";
              } else if (
                verificarCod(
                  tipo11,
                  ["01"],
                  ["10"],
                  ["122"],
                  ["4100"],
                  ["2"],
                  ["016"],
                  ["339040"],
                  ["102000"],
                )
              ) {
                poderOrgao = "10131";
                codFontRecursosMSC = "1500";
                codAEO = "1002";
                ficha = "467";
              } else if (
                verificarCod(
                  tipo11,
                  ["01"],
                  ["10"],
                  ["122"],
                  ["4100"],
                  ["2"],
                  ["016"],
                  ["339046"],
                  ["102000"],
                )
              ) {
                poderOrgao = "10131";
                codFontRecursosMSC = "1500";
                codAEO = "1002";
                ficha = "468";
              } else if (
                verificarCod(
                  tipo11,
                  ["01"],
                  ["10"],
                  ["122"],
                  ["4100"],
                  ["2"],
                  ["016"],
                  ["339047"],
                  ["102000"],
                )
              ) {
                poderOrgao = "10131";
                codFontRecursosMSC = "1500";
                codAEO = "1002";
                ficha = "469";
              } else if (
                verificarCod(
                  tipo11,
                  ["01"],
                  ["10"],
                  ["122"],
                  ["4100"],
                  ["2"],
                  ["016"],
                  ["339047"],
                  ["102000"],
                )
              ) {
                poderOrgao = "10131";
                codFontRecursosMSC = "1500";
                codAEO = "1002";
                ficha = "469";
              } else if (
                verificarCod(
                  tipo11,
                  ["01"],
                  ["10"],
                  ["122"],
                  ["4100"],
                  ["2"],
                  ["016"],
                  ["339049"],
                  ["102000"],
                )
              ) {
                poderOrgao = "10131";
                codFontRecursosMSC = "1500";
                codAEO = "1002";
                ficha = "470";
              } else if (
                verificarCod(
                  tipo11,
                  ["01"],
                  ["10"],
                  ["122"],
                  ["4100"],
                  ["2"],
                  ["016"],
                  ["339091"],
                  ["102000"],
                )
              ) {
                poderOrgao = "10131";
                codFontRecursosMSC = "1500";
                codAEO = "1002";
                ficha = "471";
              } else if (
                verificarCod(
                  tipo11,
                  ["01"],
                  ["10"],
                  ["122"],
                  ["4100"],
                  ["2"],
                  ["016"],
                  ["339093"],
                  ["102000"],
                )
              ) {
                poderOrgao = "10131";
                codFontRecursosMSC = "1500";
                codAEO = "1002";
                ficha = "473";
              } else if (
                verificarCod(
                  tipo11,
                  ["01"],
                  ["10"],
                  ["122"],
                  ["4100"],
                  ["2"],
                  ["016"],
                  ["339096"],
                  ["102000"],
                )
              ) {
                poderOrgao = "10131";
                codFontRecursosMSC = "1500";
                codAEO = "1002";
                ficha = "474";
              } else if (
                verificarCod(
                  tipo11,
                  ["01"],
                  ["10"],
                  ["122"],
                  ["4100"],
                  ["2"],
                  ["016"],
                  ["339197"],
                  ["102000"],
                )
              ) {
                poderOrgao = "10131";
                codFontRecursosMSC = "1500";
                codAEO = "1002";
                ficha = "475";
              } else if (
                verificarCod(
                  tipo11,
                  ["01"],
                  ["10"],
                  ["122"],
                  ["4100"],
                  ["2"],
                  ["016"],
                  ["449052"],
                  ["102000"],
                )
              ) {
                poderOrgao = "10131";
                codFontRecursosMSC = "1500";
                codAEO = "1002";
                ficha = "477";
              } else if (
                verificarCod(
                  tipo11,
                  ["01"],
                  ["10"],
                  ["301"],
                  ["4139"],
                  ["1"],
                  ["025"],
                  ["449051"],
                  ["121000"],
                )
              ) {
                poderOrgao = "10131";
                codFontRecursosMSC = "1631";
                codAEO = "nan";
                ficha = "1057";
              } else if (
                verificarCod(
                  tipo11,
                  ["01"],
                  ["10"],
                  ["301"],
                  ["4139"],
                  ["2"],
                  ["013"],
                  ["319011"],
                  ["102000"],
                )
              ) {
                poderOrgao = "10131";
                codFontRecursosMSC = "1500";
                codAEO = "1002";
                ficha = "479";
              } else if (
                verificarCod(
                  tipo11,
                  ["01"],
                  ["10"],
                  ["301"],
                  ["4139"],
                  ["2"],
                  ["013"],
                  ["319011"],
                  ["195091"],
                )
              ) {
                poderOrgao = "10131";
                codFontRecursosMSC = "1604";
                codAEO = "nan";
                ficha = "480";
              } else if (
                verificarCod(
                  tipo11,
                  ["01"],
                  ["10"],
                  ["301"],
                  ["4139"],
                  ["2"],
                  ["013"],
                  ["319011"],
                  ["295091"],
                )
              ) {
                poderOrgao = "10131";
                codFontRecursosMSC = "2604";
                codAEO = "nan";
                ficha = "998";
              } else if (
                verificarCod(
                  tipo11,
                  ["01"],
                  ["10"],
                  ["301"],
                  ["4139"],
                  ["2"],
                  ["013"],
                  ["319113"],
                  ["102000"],
                )
              ) {
                poderOrgao = "10131";
                codFontRecursosMSC = "1500";
                codAEO = "1002";
                ficha = "483";
              } else if (
                verificarCod(
                  tipo11,
                  ["01"],
                  ["10"],
                  ["301"],
                  ["4139"],
                  ["2"],
                  ["013"],
                  ["319113"],
                  ["195091"],
                )
              ) {
                poderOrgao = "10131";
                codFontRecursosMSC = "1604";
                codAEO = "nan";
                ficha = "484";
              } else if (
                verificarCod(
                  tipo11,
                  ["01"],
                  ["10"],
                  ["301"],
                  ["4139"],
                  ["2"],
                  ["013"],
                  ["339030"],
                  ["102000"],
                )
              ) {
                poderOrgao = "10131";
                codFontRecursosMSC = "1500";
                codAEO = "1002";
                ficha = "486";
              } else if (
                verificarCod(
                  tipo11,
                  ["01"],
                  ["10"],
                  ["301"],
                  ["4139"],
                  ["2"],
                  ["013"],
                  ["339030"],
                  ["107008"],
                )
              ) {
                poderOrgao = "10131";
                codFontRecursosMSC = "1600";
                codAEO = "nan";
                ficha = "487";
              } else if (
                verificarCod(
                  tipo11,
                  ["01"],
                  ["10"],
                  ["301"],
                  ["4139"],
                  ["2"],
                  ["013"],
                  ["339030"],
                  ["131008"],
                )
              ) {
                poderOrgao = "10131";
                codFontRecursosMSC = "1621";
                codAEO = "nan";
                ficha = "489";
              } else if (
                verificarCod(
                  tipo11,
                  ["01"],
                  ["10"],
                  ["301"],
                  ["4139"],
                  ["2"],
                  ["013"],
                  ["339030"],
                  ["281008"],
                )
              ) {
                poderOrgao = "10131";
                codFontRecursosMSC = "2706";
                codAEO = "3110";
                ficha = "1095";
              } else if (
                verificarCod(
                  tipo11,
                  ["01"],
                  ["10"],
                  ["301"],
                  ["4139"],
                  ["2"],
                  ["013"],
                  ["339030"],
                  ["107011"],
                )
              ) {
                poderOrgao = "10131";
                codFontRecursosMSC = "1600";
                codAEO = "nan";
                ficha = "1119";
              } else if (
                verificarCod(
                  tipo11,
                  ["01"],
                  ["10"],
                  ["301"],
                  ["4139"],
                  ["2"],
                  ["013"],
                  ["339030"],
                  ["131010"],
                )
              ) {
                poderOrgao = "10131";
                codFontRecursosMSC = "1621";
                codAEO = "nan";
                ficha = "1121";
              } else if (
                verificarCod(
                  tipo11,
                  ["01"],
                  ["10"],
                  ["301"],
                  ["4139"],
                  ["2"],
                  ["013"],
                  ["339030"],
                  ["207063"],
                )
              ) {
                poderOrgao = "10131";
                codFontRecursosMSC = "2600";
                codAEO = "nan";
                ficha = "1122";
              } else if (
                verificarCod(
                  tipo11,
                  ["01"],
                  ["10"],
                  ["301"],
                  ["4139"],
                  ["2"],
                  ["013"],
                  ["339030"],
                  ["221000"],
                )
              ) {
                poderOrgao = "10131";
                codFontRecursosMSC = "2631";
                codAEO = "3110";
                ficha = "1144";
              } else if (
                verificarCod(
                  tipo11,
                  ["01"],
                  ["10"],
                  ["301"],
                  ["4139"],
                  ["2"],
                  ["013"],
                  ["339030"],
                  ["207555"],
                )
              ) {
                poderOrgao = "10131";
                codFontRecursosMSC = "2600";
                codAEO = "nan";
                ficha = "1145";
              } else if (
                verificarCod(
                  tipo11,
                  ["01"],
                  ["10"],
                  ["301"],
                  ["4139"],
                  ["2"],
                  ["013"],
                  ["339030"],
                  ["231010"],
                )
              ) {
                poderOrgao = "10131";
                codFontRecursosMSC = "2621";
                codAEO = "nan";
                ficha = "1202";
              } else if (
                verificarCod(
                  tipo11,
                  ["01"],
                  ["10"],
                  ["301"],
                  ["4139"],
                  ["2"],
                  ["013"],
                  ["339033"],
                  ["107008"],
                )
              ) {
                poderOrgao = "10131";
                codFontRecursosMSC = "1600";
                codAEO = "nan";
                ficha = "1073";
              } else if (
                verificarCod(
                  tipo11,
                  ["01"],
                  ["10"],
                  ["301"],
                  ["4139"],
                  ["2"],
                  ["013"],
                  ["339034"],
                  ["102000"],
                )
              ) {
                poderOrgao = "10131";
                codFontRecursosMSC = "1500";
                codAEO = "1002";
                ficha = "491";
              } else if (
                verificarCod(
                  tipo11,
                  ["01"],
                  ["10"],
                  ["301"],
                  ["4139"],
                  ["2"],
                  ["013"],
                  ["339034"],
                  ["107008"],
                )
              ) {
                poderOrgao = "10131";
                codFontRecursosMSC = "1600";
                codAEO = "nan";
                ficha = "492";
              } else if (
                verificarCod(
                  tipo11,
                  ["01"],
                  ["10"],
                  ["301"],
                  ["4139"],
                  ["2"],
                  ["013"],
                  ["339034"],
                  ["207008"],
                )
              ) {
                poderOrgao = "10131";
                codFontRecursosMSC = "2600";
                codAEO = "nan";
                ficha = "1020";
              } else if (
                verificarCod(
                  tipo11,
                  ["01"],
                  ["10"],
                  ["301"],
                  ["4139"],
                  ["2"],
                  ["013"],
                  ["339034"],
                  ["231008"],
                )
              ) {
                poderOrgao = "10131";
                codFontRecursosMSC = "2621";
                codAEO = "nan";
                ficha = "1096";
              } else if (
                verificarCod(
                  tipo11,
                  ["01"],
                  ["10"],
                  ["301"],
                  ["4139"],
                  ["2"],
                  ["013"],
                  ["339036"],
                  ["107008"],
                )
              ) {
                poderOrgao = "10131";
                codFontRecursosMSC = "1600";
                codAEO = "nan";
                ficha = "494";
              } else if (
                verificarCod(
                  tipo11,
                  ["01"],
                  ["10"],
                  ["301"],
                  ["4139"],
                  ["2"],
                  ["013"],
                  ["339039"],
                  ["102000"],
                )
              ) {
                poderOrgao = "10131";
                codFontRecursosMSC = "1500";
                codAEO = "1002";
                ficha = "495";
              } else if (
                verificarCod(
                  tipo11,
                  ["01"],
                  ["10"],
                  ["301"],
                  ["4139"],
                  ["2"],
                  ["013"],
                  ["339039"],
                  ["107008"],
                )
              ) {
                poderOrgao = "10131";
                codFontRecursosMSC = "1600";
                codAEO = "nan";
                ficha = "496";
              } else if (
                verificarCod(
                  tipo11,
                  ["01"],
                  ["10"],
                  ["301"],
                  ["4139"],
                  ["2"],
                  ["013"],
                  ["339039"],
                  ["131008"],
                )
              ) {
                poderOrgao = "10131";
                codFontRecursosMSC = "1621";
                codAEO = "nan";
                ficha = "497";
              } else if (
                verificarCod(
                  tipo11,
                  ["01"],
                  ["10"],
                  ["301"],
                  ["4139"],
                  ["2"],
                  ["013"],
                  ["339046"],
                  ["102000"],
                )
              ) {
                poderOrgao = "10131";
                codFontRecursosMSC = "1500";
                codAEO = "1002";
                ficha = "498";
              } else if (
                verificarCod(
                  tipo11,
                  ["01"],
                  ["10"],
                  ["301"],
                  ["4139"],
                  ["2"],
                  ["013"],
                  ["339049"],
                  ["102000"],
                )
              ) {
                poderOrgao = "10131";
                codFontRecursosMSC = "1500";
                codAEO = "1002";
                ficha = "500";
              } else if (
                verificarCod(
                  tipo11,
                  ["01"],
                  ["10"],
                  ["301"],
                  ["4139"],
                  ["2"],
                  ["013"],
                  ["339049"],
                  ["195091"],
                )
              ) {
                poderOrgao = "10131";
                codFontRecursosMSC = "1604";
                codAEO = "nan";
                ficha = "501";
              } else if (
                verificarCod(
                  tipo11,
                  ["01"],
                  ["10"],
                  ["301"],
                  ["4139"],
                  ["2"],
                  ["013"],
                  ["339092"],
                  ["107008"],
                )
              ) {
                poderOrgao = "10131";
                codFontRecursosMSC = "1600";
                codAEO = "nan";
                ficha = "502";
              } else if (
                verificarCod(
                  tipo11,
                  ["01"],
                  ["10"],
                  ["301"],
                  ["4139"],
                  ["2"],
                  ["013"],
                  ["449052"],
                  ["102000"],
                )
              ) {
                poderOrgao = "10131";
                codFontRecursosMSC = "1500";
                codAEO = "1002";
                ficha = "504";
              } else if (
                verificarCod(
                  tipo11,
                  ["01"],
                  ["10"],
                  ["301"],
                  ["4139"],
                  ["2"],
                  ["013"],
                  ["449052"],
                  ["209008"],
                )
              ) {
                poderOrgao = "10131";
                codFontRecursosMSC = "2601";
                codAEO = "nan";
                ficha = "1044";
              } else if (
                verificarCod(
                  tipo11,
                  ["01"],
                  ["10"],
                  ["301"],
                  ["4139"],
                  ["2"],
                  ["013"],
                  ["449052"],
                  ["214008"],
                )
              ) {
                poderOrgao = "10131";
                codFontRecursosMSC = "2600";
                codAEO = "nan";
                ficha = "1045";
              } else if (
                verificarCod(
                  tipo11,
                  ["01"],
                  ["10"],
                  ["301"],
                  ["4139"],
                  ["2"],
                  ["013"],
                  ["449052"],
                  ["282000"],
                )
              ) {
                poderOrgao = "10131";
                codFontRecursosMSC = "2706";
                codAEO = "3120";
                ficha = "1046";
              } else if (
                verificarCod(
                  tipo11,
                  ["01"],
                  ["10"],
                  ["301"],
                  ["4139"],
                  ["2"],
                  ["013"],
                  ["339034"],
                  ["102537"],
                )
              ) {
                poderOrgao = "10131";
                codFontRecursosMSC = "1500";
                codAEO = "1002";
                ficha = "1148";
              } else if (
                verificarCod(
                  tipo11,
                  ["01"],
                  ["10"],
                  ["302"],
                  ["0300"],
                  ["3"],
                  ["322"],
                  ["339039"],
                  ["102537"],
                )
              ) {
                poderOrgao = "10131";
                codFontRecursosMSC = "1500";
                codAEO = "1002";
                ficha = "1211";
              } else if (
                verificarCod(
                  tipo11,
                  ["01"],
                  ["10"],
                  ["302"],
                  ["0300"],
                  ["3"],
                  ["322"],
                  ["339039"],
                  ["102536"],
                )
              ) {
                poderOrgao = "10131";
                codFontRecursosMSC = "1500";
                codAEO = "1002";
                ficha = "1223";
              } else if (
                verificarCod(
                  tipo11,
                  ["01"],
                  ["10"],
                  ["302"],
                  ["4139"],
                  ["1"],
                  ["054"],
                  ["449051"],
                  ["109064"],
                )
              ) {
                poderOrgao = "10131";
                codFontRecursosMSC = "1601";
                codAEO = "nan";
                ficha = "1187";
              } else if (
                verificarCod(
                  tipo11,
                  ["01"],
                  ["10"],
                  ["302"],
                  ["4139"],
                  ["2"],
                  ["014"],
                  ["339030"],
                  ["102000"],
                )
              ) {
                poderOrgao = "10131";
                codFontRecursosMSC = "1500";
                codAEO = "1002";
                ficha = "516";
              } else if (
                verificarCod(
                  tipo11,
                  ["01"],
                  ["10"],
                  ["302"],
                  ["4139"],
                  ["2"],
                  ["014"],
                  ["339030"],
                  ["107017"],
                )
              ) {
                poderOrgao = "10131";
                codFontRecursosMSC = "1600";
                codAEO = "nan";
                ficha = "517";
              } else if (
                verificarCod(
                  tipo11,
                  ["01"],
                  ["10"],
                  ["302"],
                  ["4139"],
                  ["2"],
                  ["014"],
                  ["339030"],
                  ["131017"],
                )
              ) {
                poderOrgao = "10131";
                codFontRecursosMSC = "1621";
                codAEO = "nan";
                ficha = "518";
              } else if (
                verificarCod(
                  tipo11,
                  ["01"],
                  ["10"],
                  ["302"],
                  ["4139"],
                  ["2"],
                  ["014"],
                  ["339030"],
                  ["214555"],
                )
              ) {
                poderOrgao = "10131";
                codFontRecursosMSC = "2600";
                codAEO = "nan";
                ficha = "1146";
              } else if (
                verificarCod(
                  tipo11,
                  ["01"],
                  ["10"],
                  ["302"],
                  ["4139"],
                  ["2"],
                  ["014"],
                  ["339030"],
                  ["231017"],
                )
              ) {
                poderOrgao = "10131";
                codFontRecursosMSC = "2621";
                codAEO = "nan";
                ficha = "1182";
              } else if (
                verificarCod(
                  tipo11,
                  ["01"],
                  ["10"],
                  ["302"],
                  ["4139"],
                  ["2"],
                  ["014"],
                  ["339030"],
                  ["137000"],
                )
              ) {
                poderOrgao = "10131";
                codFontRecursosMSC = "1710";
                codAEO = "3210";
                ficha = "1206";
              } else if (
                verificarCod(
                  tipo11,
                  ["01"],
                  ["10"],
                  ["302"],
                  ["4139"],
                  ["2"],
                  ["014"],
                  ["339030"],
                  ["202000"],
                )
              ) {
                poderOrgao = "10131";
                codFontRecursosMSC = "2500";
                codAEO = "1002";
                ficha = "1207";
              } else if (
                verificarCod(
                  tipo11,
                  ["01"],
                  ["10"],
                  ["302"],
                  ["4139"],
                  ["2"],
                  ["014"],
                  ["339030"],
                  ["237000"],
                )
              ) {
                poderOrgao = "10131";
                codFontRecursosMSC = "2710";
                codAEO = "3210";
                ficha = "1218";
              } else if (
                verificarCod(
                  tipo11,
                  ["01"],
                  ["10"],
                  ["302"],
                  ["4139"],
                  ["2"],
                  ["014"],
                  ["339034"],
                  ["102000"],
                )
              ) {
                poderOrgao = "10131";
                codFontRecursosMSC = "1500";
                codAEO = "1012";
                ficha = "520";
              } else if (
                verificarCod(
                  tipo11,
                  ["01"],
                  ["10"],
                  ["302"],
                  ["4139"],
                  ["2"],
                  ["014"],
                  ["339034"],
                  ["107017"],
                )
              ) {
                poderOrgao = "10131";
                codFontRecursosMSC = "1600";
                codAEO = "nan";
                ficha = "521";
              } else if (
                verificarCod(
                  tipo11,
                  ["01"],
                  ["10"],
                  ["302"],
                  ["4139"],
                  ["2"],
                  ["014"],
                  ["339034"],
                  ["131017"],
                )
              ) {
                poderOrgao = "10131";
                codFontRecursosMSC = "1621";
                codAEO = "nan";
                ficha = "522";
              } else if (
                verificarCod(
                  tipo11,
                  ["01"],
                  ["10"],
                  ["302"],
                  ["4139"],
                  ["2"],
                  ["014"],
                  ["339034"],
                  ["207064"],
                )
              ) {
                poderOrgao = "10131";
                codFontRecursosMSC = "2600";
                codAEO = "nan";
                ficha = "1021";
              } else if (
                verificarCod(
                  tipo11,
                  ["01"],
                  ["10"],
                  ["302"],
                  ["4139"],
                  ["2"],
                  ["014"],
                  ["339034"],
                  ["107057"],
                )
              ) {
                poderOrgao = "10131";
                codFontRecursosMSC = "1600";
                codAEO = "nan";
                ficha = "1101";
              } else if (
                verificarCod(
                  tipo11,
                  ["01"],
                  ["10"],
                  ["302"],
                  ["4139"],
                  ["2"],
                  ["014"],
                  ["339034"],
                  ["131060"],
                )
              ) {
                poderOrgao = "10131";
                codFontRecursosMSC = "1621";
                codAEO = "nan";
                ficha = "1116";
              } else if (
                verificarCod(
                  tipo11,
                  ["01"],
                  ["10"],
                  ["302"],
                  ["4139"],
                  ["2"],
                  ["014"],
                  ["339034"],
                  ["231017"],
                )
              ) {
                poderOrgao = "10131";
                codFontRecursosMSC = "2621";
                codAEO = "nan";
                ficha = "1117";
              } else if (
                verificarCod(
                  tipo11,
                  ["01"],
                  ["10"],
                  ["302"],
                  ["4139"],
                  ["2"],
                  ["014"],
                  ["339034"],
                  ["181017"],
                )
              ) {
                poderOrgao = "10131";
                codFontRecursosMSC = "1706";
                codAEO = "3110";
                ficha = "1141";
              } else if (
                verificarCod(
                  tipo11,
                  ["01"],
                  ["10"],
                  ["302"],
                  ["4139"],
                  ["2"],
                  ["014"],
                  ["339039"],
                  ["102000"],
                )
              ) {
                poderOrgao = "10131";
                codFontRecursosMSC = "1500";
                codAEO = "1002";
                ficha = "524";
              } else if (
                verificarCod(
                  tipo11,
                  ["01"],
                  ["10"],
                  ["302"],
                  ["4139"],
                  ["2"],
                  ["014"],
                  ["339039"],
                  ["107017"],
                )
              ) {
                poderOrgao = "10131";
                codFontRecursosMSC = "1600";
                codAEO = "nan";
                ficha = "525";
              } else if (
                verificarCod(
                  tipo11,
                  ["01"],
                  ["10"],
                  ["302"],
                  ["4139"],
                  ["2"],
                  ["014"],
                  ["339039"],
                  ["131017"],
                )
              ) {
                poderOrgao = "10131";
                codFontRecursosMSC = "1621";
                codAEO = "nan";
                ficha = "526";
              } else if (
                verificarCod(
                  tipo11,
                  ["01"],
                  ["10"],
                  ["302"],
                  ["4139"],
                  ["2"],
                  ["014"],
                  ["339039"],
                  ["281000"],
                )
              ) {
                poderOrgao = "10131";
                codFontRecursosMSC = "2706";
                codAEO = "3110";
                ficha = "989";
              } else if (
                verificarCod(
                  tipo11,
                  ["01"],
                  ["10"],
                  ["302"],
                  ["4139"],
                  ["2"],
                  ["014"],
                  ["339039"],
                  ["281064"],
                )
              ) {
                poderOrgao = "10131";
                codFontRecursosMSC = "2706";
                codAEO = "3110";
                ficha = "990";
              } else if (
                verificarCod(
                  tipo11,
                  ["01"],
                  ["10"],
                  ["302"],
                  ["4139"],
                  ["2"],
                  ["014"],
                  ["339039"],
                  ["282064"],
                )
              ) {
                poderOrgao = "10131";
                codFontRecursosMSC = "2601";
                codAEO = "3120";
                ficha = "1027";
              } else if (
                verificarCod(
                  tipo11,
                  ["01"],
                  ["10"],
                  ["302"],
                  ["4139"],
                  ["2"],
                  ["014"],
                  ["339039"],
                  ["181017"],
                )
              ) {
                poderOrgao = "10131";
                codFontRecursosMSC = "1706";
                codAEO = "3110";
                ficha = "1074";
              } else if (
                verificarCod(
                  tipo11,
                  ["01"],
                  ["10"],
                  ["302"],
                  ["4139"],
                  ["2"],
                  ["014"],
                  ["339039"],
                  ["131000"],
                )
              ) {
                poderOrgao = "10131";
                codFontRecursosMSC = "1621";
                codAEO = "3210";
                ficha = "1142";
              } else if (
                verificarCod(
                  tipo11,
                  ["01"],
                  ["10"],
                  ["302"],
                  ["4139"],
                  ["2"],
                  ["014"],
                  ["339039"],
                  ["181000"],
                )
              ) {
                poderOrgao = "10131";
                codFontRecursosMSC = "1706";
                codAEO = "3110";
                ficha = "1143";
              } else if (
                verificarCod(
                  tipo11,
                  ["01"],
                  ["10"],
                  ["302"],
                  ["4139"],
                  ["2"],
                  ["014"],
                  ["339039"],
                  ["182064"],
                )
              ) {
                poderOrgao = "10131";
                codFontRecursosMSC = "1601";
                codAEO = "3120";
                ficha = "1214";
              } else if (
                verificarCod(
                  tipo11,
                  ["01"],
                  ["10"],
                  ["302"],
                  ["4139"],
                  ["2"],
                  ["014"],
                  ["339039"],
                  ["202000"],
                )
              ) {
                poderOrgao = "10131";
                codFontRecursosMSC = "2500";
                codAEO = "1002";
                ficha = "1224";
              } else if (
                verificarCod(
                  tipo11,
                  ["01"],
                  ["10"],
                  ["302"],
                  ["4139"],
                  ["2"],
                  ["014"],
                  ["339039"],
                  ["137000"],
                )
              ) {
                poderOrgao = "10131";
                codFontRecursosMSC = "1710";
                codAEO = "3210";
                ficha = "1230";
              } else if (
                verificarCod(
                  tipo11,
                  ["01"],
                  ["10"],
                  ["302"],
                  ["4139"],
                  ["2"],
                  ["014"],
                  ["339041"],
                  ["107017"],
                )
              ) {
                poderOrgao = "10131";
                codFontRecursosMSC = "1600";
                codAEO = "nan";
                ficha = "527";
              } else if (
                verificarCod(
                  tipo11,
                  ["01"],
                  ["10"],
                  ["302"],
                  ["4139"],
                  ["2"],
                  ["014"],
                  ["339048"],
                  ["102000"],
                )
              ) {
                poderOrgao = "10131";
                codFontRecursosMSC = "1500";
                codAEO = "1002";
                ficha = "528";
              } else if (
                verificarCod(
                  tipo11,
                  ["01"],
                  ["10"],
                  ["302"],
                  ["4139"],
                  ["2"],
                  ["014"],
                  ["339091"],
                  ["102000"],
                )
              ) {
                poderOrgao = "10131";
                codFontRecursosMSC = "1500";
                codAEO = "1002";
                ficha = "529";
              } else if (
                verificarCod(
                  tipo11,
                  ["01"],
                  ["10"],
                  ["302"],
                  ["4139"],
                  ["2"],
                  ["014"],
                  ["339093"],
                  ["102000"],
                )
              ) {
                poderOrgao = "10131";
                codFontRecursosMSC = "1500";
                codAEO = "1002";
                ficha = "533";
              } else if (
                verificarCod(
                  tipo11,
                  ["01"],
                  ["10"],
                  ["302"],
                  ["4139"],
                  ["2"],
                  ["014"],
                  ["339093"],
                  ["107017"],
                )
              ) {
                poderOrgao = "10131";
                codFontRecursosMSC = "1600";
                codAEO = "nan";
                ficha = "534";
              } else if (
                verificarCod(
                  tipo11,
                  ["01"],
                  ["10"],
                  ["302"],
                  ["4139"],
                  ["2"],
                  ["014"],
                  ["339093"],
                  ["202000"],
                )
              ) {
                poderOrgao = "10131";
                codFontRecursosMSC = "2500";
                codAEO = "1002";
                ficha = "1200";
              } else if (
                verificarCod(
                  tipo11,
                  ["01"],
                  ["10"],
                  ["302"],
                  ["4139"],
                  ["2"],
                  ["014"],
                  ["449052"],
                  ["107017"],
                )
              ) {
                poderOrgao = "10131";
                codFontRecursosMSC = "1600";
                codAEO = "nan";
                ficha = "537";
              } else if (
                verificarCod(
                  tipo11,
                  ["01"],
                  ["10"],
                  ["302"],
                  ["4139"],
                  ["2"],
                  ["014"],
                  ["449052"],
                  ["282000"],
                )
              ) {
                poderOrgao = "10131";
                codFontRecursosMSC = "2706";
                codAEO = "3120";
                ficha = "1047";
              } else if (
                verificarCod(
                  tipo11,
                  ["01"],
                  ["10"],
                  ["302"],
                  ["4139"],
                  ["2"],
                  ["014"],
                  ["449052"],
                  ["207576"],
                )
              ) {
                poderOrgao = "10131";
                codFontRecursosMSC = "2600";
                codAEO = "nan";
                ficha = "1155";
              } else if (
                verificarCod(
                  tipo11,
                  ["01"],
                  ["10"],
                  ["302"],
                  ["4139"],
                  ["2"],
                  ["014"],
                  ["449052"],
                  ["209064"],
                )
              ) {
                poderOrgao = "10131";
                codFontRecursosMSC = "2601";
                codAEO = "nan";
                ficha = "1156";
              } else if (
                verificarCod(
                  tipo11,
                  ["01"],
                  ["10"],
                  ["302"],
                  ["4139"],
                  ["2"],
                  ["014"],
                  ["449052"],
                  ["237000"],
                )
              ) {
                poderOrgao = "10131";
                codFontRecursosMSC = "2710";
                codAEO = "3210";
                ficha = "1209";
              } else if (
                verificarCod(
                  tipo11,
                  ["01"],
                  ["10"],
                  ["302"],
                  ["4139"],
                  ["2"],
                  ["014"],
                  ["449052"],
                  ["137000"],
                )
              ) {
                poderOrgao = "10131";
                codFontRecursosMSC = "1710";
                codAEO = "3210";
                ficha = "1217";
              } else if (
                verificarCod(
                  tipo11,
                  ["01"],
                  ["10"],
                  ["302"],
                  ["4139"],
                  ["4"],
                  ["178"],
                  ["339030"],
                  ["107017"],
                )
              ) {
                poderOrgao = "10131";
                codFontRecursosMSC = "1600";
                codAEO = "nan";
                ficha = "539";
              } else if (
                verificarCod(
                  tipo11,
                  ["01"],
                  ["10"],
                  ["302"],
                  ["4139"],
                  ["4"],
                  ["178"],
                  ["339030"],
                  ["131020"],
                )
              ) {
                poderOrgao = "10131";
                codFontRecursosMSC = "1621";
                codAEO = "nan";
                ficha = "540";
              } else if (
                verificarCod(
                  tipo11,
                  ["01"],
                  ["10"],
                  ["302"],
                  ["4139"],
                  ["4"],
                  ["178"],
                  ["339030"],
                  ["107020"],
                )
              ) {
                poderOrgao = "10131";
                codFontRecursosMSC = "1600";
                codAEO = "nan";
                ficha = "1225";
              } else if (
                verificarCod(
                  tipo11,
                  ["01"],
                  ["10"],
                  ["302"],
                  ["4139"],
                  ["4"],
                  ["178"],
                  ["339034"],
                  ["107017"],
                )
              ) {
                poderOrgao = "10131";
                codFontRecursosMSC = "1600";
                codAEO = "nan";
                ficha = "542";
              } else if (
                verificarCod(
                  tipo11,
                  ["01"],
                  ["10"],
                  ["302"],
                  ["4139"],
                  ["4"],
                  ["178"],
                  ["339034"],
                  ["107020"],
                )
              ) {
                poderOrgao = "10131";
                codFontRecursosMSC = "1600";
                codAEO = "nan";
                ficha = "1102";
              } else if (
                verificarCod(
                  tipo11,
                  ["01"],
                  ["10"],
                  ["302"],
                  ["4139"],
                  ["4"],
                  ["178"],
                  ["339039"],
                  ["102000"],
                )
              ) {
                poderOrgao = "10131";
                codFontRecursosMSC = "1500";
                codAEO = "1002";
                ficha = "545";
              } else if (
                verificarCod(
                  tipo11,
                  ["01"],
                  ["10"],
                  ["302"],
                  ["4139"],
                  ["4"],
                  ["178"],
                  ["339039"],
                  ["131020"],
                )
              ) {
                poderOrgao = "10131";
                codFontRecursosMSC = "1621";
                codAEO = "nan";
                ficha = "547";
              } else if (
                verificarCod(
                  tipo11,
                  ["01"],
                  ["10"],
                  ["302"],
                  ["4139"],
                  ["2"],
                  ["178"],
                  ["339039"],
                  ["107020"],
                )
              ) {
                poderOrgao = "10131";
                codFontRecursosMSC = "1600";
                codAEO = "nan";
                ficha = "1226";
              } else if (
                verificarCod(
                  tipo11,
                  ["01"],
                  ["10"],
                  ["302"],
                  ["4139"],
                  ["2"],
                  ["015"],
                  ["339030"],
                  ["102000"],
                )
              ) {
                poderOrgao = "10131";
                codFontRecursosMSC = "1500";
                codAEO = "1002";
                ficha = "551";
              } else if (
                verificarCod(
                  tipo11,
                  ["01"],
                  ["10"],
                  ["302"],
                  ["4139"],
                  ["2"],
                  ["015"],
                  ["339030"],
                  ["107013"],
                )
              ) {
                poderOrgao = "10131";
                codFontRecursosMSC = "1600";
                codAEO = "nan";
                ficha = "552";
              } else if (
                verificarCod(
                  tipo11,
                  ["01"],
                  ["10"],
                  ["302"],
                  ["4139"],
                  ["2"],
                  ["015"],
                  ["339030"],
                  ["131013"],
                )
              ) {
                poderOrgao = "10131";
                codFontRecursosMSC = "1621";
                codAEO = "nan";
                ficha = "553";
              } else if (
                verificarCod(
                  tipo11,
                  ["01"],
                  ["10"],
                  ["302"],
                  ["4139"],
                  ["2"],
                  ["015"],
                  ["339030"],
                  ["207013"],
                )
              ) {
                poderOrgao = "10131";
                codFontRecursosMSC = "2600";
                codAEO = "nan";
                ficha = "1115";
              } else if (
                verificarCod(
                  tipo11,
                  ["01"],
                  ["10"],
                  ["302"],
                  ["4139"],
                  ["2"],
                  ["015"],
                  ["339030"],
                  ["231013"],
                )
              ) {
                poderOrgao = "10131";
                codFontRecursosMSC = "2621";
                codAEO = "nan";
                ficha = "1151";
              } else if (
                verificarCod(
                  tipo11,
                  ["01"],
                  ["10"],
                  ["302"],
                  ["4139"],
                  ["4"],
                  ["023"],
                  ["339030"],
                  ["106015"],
                )
              ) {
                poderOrgao = "10131";
                codFontRecursosMSC = "1753";
                codAEO = "nan";
                ficha = "557";
              } else if (
                verificarCod(
                  tipo11,
                  ["01"],
                  ["10"],
                  ["302"],
                  ["4139"],
                  ["4"],
                  ["203"],
                  ["339030"],
                  ["206015"],
                )
              ) {
                poderOrgao = "10131";
                codFontRecursosMSC = "2753";
                codAEO = "nan";
                ficha = "1190";
              } else if (
                verificarCod(
                  tipo11,
                  ["01"],
                  ["10"],
                  ["302"],
                  ["4139"],
                  ["4"],
                  ["203"],
                  ["339039"],
                  ["108015"],
                )
              ) {
                poderOrgao = "10131";
                codFontRecursosMSC = "1753";
                codAEO = "nan";
                ficha = "558";
              } else if (
                verificarCod(
                  tipo11,
                  ["01"],
                  ["10"],
                  ["302"],
                  ["4139"],
                  ["4"],
                  ["203"],
                  ["449052"],
                  ["106015"],
                )
              ) {
                poderOrgao = "10131";
                codFontRecursosMSC = "1753";
                codAEO = "nan";
                ficha = "559";
              } else if (
                verificarCod(
                  tipo11,
                  ["01"],
                  ["10"],
                  ["302"],
                  ["4139"],
                  ["4"],
                  ["040"],
                  ["319011"],
                  ["102000"],
                )
              ) {
                poderOrgao = "10131";
                codFontRecursosMSC = "1500";
                codAEO = "1002";
                ficha = "560";
              } else if (
                verificarCod(
                  tipo11,
                  ["01"],
                  ["10"],
                  ["302"],
                  ["4139"],
                  ["4"],
                  ["040"],
                  ["319011"],
                  ["195091"],
                )
              ) {
                poderOrgao = "10131";
                codFontRecursosMSC = "1604";
                codAEO = "nan";
                ficha = "561";
              } else if (
                verificarCod(
                  tipo11,
                  ["01"],
                  ["10"],
                  ["302"],
                  ["4139"],
                  ["4"],
                  ["040"],
                  ["319113"],
                  ["102000"],
                )
              ) {
                poderOrgao = "10131";
                codFontRecursosMSC = "1500";
                codAEO = "1002";
                ficha = "563";
              } else if (
                verificarCod(
                  tipo11,
                  ["01"],
                  ["10"],
                  ["302"],
                  ["4139"],
                  ["4"],
                  ["040"],
                  ["339030"],
                  ["107062"],
                )
              ) {
                poderOrgao = "10131";
                codFontRecursosMSC = "1600";
                codAEO = "nan";
                ficha = "566";
              } else if (
                verificarCod(
                  tipo11,
                  ["01"],
                  ["10"],
                  ["302"],
                  ["4139"],
                  ["4"],
                  ["040"],
                  ["339034"],
                  ["207062"],
                )
              ) {
                poderOrgao = "10131";
                codFontRecursosMSC = "2600";
                codAEO = "nan";
                ficha = "1125";
              } else if (
                verificarCod(
                  tipo11,
                  ["01"],
                  ["10"],
                  ["302"],
                  ["4139"],
                  ["4"],
                  ["040"],
                  ["339039"],
                  ["107062"],
                )
              ) {
                poderOrgao = "10131";
                codFontRecursosMSC = "1600";
                codAEO = "nan";
                ficha = "569";
              } else if (
                verificarCod(
                  tipo11,
                  ["01"],
                  ["10"],
                  ["302"],
                  ["4139"],
                  ["4"],
                  ["040"],
                  ["339046"],
                  ["102000"],
                )
              ) {
                poderOrgao = "10131";
                codFontRecursosMSC = "1500";
                codAEO = "1002";
                ficha = "571";
              } else if (
                verificarCod(
                  tipo11,
                  ["01"],
                  ["10"],
                  ["302"],
                  ["4139"],
                  ["4"],
                  ["040"],
                  ["339046"],
                  ["195091"],
                )
              ) {
                poderOrgao = "10131";
                codFontRecursosMSC = "1604";
                codAEO = "nan";
                ficha = "572";
              } else if (
                verificarCod(
                  tipo11,
                  ["01"],
                  ["10"],
                  ["302"],
                  ["4139"],
                  ["4"],
                  ["040"],
                  ["339049"],
                  ["102000"],
                )
              ) {
                poderOrgao = "10131";
                codFontRecursosMSC = "1500";
                codAEO = "1002";
                ficha = "573";
              } else if (
                verificarCod(
                  tipo11,
                  ["01"],
                  ["10"],
                  ["302"],
                  ["4139"],
                  ["4"],
                  ["040"],
                  ["339049"],
                  ["195091"],
                )
              ) {
                poderOrgao = "10131";
                codFontRecursosMSC = "1604";
                codAEO = "nan";
                ficha = "574";
              } else if (
                verificarCod(
                  tipo11,
                  ["01"],
                  ["10"],
                  ["302"],
                  ["4139"],
                  ["4"],
                  ["040"],
                  ["449052"],
                  ["107062"],
                )
              ) {
                poderOrgao = "10131";
                codFontRecursosMSC = "1600";
                codAEO = "nan";
                ficha = "576";
              } else if (
                verificarCod(
                  tipo11,
                  ["01"],
                  ["10"],
                  ["846"],
                  ["4158"],
                  ["9"],
                  ["029"],
                  ["469071"],
                  ["102000"],
                )
              ) {
                poderOrgao = "10131";
                codFontRecursosMSC = "1500";
                codAEO = "1002";
                ficha = "578";
              }
            }
            // 11 - FMAS - FUNDO MUNICIPAL DE ASSISTENCIA SOCIAL
            if (tipo11.codOrgao === "11") {
              if (
                verificarCod(
                  tipo11,
                  ["04"],
                  ["08"],
                  ["122"],
                  ["0300"],
                  ["3"],
                  ["323"],
                  ["335043"],
                  ["181000"],
                )
              ) {
                poderOrgao = "10131";
                codFontRecursosMSC = "1706";
                codAEO = "3110";
                ficha = "1070";
              } else if (
                verificarCod(
                  tipo11,
                  ["04"],
                  ["08"],
                  ["122"],
                  ["4100"],
                  ["4"],
                  ["137"],
                  ["319004"],
                  ["100000"],
                )
              ) {
                poderOrgao = "10131";
                codFontRecursosMSC = "1500";
                codAEO = "nan";
                ficha = "582";
              } else if (
                verificarCod(
                  tipo11,
                  ["04"],
                  ["08"],
                  ["122"],
                  ["4100"],
                  ["4"],
                  ["137"],
                  ["319011"],
                  ["100000"],
                )
              ) {
                poderOrgao = "10131";
                codFontRecursosMSC = "1500";
                codAEO = "nan";
                ficha = "583";
              } else if (
                verificarCod(
                  tipo11,
                  ["04"],
                  ["08"],
                  ["122"],
                  ["4100"],
                  ["4"],
                  ["137"],
                  ["319013"],
                  ["100000"],
                )
              ) {
                poderOrgao = "10131";
                codFontRecursosMSC = "1500";
                codAEO = "nan";
                ficha = "584";
              } else if (
                verificarCod(
                  tipo11,
                  ["04"],
                  ["08"],
                  ["122"],
                  ["4100"],
                  ["4"],
                  ["137"],
                  ["319094"],
                  ["100000"],
                )
              ) {
                poderOrgao = "10131";
                codFontRecursosMSC = "1500";
                codAEO = "nan";
                ficha = "585";
              } else if (
                verificarCod(
                  tipo11,
                  ["04"],
                  ["08"],
                  ["122"],
                  ["4100"],
                  ["4"],
                  ["137"],
                  ["319113"],
                  ["100000"],
                )
              ) {
                poderOrgao = "10131";
                codFontRecursosMSC = "1500";
                codAEO = "nan";
                ficha = "586";
              } else if (
                verificarCod(
                  tipo11,
                  ["04"],
                  ["08"],
                  ["122"],
                  ["4100"],
                  ["4"],
                  ["137"],
                  ["339014"],
                  ["100000"],
                )
              ) {
                poderOrgao = "10131";
                codFontRecursosMSC = "1500";
                codAEO = "nan";
                ficha = "588";
              } else if (
                verificarCod(
                  tipo11,
                  ["04"],
                  ["08"],
                  ["122"],
                  ["4100"],
                  ["4"],
                  ["137"],
                  ["339030"],
                  ["100000"],
                )
              ) {
                poderOrgao = "10131";
                codFontRecursosMSC = "1500";
                codAEO = "nan";
                ficha = "589";
              } else if (
                verificarCod(
                  tipo11,
                  ["04"],
                  ["08"],
                  ["122"],
                  ["4100"],
                  ["4"],
                  ["137"],
                  ["339031"],
                  ["100000"],
                )
              ) {
                poderOrgao = "10131";
                codFontRecursosMSC = "1500";
                codAEO = "nan";
                ficha = "590";
              } else if (
                verificarCod(
                  tipo11,
                  ["04"],
                  ["08"],
                  ["122"],
                  ["4100"],
                  ["4"],
                  ["137"],
                  ["339036"],
                  ["100000"],
                )
              ) {
                poderOrgao = "10131";
                codFontRecursosMSC = "1500";
                codAEO = "nan";
                ficha = "594";
              } else if (
                verificarCod(
                  tipo11,
                  ["04"],
                  ["08"],
                  ["122"],
                  ["4100"],
                  ["4"],
                  ["137"],
                  ["339039"],
                  ["100000"],
                )
              ) {
                poderOrgao = "10131";
                codFontRecursosMSC = "1500";
                codAEO = "nan";
                ficha = "595";
              } else if (
                verificarCod(
                  tipo11,
                  ["04"],
                  ["08"],
                  ["122"],
                  ["4100"],
                  ["4"],
                  ["137"],
                  ["339039"],
                  ["132000"],
                )
              ) {
                poderOrgao = "10131";
                codFontRecursosMSC = "1661";
                codAEO = "nan";
                ficha = "1216";
              } else if (
                verificarCod(
                  tipo11,
                  ["04"],
                  ["08"],
                  ["122"],
                  ["4100"],
                  ["4"],
                  ["137"],
                  ["339040"],
                  ["100000"],
                )
              ) {
                poderOrgao = "10131";
                codFontRecursosMSC = "1500";
                codAEO = "nan";
                ficha = "596";
              } else if (
                verificarCod(
                  tipo11,
                  ["04"],
                  ["08"],
                  ["122"],
                  ["4100"],
                  ["4"],
                  ["137"],
                  ["339046"],
                  ["100000"],
                )
              ) {
                poderOrgao = "10131";
                codFontRecursosMSC = "1500";
                codAEO = "nan";
                ficha = "599";
              } else if (
                verificarCod(
                  tipo11,
                  ["04"],
                  ["08"],
                  ["122"],
                  ["4100"],
                  ["4"],
                  ["137"],
                  ["339049"],
                  ["100000"],
                )
              ) {
                poderOrgao = "10131";
                codFontRecursosMSC = "1500";
                codAEO = "nan";
                ficha = "602";
              } else if (
                verificarCod(
                  tipo11,
                  ["04"],
                  ["08"],
                  ["122"],
                  ["4100"],
                  ["4"],
                  ["137"],
                  ["339093"],
                  ["129081"],
                )
              ) {
                poderOrgao = "10131";
                codFontRecursosMSC = "1604";
                codAEO = "nan";
                ficha = "1233";
              } else if (
                verificarCod(
                  tipo11,
                  ["04"],
                  ["08"],
                  ["122"],
                  ["4100"],
                  ["4"],
                  ["137"],
                  ["339093"],
                  ["229081"],
                )
              ) {
                poderOrgao = "10131";
                codFontRecursosMSC = "2604";
                codAEO = "nan";
                ficha = "1234";
              } else if (
                verificarCod(
                  tipo11,
                  ["04"],
                  ["08"],
                  ["122"],
                  ["4100"],
                  ["4"],
                  ["137"],
                  ["339096"],
                  ["100000"],
                )
              ) {
                poderOrgao = "10131";
                codFontRecursosMSC = "1500";
                codAEO = "nan";
                ficha = "606";
              } else if (
                verificarCod(
                  tipo11,
                  ["04"],
                  ["08"],
                  ["122"],
                  ["4100"],
                  ["4"],
                  ["137"],
                  ["339197"],
                  ["100000"],
                )
              ) {
                poderOrgao = "10131";
                codFontRecursosMSC = "1500";
                codAEO = "nan";
                ficha = "607";
              } else if (
                verificarCod(
                  tipo11,
                  ["04"],
                  ["08"],
                  ["122"],
                  ["4100"],
                  ["4"],
                  ["137"],
                  ["449052"],
                  ["100000"],
                )
              ) {
                poderOrgao = "10131";
                codFontRecursosMSC = "1500";
                codAEO = "nan";
                ficha = "609";
              } else if (
                verificarCod(
                  tipo11,
                  ["04"],
                  ["08"],
                  ["122"],
                  ["4100"],
                  ["4"],
                  ["137"],
                  ["449052"],
                  ["281000"],
                )
              ) {
                poderOrgao = "10131";
                codFontRecursosMSC = "2706";
                codAEO = "3110";
                ficha = "1113";
              } else if (
                verificarCod(
                  tipo11,
                  ["04"],
                  ["08"],
                  ["122"],
                  ["4100"],
                  ["4"],
                  ["137"],
                  ["449052"],
                  ["200000"],
                )
              ) {
                poderOrgao = "10131";
                codFontRecursosMSC = "2500";
                codAEO = "nan";
                ficha = "1163";
              } else if (
                verificarCod(
                  tipo11,
                  ["04"],
                  ["08"],
                  ["122"],
                  ["4100"],
                  ["4"],
                  ["137"],
                  ["449052"],
                  ["181000"],
                )
              ) {
                poderOrgao = "10131";
                codFontRecursosMSC = "1706";
                codAEO = "3110";
                ficha = "1191";
              } else if (
                verificarCod(
                  tipo11,
                  ["04"],
                  ["08"],
                  ["122"],
                  ["5119"],
                  ["2"],
                  ["308"],
                  ["339014"],
                  ["129056"],
                )
              ) {
                poderOrgao = "10131";
                codFontRecursosMSC = "1669";
                codAEO = "nan";
                ficha = "610";
              } else if (
                verificarCod(
                  tipo11,
                  ["04"],
                  ["08"],
                  ["122"],
                  ["5119"],
                  ["2"],
                  ["308"],
                  ["339014"],
                  ["229056"],
                )
              ) {
                poderOrgao = "10131";
                codFontRecursosMSC = "2669";
                codAEO = "nan";
                ficha = "1019";
              } else if (
                verificarCod(
                  tipo11,
                  ["04"],
                  ["08"],
                  ["122"],
                  ["5119"],
                  ["2"],
                  ["308"],
                  ["339030"],
                  ["129056"],
                )
              ) {
                poderOrgao = "10131";
                codFontRecursosMSC = "1669";
                codAEO = "nan";
                ficha = "612";
              } else if (
                verificarCod(
                  tipo11,
                  ["04"],
                  ["08"],
                  ["122"],
                  ["5119"],
                  ["2"],
                  ["308"],
                  ["339030"],
                  ["229056"],
                )
              ) {
                poderOrgao = "10131";
                codFontRecursosMSC = "2669";
                codAEO = "nan";
                ficha = "1166";
              } else if (
                verificarCod(
                  tipo11,
                  ["04"],
                  ["08"],
                  ["122"],
                  ["5119"],
                  ["2"],
                  ["308"],
                  ["339033"],
                  ["129056"],
                )
              ) {
                poderOrgao = "10131";
                codFontRecursosMSC = "1669";
                codAEO = "nan";
                ficha = "613";
              } else if (
                verificarCod(
                  tipo11,
                  ["04"],
                  ["08"],
                  ["122"],
                  ["5119"],
                  ["2"],
                  ["308"],
                  ["339039"],
                  ["129056"],
                )
              ) {
                poderOrgao = "10131";
                codFontRecursosMSC = "1669";
                codAEO = "nan";
                ficha = "618";
              } else if (
                verificarCod(
                  tipo11,
                  ["04"],
                  ["08"],
                  ["122"],
                  ["5119"],
                  ["2"],
                  ["308"],
                  ["339039"],
                  ["229056"],
                )
              ) {
                poderOrgao = "10131";
                codFontRecursosMSC = "2669";
                codAEO = "nan";
                ficha = "1042";
              } else if (
                verificarCod(
                  tipo11,
                  ["04"],
                  ["08"],
                  ["122"],
                  ["5119"],
                  ["2"],
                  ["308"],
                  ["449052"],
                  ["229056"],
                )
              ) {
                poderOrgao = "10131";
                codFontRecursosMSC = "2669";
                codAEO = "nan";
                ficha = "1114";
              } else if (
                verificarCod(
                  tipo11,
                  ["04"],
                  ["08"],
                  ["122"],
                  ["5119"],
                  ["2"],
                  ["315"],
                  ["339036"],
                  ["100000"],
                )
              ) {
                poderOrgao = "10131";
                codFontRecursosMSC = "1500";
                codAEO = "nan";
                ficha = "650";
              } else if (
                verificarCod(
                  tipo11,
                  ["04"],
                  ["08"],
                  ["122"],
                  ["5119"],
                  ["2"],
                  ["315"],
                  ["449052"],
                  ["132000"],
                )
              ) {
                poderOrgao = "10131";
                codFontRecursosMSC = "1661";
                codAEO = "nan";
                ficha = "1184";
              } else if (
                verificarCod(
                  tipo11,
                  ["04"],
                  ["08"],
                  ["122"],
                  ["5119"],
                  ["2"],
                  ["308"],
                  ["449052"],
                  ["229056"],
                )
              ) {
                poderOrgao = "10131";
                codFontRecursosMSC = "2669";
                codAEO = "nan";
                ficha = "1114";
              } else if (
                verificarCod(
                  tipo11,
                  ["04"],
                  ["08"],
                  ["243"],
                  ["5120"],
                  ["2"],
                  ["317"],
                  ["339036"],
                  ["100000"],
                )
              ) {
                poderOrgao = "10131";
                codFontRecursosMSC = "1500";
                codAEO = "nan";
                ficha = "660";
              } else if (
                verificarCod(
                  tipo11,
                  ["04"],
                  ["08"],
                  ["244"],
                  ["5118"],
                  ["2"],
                  ["302"],
                  ["339030"],
                  ["100000"],
                )
              ) {
                poderOrgao = "10131";
                codFontRecursosMSC = "1500";
                codAEO = "nan";
                ficha = "662";
              } else if (
                verificarCod(
                  tipo11,
                  ["04"],
                  ["08"],
                  ["244"],
                  ["5118"],
                  ["2"],
                  ["302"],
                  ["339039"],
                  ["100000"],
                )
              ) {
                poderOrgao = "10131";
                codFontRecursosMSC = "1500";
                codAEO = "nan";
                ficha = "663";
              } else if (
                verificarCod(
                  tipo11,
                  ["04"],
                  ["08"],
                  ["244"],
                  ["5118"],
                  ["2"],
                  ["302"],
                  ["449051"],
                  ["100000"],
                )
              ) {
                poderOrgao = "10131";
                codFontRecursosMSC = "1500";
                codAEO = "nan";
                ficha = "664";
              } else if (
                verificarCod(
                  tipo11,
                  ["04"],
                  ["08"],
                  ["244"],
                  ["5119"],
                  ["2"],
                  ["305"],
                  ["339033"],
                  ["100000"],
                )
              ) {
                poderOrgao = "10131";
                codFontRecursosMSC = "1500";
                codAEO = "nan";
                ficha = "667";
              } else if (
                verificarCod(
                  tipo11,
                  ["04"],
                  ["08"],
                  ["244"],
                  ["5119"],
                  ["2"],
                  ["316"],
                  ["339014"],
                  ["129056"],
                )
              ) {
                poderOrgao = "10131";
                codFontRecursosMSC = "1669";
                codAEO = "nan";
                ficha = "672";
              } else if (
                verificarCod(
                  tipo11,
                  ["04"],
                  ["08"],
                  ["244"],
                  ["5119"],
                  ["2"],
                  ["316"],
                  ["339039"],
                  ["229507"],
                )
              ) {
                poderOrgao = "10131";
                codFontRecursosMSC = "2660";
                codAEO = "nan";
                ficha = "1053";
              } else if (
                verificarCod(
                  tipo11,
                  ["04"],
                  ["08"],
                  ["245"],
                  ["5119"],
                  ["2"],
                  ["309"],
                  ["339014"],
                  ["129506"],
                )
              ) {
                poderOrgao = "10131";
                codFontRecursosMSC = "1660";
                codAEO = "nan";
                ficha = "682";
              } else if (
                verificarCod(
                  tipo11,
                  ["04"],
                  ["08"],
                  ["245"],
                  ["5119"],
                  ["2"],
                  ["309"],
                  ["339030"],
                  ["100000"],
                )
              ) {
                poderOrgao = "10131";
                codFontRecursosMSC = "1500";
                codAEO = "nan";
                ficha = "683";
              } else if (
                verificarCod(
                  tipo11,
                  ["04"],
                  ["08"],
                  ["245"],
                  ["5119"],
                  ["2"],
                  ["309"],
                  ["339030"],
                  ["129506"],
                )
              ) {
                poderOrgao = "10131";
                codFontRecursosMSC = "1660";
                codAEO = "nan";
                ficha = "684";
              } else if (
                verificarCod(
                  tipo11,
                  ["04"],
                  ["08"],
                  ["245"],
                  ["5119"],
                  ["2"],
                  ["309"],
                  ["339030"],
                  ["129559"],
                )
              ) {
                poderOrgao = "10131";
                codFontRecursosMSC = "1660";
                codAEO = "nan";
                ficha = "685";
              } else if (
                verificarCod(
                  tipo11,
                  ["04"],
                  ["08"],
                  ["245"],
                  ["5119"],
                  ["2"],
                  ["309"],
                  ["339030"],
                  ["229559"],
                )
              ) {
                poderOrgao = "10131";
                codFontRecursosMSC = "2660";
                codAEO = "nan";
                ficha = "1003";
              } else if (
                verificarCod(
                  tipo11,
                  ["04"],
                  ["08"],
                  ["245"],
                  ["5119"],
                  ["2"],
                  ["309"],
                  ["339030"],
                  ["229506"],
                )
              ) {
                poderOrgao = "10131";
                codFontRecursosMSC = "2660";
                codAEO = "nan";
                ficha = "1162";
              } else if (
                verificarCod(
                  tipo11,
                  ["04"],
                  ["08"],
                  ["245"],
                  ["5119"],
                  ["2"],
                  ["309"],
                  ["339030"],
                  ["132000"],
                )
              ) {
                poderOrgao = "10131";
                codFontRecursosMSC = "1661";
                codAEO = "nan";
                ficha = "1165";
              } else if (
                verificarCod(
                  tipo11,
                  ["04"],
                  ["08"],
                  ["245"],
                  ["5119"],
                  ["2"],
                  ["309"],
                  ["339033"],
                  ["129506"],
                )
              ) {
                poderOrgao = "10131";
                codFontRecursosMSC = "1660";
                codAEO = "nan";
                ficha = "686";
              } else if (
                verificarCod(
                  tipo11,
                  ["04"],
                  ["08"],
                  ["245"],
                  ["5119"],
                  ["2"],
                  ["309"],
                  ["339039"],
                  ["100000"],
                )
              ) {
                poderOrgao = "10131";
                codFontRecursosMSC = "1500";
                codAEO = "nan";
                ficha = "689";
              } else if (
                verificarCod(
                  tipo11,
                  ["04"],
                  ["08"],
                  ["245"],
                  ["5119"],
                  ["2"],
                  ["309"],
                  ["339039"],
                  ["129506"],
                )
              ) {
                poderOrgao = "10131";
                codFontRecursosMSC = "1660";
                codAEO = "nan";
                ficha = "690";
              } else if (
                verificarCod(
                  tipo11,
                  ["04"],
                  ["08"],
                  ["245"],
                  ["5119"],
                  ["2"],
                  ["309"],
                  ["449052"],
                  ["129506"],
                )
              ) {
                poderOrgao = "10131";
                codFontRecursosMSC = "1660";
                codAEO = "nan";
                ficha = "692";
              } else if (
                verificarCod(
                  tipo11,
                  ["04"],
                  ["08"],
                  ["245"],
                  ["5119"],
                  ["2"],
                  ["309"],
                  ["449052"],
                  ["282000"],
                )
              ) {
                poderOrgao = "10131";
                codFontRecursosMSC = "2706";
                codAEO = "3120";
                ficha = "1173";
              } else if (
                verificarCod(
                  tipo11,
                  ["04"],
                  ["08"],
                  ["245"],
                  ["5119"],
                  ["2"],
                  ["310"],
                  ["339030"],
                  ["129507"],
                )
              ) {
                poderOrgao = "10131";
                codFontRecursosMSC = "1660";
                codAEO = "nan";
                ficha = "694";
              } else if (
                verificarCod(
                  tipo11,
                  ["04"],
                  ["08"],
                  ["245"],
                  ["5119"],
                  ["2"],
                  ["310"],
                  ["339030"],
                  ["229507"],
                )
              ) {
                poderOrgao = "10131";
                codFontRecursosMSC = "2660";
                codAEO = "nan";
                ficha = "1004";
              } else if (
                verificarCod(
                  tipo11,
                  ["04"],
                  ["08"],
                  ["245"],
                  ["5119"],
                  ["2"],
                  ["310"],
                  ["339036"],
                  ["129507"],
                )
              ) {
                poderOrgao = "10131";
                codFontRecursosMSC = "1660";
                codAEO = "nan";
                ficha = "697";
              } else if (
                verificarCod(
                  tipo11,
                  ["04"],
                  ["08"],
                  ["245"],
                  ["5119"],
                  ["2"],
                  ["310"],
                  ["339039"],
                  ["129507"],
                )
              ) {
                poderOrgao = "10131";
                codFontRecursosMSC = "1660";
                codAEO = "nan";
                ficha = "699";
              } else if (
                verificarCod(
                  tipo11,
                  ["04"],
                  ["08"],
                  ["245"],
                  ["5119"],
                  ["2"],
                  ["310"],
                  ["449051"],
                  ["100000"],
                )
              ) {
                poderOrgao = "10131";
                codFontRecursosMSC = "1500";
                codAEO = "nan";
                ficha = "700";
              } else if (
                verificarCod(
                  tipo11,
                  ["04"],
                  ["08"],
                  ["245"],
                  ["5119"],
                  ["2"],
                  ["310"],
                  ["449052"],
                  ["129507"],
                )
              ) {
                poderOrgao = "10131";
                codFontRecursosMSC = "1660";
                codAEO = "nan";
                ficha = "701";
              } else if (
                verificarCod(
                  tipo11,
                  ["04"],
                  ["08"],
                  ["245"],
                  ["5119"],
                  ["2"],
                  ["312"],
                  ["339030"],
                  ["281000"],
                )
              ) {
                poderOrgao = "10131";
                codFontRecursosMSC = "2706";
                codAEO = "3110";
                ficha = "1005";
              } else if (
                verificarCod(
                  tipo11,
                  ["04"],
                  ["08"],
                  ["246"],
                  ["5119"],
                  ["2"],
                  ["357"],
                  ["339032"],
                  ["100000"],
                )
              ) {
                poderOrgao = "10131";
                codFontRecursosMSC = "1500";
                codAEO = "nan";
                ficha = "712";
              } else if (
                verificarCod(
                  tipo11,
                  ["04"],
                  ["08"],
                  ["246"],
                  ["5119"],
                  ["2"],
                  ["357"],
                  ["339042"],
                  ["100000"],
                )
              ) {
                poderOrgao = "10131";
                codFontRecursosMSC = "1500";
                codAEO = "nan";
                ficha = "713";
              } else if (
                verificarCod(
                  tipo11,
                  ["04"],
                  ["14"],
                  ["846"],
                  ["4156"],
                  ["9"],
                  ["027"],
                  ["469071"],
                  ["100000"],
                )
              ) {
                poderOrgao = "10131";
                codFontRecursosMSC = "1500";
                codAEO = "nan";
                ficha = "714";
              } else if (
                verificarCod(
                  tipo11,
                  ["04"],
                  ["16"],
                  ["482"],
                  ["5122"],
                  ["2"],
                  ["321"],
                  ["339048"],
                  ["100000"],
                )
              ) {
                poderOrgao = "10131";
                codFontRecursosMSC = "1500";
                codAEO = "nan";
                ficha = "715";
              } else if (
                verificarCod(
                  tipo11,
                  ["04"],
                  ["16"],
                  ["482"],
                  ["5122"],
                  ["2"],
                  ["321"],
                  ["339048"],
                  ["232000"],
                )
              ) {
                poderOrgao = "10131";
                codFontRecursosMSC = "2661";
                codAEO = "nan";
                ficha = "991";
              } else if (
                verificarCod(
                  tipo11,
                  ["04"],
                  ["16"],
                  ["482"],
                  ["5122"],
                  ["2"],
                  ["321"],
                  ["339048"],
                  ["132000"],
                )
              ) {
                poderOrgao = "10131";
                codFontRecursosMSC = "1661";
                codAEO = "nan";
                ficha = "1185";
              }
            }
            // 12 - FMDCA - FUNDO MUNICIPAL DA CRIANÇA E ADOLESCENTE
            if (tipo11.codOrgao === "12") {
              if (
                verificarCod(
                  tipo11,
                  ["01"],
                  ["14"],
                  ["243"],
                  ["4138"],
                  ["3"],
                  ["110"],
                  ["339039"],
                  ["150000"],
                )
              ) {
                poderOrgao = "10131";
                codFontRecursosMSC = "1899";
                codAEO = "nan";
                ficha = "720";
              } else if (
                verificarCod(
                  tipo11,
                  ["01"],
                  ["14"],
                  ["243"],
                  ["4138"],
                  ["3"],
                  ["110"],
                  ["339039"],
                  ["250000"],
                )
              ) {
                poderOrgao = "10131";
                codFontRecursosMSC = "2899";
                codAEO = "nan";
                ficha = "981";
              } else if (
                verificarCod(
                  tipo11,
                  ["01"],
                  ["14"],
                  ["243"],
                  ["4138"],
                  ["3"],
                  ["110"],
                  ["339039"],
                  ["150000"],
                )
              ) {
                poderOrgao = "10131";
                codFontRecursosMSC = "1759";
                codAEO = "nan";
                ficha = "8018";
              }
            }
            // 15 - PROCON - SENADOR CANEDO
            if (tipo11.codOrgao === "15") {
              if (
                verificarCod(
                  tipo11,
                  ["01"],
                  ["04"],
                  ["422"],
                  ["5153"],
                  ["9"],
                  ["034"],
                  ["339039"],
                  ["110000"],
                )
              ) {
                poderOrgao = "10131";
                codFontRecursosMSC = "1759";
                codAEO = "nan";
                ficha = "725";
              } else if (
                verificarCod(
                  tipo11,
                  [""],
                  [""],
                  [""],
                  [""],
                  [""],
                  [""],
                  [""],
                  ["100000"],
                )
              ) {
                poderOrgao = "10131";
                codFontRecursosMSC = "1869";
                codAEO = "nan";
                ficha = "9610";
              } else if (
                verificarCod(
                  tipo11,
                  ["01"],
                  ["04"],
                  ["422"],
                  ["5153"],
                  ["9"],
                  ["034"],
                  ["319013"],
                  ["100000"],
                )
              ) {
                poderOrgao = "10131";
                codFontRecursosMSC = "1500";
                codAEO = "nan";
                ficha = "8019";
              }
            }
            // 18 - SANESC - AGENCIA DE SANEAMENTO DE SENADOR CANEDO
            if (tipo11.codOrgao === "18") {
              if (
                verificarCod(
                  tipo11,
                  ["02"],
                  ["17"],
                  ["122"],
                  ["4100"],
                  ["4"],
                  ["197"],
                  ["319004"],
                  ["110000"],
                )
              ) {
                poderOrgao = "10131";
                codFontRecursosMSC = "1759";
                codAEO = "nan";
                ficha = "1123";
              } else if (
                verificarCod(
                  tipo11,
                  ["02"],
                  ["17"],
                  ["122"],
                  ["4100"],
                  ["4"],
                  ["197"],
                  ["319011"],
                  ["110000"],
                )
              ) {
                poderOrgao = "10131";
                codFontRecursosMSC = "1759";
                codAEO = "nan";
                ficha = "727";
              } else if (
                verificarCod(
                  tipo11,
                  ["02"],
                  ["17"],
                  ["122"],
                  ["4100"],
                  ["4"],
                  ["197"],
                  ["319013"],
                  ["110"],
                )
              ) {
                poderOrgao = "10131";
                codFontRecursosMSC = "1759";
                codAEO = "nan";
                ficha = "728";
              } else if (
                verificarCod(
                  tipo11,
                  ["02"],
                  ["17"],
                  ["4100"],
                  ["4"],
                  ["197"],
                  ["319094"],
                  ["110000"],
                )
              ) {
                poderOrgao = "10131";
                codFontRecursosMSC = "1759";
                codAEO = "nan";
                ficha = "729";
              } else if (
                verificarCod(
                  tipo11,
                  ["02"],
                  ["17"],
                  ["122"],
                  ["4100"],
                  ["4"],
                  ["197"],
                  ["319113"],
                  ["110000"],
                )
              ) {
                poderOrgao = "10131";
                codFontRecursosMSC = "1759";
                codAEO = "nan";
                ficha = "731";
              } else if (
                verificarCod(
                  tipo11,
                  ["02"],
                  ["17"],
                  ["122"]["4100"]["4"]["197"]["339008"]["110000"],
                )
              ) {
                poderOrgao = "10131";
                codFontRecursosMSC = "1759";
                codAEO = "nan";
                ficha = "734";
              } else if (
                verificarCod(
                  tipo11,
                  ["02"],
                  ["17"],
                  ["122"],
                  ["4100"],
                  ["4"],
                  ["197"]["339014"],
                  ["110000"],
                )
              ) {
                poderOrgao = "10131";
                codFontRecursosMSC = "1759";
                codAEO = "nan";
                ficha = "735";
              } else if (
                verificarCod(
                  tipo11,
                  ["02"],
                  ["17"],
                  ["122"],
                  ["4100"],
                  ["4"],
                  ["197"],
                  ["339030"],
                  ["110000"],
                )
              ) {
                poderOrgao = "10131";
                codFontRecursosMSC = "1759";
                codAEO = "nan";
                ficha = "736";
              } else if (
                verificarCod(
                  tipo11,
                  ["02"],
                  ["17"],
                  ["122"],
                  ["4100"],
                  ["4"],
                  ["197"],
                  ["339034"],
                  ["110000"],
                )
              ) {
                poderOrgao = "10131";
                codFontRecursosMSC = "1759";
                codAEO = "nan";
                ficha = "738";
              } else if (
                verificarCod(
                  tipo11,
                  ["02"],
                  ["17"],
                  ["122"],
                  ["4100"],
                  ["4"],
                  ["197"],
                  ["339036"],
                  ["110000"],
                )
              ) {
                poderOrgao = "10131";
                codFontRecursosMSC = "1759";
                codAEO = "nan";
                ficha = "739";
              } else if (
                verificarCod(
                  tipo11,
                  ["02"],
                  ["17"],
                  ["122"],
                  ["4100"],
                  ["4"],
                  ["197"],
                  ["339039"],
                  ["110000"],
                )
              ) {
                poderOrgao = "10131";
                codFontRecursosMSC = "1759";
                codAEO = "nan";
                ficha = "740";
              } else if (
                verificarCod(
                  tipo11,
                  ["02"],
                  ["17"],
                  ["122"],
                  ["4100"],
                  ["4"],
                  ["197"],
                  ["339037"],
                  ["110000"],
                )
              ) {
                poderOrgao = "10131";
                codFontRecursosMSC = "1759";
                codAEO = "nan";
                ficha = "1017";
              } else if (
                verificarCod(
                  tipo11,
                  ["02"],
                  ["17"],
                  ["122"],
                  ["4100"],
                  ["4"],
                  ["197"],
                  ["339037"],
                  ["110000"],
                )
              ) {
                poderOrgao = "10131";
                codFontRecursosMSC = "1500";
                codAEO = "nan";
                ficha = "1220";
              } else if (
                verificarCod(
                  tipo11,
                  ["02"],
                  ["17"],
                  ["122"],
                  ["4100"],
                  ["4"],
                  ["197"],
                  ["339039"],
                  ["110000"],
                )
              ) {
                poderOrgao = "10131";
                codFontRecursosMSC = "1759";
                codAEO = "nan";
                ficha = "740";
              } else if (
                verificarCod(
                  tipo11,
                  ["02"],
                  ["17"],
                  ["122"],
                  ["4100"],
                  ["4"],
                  ["197"],
                  ["339039"],
                  ["210000"],
                )
              ) {
                poderOrgao = "10131";
                codFontRecursosMSC = "2759";
                codAEO = "nan";
                ficha = "1000";
              } else if (
                verificarCod(
                  tipo11,
                  ["02"],
                  ["17"],
                  ["122"],
                  ["4100"],
                  ["4"],
                  ["197"],
                  ["339039"],
                  ["100000"],
                )
              ) {
                poderOrgao = "10131";
                codFontRecursosMSC = "1500";
                codAEO = "nan";
                ficha = "1221";
              } else if (
                verificarCod(
                  tipo11,
                  ["02"],
                  ["17"],
                  ["122"],
                  ["4100"],
                  ["4"],
                  ["197"],
                  ["339040"],
                  ["110000"],
                )
              ) {
                poderOrgao = "10131";
                codFontRecursosMSC = "1759";
                codAEO = "nan";
                ficha = "741";
              } else if (
                verificarCod(
                  tipo11,
                  ["02"],
                  ["17"],
                  ["122"],
                  ["4100"],
                  ["4"],
                  ["197"],
                  ["339046"],
                  ["110000"],
                )
              ) {
                poderOrgao = "10131";
                codFontRecursosMSC = "1759";
                codAEO = "nan";
                ficha = "742";
              } else if (
                verificarCod(
                  tipo11,
                  ["02"],
                  ["17"],
                  ["122"],
                  ["4100"],
                  ["4"],
                  ["197"],
                  ["339047"],
                  ["110000"],
                )
              ) {
                poderOrgao = "10131";
                codFontRecursosMSC = "1759";
                codAEO = "nan";
                ficha = "743";
              } else if (
                verificarCod(
                  tipo11,
                  ["02"],
                  ["17"],
                  ["122"],
                  ["4100"],
                  ["4"],
                  ["197"],
                  ["339049"],
                  ["110000"],
                )
              ) {
                poderOrgao = "10131";
                codFontRecursosMSC = "1759";
                codAEO = "nan";
                ficha = "744";
              } else if (
                verificarCod(
                  tipo11,
                  ["02"],
                  ["17"],
                  ["122"],
                  ["4100"],
                  ["4"],
                  ["197"],
                  ["339091"],
                  ["110000"],
                )
              ) {
                poderOrgao = "10131";
                codFontRecursosMSC = "1759";
                codAEO = "nan";
                ficha = "745";
              } else if (
                verificarCod(
                  tipo11,
                  ["02"],
                  ["17"],
                  ["122"],
                  ["4100"],
                  ["4"],
                  ["197"],
                  ["339093"],
                  ["110000"],
                )
              ) {
                poderOrgao = "10131";
                codFontRecursosMSC = "1759";
                codAEO = "nan";
                ficha = "747";
              } else if (
                verificarCod(
                  tipo11,
                  ["02"],
                  ["17"],
                  ["122"],
                  ["4100"],
                  ["4"],
                  ["197"],
                  ["339093"],
                  ["123000"],
                )
              ) {
                poderOrgao = "10131";
                codFontRecursosMSC = "1700";
                codAEO = "nan";
                ficha = "1091";
              } else if (
                verificarCod(
                  tipo11,
                  ["02"],
                  ["17"],
                  ["122"],
                  ["4100"],
                  ["4"],
                  ["197"],
                  ["339093"],
                  ["200000"],
                )
              ) {
                poderOrgao = "10131";
                codFontRecursosMSC = "2500";
                codAEO = "nan";
                ficha = "1092";
              } else if (
                verificarCod(
                  tipo11,
                  ["02"],
                  ["17"],
                  ["122"],
                  ["4100"],
                  ["4"],
                  ["197"],
                  ["339093"],
                  ["210000"],
                )
              ) {
                poderOrgao = "10131";
                codFontRecursosMSC = "2759";
                codAEO = "nan";
                ficha = "1093";
              } else if (
                verificarCod(
                  tipo11,
                  ["02"],
                  ["17"],
                  ["122"],
                  ["4100"],
                  ["4"],
                  ["197"],
                  ["339093"],
                  ["223000"],
                )
              ) {
                poderOrgao = "10131";
                codFontRecursosMSC = "2700";
                codAEO = "nan";
                ficha = "1094";
              } else if (
                verificarCod(
                  tipo11,
                  ["02"],
                  ["17"],
                  ["122"],
                  ["4100"],
                  ["4"],
                  ["197"],
                  ["339093"],
                  ["100000"],
                )
              ) {
                poderOrgao = "10131";
                codFontRecursosMSC = "1500";
                codAEO = "nan";
                ficha = "1164";
              } else if (
                verificarCod(
                  tipo11,
                  ["02"],
                  ["17"],
                  ["122"],
                  ["4100"],
                  ["4"],
                  ["197"],
                  ["339197"],
                  ["110000"],
                )
              ) {
                poderOrgao = "10131";
                codFontRecursosMSC = "1759";
                codAEO = "nan";
                ficha = "748";
              } else if (
                verificarCod(
                  tipo11,
                  ["02"],
                  ["17"],
                  ["122"],
                  ["4100"],
                  ["4"],
                  ["197"],
                  ["449052"],
                  ["110000"],
                )
              ) {
                poderOrgao = "10131";
                codFontRecursosMSC = "1759";
                codAEO = "nan";
                ficha = "749";
              } else if (
                verificarCod(
                  tipo11,
                  ["02"],
                  ["17"],
                  ["122"],
                  ["4100"],
                  ["4"],
                  ["197"],
                  ["449052"],
                  ["192032"],
                )
              ) {
                poderOrgao = "10131";
                codFontRecursosMSC = "1755";
                codAEO = "nan";
                ficha = "1180";
              } else if (
                verificarCod(
                  tipo11,
                  ["02"],
                  ["17"],
                  ["122"],
                  ["4100"],
                  ["4"],
                  ["197"],
                  ["469071"],
                  ["110000"],
                )
              ) {
                poderOrgao = "10131";
                codFontRecursosMSC = "1759";
                codAEO = "nan";
                ficha = "750";
              } else if (
                verificarCod(
                  tipo11,
                  ["02"],
                  ["17"],
                  ["122"],
                  ["4100"],
                  ["4"],
                  ["197"],
                  ["449093"],
                  ["110000"],
                )
              ) {
                poderOrgao = "10131";
                codFontRecursosMSC = "1759";
                codAEO = "nan";
                ficha = "1099";
              }
            }
            // 19 - AMMA - AGENCIA MUNICIPAL DE MEIO AMBIENTE
            if (tipo11.codOrgao === "19") {
              if (
                verificarCod(
                  tipo11,
                  ["03"],
                  ["18"],
                  ["122"],
                  ["4100"],
                  ["4"],
                  ["169"],
                  ["319011"],
                  ["100000"],
                )
              ) {
                poderOrgao = "10131";
                codFontRecursosMSC = "1500";
                codAEO = "nan";
                ficha = "757";
              } else if (
                verificarCod(
                  tipo11,
                  ["03"],
                  ["18"],
                  ["122"],
                  ["4100"],
                  ["4"],
                  ["169"],
                  ["319011"],
                  ["251000"],
                )
              ) {
                poderOrgao = "10131";
                codFontRecursosMSC = "2899";
                codAEO = "nan";
                ficha = "1188";
              } else if (
                verificarCod(
                  tipo11,
                  ["03"],
                  ["18"],
                  ["122"],
                  ["4100"],
                  ["4"],
                  ["169"],
                  ["319013"],
                  ["100000"],
                )
              ) {
                poderOrgao = "10131";
                codFontRecursosMSC = "1500";
                codAEO = "nan";
                ficha = "758";
              } else if (
                verificarCod(
                  tipo11,
                  ["03"],
                  ["18"],
                  ["122"],
                  ["4100"],
                  ["4"],
                  ["169"],
                  ["319094"],
                  ["100000"],
                )
              ) {
                poderOrgao = "10131";
                codFontRecursosMSC = "1500";
                codAEO = "nan";
                ficha = "759";
              } else if (
                verificarCod(
                  tipo11,
                  ["03"],
                  ["18"],
                  ["122"],
                  ["4100"],
                  ["4"],
                  ["169"],
                  ["319113"],
                  ["100000"],
                )
              ) {
                poderOrgao = "10131";
                codFontRecursosMSC = "1500";
                codAEO = "nan";
                ficha = "760";
              } else if (
                verificarCod(
                  tipo11,
                  ["03"],
                  ["18"],
                  ["122"],
                  ["4100"],
                  ["4"],
                  ["169"],
                  ["319113"],
                  ["251000"],
                )
              ) {
                poderOrgao = "10131";
                codFontRecursosMSC = "2899";
                codAEO = "nan";
                ficha = "1189";
              } else if (
                verificarCod(
                  tipo11,
                  ["03"],
                  ["18"],
                  ["122"],
                  ["4100"],
                  ["4"],
                  ["169"],
                  ["339014"],
                  ["100000"],
                )
              ) {
                poderOrgao = "10131";
                codFontRecursosMSC = "1500";
                codAEO = "nan";
                ficha = "762";
              } else if (
                verificarCod(
                  tipo11,
                  ["03"],
                  ["18"],
                  ["122"],
                  ["4100"],
                  ["4"],
                  ["169"],
                  ["339030"],
                  ["100000"],
                )
              ) {
                poderOrgao = "10131";
                codFontRecursosMSC = "1500";
                codAEO = "nan";
                ficha = "763";
              } else if (
                verificarCod(
                  tipo11,
                  ["03"],
                  ["18"],
                  ["122"],
                  ["4100"],
                  ["4"],
                  ["169"],
                  ["339036"],
                  ["151000"],
                )
              ) {
                poderOrgao = "10131";
                codFontRecursosMSC = "1899";
                codAEO = "nan";
                ficha = "767";
              } else if (
                verificarCod(
                  tipo11,
                  ["03"],
                  ["18"],
                  ["122"],
                  ["4100"],
                  ["4"],
                  ["169"],
                  ["339039"],
                  ["100000"],
                )
              ) {
                poderOrgao = "10131";
                codFontRecursosMSC = "1500";
                codAEO = "nan";
                ficha = "768";
              } else if (
                verificarCod(
                  tipo11,
                  ["03"],
                  ["18"],
                  ["122"],
                  ["4100"],
                  ["4"],
                  ["169"],
                  ["339039"],
                  ["151000"],
                )
              ) {
                poderOrgao = "10131";
                codFontRecursosMSC = "1899";
                codAEO = "nan";
                ficha = "769";
              } else if (
                verificarCod(
                  tipo11,
                  ["03"],
                  ["18"],
                  ["122"],
                  ["4100"],
                  ["4"],
                  ["169"],
                  ["339039"],
                  ["251000"],
                )
              ) {
                poderOrgao = "10131";
                codFontRecursosMSC = "2899";
                codAEO = "nan";
                ficha = "1133";
              } else if (
                verificarCod(
                  tipo11,
                  ["03"],
                  ["18"],
                  ["122"],
                  ["4100"],
                  ["4"],
                  ["169"],
                  ["339040"],
                  ["151000"],
                )
              ) {
                poderOrgao = "10131";
                codFontRecursosMSC = "1899";
                codAEO = "nan";
                ficha = "770";
              } else if (
                verificarCod(
                  tipo11,
                  ["03"],
                  ["18"],
                  ["122"],
                  ["4100"],
                  ["4"],
                  ["169"],
                  ["339046"],
                  ["100000"],
                )
              ) {
                poderOrgao = "10131";
                codFontRecursosMSC = "1500";
                codAEO = "nan";
                ficha = "771";
              } else if (
                verificarCod(
                  tipo11,
                  ["03"],
                  ["18"],
                  ["122"],
                  ["4100"],
                  ["4"],
                  ["169"],
                  ["339047"],
                  ["100000"],
                )
              ) {
                poderOrgao = "10131";
                codFontRecursosMSC = "1500";
                codAEO = "nan";
                ficha = "772";
              } else if (
                verificarCod(
                  tipo11,
                  ["03"],
                  ["18"],
                  ["122"],
                  ["4100"],
                  ["4"],
                  ["169"],
                  ["339049"],
                  ["100000"],
                )
              ) {
                poderOrgao = "10131";
                codFontRecursosMSC = "1500";
                codAEO = "nan";
                ficha = "773";
              } else if (
                verificarCod(
                  tipo11,
                  ["03"],
                  ["18"],
                  ["122"],
                  ["4100"],
                  ["4"],
                  ["169"],
                  ["339093"],
                  ["100000"],
                )
              ) {
                poderOrgao = "10131";
                codFontRecursosMSC = "1500";
                codAEO = "nan";
                ficha = "776";
              } else if (
                verificarCod(
                  tipo11,
                  ["03"],
                  ["18"],
                  ["122"],
                  ["4100"],
                  ["4"],
                  ["169"],
                  ["339197"],
                  ["100000"],
                )
              ) {
                poderOrgao = "10131";
                codFontRecursosMSC = "1500";
                codAEO = "nan";
                ficha = "777";
              } else if (
                verificarCod(
                  tipo11,
                  ["03"],
                  ["18"],
                  ["122"],
                  ["4100"],
                  ["4"],
                  ["169"],
                  ["449052"],
                  ["151000"],
                )
              ) {
                poderOrgao = "10131";
                codFontRecursosMSC = "1899";
                codAEO = "nan";
                ficha = "778";
              } else if (
                verificarCod(
                  tipo11,
                  ["03"],
                  ["18"],
                  ["122"],
                  ["4100"],
                  ["4"],
                  ["180"],
                  ["339030"],
                  ["151000"],
                )
              ) {
                poderOrgao = "10131";
                codFontRecursosMSC = "1899";
                codAEO = "nan";
                ficha = "779";
              } else if (
                verificarCod(
                  tipo11,
                  ["03"],
                  ["18"],
                  ["122"],
                  ["4100"],
                  ["4"],
                  ["180"],
                  ["339039"],
                  ["151000"],
                )
              ) {
                poderOrgao = "10131";
                codFontRecursosMSC = "1899";
                codAEO = "nan";
                ficha = "781";
              } else if (
                verificarCod(
                  tipo11,
                  ["03"],
                  ["18"],
                  ["604"],
                  ["5129"],
                  ["4"],
                  ["181"],
                  ["339030"],
                  ["100000"],
                )
              ) {
                poderOrgao = "10131";
                codFontRecursosMSC = "1500";
                codAEO = "nan";
                ficha = "804";
              } else if (
                verificarCod(
                  tipo11,
                  ["03"],
                  ["18"],
                  ["604"],
                  ["5129"],
                  ["4"],
                  ["181"],
                  ["339039"],
                  ["100000"],
                )
              ) {
                poderOrgao = "10131";
                codFontRecursosMSC = "1500";
                codAEO = "nan";
                ficha = "807";
              }
            }
            // 20 - FME - FUNDO MUNICIPAL DE EDUCAÇÃO, CULTURA ESPORTE
            if (tipo11.codOrgao === "20") {
              if (
                verificarCod(
                  tipo11,
                  ["01"],
                  ["12"],
                  ["306"],
                  ["5002"],
                  ["3"],
                  ["217"],
                  ["339030"],
                  ["115049"],
                )
              ) {
                poderOrgao = "10131";
                codFontRecursosMSC = "1500";
                codAEO = "nan";
                ficha = "";
              } else if (
                verificarCod(
                  tipo11,
                  ["01"],
                  ["12"],
                  ["306"],
                  ["5002"],
                  ["3"],
                  ["217"],
                  ["339030"],
                  ["115051"],
                )
              ) {
                poderOrgao = "10131";
                codFontRecursosMSC = "1552";
                codAEO = "nan";
                ficha = "812";
              } else if (
                verificarCod(
                  tipo11,
                  ["01"],
                  ["12"],
                  ["306"],
                  ["5002"],
                  ["3"],
                  ["217"],
                  ["339030"],
                  ["215051"],
                )
              ) {
                poderOrgao = "10131";
                codFontRecursosMSC = "2552";
                codAEO = "nan";
                ficha = "1032";
              } else if (
                verificarCod(
                  tipo11,
                  ["01"],
                  ["12"],
                  ["361"],
                  ["4100"],
                  ["4"],
                  ["165"],
                  ["319004"],
                  ["101000"],
                )
              ) {
                poderOrgao = "10131";
                codFontRecursosMSC = "1500";
                codAEO = "1001";
                ficha = "815";
              } else if (
                verificarCod(
                  tipo11,
                  ["01"],
                  ["12"],
                  ["361"],
                  ["4100"],
                  ["4"],
                  ["165"],
                  ["319011"],
                  ["101000"],
                )
              ) {
                poderOrgao = "10131";
                codFontRecursosMSC = "1500";
                codAEO = "1001";
                ficha = "816";
              } else if (
                verificarCod(
                  tipo11,
                  ["01"],
                  ["12"],
                  ["361"],
                  ["4100"],
                  ["4"],
                  ["165"],
                  ["319013"],
                  ["101000"],
                )
              ) {
                poderOrgao = "10131";
                codFontRecursosMSC = "1500";
                codAEO = "1001";
                ficha = "817";
              } else if (
                verificarCod(
                  tipo11,
                  ["01"],
                  ["12"],
                  ["361"],
                  ["4100"],
                  ["4"],
                  ["165"],
                  ["319094"],
                  ["101000"],
                )
              ) {
                poderOrgao = "10131";
                codFontRecursosMSC = "1500";
                codAEO = "1001";
                ficha = "818";
              } else if (
                verificarCod(
                  tipo11,
                  ["01"],
                  ["12"],
                  ["361"],
                  ["4100"],
                  ["4"],
                  ["165"],
                  ["319113"],
                  ["101000"],
                )
              ) {
                poderOrgao = "10131";
                codFontRecursosMSC = "1500";
                codAEO = "1001";
                ficha = "819";
              } else if (
                verificarCod(
                  tipo11,
                  ["01"],
                  ["12"],
                  ["361"],
                  ["4100"],
                  ["4"],
                  ["165"],
                  ["339008"],
                  ["101000"],
                )
              ) {
                poderOrgao = "10131";
                codFontRecursosMSC = "1500";
                codAEO = "1001";
                ficha = "820";
              } else if (
                verificarCod(
                  tipo11,
                  ["01"],
                  ["12"],
                  ["361"],
                  ["4100"],
                  ["4"],
                  ["165"],
                  ["339008"],
                  ["101000"],
                )
              ) {
                poderOrgao = "10131";
                codFontRecursosMSC = "1500";
                codAEO = "1001";
                ficha = "820";
              } else if (
                verificarCod(
                  tipo11,
                  ["01"],
                  ["12"],
                  ["361"],
                  ["4100"],
                  ["4"],
                  ["165"],
                  ["339014"],
                  ["101000"],
                )
              ) {
                poderOrgao = "10131";
                codFontRecursosMSC = "1500";
                codAEO = "1001";
                ficha = "821";
              } else if (
                verificarCod(
                  tipo11,
                  ["01"],
                  ["12"],
                  ["361"],
                  ["4100"],
                  ["4"],
                  ["165"],
                  ["339030"],
                  ["101000"],
                )
              ) {
                poderOrgao = "10131";
                codFontRecursosMSC = "1500";
                codAEO = "1001";
                ficha = "822";
              } else if (
                verificarCod(
                  tipo11,
                  ["01"],
                  ["12"],
                  ["361"],
                  ["4100"],
                  ["4"],
                  ["165"],
                  ["339030"],
                  ["115049"],
                )
              ) {
                poderOrgao = "10131";
                codFontRecursosMSC = "1500";
                codAEO = "nan";
                ficha = "1098";
              } else if (
                verificarCod(
                  tipo11,
                  ["01"],
                  ["12"],
                  ["361"],
                  ["4100"],
                  ["4"],
                  ["165"],
                  ["339033"],
                  ["101000"],
                )
              ) {
                poderOrgao = "10131";
                codFontRecursosMSC = "1500";
                codAEO = "1001";
                ficha = "824";
              } else if (
                verificarCod(
                  tipo11,
                  ["01"],
                  ["12"],
                  ["361"],
                  ["4100"],
                  ["4"],
                  ["165"],
                  ["339036"],
                  ["101000"],
                )
              ) {
                poderOrgao = "10131";
                codFontRecursosMSC = "1500";
                codAEO = "1001";
                ficha = "826";
              } else if (
                verificarCod(
                  tipo11,
                  ["01"],
                  ["12"],
                  ["361"],
                  ["4100"],
                  ["4"],
                  ["165"],
                  ["339039"],
                  ["101000"],
                )
              ) {
                poderOrgao = "10131";
                codFontRecursosMSC = "1500";
                codAEO = "1001";
                ficha = "827";
              } else if (
                verificarCod(
                  tipo11,
                  ["01"],
                  ["12"],
                  ["361"],
                  ["4100"],
                  ["4"],
                  ["165"],
                  ["339039"],
                  ["115049"],
                )
              ) {
                poderOrgao = "10131";
                codFontRecursosMSC = "1550";
                codAEO = "nan";
                ficha = "992";
              } else if (
                verificarCod(
                  tipo11,
                  ["01"],
                  ["12"],
                  ["361"],
                  ["4100"],
                  ["4"],
                  ["165"],
                  ["339039"],
                  ["201000"],
                )
              ) {
                poderOrgao = "10131";
                codFontRecursosMSC = "2500";
                codAEO = "1001";
                ficha = "1033";
              } else if (
                verificarCod(
                  tipo11,
                  ["01"],
                  ["12"],
                  ["361"],
                  ["4100"],
                  ["4"],
                  ["165"],
                  ["339040"],
                  ["101000"],
                )
              ) {
                poderOrgao = "10131";
                codFontRecursosMSC = "1500";
                codAEO = "1001";
                ficha = "828";
              } else if (
                verificarCod(
                  tipo11,
                  ["01"],
                  ["12"],
                  ["361"],
                  ["4100"],
                  ["4"],
                  ["165"],
                  ["339040"],
                  ["115049"],
                )
              ) {
                poderOrgao = "10131";
                codFontRecursosMSC = "1550";
                codAEO = "nan";
                ficha = "993";
              } else if (
                verificarCod(
                  tipo11,
                  ["01"],
                  ["12"],
                  ["361"],
                  ["4100"],
                  ["4"],
                  ["165"],
                  ["339041"],
                  ["101000"],
                )
              ) {
                poderOrgao = "10131";
                codFontRecursosMSC = "1500";
                codAEO = "1001";
                ficha = "829";
              } else if (
                verificarCod(
                  tipo11,
                  ["01"],
                  ["12"],
                  ["361"],
                  ["4100"],
                  ["4"],
                  ["165"],
                  ["339046"],
                  ["101000"],
                )
              ) {
                poderOrgao = "10131";
                codFontRecursosMSC = "1500";
                codAEO = "1001";
                ficha = "831";
              } else if (
                verificarCod(
                  tipo11,
                  ["01"],
                  ["12"],
                  ["361"],
                  ["4100"],
                  ["4"],
                  ["165"],
                  ["339047"],
                  ["101000"],
                )
              ) {
                poderOrgao = "10131";
                codFontRecursosMSC = "1500";
                codAEO = "1001";
                ficha = "832";
              } else if (
                verificarCod(
                  tipo11,
                  ["01"],
                  ["12"],
                  ["361"],
                  ["4100"],
                  ["4"],
                  ["165"],
                  ["339049"],
                  ["101000"],
                )
              ) {
                poderOrgao = "10131";
                codFontRecursosMSC = "1500";
                codAEO = "1001";
                ficha = "833";
              } else if (
                verificarCod(
                  tipo11,
                  ["01"],
                  ["12"],
                  ["361"],
                  ["4100"],
                  ["4"],
                  ["165"],
                  ["339091"],
                  ["101000"],
                )
              ) {
                poderOrgao = "10131";
                codFontRecursosMSC = "1500";
                codAEO = "1001";
                ficha = "834";
              } else if (
                verificarCod(
                  tipo11,
                  ["01"],
                  ["12"],
                  ["361"],
                  ["4100"],
                  ["4"],
                  ["165"],
                  ["339093"],
                  ["101000"],
                )
              ) {
                poderOrgao = "10131";
                codFontRecursosMSC = "1500";
                codAEO = "1001";
                ficha = "836";
              } else if (
                verificarCod(
                  tipo11,
                  ["01"],
                  ["12"],
                  ["361"],
                  ["4100"],
                  ["4"],
                  ["165"],
                  ["339093"],
                  ["178092"],
                )
              ) {
                poderOrgao = "10131";
                codFontRecursosMSC = "1715";
                codAEO = "nan";
                ficha = "994";
              } else if (
                verificarCod(
                  tipo11,
                  ["01"],
                  ["12"],
                  ["361"],
                  ["4100"],
                  ["4"],
                  ["165"],
                  ["339093"],
                  ["178093"],
                )
              ) {
                poderOrgao = "10131";
                codFontRecursosMSC = "1716";
                codAEO = "nan";
                ficha = "995";
              } else if (
                verificarCod(
                  tipo11,
                  ["01"],
                  ["12"],
                  ["361"],
                  ["4100"],
                  ["4"],
                  ["165"],
                  ["339093"],
                  ["278092"],
                )
              ) {
                poderOrgao = "10131";
                codFontRecursosMSC = "2715";
                codAEO = "nan";
                ficha = "996";
              } else if (
                verificarCod(
                  tipo11,
                  ["01"],
                  ["12"],
                  ["361"],
                  ["4100"],
                  ["4"],
                  ["165"],
                  ["339093"],
                  ["278093"],
                )
              ) {
                poderOrgao = "10131";
                codFontRecursosMSC = "2716";
                codAEO = "nan";
                ficha = "997";
              } else if (
                verificarCod(
                  tipo11,
                  ["01"],
                  ["12"],
                  ["361"],
                  ["4100"],
                  ["4"],
                  ["165"],
                  ["339093"],
                  ["124000"],
                )
              ) {
                poderOrgao = "10131";
                codFontRecursosMSC = "1571";
                codAEO = "nan";
                ficha = "1152";
              } else if (
                verificarCod(
                  tipo11,
                  ["01"],
                  ["12"],
                  ["361"],
                  ["4100"],
                  ["4"],
                  ["165"],
                  ["339093"],
                  ["224000"],
                )
              ) {
                poderOrgao = "10131";
                codFontRecursosMSC = "2571";
                codAEO = "nan";
                ficha = "1153";
              } else if (
                verificarCod(
                  tipo11,
                  ["01"],
                  ["12"],
                  ["361"],
                  ["4100"],
                  ["4"],
                  ["165"],
                  ["339093"],
                  ["215002"],
                )
              ) {
                poderOrgao = "10131";
                codFontRecursosMSC = "2569";
                codAEO = "nan";
                ficha = "1237";
              } else if (
                verificarCod(
                  tipo11,
                  ["01"],
                  ["12"],
                  ["361"],
                  ["4100"],
                  ["4"],
                  ["165"],
                  ["339197"],
                  ["101000"],
                )
              ) {
                poderOrgao = "10131";
                codFontRecursosMSC = "1500";
                codAEO = "1001";
                ficha = "838";
              } else if (
                verificarCod(
                  tipo11,
                  ["01"],
                  ["12"],
                  ["361"],
                  ["4100"],
                  ["4"],
                  ["165"],
                  ["449052"],
                  ["101000"],
                )
              ) {
                poderOrgao = "10131";
                codFontRecursosMSC = "1500";
                codAEO = "1001";
                ficha = "839";
              } else if (
                verificarCod(
                  tipo11,
                  ["01"],
                  ["12"],
                  ["361"],
                  ["5002"],
                  ["3"],
                  ["218"],
                  ["339030"],
                  ["101000"],
                )
              ) {
                poderOrgao = "10131";
                codFontRecursosMSC = "1500";
                codAEO = "1001";
                ficha = "842";
              } else if (
                verificarCod(
                  tipo11,
                  ["01"],
                  ["12"],
                  ["361"],
                  ["5002"],
                  ["3"],
                  ["218"],
                  ["339030"],
                  ["124000"],
                )
              ) {
                poderOrgao = "10131";
                codFontRecursosMSC = "1571";
                codAEO = "nan";
                ficha = "844";
              } else if (
                verificarCod(
                  tipo11,
                  ["01"],
                  ["12"],
                  ["361"],
                  ["5002"],
                  ["3"],
                  ["218"],
                  ["339030"],
                  ["124085"],
                )
              ) {
                poderOrgao = "10131";
                codFontRecursosMSC = "1571";
                codAEO = "nan";
                ficha = "845";
              } else if (
                verificarCod(
                  tipo11,
                  ["01"],
                  ["12"],
                  ["361"],
                  ["5200"],
                  ["3"],
                  ["218"],
                  ["339039"],
                  ["101000"],
                )
              ) {
                poderOrgao = "10131";
                codFontRecursosMSC = "1500";
                codAEO = "1001";
                ficha = "846";
              } else if (
                verificarCod(
                  tipo11,
                  ["01"],
                  ["12"],
                  ["361"],
                  ["5200"],
                  ["3"],
                  ["218"],
                  ["339039"],
                  ["115049"],
                )
              ) {
                poderOrgao = "10131";
                codFontRecursosMSC = "1550";
                codAEO = "nan";
                ficha = "847";
              } else if (
                verificarCod(
                  tipo11,
                  ["01"],
                  ["12"],
                  ["361"],
                  ["5002"],
                  ["3"],
                  ["218"],
                  ["339039"],
                  ["124085"],
                )
              ) {
                poderOrgao = "10131";
                codFontRecursosMSC = "1571";
                codAEO = "nan";
                ficha = "849";
              } else if (
                verificarCod(
                  tipo11,
                  ["01"],
                  ["12"],
                  ["361"],
                  ["5200"],
                  ["5"],
                  ["419"],
                  ["339030"],
                  ["101000"],
                )
              ) {
                poderOrgao = "10131";
                codFontRecursosMSC = "1500";
                codAEO = "1001";
                ficha = "856";
              } else if (
                verificarCod(
                  tipo11,
                  ["01"],
                  ["12"],
                  ["361"],
                  ["5200"],
                  ["5"],
                  ["419"],
                  ["339030"],
                  ["115049"],
                )
              ) {
                poderOrgao = "10131";
                codFontRecursosMSC = "1550";
                codAEO = "nan";
                ficha = "857";
              } else if (
                verificarCod(
                  tipo11,
                  ["01"],
                  ["12"],
                  ["361"],
                  ["5200"],
                  ["5"],
                  ["419"],
                  ["339030"],
                  ["237000"],
                )
              ) {
                poderOrgao = "10131";
                codFontRecursosMSC = "2710";
                codAEO = "3210";
                ficha = "1013";
              } else if (
                verificarCod(
                  tipo11,
                  ["01"],
                  ["12"],
                  ["361"],
                  ["5002"],
                  ["5"],
                  ["419"],
                  ["339030"],
                  ["200000"],
                )
              ) {
                poderOrgao = "10131";
                codFontRecursosMSC = "2500";
                codAEO = "1001";
                ficha = "1167";
              } else if (
                verificarCod(
                  tipo11,
                  ["01"],
                  ["12"],
                  ["361"],
                  ["5200"],
                  ["5"],
                  ["419"],
                  ["339032"],
                  ["101000"],
                )
              ) {
                poderOrgao = "10131";
                codFontRecursosMSC = "1500";
                codAEO = "1001";
                ficha = "860";
              } else if (
                verificarCod(
                  tipo11,
                  ["01"],
                  ["12"],
                  ["361"],
                  ["5002"],
                  ["5"],
                  ["419"],
                  ["339039"],
                  ["200000"],
                )
              ) {
                poderOrgao = "10131";
                codFontRecursosMSC = "2500";
                codAEO = "1001";
                ficha = "1168";
              } else if (
                verificarCod(
                  tipo11,
                  ["01"],
                  ["12"],
                  ["361"],
                  ["5200"],
                  ["5"],
                  ["419"],
                  ["339040"],
                  ["101000"],
                )
              ) {
                poderOrgao = "10131";
                codFontRecursosMSC = "1500";
                codAEO = "1001";
                ficha = "866";
              } else if (
                verificarCod(
                  tipo11,
                  ["01"],
                  ["12"],
                  ["361"],
                  ["52002"],
                  ["4"],
                  ["419"],
                  ["339047"],
                  ["101000"],
                )
              ) {
                poderOrgao = "10131";
                codFontRecursosMSC = "1500";
                codAEO = "1001";
                ficha = "867";
              } else if (
                verificarCod(
                  tipo11,
                  ["01"],
                  ["12"],
                  ["361"],
                  ["5200"],
                  ["5"],
                  ["419"],
                  ["339093"],
                  ["101000"],
                )
              ) {
                poderOrgao = "10131";
                codFontRecursosMSC = "1500";
                codAEO = "1001";
                ficha = "870";
              } else if (
                verificarCod(
                  tipo11,
                  ["01"],
                  ["12"],
                  ["361"],
                  ["5002"],
                  ["5"],
                  ["419"],
                  ["339093"],
                  ["181000"],
                )
              ) {
                poderOrgao = "10131";
                codFontRecursosMSC = "1706";
                codAEO = "3110";
                ficha = "1204";
              } else if (
                verificarCod(
                  tipo11,
                  ["01"],
                  ["12"],
                  ["361"],
                  ["5002"],
                  ["5"],
                  ["419"],
                  ["339093"],
                  ["281000"],
                )
              ) {
                poderOrgao = "10131";
                codFontRecursosMSC = "2706";
                codAEO = "3110";
                ficha = "1205";
              } else if (
                verificarCod(
                  tipo11,
                  ["01"],
                  ["12"],
                  ["361"],
                  ["5002"],
                  ["5"],
                  ["419"],
                  ["449052"],
                  ["101000"],
                )
              ) {
                poderOrgao = "10131";
                codFontRecursosMSC = "1500";
                codAEO = "1001";
                ficha = "871";
              } else if (
                verificarCod(
                  tipo11,
                  ["01"],
                  ["12"],
                  ["361"],
                  ["5002"],
                  ["5"],
                  ["419"],
                  ["449052"],
                  ["115049"],
                )
              ) {
                poderOrgao = "10131";
                codFontRecursosMSC = "1550";
                codAEO = "nan";
                ficha = "872";
              } else if (
                verificarCod(
                  tipo11,
                  ["01"],
                  ["12"],
                  ["361"],
                  ["5002"],
                  ["5"],
                  ["419"],
                  ["449052"],
                  ["101000"],
                )
              ) {
                poderOrgao = "10131";
                codFontRecursosMSC = "1500";
                codAEO = "1001";
                ficha = "871";
              } else if (
                verificarCod(
                  tipo11,
                  ["01"],
                  ["12"],
                  ["361"],
                  ["5002"],
                  ["5"],
                  ["419"],
                  ["449052"],
                  ["281000"],
                )
              ) {
                poderOrgao = "10131";
                codFontRecursosMSC = "2706";
                codAEO = "3110";
                ficha = "1109";
              } else if (
                verificarCod(
                  tipo11,
                  ["01"],
                  ["12"],
                  ["365"],
                  ["5002"],
                  ["5"],
                  ["420"],
                  ["339030"],
                  ["101000"],
                )
              ) {
                poderOrgao = "10131";
                codFontRecursosMSC = "1500";
                codAEO = "1001";
                ficha = "883";
              } else if (
                verificarCod(
                  tipo11,
                  ["01"],
                  ["12"],
                  ["365"],
                  ["5002"],
                  ["5"],
                  ["420"],
                  ["339030"],
                  ["115049"],
                )
              ) {
                poderOrgao = "10131";
                codFontRecursosMSC = "1550";
                codAEO = "nan";
                ficha = "884";
              } else if (
                verificarCod(
                  tipo11,
                  ["01"],
                  ["12"],
                  ["365"],
                  ["5002"],
                  ["5"],
                  ["420"],
                  ["339032"],
                  ["101000"],
                )
              ) {
                poderOrgao = "10131";
                codFontRecursosMSC = "1500";
                codAEO = "1001";
                ficha = "887";
              } else if (
                verificarCod(
                  tipo11,
                  ["01"],
                  ["12"],
                  ["365"],
                  ["5002"],
                  ["5"],
                  ["420"],
                  ["339039"],
                  ["101000"],
                )
              ) {
                poderOrgao = "10131";
                codFontRecursosMSC = "1500";
                codAEO = "1001";
                ficha = "892";
              } else if (
                verificarCod(
                  tipo11,
                  ["01"],
                  ["12"],
                  ["365"],
                  ["5002"],
                  ["5"],
                  ["420"],
                  ["339039"],
                  ["115049"],
                )
              ) {
                poderOrgao = "10131";
                codFontRecursosMSC = "1550";
                codAEO = "nan";
                ficha = "893";
              } else if (
                verificarCod(
                  tipo11,
                  ["01"],
                  ["12"],
                  ["365"],
                  ["5002"],
                  ["5"],
                  ["420"],
                  ["339039"],
                  ["215049"],
                )
              ) {
                poderOrgao = "10131";
                codFontRecursosMSC = "2550";
                codAEO = "nan";
                ficha = "1016";
              } else if (
                verificarCod(
                  tipo11,
                  ["01"],
                  ["12"],
                  ["365"],
                  ["5002"],
                  ["5"],
                  ["420"],
                  ["339040"],
                  ["101000"],
                )
              ) {
                poderOrgao = "10131";
                codFontRecursosMSC = "1500";
                codAEO = "1001";
                ficha = "894";
              } else if (
                verificarCod(
                  tipo11,
                  ["01"],
                  ["12"],
                  ["365"],
                  ["5002"],
                  ["5"],
                  ["420"],
                  ["339047"],
                  ["101000"],
                )
              ) {
                poderOrgao = "10131";
                codFontRecursosMSC = "1500";
                codAEO = "1001";
                ficha = "895";
              } else if (
                verificarCod(
                  tipo11,
                  ["01"],
                  ["12"],
                  ["365"],
                  ["5002"],
                  ["5"],
                  ["420"],
                  ["449052"],
                  ["101000"],
                )
              ) {
                poderOrgao = "10131";
                codFontRecursosMSC = "1500";
                codAEO = "1001";
                ficha = "900";
              } else if (
                verificarCod(
                  tipo11,
                  ["01"],
                  ["12"],
                  ["365"],
                  ["5002"],
                  ["5"],
                  ["420"],
                  ["449052"],
                  ["115049"],
                )
              ) {
                poderOrgao = "10131";
                codFontRecursosMSC = "1550";
                codAEO = "nan";
                ficha = "901";
              } else if (
                verificarCod(
                  tipo11,
                  ["01"],
                  ["12"],
                  ["365"],
                  ["5002"],
                  ["5"],
                  ["420"],
                  ["449052"],
                  ["224000"],
                )
              ) {
                poderOrgao = "10131";
                codFontRecursosMSC = "2571";
                codAEO = "nan";
                ficha = "1097";
              } else if (
                verificarCod(
                  tipo11,
                  ["01"],
                  ["12"],
                  ["846"],
                  ["5000"],
                  ["9"],
                  ["031"],
                  ["469071"],
                  ["101000"],
                )
              ) {
                poderOrgao = "10131";
                codFontRecursosMSC = "1500";
                codAEO = "1001";
                ficha = "915";
              } else if (
                verificarCod(
                  tipo11,
                  ["01"],
                  ["13"],
                  ["392"],
                  ["5006"],
                  ["5"],
                  ["008"],
                  ["335041"],
                  ["278092"],
                )
              ) {
                poderOrgao = "10131";
                codFontRecursosMSC = "2715";
                codAEO = "nan";
                ficha = "1058";
              } else if (
                verificarCod(
                  tipo11,
                  ["01"],
                  ["13"],
                  ["392"],
                  ["5006"],
                  ["5"],
                  ["008"],
                  ["335041"],
                  ["278093"],
                )
              ) {
                poderOrgao = "10131";
                codFontRecursosMSC = "2716";
                codAEO = "nan";
                ficha = "1059";
              } else if (
                verificarCod(
                  tipo11,
                  ["01"],
                  ["13"],
                  ["392"],
                  ["5006"],
                  ["5"],
                  ["008"],
                  ["335043"],
                  ["278092"],
                )
              ) {
                poderOrgao = "10131";
                codFontRecursosMSC = "2715";
                codAEO = "nan";
                ficha = "1060";
              } else if (
                verificarCod(
                  tipo11,
                  ["01"],
                  ["12"],
                  ["361"],
                  ["4100"],
                  ["4"],
                  ["165"],
                  ["319013"],
                  ["101000"],
                )
              ) {
                poderOrgao = "10131";
                codFontRecursosMSC = "1500";
                codAEO = "1001";
                ficha = "8025";
              } else if (
                verificarCod(
                  tipo11,
                  ["01"],
                  ["12"],
                  ["361"],
                  ["5002"],
                  ["3"],
                  ["218"],
                  ["339030"],
                  ["124085"],
                )
              ) {
                poderOrgao = "10131";
                codFontRecursosMSC = "1571";
                codAEO = "nan";
                ficha = "8026";
              } else if (
                verificarCod(
                  tipo11,
                  ["01"],
                  ["12"],
                  ["392"],
                  ["4129"],
                  ["4"],
                  ["122"],
                  ["339030"],
                  ["101000"],
                )
              ) {
                poderOrgao = "10131";
                codFontRecursosMSC = "1500";
                codAEO = "nan";
                ficha = "8025";
              } else if (
                verificarCod(
                  tipo11,
                  ["01"],
                  ["12"],
                  ["361"],
                  ["5002"],
                  ["5"],
                  ["419"],
                  ["339030"],
                  ["224000"],
                )
              ) {
                poderOrgao = "10131";
                codFontRecursosMSC = "2571";
                codAEO = "nan";
                ficha = "8026";
              } else if (
                verificarCod(
                  tipo11,
                  ["01"],
                  ["12"],
                  ["361"],
                  ["5002"],
                  ["3"],
                  ["218"],
                  ["339030"],
                  ["124085"],
                )
              ) {
                poderOrgao = "10131";
                codFontRecursosMSC = "1571";
                codAEO = "nan";
                ficha = "8026";
              } else if (
                verificarCod(
                  tipo11,
                  ["01"],
                  ["12"],
                  ["361"],
                  ["5002"],
                  ["5"],
                  ["419"],
                  ["339039"],
                  ["115049"],
                )
              ) {
                poderOrgao = "10131";
                codFontRecursosMSC = "1550";
                codAEO = "nan";
                ficha = "8025";
              } else if (
                verificarCod(
                  tipo11,
                  ["01"],
                  ["12"],
                  ["361"],
                  ["5002"],
                  ["3"],
                  ["218"],
                  ["339039"],
                  ["124085"],
                )
              ) {
                poderOrgao = "10131";
                codFontRecursosMSC = "1571";
                codAEO = "nan";
                ficha = "8026";
              } else if (
                verificarCod(
                  tipo11,
                  ["01"],
                  ["12"],
                  ["361"],
                  ["5002"],
                  ["5"],
                  ["419"],
                  ["339039"],
                  ["224000"],
                )
              ) {
                poderOrgao = "10131";
                codFontRecursosMSC = "2571";
                codAEO = "nan";
                ficha = "8026";
              } else if (
                verificarCod(
                  tipo11,
                  ["01"],
                  ["12"],
                  ["361"],
                  ["4100"],
                  ["4"],
                  ["165"],
                  ["339039"],
                  ["137000"],
                )
              ) {
                poderOrgao = "10131";
                codFontRecursosMSC = "1710";
                codAEO = "3210";
                ficha = "8026";
              } else if (
                verificarCod(
                  tipo11,
                  ["01"],
                  ["13"],
                  ["392"],
                  ["5006"],
                  ["5"],
                  ["008"],
                  ["449052"],
                  ["278092"],
                )
              ) {
                poderOrgao = "10131";
                codFontRecursosMSC = "2719";
                codAEO = "nan";
                ficha = "8026";
              } else if (
                verificarCod(
                  tipo11,
                  ["01"],
                  ["12"],
                  ["361"],
                  ["5002"],
                  ["5"],
                  ["419"],
                  ["449052"],
                  ["281000"],
                )
              ) {
                poderOrgao = "10131";
                codFontRecursosMSC = "2706";
                codAEO = "3110";
                ficha = "8026";
              } else if (
                verificarCod(
                  tipo11,
                  ["01"],
                  ["13"],
                  ["392"],
                  ["5006"],
                  ["5"],
                  ["008"],
                  ["449052"],
                  ["278092"],
                )
              ) {
                poderOrgao = "10131";
                codFontRecursosMSC = "2706";
                codAEO = "nan";
                ficha = "8026";
              } else if (
                verificarCod(
                  tipo11,
                  ["01"],
                  ["12"],
                  ["361"],
                  ["5002"],
                  ["5"],
                  ["419"],
                  ["449052"],
                  ["115049"],
                )
              ) {
                poderOrgao = "10131";
                codFontRecursosMSC = "1550";
                codAEO = "nan";
                ficha = "8026";
              } else if (
                verificarCod(
                  tipo11,
                  ["01"],
                  ["13"],
                  ["392"],
                  ["5006"],
                  ["5"],
                  ["008"],
                  ["449052"],
                  ["278092"],
                )
              ) {
                poderOrgao = "10131";
                codFontRecursosMSC = "2719";
                codAEO = "nan";
                ficha = "8026";
              }
            }
            // 21 - FUNDI - FUNDO MUNICIPAL DOS DIREITOS DO IDOSO
            if (tipo11.codOrgao === "21") {
              if (
                verificarCod(
                  tipo11,
                  ["08"],
                  ["08"],
                  ["241"],
                  ["4135"],
                  ["2"],
                  ["118"],
                  ["339039"],
                  ["110000"],
                )
              ) {
                poderOrgao = "10131";
                codFontRecursosMSC = "1759";
                codAEO = "nan";
                ficha = "927";
              } else if (
                verificarCod(
                  tipo11,
                  ["08"],
                  ["08"],
                  ["241"],
                  ["4135"],
                  ["2"],
                  ["118"],
                  ["339039"],
                  ["210000"],
                )
              ) {
                poderOrgao = "10131";
                codFontRecursosMSC = "2759";
                codAEO = "nan";
                ficha = "1147";
              } else if (
                verificarCod(
                  tipo11,
                  ["08"],
                  ["08"],
                  ["241"],
                  ["4135"],
                  ["2"],
                  ["118"],
                  ["339014"],
                  ["210000"],
                )
              ) {
                poderOrgao = "10131";
                codFontRecursosMSC = "2759";
                codAEO = "nan";
                ficha = "1227";
              }
            }
            // 22 - FUMPDEC - FUNDO MUNICIPAL DE PROTEÇÃO E DEFESA
            if (tipo11.codOrgao === "22") {
              if (
                verificarCod(
                  tipo11,
                  ["22"],
                  ["06"],
                  ["182"],
                  ["0300"],
                  ["3"],
                  ["325"],
                  ["339030"],
                  ["100536"],
                )
              ) {
                poderOrgao = "10131";
                codFontRecursosMSC = "1500";
                codAEO = "nan";
                ficha = "930";
              } else if (
                verificarCod(
                  tipo11,
                  ["22"],
                  ["06"],
                  ["182"],
                  ["0300"],
                  ["3"],
                  ["325"],
                  ["449052"],
                  ["100536"],
                )
              ) {
                poderOrgao = "10131";
                codFontRecursosMSC = "1500";
                codAEO = "nan";
                ficha = "932";
              } else if (
                verificarCod(
                  tipo11,
                  ["22"],
                  ["06"],
                  ["182"],
                  ["4100"],
                  ["2"],
                  ["119"],
                  ["319004"],
                  ["100000"],
                )
              ) {
                poderOrgao = "10131";
                codFontRecursosMSC = "1500";
                codAEO = "nan";
                ficha = "1232";
              } else if (
                verificarCod(
                  tipo11,
                  ["22"],
                  ["06"],
                  ["182"],
                  ["4100"],
                  ["2"],
                  ["119"],
                  ["319011"],
                  ["100000"],
                )
              ) {
                poderOrgao = "10131";
                codFontRecursosMSC = "1500";
                codAEO = "nan";
                ficha = "933";
              } else if (
                verificarCod(
                  tipo11,
                  ["22"],
                  ["06"],
                  ["182"],
                  ["4100"],
                  ["2"],
                  ["119"],
                  ["319013"],
                  ["100000"],
                )
              ) {
                poderOrgao = "10131";
                codFontRecursosMSC = "1500";
                codAEO = "nan";
                ficha = "934";
              } else if (
                verificarCod(
                  tipo11,
                  ["22"],
                  ["06"],
                  ["182"],
                  ["4100"],
                  ["2"],
                  ["119"],
                  ["319094"],
                  ["100000"],
                )
              ) {
                poderOrgao = "10131";
                codFontRecursosMSC = "1500";
                codAEO = "nan";
                ficha = "935";
              } else if (
                verificarCod(
                  tipo11,
                  ["22"],
                  ["06"],
                  ["182"],
                  ["4100"],
                  ["2"],
                  ["119"],
                  ["319113"],
                  ["100000"],
                )
              ) {
                poderOrgao = "10131";
                codFontRecursosMSC = "1500";
                codAEO = "nan";
                ficha = "936";
              } else if (
                verificarCod(
                  tipo11,
                  ["22"],
                  ["06"],
                  ["182"],
                  ["4100"],
                  ["2"],
                  ["119"],
                  ["339014"],
                  ["100000"],
                )
              ) {
                poderOrgao = "10131";
                codFontRecursosMSC = "1500";
                codAEO = "nan";
                ficha = "938";
              } else if (
                verificarCod(
                  tipo11,
                  ["22"],
                  ["06"],
                  ["182"],
                  ["4100"],
                  ["2"],
                  ["119"],
                  ["339030"],
                  ["100000"],
                )
              ) {
                poderOrgao = "10131";
                codFontRecursosMSC = "1500";
                codAEO = "nan";
                ficha = "939";
              } else if (
                verificarCod(
                  tipo11,
                  ["22"],
                  ["06"],
                  ["182"],
                  ["4100"],
                  ["2"],
                  ["119"],
                  ["339036"],
                  ["100000"],
                )
              ) {
                poderOrgao = "10131";
                codFontRecursosMSC = "1500";
                codAEO = "nan";
                ficha = "940";
              } else if (
                verificarCod(
                  tipo11,
                  ["22"],
                  ["06"],
                  ["182"],
                  ["4100"],
                  ["2"],
                  ["119"],
                  ["339039"],
                  ["100000"],
                )
              ) {
                poderOrgao = "10131";
                codFontRecursosMSC = "1500";
                codAEO = "nan";
                ficha = "941";
              } else if (
                verificarCod(
                  tipo11,
                  ["22"],
                  ["06"],
                  ["182"],
                  ["4100"],
                  ["2"],
                  ["119"],
                  ["339049"],
                  ["100000"],
                )
              ) {
                poderOrgao = "10131";
                codFontRecursosMSC = "1500";
                codAEO = "nan";
                ficha = "943";
              } else if (
                verificarCod(
                  tipo11,
                  ["22"],
                  ["06"],
                  ["182"],
                  ["4100"],
                  ["2"],
                  ["119"],
                  ["339197"],
                  ["100000"],
                )
              ) {
                poderOrgao = "10131";
                codFontRecursosMSC = "1500";
                codAEO = "nan";
                ficha = "944";
              }
            }
            emp[empIndex].content.content[tipo11Index].poderOrgao = poderOrgao;
            emp[empIndex].content.content[tipo11Index].codFontRecursosMSC =
              codFontRecursosMSC;
            emp[empIndex].content.content[tipo11Index].codAEO = codAEO;
            emp[empIndex].content.content[tipo11Index].ficha = ficha;
            if (codFontRecursosMSC === "nan") {
            }
          }
        });
      }
    });

    const lnc = (await db(`${sch}.lnc`).select("*")).filter(
      (e) => e.data === data && e.content.codOrgao === codOrgao,
    );

    const empElementoLNC = {
      // elemento e sub TCM, contadeb, contacred, elemento e sub STN
      // CONTRATAÇÃO POR TEMPO DETERMINADO
      31900400: [
        "311210401-211110101-31900401",
        "311210414-211110101-31900414",
      ],
      // PESSOAL(RECURSOS: MÍNIMO DE 60% FUNDEB)
      31901101: [
        "311110101-211110101-31901101",
        "311110101-211110101-31901137",
        "311110101-211110101-31901150",
        "311110103-211110101-31901105",
        "311110103-211110101-31901145",
        "311110104-211110101-31901107",
        "311110108-211110101-31901101",
        "311110108-211110101-31901113",
        "311110114-211110101-31901131",
        "311110114-211110101-31901133",
        "311110114-211110103-31901145",
        "311110116-211110101-31901133",
        "311110118-211110101-31901131",
        "311110118-211110101-31901137",
        "311110122-211110102-31901143",
        "311110124-211110103-31901145",
        "311110133-211110101-31901150",
        "311110199-211110101-31901199",
        "311110199-211110101-31901151",
        "311110199-211110103-31901151",
      ],
      // PESSOAL CARGO EFETIVO (VINCULADO AO RPPS), EXCLUSIVE FUNDEB
      31901103: [
        "311110101-211110101-31901101",
        "311110102-211110101-31901101",
        "311110102-211110101-31901104",
        "311110104-211110101-31901107",
        "311110105-211110101-31901109",
        "311110106-211110101-31901101",
        "311110106-211110101-31901110",
        "311110108-211110101-31901101",
        "311110108-211110101-31901113",
        "311110112-211110101-31901101",
        "311110112-211110101-31901104",
        "311110114-211110101-31901131",
        "311110114-211110101-31901133",
        "311110116-211110101-31901101",
        "311110116-211110101-31901133",
        "311110118-211110101-31901101",
        "311110118-211110101-31901131",
        "311110118-211110101-31901137",
        "311110121-211110102-31901142",
        "311210121-211110103-31901142",
        "311110121-211110103-31901101",
        "311110122-211110101-31901101",
        "311110122-211110101-31901143",
        "311210122-211110102-31901143",
        "311110124-211110101-31901145",
        "311110124-211110103-31901145",
        "311110131-211110101-31901174",
        "311210131-211110101-31901175",
        "311110132-211110101-31901101",
        "311110132-211110101-31901133",
        "311110199-211110101-31901151",
        "311110199-211110101-31901152",
      ],
      // PESSOAL CARGO COMISSIONADO, EXCLUSIVE FUNDEB
      31901105: [
        "311110101-211110101-31901101",
        "311210101-211110101-31901101",
        "311210121-211110103-31901101",
        "311210121-211110103-31901142",
        "311210124-211110103-31901145",
        "311110133-211110101-31901150",
        "311210133-211110101-31901150",
      ],
      31901107: [
        "311110131-211110101-31901175",
        "311210131-211110101-31901175",
      ],
      // SUBSÍDIO VICE-PREFEITO
      31901108: ["311210131-211110101-31901175"],
      // SUBSÍDIO SECRETÁRIO MUNICIPAL
      31901109: [
        "311110101-211110101-31901175",
        "311210101-211110101-31901101",
        "311110114-211110101-31901133",
        "311110122-211110102-31901143",
        "311110124-211110103-31901145",
        "311210124-211110103-31901145",
        "311210131-211110101-31901175",
      ],
      // SALÁRIO MATERNIDADE
      31901150: ["329111100-211110101-31901150"],
      // LICENÇA SAÚDE
      31901152: [
        "311110199-211110101-31901152",
        "311210199-211110101-31901152",
      ],
      // OUTRAS DESPESAS FIXAS - PESSOAL CIVIL
      31901199: [
        "311110109-211110101-31901177",
        "311110124-211110103-31901145",
        "311110133-211110101-31901150",
        "311210131-211110101-31901175",
        "311110199-211110101-31901177",
        "311110199-211110101-31901199",
        "311210199-211110101-31901199",
      ],
      // CONTRIBUIÇÃO PATRONAL PARA O INSS
      31901302: ["312230100-211430101-31901302"],
      // CONTRATO POR TEMPO DETERMINADO
      31901307: ["311210299-211110101-31901307"],
      // ENCARGOS DE PESSOAL REQUISIT. DE OUTROS ENTES
      31901399: ["312230400-211459800-31901340"],
      // OUTRAS DESPESAS VARIÁVEIS – PESSOAL CIVIL
      31901600: ["311210299-211110101-31901699"],
      // INDENIZAÇÕES E RESTITUIÇÕES TRABALHISTAS
      31909401: ["319110000-218910101-31909401"],
      // OBRIGAÇÕES PATRONAIS INTRA-ORÇAMENTÁRIA
      31911302: [
        "312129900-218959800-31911302",
        "312129900-218959800-31911308",
      ],
      // CONTRIBUICAO DE SALARIO-EDUCACAO
      31911304: [
        "312129900-218959800-31911302",
        "312129900-218959800-31911308",
      ],
      // OUTRAS OBRIGACOES PATRONAIS
      31911399: [
        "312129900-218959800-31911308",
        "312129900-218959800-31911399",
      ],
      // ENCARGOS DE PESSOAL REQUISIT. DE OUTROS ENTES
      31901399: ["312230400-211459800-31901340"],
      // OUTROS BENEFÍCIOS ASSISTENCIAIS DO SERVIDOR OU DO MILITAR
      33900856: ["329111201-213110101-33900856"],
      // DIÁRIAS - CIVIL
      33901400: ["332110100-218910200-33901400"],
      // AUXÍLIO FINANCEIRO A ESTUDANTE
      33901800: ["394110100-211310100-33901800"],
      // AUXÍLIO-FARDAMENTO
      33901900: ["394910000-211310100-33901900"],
      // COMBUSTÍVEIS E LUBRIFICANTES AUTOMOTIVOS
      33903001: [
        "115610100-331110100-33903001",
        "115619900-331110100-33903001",
      ],
      // COMBUSTÍVEIS E LUBRIFICANTES PARA OUTRAS FINALIDADES / MAS é MATERIAL HOSPITALAR
      33903003: ["115610500-331113600-33903036"],
      // GÁS ENGARRAFADO
      33903004: [
        "115619900-331110300-33903011", // MATERIAL QUIMICO STN
        "115610100-331110300-33903099", // OUTROS - ALMOXARIFADO
      ],
      // GÊNEROS DE ALIMENTAÇÃO
      33903007: [
        "115610100-331110600-33903007",
        "115610200-331110600-33903007",
      ],
      // MATERIAL FARMACOLÓGICO / MEDICAMENTOS PARA USO EM UNIDADE DE SAÚDE
      33903009: ["115610500-331110800-33903009"],
      // MATERIAL ODONTOLÓGICO
      33903010: ["115610500-331110900-33903010"],
      // MATERIAL QUÍMICO
      33903011: ["115619900-331111000-33903011"],
      // MATERIAL EDUCATIVO E ESPORTIVO
      33903014: [
        "115610100-331111400-33903014",
        "115619900-331111400-33903014",
      ],
      // MATERIAL PARA FESTIVIDADES E HOMENAGENS
      33903015: ["115619900-331111500-33903099"],
      // MATERIAL DE EXPEDIENTE
      33903016: [
        "115610100-331111600-33903016",
        "115610700-331111600-33903016",
        "115610700-331111600-33903099",
      ],
      // MATERIAL DE PROCESSAMENTO DE DADOS
      33903017: ["115610100-331111700-33903017"],
      // MATERIAL DE ACONDICIONAMENTO E EMBALAGEM
      33903019: ["115610100-331111900-33903099"],
      // MATERIAL DE CAMA, MESA E BANHO
      33903020: [
        "115610100-331111200-33903020",
        "115610100-331111200-33903099",
      ],
      // MATERIAL DE COPA E COZINHA
      33903021: [
        "115610100-331112100-33903099",
        "115610700-331112100-33903020",
        "115619900-331112100-33903020",
        "115619900-331112100-33903099",
      ],
      // MATERIAL DE LIMPEZA E PRODUÇÃO DE HIGIENIZAÇÃO
      33903022: [
        "115610100-331112200-33903021",
        "115610600-331112200-33903021",
        "115610700-331112200-33903021",
        "115619900-331112200-33903021",
      ],
      // UNIFORMES, TECIDOS E AVIAMENTOS
      33903023: [
        "115610100-331112300-33903099",
        "115610700-331112300-33903023",
        "115619900-331112300-33903099",
      ],
      // MATERIAL PARA MANUTENÇÃO DE BENS IMÓVEIS
      33903024: [
        "115610100-331112400-33903099",
        "115610100-331112400-33903099",
        "115610101-331112400-33903099",
        "115610300-331112400-33903099",
      ],
      // MATERIAL PARA MANUTENÇÃO DE BENS MÓVEIS
      33903025: [
        "115610100-331112500-33903099",
        "115619900-331112500-33903099",
      ],
      // MATERIAL ELÉTRICO E ELETRÔNICO
      33903026: [
        "115610100-331112600-33903099",
        "115610300-331112600-33903099",
        "115610700-331112600-33903099",
        "115619900-331112600-33903099",
      ],
      // MATERIAL DE PROTEÇÃO E SEGURANÇA
      33903028: [
        "115610100-331112800-33903028",
        "115619900-331112800-33903028",
        "115619900-331112800-33903099",
      ],
      // MATERIAL PARA ÁUDIO, VÍDEO E FOTO
      33903029: [
        "115610100-331112900-33903099",
        "115610700-331112900-33903016",
      ],
      // SEMENTES, MUDAS DE PLANTAS E INSUMOS
      33903031: [
        "115610100-331113100-33903007",
        "115610100-331113100-33903099",
      ],
      // OUTROS MATERIAIS DE DISTRIBUICAO GRATUITA
      33903300: ["332315600-213110101-33903300"],
      // MATERIAL HOSPITALAR
      33903036: ["115610500-331113600-33903036"],
      // MATERIAL PARA MANUTENÇÃO DE VEÍCULOS
      33903039: [
        "115610400-331113900-33903039",
        "115619900-331113900-33903039",
      ],
      // FERRAMENTAS
      33903042: ["115619900-331114200-33903039"],
      // MATERIAL DE SINALIZAÇÃO VISUAL E AFINS
      33903044: ["115610100-331114400-33903099"],
      // BANDEIRAS, FLÂMULAS E INSÍGNIAS
      33903050: ["115610300-331115000-33903099"],
      // OUTROS MATERIAIS DE CONSUMO
      33903099: ["115610100-331119900-33903099"],
      // Premiações Culturais, Artísticas, Científicas, Desportivas e
      33903100: ["391110000-213110101-33903100"],
      // Passagens e Despesas com Locomoção
      33903300: ["332315600-213110101-33903300"],
      // Outras Despesas de Pessoal decorrentes de Contratos de TerceL
      33903401: ["332410000-213110101-33903400"],
      // ASSESSORIA CONTÁBIL
      33903402: ["332410000-213110101-33903400"],
      // OUTROS SERVIÇOS DE TERCEIROS – PESSOA FÍSICA
      33903615: ["332212100-213110101-33903699"],
      // JETONS E GRATIFICACOES A CONSELHEIROS
      33903645: ["332213100-213110101-33903645"],
      // OUTROS SERVICOS
      33903699: ["332219900-213110101-33903699"],
      // ASSINATURAS DE PERIÓDICOS E ANUIDADES
      33903901: ["332311400-213110101-33903999"],
      // SERVIÇOS TÉCNICOS PROFISSIONAIS
      33903905: ["332315100-213110101-33903999"],
      // LOCAÇÃO DE IMÓVEIS
      33903910: ["332311000-213110101-33903999"],
      // LOCAÇÃO DE MÁQUINAS E EQUIPAMENTOS
      33903912: ["332311000-213110101-33903999"],
      // LOCAÇÃO DE BENS MÓVEIS E OUTRAS NATUREZAS E INTANGÍVEIS
      33903914: ["332311000-213110101-33903999"],
      // MANUTENÇÃO E CONSERVAÇÃO DE BENS IMÓVEIS
      33903916: ["332310600-213110101-33903999"],
      // MANUTENÇÃO E CONSERVAÇÃO DE MÁQUINAS E EQUIPAMENTOS
      33903917: ["332310600-213110101-33903917"],
      // MANUTENÇÃO E CONSERVAÇÃO DE VEÍCULOS
      33903919: [
        "332310600-213110101-33903917",
        "332310600-213110101-33903999",
      ],
      // MANUTENÇÃO E CONSERVAÇÃO DE BENS MÓVEIS DE OUTRAS NATUREZAS
      33903920: ["332310600-213110101-33903999"],
      // MANUTENCAO E CONSERV. DE ESTRADAS E VIAS
      33903921: ["332310600-213110101-33903999"],
      // EXPOSIÇÕES, CONGRESSOS E CONFERÊNCIAS - TCM
      33903922: ["332312200-213110101-33903999"],
      // FESTIVIDADES E HOMENAGENS - TCM
      33903923: ["332312300-213110101-33903999"],
      // FORNECIMENTO DE ALIMENTAÇÃO -TCM
      33903941: ["332310900-213110101-33903999"],
      // SERVIÇOS DE ENERGIA ELÉTRICA
      33903943: ["332310800-213110101-33903943"],
      // SERVIÇOS DE ÁGUA E ESGOTO
      33903944: ["332310800-213110101-33903944"],
      // SERVIÇOS DE COMUNICAÇÃO EM GERAL
      33903947: ["332310400-213110101-33903947"],
      // SERVIÇO DE SELEÇÃO E TREINAMENTO
      33903948: ["332310300-213110101-33903999"],
      // SERVIÇO MÉDICO-HOSPITALAR, ODONTOLÓGICO E LABORATORIAL
      33903950: ["332313100-213110101-33903950"],
      // SERVIÇOS DE ANÁLISES E PESQUISAS CIENTÍFICAS
      33903951: ["332313300-213110101-33903999"],
      // SERVIÇOS DE ASSISTÊNCIA SOCIAL
      33903953: ["332313500-2131110101-33903953"],
      // SERVIÇOS DE TELECOMUNICAÇÕES, NÃO INTEGRANTES DE PACOTES DE
      33903958: ["332319900-213110101-33903999"],
      // SERVIÇOS DE SOCORRO E SALVAMENTO
      33903961: ["332319900-213110101-33903999"],
      // SERVIÇOS GRÁFICOS - TCM
      33903963: ["332314600-213110101-33903999"],
      // SERVIÇOS DE APOIO AO ENSINO
      33903965: ["332313400-213110101-33903965"],
      // SERVIÇOS JUDICIÁRIOS
      33903966: ["332314700-213110101-33903999"],
      // SEGUROS EM GERAL
      33903969: ["332312900-213110101-33903999"],
      // CONFECÇÃO DE UNIFORMES, BANDEIRAS E FLÂMULAS
      33903970: ["332312000-213110101-33903999"],
      // CONFECÇÃO DE MATERIAL DE ACONDICIONAMENTO E EMBALAGEM
      33903971: ["332311900-213110102-33903999"],
      // FRETES E TRANSPORTES DE ENCOMENDAS
      33903974: ["332311200-213110101-33903999"],
      // VIGILÂNCIA OSTENSIVA
      33903977: ["332315400-2131110101-33903977"],
      // LIMPEZA E CONSERVAÇÃO
      33903978: ["332315400-213110101-33903978"],
      // SERVIÇO DE APOIO ADMINISTRATIVO, TÉCNICO E OPERACIONAL
      33903979: ["332310700-213110101-33903999"],
      // SERVIÇOS BANCÁRIOS
      33903981: ["332313200-213110101-33903999"],
      // SERVIÇOS DE PUBLICIDADE E PROPAGANDA
      33903988: ["332310500-213110101-33903990"],
      // OUTROS SERVIÇOS DE TERCEIROS PJ- PAGTO ANTECIPADO
      33903996: ["332319900-213110101-33903999"],
      // OUTROS SERVIÇOS DE TERCEIROS, PESSOA JURÍDICA
      33903999: ["332319900-213110101-33903999"],
      // AUXÍLIO-ALIMENTAÇÃO
      33904600: ["332212200-213110301-33904600"],
      // LOCAÇÃO DE EQUIPAMENTOS DE TIC
      33904001: ["332311100-213110101-33904099"],
      // MANUTENÇÃO E CONSERVAÇÃO DE EQUIPAMENTOS DE TIC
      33904002: ["332311100-213110101-33904012"],
      // AQUISIÇÃO DE SOFTWARE
      33904003: ["332311100-213110101-33904099"],
      // LOCAÇÃO DE SOFTWARE
      33904004: ["332311100-213110101-33904006"],
      // SERVIÇOS DE COMUNICAÇÃO DE DADOS
      33904007: ["332311100-213110101-33904099"],
      // SERVIÇOS DE TELEFONIA INTEGRANTES DE PACOTES DE COMUNICAÇÃO
      33904008: ["332311100-213110101-33904014"],
      // SUPORTE A USUÁRIOS DE TIC
      33904009: ["332311100-213110101-33904099"],
      // SERVIÇOS TÉCNICOS PROFISSIONAIS DE TIC
      33904011: ["332311100-213110101-33904099"],
      // SERVIÇOS RELACIONADOS A COMPUTAÇÃO EM NUVEM
      33904014: ["332311100-213110101-33904099"],
      // OUTROS SERVIÇOS DE TIC
      33904018: ["332311100-213110101-33904099"],
      // CONTRIBUIÇÕES
      33904100: ["372919900-213110101-33904100"],
      // SUBVENÇÕES ECONÔMICAS
      33904500: ["395119900-218911200-33904500"],
      // AUXÍLIO-ALIMENTAÇÃO
      33904600: ["332212200-213110301-33904600"],
      // OBRIGAÇÕES TRIBUTÁRIAS E CONTRIBUTIVAS
      33904700: ["372919900-213110301-33904700"],
      // AUXÍLIO-TRANSPORTE
      33904900: ["332311200-213110301-33904900"],
      // OBRIGAÇÕES TRIBUTÁRIAS E CONTRIBUTIVAS
      33904700: ["372919900-213110301-33904700"],
      // SENTENÇAS JUDICIAIS DE PEQUENO VALOR
      33909100: ["213110900-213110900-33909105"],
      // INDENIZAÇÕES E RESTITUIÇÕES
      33909300: ["399610000-218910102-33909399"],
      // RESSARCIMENTO DE DESPESAS DE PESSOAL REQUISITADO
      33909600: ["311110213-211110101-33909600"],
      // APORTE PARA COBERTURA DO DÉFICIT ATUARIAL DO RPPS
      33919700: ["351320202-211429900-33919700"],
      // OBRAS EM ANDAMENTO
      44905100: ["123210700-213110101-44905191"],
      // OUTRAS OBRAS E INSTALACOES
      44905100: ["123210601-213110101-44905199"],
      // APARELHOS E EQUIPAMENTOS DE COMUNICAÇÃO
      44905206: ["123110102-213110101-44905299"],
      // APARELHOS E EQUIPAMENTOS PARA ESPORTES E DIVERSÕES
      44905210: ["123110104-213110101-44905299"],
      // APARELHOS E UTENSÍLIOS DOMÉSTICOS
      44905212: ["123110301-213110101-44905242"],
      // EQUIPAMENTO DE PROTEÇÃO, SEGURANÇA E SOCORRO
      44905224: ["123110105-213110101-44905299"],
      // INSTRUMENTOS MUSICAIS E ARTÍSTICOS
      44905226: ["123110404-213110101-44905299"],
      // EQUIPAMENTOS PARA ÁUDIO, VÍDEO E FOTO
      44905233: ["123110405-213110101-44905299"],
      // MÁQUINAS, UTENSÍLIOS E EQUIPAMENTOS DIVERSOS
      44905234: ["123110199-213110101-44905299"],
      // EQUIPAMENTOS DE PROCESSAMENTO DE DADOS
      44905235: ["123110201-213110101-44905299"],
      // MÁQUINAS, INSTALAÇÕES E UTENSÍLIOS DE ESCRITÓRIO
      44905236: ["123110302-213110101-44905299"],
      // MÁQUINAS, FERRAMENTAS E UTENSÍLIOS DE OFICINA
      44905238: ["123110109-213110101-44905299"],
      // EQUIPAMENTOS E UTENSÍLIOS HIDRÁULICOS E ELÉTRICOS
      44905239: ["123110121-213110101-44905299"],
      // MÁQUINAS E EQUIPAMENTOS AGRÍCOLAS E RODOVIÁRIOS
      44905240: ["123110120-213110101-44905299"],
      // MOBILIÁRIO EM GERAL
      44905242: ["123110303-213110101-44905242"],
      // OUTROS MATERIAIS PERMANENTES
      44905299: ["123119999-213110101-44905299"],
      // INDENIZAÇÕES E RESTITUIÇÕES
      44909300: ["399610000-218910102-44909300"],
      // AUXÍLIOS
      45704200: ["354110000-218911300-45704200"],
      // Principal da Dívida por Contrato - Interna
      46907101: ["222110298-212110201-46907199"],
    };

    const checkedTipo11 = {};

    emp.forEach((empValue, empIndex) => {
      const tipo10 = empValue.content;
      tipo10.content.forEach((tipo11, tipo11Index) => {
        if (tipo11.tipoRegistro === "11") {
          const element = tipo11.elementoDespesa + tipo11.subElemento;

          const tipoUsando = empElementoLNC[element];
          if (!tipoUsando) return;
          const tipoUsando_array = tipoUsando;
          const tipoUsando_possivel = tipoUsando_array.map(
            (e) => e.split("-")[0],
          );

          const lncFiltered = natureza
            .filtrarPerm(
              natureza.filtrarSubPerm(
                lnc,
                "11",
                "codConta",
                tipoUsando_possivel,
              ),
              "natLancamento",
              ["D"],
            )
            .filter((e) => {
              return (
                e.content.valor.replace(/0*/, "") ===
                tipo11.vlRecurso.replace(/0*/, "")
              );
            });

          if (lncFiltered.length !== 0) {
            const lncChosen = lncFiltered[0];
            const tipoChosen = tipoUsando_array
              .filter(
                (e) =>
                  lncChosen.content.codConta.substring(0, 9) ===
                  e.substring(0, 9),
              )[0]
              .split("-");

            const newValues = {
              contaDeb: tipoChosen[0],
              contaCred: tipoChosen[1],
              elementoDespesaMSC: tipoChosen[2].substring(0, 6),
              subElementoMSC: tipoChosen[2].substring(6),
            };

            checkedTipo11[element] = newValues;

            emp[empIndex].content.content[tipo11Index] = {
              ...emp[empIndex].content.content[tipo11Index],
              ...newValues,
            };
          }
        }
      });
    });
    emp.forEach((empValue, empIndex) => {
      const tipo10 = empValue.content;
      tipo10.content.forEach((tipo11, tipo11Index) => {
        if (tipo11.tipoRegistro === "11") {
          if (
            ![
              tipo11.contaDeb,
              tipo11.contaCred,
              tipo11.elementoDespesaMSC,
              tipo11.subElementoMSC,
            ].includes("nan")
          )
            return;
          const lnc11 = natureza
            .filtrarSubPerm(lnc, "11", "tipoArquivoSicom", ["06"])
            .filter((e) => {
              return (
                e.content.chaveArquivo.substring(114, 122) ===
                  tipo11.elementoDespesa + tipo11.subElemento &&
                e.content.chaveArquivo.substring(122, 128) ===
                  tipo11.nroEmpenho &&
                e.content.natLancamento === "D" &&
                tipo10.dtEmpenho === e.content.chaveArquivo.substring(128, 136)
              );
            });

          if (lnc11.length === 0) return;

          const lncChosen = lnc11[lnc11.length - 1];

          const element = tipo11.elementoDespesa + tipo11.subElemento;

          const tipoUsando = empElementoLNC[element];
          if (!tipoUsando) return;

          const tipoChosen = tipoUsando
            .filter(
              (e) =>
                lncChosen.content.codConta.substring(0, 9) ===
                e.substring(0, 9),
            )[0]
            ?.split("-");

          if (!tipoChosen) return;

          const newValues = {
            contaDeb: tipoChosen[0],
            contaCred: tipoChosen[1],
            elementoDespesaMSC: tipoChosen[2].substring(0, 6),
            subElementoMSC: tipoChosen[2].substring(6),
          };

          checkedTipo11[element] = newValues;

          emp[empIndex].content.content[tipo11Index] = {
            ...emp[empIndex].content.content[tipo11Index],
            ...newValues,
          };

          // console.log(newValues);

          // console.log(lnc11.length);
          // console.log(lnc11[0]?.content.chaveArquivo.substring(114, 122));
          // console.log(tipo11.elementoDespesa + tipo11.subElemento);
          // console.log(lnc11[0]?.content.chaveArquivo.substring(122, 128));
          // console.log(tipo11.nroEmpenho);
          // console.log(lnc11[0]?.content.chaveArquivo.substring(128, 136));
          // console.log(tipo10.dtEmpenho);
          // console.log("--------------------------");
        }
      });
    });

    emp.forEach((empValue, empIndex) => {
      const tipo10 = empValue.content;
      tipo10.content.forEach((tipo11, tipo11Index) => {
        if (tipo11.tipoRegistro !== "11") return;
        const element =
          "FR MSC" +
          " " +
          tipo11.codFontRecursosMSC +
          " " +
          tipo11.elementoDespesa +
          "-" +
          tipo11.subElemento +
          "  " +
          tipo11.codAEO +
          " " +
          tipo11.nroEmpenho;
        //const element = tipo11.elementoDespesa + "-" + tipo11.subElemento;
        // console.log(element);
        if (checkedTipo11[element] == false) return;
        emp[empIndex].content.content[tipo11Index] = {
          ...emp[empIndex].content.content[tipo11Index],
          ...checkedTipo11[element],
        };
        // console.log(checkedTipo11[element]);
        // console.log(emp[empIndex].content.content[tipo11Index]);
      });
    });
    // console.log(checkedTipo11);

    await db.batchInsert(`${req.body.sch}.emp`, emp, 75);

    return res.status(200).json({ message: "EMP inserido com sucesso!" });
  } catch (error) {
    console.error(
      "error from InserirEmp function from /controllers/controller.emp.js",
      error,
    );
    return res.status(500).json({ message: "Internal server error." });
  }
}
async function deleteEmp(req, res) {
  const { id } = req.params;
  try {
    await db("emp").delete().where({ id: id });
    return res.status(200).json({ message: "Registro removido com sucesso!" });
  } catch (error) {
    console.error(
      "error from Inserir deleteEmp from /controllers/controller.emp.js",
      error,
    );
    return res.status(500).json({ message: "Internal server error." });
  }
}

async function getEmpById(req, res) {
  const { id } = req.params;
  try {
    const emp = await db("emp").where({ id: id }).first();
    if (!emp) {
      return res.status(404).json({ message: "Registro não encontrado." });
    }
    return res.status(200).json(emp);
  } catch (error) {
    console.error(
      "error from getEmpById function from /controllers/controller.emp.js",
      error,
    );
    return res.status(500).json({ message: "Internal server error." });
  }
}

async function updateEmp(req, res) {
  const { id } = req.params;

  const empData = req.body;
  const body = empData.body;
  const index = empData.index;
  const tipoReg = body[0].value;
  try {
    let insert = {};
    for (const item of body) {
      Object.assign(insert, { [item.type]: item.value });
    }
    Object.assign(insert, { tipoRegistro: tipoReg });
    const toUpdate = await db("emp").select().where({ id: id });

    if (toUpdate.length == 0) {
      return res.status(404).json({ message: "Emp não encontrado." });
    }

    if (insert.tipoRegistro == 10) {
      insert.content = await toUpdate[0].content.content;

      await db("emp").where({ id }).update({ content: insert }).returning("*");
    } else {
      toUpdate[0].content.content[index] = insert;
      await db("emp").where({ id }).update({ content: toUpdate[0].content });
    }
    return res.status(200).json({ message: "got here!" });
  } catch (error) {
    console.error(
      "error from updateEmp function from /controllers/controller.emp.js",
      error,
    );
    return res.status(500).json({ message: "Internal server error." });
  }
}

async function InserirEmpManual(req, res) {
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
    await db("emp").insert(insert);
    return res.status(200).json({ message: "Registro inserido com sucesso!" });
  } catch (error) {
    console.error(
      "error from InserirEmpManual function from /controllers/controller.emp.js",
      error,
    );
    return res.status(500).json({ message: "Internal server error." });
  }
}

export default {
  Inserir,
  InserirEmp,
  deleteEmp,
  getEmpById,
  updateEmp,
  InserirEmpManual,
};

function verificarCod(
  tipo11,
  codUnidade,
  codFuncao,
  codSubFuncao,
  codPrograma,
  naturezaAcao,
  nroProjAtiv,
  elementoDespesa,
  codFontRecursos,
) {
  return (
    codUnidade.includes(tipo11.codUnidade) &&
    codFuncao.includes(tipo11.codFuncao) &&
    codSubFuncao.includes(tipo11.codSubFuncao) &&
    codPrograma.includes(tipo11.codPrograma) &&
    naturezaAcao.includes(tipo11.naturezaAcao) &&
    nroProjAtiv.includes(tipo11.nroProjAtiv) &&
    elementoDespesa.includes(tipo11.elementoDespesa) &&
    codFontRecursos.includes(tipo11.codFontRecursos)
  );
}
