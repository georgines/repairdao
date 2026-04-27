# repairdao

App Next.js do RepairDAO. A aplicação usa Prisma para dados locais e consome os contratos do projeto `repairdao-contracts`.

Neste repositório fica a interface web do projeto, incluindo navegação, persistência local, integração com carteira e consumo dos contratos implantados em rede local ou Sepolia.

## Requisitos

- Git
- Node.js 20 ou superior
- Yarn 1.x

## Clone

```bash
git clone https://github.com/georgines/repairdao.git
```

Para uso integrado em rede local, mantenha `repairdao-contracts` como pasta irmã:

```text
workspace/
|- repairdao/
|- repairdao-contracts/
```

Se for usar a blockchain local, clone também o repositório de contratos:

```bash
git clone https://github.com/georgines/repairdao-contracts.git
```

## Configuração

1. Duplique `.env.example` como `.env`.
2. Preencha `SEPOLIA_RPC_URL` se for usar Sepolia.
3. `NEXT_PUBLIC_NETWORK` define apenas a rede padrão inicial. Depois disso, a rede pode ser trocada no seletor da interface.

## Instalação

```bash
yarn install
yarn run prisma:generate
```

Se for usar a blockchain local, instale também as dependências em `repairdao-contracts`:

```bash
cd ../repairdao-contracts
yarn install
cd ../repairdao
```

## Subir com blockchain local

Terminal 1, na pasta irmã `repairdao-contracts`:

```bash
yarn run node
```

Terminal 2, na pasta irmã `repairdao-contracts`:

```bash
yarn run deploy:local
```

Terminal 3, neste repositório:

```bash
yarn run db:reset
yarn run dev
```

App disponível em `http://localhost:3000`.

## Subir com Sepolia

Se `src/contracts/deploy/sepolia.json` estiver alinhado ao deploy desejado e `SEPOLIA_RPC_URL` estiver preenchido:

```bash
yarn run db:reset
yarn run dev
```

## RPC Sepolia

Para configurar `SEPOLIA_RPC_URL`, escolha uma destas opções:

```env
SEPOLIA_RPC_URL=https://eth-sepolia.g.alchemy.com/v2/SUA_CHAVE_AQUI
```

Use esse formato no `.env` quando tiver uma chave própria.

Se preferir não usar chave em desenvolvimento, use um endpoint público:

```env
SEPOLIA_RPC_URL=https://ethereum-sepolia-rpc.publicnode.com
```

As duas opções acima apontam para a mesma rede Sepolia. A RPC pública costuma ser suficiente para desenvolvimento e testes, mas tende a ter mais instabilidade e limite menor do que provedores com chave própria.

## Testes

```bash
yarn run test
```
