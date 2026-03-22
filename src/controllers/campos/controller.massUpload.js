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

async function zipUpload(req, res) {
  try {
    const { files } = req.body;

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
        e.content.tipoOrgao === orgao.content.slice(81, 83).trim(),
    );

    if (checkOrg.length !== 0) {
      return res.status(StatusCodes.BAD_REQUEST).json({
        orgao: true,
        message:
          "Este órgão já foi adicionado neste mês. Nenhum dado novo foi incluído.",
      });
    }
    const codOrgao = orgao.content.slice(2, 4).trim();

    try {
      files.forEach((e, i) => {
        files[i] = {
          body: {
            name: e.name,
            text: e.content,
            data: e.name.substring(3, 7),
            codOrgao,
          },
        };
      });

      const falseRes = {
        status: function (code) {
          return {
            json: (data) => {
              return { status: code, ...data };
            },
          };
        },
      };

      try {
        const allVals = [];
        console.log("lnc start");
        console.time("lncTIMER");
        allVals.push(
          await controllerLnc.InserirLnc(
            files.filter((e) => e.body.name.substring(0, 3) === "lnc")[0],
            falseRes,
          ),
        );
        console.timeEnd("lncTIMER");
        console.log("orgao start");
        console.time("orgaoTIMER");
        allVals.push(
          await controllerOrgao.InserirOrgao(
            files.filter((e) => e.body.name.substring(0, 5) === "orgao")[0],
            falseRes,
          ),
        );
        console.timeEnd("orgaoTIMER");
        console.log("ide start");
        console.time("ideTIMER");
        allVals.push(
          await controllerIde.InserirIde(
            files.filter((e) => e.body.name.substring(0, 3) === "ide")[0],
            falseRes,
          ),
        );
        console.timeEnd("ideTIMER");
        console.log("isi start");
        console.time("isiTIMER");
        allVals.push(
          await controllerIsi.InserirIsi(
            files.filter((e) => e.body.name.substring(0, 3) === "isi")[0],
            falseRes,
          ),
        );
        console.timeEnd("isiTIMER");
        console.log("uoc start");
        console.time("uocTIMER");
        allVals.push(
          await controllerUoc.InserirUoc(
            files.filter((e) => e.body.name.substring(0, 3) === "uoc")[0],
            falseRes,
          ),
        );
        console.timeEnd("uocTIMER");
        console.log("rec start");
        console.time("recTIMER");
        allVals.push(
          await controllerRec.InserirRec(
            files.filter((e) => e.body.name.substring(0, 3) === "rec")[0],
            falseRes,
          ),
        );
        console.timeEnd("recTIMER");
        console.log("are start");
        console.time("areTIMER");
        allVals.push(
          await controllerAre.InserirAre(
            files.filter((e) => e.body.name.substring(0, 3) === "are")[0],
            falseRes,
          ),
        );
        console.timeEnd("areTIMER");
        console.log("aoc start");
        console.time("aocTIMER");
        allVals.push(
          await controllerAoc.InserirAoc(
            files.filter((e) => e.body.name.substring(0, 3) === "aoc")[0],
            falseRes,
          ),
        );
        console.timeEnd("aocTIMER");
        console.log("cob start");
        console.time("cobTIMER");
        allVals.push(
          await controllerCob.InserirCob(
            files.filter((e) => e.body.name.substring(0, 3) === "cob")[0],
            falseRes,
          ),
        );
        console.timeEnd("cobTIMER");
        console.log("emp start");
        console.time("empTIMER");
        allVals.push(
          await controllerEmp.InserirEmp(
            files.filter((e) => e.body.name.substring(0, 3) === "emp")[0],
            falseRes,
          ),
        );
        console.timeEnd("empTIMER");
        console.log("anl start");
        console.time("anlTIMER");
        allVals.push(
          await controllerAnl.InserirAnl(
            files.filter((e) => e.body.name.substring(0, 3) === "anl")[0],
            falseRes,
          ),
        );
        console.timeEnd("anlTIMER");
        console.log("eoc start");
        console.time("eocTIMER");
        allVals.push(
          await controllerEoc.InserirEoc(
            files.filter((e) => e.body.name.substring(0, 3) === "eoc")[0],
            falseRes,
          ),
        );
        console.timeEnd("eocTIMER");
        console.log("lqd start");
        console.time("lqdTIMER");
        allVals.push(
          await controllerLqd.InserirLqd(
            files.filter((e) => e.body.name.substring(0, 3) === "lqd")[0],
            falseRes,
          ),
        );
        console.timeEnd("lqdTIMER");
        console.log("alq start");
        console.time("alqTIMER");
        allVals.push(
          await controllerAlq.InserirAlq(
            files.filter((e) => e.body.name.substring(0, 3) === "alq")[0],
            falseRes,
          ),
        );
        console.timeEnd("alqTIMER");
        console.log("ext start");
        console.time("extTIMER");
        allVals.push(
          await controllerExt.InserirExt(
            files.filter((e) => e.body.name.substring(0, 3) === "ext")[0],
            falseRes,
          ),
        );
        console.timeEnd("extTIMER");
        console.log("aex start");
        console.time("aexTIMER");
        allVals.push(
          await controllerAex.InserirAex(
            files.filter((e) => e.body.name.substring(0, 3) === "aex")[0],
            falseRes,
          ),
        );
        console.timeEnd("aexTIMER");
        console.log("ops start");
        console.time("opsTIMER");
        allVals.push(
          await controllerOps.InserirOps(
            files.filter((e) => e.body.name.substring(0, 3) === "ops")[0],
            falseRes,
          ),
        );
        console.timeEnd("opsTIMER");
        console.log("aop start");
        console.time("aopTIMER");
        allVals.push(
          await controllerAop.InserirAop(
            files.filter((e) => e.body.name.substring(0, 3) === "aop")[0],
            falseRes,
          ),
        );
        console.timeEnd("aopTIMER");
        console.log("rsp start");
        console.time("rspTIMER");
        allVals.push(
          await controllerRsp.InserirRsp(
            files.filter((e) => e.body.name.substring(0, 3) === "rsp")[0],
            falseRes,
          ),
        );
        console.timeEnd("rspTIMER");
        console.log("con start");
        console.time("conTIMER");
        allVals.push(
          await controllerCon.InserirCon(
            files.filter((e) => e.body.name.substring(0, 3) === "con")[0],
            falseRes,
          ),
        );
        console.timeEnd("conTIMER");
        console.log("ctb start");
        console.time("ctbTIMER");
        allVals.push(
          await controllerCtb.InserirCtb(
            files.filter((e) => e.body.name.substring(0, 3) === "ctb")[0],
            falseRes,
          ),
        );
        console.timeEnd("ctbTIMER");
        console.log("trb start");
        console.time("trbTIMER");
        allVals.push(
          await controllerTrb.InserirTrb(
            files.filter((e) => e.body.name.substring(0, 3) === "trb")[0],
            falseRes,
          ),
        );
        console.timeEnd("trbTIMER");
        console.log("cvc start");
        console.time("cvcTIMER");
        allVals.push(
          await controllerCvc.InserirCvc(
            files.filter((e) => e.body.name.substring(0, 3) === "cvc")[0],
            falseRes,
          ),
        );
        console.timeEnd("cvcTIMER");
        console.log("ecl start");
        console.time("eclTIMER");
        allVals.push(
          await controllerEcl.InserirEcl(
            files.filter((e) => e.body.name.substring(0, 3) === "ecl")[0],
            falseRes,
          ),
        );
        console.timeEnd("eclTIMER");
        console.log("tfr start");
        console.time("tfrTIMER");
        allVals.push(
          await controllerTfr.InserirTfr(
            files.filter((e) => e.body.name.substring(0, 3) === "tfr")[0],
            falseRes,
          ),
        );
        console.timeEnd("tfrTIMER");
        console.log("dfr start");
        console.time("dfrTIMER");
        allVals.push(
          await controllerDfr.InserirDfr(
            files.filter((e) => e.body.name.substring(0, 3) === "dfr")[0],
            falseRes,
          ),
        );
        console.timeEnd("dfrTIMER");
        console.log("dic start");
        console.time("dicTIMER");
        allVals.push(
          await controllerDic.InserirDic(
            files.filter((e) => e.body.name.substring(0, 3) === "dic")[0],
            falseRes,
          ),
        );
        console.timeEnd("dicTIMER");
        console.log("dcl start");
        console.time("dclTIMER");
        allVals.push(
          await controllerDcl.InserirDcl(
            files.filter((e) => e.body.name.substring(0, 3) === "dcl")[0],
            falseRes,
          ),
        );
        console.timeEnd("dclTIMER");
        console.log("par start");
        console.time("parTIMER");
        allVals.push(
          await controllerPar.InserirPar(
            files.filter((e) => e.body.name.substring(0, 3) === "par")[0],
            falseRes,
          ),
        );
        console.timeEnd("parTIMER");
        console.log("pct start");
        console.time("pctTIMER");
        allVals.push(
          await controllerPct.InserirPct(
            files.filter((e) => e.body.name.substring(0, 3) === "pct")[0],
            falseRes,
          ),
        );
        console.timeEnd("pctTIMER");
        console.log("dmr start");
        console.time("dmrTIMER");
        allVals.push(
          await controllerDmr.InserirDmr(
            files.filter((e) => e.body.name.substring(0, 3) === "dmr")[0],
            falseRes,
          ),
        );
        console.timeEnd("dmrTIMER");
        console.log("abl start");
        console.time("ablTIMER");
        allVals.push(
          await controllerAbl.InserirAbl(
            files.filter((e) => e.body.name.substring(0, 3) === "abl")[0],
            falseRes,
          ),
        );
        console.timeEnd("ablTIMER");
        console.log("rpl start");
        console.time("rplTIMER");
        allVals.push(
          await controllerRpl.InserirRpl(
            files.filter((e) => e.body.name.substring(0, 3) === "rpl")[0],
            falseRes,
          ),
        );
        console.timeEnd("rplTIMER");
        console.log("hbl start");
        console.time("hblTIMER");
        allVals.push(
          await controllerHbl.InserirHbl(
            files.filter((e) => e.body.name.substring(0, 3) === "hbl")[0],
            falseRes,
          ),
        );
        console.timeEnd("hblTIMER");
        console.log("jgl start");
        console.time("jglTIMER");
        allVals.push(
          await controllerJgl.InserirJgl(
            files.filter((e) => e.body.name.substring(0, 3) === "jgl")[0],
            falseRes,
          ),
        );
        console.timeEnd("jglTIMER");
        console.log("hml start");
        console.time("hmlTIMER");
        allVals.push(
          await controllerHml.InserirHml(
            files.filter((e) => e.body.name.substring(0, 3) === "hml")[0],
            falseRes,
          ),
        );
        console.timeEnd("hmlTIMER");
        console.log("prl start");
        console.time("prlTIMER");
        allVals.push(
          await controllerPrl.InserirPrl(
            files.filter((e) => e.body.name.substring(0, 3) === "prl")[0],
            falseRes,
          ),
        );
        console.timeEnd("prlTIMER");
        console.log("arp start");
        console.time("arpTIMER");
        allVals.push(
          await controllerArp.InserirArp(
            files.filter((e) => e.body.name.substring(0, 3) === "arp")[0],
            falseRes,
          ),
        );
        console.timeEnd("arpTIMER");
        console.log("dsi start");
        console.time("dsiTIMER");
        allVals.push(
          await controllerDsi.InserirDsi(
            files.filter((e) => e.body.name.substring(0, 3) === "dsi")[0],
            falseRes,
          ),
        );
        console.timeEnd("dsiTIMER");

        console.log("lnc valores adicionais start");
        console.time("lncvalTIMER");
        const checkLnc = allVals[0].lnc;
        const lncVals = files.find(
          (e) => e.body.name.substring(0, 3) === "lnc",
        ).body;
        const lncRes = await controllerLnc.addValtoLnc(
          checkLnc.flat(),
          codOrgao,
          lncVals.data,
        );
        console.timeEnd("lncvalTIMER");
        if (!lncRes)
          res.status(500).json({ message: "Erro ao atualizar dados do lnc" });

        // checkForErrors(allVals)
        const errorInfo = [];
        allVals.forEach((e) => {
          if (e && e.status && e.status !== StatusCodes.OK) {
            errorInfo.push(e);
          }
        });

        if (errorInfo.length > 0) {
          await Promise.all([
            db("orgao")
              .where(
                db.raw("content->>'codOrgao' = ?", [orgaoSpecifics.codOrgao]),
              )
              .del(),
            db("ide")
              .where(
                db.raw("content->>'codOrgao' = ?", [orgaoSpecifics.codOrgao]),
              )
              .del(),
            db("isi")
              .where(
                db.raw("content->>'codOrgao' = ?", [orgaoSpecifics.codOrgao]),
              )
              .del(),
            db("uoc")
              .where(
                db.raw("content->>'codOrgao' = ?", [orgaoSpecifics.codOrgao]),
              )
              .del(),
            db("rec")
              .where(
                db.raw("content->>'codOrgao' = ?", [orgaoSpecifics.codOrgao]),
              )
              .del(),
            db("are")
              .where(
                db.raw("content->>'codOrgao' = ?", [orgaoSpecifics.codOrgao]),
              )
              .del(),
            db("aoc")
              .where(
                db.raw("content->>'codOrgao' = ?", [orgaoSpecifics.codOrgao]),
              )
              .del(),
            db("cob")
              .where(
                db.raw("content->>'codOrgao' = ?", [orgaoSpecifics.codOrgao]),
              )
              .del(),
            db("emp")
              .where(
                db.raw("content->>'codOrgao' = ?", [orgaoSpecifics.codOrgao]),
              )
              .del(),
            db("anl")
              .where(
                db.raw("content->>'codOrgao' = ?", [orgaoSpecifics.codOrgao]),
              )
              .del(),
            db("eoc")
              .where(
                db.raw("content->>'codOrgao' = ?", [orgaoSpecifics.codOrgao]),
              )
              .del(),
            db("lqd")
              .where(
                db.raw("content->>'codOrgao' = ?", [orgaoSpecifics.codOrgao]),
              )
              .del(),
            db("alq")
              .where(
                db.raw("content->>'codOrgao' = ?", [orgaoSpecifics.codOrgao]),
              )
              .del(),
            db("ext")
              .where(
                db.raw("content->>'codOrgao' = ?", [orgaoSpecifics.codOrgao]),
              )
              .del(),
            db("aex")
              .where(
                db.raw("content->>'codOrgao' = ?", [orgaoSpecifics.codOrgao]),
              )
              .del(),
            db("ops")
              .where(
                db.raw("content->>'codOrgao' = ?", [orgaoSpecifics.codOrgao]),
              )
              .del(),
            db("aop")
              .where(
                db.raw("content->>'codOrgao' = ?", [orgaoSpecifics.codOrgao]),
              )
              .del(),
            db("rsp")
              .where(
                db.raw("content->>'codOrgao' = ?", [orgaoSpecifics.codOrgao]),
              )
              .del(),
            db("con")
              .where(
                db.raw("content->>'codOrgao' = ?", [orgaoSpecifics.codOrgao]),
              )
              .del(),
            db("ctb")
              .where(
                db.raw("content->>'codOrgao' = ?", [orgaoSpecifics.codOrgao]),
              )
              .del(),
            db("trb")
              .where(
                db.raw("content->>'codOrgao' = ?", [orgaoSpecifics.codOrgao]),
              )
              .del(),
            db("cvc")
              .where(
                db.raw("content->>'codOrgao' = ?", [orgaoSpecifics.codOrgao]),
              )
              .del(),
            db("ecl")
              .where(
                db.raw("content->>'codOrgao' = ?", [orgaoSpecifics.codOrgao]),
              )
              .del(),
            db("tfr")
              .where(
                db.raw("content->>'codOrgao' = ?", [orgaoSpecifics.codOrgao]),
              )
              .del(),
            db("dfr")
              .where(
                db.raw("content->>'codOrgao' = ?", [orgaoSpecifics.codOrgao]),
              )
              .del(),
            db("dic")
              .where(
                db.raw("content->>'codOrgao' = ?", [orgaoSpecifics.codOrgao]),
              )
              .del(),
            db("dcl")
              .where(
                db.raw("content->>'codOrgao' = ?", [orgaoSpecifics.codOrgao]),
              )
              .del(),
            db("par")
              .where(
                db.raw("content->>'codOrgao' = ?", [orgaoSpecifics.codOrgao]),
              )
              .del(),
            db("pct")
              .where(
                db.raw("content->>'codOrgao' = ?", [orgaoSpecifics.codOrgao]),
              )
              .del(),
            db("lnc")
              .where(
                db.raw("content->>'codOrgao' = ?", [orgaoSpecifics.codOrgao]),
              )
              .del(),
            db("dmr")
              .where(
                db.raw("content->>'codOrgao' = ?", [orgaoSpecifics.codOrgao]),
              )
              .del(),
            db("abl")
              .where(
                db.raw("content->>'codOrgao' = ?", [orgaoSpecifics.codOrgao]),
              )
              .del(),
            db("rpl")
              .where(
                db.raw("content->>'codOrgao' = ?", [orgaoSpecifics.codOrgao]),
              )
              .del(),
            db("hbl")
              .where(
                db.raw("content->>'codOrgao' = ?", [orgaoSpecifics.codOrgao]),
              )
              .del(),
            db("jgl")
              .where(
                db.raw("content->>'codOrgao' = ?", [orgaoSpecifics.codOrgao]),
              )
              .del(),
            db("hml")
              .where(
                db.raw("content->>'codOrgao' = ?", [orgaoSpecifics.codOrgao]),
              )
              .del(),
            db("prl")
              .where(
                db.raw("content->>'codOrgao' = ?", [orgaoSpecifics.codOrgao]),
              )
              .del(),
            db("arp")
              .where(
                db.raw("content->>'codOrgao' = ?", [orgaoSpecifics.codOrgao]),
              )
              .del(),
            db("dsi")
              .where(
                db.raw("content->>'codOrgao' = ?", [orgaoSpecifics.codOrgao]),
              )
              .del(),
          ]);
          return res.status(StatusCodes.BAD_REQUEST).json({
            message: `Erros: ${errorInfo.map((e) => e.message).join(", ")}`,
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
      error,
    );
    return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json();
  }
}

export default { zipUpload };
