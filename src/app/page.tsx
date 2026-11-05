"use client";

import Link from "next/link";
import { useEffect, useState, useSyncExternalStore } from "react";
import initialDraftData from "../../public/draft-defaults.json";

type Role = "duelist" | "strategist" | "vanguard";

type Category = {
  id: string;
  name: string;
  role: Role;
  description: string;
  active: boolean;
};

type CategoryDraft = Pick<Category, "name" | "role" | "description">;

function Monogram({ label, className = "" }: { label: string; className?: string }) {
  return <span className={`monogram ${className}`} aria-hidden="true">{label}</span>;
}

type DraftProject = {
  name: string;
  tournament: string;
  subtitle: string;
  primaryColor: string;
  accentColor: string;
};

type DraftTeam = {
  id: number;
  name: string;
  captain: string;
  players: string[];
};

type DraftOverview = {
  project: DraftProject;
  availablePlayers: string[];
  teams: DraftTeam[];
  draftOrder: number[];
  currentTurnIndex: number;
};

const roleDetails: Record<Role, { name: string; mark: string; hint: string }> = {
  duelist: {
    name: "Duelista",
    mark: "DU",
    hint: "Dano e pressão na linha de frente.",
  },
  strategist: {
    name: "Estrategista",
    mark: "ES",
    hint: "Suporte tático e sustentação da equipe.",
  },
  vanguard: {
    name: "Vanguarda",
    mark: "VA",
    hint: "Resistência e controle de espaço.",
  },
};

const initialCategories: Category[] = [
  { id: "duelistas", name: "Duelistas", role: "duelist", description: "Dano e pressão na linha de frente.", active: true },
  { id: "estrategistas", name: "Estrategistas", role: "strategist", description: "Suporte tático e sustentação da equipe.", active: true },
  { id: "vanguardas", name: "Vanguardas", role: "vanguard", description: "Resistência e controle de espaço.", active: true },
];

const storageKey = "astra-gaming-categories";
const draftStorageKey = "astra-gaming-draft";
const defaultDraftOverview: DraftOverview = initialDraftData;
const subscribeHydration = () => () => {};
const getHydrationSnapshot = () => true;
const getServerHydrationSnapshot = () => false;

function getInitialCategories(): Category[] {
  if (typeof window === "undefined") return initialCategories;
  const stored = window.localStorage.getItem(storageKey);
  if (!stored) return initialCategories;
  try {
    const parsed = JSON.parse(stored) as Category[];
    return Array.isArray(parsed) ? parsed : initialCategories;
  } catch {
    window.localStorage.removeItem(storageKey);
    return initialCategories;
  }
}

function isDraftOverview(value: unknown): value is DraftOverview {
  if (!value || typeof value !== "object") return false;
  const draft = value as Partial<DraftOverview>;
  return Boolean(
    draft.project
      && typeof draft.project.name === "string"
      && typeof draft.project.tournament === "string"
      && typeof draft.project.subtitle === "string"
      && /^#[0-9a-f]{6}$/i.test(draft.project.primaryColor)
      && /^#[0-9a-f]{6}$/i.test(draft.project.accentColor)
      && Array.isArray(draft.availablePlayers)
      && draft.availablePlayers.every((player) => typeof player === "string")
      && Array.isArray(draft.teams)
      && draft.teams.every((team) => team && Number.isInteger(team.id)
        && typeof team.name === "string"
        && typeof team.captain === "string"
        && Array.isArray(team.players)
        && team.players.every((player) => typeof player === "string"))
      && Array.isArray(draft.draftOrder)
      && Number.isInteger(draft.currentTurnIndex),
  );
}

