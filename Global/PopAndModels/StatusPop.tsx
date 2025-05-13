import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  Dimensions,
  TouchableOpacity,
  ScrollView,
  TouchableWithoutFeedback,
  Modal,
} from "react-native";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
} from "react-native-reanimated";
import { BlurView } from "expo-blur";
import {
  getAllStage,
  getOfficeDetails,
  getStage,
  getStageType,
} from "../../Components/Screens/LeadInfoScreenService";
import { globalStyles } from "../../GlobalCss/GlobalStyles";
import store from "../../utils/store";
import Icon from "react-native-vector-icons/Ionicons";
import { RadioButton } from "react-native-paper";

const { width: screenWidth, height: screenHeight } = Dimensions.get("window");

interface StatusPopProps {
  visible: boolean;
  onClose: () => void;
  onStatusSelect: (status: string) => void;
  selectedCardDataShow;
}

const StatusPop: React.FC<StatusPopProps> = ({
  visible,
  onClose,
  onStatusSelect,
  selectedCardDataShow,
}) => {
  const scale = useSharedValue(visible ? 1 : 0.8);
  const opacity = useSharedValue(visible ? 1 : 0);
  const translateY = useSharedValue(visible ? 0 : screenHeight);
  console.log(onStatusSelect, "onStatusSelectonStatusSelect");

  const [dropdownData, setDropdownData] = useState<any>([]);
  const [selectedStatus, setSelectedStatus] = useState<string | null>(null);
  const [userType, setUserType] = useState<string>("0");
  const [selectedSubStage, setSelectedSubStage] = useState("");

  useEffect(() => {
    if (visible) {
      getStageDataNew();

      translateY.value = withSpring(0, {
        damping: 15,
        stiffness: 100,
      });
    } else {
      translateY.value = withSpring(screenHeight);
    }
  }, [visible]);

  // useEffect(() => {
  //   scale.value = withSpring(visible ? 1 : 0.8, {
  //     damping: 20,
  //     stiffness: 150,
  //   });
  //   opacity.value = withSpring(visible ? 1 : 0, {
  //     damping: 20,
  //     stiffness: 150,
  //   });
  //   getStageDataNew();
  // }, [visible]);

  // const animatedStyle = useAnimatedStyle(() => {
  //   return {
  //     transform: [{ scale: scale.value }],
  //     opacity: opacity.value,
  //   };
  // });
  const filterStagesByIsSale = (stages: any[], isSale: number): any[] => {
    return stages
      .map((stage) => {
        const subStages = filterStagesByIsSale(
          stage.sub_Stage_name || [],
          isSale
        );
        if (
          stage.isSale === isSale ||
          stage.isSale === -1 ||
          subStages.length > 0
        ) {
          return {
            ...stage,
            sub_Stage_name: subStages,
          };
        }

        return null;
      })
      .filter((stage) => stage !== null);
  };

  const getStageDataNew = async () => {
    try {
      let type;
      switch (selectedCardDataShow) {
        case 2:
          type = "Contact";
          break;
        case 7:
          type = "Lead";
          break;
        case 4:
          type = "Prospect";
          break;
        case 5:
          type = "Opportunity";
          break;
        case 6:
          type = "Closure";
          break;
        default:
          type = "";
      }
      const resData = await getStage();
      // const resData = await getStageType(type);
      const userData = store.getState().auth.userId;
      const response = await getOfficeDetails(userData);
      console.log(response, "responseresponse");
      const teamRoleName = response.data.teamRoleName.toLowerCase();
      let filteredStageData;

      // if (teamRoleName.includes("presales")) {
      //   filteredStageData = filterStagesByIsSale(resData.data, 0);
      //   setUserType("0");
      // } else if (teamRoleName.includes("sales")) {
      //   filteredStageData = filterStagesByIsSale(resData.data, 1);
      //   setUserType("1");
      // } else {
        filteredStageData = resData.data;
      // }

      setDropdownData(filteredStageData);
    } catch (error) {
      console.error("Error fetching data:", error);
    }
  };

  const handleDropdownItemPress = (statusName: string) => {
    console.log(statusName,'statusNamestatusName');
    onStatusSelect(statusName);
    onClose();
  };

  const animatedStyle = useAnimatedStyle(() => {
    return {
      transform: [{ translateY: translateY.value }],
    };
  });

  return (
    <>
      {visible && (
        // <TouchableWithoutFeedback onPress={onClose}>
        //   <View style={styles.overlay}>
        <Modal
          animationType="fade"
          transparent={true}
          onRequestClose={() => onClose}
        >
          <BlurView style={styles.blurView}>
            <TouchableOpacity style={styles.overlay} onPress={onClose}>
              <Animated.View style={[styles.container, animatedStyle]}>
                <TouchableOpacity activeOpacity={1} style={styles.modalContent}>
                  <TouchableOpacity onPress={onClose} style={styles.closeIcon}>
                    <Icon name="close" size={24} color="#fff" />
                  </TouchableOpacity>
                  <ScrollView
                    contentContainerStyle={styles.dropdownMenu}
                    keyboardShouldPersistTaps="handled"
                  >
                    {dropdownData.map((item) => (
                      <View key={item._id}>
                        <TouchableOpacity
                        // onPress={() =>
                        //   handleDropdownItemPress(item.stage_Name)
                        // }
                        >
                          <Text
                            style={[
                              globalStyles.h5,
                              globalStyles.fs2,
                              styles.dropdownItem,
                            ]}
                            allowFontScaling={false}
                          >
                            {item.stage_Name}
                          </Text>
                        </TouchableOpacity>
                        <RadioButton.Group
                      onValueChange={(newValue) => {
                        setSelectedSubStage(newValue);
                        const selectedSubItem = item.sub_Stage_name.find(
                          (i) => i._id === newValue
                        );
                        handleDropdownItemPress(selectedSubItem.stage_Name);
                      }}
                      value={selectedSubStage}
                        >
                          {item.sub_Stage_name.map((subItem) => (
                            <TouchableOpacity
                              key={subItem._id}
                              onPress={() =>
                                handleDropdownItemPress(subItem.stage_Name)
                              }
                              style={{
                                flexDirection: "row",
                                alignItems: "center",
                                justifyContent: "space-between",
                                paddingVertical: 2,
                                paddingHorizontal:5,
                                width: "100%",
                              }}
                            >
                              <Text
                                style={[
                                  globalStyles.h8,
                                  globalStyles.fontfm,
                                  styles.dropdownItem,
                                ]}
                                allowFontScaling={false}
                              >
                                {subItem.stage_Name}
                              </Text>

                              <RadioButton.Android
                               value={subItem._id}
                               status={
                                 selectedSubStage === subItem._id ? "checked" : "unchecked"
                               }
                               onPress={() => {
                                setSelectedSubStage(subItem._id);
                                handleDropdownItemPress(subItem.stage_Name);
                              }}
                                color="#007AFF"
                                uncheckedColor="#999"
                                style={{
                                  transform: [{ scale: 0.9 }],
                                  alignSelf: "center",
                                  margin: 0,
                                }}
                              />
                            </TouchableOpacity>
                          ))}
                        </RadioButton.Group>
                      </View>
                    ))}
                  </ScrollView>
                </TouchableOpacity>
              </Animated.View>
            </TouchableOpacity>
          </BlurView>
        </Modal>
        //   </View>
        // </TouchableWithoutFeedback>
      )}
    </>
  );
};

