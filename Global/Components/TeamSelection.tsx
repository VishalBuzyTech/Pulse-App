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

interface DropdownItem {
  _id: string;  // Change 'id' to '_id'
  team_name: string;
  sub_teams?: DropdownItem[];
}

interface TeamSelectionProps {
  visible: boolean;
  onClose: () => void;
  teams: DropdownItem[];  
  checkedTeams: { [key: string]: boolean };
   toggleCheckbox: (id: string, teamName: string) => void;  
}

const TeamSelection: React.FC<TeamSelectionProps> = ({
  visible,
  onClose,
  teams,
  checkedTeams,
  toggleCheckbox,
}) => {

  console.log(teams, 'teamsteamsteamsteams');  

  const renderTeamItem = (team: DropdownItem) => (
    <View key={team._id} style={{ marginBottom: 10 }}>
      <TouchableOpacity
        style={styles.checkboxContainer}
        onPress={() => toggleCheckbox(team._id, team.team_name)}  
      >
        <Checkbox
          status={checkedTeams[team._id] ? "checked" : "unchecked"}  
          onPress={() => toggleCheckbox(team._id, team.team_name)}  
          color="#3F8CFF"
          uncheckedColor="#A0A0A0"
        />
        <Text style={styles.checkboxText}>{team.team_name}</Text>
      </TouchableOpacity>
    </View>
  );

  if (!visible) return null;

  return (
    <TouchableOpacity style={styles.overlay} onPress={onClose} activeOpacity={1}>
      <BlurView style={styles.blurView} intensity={200} tint="dark">
        <Animated.View style={styles.modal}>
          <ScrollView contentContainerStyle={styles.dropdownMenu}>
            {teams.map(renderTeamItem)} 
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
  dropdownMenu: {
    width: "100%",
  },
  checkboxContainer: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 5,
  },
  checkboxText: {
    paddingLeft: 10,
    fontSize: 16,
    color: "#333",
  },
});

export default TeamSelection;
