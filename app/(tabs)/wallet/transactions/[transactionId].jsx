import { useLocalSearchParams } from "expo-router";
import { View } from "react-native";
import TransactionDetails from "../../../../components/Wallet/Transactions/TransactionDetails";
const TransactionDetailsScreen = () => {
  const { transactionId } = useLocalSearchParams();

  return (
    <View style={{ flex: 1 }}>
      <TransactionDetails transactionId={transactionId} />
    </View>
  );
};

export default TransactionDetailsScreen;
