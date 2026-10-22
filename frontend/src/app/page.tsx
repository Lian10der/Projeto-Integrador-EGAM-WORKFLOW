import Link from "next/link";

export default function Home() {
  return (
    <main className="landing">
      <h1>IGAM Workflow</h1>
      <p>Centralize e acompanhe as propostas de projetos sociais.</p>
      <Link href="/projetos" className="button button--primary">
        Explorar projetos
      </Link>
    </main>
  );
}