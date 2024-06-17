import { createSlice } from '@reduxjs/toolkit';
import { db } from './firebase';
import { doc, getDoc, collection, query, where, getDocs, limit } from 'firebase/firestore';

const authSlice = createSlice({
  name: 'auth',
  initialState: {
    user: {
      id: null,
      groups: [],
      asignacionesActivas: [],
      proximaAsignacion: null,
    },
    userRole: null,
    loading: false,
  },
  reducers: {
    setUser: (state, action) => {
      state.user = { ...state.user, ...action.payload };
    },
    setUserRole: (state, action) => {
      state.userRole = action.payload;
    },
    setLoading: (state, action) => {
      state.loading = action.payload;
    },
    logout: (state) => {
      state.user = { id: null, groups: [], asignacionesActivas: [], proximaAsignacion: null };
      state.userRole = null;
      state.loading = false;
    },
  },
});

export const { setUser, setUserRole, setLoading, logout } = authSlice.actions;

export const fetchEssentialUserData = (userId) => async (dispatch) => {
  dispatch(setLoading(true));
  try {
    const userDoc = await getDoc(doc(db, 'Usuarios', userId));
    if (userDoc.exists()) {
      const userData = userDoc.data();
      userData.id = userId;
      dispatch(setUser(userData));
      dispatch(setUserRole(userData.rol));
      dispatch(fetchAdditionalUserData(userId, userData.rol));
    } else {
      throw new Error('User does not exist');
    }
  } catch (error) {
    console.error('Error fetching essential user data:', error);
    dispatch(setLoading(false));
  }
};

export const fetchAdditionalUserData = (userId, userRole) => async (dispatch) => {
  try {
    const userDoc = await getDoc(doc(db, 'Usuarios', userId));
    if (userDoc.exists()) {
      const userData = userDoc.data();
      const institucionId = userData.institucion.id;

      const institucionPromise = getDoc(doc(db, 'Instituciones', institucionId));

      const docenteGroupsQuery = query(
        collection(db, 'Grupos'),
        where('docente', '==', doc(db, 'Usuarios', userId)),
        limit(10)
      );
      const docenteGroupsSnapshotPromise = getDocs(docenteGroupsQuery);

      const encargadoGroupsQuery = query(
        collection(db, 'Grupos'),
        where('encargados', 'array-contains', doc(db, 'Usuarios', userId)),
        limit(10)
      );
      const encargadoGroupsSnapshotPromise = getDocs(encargadoGroupsQuery);

      const [institucionDoc, docenteGroupsSnapshot, encargadoGroupsSnapshot] = await Promise.all([
        institucionPromise,
        docenteGroupsSnapshotPromise,
        encargadoGroupsSnapshotPromise,
      ]);

      if (institucionDoc.exists()) {
        userData.institucion = {
          id: institucionId,
          ...institucionDoc.data(),
        };
      }

      const groupsData = [];
      const encargadosPromises = [];
      const docentesPromises = [];

      const processGroupsSnapshot = (groupsSnapshot) => {
        groupsSnapshot.docs.forEach(groupDoc => {
          const groupData = groupDoc.data();
          groupsData.push({ id: groupDoc.id, ...groupData });

          groupData.encargados.forEach(encargadoRef => {
            encargadosPromises.push(getDoc(encargadoRef));
          });

          if (userRole !== 'docente') {
            docentesPromises.push(getDoc(groupData.docente));
          }
        });
      };

      processGroupsSnapshot(docenteGroupsSnapshot);
      processGroupsSnapshot(encargadoGroupsSnapshot);

      const encargadosDocs = await Promise.all(encargadosPromises);
      const encargadosData = encargadosDocs.map(encargadoDoc => ({ id: encargadoDoc.id, ...encargadoDoc.data() }));

      let docentesData = [];
      if (userRole !== 'docente') {
        const docentesDocs = await Promise.all(docentesPromises);
        docentesData = docentesDocs.map(docenteDoc => ({ id: docenteDoc.id, ...docenteDoc.data() }));
      }

      groupsData.forEach((group, index) => {
        group.encargados = group.encargados.map(encargadoRef => encargadosData.find(encargado => encargado.id === encargadoRef.id) || encargadoRef);
        if (userRole !== 'docente') {
          group.docente = docentesData[index];
        }
      });

      userData.groups = groupsData;

      if (userRole === 'encargado') {
        const currentDate = new Date();

        if (userData.groups.length > 0) {
          const asignacionesSnapshot = await getDocs(
            query(collection(db, 'Asignaciones'), where('grupo', 'in', userData.groups.map(group => group.id)))
          );

          const asignaciones = asignacionesSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
          const activas = asignaciones.filter(asignacion =>
            asignacion.etapas.some(etapa => etapa.fecha_entrega.toDate() >= currentDate)
          );

          userData.asignacionesActivas = activas;

          const futuras = activas.flatMap(asignacion =>
            asignacion.etapas
              .filter(etapa => etapa.fecha_entrega.toDate() > currentDate)
              .map(etapa => etapa.fecha_entrega.toDate())
          );

          const proxima = futuras.length > 0 ? futuras.reduce((prev, current) => (prev < current ? prev : current)) : null;

          userData.proximaAsignacion = proxima;
        }
      }

      userData.id = userId;

      dispatch(setUser(userData));
      dispatch(setLoading(false));
    }
  } catch (error) {
    console.error('Error fetching additional user data:', error);
    dispatch(setLoading(false));
  }
};

export default authSlice.reducer;