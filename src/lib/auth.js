import {
  InitiateAuthCommand,
  RespondToAuthChallengeCommand,
  SignUpCommand,
  ConfirmSignUpCommand,
} from "@aws-sdk/client-cognito-identity-provider";
import { cognitoClient, CLIENT_ID } from "./cognitoClient";

export async function signInWithPassword(username, password) {
  const init = await cognitoClient.send(
    new InitiateAuthCommand({
      AuthFlow: "USER_AUTH",
      ClientId: CLIENT_ID,
      AuthParameters: {
        USERNAME: username,
        PREFERRED_CHALLENGE: "PASSWORD",
        PASSWORD: password, // <-- this was the missing piece
      },
    })
  );

  // If password + username were both valid, Cognito returns tokens directly here
  if (init.AuthenticationResult) {
    return init.AuthenticationResult;
  }

  // Fallback: pool couldn't honor PASSWORD as preferred, gave a different challenge
  throw new Error(`Unexpected response, challenge: ${init.ChallengeName}`);
}

export async function signUp(username, password, email) {
  return cognitoClient.send(
    new SignUpCommand({
      ClientId: CLIENT_ID,
      Username: username,
      Password: password,
      UserAttributes: [{ Name: "email", Value: email }],
    })
  );
}

export async function confirmSignUp(username, code) {
  return cognitoClient.send(
    new ConfirmSignUpCommand({
      ClientId: CLIENT_ID,
      Username: username,
      ConfirmationCode: code,
    })
  );
}