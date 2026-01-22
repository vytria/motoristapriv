# João Motorista Particular (GitHub Pages)

Site 100% estático (somente GitHub) com:
- Página premium estilo SaaS
- Explicação do serviço + planos
- Orçamento (avulso e mensal)
- Regra: mensal = 50% antecipado + 50% no fechamento do mês
- Botão de fechamento no WhatsApp com mensagem pronta

## 1) Como publicar no GitHub Pages (passo a passo)
1. Crie um repositório no GitHub (ex.: `joao-motorista`).
2. Faça upload dos arquivos na raiz do repositório:
   - index.html
   - style.css
   - script.js
   - config.json
   - README.md
3. Vá em **Settings** → **Pages**
4. Em **Build and deployment**:
   - Source: **Deploy from a branch**
   - Branch: **main** (ou master) / **root**
5. Salve. Aguarde o GitHub gerar o link do Pages.

## 2) Ajustar preços (obrigatório)
Edite o arquivo `config.json`:
- pricing.price_per_km
- pricing.base_fee
- pricing.minimum_fare
- (opcional) pricing.monthly_discount_percent

## 3) Como funciona o orçamento
- Tenta calcular distância automaticamente (OpenStreetMap/Nominatim + OSRM).
- Se falhar, você pode informar o KM manualmente no campo “KM manual”.

Observação: para uso intenso, o ideal é usar um provedor com chave (Google/Mapbox).
