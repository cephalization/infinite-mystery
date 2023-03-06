import React from "react";
import { BellIcon } from "~/components/icons/BellIcon";
import { XCircle } from "~/components/icons/XCircle";

export type Notification = {
  id: string | number;
  content: React.ReactNode;
};

export type NotificationsProps = {
  notifications: Notification[];
  onRemove?: (id: string | number) => void;
};

export const Notifications = ({
  notifications = [],
  onRemove,
}: NotificationsProps) => {
  const renderedNotifications = notifications.map((notification) => {
    return (
      <div key={notification.id} className="alert flex-row">
        <div className="flex">{notification.content}</div>
        <div className="flex-none">
          {onRemove && (
            <button
              className="btn btn-ghost"
              type="button"
              onClick={() => onRemove(notification.id)}
            >
              <XCircle />
            </button>
          )}
        </div>
      </div>
    );
  });

  return (
    <>
      <div className="fixed right-16 z-50">
        <div className="indicator lg:hidden">
          {notifications.length > 0 && (
            <span className="indicator-item indicator-middle badge badge-secondary animate-pulse"></span>
          )}
          <label htmlFor="notifications-modal" className="btn btn-ghost px-3">
            <BellIcon />
          </label>
          <input
            type="checkbox"
            id="notifications-modal"
            className="modal-toggle"
          />
          <div className="modal modal-bottom sm:modal-middle">
            <div className="modal-box">
              <h3 className="font-bold text-lg">Notifications</h3>
              <div className="flex flex-col gap-4 pb-2 pt-8">
                {renderedNotifications.length > 0 ? (
                  renderedNotifications
                ) : (
                  <p className="opacity-40 font-bold">All caught up!</p>
                )}
              </div>
              <div className="modal-action">
                <label htmlFor="notifications-modal" className="btn">
                  Close
                </label>
              </div>
            </div>
          </div>
        </div>
      </div>
      <div className="toast hidden lg:flex z-[1000]">
        {renderedNotifications}
      </div>
    </>
  );
};
