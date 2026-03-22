import { db } from "../../database/postgres.js";
async function getAllEmp(req, res) {
  // Paginacao
  let { page, pageSize } = req.params;
  page = parseInt(page, 10);
  pageSize = parseInt(pageSize, 10);
  if (isNaN(page) || page < 0) page = 0;
  if (isNaN(pageSize) || pageSize <= 0) pageSize = 10;
  const { mes, ano, org } = req.query;

  try {
    let query = db("emp");

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

    res.status(200).json({ response, totalPages: total, currentPage: page });
  } catch (error) {
    console.error(
      "error from getAllEmp function from /controllers/controller.emp.js",
      error
    );
    return res.status(500).json({ message: "Internal server error." });
  }
}

async function Inserir(req, res) {
  try {
    const emp = req.body;

    await db("emp").insert(emp);

    res.status(200).json({ message: "ok" });
  } catch (error) {
    console.error(
      "error from Inserir function from /controllers/controller.emp.js",
      error
    );
    return res.status(500).json({ message: "Internal server error." });
  }
}

async function InserirEmp(req, res) {
  const { text, data } = req.body;
  const emp = [];

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
              codOrgao: line.slice(6, 8).trim(),
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
              codOrgao: line.slice(6, 8).trim(),
              codUnidade: line.slice(8, 10).trim(),
              codFuncao: line.slice(10, 12).trim(),
              codSubFuncao: line.slice(12, 15).trim(),
              naturezaAcao: line.slice(15, 16).trim(),
              nroProjAtiv: line.slice(16, 19).trim(),
              elementoDespesa: line.slice(19, 25).trim(),
              subElemento: line.slice(25, 27).trim(),
              nroEmpenho: line.slice(27, 33).trim(),
              codFontRecursos: line.slice(33, 39).trim(),
              codSTN: "nan",
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
              codOrgao: line.slice(6, 8).trim(),
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
              codOrgao: line.slice(6, 8).trim(),
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
              codOrgao: line.slice(6, 8).trim(),
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

    emp.forEach((opsValue, opsIndex) => {
      const tipo10 = opsValue.content;
      if (tipo10.tipoRegistro != "99") {
        tipo10.content.forEach((tipo11, tipo11Index) => {
          if (tipo11.tipoRegistro === "11") {
            let codSTN = "nan";
            if (
              verificarCod(
                tipo11,
                [
                  "100000",
                  "100089",
                  "100536",
                  "101000",
                  "102000",
                  "102537",
                  "111000",
                  "137000",
                ],
                [
                  "319004",
                  "319011",
                  "339008",
                  "319013",
                  "319016",
                  "319094",
                  "319113",
                  "319114",
                  "329021",
                  "339008",
                  "339014",
                  "339019",
                  "339030",
                  "339031",
                  "339032",
                  "339033",
                  "339034",
                  "339036",
                  "339039",
                  "339040",
                  "339041",
                  "339042",
                  "339045",
                  "339046",
                  "339047",
                  "339048",
                  "339049",
                  "339091",
                  "339093",
                  "339096",
                  "339097",
                  "339197",
                  "449051",
                  "449052",
                  "457042",
                  "469071",
                ],
                [
                  "00",
                  "01",
                  "02",
                  "03",
                  "04",
                  "05",
                  "06",
                  "07",
                  "08",
                  "09",
                  "10",
                  "11",
                  "12",
                  "14",
                  "15",
                  "16",
                  "17",
                  "18",
                  "19",
                  "20",
                  "21",
                  "22",
                  "23",
                  "24",
                  "25",
                  "26",
                  "28",
                  "29",
                  "31",
                  "33",
                  "34",
                  "35",
                  "36",
                  "38",
                  "39",
                  "40",
                  "41",
                  "42",
                  "43",
                  "44",
                  "45",
                  "47",
                  "50",
                  "52",
                  "53",
                  "56",
                  "58",
                  "61",
                  "63",
                  "65",
                  "66",
                  "70",
                  "78",
                  "79",
                  "81",
                  "88",
                  "96",
                  "99",
                ]
              )
            ) {
              codSTN = "1500";
            } else if (
              verificarCod(
                tipo11,
                ["117000", "200000"],
                ["319011", "339030", "339039", "339046", "339049"],
                ["00", "03", "14", "16", "26", "43", "52", "63"]
              )
            ) {
              codSTN = "1751";
            } else if (
              verificarCod(
                tipo11,
                ["118000", "119000"],
                [
                  "319011",
                  "319094",
                  "319113",
                  "339008",
                  "339049",
                  "339032",
                  "339039",
                  "339197",
                  "449052"
                ],
                ["00", "01", "04", "14", "42", "50", "52", "56", "99"]
              )
            ) {
              codSTN = "1540";
            } else if (
              verificarCod(
                tipo11,
                ["218000", "219000"],
                ["319013", "339030", "339032", "449052"],
                ["00", "02", "22", "42"]
              )
            ) {
              codSTN = "2540";
            } else if (verificarCod(tipo11, ["286000"], ["449052"], ["42"])) {
              codSTN = "2542";
            } else if (verificarCod(tipo11, ["287000"], ["339030"], ["22"])) {
              codSTN = "2543";
            } else if (
              verificarCod(
                tipo11,
                ["290024", "287000"],
                ["339030", "449051"],
                ["00", "35"]
              )
            ) {
              codSTN = "2754";
            } else if (
              verificarCod(
                tipo11,
                ["200000", "200089"],
                ["319011", "319013", "319094"],
                ["01", "02", "03"]
              )
            ) {
              codSTN = "2749";
            } else if (
              verificarCod(
                tipo11,
                ["206015", "210000"],
                ["319113", "319013", "339030", "339039", "339040", "339047", "339091", "339093"],
                ["00", "02", "04", "07", "11", "14", "19", "20", "22", "24", "39", "41", "43", "81", "88", "99"]
              )
            ) {
              codSTN = "2759";
            } else if (verificarCod(tipo11, ["226000"], ["339032"], ["00"])) {
              codSTN = "2665";
            } else if (
              verificarCod(
                tipo11,
                ["229506", "229507", "229557", "229559"],
                ["339030", "339039"],
                ["07", "63"]
              )
            ) {
              codSTN = "2660";
            } else if (
              verificarCod(
                tipo11,
                ["229056", "229057"],
                ["339014", "339030", "339039", "449052"],
                ["00", "39", "14", "19", "63", "35"]
              )
            ) {
              codSTN = "2669";
            } else if (
              verificarCod(tipo11, ["232000"], ["339032", "339048"], ["00"])
            ) {
              codSTN = "2661";
            } else if (
              verificarCod(
                tipo11,
                [
                  "207555",
                  "207063",
                  "207062",
                  "207063",
                  "207064",
                  "207008",
                  "207576",
                  "214008",
                  "207578",
                  "214008",
                ],
                ["319004", "339030", "339034", "339039", "449052"],
                ["00", "03", "04", "07", "09", "08", "12", "17", "35", "36"]
              )
            ) {
              codSTN = "2600";
            } else if (
              verificarCod(
                tipo11,
                ["209064", "281008", "209008", "282064", "209064"],
                ["339039", "449052"],
                ["08", "09", "35", "36", "50", "81"]
              )
            ) {
              codSTN = "2601";
            } else if (
              verificarCod(tipo11, ["295091"], ["319011"], ["03", "52"])
            ) {
              codSTN = "2604";
            } else if (verificarCod(tipo11, ["207097"], ["319016"], ["00"])) {
              codSTN = "2605";
            } else if (
              verificarCod(
                tipo11,
                ["231013", "231017", "231008", "231020", "221000"],
                ["339030", "339034"],
                ["01", "09", "03", "36"]
              )
            ) {
              codSTN = "2621";
            } else if (
              verificarCod(
                tipo11,
                ["280000", "281000", "281008", "281064", "282000"],
                ["339030", "339039", "335043", "339093", "449051", "449052"],
                [
                  "00",
                  "07",
                  "08",
                  "09",
                  "14",
                  "20",
                  "21",
                  "22",
                  "26",
                  "33",
                  "34",
                  "35",
                  "36",
                  "42",
                  "50",
                  "81",
                ]
              )
            ) {
              codSTN = "2706";
            } else if (verificarCod(tipo11, ["115051"], ["339030"], ["07"])) {
              codSTN = "1552";
            } else if (
              verificarCod(
                tipo11,
                ["115049"],
                ["339030", "339039", "339040"],
                ["01", "07", "16", "20", "22", "39", "47", "78", "79", "81"]
              )
            ) {
              codSTN = "1550";
            } else if (
              verificarCod(
                tipo11,
                ["124085"],
                ["339030", "339039", "339093"],
                ["00", "01", "14", "69", "81"]
              )
            ) {
              codSTN = "1571";
            } else if (
              verificarCod(tipo11, ["124000", "178092"], ["339093"], ["00"])
            ) {
              codSTN = "1715";
            } else if (verificarCod(tipo11, ["178093"], ["339093"], ["00"])) {
              codSTN = "1716";
            } else if (
              verificarCod(
                tipo11,
                ["201000", "202000", "215000", "215049"],
                ["339034", "339039"],
                ["03", "14", "16", "50", "81"]
              )
            ) {
              codSTN = "2550";
            } else if (verificarCod(tipo11, ["215051"], ["339030"], ["07"])) {
              codSTN = "2552";
            } else if (
              verificarCod(
                tipo11,
                ["224085", "224000"],
                ["339030", "339093", "449052"],
                ["00", "06", "39"]
              )
            ) {
              codSTN = "2571";
            } else if (
              verificarCod(tipo11, ["278093"], ["339093", "335041"], ["00"])
            ) {
              codSTN = "2716";
            } else if (
              verificarCod(
                tipo11,
                ["278092"],
                ["335041", "335043", "339093"],
                ["00"]
              )
            ) {
              codSTN = "2715";
            } else if (
              verificarCod(
                tipo11,
                [
                  "102000",
                  "107008",
                  "107011",
                  "107013",
                  "107017",
                  "107020",
                  "107057",
                  "107062",
                  "107064",
                  "177000",
                  "207013",
                ],
                [
                  "319004",
                  "319011",
                  "319113",
                  "339030",
                  "339033",
                  "339034",
                  "339036",
                  "339039",
                  "339041",
                  "339092",
                  "339093",
                  "449052",
                ],
                [
                  "00",
                  "01",
                  "03",
                  "04",
                  "05",
                  "06",
                  "07",
                  "08",
                  "09",
                  "10",
                  "12",
                  "14",
                  "15",
                  "17",
                  "19",
                  "22",
                  "24",
                  "25",
                  "35",
                  "36",
                  "41",
                  "48",
                  "43",
                  "48",
                  "50",
                  "63",
                  "78",
                  "81",
                  "99",
                ]
              )
            ) {
              codSTN = "1600";
            } else if (
              verificarCod(
                tipo11,
                ["102091", "195091"],
                ["319011", "319113", "339046", "339049"],
                ["00", "03", "04", "52"]
              )
            ) {
              codSTN = "1604";
            } else if (
              verificarCod(
                tipo11,
                ["107097"],
                ["319016", "339039"],
                ["00", "81"]
              )
            ) {
              codSTN = "1605";
            } else if (
              verificarCod(
                tipo11,
                [
                  "131000",
                  "131008",
                  "131010",
                  "131013",
                  "131020",
                  "131017",
                  "131060",
                  "207060",
                ],
                ["339030", "339034", "339039"],
                [
                  "00",
                  "01",
                  "03",
                  "07",
                  "09",
                  "16",
                  "19",
                  "36",
                  "50",
                  "69",
                  "81",
                  "99",
                ]
              )
            ) {
              codSTN = "1621";
            } else if (
              verificarCod(
                tipo11,
                ["171019", "181000", "181017"],
                [
                  "339039",
                  "339034",
                  "339039",
                  "339093",
                  "335043",
                  "449051",
                  "449052",
                ],
                ["00", "03", "10", "50", "81"]
              )
            ) {
              codSTN = "1706";
            } else if (verificarCod(tipo11, ["121000"], ["449051"], ["00"])) {
              codSTN = "1631";
            } else if (
              verificarCod(
                tipo11,
                ["106000", "106015"],
                ["339030", "339039", "449052"],
                ["01", "04", "11", "16", "17", "21", "22"]
              )
            ) {
              codSTN = "1753";
            } else if (
              verificarCod(
                tipo11,
                ["171019"],
                [
                  "339014",
                  "339019",
                  "339030",
                  "339036",
                  "339039",
                  "339093",
                  "449052",
                ],
                [
                  "00",
                  "01",
                  "05",
                  "10",
                  "12",
                  "14",
                  "19",
                  "29",
                  "33",
                  "34",
                  "35",
                  "44",
                  "45",
                  "74",
                  "81",
                  "88",
                  "99",
                ]
              )
            ) {
              codSTN = "1752";
            } else if (
              verificarCod(
                tipo11,
                ["170072"],
                ["339030", "339039", "339047"],
                ["00", "01", "81"]
              )
            ) {
              codSTN = "1708";
            } else if (
              verificarCod(
                tipo11,
                ["170074"],
                ["339030", "339039", "339047"],
                ["00", "01", "24", "81", "99"]
              )
            ) {
              codSTN = "1705";
            } else if (
              verificarCod(
                tipo11,
                ["129000", "129056"],
                ["339014", "339030", "339033", "339039"],
                ["00", "16", "17", "39", "41", "78", "99"]
              )
            ) {
              codSTN = "1669";
            } else if (
              verificarCod(
                tipo11,
                ["158000"],
                [
                  "319011",
                  "319013",
                  "319094",
                  "319113",
                  "339030",
                  "339034",
                  "339036",
                  "339039",
                  "339040",
                  "339047",
                  "339049",
                  "339091",
                  "339093",
                  "339197",
                  "449052",
                  "469071",
                ],
                [
                  "00",
                  "01",
                  "02",
                  "03",
                  "04",
                  "05",
                  "06",
                  "07",
                  "09",
                  "14",
                  "16",
                  "21",
                  "22",
                  "28",
                  "30",
                  "41",
                  "43",
                  "44",
                  "45",
                  "47",
                  "50",
                  "51",
                  "52",
                  "81",
                  "99",
                ]
              )
            ) {
              codSTN = "1659";
            } else if (
              verificarCod(
                tipo11,
                ["258000"],
                ["319013", "319113", "339091", "339036", "339039", "339047"],
                ["00", "02", "04", "30", "50"]
              )
            ) {
              codSTN = "2659";
            } else if (
              verificarCod(
                tipo11,
                ["132000"],
                ["339030", "339032"],
                ["00", "07", "22"]
              )
            ) {
              codSTN = "1661";
            } else if (
              verificarCod(
                tipo11,
                ["129507", "129506", "129559"],
                ["339030", "339014", "339033", "339039", "449052"],
                [
                  "00",
                  "04",
                  "07",
                  "17",
                  "22",
                  "23",
                  "24",
                  "35",
                  "44",
                  "48",
                  "78",
                  "99",
                ]
              )
            ) {
              codSTN = "1660";
            } else if (
              verificarCod(
                tipo11,
                ["100000", "101000", "102000", "107008", "107062", "107017", "110000", "115051", "123000", "158000", "170072"],
                ["000000"],
                [
                  "00",
                ]
              )
            ) {
              codSTN = "1869";
            } else if (
              verificarCod(
                tipo11,
                ["200000", "201000", "202000", "203000", "210000", "207008", "210000", "215051", "277000", "214015", "207062", "218000", "220000", "223000", "237000", "258000", "290024", "270072"],
                ["000000"],
                [
                  "00",
                ]
              )
            ) {
              codSTN = "2869";
            } else if (
              verificarCod(
                tipo11,
                ["150000", "151000"],
                ["339030", "339036", "339039", "339040", "449052"],
                [
                  "01",
                  "04",
                  "07",
                  "08",
                  "14",
                  "15",
                  "19",
                  "22",
                  "44",
                  "47",
                  "88",
                  "99",
                ]
              )
            ) {
              codSTN = "1899";
            } else if (
              verificarCod(tipo11, ["144000"], ["319016", "339093"], ["00"])
            ) {
              codSTN = "1501";
            } else if (
              verificarCod(
                tipo11,
                ["244000"],
                ["319016", "339039"],
                ["00", "81"]
              )
            ) {
              codSTN = "2501";
            } else if (
              verificarCod(
                tipo11,
                ["110000", "123000"],
                [
                  "319011",
                  "319013",
                  "319094",
                  "339008",
                  "339014",
                  "319113",
                  "339030",
                  "339034",
                  "339036",
                  "339037",
                  "339039",
                  "339040",
                  "339046",
                  "339047",
                  "339049",
                  "339091",
                  "339092",
                  "339093",
                  "339197",
                  "449052",
                  "449093",
                  "469071",
                ],
                [
                  "00",
                  "01",
                  "02",
                  "03",
                  "04",
                  "05",
                  "07",
                  "08",
                  "09",
                  "11",
                  "12",
                  "14",
                  "15",
                  "16",
                  "17",
                  "18",
                  "19",
                  "21",
                  "22",
                  "23",
                  "24",
                  "26",
                  "31",
                  "35",
                  "36",
                  "39",
                  "41",
                  "43",
                  "47",
                  "48",
                  "51",
                  "56",
                  "71",
                  "78",
                  "81",
                  "88",
                  "99",
                ]
              )
            ) {
              codSTN = "1759";
            } else if (
              verificarCod(
                tipo11,
                ["236000", "237000"],
                ["339030", "339039", "339093", "449052"],
                [
                  "00",
                  "12",
                  "13",
                  "14",
                  "16",
                  "21",
                  "22",
                  "34",
                  "35",
                  "40",
                  "42",
                  "81",
                  "88",
                  "99",
                ]
              )
            ) {
              codSTN = "2710";
            } else if (verificarCod(tipo11, ["220000"], ["339030"], ["14"])) {
              codSTN = "2570";
            } else if (
              verificarCod(
                tipo11,
                ["200000", "201000", "202000"],
                [
                  "319013",
                  "339030",
                  "339039",
                  "339040",
                  "339045",
                  "339048",
                  "339091",
                  "339093",
                  "449051",
                  "449052",
                  "469071",
                ],
                [
                  "00",
                  "01",
                  "02",
                  "05",
                  "14",
                  "16",
                  "19",
                  "20",
                  "24",
                  "25",
                  "35",
                  "39",
                  "63",
                  "79",
                  "81",
                  "99",
                ]
              )
            ) {
              codSTN = "2500";
            } else if (
              verificarCod(
                tipo11,
                ["123000"],
                ["339030", "339039", "339093"],
                ["00", "14", "81"]
              )
            ) {
              codSTN = "1700";
            } else if (
              verificarCod(
                tipo11,
                ["223000"],
                ["339030", "339093"],
                ["00", "14"]
              )
            ) {
              codSTN = "2700";
            } else if (verificarCod(tipo11, ["270074"], ["339030"], ["99"])) {
              codSTN = "2705";
            } else if (verificarCod(tipo11, ["270072"], ["339030"], ["99"])) {
              codSTN = "2708";
            } else if (verificarCod(tipo11, ["216000"], ["339030"], ["99"])) {
              codSTN = "2750";
            } else if (verificarCod(tipo11, ["206000"], ["339030"], ["99"])) {
              codSTN = "2753";
            } else if (
              verificarCod(
                tipo11,
                ["116000"],
                ["339039", "339047"],
                ["00", "81"]
              )
            ) {
              codSTN = "1750";
            } else if (
              verificarCod(
                tipo11,
                ["136000", "137000"],
                ["339039", "339093"],
                ["00", "23", "81", "88", "99"]
              )
            ) {
              codSTN = "1710";
            } else if (verificarCod(tipo11, ["190021"], ["449051"], ["00"])) {
              codSTN = "1574";
            } else if (
              verificarCod(
                tipo11,
                ["190024"],
                ["449051", "449052"],
                ["00", "35"]
              )
            ) {
              codSTN = "1754";
            } else if (
              verificarCod(tipo11, ["250000"], ["339039"], ["41", "48"])
            ) {
              codSTN = "2899";
            } else if (
              verificarCod(
                tipo11,
                ["103000"],
                ["319011", "319001", "319003"],
                ["01"]
              )
            ) {
              codSTN = "1800";
 //             codAEO = "1111";
            } else if (
              verificarCod(
                tipo11,
                ["103000"],
                ["339093"],
                ["00"]
              )
            ) {
              codSTN = "1800";
            } else if (
              verificarCod(
                tipo11,
                ["203000"],
                ["319001", "319003"],
                ["01"]
              )
            ) {
              codSTN = "2800";
            } else if (
              verificarCod(
                tipo11,
                ["177000"],
                [
                  "319003",
                  "319011",
                  "319013",
                  "319094",
                  "319113",
                  "339008",
                  "339014",
                  "339030",
                  "339015",
                  "339033",
                  "339034",
                  "339035",
                  "339036",
                  "339039",
                  "339040",
                  "339041",
                  "339047",
                  "339049",
                  "339091",
                  "339093",
                  "339197",
                  "449051",
                  "449052",
                  "469071"
                ],
                [
                  "00",
                  "02",
                  "01",
                  "02",
                  "03",
                  "04",
                  "05",
                  "06",
                  "07",
                  "09",
                  "14",
                  "15",
                  "16",
                  "17",
                  "18",
                  "22",
                  "23",
                  "35",
                  "41",
                  "43",
                  "44",
                  "45",
                  "47",
                  "56",
                  "65",
                  "66",
                  "70",
                  "81",
                  "99"
                ]
              )
            ) {
              codSTN = "1802";
            } else if (verificarCod(tipo11, ["277000"], ["319011", "319013", "319094", "339008", "339030", "339036", "339047", "339049", "339039", "449051", "469071"], ["00", "01", "02", "03", "04", "05", "09", "44", "45", "56", "99"])) {
              codSTN = "2802";
            }
            emp[empIndex].content.content[tipo11Index].codSTN = codSTN;
            if (codSTN === "nan")
              // console.log(emp[empIndex].content.content[tipo11Index]);
          }
        });
      }
    });

    for (const item of emp) {
      const query = db("emp").insert(item).toSQL();

      // Execute the query (you might need to use db.raw or just the original insert call)
      await db("emp").insert(item);
    }

    res.status(200).json({ message: "EMP inserido com sucesso!" });
  } catch (error) {
    console.error(
      "error from InserirEmp function from /controllers/controller.emp.js",
      error
    );
    return res.status(500).json({ message: "Internal server error." });
  }
}
async function deleteEmp(req, res) {
  const { id } = req.params;
  try {
    await db("emp").delete().where({ id: id });
    res.status(200).json({ message: "Registro removido com sucesso!" });
  } catch (error) {
    console.error(
      "error from Inserir deleteEmp from /controllers/controller.emp.js",
      error
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
    res.status(200).json(emp);
  } catch (error) {
    console.error(
      "error from getEmpById function from /controllers/controller.emp.js",
      error
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
    res.status(200).json({ message: "got here!" });
  } catch (error) {
    console.error(
      "error from updateEmp function from /controllers/controller.emp.js",
      error
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
    res.status(200).json({ message: "Registro inserido com sucesso!" });
  } catch (error) {
    console.error(
      "error from InserirEmpManual function from /controllers/controller.emp.js",
      error
    );
    return res.status(500).json({ message: "Internal server error." });
  }
}

export default {
  getAllEmp,
  Inserir,
  InserirEmp,
  deleteEmp,
  getEmpById,
  updateEmp,
  InserirEmpManual,
};

function verificarCod(tipo10, codFontRecursos, elementoDespesa, subElemento) {
  return (
    elementoDespesa.includes(tipo10.elementoDespesa) &&
    codFontRecursos.includes(tipo10.content[0].codFontRecursos) &&
    subElemento.includes(tipo10.subElemento)
  );
}
