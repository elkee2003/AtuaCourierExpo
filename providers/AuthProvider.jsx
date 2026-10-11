import { Courier } from "@/src/models";
import { getCurrentUser, signOut } from "aws-amplify/auth";
import { DataStore } from "aws-amplify/datastore";
import { Hub } from "aws-amplify/utils";
import { router } from "expo-router";
import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react";

/**
 * ============================================================================
 * AUTH CONTEXT
 * ============================================================================
 *
 * This is a JavaScript/JSX file.
 *
 * Therefore:
 * - NO interface
 * - NO type declarations
 * - NO React.Dispatch
 * - NO TypeScript syntax
 */

const AuthContext = createContext(null);

/**
 * ============================================================================
 * AUTH PROVIDER
 * ============================================================================
 */

const AuthProvider = ({ children }) => {
  /**
   * --------------------------------------------------------------------------
   * AUTHENTICATION STATE
   * --------------------------------------------------------------------------
   */

  // Cognito authenticated user
  const [authUser, setAuthUser] = useState(null);

  // Courier record from Amplify DataStore
  const [dbCourier, setDbCourier] = useState(null);

  // Cognito user's sub
  const [sub, setSub] = useState(null);

  // Authenticated user's email
  const [userMail, setUserMail] = useState(null);

  /**
   * IMPORTANT:
   *
   * loadingCourier remains TRUE while we are still trying to determine
   * whether the Courier record exists.
   *
   * This prevents the Profile screen from immediately showing EditProfile
   * with empty fields while DataStore is still synchronizing.
   */
  const [loadingCourier, setLoadingCourier] = useState(true);

  /**
   * --------------------------------------------------------------------------
   * REFS
   * --------------------------------------------------------------------------
   */

  /**
   * Holds the current observeQuery subscription.
   */
  const courierQuerySubscriptionRef = useRef(null);

  /**
   * Holds the realtime observer for the currently loaded Courier.
   */
  const courierObserverRef = useRef(null);

  /**
   * Used to invalidate older Courier loading requests.
   *
   * Example:
   *
   * Request A starts
   * Request B starts
   *
   * Request A must not be allowed to overwrite the state belonging to
   * Request B.
   */
  const loadRequestRef = useRef(0);

  /**
   * ==========================================================================
   * GET CURRENT AUTHENTICATED USER
   * ==========================================================================
   */

  const currentAuthenticatedUser = useCallback(async () => {
    try {
      const user = await getCurrentUser();

      console.log("Authenticated courier:", user);

      /**
       * Cognito user ID.
       *
       * This is the value that should match Courier.sub.
       */
      const userSub = user.userId;

      /**
       * Get email/login identifier when available.
       *
       * Depending on your Cognito configuration, signInDetails.loginId
       * may contain the email address.
       */
      const email = user?.signInDetails?.loginId || user?.username || null;

      setAuthUser(user);
      setSub(userSub);
      setUserMail(email);

      return userSub;
    } catch (error) {
      console.log("No authenticated courier found:", error);

      /**
       * Clear authentication state.
       */
      setAuthUser(null);
      setSub(null);
      setUserMail(null);
      setDbCourier(null);

      return null;
    }
  }, []);

  /**
   * ==========================================================================
   * STOP COURIER OBSERVERS
   * ==========================================================================
   *
   * We use this before:
   *
   * - loading another courier
   * - signing out
   * - refreshing
   * - unmounting the provider
   */

  const stopCourierObservers = useCallback(() => {
    /**
     * Stop observeQuery subscription.
     */
    if (courierQuerySubscriptionRef.current) {
      try {
        courierQuerySubscriptionRef.current.unsubscribe();
      } catch (error) {
        console.log("Error unsubscribing Courier observeQuery:", error);
      }

      courierQuerySubscriptionRef.current = null;
    }

    /**
     * Stop individual Courier realtime observer.
     */
    if (courierObserverRef.current) {
      try {
        courierObserverRef.current.unsubscribe();
      } catch (error) {
        console.log("Error unsubscribing Courier observer:", error);
      }

      courierObserverRef.current = null;
    }
  }, []);

  /**
   * ==========================================================================
   * LOAD CURRENT COURIER
   * ==========================================================================
   *
   * THIS IS THE MAIN FIX FOR YOUR PROFILE PROBLEM.
   *
   * Previously the app was doing something like:
   *
   *     DataStore.query()
   *          ↓
   *     [] returned
   *          ↓
   *     wait 1 second
   *          ↓
   *     DataStore.query()
   *          ↓
   *     [] returned
   *          ↓
   *     dbCourier = null
   *          ↓
   *     SHOW EDIT PROFILE
   *
   * The problem is that DataStore synchronization may simply not have
   * finished yet.
   *
   * We now use observeQuery().
   *
   * observeQuery() continues listening while DataStore synchronizes.
   *
   * So:
   *
   *     [] + isSynced false
   *
   * does NOT mean:
   *
   *     "Courier doesn't exist."
   *
   * We wait.
   *
   * Only:
   *
   *     [] + isSynced true
   *
   * means that DataStore has finished its initial synchronization and
   * genuinely found no Courier matching the user's sub.
   */

  const dbCurrentCourier = useCallback(
    async (currentSub) => {
      if (!currentSub) {
        console.log("Cannot load Courier because sub is missing.");

        setDbCourier(null);
        setLoadingCourier(false);

        return;
      }

      /**
       * Give this request a unique ID.
       */
      const requestId = ++loadRequestRef.current;

      /**
       * Stop any previous Courier observers.
       */
      stopCourierObservers();

      /**
       * We are now actively loading the Courier.
       */
      setLoadingCourier(true);

      console.log("Loading Courier for sub:", currentSub);

      try {
        /**
         * --------------------------------------------------------------------
         * OBSERVE QUERY
         * --------------------------------------------------------------------
         *
         * This watches the Courier records matching the authenticated
         * user's sub.
         */
        const subscription = DataStore.observeQuery(Courier, (courier) =>
          courier.sub.eq(currentSub),
        ).subscribe({
          next: ({ items, isSynced }) => {
            /**
             * Make sure this result belongs to the latest request.
             */
            if (requestId !== loadRequestRef.current) {
              return;
            }

            console.log("Courier observeQuery result:", {
              itemCount: items.length,
              isSynced,
              sub: currentSub,
            });

            /**
             * ================================================================
             * CASE 1:
             * Courier exists
             * ================================================================
             */

            if (items.length > 0) {
              const courier = items[0];

              console.log("Courier found:", courier.id);

              /**
               * Store the Courier in state.
               */
              setDbCourier(courier);

              /**
               * We can now allow the Profile screen to render.
               */
              setLoadingCourier(false);

              return;
            }

            /**
             * ================================================================
             * CASE 2:
             * No Courier yet, but DataStore is STILL synchronizing
             * ================================================================
             *
             * THIS IS THE IMPORTANT CASE.
             *
             * We do NOT set dbCourier to null here.
             *
             * We do NOT show EditProfile.
             *
             * We simply keep loading.
             */

            if (!isSynced) {
              console.log(
                "Courier not available locally yet. DataStore is still syncing...",
              );

              /**
               * Keep loadingCourier TRUE.
               */
              setLoadingCourier(true);

              return;
            }

            /**
             * ================================================================
             * CASE 3:
             * DataStore has finished synchronizing and still found no Courier
             * ================================================================
             *
             * At this point it is safe to conclude that there really isn't
             * a Courier record matching this Cognito sub.
             */

            console.log("DataStore is synchronized, but no Courier was found.");

            setDbCourier(null);
            setLoadingCourier(false);
          },

          error: (error) => {
            /**
             * Ignore errors from an old request.
             */
            if (requestId !== loadRequestRef.current) {
              return;
            }

            console.error("Courier observeQuery error:", error);

            /**
             * We don't want the app to remain stuck on the loading screen
             * forever if DataStore encounters an actual error.
             */
            setLoadingCourier(false);
          },
        });

        /**
         * Store the subscription so that we can clean it up later.
         */
        courierQuerySubscriptionRef.current = subscription;
      } catch (error) {
        /**
         * Ignore old requests.
         */
        if (requestId !== loadRequestRef.current) {
          return;
        }

        console.error("Error loading Courier:", error);

        setDbCourier(null);
        setLoadingCourier(false);
      }
    },
    [stopCourierObservers],
  );

  /**
   * ==========================================================================
   * REALTIME CURRENT COURIER OBSERVER
   * ==========================================================================
   *
   * Once we have dbCourier, continue watching that specific Courier.
   *
   * This means that if something updates the Courier record, the profile
   * can update without requiring the user to close/reopen the app.
   */

  useEffect(() => {
    if (!dbCourier?.id) {
      return;
    }

    /**
     * Stop any previous individual Courier observer.
     */
    if (courierObserverRef.current) {
      try {
        courierObserverRef.current.unsubscribe();
      } catch (error) {
        console.log("Error stopping previous Courier observer:", error);
      }

      courierObserverRef.current = null;
    }

    console.log("Starting realtime Courier observer:", dbCourier.id);

    /**
     * Watch the current Courier.
     */
    const subscription = DataStore.observe(Courier, dbCourier.id).subscribe({
      next: ({ opType, element }) => {
        console.log("Courier realtime update:", opType, element?.id);

        /**
         * --------------------------------------------------------------
         * COURIER UPDATED
         * --------------------------------------------------------------
         */
        if (opType === "UPDATE") {
          setDbCourier(element);
        }

        /**
         * --------------------------------------------------------------
         * COURIER DELETED
         * --------------------------------------------------------------
         */
        if (opType === "DELETE") {
          console.log("Current Courier was deleted:", element?.id);

          setDbCourier(null);
        }
      },

      error: (error) => {
        console.error("Courier realtime observer error:", error);
      },
    });

    courierObserverRef.current = subscription;

    /**
     * Cleanup this observer when dbCourier changes.
     */
    return () => {
      try {
        subscription.unsubscribe();
      } catch (error) {
        console.log("Error cleaning Courier observer:", error);
      }

      if (courierObserverRef.current === subscription) {
        courierObserverRef.current = null;
      }
    };
  }, [dbCourier?.id]);

  /**
   * ==========================================================================
   * INITIAL AUTHENTICATION
   * ==========================================================================
   */

  useEffect(() => {
    let mounted = true;

    const initializeAuth = async () => {
      try {
        const currentSub = await currentAuthenticatedUser();

        if (!mounted) {
          return;
        }

        console.log("Initial authenticated courier sub:", currentSub);
      } catch (error) {
        console.error("Error initializing Courier authentication:", error);

        if (mounted) {
          setLoadingCourier(false);
        }
      }
    };

    initializeAuth();

    return () => {
      mounted = false;
    };
  }, [currentAuthenticatedUser]);

  /**
   * ==========================================================================
   * LOAD COURIER WHEN SUB BECOMES AVAILABLE
   * ==========================================================================
   */

  useEffect(() => {
    /**
     * If there is no authenticated user, there is no Courier to load.
     */
    if (!sub) {
      setDbCourier(null);
      setLoadingCourier(false);

      stopCourierObservers();

      return;
    }

    /**
     * We have the authenticated user's sub.
     *
     * Now find the matching Courier.
     */
    dbCurrentCourier(sub);
  }, [sub, dbCurrentCourier, stopCourierObservers]);

  /**
   * ==========================================================================
   * AUTH HUB LISTENER
   * ==========================================================================
   *
   * Handles authentication changes.
   */

  useEffect(() => {
    const listener = Hub.listen("auth", async ({ payload }) => {
      console.log("Courier Auth Hub event:", payload.event);

      /**
       * --------------------------------------------------------------
       * SIGNED IN
       * --------------------------------------------------------------
       */

      if (payload.event === "signedIn") {
        await currentAuthenticatedUser();
      }

      /**
       * --------------------------------------------------------------
       * SIGNED OUT
       * --------------------------------------------------------------
       */

      if (payload.event === "signedOut") {
        /**
         * Invalidate any currently running Courier loading operation.
         */
        loadRequestRef.current += 1;

        /**
         * Stop observers.
         */
        stopCourierObservers();

        /**
         * Clear state.
         */
        setAuthUser(null);
        setSub(null);
        setUserMail(null);
        setDbCourier(null);
        setLoadingCourier(false);
      }
    });

    /**
     * Cleanup Auth Hub listener.
     */
    return () => {
      listener();
    };
  }, [currentAuthenticatedUser, stopCourierObservers]);

  /**
   * ==========================================================================
   * REFRESH COURIER
   * ==========================================================================
   *
   * This keeps your existing refresh functionality.
   *
   * The important difference is that we DON'T wait an arbitrary 1 second.
   *
   * After restarting DataStore, observeQuery() waits for the actual
   * synchronization state.
   */

  const refreshCourier = useCallback(async () => {
    if (!sub) {
      console.log("Cannot refresh Courier because sub is missing.");

      return;
    }

    try {
      console.log("Refreshing Courier...");

      /**
       * Invalidate the previous request.
       */
      loadRequestRef.current += 1;

      /**
       * Stop existing observers before clearing DataStore.
       */
      stopCourierObservers();

      /**
       * Show loading screen.
       */
      setLoadingCourier(true);

      /**
       * Clear local DataStore.
       */
      await DataStore.clear();

      /**
       * Restart DataStore.
       */
      await DataStore.start();

      /**
       * Start watching for the Courier again.
       *
       * observeQuery will wait for synchronization instead of relying on
       * a fixed timeout.
       */
      await dbCurrentCourier(sub);

      console.log("Courier refresh started successfully.");
    } catch (error) {
      console.error("Error refreshing Courier:", error);

      setLoadingCourier(false);
    }
  }, [sub, stopCourierObservers, dbCurrentCourier]);

  /**
   * ==========================================================================
   * SIGN OUT
   * ==========================================================================
   *
   * If your existing app has a specific sign-out route, this can be adjusted
   * to that route. The actual Cognito sign-out is handled here.
   */

  const handleSignOut = async () => {
    try {
      /**
       * Stop Courier observers first.
       */
      loadRequestRef.current += 1;
      stopCourierObservers();

      /**
       * Sign out from Cognito.
       */
      await signOut();

      /**
       * Clear local state.
       */
      setAuthUser(null);
      setSub(null);
      setUserMail(null);
      setDbCourier(null);
      setLoadingCourier(false);

      /**
       * Return to the login screen.
       *
       * If your existing app uses a different route, keep your existing
       * router path here.
       */
      router.replace("/login");
    } catch (error) {
      console.error("Error signing out:", error);
    }
  };

  /**
   * ==========================================================================
   * CLEANUP
   * ==========================================================================
   */

  useEffect(() => {
    return () => {
      /**
       * Invalidate pending requests.
       */
      loadRequestRef.current += 1;

      /**
       * Stop all observers.
       */
      stopCourierObservers();
    };
  }, [stopCourierObservers]);

  // ============================================================
  // TEMPORARY LOCAL DATASTORE RESET
  // DEVELOPMENT ONLY
  // ============================================================
  //
  // Uncomment this useEffect when you want to clear local
  // DataStore data on this device.
  //
  // After confirming the reset is complete, comment it out again.
  //
  // This does NOT directly delete records from AWS/AppSync.
  // ============================================================

  // useEffect(() => {
  //   const resetLocalDataStore = async () => {
  //     try {
  //       console.log("==========================================");
  //       console.log("🧹 CLEARING LOCAL DATASTORE...");
  //       console.log("==========================================");

  //       await DataStore.clear();

  //       console.log("✅ LOCAL DATASTORE CLEARED");

  //       await DataStore.start();

  //       console.log("✅ DATASTORE RESTARTED");

  //       console.log("==========================================");
  //       console.log("🧹 LOCAL DATASTORE RESET COMPLETE");
  //       console.log("==========================================");
  //     } catch (error) {
  //       console.error("❌ FAILED TO CLEAR LOCAL DATASTORE:", error);
  //     }
  //   };

  //   resetLocalDataStore();
  // }, []);

  /**
   * ==========================================================================
   * CONTEXT
   * ==========================================================================
   */

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
        handleSignOut,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export { AuthProvider };
export default AuthProvider;

/**
 * ============================================================================
 * USE AUTH CONTEXT
 * ============================================================================
 */

export const useAuthContext = () => {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error("useAuthContext must be used inside an AuthProvider");
  }

  return context;
};

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

