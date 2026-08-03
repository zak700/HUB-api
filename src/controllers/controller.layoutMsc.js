import { StatusCodes } from "http-status-codes"
import ExcelJS from "exceljs"
import natureza from "../helpers/natureza.js"
import { db } from "../database/postgres.js"

const createIfNotExists = async (schema) => {
  const hasTable = await db.schema.withSchema(schema).hasTable(`layoutMSC`)
  if (!hasTable) {
    await db.schema.withSchema(schema).createTable(`layoutMSC`, (table) => {
      table.string("data", 4).primary();
      table.jsonb("layout").notNullable();
      table.timestamps(true, true);
    })
  }
}

async function uploadFile(req, res) {
  const file = req.file
  const { data } = req.params
  if (!file.originalname.endsWith(".xlsx")) return res.status(StatusCodes.BAD_REQUEST).json({ message: "Arquivo de tipo incorreto." })
  try {
    const workBook = new ExcelJS.Workbook()
    const read = (await workBook.xlsx.load(file.buffer));
    const worksheet = workBook.getWorksheet(`PcaspEstendido${data}`)
    if (!worksheet) return res.status(StatusCodes.BAD_REQUEST).json({ message: "Verifique ambos a data e o arquivo." })
    const layoutMSC = {}
    worksheet.eachRow((row, rowNumber) => {
      if (rowNumber <= 4) return
      const rowVals = row.values
      const code = String(rowVals[8]).padStart(9, "0")
      const natureza = rowVals[11].split("/").map((e) => e.substring(0, 1)).join("/")
      const tipoConta = rowVals[13] === 'Último' ? "A" : "S"
      const indicador = rowVals[14] === "-" ? "" : rowVals[14].split("/").map((e) => e.substring(0, 1)).join("/")
      const values = rowVals[16] === "Não se aplica" ? [] : rowVals[16].split("-").map((e) => e.trim())
      const title = rowVals[9]
      const description = rowVals[10]
      layoutMSC[code] = {
        natureza, tipoConta, indicador, values, title, description
      }
    })
    const user = await natureza.getUser(req, res)
    if (!user) return res.status(StatusCodes.FORBIDDEN).json({ message: "Usuário não encontrado." })
    await createIfNotExists(user.schema)
    await db.withSchema(user.schema).table("layoutMSC").insert({ data, layout: layoutMSC })
    return res.status(StatusCodes.OK).json({ message: "Enviado com exito." })
  } catch (err) {
    console.error(`Error at hub-api\\src\\controllers\\controller.layoutMsc.js in uploadFile Function.\n`, err)
    res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ message: "Erro ao enviar, verifique se já existe um leiaute enviado nesta data." })
  }
}

async function getSafe(req, res) {
  try {
    const user = await natureza.getUser(req)
    await createIfNotExists(user.schema)
    const output = await db.withSchema(user.schema).table("layoutMSC").select("data", "created_at", "updated_at").orderBy("data", "asc")
    return res.status(StatusCodes.OK).json(output)
  } catch (err) {
    console.error(`Error at hub-api\\src\\controllers\\controller.layoutMsc.js in getSafe Function.\n`, err)
    return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ message: "Erro ao buscar valores do leiaute" })
  }
}

async function getValues(req, res) {
  try {
    const user = await natureza.getUser(req)
    await createIfNotExists(user.schema)
    const output = await db.withSchema(user.schema).table("layoutMSC").select("*").orderBy("data", "asc")
    return res.status(StatusCodes.OK).json(output)
  } catch (err) {
    console.error(`Error at hub-api\\src\\controllers\\controller.layoutMsc.js in getSafe Function.\n`, err)
    return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ message: "Erro ao buscar valores do leiaute" })
  }
}

async function deleteByData(req, res) {
  try {
    const { data } = req.params
    if (!data) return res.status(StatusCodes.BAD_REQUEST).json({ message: "Data Inválida ou ausente." })
    const user = await natureza.getUser(req)
    if (!user) return res.status(StatusCodes.FORBIDDEN).json({ message: "Usuário não encontrado." })
    await db.withSchema(user.schema).table("layoutMSC").delete().where({ data })
    res.status(StatusCodes.OK).json({ message: `Leiaute com data ${data} deletado com êxito.` })
  } catch (err) {
    console.error(`Error at hub-api\\src\\controllers\\controller.layoutMsc.js in deleteByData Function.\n`, err)
  }
}

export default { uploadFile, getSafe, deleteByData, getValues }