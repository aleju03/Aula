import React from 'react';
import { Text, View, StyleSheet, FlatList, TouchableOpacity, Animated, RefreshControl } from 'react-native';
import { useSelector, useDispatch } from 'react-redux';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { fetchAdditionalUserData } from '../../../utils/authSlice';

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
    paddingVertical: 20,
    paddingHorizontal: 10,
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
    justifyContent: 'center',
  },
  summaryText: {
    fontSize: 16,
    color: '#1F2937',
    marginBottom: 5,
    textAlign: 'center',
  },
  summaryValue: {
    fontSize: 24,
    fontWeight: '700',
    color: '#4F46E5',
    textAlign: 'center',
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
  skeletonCard: {
    flex: 1,
    marginHorizontal: 5,
    padding: 15,
    backgroundColor: '#e0e0e0',
    borderRadius: 10,
    alignItems: 'center',
  },
  skeletonText: {
    width: '60%',
    height: 20,
    backgroundColor: '#c0c0c0',
    marginBottom: 10,
    borderRadius: 4,
  },
  skeletonGroupItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 20,
    backgroundColor: '#e0e0e0',
    borderRadius: 10,
    marginVertical: 10,
  },
  groupIconSkeleton: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: '#c0c0c0',
    marginRight: 15,
  },
  skeletonGroupText: {
    flex: 1,
  },
});

const SkeletonCard = () => (
  <View style={styles.skeletonCard}>
    <View style={styles.skeletonText} />
    <View style={styles.skeletonText} />
  </View>
);

const SkeletonGroupItem = () => (
  <View style={styles.skeletonGroupItem}>
    <View style={styles.groupIconSkeleton} />
    <View style={styles.skeletonGroupText}>
      <View style={styles.skeletonText} />
      <View style={styles.skeletonText} />
    </View>
  </View>
);

const ProfesorHome = () => {
  const user = useSelector((state) => state.auth.user);
  const loading = useSelector((state) => state.auth.loading);
  const dispatch = useDispatch();
  const router = useRouter();
  const [refreshing, setRefreshing] = React.useState(false);

  const onRefresh = React.useCallback(() => {
    setRefreshing(true);
    if (user && user.id) {
      dispatch(fetchAdditionalUserData(user.id)).then(() => {
        setRefreshing(false);
      });
    } else {
      console.error('User ID not found');
      setRefreshing(false);
    }
  }, [user, dispatch]);

  const handleGroupPress = (group) => {
    router.push({
      pathname: '/groupInfo/groupInfo',
      params: { group: JSON.stringify(group) },
    });
  };

  const renderGroupItem = ({ item }) => {
    const scaleValue = new Animated.Value(1);

    const handlePressIn = () => {
      Animated.spring(scaleValue, {
        toValue: 0.95,
        useNativeDriver: true,
        speed: 20,
      }).start();
    };

    const handlePressOut = () => {
      Animated.spring(scaleValue, {
        toValue: 1,
        useNativeDriver: true,
        speed: 20,
      }).start();
    };

    const countMembers = (encargados) => {
      let count = 0;
      encargados.forEach((encargado) => {
        if (encargado.estudiantes && encargado.estudiantes.length > 0) {
          count += encargado.estudiantes.length;
        } else {
          count += 1;
        }
      });
      return count;
    };

    const totalIntegrantes = countMembers(item.encargados);

    return (
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
              <Text style={styles.groupInfo}>Integrantes: {totalIntegrantes}</Text>
            </View>
            <View style={styles.iconContainer}>
              <Ionicons name="chevron-forward" style={styles.icon} />
            </View>
          </View>
        </Animated.View>
      </TouchableOpacity>
    );
  };

  const totalIntegrantes = user?.groups?.reduce((acc, group) => {
    let count = 0;
    group.encargados.forEach((encargado) => {
      if (encargado.estudiantes && encargado.estudiantes.length > 0) {
        count += encargado.estudiantes.length;
      } else {
        count += 1;
      }
    });
    return acc + count;
  }, 0) || 0;

  return (
    <View style={styles.container}>
      <FlatList
        data={user?.groups || []}
        renderItem={renderGroupItem}
        keyExtractor={(item) => item.id}
        contentContainerStyle={{ paddingBottom: 40 }}
        ListHeaderComponent={
          <>
            <View style={styles.header}>
              <Text style={styles.title}>Bienvenido, {user?.nombre?.split(' ')[0]}.</Text>
              <Text style={styles.subtitle}>Aquí tienes una vista general de tus grupos:</Text>
            </View>

            <View style={styles.summaryContainer}>
              {loading ? (
                <>
                  <SkeletonCard />
                  <SkeletonCard />
                </>
              ) : (
                <>
                  <View style={styles.summaryCard}>
                    <Ionicons name="people" size={28} color="#4F46E5" />
                    <Text style={styles.summaryText}>Total Grupos</Text>
                    <Text style={styles.summaryValue}>{user?.groups?.length || 0}</Text>
                  </View>
                  <View style={styles.summaryCard}>
                    <Ionicons name="person" size={28} color="#4F46E5" />
                    <Text style={styles.summaryText}>Total Integrantes</Text>
                    <Text style={styles.summaryValue}>{totalIntegrantes}</Text>
                  </View>
                </>
              )}
            </View>

            <View style={styles.groupListHeader}>
              <Text style={styles.groupListTitle}>Tus Grupos</Text>
            </View>
          </>
        }
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor="#1F2937"
            colors={['#1F2937']}
            progressBackgroundColor="#F3F4F6"
          />
        }
        ListFooterComponent={
          loading && (
            <>
              <SkeletonGroupItem />
              <SkeletonGroupItem />
              <SkeletonGroupItem />
            </>
          )
        }
        showsVerticalScrollIndicator={false}
      />
    </View>
  );
};

export default ProfesorHome;