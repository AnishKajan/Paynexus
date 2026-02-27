# ── Stage 1: Build ────────────────────────────────────────────────────────────
FROM rust:1.82-slim AS builder

WORKDIR /app

# Cache dependency layer separately from source
COPY Cargo.toml Cargo.lock ./
RUN mkdir src && echo 'fn main(){}' > src/main.rs
RUN cargo build --release
RUN rm -rf src

# Build real source
COPY src ./src
# Touch main.rs so cargo knows to re-link
RUN touch src/main.rs
RUN cargo build --release

# ── Stage 2: Runtime ──────────────────────────────────────────────────────────
FROM debian:bookworm-slim AS runtime

RUN apt-get update \
    && apt-get install -y --no-install-recommends ca-certificates \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /app

COPY --from=builder /app/target/release/paynexus-backend ./paynexus-backend

# Default port — overridden by Container Apps via $PORT env var
ENV PORT=8080
EXPOSE 8080

# The binary reads PORT from env and binds to 0.0.0.0:$PORT
CMD ["./paynexus-backend"]
