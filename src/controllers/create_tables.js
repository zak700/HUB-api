import { db } from "../database/postgres.js"

async function create_default_tables(req, res) {
  try {
    await db.raw(`
      CREATE TABLE IF NOT EXISTS public.abl (
          id INT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
          content json NOT NULL,
          data character varying(4) NOT NULL
      );

      CREATE TABLE IF NOT EXISTS public.aex (
          id INT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
          content json NOT NULL,
          data character varying(4) NOT NULL
      );

      CREATE TABLE IF NOT EXISTS public.alq (
          id INT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
          content json NOT NULL,
          data character varying(4) NOT NULL
      );

      CREATE TABLE IF NOT EXISTS public.anl (
          id INT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
          content json NOT NULL,
          data character varying(4) NOT NULL
      );

      CREATE TABLE IF NOT EXISTS public.aoc (
          id INT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
          content json NOT NULL,
          data character varying(4) NOT NULL
      );

      CREATE TABLE IF NOT EXISTS public.aop (
          id INT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
          content json NOT NULL,
          data character varying(4) NOT NULL
      );

      CREATE TABLE IF NOT EXISTS public.are (
          id INT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
          content json NOT NULL,
          data character varying(4) NOT NULL
      );

      CREATE TABLE IF NOT EXISTS public.arp (
          id INT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
          content json NOT NULL,
          data character varying(4) NOT NULL
      );

      CREATE TABLE IF NOT EXISTS public.cob (
          id INT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
          content json NOT NULL,
          data character varying(4) NOT NULL
      );

      CREATE TABLE IF NOT EXISTS public.con (
          id INT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
          content json NOT NULL,
          data character varying(4) NOT NULL
      );

      CREATE TABLE IF NOT EXISTS public.ctb (
          id INT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
          content json NOT NULL,
          data character varying(4) NOT NULL
      );

      CREATE TABLE IF NOT EXISTS public.cvc (
          id INT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
          content json NOT NULL,
          data character varying(4) NOT NULL
      );

      CREATE TABLE IF NOT EXISTS public.dcl (
          id INT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
          content json NOT NULL,
          data character varying(4) NOT NULL
      );

      CREATE TABLE IF NOT EXISTS public.dfr (
          id INT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
          content json NOT NULL,
          data character varying(4) NOT NULL
      );

      CREATE TABLE IF NOT EXISTS public.dic (
          id INT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
          content json NOT NULL,
          data character varying(4) NOT NULL
      );

      CREATE TABLE IF NOT EXISTS public.dmr (
          id INT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
          content json NOT NULL,
          data character varying(4) NOT NULL
      );

      CREATE TABLE IF NOT EXISTS public.dsi (
          id INT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
          content json NOT NULL,
          data character varying(4) NOT NULL
      );

      CREATE TABLE IF NOT EXISTS public."dspO" (
          id INT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
          data character varying(4) NOT NULL,
          content json NOT NULL
      );

      CREATE TABLE IF NOT EXISTS public.ecl (
          id INT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
          content json NOT NULL,
          data character varying(4) NOT NULL
      );

      CREATE TABLE IF NOT EXISTS public.emp (
          id INT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
          content json NOT NULL,
          data character varying(4) NOT NULL
      );

      CREATE TABLE IF NOT EXISTS public.entidade (
          entidade_nome character varying(255) NOT NULL,
          orgao_governo character varying(255) NOT NULL,
          email character varying(255) NOT NULL,
          cnpj character varying(20) NOT NULL,
          cnae integer NOT NULL,
          tipo_orgao_texto character varying(255) NOT NULL,
          natureza_juridica character varying(10) NOT NULL,
          ativo boolean NOT NULL,
          tipo_orgao_select character varying(5) NOT NULL,
          id INT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
          id_user integer NOT NULL,
          id_usuario_autorizado integer[]
      );

      CREATE TABLE IF NOT EXISTS public.eoc (
          id INT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
          content json NOT NULL,
          data character varying(4) NOT NULL
      );

      CREATE TABLE IF NOT EXISTS public.ext (
          id INT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
          content json NOT NULL,
          data character varying(4) NOT NULL
      );

      CREATE TABLE IF NOT EXISTS public.hbl (
          id INT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
          content json NOT NULL,
          data character varying(4) NOT NULL
      );

      CREATE TABLE IF NOT EXISTS public.hml (
          id INT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
          content json NOT NULL,
          data character varying(4) NOT NULL
      );

      CREATE TABLE IF NOT EXISTS public.ide (
          id INT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
          content json NOT NULL
      );

      CREATE TABLE IF NOT EXISTS public.isi (
          id INT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
          content json NOT NULL,
          data character varying(4) NOT NULL
      );

      CREATE TABLE IF NOT EXISTS public.jgl (
          id INT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
          content json NOT NULL,
          data character varying(4) NOT NULL
      );

      CREATE TABLE IF NOT EXISTS public.lnc (
          id INT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
          content json NOT NULL,
          data character varying(4) NOT NULL
      );

      CREATE TABLE IF NOT EXISTS public.lqd (
          id INT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
          content json NOT NULL,
          data character varying(4) NOT NULL
      );

      CREATE TABLE IF NOT EXISTS public.ops (
          id INT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
          content json NOT NULL,
          data character varying(4) NOT NULL
      );

      CREATE TABLE IF NOT EXISTS public.orgao (
          id INT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
          content json NOT NULL
      );

      CREATE TABLE IF NOT EXISTS public.par (
          id INT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
          content json NOT NULL,
          data character varying(4) NOT NULL
      );

      CREATE TABLE IF NOT EXISTS public.pct (
          id INT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
          content json NOT NULL,
          data character varying(4) NOT NULL
      );

      CREATE TABLE IF NOT EXISTS public.posts (
          id INT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
          id_usuario integer NOT NULL,
          title character varying(255) NOT NULL,
          content text NOT NULL,
          created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP
      );

      CREATE TABLE IF NOT EXISTS public.prl (
          id INT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
          content json NOT NULL,
          data character varying(4) NOT NULL
      );

      CREATE TABLE IF NOT EXISTS public.rec (
          id INT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
          content json NOT NULL,
          data character varying(4) NOT NULL
      );

      CREATE TABLE IF NOT EXISTS public."recO" (
          id INT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
          content json NOT NULL,
          data character varying(4) NOT NULL
      );

      CREATE TABLE IF NOT EXISTS public.reo (
          id INT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
          content json NOT NULL,
          data character varying(4) NOT NULL
      );

      CREATE TABLE IF NOT EXISTS public.rpl (
          id INT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
          content json NOT NULL,
          data character varying(4) NOT NULL
      );

      CREATE TABLE IF NOT EXISTS public.rsp (
          id INT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
          content json NOT NULL,
          data character varying(4) NOT NULL
      );

      CREATE TABLE IF NOT EXISTS public.rubricas (
          id INT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
          anexo1 json NOT NULL,
          anexo2 json,
          anexo3 json,
          anexo4 json,
          anexo6 json,
          anexo7 json,
          anexo8 json,
          anexo9 json,
          anexo10 json,
          anexo11 json,
          anexo12 json,
          anexo13 json,
          anexo14 json
      );

      CREATE TABLE IF NOT EXISTS public.tfr (
          id INT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
          content json NOT NULL,
          data character varying(4) NOT NULL
      );

      CREATE TABLE IF NOT EXISTS public.trb (
          id INT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
          content json NOT NULL,
          data character varying(4) NOT NULL
      );

      CREATE TABLE IF NOT EXISTS public.uoc (
          id INT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
          content json NOT NULL,
          data character varying(4) NOT NULL
      );

      CREATE TABLE IF NOT EXISTS public.usuarios (
          id_usuario INT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
          nome character varying(50),
          email character varying(100),
          password character varying(100),
          pfp_image bytea,
          cpf character varying(11),
          telefone character varying(20),
          enderecos jsonb,
          ativo boolean DEFAULT true NOT NULL,
          permissoes character varying[] NOT NULL
      );
    `)
    res.status(200).json({ message: "boa" })
  } catch (error) {
    console.error("ERRO AO CRIAR CAMPOS", error)
    res.status(500).json({ message: error })
  } finally {
    console.log("cabo")
  }
}

export default { create_default_tables }