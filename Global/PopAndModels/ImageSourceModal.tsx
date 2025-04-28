import React, { useState, useEffect } from "react";
import {
  View,
  TouchableOpacity,
  Text,
  StyleSheet,
  TouchableWithoutFeedback,
  Dimensions,
} from "react-native";
import { FontAwesome } from "@expo/vector-icons";
import * as ImagePicker from "expo-image-picker";
import { BlurView } from "expo-blur";
import Icon from "react-native-vector-icons/Ionicons";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
} from "react-native-reanimated";

const { height: screenHeight } = Dimensions.get('window');

const ImageSourceModal = ({
  isVisible,
  onClose,
  onImageSelect,
  mode = "modal",
}) => {
  const [isBottomSheet, setIsBottomSheet] = useState(mode === "bottomSheet");

  const translateY = useSharedValue(screenHeight); 

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: translateY.value }],
  }));

  useEffect(() => {
    if (isVisible) {
      translateY.value = withSpring(0, {
        damping: 15,
        stiffness: 100,
      });
    } else {
      translateY.value = withSpring(screenHeight, {
        damping: 15,
        stiffness: 100,
      });
    }
  }, [isVisible]);

  const handleCamera = async () => {
    try {
      const cameraResult = await ImagePicker.launchCameraAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        quality: 1,
      });

      if (!cameraResult.canceled && cameraResult.assets?.length > 0) {
        const imageUri = cameraResult.assets[0].uri;
        onImageSelect(imageUri, "camera");
      }
    } catch (error) {
      console.error("Error while opening camera:", error);
    }
  };

  const handleGallery = async () => {
    try {
      const galleryResult = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        quality: 1,
      });

      if (!galleryResult.canceled && galleryResult.assets?.length > 0) {
        const imageUri = galleryResult.assets[0].uri;
        onImageSelect(imageUri, "gallery");
      }
    } catch (error) {
      console.error("Error while opening gallery:", error);
    }
  };

  if (!isVisible) return null;

  return (
    <TouchableWithoutFeedback onPress={onClose}>
      <BlurView intensity={100} tint="dark" style={styles.blurView}>
        <TouchableWithoutFeedback>
          <Animated.View
            style={[
              styles.modalContainer,
              isBottomSheet ? styles.bottomSheetContainer : null,
              animatedStyle,
            ]}
          >
            <TouchableOpacity onPress={onClose} style={styles.closeIcon}>
              <Icon name="close" size={24} color="#fff" />
            </TouchableOpacity>
            <View style={styles.iconRow}>
              <TouchableOpacity style={styles.iconButton} onPress={handleCamera}>
                <FontAwesome name="camera" size={30} color="black" />
                <Text style={styles.iconText}>Camera</Text>
              </TouchableOpacity>
            </View>
            <View style={styles.iconRow}>
              <TouchableOpacity style={styles.iconButton} onPress={handleGallery}>
                <FontAwesome name="image" size={30} color="black" />
                <Text style={styles.iconText}>Gallery</Text>
              </TouchableOpacity>
            </View>
          </Animated.View>
        </TouchableWithoutFeedback>
      </BlurView>
    </TouchableWithoutFeedback>
  );
};

const styles = StyleSheet.create({
  blurView: {
    flex: 1,
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: "flex-end",
    alignItems: "center",
  },
  modalContainer: {
    backgroundColor: "white",
    padding: 20,
    borderRadius: 10,
    width: 250,
    alignItems: "center",
  },
  bottomSheetContainer: {
    backgroundColor: "white",
    borderTopLeftRadius: 10,
    borderTopRightRadius: 10,
    height: 200,
    width: "100%",
    paddingBottom: 20,
  },
  iconRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    width: "100%",
    marginBottom: 20,
  },
  iconButton: {
    width: "100%",
    flexDirection: "row",
    alignItems: "center",
    marginHorizontal: "1%",
  },
  iconText: {
    marginLeft: 20,
    fontSize: 20,
    fontWeight: "500",
  },
  closeIcon: {
    position: "absolute",
    top: -90,
    alignSelf: "center",
    zIndex: 999,
    padding: 16,
    backgroundColor: "#000",
    borderRadius: 50,
    elevation: 3,
  },
});

export default ImageSourceModal;
