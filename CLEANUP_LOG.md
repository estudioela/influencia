# CLEANUP LOG

Data da limpeza: 2026-07-04
Backup principal criado em: _backup_full_20260704_193027

## Itens movidos para arquivamento / reorganização

- archive/legacy/Arquivo Morto/
  - Motivo: conteúdo legado sem vínculo aparente com o fluxo principal.
  - Backup: _backup_full_20260704_193027/Arquivo Morto

- archive/legacy/_QUARENTENA/
  - Motivo: área de quarentena / conteúdo suspenso.
  - Backup: _backup_full_20260704_193027/_QUARENTENA

- archive/legacy/_BACKUP_20260704_192338/
  - Motivo: backup antigo de estrutura anterior; preservado por segurança.
  - Backup: _backup_full_20260704_193027/_BACKUP_20260704_192338

- archive/legacy/portal/
  - Motivo: cópia antiga e potencialmente perigosa, explicitamente marcada como não canônica no README_PERIGO.md.
  - Backup: _backup_full_20260704_193027/portal

- archive/backup-artifacts/backup-erp-full.zip
  - Motivo: artefato de backup consolidado, não necessário no fluxo ativo.
  - Backup: _backup_full_20260704_193027/backup-erp-full.zip

- archive/backup-artifacts/jescri-migracao-backup-20260704-185521.zip
  - Motivo: backup antigo de snapshot anterior.
  - Backup: _backup_full_20260704_193027/jescri-migracao-backup-20260704-185521.zip

- archive/backup-artifacts/jescri-migracao-backup-20260704-191433.zip
  - Motivo: backup antigo de snapshot anterior.
  - Backup: _backup_full_20260704_193027/jescri-migracao-backup-20260704-191433.zip

- archive/backup-artifacts/stitch_portal_est_dio_el_ui-archive.zip
  - Motivo: artefato de archive do portal UI; mantido fora da área ativa.
  - Backup: _backup_full_20260704_193027/stitch_portal_est_dio_el_ui-archive.zip

## Itens mantidos e reorganizados de forma segura

- mae/
  - Mantido como pasta canônica do sistema Apps Script ativo.
  - Nenhuma lógica interna foi alterada.

- docs/
  - Reunido material de documentação estrutural e referências do ERP.

- sites/
  - Reunido os projetos web estáticos e site de influenciadoras para evitar mistura com o core do ERP.

## Itens marcados como uncertain e preservados

- mae/_archive/
  - Possível material histórico do projeto; mantido para evitar remoção indevida.

- mae/portal-stitch-ui/
  - Pode ser parte de UI auxiliar ou artefato antigo; mantido como referência.

- arquivos raw_*.html e versões alternativas em mae/
  - Mantidos porque não há confirmação suficiente de que estejam sem uso.
