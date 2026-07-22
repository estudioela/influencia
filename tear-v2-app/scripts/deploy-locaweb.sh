#!/bin/bash
# Executado NO HOST Locaweb via SSH, chamado por
# .github/workflows/tear-v2-deploy.yml depois que o rsync já publicou o
# código (backend/, incluindo o build do frontend em public/build) em
# <deploy_base_path>/releases/<release_id>/. Completa o deploy atômico:
# instala dependências PHP, liga .env/storage compartilhados, roda
# migrations, gera cache de config/rotas/views e troca o symlink `current`
# (ver Etapa 6 de docs/deployment/PLANO_IMPLEMENTACAO.md).
#
# Uso: ./deploy-locaweb.sh <release_id> <deploy_base_path>
set -euo pipefail

RELEASE_ID="${1:?uso: deploy-locaweb.sh <release_id> <deploy_base_path>}"
BASE_PATH="${2:?uso: deploy-locaweb.sh <release_id> <deploy_base_path>}"
RELEASE_PATH="$BASE_PATH/releases/$RELEASE_ID"

cd "$RELEASE_PATH"

composer install --no-dev --optimize-autoloader --no-interaction

ln -sfn "$BASE_PATH/shared/.env" .env
# storage/ compartilhado entre releases: sem isto, logs (Pulse depende
# deles — monitoramento obrigatório, ver ARQUITETURA_PRODUCAO.md §11) e
# sessões em disco seriam perdidos a cada deploy.
mkdir -p "$BASE_PATH/shared/storage"
rm -rf storage
ln -sfn "$BASE_PATH/shared/storage" storage

php artisan migrate --force
php artisan config:cache
php artisan route:cache
php artisan view:cache

ln -sfn "$RELEASE_PATH" "$BASE_PATH/current"

echo "Release $RELEASE_ID ativa em $BASE_PATH/current"