export default function Home() {
  const [categories, setCategories] = useState<Category[]>(getInitialCategories);
  const [selectedId, setSelectedId] = useState("duelistas");
  const [search, setSearch] = useState("");
  const [draft, setDraft] = useState<CategoryDraft | null>(null);
  const [saved, setSaved] = useState(false);
  const [draftOverview, setDraftOverview] = useState<DraftOverview>(defaultDraftOverview);
  const [hasSavedDraft, setHasSavedDraft] = useState(false);
  const [draftReadError, setDraftReadError] = useState(false);
  const hydrated = useSyncExternalStore(subscribeHydration, getHydrationSnapshot, getServerHydrationSnapshot);

  useEffect(() => {
    if (hydrated) window.localStorage.setItem(storageKey, JSON.stringify(categories));
  }, [categories, hydrated]);

  useEffect(() => {
    function syncDraftOverview() {
      try {
        const stored = window.localStorage.getItem(draftStorageKey);
        if (!stored) {
          setDraftOverview(defaultDraftOverview);
          setHasSavedDraft(false);
          setDraftReadError(false);
          return;
        }
        const parsed: unknown = JSON.parse(stored);
        if (!isDraftOverview(parsed)) throw new Error("Os dados salvos do Draft estão inválidos.");
        setDraftOverview(parsed);
        setHasSavedDraft(true);
        setDraftReadError(false);
      } catch (error) {
        console.error("Não foi possível carregar o resumo do Draft.", error);
        setDraftReadError(true);
      }
    }

    syncDraftOverview();
    window.addEventListener("storage", syncDraftOverview);
    window.addEventListener("astra-draft-updated", syncDraftOverview);
    return () => {
      window.removeEventListener("storage", syncDraftOverview);
      window.removeEventListener("astra-draft-updated", syncDraftOverview);
    };
  }, []);

  const selected = categories.find((category) => category.id === selectedId) ?? categories[0] ?? null;
  const currentDraft = selected
    ? draft ?? { name: selected.name, role: selected.role, description: selected.description }
    : null;
  const filteredCategories = categories.filter((category) =>
    category.name.toLowerCase().includes(search.toLowerCase()),
  );
  const activeCount = categories.filter((category) => category.active).length;
  const draftedCount = draftOverview.teams.reduce((total, team) => total + team.players.length, 0);
  const participantCount = draftOverview.availablePlayers.length + draftedCount + draftOverview.teams.length;
  const projectTheme = {
    "--pink": draftOverview.project.primaryColor,
    "--blue": draftOverview.project.accentColor,
  } as React.CSSProperties;

  function selectCategory(category: Category) {
    setSelectedId(category.id);
    setDraft(null);
    setSaved(false);
  }

  function addCategory() {
    const category: Category = {
      id: crypto.randomUUID(),
      name: `Nova categoria ${categories.length + 1}`,
      role: "duelist",
      description: roleDetails.duelist.hint,
      active: true,
    };
    setCategories((current) => [...current, category]);
    setSelectedId(category.id);
    setDraft({ name: category.name, role: category.role, description: category.description });
    setSaved(false);
  }

  function saveCategory(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!selected || !currentDraft?.name.trim()) return;
    setCategories((current) => current.map((category) =>
      category.id === selected.id
        ? { ...category, name: currentDraft.name.trim(), description: currentDraft.description.trim(), role: currentDraft.role }
        : category,
    ));
    setDraft({ ...currentDraft, name: currentDraft.name.trim() });
    setSaved(true);
  }

  function toggleCategory(category: Category) {
    setCategories((current) => current.map((item) =>
      item.id === category.id ? { ...item, active: !item.active } : item,
    ));
  }

  function deleteCategory() {
    if (!selected || !window.confirm(`Excluir a categoria “${selected.name}”?`)) return;
    const remaining = categories.filter((category) => category.id !== selected.id);
    setCategories(remaining);
    const next = remaining[0];
    if (next) selectCategory(next);
    else {
      setSelectedId("");
      setDraft(null);
    }
  }

  if (!hydrated) return <main className="loading-screen" aria-label="Carregando categorias" />;

  return (
    <div className="app-shell" style={projectTheme}>
      <aside className="sidebar">
        <Link className="brand" href="/" aria-label={`${draftOverview.project.name}, início`}>
          <span className="brand-mark">AG</span>
          <span className="brand-copy"><strong>{draftOverview.project.name.toUpperCase()}</strong><small>PAINEL DE CONTROLE</small></span>
        </Link>

        <div className="nav-label">GERENCIAMENTO</div>
        <nav className="side-nav" aria-label="Navegação principal">
          <Link className="nav-item active" href="/" aria-current="page"><Monogram label="CT" />Categorias</Link>
          <a className="nav-item" href="/draft.html"><Monogram label="DR" />Draft<Monogram label="EXT" className="nav-external" /></a>
        </nav>

        <div className="sidebar-spacer" />
        <a className="reference-link" href="https://rivalskins.com/assets/role-icons/" target="_blank" rel="noreferrer">
          <Monogram label="RF" /> Referência de funções <Monogram label="EXT" />
        </a>
        <div className="sidebar-footer"><span className="status-dot" />Sistema operacional <span>v1.0</span></div>
      </aside>

      <main className="workspace">
        <header className="topbar">
          <div className="breadcrumb"><span>{draftOverview.project.name.toUpperCase()}</span><span className="breadcrumb-separator">/</span><strong>Categorias</strong></div>
          <div className="topbar-right"><span className="live-dot" />{draftOverview.project.subtitle.toUpperCase()}</div>
        </header>

        <div className="page-content">
          <section className="draft-overview" aria-label="Resumo do projeto e do draft">
            <div className="draft-overview-heading">
              <div>
                <div className="eyebrow"><Monogram label="VP" /> VISÃO GERAL DO PROJETO</div>
                <h1>{draftOverview.project.tournament}</h1>
                <p>{draftOverview.project.tournament === draftOverview.project.name
                  ? draftOverview.project.subtitle
                  : <>{draftOverview.project.name}<span> · </span>{draftOverview.project.subtitle}</>}</p>
                <div className="project-colors" aria-label="Cores do projeto">
                  <span style={{ backgroundColor: draftOverview.project.primaryColor }} title={`Cor principal ${draftOverview.project.primaryColor}`} />
                  <span style={{ backgroundColor: draftOverview.project.accentColor }} title={`Cor de destaque ${draftOverview.project.accentColor}`} />
                  <small>IDENTIDADE VISUAL</small>
                </div>
              </div>
              <Link className="primary-button" href="/draft.html"><Monogram label="DR" />Abrir Draft<Monogram label="EXT" /></Link>
            </div>

            <div className="draft-stats">
              <div><span>EQUIPES</span><strong>{draftOverview.teams.length.toString().padStart(2, "0")}</strong></div>
              <div><span>PARTICIPANTES</span><strong>{participantCount.toString().padStart(2, "0")}</strong></div>
              <div><span>DISPONÍVEIS</span><strong>{draftOverview.availablePlayers.length.toString().padStart(2, "0")}</strong></div>
              <div><span>ESCOLHIDAS</span><strong>{draftedCount.toString().padStart(2, "0")}</strong></div>
            </div>

            <div className="draft-team-preview">
              <div className="draft-team-preview-heading">
                <h2><Monogram label="EQ" /> Equipes do torneio</h2>
                <span>{hasSavedDraft ? "Dados sincronizados com o Draft" : "Dados iniciais do projeto"}</span>
              </div>
              {draftReadError ? (
                <p className="draft-overview-message error">Não foi possível ler os dados salvos. Abra o Draft para verificar o armazenamento local.</p>
              ) : (
                <div className="draft-team-list">
                  {draftOverview.teams.slice(0, 4).map((team) => (
                    <div className="draft-team-item" key={team.id}>
                      <span className="draft-team-icon" aria-hidden="true">{team.name.trim().split(/\s+/).slice(0, 2).map((part) => part[0]).join("").toUpperCase()}</span>
                      <span><strong>{team.name}</strong><small>Capitã(o): {team.captain}</small></span>
                      <b>{team.players.length} {team.players.length === 1 ? "pick" : "picks"}</b>
                    </div>
                  ))}
                  {draftOverview.teams.length > 4 && <p className="draft-team-more">+ {draftOverview.teams.length - 4} equipes. Veja o roster completo no Draft.</p>}
                  {draftOverview.teams.length === 0 && <p className="draft-overview-message">Nenhuma equipe cadastrada. Adicione equipes no Draft.</p>}
                </div>
              )}
            </div>
          </section>

          <section className="page-heading">
            <div>
              <div className="eyebrow"><Monogram label="CT" /> CONFIGURAÇÃO DO TORNEIO</div>
              <h2>Gerenciar categorias</h2>
              <p>Organize as funções que estruturam as equipes de {draftOverview.project.name}.</p>
            </div>
            <button className="primary-button" onClick={addCategory}><Monogram label="AD" />Nova categoria</button>
          </section>

          <section className="summary-strip" aria-label="Resumo das categorias">
            <div className="summary-item"><span className="summary-label">CATEGORIAS</span><strong>{categories.length.toString().padStart(2, "0")}</strong><span className="summary-caption">no torneio</span></div>
            <div className="summary-item"><span className="summary-label">ATIVAS</span><strong className="summary-blue">{activeCount.toString().padStart(2, "0")}</strong><span className="summary-caption">disponíveis para o draft</span></div>
            <div className="summary-item summary-note"><span className="summary-icon"><Monogram label="MR" /></span><span><strong>Funções de Marvel Rivals</strong><small>Duelista · Estrategista · Vanguarda</small></span></div>
          </section>

          <section className="manager-section" aria-label="Gerenciador de categorias">
            <div className="category-column">
              <div className="section-heading">
                <div><h2>Suas categorias</h2><span>{filteredCategories.length} de {categories.length} itens</span></div>
                <label className="search-box"><Monogram label="BU" /><input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Buscar categoria" aria-label="Buscar categoria" /></label>
              </div>

              <div className="category-list">
                {filteredCategories.map((category) => {
                  const role = roleDetails[category.role];
                  return (
                    <div className={`category-row ${selected?.id === category.id ? "selected" : ""}`} key={category.id}>
                      <button className="category-select" onClick={() => selectCategory(category)} aria-pressed={selected?.id === category.id}>
                        <span className="role-icon" aria-hidden="true">{role.mark}</span>
                        <span className="category-copy"><strong>{category.name}</strong><small>{role.name}</small></span>
                        {selected?.id === category.id && <span className="selected-mark">OK</span>}
                      </button>
                      <button className={`switch ${category.active ? "on" : ""}`} role="switch" aria-checked={category.active} aria-label={`${category.active ? "Desativar" : "Ativar"} ${category.name}`} onClick={() => toggleCategory(category)}>
                        <span />
                      </button>
                    </div>
                  );
                })}
                {filteredCategories.length === 0 && <div className="empty-state">Nenhuma categoria encontrada.</div>}
              </div>

              <button className="add-row" onClick={addCategory}><Monogram label="AD" />Adicionar categoria</button>
              <div className="list-footnote"><span className="status-dot" />Alterações salvas neste navegador</div>
            </div>

            <div className="editor-column">
              {selected ? (
                <form onSubmit={saveCategory}>
                  <div className="editor-heading">
                    <div><span className="editor-kicker">DETALHES DA CATEGORIA</span><h2>Editar categoria</h2></div>
                    <button className="icon-button danger" type="button" title="Excluir categoria" aria-label="Excluir categoria" onClick={deleteCategory}>EX</button>
                  </div>

                  <div className="role-preview">
                    <div className="preview-halo" aria-hidden="true">{roleDetails[currentDraft?.role ?? selected.role].mark}</div>
                    <div><span className="preview-label">ÍCONE DE FUNÇÃO</span><strong>{roleDetails[currentDraft?.role ?? selected.role].name}</strong><small>{roleDetails[currentDraft?.role ?? selected.role].hint}</small></div>
                  </div>

                  <label className="field-label" htmlFor="category-name">Nome da categoria</label>
                  <input id="category-name" className="text-input" value={currentDraft?.name ?? ""} onChange={(event) => { if (currentDraft) setDraft({ ...currentDraft, name: event.target.value }); setSaved(false); }} maxLength={40} required />

                  <label className="field-label" htmlFor="category-role">Função vinculada</label>
                  <div className="select-wrap"><select id="category-role" className="text-input" value={currentDraft?.role ?? "duelist"} onChange={(event) => { if (currentDraft) setDraft({ ...currentDraft, role: event.target.value as Role }); setSaved(false); }}>
                    {Object.entries(roleDetails).map(([key, role]) => <option key={key} value={key}>{role.name}</option>)}
                  </select><span className="select-chevron" aria-hidden="true">V</span></div>

                  <label className="field-label" htmlFor="category-description">Descrição</label>
                  <textarea id="category-description" className="text-input textarea" value={currentDraft?.description ?? ""} onChange={(event) => { if (currentDraft) setDraft({ ...currentDraft, description: event.target.value }); setSaved(false); }} maxLength={120} rows={3} />

                  <div className="editor-actions">
                    <span className="save-message" aria-live="polite">{saved ? <>OK · Salvo</> : ""}</span>
                    <button className="save-button" type="submit"><Monogram label="OK" />Salvar alterações</button>
                  </div>
                </form>
              ) : (
                <div className="editor-empty"><Monogram label="CT" /><h2>Nenhuma categoria selecionada</h2><p>Crie uma categoria para começar a organizar as funções do torneio.</p><button className="primary-button" onClick={addCategory}><Monogram label="AD" />Nova categoria</button></div>
              )}
            </div>
          </section>
          <footer className="page-footer"><span>{draftOverview.project.name.toUpperCase()} <b>·</b> ADMINISTRAÇÃO</span><span>Funções de Marvel Rivals · iniciais das categorias</span></footer>
        </div>
      </main>
    </div>
  );
}
