import { createSlice } from '@reduxjs/toolkit';
import { db } from './firebase';
import { doc, getDoc, collection, query, where, getDocs } from 'firebase/firestore';

const authSlice = createSlice({
  name: 'auth',
  initialState: {
    user: null,
    userRole: null,
  },
  reducers: {
    setUser: (state, action) => {
      state.user = action.payload;
    },
    setUserRole: (state, action) => {
      state.userRole = action.payload;
    },
    logout: (state) => {
      state.user = null;
      state.userRole = null;
    },
  },
});

export const { setUser, setUserRole, logout } = authSlice.actions;

export const fetchUserData = (userId) => async (dispatch) => {
  try {
    const userDoc = await getDoc(doc(db, 'Usuarios', userId));
    if (userDoc.exists()) {
      const userData = userDoc.data();
      const institucionId = userData.institucion.id;
      const institucionDoc = await getDoc(doc(db, 'Instituciones', institucionId));
      if (institucionDoc.exists()) {
        const institucionData = institucionDoc.data();
        userData.institucion = {
          id: institucionId,
          ...institucionData,
        };
      }

      // Fetch groups associated with the user
      const groupsCollection = collection(db, 'Grupos');
      const q = query(groupsCollection, where('docente', '==', doc(db, 'Usuarios', userId)));
      const querySnapshot = await getDocs(q);

      const groupsData = [];
      for (const groupDoc of querySnapshot.docs) {
        const groupData = groupDoc.data();
        const encargadosData = await Promise.all(
          groupData.encargados.map(async (encargadoRef) => {
            const encargadoDoc = await getDoc(encargadoRef);
            return { id: encargadoDoc.id, ...encargadoDoc.data() };
          })
        );
        groupsData.push({
          id: groupDoc.id,
          ...groupData,
          encargados: encargadosData,
        });
      }

      userData.groups = groupsData;

      dispatch(setUser(userData));
      dispatch(setUserRole(userData.rol));
    }
  } catch (error) {
    console.error('Error al obtener los datos del usuario:', error);
  }
};

export default authSlice.reducer;