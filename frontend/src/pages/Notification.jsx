import React, { useEffect, useState } from "react";
import { Bell, User, Briefcase, FileText, XCircle, CheckCircle, Trash2, CalendarClock} from "lucide-react";
import axios from "axios";
import toast from "react-hot-toast";
import Layout from "../components/layout/Layout";
import { getCurrentUserRole } from "../services/roleService";


const ICONS = {
  user: {
    el: <User className="text-[#401A94]" />,
    bg: "bg-indigo-100",
  },
  interview: {
    el: <CalendarClock className="text-blue-500" />,
    bg: "bg-blue-100",
  },
  job: {
    el: <Briefcase className="text-orange-500" />,
    bg: "bg-orange-100",
  },
  application: {
    el: <FileText className="text-gray-500" />,
    bg: "bg-gray-100",
  },
  rejected: {
    el: <XCircle className="text-red-500" />,
    bg: "",
  },
  success: {
    el: <CheckCircle className="text-green-500" />,
    bg: "",
  },
};

const Notification = () => {

    const [activeTab, setActiveTab] = useState("all");
    const [showModal, setShowModal] = useState(false);
    const [selectedId, setSelectedId] = useState(null);
    const [data, setData] = useState([]);
    const [loading, setLoading] = useState(false);
    const [visibleCount, setVisibleCount] = useState(6);
    const [interviewDataType, setInterviewDataType] = useState([]);
    const [summary, setSummary] = useState(null);
    const [deleting, setDeleting] = useState(false);
    const [role, setRole] = useState(getCurrentUserRole);
    

    const unreadCount = React.useMemo(
      () => data.filter((n) => n.status === "unread").length,
      [data]
    );

    const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;
    const API_VERSION = import.meta.env.VITE_API_VERSION;
    const NAV_BASE_URL = "http://localhost:5173"

    

    const token = localStorage.getItem("token");
    // console.log(token);

    const fetchNotifications = async () => {
      try {
        setLoading(true);

        const res = await axios.get(`${API_BASE_URL}${API_VERSION}/notifications/my`,
        {
          headers:{
          Authorization: `Bearer ${token}`,
          }
        }
      );

        console.log("Response:",res.data.notifications);

        setData(res.data.notifications); // adjust if needed
      } catch (error) {
        console.error("Error fetching notifications:", error);
      } finally {
        setLoading(false);
      }
    };

    const fetchInterviewNotifications = async (type) => {
      try {
        setLoading(true);

        const res = await axios.get(`${API_BASE_URL}${API_VERSION}/notifications/interviews`,
        {
          headers:{
          Authorization: `Bearer ${token}`,
          },
        }
      );

        console.log("Interview Types:",res.data);

        setInterviewDataType(res.data.notifications); // adjust if needed
      } catch (error) {
        console.error("Error fetching interview type notifications:", error);
      } finally {
        setLoading(false);
      }
    };

    const fetchSummary = async () => {
      try {
        setLoading(true);

        const res = await axios.get(`${API_BASE_URL}${API_VERSION}/notifications/summary`,
        {
          headers:{
          Authorization: `Bearer ${token}`,
          }
        }
      );

        console.log("Summary:",res.data.summary);

        setSummary(res.data.summary); // adjust if needed
      } catch (error) {
        console.error("Error fetching summary:", error);
      } finally {
        setLoading(false);
      }
    };

    useEffect(()=>{
      fetchNotifications();
      fetchInterviewNotifications();
      fetchSummary();
    },[]);

    const mapType = (type) => {
      switch (type) {
        case "application_status_change":
          return "application";

        case "interview_scheduled":
        case "interview_updated":
        case "interview_cancelled":
          return "interview";

        case "job_application":
        case "job_posted":
          return "job";

        default:
          return "application";
      }
    };

    const filteredNotifications = data.filter((item) => {
        if (activeTab === "all") return true;
        if (activeTab === "unread") return item.status === "unread";
        if (activeTab === "interview")  return mapType(item.type) === "interview";
        if (activeTab === "application") {
          const type = mapType(item.type);
          return type === "application" || type === "job";
        }
        return true;
    });

    const handleDelete = async () => {
      const loadingToast = toast.loading("Deleting...");
      try {
        setDeleting(true);

        const id = selectedId;

        // find the item before deleting (important)
        const deletedItem = data.find((item) => item._id === id);

        // Optimistic UI update
        setData((prev) => prev.filter((item) => item._id !== id));

        // Update summary correctly
        setSummary((prev) => {
          if (!prev) return prev;

          const isUnread = deletedItem?.status === "unread";
          const type = mapType(deletedItem?.type);

          return {
            ...prev,
            total: {
              ...prev.total,
              all: prev.total.all - 1,
              unread: isUnread
                ? Math.max(prev.total.unread - 1, 0)
                : prev.total.unread,
            },
            interviews:
              type === "interview" && isUnread
                ? {
                    ...prev.interviews,
                    unread: Math.max(prev.interviews.unread - 1, 0),
                  }
                : prev.interviews,
            applications:
              (type === "application" || type === "job") && isUnread
                ? {
                    ...prev.applications,
                    unread: Math.max(prev.applications.unread - 1, 0),
                  }
                : prev.applications,
          };
        });

        // Close modal
        setShowModal(false);
        setSelectedId(null);

        // API call
        await axios.delete(
          `${API_BASE_URL}${API_VERSION}/notifications/${id}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        //  Refresh UI with latest data
          // await fetchNotifications();
          // await fetchSummary();
          setDeleting(false);

          toast.success("Deleted successfully", { id: loadingToast });

      } catch (error) {
        console.error("Error deleting notification:", error);
        toast.error("Delete failed", { id: loadingToast });


        // rollback if something fails
        fetchNotifications();
        fetchSummary();
      }
    };

      const handleMarkAsRead = async (id) => {
        try {

          //  Optimistic UI update (instant feedback)
          setData((prev) =>
            prev.map((item) =>
              item._id === id ? { ...item, status: "read" } : item
            )
          );

          //  Update summary instantly
          setSummary((prev) => {
            if (!prev) return prev;

            const item = data.find((n) => n._id === id);
            const type = mapType(item?.type);

            return{
              ...prev,
              total: {
                ...prev.total,
                unread: Math.max(prev.total.unread - 1, 0),
              },
              interviews:
                type === "interview"
                  ? {
                      ...prev.interviews,
                      unread: Math.max(prev.interviews.unread - 1, 0),
                    }
                  : prev.interviews,
              applications:
                type === "application" || type === "job"
                  ? {
                      ...prev.applications,
                      unread: Math.max(prev.applications.unread - 1, 0),
                    }
                  : prev.applications,
            };
          });

          await axios.patch(
            `${API_BASE_URL}${API_VERSION}/notifications/${id}/read`,
            {},
            {
              headers: {
                Authorization: `Bearer ${token}`,
              },
            }
          );

          //  Refresh UI with latest data
          // await fetchNotifications();
          // await fetchSummary();

        } catch (error) {
          console.error("Error marking as read:", error);
          toast.error("Failed to mark as read");

          fetchNotifications();
          fetchSummary();
        }
      };

      const handleMarkAllAsRead = async () => {
        try {
          // optimistic update
          setData((prev) =>
            prev.map((item) => ({ ...item, status: "read" }))
          );

          setSummary((prev) => ({
            ...prev,
            total: {
              ...prev.total,
              unread: 0,
            },
            interviews: {
              ...prev.interviews,
              unread: 0,
            },
            applications: {
              ...prev.applications,
              unread: 0,
            },
          }));

          await axios.patch(
            `${API_BASE_URL}${API_VERSION}/notifications/read-all`,
            {},
            {
              headers: {
                Authorization: `Bearer ${token}`,
              },
            }
          );

          //  Refresh UI with latest data
          // await fetchNotifications();
          // await fetchSummary();

        } catch (error) {
          console.error("Error marking all as read:", error);
          toast.error("Something went wrong");

          fetchNotifications();
          fetchSummary();
        }
      };

      const groupNotificationsByDate = (notifications) => {
        const groups = {
          today: [],
          yesterday: [],
          earlier: [],
        };

        const now = new Date();

        notifications.forEach((item) => {
          const date = new Date(item.createdAt);
          const diffTime = now - date;
          const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));

          if (diffDays === 0) {
            groups.today.push(item);
          } else if (diffDays === 1) {
            groups.yesterday.push(item);
          } else {
            groups.earlier.push(item);
          }
        });

        return groups;
      };

      const paginatedNotifications = filteredNotifications.slice(0, visibleCount);
      const groupedNotifications = groupNotificationsByDate(paginatedNotifications);

  return (
    <Layout active="notifications" role={role}>
    <div className="p-6 max-w-5xl mx-auto">
      
      {/* Header */}
      <div className="flex items-center gap-3 mb-4">
        <Bell size={30} className="text-[#401A94] fill-[#401A94]" />
        <h1 className="text-3xl text-[#401A94] font-semibold">Notifications</h1>
        {summary?.total?.unread > 0 && (
        <span className="bg-[#401A94] text-white text-sm px-2 py-1 rounded-full">
          {summary.total.unread}
        </span>
        )}
      </div>

      <hr className="mb-4" />

      {/* Tabs */}
      <div className="flex justify-between items-center mb-6">
        <div className="flex gap-4">
          <button 
            onClick={()=> setActiveTab("all")}
            className={`px-3 py-1 rounded-md transition-all duration-200 ${activeTab === "all" ? "bg-purple-200 text-[#401A94]" : "text-gray-500 hover:bg-gray-100"}`}>
            All ({summary?.total?.all || 0})
          </button>
          <button 
            onClick={()=> setActiveTab("unread")}
            className={`px-3 py-1 rounded-md transition-all duration-200 ${activeTab === "unread" ? "bg-purple-200 text-[#401A94]" : "text-gray-500 hover:bg-gray-100"}`}>                Unread ({summary?.total?.unread || 0})
            </button>
          <button 
            onClick={()=> setActiveTab("interview")}
            className={`px-3 py-1 rounded-md transition-all duration-200 ${activeTab === "interview" ? "bg-purple-200 text-[#401A94]" : "text-gray-500 hover:bg-gray-100"}`}>
                Interviews ({summary?.interviews?.unread || 0})
            </button>
          <button 
            onClick={()=> setActiveTab("application")}
            className={`px-3 py-1 rounded-md transition-all duration-200 ${activeTab === "application" ? "bg-purple-200 text-[#401A94]" : "text-gray-500 hover:bg-gray-100"}`}>
                Applications ({summary?.applications?.unread || 0})
            </button>
        </div>

        <button 
            onClick={handleMarkAllAsRead}
            disabled={unreadCount === 0}
            className={`border px-4 py-1 rounded-md text-sm transition-all duration-200 ${unreadCount === 0 ? "opacity-50 cursor-not-allowed" : "hover:bg-[#401A94] hover:text-white hover:shadow"}`}>
          Mark All as Read
        </button>
      </div>

      {/* Notification List */}
      <div className="space-y-4">
        {loading ? (
          // Skeleton Loader
          [...Array(5)].map((_, i) => (
            <div
              key={i}
              className="flex justify-between items-center border-2 rounded-xl p-4 animate-pulse ransition-all duration-300"
            >
              <div className="flex items-center gap-4">
                <div className="w-9 h-9 bg-gray-200 rounded-xl" />
                <div className="flex flex-col gap-2">
                  <div className="w-40 h-3 bg-gray-200 rounded" />
                  <div className="w-60 h-3 bg-gray-100 rounded" />
                </div>
              </div>
              <div className="w-16 h-3 bg-gray-200 rounded" />
            </div>
          ))
        ) : filteredNotifications.length === 0 ? (
            <p className="text-center py-10 text-sm text-gray-400">No notifications</p>
        ) : (
          <div className="space-y-6">
            {["today", "yesterday", "earlier"].map((section) => {
              const items = groupedNotifications[section];

              if (!items || items.length === 0) return null;
              
              return (
                <div key={section}>
                  <h2 className="text-sm font-semibold text-gray-500 mb-2 capitalize">
                    {section}
                  </h2>

                  <div className="space-y-4">
                    {items.map((item) => {
                      const ic = ICONS[mapType(item.type)] || ICONS.application;
                      return (
                        <div
                          key={item._id}
                          onClick={() => {
                            if (item.status === "unread") {
                              handleMarkAsRead(item._id);
                            }
                            if (item.actionUrl) {
                              window.location.href = `${NAV_BASE_URL}${item.actionUrl}`;
                            }
                          }}
                          className={`flex justify-between items-center border-2 border-[#401A94] rounded-xl p-4 cursor-pointer transition-all duration-200 ease-in-out hover:shadow-md hover:scale-[1.01]
                            ${item.status === "unread" ? "bg-purple-50 border-[#401A94] font-semibold text-gray-900" : "bg-white font-normal text-gray-700"}`}
                        >
                          <div className="flex items-center gap-4">
                            {/* {getIcon(item.type)} */}
                            <div className={`w-9 h-9 flex items-center justify-center ${ic.bg || ""} rounded-xl`}>
                              {ic.el}
                            </div>
                            <div className="flex flex-col">
                              <div className="flex items-center gap-2">
                                <p className={`${item.status === "unread" ? "font-semibold text-gray-900" :"font-medium text-gray-800"}`}>{item.title}</p>
                                {item.status === "unread" && (
                                  <span className="relative flex h-2 w-2">
                                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#401A94] opacity-75"></span>
                                    <span className="relative inline-flex rounded-full h-2 w-2 bg-[#401A94]"></span>
                                  </span>
                                )}
                              </div>
                              <p className="text-sm text-gray-500">{item.body}</p>
                            </div>
                          </div>

                          <div className="flex items-center gap-4">
                            <span className="text-sm text-gray-400">{item.timeAgo}</span>

                            {/* Mark as Read */}
                            {item.status === "unread" && (
                              <CheckCircle
                                title="Mark as read"
                                className="text-green-500 cursor-pointer transition-transform duration-200 hover:scale-110"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleMarkAsRead(item._id);
                                }}
                              />
                            )}
                            {/* Delete */}
                            <Trash2
                              className="text-red-500 cursor-pointer transition-transform duration-200 hover:scale-110 hover:text-red-600"
                              onClick={(e) => {
                                e.stopPropagation(); // prevents triggering parent click
                                setSelectedId(item._id);
                                setShowModal(true);
                              }}
                            />
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Load More */}
      {visibleCount < filteredNotifications.length && (
        <div className="flex justify-center mt-8">
            <button 
                onClick={() => {
                  setVisibleCount(prev => prev + 5)
                  window.scrollBy({ top: 300, behavior: "smooth" });
                }}
                className="border px-6 py-2 rounded-md hover:bg-[#401A94] hover:text-white">
            Load More
            </button>
        </div>
      )}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center z-50">
            <div className="bg-white p-6 rounded-xl shadow-lg w-80">
            <h2 className="text-lg font-semibold mb-4">
                Delete Notification
            </h2>
            <p className="text-gray-600 mb-6">
                Are you sure you want to delete this notification?
            </p>

            <div className="flex justify-end gap-3">
                <button
                onClick={() => setShowModal(false)}
                className="px-4 py-2 border rounded-md"
                >
                Cancel
                </button>

                <button
                onClick={handleDelete}
                className="px-4 py-2 bg-red-500 text-white rounded-md"
                >
                Delete
                </button>
            </div>
            </div>
        </div>
        )}
    </div>
    </Layout>
  );
};

export default Notification;