import { useNotificationStore } from "../../store/notificationStore";
export function NotificationCenter() {
  const { items, markAllRead, markRead } = useNotificationStore();
  return (
    <section className="card notifications">
      <div className="card-head">
        <div>
          <p className="eyebrow">NOTIFICATION CENTER</p>
          <h2>Project signals</h2>
        </div>
        <button className="link" onClick={markAllRead}>
          MARK ALL READ
        </button>
      </div>
      {items.map((item) => (
        <button
          className={`notification-row ${item.read ? "" : "unread"}`}
          onClick={() => markRead(item.id)}
          key={item.id}
        >
          <i className={item.severity} />
          <span>
            <b>{item.title}</b>
            <small>
              {item.message} · {item.time}
            </small>
          </span>
        </button>
      ))}
    </section>
  );
}
