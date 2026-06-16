"use client";

import { useEffect, useRef } from "react";
import { Client } from "@stomp/stompjs";

// Connect directly to the backend (bypasses Next.js proxy — WebSocket upgrades
// can't go through the HTTP rewrite proxy).
const WS_URL =
  (process.env.NEXT_PUBLIC_API_BASE_URL ||
    "https://med-delivery-system-be-production.up.railway.app") + "/ws";

type WsMessage = Record<string, unknown>;

/**
 * Subscribes to order-status, substitution, and insurance topics for a patient.
 * Reconnects automatically every 5 s if the connection drops.
 */
export function useOrderWebSocket(
  userId: number | null | undefined,
  onMessage: (payload: WsMessage) => void
) {
  const onMessageRef = useRef(onMessage);
  onMessageRef.current = onMessage;

  useEffect(() => {
    if (!userId) return;

    const client = new Client({
      webSocketFactory: () => {
        // eslint-disable-next-line @typescript-eslint/no-require-imports
        const SockJS = require("sockjs-client");
        return new SockJS(WS_URL);
      },
      reconnectDelay: 5000,
      onConnect: () => {
        client.subscribe(`/topic/orders/${userId}`, (msg) =>
          onMessageRef.current(JSON.parse(msg.body))
        );
        client.subscribe(`/topic/substitutions/${userId}`, (msg) =>
          onMessageRef.current(JSON.parse(msg.body))
        );
        client.subscribe(`/topic/insurance/${userId}`, (msg) =>
          onMessageRef.current(JSON.parse(msg.body))
        );
      },
      onStompError: (frame) => {
        console.warn("STOMP error", frame.headers["message"]);
      },
    });

    client.activate();
    return () => { client.deactivate(); };
  }, [userId]);
}

/**
 * Subscribes to new-order alerts for a pharmacy (used by pharmacists /
 * branch managers).
 */
export function usePharmacyWebSocket(
  pharmacyId: number | null | undefined,
  onMessage: (payload: WsMessage) => void
) {
  const onMessageRef = useRef(onMessage);
  onMessageRef.current = onMessage;

  useEffect(() => {
    if (!pharmacyId) return;

    const client = new Client({
      webSocketFactory: () => {
        // eslint-disable-next-line @typescript-eslint/no-require-imports
        const SockJS = require("sockjs-client");
        return new SockJS(WS_URL);
      },
      reconnectDelay: 5000,
      onConnect: () => {
        client.subscribe(`/topic/pharmacy/${pharmacyId}/orders`, (msg) =>
          onMessageRef.current(JSON.parse(msg.body))
        );
      },
      onStompError: (frame) => {
        console.warn("STOMP error", frame.headers["message"]);
      },
    });

    client.activate();
    return () => { client.deactivate(); };
  }, [pharmacyId]);
}
