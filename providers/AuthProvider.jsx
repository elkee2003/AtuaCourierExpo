// import { Courier } from "@/src/models";
// import { getCurrentUser, signOut } from "aws-amplify/auth";
// import { DataStore } from "aws-amplify/datastore";
// import { Hub } from "aws-amplify/utils";
// import { router } from "expo-router";
// import React, { createContext, useContext, useEffect, useState } from "react";

// /**
//  * Wait until Amplify DataStore reports that it is ready.
//  *
//  * This is intentionally the same pattern used in your User App.
//  */
// const waitForDataStoreReady = () => {
//   return new Promise((resolve) => {
//     const unsubscribe = Hub.listen("datastore", ({ payload }) => {
//       if (payload.event === "ready") {
//         unsubscribe();
//         resolve();
//       }
//     });
//   });
// };

// const AuthContext = createContext({});

// const AuthProvider = ({ children }) => {
//   // ============================================================
//   // AMPLIFY / AUTH STATES
//   // ============================================================

//   const [authUser, setAuthUser] = useState(null);
//   const [dbCourier, setDbCourier] = useState(null);
//   const [sub, setSub] = useState(null);
//   const [userMail, setUserMail] = useState(null);
//   const [loadingCourier, setLoadingCourier] = useState(true);

//   // ============================================================
//   // HANDLE USER DELETED FROM COGNITO
//   // ============================================================

//   const handleUserDeleted = async () => {
//     console.log("User deleted from Cognito — clearing session...");

//     try {
//       // Sign out from all devices/sessions.
//       await signOut({ global: true });

//       // Clear local DataStore data.
//       await DataStore.clear();

//       // Restart DataStore.
//       await DataStore.start();
//     } catch (err) {
//       console.log("Error clearing session:", err);
//     } finally {
//       // Clear all local authentication state.
//       setAuthUser(null);
//       setDbCourier(null);
//       setSub(null);
//       setUserMail(null);

//       // Return to login.
//       router.push("/login");
//     }
//   };

//   // ============================================================
//   // GET CURRENT AUTHENTICATED COGNITO USER
//   // ============================================================

//   const currentAuthenticatedUser = async () => {
//     try {
//       const user = await getCurrentUser();

//       console.log("Authenticated courier user:", user);

//       setAuthUser(user);

//       // Set the Cognito user ID.
//       setSub(user.userId);

//       // Get the user's email/login ID.
//       const email = user?.signInDetails?.loginId;

//       setUserMail(email);
//     } catch (err) {
//       console.log("Auth check failed:", err.name);

//       // Handle deleted, invalid, or expired Cognito sessions.
//       if (
//         err.name === "UserNotFoundException" ||
//         err.name === "NotAuthorizedException" ||
//         err.name === "InvalidSignatureException"
//       ) {
//         await handleUserDeleted();
//       }
//     }
//   };

//   // ============================================================
//   // GET CURRENT COURIER RECORD FROM DATASTORE
//   // ============================================================

//   const dbCurrentCourier = async () => {
//     // Do not query DataStore until the Cognito sub exists.
//     if (!sub) {
//       return;
//     }

//     try {
//       setLoadingCourier(true);

//       console.log("Waiting for DataStore to become ready...");

//       // Same DataStore readiness pattern as the User App.
//       await waitForDataStoreReady();

//       console.log("DataStore is ready. Querying Courier...");

//       // Query the Courier record using the Cognito sub.
//       const couriers = await DataStore.query(Courier, (c) => c.sub.eq(sub));

//       console.log("Courier query result:", couriers);

//       if (couriers.length > 0) {
//         // Courier record found.
//         setDbCourier(couriers[0]);
//       } else {
//         // Courier record does not exist locally.
//         setDbCourier(null);
//       }
//     } catch (error) {
//       console.error("Error getting dbCourier:", error);
//     } finally {
//       // Always stop the loading state.
//       setLoadingCourier(false);
//     }
//   };

//   // ============================================================
//   // MANUAL REFRESH
//   // ============================================================

//   const refreshCourier = async () => {
//     console.log("Manual courier refresh triggered");

//     if (!sub) {
//       return;
//     }

//     try {
//       setLoadingCourier(true);

//       // Force DataStore to clear and sync again.
//       await DataStore.clear();

//       await DataStore.start();

//       // Query the current courier again.
//       await dbCurrentCourier();
//     } catch (error) {
//       console.log("Refresh error:", error);
//     } finally {
//       setLoadingCourier(false);
//     }
//   };

