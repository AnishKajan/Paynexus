.PHONY: dev frontend backend install build clean check

# ── Default: run both services ───────────────────────────────────────────────
#  Uses concurrently for reliable parallel output with labeled prefixes.
#  Backend → :3001   Frontend → :3000
dev: install
	@echo ""
	@echo "  [backend]  http://localhost:3001"
	@echo "  [frontend] http://localhost:3000"
	@echo ""
	npm run dev

dev-frontend:
	@echo ""
	@echo "  [frontend] http://localhost:3000"
	@echo ""
	npm run dev:frontend

# ── Individual services (use in separate terminals) ───────────────────────────
frontend:
	cd frontend && npm run dev

backend:
	cd backend && cargo run

# ── Setup ────────────────────────────────────────────────────────────────────
install:
	npm install
	cd frontend && npm install
	cd backend && cargo fetch

# ── Production build ─────────────────────────────────────────────────────────
build:
	cd frontend && npm run build
	cd backend && cargo build --release

# ── Type / compile checks ────────────────────────────────────────────────────
check:
	cd frontend && npx tsc --noEmit
	cd backend && cargo check

# ── Clean ────────────────────────────────────────────────────────────────────
clean:
	rm -rf node_modules
	cd frontend && rm -rf .next node_modules
	cd backend && cargo clean
