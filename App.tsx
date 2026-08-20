import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView, NativeModules } from 'react-native';

const { OverlayModule } = NativeModules;

const CHARACTERS = [
  { id: 'fox', emoji: '🦊', name: 'Fox', app: 'Browser', power: 'Navigation Éclair', color: '#ff6b35' },
  { id: 'dragon', emoji: '🐉', name: 'Drago', app: 'Antivirus', power: 'Bouclier de Feu', color: '#ff4757' },
  { id: 'unicorn', emoji: '🦄', name: 'Luna', app: 'Instagram', power: 'Magie des Filtres', color: '#c44569' },
  { id: 'wolf', emoji: '🐺', name: 'Wolf', app: 'Security', power: 'Garde Alpha', color: '#546e7a' },
  { id: 'cat', emoji: '🐱', name: 'Mimi', app: 'Camera', power: 'Charme Infini', color: '#ff6b9d' },
  { id: 'robo', emoji: '🤖', name: 'Robo', app: 'Settings', power: 'Super Analyse', color: '#00ff88' },
];

export default function App() {
  const [selected, setSelected] = useState<string[]>([]);
  const [active, setActive] = useState(false);

  const toggleCharacter = (id: string) => {
    setSelected(prev => prev.includes(id) ? prev.filter(c => c !== id) : [...prev, id]);
  };

  const launchAssistants = async () => {
    if (selected.length === 0) return;
    const hasPermission = await OverlayModule.checkPermission();
    if (!hasPermission) {
      await OverlayModule.requestPermission();
      return;
    }
    const charactersData = CHARACTERS.filter(c => selected.includes(c.id));
    OverlayModule.startOverlay(JSON.stringify(charactersData));
    setActive(true);
  };

  const stopAssistants = () => {
    OverlayModule.stopOverlay();
    setActive(false);
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={{ padding: 20, paddingTop: 60 }}>
      <Text style={styles.title}>🤖 Mes Assistants</Text>
      <Text style={styles.subtitle}>Choisissez ceux qui vous accompagnent partout</Text>
      <View style={styles.grid}>
        {CHARACTERS.map(char => (
          <TouchableOpacity
            key={char.id}
            style={[styles.card, selected.includes(char.id) && { borderColor: char.color, borderWidth: 3 }]}
            onPress={() => toggleCharacter(char.id)}
          >
            <Text style={styles.emoji}>{char.emoji}</Text>
            <Text style={styles.name}>{char.name}</Text>
            <Text style={styles.app}>📱 {char.app}</Text>
            <Text style={[styles.power, { color: char.color }]}>⚡ {char.power}</Text>
          </TouchableOpacity>
        ))}
      </View>
      {!active ? (
        <TouchableOpacity style={styles.btn} onPress={launchAssistants}>
          <Text style={styles.btnText}>🚀 Lancer mes assistants</Text>
        </TouchableOpacity>
      ) : (
        <TouchableOpacity style={[styles.btn, { backgroundColor: '#ff4757' }]} onPress={stopAssistants}>
          <Text style={styles.btnText}>🛑 Arrêter</Text>
        </TouchableOpacity>
      )}
      {active && <Text style={styles.hint}>✅ Vos assistants flottent partout ! Quittez l'app et regardez.</Text>}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#667eea' },
  title: { fontSize: 32, fontWeight: 'bold', color: 'white', textAlign: 'center' },
  subtitle: { fontSize: 14, color: 'white', textAlign: 'center', marginBottom: 20, opacity: 0.9 },
  grid: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between' },
  card: { width: '48%', backgroundColor: 'rgba(255,255,255,0.15)', borderRadius: 15, padding: 15, marginBottom: 15, alignItems: 'center' },
  emoji: { fontSize: 40, marginBottom: 5 },
  name: { color: 'white', fontWeight: 'bold', fontSize: 16 },
  app: { color: 'white', fontSize: 12, opacity: 0.8 },
  power: { fontSize: 11, fontWeight: 'bold', marginTop: 5, textAlign: 'center' },
  btn: { backgroundColor: '#00d4ff', padding: 18, borderRadius: 25, alignItems: 'center', marginTop: 10 },
  btnText: { color: 'white', fontSize: 18, fontWeight: 'bold' },
  hint: { color: 'white', textAlign: 'center', marginTop: 15, fontSize: 13 },
});
