/* ShelfSpring service worker: Web Push only (no offline page cache — stock pages must be live). */
/* global self */

var SW_VERSION = "2026-11-10.1";

/* Only a small device preference is cached; no inventory pages or personal responses are cached. */
function pushIsDisabled() {
  return caches.open("shelfspring-push-preferences")
    .then(function (cache) { return cache.match(new URL("/__pc_push_preference__", self.location.origin).href); })
    .then(function (response) { return response ? response.json() : null; })
    .then(function (choice) { return Boolean(choice && choice.disabled); })
    .catch(function () { return true; });
}

async function discardDisabledPush(sub) {
  await Promise.all([
    sub.unsubscribe(),
    fetch("/api/push/subscribe", { method: "DELETE", headers: { "content-type": "application/json" }, body: JSON.stringify({ endpoint: sub.endpoint }) })
      .then(function (response) { if (!response.ok) throw new Error("Disabled push cleanup failed"); }),
  ]);
}

self.addEventListener("install", function () { self.skipWaiting(); });
self.addEventListener("activate", function (event) { event.waitUntil(self.clients.claim()); });

/* ------------------------------------------------------------------ push → banner */

self.addEventListener("push", function (event) {
  var data = {};
  try {
    data = event.data ? event.data.json() : {};
  } catch {
    data = { title: "ShelfSpring", body: event.data ? event.data.text() : "" };
  }
  var kind = data.kind || "restock";
  var extra = data.data || {};
  var url = data.url || "/account";
  var buyUrl = typeof extra.buyUrl === "string" && /^https:\/\/www\.apple\.com\//.test(extra.buyUrl) ? extra.buyUrl : null;
  var actions = [];
  if (kind === "restock") {
    actions.push({ action: "open", title: "Open store" });
    if (buyUrl) actions.push({ action: "buy", title: "Buy on apple.com" });
  }
  var options = {
    body: data.body || "",
    icon: "/icons/icon-192.png",
    badge: "/icons/badge-96.png",
    tag: data.tag || undefined,
    renotify: Boolean(data.tag),
    timestamp: data.at ? Date.parse(data.at) || Date.now() : Date.now(),
    data: { url: url, buyUrl: buyUrl, kind: kind, v: data.v || 1 },
    vibrate: [120, 60, 120],
    // Stays on screen until dismissed on Android/desktop (ignored on iOS): stock is gone in minutes.
    requireInteraction: kind === "restock",
    actions: actions,
  };
  // Safari revokes the subscription after silent pushes, so a notification is always shown.
  var shown = self.registration.showNotification(data.title || "ShelfSpring", options);
  // Delivery receipt (2026-11-10): tells the server this phone got the push. Never delays or blocks the banner,
  // never retried, and a failure is ignored.
  var receipt = typeof data.r === "string"
    ? fetch("/api/push/receipt", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ r: data.r }), keepalive: true, credentials: "omit" }).catch(function () {})
    : Promise.resolve();
  event.waitUntil(Promise.all([shown, receipt]));
});

/* ------------------------------------------------------------------ tap → the right page */

function sameDocument(clientUrl, targetHref) {
  try {
    var a = new URL(clientUrl);
    var b = new URL(targetHref);
    return a.origin === b.origin && a.pathname === b.pathname && a.search === b.search;
  } catch {
    return false;
  }
}

function openOrFocus(targetHref) {
  return self.clients
    .matchAll({ type: "window", includeUncontrolled: true })
    .then(function (list) {
      // 1. A window already showing the page: just bring it forward.
      for (var i = 0; i < list.length; i++) {
        if (sameDocument(list[i].url, targetHref) && "focus" in list[i]) return list[i].focus();
      }
      // 2. Any window of ours: focus it, then navigate it (or ask the page to, where navigate() is missing).
      for (var j = 0; j < list.length; j++) {
        var c = list[j];
        if (!("focus" in c)) continue;
        if ("navigate" in c) {
          return c.focus().then(function (fc) { return (fc || c).navigate(targetHref); }).then(function (nc) { return nc || c; });
        }
        return c.focus().then(function (fc) {
          (fc || c).postMessage({ type: "navigate", url: targetHref });
          return fc || c;
        });
      }
      // 3. Nothing open (app killed, phone locked): open a new window.
      return self.clients.openWindow(targetHref);
    })
    .catch(function () {
      return self.clients.openWindow(targetHref);
    });
}