// Courier  setup that shows the editprofile first below

// import { Courier } from "@/src/models";
// import { getCurrentUser, signOut } from "aws-amplify/auth";
// import { DataStore } from "aws-amplify/datastore";
// import { Hub } from "aws-amplify/utils";
// import { router } from "expo-router";
// import React, { createContext, useContext, useEffect, useState } from "react";

// const AuthContext = createContext({});

// const AuthProvider = ({ children }) => {
//   // Amplify states
//   const [authUser, setAuthUser] = useState(null);
//   const [dbCourier, setDbCourier] = useState(null);
//   const [sub, setSub] = useState(null);
//   const [userMail, setUserMail] = useState(null);
//   const [loadingCourier, setLoadingCourier] = useState(true);

//   // ✅ Function to handle full logout and cleanup
//   const handleUserDeleted = async () => {
//     console.log("User deleted from Cognito — clearing session...");
//     try {
//       await signOut({ global: true }); // clears all sessions
//       await DataStore.clear(); // clears cached data
//       await DataStore.start();
//     } catch (err) {
//       console.log("Error clearing session:", err);
//     } finally {
//       setAuthUser(null);
//       setDbCourier(null);
//       setSub(null);
//       router.push("/login"); // navigate back to login
//     }
//   };

//   // Functions for useEffect
//   const currentAuthenticatedUser = async () => {
//     try {
//       const user = await getCurrentUser();
//       setAuthUser(user);
//       // const subId = authUser?.userId;
//       // setSub(subId);
//       setSub(user.userId);
//       const email = user?.signInDetails?.loginId;
//       setUserMail(email);
//     } catch (err) {
//       console.log("Auth check failed:", err.name);

