import Ionicons from "@expo/vector-icons/Ionicons";
import { Image } from "expo-image";
import { useEffect, useState } from "react";
import {
  Dimensions,
  Modal,
  StatusBar,
  TouchableOpacity,
  View,
} from "react-native";
import PagerView from "react-native-pager-view";
import { SafeAreaView } from "react-native-safe-area-context";
import VideoPlayerItem from "./VideoPlayerItem";
import styles from "./styles";

const { width, height } = Dimensions.get("window");

export default function MediaPreviewModal({
  visible,
  mediaList = [],
  initialIndex = 0,
  onClose,
}) {
  const [currentIndex, setCurrentIndex] = useState(initialIndex);

  useEffect(() => {
    setCurrentIndex(initialIndex);
  }, [initialIndex, visible]);

  return (
    <Modal visible={visible} animationType="fade" onRequestClose={onClose}>
      <View style={styles.container}>
        <StatusBar barStyle="light-content" />

        <SafeAreaView style={styles.topBar}>
          <TouchableOpacity onPress={onClose}>
            <Ionicons name="close" size={30} color="#FFF" />
          </TouchableOpacity>
        </SafeAreaView>

        <PagerView
          style={{ flex: 1 }}
          initialPage={initialIndex}
          onPageSelected={(e) => setCurrentIndex(e.nativeEvent.position)}
        >
          {mediaList.map((item, index) => (
            <View key={index} style={styles.page}>
              {item.type === "photo" ? (
                <Image
                  source={{ uri: item.uri }}
                  style={styles.fullImage}
                  contentFit="contain"
                  transition={300}
                />
              ) : (
                <VideoPlayerItem
                  uri={item.uri}
                  isActive={currentIndex === index}
                  style={styles.fullVideo}
                />
              )}
            </View>
          ))}
        </PagerView>
      </View>
    </Modal>
  );
}
