import { db } from "../database/postgres.js";
import natureza from "../helpers/natureza.js";

async function getAllSchemas(req, res) {
  try {
    const user = await natureza.getUser(req)
    if (!user.permissoes.includes("admin")) {
      return res.status(401).json({ error: "Autorização necessária." });
    }
    const result = await db.raw("SELECT * FROM information_schema.schemata")
    const schemas = result.rows.map(r => r.schema_name).filter((n) => n.substring(0, 4) === "sch_").map((n) => n.substring(4));
    const allMunCodIbge = await fetch("https://servicodados.ibge.gov.br/api/v1/localidades/municipios").then(res => res.json());
    const allMunMap = new Map(allMunCodIbge.map(m => [m.id, `${m.nome} - ${m.microrregiao?.mesorregiao?.UF?.sigla}`]));
    const schemasWithNames = schemas.map(s => {
      const codIbge = parseInt(s);
      return {
        label: allMunMap.get(codIbge) || "Nome não encontrado",
        description: `Código IBGE: ${codIbge} - Schema: sch_${s}`,
      };
    });
    return res.status(200).json(schemasWithNames);
  } catch (err) {
    console.error("Error in getAllSchemas at hub-api\\src\\controllers\\controller.schemas.js", err);
    return res.status(500).json({ error: "Internal server error" });
  }
}

export default { getAllSchemas };