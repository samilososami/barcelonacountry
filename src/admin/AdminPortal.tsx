import {
  useEffect,
  useMemo,
  useRef,
  useState,
  type CSSProperties,
  type FormEvent,
  type ReactNode
} from "react";
import type { Session } from "@supabase/supabase-js";
import { supabase } from "../lib/supabase";
import type { Registration, RegistrationInsert, RegistrationUpdate } from "../lib/database.types";
import { executeRegistrationSql } from "../lib/sqlConsole";
import { countryFlag, getPhoneCountry, phoneCountries, phoneDisplayParts } from "../lib/phoneCountries";
import "./admin.css";
import { NewsletterManager } from "./NewsletterManager";

type AuthStatus = "loading" | "authenticated" | "unauthenticated";
type AdminTab = "registry" | "database" | "newsletters";
type SortOption = "date-desc" | "date-asc" | "name-asc" | "name-desc" | "email-asc";

const sortLabels: Record<SortOption, string> = {
  "date-desc": "Más recientes",
  "date-asc": "Más antiguos",
  "name-asc": "Nombre A–Z",
  "name-desc": "Nombre Z–A",
  "email-asc": "Correo A–Z"
};

const schemaSql = `CREATE TABLE public.registrations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  full_name text NOT NULL,
  email text NOT NULL,
  phone text NOT NULL,
  country_iso text,
  dance_location text,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.registrations ENABLE ROW LEVEL SECURITY;
CREATE UNIQUE INDEX registrations_email_unique_idx
  ON public.registrations (lower(btrim(email)));`;

const routeFromLocation = () => {
  if (["/dashboard", "/dashbord", "/admin/newsletters"].includes(window.location.pathname)) {
    return "dashboard" as const;
  }
  return "login" as const;
};

const navigate = (path: "/login" | "/dashboard" | "/dashboard#newsletters", replace = true) => {
  window.history[replace ? "replaceState" : "pushState"]({}, "", path);
  window.dispatchEvent(new PopStateEvent("popstate"));
};

const formatDate = (date: string) =>
  new Intl.DateTimeFormat("es-ES", {
    dateStyle: "medium",
    timeStyle: "medium",
    timeZone: "Europe/Madrid"
  }).format(new Date(date));

const sqlEscape = (value: string) => value.replaceAll("'", "''");

function BrandLockup({ compact = false }: { compact?: boolean }) {
  return (
    <div className={`admin-brand ${compact ? "is-compact" : ""}`} aria-label="Barcelona Country Festival">
      <img src="/assets/brand-logo.png" alt="Barcelona Country Festival" />
      {!compact && <small>ADMIN</small>}
    </div>
  );
}

function LoadingScreen() {
  return (
    <main className="admin-shell admin-loading-screen">
      <div className="admin-loading-mark" aria-label="Comprobando sesión">
        <span />
        <span />
        <span />
      </div>
    </main>
  );
}

