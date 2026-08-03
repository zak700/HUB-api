import { db } from "../src/database/postgres.js"

const checkAlreadyHasUser = async (data) => {
  try {
    const errors = []
    const { email, cpf } = data
    const withEmail = await db("eleicaoUsers").where({ email }).first()
    const withCpf = await db("eleicaoUsers").whereRaw("data->>'cpf' = ?", [cpf]).first();
    if (withEmail) errors.push("Email já está sendo utilizado.")
    if (withCpf) errors.push("CPF já cadastrado.")
    return errors
  } catch (error) {
    return ["Erro ao buscar banco de dados, tente novamente mais tarde."]
  }
}

async function candidatoData(data) {
  const nullValCheck = (val, name) => {
    if ((!val && typeof val === "string") || val === undefined || val === null) errors.push(`Campo "${name}" não preenchido.`)
  }
  const errors = [];
  [
    { name: "nome", label: "Nome" },
    { name: "cpf", label: "CPF" },
    { name: "municipio", label: "Município" },
    { name: "nomeRFB", label: "Nome Conforme Receita Federal do Brasil (RFB)" },
    { name: "idGenero", label: "Identidade de gênero" },
    { name: "divulIdGenero", label: "Divulgar identidade de gênero" },
    { name: "genero", label: "Gênero" },
    { name: "divulOrSex", label: "Deseja divulgar sua orientação sexual?" },
    { name: "Raca", label: "Cor/Raça" },
    { name: "cQuilombola", label: "Considera-se Quilombola" },
    { name: "dataNasc", label: "Data de nascimento" },
    { name: "UF", label: "UF" },
    { name: "tituloEleitor", label: "Titulo de eleitor" },
    { name: "rg", label: "RG" },
    { name: "orgaoExp", label: "Órgão expedidor" },
    { name: "UF_RG", label: "UF RG" },
    { name: "nacionalidade", label: "Nacionalidade" },
    { name: "estCivil", label: "Estado civil" },
    { name: "grInstrucao", label: "Grau de instrução" },
    {
      name: "ocupou_cargo",
      label: "Ocupou nos últimos 6 meses cargo em comissão ou função comissionada "
        + "na administração pública?"
    },
    { name: "ocup", label: "Ocupação" },
    { name: "ocupComplementar", label: "Ocupação complementar" },
    { name: "unidTrabalho", label: "Unidade de trabalho" },
    { name: "NomeCand", label: "Opção de nome" },
    { name: "nome_fonetico", label: "Nome fonético (Nome utilizado na urna)" },
    { name: "partido_candidato", label: "Partido do candidato" },
    { name: "reeleicao", label: "Concorrendo à reeleição para o mesmo cargo?" },
    { name: "Cargo_atual", label: "Cargo" },
    { name: "numero_candidato", label: "Número do candidato" },
    { name: "ocup_cargo_eletivo", label: "Ocupa cargo eletivo atualmente?" },
  ].forEach((e) => nullValCheck(data[e.name], e.label))



  const alrUser = await checkAlreadyHasUser(data)

  return [...errors, ...alrUser]
}

async function contadorData(data) {
  const errors = []
  const nullValCheck = (val, name) => {
    if ((!val && typeof val === "string") || val === undefined || val === null) errors.push(`Campo "${name}" não preenchido.`)
  }
  const allDataKeys = [
    { key: "nome", name: "Nome" },
    { key: "cpf", name: "CPF" },
    { key: "municipio", name: "Município" },
    { key: "nomeRFB", name: "Nome Conforme Receita Federal do Brasil (RFB)" },
    { key: "dataNasc", name: "Data de nascimento" },
    { key: "UF", name: "UF" },
    { key: "rg", name: "RG" },
    { key: "nacionalidade", name: "Nacionalidade" },
    { key: "estCivil", name: "Estado civil" },
    { key: "emailContato", name: "Email para contato" },
    { key: "telefone", name: "Telefone para contato" },
  ]

  allDataKeys.forEach((k) => nullValCheck(data[k.key], k.name))

  const alrUser = await checkAlreadyHasUser(data)
  return [...errors, ...alrUser]
}

export default { candidatoData, contadorData }