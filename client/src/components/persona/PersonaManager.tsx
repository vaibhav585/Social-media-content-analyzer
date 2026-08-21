// =============================================================================
// Persona Manager Component
// Allows users to create, view, and delete brand voice personas.
// Users paste their past successful posts to "train" a persona.
// =============================================================================

import React, { useState, useEffect } from 'react';
import { api } from '../../services/api';
import { useUIStore } from '../../store/uiStore';
import { UserCircle, Plus, Trash2, Loader2, Sparkles, MessageSquareText } from 'lucide-react';

interface Persona {
  id: string;
  name: string;
  description: string | null;
  embeddingCount: number;
  created_at: string;
}

export function PersonaManager() {
  const [personas, setPersonas] = useState<Persona[]>([]);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const { addToast } = useUIStore();

  // Form state
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [trainingText, setTrainingText] = useState('');

  const fetchPersonas = async () => {
    try {
      const response = await api.get('/personas');
      if (response.data?.personas) {
        setPersonas(response.data.personas);
      }
    } catch (error) {
      console.error('Failed to fetch personas:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPersonas();
  }, []);

  const handleCreate = async () => {
    if (!name.trim()) {
      addToast({ type: 'error', title: 'Name Required', message: 'Please give your persona a name.' });
      return;
    }

    setCreating(true);
    try {
      const response = await api.post('/personas', {
        name: name.trim(),
        description: description.trim() || undefined,
        trainingText: trainingText.trim() || undefined,
      });

      if (response.data?.persona) {
        setPersonas((prev) => [response.data.persona, ...prev]);
        addToast({
          type: 'success',
          title: 'Persona Created',
          message: `"${name}" trained with ${response.data.persona.embeddingCount} voice samples.`,
        });
        // Reset form
        setName('');
        setDescription('');
        setTrainingText('');
        setShowForm(false);
      }
    } catch (error: any) {
      const errorMsg = error.response?.data?.error?.message || error.message || 'Could not create persona.';
      addToast({ type: 'error', title: 'Creation Failed', message: errorMsg });
    } finally {
      setCreating(false);
    }
  };

  const handleDelete = async (id: string, personaName: string) => {
    try {
      await api.delete(`/personas/${id}`);
      setPersonas((prev) => prev.filter((p) => p.id !== id));
      addToast({ type: 'success', title: 'Deleted', message: `"${personaName}" has been removed.` });
    } catch (error) {
      addToast({ type: 'error', title: 'Delete Failed' });
    }
  };

  return (
    <div style={{ background: 'var(--bg-secondary)', borderRadius: '16px', border: '1px solid var(--border-color)', overflow: 'hidden' }}>
      {/* Header */}
      <div style={{ padding: '24px', borderBottom: '1px solid var(--border-color)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div style={{ position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'center', width: '36px', height: '36px' }}>
            <div style={{ position: 'absolute', inset: 0, background: 'var(--brand-primary)', opacity: 0.1, borderRadius: '8px' }}></div>
            <Sparkles size={20} color="var(--brand-primary)" />
          </div>
          <div>
            <h2 style={{ fontSize: '20px', fontWeight: 'bold', color: 'var(--text-primary)', margin: 0 }}>Brand Voices</h2>
            <p style={{ fontSize: '13px', color: 'var(--text-secondary)', margin: 0 }}>Train AI to write like you</p>
          </div>
        </div>
        <button
          className="btn btn-primary"
          onClick={() => setShowForm(!showForm)}
          style={{ padding: '8px 16px', fontSize: '14px' }}
        >
          <Plus size={16} /> New Persona
        </button>
      </div>

      {/* Create Form */}
      {showForm && (
        <div style={{ padding: '24px', borderBottom: '1px solid var(--border-color)', background: 'var(--bg-primary)' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div>
              <label style={{ fontSize: '14px', fontWeight: 500, color: 'var(--text-primary)', display: 'block', marginBottom: '6px' }}>
                Persona Name
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g., Sarcastic Twitter, Professional LinkedIn"
                style={{ width: '100%', padding: '12px', borderRadius: '10px', border: '1px solid var(--border-color)', background: 'var(--bg-secondary)', color: 'var(--text-primary)', outline: 'none', fontSize: '14px' }}
              />
            </div>

            <div>
              <label style={{ fontSize: '14px', fontWeight: 500, color: 'var(--text-primary)', display: 'block', marginBottom: '6px' }}>
                Description (optional)
              </label>
              <input
                type="text"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="e.g., My viral tweet style with lots of emojis"
                style={{ width: '100%', padding: '12px', borderRadius: '10px', border: '1px solid var(--border-color)', background: 'var(--bg-secondary)', color: 'var(--text-primary)', outline: 'none', fontSize: '14px' }}
              />
            </div>

            <div>
              <label style={{ fontSize: '14px', fontWeight: 500, color: 'var(--text-primary)', display: 'block', marginBottom: '6px' }}>
                Training Text — Paste your past successful posts
              </label>
              <p style={{ fontSize: '12px', color: 'var(--text-secondary)', margin: '0 0 8px 0' }}>
                Paste 3-10 of your best posts separated by blank lines. The AI will learn your unique tone, emoji patterns, and sentence structure.
              </p>
              <textarea
                value={trainingText}
                onChange={(e) => setTrainingText(e.target.value)}
                placeholder={"My first viral tweet was about...\n\nAnother great post that performed well...\n\nYet another example of my writing style..."}
                rows={8}
                style={{ width: '100%', padding: '16px', borderRadius: '10px', border: '1px solid var(--border-color)', background: 'var(--bg-secondary)', color: 'var(--text-primary)', outline: 'none', fontSize: '14px', resize: 'vertical', lineHeight: 1.6 }}
              />
            </div>

            <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
              <button className="btn btn-outline" onClick={() => setShowForm(false)} style={{ padding: '10px 20px' }}>
                Cancel
              </button>
              <button
                className="btn btn-primary"
                onClick={handleCreate}
                disabled={creating || !name.trim()}
                style={{ padding: '10px 24px' }}
              >
                {creating ? <><Loader2 size={16} className="spin-anim" /> Training...</> : 'Create & Train'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Persona List */}
      <div style={{ padding: '16px' }}>
        {loading ? (
          <div style={{ display: 'flex', justifyContent: 'center', padding: '32px' }}>
            <Loader2 size={24} color="var(--brand-primary)" className="spin-anim" />
          </div>
        ) : personas.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '32px', color: 'var(--text-secondary)' }}>
            <UserCircle size={40} style={{ margin: '0 auto 12px', opacity: 0.4 }} />
            <p style={{ margin: 0, fontSize: '14px' }}>No personas yet. Create one to teach the AI your unique voice!</p>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {personas.map((persona) => (
              <div
                key={persona.id}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '16px',
                  borderRadius: '12px',
                  border: '1px solid var(--border-color)',
                  background: 'var(--bg-primary)',
                  transition: 'box-shadow 0.2s ease',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                  <div style={{ width: '42px', height: '42px', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(249, 115, 22, 0.1)' }}>
                    <MessageSquareText size={20} color="var(--brand-primary)" />
                  </div>
                  <div>
                    <div style={{ fontWeight: 600, fontSize: '15px', color: 'var(--text-primary)' }}>{persona.name}</div>
                    <div style={{ fontSize: '12px', color: 'var(--text-secondary)', marginTop: '2px' }}>
                      {persona.embeddingCount} voice samples • Created {new Date(persona.created_at).toLocaleDateString()}
                    </div>
                  </div>
                </div>
                <button
                  onClick={() => handleDelete(persona.id, persona.name)}
                  style={{ padding: '8px', borderRadius: '8px', color: 'var(--text-secondary)', cursor: 'pointer', border: 'none', background: 'transparent', transition: 'all 0.2s ease' }}
                  title="Delete persona"
                >
                  <Trash2 size={16} />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
