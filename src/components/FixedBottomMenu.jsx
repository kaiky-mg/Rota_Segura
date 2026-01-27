import { Home, AlertTriangle, User } from 'react-feather';

const FixedBottomMenu = ({ onProfileClick }) => {
  return (
    <div style={{
      position: 'fixed',
      bottom: 0,
      left: 0,
      right: 0,
      display: 'flex',
      justifyContent: 'space-around',
      background: 'white',
      boxShadow: '0 -2px 10px rgba(0, 0, 0, 0.1)',
      zIndex: 1000,
      padding: '8px 0'
    }}>
      <button style={buttonStyle}>
        <Home />
        <span style={labelStyle}>Rota</span>
      </button>
      <button style={buttonStyle}>
        <AlertTriangle />
        <span style={labelStyle}>Alertas</span>
      </button>
      <button onClick={onProfileClick} style={buttonStyle}>
        <User />
        <span style={labelStyle}>Perfil</span>
      </button>
    </div>
  );
};

const buttonStyle = {
  background: 'none',
  border: 'none',
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  color: '#555',
  cursor: 'pointer',
  fontSize: '12px'
};

const labelStyle = {
  marginTop: '4px'
};

export default FixedBottomMenu;