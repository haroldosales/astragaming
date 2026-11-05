## Astra Gaming

Painel Next.js para visualizar as informações do torneio, gerenciar categorias e editar o draft em `/draft.html`.

No Draft, é possível adicionar, editar ou excluir participantes e equipes, alterar nomes de equipes e capitãs, atribuir ou remover as funções Duelista, Estrategista e Vanguarda, sortear a ordem dos picks e configurar o nome do projeto, do torneio, da edição e as cores principal e de destaque. As funções usam os ícones RivalSkins e são salvas junto com o Draft no `localStorage`; o resumo da página inicial mostra a distribuição por equipe.

O editor de categorias permite trocar a função e personalizar a URL do ícone. Para segurança, ícones personalizados devem ser imagens HTTPS do domínio `rivalskins.com` dentro de `role-icons`. Os logotipos das patentes no Draft usam as imagens do catálogo RivalSkins.

O botão **Limpar picks** devolve as participantes à lista de disponíveis sem apagar equipes ou configurações. Os dados iniciais compartilhados entre as páginas estão em `public/draft-defaults.json`.

### Desenvolvimento

```bash
npm run dev
```

Categorias também são armazenadas no `localStorage` do navegador. Catálogos de ícones: [funções](https://rivalskins.com/assets/role-icons/) e [patentes](https://rivalskins.com/assets/rank-logos/).
# astragaming