const styles = StyleSheet.create({
  // overlay: {
  //   position: "absolute",
  //   top: 0,
  //   left: 0,
  //   right: 0,
  //   bottom: 0,
  // },
  // blurView: {
  //   ...StyleSheet.absoluteFillObject,
  //   justifyContent: "center",
  //   alignItems: "center",
  // },
  // modal: {
  //   backgroundColor: "#FFFFFF",
  //   borderRadius: 5,
  //   padding: 16,
  //   width: 300,
  //   maxHeight: 500,
  //   elevation: 10,
  //   shadowOffset: { width: 0, height: 2 },
  //   shadowOpacity: 0.3,
  //   shadowRadius: 4,
  // },
  blurView: {
    flex: 1,
    position: "absolute",
    top: 0,
    left: 0,
    zIndex: 99999,
    right: 0,
    bottom: 0,
    justifyContent: "flex-end",
    alignItems: "center",
    backgroundColor: "rgba(0, 0, 0, 0.66)",
  },
  container: {
    width: "100%",
    height: "75%",
    backgroundColor: "white",
    borderTopLeftRadius: 10,
    borderTopRightRadius: 10,
    elevation: 5,
  },
  overlay: {
    flex: 1,
    width: "100%",
    height: "100%",
    justifyContent: "flex-end",
  },
  modalContent: {
    flex: 1,
    padding: 10,
  },
  dropdownMenu: {
    width: "100%",
  },
  dropdownItem: {
    paddingVertical: 8,
  },
  subStageContainer: {
    paddingLeft: 20,
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

export default StatusPop;
