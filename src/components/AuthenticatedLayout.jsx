import { Outlet } from 'react-router-dom';

const AuthenticatedLayout = () => {
  return (
    <div style={{ position: 'relative', minHeight: '100vh', background: '#f5f5f5' }}>
      <main>
        <Outlet />
      </main>
    </div>
  );
};

export default AuthenticatedLayout;