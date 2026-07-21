import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { campanhaStatusTone, getCampanha, type Campanha } from '../../lib/campanhas';
import { participacaoStatusTone } from '../../lib/participacoes';
import { listBriefings, type Briefing } from '../../lib/briefings';
import Badge from '../../components/Badge';
import styles from '../CampanhaDetailPage.module.css';

export default function PortalCampanhaDetailPage() {
  const { id } = useParams<{ id: string }>();
  const [campanha, setCampanha] = useState<Campanha | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [briefings, setBriefings] = useState<Briefing[] | null>(null);
  const [briefingsError, setBriefingsError] = useState<string | null>(null);

  useEffect(() => {
    if (!id) return;
    getCampanha(id)
      .then(setCampanha)
      .catch(() => setError('Não foi possível carregar esta campanha.'));
  }, [id]);

  useEffect(() => {
    const participacaoId = campanha?.participacoes[0]?.id;
    if (!participacaoId) return;
    listBriefings(participacaoId)
      .then(setBriefings)
      .catch(() => setBriefingsError('Não foi possível carregar o briefing desta participação.'));
  }, [campanha]);

  if (error) {
    return <p className={styles.error}>{error}</p>;
  }

  if (!campanha) {
    return <p className={styles.loading}>Carregando…</p>;
  }

  const minhaParticipacao = campanha.participacoes[0] ?? null;

  return (
    <div className={styles.page}>
      <header className={styles.header}>
        <div>
          <h2 className={styles.title}>{campanha.nome}</h2>
          <p className={styles.subtitle}>{campanha.marca.nome}</p>
          <div className={styles.statusRow}>
            <Badge label={campanha.status} tone={campanhaStatusTone(campanha.status)} />
          </div>
        </div>
      </header>

      <section className={styles.group}>
        <h3 className={styles.groupTitle}>Período</h3>
        <p className={styles.periodo}>
          {campanha.data_inicio}
          {campanha.data_fim ? ` – ${campanha.data_fim}` : ' (sem data de fim definida)'}
        </p>
        {campanha.descricao && <p className={styles.descricao}>{campanha.descricao}</p>}
      </section>

      <section className={styles.group}>
        <h3 className={styles.groupTitle}>Sua participação</h3>

        {minhaParticipacao === null ? (
          <p className={styles.descricao}>Nenhuma participação encontrada para esta campanha.</p>
        ) : (
          <table className={styles.table}>
            <thead>
              <tr>
                <th>Valor</th>
                <th>Reels</th>
                <th>Carrossel</th>
                <th>Stories</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>
                  {minhaParticipacao.valor_contratado === null
                    ? '—'
                    : `R$ ${minhaParticipacao.valor_contratado.toFixed(2)}`}
                </td>
                <td>{minhaParticipacao.reels_qtd}</td>
                <td>{minhaParticipacao.carrossel_qtd}</td>
                <td>{minhaParticipacao.stories_qtd}</td>
                <td>
                  <Badge
                    label={minhaParticipacao.status}
                    tone={participacaoStatusTone(minhaParticipacao.status)}
                  />
                </td>
              </tr>
            </tbody>
          </table>
        )}
      </section>

      {minhaParticipacao !== null && (
        <section className={styles.group}>
          <h3 className={styles.groupTitle}>Briefing</h3>

          {briefingsError && <p className={styles.error}>{briefingsError}</p>}

          {briefings === null && !briefingsError && (
            <p className={styles.loading}>Carregando…</p>
          )}

          {briefings?.length === 0 && (
            <p className={styles.descricao}>Nenhum briefing publicado ainda para esta participação.</p>
          )}

          {briefings !== null && briefings.length > 0 && (
            <div className={styles.briefingList}>
              {briefings.map((briefing) => (
                <article key={briefing.id} className={styles.briefingCard}>
                  <div className={styles.briefingHeader}>
                    <Badge label={briefing.tipo} tone="neutral" />
                    <span className={styles.briefingPrazo}>prazo: {briefing.prazo}</span>
                  </div>
                  <p className={styles.descricao}>{briefing.orientacoes}</p>
                  {briefing.referencias && briefing.referencias.length > 0 && (
                    <ul className={styles.briefingReferencias}>
                      {briefing.referencias.map((referencia, index) => (
                        <li key={index}>{referencia}</li>
                      ))}
                    </ul>
                  )}
                  {briefing.entregaveis_esperados && (
                    <p className={styles.descricao}>
                      <strong>Entregáveis esperados:</strong> {briefing.entregaveis_esperados}
                    </p>
                  )}
                  {briefing.observacoes && (
                    <p className={styles.descricao}>
                      <strong>Observações:</strong> {briefing.observacoes}
                    </p>
                  )}
                </article>
              ))}
            </div>
          )}
        </section>
      )}

      <Link to="/campanhas" className={styles.backLink}>
        ← voltar para a lista
      </Link>
    </div>
  );
}
