import { useLocalSearchParams } from "expo-router";
import { View } from "react-native";
import PayoutDetails from "../../../../components/Wallet/Payouts/PayoutDetails";

const PayoutDetailsScreen = () => {
  const { payoutId } = useLocalSearchParams();

  return (
    <View style={{ flex: 1 }}>
      <PayoutDetails payoutId={payoutId} />
    </View>
  );
};

export default PayoutDetailsScreen;
