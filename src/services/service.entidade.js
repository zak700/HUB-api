import { db } from "../database/postgres.js";

// NOME DA TABLE: entidade

async function Inserir(entidade) {
  try {
    const existingEntity = await getByCNPJ(entidade.cnpj);

    if (existingEntity.error) {
      return existingEntity;
    }

    if (existingEntity.rows?.length > 0) {
      return existingEntity;
    }

    if (entidade.id_usuario_autorizado.length === 0) {
      return { error: true, message: "nenhum usuario autorizado." };
    }

    await db("entidade").insert(entidade).returning("*");

    return { error: false, message: "Entidade cadastrada com sucesso!" };
  } catch (error) {
    console.error("Error in Inserir function service.entidade.js", error);
    return { error: "Internal server error." };
  }
}

async function updateEntity(entidade, id) {
  try {
    const res = await db("entidade").select("*").where({ id: id });
    if (res[0].cnpj !== entidade.cnpj) {
      const existingEntity = await getByCNPJ(entidade.cnpj);

      if (existingEntity.error) {
        return existingEntity;
      }

      if (existingEntity.rows?.length > 0) {
        return existingEntity;
      }

      if (entidade.id_usuario_autorizado.length === 0) {
        return { error: true, message: "nenhum usuario autorizado." };
      }
    }

    await db("entidade").update(entidade).where({ id: id });

    return { error: false, message: "Entidade cadastrada com sucesso!" };
  } catch (error) {
    console.error("Error in updateEntity function service.entidade.js", error);
    return { error: "Internal server error." };
  }
}

async function getByCNPJ(cnpj) {
  try {
    const entity = await db("entidade").where({ cnpj }).first();
    if (entity) {
      return { error: true, message: "CNPJ já cadastrado." };
    }
    return { error: false, message: "CNPJ disponível." };
  } catch (error) {
    console.error("Error in getByCNPJ function service.entidade.js", error);
    return { error: "Internal server error." };
  }
}

export default { Inserir, getByCNPJ, updateEntity };
