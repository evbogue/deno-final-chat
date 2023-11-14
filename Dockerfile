FROM denoland/deno:latest

EXPOSE 8000

WORKDIR /app

USER deno

COPY . .

CMD ["deno", "run", "--allow-all", "--unstable", "serve.js"]
