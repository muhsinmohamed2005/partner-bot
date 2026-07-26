import { defineAuth, defineBackend } from '@aws-amplify/backend';

// defineAuth() declares a Cognito User Pool + User Pool Client.
// "loginWith: { email: true }" means users sign in with email + password
// (Cognito also supports phone, or third-party providers like Google —
// we're keeping it simple with just email for this project).
const auth = defineAuth({
  loginWith: {
    email: true,
  },
});

// Registering `auth` here is what actually tells Amplify's sandbox
// to provision the Cognito resources when we redeploy.
defineBackend({ auth });

// ARCHITECTURE: defineAuth() provisions a Cognito User Pool (the user
// directory/database) + a User Pool Client (this specific app's registered access config).
// It is an empty identity service that real sign-ups populate later,
// which Amplify then wires into amplify_outputs.json for the frontend to use.