// App.tsx
import { useEffect, useState } from "react";
import { supabase } from "./lib/supabase";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Feed from "./pages/Feed";
import User from "./pages/User";
import LandingPage from "./pages/LandingPage";
import AuthForm from "./components/AuthForm";

export default function App() {
  const [session, setSession] = useState<any | null>(null);
  const [authChecked, setAuthChecked] = useState(false); // ←追加

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setAuthChecked(true); // 初期チェック完了
    });

    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
      console.log("onAuthStateChange →", _event, session);
      setSession(session);
      setAuthChecked(true); // 状態が確定したら true
    });

    return () => {
      listener.subscription.unsubscribe();
    };
  }, []);

  if (!authChecked) {
    // セッション状態が確定するまで真っ黒画面
    return <div className="h-screen w-screen bg-black" />;
  }

  return (
    <BrowserRouter>
      <Routes>
        {/* トップページ */}
        <Route
          path="/"
          element={
            session ? <Feed /> : <LandingPage /> // ←ここで切り替える
          }
        />
        <Route path="/me" element={session ? <User /> : <Navigate to="/" />} />
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </BrowserRouter>

  );

}
