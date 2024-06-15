import React from 'react';
import TabLayout from '../../TabLayout';

export default function EncargadoTabLayout() {
  const screens = [
    { name: 'index', title: 'Inicio', icon: 'home', headerShown: false },
    { name: 'assignments', title: 'Asignaciones', icon: 'assignment' },
    { name: 'messages', title: 'Mensajes', icon: 'message' },
    { name: 'profile', title: 'Perfil', icon: 'person' },
  ];
  return <TabLayout screens={screens} />;
}