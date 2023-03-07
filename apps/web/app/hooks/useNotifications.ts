import { useCallback, useState } from "react";
import type { Notification } from "~/components/molecules/Notifications";

export const useNotifications = (initialNotifications: Notification[]) => {
  const [notifications, setNotifications] = useState(initialNotifications);

  const addNotification = useCallback((notification: Notification) => {
    setNotifications((notifications) => [...notifications, notification]);
  }, []);

  const removeNotification = useCallback((id: Notification["id"]) => {
    setNotifications((notifications) =>
      notifications.filter((notification) => notification.id !== id)
    );
  }, []);

  return {
    notifications,
    addNotification,
    removeNotification,
  };
};
