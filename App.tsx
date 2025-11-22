/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 *
 * @format
 */

import React from 'react';
import {
  SafeAreaView,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  View,
  Image,
  TouchableOpacity,
} from 'react-native';

type Product = {
  sku: string;
  description: string;
  quantity: number;
  unitPrice: number;
  tax: number;
  totalAmount: number;
  imgurl: string;
};

const products: Product[] = [
  {
    sku: 'SKU-001',
    description: 'Wireless Headphones',
    quantity: 1,
    unitPrice: 199.99,
    tax: 0,
    totalAmount: 199.99,
    imgurl:
      'https://images.pexels.com/photos/3394664/pexels-photo-3394664.jpeg?auto=compress&cs=tinysrgb&w=800',
  },
  {
    sku: 'SKU-002',
    description: 'Smart Watch',
    quantity: 1,
    unitPrice: 149.99,
    tax: 0,
    totalAmount: 149.99,
    imgurl:
      'https://images.pexels.com/photos/277394/pexels-photo-277394.jpeg?auto=compress&cs=tinysrgb&w=800',
  },
];

type ProductCardProps = {
  product: Product;
  onBuyNow?: (product: Product) => void;
};

function ProductCard({ product, onBuyNow }: ProductCardProps): React.JSX.Element {
  return (
    <View style={productCardStyles.card}>
      <Image source={{ uri: product.imgurl }} style={productCardStyles.image} />
      <View style={productCardStyles.content}>
        <Text style={productCardStyles.sku}>{product.sku}</Text>
        <Text style={productCardStyles.description}>{product.description}</Text>
        <View style={productCardStyles.row}>
          <Text style={productCardStyles.label}>Qty:</Text>
          <Text style={productCardStyles.value}>{product.quantity}</Text>
        </View>
        <View style={productCardStyles.row}>
          <Text style={productCardStyles.label}>Price:</Text>
          <Text style={productCardStyles.value}>${product.unitPrice.toFixed(2)}</Text>
        </View>
        <View style={productCardStyles.row}>
          <Text style={productCardStyles.label}>Total:</Text>
          <Text style={productCardStyles.total}>${product.totalAmount.toFixed(2)}</Text>
        </View>
        <TouchableOpacity style={productCardStyles.button} onPress={() => onBuyNow?.(product)}>
          <Text style={productCardStyles.buttonText}>Buy Now</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

function App(): React.JSX.Element {
  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="dark-content" backgroundColor="transparent" />
      <ScrollView contentContainerStyle={styles.container}>
        <Text style={styles.title}>Products</Text>
        {products.map(product => (
          <ProductCard key={product.sku} product={product} />
        ))}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#f9fafb',
  },
  container: {
    padding: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    marginBottom: 16,
    color: '#111827',
  },
});

const productCardStyles = StyleSheet.create({
  card: {
    backgroundColor: '#ffffff',
    borderRadius: 16,
    overflow: 'hidden',
    marginBottom: 16,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  image: {
    width: '100%',
    height: 200,
  },
  content: {
    padding: 16,
  },
  sku: {
    fontSize: 12,
    fontWeight: '500',
    color: '#6b7280',
  },
  description: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 8,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  label: {
    fontSize: 14,
    color: '#4b5563',
  },
  value: {
    fontSize: 14,
    fontWeight: '500',
    color: '#111827',
  },
  total: {
    fontSize: 15,
    fontWeight: '700',
    color: '#111827',
  },
  button: {
    marginTop: 12,
    marginBottom: 4,
    alignSelf: 'center',
    paddingHorizontal: 24,
    paddingVertical: 10,
    backgroundColor: '#0573FF',
    borderRadius: 999,
  },
  buttonText: {
    color: '#ffffff',
    fontWeight: '600',
    fontSize: 14,
  },
});

export default App;
