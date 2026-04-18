import { useAuthContext } from "@/providers/AuthProvider";
import { useOrderContext } from "@/providers/OrderProvider";
import { uploadCourierEvidence } from "@/utils/uploadCourierEvidence";
import Ionicons from "@expo/vector-icons/Ionicons";
import { useState } from "react";
import { Image, Modal, Text, TouchableOpacity, View } from "react-native";
import CameraCapture from "../CameraCapture";
import MediaPreviewModal from "../MediaPreviewModal/MediaPreviewModal";
import VideoThumbnail from "./VideoThumbnail";

export default function OrderEvidenceUploader({ order }) {
  const {
    courierPreTransferPhotos,
    setCourierPreTransferPhotos,
    courierPreTransferVideo,
    setCourierPreTransferVideo,

    courierPostLoadingPhotos,
    setCourierPostLoadingPhotos,
    courierPostLoadingVideo,
    setCourierPostLoadingVideo,

    dropoffArrivalPhotos,
    setDropoffArrivalPhotos,
    dropoffArrivalVideo,
    setDropoffArrivalVideo,

    uploadProgress,
    setUploadProgress,
  } = useOrderContext();

  const { dbCourier } = useAuthContext();

  const [showCamera, setShowCamera] = useState(false);
  const [cameraMode, setCameraMode] = useState(null);

  const [previewVisible, setPreviewVisible] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(0);

  /** =========================
   * STAGE DETECTION
   ========================== */

  const isPreTransferStage =
    order.transportationType === "MAXI" && order.status === "ARRIVED_PICKUP";

  const isPostLoadingStage =
    order.transportationType === "MAXI" && order.status === "LOADING";

  const isDropoffStage =
    order.transportationType === "MAXI" && order.status === "UNLOADING";

  // ❗ Don't render at all if not needed
  if (!isPreTransferStage && !isPostLoadingStage && !isDropoffStage) {
    return null;
  }

  // 🔥 move this BELOW stage detection (important fix)
  const progress = isPreTransferStage
    ? uploadProgress.PRE_TRANSFER
    : isPostLoadingStage
      ? uploadProgress.POST_LOADING
      : isDropoffStage
        ? uploadProgress.DROPOFF
        : 0;

  /* =========================
   STATUS CONFIG (🔥 NEW)
========================== */

  const uploadStatus = isPreTransferStage
    ? order.courierPreTransferUploadStatus
    : isPostLoadingStage
      ? order.courierPostLoadingUploadStatus
      : isDropoffStage
        ? order.dropoffUploadStatus
        : null;

  const getStatus = () => {
    if (uploadStatus === "FAILED") {
      return { label: "Failed", color: "#DC2626" };
    }

    if (progress > 0 && progress < 100) {
      return { label: "Uploading", color: "#2563EB" };
    }

    if (uploadStatus === "COMPLETE") {
      return { label: "Completed", color: "#16A34A" };
    }

    return { label: "Pending", color: "#64748B" };
  };

  const status = getStatus();

  /** =========================
   * DYNAMIC SOURCE (🔥 FIX)
   ========================== */

  const photos = isPreTransferStage
    ? courierPreTransferPhotos
    : isPostLoadingStage
      ? courierPostLoadingPhotos
      : isDropoffStage
        ? dropoffArrivalPhotos
        : [];

  const setPhotos = isPreTransferStage
    ? setCourierPreTransferPhotos
    : isPostLoadingStage
      ? setCourierPostLoadingPhotos
      : isDropoffStage
        ? setDropoffArrivalPhotos
        : () => {};

  const video = isPreTransferStage
    ? courierPreTransferVideo
    : isPostLoadingStage
      ? courierPostLoadingVideo
      : isDropoffStage
        ? dropoffArrivalVideo
        : null;

  const setVideo = isPreTransferStage
    ? setCourierPreTransferVideo
    : isPostLoadingStage
      ? setCourierPostLoadingVideo
      : isDropoffStage
        ? setDropoffArrivalVideo
        : () => {};

  /** =========================
   * HANDLERS
   ========================== */

  const handlePhotoCaptured = (photo) => {
    setPhotos((prev) => [...(prev || []), photo]);
  };

  const handleVideoCaptured = (vid) => {
    setVideo(vid);
  };

  /** =========================
   * LABEL
   ========================== */

  const getTitle = () => {
    if (isPreTransferStage) return "Pickup Evidence";
    if (isPostLoadingStage) return "Loading Evidence";
    if (isDropoffStage) return "Dropoff Evidence";
    return "Evidence";
  };

  /** =========================
   * RENDER
   ========================== */

  return (
    <View style={styles.container}>
      {/* HEADER */}
      <View style={styles.header}>
        <View>
          <Text style={styles.title}>{getTitle()}</Text>
          <Text style={styles.subtitle}>Add photos or video (optional)</Text>
        </View>

        <View
          style={[styles.statusBadge, { backgroundColor: status.color + "15" }]}
        >
          <Text style={[styles.statusText, { color: status.color }]}>
            {status.label}
          </Text>
        </View>
      </View>

      {/* PROGRESS BAR */}
      {progress > 0 && progress < 100 && (
        <View style={styles.progressContainer}>
          <View style={styles.progressTrack}>
            <View style={[styles.progressFill, { width: `${progress}%` }]} />
          </View>

          <Text style={styles.progressText}>{progress}%</Text>
        </View>
      )}

      {progress === 100 && (
        <Text style={{ marginTop: 8, color: "green" }}>Upload complete</Text>
      )}

      {/* ACTION BUTTONS */}
      <View style={styles.actions}>
        <TouchableOpacity
          style={styles.primaryBtn}
          onPress={() => {
            setCameraMode("photo");
            setShowCamera(true);
          }}
          disabled={progress > 0 && progress < 100}
        >
          <Ionicons name="camera" size={18} color="#fff" />
          <Text style={styles.primaryText}>Capture Photo</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.secondaryBtn}
          onPress={() => {
            setCameraMode("video");
            setShowCamera(true);
          }}
          disabled={progress > 0 && progress < 100}
        >
          <Ionicons name="videocam" size={18} color="#111" />
          <Text style={styles.secondaryText}>
            {video ? "Re-record Video" : "Record Video"}
          </Text>
        </TouchableOpacity>
      </View>

      {/* PHOTOS */}
      {(photos || []).length > 0 ? (
        <View style={styles.mediaGrid}>
          {photos.map((p, index) => (
            <TouchableOpacity
              key={index}
              style={styles.imageWrapper}
              onPress={() => {
                setSelectedIndex(index);
                setPreviewVisible(true);
              }}
            >
              <Image source={{ uri: p.uri }} style={styles.previewImage} />
            </TouchableOpacity>
          ))}
        </View>
      ) : (
        <Text style={styles.emptyText}>No photos captured yet</Text>
      )}

      {/* VIDEO */}
      {video?.uri && (
        <TouchableOpacity
          style={styles.videoCard}
          onPress={() => {
            setSelectedIndex((photos || []).length);
            setPreviewVisible(true);
          }}
        >
          <VideoThumbnail uri={video.uri} style={styles.videoThumbnail} />
          <View style={styles.playOverlay}>
            <Ionicons name="play" size={28} color="#fff" />
          </View>
        </TouchableOpacity>
      )}

      {uploadStatus === "FAILED" && (
        <View style={{ marginTop: 10 }}>
          <Text style={{ color: "red", marginBottom: 6 }}>
            Upload failed. Please retry.
          </Text>

          <TouchableOpacity
            style={{
              backgroundColor: "#DC2626",
              padding: 10,
              borderRadius: 6,
            }}
            onPress={async () => {
              const stageKey = isPreTransferStage
                ? "PRE_TRANSFER"
                : isPostLoadingStage
                  ? "POST_LOADING"
                  : "DROPOFF";

              const retryPhotos = (photos || []).map((p) => ({ uri: p.uri }));
              const retryVideo = video?.uri ? { uri: video.uri } : null;

              await uploadCourierEvidence(
                order,
                retryPhotos,
                retryVideo,
                stageKey,
                dbCourier.id,
                (progress) => {
                  setUploadProgress((prev) => ({
                    ...prev,
                    [stageKey]: progress,
                  }));
                },
              );
            }}
          >
            <Text style={{ color: "#fff", textAlign: "center" }}>
              Retry Upload
            </Text>
          </TouchableOpacity>
        </View>
      )}

      {/* CAMERA */}
      <Modal visible={showCamera} animationType="slide">
        <CameraCapture
          mode={cameraMode}
          onClose={() => setShowCamera(false)}
          onPhotoCaptured={handlePhotoCaptured}
          onVideoCaptured={handleVideoCaptured}
        />
      </Modal>

      {/* PREVIEW */}
      <MediaPreviewModal
        visible={previewVisible}
        mediaList={[
          ...(photos || []).map((p) => ({ ...p, type: "photo" })),
          ...(video ? [{ ...video, type: "video" }] : []),
        ]}
        initialIndex={selectedIndex}
        onClose={() => setPreviewVisible(false)}
        onDelete={(index) => {
          const updated = [...(photos || [])];

          if (index < updated.length) {
            updated.splice(index, 1);
            setPhotos(updated);
          } else {
            setVideo(null);
          }
        }}
      />
    </View>
  );
}
