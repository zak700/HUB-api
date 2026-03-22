import { StatusCodes } from "http-status-codes"
import { db } from "../database/postgres.js"
import tokens from "../helpers/tokens.js"
import validaCPF from "../helpers/validaCPF.js"

async function cadastrarCandidato(req, res) {
  try {
    const verOrder = [
      'nome',
      'cpf',
      'municipio',
      'tituloEleitor',
      'rg',
      'nomeRFB',
      'orgaoExp',
      'idGenero',
      'divulIdGenero',
      'UF_RG',
      'nacionalidade',
      'genero',
      'estCivil',
      'divulOrSex',
      'Raca',
      'grInstrucao',
      'cQuilombola',
      'dataNasc',
      'ocupou_cargo',
      'UF',
      'ocup',
      'ocupComplementar',
      'unidTrabalho',
      'NomeCand',
      'nome_fonetico',
      'partido_candidato',
      'reeleicao',
      'Cargo_atual',
      'numero_candidato',
      'ocup_cargo_eletivo',
      { eleicoes_anteriores: ['eleicao'] },
      { deficiencias: ['tipo', 'descricao'] },
      { enderecos: ['email'] },
      { sites_candidato: ['url'] },
      { telefones_candidato: ['DDD', 'numero', 'app'] },
      { enderecos_candidato: ['tipo_logradouro', 'logradouro', 'numero', 'bairro', 'municipio', 'tipo'] },
      { bens_candidato: ['tipo', 'descricao', 'valor'] }
    ]

    const { dados, image } = req.body
    const { files } = req
    const srcExpected = "data:image/jpeg;base64"
    if (image.substring(0, srcExpected.length) !== srcExpected) return res.status(400).json({ message: "Imagem inválida." })

    // quick check to see if every value is in here

    const filenames = []

    files.forEach((file) => {
      filenames.push({name: file.originalname, MimeType: file.mimetype})
    })

    const arquivosBytea = []
    // store file buffers
    files.forEach((file) => {
      arquivosBytea.push(file.buffer)
    })

    verOrder.forEach((e) => {
      if (typeof e === "string") {
        if (!(dados[e])) return res.status(400).json({ message: "Dados em falta" })
      }
      if (typeof e === "object") {
        const key = Object.keys(e)[0]
        if (!(dados[key])) return res.status(400).json({ message: "Dados em falta" })
        dados[key].forEach((val) => {
          e[key].forEach((valKey) => {
            if (!(val[valKey]?.value)) return res.status(400).json({ message: "Dados em falta" })
          })
        })
      }
    })

    // Check specifics

    if (!validaCPF(dados.cpf)) return res.status(400).json({ message: "CPF inválido" })

    // convert image from base64 to binary

    const organized = {
      data: dados,
      id_usuario: tokens.getToken(req).userId,
      image,
      arquivos: arquivosBytea,
      arquivos_specifics: filenames
    }

    await db("candidatos").insert(organized).returning('id')
    return res.status(200).json({ message: "ok" })
  } catch (error) {
    console.error("Error in cadastrarCandidato function controller.candidatos.js", error);
    return res
      .status(500)
      .json({ message: "Ocorreu um erro interno no servidor." });
  }
}

async function fetchCandidatos(req, res) {
  try {

    const candidatos = await db("candidatos").select("*")

    return res.status(StatusCodes.OK).json({ message: "OK", candidatos })
  } catch (error) {
    console.error("Error in fetchCandidatos function controller.candidatos.js", error);
    return res
      .status(500)
      .json({ message: "Ocorreu um erro interno no servidor." });
  }
}


export default { cadastrarCandidato, fetchCandidatos }