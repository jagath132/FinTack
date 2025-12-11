import { useState } from "react";
import { Bell, X, Check, CheckCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
  DropdownMenuItem,
  DropdownMenuLabel,
} from "@/components/ui/dropdown-menu";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useNotifications } from "@/lib/notifications";

export default function NotificationDropdown() {
  const {
    notifications,
    unreadCount,
    markAsRead,
    markAllAsRead,
    clearNotification,
  } = useNotifications();
  const [open, setOpen] = useState(false);

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case "error":
        return "text-red-600 dark:text-red-400";
      case "warning":
        return "text-yellow-600 dark:text-yellow-400";
      default:
        return "text-blue-600 dark:text-blue-400";
    }
  };

  const getSeverityBg = (severity: string) => {
    switch (severity) {
      case "error":
        return "bg-red-50 dark:bg-red-900/20";
      case "warning":
        return "bg-yellow-50 dark:bg-yellow-900/20";
      default:
        return "bg-blue-50 dark:bg-blue-900/20";
    }
  };

  return (
    <DropdownMenu open={open} onOpenChange={setOpen}>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="sm" className="relative">
          <Bell className="w-5 h-5" />
          {unreadCount > 0 && (
            <Badge
              variant="destructive"
              className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 text-xs"
            >
              {unreadCount > 9 ? "9+" : unreadCount}
            </Badge>
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-80">
        <div className="flex items-center justify-between p-4">
          <DropdownMenuLabel className="font-semibold text-slate-900 dark:text-white p-0">
            Notifications
          </DropdownMenuLabel>
          {notifications.length > 0 && (
            <Button
              variant="ghost"
              size="sm"
              onClick={markAllAsRead}
              className="text-xs"
            >
              <CheckCheck className="w-3 h-3 mr-1" />
              Mark all read
            </Button>
          )}
        </div>

        <DropdownMenuSeparator />

        <ScrollArea className="max-h-96">
          {notifications.length === 0 ? (
            <div className="p-8 text-center text-slate-500 dark:text-slate-400">
              <Bell className="w-8 h-8 mx-auto mb-2 opacity-50" />
              <p className="text-sm">No notifications yet</p>
            </div>
          ) : (
            <div className="divide-y divide-slate-200 dark:divide-slate-700">
              {notifications.map((notification) => (
                <div
                  key={notification.id}
                  className={`p-4 ${!notification.read ? getSeverityBg(notification.severity) : ""}`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <h4
                          className={`font-medium text-sm ${!notification.read ? getSeverityColor(notification.severity) : "text-slate-900 dark:text-white"}`}
                        >
                          {notification.title}
                        </h4>
                        {!notification.read && (
                          <div className="w-2 h-2 bg-blue-500 rounded-full flex-shrink-0" />
                        )}
                      </div>
                      <p className="text-xs text-slate-600 dark:text-slate-400 line-clamp-2">
                        {notification.message}
                      </p>
                      <p className="text-xs text-slate-500 dark:text-slate-500 mt-1">
                        {notification.timestamp.toLocaleDateString()} at{" "}
                        {notification.timestamp.toLocaleTimeString([], {
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </p>
                    </div>
                    <div className="flex gap-1">
                      {!notification.read && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => markAsRead(notification.id)}
                          className="h-6 w-6 p-0"
                        >
                          <Check className="w-3 h-3" />
                        </Button>
                      )}
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => clearNotification(notification.id)}
                        className="h-6 w-6 p-0 text-red-600 dark:text-red-400"
                      >
                        <X className="w-3 h-3" />
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </ScrollArea>

        {notifications.length > 0 && (
          <>
            <DropdownMenuSeparator />
            <div className="p-2">
              <DropdownMenuItem asChild>
                <Button
                  variant="ghost"
                  size="sm"
                  className="w-full justify-center text-xs"
                  onClick={() => setOpen(false)}
                >
                  View All
                </Button>
              </DropdownMenuItem>
            </div>
          </>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
