import React, { useCallback, useEffect, useMemo, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Dimensions,
  TextInput,
} from "react-native";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from "react-native-reanimated";
import { BlurView } from "expo-blur";
import { Checkbox } from "react-native-paper";
import {
  getOfficeDetails,
  getStage,
  getStageType,
} from "../../Components/Screens/LeadInfoScreenService";
import { globalStyles } from "../../GlobalCss/GlobalStyles";
import { getAllForms } from "../../Components/Screens/DashboardService";
import Feather from "react-native-vector-icons/Feather";
import { useDispatch } from "react-redux";
import { setSelectedStagesAll } from "../../Redux/authSlice";
import { useSelector } from "react-redux";
import store, { RootState } from "../../utils/store";
const { height: screenHeight } = Dimensions.get("window");

const FilterBottomSheet: React.FC<{
  visible: boolean;
  selectViewData;
  selectedStagesLocal: any[];
  selectedTab;
  onClose: () => void;
  onApplyFilters: (filters: any) => void;
}> = ({
  visible,
  onClose,
  onApplyFilters,
  selectedStagesLocal,
  selectViewData,
  selectedTab,
}) => {
  const translateY = useSharedValue(screenHeight);
  const [selectedCategory, setSelectedCategory] = useState("Stage");
  const [selectedFilters, setSelectedFilters] = useState<string[]>([]);
  const [allData, setAllData] = useState<any[]>([]);
  const [allFormData, setAllFormData] = useState<any[]>([]);
  const [value, setValue] = useState<string>("");
  const [selectedStages, setSelectedStages] =
    useState<string[]>(selectedStagesLocal);
  const dispatch = useDispatch();
  const [userType, setUserType] = useState<string>("0");
  const { selectedStagesAll, allFormShowFiter } = useSelector(
    (state: RootState) => state.auth
  );

  useEffect(() => {
    setSelectedStages(selectedStagesAll);
  }, [selectedStagesAll]);

  useEffect(() => {
    dispatch(setSelectedStagesAll(selectedStages));
  }, [selectedStages, dispatch]);
  useEffect(() => {
    translateY.value = withSpring(visible ? 0 : screenHeight, {
      damping: 15,
      stiffness: 100,
    });
  }, [visible]);
  useEffect(() => {
    setSelectedStages(selectedStagesLocal);
  }, [selectedStagesLocal]);

  useEffect(() => {
    dispatch(setSelectedStagesAll(selectedStages));
  }, [selectedStagesAll, dispatch]);

  useEffect(() => {
    fetchData();
  }, [selectedCategory]);

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

  const fetchData = async () => {
    try {
      const payload = {
        pageNo: 0,
        pageSize: 25,
        search: selectedCategory === "form" ? value : "",
      };

      let type;
      switch (selectedTab) {
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

      if (selectedCategory === "Stage") {
        // const stageData = await getStageType(type);
        const stageData = await getStage();
        const userData = store.getState().auth.userId;
        const response = await getOfficeDetails(userData);
        const teamRoleName = response.data.teamRoleName.toLowerCase();
        let filteredStageData;
        if (teamRoleName.includes("presales")) {
          filteredStageData = filterStagesByIsSale(stageData.data, 0);
          setUserType("0");
        } else if (teamRoleName.includes("sales")) {
          filteredStageData = filterStagesByIsSale(stageData.data, 1);
          setUserType("1");
        } else {
          filteredStageData = stageData.data;
        }
        setAllData(filteredStageData);
      } else if (selectedCategory === "form") {
        const formData = await getAllForms(payload);
        setAllFormData(formData.data);
      }
    } catch (error) {
      console.error(error);
    }
  };

  const memoizedFilteredData = useMemo(() => {
    if (selectedCategory === "Stage") {
      console.log(allData,'allDataallDataallData::::::::');
      
      return allData.filter((item) => item.stage_Name);
    }
    if (selectedCategory === "form") {
      return allFormData.filter((item) => item.form_Name);
    }
    return [];
  }, [selectedCategory, allData, allFormData]);

  const getAllIds = useMemo(
    () =>
      memoizedFilteredData.flatMap((item) =>
        selectedCategory === "form"
          ? item._id
          : item.sub_Stage_name?.map((sub) => sub._id) || []
      ),
    [memoizedFilteredData, selectedCategory]
  );

  const handleClearAll = () => {
    setSelectedFilters([]);
    setSelectedStages([]);
  };

  const handleSelectAll = () => {
    let allIds = [];

    if (selectedCategory === "form") {
      allIds = allFormData.map((item) => item._id);
    } else {
      allIds = memoizedFilteredData.flatMap((item) =>
        item.sub_Stage_name
          ? item.sub_Stage_name.map((subItem) => subItem._id)
          : []
      );
    }

    const isAllSelected =
      allIds.length > 0 && allIds.every((id) => selectedFilters.includes(id));
    setSelectedFilters(isAllSelected ? [] : allIds);
    setSelectedStages(isAllSelected ? [] : allIds);
  };

  const isAllSelected =
    selectedCategory === "form"
      ? allFormData.length > 0 &&
        allFormData.every((item) => selectedFilters.includes(item._id))
      : memoizedFilteredData.length > 0 &&
        memoizedFilteredData.every((item) =>
          item.sub_Stage_name
            ? item.sub_Stage_name.every((subItem) =>
                selectedFilters.includes(subItem._id)
              )
            : false
        );

  const filterOptions = [
    ...(selectViewData === 1 || selectViewData === 2
      ? []
      : [{ label: "Stage", key: "Stage" }]),
    { label: "Form", key: "form" },
    { label: "Date Range", key: "dateRange" },
  ];

  useEffect(() => {
    if (!filterOptions.find((option) => option.key === selectedCategory)) {
      setSelectedCategory("form");
    }
  }, [filterOptions]);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: translateY.value }],
  }));

  const handleSearch = (text: string) => {
    setValue(text);
    if (selectedCategory === "form") {
      fetchData();
    } else {
      const filteredItems = allData.filter((item) =>
        item.stage_Name.toLowerCase().includes(text.toLowerCase())
      );
      setAllData(filteredItems);
    }
  };

  const handleFilterSelectionStage = (subItem: any) => {
    const isSelected = selectedFilters.includes(subItem._id);
    setSelectedFilters((prev) =>
      isSelected
        ? prev.filter((id) => id !== subItem._id)
        : [...prev, subItem._id]
    );
    const updatedStages = isSelected
      ? selectedStages.filter((stage) => stage !== subItem.stage_Name)
      : [...selectedStages, subItem.stage_Name];
    setSelectedStages(updatedStages);
    dispatch(setSelectedStagesAll(updatedStages));
  };
  const handleFilterData = useCallback(() => {
    let formLead;
    let stage = selectedStages.join(",");
    if (selectedCategory === "form") {
      formLead =
        selectedFilters.length === getAllIds.length
          ? getAllIds
          : selectedFilters;
    } else if (selectedCategory === "Stage") {
    }

    onApplyFilters({ formLead, stage, selectedFilters });
    onClose();
  }, [selectedStages, selectedFilters, selectedCategory, getAllIds]);

  return (
    <>
      {visible && (
        <BlurView intensity={100} style={styles.blurView}>
          <Animated.View style={[styles.container, animatedStyle]}>
            <View style={styles.header}>
              <Text
                style={[globalStyles.h5, globalStyles.fs1, globalStyles.tc]}
                allowFontScaling={false}
              >
                Filters
              </Text>
              <TouchableOpacity onPress={handleClearAll}>
                <Text
                  style={[globalStyles.h7, globalStyles.fs3, globalStyles.tc5]}
                  allowFontScaling={false}
                >
                  Clear All
                </Text>
              </TouchableOpacity>
            </View>

            <View style={styles.rowContainer}>
              {/* Left Section */}
              <View style={styles.leftColumn}>
                {filterOptions.map((option) => (
                  <TouchableOpacity
                    key={option.key}
                    style={[
                      styles.filterItem,
                      selectedCategory === option.key &&
                        styles.selectedCategory,
                    ]}
                    onPress={() => setSelectedCategory(option.key)}
                  >
                    <Text
                      style={[
                        styles.filterText,
                        globalStyles.h7,
                        globalStyles.fs1,
                        globalStyles.tc,
                        selectedCategory === option.key && { color: "white" },
                      ]}
                      allowFontScaling={false}
                    >
                      {option.label}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>

              {/* Right Section */}
              <ScrollView style={styles.rightColumn}>
                <View style={styles.searchContainer}>
                  <View style={styles.inputContainer}>
                    <Feather
                      name="search"
                      size={15}
                      color="#888"
                      style={styles.icon}
                    />
                    <TextInput
                      style={styles.input}
                      placeholder="Search..."
                      placeholderTextColor="#888"
                      value={value}
                      onChangeText={handleSearch}
                    />
                  </View>
                </View>

                {/* Select All Checkbox */}
                {(memoizedFilteredData.length > 0 ||
                  (selectedCategory === "form" && allFormData.length > 0)) && (
                  <View>
                    <TouchableOpacity
                      onPress={handleSelectAll}
                      style={styles.selectAllRow}
                    >
                      <Checkbox
                        status={
                          isAllSelected
                            ? "checked"
                            : selectedFilters.length > 0
                            ? "indeterminate"
                            : "unchecked"
                        }
                        onPress={handleSelectAll}
                        color={isAllSelected ? "#3F8CFF" : undefined}
                        uncheckedColor="#A0A0A0"
                      />
                      <Text
                        style={[
                          globalStyles.h7,
                          globalStyles.fs1,
                          globalStyles.tc,
                        ]}
                        allowFontScaling={false}
                      >
                        Select All
                      </Text>
                    </TouchableOpacity>
                  </View>
                )}

                {/* Main List Rendering */}
                {memoizedFilteredData.length > 0 ? (
                  memoizedFilteredData.map((item) => (
                    <View key={item._id} style={{ marginTop: 10 }}>
                      <Text
                        style={[
                          globalStyles.h7,
                          globalStyles.fs1,
                          globalStyles.tc,
                        ]}
                        allowFontScaling={false}
                      >
                        {item.stage_Name ||
                          item.form_name ||
                          item.dateRange_Name}
                      </Text>

                      {item.sub_Stage_name?.length > 0 && (
                        <View>
                        {item.sub_Stage_name.map((subItem) => {
                          console.log("SubItem ID:", subItem._id);
                          console.log("Is Selected:", selectedFilters.includes(subItem._id) || selectedStagesAll.includes(subItem.stage_Name));
                    
                          return (
                            <View key={subItem._id} style={styles.checkboxRow}>
                              <View style={{ transform: [{ scale: 0.7 }] }}>
                                <Checkbox
                                  status={
                                    selectedFilters.includes(subItem._id) ||
                                    selectedStagesAll.includes(subItem.stage_Name)
                                      ? "checked"
                                      : "unchecked"
                                  }
                                  onPress={() => handleFilterSelectionStage(subItem)}
                                  color="#3F8CFF"
                                  uncheckedColor="#A0A0A0"
                                />
                              </View>
                              <TouchableOpacity onPress={() => handleFilterSelectionStage(subItem)}>
                                <Text
                                  style={[globalStyles.h8, globalStyles.fs3, globalStyles.tc]}
                                  allowFontScaling={false}
                                >
                                  {subItem.stage_Name}
                                </Text>
                              </TouchableOpacity>
                            </View>
                          );
                        })}
                      </View>
                      )}
                    </View>
                  ))
                ) : (
                  <View>
                    {selectedCategory === "dateRange" ? (
                      <Text>Date Picker</Text>
                    ) : selectedCategory === "form" ? (
                      allFormData.length > 0 ? (
                        allFormData.map((item) => (
                          <View key={item._id} style={styles.checkboxRow}>
                            <View style={{ transform: [{ scale: 0.7 }] }}>
                              <Checkbox
                                status={
                                  selectedFilters.includes(item._id)
                                    ? "checked"
                                    : "unchecked"
                                }
                                onPress={() =>
                                  setSelectedFilters((prev) =>
                                    prev.includes(item._id)
                                      ? prev.filter((id) => id !== item._id)
                                      : [...prev, item._id]
                                  )
                                }
                                color="#3F8CFF"
                                uncheckedColor="#A0A0A0"
                              />
                            </View>
                            <TouchableOpacity
                              onPress={() =>
                                setSelectedFilters((prev) =>
                                  prev.includes(item._id)
                                    ? prev.filter((id) => id !== item._id)
                                    : [...prev, item._id]
                                )
                              }
                            >
                              <Text
                                style={[
                                  globalStyles.h8,
                                  globalStyles.fs3,
                                  globalStyles.tc,
                                ]}
                                allowFontScaling={false}
                              >
                                {item.form_name}
                              </Text>
                            </TouchableOpacity>
                          </View>
                        ))
                      ) : (
                        <Text>No Forms Available</Text>
                      )
                    ) : (
                      <Text>No data available</Text>
                    )}
                  </View>
                )}
              </ScrollView>
            </View>

            <View style={styles.footer}>
              <View style={{ flex: 1, alignItems: "center" }}>
                <TouchableOpacity onPress={onClose}>
                  <Text
                    style={[globalStyles.h7, globalStyles.fs3, globalStyles.tc]}
                    allowFontScaling={false}
                  >
                    Close
                  </Text>
                </TouchableOpacity>
              </View>
              <View style={{ flex: 1, alignItems: "center" }}>
                <TouchableOpacity onPress={handleFilterData}>
                  <Text
                    style={[
                      globalStyles.h7,
                      globalStyles.fs3,
                      globalStyles.tc5,
                    ]}
                    allowFontScaling={false}
                  >
                    Apply
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          </Animated.View>
        </BlurView>
      )}
    </>
  );
};

const styles = StyleSheet.create({
  blurView: {
    flex: 1,
    // position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: "flex-end",
    alignItems: "center",
  },
  container: {
    width: "100%",
    height: "100%",
    backgroundColor: "white",
    elevation: 10,
    paddingBottom: 20,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: "#ddd",
  },
  selectAllRow: {
    flexDirection: "row",
    alignItems: "center",
  },

  rowContainer: {
    flexDirection: "row",
    width: "100%",
    flex: 1,
  },
  leftColumn: {
    width: "35%",
    backgroundColor: "#f7f7f7",
  },
  filterItem: {
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderBottomWidth: 1,
    borderBottomColor: "#e0e0e0",
  },
  selectedCategory: {
    backgroundColor: "#3F8CFF",
  },
  filterText: {
    textAlign: "left",
  },
  rightColumn: {
    width: "65%",
    padding: 10,
    height: screenHeight - 80,
  },
  checkboxRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  optionRow: {
    marginBottom: 10,
    paddingRight: 5,
  },

  footer: {
    position: "absolute",
    bottom: 0,
    width: "100%",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: "white",
    borderTopWidth: 1,
    borderTopColor: "#ddd",
    height: 60,
    paddingHorizontal: 20,
  },
  searchContainer: {
    marginBottom: 10,
  },
  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 5,
    height: 38,
  },

  input: {
    flex: 1,
    fontSize: 16,
    color: "#000",
    marginLeft: 5,
  },

  icon: {
    marginLeft: 5,
  },
});

export default FilterBottomSheet;
