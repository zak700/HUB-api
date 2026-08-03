export default [
  { value: "/entidade", label: "Entidade" },
  { value: "/cidades", label: "Cidades ativas", admin: true },
  {
    label: "Campos",
    options: [
      { value: "/campos/especificar-tipo", label: "manejamento de dados" },
      { value: "/campos/cod-programa", label: "Código programa" },
      { value: "/campos/importar", label: "Popular campos" },
      { value: "/campos/editar", label: "Editar/Pesquisar campos" },
      { value: "/analize-campos", label: "Analize Campos" },
      { value: "/campos/corrigir-lnc", label: "Corrigir lnc" },
      { value: "/campos/conta-ctb", label: "Valores adicionais CTB" },
      { value: "/campos/emp", label: "Valores adicionais EMP" },
    ],
    admin: true,
  },
  { value: "/permitAccess", label: "Permitir usuários", admin: true },
  { value: "/tabela/teste", label: "Tabelas", admin: true },
  {
    options: [
      { value: "/rubrica", label: "Rubricas" },
      { value: "/rreo/anexo/1", label: "RREO" },
      { value: "/rgf/anexo/1", label: "RGF" },
      { value: "/slide/slide/1", label: "Apresentação Slide" },
    ],
    label: "Relatórios Fiscais",
    admin: true,
  },
  {
    options: [
      { value: "/candidatos/cadastrar", label: "Cadastrar Candidato" },
      {
        value: "/candidatos/analizar-cadastro",
        label: "Analizar Cadastrados",
        admin: true,
      },
    ],
    label: "Candidatos",
  },
  {
    options: [
      { value: "/add-layoutMSC-vals", label: "Valores do Leiaute MSC"},
      { value: "/add-dca-vals", label: "Valores do DCA"},
      { value: "/balancete-contabil", label: "Balancete Contábil" },
      { value: "/balancete-contabil/razao", label: "Razão contábil" },
      { value: "/matriz-contabil", label: "Matriz Contábil" },
      {
        value: "/analizar-matriz-contabil",
        label: "Analizar Matriz Contábil",
        admin: true,
      },
    ],
    label: "Balancete",
  },
  {
    options: [
      { value: "/analize-campos", label: "Campos" },
      { value: "/bola", label: "Bolota" },
    ],
    label: "Analizar",
    admin: true,
  },
  { value: "/papelfree", label: "PapelFree", },
];