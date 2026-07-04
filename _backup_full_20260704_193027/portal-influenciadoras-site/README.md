# portal-influenciadoras (redirecionador)

Site estático no GitHub Pages que serve `portal.estudioela.com`. Existe só para
dar um endereço no domínio da agência ao Web App do Apps Script (Google não
permite domínio personalizado nativo em Web Apps).

`index.html` carrega o portal em um `<iframe>` de tela cheia, apontando para a
URL de implantação `.../exec`. Se a implantação do Apps Script mudar (novo
deploy que gere uma nova URL), atualize o `src` do iframe aqui.

## Setup de DNS (fora do GitHub, no provedor do domínio estudioela.com)

Crie um registro **CNAME**:

```
portal.estudioela.com  →  estudioela.github.io
```

Depois que o DNS propagar, confirme em Settings → Pages deste repositório que
o domínio customizado foi verificado e ative "Enforce HTTPS".
