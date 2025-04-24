import React, { useEffect, useRef, useState } from "react";
import {
  Dimensions,
  StyleSheet,
  View,
  Text,
  Image,
  TouchableOpacity,
  TextInput,
  Platform,
  ScrollView,
  Modal,
} from "react-native";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
} from "react-native-reanimated";
import { BlurView } from "expo-blur";
import store, { RootState } from "../../utils/store";
import DateTimePicker from "@react-native-community/datetimepicker";
// import DatePicker from "react-datepicker";
// import "react-datepicker/dist/react-datepicker.css";
import { useSelector } from "react-redux";
import { getRemark, saveRemark } from "./RemiderServices";
import { globalStyles } from "../../GlobalCss/GlobalStyles";
import Icon from "react-native-vector-icons/Ionicons";

interface RemarkPop {
  visible: boolean;
  onClose: () => void;
  onSubmit: (newRemark: any) => void;
  selectedCardDataShow: any;
}

const { height: screenHeight } = Dimensions.get("window");

const RemarkPop: React.FC<RemarkPop> = ({
  visible,
  onClose,
  onSubmit,
  selectedCardDataShow,
}) => {
  const translateY = useSharedValue(visible ? 0 : screenHeight);
  const {
    leadData,
    myLeadData,
    myLeadProspectShow,
    myLeadOpportunity,
    myLeadClosure,
    teamLeadData,
  } = useSelector((state: RootState) => state.auth);
  const [title, setTitle] = useState("");
  const [note, setNote] = useState("");
  const [date, setDate] = useState(new Date());
  const [show, setShow] = useState(false);
  const [formattedDate, setFormattedDate] = useState("");
  const [newRemark, setNewRemak] = useState([]);
  const inputRef = useRef<TextInput>(null);
  const userId = store.getState().auth.userId;

  useEffect(() => {
    if (visible) {
      setTitle("");
      setNote("");
      setDate(new Date());
      setShow(false);

      translateY.value = withSpring(0, {
        damping: 15,
        stiffness: 100,
      });

      setTimeout(() => {
        setShow(true);
        inputRef.current?.focus();
      }, 300);
    } else {
      translateY.value = withSpring(screenHeight);
    }
  }, [visible]);

  const submitRemark = async () => {
    let leadIdDynamic = "";

    switch (selectedCardDataShow) {
      case 1:
        leadIdDynamic = leadData?._id;
        break;
      case 3:
        leadIdDynamic = myLeadData?._id;
        break;
      case 4:
        leadIdDynamic = myLeadProspectShow?._id;
        break;
      case 5:
        leadIdDynamic = myLeadOpportunity?._id;
        break;
      case 6:
        leadIdDynamic = myLeadClosure?._id;
        break;
      case 7:
        leadIdDynamic = teamLeadData?._id;
        break;
      default:
        console.warn(
          "Invalid selectedCardDataShow value:",
          selectedCardDataShow
        );
        return;
    }

    if (!leadIdDynamic) {
      console.warn(
        "Lead ID not found for selectedCardDataShow:",
        selectedCardDataShow
      );
      return;
    }

    const body = {
      leadId: leadIdDynamic,
      userId,
      title,
      notes: note,
      date: new Date().toLocaleDateString(),
      time: new Date().toLocaleTimeString(),
    };

    try {
      const newRemark = await saveRemark(body);
      const response = await getRemark(leadIdDynamic);
      setNewRemak(response.data);
      onSubmit(newRemark);
      onClose();
    } catch (error) {
      console.error("Error saving remark:", error);
    }
  };

  const onChange = (date: Date) => {
    setDate(date);
    const formatted =
      date.toLocaleDateString("en-GB") +
      " " +
      date.toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
      });
    setFormattedDate(formatted);
    setShow(false);
  };

  const showDatePicker = () => {
    setShow(!show);
  };

  const animatedStyle = useAnimatedStyle(() => {
    return {
      transform: [{ translateY: translateY.value }],
    };
  });

  return (
    <>
      {visible && (
        <Modal animationType="fade" transparent={true}   onRequestClose={() => onClose}>
          <BlurView
            style={styles.blurView}>
            <TouchableOpacity style={styles.overlay} onPress={onClose}>
              <Animated.View style={[styles.container, animatedStyle]}>
                <TouchableOpacity activeOpacity={1} style={styles.modalContent}>
                  <TouchableOpacity onPress={onClose} style={styles.closeIcon}>
                    <Icon name="close" size={24} color="#fff" />
                  </TouchableOpacity>
                  <ScrollView contentContainerStyle={styles.scrollContent}>
                    <View style={styles.containerdiv}>
                      <Text
                        style={[
                          globalStyles.h4,
                          globalStyles.fs1,
                          styles.header,
                        ]}
                        allowFontScaling={false}
                      >
                        Add Note
                      </Text>
                      <Text
                        style={[
                          globalStyles.h8,
                          globalStyles.fs1,
                          styles.header,
                        ]}
                        allowFontScaling={false}
                      >
                        Note : Notes help you remember important details about
                        your leads
                      </Text>
                      <View style={styles.inputContainer}>
                        <Text
                          style={[
                            globalStyles.h7,
                            globalStyles.fs1,
                            styles.header,
                          ]}
                          allowFontScaling={false}
                        >
                          Note
                        </Text>
                        {show && (
                          <TouchableOpacity
                            style={styles.inputWithIconContainer}
                            activeOpacity={0.8}
                            onPress={() => inputRef.current?.focus()}
                          >
                            <View style={styles.inputWithIconContainer}>
                              <TextInput
                                // ref={inputRef}
                                style={[
                                  styles.inputValue,
                                  globalStyles.h7,
                                  { height: 80 },
                                ]}
                                multiline={true}
                                placeholder="Enter Note"
                                value={note}
                                onChangeText={setNote}
                              />
                            </View>
                          </TouchableOpacity>
                        )}
                      </View>
                    </View>
                    <TouchableOpacity
                      style={styles.submitButton}
                      onPress={submitRemark}
                    >
                      <Text style={styles.submitButtonText}>Submit</Text>
                    </TouchableOpacity>
                  </ScrollView>
                </TouchableOpacity>
              </Animated.View>
            </TouchableOpacity>
          </BlurView>
        </Modal>
      )}
    </>
  );
};

