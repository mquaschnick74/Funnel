import { useState, useEffect } from 'react';
import { useLocation } from 'wouter';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';

interface Draft {
  id: string;
  slot_name: string;
  variation_a: string;
  variation_b: string;
  variation_c: string;
  status: string;
  created_at: string;
}

interface HistoryItem {
  id: string;
  slot_name: string;
  selected_variation: string;
  edited_content: string | null;
  status: string;
  rejected_reason: string | null;
  posted_at: string | null;
  created_at: string;
}

const SLOT_LABELS: Record<string, string> = {
  CVDC: 'CVDC',
  IBM_TYPE_A: 'IBM — Type A',
  IBM_TYPE_B: 'IBM — Type B',
  REGISTER_REAL: 'Register — Real',
  REGISTER_IMAGINARY: 'Register — Imaginary',
  REGISTER_SYMBOLIC: 'Register — Symbolic',
  THEND: 'Thend',
  CYVC: 'CYVC',
  THERAPY_DESERT: 'Therapy Desert',
};

export default function XPostsPage() {
  const [, setLocation] = useLocation();
  const [drafts, setDrafts] = useState<Draft[]>([]);
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [activeTab, setActiveTab] = useState<'drafts' | 'approved' | 'history'>('drafts');
  const [loading, setLoading] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [selectedVariations, setSelectedVariations] = useState<Record<string, string>>({});
  const [editedContent, setEditedContent] = useState<Record<string, string>>({});
  const [copiedId, setCopiedId] = useState<string | null>(null);

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    try {
      const res = await fetch('/api/auth/me', { credentials: 'include' });
      if (!res.ok) {
        setLocation('/admin');
        return;
      }
      fetchDrafts();
      fetchHistory();
    } catch {
      setLocation('/admin');
    }
  };

  const fetchDrafts = async () => {
    const res = await fetch('/api/x-posts/drafts', { credentials: 'include' });
    if (res.ok) {
      const data = await res.json();
      setDrafts(data);
    }
  };

  const fetchHistory = async () => {
    const res = await fetch('/api/x-posts/history', { credentials: 'include' });
    if (res.ok) {
      const data = await res.json();
      setHistory(data);
    }
  };

  const handleGenerate = async () => {
    setGenerating(true);
    try {
      const res = await fetch('/api/x-posts/generate', {
        method: 'POST',
        credentials: 'include',
      });
      if (res.ok) {
        await fetchDrafts();
      }
    } finally {
      setGenerating(false);
    }
  };

  const handleApprove = async (draft: Draft) => {
    const selected = selectedVariations[draft.id];
    if (!selected) {
      alert('Select a variation before approving.');
      return;
    }
    setLoading(true);
    try {
      const res = await fetch('/api/x-posts/approve', {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: draft.id,
          selectedVariation: selected,
          editedContent: editedContent[draft.id] || undefined,
        }),
      });
      if (res.ok) {
        await fetchDrafts();
        await fetchHistory();
      }
    } finally {
      setLoading(false);
    }
  };

  const handleReject = async (id: string) => {
    setLoading(true);
    try {
      const res = await fetch('/api/x-posts/reject', {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id }),
      });
      if (res.ok) {
        await fetchDrafts();
        await fetchHistory();
      }
    } finally {
      setLoading(false);
    }
  };

  const handleCopyAndPost = async (item: HistoryItem) => {
    const content = item.edited_content || item.selected_variation;
    await navigator.clipboard.writeText(content);
    setCopiedId(item.id);
    window.open('https://x.com/compose/post', '_blank');
    setTimeout(() => setCopiedId(null), 3000);
  };

  const handleMarkPosted = async (id: string) => {
    const res = await fetch('/api/x-posts/mark-posted', {
      method: 'POST',
      credentials: 'include',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id }),
    });
    if (res.ok) {
      await fetchHistory();
    }
  };

  const approvedItems = history.filter(h => h.status === 'approved');
  const postedAndRejected = history.filter(h => h.status === 'posted' || h.status === 'rejected');

  return (
    <div className="min-h-screen bg-background p-6 max-w-4xl mx-auto">

      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-foreground">X Posts</h1>
          <p className="text-sm text-muted-foreground mt-1">@i_vasa1974</p>
        </div>
        <Button
          onClick={handleGenerate}
          disabled={generating}
          variant="outline"
          className="border-emerald-500/30 hover:border-emerald-500"
        >
          {generating ? 'Generating...' : 'Generate Now'}
        </Button>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 mb-6 border-b border-border">
        {(['drafts', 'approved', 'history'] as const).map(tab => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-4 py-2 text-sm font-medium capitalize transition-colors ${
              activeTab === tab
                ? 'text-emerald-400 border-b-2 border-emerald-400'
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            {tab === 'drafts' ? `Drafts (${drafts.length})` :
             tab === 'approved' ? `Approved (${approvedItems.length})` :
             'History'}
          </button>
        ))}
      </div>

      {/* Drafts Tab */}
      {activeTab === 'drafts' && (
        <div className="space-y-8">
          {drafts.length === 0 && (
            <p className="text-muted-foreground text-sm">
              No drafts waiting. Click Generate Now or wait for the 7am cron.
            </p>
          )}
          {drafts.map(draft => (
            <Card key={draft.id} className="p-6 border-border">
              <div className="flex items-center justify-between mb-4">
                <span className="text-xs font-medium text-emerald-400 uppercase tracking-wide">
                  {SLOT_LABELS[draft.slot_name] || draft.slot_name}
                </span>
                <span className="text-xs text-muted-foreground">
                  {new Date(draft.created_at).toLocaleDateString()}
                </span>
              </div>

              {/* Three variations */}
              <div className="space-y-3 mb-5">
                {[draft.variation_a, draft.variation_b, draft.variation_c].map((variation, index) => (
                  <div
                    key={index}
                    onClick={() => setSelectedVariations(prev => ({ ...prev, [draft.id]: variation }))}
                    className={`p-4 rounded-lg border cursor-pointer transition-all text-sm leading-relaxed ${
                      selectedVariations[draft.id] === variation
                        ? 'border-emerald-500 bg-emerald-500/5 text-foreground'
                        : 'border-border hover:border-emerald-500/40 text-muted-foreground hover:text-foreground'
                    }`}
                  >
                    {variation}
                  </div>
                ))}
              </div>

              {/* Edit field */}
              {selectedVariations[draft.id] && (
                <div className="mb-4">
                  <p className="text-xs text-muted-foreground mb-2">
                    Edit before approving (optional — leave blank to use as-is)
                  </p>
                  <Textarea
                    placeholder={selectedVariations[draft.id]}
                    value={editedContent[draft.id] || ''}
                    onChange={e => setEditedContent(prev => ({ ...prev, [draft.id]: e.target.value }))}
                    className="text-sm resize-none border-border focus:border-emerald-500"
                    rows={4}
                  />
                </div>
              )}

              {/* Actions */}
              <div className="flex gap-3">
                <Button
                  onClick={() => handleApprove(draft)}
                  disabled={loading || !selectedVariations[draft.id]}
                  className="bg-emerald-600 hover:bg-emerald-500 text-white"
                  size="sm"
                >
                  Approve
                </Button>
                <Button
                  onClick={() => handleReject(draft.id)}
                  disabled={loading}
                  variant="outline"
                  size="sm"
                  className="border-red-500/30 hover:border-red-500 text-red-400 hover:text-red-300"
                >
                  Reject
                </Button>
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* Approved Tab */}
      {activeTab === 'approved' && (
        <div className="space-y-4">
          {approvedItems.length === 0 && (
            <p className="text-muted-foreground text-sm">No approved posts waiting to be posted.</p>
          )}
          {approvedItems.map(item => (
            <Card key={item.id} className="p-6 border-border">
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-medium text-emerald-400 uppercase tracking-wide">
                  {SLOT_LABELS[item.slot_name] || item.slot_name}
                </span>
                <span className="text-xs text-muted-foreground">
                  {new Date(item.created_at).toLocaleDateString()}
                </span>
              </div>
              <p className="text-sm text-foreground leading-relaxed mb-4">
                {item.edited_content || item.selected_variation}
              </p>
              <div className="flex gap-3">
                <Button
                  onClick={() => handleCopyAndPost(item)}
                  className="bg-emerald-600 hover:bg-emerald-500 text-white"
                  size="sm"
                >
                  {copiedId === item.id ? 'Copied — X opened' : 'Copy & Open X'}
                </Button>
                <Button
                  onClick={() => handleMarkPosted(item.id)}
                  variant="outline"
                  size="sm"
                  className="border-emerald-500/30 hover:border-emerald-500"
                >
                  Mark as Posted
                </Button>
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* History Tab */}
      {activeTab === 'history' && (
        <div className="space-y-3">
          {postedAndRejected.length === 0 && (
            <p className="text-muted-foreground text-sm">No history yet.</p>
          )}
          {postedAndRejected.map(item => (
            <Card key={item.id} className="p-4 border-border">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-3">
                  <span className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                    {SLOT_LABELS[item.slot_name] || item.slot_name}
                  </span>
                  <span className={`text-xs px-2 py-0.5 rounded-full ${
                    item.status === 'posted'
                      ? 'bg-emerald-500/10 text-emerald-400'
                      : 'bg-red-500/10 text-red-400'
                  }`}>
                    {item.status}
                  </span>
                </div>
                <span className="text-xs text-muted-foreground">
                  {new Date(item.created_at).toLocaleDateString()}
                </span>
              </div>
              {item.status === 'posted' && (
                <p className="text-sm text-muted-foreground leading-relaxed">
                  {item.edited_content || item.selected_variation}
                </p>
              )}
              {item.status === 'rejected' && item.rejected_reason && (
                <p className="text-xs text-muted-foreground italic">{item.rejected_reason}</p>
              )}
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
