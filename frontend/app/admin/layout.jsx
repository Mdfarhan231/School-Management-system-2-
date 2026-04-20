// frontend/app/admin/layout.jsx
import Sidebar from '../../components/Sidebar'; // Update this path to wherever your Sidebar component is

export default function AdminLayout({ children }) {
  return (
    <div className="flex h-screen bg-gray-100">
      {/* This is your Side Navbar. It will stay fixed on the screen. */}
      <Sidebar />

      {/* This is the main content area that changes based on the tab you click */}
      <main className="flex-1 overflow-y-auto p-8">
        {children}
      </main>
    </div>
  );
}