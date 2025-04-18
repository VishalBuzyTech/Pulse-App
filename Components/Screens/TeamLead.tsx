import React, { useCallback, useEffect, useState } from "react";
import {
  View,
  ScrollView,
  StyleSheet,
  Linking,
  RefreshControl,
  Modal,
  Image,
  TouchableWithoutFeedback,
  ActivityIndicator,
} from "react-native";
import CustomSearchBar from "../../NewDesine/GlobalComponets/CustomSearchBar";
import CustomCardLead from "../../NewDesine/GlobalComponets/CustomCardLead";
import store from "../../utils/store";
import { getAllTeamLeads } from "./DashboardService";
import { LeadsSkeleton } from "../../Global/Components/SkeletonStructures";
import { getReminderCall } from "./LeadsService";
import { useDispatch } from "react-redux";
import { setTeamsLead } from "../../Redux/authSlice";
import { LoginScreenNavigationProp, RootStackParamList } from "../type";
import {
  RouteProp,
  useFocusEffect,
  useNavigation,
  useRoute,
} from "@react-navigation/native";
import AllFilterBottomSheetModel from "../../Global/PopAndModels/AllFilterBottomSheetModel";

function TeamLead() {
  const dispatch = useDispatch();
  type RouteProps = RouteProp<RootStackParamList, "TeamLead">;
  const route = useRoute<RouteProps>();
  const selectViewData = route.params?.selectedView || null;
  const [loading, setLoading] = useState(true);
  const navigation = useNavigation<LoginScreenNavigationProp>();
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [teamLeadData, setTeamLeadData] = useState<any[]>([]);
  const [reminderData, setReminderData] = useState<{ [key: string]: any }>({});
  const [paginationModel, setPaginationModel] = useState({
    pageSize: 25,
    pageNo: 0,
  });
  const [refreshing, setRefreshing] = useState(false);
  const [isVisible, setIsVisible] = useState(false);
  const [selectedStages, setSelectedStages] = useState([]);
  const [filteredLeadsnew, setFilteredLeads] = useState<any[]>([]);
  const [filters, setFilters] = useState<any>({});
  const [hasMoreData, setHasMoreData] = useState(true);

  const getTeamLeadData = useCallback(
    async (
      pageNo: number,
      pageSize: number = paginationModel.pageSize,
      append = false
    ) => {
      if (!hasMoreData) return;
      try {
        setLoading(true);
        const payload = {
          userId: store.getState().auth.userId,
          pageNo: pageNo,
          pageSize: pageSize,
          start_date: "",
          end_date: "",
          search: searchQuery,
          formId: filters?.formId?.length ? filters.formId : null,
        };
        const response = await getAllTeamLeads(payload);
        const newData = response?.data || [];
        if (newData.length < 25) {
          setHasMoreData(false);
        }

        if (append) {
          setTeamLeadData((prevData) => [
            ...prevData,
            ...(response?.data || []),
          ]);
        } else {
          setTeamLeadData(response?.data || []);
        }
        setPaginationModel({ pageNo, pageSize });
        setLoading(false);
      } catch (error) {
        setLoading(false);
        console.error("Error fetching team lead data:", error);
      } finally {
        setLoading(false);
      }
    },
    [paginationModel, searchQuery, filters]
  );

  const handleReminder = useCallback(async () => {
    if (teamLeadData.length === 0) return;

    try {
      const remindersArray = await Promise.all(
        teamLeadData.map(async (lead) => {
          try {
            const response = await getReminderCall(lead._id);
            return { [lead._id]: response.data ?? "No Reminder" };
          } catch (error) {
            console.error(
              `Error fetching reminder for lead ${lead._id}`,
              error
            );
            return { [lead._id]: "No Reminder" };
          }
        })
      );

      setReminderData(Object.assign({}, ...remindersArray));
    } catch (error) {
      console.error("Error in handleReminder:", error);
    }
  }, [teamLeadData]);

  const onRefresh = async () => {
    setRefreshing(true);
    await getTeamLeadData(0, paginationModel.pageSize, false);
    setRefreshing(false);
  };

  useEffect(() => {
    getTeamLeadData(0, paginationModel.pageSize, false);
  }, []);
  useEffect(() => {
    (async () => {
      await handleReminder();
    })();
  }, [teamLeadData]);

  useEffect(() => {
    console.log(filters, "filtersfiltersfiltersfilters");

    if (filters && Object.keys(filters).length > 0) {
      getTeamLeadData(0);
    }
  }, [filters]);

  useFocusEffect(
    useCallback(() => {
      let isActive = true;
      (async () => {
        if (isActive) await getTeamLeadData(0, paginationModel.pageSize, false);
      })();

      return () => {
        isActive = false;
      };
    }, [searchQuery])
  );

  const handleDialPress = useCallback(async (phoneNumber: string) => {
    const url = `tel:${phoneNumber}`;
    try {
      const supported = await Linking.canOpenURL(url);
      if (supported) {
        await Linking.openURL(url);
      } else {
        console.log("Phone dialer is not available");
      }
    } catch (err) {
      console.error("Error opening dialer:", err);
    }
  }, []);

  const handleCardDataLeads = (item: any) => {
    dispatch(setTeamsLead(item));
    navigation.navigate("LeadInfoScreen");
  };

  const handleApplyFilters = (filters: any) => {
    console.log(filters, "filtersfiltersfiltersfiltersfilters");
    setFilters(filters);
    setIsVisible(false);
    const form_Name = Array.isArray(filters?.formId)
      ? filters.formId.map((formId: string) => formId.trim())
      : [];
    setSelectedStages(form_Name);
  };

  const handleLoadMore = useCallback(() => {
    if (!loading && hasMoreData) {
      setPaginationModel((prevModel) => {
        const newPage = prevModel.pageNo + 1;
        getTeamLeadData(newPage, prevModel.pageSize, true);
        return { ...prevModel, pageNo: newPage };
      });
    }
  }, [loading, hasMoreData]);

  return (
    <View style={styles.container}>
      <CustomSearchBar
        value={searchQuery}
        onChangeText={setSearchQuery}
        onFilterPress={() => setIsVisible(true)}
      />
      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={{ flexGrow: 1, paddingBottom: 50 }}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        onScroll={({ nativeEvent }) => {
          const { layoutMeasurement, contentOffset, contentSize } = nativeEvent;

          if (
            layoutMeasurement.height + contentOffset.y >=
            contentSize.height - 100
          ) {
            handleLoadMore();
          }
        }}
        scrollEventThrottle={16}
        showsVerticalScrollIndicator={false}
      >
        {loading && paginationModel.pageNo === 0 ? (
          <LeadsSkeleton />
        ) : filteredLeadsnew.length > 0 || teamLeadData.length > 0 ? (
          (filteredLeadsnew.length > 0 ? filteredLeadsnew : teamLeadData).map(
            (lead, index) => (
              <CustomCardLead
                key={index}
                name={lead?.leadName ?? ""}
                status={lead?.stage ?? ""}
                form_name={lead?.form_name ?? ""}
                dateTimeShow={lead?.createdAt ?? ""}
                priority={lead?.priority ?? ""}
                reminder={reminderData[lead._id] ?? "No Reminder"}
                onCallPress={() => handleDialPress(lead.leadPhone)}
                onMorePress={() =>
                  console.log(`More options for ${lead.leadName}`)
                }
                onTextPress={() => handleCardDataLeads(lead)}
              />
            )
          )
        ) : (
          <View style={styles.emptyContainer}>
            <Image
              source={require("../../assets/nodatafound.png")}
              style={styles.image}
            />
          </View>
        )}

        {loading && paginationModel.pageNo > 0 && (
          <View style={styles.loadingMore}>
            <ActivityIndicator size={30} color="#0000ff" />
          </View>
        )}
      </ScrollView>
      <Modal
        visible={isVisible}
        transparent={false}
        animationType="slide"
        onRequestClose={() => setIsVisible(false)}
      >
        <TouchableWithoutFeedback onPress={() => setIsVisible(false)}>
          <View style={styles.overlay} />
        </TouchableWithoutFeedback>
        <View style={styles.bottomSheetContainer}>
          <AllFilterBottomSheetModel
            visible={isVisible}
            onClose={() => setIsVisible(false)}
            onApplyFilters={handleApplyFilters}
            selectedStagesLocal={selectedStages}
            selectViewData={selectViewData}
            selectedFormdataFilter={filters.formId || []}
            selectedTab
          />
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "white",
  },
  scrollView: {
    flex: 1,
  },
  contentContainer: {
    paddingBottom: 20,
  },
  overlay: {
    flex: 1,
    backgroundColor: "white",
  },
  bottomSheetContainer: {
    position: "absolute",
    width: "100%",
    backgroundColor: "white",
  },
  loadingMore: {
    marginVertical: 20,
    alignItems: "center",
  },
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  image: {
    width: 200,
    height: 200,
    resizeMode: "contain",
  },
});

export default TeamLead;
