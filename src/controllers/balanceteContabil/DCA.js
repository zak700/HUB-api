import { StatusCodes } from "http-status-codes"
import ExcelJS from "exceljs"
import natureza from "../../helpers/natureza.js"
import { db } from "../../database/postgres.js"
import csv from "csv-parser"
import { Readable } from "stream"

const tableName = "DCA_vals"

async function getDCA(req, res) {
  try {
    const { orgao, dataI, dataF, all } = req.params

    const [anoI, anoF, mesI, mesF] = [
      all.substring(0, 4),
      all.substring(4, 8),
      all.substring(8, 10),
      all.substring(10, 12),
    ]

    const user = await natureza.getUser(req)
    let lnc
    try {
      lnc = await natureza.getCampo(user.schema + ".lnc", "m", orgao, orgao === "all" ? "true" : "false", dataI, dataF)
      if (!lnc.length) throw new Error()
    } catch (err) {
      return res.status(404).json()
    }

    const layoutMsc = await natureza.getLayoutMSC(anoF, user.schema)

    return res.status(200).json({})
  } catch (error) {
    console.error(error)
    return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({})
  }
}

export default { getDCA }