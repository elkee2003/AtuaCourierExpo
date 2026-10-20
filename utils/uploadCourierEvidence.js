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

const STAGES = {
  PRE_TRANSFER: {
    photoField: "courierPreTransferPhotos",
    videoField: "courierPreTransferVideo",
    localPhotoField: "courierPreTransferLocalPhotos",
    localVideoField: "courierPreTransferLocalVideo",
    statusField: "courierPreTransferUploadStatus",
    StatusEnum: CourierPreTransferUploadStatus,
  },
  POST_LOADING: {
    photoField: "courierPostLoadingPhotos",
    videoField: "courierPostLoadingVideo",
    localPhotoField: "courierPostLoadingLocalPhotos",
    localVideoField: "courierPostLoadingLocalVideo",
    statusField: "courierPostLoadingUploadStatus",
    StatusEnum: CourierPostLoadingUploadStatus,
  },
  DROPOFF: {
    photoField: "dropoffArrivalPhotos",
    videoField: "dropoffArrivalVideo",
    localPhotoField: "dropoffArrivalLocalPhotos",
    localVideoField: "dropoffArrivalLocalVideo",
    statusField: "dropoffUploadStatus",
    StatusEnum: DropoffUploadStatus,
  },
};

const getCurrentOrder = async (orderId) => {
  const currentOrder = await DataStore.query(Order, orderId);

  if (!currentOrder) {
    throw new Error(`Order ${orderId} could not be found.`);
  }

  return currentOrder;
};

const uploadCourierPhotos = async (
  photos,
  courierId,
  stage,
  onItemUploaded,
) => {
  const uploadedPaths = [];

  for (const photo of photos) {
    if (!photo?.uri) {
      throw new Error("A courier photo is missing its local URI.");
    }

    const manipulated = await ImageManipulator.manipulateAsync(
      photo.uri,
      [{ resize: { width: 900 } }],
      {
        compress: 0.7,
        format: ImageManipulator.SaveFormat.JPEG,
      },
    );

    const response = await fetch(manipulated.uri);
    const blob = await response.blob();

    const path = `public/orders/${courierId}/${stage}/photos/${Crypto.randomUUID()}.jpg`;

    const result = await uploadData({
      path,
      data: blob,
      options: { contentType: "image/jpeg" },
    }).result;

    if (!result?.path) {
      throw new Error("Photo upload did not return a storage path.");
    }

    uploadedPaths.push(result.path);
    onItemUploaded();
  }

  return uploadedPaths;
};

const uploadCourierVideo = async (video, courierId, stage, onItemUploaded) => {
  if (!video?.uri) return null;

  const response = await fetch(video.uri);
  const blob = await response.blob();

  const path = `public/orders/${courierId}/${stage}/video/${Crypto.randomUUID()}.mp4`;

  const result = await uploadData({
    path,
    data: blob,
    options: { contentType: "video/mp4" },
  }).result;

  if (!result?.path) {
    throw new Error("Video upload did not return a storage path.");
  }

  onItemUploaded();
  return result.path;
};

export const uploadCourierEvidence = async (
  order,
  photos,
  video,
  stage,
  courierId,
  onProgress,
) => {
  if (!order?.id || !courierId) {
    console.error("Courier upload requires an order and courier ID.");
    return false;
  }

  const config = STAGES[stage];

  if (!config) {
    console.error("Invalid courier evidence stage:", stage);
    return false;
  }

  const safePhotos = photos || [];
  const hasPhotos = safePhotos.length > 0;
  const hasVideo = Boolean(video?.uri);

  if (!hasPhotos && !hasVideo) {
    return true;
  }

  const {
    photoField,
    videoField,
    localPhotoField,
    localVideoField,
    statusField,
    StatusEnum,
  } = config;

  const totalItems = safePhotos.length + (hasVideo ? 1 : 0);
  let uploadedCount = 0;

  const reportProgress = () => {
    if (typeof onProgress !== "function" || totalItems === 0) return;

    onProgress(Math.round((uploadedCount / totalItems) * 100));
  };

  const onItemUploaded = () => {
    uploadedCount += 1;
    reportProgress();
  };

  try {
    // Save the status before uploading. Keep the local files for recovery.
    const currentOrder = await getCurrentOrder(order.id);

    await DataStore.save(
      Order.copyOf(currentOrder, (updated) => {
        updated[statusField] = StatusEnum.UPLOADING;
        updated[localPhotoField] = safePhotos.map((photo) => photo.uri);
        updated[localVideoField] = video?.uri || null;
      }),
    );

    // Any individual upload failure stops this stage from being marked COMPLETE.
    const uploadedPhotos = await uploadCourierPhotos(
      safePhotos,
      courierId,
      stage,
      onItemUploaded,
    );

    const uploadedVideo = await uploadCourierVideo(
      video,
      courierId,
      stage,
      onItemUploaded,
    );

    if (uploadedPhotos.length !== safePhotos.length) {
      throw new Error("Not all courier photos were uploaded.");
    }

    if (hasVideo && !uploadedVideo) {
      throw new Error("The courier video was not uploaded.");
    }

    // Reload the order to avoid saving over a stale DataStore record.
    const latestOrder = await getCurrentOrder(order.id);

    await DataStore.save(
      Order.copyOf(latestOrder, (updated) => {
        // Keep evidence already saved from earlier successful uploads.
        updated[photoField] = [
          ...(updated[photoField] || []),
          ...uploadedPhotos,
        ];

        if (uploadedVideo) {
          updated[videoField] = uploadedVideo;
        }

        // Clear recovery paths only after every file succeeds.
        updated[localPhotoField] = null;
        updated[localVideoField] = null;
        updated[statusField] = StatusEnum.COMPLETE;
      }),
    );

    console.log(`Courier evidence upload complete: ${stage}`, order.id);

    if (typeof onProgress === "function") {
      onProgress(100);
    }

    return true;
  } catch (error) {
    console.error(`Courier evidence upload failed: ${stage}`, order.id, error);

    // Keep the local paths intact so recovery can retry.
    try {
      const latestOrder = await getCurrentOrder(order.id);

      await DataStore.save(
        Order.copyOf(latestOrder, (updated) => {
          updated[statusField] = StatusEnum.FAILED;
        }),
      );
    } catch (saveError) {
      console.error(
        "Could not save courier upload failure status:",
        order.id,
        saveError,
      );
    }

    if (typeof onProgress === "function") {
      onProgress(0);
    }

    return false;
  }
};
