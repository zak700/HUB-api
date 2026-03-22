import natureza from "../../helpers/natureza.js"
import layoutMSC from "./layoutMSC.js"
import { StatusCodes } from "http-status-codes"
import { db } from "../../database/postgres.js"

export default async function balanceteContabil(req, res) {
  const { lancamento, codOrgao, date } = req.params
  try {
    if (lancamento === "N") {

      const lnc = (await db("lnc").select("*")).filter(
        (lnc) => lnc.content.codOrgao === codOrgao.padStart(2, "0")
      )

      const separatedLnc = {}

      lnc.forEach((e) => {
        if (parseInt(natureza.dataToYear(e.data)) > parseInt(natureza.dataToYear(date))) return
        else if (
          parseInt(natureza.dataToYear(e.data)) === parseInt(natureza.dataToYear(date)) &&
          parseInt(e.data.substring(0, 2)) > parseInt(date.substring(0, 2))
        ) return
        const tipo11 = e.content.content.filter((e) => e.tipoRegistro === "11")
        if (e.data in separatedLnc) {
          separatedLnc[e.data].push(...tipo11)
        } else {
          separatedLnc[e.data] = [...tipo11]
        }
      })

      const correctedData = Object.keys(separatedLnc).toSorted((a, b) => {
        const aMonth = a.substring(0, 2)
        const bMonth = b.substring(0, 2)
        const aYear = natureza.dataToYear(a)
        const bYear = natureza.dataToYear(b)
        if (aYear !== bYear) {
          return parseInt(aYear) - parseInt(bYear)
        } else {
          return parseInt(aMonth) - parseInt(bMonth)
        }
      })

      const output = {}

      correctedData.forEach((data, index) => {
        if (index !== correctedData.length - 1) {
          separatedLnc[data].forEach((tipo11) => {
            const codConta = tipo11.codConta.substring(0, 9)
            if (!(codConta in output)) {
              output[codConta] = { anterior: "0,00", C: "0,00", D: "0,00" }
            }
            output[codConta].anterior = tipo11.natLancamento === "D"
              ? natureza.sumRS([output[codConta].anterior, tipo11.valor])[0]
              : natureza.subRS([output[codConta].anterior, tipo11.valor])[0];
          })
          return
        }
        separatedLnc[data].forEach((tipo11) => {
          const codConta = tipo11.codConta.substring(0, 9)
          if (!(codConta in output)) {
            output[codConta] = { anterior: "0,00", C: "0,00", D: "0,00" }
          }
          if (tipo11.natLancamento === "D") {
            output[codConta].D = natureza.sumRS([output[codConta].D, tipo11.valor])[0]
          } else {
            output[codConta].C = natureza.sumRS([output[codConta].C, tipo11.valor])[0]
          }

        })
      })

      Object.keys(output).forEach((e) => {
        output[e].final = natureza.sumRS([natureza.subRS([output[e].anterior, output[e].C])[0], output[e].D])[0]
      })

      const contasSinteticas = {}

      Object.keys(layoutMSC).forEach((key) => {
        if (layoutMSC[key]?.tipoConta?.toUpperCase() !== "S") return;
        const correctedName = key.replace(/0*$/, "")
        contasSinteticas[correctedName] = { anterior: "0,00", C: "0,00", D: "0,00", show: false }
      })

      Object.keys(contasSinteticas).forEach((key) => {
        const filteredOutputKeys = Object.keys(output).filter((outputKey) => outputKey.substring(0, key.length) === key)

        if (filteredOutputKeys.length === 0) return

        contasSinteticas[key].show = true

        filteredOutputKeys.forEach((outputKey) => {
          const using = output[outputKey]

          contasSinteticas[key].anterior = natureza.sumRS([contasSinteticas[key].anterior, using.anterior])[0]
          contasSinteticas[key].C = natureza.sumRS([contasSinteticas[key].C, using.C])[0]
          contasSinteticas[key].D = natureza.sumRS([contasSinteticas[key].D, using.D])[0]
        })

        // -=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-

        if (contasSinteticas[key].show === false) {
          delete contasSinteticas[key]
          return
        }
        delete contasSinteticas[key].show
        contasSinteticas[key].final = natureza.sumRS([
          natureza.subRS([contasSinteticas[key].anterior, contasSinteticas[key].C])[0],
          contasSinteticas[key].D
        ])[0]
      })

      const merge = {}

      Object.keys({ ...output, ...contasSinteticas }).forEach((key) => {
        let nilChar = false
        const newKeyArr = []
        key.split("").reverse().forEach((char) => {
          if (char !== "0") nilChar = true
          if (nilChar) newKeyArr.push(char);
        })
        merge[newKeyArr.reverse().join("")] = { ...output, ...contasSinteticas }[key]
      })

      const response = []

      Object.keys(merge).map((key) => {
        let nilChar = false
        const newKeyArr = []
        key.split("").reverse().forEach((char) => {
          if (char !== "0") nilChar = true
          if (nilChar) newKeyArr.push(char);
        })
        return newKeyArr.reverse().join("")
      }).toSorted((a, b) => {
        const minLen = Math.min(a.length, b.length);
        for (let i = 0; i < minLen; i++) {
          const aDigit = parseInt(a[i]);
          const bDigit = parseInt(b[i]);
          if (aDigit !== bDigit) {
            return aDigit - bDigit;
          }
        }
        return a.length - b.length;
      }).forEach((key) => {
        let numMSC = layoutMSC[key] || layoutMSC[key.padEnd(9, "0")]
        if (!numMSC) {
          console.log("ERRO!")
          console.log(key)
          return
        }
        response.push([
          key,
          numMSC.titulo || "",
          numMSC.tipoConta || "",
          "",
          merge[key].anterior.replaceAll("-", ""),
          merge[key].anterior.split("").includes("-") ? "C" : "D",
          merge[key].D,
          merge[key].C,
          merge[key].final.replaceAll("-", ""),
          merge[key].final.split("").includes("-") ? "C" : "D"
        ])
      })

      correctedData.forEach((data) => {
        lnc.filter((e) => e.data === data).forEach((tipo10) => {
          tipo10.content.content.forEach((tipo11) => {
            if (tipo11.tipoRegistro !== "11") return;
            const atributo = tipo11.atributoConta
            if (atributo == "0") return
            let nilChar = false
            const newKeyArr = []
            tipo11.codConta.substring(0, 9).split("").reverse().forEach((char) => {
              if (char !== "0") nilChar = true
              if (nilChar) newKeyArr.push(char);
            })
            const key = newKeyArr.reverse().join("")
            response.forEach((_, i) => {
              if (key !== response[i][0]) return
              response[i][3] = atributo === "1" ? "F" : "P"
            })
          })
        })
      })

      return res.status(StatusCodes.OK).json({ response })
    }
  } catch (error) {
    console.error(
      "error from balanceteContabil function from /controllers/balanceteContabil/balanceteContabil.js",
      error
    );
    return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ message: "Ocorreu um erro interno no servidor." });
  }
}