//   // ============================================================
//   // INITIAL AUTHENTICATION CHECK
//   // ============================================================

//   useEffect(() => {
//     currentAuthenticatedUser();
//   }, []);

//   // ============================================================
//   // AUTH HUB LISTENER
//   // ============================================================

//   useEffect(() => {
//     const handleSignOutEvent = async () => {
//       try {
//         // Clear local DataStore data after sign out.
//         await DataStore.clear();
//       } catch (error) {
//         console.log("Error clearing DataStore:", error);
//       }

//       // Clear all authentication and courier state.
//       setAuthUser(null);
//       setDbCourier(null);
//       setSub(null);
//       setUserMail(null);

//       // Return to login.
//       router.push("/login");
//     };

//     const listener = (data) => {
//       const { event } = data.payload;

//       if (event === "signedIn") {
//         // Reload the authenticated Cognito user.
//         currentAuthenticatedUser();
//       } else if (event === "signedOut") {
//         // Clear the session.
//         handleSignOutEvent();
//       }
//     };

//     const hubListener = Hub.listen("auth", listener);

//     // Remove the listener when the provider unmounts.
//     return () => hubListener();
//   }, []);

//   // ============================================================
//   // LOAD COURIER WHEN SUB CHANGES
//   // ============================================================

//   useEffect(() => {
//     if (sub) {
//       dbCurrentCourier();
//     }
//   }, [sub]);

//   // ============================================================
//   // OBSERVE UPDATES TO THE CURRENT COURIER RECORD
//   // ============================================================

//   useEffect(() => {
//     if (!dbCourier) {
//       return;
//     }

//     const subscription = DataStore.observe(Courier, dbCourier.id).subscribe(
//       ({ element, opType }) => {
//         if (opType === "UPDATE") {
//           console.log("Courier record updated:", element);

//           setDbCourier(element);
//         }
//       },
//     );

//     // Clean up the subscription.
//     return () => subscription.unsubscribe();
//   }, [dbCourier]);

//   // ============================================================
//   // OBSERVE DELETION OF THE CURRENT COURIER RECORD
//   // ============================================================

//   useEffect(() => {
//     if (!dbCourier) {
//       return;
//     }

//     const deleteSubscription = DataStore.observe(Courier).subscribe(
//       async ({ element, opType }) => {
//         if (opType === "DELETE" && element.id === dbCourier.id) {
//           console.log("Current Courier record deleted.");

//           // Clear local DataStore data.
//           await DataStore.clear();

//           // Clear the courier from state.
//           setDbCourier(null);
//         }
//       },
//     );

//     // Clean up the subscription.
//     return () => deleteSubscription.unsubscribe();
//   }, [dbCourier]);

//   // ============================================================
//   // TEMPORARY LOCAL DATASTORE RESET
//   // DEVELOPMENT ONLY
//   // ============================================================

//   /*
//   useEffect(() => {
//     const resetLocalDataStore = async () => {
//       try {
//         console.log("==========================================");
//         console.log("🧹 CLEARING LOCAL DATASTORE...");
//         console.log("==========================================");

//         await DataStore.clear();

//         console.log("✅ LOCAL DATASTORE CLEARED");

//         await DataStore.start();

//         console.log("✅ DATASTORE RESTARTED");

//         console.log("==========================================");
//         console.log("🧹 LOCAL DATASTORE RESET COMPLETE");
//         console.log("==========================================");
//       } catch (error) {
//         console.error("❌ FAILED TO CLEAR LOCAL DATASTORE:", error);
//       }
//     };

//     resetLocalDataStore();
//   }, []);
//   */

//   // ============================================================
//   // CONTEXT VALUE
//   // ============================================================

//   return (
//     <AuthContext.Provider
//       value={{
//         authUser,
//         dbCourier,
//         setDbCourier,
//         sub,
//         userMail,
//         loadingCourier,
//         refreshCourier,
//       }}
//     >
//       {children}
//     </AuthContext.Provider>
//   );
// };

// export default AuthProvider;

