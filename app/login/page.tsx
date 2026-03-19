import LoginPage from "@/components/Pages/LoginPage";

/**
 * Login route — renders the login page.
 * If user is already logged in, LoginPage handles redirect client-side.
 */
export default function LoginRoute() {
  return <LoginPage />;
}