//       // Handle deleted / invalid / expired user session
//       if (
//         err.name === "UserNotFoundException" ||
//         err.name === "NotAuthorizedException" ||
//         err.name === "InvalidSignatureException"
//       ) {
//         await handleUserDeleted();
//       }
//     }
//   };

//   // const dbCurrentCourier = async () => {
//   //   try {
//   //     let dbCouriercurrent = await DataStore.query(Courier, (u) =>
//   //       u.sub.eq(sub),
//   //     );

//   //     if (dbCouriercurrent.length === 0) {
//   //       console.log("No local user — forcing sync retry...");

//   //       await DataStore.clear();
//   //       await DataStore.start();

//   //       // retry AFTER sync
//   //       dbCouriercurrent = await DataStore.query(Courier, (u) => u.sub.eq(sub));
//   //     }
//   //     //   DataStore.delete(Courier, Predicates.ALL)
//   //     // DataStore.clear()

//   //     // If statement to check dbCourier in the database
//   //     if (dbCouriercurrent.length > 0) {
//   //       setDbCourier(dbCouriercurrent[0]);
//   //     } else {
//   //       // DO NOTHING — wait for sync
//   //       console.log("Waiting for DataStore sync...");
//   //     }

//   //     // I commented this out because it is the same with the else if you look above. It was part of the old code before the if statement, therefore if I remove the if statement, I should uncomment setDbCourier(dbCouriercurrent[0])
//   //     // setDbCourier(dbCouriercurrent[0])
//   //   } catch (error) {
//   //     console.error("Error getting dbCourier: ", error);
//   //   }
//   // };

