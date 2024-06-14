import { createSlice } from '@reduxjs/toolkit';
import { db } from './firebase';
import { doc, getDoc, collection, query, where, getDocs } from 'firebase/firestore';

const authSlice = createSlice({
  name: 'auth',
  initialState: {
    user: {
      groups: []
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
      state.user = { groups: [] };
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
      dispatch(setUser(userData));
      dispatch(setUserRole(userData.rol));
      // Carga datos adicionales en segundo plano
      dispatch(fetchAdditionalUserData(userId));
    }
  } catch (error) {
    console.error('Error al obtener los datos esenciales del usuario:', error);
  }
};

export const fetchAdditionalUserData = (userId) => async (dispatch) => {
  try {
    const userDoc = await getDoc(doc(db, 'Usuarios', userId));
    if (userDoc.exists()) {
      const userData = userDoc.data();
      const institucionId = userData.institucion.id;

      const institucionPromise = getDoc(doc(db, 'Instituciones', institucionId));
      const groupsQuery = query(collection(db, 'Grupos'), where('docente', '==', doc(db, 'Usuarios', userId)));
      const groupsSnapshotPromise = getDocs(groupsQuery);

      const [institucionDoc, groupsSnapshot] = await Promise.all([institucionPromise, groupsSnapshotPromise]);

      if (institucionDoc.exists()) {
        userData.institucion = {
          id: institucionId,
          ...institucionDoc.data(),
        };
      }

      const groupsData = [];
      const encargadosPromises = [];

      groupsSnapshot.docs.forEach(groupDoc => {
        const groupData = groupDoc.data();
        groupsData.push({ id: groupDoc.id, ...groupData });

        groupData.encargados.forEach(encargadoRef => {
          encargadosPromises.push(getDoc(encargadoRef));
        });
      });

      const encargadosDocs = await Promise.all(encargadosPromises);

      const encargadosData = encargadosDocs.map(encargadoDoc => ({ id: encargadoDoc.id, ...encargadoDoc.data() }));
      groupsData.forEach(group => {
        group.encargados = encargadosData.filter(encargado => group.encargados.some(ref => ref.id === encargado.id));
      });

      userData.groups = groupsData;

      dispatch(setUser(userData));
      dispatch(setLoading(false));
    }
  } catch (error) {
    console.error('Error al obtener los datos adicionales del usuario:', error);
    dispatch(setLoading(false));
  }
};

export default authSlice.reducer;
