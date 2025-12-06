import { useCallback, useEffect, useMemo, useState } from "react";

const API = "api.php";
const ACTIONS = [
  { key: "Entrada", tone: "from-brand-primary to-brand-primary-dark" },
  { key: "Salida Descanso", tone: "from-brand-primary to-brand-accent" },
  { key: "Vuelta Descanso", tone: "from-brand-accent to-brand-primary" },
  { key: "Salida", tone: "from-brand-primary-dark to-brand-dark" },
];

async function apiFetch(method, action, body) {
  const url = action ? `${API}?action=${encodeURIComponent(action)}` : API;
  const options = { method, headers: { "Content-Type": "application/json" } };
  if (body) options.body = JSON.stringify(body);
  const res = await fetch(url, options);
  return res.json();
}

const PunchButtons = ({ onPunch, saving, allowed }) => {
  const allowedSet = new Set(allowed || []);
  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
      {ACTIONS.map((action) => {
        const disabled = saving || (allowedSet.size > 0 && !allowedSet.has(action.key));
        return (
          <button
            key={action.key}
            disabled={disabled}
            onClick={() => onPunch(action.key)}
            className={`group rounded-2xl bg-gradient-to-br ${action.tone} p-[2px] transition hover:-translate-y-1 hover:shadow-lg disabled:cursor-not-allowed disabled:opacity-60`}
          >
            <div className="flex h-28 flex-col items-start justify-between rounded-2xl bg-white/95 px-4 py-3 text-left">
              <p className="text-xs uppercase tracking-[0.15em] text-slate-500">Accion</p>
              <p className="text-lg font-semibold text-brand-dark">{action.key}</p>
              <span className="text-xs font-semibold text-brand-primary">
                {saving ? "Enviando..." : allowedSet.size === 0 || allowedSet.has(action.key) ? "Registrar" : "No permitido"}
              </span>
            </div>
          </button>
        );
      })}
    </div>
  );
};

