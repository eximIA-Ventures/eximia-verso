/**
 * Content Transforms — Content Factory utilities
 *
 * Transformações aplicadas ao conteúdo antes da publicação.
 * Usado no pipeline da Content Factory (WF-8).
 */

export interface PersonEntry {
  name: string;
  url: string;
  /** Variações do nome que também devem ser linkadas (ex: "Taleb" para "Nassim Taleb") */
  aliases?: string[];
}

/**
 * Registro de pessoas conhecidas com links para páginas de referência.
 * Adicione novas pessoas aqui conforme forem citadas em artigos.
 */
export const PERSON_REGISTRY: PersonEntry[] = [
  // Copywriters & Content
  { name: "Gary Halbert", url: "https://en.wikipedia.org/wiki/Gary_Halbert" },
  { name: "David Ogilvy", url: "https://en.wikipedia.org/wiki/David_Ogilvy_(businessman)", aliases: ["Ogilvy"] },
  { name: "Joe Sugarman", url: "https://en.wikipedia.org/wiki/Joseph_Sugarman" },
  { name: "Stefan Georgi", url: "https://www.stefanpaulgeorgi.com/" },
  { name: "Andre Chaperon", url: "https://andrechaperon.com/" },
  { name: "Claude Hopkins", url: "https://en.wikipedia.org/wiki/Claude_C._Hopkins" },
  { name: "Robert Collier", url: "https://en.wikipedia.org/wiki/Robert_Collier_(author)" },
  { name: "Dan Kennedy", url: "https://en.wikipedia.org/wiki/Dan_S._Kennedy" },
  { name: "Eugene Schwartz", url: "https://en.wikipedia.org/wiki/Eugene_Schwartz" },

  // Marketing & Strategy
  { name: "Philip Kotler", url: "https://en.wikipedia.org/wiki/Philip_Kotler", aliases: ["Kotler"] },
  { name: "Michael Porter", url: "https://en.wikipedia.org/wiki/Michael_Porter", aliases: ["Porter"] },
  { name: "Seth Godin", url: "https://en.wikipedia.org/wiki/Seth_Godin" },
  { name: "Gary Vaynerchuk", url: "https://en.wikipedia.org/wiki/Gary_Vaynerchuk", aliases: ["GaryVee"] },

  // Data & Analytics
  { name: "Nate Silver", url: "https://en.wikipedia.org/wiki/Nate_Silver" },
  { name: "Amy Webb", url: "https://en.wikipedia.org/wiki/Amy_Webb" },

  // Finance & Investment
  { name: "Warren Buffett", url: "https://en.wikipedia.org/wiki/Warren_Buffett", aliases: ["Buffett"] },
  { name: "Charlie Munger", url: "https://en.wikipedia.org/wiki/Charlie_Munger", aliases: ["Munger"] },
  { name: "Aswath Damodaran", url: "https://en.wikipedia.org/wiki/Aswath_Damodaran", aliases: ["Damodaran"] },
  { name: "Hermann Simon", url: "https://en.wikipedia.org/wiki/Hermann_Simon" },

  // Decision & Risk
  { name: "Nassim Taleb", url: "https://en.wikipedia.org/wiki/Nassim_Nicholas_Taleb", aliases: ["Nassim Nicholas Taleb", "Taleb"] },
  { name: "Annie Duke", url: "https://en.wikipedia.org/wiki/Annie_Duke" },
  { name: "Ray Dalio", url: "https://en.wikipedia.org/wiki/Ray_Dalio" },

  // Business & Leadership
  { name: "Jim Collins", url: "https://en.wikipedia.org/wiki/Jim_Collins_(author)" },
  { name: "Peter Thiel", url: "https://en.wikipedia.org/wiki/Peter_Thiel" },
  { name: "Alex Hormozi", url: "https://en.wikipedia.org/wiki/Alex_Hormozi", aliases: ["Hormozi"] },
  { name: "Gino Wickman", url: "https://en.wikipedia.org/wiki/Gino_Wickman" },

  // Tech & Futurism
  { name: "Elon Musk", url: "https://en.wikipedia.org/wiki/Elon_Musk" },
  { name: "Sam Altman", url: "https://en.wikipedia.org/wiki/Sam_Altman" },

  // Design
  { name: "Jony Ive", url: "https://en.wikipedia.org/wiki/Jony_Ive" },
  { name: "Don Norman", url: "https://en.wikipedia.org/wiki/Don_Norman" },
  { name: "Brad Frost", url: "https://bradfrost.com/" },
];

