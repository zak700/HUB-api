import controllerOrgao from "./controller.orgao.js";
import controllerIde from "./controller.ide.js";
import controllerIsi from "./controller.isi.js";
import controllerUoc from "./controller.uoc.js";
import controllerRec from "./controller.rec.js";
import controllerAre from "./controller.are.js";
import controllerAoc from "./controller.aoc.js";
import controllerCob from "./controller.cob.js";
import controllerEmp from "./controller.emp.js";
import controllerAnl from "./controller.anl.js";
import controllerEoc from "./controller.eoc.js";
import controllerLqd from "./controller.lqd.js";
import controllerAlq from "./controller.alq.js";
import controllerExt from "./controller.ext.js";
import controllerAex from "./controller.aex.js";
import controllerOps from "./controller.ops.js";
import controllerAop from "./controller.aop.js";
import controllerRsp from "./controller.rsp.js";
import controllerCon from "./controller.con.js";
import controllerCtb from "./controller.ctb.js";
import controllerTrb from "./controller.trb.js";
import controllerCvc from "./controller.cvc.js";
import controllerEcl from "./controller.ecl.js";
import controllerTfr from "./controller.tfr.js";
import controllerDfr from "./controller.dfr.js";
import controllerDic from "./controller.dic.js";
import controllerDcl from "./controller.dcl.js";
import controllerPar from "./controller.par.js";
import controllerPct from "./controller.pct.js";
import controllerLnc from "./controller.lnc.js";
import controllerDmr from "./controller.dmr.js";
import controllerAbl from "./controller.abl.js";
import controllerRpl from "./controller.rpl.js";
import controllerHbl from "./controller.hbl.js";
import controllerJgl from "./controller.jgl.js";
import controllerHml from "./controller.hml.js";
import controllerPrl from "./controller.prl.js";
import controllerArp from "./controller.arp.js";
import controllerDsi from "./controller.dsi.js";

// -----------------------------------------------
import { db } from "../../database/postgres.js";
import { StatusCodes } from "http-status-codes";

import AdmZip from "adm-zip";
import { PDFParse } from "pdf-parse";

