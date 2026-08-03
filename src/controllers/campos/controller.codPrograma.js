import { db } from "../../database/postgres.js";
import natureza from "../../helpers/natureza.js";

const tableName = "codPrograma";

const checkTable = async (user) => {
  try {
    const has = await db.schema.withSchema(user.schema).hasTable(tableName);
    if (!has) {
      await db.schema
        .withSchema(user.schema)
        .createTable(tableName, (table) => {
          table.increments("id", true);
          table.string("codigo", 4);
          table.string("descricao", 200);
        });
    }
  } catch (error) {
    console.log(error);
  }
};

async function saveCod(req, res) {
  try {
    const data = req.body;
    console.log(data)
    const user = await natureza.getUser(req);


    await checkTable(user);

    await db.withSchema(user.schema).table(tableName).insert(data);

    return res.status(200).json();
  } catch (error) {
    console.error(error);
    return res.status(500).json();
  }
}

async function getAll(req, res) {
  try {
    const user = await natureza.getUser(req);

    await checkTable(user);

    const response = await db
      .withSchema(user.schema)
      .table(tableName)
      .select("*").orderBy("codigo", "asc");

    return res.status(200).json(response);
  } catch {
    console.error(error);
    return res.status(500).json();
  }
}

async function deleteCod(req, res) {
  try {
    const { id } = req.params
    const user = await natureza.getUser(req)
    await db.withSchema(user.schema).table(tableName).delete().where({ id })
    return res.status(200).json()
  } catch {
    console.error(error);
    return res.status(500).json();
  }
}

async function updateCod(req, res) {
  try {
    const data = req.body;
    const user = await natureza.getUser(req);
    const id = data.id
    delete data.id
    console.log(data, id)

    await db.withSchema(user.schema).table(tableName).update(data).where({id});

    return res.status(200).json();
  } catch (error) {
    console.error(error);
    return res.status(500).json();
  }
}

export default { saveCod, getAll, deleteCod, updateCod };