/**
 * Aplica hiperlinks em nomes de pessoas citadas no conteúdo markdown.
 *
 * Regras:
 * - Linka apenas a PRIMEIRA ocorrência de cada pessoa
 * - Não altera nomes já dentro de links markdown [texto](url)
 * - Não altera nomes dentro de blocos de código ou imagens
 * - Prioriza o nome completo antes de aliases
 *
 * @param content - Conteúdo markdown do artigo
 * @param registry - Registro de pessoas (default: PERSON_REGISTRY)
 * @returns Conteúdo com hiperlinks aplicados
 */
export function linkifyPersonMentions(
  content: string,
  registry: PersonEntry[] = PERSON_REGISTRY,
): string {
  let result = content;
  const alreadyLinked = new Set<string>();

  // Ordenar por tamanho do nome (maior primeiro) para evitar match parcial
  // Ex: "Nassim Nicholas Taleb" antes de "Nassim Taleb" antes de "Taleb"
  const allNames: { name: string; url: string; canonical: string }[] = [];
  for (const person of registry) {
    allNames.push({ name: person.name, url: person.url, canonical: person.name });
    if (person.aliases) {
      for (const alias of person.aliases) {
        allNames.push({ name: alias, url: person.url, canonical: person.name });
      }
    }
  }
  allNames.sort((a, b) => b.name.length - a.name.length);

  for (const { name, url, canonical } of allNames) {
    if (alreadyLinked.has(canonical)) continue;

    // Regex: nome que NÃO está dentro de link markdown ou imagem
    // Negative lookbehind: não precedido por [ ou ]( ou ![ ou `
    // Negative lookahead: não seguido por ]( ou `)
    const escaped = name.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    const regex = new RegExp(
      `(?<!\\[)(?<!\\]\\()(?<!\\!\\[)(?<!\`)\\b${escaped}\\b(?!\\])(?!\\()(?!\`)`,
    );

    const match = result.match(regex);
    if (match && match.index !== undefined) {
      // Verificar se está dentro de um bloco de código (```)
      const before = result.slice(0, match.index);
      const codeBlockCount = (before.match(/```/g) || []).length;
      if (codeBlockCount % 2 === 1) continue; // Dentro de code block

      // Verificar se está dentro de inline code (`)
      const lineStart = before.lastIndexOf("\n") + 1;
      const linePrefix = result.slice(lineStart, match.index);
      const backtickCount = (linePrefix.match(/`/g) || []).length;
      if (backtickCount % 2 === 1) continue; // Dentro de inline code

      // Aplicar link
      result =
        result.slice(0, match.index) +
        `[${match[0]}](${url})` +
        result.slice(match.index + match[0].length);

      alreadyLinked.add(canonical);
    }
  }

  return result;
}

/**
 * Remove travessões (em-dashes) do conteúdo, substituindo por pontuação contextual.
 *
 * Regras:
 * - " — " entre frases → ", " (continuação) ou ". " (nova ideia)
 * - Início de lista/explicação → ": "
 * - Abertura parentética → " ("
 *
 * @param content - Conteúdo markdown
 * @returns Conteúdo sem travessões
 */
export function removeEmDashes(content: string): string {
  // Substituições contextuais simplificadas
  return content
    // " — " seguido de explicação/lista → ": "
    .replace(/ — (?=\d|[A-Z][a-z]+ \d|entre |de R\$|mais de |menos de )/g, ": ")
    // " — " no meio de frase → ", "
    .replace(/ — /g, ", ");
}
