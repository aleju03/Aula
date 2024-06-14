//todo: fix member count
//rbsheet to router page
//add quick messaging
//add assignments quick view

import React, { useState, useRef } from 'react';
import { Text, View, StyleSheet, FlatList, TouchableOpacity, Animated } from 'react-native';
import { useSelector, useDispatch } from 'react-redux';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import RBSheet from 'react-native-raw-bottom-sheet';

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F3F4F6',
    paddingHorizontal: 20,
    paddingTop: 40,
  },
  header: {
    marginBottom: 20,
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    color: '#1F2937',
    marginBottom: 5,
  },
  subtitle: {
    fontSize: 18,
    color: '#4B5563',
    marginBottom: 15,
  },
  summaryContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  summaryCard: {
    flex: 1,
    marginHorizontal: 5,
    padding: 15,
    backgroundColor: '#FFFFFF',
    borderRadius: 10,
    shadowColor: '#000000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 5,
    elevation: 3,
    alignItems: 'center',
  },
  summaryText: {
    fontSize: 16,
    color: '#1F2937',
  },
  summaryValue: {
    fontSize: 24,
    fontWeight: '700',
    color: '#4F46E5',
  },
  groupListHeader: {
    marginBottom: 10,
  },
  groupListTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#1F2937',
  },
  groupItem: {
    marginVertical: 10,
    borderRadius: 10,
    backgroundColor: '#FFFFFF',
    shadowColor: '#000000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 5,
    elevation: 3,
    padding: 20,
    transform: [{ scale: 1 }],
  },
  groupContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  groupIcon: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: '#E5E7EB',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 15,
  },
  groupText: {
    flex: 1,
  },
  groupName: {
    fontSize: 20,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 3,
  },
  groupInfo: {
    fontSize: 14,
    color: '#6B7280',
  },
  iconContainer: {
    marginLeft: 10,
  },
  icon: {
    fontSize: 24,
    color: '#6B7280',
  },
  bottomSheet: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingHorizontal: 20,
    paddingTop: 30,
    paddingBottom: 40,
    shadowColor: '#000000',
    shadowOffset: {
      width: 0,
      height: -2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 5,
    elevation: 3,
  },
  bottomSheetHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  bottomSheetTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: '#1F2937',
  },
  bottomSheetCloseButton: {
    padding: 5,
  },
  bottomSheetCloseIcon: {
    fontSize: 28,
    color: '#6B7280',
  },
  memberList: {
    marginBottom: 20,
  },
  memberItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  memberIcon: {
    fontSize: 24,
    color: '#6B7280',
    marginRight: 10,
  },
  memberName: {
    fontSize: 16,
    color: '#1F2937',
  },
});

const ProfesorHome = () => {
  const user = useSelector((state) => state.auth.user);
  const dispatch = useDispatch();
  const router = useRouter();
  const [selectedGroup, setSelectedGroup] = useState(null);
  const bottomSheetRef = useRef(null);
  const scaleValue = new Animated.Value(1);

  const handlePressIn = () => {
    Animated.spring(scaleValue, {
      toValue: 0.95,
      useNativeDriver: true,
    }).start();
  };

  const handlePressOut = () => {
    Animated.spring(scaleValue, {
      toValue: 1,
      useNativeDriver: true,
    }).start();
  };

  const handleGroupPress = (group) => {
    setSelectedGroup(group);
    bottomSheetRef.current.open();
  };

  const closeBottomSheet = () => {
    bottomSheetRef.current.close();
    setSelectedGroup(null);
  };

  const renderGroupItem = ({ item }) => (
    <TouchableOpacity
      activeOpacity={0.8}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      onPress={() => handleGroupPress(item)}
    >
      <Animated.View style={[styles.groupItem, { transform: [{ scale: scaleValue }] }]}>
        <View style={styles.groupContent}>
          <View style={styles.groupIcon}>
            <Ionicons name="people" size={28} color="#1F2937" />
          </View>
          <View style={styles.groupText}>
            <Text style={styles.groupName}>{item.nombre}</Text>
            <Text style={styles.groupInfo}>Integrantes: {item.encargados.length}</Text>
          </View>
          <View style={styles.iconContainer}>
            <Ionicons name="chevron-forward" style={styles.icon} />
          </View>
        </View>
      </Animated.View>
    </TouchableOpacity>
  );

  const renderMemberItem = (member, index) => (
    <View key={index} style={styles.memberItem}>
      <Ionicons name="person" style={styles.memberIcon} />
      <Text style={styles.memberName}>{member.nombre}</Text>
    </View>
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Bienvenido, {user?.nombre}</Text>
        <Text style={styles.subtitle}>Aquí tienes una vista general de tus grupos:</Text>
      </View>

      <View style={styles.summaryContainer}>
        <View style={styles.summaryCard}>
          <Text style={styles.summaryText}>Total Grupos</Text>
          <Text style={styles.summaryValue}>{user?.groups?.length || 0}</Text>
        </View>
        <View style={styles.summaryCard}>
          <Text style={styles.summaryText}>Total Integrantes</Text>
          <Text style={styles.summaryValue}>{user?.groups.reduce((acc, group) => acc + group.encargados.length, 0) || 0}</Text>
        </View>
      </View>

      <View style={styles.groupListHeader}>
        <Text style={styles.groupListTitle}>Tus Grupos</Text>
      </View>

      <FlatList
        data={user?.groups || []}
        renderItem={renderGroupItem}
        keyExtractor={(item) => item.id}
        contentContainerStyle={{ paddingBottom: 40 }}
      />

      <RBSheet
        ref={bottomSheetRef}
        height={500}
        openDuration={250}
        closeOnDragDown={true}
        closeOnPressMask={true}
        customStyles={{
          container: styles.bottomSheet,
        }}
      >
        <View style={styles.bottomSheetHeader}>
          <Text style={styles.bottomSheetTitle}>{selectedGroup?.nombre}</Text>
          <TouchableOpacity style={styles.bottomSheetCloseButton} onPress={closeBottomSheet}>
            <Ionicons name="close" style={styles.bottomSheetCloseIcon} />
          </TouchableOpacity>
        </View>
        <View style={styles.memberList}>
          {selectedGroup?.encargados.flatMap((encargado) => {
            if (encargado.estudiantes && encargado.estudiantes.length > 0) {
              return encargado.estudiantes.map(renderMemberItem);
            } else {
              return renderMemberItem(encargado, encargado.id);
            }
          })}
        </View>
      </RBSheet>
    </View>
  );
};

export default ProfesorHome;