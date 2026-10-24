# FrutaVerse AI 🍓

Estúdio para criar séries com frutas antropomórficas, mantendo personagens e continuidade entre episódios.

## Recursos do projeto

- Criação de séries, elenco e identidades visuais.
- Geração de roteiro por IA através de uma função de servidor segura.
- Contexto dos episódios anteriores enviado à IA para ajudar na continuidade.
- Cenas com descrições visuais, diálogos e gancho final.
- Revisão e aprovação manual antes de qualquer etapa de vídeo.
- Dados do projeto salvos no navegador atual.

## Importante

A geração de roteiro usa a API do Google Gemini quando a aplicação está implantada na Vercel e a variável `GEMINI_API_KEY` está configurada. A chave fica no servidor e não deve ser colocada em `app.js`, `index.html` ou em qualquer arquivo público.

**A geração de vídeo ainda não está integrada.** Aprovar um roteiro não cria um vídeo. Isso será uma etapa separada, dependente de um serviço de vídeo e das condições/preços desse serviço.

Os dados das séries e episódios ainda ficam no armazenamento local do navegador. Não há sincronização entre dispositivos; limpar os dados do navegador pode apagar o projeto local.

## Publicar com IA usando Vercel

O GitHub Pages publica apenas os arquivos estáticos e não executa a função `/api/generate`. Para a geração de roteiro funcionar, publique este repositório na Vercel:

1. Acesse https://vercel.com/ e entre com sua conta GitHub.
2. Clique em **Add New… → Project** e importe o repositório `Agenorkk/frutaverse-ai`.
3. Use as configurações padrão para um projeto simples; a Vercel detectará a função em `api/generate.js`.
4. Antes de gerar roteiros, abra **Settings → Environment Variables** no projeto da Vercel.
5. Crie a variável `GEMINI_API_KEY` e cole nela uma chave obtida na página oficial do Google AI Studio: https://aistudio.google.com/apikey
6. Marque o ambiente **Production** (e Preview, se quiser testar prévias) e salve.
7. Vá em **Deployments** e faça **Redeploy** do último deployment para carregar a variável.
8. Abra o domínio da Vercel, crie uma série e tente gerar o primeiro roteiro.

Não envie sua chave de API em mensagens, capturas de tela, arquivos públicos ou no GitHub. O Google pode ter limites, exigir configuração de cobrança ou alterar a disponibilidade do modelo; confira as condições da sua conta antes de usar.

## Arquivos principais

- `index.html`: interface.
- `styles.css`: estilos responsivos.
- `app.js`: séries, personagens, edição e fluxo de roteiro.
- `api/generate.js`: endpoint de servidor que chama a API Gemini sem expor a chave.
- `vercel.json`: configuração da função na Vercel.
