import { useState, useEffect, useCallback } from "react";
import { supabase } from "./supabase.js";

const fmtDate = (iso) => {
  const d = new Date(iso);
  return d.toLocaleDateString(undefined, { month: "short", day: "numeric", year: "numeric" });
};

export default function App() {
  const [entries, setEntries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [name, setName] = useState("");
  const [value, setValue] = useState("");
  const [search, setSearch] = useState("");
  const [tab, setTab] = useState("board"); // board | add | search
  const [toast, setToast] = useState(null);
  const [error, setError] = useState(null);

  const load = useCallback(async () => {
    const { data, error: err } = await supabase
      .from("entries")
      .select("*")
      .order("created_at", { ascending: true });
    if (err) {
      console.error(err);
      setError("Couldn't load the board.");
    } else {
      setEntries(data ?? []);
      setError(null);
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    load();
    // refresh when the app is reopened from the home screen
    const onFocus = () => load();
    window.addEventListener("focus", onFocus);
    return () => window.removeEventListener("focus", onFocus);
  }, [load]);

  const showToast = (msg) => {
    setToast(msg);
    setTimeout(() => setToast(null), 2200);
  };

  const addEntry = async () => {
    const trimmed = name.trim();
    const num = parseFloat(value);
    if (!trimmed) return setError("Name is required.");
    if (isNaN(num)) return setError("BAC must be a number.");
    setError(null);
    setSaving(true);
    const { error: err } = await supabase
      .from("entries")
      .insert({ name: trimmed, value: num });
    if (err) {
      console.error(err);
      setError("Couldn't save. Try again.");
    } else {
      setName("");
      setValue("");
      showToast(`${trimmed} — ${num} logged`);
      setTab("board");
      await load();
    }
    setSaving(false);
  };

  // Latest entry per person, ranked by BAC descending
  const latestByPerson = Object.values(
    entries.reduce((acc, e) => {
      const key = e.name.toLowerCase();
      if (!acc[key] || new Date(e.created_at) > new Date(acc[key].created_at)) acc[key] = e;
      return acc;
    }, {})
  ).sort((a, b) => b.value - a.value);

  // First-ever entry date per person = "registered"
  const registeredByPerson = entries.reduce((acc, e) => {
    const key = e.name.toLowerCase();
    if (!acc[key] || new Date(e.created_at) < new Date(acc[key])) acc[key] = e.created_at;
    return acc;
  }, {});

  const searchResults = search.trim()
    ? entries
        .filter((e) => e.name.toLowerCase().includes(search.trim().toLowerCase()))
        .sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
    : [];

  const S = {
    app: {
      fontFamily: '"Times New Roman", Times, serif',
      background: "#F2F2F7",
      minHeight: "100vh",
      maxWidth: 480,
      margin: "0 auto",
      display: "flex",
      flexDirection: "column",
      color: "#1C1C1E",
    },
    header: {
      padding: "20px 20px 12px",
      background: "rgba(242,242,247,0.92)",
      backdropFilter: "blur(12px)",
      position: "sticky",
      top: 0,
      zIndex: 10,
    },
    title: { fontSize: 30, fontWeight: 800, letterSpacing: -0.6, margin: 0 },
    sub: { fontSize: 13, color: "#8E8E93", marginTop: 2 },
    body: { flex: 1, padding: "8px 16px 100px", overflowY: "auto" },
    card: {
      background: "#fff",
      borderRadius: 14,
      padding: "14px 16px",
      display: "flex",
      alignItems: "center",
      gap: 12,
      marginBottom: 8,
      boxShadow: "0 1px 2px rgba(0,0,0,0.04)",
    },
    rank: { width: 30, fontSize: 20, textAlign: "center", flexShrink: 0 },
    rankNum: { fontSize: 15, fontWeight: 700, color: "#8E8E93" },
    personName: { fontSize: 17, fontWeight: 600 },
    meta: { fontSize: 12, color: "#8E8E93", marginTop: 1 },
    bmi: {
      marginLeft: "auto",
      fontVariantNumeric: "tabular-nums",
      fontSize: 22,
      fontWeight: 800,
      letterSpacing: -0.5,
    },
    input: {
      width: "100%",
      boxSizing: "border-box",
      fontSize: 17,
      padding: "14px 16px",
      borderRadius: 12,
      border: "1px solid #E5E5EA",
      background: "#fff",
      outline: "none",
      marginBottom: 10,
      WebkitAppearance: "none",
      fontFamily: "inherit",
    },
    button: {
      width: "100%",
      fontSize: 17,
      fontWeight: 700,
      fontFamily: "inherit",
      padding: "15px",
      borderRadius: 14,
      border: "none",
      background: "#1C1C1E",
      color: "#fff",
      cursor: "pointer",
      opacity: saving ? 0.6 : 1,
    },
    tabbar: {
      position: "fixed",
      bottom: 0,
      left: "50%",
      transform: "translateX(-50%)",
      width: "100%",
      maxWidth: 480,
      display: "flex",
      background: "rgba(255,255,255,0.94)",
      backdropFilter: "blur(14px)",
      borderTop: "1px solid #E5E5EA",
      paddingBottom: "env(safe-area-inset-bottom, 8px)",
    },
    tabBtn: (active) => ({
      flex: 1,
      padding: "12px 0 10px",
      border: "none",
      background: "transparent",
      fontSize: 15,
      fontWeight: active ? 700 : 400,
      fontFamily: "inherit",
      color: active ? "#1C1C1E" : "#AEAEB2",
      cursor: "pointer",
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      gap: 3,
    }),
    empty: {
      textAlign: "center",
      color: "#8E8E93",
      padding: "56px 24px",
      fontSize: 15,
      lineHeight: 1.5,
    },
    toast: {
      position: "fixed",
      top: 14,
      left: "50%",
      transform: "translateX(-50%)",
      background: "#1C1C1E",
      color: "#fff",
      fontSize: 14,
      fontWeight: 600,
      padding: "10px 18px",
      borderRadius: 22,
      zIndex: 50,
      boxShadow: "0 4px 16px rgba(0,0,0,0.25)",
      whiteSpace: "nowrap",
    },
    sectionLabel: {
      fontSize: 13,
      fontWeight: 600,
      color: "#8E8E93",
      textTransform: "uppercase",
      letterSpacing: 0.4,
      margin: "16px 4px 8px",
    },
    err: { color: "#FF3B30", fontSize: 14, margin: "0 4px 10px" },
  };

  return (
    <div style={S.app}>
      {toast && <div style={S.toast}>{toast}</div>}

      <div style={S.header}>
        <h1 style={S.title}>BAC Board</h1>
        <div style={S.sub}>
          {tab === "board" && `${latestByPerson.length} on the board`}
          {tab === "add" && "Log a new number"}
          {tab === "search" && "Full history by name"}
        </div>
      </div>

      <div style={S.body}>
        {loading ? (
          <div style={S.empty}>Loading the board…</div>
        ) : tab === "board" ? (
          latestByPerson.length === 0 ? (
            <div style={S.empty}>
              Nothing here yet.
              <br />
              Tap <b>Log</b> to put the first name on the board.
            </div>
          ) : (
            <>
              <div style={S.sectionLabel}>Ranked by latest BAC</div>
              {latestByPerson.map((e, i) => (
                <div key={e.name.toLowerCase()} style={S.card}>
                  <div style={S.rank}>
                    <span style={S.rankNum}>{i + 1}</span>
                  </div>
                  <div>
                    <div style={S.personName}>{e.name}</div>
                    <div style={S.meta}>
                      registered {fmtDate(registeredByPerson[e.name.toLowerCase()])}
                    </div>
                  </div>
                  <div style={S.bmi}>{e.value}</div>
                </div>
              ))}
            </>
          )
        ) : tab === "add" ? (
          <div style={{ paddingTop: 12 }}>
            <input
              style={S.input}
              placeholder="Name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              autoCapitalize="words"
            />
            <input
              style={S.input}
              placeholder="BAC"
              value={value}
              inputMode="decimal"
              onChange={(e) => setValue(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && addEntry()}
            />
            {error && <div style={S.err}>{error}</div>}
            <button style={S.button} onClick={addEntry} disabled={saving}>
              {saving ? "Saving…" : "Add to board"}
            </button>
            <div style={{ ...S.meta, textAlign: "center", marginTop: 14 }}>
              Entries are visible to everyone with the link.
            </div>
          </div>
        ) : (
          <div style={{ paddingTop: 12 }}>
            <input
              style={S.input}
              placeholder="Search a name"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
            {search.trim() === "" ? (
              <div style={S.empty}>Type a name to see every entry they've logged.</div>
            ) : searchResults.length === 0 ? (
              <div style={S.empty}>No entries for “{search.trim()}”.</div>
            ) : (
              <>
                <div style={S.sectionLabel}>
                  {searchResults.length} entr{searchResults.length === 1 ? "y" : "ies"}
                </div>
                {searchResults.map((e) => (
                  <div key={e.id} style={S.card}>
                    <div>
                      <div style={S.personName}>{e.name}</div>
                      <div style={S.meta}>{fmtDate(e.created_at)}</div>
                    </div>
                    <div style={S.bmi}>{e.value}</div>
                  </div>
                ))}
              </>
            )}
          </div>
        )}
      </div>

      <div style={S.tabbar}>
        <button style={S.tabBtn(tab === "board")} onClick={() => setTab("board")}>
          Board
        </button>
        <button style={S.tabBtn(tab === "add")} onClick={() => setTab("add")}>
          Log
        </button>
        <button style={S.tabBtn(tab === "search")} onClick={() => setTab("search")}>
          Search
        </button>
      </div>
    </div>
  );
}
