import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { EximiaLogo } from "@/components/EximiaLogo";
import { T } from "@/components/T";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Manifesto",
  description:
    "Por que Verso existe e o que a publicação editorial da exímIA se propõe a fazer.",
};

export default function AboutPage() {
  return (
    <div className="mx-auto max-w-3xl px-6 py-16">
      <p className="mb-2 text-[10px] font-mono uppercase tracking-[0.3em] text-accent">
        <T k="about.tagline" />
      </p>
      <h1 className="mb-10 font-display text-3xl font-bold tracking-tight sm:text-4xl">
        <T k="about.title" />
      </h1>

      <div className="prose prose-lg max-w-none">
        <p>
          Há um paradoxo no mercado de conteúdo sobre inteligência artificial.
          Quanto mais se publica, menos se informa. A maioria recicla press
          releases, traduz hype em manchete e confunde novidade com relevância.
        </p>

        <p>
          <strong>Verso</strong> é a publicação editorial da{" "}
          <strong>exímIA</strong>. Nasceu de uma premissa simples: quem toma
          decisões de negócio precisa de pesquisa verificada, não de mais uma
          newsletter que resume o que todo mundo já leu.
        </p>

        <h2>O problema que nos move</h2>

        <p>
          A velocidade da mudança tecnológica supera a capacidade da maioria dos
          profissionais de acompanhar. No campo da IA aplicada a negócios, o que
          era impossível ontem é commodity hoje. E a distância entre quem entende
          as implicações e quem apenas acompanha manchetes se alarga a cada
          semana.
        </p>

        <p>
          Verso existe para ser o filtro. Não mais um agregador &mdash; uma
          curadoria editorial que separa ruído de sinal e traduz dados em
          decisão.
        </p>

        <h2>Como funciona</h2>

        <p>
          Cada publicação segue um processo rigoroso. Pesquisamos fontes
          primárias. Verificamos dados. Cruzamos perspectivas. Quando citamos um
          número, ele tem origem. Quando expressamos uma posição, ela é
          fundamentada.
        </p>

        <p>
          O conteúdo cobre quatro territórios &mdash; IA e estratégia, negócios
          e empreendedorismo, tecnologia e inovação, agronegócio e inovação
          &mdash; sempre pela lente de quem precisa decidir, não apenas
          entender.
        </p>

        <h2>Para quem escrevemos</h2>

        <p>
          Para o executivo que precisa separar oportunidade real de hype
          tecnológico. Para o empreendedor que quer aplicar IA como alavanca
          estratégica, não como decoração. Para o profissional que entende que a
          vantagem não está na ferramenta &mdash; está em como você a direciona.
        </p>

        <p>
          Se você quer o resumo confortável do consenso, há centenas de opções.
          Se quer a perspectiva que muda como você pensa sobre o problema
          &mdash; está no lugar certo.
        </p>

        <h2>Por que Verso</h2>

        <p>
          Em tipografia, <em>verso</em> é a página esquerda de um livro
          &mdash; o lado oposto ao <em>recto</em>, a página que aparece
          primeiro. O verso é o que está por trás. O outro lado. O que a
          maioria não vê porque parou na superfície.
        </p>

        <p>
          Escolhemos esse nome porque é exatamente o que a Verso se propõe a
          ser: <strong>a perspectiva do outro lado</strong>. Num mercado
          saturado de consenso reciclado e manchetes que confundem novidade com
          relevância, a Verso existe para virar a página &mdash; literalmente
          &mdash; e mostrar o que está atrás do óbvio.
        </p>

        <p>
          Enquanto o <em>recto</em> é o que todo mundo lê, o <em>verso</em> é
          onde mora a profundidade. A análise que exige mais do que um scroll.
          A posição que incomoda quem prefere o conforto do consenso. O dado
          que muda como você pensa sobre o problema.
        </p>

        <p>
          A Verso é o outro lado da história. O lado que importa.
        </p>
      </div>

      <div className="mt-12 rounded-lg border border-border/50 bg-surface/50 p-6">
        <div className="flex items-center gap-2 mb-3">
          <EximiaLogo size={18} className="text-accent" />
          <span className="font-display text-sm font-semibold">Verso</span>
          <span className="text-[10px] font-mono uppercase tracking-[0.2em] text-muted">
            by exímIA
          </span>
        </div>
        <p className="text-sm text-muted mb-4">
          <T k="about.cta" />
        </p>
        <div className="flex gap-3">
          <Link
            href="https://www.linkedin.com/company/exim-ia/"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1.5 rounded-md border border-border/50 px-3 py-1.5 text-xs text-muted transition-colors hover:border-accent/30 hover:text-accent"
          >
            LinkedIn <ArrowRight size={11} />
          </Link>
          <Link
            href="https://x.com/hugo_capitelli"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1.5 rounded-md border border-border/50 px-3 py-1.5 text-xs text-muted transition-colors hover:border-accent/30 hover:text-accent"
          >
            X / Twitter <ArrowRight size={11} />
          </Link>
          <Link
            href="https://www.instagram.com/eximia.ia"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1.5 rounded-md border border-border/50 px-3 py-1.5 text-xs text-muted transition-colors hover:border-accent/30 hover:text-accent"
          >
            Instagram <ArrowRight size={11} />
          </Link>
        </div>
      </div>
    </div>
  );
}
