## Astra Gaming

Painel Next.js para visualizar as informações do torneio, gerenciar categorias e editar o draft em `/draft.html`.

No Draft, é possível adicionar, editar ou excluir participantes e equipes, alterar nomes de equipes e capitãs, sortear a ordem dos picks e configurar o nome do projeto, do torneio, da edição e as cores principal e de destaque. As alterações ficam no `localStorage` do navegador e aparecem no resumo da página inicial.

Os ícones da interface usam monogramas com iniciais relacionadas às equipes, categorias, participantes e ações.

O botão **Limpar picks** devolve as participantes à lista de disponíveis sem apagar equipes ou configurações. Os dados iniciais compartilhados entre as páginas estão em `public/draft-defaults.json`.

### Desenvolvimento

```bash
npm run dev
```

Categorias também são armazenadas no `localStorage` do navegador. Ícones de função: [RivalSkins](https://rivalskins.com/assets/role-icons/).
# astragaming
