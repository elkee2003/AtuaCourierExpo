import {
    CourierPostLoadingUploadStatus,
    CourierPreTransferUploadStatus,
    DropoffUploadStatus,
    Order,
} from "@/src/models";

import { DataStore } from "aws-amplify/datastore";
import { uploadData } from "aws-amplify/storage";
import * as Crypto from "expo-crypto";
import * as ImageManipulator from "expo-image-manipulator";

export const uploadCourierEvidence = async (
  order,
  photos,
  video,
  stage,
  courierId,
  onProgress,
) => {
  if (!order || !courierId) return;

  const hasMedia = (photos && photos.length > 0) || video?.uri;
  if (!hasMedia) return;

  const photoKeyMap = {
    PRE_TRANSFER: "courierPreTransferPhotos",
    POST_LOADING: "courierPostLoadingPhotos",
    DROPOFF: "dropoffArrivalPhotos",
  };

  const videoKeyMap = {
    PRE_TRANSFER: "courierPreTransferVideo",
    POST_LOADING: "courierPostLoadingVideo",
    DROPOFF: "dropoffArrivalVideo",
  };

  const localPhotoKeyMap = {
    PRE_TRANSFER: "courierPreTransferLocalPhotos",
    POST_LOADING: "courierPostLoadingLocalPhotos",
    DROPOFF: "dropoffArrivalLocalPhotos",
  };

  const localVideoKeyMap = {
    PRE_TRANSFER: "courierPreTransferLocalVideo",
    POST_LOADING: "courierPostLoadingLocalVideo",
    DROPOFF: "dropoffArrivalLocalVideo",
  };

  const statusKeyMap = {
    PRE_TRANSFER: "courierPreTransferUploadStatus",
    POST_LOADING: "courierPostLoadingUploadStatus",
    DROPOFF: "dropoffUploadStatus",
  };

  const statusEnumMap = {
    PRE_TRANSFER: CourierPreTransferUploadStatus,
    POST_LOADING: CourierPostLoadingUploadStatus,
    DROPOFF: DropoffUploadStatus,
  };

  const photoField = photoKeyMap[stage];
  const videoField = videoKeyMap[stage];
  const localPhotoField = localPhotoKeyMap[stage];
  const localVideoField = localVideoKeyMap[stage];
  const statusField = statusKeyMap[stage];
  const StatusEnum = statusEnumMap[stage];

  try {
    /**
     * 🔄 SET STATUS → UPLOADING
     */
    await DataStore.save(
      Order.copyOf(await DataStore.query(Order, order.id), (updated) => {
        updated[statusField] = StatusEnum.UPLOADING;

        updated[localPhotoField] = photos?.map((p) => p.uri) || [];
        updated[localVideoField] = video?.uri || null;
      }),
    );

    let totalItems = (photos?.length || 0) + (video?.uri ? 1 : 0);
    let uploadedCount = 0;

    const reportProgress = () => {
      if (!onProgress || totalItems === 0) return;

      const percent = Math.round((uploadedCount / totalItems) * 100);
      onProgress(percent);
    };

    /**
     * 📸 UPLOAD PHOTOS (WITH PROGRESS)
     */
    let uploadedPhotos = [];

    if (photos?.length) {
      for (const photo of photos) {
        try {
          const manipulated = await ImageManipulator.manipulateAsync(
            photo.uri,
            [{ resize: { width: 900 } }],
            { compress: 0.7, format: ImageManipulator.SaveFormat.JPEG },
          );

          const response = await fetch(manipulated.uri);
          const blob = await response.blob();

          const key = `public/orders/${courierId}/${stage}/photos/${Crypto.randomUUID()}.jpg`;

          const result = await uploadData({
            path: key,
            data: blob,
            options: { contentType: "image/jpeg" },
          }).result;

          uploadedPhotos.push(result.path);

          uploadedCount++;
          reportProgress(); // 👈 UPDATE
        } catch (err) {
          console.log("Photo upload failed:", err);
        }
      }
    }

    /**
     * 🎥 UPLOAD VIDEO (FINAL STEP)
     */
    let uploadedVideo = null;

    if (video?.uri) {
      try {
        const response = await fetch(video.uri);
        const blob = await response.blob();

        const key = `public/orders/${courierId}/${stage}/video/${Crypto.randomUUID()}.mp4`;

        const result = await uploadData({
          path: key,
          data: blob,
          options: { contentType: "video/mp4" },
        }).result;

        uploadedVideo = result.path;

        uploadedCount++;
        reportProgress(); // 👈 UPDATE
      } catch (err) {
        console.log("Video upload failed:", err);
      }
    }

    /**
     * 💾 SAVE FINAL DATA
     */
    await DataStore.save(
      Order.copyOf(await DataStore.query(Order, order.id), (updated) => {
        updated[photoField] = [
          ...(updated[photoField] || []),
          ...(uploadedPhotos || []),
        ];

        updated[videoField] = uploadedVideo || updated[videoField];

        updated[localPhotoField] = null;
        updated[localVideoField] = null;

        updated[statusField] = StatusEnum.COMPLETE;
      }),
    );

    console.log("✅ Courier evidence uploaded:", stage);

    // ✅ SUCCESS → complete + reset
    if (onProgress) {
      onProgress(100);

      setTimeout(() => {
        onProgress(0);
      }, 1000);
    }
  } catch (error) {
    console.log("❌ Courier upload failed:", error);

    await DataStore.save(
      Order.copyOf(await DataStore.query(Order, order.id), (updated) => {
        updated[statusField] = StatusEnum.FAILED;
      }),
    );

    // ✅ ALSO reset on failure
    if (onProgress) {
      onProgress(0);
    }
  }
};
