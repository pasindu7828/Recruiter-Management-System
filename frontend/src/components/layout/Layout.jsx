import Header from "./Header.jsx";
import Footer from "./Footer.jsx";

export default function Layout({ children, role, active = "Dashboard" }) {
  return (
    <div className="flex min-h-screen flex-col bg-white">
      <Header active={active} role={role} />
      <div className="flex-1 pt-[72px]">{children}</div>
      <Footer />
    </div>
  );
}
