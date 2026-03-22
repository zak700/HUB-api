import { db } from "../../database/postgres.js";
import codFR from "./addicionalInfo/codFR.js";

async function getAllRec(req, res) {
  // Paginacao
  let { page, pageSize } = req.params;
  page = parseInt(page, 10);
  pageSize = parseInt(pageSize, 10);
  if (isNaN(page) || page < 0) page = 0;
  if (isNaN(pageSize) || pageSize <= 0) pageSize = 10;
  const { mes, ano, org } = req.query;

  try {
    let query = db("rec");

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
      "error from getAllRec function from /controllers/controller.rec.js",
      error
    );
    return res.status(500).json({ message: "Internal server error." });
  }
}

async function Inserir(req, res) {
  try {
    const rec = req.body;

    await db("rec").insert(rec);

    return res.status(200).json({ message: "ok" });
  } catch (error) {
    console.error(
      "error from Inserir function from /controllers/controller.rec.js",
      error
    );
    return res.status(500).json({ message: "Internal server error." });
  }
}

async function InserirRec(req, res) {
  const { text, data } = req.body;
  const rec = [];

  try {
    const lines = text.split("\n");

    let dataHelper = -1;

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];

      if (line.slice(0, 2) !== "99") {
        if (line.substring(0, 2) === "10") {
          dataHelper++;
          rec.push({
            data,
            content: {
              tipoRegistro: line.slice(0, 2).trim(),
              codOrgao: line.slice(2, 4).trim(),
              codUnidade: line.slice(4, 6).trim(),
              rubrica: line.slice(6, 15).trim(),
              especificacao: line.slice(15, 115).trim(),
              vlPrevistoAtualizado: line.slice(115, 128).trim(),
              vlArrecadado: line.slice(128, 141).trim(),
              vlAcumulado: line.slice(141, 154).trim(),
              nroSequencial: line.slice(154, 160).trim(),
              content: [],
              line
            },
          });
        } else if (line.substring(0, 2) === "11") {
          if (
            rec[dataHelper] &&
            rec[dataHelper].content &&
            Array.isArray(rec[dataHelper].content.content)
          ) {
            rec[dataHelper].content.content.push({
              tipoRegistro: line.slice(0, 2).trim(),
              codOrgao: line.slice(2, 4).trim(),
              codUnidade: line.slice(4, 6).trim(),
              rubrica: line.slice(6, 15).trim(),
              banco: line.slice(15, 18).trim(),
              agencia: line.slice(18, 22).trim(),
              contaCorrente: line.slice(22, 34).trim(),
              contaCorrenteDigVerif: line.slice(34, 35).trim(),
              tipoConta: line.slice(35, 37).trim(),
              vlRecolhimento: line.slice(37, 50).trim(),
              nroSequencial: line.slice(154, 160).trim(),
              line
            });
          }
        } else if (line.substring(0, 2) === "12") {
          if (
            rec[dataHelper] &&
            rec[dataHelper].content &&
            Array.isArray(rec[dataHelper].content.content)
          ) {
            rec[dataHelper].content.content.push({
              tipoRegistro: line.slice(0, 2).trim(),
              codOrgao: line.slice(2, 4).trim(),
              codUnidade: line.slice(4, 6).trim(),
              rubrica: line.slice(6, 15).trim(),
              banco: line.slice(15, 18).trim(),
              agencia: line.slice(18, 22).trim(),
              contaCorrente: line.slice(22, 34).trim(),
              contaCorrenteDigVerif: line.slice(34, 35).trim(),
              tipoConta: line.slice(35, 37).trim(),
              codFonteRecurso: line.slice(37, 43).trim(),
              poderOrgao: "nan", // PO
              codFontRecursosMSC: "nan", // FR
              codAEO: "nan", // CO
              vlFonteRecurso: line.slice(43, 56).trim(),
              nroSequencial: line.slice(154, 160).trim(),
              line
            });
          }
        }
      }
    }

    rec.forEach((recValue, recIndex) => {
      const tipo10 = recValue.content;

      if (tipo10.tipoRegistro != "99") {
        tipo10.content.forEach((tipo12, tipo12Index) => {
          if (tipo12.tipoRegistro !== "12") return
          let poderOrgao = "nan";
          let codFontRecursosMSC = "nan";
          let codAEO = "nan";
          // 03 - PREFEITURA MUNICIPAL DE SENADOR CANEDO
          if (tipo12.codOrgao === "03") {
            if (
              verificarCod(
                tipo12,
                ["100"],
                [
                  "011125001",
                  "011125002",
                  "011125003",
                  "011125004",
                  "011125301",
                  "011130311",
                  "011130341",
                  "011145111",
                  "011145112",
                  "011145113",
                  "011145114",
                  "011210101",
                  "011220101",
                  "011220102",
                  "013399901",
                  "017115111",
                  "017115121",
                  "017115201",
                  "017195801",
                  "017215001",
                  "017215101",
                  "017215201",
                  "019110101",
                ],
                ["000"]
              )
            ) {
              poderOrgao = "10131";
              codFontRecursosMSC = "1500";
              codAEO = "nan";
            } else if (
              verificarCod(
                tipo12,
                ["101"],
                [
                  "011125001",
                  "011125002",
                  "011125003",
                  "011125004",
                  "011125301",
                  "011130311",
                  "011130341",
                  "011145111",
                  "011145112",
                  "011145113",
                  "011145114",
                  "017115111",
                  "017115121",
                  "017115201",
                  "017215001",
                  "017215101",
                  "017215201",
                ],
                ["000"]
              )
            ) {
              poderOrgao = "10131";
              codFontRecursosMSC = "1500";
              codAEO = "1001";
            } else if (
              verificarCod(
                tipo12,
                ["101"],
                [
                  "9510000001",
                  "9510000002",
                  "9510000004",
                  "9510000005",
                  "9510000006",
                ],
                ["000"]
              )
            ) {
              poderOrgao = "10131";
              codFontRecursosMSC = "1500";
              codAEO = "nan";
            } else if (
              verificarCod(
                tipo12,
                ["102"],
                [
                  "011125001",
                  "011125002",
                  "011125003",
                  "011125004",
                  "011125301",
                  "011130311",
                  "011130341",
                  "011145111",
                  "011145112",
                  "011145113",
                  "011145114",
                  "013110201",
                  "012415001",
                  "013110201",
                  "013210101",
                  "017115111",
                  "017115121",
                  "017115201",
                  "017215001",
                  "017215101",
                  "017215201",
                ],
                ["000"]
              )
            ) {
              poderOrgao = "10131";
              codFontRecursosMSC = "1500";
              codAEO = "1002";
            } else if (
              verificarCod(
                tipo12,
                ["144"],
                ["013210101", "019991221"],
                ["000"]
              )
            ) {
              poderOrgao = "10131";
              codFontRecursosMSC = "1501";
              codAEO = "nan";
            } else if (
              verificarCod(tipo12, ["190"], ["021125001"], ["021"])
            ) {
              poderOrgao = "10131";
              codFontRecursosMSC = "1574";
              codAEO = "nan";
            } else if (
              verificarCod(tipo12, ["137"], ["013210101"], ["000"])
            ) {
              poderOrgao = "10131";
              codFontRecursosMSC = "1599";
              codAEO = "3110";
            } else if (
              verificarCod(
                tipo12,
                ["137"],
                ["017249901", "024229901"],
                ["000"]
              )
            ) {
              poderOrgao = "10131";
              codFontRecursosMSC = "1599";
              codAEO = "3210";
            } else if (
              verificarCod(tipo12, ["190"], ["021125101"], ["023"])
            ) {
              poderOrgao = "10131";
              codFontRecursosMSC = "1634";
              codAEO = "nan";
            } else if (
              verificarCod(
                tipo12,
                ["123"],
                ["013210101", "017179901", "024149901"],
                ["000"]
              )
            ) {
              poderOrgao = "10131";
              codFontRecursosMSC = "1700";
              codAEO = "nan";
            } else if (
              verificarCod(tipo12, ["127"], ["013210101"], ["000"])
            ) {
              poderOrgao = "10131";
              codFontRecursosMSC = "1701";
              codAEO = "nan";
            } else if (
              verificarCod(
                tipo12,
                ["170"],
                ["013210101", "017125241"],
                ["074"]
              )
            ) {
              poderOrgao = "10131";
              codFontRecursosMSC = "1705";
              codAEO = "nan";
            } else if (
              verificarCod(
                tipo12,
                ["180"],
                ["013210101", "024195101", "024199901"],
                ["000"]
              )
            ) {
              poderOrgao = "10131";
              codFontRecursosMSC = "1706";
              codAEO = "3110";
            } else if (
              verificarCod(tipo12, ["181"], ["013210101"], ["000"])
            ) {
              poderOrgao = "10131";
              codFontRecursosMSC = "1706";
              codAEO = "nan";
            } else if (
              verificarCod(
                tipo12,
                ["170"],
                ["013210101", "017125101"],
                ["072"]
              )
            ) {
              poderOrgao = "10131";
              codFontRecursosMSC = "1708";
              codAEO = "nan";
            } else if (
              verificarCod(
                tipo12,
                ["136", "137"],
                ["013210101", "024229901"],
                ["000"]
              )
            ) {
              poderOrgao = "10131";
              codFontRecursosMSC = "1710";
              codAEO = "nan";
            } else if (
              verificarCod(
                tipo12,
                ["100"],
                ["013210101", "017195801"],
                ["089"]
              )
            ) {
              poderOrgao = "10131";
              codFontRecursosMSC = "1749";
              codAEO = "nan";
            } else if (
              verificarCod(
                tipo12,
                ["116"],
                ["013210101", "017215301"],
                ["000"]
              )
            ) {
              poderOrgao = "10131";
              codFontRecursosMSC = "1750";
              codAEO = "nan";
            } else if (
              verificarCod(tipo12, ["100"], ["012415001"], ["000"])
            ) {
              poderOrgao = "10131";
              codFontRecursosMSC = "1751";
              codAEO = "nan";
            } else if (
              verificarCod(
                tipo12,
                ["171"],
                ["013210101", "019110101"],
                ["019"]
              )
            ) {
              poderOrgao = "10131";
              codFontRecursosMSC = "1752";
              codAEO = "nan";
            } else if (
              verificarCod(
                tipo12,
                ["106"],
                [
                  "011210101",
                  "011210102",
                  "011210103",
                  "011210104",
                  "011215001",
                  "011215002",
                  "011215003",
                  "011215004",
                ],
                ["000", "015"]
              )
            ) {
              poderOrgao = "10131";
              codFontRecursosMSC = "1753";
              codAEO = "nan";
            } else if (
              verificarCod(
                tipo12,
                ["190"],
                ["013210101", "021120101", "021125201"],
                ["024"]
              )
            ) {
              poderOrgao = "10131";
              codFontRecursosMSC = "1754";
              codAEO = "nan";
            } else if (
              verificarCod(
                tipo12,
                ["192"],
                ["013210101", "022110101"],
                ["032"]
              )
            ) {
              poderOrgao = "10131";
              codFontRecursosMSC = "1755";
              codAEO = "nan";
            } else if (
              verificarCod(
                tipo12,
                ["100"],
                [
                  "9999000001",
                  "9999000002",
                  "9999000003",
                  "9999000009",
                  "9999000025",
                  "9999000028",
                  "9999000029",
                  "9999000030",
                  "9999000031",
                  "9999000032",
                  "9999000034",
                  "9999000035",
                  "9999000036",
                  "9999000037",
                  "9999000038",
                  "9999000040",
                  "9999000041",
                  "9999000042",
                  "9999000043",
                  "9999000045",
                  "9999000047",
                  "9999000048",
                  "9999000049",
                  "9999000050",
                  "9999000051",
                  "9999000052",
                  "9999000053",
                  "9999000054",
                  "9999000055",
                  "9999000056",
                  "9999000057",
                  "9999000058",
                  "9999000059",
                  "9999000060",
                  "9999000061",
                  "9999000064",
                  "9999000066",
                  "9999000067",
                  "9999000068",
                  "9999000070",
                  "9999000071",
                  "9999000072",
                  "9999000073",
                  "9999000074",
                  "9999000075",
                  "9999000076",
                ],
                ["00"]
              )
            ) {
              poderOrgao = "10131";
              codFontRecursosMSC = "1869";
              codAEO = "nan";
            }
          }
          // 06 - FUNDEB - SENADOR CANEDO
          if (tipo12.codOrgao === "06") {
            if (
              verificarCod(
                tipo12,
                ["118"],
                ["013210101", "017515001"],
                ["000"]
              )
            ) {
              poderOrgao = "10131";
              codFontRecursosMSC = "1540";
              codAEO = "1070";
            } else if (
              verificarCod(tipo12, ["119"], ["017515001"], ["000"])
            ) {
              poderOrgao = "10131";
              codFontRecursosMSC = "1540";
              codAEO = "nan";
            } else if (
              verificarCod(tipo12, ["187"], ["017155201"], ["000"])
            ) {
              poderOrgao = "10131";
              codFontRecursosMSC = "1543";
              codAEO = "nan";
            } else if (
              verificarCod(tipo12, ["149"], ["017155301"], ["000"])
            ) {
              poderOrgao = "10131";
              codFontRecursosMSC = "1546";
              codAEO = "nan";
            } else if (
              verificarCod(
                tipo12,
                ["100"],
                [
                  "9999000027",
                  "9999000039",
                  "9999000044",
                  "9999000127",
                  "9999000128",
                  "9999000130",
                  "9999000131",
                  "9999000132",
                  "9999000133",
                  "9999000134",
                  "9999000135",
                  "9999000137",
                  "9999000138",
                  "9999000139",
                  "9999000142",
                  "9999000143",
                  "9999000145",
                  "9999000146",
                  "9999000148",
                  "9999000149",
                  "9999000151",
                  "9999000152",
                  "9999000153",
                  "9999000154",
                  "9999000155",
                  "9999000156",
                  "9999000157",
                  "9999000158",
                  "9999000159",
                  "9999000160",
                  "9999000161",
                  "9999000162",
                  "9999000163",
                  "9999000165",
                  "9999000166",
                  "9999000167",
                  "9999000168",
                  "9999000169",
                  "9999000173",
                  "9999000187",
                  "9999000191",
                  "9999000202",
                  "9999000205",
                  "9999060100",
                  "9999210104",
                  "9999210139",
                  "9999210170",
                ],
                ["000"]
              )
            ) {
              poderOrgao = "10131";
              codFontRecursosMSC = "1869";
              codAEO = "nan";
            }
          }
          // 07 - INSTITUTO DE PREVIDENCIA DO SERVIDOR PUBLICO DE SENADOR CANEDO
          if (tipo12.codOrgao === "07") {
            if (
              verificarCod(
                tipo12,
                ["103"],
                [
                  "012150111",
                  "012150221",
                  "019239901",
                  "019990101",
                  "019990301",
                  "072150211",
                  "072150212",
                  "072155111",
                ],
                ["000"]
              )
            ) {
              poderOrgao = "10132";
              codFontRecursosMSC = "1800";
              codAEO = "nan";
            } else if (
              verificarCod(
                tipo12,
                ["103"],
                [
                  "012150121",
                  "013210401",
                  "019990102",
                  "019990302",
                  "9910000001",
                ],
                ["000"]
              )
            ) {
              poderOrgao = "10132";
              codFontRecursosMSC = "1800";
              codAEO = "1111";
            } else if (
              verificarCod(
                tipo12,
                ["177"],
                ["012150111", "013210101", "072150211", "991000002"],
                ["000"]
              )
            ) {
              poderOrgao = "10132";
              codFontRecursosMSC = "1802";
              codAEO = "nan";
            } else if (
              verificarCod(
                tipo12,
                ["100"],
                [
                  "9999000013",
                  "9999000022",
                  "9999000174",
                  "9999000175",
                  "9999000176",
                  "9999000177",
                  "9999000178",
                  "9999000179",
                  "9999000180",
                  "9999000181",
                  "9999000183",
                  "9999000184",
                  "9999000189",
                  "9999000193",
                  "9999000194",
                  "9999000195",
                  "9999000196",
                  "9999000198",
                  "9999000199",
                  "9999000211",
                  "9999010100",
                  "9999070100",
                  "9999120100",
                  "9999210116",
                  "9999210135",
                  "9999210148",
                ],
                ["000"]
              )
            ) {
              poderOrgao = "10132";
              codFontRecursosMSC = "1869";
              codAEO = "nan";
            }
          }
          // 08 - FEMBOM - FUNDO ESPECIAL MUNICIPAL PARA FRAÇÃO CORPO DE BOMBEIRO
          if (tipo12.codOrgao === "08") {
            if (
              verificarCod(
                tipo12,
                ["100"],
                ["011210101", "013210101"],
                ["000"]
              )
            ) {
              poderOrgao = "10131";
              codFontRecursosMSC = "1759";
              codAEO = "nan";
            } else if (
              verificarCod(
                tipo12,
                ["100"],
                ["9999000218", "9999000219", "9999000220", "99990801"],
                ["000"]
              )
            ) {
              poderOrgao = "10131";
              codFontRecursosMSC = "1869";
              codAEO = "nan";
            }
          }
          // 09 - FMS - FUNDO MUNICIPAL DE SAÚDE
          if (tipo12.codOrgao === "09") {
            if (verificarCod(tipo12, ["102"], ["013210101"], ["000"])) {
              poderOrgao = "10131";
              codFontRecursosMSC = "1500";
              codAEO = "1002";
            } else if (
              verificarCod(
                tipo12,
                ["107"],
                [
                  "013210101",
                  "017135011",
                  "017135021",
                  "017135031",
                  "017135041",
                  "017135051",
                ],
                [
                  "008",
                  "011",
                  "013",
                  "008",
                  "017",
                  "020",
                  "057",
                  "062",
                  "063",
                  "097",
                ]
              )
            ) {
              poderOrgao = "10131";
              codFontRecursosMSC = "1600";
              codAEO = "nan";
            } else if (
              verificarCod(
                tipo12,
                ["109"],
                ["013210101", "017135111", "024115121"],
                ["000", "008", "064"]
              )
            ) {
              poderOrgao = "10131";
              codFontRecursosMSC = "1601";
              codAEO = "nan";
            } else if (
              verificarCod(tipo12, ["195"], ["017199901"], ["091"])
            ) {
              poderOrgao = "10131";
              codFontRecursosMSC = "1604";
              codAEO = "nan";
            } else if (
              verificarCod(tipo12, ["107"], ["013210101"], ["097"])
            ) {
              poderOrgao = "10131";
              codFontRecursosMSC = "1605";
              codAEO = "nan";
            } else if (
              verificarCod(
                tipo12,
                ["131"],
                ["013210101", "017235001"],
                [
                  "000",
                  "008",
                  "010",
                  "060",
                  "013",
                  "017",
                  "020",
                  "060",
                  "062",
                ]
              )
            ) {
              poderOrgao = "10131";
              codFontRecursosMSC = "1621";
              codAEO = "nan";
            } else if (
              verificarCod(
                tipo12,
                ["121"],
                ["013210101", "024145001"],
                ["000"]
              )
            ) {
              poderOrgao = "10131";
              codFontRecursosMSC = "1631";
              codAEO = "nan";
            } else if (
              verificarCod(
                tipo12,
                ["125"],
                ["013210101", "017245001"],
                ["000"]
              )
            ) {
              poderOrgao = "10131";
              codFontRecursosMSC = "1632";
              codAEO = "nan";
            } else if (
              verificarCod(
                tipo12,
                ["181"],
                ["013210101", "017199901", "024199901"],
                ["000", "008", "017"]
              )
            ) {
              poderOrgao = "10131";
              codFontRecursosMSC = "1706";
              codAEO = "3110";
            } else if (
              verificarCod(
                tipo12,
                ["182"],
                ["013210101", "017199901", "024199901"],
                ["000", "064"]
              )
            ) {
              poderOrgao = "10131";
              codFontRecursosMSC = "1706";
              codAEO = "3120";
            } else if (
              verificarCod(tipo12, ["137"], ["013210101"], ["000"])
            ) {
              poderOrgao = "10131";
              codFontRecursosMSC = "1710";
              codAEO = "nan";
            } else if (
              verificarCod(
                tipo12,
                ["106"],
                [
                  "013210101",
                  "011215001",
                  "011215002",
                  "011215003",
                  "011215004",
                ],
                ["015"]
              )
            ) {
              poderOrgao = "10131";
              codFontRecursosMSC = "1753";
              codAEO = "nan";
            } else if (
              verificarCod(
                tipo12,
                ["100", "102"],
                [
                  "9999000010",
                  "9999000019",
                  "9999000063",
                  "9999000069",
                  "9999000069",
                  "9999000081",
                  "9999000082",
                  "9999000084",
                  "9999000087",
                  "9999000089",
                  "9999000170",
                  "9999000188",
                  "9999000190",
                  "9999000221",
                  "9999000222",
                  "9999000223",
                  "9999000224",
                  "9999000225",
                  "9999000226",
                  "9999000227",
                  "9999000228",
                  "9999000232",
                  "9999000233",
                  "9999000234",
                  "9999000236",
                  "9999000238",
                  "9999000240",
                  "9999000242",
                  "9999000246",
                  "9999000247",
                  "9999000250",
                  "9999000252",
                  "9999000253",
                  "9999000257",
                  "9999000258",
                  "9999000262",
                  "9999000263",
                  "9999090100",
                  "9999210101",
                  "9999210102",
                  "9999210106",
                  "9999210112",
                  "9999210115",
                  "9999210123",
                  "9999210138",
                  "9999000253",
                  "9999000257",
                  "9999000258",
                  "9999000262",
                  "9999000263",
                  "9999090100",
                  "9999210101",
                  "9999210102",
                  "9999210106",
                  "9999210112",
                  "9999210115",
                  "9999210123",
                  "9999210138",
                  "9999210182",
                  "9999210184",
                  "9999210188",
                ],
                ["000"]
              )
            ) {
              poderOrgao = "10131";
              codFontRecursosMSC = "1869";
              codAEO = "nan";
            }
          }
          // 11 - FMAS - FUNDO MUNICIPAL ASSISTENCIA SOCIAL
          if (tipo12.codOrgao === "11") {
            if (verificarCod(tipo12, ["100"], ["013210101"], ["000"])) {
              poderOrgao = "10131";
              codFontRecursosMSC = "1500";
              codAEO = "nan";
            } else if (
              verificarCod(tipo12, ["137"], ["013210101"], ["000"])
            ) {
              poderOrgao = "10131";
              codFontRecursosMSC = "1599";
              codAEO = "nan";
            } else if (
              verificarCod(
                tipo12,
                ["129"],
                ["013210101", "017165001"],
                ["006", "506", "507", "554", "557", "559"]
              )
            ) {
              poderOrgao = "10131";
              codFontRecursosMSC = "1660";
              codAEO = "nan";
            } else if (
              verificarCod(
                tipo12,
                ["132"],
                ["013210101", "017295101"],
                ["000", "006"]
              )
            ) {
              poderOrgao = "10131";
              codFontRecursosMSC = "1661";
              codAEO = "nan";
            } else if (
              verificarCod(
                tipo12,
                ["129"],
                ["013210101", "017165001"],
                ["056", "081"]
              )
            ) {
              poderOrgao = "10131";
              codFontRecursosMSC = "1669";
              codAEO = "nan";
            } else if (
              verificarCod(tipo12, ["181"], ["024199901"], ["000"])
            ) {
              poderOrgao = "10131";
              codFontRecursosMSC = "1706";
              codAEO = "3110";
            } else if (
              verificarCod(
                tipo12,
                ["180", "181"],
                ["013210101", "017199901"],
                ["000"]
              )
            ) {
              poderOrgao = "10131";
              codFontRecursosMSC = "1706";
              codAEO = "3210";
            } else if (
              verificarCod(tipo12, ["182"], ["013210101"], ["000"])
            ) {
              poderOrgao = "10131";
              codFontRecursosMSC = "1706";
              codAEO = "3220";
            } else if (
              verificarCod(
                tipo12,
                ["100"],
                [
                  "9999000018",
                  "9999000062",
                  "9999000172",
                  "9999000185",
                  "9999000186",
                  "9999000201",
                  "9999000203",
                  "9999000204",
                  "9999000206",
                  "9999000207",
                  "9999000241",
                  "9999000272",
                  "9999000273",
                  "9999000274",
                  "9999000275",
                  "9999000276",
                  "9999000277",
                  "9999000278",
                  "9999000279",
                  "9999000280",
                  "9999000281",
                  "9999000282",
                  "9999000284",
                  "9999000285",
                  "9999000289",
                  "9999000290",
                  "9999000296",
                  "9999000297",
                  "9999000298",
                  "9999000299",
                  "9999000301",
                  "9999000304",
                  "9999000305",
                  "9999000306",
                  "9999000307",
                  "9999000419",
                  "9999000448",
                  "9999110100",
                  "9999210111",
                  "9999210131",
                ],
                ["000"]
              )
            ) {
              poderOrgao = "10131";
              codFontRecursosMSC = "1869";
              codAEO = "nan";
            } else if (
              verificarCod(tipo12, ["100"], ["9999210140"], ["000"])
            ) {
              poderOrgao = "10131";
              codFontRecursosMSC = "1860";
              codAEO = "nan";
            }
          }
          // 12 - FMDCA - FUNDO MUNICIPAL DA INFANCIA E ADOLESCENCIA
          if (tipo12.codOrgao === "12") {
            if (
              verificarCod(
                tipo12,
                ["150"],
                ["013210101", "017919901", "019110801"],
                ["000"]
              )
            ) {
              poderOrgao = "10131";
              codFontRecursosMSC = "1899";
              codAEO = "nan";
            }
          }
          // 15 - PROCON - SENADOR CANEDO
          if (tipo12.codOrgao === "15") {
            if (verificarCod(tipo12, ["110"], ["013210101"], ["000"])) {
              poderOrgao = "10131";
              codFontRecursosMSC = "1759";
              codAEO = "nan";
            } else if (
              verificarCod(
                tipo12,
                ["100"],
                ["9999210145", "9999210146", "9999210149"],
                ["000"]
              )
            ) {
              poderOrgao = "10131";
              codFontRecursosMSC = "1860";
              codAEO = "nan";
            } else if (
              verificarCod(
                tipo12,
                ["100"],
                [
                  "9999210150",
                  "9999210151",
                  "9999210152",
                  "9999210153",
                  "9999210154",
                  "9999210162",
                  "9999210163",
                  "9999210165",
                  "9999210166",
                  "9999210145",
                ],
                ["000"]
              )
            ) {
              poderOrgao = "10131";
              codFontRecursosMSC = "1869";
              codAEO = "nan";
            }
          }
          // 18 - SANESC - AGENCIA DE SANEAMENTO DE SENADOR CANEDO
          if (tipo12.codOrgao === "18") {
            if (
              verificarCod(
                tipo12,
                ["110"],
                ["013210101", "019229901"],
                ["000"]
              )
            ) {
              poderOrgao = "10131";
              codFontRecursosMSC = "1500";
              codAEO = "nan";
            } else if (
              verificarCod(tipo12, ["123"], ["013210101"], ["000"])
            ) {
              poderOrgao = "10131";
              codFontRecursosMSC = "1700";
              codAEO = "nan";
            } else if (
              verificarCod(tipo12, ["190"], ["013210101"], ["000"])
            ) {
              poderOrgao = "10131";
              codFontRecursosMSC = "1754";
              codAEO = "nan";
            } else if (
              verificarCod(
                tipo12,
                ["110"],
                ["013210101", "016995011"],
                ["000"]
              )
            ) {
              poderOrgao = "10131";
              codFontRecursosMSC = "1759";
              codAEO = "nan";
            } else if (
              verificarCod(
                tipo12,
                ["100"],
                [
                  "9999000020",
                  "9999000150",
                  "9999000315",
                  "9999000316",
                  "9999000317",
                  "9999000318",
                  "9999000319",
                  "9999000320",
                  "9999000321",
                  "9999000324",
                  "9999000325",
                  "9999000326",
                  "9999000327",
                  "9999000332",
                  "9999000338",
                  "9999000340",
                  "9999000345",
                  "9999000352",
                  "9999000354",
                  "9999000355",
                  "9999180100",
                  "9999210147",
                  "9999210177",
                  "9999210178",
                ],
                ["000"]
              )
            ) {
              poderOrgao = "10131";
              codFontRecursosMSC = "1869";
              codAEO = "nan";
            } else if (
              verificarCod(
                tipo12,
                ["110"],
                ["9999000024", "9999210125"],
                ["000"]
              )
            ) {
              poderOrgao = "10131";
              codFontRecursosMSC = "1869";
              codAEO = "nan";
            }
          }
          // 19 - AMMA - AGENCIA MUNICIPAL DE MEIO AMBIENTE
          if (tipo12.codOrgao === "19") {
            if (
              verificarCod(
                tipo12,
                ["100"],
                [
                  "011210401",
                  "011210402",
                  "013210101",
                  "019110611",
                  "019110612",
                ],
                ["000"]
              )
            ) {
              poderOrgao = "10131";
              codFontRecursosMSC = "1500";
              codAEO = "nan";
            } else if (
              verificarCod(
                tipo12,
                ["151"],
                [
                  "011210401",
                  "011210402",
                  "013210101",
                  "019110611",
                  "019110612",
                  "019110621",
                ],
                ["000"]
              )
            ) {
              poderOrgao = "10131";
              codFontRecursosMSC = "1899";
              codAEO = "nan";
            } else if (
              verificarCod(
                tipo12,
                ["100"],
                [
                  "9999000017",
                  "9999000046",
                  "9999000147",
                  "9999000360",
                  "9999000361",
                  "9999000362",
                  "9999000363",
                  "9999000364",
                  "9999000365",
                  "9999000366",
                  "9999000370",
                  "9999000371",
                  "9999000372",
                  "9999000382",
                  "9999000383",
                  "9999000385",
                  "9999000388",
                  "9999190100",
                  "9999210118",
                  "9999210119",
                  "9999210132",
                  "9999210141",
                  "9999210171",
                  "9999210173",
                  "9999210185",
                ],
                ["000"]
              )
            ) {
              poderOrgao = "10131";
              codFontRecursosMSC = "1869";
              codAEO = "nan";
            }
          }
          // 20 - FME - FUNDO MUNICIPAL DE EDUCAÇÃO, CULTURA
          if (tipo12.codOrgao === "20") {
            if (verificarCod(tipo12, ["101"], ["013210101"], ["000"])) {
              poderOrgao = "10131";
              codFontRecursosMSC = "1500";
              codAEO = "1001";
            } else if (
              verificarCod(tipo12, ["115"], ["019229901"], ["000"])
            ) {
              poderOrgao = "10131";
              codFontRecursosMSC = "1500";
              codAEO = "nan";
            } else if (
              verificarCod(
                tipo12,
                ["115"],
                ["013210101", "017145001"],
                ["049"]
              )
            ) {
              poderOrgao = "10131";
              codFontRecursosMSC = "1550";
              codAEO = "nan";
            } else if (
              verificarCod(
                tipo12,
                ["115"],
                ["013210101", "017145201"],
                ["051"]
              )
            ) {
              poderOrgao = "10131";
              codFontRecursosMSC = "1552";
              codAEO = "nan";
            } else if (
              verificarCod(
                tipo12,
                ["115"],
                ["013210101", "017145301"],
                ["052"]
              )
            ) {
              poderOrgao = "10131";
              codFontRecursosMSC = "1553";
              codAEO = "nan";
            } else if (
              verificarCod(
                tipo12,
                ["115"],
                ["013210101"],
                ["002", "092", "573"]
              )
            ) {
              poderOrgao = "10131";
              codFontRecursosMSC = "1569";
              codAEO = "nan";
            } else if (
              verificarCod(tipo12, ["120"], ["013210101"], ["000"])
            ) {
              poderOrgao = "10131";
              codFontRecursosMSC = "1570";
              codAEO = "nan";
            } else if (
              verificarCod(
                tipo12,
                ["124"],
                ["013210101", "017245101"],
                ["000", "085"]
              )
            ) {
              poderOrgao = "10131";
              codFontRecursosMSC = "1571";
              codAEO = "nan";
            } else if (
              verificarCod(tipo12, ["181"], ["013210101"], ["000"])
            ) {
              poderOrgao = "10131";
              codFontRecursosMSC = "1706";
              codAEO = "nan";
            } else if (
              verificarCod(tipo12, ["137"], ["013210101"], ["000"])
            ) {
              poderOrgao = "10131";
              codFontRecursosMSC = "1710";
              codAEO = "nan";
            } else if (
              verificarCod(tipo12, ["178"], ["013210101"], ["092"])
            ) {
              poderOrgao = "10131";
              codFontRecursosMSC = "1715";
              codAEO = "nan";
            } else if (
              verificarCod(tipo12, ["178"], ["013210101"], ["093"])
            ) {
              poderOrgao = "10131";
              codFontRecursosMSC = "1716";
              codAEO = "nan";
            } else if (
              verificarCod(
                tipo12,
                ["101"],
                [
                  "9999000004",
                  "9999000005",
                  "9999000006",
                  "9999000007",
                  "9999000011",
                  "9999000012",
                  "9999000134",
                  "9999000136",
                  "9999000140",
                  "9999000141",
                  "9999000144",
                  "9999000171",
                  "9999000216",
                  "9999000259",
                  "9999000295",
                  "9999000329",
                  "9999000393",
                  "9999000394",
                  "9999000395",
                  "9999000395",
                  "9999000396",
                  "9999000397",
                  "9999000398",
                  "9999000399",
                  "9999000402",
                  "9999000403",
                  "9999000404",
                  "9999000405",
                  "9999000406",
                  "9999000408",
                  "9999000409",
                  "9999000411",
                  "9999000413",
                  "9999000414",
                ],
                ["000"]
              )
            ) {
              poderOrgao = "10131";
              codFontRecursosMSC = "1869";
              codAEO = "nan";
            }
          }
          // 21 - FUNDI - FUNDO MUNICIPAL DOS DIREITOS DOS IDOSO
          if (tipo12.codOrgao === "21") {
            if (
              verificarCod(
                tipo12,
                ["110"],
                ["013210101", "017919901"],
                ["000"]
              )
            ) {
              poderOrgao = "10131";
              codFontRecursosMSC = "1759";
              codAEO = "nan";
            } else if (
              verificarCod(
                tipo12,
                ["100"],
                ["9999210120", "9999210122", "9999210175", "9999210176"],
                ["000"]
              )
            ) {
              poderOrgao = "10131";
              codFontRecursosMSC = "1869";
              codAEO = "nan";
            }
          }
          // 22 - FUMDEC - FUNDO MUNICIPAL DE PROTEÇÃO E DEFESA
          if (tipo12.codOrgao === "22") {
            if (verificarCod(tipo12, ["100"], ["013210101"], ["000"])) {
              poderOrgao = "10131";
              codFontRecursosMSC = "1500";
              codAEO = "nan";
            } else if (
              verificarCod(
                tipo12,
                ["100"],
                [
                  "9999000008",
                  "9999000023",
                  "9999210134",
                  "9999210142",
                  "9999210143",
                  "9999210155",
                  "9999210156",
                  "9999210157",
                  "9999210158",
                  "9999210159",
                  "9999210160",
                  "9999210161",
                  "9999210164",
                ],
                ["000"]
              )
            ) {
              poderOrgao = "10131";
              codFontRecursosMSC = "1869";
              codAEO = "nan";
            }
          }
          rec[recIndex].content.content[tipo12Index].codFontRecursosMSC =
            codFontRecursosMSC;
          rec[recIndex].content.content[tipo12Index].poderOrgao = poderOrgao;
          rec[recIndex].content.content[tipo12Index].codAEO = codAEO;
        });
      }
    });

    rec.forEach(({content}, i10) => content.content.forEach((e, i12) => {
      if (e.tipoRegistro !== "12") return
      if (!e.codFontRecursosMSC || e.codFontRecursosMSC === "nan") {
        rec[i10].content.content[i12].codFontRecursosMSC = `${e.codFonteRecurso.substring(0, 1)}${codFR.get(e.codFonteRecurso.substring(1))}`
      }
    }))

    /* const lnc = (await db("lnc").select("*")).filter(
     (e) => e.data === data && e.content.codOrgao === orgaoSpecifics.codOrgao
    );
    const recRubricaLNC = {
     // 19 - AMMA - AGENCIA MUNICIPAL DE MEIO AMBIENTE
     19: {
       // Rubrica do TCM, contadeb, contacred
       // MULTAS ADMINISTRATIVAS AMBIENTAIS - PRINCIPAL
       19110611: ["499510000"],
       // TAXA DE CONTROLE E FISCALIZAÇÃO AMBIENTAL - PRINCIPAL
       11210401: ["412111400"],
       // REMUNERAÇÃO DE DEPÓSITOS BANCÁRIOS - PRINCIPAL
       13210101: ["445110000"],
     },
    };
    const using = recRubricaLNC[rec[0]?.content?.codOrgao];
    rec.forEach((rec10, rec10_I) => {
     rec10.content.content.forEach((tipo11, tipo11Index) => {
       if (tipo11?.tipoRegistro !== "11") return;
       const val = using[tipo11?.rubrica];
       const toAply = {
         contaDeb: val ? val : "nan",
       };
       rec[rec10_I].content.content[tipo11Index] = {
         ...rec[rec10_I].content.content[tipo11Index],
         ...toAply,
       };
     });
    });
    */

    await db.batchInsert("rec", rec, 75)

    return res.status(200).json({ message: "REC inserido com sucesso!" });
  } catch (error) {
    console.error(
      "error from InserirRec function from /controllers/controller.rec.js",
      error
    );
    return res.status(500).json({ message: "Internal server error." });
  }
}

