// src/pages/User.tsx
import Layout from "../components/Layout";
import { useEffect, useState } from "react";
import { supabase } from "../lib/supabase";
import { useNavigate } from "react-router-dom";

export default function UserPage() {
    const [username, setUsername] = useState("");
    const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState<string | null>(null);
    const [originalUsername, setOriginalUsername] = useState("");
    const navigate = useNavigate();

    useEffect(() => {
        const fetchProfile = async () => {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) return;

            const { data, error } = await supabase
                .from("profiles")
                .select("username, updated_at")
                .eq("id", user.id)
                .single();

            if (!error && data) {
                setUsername(data.username || "");
                setOriginalUsername(data.username || ""); // ←ここで初期値を保存！
                setLastUpdated(data.updated_at ? new Date(data.updated_at) : null);
            }
            setLoading(false);
        };

        fetchProfile();
    }, []);


    const validateUsername = (value: string) => {
        const regex = /^[0-9a-zA-Z_.]*$/;
        if (!regex.test(value)) {
            return "Usernameは0-9, a-z, A-Z, _, . のみ使用できます。";
        }
        return null;
    };

    const handleSave = async () => {
        setError(null);

        if (!username.trim()) {
            setError("Usernameを入力してください。");
            return;
        }

        // バリデーション
        const validationError = validateUsername(username);
        if (validationError) {
            setError(validationError);
            return;
        }

        // 1日1回制限
        if (lastUpdated) {
            const diff = (Date.now() - lastUpdated.getTime()) / (1000 * 60 * 60 * 24);
            if (diff < 1) {
                setError("Usernameは1日に1回しか変更できません。");
                return;
            }
        }

        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return;

        const { error } = await supabase
            .from("profiles")
            .update({ username })
            .eq("id", user.id);

        if (error) {
            console.error(error);
            setError("更新に失敗しました。");
            return;
        }

        // handleSave の成功時
        setLastUpdated(new Date());
        setSuccess("Usernameを更新しました🎉");
        setError(null);
    };

    const isChanged = username.trim() !== originalUsername.trim();

    const handleLogout = async () => {
        await supabase.auth.signOut();
        navigate("/");
    };

    if (loading) {
        return (
            <Layout>
                <p className="text-neutral-400">Loading...</p>
            </Layout>
        );
    }

    return (
        <Layout>
            <h1 className="text-3xl font-bold mb-6">User Settings</h1>

            <div className="rounded-2xl border border-white/10 bg-white/5 p-4 space-y-2 backdrop-blur">
                <label className="block text-sm text-neutral-400">Username</label>

                <div className="flex items-center rounded-lg bg-neutral-900 focus-within:ring-2 focus-within:ring-indigo-500">
                    <span className="px-3 text-neutral-400">@</span>
                    <input
                        type="text"
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                        placeholder="yourname"
                        className="flex-1 rounded-lg bg-neutral-800 px-2 py-2 text-neutral-100 focus:outline-none"
                    />
                    <button
                        onClick={handleSave}
                        disabled={!isChanged}
                        className={`ml-2 rounded-lg px-4 py-2 text-sm font-semibold transition-colors ${isChanged
                            ? "bg-indigo-500 hover:bg-indigo-600 text-white"
                            : "bg-neutral-700 text-neutral-400 cursor-not-allowed"
                            }`}
                    >
                        Save
                    </button>
                </div>

                {error && (
                    <p className="text-sm text-red-500 mt-1">{error}</p>
                )}
                {success && (
                    <p className="text-sm text-green-500 mt-1">{success}</p>
                )}
            </div>

            <button
                onClick={handleLogout}
                className="mt-6 rounded-lg bg-red-500 px-4 py-2 text-sm font-semibold hover:bg-red-600"
            >
                Log Out
            </button>
        </Layout>
    );
}