//   const dbCurrentCourier = async () => {
//     try {
//       setLoadingCourier(true);

//       let dbCouriercurrent = await DataStore.query(Courier, (u) =>
//         u.sub.eq(sub),
//       );

//       if (dbCouriercurrent.length === 0) {
//         console.log("No courier found, waiting for sync...");

//         // small delay instead of clearing everything
//         await new Promise((res) => setTimeout(res, 1000));

//         dbCouriercurrent = await DataStore.query(Courier, (u) => u.sub.eq(sub));
//       }

//       if (dbCouriercurrent.length > 0) {
//         setDbCourier(dbCouriercurrent[0]);
//       } else {
//         setDbCourier(null);
//       }
//     } catch (error) {
//       console.error("Error getting dbCourier: ", error);
//     } finally {
//       setLoadingCourier(false);
//     }
//   };

//   // For Refresh
//   const refreshCourier = async () => {
//     console.log("Manual courier refresh triggered");

//     if (!sub) return;

//     try {
//       setLoadingCourier(true);

//       await DataStore.clear();
//       await DataStore.start();

//       await dbCurrentCourier();
//     } catch (e) {
//       console.log("Refresh error:", e);
//     } finally {
//       setLoadingCourier(false);
//     }
//   };

//   // useEffect(() => {
//   //   currentAuthenticatedUser();
//   // }, [sub]);
//   useEffect(() => {
//     currentAuthenticatedUser();
//   }, []);