async function deleteRec(req, res) {
  const { id } = req.params;
  try {
    await db("rec").delete().where({ id: id });
    return res.status(200).json({ message: "Registro removido com sucesso!" });
  } catch (error) {
    console.error(
      "error from Inserir deleteRec from /controllers/controller.rec.js",
      error
    );
    return res.status(500).json({ message: "Internal server error." });
  }
}

async function getRecById(req, res) {
  const { id } = req.params;
  try {
    const rec = await db("rec").where({ id: id }).first();
    if (!rec) {
      return res.status(404).json({ message: "Registro não encontrado." });
    }
    return res.status(200).json(rec);
  } catch (error) {
    console.error(
      "error from getRecById function from /controllers/controller.rec.js",
      error
    );
    return res.status(500).json({ message: "Internal server error." });
  }
}

async function updateRec(req, res) {
  const { id } = req.params;

  const recData = req.body;
  const body = recData.body;
  const index = recData.index;
  const tipoReg = body[0].value;
  try {
    let insert = {};
    for (const item of body) {
      Object.assign(insert, { [item.type]: item.value });
    }
    Object.assign(insert, { tipoRegistro: tipoReg });
    const toUpdate = await db("rec").select().where({ id: id });

    if (toUpdate.length == 0) {
      return res.status(404).json({ message: "Rec não encontrado." });
    }

    if (insert.tipoRegistro == 10) {
      insert.content = await toUpdate[0].content.content;

      await db("rec").where({ id }).update({ content: insert }).returning("*");
    } else {
      toUpdate[0].content.content[index] = insert;
      await db("rec").where({ id }).update({ content: toUpdate[0].content });
    }
    return res.status(200).json({ message: "got here!" });
  } catch (error) {
    console.error(
      "error from updateRec function from /controllers/controller.rec.js",
      error
    );
    return res.status(500).json({ message: "Internal server error." });
  }
}

export default {
  getAllRec,
  Inserir,
  InserirRec,
  deleteRec,
  getRecById,
  updateRec,
};

function verificarCod(tipo12, codFonteRecurso, rubrica, codAplicacao) {
  return (
    rubrica.includes(tipo12.rubrica) &&
    codFonteRecurso.includes(tipo12.codFonteRecurso.substring(0, 3)) &&
    codAplicacao.includes(tipo12.codFonteRecurso.substring(3, 6))
  );
}

