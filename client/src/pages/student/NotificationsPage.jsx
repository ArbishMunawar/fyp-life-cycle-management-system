import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  AlertCircle,
  BadgeCheck,
  Bell,
  Calendar,
  CheckCircle2,
  ChevronDown,
  Clock,
  Clock5,
  MessageCircle,
  Settings,
  User,
} from "lucide-react";
import {
  deleteNotification,
  getNotifications,
  markAllAsRead,
  markAsRead,
} from "../../store/slices/notificationSlice";

const NotificationsPage = () => {
  const dispatch = useDispatch();
  const notifications = useSelector((state) => state.notification.list);
  const unreadCount = useSelector((state) => state.notification.unreadCount);

  useEffect(() => {
    dispatch(getNotifications());
  }, [dispatch]);

  const markAsReadHandler = (id) => dispatch(markAsRead(id));
  const markAllAsReadHandler = () => dispatch(markAllAsRead());
  const deleteNotificationHandler = (id) => dispatch(deleteNotification(id));

  const getNotificationIcon = (type) => {
    switch (type) {
      case "feedback":
        return <MessageCircle className="w-6 h-6 text-blue-500" />;

      case "deadline":
        return <Clock5 className="w-6 h-6 text-red-500" />;

      case "approval":
        return <BadgeCheck className="w-6 h-6 text-green-500" />;

      case "meeting":
        return <Calendar className="w-6 h-6 text-purple-500" />;

      case "system":
        return <Settings className="w-6 h-6 text-gray-500" />;

      default:
        // Custom combined icon (User + Down Arrow)
        return (
          <div className="relative w-6 h-6 text-slate-500 flex items-center justify-center">
            <User className="w-5 h-5 absolute" />
            <ChevronDown className="w-4 h-4 absolute top-4" />
          </div>
        );
    }
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case "high":
        return "border-l-red-500";
        break;
      case "medium":
        return "border-l-yellow-500";
        break;
      case "low":
        return "border-l-green-500";
        break;

      default:
        return "border-l-slate-300";
        break;
    }
  };

  const formatDate = (dateStr) => {
    const date = new Date(dateStr);
    const now = new Date();
    const diffTime = Math.abs(now - date);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays === 1) {
      return "yesterday";
    } else if (diffDays <= 7) {
      return `${diffDays} days ago`;
    } else {
      return date.toLocaleDateString();
    }
  };
  const stats = [
    {
      title: "Total",
      value: notifications.length,
      bg: "bg-blue-50",
      iconBg: "bg-blue-100",
      textColor: "text-blue-600",
      titleColor: "text-blue-800",
      valueColor: "text-blue-900",
      Icon: User,
    },
    {
      title: "Unread",
      value: unreadCount,
      bg: "bg-red-50",
      iconBg: "bg-red-100",
      textColor: "text-red-600",
      titleColor: "text-red-800",
      valueColor: "text-red-900",
      Icon: AlertCircle,
    },
    {
      title: "High Priority",
      value: notifications.filter((n) => n.priority === "high").length,
      bg: "bg-yellow-50",
      iconBg: "bg-yellow-100",
      textColor: "text-yellow-600",
      titleColor: "text-yellow-800",
      valueColor: "text-yellow-900",
      Icon: Clock,
    },
    {
      title: "This Week",
      value: notifications.filter((n) => {
        const notifDate = new Date(n.date);
        const weekAgo = new Date();
        weekAgo.setDate(weekAgo.getDate() - 7);
        return notifDate >= weekAgo;
      }).length,
      bg: "bg-green-50",
      iconBg: "bg-green-100",
      textColor: "text-green-600",
      titleColor: "text-green-800",
      valueColor: "text-green-900",
      Icon: CheckCircle2,
    },
  ];

  return (
    <>
      <div className="space-y-6">
        <div className="card">
          <div className="card-header">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="card-title">Notifications</h1>
                <p className="card-subtitle">
                  Stay updated with your project progress and deadlines
                </p>
              </div>
              {unreadCount > 0 && (
                <button
                  className="btn-outline btn-small "
                  onClick={markAllAsReadHandler}
                >
                  Mark all as read ({unreadCount})
                </button>
              )}
            </div>
          </div>

          {/* NOTIFICATIONS STATS */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            {stats.map((item, i) => {
              return (
                <div key={i} className={`${item.bg} rounded-lg p-4`}>
                  <div className="flex items-center">
                    {/* Icon Container */}
                    <div className={`p-2 ${item.iconBg} rounded-lg`}>
                      <item.Icon className={`w-5 h-5 ${item.textColor}`} />
                    </div>

                    {/* Text Content */}
                    <div className="ml-3">
                      <p className={`text-sm font-medium ${item.titleColor}`}>
                        {item.title}
                      </p>
                      <p className={`text-sm font-medium ${item.valueColor}`}>
                        {item.value}
                      </p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* NOTIFICATIONS LIST */}
          <div className="space-y-3">
            {notifications.map((notification) => {
              return (
                <div
                  key={notification._id}
                  className={`border border-slate-200 rounded-lg p-4 transition-all duration-200 border-l-4 ${getPriorityColor(
                    notification.priority,
                  )} ${
                    !notification.isRead
                      ? "bg-blue-50"
                      : "bg-white hover:bg-slate-50"
                  }`}
                >
                  <div className="flex items-center space-x-4">
                    {/* Icon Section */}
                    <div className="flex-shrink-0 mt-1">
                      {getNotificationIcon(notification.type)}
                    </div>

                    {/* Content Section */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-2">
                        <h3
                          className={`font-medium ${
                            !notification.isRead
                              ? "text-slate-900"
                              : "text-slate-700"
                          }`}
                        >
                          {notification.title}{" "}
                          {!notification.isRead && (
                            <span className="ml-2 w-2 h-2 bg-blue-500 rounded-full inline-block" />
                          )}
                        </h3>

                        <div className="flex items-center space-x-2">
                          {/* Notification Date */}
                          <span className="text-sm text-slate-500">
                            {formatDate(notification.createdAt)}
                          </span>

                          {/* Priority Badge */}
                          <span
                            className={`badge capitalize ${
                              notification.priority === "high"
                                ? "badge-rejected"
                                : notification.priority === "medium"
                                  ? "badge-pending"
                                  : "badge-approved"
                            }`}
                          >
                            {notification.priority}
                          </span>
                        </div>
                      </div>

                      <p className="text-slate-600 text-sm leading-relaxed mb-3">
                        {notification.message}
                      </p>

                      <div className="flex items-center justify-between">
                        <span
                          className={`badge capitalize ${
                            notification.type === "feedback"
                              ? "bg-blue-100 text-blue-800"
                              : notification.type === "deadline"
                                ? "bg-red-100 text-red-800"
                                : notification.type === "approval"
                                  ? "bg-green-100 text-green-800"
                                  : notification.type === "meeting"
                                    ? "bg-purple-100 text-purple-800"
                                    : "bg-gray-100 text-gray-800"
                          }`}
                        >
                          {notification.type}
                        </span>

                        <div className="flex items-center space-x-2">
                          {/* Mark as Read Button */}
                          {!notification.isRead && (
                            <button
                              className="text-sm text-blue-600 hover:text-blue-500"
                              onClick={() =>
                                markAsReadHandler(notification._id)
                              }
                            >
                              Mark as read
                            </button>
                          )}

                          {/* Delete Button */}
                          <button
                            className="text-sm text-red-600 hover:text-red-500"
                            onClick={() =>
                              deleteNotificationHandler(notification._id)
                            }
                          >
                            Delete
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {notifications.length === 0 && (
            <div className="text-center py-8">
              <div className="flex items-center justify-center mb-3 text-slate-600">
                <Bell className="w-12 h-12" />
              </div>
              <p className="text-slate-500">No Notifications yet</p>
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default NotificationsPage;
