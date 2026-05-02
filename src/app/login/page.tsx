import PageLogin from "./pagelogin";

/**
 * Serves the dedicated `/login` route without the shared public chrome.
 */
export default function LoginPage() {
  return <PageLogin />;
}
