import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { isAxiosError } from 'axios';
import { getMeParticipacao, type MeParticipacao } from '../../lib/me';
import { listBriefings, type Briefing, type TipoConteudo } from '../../lib/briefings';
import { getPagamento, pagamentoStatusTone, type Pagamento } from '../../lib/pagamentos';
import Badge from '../../components/Badge';
import styles from './PortalParticipacaoPage.module.css';

const TIPOS: TipoConteudo[] = ['FEED', 'REELS', 'STORIES', 'TIKTOK', 'UGC'];
const ROTULO: Record<TipoConteudo, string> = {
  FEED: 'Feed',
  REELS: 'Reels',
  STORIES: 'Stories',
  TIKTOK: 'TikTok',
  UGC: 'UGC',
};

function prazoRelativo(prazo: string): string {
  const hoje = new Date();
  hoje.setHours(0, 0, 0, 0);
  const dataPrazo = new Date(`${prazo}T00:00:00`);
  const dias = Math.round((dataPrazo.getTime() - hoje.getTime()) / 86400000);

  if (dias < 0) return `atrasado há ${Math.abs(dias)} dia${Math.abs(dias) === 1 ? '' : 's'}`;
  if (dias === 0) return 'hoje';
  return `faltam ${dias} dia${dias === 1 ? '' : 's'}`;
}

export default function PortalParticipacaoPage() {
  const { participacaoId } = useParams<{ participacaoId: string }>();
  const navigate = useNavigate();
  const [participacao, setParticipacao] = useState<MeParticipacao | null>(null);
  const [briefings, setBriefings] = useState<Briefing[]>([]);
  const [pagamento, setPagamento] = useState<Pagamento | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!participacaoId) return;

    getMeParticipacao(participacaoId)
      .then((data) => {
        setParticipacao(data);
        return Promise.all([listBriefings(participacaoId), getPagamento(participacaoId)]);
      })
      .then(([briefingsData, pagamentoData]) => {
        setBriefings(briefingsData);
        setPagamento(pagamentoData);
      })
      .catch((err) => {
        if (isAxiosError(err) && (err.response?.status === 403 || err.response?.status === 404)) {
          navigate('/', { replace: true });
          return;
        }
        setError('Não foi possível carregar esta participação.');
      })
      .finally(() => setIsLoading(false));
  }, [participacaoId, navigate]);

  if (isLoading) {
    return <p className={styles.loading}>Carregando…</p>;
  }

  if (error || !participacao) {
    return <p role="alert">{error ?? 'Participação indisponível.'}</p>;
  }

  return (
    <div className={styles.page}>
      <header className={styles.header}>
        <h2 className={styles.title}>{participacao.campanha.nome}</h2>
        <p className={styles.subtitle}>{participacao.campanha.marca.nome}</p>
        <p className={styles.periodo}>
          {participacao.campanha.data_inicio}
          {participacao.campanha.data_fim ? ` – ${participacao.campanha.data_fim}` : ''}
        </p>
        <div className={styles.resumo}>
          {TIPOS.map((tipo) => {
            const qtd = participacao.entregaveis_contratados[tipo];
            return (
              <span
                key={tipo}
                className={qtd > 0 ? styles.resumoItem : styles.resumoItemVazio}
              >
                {ROTULO[tipo]} {qtd}
              </span>
            );
          })}
        </div>
      </header>

      <section className={styles.section}>
        <h3 className={styles.sectionTitle}>Briefing</h3>
        {TIPOS.filter((tipo) => participacao.entregaveis_contratados[tipo] > 0).map((tipo) => {
          const briefing = briefings.find((b) => b.tipo === tipo);

          if (!briefing) {
            return (
              <div key={tipo} className={styles.briefingBlocoVazio}>
                briefing de {ROTULO[tipo]} ainda não publicado
              </div>
            );
          }

          return (
            <div key={tipo} className={styles.briefingBloco}>
              <h4 className={styles.briefingTipo}>{ROTULO[tipo]}</h4>
              <p className={styles.briefingOrientacoes}>{briefing.orientacoes}</p>
              <p className={styles.briefingPrazo}>
                entrega até {briefing.prazo} — {prazoRelativo(briefing.prazo)}
              </p>
              {briefing.entregaveis_esperados && <p>{briefing.entregaveis_esperados}</p>}
            </div>
          );
        })}
      </section>

      <section className={styles.section}>
        <h3 className={styles.sectionTitle}>Materiais</h3>
        <p className={styles.emBreve}>Envio de material pelo Portal chega em breve.</p>
      </section>

      <section className={styles.section}>
        <h3 className={styles.sectionTitle}>Pagamento</h3>
        {pagamento ? (
          <div className={styles.pagamentoBloco}>
            <Badge label={pagamento.status} tone={pagamentoStatusTone(pagamento.status)} />
            <p className={styles.pagamentoValor}>R$ {pagamento.valor.toFixed(2)}</p>
          </div>
        ) : (
          <p className={styles.emBreve}>Nenhum pagamento registrado ainda para esta campanha.</p>
        )}
      </section>
    </div>
  );
}
