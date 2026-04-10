import { Courier } from "@/src/models";
import { getCurrentUser, signOut } from "aws-amplify/auth";
import { DataStore } from "aws-amplify/datastore";
import { Hub } from "aws-amplify/utils";
import { router } from "expo-router";
import React, { createContext, useContext, useEffect, useState } from "react";

const AuthContext = createContext({});

const AuthProvider = ({ children }) => {
  // Amplify states
  const [authUser, setAuthUser] = useState(null);
  const [dbCourier, setDbCourier] = useState(null);
  const [sub, setSub] = useState(null);
  const [userMail, setUserMail] = useState(null);

  // ✅ Function to handle full logout and cleanup
  const handleUserDeleted = async () => {
    console.log("User deleted from Cognito — clearing session...");
    try {
      await signOut({ global: true }); // clears all sessions
      await DataStore.clear(); // clears cached data
      await DataStore.start();
    } catch (err) {
      console.log("Error clearing session:", err);
    } finally {
      setAuthUser(null);
      setDbCourier(null);
      setSub(null);
      router.push("/login"); // navigate back to login
    }
  };

  // Functions for useEffect
  const currentAuthenticatedUser = async () => {
    try {
      const user = await getCurrentUser();
      setAuthUser(user);
      // const subId = authUser?.userId;
      // setSub(subId);
      setSub(user.userId);
      const email = authUser?.signInDetails?.loginId;
      setUserMail(email);
    } catch (err) {
      console.log("Auth check failed:", err.name);

      // Handle deleted / invalid / expired user session
      if (
        err.name === "UserNotFoundException" ||
        err.name === "NotAuthorizedException" ||
        err.name === "InvalidSignatureException"
      ) {
        await handleUserDeleted();
      }
    }
  };

  const dbCurrentCourier = async () => {
    try {
      let dbCouriercurrent = await DataStore.query(Courier, (u) =>
        u.sub.eq(sub),
      );

      if (dbCouriercurrent.length === 0) {
        console.log("No local user — forcing sync retry...");

        await DataStore.clear();
        await DataStore.start();

        // retry AFTER sync
        dbCouriercurrent = await DataStore.query(Courier, (u) => u.sub.eq(sub));
      }
      //   DataStore.delete(Courier, Predicates.ALL)
      // DataStore.clear()

      // If statement to check dbCourier in the database
      if (dbCouriercurrent.length > 0) {
        setDbCourier(dbCouriercurrent[0]);
      } else {
        // DO NOTHING — wait for sync
        console.log("Waiting for DataStore sync...");
      }

      // I commented this out because it is the same with the else if you look above. It was part of the old code before the if statement, therefore if I remove the if statement, I should uncomment setDbCourier(dbCouriercurrent[0])
      // setDbCourier(dbCouriercurrent[0])
    } catch (error) {
      console.error("Error getting dbCourier: ", error);
    }
  };

  useEffect(() => {
    currentAuthenticatedUser();
  }, [sub]);

  // useEffect for autosign-in and auto sign-out
  useEffect(() => {
    const listener = (data) => {
      const { event } = data.payload;
      if (event === "signedIn") {
        currentAuthenticatedUser();
      } else if (event === "signedOut") {
        setAuthUser(null); // Clear the authUser state
        setSub(null); // Clear the sub state
        router.push("/login"); // Navigate to the sign-in page
      }
    };

    // Start listening for authentication events
    const hubListener = Hub.listen("auth", listener);

    // Cleanup the listener when the component unmounts
    return () => hubListener(); // Stop listening for the events
  }, []);

  useEffect(() => {
    if (!sub) {
      return;
    }

    dbCurrentCourier();
  }, [sub]);

  // Set up a subscription to listen to changes on the current user's Courier instance
  useEffect(() => {
    if (!dbCourier) return;

    const subscription = DataStore.observe(Courier, dbCourier.id).subscribe(
      ({ element, opType }) => {
        if (opType === "UPDATE") {
          setDbCourier(element);
        }
      },
    );

    return () => subscription.unsubscribe();
  }, [dbCourier]);

  useEffect(() => {
    if (!dbCourier) return;

    // Observe for deletion of the Realtor record
    const deleteSubscription = DataStore.observe(Courier).subscribe(
      async ({ element, opType }) => {
        if (opType === "DELETE" && element.id === dbCourier.id) {
          await DataStore.clear();
          setDbCourier(null); // Clear dbCourier when the record is deleted
        }
      },
    );

    return () => deleteSubscription.unsubscribe();
  }, [dbCourier]);

  return (
    <AuthContext.Provider
      value={{
        authUser,
        dbCourier,
        setDbCourier,
        sub,
        userMail,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export default AuthProvider;
export const useAuthContext = () => useContext(AuthContext);