const styles = StyleSheet.create({
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
    backgroundColor: "rgba(0, 0, 0, 0.66)"
  },
  overlay: {
    flex: 1,
    width: "100%",
    height: "100%",
    justifyContent: "flex-end",
  },
  container: {
    width: "100%",
    height: "50%",
    backgroundColor: "white",
    borderTopLeftRadius: 10,
    borderTopRightRadius: 10,
    elevation: 5,
  },
  modalContent: {
    flex: 1,
    padding: 10,
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: "space-between",
  },
  containerdiv: {
    flex: 1,
    padding: 10,
    backgroundColor: "#fff",
  },
  header: {
    marginBottom: 5,
  },
  inputContainer: {
    paddingTop: 15,
  },
  inputWithIconContainer: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 5,
  },
  inputValueWithIcon: {
    flex: 1,
    borderWidth: 0,
    paddingLeft: 40,
    height: 35,
  },
  iconInsideInput: {
    position: "absolute",
    left: 10,
    width: 20,
    height: 20,
    tintColor: "#888",
  },
  inputTitle: {
    fontSize: 12,
    color: "#555",
    marginBottom: 8,
  },
  inputValue: {
    flex: 1,
    height: 35,
    textAlignVertical: "top",
  },
  submitButton: {
    backgroundColor: "#4A6EF5",
    padding: 16,
    alignItems: "center",
    borderRadius: 8,
    marginBottom: 20,
    alignSelf: "center",
    width: "100%",
  },
  submitButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
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

export default RemarkPop;
