"use client";

import { useState } from "react";
import {
  Brain,
  ChevronDown,
  ChevronUp,
  Loader2,
  Search,
  Sparkles,
  TrendingUp,
  AlertTriangle,
  CheckCircle2,
  Info,
  BarChart3,
  UploadCloud,
} from "lucide-react";

// ─────────────────────────────────────────────────────────────────────────────
// Types that mirror SpotDiagnosticOutput from the Python backend
// ─────────────────────────────────────────────────────────────────────────────
interface UseCaseRecommendation {
  department: string;
  pain_point: string;
  proposed_solution: string;
  estimated_cost_kes: number;
  optimistic_90_day_roi: string;
  conservative_90_day_roi: string;
  key_assumptions: string[];
  identified_risks: string[];
  applicable_ibm_products: string[];
}

interface SpotDiagnosticOutput {
  organization_name: string;
  sector: string;
  executive_summary: string;
  use_cases: UseCaseRecommendation[];
  organizational_readiness_assessment: string;
  information_gaps: string[];
}

interface QueryEvidence {
  source_name: string;
  source_type: string;
  relationship_type: string;
  target_name: string;
  target_type: string;
  evidence: string;
  timestamp?: string | null;
}

interface QueryAgentOutput {
  client_identifier: string;
  question: string;
  answer: string;
  confidence: "high" | "medium" | "low" | "insufficient";
  supporting_evidence: QueryEvidence[];
  missing_information: string;
}

interface PromoteResponse {
  client_identifier: string;
  entities_written: number;
  relationships_written: number;
  status: string;
  summary: string;
  espocrm_status?: string;
}

// ─────────────────────────────────────────────────────────────────────────────
// Helper
// ─────────────────────────────────────────────────────────────────────────────
function formatKES(amount: number): string {
  if (amount >= 1_000_000) return `KES ${(amount / 1_000_000).toFixed(1)}M`;
  if (amount >= 1_000) return `KES ${(amount / 1_000).toFixed(0)}K`;
  return `KES ${amount.toLocaleString()}`;
}