function LoginPage({ initialError }: { initialError?: string }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState(initialError ?? "");

  const handleLogin = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError("");
    setIsSubmitting(true);

    const { error: signInError } = await supabase.auth.signInWithPassword({
      email: email.trim(),
      password
    });

    if (signInError) {
      setError("El correo o la contraseña no son correctos.");
      setIsSubmitting(false);
    }
  };

  return (
    <main className="admin-shell login-page">
      <div className="admin-star-field" aria-hidden="true" />
      <section className="login-layout" aria-labelledby="login-title">
        <div className="login-poster">
          <a className="back-to-site" href="/">
            <span aria-hidden="true">←</span> Volver al festival
          </a>
          <BrandLockup />
          <p>Gestión privada de asistentes y registros del festival.</p>
          <div className="login-poster-line" aria-hidden="true">
            <span />
            <strong>BCN · 2027</strong>
          </div>
        </div>

        <div className="login-panel">
          <div className="login-panel-heading">
            <span className="login-kicker">ÁREA PRIVADA</span>
            <h1 id="login-title">Acceso de gestión</h1>
            <p>Introduce tus credenciales para continuar al registro.</p>
          </div>

          <form className="login-form" onSubmit={handleLogin}>
            <label htmlFor="admin-email">Correo electrónico</label>
            <input
              id="admin-email"
              name="email"
              type="email"
              value={email}
              autoComplete="email"
              onChange={(event) => setEmail(event.target.value)}
              required
              autoFocus
            />

            <label htmlFor="admin-password">Contraseña</label>
            <div className="password-field">
              <input
                id="admin-password"
                name="password"
                type={showPassword ? "text" : "password"}
                value={password}
                autoComplete="current-password"
                onChange={(event) => setPassword(event.target.value)}
                required
              />
              <button type="button" onClick={() => setShowPassword((visible) => !visible)}>
                {showPassword ? "Ocultar" : "Mostrar"}
              </button>
            </div>

            {error && <p className="auth-error" role="alert">{error}</p>}

            <button className="admin-primary-button login-submit" type="submit" disabled={isSubmitting}>
              {isSubmitting ? "Comprobando…" : "Entrar al panel"}
              <span aria-hidden="true">→</span>
            </button>
          </form>

          <p className="login-security-note">
            <span aria-hidden="true">◆</span> Sesión protegida por Supabase Auth y políticas RLS.
          </p>
        </div>
      </section>
    </main>
  );
}

function Modal({ title, eyebrow, onClose, children }: { title: string; eyebrow: string; onClose: () => void; children: ReactNode }) {
  const closeButtonRef = useRef<HTMLButtonElement | null>(null);

  useEffect(() => {
    closeButtonRef.current?.focus();
    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };
    window.addEventListener("keydown", closeOnEscape);
    return () => window.removeEventListener("keydown", closeOnEscape);
  }, [onClose]);

  return (
    <div className="admin-modal-backdrop" role="presentation" onMouseDown={(event) => {
      if (event.currentTarget === event.target) onClose();
    }}>
      <section className="admin-modal" role="dialog" aria-modal="true" aria-labelledby="admin-modal-title">
        <header>
          <div>
            <span>{eyebrow}</span>
            <h2 id="admin-modal-title">{title}</h2>
          </div>
          <button ref={closeButtonRef} className="modal-close" type="button" onClick={onClose} aria-label="Cerrar">
            ×
          </button>
        </header>
        {children}
      </section>
    </div>
  );
}

function RegistrationFormModal({
  registration,
  onClose,
  onSaved
}: {
  registration: Registration | null;
  onClose: () => void;
  onSaved: (message: string) => Promise<void>;
}) {
  const [fullName, setFullName] = useState(registration?.full_name ?? "");
  const [email, setEmail] = useState(registration?.email ?? "");
  const [phone, setPhone] = useState(registration?.phone ?? "");
  const [danceLocation, setDanceLocation] = useState(registration?.dance_location ?? "");
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState("");

  const handleSave = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setIsSaving(true);
    setError("");

    const payload = {
      full_name: fullName.trim(),
      email: email.trim().toLowerCase(),
      phone: phone.trim(),
      dance_location: danceLocation.trim() || null
    };

    const result = registration
      ? await supabase.from("registrations").update(payload as RegistrationUpdate).eq("id", registration.id)
      : await supabase.from("registrations").insert(payload as RegistrationInsert);

    if (result.error) {
      setError(result.error.code === "23505" ? "Ya existe un registro con ese correo." : result.error.message);
      setIsSaving(false);
      return;
    }

    await onSaved(registration ? "Registro actualizado." : "Registro añadido.");
    onClose();
  };

  return (
    <Modal
      eyebrow={registration ? "EDITAR REGISTRO" : "NUEVO REGISTRO"}
      title={registration ? "Actualizar asistente" : "Añadir asistente"}
      onClose={onClose}
    >
      <form className="admin-modal-form" onSubmit={handleSave}>
        <label htmlFor="modal-name">Nombre y apellidos</label>
        <input id="modal-name" value={fullName} onChange={(event) => setFullName(event.target.value)} required maxLength={160} />

        <div className="modal-field-grid">
          <div>
            <label htmlFor="modal-email">Correo electrónico</label>
            <input id="modal-email" type="email" value={email} onChange={(event) => setEmail(event.target.value)} required maxLength={320} />
          </div>
          <div>
            <label htmlFor="modal-phone">Número de teléfono</label>
            <input id="modal-phone" type="tel" value={phone} onChange={(event) => setPhone(event.target.value)} required maxLength={40} />
          </div>
        </div>

        <label htmlFor="modal-dance-location">¿Dónde suele bailar?</label>
        <input
          id="modal-dance-location"
          value={danceLocation}
          onChange={(event) => setDanceLocation(event.target.value)}
          maxLength={180}
          placeholder="Sala, escuela, asociación o ciudad"
        />

        {error && <p className="modal-form-error" role="alert">{error}</p>}
        <footer>
          <button className="admin-secondary-button" type="button" onClick={onClose}>Cancelar</button>
          <button className="admin-primary-button" type="submit" disabled={isSaving}>
            {isSaving ? "Guardando…" : registration ? "Guardar cambios" : "Añadir registro"}
          </button>
        </footer>
      </form>
    </Modal>
  );
}