// export const useAuthContext = () => useContext(AuthContext);

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
  const [loadingCourier, setLoadingCourier] = useState(true);

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
      const email = user?.signInDetails?.loginId;
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

  // const dbCurrentCourier = async () => {
  //   try {
  //     let dbCouriercurrent = await DataStore.query(Courier, (u) =>
  //       u.sub.eq(sub),
  //     );

  //     if (dbCouriercurrent.length === 0) {
  //       console.log("No local user — forcing sync retry...");

  //       await DataStore.clear();
  //       await DataStore.start();

  //       // retry AFTER sync
  //       dbCouriercurrent = await DataStore.query(Courier, (u) => u.sub.eq(sub));
  //     }
  //     //   DataStore.delete(Courier, Predicates.ALL)
  //     // DataStore.clear()

  //     // If statement to check dbCourier in the database
  //     if (dbCouriercurrent.length > 0) {
  //       setDbCourier(dbCouriercurrent[0]);
  //     } else {
  //       // DO NOTHING — wait for sync
  //       console.log("Waiting for DataStore sync...");
  //     }

  //     // I commented this out because it is the same with the else if you look above. It was part of the old code before the if statement, therefore if I remove the if statement, I should uncomment setDbCourier(dbCouriercurrent[0])
  //     // setDbCourier(dbCouriercurrent[0])
  //   } catch (error) {
  //     console.error("Error getting dbCourier: ", error);
  //   }
  // };

  const dbCurrentCourier = async () => {
    try {
      setLoadingCourier(true);

      let dbCouriercurrent = await DataStore.query(Courier, (u) =>
        u.sub.eq(sub),
      );

      if (dbCouriercurrent.length === 0) {
        console.log("No courier found, waiting for sync...");

        // small delay instead of clearing everything
        await new Promise((res) => setTimeout(res, 1000));

        dbCouriercurrent = await DataStore.query(Courier, (u) => u.sub.eq(sub));
      }

      if (dbCouriercurrent.length > 0) {
        setDbCourier(dbCouriercurrent[0]);
      } else {
        setDbCourier(null);
      }
    } catch (error) {
      console.error("Error getting dbCourier: ", error);
    } finally {
      setLoadingCourier(false);
    }
  };

  // For Refresh
  const refreshCourier = async () => {
    console.log("Manual courier refresh triggered");

    if (!sub) return;

    try {
      setLoadingCourier(true);

      await DataStore.clear();
      await DataStore.start();

      await dbCurrentCourier();
    } catch (e) {
      console.log("Refresh error:", e);
    } finally {
      setLoadingCourier(false);
    }
  };

  // useEffect(() => {
  //   currentAuthenticatedUser();
  // }, [sub]);
  useEffect(() => {
    currentAuthenticatedUser();
  }, []);

  // useEffect for autosign-in and auto sign-out
  useEffect(() => {
    const handleSignOutEvent = async () => {
      try {
        await DataStore.clear();
      } catch (e) {
        console.log("Error clearing DataStore:", e);
      }

      setAuthUser(null);
      setDbCourier(null); // 👈 IMPORTANT
      setSub(null);
      router.push("/login");
    };

    const listener = (data) => {
      const { event } = data.payload;

      if (event === "signedIn") {
        currentAuthenticatedUser();
      } else if (event === "signedOut") {
        handleSignOutEvent(); // 👈 clean
      }
    };

    const hubListener = Hub.listen("auth", listener);

    return () => hubListener();
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

  // ============================================================
  // TEMPORARY DATASTORE RESET — DEVELOPMENT ONLY
  // ============================================================
  // ⚠️ RUN THIS ONCE TO CLEAR THE LOCAL DATASTORE ON THE DEVICE.
  // ⚠️ COMMENT OUT THIS ENTIRE useEffect AFTER IT RUNS.
  //
  // This clears LOCAL DataStore data only.
  // It does NOT delete records from AWS/Data Manager.
  // ============================================================

  // useEffect(() => {
  //   const clearLocalDataStore = async () => {
  //     try {
  //       console.log("==========================================");
  //       console.log("🧹 TEMPORARY LOCAL DATASTORE RESET STARTED");
  //       console.log("==========================================");

  //       await DataStore.clear();

  //       console.log("✅ LOCAL DATASTORE CLEARED SUCCESSFULLY");

  //       await DataStore.start();

  //       console.log("✅ DATASTORE RESTARTED");

  //       console.log("==========================================");
  //       console.log("🧹 LOCAL DATASTORE RESET COMPLETE");
  //       console.log("==========================================");
  //     } catch (error) {
  //       console.error("❌ LOCAL DATASTORE RESET FAILED:", error);
  //     }
  //   };

  //   clearLocalDataStore();
  // }, []);

  return (
    <AuthContext.Provider
      value={{
        authUser,
        dbCourier,
        setDbCourier,
        sub,
        userMail,
        loadingCourier,
        refreshCourier,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export default AuthProvider;
export const useAuthContext = () => useContext(AuthContext);
