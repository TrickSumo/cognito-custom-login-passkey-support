import { useState, useEffect, useCallback } from "react";
import { registerPasskey, listPasskeys, deletePasskey } from "../lib/passkeyAuth";

export default function PasskeyManager({ accessToken }) {
  const [passkeys, setPasskeys] = useState([]);
  const [loadingList, setLoadingList] = useState(true);
  const [adding, setAdding] = useState(false);
  const [deletingId, setDeletingId] = useState(null);
  const [error, setError] = useState(null);

  const fetchPasskeys = useCallback(async () => {
    setLoadingList(true);
    setError(null);
    try {
      const list = await listPasskeys(accessToken);
      setPasskeys(list);
    } catch (err) {
      setError(`Failed to load passkeys: ${err.message}`);
    } finally {
      setLoadingList(false);
    }
  }, [accessToken]);

  useEffect(() => {
    fetchPasskeys();
  }, [fetchPasskeys]);

  async function handleAdd() {
    setAdding(true);
    setError(null);
    try {
      await registerPasskey(accessToken);
      await fetchPasskeys();
    } catch (err) {
      setError(`Failed to add passkey: ${err.message}`);
    } finally {
      setAdding(false);
    }
  }

  async function handleDelete(credentialId) {
    setDeletingId(credentialId);
    setError(null);
    try {
      await deletePasskey(accessToken, credentialId);
      await fetchPasskeys();
    } catch (err) {
      setError(`Failed to remove passkey: ${err.message}`);
    } finally {
      setDeletingId(null);
    }
  }

  return (
    <div style={{ marginBottom: 16 }}>
      <h3 style={{ marginBottom: 8 }}>Your Passkeys</h3>

      {loadingList && <p style={{ color: "#888" }}>Loading passkeys...</p>}

      {!loadingList && passkeys.length === 0 && (
        <p style={{ color: "#888" }}>No passkeys registered yet.</p>
      )}

      {!loadingList && passkeys.length > 0 && (
        <ul style={{ listStyle: "none", padding: 0, margin: "0 0 12px 0" }}>
          {passkeys.map((pk) => (
            <li
              key={pk.CredentialId}
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                padding: "6px 0",
                borderBottom: "1px solid #eee",
              }}
            >
              <span>
                🔑{" "}
                {pk.FriendlyCredentialName ||
                  (pk.CreatedAt
                    ? new Date(pk.CreatedAt).toLocaleDateString()
                    : pk.CredentialId.slice(0, 12) + "...")}
              </span>
              <button
                onClick={() => handleDelete(pk.CredentialId)}
                disabled={deletingId === pk.CredentialId}
                style={{ marginLeft: 12, color: "red", cursor: "pointer" }}
              >
                {deletingId === pk.CredentialId ? "Removing..." : "Remove"}
              </button>
            </li>
          ))}
        </ul>
      )}

      {error && <p style={{ color: "red" }}>{error}</p>}

      <button onClick={handleAdd} disabled={adding || loadingList}>
        {adding ? "Registering..." : "+ Add a passkey"}
      </button>
    </div>
  );
}