//   // useEffect for autosign-in and auto sign-out
//   useEffect(() => {
//     const handleSignOutEvent = async () => {
//       try {
//         await DataStore.clear();
//       } catch (e) {
//         console.log("Error clearing DataStore:", e);
//       }

//       setAuthUser(null);
//       setDbCourier(null); // 👈 IMPORTANT
//       setSub(null);
//       router.push("/login");
//     };

//     const listener = (data) => {
//       const { event } = data.payload;

//       if (event === "signedIn") {
//         currentAuthenticatedUser();
//       } else if (event === "signedOut") {
//         handleSignOutEvent(); // 👈 clean
//       }
//     };

//     const hubListener = Hub.listen("auth", listener);

//     return () => hubListener();
//   }, []);

//   useEffect(() => {
//     if (!sub) {
//       return;
//     }

//     dbCurrentCourier();
//   }, [sub]);

//   // Set up a subscription to listen to changes on the current user's Courier instance
//   useEffect(() => {
//     if (!dbCourier) return;

//     const subscription = DataStore.observe(Courier, dbCourier.id).subscribe(
//       ({ element, opType }) => {
//         if (opType === "UPDATE") {
//           setDbCourier(element);
//         }
//       },
//     );

//     return () => subscription.unsubscribe();
//   }, [dbCourier]);