function buildSpotPromotionReport(result: SpotDiagnosticOutput): string {
  return JSON.stringify(
    {
      report_type: "SPOT diagnostic",
      organization_name: result.organization_name,
      sector: result.sector,
      executive_summary: result.executive_summary,
      use_cases: result.use_cases,
      organizational_readiness_assessment: result.organizational_readiness_assessment,
      information_gaps: result.information_gaps,
    },
    null,
    2
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Sub-component: Single Use Case Card
// ─────────────────────────────────────────────────────────────────────────────
function UseCaseCard({ uc, rank }: { uc: UseCaseRecommendation; rank: number }) {
  const [expanded, setExpanded] = useState(false);

  return (
    <div className="border border-border rounded-xl overflow-hidden bg-card transition-all duration-200 hover:border-primary/40">
      {/* Header row */}
      <button
        onClick={() => setExpanded(!expanded)}
        className="w-full text-left p-4 flex items-start gap-3 hover:bg-surface-hover transition-colors"
        aria-expanded={expanded}
      >
        {/* Rank badge */}
        <span className="flex-shrink-0 w-7 h-7 rounded-full bg-primary/10 text-primary text-xs font-bold flex items-center justify-center mt-0.5">
          {rank}
        </span>

        <div className="flex-1 min-w-0">
          <div className="flex flex-wrap items-center gap-2 mb-1">
            <span className="text-xs font-semibold uppercase tracking-wide text-primary/80 bg-primary/10 px-2 py-0.5 rounded">
              {uc.department}
            </span>
            <span className="text-sm font-semibold text-foreground truncate">
              {uc.proposed_solution}
            </span>
          </div>
          <p className="text-xs text-text-muted leading-relaxed line-clamp-2">{uc.pain_point}</p>

          {/* Cost + ROI strip */}
          <div className="flex flex-wrap gap-4 mt-2">
            <div className="flex items-center gap-1.5">
              <BarChart3 size={12} className="text-text-muted" />
              <span className="text-xs font-medium text-foreground">{formatKES(uc.estimated_cost_kes)}</span>
            </div>
            <div className="flex items-center gap-1.5">
              <TrendingUp size={12} className="text-emerald-500" />
              <span className="text-xs text-emerald-600 dark:text-emerald-400 font-medium">{uc.optimistic_90_day_roi}</span>
              <span className="text-xs text-text-muted">(optimistic)</span>
            </div>
            <div className="flex items-center gap-1.5">
              <TrendingUp size={12} className="text-amber-500" />
              <span className="text-xs text-amber-600 dark:text-amber-400 font-medium">{uc.conservative_90_day_roi}</span>
              <span className="text-xs text-text-muted">(conservative)</span>
            </div>
          </div>
        </div>

        {expanded ? (
          <ChevronUp size={16} className="flex-shrink-0 text-text-muted mt-1" />
        ) : (
          <ChevronDown size={16} className="flex-shrink-0 text-text-muted mt-1" />
        )}
      </button>

      {/* Expanded detail */}
      {expanded && (
        <div className="px-4 pb-4 border-t border-border space-y-4 pt-4">
          {/* Assumptions */}
          {uc.key_assumptions.length > 0 && (
            <div>
              <h5 className="text-xs font-semibold uppercase tracking-wide text-text-muted mb-2 flex items-center gap-1.5">
                <Info size={11} /> Key Assumptions
              </h5>
              <ul className="space-y-1">
                {uc.key_assumptions.map((a, i) => (
                  <li key={i} className="text-xs text-text-muted flex gap-2">
                    <span className="text-primary mt-0.5">•</span>
                    <span>{a}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Risks */}
          {uc.identified_risks.length > 0 && (
            <div>
              <h5 className="text-xs font-semibold uppercase tracking-wide text-text-muted mb-2 flex items-center gap-1.5">
                <AlertTriangle size={11} className="text-amber-500" /> Identified Risks
              </h5>
              <ul className="space-y-1">
                {uc.identified_risks.map((r, i) => (
                  <li key={i} className="text-xs text-text-muted flex gap-2">
                    <span className="text-amber-500 mt-0.5">•</span>
                    <span>{r}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* IBM Products */}
          {uc.applicable_ibm_products.length > 0 && (
            <div>
              <h5 className="text-xs font-semibold uppercase tracking-wide text-text-muted mb-2">
                IBM Products
              </h5>
              <div className="flex flex-wrap gap-1.5">
                {uc.applicable_ibm_products.map((p, i) => (
                  <span
                    key={i}
                    className="text-xs bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/20 rounded px-2 py-0.5"
                  >
                    {p}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Sub-component: SPOT Analysis Form + Results
// ─────────────────────────────────────────────────────────────────────────────
function SpotAnalysisPanel() {
  const [orgName, setOrgName] = useState("");
  const [sector, setSector] = useState("");
  const [context, setContext] = useState("");
  const [clientIdentifier, setClientIdentifier] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isPromoting, setIsPromoting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [promotionError, setPromotionError] = useState<string | null>(null);
  const [promotionResult, setPromotionResult] = useState<PromoteResponse | null>(null);
  const [result, setResult] = useState<SpotDiagnosticOutput | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!orgName.trim()) return;

    setIsLoading(true);
    setError(null);
    setPromotionError(null);
    setPromotionResult(null);
    setResult(null);

    try {
      const response = await fetch("/api/parl/spot", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          organization_name: orgName.trim(),
          sector: sector.trim() || "Unknown",
          context: { raw_context: context.trim() },
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || `Request failed: ${response.status}`);
      }

      const data: SpotDiagnosticOutput = await response.json();
      setResult(data);
      setClientIdentifier(data.organization_name);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "An unexpected error occurred.";
      setError(message);
    } finally {
      setIsLoading(false);
    }
  };

  const handlePromote = async () => {
    if (!result || !clientIdentifier.trim()) return;

    setIsPromoting(true);
    setPromotionError(null);
    setPromotionResult(null);

    try {
      const response = await fetch("/api/parl/promote", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          client_identifier: clientIdentifier,
          report: buildSpotPromotionReport(result),
          named_entities: {
            organization: [result.organization_name],
          },
          strategic_priorities: result.use_cases.map((uc) => uc.proposed_solution),
          financial_figures: result.use_cases.map(
            (uc) => `${uc.proposed_solution}: estimated_cost_kes=${uc.estimated_cost_kes}`
          ),
          source_label: `Consult Ralph SPOT diagnostic for ${result.organization_name}`,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || `Request failed: ${response.status}`);
      }

      const data: PromoteResponse = await response.json();
      setPromotionResult(data);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "An unexpected error occurred.";
      setPromotionError(message);
    } finally {
      setIsPromoting(false);
    }
  };

  return (
    <div className="space-y-4">
      {/* Form */}
      <form onSubmit={handleSubmit} className="space-y-3">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label htmlFor="spot-org-name" className="block text-xs font-medium text-text-muted mb-1">
              Organization Name <span className="text-red-500">*</span>
            </label>
            <input
              id="spot-org-name"
              type="text"
              value={orgName}
              onChange={(e) => setOrgName(e.target.value)}
              placeholder="e.g. Kenya Red Cross"
              className="w-full px-3 py-2 text-sm bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary transition-all placeholder:text-text-muted/50"
              required
            />
          </div>
          <div>
            <label htmlFor="spot-sector" className="block text-xs font-medium text-text-muted mb-1">
              Sector
            </label>
            <input
              id="spot-sector"
              type="text"
              value={sector}
              onChange={(e) => setSector(e.target.value)}
              placeholder="e.g. Non-Profit, Retail, Agriculture"
              className="w-full px-3 py-2 text-sm bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary transition-all placeholder:text-text-muted/50"
            />
          </div>
        </div>
        <div>
          <label htmlFor="spot-context" className="block text-xs font-medium text-text-muted mb-1">
            Context
          </label>
          <textarea
            id="spot-context"
            value={context}
            onChange={(e) => setContext(e.target.value)}
            placeholder="Paste any background context about the organization — research summaries, known systems, challenges, size, staff count, operational pain points..."
            rows={5}
            className="w-full px-3 py-2 text-sm bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary transition-all resize-none placeholder:text-text-muted/50"
          />
        </div>
        <button
          id="spot-submit-btn"
          type="submit"
          disabled={isLoading || !orgName.trim()}
          className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground text-sm font-medium rounded-lg hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed transition-all active:scale-95"
        >
          {isLoading ? (
            <>
              <Loader2 size={14} className="animate-spin" />
              Running SPOT Diagnostic…
            </>
          ) : (
            <>
              <Sparkles size={14} />
              Run SPOT Analysis
            </>
          )}
        </button>
      </form>

      {/* Error state */}
      {error && (
        <div className="flex items-start gap-2.5 p-3 bg-red-500/10 border border-red-500/20 rounded-lg text-sm text-red-600 dark:text-red-400">
          <AlertTriangle size={16} className="flex-shrink-0 mt-0.5" />
          <span>{error}</span>
        </div>
      )}

      {/* Results */}
      {result && (
        <div className="space-y-6 pt-2">
          {/* Executive Summary */}
          <div className="p-5 bg-gradient-to-br from-primary/5 to-primary/10 border border-primary/20 rounded-xl">
            <div className="flex items-center gap-2 mb-3">
              <Brain size={16} className="text-primary" />
              <h4 className="text-sm font-semibold text-foreground">Executive Summary</h4>
              <span className="ml-auto text-xs bg-primary/10 text-primary px-2 py-0.5 rounded font-medium">
                {result.sector}
              </span>
            </div>
            <p className="text-sm text-foreground leading-relaxed">{result.executive_summary}</p>
          </div>

          <div className="p-4 bg-surface border border-border rounded-xl">
            <div className="flex flex-col sm:flex-row sm:items-center gap-3">
              <div className="flex-1">
                <h4 className="text-sm font-semibold text-foreground">Promote to Client Graph</h4>
                <input
                  id="spot-promote-client-identifier"
                  type="text"
                  value={clientIdentifier}
                  onChange={(e) => setClientIdentifier(e.target.value)}
                  placeholder="Client slug or name"
                  className="mt-2 w-full px-3 py-2 text-sm bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary transition-all placeholder:text-text-muted/50"
                />
              </div>
              <button
                id="spot-promote-client-graph"
                type="button"
                onClick={handlePromote}
                disabled={isPromoting || !clientIdentifier.trim()}
                className="flex items-center justify-center gap-2 px-4 py-2 bg-primary text-primary-foreground text-sm font-medium rounded-lg hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed transition-all active:scale-95"
              >
                {isPromoting ? (
                  <Loader2 size={14} className="animate-spin" />
                ) : (
                  <UploadCloud size={14} />
                )}
                Promote
              </button>
            </div>

            {promotionResult && (
              <div className="mt-3 flex items-start gap-2.5 p-3 bg-emerald-500/10 border border-emerald-500/20 rounded-lg">
                <CheckCircle2 size={15} className="text-emerald-500 flex-shrink-0 mt-0.5" />
                <p className="text-xs text-text-muted leading-relaxed">
                  Promoted to {promotionResult.client_identifier}: {promotionResult.relationships_written} graph relationships written.
                  {promotionResult.espocrm_status ? ` EspoCRM: ${promotionResult.espocrm_status}.` : ""}
                </p>
              </div>
            )}

            {promotionError && (
              <div className="mt-3 flex items-start gap-2.5 p-3 bg-red-500/10 border border-red-500/20 rounded-lg">
                <AlertTriangle size={15} className="text-red-500 flex-shrink-0 mt-0.5" />
                <p className="text-xs text-text-muted leading-relaxed">{promotionError}</p>
              </div>
            )}
          </div>

          {/* Ranked Use Cases */}
          {result.use_cases.length > 0 && (
            <div>
              <h4 className="text-sm font-semibold text-foreground mb-3 flex items-center gap-2">
                <TrendingUp size={15} className="text-primary" />
                Ranked Recommendations ({result.use_cases.length})
              </h4>
              <div className="space-y-3">
                {result.use_cases.map((uc, i) => (
                  <UseCaseCard key={i} uc={uc} rank={i + 1} />
                ))}
              </div>
            </div>
          )}

          {/* Readiness Assessment */}
          <div className="p-4 bg-surface border border-border rounded-xl">
            <h4 className="text-sm font-semibold text-foreground mb-2 flex items-center gap-2">
              <CheckCircle2 size={15} className="text-emerald-500" />
              Organizational Readiness
            </h4>
            <p className="text-sm text-text-muted leading-relaxed">{result.organizational_readiness_assessment}</p>
          </div>

          {/* Information Gaps */}
          {result.information_gaps.length > 0 && (
            <div className="p-4 bg-amber-500/5 border border-amber-500/20 rounded-xl">
              <h4 className="text-sm font-semibold text-foreground mb-2 flex items-center gap-2">
                <AlertTriangle size={15} className="text-amber-500" />
                Information Gaps
              </h4>
              <ul className="space-y-1.5">
                {result.information_gaps.map((gap, i) => (
                  <li key={i} className="text-sm text-text-muted flex gap-2">
                    <span className="text-amber-500 flex-shrink-0">•</span>
                    <span>{gap}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Sub-component: Intelligence Query Box
// ─────────────────────────────────────────────────────────────────────────────
function QueryPanel() {
  const [clientIdentifier, setClientIdentifier] = useState("");
  const [query, setQuery] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<QueryAgentOutput | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!clientIdentifier.trim() || !query.trim()) return;

    setIsLoading(true);
    setResult(null);
    setError(null);

    try {
      const response = await fetch("/api/parl/query", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          client_identifier: clientIdentifier.trim(),
          question: query.trim(),
          recent_days: 90,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || `Request failed: ${response.status}`);
      }

      const data: QueryAgentOutput = await response.json();
      setResult(data);
    } catch (err: unknown) {
      // Network error — Stage Ten endpoint not running yet
      const message = err instanceof Error ? err.message : "An unexpected error occurred.";
      setError(message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-4">
      <p className="text-xs text-text-muted leading-relaxed">
        Query the knowledge graph accumulated from research and connector data for any client. 
        Evidence and source context are returned alongside the answer.
      </p>

      <form onSubmit={handleSubmit} className="space-y-3">
        <div className="grid grid-cols-1 sm:grid-cols-[220px_1fr] gap-2">
          <input
            id="parl-query-client"
            type="text"
            value={clientIdentifier}
            onChange={(e) => setClientIdentifier(e.target.value)}
            placeholder="Client e.g. kenya_red_cross"
            className="px-3 py-2 text-sm bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary transition-all placeholder:text-text-muted/50"
          />
          <div className="flex gap-2">
            <input
              id="parl-query-input"
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="e.g. What systems does this client use?"
              className="flex-1 px-3 py-2 text-sm bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary transition-all placeholder:text-text-muted/50"
            />
            <button
              id="parl-query-submit"
              type="submit"
              disabled={isLoading || !clientIdentifier.trim() || !query.trim()}
              className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground text-sm font-medium rounded-lg hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed transition-all active:scale-95 flex-shrink-0"
            >
              {isLoading ? (
                <Loader2 size={14} className="animate-spin" />
              ) : (
                <Search size={14} />
              )}
              Query
            </button>
          </div>
        </div>
      </form>

      {/* Placeholder for Stage Ten */}
      {error && (
        <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-xl text-sm">
          <div className="flex items-center gap-2 mb-2 text-text-muted">
            <AlertTriangle size={14} />
            <span className="font-medium">Query failed</span>
          </div>
          <p className="text-xs text-text-muted leading-relaxed">
            {error}
          </p>
        </div>
      )}

      {/* Real result */}
      {result && (
        <div className="space-y-3">
          <div className="p-4 bg-primary/5 border border-primary/20 rounded-xl">
            <div className="flex items-center gap-2 mb-2">
              <span className="text-xs bg-primary/10 text-primary px-2 py-0.5 rounded font-medium">
                {result.confidence}
              </span>
              <span className="text-xs text-text-muted">{result.client_identifier}</span>
            </div>
            <p className="text-sm text-foreground leading-relaxed">{result.answer}</p>
            {result.missing_information && (
              <p className="text-xs text-text-muted leading-relaxed mt-3">
                {result.missing_information}
              </p>
            )}
          </div>
          {result.supporting_evidence.length > 0 && (
            <div>
              <p className="text-xs font-medium text-text-muted mb-2">Supporting Evidence</p>
              <ul className="space-y-1.5">
                {result.supporting_evidence.map((e, i) => (
                  <li key={i} className="text-xs text-text-muted flex gap-2">
                    <span className="text-primary">•</span>
                    <span>
                      <span className="font-medium text-foreground">
                        {e.source_name} {e.relationship_type} {e.target_name}
                      </span>
                      <span className="block mt-0.5">{e.evidence}</span>
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Main exported component
// ─────────────────────────────────────────────────────────────────────────────
type Tab = "spot" | "query";

export default function ParlIntelligence() {
  const [activeTab, setActiveTab] = useState<Tab>("spot");

  return (
    <div className="w-full max-w-3xl mx-auto">
      {/* Section header */}
      <div className="flex items-center gap-3 mb-5">
        <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
          <Brain size={16} className="text-primary" />
        </div>
        <div>
          <h2 className="text-base font-semibold text-foreground">PARL Intelligence</h2>
          <p className="text-xs text-text-muted">Diagnostic analysis and knowledge graph queries</p>
        </div>
      </div>

      {/* Tab navigation */}
      <div className="flex border-b border-border mb-5">
        <button
          id="parl-tab-spot"
          onClick={() => setActiveTab("spot")}
          className={`px-4 py-2 text-sm font-medium border-b-2 -mb-px transition-colors ${
            activeTab === "spot"
              ? "border-primary text-primary"
              : "border-transparent text-text-muted hover:text-foreground"
          }`}
        >
          <span className="flex items-center gap-1.5">
            <Sparkles size={13} />
            SPOT Analysis
          </span>
        </button>
        <button
          id="parl-tab-query"
          onClick={() => setActiveTab("query")}
          className={`px-4 py-2 text-sm font-medium border-b-2 -mb-px transition-colors ${
            activeTab === "query"
              ? "border-primary text-primary"
              : "border-transparent text-text-muted hover:text-foreground"
          }`}
        >
          <span className="flex items-center gap-1.5">
            <Search size={13} />
            Intelligence Query
          </span>
        </button>
      </div>

      {/* Tab content */}
      <div>
        {activeTab === "spot" && <SpotAnalysisPanel />}
        {activeTab === "query" && <QueryPanel />}
      </div>
    </div>
  );
}
