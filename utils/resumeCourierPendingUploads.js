// utils/resumeCourierPendingUploads.ts

import {
    CourierPostLoadingUploadStatus,
    CourierPreTransferUploadStatus,
    DropoffUploadStatus,
    Order,
} from "@/src/models";
import { DataStore } from "aws-amplify/datastore";
import { uploadCourierEvidence } from "./uploadCourierEvidence";

/**
 * =========================
 * 🔁 RESUME COURIER UPLOADS (STAGE-AWARE)
 * =========================
 */
export const resumeCourierPendingUploads = async (courierId) => {
  if (!courierId) return;

  try {
    /**
     * =========================
     * 📦 GET ALL ORDERS (assigned to courier ideally)
     * =========================
     */
    const orders = await DataStore.query(Order);

    for (const order of orders) {
      /**
       * =========================
       * 🧠 STAGE 1: PRE_TRANSFER
       * =========================
       */
      const shouldRetryPre =
        order.courierPreTransferUploadStatus ===
          CourierPreTransferUploadStatus.PENDING ||
        order.courierPreTransferUploadStatus ===
          CourierPreTransferUploadStatus.FAILED;

      if (shouldRetryPre) {
        const photos =
          order.courierPreTransferLocalPhotos?.map((uri) => ({ uri })) || [];

        const video = order.courierPreTransferLocalVideo
          ? { uri: order.courierPreTransferLocalVideo }
          : null;

        if (photos.length || video) {
          await uploadCourierEvidence(
            order,
            photos,
            video,
            "PRE_TRANSFER",
            courierId,
          );
        }
      }

      /**
       * =========================
       * 🧠 STAGE 2: POST_LOADING
       * =========================
       */
      const shouldRetryPost =
        order.courierPostLoadingUploadStatus ===
          CourierPostLoadingUploadStatus.PENDING ||
        order.courierPostLoadingUploadStatus ===
          CourierPostLoadingUploadStatus.FAILED;

      if (shouldRetryPost) {
        const photos =
          order.courierPostLoadingLocalPhotos?.map((uri) => ({ uri })) || [];

        const video = order.courierPostLoadingLocalVideo
          ? { uri: order.courierPostLoadingLocalVideo }
          : null;

        if (photos.length || video) {
          await uploadCourierEvidence(
            order,
            photos,
            video,
            "POST_LOADING",
            courierId,
          );
        }
      }

      /**
       * =========================
       * 🧠 STAGE 3: DROPOFF
       * =========================
       */
      const shouldRetryDropoff =
        order.dropoffUploadStatus === DropoffUploadStatus.PENDING ||
        order.dropoffUploadStatus === DropoffUploadStatus.FAILED;

      if (shouldRetryDropoff) {
        const photos =
          order.dropoffArrivalLocalPhotos?.map((uri) => ({ uri })) || [];

        const video = order.dropoffArrivalLocalVideo
          ? { uri: order.dropoffArrivalLocalVideo }
          : null;

        if (photos.length || video) {
          await uploadCourierEvidence(
            order,
            photos,
            video,
            "DROPOFF",
            courierId,
          );
        }
      }
    }

    console.log("✅ Courier upload recovery complete");
  } catch (err) {
    console.log("❌ Courier upload recovery error:", err);
  }
};
