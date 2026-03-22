## Sequencia para criar o projeto

Criar o arquivo package.
```
npm init
```

Instalar o Express para gerenciar as requisições, rotas e URLs, entre outra funcionalidades
e já instala as dependências indicadas pelo package.json.
```
npm install express
```

Permitir requisição externa.
```
npm install cors

## Instalar a biblioteca para criptografar a senha do usuário

npm install bcrypt
npm i bcrypt

## Instalar o drive do banco de dados Postgres.
>> npm install pg --save

## Construtor de consultas multidialeto
npm i knex


npm install dotenv --save

## para Executar o projeto

>> node --watch src/index.js

>> nodemon app.js

## Para Gerar o Token

>> npm install jsonwebtoken

## Manipular variáveis de ambiente.

>> npm install dotenv --save

## para manipular exceções dentro de rotas expressas assíncronas 
>> npm i express-async-handler

## Use para limitar solicitações repetidas

>> npm i express-rate-limit

## Um middleware express.js para validador

>> npm i express-validator

## promessa para o navegador e node.js

>> npm i axios

##  DOMPurify higieniza o HTML e previne ataques XSS.

>> npm i dompurify

## Ajude a proteger aplicativos Express definindo cabeçalhos de resposta HTTP.

>> npm i helmet

>> middleware expresso para proteção contra ataques de poluição de parâmetros HTTP

>> npm i hpp



>> npm install bcryptjs



## Comandos SQL do Doctors

insert into doctors(name, specialty, icon)
values('Dr. Antonio Almeida Souza', 'Clínico Geral', 'M')

select * from doctors

update doctors set name='Dra. Marcia Assis', specialty='Endocrinologista', icon='F'
where id_doctor = 7

delete from doctors where id_doctor = 10

## Comandos SQL do SERVICES

insert into services(description)
values('Consulta')

## Comandos SQL do DOCTORS_SERVICES

insert into doctors_services(id_doctor, id_service, price)
values('1','1','500')

** Comando SQL fazendo um JOIN entre tabela de SERVICES e tabela de DOCTORS_SERVICES

SELECT d.id_service, s.description, d.price FROM public.doctors_services d
join services s on (s.id_service = d.id_service)
WHERE d.id_doctor = 1
ORDER BY s.description ASC 










## Requisitos

* Node.js 22 ou superior - Conferir a versão: node -v
* MySQL 8 ou superior - Conferir a versão: mysql --version

## Como rodar o projeto baixado

Duplicar o arquivo ".env.example" e renomear para ".env".<br>
Alterar no arquivo .env as credenciais do banco de dados<br>

Comando SQL para criar a base de dados.
```
CREATE DATABASE celke CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
```


Compilar o arquivo TypeScript. Executar o arquivo gerado.
```
npm run start:watch
```

Executar as migrations para criar as tabelas no banco de dados.
```
npx typeorm migration:run -d dist/data-source.js
```

Executar as seeds para cadastrar registro de teste nas tabelas no banco de dados.
```
node dist/run-seeds.js
```

Importar a collection do diretório "postman" para o Postman no VS Code.<br>
Alterar o host em "Environment" no Postman. Por padrão é "http://localhost:8080".<br>


Instalar o Express para gerenciar as requisições, rotas e URLs, entre outra funcionalidades.
```
npm i express
```

Instalar os pacotes para suporte ao TypeScript.
```
npm i --save-dev @types/express
npm i --save-dev @types/node
```

Instalar o compilador projeto com TypeScript e reiniciar o projeto quando o arquivo é modificado.
```
npm i --save-dev ts-node
```

Gerar o arquivo de configuração para o TypeScript.
```
npx tsc --init
```

Compilar o arquivo TypeScript.
```
npx tsc
```

Executar o arquivo gerado com Node.js.
```
node dist/index.js
```

Instalar a dependência para rodar processo simultaneamente.
```
npm install --save-dev concurrently
```

Compilar o arquivo TypeScript. Executar o arquivo gerado.
```
npm run start:watch
```

Iniciar o MySQL instalado no sistema operacional com PowerShell.
```
net start mysql80
```

Comando SQL para criar a base de dados.
```
CREATE DATABASE celke CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
```

Instalar a dependência para conectar o Node.js (TypeScript) com banco de dados.
```
npm install typeorm --save
```

Biblioteca utilizada no TypeScript para adicionar metadados (informações adicionais) a classes.
```
npm install reflect-metadata --save
```

Instalar o drive do banco de dados MySQL.
```
npm install mysql2 --save
```

Manipular variáveis de ambiente.
```
npm install dotenv --save
```

Instalar os tipos do TypeScript.
```
npm install --save-dev @types/dotenv
```

Criar a migrations que será usada para criar a tabela no banco de dados.
```
npx typeorm migration:create src/migration/<nome-da-migrations>
``` 
```
npx typeorm migration:create src/migration/CreateSituationsTable
``` 

Executar as migrations para criar as tabelas no banco de dados.
```
npx typeorm migration:run -d dist/data-source.js
```

Validar formulário.
```
npm i yup
```

npm install --save-dev @types/cors
```

## Como enviar e baixar os arquivos do GitHub

Baixar os arquivos do Git.
```
git clone -b <branch_name> <repository_url> .
```

Verificar em qual está branch.
```
git branch 
```

Baixar as atualizações do GitHub.
```
git pull
```

Adicionar todos os arquivos modificados no staging area - área de preparação.
```
git add .
```

commit representa um conjunto de alterações em um ponto específico da história do seu projeto, registra apenas as alterações adicionadas ao índice de preparação.
O comando -m permite que insira a mensagem de commit diretamente na linha de comando.
```
git commit -m "Base projeto"
```

Enviar os commits locais, para um repositório remoto.
```
git push <remote> <branch>
git push origin develop
```
## Instalar o drive do banco de dados Postgres.
>> npm install pg --save
