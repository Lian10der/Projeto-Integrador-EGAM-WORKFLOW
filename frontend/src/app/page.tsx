'use client';

import { useRouter } from 'next/navigation';
import { Building2, Shield } from 'lucide-react';

export default function SelecaoPerfilPage() {
  const router = useRouter();

  return (
    <div style={{ 
      minHeight: '100vh', 
      display: 'flex', 
      flexDirection: 'column', 
      alignItems: 'center', 
      justifyContent: 'center', 
      backgroundColor: '#1a1d21',
      padding: '24px'
    }}>
      <div style={{ textAlign: 'center', marginBottom: '48px' }}>
        <h1 style={{ fontSize: '32px', fontWeight: 700, color: '#e6edf3', marginBottom: '8px' }}>
          Bem-vindo ao <span style={{ color: '#00c4cc' }}>EGAM Workflow</span> {/* <-- Azul claro */}
        </h1>
        <p style={{ fontSize: '16px', color: '#adb5bd' }}>
          Selecione o tipo de acesso para continuar
        </p>
      </div>

      <div style={{ 
        display: 'flex', 
        gap: '24px', 
        flexWrap: 'wrap', 
        justifyContent: 'center',
        width: '100%',
        maxWidth: '800px'
      }}>
        {/* Card IGAM */}
        <button
          onClick={() => router.push('/login')}
          style={{
            flex: 1,
            minWidth: '280px',
            padding: '40px 24px',
            backgroundColor: '#212529',
            border: '1px solid #343a40',
            borderRadius: '6px',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: '16px',
            cursor: 'pointer',
          }}
        >
          <div style={{ 
            width: '64px', 
            height: '64px', 
            borderRadius: '6px',
            backgroundColor: 'rgba(255, 255, 255, 0.05)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#adb5bd'
          }}>
            <Building2 size={32} />
          </div>
          <div style={{ textAlign: 'center' }}>
            <h2 style={{ fontSize: '20px', fontWeight: 600, color: '#00c4cc', marginBottom: '4px' }}>
              Equipe IGAM {/* <-- Azul claro */}
            </h2>
            <p style={{ fontSize: '13px', color: '#adb5bd' }}>
              Acesso administrativo<br/>Gestão de projetos e usuários
            </p>
          </div>
        </button>

        {/* Card ONG */}
        <button
          onClick={() => router.push('/ong/entrar')}
          style={{
            flex: 1,
            minWidth: '280px',
            padding: '40px 24px',
            backgroundColor: '#212529',
            border: '1px solid #343a40',
            borderRadius: '4px',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: '16px',
            cursor: 'pointer',
          }}
        >
          <div style={{ 
            width: '64px', 
            height: '64px', 
            borderRadius: '4px',
            backgroundColor: 'rgba(255, 255, 255, 0.05)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#adb5bd'
          }}>
            <Shield size={32} />
          </div>
          <div style={{ textAlign: 'center' }}>
            <h2 style={{ fontSize: '20px', fontWeight: 600, color: '#00c4cc', marginBottom: '4px' }}>
              Sou ONG {/* <-- Azul claro */}
            </h2>
            <p style={{ fontSize: '13px', color: '#adb5bd' }}>
              Acesso para organizações<br/>Envio e acompanhamento de projetos
            </p>
          </div>
        </button>
      </div>
    </div>
  );
}