const LogsTable = ({ logs, title, isAdmin, onEdit, onDelete }) => (
  <div className="rounded-2xl border border-white/80 bg-white/95 p-6 shadow-xl backdrop-blur">
    <div className="mb-4 flex items-center justify-between">
      <div>
        <h3 className="text-lg font-semibold">{title || "Historial de fichajes"}</h3>
        <p className="text-sm text-slate-600">Lectura directa desde PHP/MySQL.</p>
      </div>
    </div>
    <div className="overflow-hidden rounded-xl border border-slate-200">
      <table className="min-w-full divide-y divide-slate-200 text-sm">
        <thead className="bg-slate-50">
          <tr>
            <th className="px-4 py-2 text-left font-semibold text-slate-600">Empleado</th>
            <th className="px-4 py-2 text-left font-semibold text-slate-600">Tipo</th>
            <th className="px-4 py-2 text-left font-semibold text-slate-600">Fecha y hora</th>
            {isAdmin && <th className="px-4 py-2 text-right font-semibold text-slate-600">Acciones</th>}
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100 bg-white">
          {logs.length === 0 && (
            <tr>
              <td className="px-4 py-6 text-center text-slate-500" colSpan={isAdmin ? 4 : 3}>
                Sin fichajes registrados.
              </td>
            </tr>
          )}
          {logs.map((row) => (
            <tr key={row.id}>
              <td className="px-4 py-3">{row.empleado}</td>
              <td className="px-4 py-3 font-semibold text-brand-primary">{row.tipo}</td>
              <td className="px-4 py-3 text-slate-600">{new Date(row.fecha_hora).toLocaleString()}</td>
              {isAdmin && (
                <td className="px-4 py-3 text-right space-x-2">
                  <button
                    onClick={() => onEdit(row)}
                    className="rounded-lg bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-700 hover:bg-slate-200"
                  >
                    Editar
                  </button>
                  <button
                    onClick={() => onDelete(row)}
                    className="rounded-lg bg-brand-alert/90 px-3 py-1 text-xs font-semibold text-white hover:bg-brand-alert"
                  >
                    Borrar
                  </button>
                </td>
              )}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  </div>
);

function getAllowedNext(logs) {
  if (!logs || !logs.length) return ["Entrada"];
  const sorted = [...logs].sort((a, b) => new Date(a.fecha_hora).getTime() - new Date(b.fecha_hora).getTime());
  const last = sorted[sorted.length - 1].tipo;
  if (last === "Entrada") return ["Salida Descanso", "Salida"];
  if (last === "Salida Descanso") return ["Vuelta Descanso"];
  if (last === "Vuelta Descanso") return ["Salida"];
  return [];
}

function LoginView({ onLogin, saving, message }) {
  const [cedula, setCedula] = useState("");
  const [password, setPassword] = useState("");

  async function handleSubmit(e) {
    e.preventDefault();
    const ok = await onLogin(cedula, password);
    if (ok) {
      setCedula("");
      setPassword("");
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center px-4">
      <div className="w-full max-w-md rounded-2xl border border-white/70 bg-white/90 p-6 shadow-xl">
        <h1 className="text-2xl font-bold text-brand-dark mb-2">Ingreso al panel</h1>
        <p className="text-sm text-slate-600 mb-4">Autentica con tu cédula y contraseña.</p>
        <form className="space-y-4" onSubmit={handleSubmit}>
          <div>
            <label className="text-sm font-semibold text-slate-700">Cédula / Usuario</label>
            <input
              type="text"
              className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:border-brand-primary focus:outline-none"
              value={cedula}
              onChange={(e) => setCedula(e.target.value)}
              required
            />
          </div>
          <div>
            <label className="text-sm font-semibold text-slate-700">Contraseña</label>
            <input
              type="password"
              className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:border-brand-primary focus:outline-none"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>
          {message && <p className="text-sm text-brand-alert">{message}</p>}
          <button
            type="submit"
            disabled={saving}
            className="w-full rounded-lg bg-brand-primary px-4 py-2 text-sm font-semibold text-white shadow hover:bg-brand-primary-dark disabled:opacity-60"
          >
            {saving ? "Ingresando..." : "Ingresar"}
          </button>
        </form>
      </div>
    </div>
  );
}

function EmployeeDashboard({ user, logs, loading, saving, onPunch }) {
  const allowedActions = useMemo(() => getAllowedNext(logs), [logs]);

  return (
    <div className="space-y-6">
      <div className="rounded-2xl border border-white/80 bg-white/95 p-6 shadow-xl backdrop-blur">
        <div className="mb-5 flex items-center justify-between">
          <div>
            <h2 className="text-xl font-semibold">Fichar ahora</h2>
            <p className="text-sm text-slate-600">Sesión de {user.nombre}</p>
          </div>
          {loading && (
            <span className="text-xs font-semibold uppercase tracking-[0.15em] text-brand-primary">Cargando...</span>
          )}
        </div>
        <PunchButtons onPunch={onPunch} saving={saving} allowed={allowedActions} />
      </div>
      <LogsTable logs={logs} />
    </div>
  );
}

function AdminDashboard({
  user,
  logs,
  stats,
  loading,
  saving,
  onReloadLogs,
  onReloadStats,
  onCreateEmployee,
  onManualPunch,
  onEditPunch,
  onDeletePunch,
}) {
  const initialEmployee = { nombre: "", cedula: "", password: "", rol: "empleado" };
  const initialManual = { empleado_id: "", tipo: "Entrada", fecha_hora: "" };

  const [newEmp, setNewEmp] = useState(initialEmployee);
  const [manualPunch, setManualPunch] = useState(initialManual);
  const [editPunch, setEditPunch] = useState(null);
  const [selectedEmployeeId, setSelectedEmployeeId] = useState(null);
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");

  const employeeOptions = useMemo(() => {
    if (!stats || !stats.empleados) return [];
    return stats.empleados;
  }, [stats]);

  useEffect(() => {
    onReloadStats();
  }, [onReloadStats]);

  useEffect(() => {
    if (selectedEmployeeId === null && user) {
      setSelectedEmployeeId(user.id);
    }
  }, [selectedEmployeeId, user]);

  useEffect(() => {
    if (selectedEmployeeId) {
      onReloadLogs({ employeeId: selectedEmployeeId, startDate, endDate });
    }
  }, [selectedEmployeeId, startDate, endDate, onReloadLogs]);

  async function handleCreateEmployee(e) {
    e.preventDefault();
    const ok = await onCreateEmployee(newEmp);
    if (ok) {
      setNewEmp(initialEmployee);
    }
  }

  async function handleManualPunch(e) {
    e.preventDefault();
    const payload = { ...manualPunch, empleado_id: Number(manualPunch.empleado_id) };
    const ok = await onManualPunch(payload, selectedEmployeeId || payload.empleado_id, {
      startDate,
      endDate,
    });
    if (ok) {
      setManualPunch(initialManual);
    }
  }

  async function handleEditSubmit(e) {
    e.preventDefault();
    if (!editPunch) return;
    const ok = await onEditPunch(editPunch, selectedEmployeeId || editPunch.empleado_id, {
      startDate,
      endDate,
    });
    if (ok) {
      setEditPunch(null);
    }
  }

  async function handleDelete(row) {
    if (!window.confirm("¿Borrar fichaje?")) return;
    await onDeletePunch(row.id, selectedEmployeeId || row.empleado_id, { startDate, endDate });
  }

  function handleExport() {
    const targetEmployee = selectedEmployeeId || user.id;
    const params = new URLSearchParams();
    params.set("action", "export_csv");
    params.set("empleado_id", targetEmployee);
    if (startDate) params.set("fecha_inicio", startDate);
    if (endDate) params.set("fecha_fin", endDate);
    window.open(`${API}?${params.toString()}`, "_blank");
  }

  return (
    <div className="space-y-6">
      {stats && (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
          <div className="rounded-2xl border border-white/80 bg-white/90 p-4 shadow">
            <p className="text-xs uppercase tracking-[0.15em] text-slate-500">Empleados</p>
            <p className="text-3xl font-bold">{stats.total_empleados}</p>
            <p className="text-xs text-slate-500">Activos en el sistema</p>
          </div>
          <div className="rounded-2xl border border-white/80 bg-white/90 p-4 shadow">
            <p className="text-xs uppercase tracking-[0.15em] text-slate-500">Fichajes Hoy</p>
            <p className="text-3xl font-bold">{stats.fichajes_hoy}</p>
            <p className="text-xs text-slate-500">Últimas 24h</p>
          </div>
          <div className="rounded-2xl border border-white/80 bg-white/90 p-4 shadow">
            <p className="text-xs uppercase tracking-[0.15em] text-slate-500">Último fichaje</p>
            <p className="text-sm font-semibold">
              {stats.ultimos_fichajes && stats.ultimos_fichajes.length > 0
                ? new Date(stats.ultimos_fichajes[0].fecha_hora).toLocaleString()
                : "N/D"}
            </p>
            <p className="text-xs text-slate-500">Tiempo real</p>
          </div>
        </div>
      )}

      <div className="rounded-2xl border border-white/80 bg-white/95 p-6 shadow-xl backdrop-blur">
        <h2 className="text-xl font-semibold mb-4">Registrar nuevo empleado</h2>
        <form className="grid grid-cols-1 gap-4 md:grid-cols-2" onSubmit={handleCreateEmployee}>
          <div>
            <label className="text-sm font-semibold text-slate-700">Nombre completo</label>
            <input
              type="text"
              className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:border-brand-primary focus:outline-none"
              value={newEmp.nombre}
              onChange={(e) => setNewEmp({ ...newEmp, nombre: e.target.value })}
              required
            />
          </div>
          <div>
            <label className="text-sm font-semibold text-slate-700">Cédula / Usuario</label>
            <input
              type="text"
              className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:border-brand-primary focus:outline-none"
              value={newEmp.cedula}
              onChange={(e) => setNewEmp({ ...newEmp, cedula: e.target.value })}
              required
            />
          </div>
          <div>
            <label className="text-sm font-semibold text-slate-700">Contraseña</label>
            <input
              type="password"
              className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:border-brand-primary focus:outline-none"
              value={newEmp.password}
              onChange={(e) => setNewEmp({ ...newEmp, password: e.target.value })}
              required
            />
          </div>
          <div>
            <label className="text-sm font-semibold text-slate-700">Rol</label>
            <select
              className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:border-brand-primary focus:outline-none"
              value={newEmp.rol}
              onChange={(e) => setNewEmp({ ...newEmp, rol: e.target.value })}
            >
              <option value="empleado">Empleado</option>
              <option value="admin">Admin</option>
            </select>
          </div>
          <div className="md:col-span-2 flex justify-end">
            <button
              type="submit"
              disabled={saving}
              className="rounded-lg bg-brand-primary px-4 py-2 text-sm font-semibold text-white shadow hover:bg-brand-primary-dark disabled:opacity-60"
            >
              {saving ? "Guardando..." : "Crear empleado"}
            </button>
          </div>
        </form>
      </div>

      <div className="rounded-2xl border border-white/80 bg-white/95 p-6 shadow-xl backdrop-blur">
        <h2 className="text-xl font-semibold mb-4">Fichaje manual (admin)</h2>
        <form className="grid grid-cols-1 gap-4 md:grid-cols-3" onSubmit={handleManualPunch}>
          <div>
            <label className="text-sm font-semibold text-slate-700">Empleado</label>
            <select
              className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:border-brand-primary focus:outline-none"
              value={manualPunch.empleado_id}
              onChange={(e) => setManualPunch({ ...manualPunch, empleado_id: e.target.value })}
              required
            >
              <option value="">Seleccionar</option>
              {employeeOptions.map((emp) => (
                <option key={emp.id} value={emp.id}>
                  {emp.nombre} ({emp.rol})
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="text-sm font-semibold text-slate-700">Tipo</label>
            <select
              className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:border-brand-primary focus:outline-none"
              value={manualPunch.tipo}
              onChange={(e) => setManualPunch({ ...manualPunch, tipo: e.target.value })}
            >
              {ACTIONS.map((a) => (
                <option key={a.key} value={a.key}>
                  {a.key}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="text-sm font-semibold text-slate-700">Fecha y hora</label>
            <input
              type="datetime-local"
              className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:border-brand-primary focus:outline-none"
              value={manualPunch.fecha_hora}
              onChange={(e) => setManualPunch({ ...manualPunch, fecha_hora: e.target.value })}
              required
            />
          </div>
          <div className="md:col-span-3 flex justify-end">
            <button
              type="submit"
              disabled={saving}
              className="rounded-lg bg-brand-primary px-4 py-2 text-sm font-semibold text-white shadow hover:bg-brand-primary-dark disabled:opacity-60"
            >
              {saving ? "Guardando..." : "Crear fichaje"}
            </button>
          </div>
        </form>
      </div>

      {stats && stats.empleados && (
        <div className="rounded-2xl border border-white/80 bg-white/95 p-6 shadow-xl backdrop-blur">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-xl font-semibold">Empleados</h2>
            <select
              className="rounded-lg border border-slate-200 px-3 py-2 text-sm focus:border-brand-primary focus:outline-none"
              value={selectedEmployeeId || ""}
              onChange={(e) => setSelectedEmployeeId(Number(e.target.value))}
            >
              {employeeOptions.map((emp) => (
                <option key={emp.id} value={emp.id}>
                  {emp.nombre} ({emp.rol})
                </option>
              ))}
            </select>
          </div>
          <div className="overflow-hidden rounded-xl border border-slate-200">
            <table className="min-w-full divide-y divide-slate-200 text-sm">
              <thead className="bg-slate-50">
                <tr>
                  <th className="px-4 py-2 text-left font-semibold text-slate-600">Nombre</th>
                  <th className="px-4 py-2 text-left font-semibold text-slate-600">Cédula</th>
                  <th className="px-4 py-2 text-left font-semibold text-slate-600">Rol</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 bg-white">
                {stats.empleados.map((emp) => (
                  <tr key={emp.id} className={emp.id === selectedEmployeeId ? "bg-slate-50" : ""}>
                    <td className="px-4 py-3">{emp.nombre}</td>
                    <td className="px-4 py-3">{emp.cedula}</td>
                    <td className="px-4 py-3 capitalize">{emp.rol}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      <div className="rounded-2xl border border-white/80 bg-white/95 p-4 shadow-xl backdrop-blur flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div className="flex flex-wrap items-end gap-3">
          <div className="flex flex-col text-sm">
            <label className="text-xs font-semibold text-slate-600">Desde</label>
            <input
              type="date"
              className="mt-1 rounded-lg border border-slate-200 px-3 py-2 text-sm focus:border-brand-primary focus:outline-none"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
            />
          </div>
          <div className="flex flex-col text-sm">
            <label className="text-xs font-semibold text-slate-600">Hasta</label>
            <input
              type="date"
              className="mt-1 rounded-lg border border-slate-200 px-3 py-2 text-sm focus:border-brand-primary focus:outline-none"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
            />
          </div>
        </div>
        <div className="flex gap-2">
          <button
            type="button"
            onClick={handleExport}
            className="rounded-lg bg-brand-primary px-4 py-2 text-sm font-semibold text-white shadow hover:bg-brand-primary-dark"
          >
            Descargar Reporte CSV
          </button>
        </div>
      </div>

      <LogsTable
        logs={logs}
        title="Historial"
        isAdmin
        onEdit={(row) => setEditPunch({ ...row, fecha_hora: row.fecha_hora.replace(" ", "T") })}
        onDelete={handleDelete}
      />

      {editPunch && (
        <div className="rounded-2xl border border-white/80 bg-white/95 p-6 shadow-xl backdrop-blur">
          <h2 className="text-xl font-semibold mb-4">Editar fichaje</h2>
          <form className="grid grid-cols-1 gap-4 md:grid-cols-3" onSubmit={handleEditSubmit}>
            <div>
              <label className="text-sm font-semibold text-slate-700">Tipo</label>
              <select
                className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:border-brand-primary focus:outline-none"
                value={editPunch.tipo}
                onChange={(e) => setEditPunch({ ...editPunch, tipo: e.target.value })}
              >
                {ACTIONS.map((a) => (
                  <option key={a.key} value={a.key}>
                    {a.key}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="text-sm font-semibold text-slate-700">Fecha y hora</label>
              <input
                type="datetime-local"
                className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:border-brand-primary focus:outline-none"
                value={editPunch.fecha_hora}
                onChange={(e) => setEditPunch({ ...editPunch, fecha_hora: e.target.value })}
                required
              />
            </div>
            <div className="md:col-span-3 flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setEditPunch(null)}
                className="rounded-lg bg-slate-200 px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-300"
              >
                Cancelar
              </button>
              <button
                type="submit"
                disabled={saving}
                className="rounded-lg bg-brand-primary px-4 py-2 text-sm font-semibold text-white shadow hover:bg-brand-primary-dark disabled:opacity-60"
              >
                {saving ? "Guardando..." : "Actualizar"}
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}

export default function App() {
  const [user, setUser] = useState(null);
  const [logs, setLogs] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");

  const isAdmin = user && user.rol === "admin";

  const checkSession = useCallback(async () => {
    const res = await apiFetch("GET", "session");
    if (res && res.user) {
      setUser(res.user);
    }
  }, []);

  const loadLogs = useCallback(
    async (filters = {}) => {
      if (!user) return;
      setLoading(true);
      try {
        const params = new URLSearchParams();
        const employeeId = filters.employeeId || user.id;
        if (employeeId) params.set("empleado_id", employeeId);
        if (filters.startDate) params.set("fecha_inicio", filters.startDate);
        if (filters.endDate) params.set("fecha_fin", filters.endDate);
        const url = params.toString() ? `${API}?${params.toString()}` : API;
        const res = await fetch(url);
        const data = await res.json();
        if (data.success) {
          setLogs(data.data || []);
        }
      } catch (error) {
        setMessage("No se pudieron cargar los fichajes");
      } finally {
        setLoading(false);
      }
    },
    [user]
  );

  const loadStats = useCallback(async () => {
    if (!user || user.rol !== "admin") return;
    const res = await apiFetch("GET", "stats");
    if (res && res.success) {
      setStats(res.stats);
    }
  }, [user]);

  useEffect(() => {
    checkSession();
  }, [checkSession]);

  useEffect(() => {
    if (!user) {
      setLogs([]);
      setStats(null);
      return;
    }
    loadLogs({ employeeId: user.id });
    if (user.rol === "admin") {
      loadStats();
    }
  }, [user, loadLogs, loadStats]);

  async function handleLogin(cedula, password) {
    setSaving(true);
    setMessage("");
    const res = await apiFetch("POST", "login", { cedula, password });
    if (res && res.success) {
      setUser(res.user);
      setSaving(false);
      return true;
    }
    setMessage(res.error || "Login invalido");
    setSaving(false);
    return false;
  }

  const handleLogout = useCallback(async () => {
    await apiFetch("POST", "logout");
    setUser(null);
    setLogs([]);
    setStats(null);
    setMessage("");
  }, []);

  const handlePunch = useCallback(
    async (tipo) => {
      if (!user) return false;
      setSaving(true);
      setMessage("");
      const res = await apiFetch("POST", "", { tipo });
      if (res && res.success) {
        setMessage("Fichaje guardado");
        await loadLogs({ employeeId: user.id });
        if (user.rol === "admin") {
          loadStats();
        }
        setSaving(false);
        return true;
      }
      setMessage(res.error || "Error al fichar");
      setSaving(false);
      return false;
    },
    [user, loadLogs, loadStats]
  );

  const handleCreateEmployee = useCallback(
    async (payload) => {
      setSaving(true);
      setMessage("");
      const res = await apiFetch("POST", "create_employee", payload);
      if (res && res.success) {
        setMessage("Empleado creado");
        await loadStats();
        setSaving(false);
        return true;
      }
      setMessage(res.error || "No se pudo crear");
      setSaving(false);
      return false;
    },
    [loadStats]
  );

  const handleManualPunch = useCallback(
    async (payload, employeeId, dateFilters = {}) => {
      setSaving(true);
      setMessage("");
      const res = await apiFetch("POST", "admin_punch", payload);
      if (res && res.success) {
        setMessage("Fichaje manual creado");
        await loadLogs({
          employeeId: employeeId || payload.empleado_id || user.id,
          startDate: dateFilters.startDate,
          endDate: dateFilters.endDate,
        });
        await loadStats();
        setSaving(false);
        return true;
      }
      setMessage(res.error || "No se pudo crear fichaje manual");
      setSaving(false);
      return false;
    },
    [loadLogs, loadStats, user]
  );

  const handleEditPunch = useCallback(
    async (payload, employeeId, dateFilters = {}) => {
      setSaving(true);
      setMessage("");
      const res = await apiFetch("POST", "edit_punch", {
        id: payload.id,
        tipo: payload.tipo,
        fecha_hora: payload.fecha_hora,
      });
      if (res && res.success) {
        setMessage("Fichaje actualizado");
        await loadLogs({
          employeeId: employeeId || payload.empleado_id || user.id,
          startDate: dateFilters.startDate,
          endDate: dateFilters.endDate,
        });
        await loadStats();
        setSaving(false);
        return true;
      }
      setMessage(res.error || "No se pudo actualizar");
      setSaving(false);
      return false;
    },
    [loadLogs, loadStats, user]
  );

  const handleDeletePunch = useCallback(
    async (id, employeeId, dateFilters = {}) => {
      setSaving(true);
      setMessage("");
      const res = await apiFetch("POST", "delete_punch", { id });
      if (res && res.success) {
        setMessage("Fichaje borrado");
        await loadLogs({
          employeeId: employeeId || user.id,
          startDate: dateFilters.startDate,
          endDate: dateFilters.endDate,
        });
        await loadStats();
        setSaving(false);
        return true;
      }
      setMessage(res.error || "No se pudo borrar");
      setSaving(false);
      return false;
    },
    [loadLogs, loadStats, user]
  );

  if (!user) {
    return <LoginView onLogin={handleLogin} saving={saving} message={message} />;
  }

  return (
    <div className="mx-auto max-w-6xl px-4 py-8 space-y-8">
      <header className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">Control de Asistencia</p>
          <h1 className="text-3xl font-bold">Bienvenido, {user.nombre}</h1>
          <p className="text-sm text-slate-600">Rol: {user.rol}</p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={handleLogout}
            className="rounded-full bg-slate-200 px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-300"
          >
            Cerrar sesión
          </button>
        </div>
      </header>

      {message && (
        <div className="rounded-xl border border-brand-alert/30 bg-brand-alert/10 px-4 py-3 text-sm text-brand-dark">
          {message}
        </div>
      )}

      {isAdmin ? (
        <AdminDashboard
          user={user}
          logs={logs}
          stats={stats}
          loading={loading}
          saving={saving}
          onReloadLogs={loadLogs}
          onReloadStats={loadStats}
          onCreateEmployee={handleCreateEmployee}
          onManualPunch={handleManualPunch}
          onEditPunch={handleEditPunch}
          onDeletePunch={handleDeletePunch}
        />
      ) : (
        <EmployeeDashboard user={user} logs={logs} loading={loading} saving={saving} onPunch={handlePunch} />
      )}
    </div>
  );
}
