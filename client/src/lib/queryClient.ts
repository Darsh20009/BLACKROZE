import { QueryClient, QueryFunction } from "@tanstack/react-query";

async function tryRestoreSession(): Promise<boolean> {
  const stored = localStorage.getItem("currentEmployee");
  const restoreKey = localStorage.getItem("blackrose-restore-key");
  if (!stored || !restoreKey) return false;
  
  try {
    const employee = JSON.parse(stored);
    const res = await fetch("/api/employees/restore-session", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify({ employeeId: employee.id, restoreKey }),
    });
    
    if (res.ok) {
      const data = await res.json();
      localStorage.setItem("currentEmployee", JSON.stringify(data.employee));
      if (data.restoreKey) {
        localStorage.setItem("blackrose-restore-key", data.restoreKey);
      }
      return true;
    }
  } catch (e) {}
  
  localStorage.removeItem("currentEmployee");
  localStorage.removeItem("blackrose-restore-key");
  return false;
}

let isRestoringSession = false;
let restorePromise: Promise<boolean> | null = null;

async function throwIfResNotOk(res: Response) {
 if (!res.ok) {
 const text = (await res.text()) || res.statusText;
 let errorMessage = text;
 try {
 const json = JSON.parse(text);
 errorMessage = json.error || json.message || text;
 } catch {
 }
 throw new Error(errorMessage);
 }
}

export async function apiRequest(
 method: string,
 url: string,
 data?: unknown | undefined,
 isRetry: boolean = false,
): Promise<Response> {
 const res = await fetch(url, {
 method,
 headers: data ? { "Content-Type": "application/json" } : {},
 body: data ? JSON.stringify(data) : undefined,
 credentials: "include",
 });

 if (res.status === 401 && !isRetry) {
   if (!isRestoringSession) {
     isRestoringSession = true;
     restorePromise = tryRestoreSession().finally(() => {
       isRestoringSession = false;
       restorePromise = null;
     });
   }
   
   const restored = await (restorePromise || tryRestoreSession());
   if (restored) {
     return apiRequest(method, url, data, true);
   }
 }

 await throwIfResNotOk(res);
 return res;
}

type UnauthorizedBehavior = "returnNull" | "throw";
export const getQueryFn: <T>(options: {
 on401: UnauthorizedBehavior;
}) => QueryFunction<T> =
 ({ on401: unauthorizedBehavior }) =>
 async ({ queryKey }) => {
 const url = queryKey.join("/") as string;
 let res = await fetch(url, {
 credentials: "include",
 });

 if (res.status === 401 && unauthorizedBehavior !== "returnNull") {
   if (!isRestoringSession) {
     isRestoringSession = true;
     restorePromise = tryRestoreSession().finally(() => {
       isRestoringSession = false;
       restorePromise = null;
     });
   }
   const restored = await (restorePromise || tryRestoreSession());
   if (restored) {
     res = await fetch(url, { credentials: "include" });
   }
 }

 if (unauthorizedBehavior === "returnNull" && res.status === 401) {
 return null;
 }

 await throwIfResNotOk(res);
 return await res.json();
 };

export const queryClient = new QueryClient({
 defaultOptions: {
 queries: {
 queryFn: getQueryFn({ on401: "throw" }),
 refetchInterval: false,
 refetchOnWindowFocus: false,
 staleTime: 5 * 60 * 1000, // 5 minutes instead of Infinity for better performance
 gcTime: 10 * 60 * 1000, // 10 minutes garbage collection time (was cacheTime in v4)
 retry: 1,
 },
 mutations: {
 retry: false,
 },
 },
});
