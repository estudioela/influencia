import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { campanhaStatusTone, getCampanha, type Campanha } from '../../lib/campanhas';
import { participacaoStatusTone } from '../../lib/participacoes';
import Badge from '../../components/Badge';
import styles from '../CampanhaDetailPage.module.css';

export default function PortalCampanhaDetailPage() {
  const { id } = useParams<{ id: string }>();
  const [campanha, setCampanha] = useState<Campanha | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!id) return;
    getCampanha(id)
      .then(setCampanha)
      .catch(() => setError('Não foi possível carregar esta campanha.'));
  }, [id]);

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

      <Link to="/campanhas" className={styles.backLink}>
        ← voltar para a lista
      </Link>
    </div>
  );
}
