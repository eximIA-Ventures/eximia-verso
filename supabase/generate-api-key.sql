-- Gerar API Key para J.A.R.V.I.S.
--
-- 1. Gere um token aleatório (ex: openssl rand -hex 32)
-- 2. Gere o SHA-256 do token: echo -n "SEU_TOKEN" | shasum -a 256
-- 3. Insira o hash abaixo:
--
-- Exemplo:
-- Token: abc123def456...
-- Hash:  ba7816bf8f01cfea414140de5dae2223b00361a396177a9cb410ff61f20015ad

INSERT INTO api_keys (name, key_hash, role)
VALUES (
  'jarvis-prod',
  'COLE_O_HASH_SHA256_AQUI',
  'api'
);

-- Para verificar:
-- SELECT * FROM api_keys WHERE active = true;
