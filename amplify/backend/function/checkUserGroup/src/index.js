/* eslint-disable */
const AWS = require("aws-sdk");

// Initialize CognitoIdentityServiceProvider
const cognito = new AWS.CognitoIdentityServiceProvider();

exports.handler = async (event) => {
  console.log("Pre Sign-Up Trigger Event:", JSON.stringify(event, null, 2));

  // Get the user's email and user pool ID
  const email = event.request.userAttributes.email;
  const userPoolId = event.userPoolId;

  try {
    // 1️⃣ List all Cognito groups in the user pool
    const groupsData = await cognito.listGroups({ UserPoolId: userPoolId }).promise();

    // 2️⃣ Loop through each group to check if this email already exists
    for (const group of groupsData.Groups) {
      const params = {
        UserPoolId: userPoolId,
        GroupName: group.GroupName,
      };

      const usersInGroup = await cognito.listUsersInGroup(params).promise();

      const existingUser = usersInGroup.Users.find(
        (u) => u.Attributes.find((a) => a.Name === "email" && a.Value === email)
      );

      if (existingUser) {
        // ❌ User already exists in another group
        throw new Error(
          `This email (${email}) is already registered under the '${group.GroupName}' group. Please use a different email.`
        );
      }
    }

    // ✅ Allow signup if no match found
    console.log("Email is unique — signup allowed.");
    event.response.autoConfirmUser = true;
    return event;
  } catch (error) {
    console.error("Error checking user groups:", error);
    // Stop signup and return a custom error message
    throw new Error(error.message || "Signup restricted. Please use a unique email.");
  }
};
