start-backend:
	cd packages/backend && \
	uvicorn main:app --host 0.0.0.0 --port 4494

start-web-client:
	cd packages/web-client && \
	npm run dev