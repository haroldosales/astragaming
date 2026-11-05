"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useState, useSyncExternalStore } from "react";
import {
  ArrowUpRight,
  Check,
  ChevronDown,
  CircleHelp,
  Layers3,
  Plus,
  Search,
  Shield,
  Swords,
  Trash2,
  UsersRound,
  WandSparkles,
} from "lucide-react";

type Role = "duelist" | "strategist" | "vanguard";

type Category = {
  id: string;
  name: string;
  role: Role;
  description: string;
  active: boolean;
};

type CategoryDraft = Pick<Category, "name" | "role" | "description">;

const roleDetails: Record<Role, { name: string; icon: string; hint: string }> = {
  duelist: {
    name: "Duelista",
    icon: "https://rivalskins.com/wp-content/uploads/marvel-assets/assets/role-icons/Duelist.png",
    hint: "Dano e pressão na linha de frente.",
  },
  strategist: {
    name: "Estrategista",
    icon: "https://rivalskins.com/wp-content/uploads/marvel-assets/assets/role-icons/Strategist.png",
    hint: "Suporte tático e sustentação da equipe.",
  },
  vanguard: {
    name: "Vanguarda",
    icon: "https://rivalskins.com/wp-content/uploads/marvel-assets/assets/role-icons/Vanguard.png",
    hint: "Resistência e controle de espaço.",
  },
};

const initialCategories: Category[] = [
  { id: "duelistas", name: "Duelistas", role: "duelist", description: "Dano e pressão na linha de frente.", active: true },
  { id: "estrategistas", name: "Estrategistas", role: "strategist", description: "Suporte tático e sustentação da equipe.", active: true },
  { id: "vanguardas", name: "Vanguardas", role: "vanguard", description: "Resistência e controle de espaço.", active: true },
];

const storageKey = "astra-gaming-categories";
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

