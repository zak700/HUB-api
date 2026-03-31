export default {
  checkNew: async (code) => {
    await db.raw(`
      CREATE SCHEMA IF NOT EXISTS ${code};

      CREATE TABLE IF NOT EXISTS ${code}.abl (
          id INT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
          content json NOT NULL,
          data character varying(4) NOT NULL
      );

      CREATE TABLE IF NOT EXISTS ${code}.aex (
          id INT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
          content json NOT NULL,
          data character varying(4) NOT NULL
      );

      CREATE TABLE IF NOT EXISTS ${code}.alq (
          id INT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
          content json NOT NULL,
          data character varying(4) NOT NULL
      );

      CREATE TABLE IF NOT EXISTS ${code}.anl (
          id INT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
          content json NOT NULL,
          data character varying(4) NOT NULL
      );

      CREATE TABLE IF NOT EXISTS ${code}.aoc (
          id INT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
          content json NOT NULL,
          data character varying(4) NOT NULL
      );

      CREATE TABLE IF NOT EXISTS ${code}.aop (
          id INT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
          content json NOT NULL,
          data character varying(4) NOT NULL
      );

      CREATE TABLE IF NOT EXISTS ${code}.are (
          id INT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
          content json NOT NULL,
          data character varying(4) NOT NULL
      );

      CREATE TABLE IF NOT EXISTS ${code}.arp (
          id INT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
          content json NOT NULL,
          data character varying(4) NOT NULL
      );

      CREATE TABLE IF NOT EXISTS ${code}.candidatos (
          id INT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
          data json NOT NULL,
          id_usuario integer NOT NULL
      );

      CREATE TABLE IF NOT EXISTS ${code}.cob (
          id INT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
          content json NOT NULL,
          data character varying(4) NOT NULL
      );

      CREATE TABLE IF NOT EXISTS ${code}.con (
          id INT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
          content json NOT NULL,
          data character varying(4) NOT NULL
      );

      CREATE TABLE IF NOT EXISTS ${code}.ctb (
          id INT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
          content json NOT NULL,
          data character varying(4) NOT NULL
      );

      CREATE TABLE IF NOT EXISTS ${code}.cvc (
          id INT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
          content json NOT NULL,
          data character varying(4) NOT NULL
      );

      CREATE TABLE IF NOT EXISTS ${code}.dcl (
          id INT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
          content json NOT NULL,
          data character varying(4) NOT NULL
      );

      CREATE TABLE IF NOT EXISTS ${code}.dfr (
          id INT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
          content json NOT NULL,
          data character varying(4) NOT NULL
      );

      CREATE TABLE IF NOT EXISTS ${code}.dic (
          id INT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
          content json NOT NULL,
          data character varying(4) NOT NULL
      );

      CREATE TABLE IF NOT EXISTS ${code}.dmr (
          id INT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
          content json NOT NULL,
          data character varying(4) NOT NULL
      );

      CREATE TABLE IF NOT EXISTS ${code}.dsi (
          id INT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
          content json NOT NULL,
          data character varying(4) NOT NULL
      );

      CREATE TABLE IF NOT EXISTS ${code}."dspO" (
          id INT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
          data character varying(4) NOT NULL,
          content json NOT NULL
      );

      CREATE TABLE IF NOT EXISTS ${code}.ecl (
          id INT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
          content json NOT NULL,
          data character varying(4) NOT NULL
      );

      CREATE TABLE IF NOT EXISTS ${code}.emp (
          id INT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
          content json NOT NULL,
          data character varying(4) NOT NULL
      );

      CREATE TABLE IF NOT EXISTS ${code}.entidade (
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

      CREATE TABLE IF NOT EXISTS ${code}.eoc (
          id INT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
          content json NOT NULL,
          data character varying(4) NOT NULL
      );

      CREATE TABLE IF NOT EXISTS ${code}.ext (
          id INT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
          content json NOT NULL,
          data character varying(4) NOT NULL
      );

      CREATE TABLE IF NOT EXISTS ${code}.hbl (
          id INT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
          content json NOT NULL,
          data character varying(4) NOT NULL
      );

      CREATE TABLE IF NOT EXISTS ${code}.hml (
          id INT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
          content json NOT NULL,
          data character varying(4) NOT NULL
      );

      CREATE TABLE IF NOT EXISTS ${code}.ide (
          id INT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
          content json NOT NULL
      );

      CREATE TABLE IF NOT EXISTS ${code}.isi (
          id INT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
          content json NOT NULL,
          data character varying(4) NOT NULL
      );

      CREATE TABLE IF NOT EXISTS ${code}.jgl (
          id INT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
          content json NOT NULL,
          data character varying(4) NOT NULL
      );

      CREATE TABLE IF NOT EXISTS ${code}.lnc (
          id INT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
          content json NOT NULL,
          data character varying(4) NOT NULL
      );

      CREATE TABLE IF NOT EXISTS ${code}.lqd (
          id INT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
          content json NOT NULL,
          data character varying(4) NOT NULL
      );

      CREATE TABLE IF NOT EXISTS ${code}.ops (
          id INT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
          content json NOT NULL,
          data character varying(4) NOT NULL
      );

      CREATE TABLE IF NOT EXISTS ${code}.orgao (
          id INT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
          content json NOT NULL
      );

      CREATE TABLE IF NOT EXISTS ${code}.par (
          id INT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
          content json NOT NULL,
          data character varying(4) NOT NULL
      );

      CREATE TABLE IF NOT EXISTS ${code}.pct (
          id INT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
          content json NOT NULL,
          data character varying(4) NOT NULL
      );

      CREATE TABLE IF NOT EXISTS ${code}.posts (
          id INT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
          id_usuario integer NOT NULL,
          title character varying(255) NOT NULL,
          content text NOT NULL,
          created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP
      );

      CREATE TABLE IF NOT EXISTS ${code}.prl (
          id INT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
          content json NOT NULL,
          data character varying(4) NOT NULL
      );

      CREATE TABLE IF NOT EXISTS ${code}.rec (
          id INT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
          content json NOT NULL,
          data character varying(4) NOT NULL
      );

      CREATE TABLE IF NOT EXISTS ${code}."recO" (
          id INT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
          content json NOT NULL,
          data character varying(4) NOT NULL
      );

      CREATE TABLE IF NOT EXISTS ${code}.reo (
          id INT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
          content json NOT NULL,
          data character varying(4) NOT NULL
      );

      CREATE TABLE IF NOT EXISTS ${code}.rpl (
          id INT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
          content json NOT NULL,
          data character varying(4) NOT NULL
      );

      CREATE TABLE IF NOT EXISTS ${code}.rsp (
          id INT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
          content json NOT NULL,
          data character varying(4) NOT NULL
      );

      CREATE TABLE IF NOT EXISTS ${code}.rubricas (
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

      CREATE TABLE IF NOT EXISTS ${code}.tfr (
          id INT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
          content json NOT NULL,
          data character varying(4) NOT NULL
      );

      CREATE TABLE IF NOT EXISTS ${code}.trb (
          id INT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
          content json NOT NULL,
          data character varying(4) NOT NULL
      );

      CREATE TABLE IF NOT EXISTS ${code}.uoc (
          id INT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
          content json NOT NULL,
          data character varying(4) NOT NULL
      );

      CREATE TABLE IF NOT EXISTS ${code}.usuarios (
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
  }
}