self.addEventListener("notificationclick", function (event) {
  event.notification.close();
  var d = event.notification.data || {};
  if (event.action === "buy" && d.buyUrl) {
    event.waitUntil(self.clients.openWindow(d.buyUrl));
    return;
  }
  var target = new URL(d.url || "/account", self.location.origin).href;
  event.waitUntil(openOrFocus(target));
});

/* ------------------------------------------------------------------ rotation → tell the server */

function vapidKey(oldSubscription) {
  var key = oldSubscription && oldSubscription.options && oldSubscription.options.applicationServerKey;
  if (key) return Promise.resolve(key);
  return fetch("/api/push/vapid")
    .then(function (r) { return r.ok ? r.json() : null; })
    .then(function (j) { return j && j.publicKey ? urlBase64ToBytes(j.publicKey) : null; })
    .catch(function () { return null; });
}

function urlBase64ToBytes(s) {
  var padded = (s + "=".repeat((4 - (s.length % 4)) % 4)).replace(/-/g, "+").replace(/_/g, "/");
  var bin = atob(padded);
  var out = new Uint8Array(bin.length);
  for (var i = 0; i < bin.length; i++) out[i] = bin.charCodeAt(i);
  return out;
}

function bytesToUrlBase64(buf) {
  if (!buf) return undefined;
  var u8 = buf instanceof ArrayBuffer ? new Uint8Array(buf) : new Uint8Array(buf.buffer || buf);
  var bin = "";
  for (var i = 0; i < u8.length; i++) bin += String.fromCharCode(u8[i]);
  return btoa(bin).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

async function reportSubscription(sub, oldEndpoint) {
  if (await pushIsDisabled()) { await discardDisabledPush(sub); return; }
  var json = sub.toJSON();
  var key = sub.options && sub.options.applicationServerKey;
  var response;
  try {
    response = await fetch("/api/push/subscribe", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({
        endpoint: json.endpoint,
        keys: json.keys,
        oldEndpoint: oldEndpoint || undefined,
        expirationTime: typeof sub.expirationTime === "number" ? Math.round(sub.expirationTime) : null,
        appServerKey: bytesToUrlBase64(key),
        platform: "unknown",
        standalone: true,
      }),
    });
  } finally {
    // The server may have committed even if its response was lost. A concurrent Turn off wins.
    if (await pushIsDisabled()) await discardDisabledPush(sub);
  }
  return response;
}

/* The push service rotated or expired the subscription. The browser may hand us the replacement
   (newSubscription); otherwise subscribe again with the same key (or the server's current one) and
   report it with the old endpoint, which is how the server knows which row to rewrite. */
self.addEventListener("pushsubscriptionchange", function (event) {
  var old = event.oldSubscription;
  var oldEndpoint = old ? old.endpoint : null;
  event.waitUntil(
    (async function () {
      if (await pushIsDisabled()) {
        if (event.newSubscription) await discardDisabledPush(event.newSubscription);
        return;
      }
      var sub = event.newSubscription;
      if (!sub) {
        var key = await vapidKey(old);
        if (!key || await pushIsDisabled()) return;
        sub = await self.registration.pushManager.subscribe({ userVisibleOnly: true, applicationServerKey: key });
      }
      await reportSubscription(sub, oldEndpoint);
    })()
      .catch(function () { return undefined; }),
  );
});

self.addEventListener("message", function (event) {
  if (event.data && event.data.type === "version" && event.source) event.source.postMessage({ type: "version", version: SW_VERSION });
});