function DeleteModal({ registration, onClose, onDeleted }: { registration: Registration; onClose: () => void; onDeleted: () => Promise<void> }) {
  const [isDeleting, setIsDeleting] = useState(false);
  const [error, setError] = useState("");

  const deleteRegistration = async () => {
    setIsDeleting(true);
    const { error: deleteError } = await supabase.from("registrations").delete().eq("id", registration.id);
    if (deleteError) {
      setError(deleteError.message);
      setIsDeleting(false);
      return;
    }
    await onDeleted();
    onClose();
  };

  return (
    <Modal eyebrow="CONFIRMAR BORRADO" title="¿Eliminar este registro?" onClose={onClose}>
      <div className="delete-confirmation">
        <div className="delete-warning" aria-hidden="true">!</div>
        <p>
          Vas a eliminar a <strong>{registration.full_name}</strong>. Esta acción no se puede deshacer.
        </p>
        <dl>
          <div><dt>Correo</dt><dd>{registration.email}</dd></div>
          <div><dt>Teléfono</dt><dd>{registration.phone}</dd></div>
        </dl>
        {error && <p className="modal-form-error" role="alert">{error}</p>}
        <footer>
          <button className="admin-secondary-button" type="button" onClick={onClose}>Conservar</button>
          <button className="danger-button" type="button" onClick={deleteRegistration} disabled={isDeleting}>
            {isDeleting ? "Eliminando…" : "Sí, eliminar"}
          </button>
        </footer>
      </div>
    </Modal>
  );
}

