import { useState } from "react";
import { useNavigate } from "react-router-dom";

interface RegisterCredentials {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  avatar?: string | null;
}

interface AuthResponse {
  success: boolean;
  message?: string;
  user: {
    id: string;
    email: string;
    first_name: string;
    last_name: string;
    avatar: string | null;
  };
  session: {
    id: string;
    expires_at: number;
  };
}

export default function Register() {
  const navigate = useNavigate();
  const [credentials, setCredentials] = useState<RegisterCredentials>({
    email: "",
    password: "",
    firstName: "",
    lastName: "",
    avatar: null
  });
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    try {
      const response = await fetch("https://group-chat.shashwats018.workers.dev/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify(credentials)
      });

      const data: AuthResponse = await response.json();

      if (!data.success) {
        setError(data.message || "Registration failed");
        return;
      }

      // Store the session and user data
      localStorage.setItem("session", data.session.id);
      localStorage.setItem("userId", data.user.id);
      localStorage.setItem("user", JSON.stringify(data.user));

      // Direct navigation with page reload
      window.location.href = "/channel/0";
    } catch (error) {
      setError("Failed to register");
      console.error("Registration error:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setCredentials(prev => ({
      ...prev,
      [name]: value
    }));
  };

  return (
    <div className="flex min-h-screen items-center justify-center px-4 py-8 sm:px-6 lg:px-8">
      <div className="w-full max-w-md overflow-hidden rounded-3xl border border-neutral-200/80 bg-white/90 p-6 text-neutral-900 shadow-[0_24px_80px_-24px_rgba(15,23,42,0.35)] backdrop-blur sm:p-8 dark:border-neutral-800 dark:bg-neutral-950/85 dark:text-neutral-100">
        <div className="space-y-2">
          <p className="text-center text-xs font-semibold uppercase tracking-[0.24em] text-neutral-500 dark:text-neutral-400">
            Get started
          </p>
          <h2 className="text-center text-3xl font-semibold tracking-tight sm:text-4xl">
            Create your account
          </h2>
          <p className="text-center text-sm text-neutral-600 dark:text-neutral-400">
            Join our chat community
          </p>
        </div>

        <form onSubmit={handleSubmit} className="mt-8 space-y-5">
          <div className="space-y-4">
            <div>
              <label htmlFor="email" className="mb-1.5 block text-sm font-medium text-neutral-700 dark:text-neutral-300">
                Email Address
              </label>
              <input
                id="email"
                name="email"
                type="email"
                value={credentials.email}
                onChange={handleChange}
                required
                className="block w-full rounded-xl border border-neutral-200 bg-neutral-50 px-4 py-3 text-sm text-neutral-900 placeholder:text-neutral-400 outline-none transition focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-500/10 dark:border-neutral-800 dark:bg-neutral-900 dark:text-neutral-100 dark:placeholder:text-neutral-500 dark:focus:border-blue-400 dark:focus:bg-neutral-950 dark:focus:ring-blue-400/10"
                placeholder="Enter your email"
              />
            </div>

            <div>
              <label htmlFor="firstName" className="mb-1.5 block text-sm font-medium text-neutral-700 dark:text-neutral-300">
                First Name
              </label>
              <input
                id="firstName"
                name="firstName"
                type="text"
                value={credentials.firstName}
                onChange={handleChange}
                required
                className="block w-full rounded-xl border border-neutral-200 bg-neutral-50 px-4 py-3 text-sm text-neutral-900 placeholder:text-neutral-400 outline-none transition focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-500/10 dark:border-neutral-800 dark:bg-neutral-900 dark:text-neutral-100 dark:placeholder:text-neutral-500 dark:focus:border-blue-400 dark:focus:bg-neutral-950 dark:focus:ring-blue-400/10"
                placeholder="Enter your first name"
              />
            </div>

            <div>
              <label htmlFor="lastName" className="mb-1.5 block text-sm font-medium text-neutral-700 dark:text-neutral-300">
                Last Name
              </label>
              <input
                id="lastName"
                name="lastName"
                type="text"
                value={credentials.lastName}
                onChange={handleChange}
                required
                className="block w-full rounded-xl border border-neutral-200 bg-neutral-50 px-4 py-3 text-sm text-neutral-900 placeholder:text-neutral-400 outline-none transition focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-500/10 dark:border-neutral-800 dark:bg-neutral-900 dark:text-neutral-100 dark:placeholder:text-neutral-500 dark:focus:border-blue-400 dark:focus:bg-neutral-950 dark:focus:ring-blue-400/10"
                placeholder="Enter your last name"
              />
            </div>

            <div>
              <label htmlFor="password" className="mb-1.5 block text-sm font-medium text-neutral-700 dark:text-neutral-300">
                Password
              </label>
              <input
                id="password"
                name="password"
                type="password"
                value={credentials.password}
                onChange={handleChange}
                required
                className="block w-full rounded-xl border border-neutral-200 bg-neutral-50 px-4 py-3 text-sm text-neutral-900 placeholder:text-neutral-400 outline-none transition focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-500/10 dark:border-neutral-800 dark:bg-neutral-900 dark:text-neutral-100 dark:placeholder:text-neutral-500 dark:focus:border-blue-400 dark:focus:bg-neutral-950 dark:focus:ring-blue-400/10"
                placeholder="Create a password"
              />
            </div>
          </div>

          {error && (
            <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-center text-sm text-red-700 dark:border-red-900/60 dark:bg-red-950/40 dark:text-red-300">
              {error}
            </div>
          )}

          <div>
            <button
              type="submit"
              disabled={isLoading}
              className="group relative flex w-full justify-center rounded-xl bg-neutral-900 px-4 py-3 text-sm font-semibold text-white shadow-lg shadow-neutral-900/15 transition hover:-translate-y-0.5 hover:bg-neutral-800 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-neutral-900 disabled:cursor-not-allowed disabled:opacity-50 dark:bg-neutral-100 dark:text-neutral-900 dark:hover:bg-white dark:focus-visible:outline-neutral-100"
            >
              {isLoading ? "Creating account..." : "Create account"}
            </button>
          </div>
        </form>

        <div className="mt-4 text-center text-sm text-neutral-600 dark:text-neutral-400">
          <p>
            Already have an account?{" "}
            <a
              href="/auth/login"
              className="font-medium text-blue-600 transition-colors hover:text-blue-500 dark:text-blue-400 dark:hover:text-blue-300"
            >
              Sign in
            </a>
          </p>
        </div>
      </div>
    </div>
  );
} 