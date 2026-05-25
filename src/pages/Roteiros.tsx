import React, { useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import PageLayout from "@/components/PageLayout";
import { Settings, Loader2, Search, ChevronDown, ChevronUp, FileText } from "lucide-react";
import { useRoteiros, Roteiro } from "@/hooks/useRoteiros";

// ─── Card individual de banco ────────────────────────────────────────────────
function BancoCard({ roteiro }: { roteiro: Roteiro }) {
  const navigate = useNavigate();
  const [aberto, setAberto] = useState(false);

  return (
    <div
      className="rounded-xl overflow-hidden transition-all duration-200 bg-white shadow-sm hover:shadow-md"
      style={{
        border: `1.5px solid ${aberto ? "#2563eb" : "#e2e8f0"}`,
      }}
    >
      {/* Linha principal: logo + botão */}
      <div className="flex items-center gap-3 p-4">
        {/* Quadrado da logo */}
        <div
          className="flex items-center justify-center rounded-lg shrink-0 bg-white"
          style={{
            width: 84,
            height: 64,
            border: "1px solid #f1f5f9",
            boxShadow: "0 1px 4px rgba(0,0,0,0.08)",
          }}
        >
          {roteiro.logo_url ? (
            <img
              src={roteiro.logo_url}
              alt={roteiro.nome}
              style={{ maxWidth: 70, maxHeight: 50, objectFit: "contain" }}
              onError={(e) => {
                e.currentTarget.style.display = "none";
              }}
            />
          ) : (
            <span
              style={{
                fontSize: 9,
                fontWeight: 700,
                color: "#334155",
                textAlign: "center",
                padding: "2px 4px",
                lineHeight: 1.2,
                wordBreak: "break-word",
              }}
            >
              {roteiro.nome}
            </span>
          )}
        </div>

        {/* Botão Exibir / Ocultar */}
        <button
          onClick={() => setAberto((v) => !v)}
          className="flex-1 flex items-center justify-between px-3 py-2.5 rounded-lg font-semibold text-sm transition-all duration-200 gap-2"
          style={{
            background: aberto
              ? "#1d4ed8"
              : "#2563eb",
            color: "#fff",
            boxShadow: aberto
              ? "0 0 12px rgba(37,99,235,0.45)"
              : "0 2px 8px rgba(37,99,235,0.3)",
          }}
        >
          <span className="truncate">{aberto ? "Ocultar Roteiros" : "Exibir Roteiros"}</span>
          {aberto ? (
            <ChevronUp className="h-4 w-4 shrink-0" />
          ) : (
            <ChevronDown className="h-4 w-4 shrink-0" />
          )}
        </button>
      </div>

      {/* Dropdown de convênios */}
      {aberto && (
        <div className="px-3 pb-3 space-y-1.5 border-t border-slate-100 pt-2">
          {roteiro.categorias.length === 0 ? (
            <div
              className="flex items-center gap-2 px-3 py-2.5 rounded-lg text-sm bg-slate-50"
              style={{ border: "1px dashed #cbd5e1", color: "#94a3b8" }}
            >
              <FileText className="h-4 w-4 shrink-0 text-slate-400" />
              <span>Nenhum convênio cadastrado.</span>
              <button
                onClick={() => navigate("/roteiros/admin")}
                className="ml-auto font-semibold whitespace-nowrap text-indigo-600 hover:text-indigo-700 transition-colors"
              >
                Adicionar →
              </button>
            </div>
          ) : (
            roteiro.categorias.map((cat, idx) => (
              <button
                key={idx}
                onClick={() => navigate(`/roteiros/${roteiro.id}`)}
                onMouseEnter={(e) => {
                  (e.currentTarget as HTMLElement).style.background = "#ede9fe";
                  (e.currentTarget as HTMLElement).style.color = "#4338ca";
                }}
                onMouseLeave={(e) => {
                  (e.currentTarget as HTMLElement).style.background = "#eef2ff";
                  (e.currentTarget as HTMLElement).style.color = "#4f46e5";
                }}
                className="w-full text-left px-3 py-2 rounded-lg text-sm font-medium transition-all duration-150"
                style={{
                  background: "#eef2ff",
                  border: "1px solid #c7d2fe",
                  color: "#4f46e5",
                }}
              >
                {cat.nome}
                {cat.documentos.length > 0 && (
                  <span className="ml-2 text-xs rounded-full px-2 py-0.5 bg-indigo-100 text-indigo-700">
                    {cat.documentos.length}
                  </span>
                )}
              </button>
            ))
          )}
        </div>
      )}
    </div>
  );
}

// ─── Página principal ─────────────────────────────────────────────────────────
export default function Roteiros() {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState("");
  const { roteiros, loading } = useRoteiros();

  const filtrados = useMemo(
    () =>
      roteiros.filter((r) =>
        r.nome.toLowerCase().includes(searchTerm.toLowerCase())
      ),
    [roteiros, searchTerm]
  );

  return (
    <PageLayout title="Roteiros Operacionais">
      <div className="space-y-5">
        {/* Cabeçalho */}
        <div className="flex items-center justify-between gap-4">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Roteiros por Banco</h2>
            <p className="text-sm text-gray-500 mt-0.5">
              Selecione um banco para ver os convênios e documentos operacionais.
            </p>
          </div>
          <button
            onClick={() => navigate("/roteiros/admin")}
            className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium bg-white border border-slate-200 text-slate-600 hover:border-indigo-400 hover:text-indigo-600 hover:bg-indigo-50 transition-all duration-200 shadow-sm"
          >
            <Settings className="h-4 w-4" />
            Gerenciar
          </button>
        </div>

        {/* Barra de busca */}
        <div className="relative">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
          <input
            type="text"
            placeholder="Buscar banco..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 rounded-xl text-sm border border-slate-200 bg-white text-gray-800 outline-none transition-all duration-200 focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100 placeholder:text-gray-400 shadow-sm"
          />
        </div>

        {/* Loading */}
        {loading && (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="h-7 w-7 animate-spin text-indigo-500" />
            <span className="ml-3 text-sm text-gray-500">Carregando roteiros...</span>
          </div>
        )}

        {/* Grid de bancos */}
        {!loading && filtrados.length > 0 && (
          <div
            className="grid gap-4"
          style={{ gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))" }}
          >
            {filtrados.map((roteiro) => (
              <BancoCard key={roteiro.id} roteiro={roteiro} />
            ))}
          </div>
        )}

        {/* Vazio */}
        {!loading && filtrados.length === 0 && (
          <div className="text-center py-20">
            <p className="text-gray-400 text-lg">
              {searchTerm ? "Nenhum banco encontrado" : "Nenhum banco cadastrado"}
            </p>
            {!searchTerm && (
              <button
                onClick={() => navigate("/roteiros/admin")}
                className="mt-4 px-5 py-2.5 rounded-lg text-sm font-semibold text-white transition-all duration-200 shadow-md hover:shadow-lg"
                style={{
                  background: "linear-gradient(135deg, #2563eb, #7c3aed, #4338ca)",
                  color: "#fff",
                  boxShadow: "0 4px 12px rgba(79,70,229,0.3)",
                }}
              >
                Ir para Gerenciar
              </button>
            )}
          </div>
        )}
      </div>
    </PageLayout>
  );
}
