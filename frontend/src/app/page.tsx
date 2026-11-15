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
          Bem-vindo ao <span style={{ color: '#adb5bd' }}>EGAM Workflow</span>
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
        <button
          onClick={() => router.push('/login')}
          style={{
            flex: 1,
            minWidth: '280px',
            padding: '40px 24px',
            backgroundColor: '#212529',
            border: '1px solid #343a40',
            borderRadius: '16px',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: '16px',
            cursor: 'pointer',
            transition: 'transform 0.2s, border-color 0.2s',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.transform = 'translateY(-4px)';
            e.currentTarget.style.borderColor = '#6c757d';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.transform = 'translateY(0)';
            e.currentTarget.style.borderColor = '#343a40';
          }}
        >
          <div style={{ 
            width: '64px', 
            height: '64px', 
            borderRadius: '16px', 
            backgroundColor: 'rgba(255, 255, 255, 0.05)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#adb5bd'
          }}>
            <Building2 size={32} />
          </div>
          <div style={{ textAlign: 'center' }}>
            <h2 style={{ fontSize: '20px', fontWeight: 600, color: '#e6edf3', marginBottom: '4px' }}>Equipe IGAM</h2>
            <p style={{ fontSize: '13px', color: '#adb5bd' }}>Acesso administrativo<br/>Gestão de projetos e usuários</p>
          </div>
        </button>

        <button
          onClick={() => router.push('/ong/entrar')}
          style={{
            flex: 1,
            minWidth: '280px',
            padding: '40px 24px',
            backgroundColor: '#212529',
            border: '1px solid #343a40',
            borderRadius: '16px',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: '16px',
            cursor: 'pointer',
            transition: 'transform 0.2s, border-color 0.2s',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.transform = 'translateY(-4px)';
            e.currentTarget.style.borderColor = '#6c757d';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.transform = 'translateY(0)';
            e.currentTarget.style.borderColor = '#343a40';
          }}
        >
          <div style={{ 
            width: '64px', 
            height: '64px', 
            borderRadius: '16px', 
            backgroundColor: 'rgba(255, 255, 255, 0.05)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#adb5bd'
          }}>
            <Shield size={32} />
          </div>
          <div style={{ textAlign: 'center' }}>
            <h2 style={{ fontSize: '20px', fontWeight: 600, color: '#e6edf3', marginBottom: '4px' }}>Sou ONG</h2>
            <p style={{ fontSize: '13px', color: '#adb5bd' }}>Acesso para organizações<br/>Envio e acompanhamento de projetos</p>
          </div>
        </button>
      </div>
    </div>
  );
}