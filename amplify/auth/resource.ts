import { defineAuth } from '@aws-amplify/backend';

export const auth = defineAuth({
  loginWith: {
    email: true,
  },
});

// ARCHITECTURE: defineAuth() provisions a Cognito User Pool (the user
// directory/database) + a User Pool Client (this specific app's registered access config).
// It is an empty identity service that real sign-ups populate later,
// which Amplify then wires into amplify_outputs.json for the frontend to use.