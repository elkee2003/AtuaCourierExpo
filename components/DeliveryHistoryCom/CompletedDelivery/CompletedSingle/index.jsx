import { Text, View } from "react-native";
import styles from "./styles";

const CompletedDeliverySingle = ({ item }) => {
  const courierPrice = item?.courierFee
    ? Number(item.courierFee).toLocaleString()
    : "0";

  return (
    <View style={styles.card}>
      <Text style={styles.subHeader}>Order Origin:</Text>
      <Text style={styles.details}>{item.originAddress}</Text>

      <Text style={styles.subHeader}>Order Destination:</Text>
      <Text style={styles.details}>{item.destinationAddress}</Text>

      <Text style={styles.subHeader}>Order Type:</Text>
      <Text style={styles.details}>{item.transportationType}</Text>

      <Text style={styles.subHeader}>Price:</Text>
      <Text style={styles.details}>₦{courierPrice}</Text>
    </View>
  );
};

export default CompletedDeliverySingle;
