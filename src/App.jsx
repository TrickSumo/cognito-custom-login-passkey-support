import { useState } from "react";
import LoginForm from "./components/LoginForm";
import SignUpForm from "./components/SignUpForm";
import AddPasskeyButton from "./components/AddPasskeyButton";

function App() {
  const [view, setView] = useState("login");
  const [tokens, setTokens] = useState(null);

  if (tokens) {
    return (
      <div style={{ maxWidth: 320, margin: "0 auto" }}>
        <h2>You're logged in</h2>
        <AddPasskeyButton accessToken={tokens.AccessToken} />
        <button onClick={() => setTokens(null)} style={{ marginTop: 16 }}>
          Log out
        </button>
      </div>
    );
  }

  return (
    <div>
      {view === "login" ? (
        <>
          <LoginForm onSignedIn={setTokens} />
          <button onClick={() => setView("signup")}>Need an account? Sign up</button>
        </>
      ) : (
        <>
          <SignUpForm onConfirmed={() => setView("login")} />
          <button onClick={() => setView("login")}>Back to login</button>
        </>
      )}
    </div>
  );
}

export default App;