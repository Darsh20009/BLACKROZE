import { useEffect, useRef, useState, useCallback } from "react";

type WSClientType = "kitchen" | "display" | "order-tracking" | "pos" | "customer-display" | "pos-display";

interface WSMessage {
  type: string;
  order?: any;
  payload?: any;
  timestamp?: number;
  [key: string]: any;
}

interface UseOrderWebSocketOptions {
  clientType: WSClientType | "customer";
  orderId?: string;
  branchId?: string;
  customerId?: string;
  onNewOrder?: (order: any) => void;
  onOrderUpdated?: (order: any) => void;
  onOrderReady?: (order: any) => void;
  onPointsVerificationCode?: (data: any) => void;
  onCustomerDisplayState?: (payload: any) => void;
  onPosCartUpdate?: (data: any) => void;
  enabled?: boolean;
}

export function useOrderWebSocket({
  clientType,
  orderId,
  branchId,
  customerId,
  onNewOrder,
  onOrderUpdated,
  onOrderReady,
  onPointsVerificationCode,
  onCustomerDisplayState,
  onPosCartUpdate,
  enabled = true,
}: UseOrderWebSocketOptions) {
  const wsRef = useRef<WebSocket | null>(null);
  const reconnectTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const pingIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const isConnectingRef = useRef(false);
  const isMountedRef = useRef(true);
  const [isConnected, setIsConnected] = useState(false);
  const [lastMessage, setLastMessage] = useState<WSMessage | null>(null);
  const [error, setError] = useState<string | null>(null);

  const callbacksRef = useRef({
    onNewOrder,
    onOrderUpdated,
    onOrderReady,
    onPointsVerificationCode,
    onCustomerDisplayState,
    onPosCartUpdate,
  });

  useEffect(() => {
    callbacksRef.current = {
      onNewOrder,
      onOrderUpdated,
      onOrderReady,
      onPointsVerificationCode,
      onCustomerDisplayState,
      onPosCartUpdate,
    };
  });

  const configRef = useRef({ clientType, orderId, branchId, customerId });
  useEffect(() => {
    configRef.current = { clientType, orderId, branchId, customerId };
  });

  const clearTimers = useCallback(() => {
    if (pingIntervalRef.current) {
      clearInterval(pingIntervalRef.current);
      pingIntervalRef.current = null;
    }
    if (reconnectTimeoutRef.current) {
      clearTimeout(reconnectTimeoutRef.current);
      reconnectTimeoutRef.current = null;
    }
  }, []);

  const sendSubscribeRef = useRef<(ws: WebSocket) => void>(() => {});
  sendSubscribeRef.current = (ws: WebSocket) => {
    if (ws.readyState === WebSocket.OPEN) {
      ws.send(
        JSON.stringify({
          type: "subscribe",
          clientType: configRef.current.clientType,
          orderId: configRef.current.orderId,
          branchId: configRef.current.branchId,
          customerId: configRef.current.customerId,
        })
      );
    }
  };

  const connect = useCallback(() => {
    if (!isMountedRef.current) return;
    if (isConnectingRef.current) return;
    if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) return;

    clearTimers();
    isConnectingRef.current = true;

    if (wsRef.current) {
      try {
        if (wsRef.current.readyState !== WebSocket.CLOSED &&
            wsRef.current.readyState !== WebSocket.CLOSING) {
          wsRef.current.close(1000, "Reconnecting");
        }
      } catch (e) {
      }
      wsRef.current = null;
    }

    const protocol = window.location.protocol === "https:" ? "wss:" : "ws:";
    const host = window.location.host;
    const wsUrl = `${protocol}//${host}/ws/orders`;

    try {
      const ws = new WebSocket(wsUrl);
      wsRef.current = ws;

      ws.onopen = () => {
        if (!isMountedRef.current) {
          ws.close();
          return;
        }
        isConnectingRef.current = false;
        setIsConnected(true);

        sendSubscribeRef.current(ws);

        pingIntervalRef.current = setInterval(() => {
          if (ws.readyState === WebSocket.OPEN) {
            ws.send(JSON.stringify({ type: "ping" }));
          } else {
            clearTimers();
          }
        }, 30000);
      };

      ws.onmessage = (event) => {
        if (!isMountedRef.current) return;
        try {
          const message: WSMessage = JSON.parse(event.data);
          setLastMessage(message);

          const cb = callbacksRef.current;
          switch (message.type) {
            case "new_order":
              cb.onNewOrder?.(message.order);
              if (Notification.permission === 'granted' && window.location.pathname !== '/employee/orders') {
                const n = new Notification(message.title || 'طلب جديد', {
                  body: message.body || `طلب جديد بقيمة ${message.order?.totalAmount} ر.س`,
                  icon: '/logo.png',
                  tag: 'new-order',
                  requireInteraction: true,
                  data: {
                    isOnlineOrder: message.order?.orderType === 'delivery' || message.order?.orderType === 'takeaway' || !message.order?.employeeId
                  }
                });
                n.onclick = () => {
                  window.focus();
                  window.location.href = '/employee/orders';
                };
              }
              break;
            case "push_alert":
              if (Notification.permission === 'granted') {
                const n = new Notification(message.title, {
                  body: message.body,
                  icon: '/logo.png',
                  tag: 'remote-alert',
                  requireInteraction: true
                });
                n.onclick = () => {
                  window.focus();
                  window.location.href = message.url || '/employee/orders';
                };
              }
              break;
            case "order_updated":
              cb.onOrderUpdated?.(message.order);
              break;
            case "order_ready":
              cb.onOrderReady?.(message.order);
              break;
            case "points_verification_code":
              cb.onPointsVerificationCode?.(message);
              break;
            case "customer_display_state":
              cb.onCustomerDisplayState?.(message.payload);
              break;
            case "pos_cart_update":
              cb.onPosCartUpdate?.(message.payload);
              break;
            case "welcome":
              sendSubscribeRef.current(ws);
              break;
          }
        } catch (error) {
          console.error("[WS] Error parsing message:", error);
        }
      };

      ws.onclose = (event) => {
        isConnectingRef.current = false;
        setIsConnected(false);
        clearTimers();

        if (isMountedRef.current) {
          reconnectTimeoutRef.current = setTimeout(() => {
            connect();
          }, 3000);
        }
      };

      ws.onerror = () => {
        setError("خطأ في الاتصال - جاري إعادة المحاولة");
        setIsConnected(false);
        isConnectingRef.current = false;
      };
    } catch (error) {
      isConnectingRef.current = false;

      if (isMountedRef.current) {
        reconnectTimeoutRef.current = setTimeout(() => {
          connect();
        }, 5000);
      }
    }
  }, [clearTimers]);

  const sendMessage = useCallback((data: object) => {
    if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify(data));
    }
  }, []);

  const disconnect = useCallback(() => {
    clearTimers();
    isConnectingRef.current = false;
    if (wsRef.current) {
      try {
        if (wsRef.current.readyState !== WebSocket.CLOSED &&
            wsRef.current.readyState !== WebSocket.CLOSING) {
          wsRef.current.close(1000, "Disconnecting");
        }
      } catch (e) {
      }
      wsRef.current = null;
    }
    setIsConnected(false);
  }, [clearTimers]);

  useEffect(() => {
    isMountedRef.current = true;
    if (enabled) {
      connect();
    }

    return () => {
      isMountedRef.current = false;
      disconnect();
    };
  }, [enabled, connect, disconnect]);

  return {
    isConnected,
    lastMessage,
    error,
    reconnect: connect,
    disconnect,
    sendMessage,
  };
}
