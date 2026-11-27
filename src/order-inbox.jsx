import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { createRoot } from "react-dom/client";

const customers = {
  4180: { name: "Brian K.", initials: "BK", tone: "sand" },
  4181: { name: "Grace N.", initials: "GN", tone: "rose" },
  4182: { name: "Kamau M.", initials: "KM", tone: "blue" },
  4183: { name: "Wanjiku K.", initials: "WK", tone: "violet" },
  4184: { name: "Amina O.", initials: "AO", tone: "mint" },
  4185: { name: "Mercy A.", initials: "MA", tone: "sand" },
  4186: { name: "Otieno L.", initials: "OL", tone: "blue" },
  4187: { name: "Njeri W.", initials: "NW", tone: "rose" },
  4188: { name: "Abdi H.", initials: "AH", tone: "mint" },
  4189: { name: "Achieng P.", initials: "AP", tone: "violet" },
  4190: { name: "Kevin S.", initials: "KS", tone: "blue" },
  4191: { name: "Zainab M.", initials: "ZM", tone: "sand" },
  4192: { name: "James N.", initials: "JN", tone: "mint" },
  4193: { name: "Esther G.", initials: "EG", tone: "rose" },
  4194: { name: "Faith W.", initials: "FW", tone: "violet" },
};

const initialChats = [
  { order: 4184, time: "09:40", message: "Do you deliver to Kilimani?" },
  { order: 4183, time: "09:37", message: "Thanks, I’ll collect tomorrow." },
  { order: 4182, time: "09:33", message: "Can I pay via M-Pesa?" },
  { order: 4181, time: "09:28", message: "Please send the receipt." },
  { order: 4180, time: "09:24", message: "Got it, thanks!" },
];

const arrivals = [
  { delay: 1450, order: 4185, message: "I’ll take the 3 kW inverter.", banner: true },
  { delay: 1700, order: 4186, message: "I’ve paid for the panels." },
  { delay: 1100, order: 4187, message: "Two solar kits to Ruaka." },
  { delay: 1250, order: 4184, message: "Great, please send one." },
  { delay: 2200, order: 4188, message: "Can I collect in Westlands?", banner: true },
  { delay: 1550, order: 4189, message: "One 100 Ah battery, please." },
  { delay: 1100, order: 4190, message: "Payment sent via M-Pesa." },
  { delay: 1150, order: 4187, message: "Please add two mounts." },
  { delay: 1500, order: 4191, message: "Can you send it to Karen?" },
  { delay: 2100, order: 4192, message: "Please confirm my order.", banner: true },
  { delay: 1600, order: 4193, message: "I’ve ordered four panels." },
  { delay: 1250, order: 4185, message: "M-Pesa payment sent." },
  { delay: 1500, order: 4194, message: "I’ll pick up the battery." },
];

const mount = document.getElementById("order-inbox");
const controls = document.getElementById("order-demo-controls");
const motionPreference = window.matchMedia("(prefers-reduced-motion: reduce)");

function receiveMessage({ chats, nextArrival, banner }) {
  const arrival = arrivals[nextArrival];
  const { order, message } = arrival;
  const previous = chats.find((chat) => chat.order === order);
  const unread = Math.min((previous?.unread ?? 0) + 1, 100);

  return {
    chats: [{ order, message, time: "09:41", unread }, ...chats.filter((chat) => chat.order !== order)],
    nextArrival: (nextArrival + 1) % arrivals.length,
    banner: arrival.banner ? arrival : banner,
  };
}

function useStageVisibility() {
  const [inView, setInView] = useState(!("IntersectionObserver" in window));
  const [tabVisible, setTabVisible] = useState(!document.hidden);

  useEffect(() => {
    const onVisibility = () => setTabVisible(!document.hidden);
    document.addEventListener("visibilitychange", onVisibility);

    let observer;
    if ("IntersectionObserver" in window) {
      const visibleFraction = 0.45;
      observer = new IntersectionObserver(([entry]) => {
        setInView(entry.intersectionRatio >= visibleFraction);
      }, { threshold: visibleFraction });
      observer.observe(mount);
    }

    return () => {
      document.removeEventListener("visibilitychange", onVisibility);
      observer?.disconnect();
    };
  }, []);

  return inView && tabVisible;
}

