import React from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
} from "react-native";
import { BlurView } from "expo-blur";
import Animated from "react-native-reanimated";

interface SubStage {
  _id: string;
  stage_Name: string;
}

interface Stage {
  _id: string;
  stage_Name: string;
  sub_Stage_name?: SubStage[];
}

interface TeamStatusProps {
  visible: boolean;
  onClose: () => void;
  allStageData: Stage[];
  handleSubStageSelect: (subStageName: string) => void;
}

const TeamStatus: React.FC<TeamStatusProps> = ({
  visible,
  onClose,
  allStageData,
  handleSubStageSelect,
}) => {
  if (!visible) return null;

  return (
    <TouchableOpacity style={styles.overlay} onPress={onClose} activeOpacity={1}>
      <BlurView style={styles.blurView} intensity={700} tint="dark">
        <Animated.View style={styles.modal}>
          <ScrollView>
            {allStageData.map((stage) => (
              <View key={stage._id} style={{ marginBottom: 10 }}>
                <View style={{ flexDirection: "row", alignItems: "center" }}>
                  <Text
                    style={[styles.stageName, { paddingBottom: 5 }]}
                    allowFontScaling={false}
                  >
                    {stage.stage_Name}
                  </Text>
                </View>

                {stage.sub_Stage_name?.map((subStage) => (
                  <View key={subStage._id} style={styles.subStageRow}>
                    <TouchableOpacity
                      onPress={() => handleSubStageSelect(subStage.stage_Name)}
                    >
                      <Text style={styles.subStageName} allowFontScaling={false}>
                        {subStage.stage_Name}
                      </Text>
                    </TouchableOpacity>
                  </View>
                ))}
              </View>
            ))}
          </ScrollView>
        </Animated.View>
      </BlurView>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  overlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 1000,
  },
  blurView: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: "center",
    alignItems: "center",
  },
  modal: {
    backgroundColor: "#FFFFFF",
    borderRadius: 8,
    padding: 16,
    width: 320,
    maxHeight: 500,
    elevation: 10,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
  },
  stageName: {
    fontSize: 18,
    color: "#333",
    fontWeight: "bold",
  },
  subStageRow: {
    flexDirection: "row",
    paddingLeft: 20,
    paddingVertical: 5,
  },
  subStageName: {
    fontSize: 16,
    color: "#555",
    paddingVertical: 4,
    paddingHorizontal: 8,
  },
});

export default TeamStatus;