function RegistryTab({ registrations, isLoading, onReload, notify }: {
  registrations: Registration[];
  isLoading: boolean;
  onReload: () => Promise<void>;
  notify: (message: string) => void;
}) {
  const [query, setQuery] = useState("");
  const [countryFilter, setCountryFilter] = useState("all");
  const [sort, setSort] = useState<SortOption>("date-desc");
  const [isSortOpen, setIsSortOpen] = useState(false);
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [editing, setEditing] = useState<Registration | null>(null);
  const [deleting, setDeleting] = useState<Registration | null>(null);

  const visibleRegistrations = useMemo(() => {
    const normalizedQuery = query.trim().toLocaleLowerCase("es");
    const filtered = registrations.filter((registration) => {
      const country = getPhoneCountry(registration.phone, registration.country_iso);
      const searchableCountry = country ? `${country.name} ${country.dial} ${country.iso}` : "";
      const matchesQuery = [registration.full_name, registration.email, registration.phone, registration.dance_location ?? "", searchableCountry]
        .some((value) => value.toLocaleLowerCase("es").includes(normalizedQuery));
      const matchesCountry = countryFilter === "all" || country?.iso === countryFilter;
      return matchesQuery && matchesCountry;
    });

    return [...filtered].sort((left, right) => {
      if (sort === "date-desc") return Date.parse(right.created_at) - Date.parse(left.created_at);
      if (sort === "date-asc") return Date.parse(left.created_at) - Date.parse(right.created_at);
      if (sort === "name-desc") return right.full_name.localeCompare(left.full_name, "es");
      if (sort === "email-asc") return left.email.localeCompare(right.email, "es");
      return left.full_name.localeCompare(right.full_name, "es");
    });
  }, [countryFilter, query, registrations, sort]);

  const availableCountries = phoneCountries;

  const saved = async (message: string) => {
    await onReload();
    notify(message);
  };

  return (
    <section className="registry-panel" aria-labelledby="registry-title">
      <header className="panel-heading">
        <div>
          <span>DIRECTORIO</span>
          <h2 id="registry-title">Personas registradas</h2>
          <p>Datos capturados desde “Mantente informado” y entradas manuales.</p>
        </div>
        <button className="admin-primary-button add-registration" type="button" onClick={() => setIsAddOpen(true)}>
          <span aria-hidden="true">+</span> Nuevo registro
        </button>
      </header>

      <div className="registry-toolbar">
        <label className="admin-search">
          <span aria-hidden="true">⌕</span>
          <input
            type="search"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Buscar por nombre, correo, teléfono, país o lugar de baile…"
            aria-label="Buscar registros"
          />
          {query && <button type="button" onClick={() => setQuery("")} aria-label="Limpiar búsqueda">×</button>}
        </label>

        <label className="country-filter">
          <span>País</span>
          <select value={countryFilter} onChange={(event) => setCountryFilter(event.target.value)} aria-label="Filtrar por país">
            <option value="all">Todos los países</option>
            {availableCountries.map((country) => (
              <option value={country.iso} key={country.iso}>{countryFlag(country.iso)} {country.name} ({country.dial})</option>
            ))}
          </select>
        </label>

        <div className="sort-control">
          <button className="sort-trigger" type="button" aria-expanded={isSortOpen} onClick={() => setIsSortOpen((open) => !open)}>
            <span aria-hidden="true">↕</span> {sortLabels[sort]} <b aria-hidden="true">⌄</b>
          </button>
          {isSortOpen && (
            <div className="sort-menu">
              {(Object.keys(sortLabels) as SortOption[]).map((option) => (
                <button
                  type="button"
                  key={option}
                  className={option === sort ? "is-selected" : ""}
                  onClick={() => { setSort(option); setIsSortOpen(false); }}
                >
                  {sortLabels[option]} {option === sort && <span>✓</span>}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      <div className="registry-summary">
        <span>{visibleRegistrations.length} de {registrations.length} registros</span>
        <span>Hora mostrada: Europe/Madrid</span>
      </div>

      <div className="table-wrap">
        <table className="registrations-table">
          <thead>
            <tr>
              <th>Nombre</th>
              <th>Correo electrónico</th>
              <th>Teléfono</th>
              <th>Dónde suele bailar</th>
              <th>Fecha y hora de registro</th>
              <th><span className="sr-only">Acciones</span></th>
            </tr>
          </thead>
          <tbody>
            {visibleRegistrations.map((registration) => (
              <tr key={registration.id}>
                <td data-label="Nombre"><strong>{registration.full_name}</strong></td>
                <td data-label="Correo"><a href={`mailto:${registration.email}`}>{registration.email}</a></td>
                <td data-label="Teléfono">
                  {(() => {
                    const phone = phoneDisplayParts(registration.phone, registration.country_iso);
                    return (
                      <a className="registration-phone" href={`tel:${registration.phone.replace(/\s/g, "")}`}>
                        {phone.country && <span className="country-flag" title={phone.country.name} aria-label={phone.country.name}>{countryFlag(phone.country.iso)}</span>}
                        {phone.prefix && <strong>{phone.prefix}</strong>}
                        <span>{phone.rest}</span>
                      </a>
                    );
                  })()}
                </td>
                <td className="registration-dance-location" data-label="Dónde baila">
                  {registration.dance_location || <span>Sin indicar</span>}
                </td>
                <td data-label="Registro"><time dateTime={registration.created_at}>{formatDate(registration.created_at)}</time></td>
                <td className="row-actions">
                  <button
                    className="edit-row"
                    type="button"
                    onClick={() => setEditing(registration)}
                    aria-label={`Editar a ${registration.full_name}`}
                    title="Editar registro"
                  >
                    <svg viewBox="0 0 24 24" aria-hidden="true">
                      <path d="M4 20h4.3L19 9.3 14.7 5 4 15.7V20Z" />
                      <path d="m12.8 6.9 4.3 4.3" />
                    </svg>
                  </button>
                  <button
                    className="delete-row"
                    type="button"
                    onClick={() => setDeleting(registration)}
                    aria-label={`Borrar a ${registration.full_name}`}
                    title="Borrar registro"
                  >
                    <svg viewBox="0 0 24 24" aria-hidden="true">
                      <path d="M5 7h14" />
                      <path d="M9 7V4h6v3" />
                      <path d="m7 7 1 13h8l1-13" />
                      <path d="M10 11v5M14 11v5" />
                    </svg>
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {!isLoading && !visibleRegistrations.length && (
          <div className="empty-table">
            <span aria-hidden="true">☆</span>
            <h3>{query || countryFilter !== "all" ? "No hay coincidencias" : "Todavía no hay registros"}</h3>
            <p>{query || countryFilter !== "all" ? "Prueba con otro nombre, correo, teléfono, país o lugar de baile." : "Los nuevos formularios aparecerán aquí."}</p>
          </div>
        )}
        {isLoading && <div className="table-loading">Actualizando registros…</div>}
      </div>

      {isAddOpen && <RegistrationFormModal registration={null} onClose={() => setIsAddOpen(false)} onSaved={saved} />}
      {editing && <RegistrationFormModal registration={editing} onClose={() => setEditing(null)} onSaved={saved} />}
      {deleting && (
        <DeleteModal
          registration={deleting}
          onClose={() => setDeleting(null)}
          onDeleted={async () => { await onReload(); notify("Registro eliminado."); }}
        />
      )}
    </section>
  );
}

function DatabaseTab({ registrations, onReload }: { registrations: Registration[]; onReload: () => Promise<void> }) {
  const [sql, setSql] = useState("SELECT * FROM public.registrations ORDER BY created_at DESC;");
  const [output, setOutput] = useState("Listo para ejecutar una consulta segura.");
  const [isRunning, setIsRunning] = useState(false);

  const rowsSql = registrations.length
    ? registrations.map((registration) =>
        `INSERT INTO public.registrations (id, full_name, email, phone, country_iso, dance_location, created_at) VALUES ('${registration.id}', '${sqlEscape(registration.full_name)}', '${sqlEscape(registration.email)}', '${sqlEscape(registration.phone)}', ${registration.country_iso ? `'${sqlEscape(registration.country_iso)}'` : "NULL"}, ${registration.dance_location ? `'${sqlEscape(registration.dance_location)}'` : "NULL"}, '${registration.created_at}');`
      ).join("\n")
    : "-- La tabla no contiene filas todavía.";

  const runSql = async () => {
    setIsRunning(true);
    setOutput("Ejecutando…");
    try {
      const result = await executeRegistrationSql(supabase, sql);
      setOutput(`${result.command}\n${result.message}${result.rows.length ? `\n\n${JSON.stringify(result.rows, null, 2)}` : ""}`);
      if (result.command !== "SELECT" && result.command !== "SELECT COUNT") await onReload();
    } catch (error) {
      setOutput(`ERROR\n${error instanceof Error ? error.message : "No se pudo ejecutar la consulta."}`);
    } finally {
      setIsRunning(false);
    }
  };

  return (
    <section className="database-panel" aria-labelledby="database-title">
      <header className="panel-heading database-heading">
        <div>
          <span>CONSOLA CONTROLADA</span>
          <h2 id="database-title">Base de datos</h2>
          <p>Vista SQL y comandos limitados a <code>public.registrations</code>.</p>
        </div>
        <span className="database-status"><i /> RLS activa</span>
      </header>

      <div className="database-grid">
        <article className="sql-card schema-card">
          <header><span>01</span><h3>Esquema</h3><small>Solo lectura</small></header>
          <pre><code>{schemaSql}</code></pre>
        </article>

        <article className="sql-card rows-card">
          <header><span>02</span><h3>Filas actuales</h3><small>{registrations.length} registros</small></header>
          <pre><code>{rowsSql}</code></pre>
        </article>
      </div>

      <article className="sql-console">
        <header>
          <div><span>03</span><h3>Editor SQL</h3></div>
          <div className="sql-examples">
            <button type="button" onClick={() => setSql("SELECT * FROM public.registrations ORDER BY created_at DESC;")}>SELECT</button>
            <button type="button" onClick={() => setSql("SELECT count(*) FROM public.registrations;")}>COUNT</button>
            <button type="button" onClick={() => setSql("INSERT INTO public.registrations (full_name, email, phone, country_iso, dance_location) VALUES ('Nombre Apellidos', 'correo@ejemplo.com', '+34 600 000 000', 'ES', 'Sala o escuela habitual');")}>INSERT</button>
          </div>
        </header>
        <div className="sql-editor-wrap">
          <span className="sql-line-number">1</span>
          <textarea value={sql} onChange={(event) => setSql(event.target.value)} spellCheck={false} aria-label="Consulta SQL" />
        </div>
        <div className="sql-runbar">
          <p>Permitido: SELECT, INSERT, UPDATE y DELETE sobre registrations.</p>
          <button className="admin-primary-button" type="button" onClick={runSql} disabled={isRunning}>
            <span aria-hidden="true">▶</span> {isRunning ? "Ejecutando…" : "Ejecutar"}
          </button>
        </div>
        <div className="sql-output" aria-live="polite">
          <div><span /> OUTPUT</div>
          <pre>{output}</pre>
        </div>
      </article>
    </section>
  );
}

function Dashboard({ session }: { session: Session }) {
  const [activeTab, setActiveTab] = useState<AdminTab>(window.location.pathname === "/admin/newsletters" || window.location.hash === "#newsletters" ? "newsletters" : "registry");
  const [registrations, setRegistrations] = useState<Registration[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [toast, setToast] = useState("");

  const loadRegistrations = async () => {
    setIsLoading(true);
    const { data, error: queryError } = await supabase
      .from("registrations")
      .select("*")
      .order("created_at", { ascending: false });
    if (queryError) setError(queryError.message);
    else { setRegistrations(data); setError(""); }
    setIsLoading(false);
  };

  useEffect(() => { void loadRegistrations(); }, []);

  useEffect(() => {
    if (!toast) return;
    const timeout = window.setTimeout(() => setToast(""), 2600);
    return () => window.clearTimeout(timeout);
  }, [toast]);

  const todayKey = new Intl.DateTimeFormat("en-CA", { timeZone: "Europe/Madrid" }).format(new Date());
  const todayCount = registrations.filter((registration) =>
    new Intl.DateTimeFormat("en-CA", { timeZone: "Europe/Madrid" }).format(new Date(registration.created_at)) === todayKey
  ).length;

  const logout = async () => {
    await supabase.auth.signOut();
  };

  return (
    <main className="admin-shell dashboard-page">
      <div className="admin-star-field" aria-hidden="true" />
      <header className="dashboard-topbar">
        <BrandLockup compact />
        <div className="dashboard-tabs-shell">
          <div
            className="dashboard-tabs"
            style={{ "--admin-tab-index": activeTab === "registry" ? 0 : activeTab === "database" ? 1 : 2 } as CSSProperties}
            role="tablist"
            aria-label="Secciones del panel"
          >
            <span className="dashboard-tab-indicator" aria-hidden="true" />
            <button type="button" role="tab" aria-selected={activeTab === "registry"} onClick={() => setActiveTab("registry")}>
              Registro
            </button>
            <button type="button" role="tab" aria-selected={activeTab === "database"} onClick={() => setActiveTab("database")}>
              Base de datos
            </button>
            <button type="button" role="tab" aria-selected={activeTab === "newsletters"} onClick={() => setActiveTab("newsletters")}>Newsletters</button>
          </div>
        </div>
        <div className="admin-account">
          <span className="account-avatar">{session.user.email?.slice(0, 1).toUpperCase()}</span>
          <span><small>Administrador</small><strong>{session.user.email}</strong></span>
          <button type="button" onClick={logout}>Salir</button>
        </div>
      </header>

      <div className="dashboard-content">
        <section className="dashboard-intro">
          <div>
            <span className="dashboard-kicker">BARCELONA COUNTRY · ADMIN</span>
            <h1>{activeTab === "registry" ? "Registro de asistentes" : activeTab === "database" ? "Control de datos" : "Publicaciones del festival"}</h1>
          </div>
          <div className="dashboard-stats" aria-label="Resumen">
            <div><strong>{registrations.length}</strong><span>Registros totales</span></div>
            <div><strong>{todayCount}</strong><span>Altas de hoy</span></div>
          </div>
        </section>

        {error && <div className="dashboard-error" role="alert">No se pudieron cargar los datos: {error}</div>}

        <div className="dashboard-panel-transition" key={activeTab}>
          {activeTab === "registry" ? (
            <RegistryTab
              registrations={registrations}
              isLoading={isLoading}
              onReload={loadRegistrations}
              notify={setToast}
            />
          ) : activeTab === "newsletters" ? <NewsletterManager notify={setToast} /> : (
            <DatabaseTab registrations={registrations} onReload={loadRegistrations} />
          )}
        </div>
      </div>

      {toast && <div className="admin-toast" role="status"><span>✓</span>{toast}</div>}
    </main>
  );
}

export function AdminPortal() {
  const requestedNewsletters = useRef(window.location.pathname === "/admin/newsletters" || window.location.hash === "#newsletters");
  const [route, setRoute] = useState(routeFromLocation);
  const [session, setSession] = useState<Session | null>(null);
  const [authStatus, setAuthStatus] = useState<AuthStatus>("loading");
  const [authError, setAuthError] = useState("");

  useEffect(() => {
    document.body.classList.add("admin-body");
    const handlePopState = () => setRoute(routeFromLocation());
    window.addEventListener("popstate", handlePopState);
    if (window.location.pathname === "/dashbord") navigate("/dashboard");
    return () => {
      document.body.classList.remove("admin-body");
      window.removeEventListener("popstate", handlePopState);
    };
  }, []);

  useEffect(() => {
    let isActive = true;

    const validateSession = async (nextSession: Session | null) => {
      if (!isActive) return;
      if (!nextSession) {
        setSession(null);
        setAuthStatus("unauthenticated");
        return;
      }

      const { data, error } = await supabase
        .from("admin_users")
        .select("user_id")
        .eq("user_id", nextSession.user.id)
        .maybeSingle();

      if (!isActive) return;
      if (error || !data) {
        setAuthError("Esta cuenta no tiene permisos de administración.");
        await supabase.auth.signOut();
        setSession(null);
        setAuthStatus("unauthenticated");
        return;
      }

      setAuthError("");
      setSession(nextSession);
      setAuthStatus("authenticated");
    };

    void supabase.auth.getSession().then(({ data }) => validateSession(data.session));
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, nextSession) => {
      window.setTimeout(() => void validateSession(nextSession), 0);
    });

    return () => {
      isActive = false;
      subscription.unsubscribe();
    };
  }, []);

  useEffect(() => {
    if (authStatus === "authenticated" && route === "login") navigate(requestedNewsletters.current ? "/dashboard#newsletters" : "/dashboard");
    if (authStatus === "unauthenticated" && route === "dashboard") navigate("/login");
  }, [authStatus, route]);

  useEffect(() => {
    document.title = route === "dashboard" ? "Gestión · Barcelona Country" : "Acceso · Barcelona Country";
  }, [route]);

  if (authStatus === "loading") return <LoadingScreen />;
  if (authStatus === "authenticated" && session && route === "dashboard") return <Dashboard session={session} />;
  return <LoginPage initialError={authError} />;
}