async function zipUpload(req, res) {
  try {
    const { receitas, despesas, zip } = req.files;
    const unzip = new AdmZip(zip[0].buffer)
    const entries = unzip.getEntries();

    const files = []

    const pdfs = {};
    const organizedInfo = {
      receitas: { columns: [], },
      despesas: { columns: [], }
    };

    entries.forEach(entry => {
      if (!entry.isDirectory) {
        const fileName = entry.entryName;
        const content = entry.getData().toString("utf8"); // or keep as Buffer

        files.push({
          name: fileName,
          content
        })
      }
    });

    const receitas_Uint8Array = new Uint8Array(
      receitas[0].buffer,
      receitas[0].byteOffset,
      receitas[0].byteLength
    );
    const despesas_Uint8Array = new Uint8Array(
      despesas[0].buffer,
      despesas[0].byteOffset,
      despesas[0].byteLength
    );


    const receitasParser = new PDFParse(receitas_Uint8Array);
    const despesasParser = new PDFParse(despesas_Uint8Array);
    pdfs.receitas = (await receitasParser.getText());
    pdfs.despesas = (await despesasParser.getText());
    // Organize PDF info
    pdfs.receitas.text.split("\n").flatMap((e) => e.trim()).forEach((line) => {
      let helper = [""]
      const parts = line.split("\t").flat().filter((e, i) => {
        if (e === "") return false;
        if (i === 0) {
          helper = [e, ""]
          return true;
        }
        if (helper.includes(e)) {
          return false;
        } else {
          helper.push(e);
          return true;
        }
      });

      console.log(parts)

    })

    files.forEach((e, i) => {
      files[i].name = e.name.toLowerCase();
    });


    const orgaoSpecifics = {};

    const [orgao] = files.filter((e) => e.name.substring(0, 5) == "orgao");

    orgaoSpecifics.codOrgao = orgao.content.substring(2, 4);
    orgaoSpecifics.tipoOrgao = orgao.content.substring(81, 83);

    const checkOrg = (await db("orgao").select("*")).filter(
      (e) =>
        e.content.dtFinal === orgao.content.slice(23, 31).trim() &&
        e.content.dtInicio === orgao.content.slice(15, 23).trim() &&
        e.content.codOrgao === orgao.content.slice(2, 4).trim() &&
        e.content.descOrgao === orgao.content.slice(31, 81).trim() &&
        e.content.tipoOrgao === orgao.content.slice(81, 83).trim()
    );

    if (checkOrg.length !== 0) {
      return res.status(StatusCodes.BAD_REQUEST).json({
        orgao: true,
        message:
          "Este órgão já foi adicionado neste mês. Nenhum dado novo foi incluído.",
      });
    }

    try {
      files.forEach((e, i) => {
        files[i] = {
          body: {
            name: e.name,
            text: e.content,
            data: e.name.substring(3, 7),
            codOrgao: orgao.content.slice(2, 4).trim(),
          },
        };
      });



      const falseRes = {
        status: function (code) {
          return {
            json: (data) => {
              return { status: code, ...data };
            }
          };
        }
      };

      try {
        const allVals = await Promise.all([
          await controllerOrgao.InserirOrgao(
            files.filter((e) => e.body.name.substring(0, 5) === "orgao")[0],
            falseRes
          ),
          await controllerIde.InserirIde(
            files.filter((e) => e.body.name.substring(0, 3) === "ide")[0],
            falseRes
          ),
          await controllerIsi.InserirIsi(
            files.filter((e) => e.body.name.substring(0, 3) === "isi")[0],
            falseRes
          ),
          await controllerUoc.InserirUoc(
            files.filter((e) => e.body.name.substring(0, 3) === "uoc")[0],
            falseRes
          ),
          await controllerRec.InserirRec(
            files.filter((e) => e.body.name.substring(0, 3) === "rec")[0],
            falseRes
          ),
          await controllerAre.InserirAre(
            files.filter((e) => e.body.name.substring(0, 3) === "are")[0],
            falseRes
          ),
          await controllerAoc.InserirAoc(
            files.filter((e) => e.body.name.substring(0, 3) === "aoc")[0],
            falseRes
          ),
          await controllerCob.InserirCob(
            files.filter((e) => e.body.name.substring(0, 3) === "cob")[0],
            falseRes
          ),
          await controllerLnc.InserirLnc(
            files.filter((e) => e.body.name.substring(0, 3) === "lnc")[0],
            falseRes
          ),
          await controllerEmp.InserirEmp(
            files.filter((e) => e.body.name.substring(0, 3) === "emp")[0],
            falseRes
          ),
          await controllerAnl.InserirAnl(
            files.filter((e) => e.body.name.substring(0, 3) === "anl")[0],
            falseRes
          ),
          await controllerEoc.InserirEoc(
            files.filter((e) => e.body.name.substring(0, 3) === "eoc")[0],
            falseRes
          ),
          await controllerLqd.InserirLqd(
            files.filter((e) => e.body.name.substring(0, 3) === "lqd")[0],
            falseRes
          ),
          await controllerAlq.InserirAlq(
            files.filter((e) => e.body.name.substring(0, 3) === "alq")[0],
            falseRes
          ),
          await controllerExt.InserirExt(
            files.filter((e) => e.body.name.substring(0, 3) === "ext")[0],
            falseRes
          ),
          await controllerAex.InserirAex(
            files.filter((e) => e.body.name.substring(0, 3) === "aex")[0],
            falseRes
          ),
          await controllerOps.InserirOps(
            files.filter((e) => e.body.name.substring(0, 3) === "ops")[0],
            falseRes
          ),
          await controllerAop.InserirAop(
            files.filter((e) => e.body.name.substring(0, 3) === "aop")[0],
            falseRes
          ),
          await controllerRsp.InserirRsp(
            files.filter((e) => e.body.name.substring(0, 3) === "rsp")[0],
            falseRes
          ),
          await controllerCon.InserirCon(
            files.filter((e) => e.body.name.substring(0, 3) === "con")[0],
            falseRes
          ),
          await controllerCtb.InserirCtb(
            files.filter((e) => e.body.name.substring(0, 3) === "ctb")[0],
            falseRes
          ),
          await controllerTrb.InserirTrb(
            files.filter((e) => e.body.name.substring(0, 3) === "trb")[0],
            falseRes
          ),
          await controllerCvc.InserirCvc(
            files.filter((e) => e.body.name.substring(0, 3) === "cvc")[0],
            falseRes
          ),
          await controllerEcl.InserirEcl(
            files.filter((e) => e.body.name.substring(0, 3) === "ecl")[0],
            falseRes
          ),
          await controllerTfr.InserirTfr(
            files.filter((e) => e.body.name.substring(0, 3) === "tfr")[0],
            falseRes
          ),
          await controllerDfr.InserirDfr(
            files.filter((e) => e.body.name.substring(0, 3) === "dfr")[0],
            falseRes
          ),
          await controllerDic.InserirDic(
            files.filter((e) => e.body.name.substring(0, 3) === "dic")[0],
            falseRes
          ),
          await controllerDcl.InserirDcl(
            files.filter((e) => e.body.name.substring(0, 3) === "dcl")[0],
            falseRes
          ),
          await controllerPar.InserirPar(
            files.filter((e) => e.body.name.substring(0, 3) === "par")[0],
            falseRes
          ),
          await controllerPct.InserirPct(
            files.filter((e) => e.body.name.substring(0, 3) === "pct")[0],
            falseRes
          ),
          await controllerDmr.InserirDmr(
            files.filter((e) => e.body.name.substring(0, 3) === "dmr")[0],
            falseRes
          ),
          await controllerAbl.InserirAbl(
            files.filter((e) => e.body.name.substring(0, 3) === "abl")[0],
            falseRes
          ),
          await controllerRpl.InserirRpl(
            files.filter((e) => e.body.name.substring(0, 3) === "rpl")[0],
            falseRes
          ),
          await controllerHbl.InserirHbl(
            files.filter((e) => e.body.name.substring(0, 3) === "hbl")[0],
            falseRes
          ),
          await controllerJgl.InserirJgl(
            files.filter((e) => e.body.name.substring(0, 3) === "jgl")[0],
            falseRes
          ),
          await controllerHml.InserirHml(
            files.filter((e) => e.body.name.substring(0, 3) === "hml")[0],
            falseRes
          ),
          await controllerPrl.InserirPrl(
            files.filter((e) => e.body.name.substring(0, 3) === "prl")[0],
            falseRes
          ),
          await controllerArp.InserirArp(
            files.filter((e) => e.body.name.substring(0, 3) === "arp")[0],
            falseRes
          ),
          await controllerDsi.InserirDsi(
            files.filter((e) => e.body.name.substring(0, 3) === "dsi")[0],
            falseRes
          ),
        ]);

        // checkForErrors(allVals)
        const errorInfo = []
        allVals.forEach((e) => {
          if (e && e.status && e.status !== StatusCodes.OK) {
            errorInfo.push(e);
          }
        });

        if (errorInfo.length > 0) {
          await Promise.all([
            db("orgao").where(db.raw("content->>'codOrgao' = ?", [orgaoSpecifics.codOrgao])).del(),
            db("ide").where(db.raw("content->>'codOrgao' = ?", [orgaoSpecifics.codOrgao])).del(),
            db("isi").where(db.raw("content->>'codOrgao' = ?", [orgaoSpecifics.codOrgao])).del(),
            db("uoc").where(db.raw("content->>'codOrgao' = ?", [orgaoSpecifics.codOrgao])).del(),
            db("rec").where(db.raw("content->>'codOrgao' = ?", [orgaoSpecifics.codOrgao])).del(),
            db("are").where(db.raw("content->>'codOrgao' = ?", [orgaoSpecifics.codOrgao])).del(),
            db("aoc").where(db.raw("content->>'codOrgao' = ?", [orgaoSpecifics.codOrgao])).del(),
            db("cob").where(db.raw("content->>'codOrgao' = ?", [orgaoSpecifics.codOrgao])).del(),
            db("emp").where(db.raw("content->>'codOrgao' = ?", [orgaoSpecifics.codOrgao])).del(),
            db("anl").where(db.raw("content->>'codOrgao' = ?", [orgaoSpecifics.codOrgao])).del(),
            db("eoc").where(db.raw("content->>'codOrgao' = ?", [orgaoSpecifics.codOrgao])).del(),
            db("lqd").where(db.raw("content->>'codOrgao' = ?", [orgaoSpecifics.codOrgao])).del(),
            db("alq").where(db.raw("content->>'codOrgao' = ?", [orgaoSpecifics.codOrgao])).del(),
            db("ext").where(db.raw("content->>'codOrgao' = ?", [orgaoSpecifics.codOrgao])).del(),
            db("aex").where(db.raw("content->>'codOrgao' = ?", [orgaoSpecifics.codOrgao])).del(),
            db("ops").where(db.raw("content->>'codOrgao' = ?", [orgaoSpecifics.codOrgao])).del(),
            db("aop").where(db.raw("content->>'codOrgao' = ?", [orgaoSpecifics.codOrgao])).del(),
            db("rsp").where(db.raw("content->>'codOrgao' = ?", [orgaoSpecifics.codOrgao])).del(),
            db("con").where(db.raw("content->>'codOrgao' = ?", [orgaoSpecifics.codOrgao])).del(),
            db("ctb").where(db.raw("content->>'codOrgao' = ?", [orgaoSpecifics.codOrgao])).del(),
            db("trb").where(db.raw("content->>'codOrgao' = ?", [orgaoSpecifics.codOrgao])).del(),
            db("cvc").where(db.raw("content->>'codOrgao' = ?", [orgaoSpecifics.codOrgao])).del(),
            db("ecl").where(db.raw("content->>'codOrgao' = ?", [orgaoSpecifics.codOrgao])).del(),
            db("tfr").where(db.raw("content->>'codOrgao' = ?", [orgaoSpecifics.codOrgao])).del(),
            db("dfr").where(db.raw("content->>'codOrgao' = ?", [orgaoSpecifics.codOrgao])).del(),
            db("dic").where(db.raw("content->>'codOrgao' = ?", [orgaoSpecifics.codOrgao])).del(),
            db("dcl").where(db.raw("content->>'codOrgao' = ?", [orgaoSpecifics.codOrgao])).del(),
            db("par").where(db.raw("content->>'codOrgao' = ?", [orgaoSpecifics.codOrgao])).del(),
            db("pct").where(db.raw("content->>'codOrgao' = ?", [orgaoSpecifics.codOrgao])).del(),
            db("lnc").where(db.raw("content->>'codOrgao' = ?", [orgaoSpecifics.codOrgao])).del(),
            db("dmr").where(db.raw("content->>'codOrgao' = ?", [orgaoSpecifics.codOrgao])).del(),
            db("abl").where(db.raw("content->>'codOrgao' = ?", [orgaoSpecifics.codOrgao])).del(),
            db("rpl").where(db.raw("content->>'codOrgao' = ?", [orgaoSpecifics.codOrgao])).del(),
            db("hbl").where(db.raw("content->>'codOrgao' = ?", [orgaoSpecifics.codOrgao])).del(),
            db("jgl").where(db.raw("content->>'codOrgao' = ?", [orgaoSpecifics.codOrgao])).del(),
            db("hml").where(db.raw("content->>'codOrgao' = ?", [orgaoSpecifics.codOrgao])).del(),
            db("prl").where(db.raw("content->>'codOrgao' = ?", [orgaoSpecifics.codOrgao])).del(),
            db("arp").where(db.raw("content->>'codOrgao' = ?", [orgaoSpecifics.codOrgao])).del(),
            db("dsi").where(db.raw("content->>'codOrgao' = ?", [orgaoSpecifics.codOrgao])).del(),
          ])
          return res.status(StatusCodes.BAD_REQUEST).json({
            message: `Erros: ${errorInfo.map(e => e.message).join(", ")}`,
            errors: errorInfo,
          });
        }

      } catch (error) {
        console.error("Erro ao inserir dados", error);
        throw error;
      }

      return res
        .status(StatusCodes.OK)
        .json({ message: "ORGAOOO INNNSERRRIIIGOOOOOO" });
    } catch (error) {
      return res
        .status(StatusCodes.INTERNAL_SERVER_ERROR)
        .json({ message: "erro ao inserir data" });
    }
  } catch (error) {
    console.error(
      "error from zipUpload function from /controllers/controller.massUpload.js",
      error
    );
    return res
      .status(StatusCodes.INTERNAL_SERVER_ERROR)
      .json({ message: "Internal server error." });
  }
}

export default { zipUpload };