export default function Home() {
  const [categories, setCategories] = useState<Category[]>(getInitialCategories);
  const [selectedId, setSelectedId] = useState("duelistas");
  const [search, setSearch] = useState("");
  const [draft, setDraft] = useState<CategoryDraft | null>(null);
  const [saved, setSaved] = useState(false);
  const hydrated = useSyncExternalStore(subscribeHydration, getHydrationSnapshot, getServerHydrationSnapshot);

  useEffect(() => {
    if (hydrated) window.localStorage.setItem(storageKey, JSON.stringify(categories));
  }, [categories, hydrated]);

  const selected = categories.find((category) => category.id === selectedId) ?? categories[0] ?? null;
  const currentDraft = selected
    ? draft ?? { name: selected.name, role: selected.role, description: selected.description }
    : null;
  const filteredCategories = categories.filter((category) =>
    category.name.toLowerCase().includes(search.toLowerCase()),
  );
  const activeCount = categories.filter((category) => category.active).length;

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
    <div className="app-shell">
      <aside className="sidebar">
        <Link className="brand" href="/" aria-label="Astra Gaming, início">
          <span className="brand-mark"><WandSparkles size={17} /></span>
          <span className="brand-copy"><strong>ASTRA GAMING</strong><small>PAINEL DE CONTROLE</small></span>
        </Link>

        <div className="nav-label">GERENCIAMENTO</div>
        <nav className="side-nav" aria-label="Navegação principal">
          <Link className="nav-item active" href="/" aria-current="page"><Layers3 size={17} />Categorias</Link>
          <a className="nav-item" href="/draft.html"><UsersRound size={17} />Draft<ArrowUpRight size={14} className="nav-external" /></a>
        </nav>

        <div className="sidebar-spacer" />
        <a className="reference-link" href="https://rivalskins.com/assets/role-icons/" target="_blank" rel="noreferrer">
          <CircleHelp size={16} /> Referência de funções <ArrowUpRight size={13} />
        </a>
        <div className="sidebar-footer"><span className="status-dot" />Sistema operacional <span>v1.0</span></div>
      </aside>

      <main className="workspace">
        <header className="topbar">
          <div className="breadcrumb"><span>ASTRA GAMING</span><span className="breadcrumb-separator">/</span><strong>Categorias</strong></div>
          <div className="topbar-right"><span className="live-dot" />DRAFT 2026</div>
        </header>

        <div className="page-content">
          <section className="page-heading">
            <div>
              <div className="eyebrow"><Shield size={13} /> CONFIGURAÇÃO DO TORNEIO</div>
              <h1>Gerenciar categorias</h1>
              <p>Organize as funções que estruturam as equipes da Astra Gaming.</p>
            </div>
            <button className="primary-button" onClick={addCategory}><Plus size={16} />Nova categoria</button>
          </section>

          <section className="summary-strip" aria-label="Resumo das categorias">
            <div className="summary-item"><span className="summary-label">CATEGORIAS</span><strong>{categories.length.toString().padStart(2, "0")}</strong><span className="summary-caption">no torneio</span></div>
            <div className="summary-item"><span className="summary-label">ATIVAS</span><strong className="summary-blue">{activeCount.toString().padStart(2, "0")}</strong><span className="summary-caption">disponíveis para o draft</span></div>
            <div className="summary-item summary-note"><span className="summary-icon"><Swords size={17} /></span><span><strong>Funções de Marvel Rivals</strong><small>Duelista · Estrategista · Vanguarda</small></span></div>
          </section>

          <section className="manager-section" aria-label="Gerenciador de categorias">
            <div className="category-column">
              <div className="section-heading">
                <div><h2>Suas categorias</h2><span>{filteredCategories.length} de {categories.length} itens</span></div>
                <label className="search-box"><Search size={15} /><input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Buscar categoria" aria-label="Buscar categoria" /></label>
              </div>

              <div className="category-list">
                {filteredCategories.map((category) => {
                  const role = roleDetails[category.role];
                  return (
                    <div className={`category-row ${selected?.id === category.id ? "selected" : ""}`} key={category.id}>
                      <button className="category-select" onClick={() => selectCategory(category)} aria-pressed={selected?.id === category.id}>
                        <span className="role-icon"><Image src={role.icon} alt="" width={42} height={42} unoptimized /></span>
                        <span className="category-copy"><strong>{category.name}</strong><small>{role.name}</small></span>
                        {selected?.id === category.id && <span className="selected-mark"><Check size={13} /></span>}
                      </button>
                      <button className={`switch ${category.active ? "on" : ""}`} role="switch" aria-checked={category.active} aria-label={`${category.active ? "Desativar" : "Ativar"} ${category.name}`} onClick={() => toggleCategory(category)}>
                        <span />
                      </button>
                    </div>
                  );
                })}
                {filteredCategories.length === 0 && <div className="empty-state">Nenhuma categoria encontrada.</div>}
              </div>

              <button className="add-row" onClick={addCategory}><Plus size={15} />Adicionar categoria</button>
              <div className="list-footnote"><span className="status-dot" />Alterações salvas neste navegador</div>
            </div>

            <div className="editor-column">
              {selected ? (
                <form onSubmit={saveCategory}>
                  <div className="editor-heading">
                    <div><span className="editor-kicker">DETALHES DA CATEGORIA</span><h2>Editar categoria</h2></div>
                    <button className="icon-button danger" type="button" title="Excluir categoria" aria-label="Excluir categoria" onClick={deleteCategory}><Trash2 size={16} /></button>
                  </div>

                  <div className="role-preview">
                    <div className="preview-halo"><Image src={roleDetails[currentDraft?.role ?? selected.role].icon} alt={roleDetails[currentDraft?.role ?? selected.role].name} width={92} height={92} unoptimized /></div>
                    <div><span className="preview-label">ÍCONE DE FUNÇÃO</span><strong>{roleDetails[currentDraft?.role ?? selected.role].name}</strong><small>{roleDetails[currentDraft?.role ?? selected.role].hint}</small></div>
                  </div>

                  <label className="field-label" htmlFor="category-name">Nome da categoria</label>
                  <input id="category-name" className="text-input" value={currentDraft?.name ?? ""} onChange={(event) => { if (currentDraft) setDraft({ ...currentDraft, name: event.target.value }); setSaved(false); }} maxLength={40} required />

                  <label className="field-label" htmlFor="category-role">Função vinculada</label>
                  <div className="select-wrap"><select id="category-role" className="text-input" value={currentDraft?.role ?? "duelist"} onChange={(event) => { if (currentDraft) setDraft({ ...currentDraft, role: event.target.value as Role }); setSaved(false); }}>
                    {Object.entries(roleDetails).map(([key, role]) => <option key={key} value={key}>{role.name}</option>)}
                  </select><ChevronDown size={16} /></div>

                  <label className="field-label" htmlFor="category-description">Descrição</label>
                  <textarea id="category-description" className="text-input textarea" value={currentDraft?.description ?? ""} onChange={(event) => { if (currentDraft) setDraft({ ...currentDraft, description: event.target.value }); setSaved(false); }} maxLength={120} rows={3} />

                  <div className="editor-actions">
                    <span className="save-message" aria-live="polite">{saved ? <><Check size={14} /> Salvo</> : ""}</span>
                    <button className="save-button" type="submit"><Check size={15} />Salvar alterações</button>
                  </div>
                </form>
              ) : (
                <div className="editor-empty"><Layers3 size={26} /><h2>Nenhuma categoria selecionada</h2><p>Crie uma categoria para começar a organizar as funções do torneio.</p><button className="primary-button" onClick={addCategory}><Plus size={16} />Nova categoria</button></div>
              )}
            </div>
          </section>
          <footer className="page-footer"><span>ASTRA GAMING <b>·</b> ADMINISTRAÇÃO</span><span>Ícones por <a href="https://rivalskins.com/assets/role-icons/" target="_blank" rel="noreferrer">RivalSkins <ArrowUpRight size={11} /></a></span></footer>
        </div>
      </main>
    </div>
  );
}
