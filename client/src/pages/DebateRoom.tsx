import {
  AlertCircle,
  MessageSquare,
  Send,
  ThumbsUp,
} from 'lucide-react';
import { useCallback, useEffect, useState, type FormEvent } from 'react';
import { useAuth } from '../context/AuthContext';
import { apiClient } from '../services/apiClient';
import type { DebatePostItem } from '../types';

interface DebateRoomProps {
  missionId: string;
  preguntaDebate?: string;
}

export function DebateRoom({ missionId, preguntaDebate }: DebateRoomProps) {
  const { user } = useAuth();
  const [posts, setPosts] = useState<DebatePostItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [newArgument, setNewArgument] = useState('');
  const [submittingPost, setSubmittingPost] = useState(false);

  const [commentDrafts, setCommentDrafts] = useState<Record<string, string>>({});
  const [submittingCommentId, setSubmittingCommentId] = useState<string | null>(
    null
  );

  const loadDebates = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await apiClient.listDebates(missionId);
      setPosts(res.publicaciones);
    } catch (err: any) {
      setError(err?.message || 'No se pudo cargar la sala de debate.');
    } finally {
      setLoading(false);
    }
  }, [missionId]);

  useEffect(() => {
    loadDebates();
  }, [loadDebates]);

  const handlePublishArgument = async (e: FormEvent) => {
    e.preventDefault();
    if (!newArgument.trim()) return;
    setSubmittingPost(true);
    setError(null);

    try {
      await apiClient.createDebatePost(missionId, newArgument.trim());
      setNewArgument('');
      await loadDebates();
    } catch (err: any) {
      setError(err?.message || 'Error al publicar tu argumento.');
    } finally {
      setSubmittingPost(false);
    }
  };

  const handleAddComment = async (e: FormEvent, postId: string) => {
    e.preventDefault();
    const texto = (commentDrafts[postId] || '').trim();
    if (!texto) return;

    setSubmittingCommentId(postId);
    setError(null);
    try {
      await apiClient.commentDebatePost(postId, texto);
      setCommentDrafts((prev) => ({ ...prev, [postId]: '' }));
      await loadDebates();
    } catch (err: any) {
      setError(err?.message || 'Error al publicar el comentario.');
    } finally {
      setSubmittingCommentId(null);
    }
  };

  const handleToggleVote = async (postId: string) => {
    if (!user) return;
    try {
      const res = await apiClient.toggleVoteDebatePost(postId);
      setPosts((prev) =>
        prev.map((p) => {
          if (p.id !== postId) return p;
          const updatedVotes = res.votado
            ? [...p.votos, user.id]
            : p.votos.filter((v) => String(v) !== user.id);
          return {
            ...p,
            totalVotos: res.totalVotos,
            votos: updatedVotes,
          };
        })
      );
    } catch (err: any) {
      setError(err?.message || 'Error al registrar el voto.');
    }
  };

  return (
    <section className="rounded-xl border border-slate-800 bg-[#0a0f1c] p-6 sm:p-8 space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800 pb-5">
        <div className="space-y-1">
          <div className="flex items-center gap-2 text-xs font-semibold text-[#10b981]">
            <MessageSquare className="w-4 h-4" />
            <span>Sala de Debate Técnico-Jurídico</span>
          </div>
          <h2 className="font-display text-xl font-bold text-white">
            Discusión entre agentes sobre este expediente
          </h2>
        </div>
        <span className="font-mono text-xs text-slate-400 tabular-nums">
          {posts.length} aportaciones
        </span>
      </div>

      {preguntaDebate && (
        <div className="rounded-lg border border-[#10b981]/30 bg-[#05080f] p-4 space-y-1">
          <p className="text-xs font-semibold text-[#10b981]">
            Cuestión planteada por Gemini AI
          </p>
          <p className="text-sm text-slate-200 leading-relaxed">
            {preguntaDebate}
          </p>
        </div>
      )}

      {error && (
        <div className="flex items-start gap-2.5 rounded-lg border border-red-500/40 bg-red-950/30 p-3.5 text-xs text-red-200">
          <AlertCircle className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
          <span>{error}</span>
        </div>
      )}

      {/* Formulario para publicar nuevo argumento */}
      {user ? (
        <form onSubmit={handlePublishArgument} className="space-y-3">
          <label
            htmlFor="nuevo-argumento"
            className="block text-xs font-medium text-slate-300"
          >
            Publicar argumento técnico o jurídico
          </label>
          <textarea
            id="nuevo-argumento"
            rows={3}
            minLength={10}
            maxLength={2500}
            required
            value={newArgument}
            disabled={submittingPost}
            onChange={(e) => setNewArgument(e.target.value)}
            placeholder="Comparte tu análisis sobre las evidencias, riesgos o la aplicación del RGPD / LOPDGDD / Código Penal..."
            className="w-full rounded-lg border border-slate-700 bg-[#05080f] p-3.5 text-sm text-white placeholder-slate-500 focus:border-[#10b981] focus:outline-none"
          />
          <div className="flex justify-end">
            <button
              type="submit"
              disabled={submittingPost || newArgument.trim().length < 10}
              className="inline-flex items-center gap-2 rounded-lg bg-[#10b981] px-4 py-2 text-xs font-semibold text-[#05080f] hover:bg-[#059669] disabled:opacity-50 transition-colors cursor-pointer"
            >
              <Send className="w-3.5 h-3.5" />
              <span>
                {submittingPost ? 'Publicando...' : 'Publicar argumento'}
              </span>
            </button>
          </div>
        </form>
      ) : (
        <p className="text-xs text-slate-400">
          Inicia sesión para publicar argumentos, comentar o votar aportaciones.
        </p>
      )}

      {/* Lista de publicaciones */}
      {loading ? (
        <div className="space-y-3">
          {[1, 2].map((n) => (
            <div
              key={n}
              className="h-28 rounded-lg border border-slate-800 bg-[#05080f] animate-pulse"
            />
          ))}
        </div>
      ) : posts.length === 0 ? (
        <div className="rounded-lg border border-slate-800 bg-[#05080f] p-8 text-center">
          <p className="text-sm text-slate-300">
            Aún no hay argumentos publicados en esta misión. Inicia el debate
            con tu análisis.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {posts.map((post) => {
            const hasVoted =
              Boolean(user) &&
              post.votos.some((v) => String(v) === user?.id);
            const dateStr = new Date(post.createdAt).toLocaleString('es-ES', {
              day: '2-digit',
              month: 'short',
              hour: '2-digit',
              minute: '2-digit',
            });

            return (
              <article
                key={post.id}
                className="rounded-lg border border-slate-800 bg-[#05080f] p-5 space-y-4"
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="text-xs text-slate-400">
                    <span className="font-semibold text-white">
                      {post.autorNombre}
                    </span>
                    <span aria-hidden="true" className="mx-2">
                      ·
                    </span>
                    <span className="font-mono">{dateStr}</span>
                  </div>

                  <button
                    type="button"
                    disabled={!user}
                    onClick={() => handleToggleVote(post.id)}
                    className={`inline-flex items-center gap-1.5 rounded-md border px-2.5 py-1 text-xs font-mono tabular-nums transition-colors cursor-pointer ${
                      hasVoted
                        ? 'border-[#10b981] bg-[#10b981]/15 text-[#10b981]'
                        : 'border-slate-700 text-slate-300 hover:border-slate-500'
                    }`}
                  >
                    <ThumbsUp className="w-3.5 h-3.5" />
                    <span>{post.totalVotos}</span>
                  </button>
                </div>

                <p className="text-sm text-slate-200 leading-relaxed whitespace-pre-line">
                  {post.argumento}
                </p>

                {/* Comentarios anidados */}
                <div className="border-t border-slate-800/80 pt-3.5 space-y-3">
                  {post.comentarios.length > 0 && (
                    <div className="space-y-2.5 pl-3 border-l border-slate-800">
                      {post.comentarios.map((c, idx) => (
                        <div key={c._id || idx} className="text-xs space-y-0.5">
                          <div className="text-slate-400">
                            <span className="font-semibold text-slate-200">
                              {c.autor}
                            </span>
                            <span aria-hidden="true" className="mx-1.5">
                              ·
                            </span>
                            <span className="font-mono">
                              {new Date(c.fecha).toLocaleDateString('es-ES')}
                            </span>
                          </div>
                          <p className="text-slate-300 leading-relaxed">
                            {c.texto}
                          </p>
                        </div>
                      ))}
                    </div>
                  )}

                  {user && (
                    <form
                      onSubmit={(e) => handleAddComment(e, post.id)}
                      className="flex items-center gap-2"
                    >
                      <input
                        type="text"
                        required
                        minLength={2}
                        maxLength={1000}
                        value={commentDrafts[post.id] || ''}
                        onChange={(e) =>
                          setCommentDrafts((prev) => ({
                            ...prev,
                            [post.id]: e.target.value,
                          }))
                        }
                        placeholder="Responder a esta aportación..."
                        className="flex-1 rounded-lg border border-slate-800 bg-[#0a0f1c] px-3 py-2 text-xs text-white placeholder-slate-500 focus:border-[#10b981] focus:outline-none"
                      />
                      <button
                        type="submit"
                        disabled={submittingCommentId === post.id}
                        className="rounded-lg border border-slate-700 bg-[#0a0f1c] px-3.5 py-2 text-xs font-medium text-slate-200 hover:border-[#10b981] transition-colors cursor-pointer whitespace-nowrap shrink-0"
                      >
                        {submittingCommentId === post.id
                          ? 'Enviando...'
                          : 'Responder'}
                      </button>
                    </form>
                  )}
                </div>
              </article>
            );
          })}
        </div>
      )}
    </section>
  );
}
