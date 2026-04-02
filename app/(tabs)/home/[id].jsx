import { useLocalSearchParams } from "expo-router";
import { View } from "react-native";
import OrderSummary from "../../../components/HomeComponent/OrderSummary";

const OrderSummaryScreen = () => {
  const { id } = useLocalSearchParams();

  return (
    <View style={{ flex: 1 }}>
      <OrderSummary orderId={id} />
    </View>
  );
};

export default OrderSummaryScreen;
