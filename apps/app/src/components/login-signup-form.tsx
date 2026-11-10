import { useNavigate } from "@tanstack/solid-router";
import { createSignal } from "solid-js";
import { authClient } from "~/library/auth-client";
import { refreshAuth } from "~/library/convex-client";

export default function LoginSignupForm() {
  const navigate = useNavigate();
  const [isLogin, setIsLogin] = createSignal(true);
  const [name, setName] = createSignal("");
  const [email, setEmail] = createSignal("");
  const [password, setPassword] = createSignal("");
  const [error, setError] = createSignal("");
  const [loading, setLoading] = createSignal(false);

  const handleSubmit = async (e: Event) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const response = isLogin()
        ? await authClient.signIn.email({
            email: email(),
            password: password(),
          })
        : await authClient.signUp.email({
            name: name(),
            email: email(),
            password: password(),
          });

      if (response.error) {
        throw new Error(response.error.message || "Authentication failed");
      }

      if (!response.data?.token) {
        throw new Error("Authentication failed");
      }

      refreshAuth();
      navigate({ to: "/dashboard" });
    } catch (err: any) {
      setError(err?.message || "An error occurred");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main class="min-h-screen flex items-center justify-center bg-surface px-4">
      <div class="w-full max-w-md">
        <div class="bg-card rounded-lg border border-line shadow-xl p-8 md:p-10">
          <div class="text-center mb-8">
            <h1 class="text-3xl font-bold text-ink mb-2">
              {isLogin() ? "Welcome Back" : "Create Account"}
            </h1>
            <p class="text-muted text-sm">
              {isLogin()
                ? "Sign in to continue to your account"
                : "Get started with your free account"}
            </p>
          </div>

          <form onSubmit={handleSubmit} class="space-y-5">
            {!isLogin() && (
              <div>
                <label
                  for="name"
                  class="block text-sm font-medium text-muted mb-2"
                >
                  Full Name
                </label>
                <input
                  id="name"
                  type="text"
                  value={name()}
                  onInput={(e) => setName(e.currentTarget.value)}
                  required={!isLogin()}
                  class="w-full px-4 py-3 rounded-md border border-line focus:ring-2 focus:ring-accent/40 focus:border-accent outline-none transition-all duration-200 text-ink placeholder:text-muted"
                  placeholder="John Doe"
                />
              </div>
            )}

            <div>
              <label
                for="email"
                class="block text-sm font-medium text-muted mb-2"
              >
                Email Address
              </label>
              <input
                id="email"
                type="email"
                value={email()}
                onInput={(e) => setEmail(e.currentTarget.value)}
                required
                class="w-full px-4 py-3 rounded-md border border-line focus:ring-2 focus:ring-accent/40 focus:border-accent outline-none transition-all duration-200 text-ink placeholder:text-muted"
                placeholder="you@example.com"
              />
            </div>

            <div>
              <label
                for="password"
                class="block text-sm font-medium text-muted mb-2"
              >
                Password
              </label>
              <input
                id="password"
                type="password"
                value={password()}
                onInput={(e) => setPassword(e.currentTarget.value)}
                required
                class="w-full px-4 py-3 rounded-md border border-line focus:ring-2 focus:ring-accent/40 focus:border-accent outline-none transition-all duration-200 text-ink placeholder:text-muted"
                placeholder="••••••••"
              />
            </div>

            {error() && (
              <div class="bg-danger/10 border border-danger/20 text-danger px-4 py-3 rounded-md text-sm flex items-center gap-2">
                <svg
                  class="w-5 h-5 flex-shrink-0"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path
                    fill-rule="evenodd"
                    d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414 1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                    clip-rule="evenodd"
                  />
                </svg>
                <span>{error()}</span>
              </div>
            )}

            <button
              type="submit"
              disabled={loading()}
              class="w-full px-4 py-3 rounded-md font-semibold text-white transition-colors duration-200 bg-accent hover:bg-accent/90"
            >
              {loading()
                ? "Processing..."
                : isLogin()
                  ? "Sign In"
                  : "Create Account"}
            </button>
          </form>

          <div class="mt-6 text-center">
            <button
              onClick={() => {
                setIsLogin(!isLogin());
                setError("");
              }}
              class="text-sm text-muted hover:text-accent transition-colors duration-200 font-medium"
            >
              {isLogin()
                ? "Don't have an account? Sign up"
                : "Already have an account? Sign in"}
            </button>
          </div>
        </div>
      </div>
    </main>
  );
}
