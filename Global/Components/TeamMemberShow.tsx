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
import { Checkbox } from "react-native-paper";

interface Member {
  id: string;
  label: string;
  selected: boolean;
}

interface TeamMemberShowProps {
  visible: boolean;
  onClose: () => void;
  members: Member[];
  toggleMemberSelection: (id: string) => void;
}

const TeamMemberShow: React.FC<TeamMemberShowProps> = ({
  visible,
  onClose,
  members,
  toggleMemberSelection,
}) => {
  if (!visible) return null;

  return (
    <TouchableOpacity style={styles.overlay} onPress={onClose} activeOpacity={1}>
      <BlurView style={styles.blurView} intensity={200} tint="light">
        <Animated.View style={styles.modal}>
          <ScrollView>
            {members.map((member) => (
              <TouchableOpacity
                key={member.id}
                onPress={() => toggleMemberSelection(member.id)}
              >
                <View style={styles.memberRow}>
                  <View style={{ transform: [{ scale: 0.8 }] }}>
                    <Checkbox
                      status={member.selected ? "checked" : "unchecked"}
                      color="#3F8CFF"
                      uncheckedColor="#A0A0A0"
                    />
                  </View>
                  <Text style={styles.memberLabel}>{member.label}</Text>
                </View>
              </TouchableOpacity>
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
  memberRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 10,
  },
  memberLabel: {
    marginLeft: 10,
    fontSize: 16,
  },
});

export default TeamMemberShow;
