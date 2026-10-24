# FrutaVerse AI 🍓

Um protótipo inicial de estúdio para criar séries de histórias com frutas antropomórficas em animação 3D cinematográfica.

## O que já funciona

- Painel inicial com contadores e lista de séries.
- Criação de séries com gênero, tom, duração e premissa.
- Cadastro de personagens com aparência, personalidade, voz e relações.
- Criação de rascunhos de episódios com cenas, diálogos e gancho final.
- Edição, salvamento, aprovação e marcação de roteiros para alterações.
- Continuidade básica: episódios anteriores ficam associados à série e aparecem no contexto do próximo episódio.
- Dados salvos no armazenamento local do navegador.

## Limitações atuais — importante

Esta é a primeira versão do **frontend**. A geração de histórias por uma IA externa, imagens, vozes e vídeos ainda não está conectada. O rascunho criado pelo botão é explicitamente demonstrativo; não deve ser confundido com conteúdo gerado por uma IA real. A produção de vídeo permanece desativada.

Os dados ficam no navegador usado para abrir o site. Limpar os dados do navegador pode apagá-los, e eles não são sincronizados entre dispositivos.

## Como testar

Abra `index.html` num navegador moderno. Para desenvolvimento, pode usar a extensão Live Server do VS Code.

## Como publicar gratuitamente com GitHub Pages

1. No GitHub, abra **Settings** deste repositório.
2. Entre em **Pages**.
3. Em **Build and deployment**, escolha **Deploy from a branch**.
4. Selecione a branch `main` e a pasta `/ (root)`, depois clique em **Save**.
5. Aguarde o GitHub publicar o site. O endereço normalmente será `https://agenorkk.github.io/frutaverse-ai/`.

## Próximas etapas

1. Conectar uma API de texto através de um backend seguro (por exemplo, Supabase Edge Functions).
2. Nunca colocar chaves secretas de API no `app.js` ou em qualquer arquivo enviado ao navegador.
3. Criar armazenamento persistente e autenticação.
4. Integrar APIs reais de imagem, vídeo, voz e montagem, com estimativa de custo e confirmação explícita antes de qualquer geração paga.
5. Testar a continuidade dos personagens e dos episódios.

## Arquivos

- `index.html` — estrutura da aplicação.
- `styles.css` — estilo responsivo.
- `app.js` — interface, armazenamento local e fluxo de séries/episódios.

Feito como ponto de partida para o FrutaVerse AI.