//   useEffect(() => {
//     if (!dbCourier) return;

//     // Observe for deletion of the Realtor record
//     const deleteSubscription = DataStore.observe(Courier).subscribe(
//       async ({ element, opType }) => {
//         if (opType === "DELETE" && element.id === dbCourier.id) {
//           await DataStore.clear();
//           setDbCourier(null); // Clear dbCourier when the record is deleted
//         }
//       },
//     );

//     return () => deleteSubscription.unsubscribe();
//   }, [dbCourier]);

//   // ============================================================
//   // TEMPORARY DATASTORE RESET — DEVELOPMENT ONLY
//   // ============================================================
//   // ⚠️ RUN THIS ONCE TO CLEAR THE LOCAL DATASTORE ON THE DEVICE.
//   // ⚠️ COMMENT OUT THIS ENTIRE useEffect AFTER IT RUNS.
//   //
//   // This clears LOCAL DataStore data only.
//   // It does NOT delete records from AWS/Data Manager.
//   // ============================================================

//   // useEffect(() => {
//   //   const clearLocalDataStore = async () => {
//   //     try {
//   //       console.log("==========================================");
//   //       console.log("🧹 TEMPORARY LOCAL DATASTORE RESET STARTED");
//   //       console.log("==========================================");

//   //       await DataStore.clear();

//   //       console.log("✅ LOCAL DATASTORE CLEARED SUCCESSFULLY");

//   //       await DataStore.start();

//   //       console.log("✅ DATASTORE RESTARTED");

//   //       console.log("==========================================");
//   //       console.log("🧹 LOCAL DATASTORE RESET COMPLETE");
//   //       console.log("==========================================");
//   //     } catch (error) {
//   //       console.error("❌ LOCAL DATASTORE RESET FAILED:", error);
//   //     }
//   //   };

//   //   clearLocalDataStore();
//   // }, []);

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
