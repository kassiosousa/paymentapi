# paymentAPI

API REST para gestão do ciclo de vida de cobranças com suporte a **PIX** e **Cartão de Crédito**, usando **NestJS**, **MySQL** e **Temporal.io** para orquestração robusta dos pagamentos com cartão.

Este projeto foi estruturado seguindo princípios de **Clean Architecture** (Domínio + Casos de Uso + Portas/Interfaces + Adaptadores/Infra).

## Requisitos:
- Endpoints:
  - `POST /api/payment`
  - `PUT /api/payment/:id`
  - `GET /api/payment/:id`
  - `GET /api/payment` (filtros por CPF e método)
- Domínio: `id`, `cpf`, `description`, `amount`, `paymentMethod` (`PIX|CREDIT_CARD`), `status` (`PENDING|PAID|FAIL`)
- Regras:
  - PIX: apenas cria registro `PENDING`
  - Cartão: integra Mercado Pago usando **Checkout Preferences** e atualiza status via callback/notificação
  - Temporal.io para workflow resiliente

## Como rodar o projeto (Docker)
```bash
docker compose up -d --build
```

Serviços:
- API: http://localhost:3000
- Swagger: http://localhost:3000/docs
- Temporal UI: http://localhost:8088
- MySQL: localhost:3306

## Variáveis de ambiente
Copie `.env.example` para `.env` e ajuste se necessário.

Principais:
- `DB_HOST`, `DB_PORT`, `DB_USER`, `DB_PASSWORD`, `DB_NAME`
- `TEMPORAL_ADDRESS` (padrão `temporal:7233`)
- `MP_ACCESS_TOKEN` (token do Mercado Pago)
- `MP_WEBHOOK_SECRET` (opcional; verificação de assinatura, se for habilitado)
- `PUBLIC_BASE_URL` (usada para construir URLs de retorno/callback para o Mercado Pago)

## Fluxo PIX
1. `POST /api/payment` com `paymentMethod=PIX`
2. Cria pagamento `PENDING` no banco
3. Atualiza pagamento para `PAID` ou `FAIL` via rota de update

## Fluxo Cartão
1. `POST /api/payment` com `paymentMethod=CREDIT_CARD`
2. Cria pagamento `PENDING` no banco
3. API inicia um Workflow Temporal
4. Webhook: `POST /api/mercadopago/webhook`
   - Atualiza pagamento para `PAID` ou `FAIL`
   - Localiza o pagamento (pela referência externa)
   - Envia signal ao workflow correspondente
   - faz polling na API do MP para obter status real da transação

## Testes
```bash
docker compose exec api npm test
```

## Endpoints (exemplos)
Criar pagamento PIX:
```bash
curl --request POST \
  --url http://localhost:3000/api/payment \
  --header 'Accept: application/json' \
  --header 'Content-Type: application/json' \
  --data '{ "cpf":"12345678909", "description":"Cobrança PIX", "amount": 199.90, "paymentMethod":"PIX" }'
```

Criar pagamento Cartão:
```bash
curl --request POST \
  --url http://localhost:3000/api/payment \
  --header 'Content-Type: application/json' \
  --data '{ 
	"cpf":"12345678909", 
	"description":"Cobrança CC (teste)",
	"amount": 49.90, 
	"paymentMethod":"CREDIT_CARD" 
}'
```

Detalhes de um pagamento:
```bash
curl --request GET \
  --url http://localhost:3000/api/payment/052dd924-835f-45e2-9532-94df2687f915
```

Listar com filtros:
```bash
curl --request GET \
  --url 'http://localhost:3000/api/payment?cpf=12345678909&paymentMethod=PIX' \
  --header 'Accept: application/json'
```

Atualizar pagamento:
```bash
curl --request PUT \
  --url http://localhost:3000/api/payment/052dd924-835f-45e2-9532-94df2687f915 \
  --header 'Content-Type: application/json' \
  --data '{ "status": "PAID" }'
```