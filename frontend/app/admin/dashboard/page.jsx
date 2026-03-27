"use client";

import Link from "next/link";

export default function AdminDashboardPage() {
  // const handleLogout = () => {
  //   localStorage.removeItem("admin");
  //   window.location.href = "/admin/login";
  // };
  const router = useRouter();
  const [admin, setAdmin] = useState(null);
   useEffect(() => {
    const savedAdmin = localStorage.getItem("admin");

    if (!savedAdmin) {
      router.replace("/admin/login");
      return;
    }

    try {
      setAdmin(JSON.parse(savedAdmin));
    } catch (error) {
      localStorage.removeItem("admin");
      router.replace("/admin/login");
    }
  }, [router]);

  const handleLogout = () => {
    localStorage.removeItem("admin");
    router.replace("/admin/login");
  };
  
  return (
    <main className="flex min-h-screen flex-col bg-[#e5e7eb]">
      {/* Top header */}
      <header className="bg-[#17172f] px-4 py-3 text-white shadow">
        <h1 className="text-[15px] font-medium sm:text-xl">
          School Management System
        </h1>
      </header>

      {/* Top nav */}
      <nav className="border-b border-gray-300 bg-white">
        <div className="flex items-center justify-end gap-6 px-6 py-3 text-[14px] font-semibold text-[#17172f]">
  <Link href="/admin/dashboard" className="hover:text-blue-600">
    🏠 Dashboard
  </Link>

  <Link href="/admin/students" className="hover:text-blue-600">
    🎓 Students
  </Link>

  <Link href="/admin/teachers" className="hover:text-blue-600">
    🧑‍🏫 Teachers
  </Link>

  <Link href="/admin/exam-routines" className="hover:text-blue-600">
    📝 Exam Routine
  </Link>
  <Link href="/admin/mark-approvals" className="hover:text-blue-600">
  ✅ Mark Approvals
</Link>

  <button
    type="button"
    onClick={handleLogout}
    className="hover:text-red-600"
  >
    ↪ Logout
  </button>
</div>
      </nav>

      {/* Body */}
      <section className="flex-1 px-16 py-8">
        <h2 className="text-4xl font-bold text-black">Welcome, admin</h2>
        <p className="mt-6 text-xl text-black">
          Use the menu above to manage students, teachers, and other aspects of the school management system .
        </p>
      </section>

      {/* Footer */}
      <footer className="bg-[#17172f] px-4 py-6 text-center text-xs font-semibold text-white">
        © 2026 Global Knowledge School
      </footer>
    </main>
  );
}