import { createSlice } from '@reduxjs/toolkit';
import { db } from './firebase';
import { doc, getDoc, collection, query, where, getDocs, limit } from 'firebase/firestore';

/**
 * authSlice:
 * - setUser: Updates the user state with provided data.
 * - setUserRole: Sets the user role.
 * - setLoading: Sets the loading state (true/false).
 * - logout: Resets the user state and role to initial values.
 * 
 * fetchEssentialUserData: Fetches and dispatches essential user data. Initiates additional data loading in the background.
 * fetchAdditionalUserData: Fetches additional user data like institution and groups, and updates the user state.
 */

const authSlice = createSlice({
  name: 'auth',
  initialState: {
    user: {
      id: null,
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
      state.user = { id: null, groups: [] }; // Reset ID aquí
      state.userRole = null;
      state.loading = false;
    },
  },
});

export const { setUser, setUserRole, setLoading, logout } = authSlice.actions;

/**
 * fetchEssentialUserData:
 * - Fetches essential user data from Firestore.
 * - Dispatches user data and role.
 * - Initiates additional data loading in the background.
 */
export const fetchEssentialUserData = (userId) => async (dispatch) => {
  dispatch(setLoading(true));
  try {
    const userDoc = await getDoc(doc(db, 'Usuarios', userId));
    if (userDoc.exists()) {
      const userData = userDoc.data();
      userData.id = userId; // Añadir el ID al userData
      dispatch(setUser(userData));
      dispatch(setUserRole(userData.rol));
      // Fetch additional data in the background
      dispatch(fetchAdditionalUserData(userId));
    } else {
      throw new Error('User does not exist');
    }
  } catch (error) {
    console.error('Error fetching essential user data:', error);
    dispatch(setLoading(false));
  }
};

/**
 * fetchAdditionalUserData:
 * - Fetches additional user data like institution and groups with pagination.
 * - Updates the user state with this additional data.
 */
export const fetchAdditionalUserData = (userId) => async (dispatch) => {
  try {
    const userDoc = await getDoc(doc(db, 'Usuarios', userId));
    if (userDoc.exists()) {
      const userData = userDoc.data();
      const institucionId = userData.institucion.id;

      // Fetch institution data
      const institucionPromise = getDoc(doc(db, 'Instituciones', institucionId));

      // Fetch groups where the user is a docente
      const docenteGroupsQuery = query(
        collection(db, 'Grupos'),
        where('docente', '==', doc(db, 'Usuarios', userId)),
        limit(10)
      );
      const docenteGroupsSnapshotPromise = getDocs(docenteGroupsQuery);

      // Fetch groups where the user is an encargado
      const encargadoGroupsQuery = query(
        collection(db, 'Grupos'),
        where('encargados', 'array-contains', doc(db, 'Usuarios', userId)),
        limit(10)
      );
      const encargadoGroupsSnapshotPromise = getDocs(encargadoGroupsQuery);

      // Wait for all promises to resolve
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

      const processGroupsSnapshot = (groupsSnapshot) => {
        groupsSnapshot.docs.forEach(groupDoc => {
          const groupData = groupDoc.data();
          groupsData.push({ id: groupDoc.id, ...groupData });

          groupData.encargados.forEach(encargadoRef => {
            encargadosPromises.push(getDoc(encargadoRef));
          });
        });
      };

      // Process groups for both docente and encargado roles
      processGroupsSnapshot(docenteGroupsSnapshot);
      processGroupsSnapshot(encargadoGroupsSnapshot);

      // Fetch all encargados
      const encargadosDocs = await Promise.all(encargadosPromises);
      const encargadosData = encargadosDocs.map(encargadoDoc => ({ id: encargadoDoc.id, ...encargadoDoc.data() }));

      // Map encargados data back to groups
      groupsData.forEach(group => {
        group.encargados = group.encargados.map(encargadoRef => encargadosData.find(encargado => encargado.id === encargadoRef.id) || encargadoRef);
      });

      userData.groups = groupsData;
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