function ChatList({ chats, newest, reducedMotion }) {
  const list = useRef(null);
  const previousPositions = useRef(new Map());

  useLayoutEffect(() => {
    const positions = new Map();
    for (const row of list.current.children) {
      const order = row.dataset.order;
      const top = row.offsetTop;
      const previousTop = previousPositions.current.get(order);
      positions.set(order, top);

      if (newest && !reducedMotion && row.animate && previousTop !== undefined && previousTop !== top) {
        row.animate([
          { transform: `translateY(${previousTop - top}px)` },
          { transform: "translateY(0)" },
        ], { duration: 620, easing: "cubic-bezier(.2, .75, .3, 1)" });
      }
    }
    previousPositions.current = positions;
  }, [chats, newest, reducedMotion]);

  return (
    <ul className="order-inbox-rows" aria-label="Sample order conversations" ref={list}>
      {chats.slice(0, 5).map(({ order, message, time, unread }) => {
        const { name, initials, tone } = customers[order];
        return (
          <li className="order-inbox-row" data-order={order} data-tone={tone} data-newest={order === newest} key={order}>
            <span className="order-inbox-avatar" aria-hidden="true">{initials}</span>
            <div className="order-inbox-message"><strong>{name}</strong><span title={message}>{message}</span></div>
            <div className="order-inbox-meta">
              <time dateTime={time}>{time.slice(1)}</time>
              {unread > 0 && <span className="order-inbox-unread" key={unread}>{unread > 99 ? "99+" : unread}<span className="order-inbox-sr"> unread {unread === 1 ? "message" : "messages"}</span></span>}
            </div>
          </li>
        );
      })}
    </ul>
  );
}

function OrderInbox() {
  const [reducedMotion, setReducedMotion] = useState(motionPreference.matches);
  const [playing, setPlaying] = useState(!motionPreference.matches);
  const [{ chats, nextArrival, banner }, setFeed] = useState(() => ({
    chats: initialChats.map((chat) => ({ ...chat, unread: 0 })),
    nextArrival: 0,
    banner: null,
  }));
  const remainingDelay = useRef(null);
  const visible = useStageVisibility();
  const running = playing && visible;
  const unreadChats = chats.filter((chat) => chat.unread > 0).length;
  const newest = unreadChats ? chats[0].order : undefined;
  const progress = unreadChats && nextArrival === 0 ? 1 : nextArrival / arrivals.length;

  useEffect(() => {
    const onMotionChange = ({ matches }) => {
      setReducedMotion(matches);
      if (matches) setPlaying(false);
    };
    motionPreference.addEventListener("change", onMotionChange);
    return () => motionPreference.removeEventListener("change", onMotionChange);
  }, []);

  useEffect(() => {
    if (!running) return;

    const delay = remainingDelay.current ?? arrivals[nextArrival].delay;
    const startedAt = performance.now();
    let received = false;
    const timer = window.setTimeout(() => {
      received = true;
      remainingDelay.current = null;
      setFeed(receiveMessage);
    }, delay);

    return () => {
      window.clearTimeout(timer);
      if (!received) remainingDelay.current = Math.max(0, delay - (performance.now() - startedAt));
    };
  }, [running, nextArrival]);

  const playbackLabel = playing ? "Pause demo" : unreadChats ? "Resume demo" : "Play demo";

  return (
    <>
      <div className="order-inbox-summary">
        <span>All orders</span>
        {unreadChats > 0 && <strong key={unreadChats}>{unreadChats} unread</strong>}
      </div>
      <ChatList chats={chats} newest={newest} reducedMotion={reducedMotion} />
      {banner && !reducedMotion && (
        <div className="order-inbox-banner" aria-hidden="true" key={banner.order}>
          <span className="order-phone-avatar"><i></i></span>
          <div><strong>Order #{banner.order}</strong><span>{banner.message}</span></div>
          <span>now</span>
        </div>
      )}
      {createPortal(
        <>
          <button className="order-demo-playback" type="button" onClick={() => setPlaying((value) => !value)} aria-controls="order-inbox">
            <span className="order-demo-playback-icon" data-symbol={playing ? "pause" : "play"} aria-hidden="true" />
            {playbackLabel}
          </button>
          <span className="order-demo-progress" aria-hidden="true"><span style={{ transform: `scaleX(${progress})` }} /></span>
        </>,
        controls,
      )}
    </>
  );
}

createRoot(mount).render(<OrderInbox />);
