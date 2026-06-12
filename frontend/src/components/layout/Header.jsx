import { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import logoPng from "../../assets/logo.png";
import API from "../../api/api";

const ROLE_LINKS = {
  admin: [
    "Dashboard",
    "Users",
    // "System Settings",
    "Reports",
  ],
  recruiter: [
    "Dashboard",
    "Job Openings",
    "Recruitment Analytics",
    "Resume Screening",
    "Interviews",
    // "Offers",
  ],
  manager: [
    "Dashboard",
    "Job Requests",
    "Open Positions",
    "Candidates",
    "Interviews",
    "Reports",
  ],
  candidate: [
    "Dashboard",
    "Browse Jobs",
    "My Applications",
    "Interview Schedule",
  ],
};

// Maps each tab label to a route path, keyed by role
const ROLE_ROUTES = {
  admin: {
    Dashboard: "/admin/dashboard",
    Users: "/users",
    "Recruitment Analytics": "/admin/dashboard",
    "System Settings": "/admin/dashboard",
    Reports: "/admin/dashboard",
  },
  recruiter: {
    Dashboard: "/recruiter/dashboard",
    "Job Openings": "/jobs",
    "Recruitment Analytics": "/cv-scoring",
    // "Resume Screening": "",
    Interviews: "/interviews",
    // Offers: "",
  },
  manager: {
    Dashboard: "/manager/dashboard",
    "Job Requests": "/jobs",
    "Open Positions": "/jobs",
    Candidates: "/manager/dashboard",
    Interviews: "/interviews",
    Reports: "/manager/dashboard",
  },
  candidate: {
    Dashboard: "/candidate/dashboard",
    "Browse Jobs": "/browse-jobs",
    "My Applications": "/my-applications",
    "Interview Schedule": "/interviews",
  },
};

const NavLink = ({ active, children, onClick }) => {
  return (
    <button
      type="button"
      onClick={onClick}
      className={[
        "relative py-2 text-sm font-medium transition-colors",
        active
          ? "text-[#411B94] after:absolute after:inset-x-0 after:-bottom-0.5 after:h-0.5 after:rounded-full after:bg-[#411B94]"
          : "text-slate-500 hover:text-slate-700",
      ].join(" ")}
    >
      {children}
    </button>
  );
};

const Icon = ({ children, label, onClick }) => (
  <button
    type="button"
    aria-label={label}
    onClick={onClick}
    className="relative flex h-9 w-9 items-center justify-center rounded-full text-slate-500 hover:bg-slate-100 hover:text-slate-700 focus:outline-none focus:ring-2 focus:ring-[#411B94]/30"
  >
    {children}
  </button>
);

export default function Header({ active = "", role = "recruiter" }) {
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [currentActive, setCurrentActive] = useState(active);
  const [notifOpen, setNotifOpen] = useState(false);
  const notifRef = useRef(null);
  const profileRef = useRef(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const mobileMenuRef = useRef(null);
  const normalizedRole = String(role).toLowerCase();

  const links = useMemo(
    () => ROLE_LINKS[normalizedRole] ?? ROLE_LINKS.recruiter,
    [normalizedRole],
  );

  const routeMap = ROLE_ROUTES[normalizedRole] ?? ROLE_ROUTES.recruiter;

  const handleNavClick = (label) => {
    setCurrentActive(label);
    const path = routeMap[label];
    if (path) navigate(path);
  };

  // Real notifications state
  const [notifications, setNotifications] = useState([]);
  const [notifLoading, setNotifLoading] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    setCurrentActive(active);
  }, [active]);

  useEffect(() => {
    if (active !== "" && !links.includes(active)) {
      setCurrentActive("");
    }
  }, [links, active]);

  // Fetch unread count on mount and when notifications change
  useEffect(() => {
    const fetchUnreadCount = () => {
      API.get("/notifications/unread-count")
        .then((res) => {
          if (res.data && typeof res.data.unreadCount === "number") {
            setUnreadCount(res.data.unreadCount);
          }
        })
        .catch(() => setUnreadCount(0));
    };
    fetchUnreadCount();
  }, []);

  useEffect(() => {
    if (!notifOpen) return;

    // Fetch latest 4 notifications when dropdown opens
    setNotifLoading(true);
    API.get("/notifications/my?limit=4")
      .then((res) => {
        if (res.data && res.data.notifications) {
          setNotifications(res.data.notifications);
        }
      })
      .catch(() => setNotifications([]))
      .finally(() => setNotifLoading(false));

    // Also update unread count
    API.get("/notifications/unread-count")
      .then((res) => {
        if (res.data && typeof res.data.unreadCount === "number") {
          setUnreadCount(res.data.unreadCount);
        }
      })
      .catch(() => setUnreadCount(0));

    const onKeyDown = (e) => {
      if (e.key === "Escape") setNotifOpen(false);
    };
    const onMouseDown = (e) => {
      if (!notifRef.current) return;
      if (notifRef.current.contains(e.target)) return;
      setNotifOpen(false);
    };

    window.addEventListener("keydown", onKeyDown);
    window.addEventListener("mousedown", onMouseDown);
    return () => {
      window.removeEventListener("keydown", onKeyDown);
      window.removeEventListener("mousedown", onMouseDown);
    };
  }, [notifOpen]);

  useEffect(() => {
    if (!open) return;

    const onKeyDown = (e) => {
      if (e.key === "Escape") setOpen(false);
    };
    const onMouseDown = (e) => {
      if (!profileRef.current) return;
      if (profileRef.current.contains(e.target)) return;
      setOpen(false);
    };

    window.addEventListener("keydown", onKeyDown);
    window.addEventListener("mousedown", onMouseDown);
    return () => {
      window.removeEventListener("keydown", onKeyDown);
      window.removeEventListener("mousedown", onMouseDown);
    };
  }, [open]);

  useEffect(() => {
    if (!mobileMenuOpen) return;

    const onKeyDown = (e) => {
      if (e.key === "Escape") setMobileMenuOpen(false);
    };
    const onMouseDown = (e) => {
      if (!mobileMenuRef.current) return;
      if (mobileMenuRef.current.contains(e.target)) return;
      setMobileMenuOpen(false);
    };

    window.addEventListener("keydown", onKeyDown);
    window.addEventListener("mousedown", onMouseDown);
    return () => {
      window.removeEventListener("keydown", onKeyDown);
      window.removeEventListener("mousedown", onMouseDown);
    };
  }, [mobileMenuOpen]);

  return (
    <header className="fixed inset-x-0 top-0 z-50 w-full bg-white shadow-[0_4px_18px_rgba(65,27,148,0.12)]">
      <div className="w-full px-4 sm:px-16">
        <div className="flex items-center justify-between gap-4 py-3">
          {/* Left: Logo */}
          <div className="flex flex-shrink-0 items-center gap-2">
            <img
              src={logoPng}
              alt="HireHub logo"
              className="h-9 w-9 rounded-lg object-contain"
              width={36}
              height={36}
            />
            <div className="max-w-[120px] truncate text-base font-extrabold tracking-wide sm:max-w-none sm:text-lg">
              <span className="font-extrabold text-slate-900">HIRE</span>
              <span className="font-extrabold text-[#411B94]">HUB</span>
            </div>
          </div>

          {/* Center: Navigation */}
          <nav className="hidden flex-1 items-center justify-center gap-8 md:flex">
            {links.map((l) => (
              <NavLink
                key={l}
                active={l === currentActive}
                onClick={() => handleNavClick(l)}
              >
                {l}
              </NavLink>
            ))}
          </nav>

          {/* Right: Icons + avatar */}
          <div className="flex items-center gap-1 sm:gap-2">
            <div className="hidden md:flex">
              <div className="flex h-9 items-center rounded-full border border-slate-200 bg-white px-3 shadow-sm">
                <input
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Search…"
                  className="w-64 bg-transparent text-sm text-slate-700 placeholder:text-slate-400 focus:outline-none"
                  aria-label="Search"
                />
              </div>
            </div>

            <div className="relative" ref={notifRef}>
              <Icon
                label="Notifications"
                onClick={() => {
                  setOpen(false);
                  setMobileMenuOpen(false);
                  setNotifOpen((v) => !v);
                }}
              >
                {unreadCount > 0 && (
                  <span className="absolute -top-1 -right-1 min-w-[18px] h-5 px-1 flex items-center justify-center rounded-full bg-[#411B94] text-white text-xs font-bold border-2 border-white z-10">
                    {unreadCount > 99 ? "99+" : unreadCount}
                  </span>
                )}
                <svg
                  width="18"
                  height="18"
                  viewBox="0 0 24 24"
                  fill="none"
                  aria-hidden="true"
                >
                  <path
                    d="M12 22a2.2 2.2 0 0 0 2.1-1.6H9.9A2.2 2.2 0 0 0 12 22Z"
                    fill="currentColor"
                    opacity="0.9"
                  />
                  <path
                    d="M18 16H6c1.1-1.2 1.8-2.8 1.8-4.6V9.6A4.2 4.2 0 0 1 12 5.4a4.2 4.2 0 0 1 4.2 4.2v1.8c0 1.8.7 3.4 1.8 4.6Z"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinejoin="round"
                  />
                </svg>
              </Icon>

              {notifOpen ? (
                <div
                  className={[
                    "z-50 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-xl",
                    // Mobile: keep dropdown within viewport
                    "fixed left-3 right-3 top-16 mt-0 w-auto",
                    // Desktop: anchor to bell button
                    "sm:absolute sm:left-auto sm:right-0 sm:top-auto sm:mt-2 sm:w-96",
                  ].join(" ")}
                  role="dialog"
                  aria-label="Notifications"
                >
                  <div className="flex items-center justify-between border-b border-slate-200 px-4 py-3">
                    <div className="text-sm font-semibold text-slate-900">
                      Notifications
                    </div>
                    <a
                      href="/notifications"
                      className="text-sm font-semibold text-[#411B94] hover:underline"
                    >
                      View all
                    </a>
                  </div>

                  <div className="max-h-80 overflow-auto">
                    {notifLoading ? (
                      <div className="px-4 py-6 text-center text-gray-400 text-sm">
                        Loading...
                      </div>
                    ) : notifications.length === 0 ? (
                      <div className="px-4 py-6 text-center text-gray-400 text-sm">
                        No notifications
                      </div>
                    ) : (
                      notifications.map((n) => (
                        <button
                          key={n._id}
                          className={[
                            "w-full text-left flex gap-3 border-b border-slate-100 px-4 py-3 last:border-b-0 hover:bg-slate-50 transition",
                            n.status === "unread"
                              ? "bg-[#f5f3ff] border-l-4 border-[#411B94]"
                              : "bg-white",
                          ].join(" ")}
                          onClick={async () => {
                            setNotifOpen(false);
                            // Mark as read if unread
                            if (n.status === "unread") {
                              try {
                                await API.patch(`/notifications`);
                                setUnreadCount((prev) =>
                                  prev > 0 ? prev - 1 : 0,
                                );
                              } catch { }
                            }
                            // Always navigate to notification page
                            navigate(`/notifications`);
                          }}
                        >
                          <div
                            className={[
                              "mt-1 h-2.5 w-2.5 flex-none rounded-full",
                              n.status === "unread"
                                ? "bg-[#411B94]"
                                : "bg-gray-300",
                            ].join(" ")}
                          />
                          <div className="min-w-0 flex-1">
                            <div className="flex items-center justify-between gap-3">
                              <div
                                className={[
                                  "truncate text-sm font-semibold",
                                  n.status === "unread"
                                    ? "text-[#411B94]"
                                    : "text-slate-900",
                                ].join(" ")}
                              >
                                {n.title}
                              </div>
                              <div className="flex-none text-xs text-slate-400">
                                {n.timeAgo || n.createdAt}
                              </div>
                            </div>
                            <div className="mt-0.5 line-clamp-2 text-sm text-slate-600">
                              {n.body}
                            </div>
                          </div>
                        </button>
                      ))
                    )}
                  </div>
                </div>
              ) : null}
            </div>

            <div className="relative" ref={profileRef}>
              <button
                type="button"
                onClick={() => {
                  setNotifOpen(false);
                  setMobileMenuOpen(false);
                  setOpen((v) => !v);
                }}
                className="flex items-center gap-2 rounded-full pl-1 pr-2 py-1 hover:bg-slate-100 focus:outline-none focus:ring-2 focus:ring-[#411B94]/30"
                aria-haspopup="menu"
                aria-expanded={open}
              >
                <span className="flex h-9 w-9 items-center justify-center overflow-hidden rounded-full border border-slate-200 bg-slate-100">
                  <svg
                    width="40"
                    height="40"
                    viewBox="0 0 40 40"
                    aria-hidden="true"
                  >
                    <rect width="40" height="40" fill="#F3F4F6" />
                    <circle cx="20" cy="16" r="7" fill="#D1D5DB" />
                    <path d="M8 36c2.6-7.1 21.4-7.1 24 0" fill="#D1D5DB" />
                    <path
                      d="M28 15.5c0-6-6.2-10-12.3-7.8 4.8.4 7.8 4.4 7.8 8.5 0 2.8-1.4 5.2-3.6 6.7 4.8-.7 8.1-3.6 8.1-7.4Z"
                      fill="#C4B5FD"
                      opacity="0.8"
                    />
                  </svg>
                </span>
                <svg
                  width="14"
                  height="14"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                  aria-hidden="true"
                  className="text-slate-600"
                >
                  <path d="M5.3 7.7a1 1 0 0 1 1.4 0L10 11l3.3-3.3a1 1 0 1 1 1.4 1.4l-4 4a1 1 0 0 1-1.4 0l-4-4a1 1 0 0 1 0-1.4Z" />
                </svg>
              </button>

              {open ? (
                <div
                  role="menu"
                  className="absolute right-0 mt-2 w-44 overflow-hidden rounded-xl border border-slate-200 bg-white shadow-lg"
                >
                  <button
                    type="button"
                    role="menuitem"
                    onClick={() => {
                      setOpen(false);
                      navigate("/profile");
                    }}
                    className="block w-full px-4 py-2 text-left text-sm text-slate-700 hover:bg-slate-50"
                  >
                    Profile
                  </button>
                  {/* <button
                    type="button"
                    role="menuitem"
                    className="block w-full px-4 py-2 text-left text-sm text-slate-700 hover:bg-slate-50"
                  >
                    Settings
                  </button> */}
                  <button
                    type="button"
                    role="menuitem"
                    onClick={() => {
                      setOpen(false);
                      navigate("/");
                    }}
                    className="block w-full px-4 py-2 text-left text-sm text-red-600 hover:bg-red-50"
                  >
                    Sign out
                  </button>
                </div>
              ) : null}
            </div>

            {/* Mobile nav toggle */}
            <button
              type="button"
              className="ml-1 inline-flex h-9 w-9 items-center justify-center rounded-full text-slate-600 hover:bg-slate-100 focus:outline-none focus:ring-2 focus:ring-[#411B94]/30 md:hidden"
              onClick={() => {
                setOpen(false);
                setNotifOpen(false);
                setMobileMenuOpen((v) => !v);
              }}
              aria-label="Menu"
              aria-expanded={mobileMenuOpen}
            >
              <svg
                width="18"
                height="18"
                viewBox="0 0 24 24"
                fill="none"
                aria-hidden="true"
              >
                <path
                  d="M4 7h16"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                />
                <path
                  d="M4 12h16"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                />
                <path
                  d="M4 17h16"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                />
              </svg>
            </button>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      {mobileMenuOpen ? (
        <div
          ref={mobileMenuRef}
          className="border-t border-slate-200 md:hidden"
        >
          <div className="px-6 py-4">
            <div className="flex items-center rounded-xl border border-slate-200 bg-white px-3 py-2 shadow-sm">
              <input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search…"
                className="w-full bg-transparent text-sm text-slate-700 placeholder:text-slate-400 focus:outline-none"
                aria-label="Search"
              />
            </div>

            <nav className="mt-4 flex flex-col gap-1">
              {links.map((l) => (
                <button
                  type="button"
                  key={l}
                  onClick={() => {
                    handleNavClick(l);
                    setMobileMenuOpen(false);
                  }}
                  className={[
                    "text-left",
                    "rounded-xl px-3 py-2 text-sm font-medium",
                    l === currentActive
                      ? "bg-[#411B94]/10 text-[#411B94]"
                      : "text-slate-700 hover:bg-slate-50",
                  ].join(" ")}
                >
                  {l}
                </button>
              ))}
            </nav>
          </div>
        </div>
      ) : null}
    </header>
  );
}
