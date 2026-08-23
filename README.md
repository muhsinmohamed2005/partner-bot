# Partner Bot
The React frontend for **Partner Bot**: an AI chatbot that answers natural-language questions about public companies' SEC filings, retrieving the exact filing from SEC EDGAR and grounded in the actual filing text rather than general-knowledge guesses.

This repo handles the UI, authentication, and request/response flow. It calls a separate backend pipeline (filing retrieval + Bedrock inference) to generate answers.

# What The Website Does:
A user picks a company, fiscal year, and period, and asks a question. The app authenticates the user, sends the request to the backend, and displays the synthesized answer once it returns.

# Stack
- React + TypeScript + Vite
- AWS Amplify Gen 2 (Authenticator UI, Theming)
- AWS Cognito (\`fetchAuthSession\`)

# Deployment
```bash
npm run dev
npx ampx sandbox
```
*Part of a 3-repo system. See the [Partner Bot overview](#) for the full architecture, live demo video, and links to the other two repos ([sec-llm-service](https://github.com/muhsinmohamed2005/sec-llm-service), [cdk-10q-inference](https://github.com/muhsinmohamed2005/cdk-10q-inference)).*
