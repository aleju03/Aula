import React, { useState} from 'react';
import {
   View, 
   Text, 
   TextInput, 
   SafeAreaView, 
   StyleSheet, 
   Image, 
   TouchableOpacity,
  } from 'react-native';
import { db } from './firebase';
import { collection, query, where, getDocs } from 'firebase/firestore';


const App = () => {

  const handleBtn =  async() => {
    const carneP = query(collection(db, 'Usuarios'), where('carne', '==', form.carne));
    const usuario = await getDocs(carneP);
    if (usuario.empty) {
      alert('El carne seleccionado no existe');
      return;
    }
    const final = usuario.docs[0].data();
    
    if(final.contraseña === form.contrasena){
    } else {
      alert('Contraseña incorrecta');
      return;
    }

    if(final.rol === 'docente'){
      alert('ejemplo Docente')
    } else {
      alert('ejemplo Encargado')
    }
  };


  const [form, setForm] = useState({
    carne: '',
    contrasena: '',
  });

  const styles = StyleSheet.create({
    container: {
      padding: 24,
      flex: 1,
    },
    header: {
      marginVertical: 36,
    },
    headerImg: {
      width: 180,
      height: 80,
      alignSelf: 'center',
      marginBottom: 36,
    }, 
    title: {
      fontSize: 27,
      fontWeight: '700',
      color: '#1e1e1e',
      marginBottom: 1,
      textAlign: 'center',
    },

    subtitle: {
      fontSize: 15,
      fontWeight: '500',
      color: '#929292',
      textAlign: 'center',
    },
    input: {
      marginBottom: 16,
    },
    inputLabel: {
      fontSize: 17,
      fontWeight: '600',
      color: '#222',
      marginBottom: 8,
    },
    inputControl: {
      height: 44,
      backgroundColor: '#fff',
      paddingHorizontal: 16,
      borderRadius: 12,
      fontSize: 15,
      fontWeight: '500',
      color: '#222',
    },
    form:{
      marginBottom: 24,
      flex: 1,
    },
    formAction: {
      marginVertical: 24,
    },
    btn: {
      backgroundColor: '#075eec',
      borderWidth:1,
      borderRadius: 8,
      borderColor: '#075eec',
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      paddingVertical: 10,
      paddingHorizontal: 20,
    },   
    btnText: {
      fontSize: 18,
      fontWeight: '600',
      color: '#fff',
    },   
  });

  return (
    <SafeAreaView style = {{flex: 1, backgroundColor: '#e8ecf4'}}>
      <View style = {styles.container} >
        <View style={styles.header}>
          <Image source = {{uri: 'https://images.vexels.com/media/users/3/152825/isolated/preview/5b8297c29a8d4f5953c0ea5baa32d821-high-school-building-illustration-by-vexels.png'}}
                 style = {styles.headerImg}
                 alt = "Logo "/>
          <Text style = {styles.title}> Ingresar</Text>
          <Text style = {styles.subtitle}> Administra tus actividades escolares aquí </Text>
        </View>
        <View style = {styles.form}>
          <View style = {styles.input}>
            <Text style = {styles.inputLabel}>Carne</Text>
            <TextInput style = {styles.inputControl}
              value = {form.carne}
              placeholder = 'Debe ser un numero'
              placeholderTextColor = '#6b7280'
              onChangeText = {carne => setForm({...form, carne})}>
            </TextInput>
          </View>

          <View style = {styles.input}>
            <Text style = {styles.inputLabel}>Contraseña</Text>
            <TextInput
              secureTextEntry
              style = {styles.inputControl}
              value = {form.contrasena}
              placeholder = 'Ingrese su contraseña'
              placeholderTextColor = '#6b7280'
              onChangeText = {contrasena => setForm({...form, contrasena})}>
            </TextInput>
          </View>

          <View style = {styles.formAction}>
            <TouchableOpacity onPress={handleBtn}>
              <View style = {styles.btn}>
                <Text style = {styles.btnText}>Confirmar</Text> 
              </View>
            </TouchableOpacity>
          </View>
          </View>
      </View>
    </SafeAreaView>
  )
}
export default App