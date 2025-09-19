// src/pages/LandingPage.tsx
import Header from "../components/Header";
import AuthForm from "../components/AuthForm";
import { Link } from "react-router-dom";

export default function LandingPage() {
    const now = new Date(); // Header用

    return (
        <div className="min-h-screen bg-neutral-950 text-neutral-100 flex flex-col items-center justify-center">
            <Header />
            <div className="mt-16 text-center">
                <div className="mt-8 flex gap-4 justify-center">
                    <AuthForm />
                </div>
            </div>
        </div>
    );
}
