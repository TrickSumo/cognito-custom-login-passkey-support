import {
  InitiateAuthCommand,
  RespondToAuthChallengeCommand,
  StartWebAuthnRegistrationCommand,
  CompleteWebAuthnRegistrationCommand,
  ListWebAuthnCredentialsCommand,
  DeleteWebAuthnCredentialCommand,
} from "@aws-sdk/client-cognito-identity-provider";
import { startRegistration, startAuthentication } from "@simplewebauthn/browser";
import { cognitoClient, CLIENT_ID } from "./cognitoClient";

// Call when a logged-in user clicks "Add a passkey"
export async function registerPasskey(accessToken) {
  const start = await cognitoClient.send(
    new StartWebAuthnRegistrationCommand({ AccessToken: accessToken })
  );

  const options =
    typeof start.CredentialCreationOptions === "string"
      ? JSON.parse(start.CredentialCreationOptions)
      : start.CredentialCreationOptions;

  const credential = await startRegistration({ optionsJSON: options.publicKey ?? options });

  await cognitoClient.send(
    new CompleteWebAuthnRegistrationCommand({
      AccessToken: accessToken,
      Credential: credential, // ✅ pass the object directly, no JSON.stringify
    })
  );
}

// Call when a user clicks "Sign in with passkey"
export async function signInWithPasskey(username) {
  const init = await cognitoClient.send(
    new InitiateAuthCommand({
      AuthFlow: "USER_AUTH",
      ClientId: CLIENT_ID,
      AuthParameters: { USERNAME: username, PREFERRED_CHALLENGE: "WEB_AUTHN" },
    })
  );

  let session = init.Session;
  let challenge = init;

  if (init.ChallengeName === "SELECT_CHALLENGE") {
    challenge = await cognitoClient.send(
      new RespondToAuthChallengeCommand({
        ClientId: CLIENT_ID,
        ChallengeName: "SELECT_CHALLENGE",
        Session: session,
        ChallengeResponses: { USERNAME: username, ANSWER: "WEB_AUTHN" },
      })
    );
    session = challenge.Session;
  }

  if (challenge.ChallengeName !== "WEB_AUTHN") {
    throw new Error(`Unexpected challenge: ${challenge.ChallengeName}`);
  }

  const options = JSON.parse(challenge.ChallengeParameters.CREDENTIAL_REQUEST_OPTIONS);
  const assertion = await startAuthentication({ optionsJSON: options.publicKey ?? options });

  const result = await cognitoClient.send(
    new RespondToAuthChallengeCommand({
      ClientId: CLIENT_ID,
      ChallengeName: "WEB_AUTHN",
      Session: session,
      ChallengeResponses: {
        USERNAME: username,
        CREDENTIAL: JSON.stringify(assertion),
      },
    })
  );

  return result.AuthenticationResult;
}

// Returns the list of passkeys registered for the logged-in user
export async function listPasskeys(accessToken) {
  const response = await cognitoClient.send(
    new ListWebAuthnCredentialsCommand({ AccessToken: accessToken })
  );
  return response.Credentials ?? [];
}

// Deletes a single passkey by its credential ID
export async function deletePasskey(accessToken, credentialId) {
  await cognitoClient.send(
    new DeleteWebAuthnCredentialCommand({
      AccessToken: accessToken,
      CredentialId: credentialId,
    })
  );
}
