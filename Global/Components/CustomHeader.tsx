import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import Ionicons from '@expo/vector-icons/Ionicons';

type CustomHeaderProps = {
  title: string;
};

function CustomHeader({ title }: CustomHeaderProps) {
  const navigation = useNavigation();

  return (
    <View
      style={{
        backgroundColor: '#FFFFFF',
        paddingTop: 30,
        paddingHorizontal: 16,
        flexDirection: 'row',
        alignItems: 'center',
        height: 100,
      }}
    >
      <TouchableOpacity onPress={() => navigation.goBack()}>
        <Ionicons name="arrow-back" size={24} color="black" />
      </TouchableOpacity>
      <Text
        style={{
          marginLeft: 12,
          fontSize: 20,
          fontWeight: 'bold',
        }}
      >
        {title}
      </Text>
    </View>
  );
}

export default CustomHeader;
