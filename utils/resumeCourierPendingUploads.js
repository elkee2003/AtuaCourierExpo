import {
  CourierPostLoadingUploadStatus,
  CourierPreTransferUploadStatus,
  DropoffUploadStatus,
  Order,
} from "@/src/models";

import { DataStore } from "aws-amplify/datastore";
import { uploadCourierEvidence } from "./uploadCourierEvidence";

let recoveryInProgress = false;

const RECOVERABLE_STATUSES = ["PENDING", "FAILED", "UPLOADING"];

const STAGES = [
  {
    name: "PRE_TRANSFER",
    statusField: "courierPreTransferUploadStatus",
    StatusEnum: CourierPreTransferUploadStatus,
    localPhotoField: "courierPreTransferLocalPhotos",
    localVideoField: "courierPreTransferLocalVideo",
    remotePhotoField: "courierPreTransferPhotos",
    remoteVideoField: "courierPreTransferVideo",
  },
  {
    name: "POST_LOADING",
    statusField: "courierPostLoadingUploadStatus",
    StatusEnum: CourierPostLoadingUploadStatus,
    localPhotoField: "courierPostLoadingLocalPhotos",
    localVideoField: "courierPostLoadingLocalVideo",
    remotePhotoField: "courierPostLoadingPhotos",
    remoteVideoField: "courierPostLoadingVideo",
  },
  {
    name: "DROPOFF",
    statusField: "dropoffUploadStatus",
    StatusEnum: DropoffUploadStatus,
    localPhotoField: "dropoffArrivalLocalPhotos",
    localVideoField: "dropoffArrivalLocalVideo",
    remotePhotoField: "dropoffArrivalPhotos",
    remoteVideoField: "dropoffArrivalVideo",
  },
];

export const resumeCourierPendingUploads = async (courierId) => {
  if (!courierId || recoveryInProgress) return;

  recoveryInProgress = true;

  try {
    // Only retrieve orders assigned to this courier.
    const orders = await DataStore.query(Order, (order) =>
      order.assignedCourierId.eq(courierId),
    );

    for (const order of orders) {
      for (const stage of STAGES) {
        const status = order[stage.statusField];

        const shouldRecover = RECOVERABLE_STATUSES.some(
          (value) => value === status,
        );

        if (!shouldRecover) continue;

        const localPhotos = order[stage.localPhotoField] || [];
        const localVideo = order[stage.localVideoField];

        const hasLocalMedia = localPhotos.length > 0 || Boolean(localVideo);

        if (hasLocalMedia) {
          const photos = localPhotos.map((uri) => ({ uri }));
          const video = localVideo ? { uri: localVideo } : null;

          console.log(
            `Retrying ${stage.name} evidence upload for order ${order.id}`,
          );

          await uploadCourierEvidence(
            order,
            photos,
            video,
            stage.name,
            courierId,
          );

          continue;
        }

        // No local files remain. Only mark COMPLETE if remote evidence exists.
        const hasRemoteMedia =
          (order[stage.remotePhotoField] || []).length > 0 ||
          Boolean(order[stage.remoteVideoField]);

        if (hasRemoteMedia) {
          const latestOrder = await DataStore.query(Order, order.id);

          if (latestOrder) {
            await DataStore.save(
              Order.copyOf(latestOrder, (updated) => {
                updated[stage.statusField] = stage.StatusEnum.COMPLETE;
              }),
            );
          }
        } else {
          console.warn(
            `Cannot recover ${stage.name} for order ${order.id}: ` +
              "no local media or uploaded evidence paths are available.",
          );
        }
      }
    }

    console.log("Courier upload recovery finished.");
  } catch (error) {
    console.error("Courier upload recovery error:", error);
  } finally {
    recoveryInProgress = false;
  }
};
